// webpack-logbubble-plugin.js
// Webpack plugin to auto-inject LogBubble's init into the entry point
const path = require("path");

class LogBubbleWebpackPlugin {
  apply(compiler) {
    compiler.hooks.entryOption.tap(
      "LogBubbleWebpackPlugin",
      (context, entry) => {
        const logBubbleInit = path.resolve(__dirname, "./init.ts");
        if (typeof entry === "string") {
          compiler.options.entry = [logBubbleInit, entry];
        } else if (Array.isArray(entry)) {
          compiler.options.entry = [logBubbleInit, ...entry];
        } else if (typeof entry === "object") {
          for (const key in entry) {
            if (Array.isArray(entry[key])) {
              entry[key].unshift(logBubbleInit);
            } else {
              entry[key] = [logBubbleInit, entry[key]];
            }
          }
          compiler.options.entry = entry;
        }
      },
    );
  }
}

module.exports = LogBubbleWebpackPlugin;
