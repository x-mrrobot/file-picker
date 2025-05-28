const FileManager = (function (env) {
  function buildFullPath(itemName) {
    const currentPath = AppState.file.pathHistory.join("/");
    return currentPath ? `${currentPath}/${itemName}` : itemName;
  }

  function getSdCardPath() {
    return env.execute("get_sd_card_path");
  }

  function parseDirectoryOutput(rawData) {
    const regex = /([df])\s+(\d+)\s+(\d+)\s(.+)/gm;
    const transformedData = rawData
      .replace(
        regex,
        '{ "name": "$4", "size": $2, "type": "$1", "modified": $3 },'
      )
      .replace(/.$/, "");
    return JSON.parse(`[${transformedData}]`);
  }

  function saveToCache(directory, fileData, sortPreference) {
    CacheManager.save(directory, {
      fileData,
      sortPreference
    });
  }

  function handleCachedData(directory, cachedData, currentSortPreference) {
    if (cachedData.sortPreference === currentSortPreference) {
      return cachedData.fileData;
    }

    const reSortedData = SortManager.sortItems(cachedData.fileData);
    saveToCache(directory, reSortedData, currentSortPreference);

    return reSortedData;
  }

  function fetchAndProcessData(directory, currentSortPreference) {
    const output = env.execute("list_directory", `"${directory}"`);
    const parsedData = parseDirectoryOutput(output);
    const sortedData = SortManager.sortItems(parsedData);

    saveToCache(directory, sortedData, currentSortPreference);

    return sortedData;
  }

  function getFileSystemData(directory) {
    const cachedData = CacheManager.get(directory);
    const isForcedRefresh = PullToRefreshManager.getIsRefreshing();
    const currentSortPreference = SortManager.getSortPreference();

    if (!isForcedRefresh && cachedData?.fileData) {
      return handleCachedData(directory, cachedData, currentSortPreference);
    }

    return fetchAndProcessData(directory, currentSortPreference);
  }

  return {
    buildFullPath,
    getSdCardPath,
    getFileSystemData
  };
})(currentEnvironment);
