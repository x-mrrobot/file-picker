const SortManager = (function () {
  const SORT_PREFERENCE_KEY = "@file-picker:sort-preference";
  const defaultSortPreference = "name_asc";

  let currentSortPreference =
    localStorage.getItem(SORT_PREFERENCE_KEY) || defaultSortPreference;

  let lastSortedResult = null;
  let lastSortData = {
    items: null,
    preference: null,
    folders: null, // Added to match reset in event listener
    files: null   // Added to match reset in event listener
  };

  if (typeof AppState !== 'undefined' && AppState.on) { // Check if AppState is available
    AppState.on("PINNED_ITEMS_CHANGE", () => {
      lastSortedResult = null;
      lastSortData = { items: null, preference: null, folders: null, files: null }; // Reset all relevant parts of lastSortData
    });
  }

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

  // The separateItemsByType function was here. It has been removed as it was orphaned.

  function sortItems(items) {
    const preference = getSortPreference();

    if (
      lastSortedResult &&
      lastSortData.items === items && // This check needs to be more robust if we keep items in lastSortData
      lastSortData.preference === preference 
      // Add pinned items signature check here if not using event-based invalidation
    ) {
      return lastSortedResult;
    }

    const pinnedDirectories = [];
    const otherDirectories = [];
    const allFiles = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // Assuming FileManager.buildFullPath is globally available or correctly imported/passed
      const fullPath = typeof FileManager !== 'undefined' ? FileManager.buildFullPath(item.name) : item.name;


      if (item.type === "d") { // It's a directory
        // Assuming AppState.isPinned is globally available
        if (typeof AppState !== 'undefined' && AppState.isPinned(fullPath)) {
          pinnedDirectories.push(item);
        } else {
          otherDirectories.push(item);
        }
      } else { // It's a file
        allFiles.push(item);
      }
    }

    switch (preference) {
      case "name_asc":
        pinnedDirectories.sort(comparators.nameAsc);
        otherDirectories.sort(comparators.nameAsc);
        allFiles.sort(comparators.nameAsc);
        break;
      case "name_desc":
        pinnedDirectories.sort(comparators.nameDesc);
        otherDirectories.sort(comparators.nameDesc);
        allFiles.sort(comparators.nameDesc);
        break;
      case "size_asc":
        pinnedDirectories.sort(comparators.nameAsc); // Pinned dirs by name
        otherDirectories.sort(comparators.nameAsc); // Other dirs by name
        allFiles.sort(comparators.sizeAsc);       // Files by size
        break;
      case "size_desc":
        pinnedDirectories.sort(comparators.nameAsc); // Pinned dirs by name
        otherDirectories.sort(comparators.nameAsc); // Other dirs by name
        allFiles.sort(comparators.sizeDesc);      // Files by size
        break;
      case "date_desc":
        pinnedDirectories.sort(comparators.dateDesc);
        otherDirectories.sort(comparators.dateDesc);
        allFiles.sort(comparators.dateDesc);
        break;
      case "date_asc":
        pinnedDirectories.sort(comparators.dateAsc);
        otherDirectories.sort(comparators.dateAsc);
        allFiles.sort(comparators.dateAsc);
        break;
      default: // Fallback to name_asc
        pinnedDirectories.sort(comparators.nameAsc);
        otherDirectories.sort(comparators.nameAsc);
        allFiles.sort(comparators.nameAsc);
    }
    
    // Update cache information
    lastSortData.items = items; // Store the original items reference for cache validation
    lastSortData.preference = preference;
    // lastSortData.pinnedSignature could be added here if not using event-based invalidation

    lastSortedResult = [...pinnedDirectories, ...otherDirectories, ...allFiles];

    return lastSortedResult;
  }

  // The separateItemsByType function was confirmed to be unused and has been removed.

  return {
    getSortPreference,
    setSortPreference,
    sortItems
  };
})();
