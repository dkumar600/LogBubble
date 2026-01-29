// logUI.ts
// Main UI orchestrator - uses modular components

import { logStore, LogEntry } from "./logStore";
import { UI_STYLES } from "./styles";
import { DragHandler } from "./dragHandler";
import { VirtualScroller } from "./virtualScroller";
import { FilterManager } from "./filterManager";

export class LogUI {
  private rootEl: HTMLDivElement | null = null;
  private buttonEl: HTMLDivElement | null = null;
  private badgeEl: HTMLDivElement | null = null;
  private backdropEl: HTMLDivElement | null = null;
  private detailBackdropEl: HTMLDivElement | null = null;
  private detailModalEl: HTMLDivElement | null = null;
  private detailTitleEl: HTMLDivElement | null = null;
  private detailBodyEl: HTMLPreElement | null = null;
  private detailCopyBtn: HTMLButtonElement | null = null;
  private detailCloseBtn: HTMLButtonElement | null = null;
  private detailLog: LogEntry | null = null;
  private windowEl: HTMLDivElement | null = null;
  private contentEl: HTMLDivElement | null = null;
  private scrollContainerEl: HTMLDivElement | null = null;
  private viewportEl: HTMLDivElement | null = null;

  private isVisible = false;
  private unreadCount = 0;
  private unsubscribe: (() => void) | null = null;
  private isInitialized = false;

  private consoleFilterBtn: HTMLButtonElement | null = null;
  private networkFilterBtn: HTMLButtonElement | null = null;

  private allLogs: LogEntry[] = [];
  private filteredLogs: LogEntry[] = [];
  private logIndexByKey = new Map<string, number>();

  // Modular handlers
  private dragHandler: DragHandler | null = null;
  private virtualScroller: VirtualScroller | null = null;
  private filterManager: FilterManager | null = null;

  constructor() {
    // Init will be called by initNetworkLogger()
  }

  public init() {
    if (this.isInitialized) {
      console.warn("[LogUI] Already initialized, skipping duplicate init");
      return;
    }
    this.isInitialized = true;

    this.injectStyles();
    this.createUI();
    this.initializeModules();
    this.attachEventListeners();
    this.subscribeToLogs();
  }

  private injectStyles() {
    const styleEl = document.createElement("style");
    styleEl.textContent = UI_STYLES;
    document.head.appendChild(styleEl);
  }

