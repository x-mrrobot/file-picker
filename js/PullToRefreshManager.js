const PullToRefreshManager = (function () {
  const config = {
    threshold: 100,
    animationDuration: 300,
    loadingTimeout: 100,
    maxPullDistance: 100
  };

  let state = {
    touchStartY: 0,
    currentPull: 0,
    isPulling: false,
    isRefreshing: false,
    loadingIndicator: null
  };

  function getIsRefreshing() {
    return state.isRefreshing;
  }

  function createLoadingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "pull-to-refresh-indicator";
    indicator.innerHTML = '<div class="pull-loading-spinner"></div>';
    return indicator;
  }

  function startRefresh() {
    state.isRefreshing = true;

    setTimeout(() => {
      const currentPath = NavigationManager.getCurrentPath();
      NavigationManager.navigateToPath(currentPath);
      hideLoadingIndicator();
    }, config.loadingTimeout);
  }

  function showLoadingIndicator() {
    if (!state.loadingIndicator) {
      state.loadingIndicator = createLoadingIndicator();
      DOMElements.fileList.appendChild(state.loadingIndicator);
    }

    state.loadingIndicator.offsetHeight;
    state.loadingIndicator.style.transform = "translateY(0)";
  }

  function hideLoadingIndicator() {
    if (state.loadingIndicator) {
      state.loadingIndicator.style.transform = "translateY(-100%)";

      setTimeout(() => {
        if (state.loadingIndicator?.parentNode) {
          state.loadingIndicator.parentNode.removeChild(state.loadingIndicator);
        }
        state.loadingIndicator = null;
        state.isRefreshing = false;
      }, config.animationDuration);
    }
  }

  function updatePullDistance(distance) {
    if (!state.loadingIndicator) {
      state.loadingIndicator = createLoadingIndicator();
      DOMElements.fileList.appendChild(state.loadingIndicator);
    }

    const pullDistance = Math.min(distance, config.maxPullDistance);
    state.loadingIndicator.style.transform = `translateY(${pullDistance}px)`;

    state.loadingIndicator.classList.toggle(
      "ready",
      distance >= config.threshold
    );
  }

  function handleTouchStart(e) {
    if (DOMElements.fileList.scrollTop > 0) return;

    state.touchStartY = e.touches[0].clientY;
    state.isPulling = true;
    state.currentPull = 0;
  }

  function handleTouchMove(e) {
    if (!state.isPulling || state.isRefreshing) return;

    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - state.touchStartY;

    if (pullDistance <= 0) {
      state.isPulling = false;
      return;
    }

    if (DOMElements.fileList.scrollTop === 0 && pullDistance > 10) {
      e.preventDefault();
    }

    state.currentPull = pullDistance;
    updatePullDistance(pullDistance);
  }

  function handleTouchEnd() {
    if (!state.isPulling || state.isRefreshing) return;

    if (state.currentPull >= config.threshold) {
      showLoadingIndicator();
      startRefresh();
    } else {
      hideLoadingIndicator();
    }

    state.isPulling = false;
    state.currentPull = 0;
  }

  function init() {
    DOMElements.fileList.addEventListener("touchstart", handleTouchStart, {
      passive: false
    });
    DOMElements.fileList.addEventListener("touchmove", handleTouchMove, {
      passive: false
    });
    DOMElements.fileList.addEventListener("touchend", handleTouchEnd);
    DOMElements.fileList.addEventListener("touchcancel", handleTouchEnd);
  }

  return {
    init,
    getIsRefreshing
  };
})();
