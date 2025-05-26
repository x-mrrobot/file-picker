const EventBus = (function () {
  const events = new Map();

  function on(event, callback) {
    if (!events.has(event)) {
      events.set(event, []);
    }
    events.get(event).push(callback);
  }

  function emit(event, ...params) {
    if (events.has(event)) {
      events.get(event).forEach(callback => callback(...params));
    }
  }

  return {
    on,
    emit
  };
})();
