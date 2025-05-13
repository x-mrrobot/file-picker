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
