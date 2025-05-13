const I18nManager = (function (env) {
  const state = {
    currentLocale: "pt-BR",
    translations: {},
    fallbackLocale: "en-US"
  };

  const translations = {
    "pt-BR": {
      app_title: "Seletor de Arquivos",
      app_close: "Fechando aplicação...",
      search_placeholder: "Pesquisar arquivos e pastas...",
      internal_storage: "Armazenamento",
      sd_card: "Cartão SD",
      no_files: "Nenhum arquivo encontrado",
      items_count: "{count} item",
      items_count_plural: "{count} itens",
      items_selected: "Itens selecionados:",
      select_all: "{count} selecionado",
      select_all_plural: "{count} selecionados",
      copy_success: "{count} item copiado com sucesso!",
      copy_success_plural: "{count} itens copiados com sucesso!",
      copy_empty: "Nenhum item selecionado para copiar",
      copy_error: "Erro ao copiar itens para a área de transferência"
    },
    "es-ES": {
      app_title: "Selector de Archivos",
      app_close: "Cerrando aplicación...",
      search_placeholder: "Buscar archivos y carpetas...",
      internal_storage: "Almacenamiento",
      sd_card: "Tarjeta SD",
      no_files: "No se encontraron archivos",
      items_count: "{count} elemento",
      items_count_plural: "{count} elementos",
      items_selected: "Elementos seleccionados:",
      select_all: "{count} seleccionado",
      select_all_plural: "{count} seleccionados",
      copy_success: "¡{count} elemento copiado con éxito!",
      copy_success_plural: "¡{count} elementos copiados con éxito!",
      copy_empty: "No hay ningún elemento seleccionado para copiar",
      copy_error: "Error al copiar elementos al portapapeles"
    },
    "en-US": {
      app_title: "File Picker",
      app_close: "Closing application...",
      search_placeholder: "Search files and folders...",
      internal_storage: "Internal Storage",
      sd_card: "SD Card",
      no_files: "No files found",
      items_count: "{count} item",
      items_count_plural: "{count} items",
      items_selected: "Selected items:",
      select_all: "{count} selected",
      select_all_plural: "{count} selected",
      copy_success: "{count} item copied successfully!",
      copy_success_plural: "{count} items copied successfully!",
      copy_empty: "No item selected to copy",
      copy_error: "Error copying items to clipboard"
    }
  };

  function detectSystemLocale() {
    return env.languageCode || navigator.language || state.fallbackLocale;
  }

  function loadTranslations(locale) {
    const supportedLocales = ["pt-BR", "en-US", "es-ES"];
    const baseLocale = locale.split("-")[0];
    const matchedLocale =
      supportedLocales.find(l => l.startsWith(baseLocale)) ||
      state.fallbackLocale;

    state.translations = translations;
    return matchedLocale;
  }

  function initialize() {
    const systemLocale = detectSystemLocale();
    state.currentLocale = loadTranslations(systemLocale);
    applyTranslationsToDOM();
  }

  function applyTranslationsToDOM() {
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.getAttribute("data-i18n");
      const text = translate(key);
      if (text) {
        if (element.tagName === "INPUT" && element.placeholder) {
          element.placeholder = text;
        } else {
          element.textContent = text;
        }
      }
    });
  }

  function translate(key, params = {}) {
    const currentTranslations = state.translations[state.currentLocale];
    let text = currentTranslations[key] || key;

    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{${param}}`, "g"), params[param]);
    });

    return text;
  }

  function translatePlural(key, count) {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    return translate(pluralKey, { count });
  }

  return {
    initialize,
    translate,
    translatePlural
  };
})(currentEnvironment);
