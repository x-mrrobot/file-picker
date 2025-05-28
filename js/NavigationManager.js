const NavigationManager = (function (env) {
  function getCurrentPath() {
    return AppState.file.pathHistory.join("/");
  }

  function navigateToPath(newPath) {
    UIRenderer.showLoadingIndicator();

    AppState.resetPage();

    const fileSystemData = FileManager.getFileSystemData(newPath);
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

  function handleSelectionMode() {
    if (AppState.ui.selectionMode) {
      AppState.toggleSelectionMode(false);
      return true;
    }
    return false;
  }

  function handleActiveSearch() {
    if (AppState.ui.searchActive) {
      SearchManager.closeSearch();
      return true;
    }
    return false;
  }

  function navigateToPreviousPath() {
    if (AppState.file.pathHistory.length > 1) {
      const newHistory = AppState.file.pathHistory.slice(0, -1);
      AppState.setPathHistory(newHistory);
      const currentPath = newHistory.join("/");
      navigateToPath(currentPath);
      return true;
    }
    return false;
  }

  function goBack() {
    if (handleSelectionMode()) {
      return;
    }

    if (handleActiveSearch()) {
      return;
    }

    if (navigateToPreviousPath()) {
      return;
    }

    env.terminate();
  }

  return {
    navigateToPath,
    goToFolder,
    goToPathIndex,
    goBack,
    getCurrentPath
  };
})(currentEnvironment);
