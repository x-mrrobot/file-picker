const EventManager = (function (env, dom) {
  function setupEventBusListeners() {
    EventBus.on("STORAGE_DEVICES_CHANGE", storageDevices => {
      UIRenderer.displayStorageDevices(storageDevices);
    });

    EventBus.on("FILE_SYSTEM_CHANGE", (fileData, directory) => {
      FileListRenderer.renderFileList();
      CacheManager.save(directory, { fileData });
    });

    EventBus.on("FILTERED_ITEMS_CHANGE", () => {
      FileListRenderer.renderFileList();
    });

    EventBus.on("PATH_HISTORY_CHANGE", () => {
      UIRenderer.updateActiveStorageDevice();
      UIRenderer.updatePathDisplay();
    });

    EventBus.on("SELECTION_MODE_CHANGE", () => {
      UIRenderer.updateSelectionDisplay();
      UIRenderer.updateSelectionCounter();
    });

    EventBus.on("SEARCH_MODE_CHANGE", searchMode => {
      UIRenderer.updateSearchUI(searchMode);
    });

    EventBus.on("SORT_PREFERENCE_CHANGE", sortPreference => {
      UIRenderer.updateActiveSortButton(sortPreference);
      SortManager.sortAndUpdateFileList();
    });
  }

  function setupNavigationEvents() {
    dom.currentPath.addEventListener("click", event => {
      const pathItem = event.target.closest("[data-index]");
      if (!pathItem) return;

      const pathIndex = parseInt(pathItem.dataset.index, 10);
      NavigationManager.goToPathIndex(pathIndex);
    });

    dom.backButton.addEventListener("click", () => NavigationManager.goBack());

    dom.storageContainer.addEventListener("click", event => {
      const storageDevice = event.target.closest(".storage-device");
      if (storageDevice) {
        const storagePath = storageDevice.dataset.storage;
        AppState.setPathHistory([storagePath]);
        NavigationManager.navigateToPath(storagePath);
      }
    });
  }

  function setupSearchEvents() {
    let searchTimer = null;

    dom.searchButton.addEventListener("click", () => {
      SearchManager.openSearch();
    });

    dom.closeSearchButton.addEventListener("click", () => {
      SearchManager.closeSearch();
    });

    dom.searchInput.addEventListener("input", event => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const filteredItems = SearchManager.filterItems(event.target.value);
        AppState.setFilteredItems(filteredItems);
      }, 500);
    });
  }

  function setupSortingEvents() {
    dom.sortButton.addEventListener("click", () => {
      dom.sortDropdown.classList.toggle("show");
      UIRenderer.toggleOverlay(true);
    });

    dom.sortDropdown.addEventListener("click", event => {
      const targetButton = event.target.closest("button[data-sort]");
      if (targetButton) {
        const sortType = targetButton.dataset.sort;
        SortManager.setSortPreference(sortType);
        dom.sortDropdown.classList.remove("show");
        UIRenderer.toggleOverlay(false);
      }
    });

    dom.overlay.addEventListener("click", () => {
      dom.sortDropdown.classList.remove("show");
      UIRenderer.toggleOverlay(false);
    });
  }

  function setupFileListEvents() {
    let scrollTimer = null;

    dom.fileList.addEventListener("click", event => {
      const fileItem = event.target.closest(".item-entry");
      if (!fileItem) return;

      const itemName = fileItem.dataset.name;

      if (AppState.ui.selectionMode) {
        SelectionManager.toggleItem(itemName);
        return;
      }

      if (fileItem.classList.contains("folder")) {
        NavigationManager.goToFolder(itemName);
      } else {
        AppState.toggleSelectionMode(true);
        SelectionManager.toggleItem(itemName);
      }
    });

    dom.fileList.addEventListener("contextmenu", event => {
      event.preventDefault();
      const fileItem = event.target.closest(".item-entry");
      if (!fileItem) return;

      if (!AppState.ui.selectionMode) {
        AppState.toggleSelectionMode(true);
      }

      const itemName = fileItem.dataset.name;
      SelectionManager.toggleItem(itemName);
    });

    dom.fileList.addEventListener("scroll", () => {
      dom.fileList.classList.add("scrolling");
      clearTimeout(scrollTimer);

      scrollTimer = setTimeout(() => {
        dom.fileList.classList.remove("scrolling");
      }, 1000);
    });
  }

  function setupSelectionEvents() {
    dom.selectionCounter.addEventListener("click", () => {
      SelectionManager.toggleAllItems();
    });

    dom.selectButton.addEventListener("click", () => {
      const selectedItems = SelectionManager.getSelectedItems();
      env.submitSelection(selectedItems);
    });

    dom.selectionToggle.addEventListener("click", () => {
      AppState.toggleSelectionMode();
    });

    dom.copyButton.addEventListener("click", () => {
      SelectionManager.copySelectedToClipboard();
    });
  }

  function setupEventListeners() {
    setupEventBusListeners();
    setupNavigationEvents();
    setupSearchEvents();
    setupSortingEvents();
    setupFileListEvents();
    setupSelectionEvents();
  }

  return {
    setupEventListeners
  };
})(currentEnvironment, DOMElements);
