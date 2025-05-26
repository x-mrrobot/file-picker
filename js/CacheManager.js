const CacheManager = (function () {
  const FILE_PIKER_KEY = "@file-picker";

  const config = {
    enabled: true,
    maxEntries: 20,
    expirationTime: 5 * 60 * 1000
  };

  function getCache() {
    return JSON.parse(localStorage.getItem(FILE_PIKER_KEY) || "{}");
  }

  function saveCache(cacheData) {
    localStorage.setItem(FILE_PIKER_KEY, JSON.stringify(cacheData));
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
    return entry;
  }

  function save(path, data) {
    if (!config.enabled) return;

    const cache = getCache();

    cache[path] = Object.assign(cache[path] || {}, data);

    const entries = Object.entries(cache)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, config.maxEntries);

    saveCache(Object.fromEntries(entries));
  }

  function updateCacheEntry(path, subfolderData) {
    if (!config.enabled) return;

    const cache = getCache();

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
      localStorage.removeItem(FILE_PIKER_KEY);
    }
  }

  return {
    get,
    save,
    updateCacheEntry,
    clear
  };
})();
