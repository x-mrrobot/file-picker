const UIRenderer = (function () {
  function updateActiveStorageDevice() {
    const currentPath = NavigationManager.getCurrentPath();
    const storageDevices = document.querySelectorAll(".storage-device");

    storageDevices.forEach(device => {
      const devicePath = device.dataset.storage;

      if (currentPath.startsWith(devicePath)) {
        device.classList.add("active");
      } else {
        device.classList.remove("active");
      }
    });
  }

  function updateSubfolderCount(subfolder, itemCount) {
    DOMElements.updateElement(`[data-subfolder="${subfolder}"]`, element => {
      element.textContent = I18nManager.translatePlural(
        "items_count",
        itemCount
      );
    });
  }

  function renderStorageData(storagePath) {
    const isInternalStorage = storagePath.includes("emulated/0");

    const deviceData = {
      title: isInternalStorage
        ? I18nManager.translate("internal_storage")
        : I18nManager.translate("sd_card"),
      icon: isInternalStorage ? "fa-mobile" : "fa-sd-card",
      className: isInternalStorage ? "internal-storage" : "external-storage"
    };

    if (isInternalStorage) {
      DOMElements.storageContainer.innerHTML = "";
    }

    const storageDevice = document.createElement("div");
    storageDevice.className = `storage-device ${deviceData.className}`;
    storageDevice.dataset.storage = storagePath;

    storageDevice.innerHTML = `
      <div class="device-icon">
        <i class="fas ${deviceData.icon}" aria-hidden="true"></i>
      </div>
      <h2 class="device-name">
        ${deviceData.title}
      </h2>
    `;

    DOMElements.storageContainer.appendChild(storageDevice);
  }

  function updatePathDisplay() {
    const { pathHistory } = AppState.file;

    const pathItems = pathHistory.map((directory, index) => {
      const displayName =
        index === 0
          ? directory === "/storage/emulated/0"
            ? I18nManager.translate("internal_storage")
            : I18nManager.translate("sd_card")
          : directory;

      const separator = index === 0 ? "" : `<span class="separator">»</span>`;

      return ` ${separator} <span class="path-item" data-index="${index}">${displayName}</span>`;
    });

    DOMElements.currentPath.innerHTML = pathItems.join("");

    requestAnimationFrame(() => {
      DOMElements.currentPath.scrollLeft = DOMElements.currentPath.scrollWidth;
    });
  }

  function showLoadingIndicator() {
    DOMElements.fileList.innerHTML = `  
      <div class="loading"></div>  
    `;
  }

  function updateSelectionDisplay() {
    document.body.classList.toggle(
      "selection-active",
      AppState.ui.selectionMode
    );
    if (!AppState.ui.selectionMode) {
      document.querySelectorAll(".checkbox").forEach(cb => {
        cb.checked = false;
      });
    }
  }

  function updateSelectionCounter() {
    DOMElements.selectionCounter.textContent =
      SelectionManager.getSelectedItems().length;
  }

  function updateSelectionToggleIcon() {
    const icon = DOMElements.selectionToggle.querySelector("svg");
    if (AppState.ui.selectionMode) {
      icon.classList.remove("fa-check");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-check");
    }
  }

  function updateItemCheckbox(itemName) {
    const escapedName = Utils.escapeIdValue(itemName);
    DOMElements.updateElement(`#check-${escapedName}`, checkbox => {
      checkbox.checked = !checkbox.checked;
    });
  }

  function updateSearchUI(active) {
    const dom = DOMElements;

    if (active) {
      dom.currentPath.classList.add("hidden");
      dom.searchContainer.classList.add("active");
      dom.searchButton.classList.add("hidden");
      dom.searchInput.focus();
    } else {
      dom.currentPath.classList.remove("hidden");
      dom.searchContainer.classList.remove("active");
      dom.searchButton.classList.remove("hidden");
      dom.searchInput.value = "";
    }
  }

  AppState.on("PATH_HISTORY_CHANGE", () => {
    UIRenderer.updateActiveStorageDevice();
    updatePathDisplay();
  });
  AppState.on("STORAGE_PATH_ADD", storagePath => {
    UIRenderer.renderStorageData(storagePath);
  });
  AppState.on("SELECTION_CHANGE", updateSelectionCounter);
  AppState.on("SELECTION_MODE_CHANGE", () => {
    updateSelectionDisplay();
    updateSelectionToggleIcon();
    updateSelectionCounter();
  });
  AppState.on("FILE_SYSTEM_CHANGE", () => {
    FileListRenderer.renderFileList();
  });
  AppState.on("SEARCH_MODE_CHANGE", () => {
    updateSearchUI(AppState.ui.searchActive);
  });
  AppState.on("FILTERED_ITEMS_CHANGE", () => {
    FileListRenderer.renderFileList();
  });

  return {
    updateActiveStorageDevice,
    updateSubfolderCount,
    renderStorageData,
    updatePathDisplay,
    showLoadingIndicator,
    updateSelectionDisplay,
    updateSelectionCounter,
    updateSelectionToggleIcon,
    updateItemCheckbox,
    updateSearchUI
  };
})();
