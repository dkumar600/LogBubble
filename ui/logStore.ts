export interface LogEntry {
  key: string;
  timestamp: number;
  message: string;
  type: "fetch" | "xhr" | "dom" | "plugin" | "console";
  category: "console" | "network";
  isCritical?: boolean;
  count?: number;
}

const MAX_LOG_SIZE = 20 * 1024; // 20 KB

class LogStore {
  private logs: LogEntry[] = [];
  private listeners: Array<(log: LogEntry) => void> = [];
  private maxLogs = 500;
  private recentNetworkLogs = new Map<string, { log: LogEntry; ts: number }>();
  private nextKeyId = 0;

  private networkDedupeKey(message: string): string | null {
    if (!message.startsWith("[NET] ")) return null;

    const rest = message.slice(6).trim();
    const parts = rest.split(/\s+/);
    if (parts.length < 4) return null;

    const method = parts[0];
    const msToken = parts[parts.length - 1];
    const statusToken = parts[parts.length - 2];
    const url = parts.slice(1, parts.length - 2).join(" ");

    if (!msToken.endsWith("ms")) return null;
    if (!method || !url || !statusToken) return null;

    return `${method} ${url} ${statusToken}`;
  }

  private shouldCollapseDuplicate(
    lastLog: LogEntry | undefined,
    message: string,
    type: LogEntry["type"],
    category: LogEntry["category"],
    ts: number,
  ): boolean {
    if (!lastLog) return false;
    if (lastLog.category !== category) return false;

    if (category !== "network") {
      return (
        lastLog.message === message &&
        lastLog.type === type &&
        lastLog.category === category
      );
    }

    const lastKey = this.networkDedupeKey(lastLog.message);
    const key = this.networkDedupeKey(message);
    if (!lastKey || !key) {
      return lastLog.message === message && lastLog.category === category;
    }

    const dt = Math.abs(ts - lastLog.timestamp);
    return lastKey === key && dt <= 750;
  }

  /**
   * Estimates payload size without stringifying.
   * Handles nested objects, arrays, circular references, and deep nesting.
   */
  private estimatePayloadSize(
    payload: any,
    seen: WeakSet<object> = new WeakSet(),
    depth: number = 0,
    maxDepth: number = 50,
  ): number {
    if (depth > maxDepth) return 1000;

    // Primitives
    if (payload === null || payload === undefined) return 4;
    if (typeof payload === "string") return payload.length * 2;
    if (typeof payload === "number") return 8;
    if (typeof payload === "boolean") return 4;
    if (typeof payload === "function") return 0;

    // Circular reference protection
    if (typeof payload === "object") {
      if (seen.has(payload)) return 0;
      seen.add(payload);
    }

    // Arrays - recursive
    if (Array.isArray(payload)) {
      let size = 16;
      for (let i = 0; i < payload.length; i++) {
        size += this.estimatePayloadSize(payload[i], seen, depth + 1, maxDepth);
        if (size > MAX_LOG_SIZE) return size;
      }
      return size;
    }

    // Objects - recursive
    if (typeof payload === "object") {
      let size = 16;

      if (payload instanceof Error) {
        return (
          (payload.name + payload.message + (payload.stack || "")).length * 2
        );
      }
      if (payload instanceof Date) return 8;
      if (payload instanceof RegExp) return payload.source.length * 2;

      for (const key in payload) {
        if (payload.hasOwnProperty(key)) {
          size += key.length * 2;
          size += this.estimatePayloadSize(
            payload[key],
            seen,
            depth + 1,
            maxDepth,
          );
          if (size > MAX_LOG_SIZE) return size;
        }
      }
      return size;
    }

    return 100;
  }

  addLog(payload: any, type: LogEntry["type"] = "fetch") {
    const ts = Date.now();
    const category = type === "console" ? "console" : "network";

    const size = this.estimatePayloadSize(payload);
    const isCritical = size > MAX_LOG_SIZE;

    const message = isCritical
      ? `[CRITICAL] : Large payload (${(size / 1024).toFixed(1)}KB) — payload omitted`
      : typeof payload === "string"
        ? payload
        : JSON.stringify(payload);

    const key = `${ts}-${this.nextKeyId++}`;

    if (category === "network") {
      const key = this.networkDedupeKey(message);
      if (key) {
        const recent = this.recentNetworkLogs.get(key);
        if (recent) {
          const dt = Math.abs(ts - recent.ts);
          if (dt <= 750) {
            recent.log.count = (recent.log.count || 1) + 1;
            recent.log.timestamp = ts;
            this.recentNetworkLogs.set(key, { log: recent.log, ts });
            this.listeners.forEach((cb) => cb(recent.log));
            return;
          }
          this.recentNetworkLogs.delete(key);
        }
      }
    }

    const lastLog = this.logs[this.logs.length - 1];
    if (this.shouldCollapseDuplicate(lastLog, message, type, category, ts)) {
      lastLog.count = (lastLog.count || 1) + 1;
      lastLog.timestamp = ts;
      this.listeners.forEach((cb) => cb(lastLog));
      return;
    }

    const log: LogEntry = {
      key,
      timestamp: ts,
      message,
      type,
      category,
      isCritical: isCritical || undefined,
      count: 1,
    };

    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      const removed = this.logs.shift();
      if (removed && removed.category === "network") {
        for (const [key, entry] of this.recentNetworkLogs) {
          if (entry.log === removed) {
            this.recentNetworkLogs.delete(key);
          }
        }
      }
    }

    if (category === "network") {
      const key = this.networkDedupeKey(message);
      if (key) {
        this.recentNetworkLogs.set(key, { log, ts });
      }
    }

    this.listeners.forEach((listener) => listener(log));
  }

  getLogs(filterCategory?: "console" | "network"): LogEntry[] {
    if (filterCategory) {
      return this.logs.filter((log) => log.category === filterCategory);
    }
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
