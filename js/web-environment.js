const webEnvironment = {
  name: "web",
  executeCommand(command, ...params) {
    switch (command) {
      case "get_sd_card":
        return "/storage/E4F1-7FD9";
      case "list_directory":
        return fileSystemData;
      case "get_subfolder_item_count":
        const dir = params[0].replaceAll('"', "");
        const baseDir = dir.replace(/\/.+\//g, "");
        return subfolderData[baseDir];
    }
  },
  exitApplication(clearCache) {
    Logger.debug("EnvironmentManager", "Fechando aplicação...");
    clearCache();
  },
  returnSelectedItems(selectedItems) {
    Logger.debug(
      "EnvironmentManager",
      `Retornando items selecionados: ${selectedItems.join("|||")}`
    );
  }
};
