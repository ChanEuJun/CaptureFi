from processor import process_url
import json

def test_article():
    # Use a tech blog that usually doesn't block simple scrapers
    url = "https://techcrunch.com/2024/01/16/apple-watch-import-ban-livestream/"
    print(f"Testing Article: {url}")
    result = process_url(url)
    print(json.dumps(result, indent=2))
    assert result['type'] == 'article'
    assert 'content' in result


def test_youtube():
    # Example video with transcripts (Bitcoin explained)
    url = "https://www.youtube.com/watch?v=Gc2en3nHxA4"
    print(f"\nTesting YouTube: {url}")
    result = process_url(url)
    print(json.dumps(result, indent=2))
    if 'error' in result:
        print(f"YouTube transcript may not be available: {result['error']}")
    else:
        assert result['type'] == 'youtube'
        assert 'content' in result

def test_twitter():
    url = "https://x.com/C__Herridge/status/2011994014929621094"
    print(f"\nTesting Twitter: {url}")
    result = process_url(url)
    print(json.dumps(result, indent=2))
    if 'error' not in result:
        assert result['type'] == 'twitter'
    else:
        print(f"Twitter extraction failed: {result['error']}")


if __name__ == "__main__":
    try:
        test_article()
    except Exception as e:
        print(f"Article test failed: {e}")
        
    try:
        test_youtube()
    except Exception as e:
        print(f"YouTube test failed: {e}")

    try:
        test_twitter()
    except Exception as e:
        print(f"Twitter test failed: {e}")
