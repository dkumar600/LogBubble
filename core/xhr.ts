// xhr.ts
// Patches XMLHttpRequest to log network requests in dev mode (browser/WebView only)

import { logStore } from "../ui/logStore";

export function patchXHR(logFn: (msg: string) => void) {
  if (
    typeof window === "undefined" ||
    typeof window.XMLHttpRequest !== "function"
  )
    return;
  const OriginalXHR = window.XMLHttpRequest;
  function PatchedXHR(this: XMLHttpRequest) {
    const xhr = new OriginalXHR();
    let url = "";
    let method = "";
    let start = 0;
    xhr.open = new Proxy(xhr.open, {
      apply(target, thisArg, args: [string, string | URL, ...any[]]) {
        method = args[0];
        url = typeof args[1] === "string" ? args[1] : args[1].href;
        return Reflect.apply(target, thisArg, args);
      },
    });
    xhr.addEventListener("loadstart", () => {
      start = Date.now();
    });
    xhr.addEventListener("loadend", () => {
      const ms = Date.now() - start;
      const message = `[NET] ${method} ${url} ${xhr.status} ${ms}ms`;
      logFn(message);
      logStore.addLog(message, "xhr");
    });
    return xhr;
  }
  PatchedXHR.prototype = OriginalXHR.prototype;
  window.XMLHttpRequest = PatchedXHR as any;
}
