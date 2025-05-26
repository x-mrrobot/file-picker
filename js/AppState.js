const AppState = (function () {
  const state = {
    file: {
      storageDevices: [],
      pathHistory: [],
      fileSystemData: [],
      selectedItems: new Set(),
      filteredItems: []
    },
    ui: {
      selectionMode: false,
      currentPage: 1,
      pageSize: 15,
      searchActive: false
    }
  };

  function setStorageDevices(storageDevices) {
    state.file.storageDevices = storageDevices;
    EventBus.emit("STORAGE_DEVICES_CHANGE", storageDevices);
  }

  function setPathHistory(history) {
    state.file.pathHistory = history;
    EventBus.emit("PATH_HISTORY_CHANGE");
  }

  function clearSelectedItems() {
    state.file.selectedItems.clear();
    EventBus.emit("SELECTION_MODE_CHANGE");
  }

  function resetPage() {
    state.ui.currentPage = 1;
  }

  function setFileSystemData(data, directory) {
    state.file.fileSystemData = data;
    state.file.filteredItems = data;
    EventBus.emit("FILE_SYSTEM_CHANGE", data, directory);
  }

  function toggleSelectionMode(force) {
    state.ui.selectionMode =
      force !== undefined ? force : !state.ui.selectionMode;

    if (!state.ui.selectionMode) {
      state.file.selectedItems.clear();
    }

    EventBus.emit("SELECTION_MODE_CHANGE");
  }

  function toggleSearchMode(force) {
    state.ui.searchActive = force;
    EventBus.emit("SEARCH_MODE_CHANGE", force);
  }

  function setFilteredItems(items) {
    state.file.filteredItems = items;
    EventBus.emit("FILTERED_ITEMS_CHANGE");
  }

  return {
    ...state,
    setStorageDevices,
    setPathHistory,
    clearSelectedItems,
    resetPage,
    setFileSystemData,
    toggleSelectionMode,
    toggleSearchMode,
    setFilteredItems
  };
})();
