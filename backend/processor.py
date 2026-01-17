import sys
import json
import re
import requests
from bs4 import BeautifulSoup
from newspaper import Article

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def extract_twitter_thread(url):
    match = re.search(r'/status/(\d+)', url)
    if not match:
        return {"error": "Invalid Twitter URL"}
    
    thread_id = match.group(1)
    
    # Use twitter-thread.com service
    thread_url = f"https://twitter-thread.com/t/{thread_id}"
    
    try:
        response = requests.get(thread_url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract author from: <div dir="auto" class="line-clamp-1 text-base text-gray dark:text-gray-light">@glassnode</div>
            author_div = soup.find('div', class_=lambda x: x and 'line-clamp-1' in x and 'text-base' in x and 'text-gray' in x)
            author = author_div.get_text(strip=True) if author_div else 'Unknown'
            # Remove @ symbol if present
            if author.startswith('@'):
                author = author[1:]
            
            # Extract text from: <div dir="auto" class="whitespace-pre-wrap text-lg">...</div>
            # Get only the FIRST/main tweet (not replies)
            text_div = soup.find('div', class_=lambda x: x and 'whitespace-pre-wrap' in x and 'text-lg' in x)
            
            if text_div:
                # Extract images from within the text div
                images = []
                img_tags = text_div.find_all('img')
                for img in img_tags:
                    src = img.get('src', '')
                    alt = img.get('alt', '')
                    if src and not src.startswith('data:'):
                        images.append({'src': src, 'alt': alt})
                    # Replace img tag with its alt text (for emojis)
                    if alt:
                        img.replace_with(alt)
                
                # Extract links from within the text div
                links = []
                link_tags = text_div.find_all('a', class_=lambda x: x and 'text-primary' in x if x else False)
                for link in link_tags:
                    href = link.get('href', '')
                    link_text = link.get_text(strip=True)
                    if href:
                        links.append({'url': href, 'text': link_text})
                    # Replace link with its text content
                    link.replace_with(link_text)
                
                # Now get the cleaned text
                cleaned_text = text_div.get_text(separator=' ', strip=True)
                
                if cleaned_text:
                    return {
                        "type": "twitter",
                        "content": cleaned_text,
                        "author": author,
                        "extra_info": {
                            "thread_id": thread_id,
                            "service_used": thread_url,
                            "images": images,
                            "links": links
                        },
                        "title": f"Twitter Post by @{author}"
                    }
    except Exception as e:
        # Don't print errors to stdout, they'll be in the JSON response
        pass

    # Try direct DOM extraction from Twitter page
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for specific tweet content elements
            # Match p elements with all three classes: article-paragraph, tweet-content, clickable-tweet
            def has_tweet_classes(class_list):
                if not class_list:
                    return False
                if isinstance(class_list, str):
                    class_list = [class_list]
                return 'article-paragraph' in class_list and 'tweet-content' in class_list and 'clickable-tweet' in class_list
            
            def has_tweetimg_class(class_list):
                if not class_list:
                    return False
                if isinstance(class_list, str):
                    class_list = [class_list]
                return 'tweetimg' in class_list
            
            # Find the MAIN tweet only (data-tweet-index="1")
            main_tweet = soup.find('p', class_=has_tweet_classes, attrs={'data-tweet-index': '1'})
            
            if not main_tweet:
                # Fallback: get the first tweet paragraph if no data-tweet-index found
                tweet_paragraphs = soup.find_all('p', class_=has_tweet_classes)
                if tweet_paragraphs:
                    main_tweet = tweet_paragraphs[0]
            
            if main_tweet:
                # Get text from main tweet only
                text = main_tweet.get_text(strip=True)
                
                # Find images within the same article/tweet container
                images = []
                tweet_container = main_tweet.find_parent('article') or main_tweet.parent
                
                if tweet_container:
                    tweet_images = tweet_container.find_all('img', class_=has_tweetimg_class)
                else:
                    # Fallback: search for images near the main tweet
                    tweet_images = soup.find_all('img', class_=has_tweetimg_class)
                
                for img in tweet_images:
                    src = img.get('src', '')
                    alt = img.get('alt', '')
                    # Exclude data URIs and ensure it's a valid image URL
                    if src and not src.startswith('data:') and ('http' in src or src.startswith('//')):
                        images.append({'src': src, 'alt': alt})
                
                # Build content with text and image references
                content_parts = [text] if text else []
                for img in images:
                    content_parts.append(f"[Image: {img['alt'] or 'Tweet image'} - {img['src']}]")
                
                if content_parts:
                    full_content = '\n\n'.join(content_parts)
                    return {
                        "type": "twitter",
                        "content": full_content,
                        "extra_info": {"thread_id": thread_id, "method": "dom_extraction", "images": images},
                        "title": f"Twitter Post {thread_id}"
                    }
    except Exception:
        pass

    # Final Meta Tag Fallback
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            meta_desc = soup.find('meta', property='og:description') or \
                        soup.find('meta', attrs={'name': 'description'}) or \
                        soup.find('meta', property='twitter:description')
            
            if meta_desc and meta_desc.get('content'):
                text = meta_desc.get('content')
                text = re.sub(r'https://t.co/\w+$', '', text).strip()
                if len(text) > 10:
                    return {
                        "type": "twitter",
                        "content": text,
                        "extra_info": {"thread_id": thread_id, "method": "meta_tags"},
                        "title": f"Twitter Post {thread_id}"
                    }
    except Exception:
        pass

    return {"error": "Could not extract thread. It may not be unrolled yet. Tip: Try unrolling it on threadreaderapp.com first."}





def extract_general_article(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        
        if len(article.text) < 100:
            raise ValueError("Extraction failed to get enough content")

        return {
            "type": "article",
            "content": article.text,
            "title": article.title,
            "author": ", ".join(article.authors) if article.authors else "Unknown",
            "extra_info": {"top_image": article.top_image}
        }
    except Exception as e:
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            article_tag = soup.find('article') or soup.find('main')
            if article_tag:
                paragraphs = article_tag.find_all('p')
            else:
                paragraphs = soup.find_all('p')
                
            text = "\n\n".join([p.get_text() for p in paragraphs if len(p.get_text()) > 30])
            title = article.title if 'article' in locals() and article.title else (soup.title.string if soup.title else "Untitled Article")
            
            return {
                "type": "article",
                "content": text or "No content extracted.",
                "title": title,
                "extra_info": {"method": "bs4_fallback"}
            }
        except Exception as e2:
            return {"error": f"Article extraction failed: {str(e2)}"}


def process_url(url):
    if 'twitter.com' in url or 'x.com' in url:
        if '/status/' in url:
            return extract_twitter_thread(url)
        
    # Default to article
    return extract_general_article(url)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL provided"}))
        sys.exit(1)
        
    url = sys.argv[1]
    try:
        result = process_url(url)
        # Ensure we only output JSON to stdout
        print(json.dumps(result))
    except Exception as e:
        # Catch any unexpected errors and return as JSON
        error_result = {"error": f"Unexpected error: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(1)
