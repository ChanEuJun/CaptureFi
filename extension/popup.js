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
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: currentUrl,
                timestamp: new Date().toISOString(),
                title: document.title || 'untitled'
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Saved successfully:', data);

        showSuccess();
    } catch (error) {
        console.error('Error saving URL:', error);
        showError();
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
function showError() {
    content.style.display = 'none';
    errorState.style.display = 'block';
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
