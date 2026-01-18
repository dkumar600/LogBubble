// dom.ts
// (Optional) Patch dynamic <script> and <link> loading for network logging

import { logStore } from "../ui/logStore";

export function patchDOM(logFn: (msg: string) => void) {
  if (typeof window === "undefined") return;
  const origCreateElement = document.createElement;
  document.createElement = function (
    this: Document,
    tag: string,
    options?: ElementCreationOptions,
  ) {
    const el = origCreateElement.call(this, tag, options);
    if (tag === "script" || tag === "link") {
      el.addEventListener("load", function () {
        const src =
          (el as HTMLScriptElement).src || (el as HTMLLinkElement).href;
        const message = `[NET] ${tag.toUpperCase()} ${src} LOADED`;
        logFn(message);
        logStore.addLog(message, "dom");
      });
      el.addEventListener("error", function () {
        const src =
          (el as HTMLScriptElement).src || (el as HTMLLinkElement).href;
        const message = `[NET] ${tag.toUpperCase()} ${src} ERROR`;
        logFn(message);
        logStore.addLog(message, "dom");
      });
    }
    return el;
  } as typeof document.createElement;
}
