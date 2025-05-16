const Utils = (function (env) {
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

  function formatTimestamp(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const now = new Date();

    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return "Agora mesmo";
    }

    if (diffMinutes < 60) {
      return diffMinutes === 1
        ? "1 minuto atrás"
        : `${diffMinutes} minutos atrás`;
    }

    if (diffHours < 24) {
      return diffHours === 1 ? "1 hora atrás" : `${diffHours} horas atrás`;
    }

    if (diffDays < 7) {
      const weekdays = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado"
      ];
      const weekday = weekdays[date.getDay()];
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");

      return `${weekday}, ${hour}:${minute}`;
    }

    const month = date
      .toLocaleString(env.languageCode, { month: "short" })
      .replace(/\./, "");

    const day = String(date.getDate()).padStart(2, "0");

    const year = date.getFullYear();
    const currentYear = now.getFullYear();

    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    if (year === currentYear) {
      return `${capitalize(month)} ${day}, ${hour}:${minute}`;
    } else {
      return `${capitalize(month)} ${day}, ${year} ${hour}:${minute}`;
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
    formatTimestamp,
    getFileExtension,
    isElementConnected
  };
})(currentEnvironment);
