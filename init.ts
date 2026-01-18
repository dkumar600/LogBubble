// init.ts
// Entry point for web-only dev-network-logger
import { patchFetch } from "./core/fetch";
import { patchXHR } from "./core/xhr";
import { patchDOM } from "./core/dom";
import { patchConsole } from "./core/console";
import { logUI } from "./ui/logUI";

let isInitialized = false;

function isDev() {
  return (
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev")
  );
}

export function initNetworkLogger() {
  if (isInitialized) {
    console.warn("[LogBubble] Already initialized, skipping duplicate init");
    return;
  }
  isInitialized = true;

  logUI.init();
  // Patch fetch/XHR/DOM/Console in dev mode
  patchFetch(() => {});
  patchXHR(() => {});
  patchDOM(() => {});
  patchConsole();
}

// Auto-init for browser
if (typeof window !== "undefined") {
  (window as any).initNetworkLogger = initNetworkLogger;
  // Optionally auto-init in dev
  // if (isDev()) {
  initNetworkLogger();
  // }
}
