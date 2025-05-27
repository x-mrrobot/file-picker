const FileListRenderer = (function (dom) {
  function generateItemIcon(item, extension) {
    const isDirectory = item.type === "d";

    if (isDirectory) {
      return IconManager.getIcon("Folder", "folder-icon");
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
    let html = "";
    for (let i = 0; i < items.length; i++) {
      html += generateFileItemHTML(items[i]);
    }
    return html;
  }

  function appendFileItemsToDOM(htmlContent) {
    const fragment = document.createDocumentFragment();
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlContent;
    while (tempContainer.firstChild) {
      fragment.appendChild(tempContainer.firstChild);
    }
    dom.fileList.appendChild(fragment);
  }

  function renderItems(items) {
    const htmlContent = generateFileItemsHTML(items);
    appendFileItemsToDOM(htmlContent);

    const folderNames = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "d") {
        folderNames.push(items[i].name);
      }
    }

    if (folderNames.length) {
      SubfolderQueueManager.processSubfolders(folderNames);
    }
  }

  function renderEmptyState() {
    dom.fileList.innerHTML = `<div class="no-files" data-i18n="no_files">${I18nManager.translate(
      "no_files"
    )}</div>`;
  }

  function getItemsToRender() {
    if (AppState.ui.searchActive) {
      const filteredItems = AppState.file.filteredItems;
      return filteredItems;
    } else {
      const allItems = AppState.file.fileSystemData;
      const currentPage = AppState.ui.currentPage;
      const endIndex = currentPage * AppState.ui.pageSize;
      return allItems.slice(0, endIndex);
    }
  }

  function renderFileList() {
    dom.fileList.innerHTML = "";

    const itemsToRender = getItemsToRender();
    if (itemsToRender.length === 0) {
      renderEmptyState();
      return;
    }

    renderItems(itemsToRender);

    requestAnimationFrame(() => {
      dom.fileList.scrollTop = 0;
    });
  }

  function appendFileListItems() {
    if (AppState.ui.searchActive) return;

    const currentPage = AppState.ui.currentPage;
    const pageSize = AppState.ui.pageSize;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = currentPage * pageSize;

    const allItems = AppState.file.fileSystemData;
    const itemsToAppend = allItems.slice(startIndex, endIndex);

    if (itemsToAppend.length > 0) {
      renderItems(itemsToAppend);
    }
  }

  return {
    renderFileList,
    appendFileListItems
  };
})(DOMElements);
