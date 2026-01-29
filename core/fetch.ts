import { logStore } from "../ui/logStore";

const FETCH_PATCH_FLAG = "__LOGBUBBLE_FETCH_PATCHED__";
const FETCH_PATCH_PROP = "__logbubbleFetchPatched";

export function patchFetch(logFn: (msg: string) => void) {
  if (typeof window === "undefined" || typeof window.fetch !== "function")
    return;

  const g = globalThis as any;
  if (g[FETCH_PATCH_FLAG]) return;
  if ((window.fetch as any)[FETCH_PATCH_PROP]) return;
  g[FETCH_PATCH_FLAG] = true;

  const originalFetch = window.fetch;
  (originalFetch as any)[FETCH_PATCH_PROP] = true;
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

    if (typeof url === "string" && url.includes("/__logbubble/")) {
      return originalFetch.call(this, input as any, init);
    }
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
