const FileListRenderer = (function () {
  let processingSubfolderCount = 0;

  let contentCache = {
    items: null,
    htmlContent: ""
  };

  function generateItemIcon(item, extension) {
    const isDirectory = item.type === "d";

    if (isDirectory) {
      return `
      <svg class="folder-icon" viewBox="0 0 576 512" fill="currentColor">
        <path d="M572.694 292.093L500.27 416.248A63.997 63.997 0 0 1 444.989 448H45.025c-18.523 0-30.064-20.093-20.731-36.093l72.424-124.155A64 64 0 0 1 152 256h399.964c18.523 0 30.064 20.093 20.73 36.093zM152 224h328v-48c0-26.51-21.49-48-48-48H272l-64-64H48C21.49 64 0 85.49 0 112v278.046l69.077-118.418C86.214 242.25 117.989 224 152 224z"/>
      </svg>`;
    } else {
      const fontSize = Utils.getExtensionFontSize(extension);
      return `<div class="file-extension" style="font-size: ${fontSize}">${extension}</div>`;
    }
  }

  function generateMetadataItems(item) {
    const isDirectory = item.type === "d";
    const formattedDate = Utils.formatTimestamp(item.modified);
    let metadataItems = "";

    if (isDirectory) {
      metadataItems += `
      <span class="item-count" data-subfolder="${item.name}">...</span>`;
    } else {
      metadataItems += `
      <span class="item-size">${Utils.formatBytes(item.size)}</span>
     `;
    }
    metadataItems += `<span class="item-date">${formattedDate}</span>`;

    return metadataItems;
  }

  function isItemSelected(item) {
    const fullItemPath = FileManager.buildFullPath(item.name);
    return AppState.file.selectedItems.has(fullItemPath);
  }

  function generateFileItemHTML(item) {
    const isDirectory = item.type === "d";
    const extension = isDirectory ? "" : Utils.getFileExtension(item.name);
    const itemTypeClass = isDirectory ? "folder" : "file";
    const escapedName = Utils.escapeIdValue(item.name);
    const selected = isItemSelected(item) ? "checked" : "";

    return `
  <article class="item-entry ${itemTypeClass}" data-name="${item.name}">
      <input type="checkbox" id="check-${escapedName}" class="checkbox" ${selected}>
      
      <div class="item-icon">
        ${generateItemIcon(item, extension)}
      </div>
      
      <div class="item-info">
        <h3 class="item-name">${item.name}</h3>
        <div class="item-metadata">
          ${generateMetadataItems(item)}
        </div>
      </div>
  </article>`;
  }

  function generateFileItemsHTML(items) {
    if (contentCache.items === items) {
      return contentCache.htmlContent;
    }

    let html = "";
    for (let i = 0; i < items.length; i++) {
      html += generateFileItemHTML(items[i]);
    }

    contentCache.items = items;
    contentCache.htmlContent = html;

    return html;
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

    const folderItems = items.filter(item => item.type === "d");

    if (folderItems.length) {
      const lastSubfolder = folderItems[folderItems.length - 1].name;

      const processPromises = [];
      for (let i = 0; i < folderItems.length; i++) {
        processPromises.push(
          processSubfolder(folderItems[i].name, lastSubfolder)
        );
      }
    }
  }

  function processSubfolder(subfolder, lastSubfolder) {
    const currentPath = NavigationManager.getCurrentPath();
    processingSubfolderCount++;

    return FileManager.processSubfolderCount(currentPath, subfolder)
      .then(itemCount => {
        UIRenderer.updateSubfolderCount(subfolder, itemCount);
      })
      .catch(() => {})
      .finally(() => {
        processingSubfolderCount--;

        if (processingSubfolderCount === 0) {
          CacheManager.updateCacheEntry(
            currentPath,
            AppState.file.subfolderData
          );
        }
      });
  }

  function renderEmptyState() {
    DOMElements.fileList.innerHTML = `<div class="no-files" data-i18n="no_files">${I18nManager.translate(
      "no_files"
    )}</div>`;
  }

  let paginationCache = {
    filteredItems: null,
    currentPage: null,
    sortPreference: null,
    result: null
  };

  function getItemsToRender() {
    const currentSortPreference = SortManager.getSortPreference();

    if (AppState.ui.searchActive) {
      const filteredItems = AppState.file.filteredItems;

      if (
        paginationCache.filteredItems === filteredItems &&
        paginationCache.sortPreference === currentSortPreference
      ) {
        return paginationCache.result;
      }

      const sortedItems = SortManager.sortItems(filteredItems);

      paginationCache.filteredItems = filteredItems;
      paginationCache.sortPreference = currentSortPreference;
      paginationCache.result = sortedItems;

      return sortedItems;
    } else {
      const allItems = AppState.file.fileSystemData;
      const currentPage = AppState.ui.currentPage;

      if (
        paginationCache.filteredItems === allItems &&
        paginationCache.currentPage === currentPage &&
        paginationCache.sortPreference === currentSortPreference
      ) {
        return paginationCache.result;
      }

      const sortedItems = SortManager.sortItems(allItems);
      const endIndex = currentPage * AppState.ui.pageSize;
      const pagedItems = sortedItems.slice(0, endIndex);

      paginationCache.filteredItems = allItems;
      paginationCache.currentPage = currentPage;
      paginationCache.sortPreference = currentSortPreference;
      paginationCache.result = pagedItems;

      return pagedItems;
    }
  }

  function renderFileList() {
    DOMElements.fileList.innerHTML = "";

    contentCache = {
      items: null,
      htmlContent: ""
    };

    const itemsToRender = getItemsToRender();

    if (itemsToRender.length === 0) {
      renderEmptyState();
      return;
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

    const currentPage = AppState.ui.currentPage;
    const pageSize = AppState.ui.pageSize;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = currentPage * pageSize;

    const allItems = AppState.file.fileSystemData;
    const allSortedItems = SortManager.sortItems(allItems);
    const itemsToAppend = allSortedItems.slice(startIndex, endIndex);

    if (itemsToAppend.length > 0) {
      renderItems(itemsToAppend);
    }

    paginationCache.filteredItems = allItems;
    paginationCache.currentPage = currentPage;
    paginationCache.sortPreference = SortManager.getSortPreference();
    paginationCache.result = allSortedItems.slice(0, endIndex);
  }

  AppState.on("FILE_SYSTEM_CHANGE", () => {
    contentCache = { items: null, htmlContent: "" };
    paginationCache = {
      filteredItems: null,
      currentPage: null,
      sortPreference: null,
      result: null
    };
  });

  AppState.on("SORT_PREFERENCE_CHANGE", () => {
    paginationCache = {
      filteredItems: null,
      currentPage: null,
      sortPreference: null,
      result: null
    };

    renderFileList();
  });

  AppState.on("FILE_SYSTEM_CHANGE", () => {
    renderFileList();
  });

  AppState.on("FILTERED_ITEMS_CHANGE", () => {
    renderFileList();
  });

  return {
    renderFileList,
    appendFileListItems
  };
})();
