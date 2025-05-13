const EnvironmentManager = (function () {
  return {
    getCurrent() {
      return typeof tk === "undefined" ? webEnvironment : taskerEnvironment;
    }
  };
})();

const currentEnvironment = EnvironmentManager.getCurrent();
