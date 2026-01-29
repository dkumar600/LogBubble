// console.ts
// Patches console methods to log to the network logger UI

import { logStore } from "../ui/logStore";

let isPatching = false;

const CONSOLE_PATCH_FLAG = "__LOGBUBBLE_CONSOLE_PATCHED__";
const CONSOLE_PATCH_PROP = "__logbubbleConsolePatched";

export function patchConsole() {
  if (typeof window === "undefined" || typeof console === "undefined") return;

  const g = globalThis as any;
  if (g[CONSOLE_PATCH_FLAG]) return;
  if ((console as any)[CONSOLE_PATCH_PROP]) return;
  g[CONSOLE_PATCH_FLAG] = true;
  (console as any)[CONSOLE_PATCH_PROP] = true;

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;
  const originalDebug = console.debug;

  console.log = function (...args: any[]) {
    originalLog.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const payload = args.length === 1 ? args[0] : args;
      logStore.addLog(payload, "console");
      isPatching = false;
    }
  };

  console.warn = function (...args: any[]) {
    originalWarn.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const payload = args.length === 1 ? args[0] : args;
      logStore.addLog(payload, "console");
      isPatching = false;
    }
  };

  console.error = function (...args: any[]) {
    originalError.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const payload = args.length === 1 ? args[0] : args;
      logStore.addLog(payload, "console");
      isPatching = false;
    }
  };

  console.info = function (...args: any[]) {
    originalInfo.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const payload = args.length === 1 ? args[0] : args;
      logStore.addLog(payload, "console");
      isPatching = false;
    }
  };

  console.debug = function (...args: any[]) {
    originalDebug.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const payload = args.length === 1 ? args[0] : args;
      logStore.addLog(payload, "console");
      isPatching = false;
    }
  };
}

function formatArg(arg: any): string {
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  if (typeof arg === "string") return arg;
  if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}
