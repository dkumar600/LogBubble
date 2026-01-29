import { logStore } from "../ui/logStore";

const XHR_PATCH_FLAG = "__LOGBUBBLE_XHR_PATCHED__";
const XHR_PATCH_PROP = "__logbubbleXhrPatched";

export function patchXHR(logFn: (msg: string) => void) {
  if (
    typeof window === "undefined" ||
    typeof window.XMLHttpRequest !== "function"
  )
    return;

  const g = globalThis as any;
  if (g[XHR_PATCH_FLAG]) return;
  if ((window.XMLHttpRequest as any)[XHR_PATCH_PROP]) return;
  g[XHR_PATCH_FLAG] = true;

  const OriginalXHR = window.XMLHttpRequest;
  (OriginalXHR as any)[XHR_PATCH_PROP] = true;
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
      if (url && url.includes("/__logbubble/")) return;
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
