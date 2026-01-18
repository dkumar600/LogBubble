// logStore.ts
// Global log store and API for collecting logs from JS

export interface LogEntry {
  timestamp: number;
  message: string;
  type: "fetch" | "xhr" | "dom" | "plugin";
}

class LogStore {
  private logs: LogEntry[] = [];
  private listeners: Array<(log: LogEntry) => void> = [];
  private maxLogs = 500;

  addLog(message: string, type: LogEntry["type"] = "fetch") {
    const log: LogEntry = {
      timestamp: Date.now(),
      message,
      type,
    };

    this.logs.push(log);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(log));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  subscribe(listener: (log: LogEntry) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const logStore = new LogStore();
