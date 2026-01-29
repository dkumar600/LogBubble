import { patchFetch } from "./core/fetch";
import { patchXHR } from "./core/xhr";
import { patchDOM } from "./core/dom";
import { patchConsole } from "./core/console";
import { logUI } from "./ui/logUI";

let isInitialized = false;

const GLOBAL_INIT_FLAG = "__LOGBUBBLE_INITIALIZED__";

function isDev() {
  return (
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev")
  );
}

export function initNetworkLogger() {
  {
    const g = globalThis as any;
    if (g[GLOBAL_INIT_FLAG]) {
      console.warn("[LogBubble] Already initialized, skipping duplicate init");
      return;
    }
    g[GLOBAL_INIT_FLAG] = true;

    if (typeof window !== "undefined") {
      (window as any)[GLOBAL_INIT_FLAG] = true;
    }
  }

  if (isInitialized) {
    console.warn("[LogBubble] Already initialized, skipping duplicate init");
    return;
  }
  isInitialized = true;

  logUI.init();
  patchFetch(() => {});
  patchXHR(() => {});
  patchDOM(() => {});
  patchConsole();
}
if (typeof window !== "undefined") {
  (window as any).initNetworkLogger = initNetworkLogger;
  initNetworkLogger();
}