  private createUI() {
    this.rootEl = document.createElement("div");
    this.rootEl.id = "dev-net-logger-root";

    // Create button
    this.buttonEl = document.createElement("div");
    this.buttonEl.id = "dev-net-logger-button";
    this.buttonEl.textContent = "📋";
    this.buttonEl.setAttribute("role", "button");
    this.buttonEl.setAttribute("aria-label", "Open developer logs");
    this.buttonEl.setAttribute("tabindex", "0");

    // Create badge
    this.badgeEl = document.createElement("div");
    this.badgeEl.id = "dev-net-logger-badge";
    this.buttonEl.appendChild(this.badgeEl);

    // Create backdrop
    this.backdropEl = document.createElement("div");
    this.backdropEl.id = "dev-net-logger-backdrop";
    this.backdropEl.setAttribute("role", "button");
    this.backdropEl.setAttribute("aria-label", "Close logs window");

    // Detail backdrop + modal (log expand)
    this.detailBackdropEl = document.createElement("div");
    this.detailBackdropEl.id = "dev-net-logger-detail-backdrop";
    this.detailBackdropEl.setAttribute("role", "button");
    this.detailBackdropEl.setAttribute("aria-label", "Close log details");

    this.detailModalEl = document.createElement("div");
    this.detailModalEl.id = "dev-net-logger-detail";
    this.detailModalEl.setAttribute("role", "dialog");
    this.detailModalEl.setAttribute("aria-label", "Log details");

    const detailHeader = document.createElement("div");
    detailHeader.id = "dev-net-logger-detail-header";

    this.detailTitleEl = document.createElement("div");
    this.detailTitleEl.id = "dev-net-logger-detail-title";
    this.detailTitleEl.textContent = "Log";

    const detailActions = document.createElement("div");
    detailActions.id = "dev-net-logger-detail-actions";

    this.detailCopyBtn = document.createElement("button");
    this.detailCopyBtn.setAttribute("type", "button");
    this.detailCopyBtn.textContent = "Copy";

    this.detailCloseBtn = document.createElement("button");
    this.detailCloseBtn.setAttribute("type", "button");
    this.detailCloseBtn.textContent = "Close";

    detailActions.appendChild(this.detailCopyBtn);
    detailActions.appendChild(this.detailCloseBtn);

    detailHeader.appendChild(this.detailTitleEl);
    detailHeader.appendChild(detailActions);

    this.detailBodyEl = document.createElement("pre");
    this.detailBodyEl.id = "dev-net-logger-detail-body";

    this.detailModalEl.appendChild(detailHeader);
    this.detailModalEl.appendChild(this.detailBodyEl);

    // Create window
    this.windowEl = document.createElement("div");
    this.windowEl.id = "dev-net-logger-window";
    this.windowEl.setAttribute("role", "dialog");
    this.windowEl.setAttribute("aria-label", "Developer logs");

    // Create header
    const headerEl = document.createElement("div");
    headerEl.id = "dev-net-logger-header";

    const titleEl = document.createElement("div");
    titleEl.id = "dev-net-logger-title";
    titleEl.textContent = "Dev Logs";

    const controlsEl = document.createElement("div");
    controlsEl.id = "dev-net-logger-controls";

    this.consoleFilterBtn = document.createElement("button");
    this.consoleFilterBtn.textContent = "Console";
    this.consoleFilterBtn.setAttribute("aria-label", "Filter Console logs");
    this.consoleFilterBtn.setAttribute("aria-pressed", "false");
    this.consoleFilterBtn.setAttribute("type", "button");
    this.consoleFilterBtn.onclick = () =>
      this.filterManager?.toggleFilter("console", this.allLogs);

    this.networkFilterBtn = document.createElement("button");
    this.networkFilterBtn.textContent = "Network";
    this.networkFilterBtn.setAttribute("aria-label", "Filter Network logs");
    this.networkFilterBtn.setAttribute("aria-pressed", "false");
    this.networkFilterBtn.setAttribute("type", "button");
    this.networkFilterBtn.onclick = () =>
      this.filterManager?.toggleFilter("network", this.allLogs);

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.setAttribute("aria-label", "Clear all logs");
    clearBtn.setAttribute("type", "button");
    clearBtn.onclick = () => this.clearLogs();

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy logs to clipboard");
    copyBtn.setAttribute("type", "button");
    copyBtn.onclick = () => this.copyLogs();

    controlsEl.appendChild(this.consoleFilterBtn);
    controlsEl.appendChild(this.networkFilterBtn);
    controlsEl.appendChild(clearBtn);
    controlsEl.appendChild(copyBtn);

    headerEl.appendChild(titleEl);
    headerEl.appendChild(controlsEl);

    // Create content area
    this.contentEl = document.createElement("div");
    this.contentEl.id = "dev-net-logger-content";
    this.contentEl.setAttribute("role", "log");
    this.contentEl.setAttribute("aria-live", "polite");
    this.contentEl.setAttribute("aria-atomic", "false");

    this.scrollContainerEl = document.createElement("div");
    this.scrollContainerEl.id = "dev-net-logger-scroll-container";

    this.viewportEl = document.createElement("div");
    this.viewportEl.id = "dev-net-logger-viewport";

    this.scrollContainerEl.appendChild(this.viewportEl);
    this.contentEl.appendChild(this.scrollContainerEl);

    this.windowEl.appendChild(headerEl);
    this.windowEl.appendChild(this.contentEl);

    this.rootEl.appendChild(this.buttonEl);
    this.rootEl.appendChild(this.backdropEl);
    this.rootEl.appendChild(this.windowEl);
    this.rootEl.appendChild(this.detailBackdropEl);
    this.rootEl.appendChild(this.detailModalEl);

    document.body.appendChild(this.rootEl);
  }

