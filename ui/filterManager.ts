import { LogEntry } from "./logStore";

export type FilterType = "all" | "console" | "network";

export class FilterManager {
  private activeFilter: FilterType = "all";
  private perfMonitor = {
    filterToggleStart: 0,
  };

  constructor(
    private consoleFilterBtn: HTMLButtonElement,
    private networkFilterBtn: HTMLButtonElement,
    private onFilterChange: (filteredLogs: LogEntry[]) => void,
  ) {}

  public toggleFilter(filter: "console" | "network", allLogs: LogEntry[]) {
    this.perfMonitor.filterToggleStart = performance.now();

    if (this.activeFilter === filter) {
      this.activeFilter = "all";
    } else {
      this.activeFilter = filter;
    }

    this.updateFilterButtons();

    const filteredLogs = this.applyFilter(allLogs);
    this.onFilterChange(filteredLogs);

    const elapsed = performance.now() - this.perfMonitor.filterToggleStart;
    if (elapsed > 16) {
      console.warn(
        `[LogBubble] Filter toggle took ${elapsed.toFixed(2)}ms (target: ≤16ms)`,
      );
    }
  }

  public applyFilter(allLogs: LogEntry[]): LogEntry[] {
    if (this.activeFilter === "all") {
      return allLogs;
    }

    return allLogs.filter((log) => {
      if (this.activeFilter === "console") {
        return log.category === "console";
      } else if (this.activeFilter === "network") {
        return log.category === "network";
      }
      return true;
    });
  }

  public shouldShowLog(log: LogEntry): boolean {
    if (this.activeFilter === "all") return true;
    if (this.activeFilter === "console") return log.category === "console";
    if (this.activeFilter === "network") return log.category === "network";
    return true;
  }

  public getActiveFilter(): FilterType {
    return this.activeFilter;
  }

  private updateFilterButtons() {
    const consoleActive = this.activeFilter === "console";
    const networkActive = this.activeFilter === "network";

    this.consoleFilterBtn.classList.toggle("filter-active", consoleActive);
    this.consoleFilterBtn.setAttribute(
      "aria-pressed",
      consoleActive.toString(),
    );

    this.networkFilterBtn.classList.toggle("filter-active", networkActive);
    this.networkFilterBtn.setAttribute(
      "aria-pressed",
      networkActive.toString(),
    );
  }
}
