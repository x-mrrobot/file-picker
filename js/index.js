const EnvironmentManager = (function () {
  return {
    getCurrent() {
      return typeof tk === "undefined" ? webEnvironment : taskerEnvironment;
    }
  };
})();

const currentEnvironment = EnvironmentManager.getCurrent();

const AppState = (function () {
  const state = {
    file: {
      storagePaths: [],
      pathHistory: [],
      fileSystemData: [],
      subfolderData: {},
      selectedItems: new Set(),
      filteredItems: []
    },
    ui: {
      selectionMode: false,
      currentPage: 1,
      pageSize: 20,
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
    emit("STORAGE_PATH_ADD", path);
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
    setFilteredItems
  };
})();

const Utils = {
  getExtensionFontSize(extension) {
    const length = extension.length;
    if (length <= 2) return "1.2rem";
    if (length <= 3) return "1rem";
    if (length <= 4) return "0.8rem";
    if (length <= 6) return "0.7rem";
    if (length <= 8) return "0.6rem";
    return "0.4rem";
  },

  escapeIdValue(value) {
    if (!value) return "";
    return value
      .replace(/\s+/g, "_")
      .replace(/\./g, "dot")
      .replace(/[\[\]()\/\\'",:;<>=+\-*?!&@#%^$|{}]/g, match => {
        const replacements = {
          "[": "lb",
          "]": "rb",
          "(": "lp",
          ")": "rp",
          "/": "sl",
          "\\": "bs",
          "'": "sq",
          '"': "dq",
          ":": "cl",
          ";": "sc",
          ",": "cm",
          "<": "lt",
          ">": "gt",
          "=": "eq",
          "+": "pl",
          "-": "mn",
          "*": "as",
          "?": "qm",
          "!": "em",
          "&": "am",
          "@": "at",
          "#": "hs",
          "%": "pc",
          "^": "ct",
          $: "dl",
          "|": "vb",
          "{": "lc",
          "}": "rc"
        };
        return replacements[match] || match;
      });
  },

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
    );
  },

  getFileExtension(filename) {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
  },

  isElementConnected(element) {
    return element && element.isConnected;
  }
};

