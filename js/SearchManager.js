const SearchManager = (function () {
  function openSearch() {
    AppState.toggleSearchMode(true);
  }

  function closeSearch() {
    AppState.toggleSearchMode(false);
    AppState.setFilteredItems(AppState.file.fileSystemData);
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
    openSearch,
    closeSearch,
    filterItems
  };
})();
