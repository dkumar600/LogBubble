export const UI_STYLES = `
#dev-net-logger-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#dev-net-logger-button {
  position: fixed;
  top: 35px;
  right: 35px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: move;
  z-index: 999999;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  touch-action: none;
  user-select: none;
}

#dev-net-logger-button:active {
  transform: scale(0.95);
}

#dev-net-logger-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-family: monospace;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

#dev-net-logger-badge.visible {
  display: flex;
}

#dev-net-logger-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999997;
  display: none;
  pointer-events: none;
}

#dev-net-logger-backdrop.visible {
  display: block;
  pointer-events: auto;
}

#dev-net-logger-detail-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000000;
  display: none;
  pointer-events: none;
}

#dev-net-logger-detail-backdrop.visible {
  display: block;
  pointer-events: auto;
}

#dev-net-logger-detail {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(100vw - 24px);
  max-width: 520px;
  max-height: 70vh;
  background: #0b1220;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  z-index: 1000001;
  display: none;
  flex-direction: column;
  overflow: hidden;
  pointer-events: none;
}

#dev-net-logger-detail.visible {
  display: flex;
  pointer-events: auto;
}

#dev-net-logger-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #111827;
  border-bottom: 1px solid #1f2937;
}

#dev-net-logger-detail-title {
  color: #e2e8f0;
  font-size: 12px;
  font-family: monospace;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#dev-net-logger-detail-actions {
  display: flex;
  gap: 8px;
}

#dev-net-logger-detail-actions button {
  padding: 6px 10px;
  font-size: 11px;
  background: #334155;
  color: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: monospace;
}

#dev-net-logger-detail-actions button:hover {
  background: #475569;
}

#dev-net-logger-detail-body {
  padding: 12px;
  margin: 0;
  color: #e2e8f0;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
  user-select: text;
}

#dev-net-logger-window {
  position: fixed;
  top: 70px;
  right: 10px;
  width: calc(100vw - 20px);
  max-width: 500px;
  height: 60vh;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  z-index: 999998;
  display: none;
  flex-direction: column;
  overflow: hidden;
  transition: none;
  pointer-events: none;
}

#dev-net-logger-window.visible {
  display: flex;
  pointer-events: auto;
}

#dev-net-logger-window.position-top {
  top: 70px;
  bottom: auto;
}

#dev-net-logger-window.position-bottom {
  bottom: 70px;
  top: auto;
}

#dev-net-logger-window.position-left {
  left: 10px;
  right: auto;
}

#dev-net-logger-window.position-right {
  right: 10px;
  left: auto;
}

#dev-net-logger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

#dev-net-logger-title {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: bold;
  font-family: monospace;
}

#dev-net-logger-controls {
  display: flex;
  gap: 8px;
}

#dev-net-logger-controls button {
  padding: 6px 12px;
  font-size: 11px;
  background: #334155;
  color: #f1f5f9;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
  font-weight: 500;
  transition: background 0.15s;
  min-width: 28px;
  min-height: 28px;
}

#dev-net-logger-controls button:hover {
  background: #475569;
}

#dev-net-logger-controls button:active {
  transform: scale(0.95);
}

#dev-net-logger-controls button.filter-active {
  background: #3b82f6;
  color: white;
}

 #dev-net-logger-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #0f172a;
  position: relative;
  padding-top: 4px;
}

#dev-net-logger-scroll-container {
  position: relative;
  width: 100%;
}

#dev-net-logger-viewport {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0;
}

.log-entry {
  height: 40px;
  padding: 8px 10px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-left: 3px solid #64748b;
  display: flex;
  align-items: center;
  overflow: hidden;
  contain: layout style paint;
  will-change: transform;
  cursor: pointer;
}

.log-entry.type-fetch {
  border-left-color: #3b82f6;
}

.log-entry.type-xhr {
  border-left-color: #8b5cf6;
}

.log-entry.type-dom {
  border-left-color: #f59e0b;
}

.log-entry.type-plugin {
  border-left-color: #ec4899;
}

.log-entry.type-console {
  border-left-color: #10b981;
}

.log-entry.critical {
  background: rgba(220, 38, 38, 0.14);
  border-left-color: #ef4444;
}

.log-entry.critical .log-timestamp {
  color: #fca5a5;
}

.log-entry.critical .log-message {
  color: #fee2e2;
  font-weight: 600;
}

.large-log-indicator {
  color: #fef2f2;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
}

.log-entry.critical .large-log-indicator {
  color: #fff1f2;
}

.log-entry.critical .large-log-indicator:hover {
  color: #fee2e2;
  text-decoration: none;
}

.log-timestamp {
  color: #64748b;
  font-size: 10px;
  margin-left: 2px !important;
  margin-right: 2px !important;
  flex-shrink: 0;
}

.log-message {
  color: #e2e8f0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  padding: 2px 6px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 10px;
  min-width: 18px;
  flex-shrink: 0;
}

.log-entry.critical .log-count-badge {
  background: #991b1b;
  color: #fef2f2;
}
`;
