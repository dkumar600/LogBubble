// fetch.ts
// Patches window.fetch to log network requests in dev mode (browser/WebView only)

import { logStore } from "../ui/logStore";

export function patchFetch(logFn: (msg: string) => void) {
  if (typeof window === "undefined" || typeof window.fetch !== "function")
    return;
  const originalFetch = window.fetch;
  window.fetch = async function (
    this: typeof globalThis,
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    const method =
      (init && init.method) ||
      (typeof input === "object" && "method" in input && input.method) ||
      "GET";
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const start = Date.now();
    try {
      const response = await originalFetch.call(this, input, init);
      const ms = Date.now() - start;
      const message = `[NET] ${method} ${url} ${response.status} ${ms}ms`;
      logFn(message);
      logStore.addLog(message, "fetch");
      return response;
    } catch (err) {
      const ms = Date.now() - start;
      const message = `[NET] ${method} ${url} ERROR ${ms}ms`;
      logFn(message);
      logStore.addLog(message, "fetch");
      throw err;
    }
  } as typeof window.fetch;
}
