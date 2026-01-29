// vite-logbubble-plugin.ts
// Vite plugin to auto-inject LogBubble's init into the main entry file
import type { Plugin } from "vite";

const logBubblePlugin = (): Plugin => {
  return {
    name: "vite-logbubble",
    enforce: "pre",
    transform(code, id) {
      // Only inject into main entry files
      if (
        id.endsWith("main.ts") ||
        id.endsWith("main.js") ||
        id.endsWith("main.jsx") ||
        id.endsWith("main.tsx")
      ) {
        const inject = `import 'logbubble';\n`;
        if (!code.includes("initNetworkLogger")) {
          return inject + code;
        }
      }
      return code;
    },
  };
};

export default logBubblePlugin;
