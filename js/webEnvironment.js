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
      },
      get_file_content_base64: function (filePath) {
        console.log(`WEB_ENV_MOCK: get_file_content_base64 for ${filePath}`);
        // For web testing, return a placeholder base64 image string.
        // This is a 1x1 transparent PNG.
        // Consider adding more mock images by extension if useful for testing.
        // For example, check filePath extension and return a specific base64 for .jpg, .png.
        // For now, a single placeholder is fine.
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
          // A tiny sample JPEG (e.g., a 1x1 red pixel)
          return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYEBAYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8QQKKKKAP/2Q==";
        } else if (filePath.endsWith('.png')) {
          // A tiny sample PNG (e.g., a 1x1 blue pixel)
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==";
        }
        // Default: 1x1 transparent PNG
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
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

  notify(message) {
    alert(message);
  },

  submitSelection(items) {
    const selectedMessage = I18nManager.translate("items_selected");
    const formattedItems = items.join("\n");
    alert(`${selectedMessage}\n\n${formattedItems}`);
  }
};
