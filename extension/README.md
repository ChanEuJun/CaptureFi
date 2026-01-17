# CaptureFi Chrome Extension

beautiful extension for capturing web content and sending it to your capturefi dashboard.

## features

- 🎨 dark airbnb aesthetic with glassmorphism
- ⚡ one-click url capture
- 🔄 automatic api integration
- ✨ smooth animations and transitions
- 💫 success/error states with visual feedback

## installation

1. **open chrome extensions page**
   - navigate to `chrome://extensions/`
   - enable "developer mode" (toggle in top right)

2. **load the extension**
   - click "load unpacked"
   - select the `extension` folder from this project

3. **start capturing**
   - click the capturefi icon in your toolbar
   - click "save to dashboard" on any page
   - your url is sent to the backend!

## configuration

the extension sends captured urls to:
```
http://localhost:3000/api/captures
```

to change the backend url, edit `popup.js`:
```javascript
const API_ENDPOINT = 'your-api-endpoint-here';
```

## api format

the extension sends a `POST` request with this payload:

```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-17T14:00:00.000Z",
  "title": "page title"
}
```

## file structure

```
extension/
├── manifest.json       # extension configuration
├── popup.html          # popup interface
├── popup.js           # capture logic
├── styles.css         # dark aesthetic styling
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## customization

### change colors
edit `styles.css` - look for the gradient colors:
- primary: `#8B5CF6` (purple)
- secondary: `#06B6D4` (cyan)

### change api endpoint
edit `popup.js`:
```javascript
const API_ENDPOINT = 'your-backend-url';
```

## troubleshooting

**extension not loading?**
- make sure you're in developer mode
- check console for errors

**api not working?**
- verify your backend is running
- check the endpoint in `popup.js`
- open devtools in the extension popup (right-click → inspect)

**icons not showing?**
- reload the extension
- check that icon files exist in `icons/` folder

## tech stack

- vanilla javascript (no frameworks)
- chrome extension manifest v3
- inter font from google fonts
- gradient svg icons

---

built with 💜 for capturefi
