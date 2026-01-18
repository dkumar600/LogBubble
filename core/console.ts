// console.ts
// Patches console methods to log to the network logger UI

import { logStore } from "../ui/logStore";

let isPatching = false;

export function patchConsole() {
  if (typeof window === "undefined" || typeof console === "undefined") return;

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;
  const originalDebug = console.debug;

  console.log = function (...args: any[]) {
    originalLog.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const message = args.map((arg) => formatArg(arg)).join(" ");
      logStore.addLog(`[LOG] ${message}`, "plugin");
      isPatching = false;
    }
  };

  console.warn = function (...args: any[]) {
    originalWarn.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const message = args.map((arg) => formatArg(arg)).join(" ");
      logStore.addLog(`[WARN] ${message}`, "plugin");
      isPatching = false;
    }
  };

  console.error = function (...args: any[]) {
    originalError.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const message = args.map((arg) => formatArg(arg)).join(" ");
      logStore.addLog(`[ERROR] ${message}`, "plugin");
      isPatching = false;
    }
  };

  console.info = function (...args: any[]) {
    originalInfo.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const message = args.map((arg) => formatArg(arg)).join(" ");
      logStore.addLog(`[INFO] ${message}`, "plugin");
      isPatching = false;
    }
  };

  console.debug = function (...args: any[]) {
    originalDebug.apply(console, args);
    if (!isPatching) {
      isPatching = true;
      const message = args.map((arg) => formatArg(arg)).join(" ");
      logStore.addLog(`[DEBUG] ${message}`, "plugin");
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
