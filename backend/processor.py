import sys
import json
import re
import requests
from bs4 import BeautifulSoup
from newspaper import Article
import math

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

CRYPTO_KEYWORDS = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'cardano', 'ada',
    'polkadot', 'dot', 'chainlink', 'link', 'polygon', 'matic', 'arbitrum', 'optimism',
    'base', 'avalanche', 'avax', 'cosmos', 'atom', 'celestia', 'tia', 'monero', 'xmr',
    'l2', 'layer 2', 'layer 1', 'l1', 'defi', 'nft', 'dao', 'metaverse', 'gaming', 'ai', 'artificial intelligence',
    'depin', 'rwa', 'real world assets', 'stablecoin', 'usdt', 'usdc', 'orderbook', 
    'exchange', 'cex', 'dex', 'memecoin', 'yield', 'staking', 'airdrop'
]

def calculate_read_time(text):
    if not text:
        return "1 min"
    words = len(text.split())
    minutes = math.ceil(words / 200)
    return f"{minutes} min{'s' if minutes > 1 else ''}"

def extract_tags(text):
    if not text:
        return []
    text_lower = text.lower()
    tags = set()
    for keyword in CRYPTO_KEYWORDS:
        if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
            # Normalize some keywords
            if keyword in ['btc']: tags.add('bitcoin')
            elif keyword in ['eth']: tags.add('ethereum')
            elif keyword in ['sol']: tags.add('solana')
            elif keyword in ['avax']: tags.add('avalanche')
            elif keyword in ['tia']: tags.add('celestia')
            elif keyword in ['layer 2']: tags.add('l2')
            elif keyword in ['layer 1']: tags.add('l1')
            elif keyword in ['artificial intelligence']: tags.add('ai')
            elif keyword in ['real world assets']: tags.add('rwa')
            else: tags.add(keyword)
    return list(tags)

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
            
            author_div = soup.find('div', class_=lambda x: x and 'line-clamp-1' in x and 'text-base' in x and 'text-gray' in x)
            author = author_div.get_text(strip=True) if author_div else 'Unknown'
            if author.startswith('@'):
                author = author[1:]
            
            text_div = soup.find('div', class_=lambda x: x and 'whitespace-pre-wrap' in x and 'text-lg' in x)
            
            if text_div:
                images = []
                img_tags = text_div.find_all('img')
                for img in img_tags:
                    src = img.get('src', '')
                    alt = img.get('alt', '')
                    if src and not src.startswith('data:'):
                        images.append({'src': src, 'alt': alt})
                    if alt:
                        img.replace_with(alt)
                
                links = []
                link_tags = text_div.find_all('a', class_=lambda x: x and 'text-primary' in x if x else False)
                for link in link_tags:
                    href = link.get('href', '')
                    link_text = link.get_text(strip=True)
                    if href:
                        links.append({'url': href, 'text': link_text})
                    link.replace_with(link_text)
                
                cleaned_text = text_div.get_text(separator=' ', strip=True)
                
                if cleaned_text:
                    return {
                        "type": "twitter",
                        "content": cleaned_text,
                        "author": author,
                        "readTime": calculate_read_time(cleaned_text),
                        "tags": extract_tags(cleaned_text),
                        "extra_info": {
                            "thread_id": thread_id,
                            "service_used": thread_url,
                            "images": images,
                            "links": links
                        },
                        "title": f"Twitter Post by @{author}"
                    }
    except Exception:
        pass

    # Try direct DOM extraction fallback
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            def has_tweet_classes(class_list):
                if not class_list: return False
                if isinstance(class_list, str): class_list = [class_list]
                return 'article-paragraph' in class_list and 'tweet-content' in class_list and 'clickable-tweet' in class_list
            
            def has_tweetimg_class(class_list):
                if not class_list: return False
                if isinstance(class_list, str): class_list = [class_list]
                return 'tweetimg' in class_list
            
            main_tweet = soup.find('p', class_=has_tweet_classes, attrs={'data-tweet-index': '1'})
            if not main_tweet:
                tweet_paragraphs = soup.find_all('p', class_=has_tweet_classes)
                if tweet_paragraphs: main_tweet = tweet_paragraphs[0]
            
            if main_tweet:
                text = main_tweet.get_text(strip=True)
                images = []
                tweet_container = main_tweet.find_parent('article') or main_tweet.parent
                tweet_images = tweet_container.find_all('img', class_=has_tweetimg_class) if tweet_container else soup.find_all('img', class_=has_tweetimg_class)
                
                for img in tweet_images:
                    src = img.get('src', '')
                    alt = img.get('alt', '')
                    if src and not src.startswith('data:') and ('http' in src or src.startswith('//')):
                        images.append({'src': src, 'alt': alt})
                
                content_parts = [text] if text else []
                for img in images:
                    content_parts.append(f"[Image: {img['alt'] or 'Tweet image'} - {img['src']}]")
                
                if content_parts:
                    full_content = '\n\n'.join(content_parts)
                    return {
                        "type": "twitter",
                        "content": full_content,
                        "readTime": calculate_read_time(full_content),
                        "tags": extract_tags(full_content),
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
                        "readTime": calculate_read_time(text),
                        "tags": extract_tags(text),
                        "extra_info": {"thread_id": thread_id, "method": "meta_tags"},
                        "title": f"Twitter Post {thread_id}"
                    }
    except Exception:
        pass

    return {"error": "Could not extract thread. It may not be unrolled yet."}

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
            "readTime": calculate_read_time(article.text),
            "tags": extract_tags(article.text),
            "extra_info": {"top_image": article.top_image}
        }
    except Exception:
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            article_tag = soup.find('article') or soup.find('main')
            paragraphs = article_tag.find_all('p') if article_tag else soup.find_all('p')
                
            text = "\n\n".join([p.get_text() for p in paragraphs if len(p.get_text()) > 30])
            title = article.title if 'article' in locals() and article.title else (soup.title.string if soup.title else "Untitled Article")
            
            return {
                "type": "article",
                "content": text or "No content extracted.",
                "title": title,
                "readTime": calculate_read_time(text),
                "tags": extract_tags(text),
                "extra_info": {"method": "bs4_fallback"}
            }
        except Exception as e2:
            return {"error": f"Article extraction failed: {str(e2)}"}

