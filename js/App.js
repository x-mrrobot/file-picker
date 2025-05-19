const App = (function (env) {
  function applyTheme() {
    const body = document.querySelector("body");

    const darkThemeEnabled = env.darkThemeEnabled;
    if (darkThemeEnabled) {
      body.classList.remove("light-theme");
    } else {
      body.classList.add("light-theme");
    }
  }

  function loadSdCard() {
    const sdCardPath = FileManager.getSdCard();
    if (sdCardPath) {
      AppState.addStoragePath(sdCardPath);
    }
    UIRenderer.displayStorageDevices();
  }

  function initialize() {
    applyTheme();
    I18nManager.initialize();
    loadSdCard();
    EventManager.setupEventListeners();

    NavigationManager.goToFolder(AppState.file.storagePaths[0]);
    PaginationManager.init();
    PullToRefreshManager.init();
  }

  return {
    initialize,
    goBack: NavigationManager.goBack
  };
})(currentEnvironment);

App.initialize();
