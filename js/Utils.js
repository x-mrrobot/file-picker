const Utils = (function () {
  function getExtensionFontSize(extension) {
    const length = extension.length;
    if (length <= 2) return "1.2rem";
    if (length <= 3) return "1rem";
    if (length <= 4) return "0.8rem";
    if (length <= 6) return "0.7rem";
    if (length <= 8) return "0.6rem";
    return "0.4rem";
  }

  function escapeIdValue(value) {
    if (!value) return "";
    return value
      .replace(/\s+/g, "_")
      .replace(/\./g, "dot")
      .replace(/[\[\]()\/\\\'",:;<>=+\-*?!&@#%^$|{}]/g, match => {
        const replacements = {
          "[": "lb",
          "]": "rb",
          "(": "lp",
          ")": "rp",
          "/": "sl",
          "\\": "bs",
          "'": "sq",
          '"': "dq",
          ":": "cl",
          ";": "sc",
          ",": "cm",
          "<": "lt",
          ">": "gt",
          "=": "eq",
          "+": "pl",
          "-": "mn",
          "*": "as",
          "?": "qm",
          "!": "em",
          "&": "am",
          "@": "at",
          "#": "hs",
          "%": "pc",
          "^": "ct",
          $: "dl",
          "|": "vb",
          "{": "lc",
          "}": "rc"
        };
        return replacements[match] || match;
      });
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
    );
  }

  function getFileExtension(filename) {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
  }

  function isElementConnected(element) {
    return element && element.isConnected;
  }

  return {
    getExtensionFontSize,
    escapeIdValue,
    formatBytes,
    getFileExtension,
    isElementConnected
  };
})();
