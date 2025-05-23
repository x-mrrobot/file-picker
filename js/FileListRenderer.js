const FileListRenderer = (function (dom) {
  const THUMBNAIL_PREFIX = "thumb_"; // Defined locally

  // Function moved from Utils.js for better cohesion, only used here.
  function getExtensionFontSize(extension) {
    if (typeof extension !== 'string') return "0.8rem"; // Default size
    const length = extension.length;
    if (length <= 2) return "1.2rem";
    if (length <= 3) return "1rem";
    if (length <= 4) return "0.8rem";
    if (length <= 6) return "0.7rem";
    if (length <= 8) return "0.6rem";
    return "0.4rem";
  }

  function generateItemIcon(item, extension) {
    const isDirectory = item.type === "d";

    if (isDirectory) {
      return `
      <svg class="folder-icon" viewBox="0 0 576 512" fill="currentColor">
        <path d="M572.694 292.093L500.27 416.248A63.997 63.997 0 0 1 444.989 448H45.025c-18.523 0-30.064-20.093-20.731-36.093l72.424-124.155A64 64 0 0 1 152 256h399.964c18.523 0 30.064 20.093 20.73 36.093zM152 224h328v-48c0-26.51-21.49-48-48-48H272l-64-64H48C21.49 64 0 85.49 0 112v278.046l69.077-118.418C86.214 242.25 117.989 224 152 224z"/>
      </svg>`;
    } else { // It's a file
      const fullPath = FileManager.buildFullPath(item.name);
      
      // Check if ThumbnailManager and its isImage method are available
      if (typeof ThumbnailManager !== 'undefined' && ThumbnailManager.isImage && ThumbnailManager.isImage(fullPath)) {
        // Check if CacheManager is available
        const cachedThumbnailData = typeof CacheManager !== 'undefined' ? CacheManager.get(THUMBNAIL_PREFIX + fullPath) : null;
        
        if (cachedThumbnailData && cachedThumbnailData.thumbnailUrl) {
          return `<img src="${cachedThumbnailData.thumbnailUrl}" class="thumbnail-icon" alt="${item.name}" />`;
        } else {
          if (typeof ThumbnailManager !== 'undefined' && ThumbnailManager.addToQueue) {
            ThumbnailManager.addToQueue(fullPath);
          }
          // Return the default extension icon for now
          const fontSize = getExtensionFontSize(extension); // Call local function
          return `<div class="file-extension" style="font-size: ${fontSize}">${extension}</div>`;
        }
      } else {
        // Original logic for non-image files or if ThumbnailManager is not available
        const fontSize = getExtensionFontSize(extension); // Call local function
        return `<div class="file-extension" style="font-size: ${fontSize}">${extension}</div>`;
      }
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
    let itemTypeClass = isDirectory ? "folder" : "file";
    const escapedName = Utils.escapeIdValue(item.name);
    const selected = isItemSelected(item) ? "checked" : "";
    const fullItemPath = FileManager.buildFullPath(item.name);
    const pinned = isDirectory && AppState.isPinned(fullItemPath);
    itemTypeClass += pinned ? " pinned" : "";

    return `
  <article class="item-entry ${itemTypeClass}" data-name="${item.name}">
      <input type="checkbox" id="check-${escapedName}" class="checkbox" ${selected}>
      
      <div class="item-icon">
        ${generateItemIcon(item, extension)}
        <span class="pin-icon">${pinned ? '📌' : ''}</span>
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
      return SortManager.sortItems(filteredItems);
    } else {
      const allItems = AppState.file.fileSystemData;
      const sortedItems = SortManager.sortItems(allItems);
      const currentPage = AppState.ui.currentPage;
      const endIndex = currentPage * AppState.ui.pageSize;
      return sortedItems.slice(0, endIndex);
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
    const allSortedItems = SortManager.sortItems(allItems);
    const itemsToAppend = allSortedItems.slice(startIndex, endIndex);

    if (itemsToAppend.length > 0) {
      renderItems(itemsToAppend);
    }
  }

  AppState.on("FILE_SYSTEM_CHANGE", renderFileList);
  AppState.on("SORT_PREFERENCE_CHANGE", renderFileList);
  AppState.on("FILTERED_ITEMS_CHANGE", renderFileList);
  AppState.on("PINNED_ITEMS_CHANGE", renderFileList);

  // Subscribe to THUMBNAIL_READY event
  if (typeof AppState !== 'undefined' && AppState.on) {
    AppState.on("THUMBNAIL_READY", ({ filePath, thumbnailUrl }) => {
      const itemName = filePath.substring(filePath.lastIndexOf('/') + 1);
      // Ensure Utils.escapeIdValue is available or handle potential errors
      const escapedName = typeof Utils !== 'undefined' && Utils.escapeIdValue ? Utils.escapeIdValue(itemName) : itemName;
      
      // Ensure DOMElements.fileList is available
      const itemElement = dom.fileList && dom.fileList.querySelector(`article.item-entry[data-name="${escapedName}"]`);
      
      if (itemElement) {
        const iconDiv = itemElement.querySelector('.item-icon');
        if (iconDiv) {
          // It's possible the pin icon is still in iconDiv, make sure to replace only the image part
          // or ensure the entire content is what we want.
          // For simplicity, replacing innerHTML. If pin icon needs to be preserved, logic would be more complex.
          const pinIconSpan = iconDiv.querySelector('.pin-icon');
          const pinIconHTML = pinIconSpan ? pinIconSpan.outerHTML : '';
          
          iconDiv.innerHTML = `<img src="${thumbnailUrl}" class="thumbnail-icon" alt="${itemName}" />` + pinIconHTML;
        }
      }
    });
  }

  return {
    renderFileList,
    appendFileListItems
  };
})(DOMElements);
