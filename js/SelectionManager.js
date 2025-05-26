const SelectionManager = (function (env) {
  function toggleItem(itemName) {
    const fullItemPath = FileManager.buildFullPath(itemName);
    if (AppState.file.selectedItems.has(fullItemPath)) {
      AppState.file.selectedItems.delete(fullItemPath);

      if (AppState.file.selectedItems.size === 0) {
        AppState.toggleSelectionMode(false);
        return;
      }
    } else {
      AppState.file.selectedItems.add(fullItemPath);
    }
    UIRenderer.updateItemCheckbox(itemName);
    EventBus.emit("SELECTION_MODE_CHANGE");
  }

  function toggleAllItems() {
    const itemsToProcess = AppState.ui.searchActive
      ? AppState.file.filteredItems
      : AppState.file.fileSystemData;

    if (!itemsToProcess.length) return;

    const selectedCount = SelectionManager.getSelectedItems().length;
    const totalItems = itemsToProcess.length;

    if (selectedCount === totalItems) {
      AppState.toggleSelectionMode(false);
      return;
    }

    const shouldSelectAll = selectedCount < totalItems;

    itemsToProcess.forEach(fileItem => {
      const fullItemPath = FileManager.buildFullPath(fileItem.name);

      if (shouldSelectAll) {
        AppState.file.selectedItems.add(fullItemPath);
      } else {
        AppState.file.selectedItems.delete(fullItemPath);
      }

      const safeItemName = Utils.escapeIdValue(fileItem.name);
      DOMElements.updateElement(`#check-${safeItemName}`, checkbox => {
        if (checkbox) {
          checkbox.checked = shouldSelectAll;
        }
      });
    });

    EventBus.emit("SELECTION_MODE_CHANGE");
  }

  function getSelectedItems() {
    return Array.from(AppState.file.selectedItems);
  }

  function copySelectedToClipboard() {
    const selectedData = getSelectedItems();
    const count = selectedData.length;

    if (navigator.clipboard && count > 0) {
      navigator.clipboard
        .writeText(selectedData.join(","))
        .then(() => {
          env.notify(I18nManager.translatePlural("copy_success", count));
        })
        .catch(err => {
          env.notify(I18nManager.translate("copy_error"));
        });
    } else {
      env.notify(I18nManager.translate("copy_empty"));
    }
  }

  return {
    toggleItem,
    toggleAllItems,
    getSelectedItems,
    copySelectedToClipboard
  };
})(currentEnvironment);
