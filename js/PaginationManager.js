const PaginationManager = (function () {
  const scrollThreshold = 200;

  function init() {
    const fileList = DOMElements.fileList;
    fileList.addEventListener("scroll", handleScroll);
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
