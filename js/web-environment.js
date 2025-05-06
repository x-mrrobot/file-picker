const webEnvironment = {
  name: "web",

  execute(cmd, ...args) {
    const commands = {
      get_sd_card: () => "/storage/E4F1-7FD9",
      list_directory: () => fileSystemData,
      get_subfolder_item_count: dir => {
        const path = (dir || "").replaceAll('"', "");
        const base = path.replace(/\/.+\//g, "");
        return subfolderData[base] || 0;
      }
    };
    const fn = commands[cmd];

    if (!fn) return;
    return fn(...args);
  },

  terminate() {
    alert(I18nManager.translate("app_close"));
    CacheManager.clear();
  },

  submitSelection(items) {
    const msg = I18nManager.translate("items_selected");
    const formattedItems = items.join("\n");
    alert(`${msg}\n\n${formattedItems}`);
  }
};