const CacheManager = (function () {
  const config = {
    enabled: true,
    maxEntries: 20,
    expirationTime: 5 * 60 * 1000
  };

  function getDirectoryKey(path) {
    return path;
  }

  function getCache() {
    try {
      return JSON.parse(localStorage.getItem("@file-picker") || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveCache(cacheData) {
    localStorage.setItem("@file-picker", JSON.stringify(cacheData));
  }

  function isValid(path) {
    if (!config.enabled) return false;
    try {
      const cache = getCache();
      const dirKey = getDirectoryKey(path);
      const entry = cache[dirKey];
      if (!entry) return false;
      return Date.now() - entry.timestamp < config.expirationTime;
    } catch (error) {
      return false;
    }
  }

  function get(path) {
    if (!config.enabled) return null;
    try {
      if (!isValid(path)) return null;
      const cache = getCache();
      const dirKey = getDirectoryKey(path);
      const entry = cache[dirKey];
      if (!entry || !entry.fileData) return null;
      return {
        fileData: entry.fileData,
        subfolderData: entry.subfolderData
      };
    } catch (error) {
      return null;
    }
  }

  function save(path, fileData, subfolderData) {
    if (!config.enabled) return;
    try {
      const cache = getCache();
      const dirKey = getDirectoryKey(path);

      cache[dirKey] = {
        fileData,
        subfolderData: subfolderData || {},
        timestamp: Date.now()
      };

      const entries = Object.entries(cache).sort(
        (a, b) => b[1].timestamp - a[1].timestamp
      );

      if (entries.length > config.maxEntries) {
        const cacheToKeep = {};
        entries.slice(0, config.maxEntries).forEach(([key, value]) => {
          cacheToKeep[key] = value;
        });
        saveCache(cacheToKeep);
      } else {
        saveCache(cache);
      }
    } catch (error) {}
  }

  function commitSubfolderItemCounts(path, subfolderData) {
    if (!config.enabled) return;

    try {
      const cache = getCache();
      const dirKey = getDirectoryKey(path);

      if (!cache[dirKey]) {
        cache[dirKey] = {
          fileData: null,
          subfolderData: {},
          timestamp: Date.now()
        };
      }

      cache[dirKey].subfolderData = subfolderData;
      cache[dirKey].timestamp = Date.now();

      saveCache(cache);
    } catch (error) {}
  }

  function clear() {
    localStorage.removeItem("@file-picker");
  }

  return {
    get,
    save,
    commitSubfolderItemCounts,
    clear,
    isValid
  };
})();

const DOMElements = (function () {
  function getElement(query) {
    return document.querySelector(query);
  }

  const elements = {
    storageContainer: getElement(".header-storage"),
    fileList: getElement("#file-list"),
    currentPath: getElement("#current-path"),
    backButton: getElement(".back-btn"),
    selectionCounter: getElement('[data-action="select-all"]'),
    selectButton: getElement('[data-action="select"]'),
    copyButton: getElement('[data-action="copy"]'),
    selectionToggle: getElement("#selection-toggle"),
    searchButton: getElement("#search-btn"),
    searchContainer: getElement("#search-container"),
    searchInput: getElement("#search-input"),
    closeSearchButton: getElement("#close-search-btn")
  };

  function updateElement(query, updateFn) {
    const element = getElement(query);
    if (Utils.isElementConnected(element)) {
      updateFn(element);
    }
  }

  return {
    ...elements,
    updateElement
  };
})();

const FileManager = (function (env) {
  function buildFullPath(itemName) {
    const currentPath = AppState.file.pathHistory.join("/");
    return currentPath ? `${currentPath}/${itemName}` : itemName;
  }

  function getSdCard() {
    return env.executeCommand("get_sd_card");
  }

  function parseDirectoryOutput(rawData) {
    const regex = /([df])\s+(\d+)\s+(.+)/;
    const re = new RegExp(regex, "gm");
    rawData = rawData
      .replace(re, '{ "name": "$3", "size": $2, "type": "$1" },')
      .replace(/.$/, "");
    return JSON.parse(`[${rawData}]`);
  }

  function getSelectedItems() {
    return Array.from(AppState.file.selectedItems);
  }

  function getFileList(directory) {
    const cachedData = CacheManager.get(directory);

    if (cachedData) {
      if (cachedData.subfolderData) {
        AppState.file.subfolderData = cachedData.subfolderData;
      }
      return cachedData.fileData;
    }

    try {
      const output = env.executeCommand("list_directory", `"${directory}"`);
      const parsedData = parseDirectoryOutput(output);
      CacheManager.save(directory, parsedData, {});
      return parsedData;
    } catch (error) {
      return [];
    }
  }

  function filterItems(query) {
    if (!query || query.trim() === "") {
      return AppState.file.fileSystemData;
    }

    const normalizedQuery = query.toLowerCase().trim();
    return AppState.file.fileSystemData.filter(item =>
      item.name.toLowerCase().includes(normalizedQuery)
    );
  }

  return {
    buildFullPath,
    getSdCard,
    parseDirectoryOutput,
    getSelectedItems,
    getFileList,
    filterItems
  };
})(currentEnvironment);

const TaskProcessor = (function (env) {
  function getSubfolderItemCount(directory, subfolder) {
    return new Promise((resolve, reject) => {
      const cachedData = CacheManager.get(directory);
      if (
        cachedData &&
        cachedData.subfolderData &&
        cachedData.subfolderData[subfolder] !== undefined
      ) {
        return resolve(cachedData.subfolderData[subfolder]);
      }

      setTimeout(() => {
        try {
          const output = env.executeCommand(
            "get_subfolder_item_count",
            `"${directory}/${subfolder}"`
          );
          const itemCount = Number(output);
          AppState.file.subfolderData[subfolder] = itemCount;

          resolve(itemCount);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
  }

  function processSubfolderCountTask(task, callback) {
    getSubfolderItemCount(task.directory, task.subfolder)
      .then(itemCount => {
        UIRenderer.updateSubfolderCount(task.subfolder, itemCount);
      })
      .catch(error => {})
      .finally(() => {
        const totalActiveSubfolders = TaskQueue.getActiveCount();

        if (totalActiveSubfolders <= 1) {
          CacheManager.commitSubfolderItemCounts(
            task.directory,
            AppState.file.subfolderData
          );
        }

        callback();
      });
  }

  return {
    getSubfolderItemCount,
    processSubfolderCountTask
  };
})(currentEnvironment);

const TaskQueue = (function () {
  const config = {
    maxConcurrentProcessing: 15
  };

  const state = {
    queue: [],
    activeCount: 0,
    currentDirectory: null
  };

  function checkAndUpdatePath() {
    if (state.currentDirectory !== NavigationManager.getCurrentPath()) {
      clearQueue();
      state.currentDirectory = NavigationManager.getCurrentPath();
      return true;
    }
    return false;
  }

  function processNext() {
    if (checkAndUpdatePath()) return;

    if (
      state.queue.length > 0 &&
      state.activeCount < config.maxConcurrentProcessing
    ) {
      const task = state.queue.shift();
      processTask(task);
    }
  }

  function processTask(task) {
    if (checkAndUpdatePath()) return;

    state.activeCount++;

    const processingDone = () => {
      state.activeCount--;
      if (!checkAndUpdatePath()) {
        processNext();
      }
    };

    TaskProcessor.processSubfolderCountTask(task, processingDone);
  }

  function enqueue(task) {
    if (checkAndUpdatePath()) return;

    state.queue.push(task);
    processNext();
  }

  function clearQueue() {
    state.queue = [];
    state.activeCount = 0;
    state.currentDirectory = NavigationManager.getCurrentPath();
  }

  return {
    enqueue,
    clearQueue,
    getActiveCount: function () {
      return state.activeCount;
    }
  };
})();

const UIRenderer = (function () {
  function updateActiveStorageDevice() {
    const currentPath = NavigationManager.getCurrentPath();
    console.log(currentPath);
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
      element.textContent = `${itemCount} item${itemCount !== 1 ? "s" : ""}`;
    });
  }

  function renderStorageData(storagePath) {
    const isInternalStorage = storagePath.includes("emulated/0");

    const deviceData = {
      title: isInternalStorage ? "Armazenamento" : "Cartão SD",
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
            ? "Armazenamento interno"
            : "Cartão SD"
          : directory;

      const separator = index === 0 ? "" : '<span class="separator">»</span>';

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
      FileManager.getSelectedItems().length;
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

const NavigationManager = (function (env) {
  function getCurrentPath() {
    return AppState.file.pathHistory.join("/");
  }

  function navigateToPath(newPath) {
    UIRenderer.showLoadingIndicator();

    TaskQueue.clearQueue();
    AppState.file.subfolderData = {};
    AppState.clearSelectedItems();
    AppState.resetPage();

    const fileSystemData = FileManager.getFileList(newPath);
    AppState.setFileSystemData(fileSystemData);
  }

  function goToFolder(folderName) {
    const fullDirPath = FileManager.buildFullPath(folderName);
    const newHistory = [...AppState.file.pathHistory, folderName];
    AppState.setPathHistory(newHistory);
    navigateToPath(fullDirPath);
  }

  function goToPathIndex(index) {
    if (index >= 0 && index < AppState.file.pathHistory.length) {
      const newHistory = AppState.file.pathHistory.slice(0, index + 1);
      AppState.setPathHistory(newHistory);

      const currentPath = newHistory.join("/");
      navigateToPath(currentPath);
      return true;
    }
    return false;
  }

  function goBack() {
    if (AppState.ui.selectionMode) {
      AppState.toggleSelectionMode(false);
      return;
    }

    if (AppState.ui.searchActive) {
      SearchManager.closeSearch();
      return;
    }

    if (AppState.file.pathHistory.length > 1) {
      const newHistory = AppState.file.pathHistory.slice(0, -1);
      AppState.setPathHistory(newHistory);
      const currentPath = newHistory.join("/");
      navigateToPath(currentPath);
      return true;
    }
    env.exitApplication(CacheManager.clear);
  }

  return {
    navigateToPath,
    goToFolder,
    goToPathIndex,
    goBack,
    getCurrentPath
  };
})(currentEnvironment);

const SearchManager = (function () {
  function openSearch() {
    AppState.toggleSearchMode(true);
  }

  function closeSearch() {
    AppState.toggleSearchMode(false);
    AppState.setFilteredItems(AppState.file.fileSystemData);
  }

  function filterItems(query) {
    AppState.setFilteredItems(FileManager.filterItems(query));
  }

  return { openSearch, closeSearch, filterItems };
})();

const FileListRenderer = (function () {
  function generateFileItemHTML(item) {
    const isDirectory = item.type === "d";

    const extension = isDirectory ? "" : Utils.getFileExtension(item.name);

    const itemTypeClass = isDirectory ? "folder" : "file";

    const fontSize = Utils.getExtensionFontSize(extension);

    const itemMetadata = isDirectory
      ? `<span class="item-count" data-subfolder="${item.name}">...</span>`
      : Utils.formatBytes(item.size);

    const itemIndicator = isDirectory
      ? `<div class="item-indicator">
        <i class="fas fa-chevron-right"></i>
      </div>`
      : "";

    const escapedName = Utils.escapeIdValue(item.name);

    const fullItemPath = FileManager.buildFullPath(item.name);
    const isSelected = AppState.file.selectedItems.has(fullItemPath);

    return `
    <div class="item-entry ${itemTypeClass}" data-name="${item.name}">
      <input type="checkbox" id="check-${escapedName}" class="checkbox" ${
        isSelected ? "checked" : ""
      }>
      <div class="item-icon">
        ${
          isDirectory
            ? `<i class="fas fa-folder-open"></i>`
            : `<div class="file-extension" style="font-size: ${fontSize}">${extension}</div>`
        }
      </div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-metadata">${itemMetadata}</div>
      </div>
      ${itemIndicator}
    </div>
  `;
  }

  function generateFileItemsHTML(items) {
    return items.map(generateFileItemHTML).join("");
  }

  function appendFileItemsToDOM(htmlContent) {
    const fragment = document.createDocumentFragment();
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlContent;
    while (tempContainer.firstChild) {
      fragment.appendChild(tempContainer.firstChild);
    }
    DOMElements.fileList.appendChild(fragment);
  }

  function renderItems(items) {
    const htmlContent = generateFileItemsHTML(items);
    appendFileItemsToDOM(htmlContent);

    items.forEach(item => {
      if (item.type === "d") {
        processSubfolder(item.name);
      }
    });
  }

  function processSubfolder(subfolder) {
    const task = {
      type: "subfolder_item_count",
      directory: NavigationManager.getCurrentPath(),
      subfolder
    };
    TaskQueue.enqueue(task);
  }

  function renderFileList() {
    DOMElements.fileList.innerHTML = "";

    let itemsToRender = [];

    if (AppState.ui.searchActive) {
      itemsToRender = AppState.file.filteredItems;
    } else {
      itemsToRender = AppState.file.fileSystemData.slice(
        0,
        AppState.ui.currentPage * AppState.ui.pageSize
      );
    }

    renderItems(itemsToRender);

    requestAnimationFrame(() => {
      DOMElements.fileList.scrollTop = 0;
    });

    if (!AppState.ui.searchActive) {
      PaginationManager.init();
    }
  }

  function appendFileListItems() {
    if (AppState.ui.searchActive) return;

    const startIndex = (AppState.ui.currentPage - 1) * AppState.ui.pageSize;
    const endIndex = AppState.ui.currentPage * AppState.ui.pageSize;
    const itemsToAppend = AppState.file.fileSystemData.slice(
      startIndex,
      endIndex
    );

    renderItems(itemsToAppend);
  }

  return {
    renderFileList,
    appendFileListItems
  };
})();

const PaginationManager = (function () {
  let isInitialized = false;
  const scrollThreshold = 200;

  function init() {
    if (isInitialized) return;

    const fileList = DOMElements.fileList;
    fileList.removeEventListener("scroll", handleScroll);
    fileList.addEventListener("scroll", handleScroll);

    isInitialized = true;
  }

  function handleScroll() {
    const el = DOMElements.fileList;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - scrollThreshold) {
      loadMore();
    }
  }

  function loadMore() {
    const totalItems = AppState.file.fileSystemData.length;
    const currentRendered = AppState.ui.currentPage * AppState.ui.pageSize;

    if (currentRendered < totalItems) {
      AppState.ui.currentPage++;
      FileListRenderer.appendFileListItems();
    }
  }

  return { init };
})();

const SelectionManager = (function () {
  function toggleMode() {
    AppState.toggleSelectionMode();
  }

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
    AppState.emit("SELECTION_CHANGE");
  }

  function toggleAllItems() {
    const itemsToProcess = AppState.ui.searchActive
      ? AppState.file.filteredItems
      : AppState.file.fileSystemData;

    const selectedCount = FileManager.getSelectedItems().length;
    const shouldSelectItems = selectedCount !== itemsToProcess.length;

    itemsToProcess.forEach(fileItem => {
      const fullItemPath = FileManager.buildFullPath(fileItem.name);
      if (shouldSelectItems) {
        AppState.file.selectedItems.add(fullItemPath);
      } else {
        AppState.file.selectedItems.delete(fullItemPath);
      }

      const safeItemName = Utils.escapeIdValue(fileItem.name);
      DOMElements.updateElement(`#check-${safeItemName}`, checkbox => {
        checkbox.checked = shouldSelectItems;
      });
    });

    AppState.emit("SELECTION_CHANGE");
  }

  function copySelectedToClipboard() {
    const selectedData = FileManager.getSelectedItems();

    if (navigator.clipboard && selectedData.length > 0) {
      navigator.clipboard
        .writeText(selectedData.join(","))
        .then(() => {
          alert(`${selectedData.length} itens copiados com sucesso!`);
        })
        .catch(err => {
          alert("Erro ao copiar itens para a área de transferência");
        });
    }
  }

  return {
    toggleMode,
    toggleItem,
    toggleAllItems,
    copySelectedToClipboard
  };
})();

const EventManager = (function (env) {
  function setupEventListeners() {
    const dom = DOMElements;

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

      if (!AppState.ui.selectionMode) {
        SelectionManager.toggleMode();
      }
      const itemName = fileItem.dataset.name;
      SelectionManager.toggleItem(itemName);
    });

    dom.storageContainer.addEventListener("click", event => {
      const storageDevice = event.target.closest(".storage-device");
      if (storageDevice) {
        const storagePath = storageDevice.getAttribute("data-storage");
        AppState.setPathHistory([storagePath]);
        NavigationManager.navigateToPath(storagePath);
      }
    });

    dom.selectionCounter.addEventListener("click", () => {
      SelectionManager.toggleAllItems();
    });

    dom.selectButton.addEventListener("click", () => {
      const selectedItems = FileManager.getSelectedItems();
      env.returnSelectedItems(selectedItems);
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
      SearchManager.filterItems(event.target.value);
    });
  }

  return {
    setupEventListeners
  };
})(currentEnvironment);

const App = (function (env) {
  function updateStoragePaths() {
    AppState.addStoragePath("/storage/emulated/0");

    const sdCardPath = FileManager.getSdCard();

    if (sdCardPath) {
      AppState.addStoragePath(sdCardPath);
    }
  }

  function initialize() {
    updateStoragePaths();
    EventManager.setupEventListeners();
    NavigationManager.goToFolder(AppState.file.storagePaths[0]);
  }

  return {
    initialize,
    goBack: NavigationManager.goBack
  };
})(currentEnvironment);

App.initialize();
