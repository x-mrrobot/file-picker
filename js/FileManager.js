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
      return cachedData.fileData;
    }

    const output = env.execute("list_directory", `"${directory}"`);
    const parsedData = parseDirectoryOutput(output);
    CacheManager.save(directory, parsedData, {});
    return parsedData;
  }

  return {
    buildFullPath,
    getSdCard,
    parseDirectoryOutput,
    getFileList
  };
})(currentEnvironment);
