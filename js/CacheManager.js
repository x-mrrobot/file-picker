const CacheManager = (function () {
  const config = {
    enabled: true,
    maxEntries: 20,
    expirationTime: 5 * 60 * 1000
  };

  function getCache() {
    return JSON.parse(localStorage.getItem("@file-picker") || "{}");
  }

  function saveCache(cacheData) {
    localStorage.setItem("@file-picker", JSON.stringify(cacheData));
  }

  function isValid(path) {
    if (!config.enabled) return false;
    const cache = getCache();
    const entry = cache[path];
    return entry && Date.now() - entry.timestamp < config.expirationTime;
  }

  function get(path) {
    if (!config.enabled || !isValid(path)) return null;
    const entry = getCache()[path];
    return entry
      ? { fileData: entry.fileData, subfolderData: entry.subfolderData }
      : null;
  }

  function save(path, fileData, subfolderData = {}) {
    if (!config.enabled) return;

    const cache = getCache();

    cache[path] = {
      fileData,
      subfolderData,
      timestamp: Date.now()
    };

    const entries = Object.entries(cache)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, config.maxEntries);

    saveCache(Object.fromEntries(entries));
  }

  function updateCacheEntry(path, subfolderData) {
    if (!config.enabled) return;

    const cache = getCache();

    if (!cache[path]) {
      cache[path] = {
        fileData: null,
        subfolderData: {},
        timestamp: Date.now()
      };
    }

    cache[path].subfolderData = subfolderData;
    cache[path].timestamp = Date.now();

    saveCache(cache);
  }

  function clear(specificPath = null) {
    if (specificPath) {
      const cache = getCache();
      if (cache[specificPath]) {
        delete cache[specificPath];
        saveCache(cache);
      }
    } else {
      localStorage.removeItem("@file-picker");
    }
  }

  return {
    get,
    save,
    updateCacheEntry,
    clear,
    isValid
  };
})();
