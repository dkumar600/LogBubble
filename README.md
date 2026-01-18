# LogBubble 🫧

A lightweight, floating log viewer for monitoring network requests and console logs in web applications. Perfect for debugging web apps, Capacitor apps, and Progressive Web Apps (PWAs) directly on mobile devices or in production-like environments.

## Features

✨ **Floating UI**: Non-intrusive bubble interface that stays accessible without blocking your app  
🌐 **Network Monitoring**: Automatically logs `fetch`, `XMLHttpRequest`, and dynamic script/link loading  
📝 **Console Logging**: Captures `console.log`, `console.warn`, `console.error`, `console.info`, and `console.debug`  
🔔 **Unread Badge**: Shows count of new logs since last view  
📋 **Copy to Clipboard**: Export all logs with timestamps  
🔄 **Auto-initialization**: Works out of the box with zero configuration  
🎨 **Clean UI**: Modern, minimalist design with color-coded log types

## Installation

### Using npm link (Local Development)

```bash
# In LogBubble directory
npm install
npm run build
npm link

# In your project directory
npm link logbubble
```

### Using file reference

```json
{
  "dependencies": {
    "logbubble": "file:../../LogBubble"
  }
}
```

## Usage

### Auto-initialization (Recommended)

Simply import LogBubble and it will automatically initialize:

```javascript
import "logbubble";
```

The floating bubble will appear in the top-right corner of your app.

### Manual initialization

If you want more control over when LogBubble initializes:

```javascript
import { initNetworkLogger } from "logbubble";

// Initialize when ready
initNetworkLogger();
```

**Note:** LogBubble has a built-in guard against duplicate initialization, so calling `initNetworkLogger()` multiple times is safe.

## Examples

### React (Vite/CRA)

```javascript
// main.jsx or index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "logbubble"; // Add this line

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Capacitor Apps

```javascript
// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initNetworkLogger } from "logbubble";

// Initialize LogBubble for mobile debugging
initNetworkLogger();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <script type="module">
      import "logbubble";

      // Your app code
      fetch("https://api.example.com/data")
        .then((res) => res.json())
        .then((data) => console.log("Data:", data));
    </script>
  </body>
</html>
```

## What Gets Logged?

LogBubble automatically intercepts and logs:

- **Fetch requests**: `[NET] GET https://api.example.com/users 200 145ms`
- **XHR requests**: `[NET] POST https://api.example.com/login 201 312ms`
- **Dynamic scripts/links**: `[NET] SCRIPT https://cdn.example.com/lib.js LOADED`
- **Console messages**: `[LOG] User logged in`, `[WARN] Connection slow`, `[ERROR] Failed to load`

## UI Controls

- **Bubble**: Click to toggle the log window
- **Badge**: Shows unread log count (disappears when window is opened)
- **Clear**: Remove all logs
- **Copy**: Copy all logs to clipboard with timestamps

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Project Structure

```
LogBubble/
├── core/           # Patching logic for fetch, XHR, DOM, console
├── ui/             # Floating UI and log store
├── init.ts         # Main entry point with auto-init
├── auto.ts         # Side-effect entry point
├── dist/           # Compiled output
└── package.json
```

## API

### `initNetworkLogger()`

Initializes LogBubble and starts intercepting network requests and console logs. Safe to call multiple times (duplicate calls are ignored).

```javascript
import { initNetworkLogger } from "logbubble";
initNetworkLogger();
```

### Global Access

When in a browser environment, LogBubble exposes itself globally:

```javascript
// Available on window object
window.initNetworkLogger();
```

## Browser Support

LogBubble works in all modern browsers and WebView environments:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Capacitor WebView
- ✅ Cordova WebView

## Use Cases

- 🐛 **Mobile Debugging**: Debug network issues on real devices without DevTools
- 🚀 **Production Testing**: Monitor requests in production-like environments
- 📱 **Capacitor/PWA Development**: Essential for debugging hybrid mobile apps
- 🧪 **QA Testing**: Allow testers to capture and share logs easily
- 📊 **Performance Monitoring**: Track request timing and errors

## Known Limitations

- Browser-only (requires `window` and DOM APIs)
- Logs are stored in memory only (cleared on page refresh)
- Maximum 500 logs retained (older logs are automatically removed)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

Built with ❤️ for developers who need better mobile debugging tools.
