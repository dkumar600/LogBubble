# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-02-05

### Fixed

- Fixed the margin issue for the button on iOS.

### Changed

- Added the correct Vite plugin name to the README.md.
- Added a demo video link in the README.md.

## [0.2.0] - 2026-01-29

### Added

- Unique `key` for each log entry to improve de-duplication
- UI de-duplication by log key to prevent duplicate rows
- Package exports for subpath imports (Vite plugin)
- Added feature to move Logbutton across the screen
- Added support for opening the log window from the LogButton regardless of its screen position
- Added toggleable Console and Network buttons to filter log types
- Added log modal with full details, timestamp, and a copy button for better readability

### Changed

- Improved performance by removing large payload handling from the UI
- Indicating the large payload with Critical UI
- Vite plugin simplified to inject LogBubble only

### Fixed

- Duplicate network log entries caused by fetch/XHR overlap
- Vite plugin subpath resolution for published package

## [0.1.0] - 2026-01-19

### Added

- Initial release of LogBubble
- Floating bubble UI for log viewing
- Network request monitoring (fetch, XMLHttpRequest)
- Console log capturing (log, warn, error, info, debug)
- Dynamic script/link loading tracking
- Unread badge counter
- Copy logs to clipboard functionality
- Clear logs functionality
- Auto-initialization support
- Duplicate initialization guard
- TypeScript support with type definitions

### Features

- Browser-only support (window and DOM required)
- Maximum 500 logs retention
- Color-coded log types in UI
- Timestamp tracking for all logs
- Non-intrusive floating interface
