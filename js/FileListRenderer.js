const FileListRenderer = (function () {
  let processingSubfolderCount = 0;

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
        <svg class="indicator-icon" viewBox="0 0 320 512" fill="currentColor">
          <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
        </svg>
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
            ? `<svg class="folder-icon" viewBox="0 0 576 512" fill="currentColor">
                <path d="M572.694 292.093L500.27 416.248A63.997 63.997 0 0 1 444.989 448H45.025c-18.523 0-30.064-20.093-20.731-36.093l72.424-124.155A64 64 0 0 1 152 256h399.964c18.523 0 30.064 20.093 20.73 36.093zM152 224h328v-48c0-26.51-21.49-48-48-48H272l-64-64H48C21.49 64 0 85.49 0 112v278.046l69.077-118.418C86.214 242.25 117.989 224 152 224z"/>
              </svg>`
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

    const folderItems = items.filter(item => item.type === "d");

    if (folderItems.length) {
      const lastSubfolder = folderItems[folderItems.length - 1].name;

      folderItems.forEach(item => processSubfolder(item.name, lastSubfolder));
    }
  }

  function processSubfolder(subfolder, lastSubfolder) {
    const currentPath = NavigationManager.getCurrentPath();
    processingSubfolderCount++;

    FileManager.processSubfolderCount(currentPath, subfolder)
      .then(itemCount => {
        UIRenderer.updateSubfolderCount(subfolder, itemCount);
      })
      .catch(() => {})
      .finally(() => {
        if (processingSubfolderCount == 1) {
          CacheManager.updateCacheEntry(
            currentPath,
            AppState.file.subfolderData
          );
        }
        processingSubfolderCount--;
      });
  }

  function renderEmptyState() {
    DOMElements.fileList.innerHTML = `<div class="no-files" data-i18n="no_files">${I18nManager.translate(
      "no_files"
    )}</div>`;
  }

  function getItemsToRender() {
    if (AppState.ui.searchActive) {
      return AppState.file.filteredItems;
    } else {
      return AppState.file.fileSystemData.slice(
        0,
        AppState.ui.currentPage * AppState.ui.pageSize
      );
    }
  }

  function renderFileList() {
    DOMElements.fileList.innerHTML = "";

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
