const FileManager = (env => {
  function buildFullPath(itemName) {
    const currentPath = AppState.file.pathHistory.join("/");
    return currentPath ? `${currentPath}/${itemName}` : itemName;
  }

  function getSdCard() {
    return env.execute("get_sd_card");
  }

  function parseDirectoryOutput(rawData) {
    const regex = /([df])\s+(\d+)\s+(\d+)\s(.+)/;
    const re = new RegExp(regex, "gm");
    rawData = rawData
      .replace(
        re,
        '{ "name": "$4", "size": $2, "type": "$1", "modified": $3 },'
      )
      .replace(/.$/, "");
    return JSON.parse(`[${rawData}]`);
  }

  function getFileList(directory) {
    const cachedData = CacheManager.get(directory);
    if (cachedData) {
      if (cachedData.subfolderData) {
        AppState.file.subfolderData = cachedData.subfolderData;
      }
      return cachedData.fileData;
    }

    const output = env.execute("list_directory", `"${directory}"`);
    const parsedData = parseDirectoryOutput(output);
    CacheManager.save(directory, parsedData, {});
    return parsedData;
  }

  function processSubfolderCount(directory, subfolder) {
    const cachedCount = AppState.file.subfolderData[subfolder];
    if (cachedCount !== undefined) {
      return Promise.resolve(cachedCount);
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const finalCurrentPath = NavigationManager.getCurrentPath();
        if (directory !== finalCurrentPath) return reject(subfolder);

        const output = env.execute(
          "get_subfolder_item_count",
          `"${directory}/${subfolder}"`
        );
        const itemCount = Number(output);
        AppState.file.subfolderData[subfolder] = itemCount;
        resolve(itemCount);
      }, 0);
    });
  }

  return {
    buildFullPath,
    getSdCard,
    parseDirectoryOutput,
    getFileList,
    processSubfolderCount
  };
})(currentEnvironment);
