# LogBubble 🫧

[![npm version](https://badge.fury.io/js/logbubble.svg)](https://badge.fury.io/js/logbubble)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-LogBubble-blue)](https://github.com/dkumar600/LogBubble)

A lightweight, floating log viewer for monitoring network requests and console logs in web applications. Perfect for debugging web apps, Capacitor apps, and Progressive Web Apps (PWAs) directly on mobile devices or in production-like environments.

[View on npm](https://www.npmjs.com/package/logbubble)

## Demo Video

[![Watch the demo](https://img.youtube.com/vi/pU-_eQViwQI/0.jpg)](https://youtu.be/pU-_eQViwQI)

## Features

✨ **Floating UI**: Non-intrusive bubble interface that stays accessible without blocking your app  
🌐 **Network Monitoring**: Automatically logs `fetch`, `XMLHttpRequest`, and dynamic script/link loading  
📝 **Console Logging**: Captures `console.log`, `console.warn`, `console.error`, `console.info`, and `console.debug`  
🔔 **Unread Badge**: Shows count of new logs since last view  
📋 **Copy to Clipboard**: Export all logs with timestamps  
🟢 **Draggable Bubble**: Move the log bubble to any corner of the screen  
🟦 **Toggleable Filters**: Easily filter between console and network logs  
🗂️ **Log Details Modal**: Click any log to open a modal with full details, timestamp, and a copy button for better readability  
🛠️ **Built-in Vite Plugin**: Vite plugin included in this project for easy integration during development  
🔄 **Auto-initialization**: Works out of the box with zero configuration  
🎨 **Clean UI**: Modern, minimalist design with color-coded log types

## Installation

Install LogBubble from npm:

```bash
npm install logbubble
```

Or with yarn:

```bash
yarn add logbubble
```

## Usage

### Auto-initialization (Recommended)

Simply import LogBubble and it will automatically initialize:

```javascript
import "logbubble";
```

The floating bubble will appear in the top-right corner of your app.

## Vite Plugin Integration

LogBubble provides a Vite plugin for easy integration during development. This automatically injects LogBubble into your app for local debugging.

### Setup

1. Install LogBubble (if not already):

```bash
npm install logbubble
```

2. Add the plugin to your `vite.config.js` or `vite.config.ts`:

```javascript
// vite.config.js
import logBubblePlugin from "logbubble/vite-logbubble-plugin";

export default {
  plugins: [
    logBubblePlugin(),
    // ...other plugins
  ],
};
```

3. Start your Vite dev server:

```bash
npm run dev
```

The LogBubble UI will appear automatically in your app during development.

**Note:** The plugin is intended for development only. For production builds, import LogBubble manually as shown above.

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
- **Draggable Button**: Button is draggable in all four corners of thr screen
- **Toggleable Filter**: Toggleable Buttons to filter between consoles and network logs
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

## Troubleshooting

### UI not appearing

Ensure LogBubble is imported at the entry point of your application (before React renders or before any other scripts run).

### Duplicate logs

If you see duplicate logs, check that `initNetworkLogger()` is not being called multiple times. LogBubble has a guard against this, but if you call it manually AND import the auto-init module, it may appear twice.

### Not capturing network requests

Make sure your app is using native `fetch` or `XMLHttpRequest` APIs. Some custom HTTP clients may not be automatically patched.

## Support

For issues, feature requests, or questions, please open an issue on [GitHub](https://github.com/dkumar600/LogBubble/issues).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on [GitHub](https://github.com/dkumar600/LogBubble).

### Getting Started with Development

If you want to contribute to LogBubble:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Watch for changes: `npm run dev`

---

Built with ❤️ for developers who need better mobile debugging tools.

**Made by [Deepak Kumar](https://github.com/dkumar600)**