demo_yt = """
I think Sailor completely destroyed and changed the traditional four-year cycles. I don't think things are going to be the same. And if you don't watch this interview, you're going to miss out on exactly how Bitcoin is going to move forward. Michael Sailor just changed Bitcoin forever. At least according to the youngest crypto analyst we've ever interviewed, the very successful CryptoKit. I'm here to show you a pattern that emerges in every single Bitcoin four-year cycle before us. >> If you are still holding Bitcoin in 2026, you need to watch today's whole interview. This is your warning. >> Unfortunately, in the short term, it's not looking so pretty. So, I do a strategy. Yeah, it doesn't look so good in the short term. Smash the like button, share this video with one friend, and let me introduce you to the CryptoKit. Did Michael Sailor break Bitcoin's 4year cycle? You will be surprised what we go over in today's video. Today, I'm interviewing the youngest crypto analyst. He's known as CryptoKid to understand this market and exactly what's going on and why this is all happening. He is one of the fastest growing crypto YouTube channels today, just surpassing 60,000 subscribers. Before we jump into this interview, make sure you subscribe to his channel for daily TA on the crypto markets. Let's get him to 100,000 subscribers ASAP. CryptoKid, how are you doing today? >> Aaron, I'm so happy that you have me on. Uh it's it's an absolute pleasure and I'm very excited to talk about why I think Sailor just broke the entire four-year cycle system. >> Totally. So, we're going to talk about Sailor and what's going on. And also, guys, make sure you um have notifications turned on for my channel, of course, but also CryptoKid's channel because we're just about to release an interview I did on his channel talking about my top five altcoins for 2026. So, look for that on his channel. Before we jump into Sailor, before we jump into what comes next for the crypto markets, I don't know if I did a good job, you know, explaining what you do. What is your content? What do you do on your channel? >> Uh, well, Aaron, I think you did a fantastic job. I've started making videos about the crypto markets when I was 14. So, I started crypto when I was 12. I have an acting background as well. I I did musical theater for 4 years and then I jumped into crypto because I wasn't so happy with the education system. So I wanted to find a way to break free and I came across a video from Ral Powell back in 2019 about Ethereum and just sort of fell into the rabbit hole. I taught myself technical analysis and became the youngest trader of my time when I was 12 13. But I still had a passion to be on screen and share my uh share my knowledge. So I started my YouTube channel at 14. And for the past four years, I've been making daily content about my expectations for the short-term markets through TA through showcasing my trades. And we've been doing a great job so far, I think. And I'm very excited to keep doing this for as long as I can. >> Definitely. I love your regular content and uh kind of your analysis on the market. So, let's jump into the topic. CryptoKid >> Michael Sailor broke Bitcoin's four-year cycle. True or false? >> I think it's true. And I think that Sailor absolutely destroyed it, but I think he did it in a beautiful way. So later on in this video, we're going to go into my technical predictions looking at similarities between this cycle and the prior cycle from a technical standpoint. But I first want to highlight this very important topic. So Michael Sailor started buying Bitcoin in August of 2020 and his initial purchase was worth $250 million. I think that day we sort of broke the traditional trajectory for Bitcoin. Prior to 2020, there wasn't significant amounts of daily accumulation of Bitcoin itself. There is one thing that you're taught in economics high school class, and that is supply and demand. If there's more demand than available supply, then prices go to the upside. In August of 2020, sailor shifted that paradigm. For the first time, we're getting continuous or we would be getting continuous daily buying pressure. Fast forward six years, today MSTR holds $65 billion worth of Bitcoin. So, when you do a quick easy mathematical calculation by taking that 65 billion and dividing it by the number of days since the treasury began, you get a daily average accumulation of 346 bitcoins. I don't know if you guys knew this, but we're currently in the in the fifth Bitcoin cycle. Um, and in this fifth Bitcoin cycle, the amount of new daily uh added bitcoin into the supply is currently sitting at 454 bitcoins. So, Sailor alone through Michael's through Micro Strategy is buying up 76% of the daily added bitcoin into the circulating supply, which I think is massive. Baron and Sailor. Not only is he doing this by himself, but he inspired an entire generation of Bitcoin treasury companies. And running that same calculation, those treasury companies accumulate around 461 bitcoins per day. So in total with Sailor and the remainder of the top 10 Bitcoin treasury companies, they accumulate 1.7 times the new daily added Bitcoin into the supply. So we will take this and go back to high school and look at that economic graph of supply and demand. There is way more demand than there is supply for Bitcoin. And over the next four years and the four years after that, the circulating supply, the newly added circulating supply will deduce by half and half and half and half. And this will add to Bitcoin going up forever. >> Wow. I I mean I was going to ask you what are the implications of this but you know it's like you said Michael Sailor's company alone buying up more Bitcoin that is released not to mention all the other treasury companies and so the implications are this it's pretty bullish long term it sounds like >> I I think it's pretty bullish we are not even talking about the ETFs I mean the ETFs also buy a ridiculous amount of Bitcoin and I'm just checking my notes and since their inception again with the same mathematical rule they buy about 88 18 bitcoin. So in complete total you have 3.5 times the entire new added bitcoin supply on a daily basis accumulated by institutions and companies. And don't forget there is monetary debasement. America has a $ 38.6 trillion national debt. $9.5 trillion getting refinanced this year. Quantitative easing already started. We're going to have a politicized Fed, which would cause the value of the dollar to drop. All of these things in totality bring to us an incredibly bullish Bitcoin, potentially getting us us to that million dollar mark by the year of 2030, maybe even sooner. >> $1 million by 2030 you think is possible? >> I think it's 100% possible. >> You think it's likely? >> I think it's very I think it's very likely. I mean, look at the situation that we have in the US. Look at the situation that we have in the world. There's $ 38.6 6 trillion of national debt and you look at the liquidity in regional banks. You look at the liquidity in general. You look at the cost of living. There's a huge gap between the wealth of the very wealthy and the wealth of the not so wealthy. These are all warning signs. This year is going to be a year of liquidity. This year is going to be a year of flooding the markets with money because we urgently need it. If we don't, America goes bankrupt. So, I think all of these things in totality, like I said, will bring us to a very special price for Bitcoin, and it could be a million dollars. >> Well, you're long-term bullish, but I'm curious to hear your thoughts on the short term. Should we jump to the charts? >> Yeah, let's do it. Well, I am long-term bullish, Aaron, but unfortunately in the short term, it's not looking so pretty. So, I do a strategy. Yeah, it doesn't look so good in the short term. um because right now we're following in terms of price those four-year cycle. So we referred to the four-year hinging cycles but simultaneously two other four-year cyclical patterns emerge alongside that four-year hings and that is the presidential electoral cycles and you also have the business cycles and the accumulation of these three individual four-year cycles creates a perfect storm for having predictable booms and busts. Now, that's going to change because the business cycles are shifting from four years to 5 years. But I think most of your audience know that anyway. It's from Ral Pal's analysis. I'm here to show you a pattern that emerges in every single Bitcoin 4-year cycle before us. And that is when we break down from a Q4 top, which we've done Q4 tops since the inception of Bitcoin. When you break down, you test the 200 daily moving average. And after testing it, when you're transferring from a bull into a bare market from a traditional four-year cycle perspective, following a breakdown, you always see a retest back towards it. And there's a time duration of one. >> What am I looking at right here? Is this every Q4 top you're showing me? The last four. >> Yeah. So, the top left is looking at the 2021 top into the 2022 bare markets. Over here, we have an anomaly. Uh, this goes into the 2019 midcycle top, which took place at 14K. This top was happening two months before quantitative tightening. Well, QT ended, right? So, QT ended two months before. Bitcoin saw a top very similar to the current price action. Um, I'll explain this one a little bit later on in the video. And then at the bottom leftand corner, we see the 2017 2018 price action. And finally, at the bottom right, we see the Genesis cycle. So, here 2021, you break below it, you retest it. You do the same thing in 2019. Let's focus on the bottom two. In 2017, you break below. We forget about this little wick. The wick doesn't count. This was the sustainable move to the downside. You get a retest to the 200 day moving average, and then you continue further down. Even in the genesis cycle, where people see it as the least relevant, Bitcoin experiences a break below the 200 daily, gets a retest, and ends up going to lower price trajectories. So when we look at this and we look at today's price action here, you can see a very similar approach. Bitcoin had a Q4 top posting year. We saw a break below the 200 daily moving average. And when we look at the average time it took for us to reach from the break to the retest, it is 1 to 3 months. So far we are 2 and 1/2 months in. And I'm expecting within the next two, three, four weeks for Bitcoin to get to the 200 daily, which is sitting at 106. But Aaron, I don't think that's good. I'm actually shorting at those price levels because, as you've noticed, after getting that retest, prices always come to the downside, even in the anomaly of 2019. A lot of people compare this cycle to 2019 because this was from a monetary policy point of view the most similar to where we are in this event. Bitcoin saw a retest and ended up consolidating lower. That's my base case. So I'm going to be shorting that retest. I'm going to be taking profits at those at the retest and I'm going to be hanging on to short positions for a majority of 2026. So you're in the sometime in the next 3 4 weeks, you know, whenever it goes back up, touches wherever that line is at the time, 105K, whatever it is, you think that's going to be the local top and uh sell into that, short into that and 2026 um you know, what do you what do you think comes next? Is it a lower low? Is you said the four-year cycle is no more. So So what happens? Well, look, I think the business cycles, the liquidity is going to take the forefront here. We Are going to refinance $9.5 trillion of debts this year. Trump is doing his own QE measures like telling institutions to buy up 200 billion dollars of mortgage back securities. These are all artificial forms of QE and we have traditional forms of QE. In 2019, we saw a very similar approach. There was a lot of liquidity that was injected because of co relief checks, money printing led to a consolidation in markets and then a dramatic move to the upside 6 to 12 months after that printed money was able to travel back into the riskcon and Bitcoin markets. So my prediction is I don't think we're going to see the crash that we got in 2021 to 2022, the crash that we got in 2017 to 2018, etc. I think we're going to see a repeat of the 2019 price action where price does consolidate towards the downside as liquidity is introduced. It's waiting to get funneled into the risk on markets. So I see a consolidation. I'm going to short right just from a derivatives perspective. But in terms of my huddle spot portfolio accumulation, we're ridiculously bullish. I think sailor's buying pressure, the ETF's buying pressure will avoid a massive massive dump like the prior cycles. So, I see a consolidation and moving into 2027 and beyond, I see Bitcoin breaking off and heading to much, much higher prices. Very interesting. Very interesting. You know, I guess kind of a big picture question I have for you, crypto kid, as we get to my final questions. You started crypto when you were 12 years old and you proved that anybody can make money in crypto. What is your best kind of general advice on how to be profitable trading crypto or making money in crypto? >> Well, I started by teaching myself the skill of technical analysis and it took me about a year and a half to practice via demo trading before I could become profitable enough to start risking my own money. I've had multiple streams of income in crypto. I I do trading then I have my media business then I do advisory to projects helping them to to go to market and um and and choose what is the right way to launch. So I've had multiple avenues of making income and through those passive income strategies I put it back into Bitcoin. I believe in Bitcoin in the long term. I think Bitcoin is going to be the money. So my advice to you that may be just starting or maybe struggling a little bit in their journey, find ways to drive passive income. I think trading is a fantastic way to do that and over on my channel I'm educational about it. I show what I do. Secondly, find a problem and try to fix it. Build a business around it. These two forms of passive income will allow you to accumulate more Bitcoin in your spot huddle bag. And if you can do that for the next 10, 15 years without selling, that compound interest alone can make you millions and help you retire earlier on. >> I love it. Guys, head on over to CryptoKid channel. Give him a subscribe. Give him a follow. We We started this interview, he had, you know, just over 60,000, but now we're shooting towards 100,000. >> Probably. We're probably at like 95 now. >> I hope. I hope. And of course, uh, you know, at the very least, I'm a about I think it's already released at this point. Our interview um, top five altcoins 2026. I'm interviewed on his channel. Check that out. CryptoKid, thank you so much for coming on today. Any final thoughts? >> Well, no, I'm just very grateful to be here. I met Aaron at a crypto conference around 3 4 years ago. Um, I love the content that you guys do. So, it's it's really been an honor. So, thank you so much. Make sure to follow Altcoin Daily. Make sure to remain consistent. I know times are boring, but if we can pull through, we're going to be greatly rewarded in the future. >> Thanks, CryptoKidd. And where is 
"""

def process_url(url):
    if 'twitter.com' in url or 'x.com' in url:
        if '/status/' in url:
            return extract_twitter_thread(url)
    if 'youtube.com' in url or 'youtu.be' in url:
        return {
                "type": "youtube",
                "content": demo_yt,
                "author": "CryptoKid",
                "title": "Michael Saylor Just Changed Bitcoin Forever!! (ACT NOW)",
                "readTime": calculate_read_time(demo_yt),
                "tags": extract_tags(demo_yt)
        }
        
    # Default to article
    return extract_general_article(url)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL provided"}))
        sys.exit(1)
        
    url = sys.argv[1]
    try:
        result = process_url(url)
        print(json.dumps(result))
    except Exception as e:
        error_result = {"error": f"Unexpected error: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(1)
