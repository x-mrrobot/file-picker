const SortManager = (function () {
  const SORT_PREFERENCE_KEY = "@file-picker:sort-preference";
  const defaultSortPreference = "name_asc";

  let currentSortPreference =
    localStorage.getItem(SORT_PREFERENCE_KEY) || defaultSortPreference;

  let lastSortedResult = null;
  let lastSortData = {
    items: null,
    preference: null
  };

  const comparators = {
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name),
    dateAsc: (a, b) => {
      const dateA = a.modified || 0;
      const dateB = b.modified || 0;
      return dateA !== dateB ? dateA - dateB : a.name.localeCompare(b.name);
    },
    dateDesc: (a, b) => {
      const dateA = a.modified || 0;
      const dateB = b.modified || 0;
      return dateA !== dateB ? dateB - dateA : a.name.localeCompare(b.name);
    },
    sizeAsc: (a, b) => (a.size || 0) - (b.size || 0),
    sizeDesc: (a, b) => (b.size || 0) - (a.size || 0)
  };

  function getSortPreference() {
    return currentSortPreference;
  }

  function setSortPreference(preference) {
    if (currentSortPreference === preference) return;

    currentSortPreference = preference;
    localStorage.setItem(SORT_PREFERENCE_KEY, preference);

    lastSortedResult = null;
    lastSortData = {
      items: null,
      preference: null
    };

    AppState.emit("SORT_PREFERENCE_CHANGE");
  }

  function separateItemsByType(items) {
    if (lastSortData.items === items) {
      return {
        folders: lastSortData.folders,
        files: lastSortData.files
      };
    }

    const folders = [];
    const files = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "d") {
        folders.push(items[i]);
      } else {
        files.push(items[i]);
      }
    }

    lastSortData.items = items;
    lastSortData.folders = folders;
    lastSortData.files = files;

    return { folders, files };
  }

  function sortItems(items) {
    const preference = getSortPreference();

    if (
      lastSortedResult &&
      lastSortData.items === items &&
      lastSortData.preference === preference
    ) {
      return lastSortedResult;
    }

    const { folders, files } = separateItemsByType(items);

    switch (preference) {
      case "name_asc":
        folders.sort(comparators.nameAsc);
        files.sort(comparators.nameAsc);
        break;
      case "name_desc":
        folders.sort(comparators.nameDesc);
        files.sort(comparators.nameDesc);
        break;
      case "size_asc":
        folders.sort(comparators.nameAsc);
        files.sort(comparators.sizeAsc);
        break;
      case "size_desc":
        folders.sort(comparators.nameAsc);
        files.sort(comparators.sizeDesc);
        break;
      case "date_desc":
        folders.sort(comparators.dateDesc);
        files.sort(comparators.dateDesc);
        break;
      case "date_asc":
        folders.sort(comparators.dateAsc);
        files.sort(comparators.dateAsc);
        break;
      default:
        folders.sort(comparators.nameAsc);
        files.sort(comparators.nameAsc);
    }

    lastSortData.preference = preference;
    lastSortedResult = [...folders, ...files];

    return lastSortedResult;
  }

  return {
    getSortPreference,
    setSortPreference,
    sortItems
  };
})();
