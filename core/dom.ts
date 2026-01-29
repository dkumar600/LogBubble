import { logStore } from "../ui/logStore";

const DOM_PATCH_FLAG = "__LOGBUBBLE_DOM_PATCHED__";
const DOM_PATCH_PROP = "__logbubbleDomPatched";

export function patchDOM(logFn: (msg: string) => void) {
  if (typeof window === "undefined") return;

  const g = globalThis as any;
  if (g[DOM_PATCH_FLAG]) return;
  if ((document.createElement as any)[DOM_PATCH_PROP]) return;
  g[DOM_PATCH_FLAG] = true;

  const origCreateElement = document.createElement;
  (origCreateElement as any)[DOM_PATCH_PROP] = true;
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
