const webEnvironment = {
  name: "web",
  languageCode: "en-US",
  darkThemeEnabled: true,

  execute(cmd, ...args) {
    const commands = {
      get_sd_card: function () {
        return "/storage/E4F1-7FD9";
      },
      list_directory: function () {
        return directoryStructure;
      },
      get_subfolder_item_count: function (dir = "") {
        const path = dir.replaceAll('"', "");
        const base = path.replace(/\/.+\//g, "");
        return folderItemCount[base] || 0;
      }
    };

    const fn = commands[cmd];
    if (!fn) {
      throw new Error(`Invalid command: ${cmd}`);
    }

    return fn(...args);
  },
  terminate() {
    alert(I18nManager.translate("app_close"));
    CacheManager.clear();
  },
  submitSelection(items) {
    const selectedMessage = I18nManager.translate("items_selected");
    const formattedItems = items.join("\n");
    alert(`${selectedMessage}\n\n${formattedItems}`);
  }
};
