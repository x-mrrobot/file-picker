const EventManager = (function (env) {
  function setupEventListeners() {
    const dom = DOMElements;
    let scrollTimer = null;

    dom.currentPath.addEventListener("click", () => {
      const pathItem = event.target.closest("[data-index]");
      if (!pathItem) return;

      const pathIndex = pathItem.dataset.index;
      NavigationManager.goToPathIndex(Number(pathIndex));
    });
    dom.backButton.addEventListener("click", () => NavigationManager.goBack());

    dom.fileList.addEventListener("click", event => {
      const fileItem = event.target.closest(".item-entry");
      if (!fileItem) return;

      const itemName = fileItem.getAttribute("data-name");

      if (AppState.ui.selectionMode) {
        SelectionManager.toggleItem(itemName);
        return;
      }
      if (fileItem.classList.contains("folder")) {
        NavigationManager.goToFolder(itemName);
      }
    });

    dom.fileList.addEventListener("contextmenu", event => {
      event.preventDefault();
      const fileItem = event.target.closest(".item-entry");
      if (!fileItem) return;

      const isDirectory = fileItem.classList.contains("folder");

      if (isDirectory) {
        const itemName = fileItem.getAttribute("data-name");
        const fullPath = FileManager.buildFullPath(itemName);
        const isCurrentlyPinned = AppState.isPinned(fullPath);

        if (isCurrentlyPinned) {
          if (confirm(I18nManager.translate("unpin_directory_confirm", { name: itemName }))) {
            AppState.removePinnedItem(fullPath);
          }
        } else {
          if (confirm(I18nManager.translate("pin_directory_confirm", { name: itemName }))) {
            AppState.addPinnedItem(fullPath);
          }
        }
      } else {
        // Original context menu behavior for files
        if (!AppState.ui.selectionMode) {
          SelectionManager.toggleMode();
        }
        const itemName = fileItem.dataset.name;
        SelectionManager.toggleItem(itemName);
      }
    });

    dom.storageContainer.addEventListener("click", event => {
      const storageDevice = event.target.closest(".storage-device");
      if (storageDevice) {
        const storagePath = storageDevice.getAttribute("data-storage");
        AppState.setPathHistory([storagePath]);
        NavigationManager.navigateToPath(storagePath);
      }
    });

    dom.sortButton.addEventListener("click", () => {
      dom.sortDropdown.classList.toggle("show");
      if (dom.sortDropdown.classList.contains("show")) {
        const currentSort = SortManager.getSortPreference();
        const buttons = dom.sortDropdown.querySelectorAll("button");
        buttons.forEach(button => {
          button.classList.remove("active");
          if (button.dataset.sort === currentSort) {
            button.classList.add("active");
          }
        });
        UIRenderer.toggleOverlay(true);
      } else {
        UIRenderer.toggleOverlay(false);
      }
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

    dom.fileList.addEventListener("scroll", function () {
      dom.fileList.classList.add("scrolling");

      clearTimeout(scrollTimer);

      scrollTimer = setTimeout(function () {
        dom.fileList.classList.remove("scrolling");
      }, 1000);
    });

    dom.selectionCounter.addEventListener("click", () => {
      SelectionManager.toggleAllItems();
    });

    dom.selectButton.addEventListener("click", () => {
      const selectedItems = SelectionManager.getSelectedItems();
      env.submitSelection(selectedItems);
    });

    dom.selectionToggle.addEventListener("click", () => {
      SelectionManager.toggleMode();
    });

    dom.copyButton.addEventListener("click", () => {
      SelectionManager.copySelectedToClipboard();
    });

    dom.searchButton.addEventListener("click", () => {
      SearchManager.openSearch();
    });

    dom.closeSearchButton.addEventListener("click", () => {
      SearchManager.closeSearch();
    });

    dom.searchInput.addEventListener("input", event => {
      const filteredItems = SearchManager.filterItems(event.target.value);
      AppState.setFilteredItems(filteredItems);
    });
  }

  return {
    setupEventListeners
  };
})(currentEnvironment);
