const SortManager = (function () {
  const SORT_PREFERENCE_KEY = "@file-picker:sort-preference";
  let currentSortPreference = "name_asc";

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

  function saveSortPreference(preference) {
    localStorage.setItem(SORT_PREFERENCE_KEY, preference);
  }

  function setSortPreference(preference) {
    if (!preference || currentSortPreference === preference) return;

    currentSortPreference = preference;

    saveSortPreference(preference);

    EventBus.emit("SORT_PREFERENCE_CHANGE", preference);
  }

  function separateItemsByType(items) {
    if (!items || !items.length) return { folders: [], files: [] };

    const folders = [];
    const files = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "d") {
        folders.push(items[i]);
      } else {
        files.push(items[i]);
      }
    }

    return { folders, files };
  }

  function sortByPreference(folders, files, comparators, preference) {
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
  }

  function sortItems(items) {
    if (!items || !items.length) return items;

    const preference = getSortPreference();
    const { folders, files } = separateItemsByType(items);

    sortByPreference(folders, files, comparators, preference);

    return [...folders, ...files];
  }

  function sortAndUpdateFileList() {
    const currentPath = NavigationManager.getCurrentPath();
    const sortedData = sortItems(AppState.file.fileSystemData);
    AppState.setFileSystemData(sortedData, currentPath);
  }

  function initialize() {
    const savedPreference = localStorage.getItem(SORT_PREFERENCE_KEY);
    if (savedPreference) {
      currentSortPreference = savedPreference;
    }
    UIRenderer.updateActiveSortButton(currentSortPreference);
  }

  initialize();

  return {
    getSortPreference,
    setSortPreference,
    sortItems,
    sortAndUpdateFileList
  };
})();
