const SubfolderQueueManager = (function (env) {
  const MAX_CONCURRENT = 10;

  let directoryQueues = {};
  let activeJobs = 0;
  let pendingCounts = {};
  let subfoldersCache = {};

  function saveCacheToStorage(directoryPath) {
    CacheManager.save(directoryPath, {
      subfolderData: subfoldersCache[directoryPath]
    });
    // console.log(
    //   `[subfoldersCache] Updated cache for directory: ${directoryPath}`
    // );
  }

  function updateUI(subfolder, itemCount, directoryPath) {
    if (NavigationManager.getCurrentPath() !== directoryPath) return;

    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-subfolder="${subfolder}"]`);
      if (element) {
        element.textContent = I18nManager.translatePlural(
          "items_count",
          itemCount
        );
      }
    });
  }

  function executeSubfolderCount(subfolder, directoryPath) {
    const fullPath = `${directoryPath}/${subfolder}`;

    return new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const output = env.execute(
            "get_subfolder_item_count",
            `"${fullPath}"`
          );
          const itemCount = Number(output);
          resolve(itemCount);
        }, 0);
      });
    });
  }

  function findNextQueueItem() {
    const currentPath = NavigationManager.getCurrentPath();

    if (directoryQueues[currentPath]?.length > 0) {
      return directoryQueues[currentPath].shift();
    }

    const paths = Object.keys(directoryQueues);
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (directoryQueues[path].length > 0) {
        return directoryQueues[path].shift();
      }
    }
  }

  function processNext() {
    if (activeJobs >= MAX_CONCURRENT) return;

    const item = findNextQueueItem();
    if (!item) return;

    activeJobs++;

    const { subfolder, directoryPath } = item;

    executeSubfolderCount(subfolder, directoryPath)
      .then(itemCount => {
        subfoldersCache[directoryPath][subfolder] = itemCount;
        updateUI(subfolder, itemCount, directoryPath);
      })
      .catch(error => {
        console.warn(
          `Failed to process subfolder item count for ${subfolder}:`,
          error
        );
      })
      .finally(() => {
        activeJobs--;
        pendingCounts[directoryPath]--;

        // console.log(
        //   `[pendingCounts] ${directoryPath}/${subfolder} = ${pendingCounts[directoryPath]}\n[activeJobs] ${activeJobs}`
        // );

        if (pendingCounts[directoryPath] === 0) {
          saveCacheToStorage(directoryPath);
        }

        processNext();
      });
  }

  function enqueue(subfolder, directoryPath) {
    directoryQueues[directoryPath].push({
      subfolder,
      directoryPath
    });

    pendingCounts[directoryPath]++;

    processNext();
  }

  function initializeDirectory(directoryPath) {
    if (!directoryQueues[directoryPath]) {
      directoryQueues[directoryPath] = [];
    }
    if (!pendingCounts[directoryPath]) {
      pendingCounts[directoryPath] = 0;
    }
    if (!subfoldersCache[directoryPath]) {
      subfoldersCache[directoryPath] = {};
    }
  }

  function loadCachedData(directoryPath) {
    const cachedData = CacheManager.get(directoryPath);
    if (cachedData && cachedData.subfolderData) {
      Object.assign(subfoldersCache[directoryPath], cachedData.subfolderData);
    }
  }

  function processSubfolders(subfolders, isVisibleFn) {
    const currentPath = NavigationManager.getCurrentPath();
    initializeDirectory(currentPath);
    loadCachedData(currentPath);

    subfolders.forEach(subfolder => {
      if (subfoldersCache[currentPath][subfolder] !== undefined) {
        updateUI(
          subfolder,
          subfoldersCache[currentPath][subfolder],
          currentPath
        );
        return;
      }

      enqueue(subfolder, currentPath);
    });
  }

  return {
    processSubfolders
  };
})(currentEnvironment);
