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
          ? `<svg class="storage-icon" viewBox="0 0 320 512" fill="currentColor">
              <path d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
            </svg>`
          : `<svg class="storage-icon" viewBox="0 0 384 512" fill="currentColor">
              <path d="M320 0H128L0 128v320c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zM160 160h-48V64h48v96zm80 0h-48V64h48v96zm80 0h-48V64h48v96z"/>
            </svg>`
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
    updateSelectionCounter
  };
})(DOMElements);
