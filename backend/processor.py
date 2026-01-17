import sys
import json
import re
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from newspaper import Article

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def extract_twitter_thread(url):
    match = re.search(r'/status/(\d+)', url)
    if not match:
        return {"error": "Invalid Twitter URL"}
    
    thread_id = match.group(1)
    
    # Try multiple unroll services
    services = [
        f"https://unrollnow.com/status/{thread_id}",
        f"https://threadreaderapp.com/thread/{thread_id}.html",
        f"https://twitter-thread.com/t/{thread_id}"
    ]
    
    for thread_url in services:
        try:
            response = requests.get(thread_url, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                continue
                
            soup = BeautifulSoup(response.text, 'html.parser')
            tweets = []
            
            # Use specific selectors based on service
            if 'unrollnow.com' in thread_url:
                tweet_elements = soup.find_all(['div', 'p'], class_=re.compile(r'tweet-text', re.I))
                tweets = [t.get_text(strip=True) for t in tweet_elements]
            elif 'threadreaderapp.com' in thread_url:
                tweet_elements = soup.find_all('div', class_='text')
                tweets = [t.get_text(strip=True) for t in tweet_elements]
            elif 'twitter-thread.com' in thread_url:
                tweet_elements = soup.select('div.whitespace-pre-wrap')
                tweets = [t.get_text(strip=True) for t in tweet_elements]

            # Broad fallback if specific selectors failed
            if not tweets:
                # Look for repeating content blocks that look like tweets
                tweet_elements = soup.find_all(['div', 'p'], class_=re.compile(r'(content|thread|text)', re.I))
                tweets = [t.get_text(strip=True) for t in tweet_elements if len(t.get_text()) > 40]

            # CLEANING: Remove navigation, footer, and common UI text
            noise = [
                "unroll thread", "login", "sign up", "terms of service", "privacy policy",
                "back to home", "thread not found", "more threads by", "follow us",
                "published 0 seconds ago", "tweet analytics", "print thread", "save as pdf"
            ]
            
            cleaned_tweets = []
            for t in tweets:
                t_lower = t.lower()
                if any(n in t_lower for n in noise):
                    continue
                if len(t) < 15:
                    continue
                cleaned_tweets.append(t)

            if cleaned_tweets:
                return {
                    "type": "twitter",
                    "content": "\n\n".join(cleaned_tweets),
                    "extra_info": {"thread_id": thread_id, "service_used": thread_url},
                    "title": f"Twitter Thread {thread_id}"
                }
        except Exception:
            continue

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





def extract_youtube_transcript(url):
    video_id = None
    if 'youtu.be/' in url:
        video_id = url.split('/')[-1].split('?')[0]
    elif 'v=' in url:
        video_id = url.split('v=')[1].split('&')[0]
        
    if not video_id:
        return {"error": "Could not extract Video ID"}
        
    try:
        # User preferred API call style
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.fetch(video_id)
        
        full_text = " ".join([item.text for item in transcript_list])

        
        return {
            "type": "youtube",
            "content": full_text,
            "extra_info": {"video_id": video_id},
            "title": f"YouTube Video {video_id}"
        }
    except Exception as e:
        return {"error": f"YouTube extraction failed: {str(e)}"}


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
    
    if 'youtube.com' in url or 'youtu.be' in url:
        return extract_youtube_transcript(url)
        
    # Default to article
    return extract_general_article(url)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL provided"}))
        sys.exit(1)
        
    url = sys.argv[1]
    result = process_url(url)
    print(json.dumps(result))
