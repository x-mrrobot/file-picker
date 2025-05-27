const App = (function (env) {
  function applySystemTheme() {
    if (!env.isDarkModeEnabled) {
      const body = document.querySelector("body");
      body.classList.add("light-theme");
    }
  }

  function setupStorageDevices() {
    const INTERNAL_STORAGE_PATH = "/storage/emulated/0";

    const storageDevices = [INTERNAL_STORAGE_PATH];

    const sdCardPath = FileManager.getSdCardPath();
    if (sdCardPath) {
      storageDevices.push(sdCardPath);
    }
    AppState.setStorageDevices(storageDevices);
  }

  function init() {
    applySystemTheme();
    IconManager.applyIcons();
    I18nManager.init();
    EventManager.setupEventListeners();
    setupStorageDevices();

    NavigationManager.goToFolder("/storage/emulated/0");

    PaginationManager.init();
    PullToRefreshManager.init();
  }

  return {
    init
  };
})(currentEnvironment);

App.init();
