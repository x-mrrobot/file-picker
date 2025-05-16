const DOMElements = (function () {
  function getElement(query) {
    return document.querySelector(query);
  }

  const elements = {
    storageContainer: getElement(".header-storage"),
    sortButton: getElement("#sort-btn"),
    sortDropdown: getElement("#sort-dropdown"),
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
