const AppState = (function () {
  const state = {
    file: {
      storagePaths: ["/storage/emulated/0"],
      pathHistory: [],
      fileSystemData: [],
      selectedItems: new Set(),
      filteredItems: [],
      pinnedItems: new Set()
    },
    ui: {
      selectionMode: false,
      currentPage: 1,
      pageSize: 12,
      searchActive: false
    }
  };

  const listeners = new Map();

  function on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(callback);
  }

  function emit(event, data) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(callback => callback(data));
    }
  }

  function setPathHistory(history) {
    state.file.pathHistory = history;
    emit("PATH_HISTORY_CHANGE");
  }

  function addStoragePath(path) {
    state.file.storagePaths.push(path);
  }

  function clearSelectedItems() {
    state.file.selectedItems.clear();
    emit("SELECTION_CHANGE");
  }

  function resetPage() {
    state.ui.currentPage = 1;
  }

  function setFileSystemData(data) {
    state.file.fileSystemData = data;
    state.file.filteredItems = data;
    emit("FILE_SYSTEM_CHANGE");
  }

  function toggleSelectionMode(force) {
    state.ui.selectionMode =
      force !== undefined ? force : !state.ui.selectionMode;

    if (!state.ui.selectionMode) {
      state.file.selectedItems.clear();
    }

    emit("SELECTION_MODE_CHANGE");
  }

  function toggleSearchMode(active) {
    state.ui.searchActive =
      active !== undefined ? active : !state.ui.searchActive;
    emit("SEARCH_MODE_CHANGE", state.ui.searchActive);
  }

  function setFilteredItems(items) {
    state.file.filteredItems = items;
    emit("FILTERED_ITEMS_CHANGE");
  }

  function addPinnedItem(filePath) {
    state.file.pinnedItems.add(filePath);
    emit("PINNED_ITEMS_CHANGE");
  }

  function removePinnedItem(filePath) {
    state.file.pinnedItems.delete(filePath);
    emit("PINNED_ITEMS_CHANGE");
  }

  function isPinned(filePath) {
    return state.file.pinnedItems.has(filePath);
  }

  return {
    ...state,
    on,
    emit,
    setPathHistory,
    addStoragePath,
    clearSelectedItems,
    resetPage,
    setFileSystemData,
    toggleSelectionMode,
    toggleSearchMode,
    setFilteredItems,
    addPinnedItem,
    removePinnedItem,
    isPinned
  };
})();
