const FileManager = (env => {
  function buildFullPath(itemName) {
    const currentPath = AppState.file.pathHistory.join("/");
    return currentPath ? `${currentPath}/${itemName}` : itemName;
  }

  function getSdCardPath() {
    return env.execute("get_sd_card_path");
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

  function getFileSystemData(directory) {
    const cachedData = CacheManager.get(directory);
    if (cachedData) {
      return cachedData.fileData;
    }

    const output = env.execute("list_directory", `"${directory}"`);
    const parsedData = parseDirectoryOutput(output);
    const sortedData = SortManager.sortItems(parsedData);

    return sortedData;
  }

  return {
    buildFullPath,
    getSdCardPath,
    getFileSystemData
  };
})(currentEnvironment);