  private initializeModules() {
    if (
      !this.buttonEl ||
      !this.scrollContainerEl ||
      !this.viewportEl ||
      !this.contentEl ||
      !this.consoleFilterBtn ||
      !this.networkFilterBtn
    ) {
      return;
    }

    // Initialize drag handler
    this.dragHandler = new DragHandler(
      this.buttonEl,
      () => {
        this.updateWindowPosition();
      },
      () => {
        this.toggleWindow();
      },
    );
    this.dragHandler.attachListeners();

    // Initialize virtual scroller
    this.virtualScroller = new VirtualScroller(
      this.scrollContainerEl,
      this.viewportEl,
      this.contentEl,
      (log) => this.createLogElement(log),
    );
    this.virtualScroller.attachScrollListener();

    // Initialize filter manager
    this.filterManager = new FilterManager(
      this.consoleFilterBtn,
      this.networkFilterBtn,
      (filteredLogs) => {
        this.filteredLogs = this.dedupeLogsByKey(filteredLogs);
        this.virtualScroller?.renderVisibleLogs(this.filteredLogs);
      },
    );
  }

  private attachEventListeners() {
    if (!this.buttonEl || !this.backdropEl) return;

    // Keyboard support
    this.buttonEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleWindow();
      }
    });

    // Close on backdrop click
    this.backdropEl.addEventListener("click", () => {
      this.toggleWindow();
    });

    // Close detail modal
    this.detailBackdropEl?.addEventListener("click", () => {
      this.closeLogDetail();
    });
    this.detailCloseBtn?.addEventListener("click", () => {
      this.closeLogDetail();
    });
    this.detailCopyBtn?.addEventListener("click", () => {
      this.copyLogDetail();
    });
  }

  private subscribeToLogs() {
    this.allLogs = logStore.getLogs();
    this.logIndexByKey.clear();
    for (let i = 0; i < this.allLogs.length; i++) {
      this.logIndexByKey.set(this.allLogs[i].key, i);
    }
    this.applyFilter();

    this.unsubscribe = logStore.subscribe((log) => {
      const existingIndex = this.logIndexByKey.get(log.key);
      if (existingIndex !== undefined) {
        this.allLogs[existingIndex] = log;

        const filteredIndex = this.filteredLogs.findIndex(
          (item) => item.key === log.key,
        );
        if (filteredIndex !== -1) {
          this.filteredLogs[filteredIndex] = log;
        } else if (this.filterManager?.shouldShowLog(log)) {
          this.filteredLogs.push(log);
        }

        this.virtualScroller?.renderVisibleLogs(this.filteredLogs);
        return;
      }

      const lastAll = this.allLogs[this.allLogs.length - 1];
      const isSameAsLast = !!lastAll && lastAll.key === log.key;

      if (isSameAsLast) {
        // Consecutive repeat: update last row instead of adding a new one.
        this.allLogs[this.allLogs.length - 1] = log;

        if (this.filterManager?.shouldShowLog(log)) {
          const lastFiltered = this.filteredLogs[this.filteredLogs.length - 1];
          const isSameAsLastFiltered =
            !!lastFiltered && lastFiltered.key === log.key;

          if (isSameAsLastFiltered) {
            this.filteredLogs[this.filteredLogs.length - 1] = log;
          } else {
            // Filter just switched or list differs; safest is to recompute.
            this.applyFilter();
          }
        }
      } else {
        // New log
        this.allLogs.push(log);
        this.logIndexByKey.set(log.key, this.allLogs.length - 1);

        if (this.filterManager?.shouldShowLog(log)) {
          this.filteredLogs.push(log);
        }
      }

      // Re-render visible logs
      this.virtualScroller?.renderVisibleLogs(this.filteredLogs);

      if (!this.isVisible) {
        this.unreadCount++;
        this.updateBadge();
      }
    });
  }

  private applyFilter() {
    if (!this.filterManager) return;

    this.filteredLogs = this.dedupeLogsByKey(
      this.filterManager.applyFilter(this.allLogs),
    );
    this.virtualScroller?.renderVisibleLogs(this.filteredLogs);
  }

  private dedupeLogsByKey(logs: LogEntry[]): LogEntry[] {
    const seen = new Set<string>();
    const result: LogEntry[] = [];
    for (const log of logs) {
      if (seen.has(log.key)) continue;
      seen.add(log.key);
      result.push(log);
    }
    return result;
  }

  private createLogElement(log: LogEntry): HTMLDivElement {
    const logEl = document.createElement("div");
    logEl.className = `log-entry type-${log.type}`;

    logEl.addEventListener("click", () => {
      this.openLogDetail(log);
    });

    if (log.isCritical) {
      logEl.classList.add("critical");
    }

    const timestamp = new Date(log.timestamp);
    const timeStr = `${timestamp.getHours().toString().padStart(2, "0")}:${timestamp.getMinutes().toString().padStart(2, "0")}:${timestamp.getSeconds().toString().padStart(2, "0")}`;

    const timestampEl = document.createElement("span");
    timestampEl.className = "log-timestamp";
    timestampEl.textContent = timeStr;

    const messageEl = document.createElement("span");
    messageEl.className = "log-message";
    messageEl.textContent = log.message;

    logEl.appendChild(timestampEl);
    logEl.appendChild(messageEl);

    // Add count badge if log repeated
    if (log.count && log.count > 1) {
      const countBadge = document.createElement("span");
      countBadge.className = "log-count-badge";
      countBadge.textContent = `${log.count}`;
      countBadge.setAttribute("title", `Repeated ${log.count} times`);
      logEl.appendChild(countBadge);
    }

    return logEl;
  }

  private openLogDetail(log: LogEntry) {
    if (!this.detailBackdropEl || !this.detailModalEl || !this.detailBodyEl) {
      return;
    }

    this.detailLog = log;

    const date = new Date(log.timestamp);
    const time = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

    if (this.detailTitleEl) {
      const countStr = log.count && log.count > 1 ? ` (x${log.count})` : "";
      this.detailTitleEl.textContent = `${time} • ${log.type}${countStr}`;
    }

    const lines: string[] = [];
    lines.push(log.message);
    if (log.isCritical) {
      lines.push("");
      lines.push("CRITICAL log");
    }

    this.detailBodyEl.textContent = lines.join("\n");

    this.detailBackdropEl.classList.add("visible");
    this.detailModalEl.classList.add("visible");
  }

  private closeLogDetail() {
    this.detailLog = null;
    this.detailBackdropEl?.classList.remove("visible");
    this.detailModalEl?.classList.remove("visible");
  }

  private copyLogDetail() {
    if (!this.detailBodyEl) return;
    const text = this.detailBodyEl.textContent || "";
    if (!text) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        // ignore
      });
    }
  }

  private toggleWindow() {
    if (!this.windowEl || !this.backdropEl) return;
    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      this.updateWindowPosition();
      this.windowEl.classList.add("visible");
      this.backdropEl.classList.add("visible");
      document.body.style.overflow = "hidden";

      this.unreadCount = 0;
      this.updateBadge();

      if (this.contentEl && this.virtualScroller) {
        this.virtualScroller.updateViewportHeight();
      }
      this.virtualScroller?.renderVisibleLogs(this.filteredLogs);
      this.virtualScroller?.scrollToBottom();
    } else {
      this.windowEl.classList.remove("visible");
      this.backdropEl.classList.remove("visible");
      document.body.style.overflow = "";
    }
  }

  private updateWindowPosition() {
    if (!this.windowEl || !this.dragHandler) return;

    const centerY = this.dragHandler.buttonY + 24;
    const isTopHalf = centerY < window.innerHeight / 2;

    const centerX = this.dragHandler.buttonX + 24;
    const isLeftHalf = centerX < window.innerWidth / 2;

    this.windowEl.classList.remove(
      "position-top",
      "position-bottom",
      "position-left",
      "position-right",
    );

    if (isTopHalf) {
      this.windowEl.classList.add("position-top");
    } else {
      this.windowEl.classList.add("position-bottom");
    }

    if (isLeftHalf) {
      this.windowEl.classList.add("position-left");
    } else {
      this.windowEl.classList.add("position-right");
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
    logStore.clearLogs();
    this.allLogs = [];
    this.filteredLogs = [];
    this.logIndexByKey.clear();
    this.unreadCount = 0;
    this.updateBadge();
    this.virtualScroller?.renderVisibleLogs(this.filteredLogs);
  }

  private copyLogs() {
    const activeFilter = this.filterManager?.getActiveFilter();
    const logs =
      activeFilter === "all"
        ? logStore.getLogs()
        : logStore.getLogs(activeFilter === "console" ? "console" : "network");

    const text = logs
      .map((log) => {
        const date = new Date(log.timestamp);
        const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
        return `[${time}] [${log.type}] ${log.message}`;
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
