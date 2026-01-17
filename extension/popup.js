// API Configuration
const API_ENDPOINT = 'http://localhost:3001/api/captures';

// DOM Elements
const urlText = document.getElementById('urlText');
const saveButton = document.getElementById('saveButton');
const buttonText = document.getElementById('buttonText');
const content = document.getElementById('content');
const errorState = document.getElementById('errorState');
const retryButton = document.getElementById('retryButton');

let currentUrl = '';

// Get current tab URL
async function getCurrentTabUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    } catch (error) {
        console.error('Error getting tab URL:', error);
        throw error;
    }
}

// Extract content from Twitter/X page DOM
async function extractTwitterContent() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Execute script in the page context to access DOM
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const content = {
                    text: '',
                    images: []
                };
                
                // Extract text from the MAIN tweet only (data-tweet-index="1")
                const mainTweet = document.querySelector('p.article-paragraph.tweet-content.clickable-tweet[data-tweet-index="1"]');
                
                if (mainTweet) {
                    // Get the text content, preserving line breaks
                    const text = mainTweet.innerText || mainTweet.textContent || '';
                    content.text = text.trim();
                    
                    // Find the tweet container to scope image search
                    let tweetContainer = mainTweet.closest('article') || mainTweet.parentElement;
                    
                    // Extract images from within the same tweet container
                    if (tweetContainer) {
                        const tweetImages = tweetContainer.querySelectorAll('img.tweetimg');
                        tweetImages.forEach(img => {
                            const src = img.getAttribute('src');
                            const alt = img.getAttribute('alt') || '';
                            if (src && !src.includes('data:image')) { // Exclude data URIs
                                content.images.push({ src, alt });
                            }
                        });
                    } else {
                        // Fallback: search for images near the main tweet
                        const tweetImages = document.querySelectorAll('img.tweetimg');
                        tweetImages.forEach(img => {
                            const src = img.getAttribute('src');
                            const alt = img.getAttribute('alt') || '';
                            if (src && !src.includes('data:image')) {
                                content.images.push({ src, alt });
                            }
                        });
                    }
                } else {
                    // Fallback: try to find the first/main tweet paragraph
                    const firstTweet = document.querySelector('p.article-paragraph.tweet-content.clickable-tweet');
                    if (firstTweet) {
                        const text = firstTweet.innerText || firstTweet.textContent || '';
                        content.text = text.trim();
                    }
                }
                
                return content;
            }
        });
        
        return results[0]?.result || { text: '', images: [] };
    } catch (error) {
        console.error('Error extracting Twitter content:', error);
        return { text: '', images: [] };
    }
}

// Display URL
async function displayUrl() {
    try {
        currentUrl = await getCurrentTabUrl();
        urlText.textContent = currentUrl;
    } catch (error) {
        urlText.textContent = 'error loading url';
        console.error('Error displaying URL:', error);
    }
}

// Save URL to backend
async function saveUrl() {
    if (!currentUrl) {
        showError('no url to save');
        return;
    }

    // Show loading state
    saveButton.disabled = true;
    saveButton.classList.add('loading');
    buttonText.textContent = 'capturing';

    try {
        // Extract content from DOM if it's a Twitter/X page
        let extractedContent = null;
        if (currentUrl.includes('twitter.com') || currentUrl.includes('x.com')) {
            extractedContent = await extractTwitterContent();
            
            // Combine text and images into full content
            let fullContent = extractedContent.text;
            if (extractedContent.images.length > 0) {
                const imageTexts = extractedContent.images.map(img => {
                    return `[Image: ${img.alt || 'Tweet image'} - ${img.src}]`;
                });
                fullContent += '\n\n' + imageTexts.join('\n');
            }
            
            if (fullContent.trim()) {
                extractedContent.fullContent = fullContent;
            }
        }
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: currentUrl,
                timestamp: new Date().toISOString(),
                title: document.title || 'untitled',
                extractedContent: extractedContent
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
            console.error('Server error:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Saved successfully:', data);

        showSuccess();
    } catch (error) {
        console.error('Error saving URL:', error);
        // Show more specific error message
        const errorMessage = error.message || 'Failed to capture content';
        console.error('Error details:', errorMessage);
        showError(errorMessage);
    } finally {
        saveButton.disabled = false;
        saveButton.classList.remove('loading');
    }
}

// Show success state
function showSuccess() {
    saveButton.classList.add('success');

    // Auto-close after 1.5 seconds
    setTimeout(() => {
        window.close();
    }, 1500);
}

// Show error state
function showError(message) {
    content.style.display = 'none';
    errorState.style.display = 'block';
    // Log the error message for debugging
    if (message) {
        console.error('Capture failed:', message);
    }
}

// Reset to initial state
function resetToInitial() {
    content.style.display = 'block';
    errorState.style.display = 'none';
    saveButton.classList.remove('success');
    buttonText.textContent = 'capture';
}

// Event Listeners
saveButton.addEventListener('click', saveUrl);
retryButton.addEventListener('click', () => {
    resetToInitial();
    saveUrl();
});

// Initialize
displayUrl();
