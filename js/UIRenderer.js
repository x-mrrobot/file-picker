const UIRenderer = (function (dom) {
  function createStorageDeviceElement(devicePath) {
    const isInternalDevice = devicePath.includes("emulated/0");

    const deviceTitle = isInternalDevice
      ? I18nManager.translate("internal_storage")
      : I18nManager.translate("sd_card");

    const deviceCssClass = isInternalDevice
      ? "internal-storage"
      : "external-storage";

    const deviceElement = document.createElement("div");
    deviceElement.className = `storage-device ${deviceCssClass}`;
    deviceElement.dataset.storage = devicePath;

    deviceElement.innerHTML = `
    <div class="device-icon">
      ${
        isInternalDevice
          ? IconManager.getIcon("Phone", "storage-icon")
          : IconManager.getIcon("SDCard", "storage-icon")
      }
    </div>
    <h2 class="device-name">
      ${deviceTitle}
    </h2>
  `;

    return deviceElement;
  }

  function displayStorageDevices(storageDevices) {
    const storageDeviceElements = storageDevices.map(
      createStorageDeviceElement
    );

    dom.storageContainer.append(...storageDeviceElements);
  }

  function updateActiveStorageDevice() {
    const currentPath = NavigationManager.getCurrentPath();
    const storageDevices = document.querySelectorAll(".storage-device");

    if (storageDevices.length < 2) return;

    storageDevices.forEach(device => {
      const devicePath = device.dataset.storage;

      if (currentPath.startsWith(devicePath)) {
        device.classList.add("active");
      } else {
        device.classList.remove("active");
      }
    });
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

    dom.currentPath.innerHTML = pathItems.join("");

    requestAnimationFrame(() => {
      dom.currentPath.scrollLeft = dom.currentPath.scrollWidth;
    });
  }

  function updateSearchUI(active) {
    dom.currentPath.classList.toggle("hidden", active);
    dom.searchContainer.classList.toggle("active", active);
    dom.searchButton.classList.toggle("hidden", active);

    if (active) {
      dom.searchInput.focus();
    } else {
      dom.searchInput.value = "";
    }
  }

  function updateActiveSortButton(sortType) {
    const sortButtons = dom.sortDropdown.querySelectorAll(".dropdown-button");

    sortButtons.forEach(btn => {
      btn.classList.remove("active");
      if (btn.dataset.sort === sortType) {
        btn.classList.add("active");
      }
    });
  }

  function updateSubfolderCount(subfolder, itemCount) {
    dom.updateElement(`[data-subfolder="${subfolder}"]`, element => {
      element.textContent = I18nManager.translatePlural(
        "items_count",
        itemCount
      );
    });
  }

  function showLoadingIndicator() {
    dom.fileList.innerHTML = `  
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

  function toggleOverlay(show) {
    if (show) {
      overlay.classList.add("active");
      return;
    }

    dom.overlay.classList.remove("active");
  }

  function updateItemCheckbox(itemName) {
    const escapedName = Utils.escapeIdValue(itemName);
    dom.updateElement(`#check-${escapedName}`, checkbox => {
      checkbox.checked = !checkbox.checked;
    });
  }

  function updateSelectionModeIcon() {
    const selectionIcon = AppState.ui.selectionMode
      ? IconManager.getIcon("Close", "footer-icon")
      : IconManager.getIcon("Check", "footer-icon");

    dom.selectionToggle.innerHTML = selectionIcon;
  }

  function updateSelectionCounter() {
    dom.selectionCounter.textContent =
      SelectionManager.getSelectedItems().length;
  }

  return {
    displayStorageDevices,
    updateActiveStorageDevice,
    updatePathDisplay,
    updateSearchUI,
    updateActiveSortButton,
    updateSubfolderCount,
    showLoadingIndicator,
    updateSelectionDisplay,
    toggleOverlay,
    updateItemCheckbox,
    updateSelectionModeIcon,
    updateSelectionCounter
  };
})(DOMElements);
