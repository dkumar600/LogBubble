// logUI.ts
// Vanilla JS floating log UI

import { logStore, LogEntry } from "./logStore";

const UI_STYLES = `
#dev-net-logger-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#dev-net-logger-button {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  z-index: 999999;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
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
}

#dev-net-logger-backdrop.visible {
  display: block;
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
}

#dev-net-logger-window.visible {
  display: flex;
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
  padding: 4px 8px;
  font-size: 11px;
  background: #334155;
  color: #f1f5f9;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
}

#dev-net-logger-controls button:active {
  background: #475569;
}

#dev-net-logger-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.4;
  color: #e2e8f0;
}

.log-entry {
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: #0f172a;
  border-left: 3px solid #64748b;
  word-break: break-word;
  overflow-wrap: break-word;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
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

.log-timestamp {
  color: #64748b;
  font-size: 10px;
  margin-right: 8px;
  flex-shrink: 0;
}

.log-message {
  color: #e2e8f0;
  word-break: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;
}
`;

export class LogUI {
  private rootEl: HTMLDivElement | null = null;
  private buttonEl: HTMLDivElement | null = null;
  private badgeEl: HTMLDivElement | null = null;
  private backdropEl: HTMLDivElement | null = null;
  private windowEl: HTMLDivElement | null = null;
  private contentEl: HTMLDivElement | null = null;
  private isVisible = false;
  private unreadCount = 0;
  private unsubscribe: (() => void) | null = null;

  init() {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
    if (this.rootEl) return; // Already initialized

    this.createUI();
    this.attachEventListeners();
    this.subscribeToLogs();
  }

  private createUI() {
    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.textContent = UI_STYLES;
    document.head.appendChild(styleEl);

    // Create root container
    this.rootEl = document.createElement("div");
    this.rootEl.id = "dev-net-logger-root";

    // Create button
    this.buttonEl = document.createElement("div");
    this.buttonEl.id = "dev-net-logger-button";
    this.buttonEl.textContent = "📡";
    this.buttonEl.title = "Network Logger";

    // Create badge
    this.badgeEl = document.createElement("div");
    this.badgeEl.id = "dev-net-logger-badge";
    this.buttonEl.appendChild(this.badgeEl);

    // Create backdrop
    this.backdropEl = document.createElement("div");
    this.backdropEl.id = "dev-net-logger-backdrop";

    // Create window
    this.windowEl = document.createElement("div");
    this.windowEl.id = "dev-net-logger-window";

    // Create header
    const headerEl = document.createElement("div");
    headerEl.id = "dev-net-logger-header";

    const titleEl = document.createElement("div");
    titleEl.id = "dev-net-logger-title";
    titleEl.textContent = "Network Logs";

    const controlsEl = document.createElement("div");
    controlsEl.id = "dev-net-logger-controls";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.onclick = () => this.clearLogs();

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => this.copyLogs();

    controlsEl.appendChild(clearBtn);
    controlsEl.appendChild(copyBtn);

    headerEl.appendChild(titleEl);
    headerEl.appendChild(controlsEl);

    // Create content area
    this.contentEl = document.createElement("div");
    this.contentEl.id = "dev-net-logger-content";

    this.windowEl.appendChild(headerEl);
    this.windowEl.appendChild(this.contentEl);

    this.rootEl.appendChild(this.buttonEl);
    this.rootEl.appendChild(this.backdropEl);
    this.rootEl.appendChild(this.windowEl);

    document.body.appendChild(this.rootEl);
  }

  private attachEventListeners() {
    if (!this.buttonEl || !this.windowEl || !this.backdropEl) return;

    this.buttonEl.addEventListener("click", () => {
      this.toggleWindow();
    });

    // Close window when clicking backdrop
    this.backdropEl.addEventListener("click", () => {
      this.toggleWindow();
    });
  }

  private subscribeToLogs() {
    // Load existing logs
    const existingLogs = logStore.getLogs();
    existingLogs.forEach((log) => this.addLogToUI(log));

    // Subscribe to new logs
    this.unsubscribe = logStore.subscribe((log) => {
      this.addLogToUI(log);
    });
  }

  private addLogToUI(log: LogEntry) {
    if (!this.contentEl) return;

    // Increment unread count if window is closed
    if (!this.isVisible) {
      this.unreadCount++;
      this.updateBadge();
    }

    const logEl = document.createElement("div");
    logEl.className = `log-entry type-${log.type}`;

    const timestampEl = document.createElement("span");
    timestampEl.className = "log-timestamp";
    const date = new Date(log.timestamp);
    timestampEl.textContent = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

    const messageEl = document.createElement("span");
    messageEl.className = "log-message";
    messageEl.textContent = log.message;

    logEl.appendChild(timestampEl);
    logEl.appendChild(messageEl);

    this.contentEl.appendChild(logEl);

    // Auto-scroll to bottom
    this.contentEl.scrollTop = this.contentEl.scrollHeight;
  }

  private toggleWindow() {
    if (!this.windowEl || !this.backdropEl) return;
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.windowEl.classList.add("visible");
      this.backdropEl.classList.add("visible");
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      // Reset unread count when opening
      this.unreadCount = 0;
      this.updateBadge();
    } else {
      this.windowEl.classList.remove("visible");
      this.backdropEl.classList.remove("visible");
      // Restore body scroll
      document.body.style.overflow = "";
    }
  }

  private updateBadge() {
    if (!this.badgeEl) return;
    if (this.unreadCount > 0) {
      this.badgeEl.textContent =
        this.unreadCount > 99 ? "99+" : String(this.unreadCount);
      this.badgeEl.classList.add("visible");
    } else {
      this.badgeEl.classList.remove("visible");
    }
  }

  private clearLogs() {
    if (!this.contentEl) return;
    logStore.clearLogs();
    this.contentEl.innerHTML = "";
    this.unreadCount = 0;
    this.updateBadge();
  }

  private copyLogs() {
    const logs = logStore.getLogs();
    const text = logs
      .map((log) => {
        const date = new Date(log.timestamp);
        const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
        return `[${time}] ${log.message}`;
      })
      .join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert("Logs copied to clipboard!");
      });
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.rootEl) {
      this.rootEl.remove();
    }
  }
}

export const logUI = new LogUI();
