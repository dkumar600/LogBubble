import { LogEntry } from "./logStore";

export class VirtualScroller {
  private itemHeight = 48;
  private overscan = 5;
  private scrollTop = 0;
  private viewportHeight = 0;
  private lastRenderStart = -1;
  private lastRenderEnd = -1;
  private currentLogs: LogEntry[] = [];

  private perfMonitor = {
    scrollFrameTimes: [] as number[],
  };

  constructor(
    private scrollContainerEl: HTMLDivElement,
    private viewportEl: HTMLDivElement,
    private contentEl: HTMLDivElement,
    private createLogElement: (log: LogEntry) => HTMLDivElement,
  ) {}

  public attachScrollListener() {
    this.contentEl.addEventListener("scroll", () => this.handleScroll());

    const resizeObserver = new ResizeObserver(() => {
      this.viewportHeight = this.contentEl.clientHeight;
      this.renderCurrentView();
    });
    resizeObserver.observe(this.contentEl);
  }

  public renderVisibleLogs(filteredLogs: LogEntry[]) {
    this.currentLogs = filteredLogs;
    this.lastRenderStart = -1;
    this.lastRenderEnd = -1;
    this.renderCurrentView();
  }

  private renderCurrentView(): void {
    this.scrollTop = this.contentEl.scrollTop;

    if (this.viewportHeight === 0) {
      this.viewportHeight = this.contentEl.clientHeight;
    }

    const filteredLogs = this.currentLogs;
    const totalLogs = filteredLogs.length;
    if (totalLogs === 0) {
      this.viewportEl.innerHTML = "";
      this.scrollContainerEl.style.height = "0px";
      return;
    }

    const totalHeight = totalLogs * this.itemHeight;
    const maxScrollTop = Math.max(0, totalHeight - this.viewportHeight);
    if (this.scrollTop > maxScrollTop) {
      this.scrollTop = maxScrollTop;
      this.contentEl.scrollTop = maxScrollTop;
    }

    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.ceil(
      (this.scrollTop + this.viewportHeight) / this.itemHeight,
    );

    const renderStart = Math.max(0, startIndex - this.overscan);
    const renderEnd = Math.min(totalLogs, endIndex + this.overscan);

    if (renderStart >= renderEnd) {
      this.scrollTop = 0;
      this.contentEl.scrollTop = 0;
      this.lastRenderStart = -1;
      this.lastRenderEnd = -1;
      this.renderCurrentView();
      return;
    }

    if (
      renderStart === this.lastRenderStart &&
      renderEnd === this.lastRenderEnd
    ) {
      return;
    }

    this.lastRenderStart = renderStart;
    this.lastRenderEnd = renderEnd;

    this.updateScrollContainerHeight(totalLogs);

    const fragment = document.createDocumentFragment();
    for (let i = renderStart; i < renderEnd; i++) {
      const logEl = this.createLogElement(filteredLogs[i]);
      logEl.style.position = "absolute";
      logEl.style.top = `${i * this.itemHeight}px`;
      logEl.style.left = "8px";
      logEl.style.right = "8px";
      fragment.appendChild(logEl);
    }

    this.viewportEl.innerHTML = "";
    this.viewportEl.appendChild(fragment);
  }

  public scrollToBottom() {
    if (this.contentEl) {
      this.contentEl.scrollTop = this.contentEl.scrollHeight;
    }
  }

  public getViewportHeight(): number {
    return this.viewportHeight;
  }

  public updateViewportHeight() {
    this.viewportHeight = this.contentEl.clientHeight;
  }

  private handleScroll() {
    const frameStart = performance.now();
    this.scrollTop = this.contentEl.scrollTop;

    this.renderCurrentView();

    const frameTime = performance.now() - frameStart;
    this.perfMonitor.scrollFrameTimes.push(frameTime);

    if (this.perfMonitor.scrollFrameTimes.length > 60) {
      this.perfMonitor.scrollFrameTimes.shift();
    }

    const avgFrameTime =
      this.perfMonitor.scrollFrameTimes.reduce((a, b) => a + b, 0) /
      this.perfMonitor.scrollFrameTimes.length;
    const fps = 1000 / avgFrameTime;

    if (fps < 55 && this.perfMonitor.scrollFrameTimes.length >= 60) {
      console.warn(
        `[LogBubble] Scroll performance: ${fps.toFixed(1)} FPS (target: ≥55 FPS)`,
      );
    }
  }

  private updateScrollContainerHeight(totalLogs: number) {
    const totalHeight = totalLogs * this.itemHeight;
    this.scrollContainerEl.style.height = `${totalHeight}px`;
  }
}
