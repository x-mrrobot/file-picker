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

  function updateStoragePaths() {
    const internalStoragePath = "/storage/emulated/0";
    AppState.addStoragePath(internalStoragePath);

    const sdCardPath = FileManager.getSdCard();
    if (sdCardPath) {
      AppState.addStoragePath(sdCardPath);
    }
  }

  function initialize() {
    applyTheme();
    I18nManager.initialize();
    updateStoragePaths();
    EventManager.setupEventListeners();

    NavigationManager.goToFolder(AppState.file.storagePaths[0]);
    PullToRefreshManager.init();
  }

  return {
    initialize,
    goBack: NavigationManager.goBack
  };
})(currentEnvironment);

App.initialize();
