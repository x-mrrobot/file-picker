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
      sort_name_asc: "Nome (A-Z)",
      sort_name_desc: "Nome (Z-A)",
      sort_size_asc: "Tamanho (Menor)",
      sort_size_desc: "Tamanho (Maior)",
      sort_date_desc: "Data (Mais recente)",
      sort_date_asc: "Data (Mais antigo)",
      no_files: "Nenhum arquivo encontrado",
      items_count: "{count} item",
      items_count_plural: "{count} itens",
      items_selected: "Itens selecionados:",
      select_all: "{count} selecionado",
      select_all_plural: "{count} selecionados",
      copy_success: "{count} item copiado com sucesso!",
      copy_success_plural: "{count} itens copiados com sucesso!",
      copy_empty: "Nenhum item selecionado para copiar",
      copy_error: "Erro ao copiar itens para a área de transferência",
      timestamp_just_now: "Agora mesmo",
      timestamp_minute_ago: "1 minuto atrás",
      timestamp_minutes_ago: "{count} minutos atrás",
      timestamp_hour_ago: "1 hora atrás",
      timestamp_hours_ago: "{count} horas atrás",
      day_sunday: "Domingo",
      day_monday: "Segunda",
      day_tuesday: "Terça",
      day_wednesday: "Quarta",
      day_thursday: "Quinta",
      day_friday: "Sexta",
      day_saturday: "Sábado",
      pin_directory_confirm: "Fixar diretório '{name}'?",
      unpin_directory_confirm: "Desafixar diretório '{name}'?"
    },
    "es-ES": {
      app_title: "Selector de Archivos",
      app_close: "Cerrando aplicación...",
      search_placeholder: "Buscar archivos y carpetas...",
      internal_storage: "Almacenamiento",
      sd_card: "Tarjeta SD",
      sort_name_asc: "Nombre (A-Z)",
      sort_name_desc: "Nombre (Z-A)",
      sort_size_asc: "Tamaño (Más pequeño)",
      sort_size_desc: "Tamaño (Más grande)",
      sort_date_desc: "Fecha (Más reciente)",
      sort_date_asc: "Fecha (Más antiguo)",
      no_files: "No se encontraron archivos",
      items_count: "{count} elemento",
      items_count_plural: "{count} elementos",
      items_selected: "Elementos seleccionados:",
      select_all: "{count} seleccionado",
      select_all_plural: "{count} seleccionados",
      copy_success: "¡{count} elemento copiado con éxito!",
      copy_success_plural: "¡{count} elementos copiados con éxito!",
      copy_empty: "No hay ningún elemento seleccionado para copiar",
      copy_error: "Error al copiar elementos al portapapeles",
      timestamp_just_now: "Ahora mismo",
      timestamp_minute_ago: "Hace 1 minuto",
      timestamp_minutes_ago: "Hace {count} minutos",
      timestamp_hour_ago: "Hace 1 hora",
      timestamp_hours_ago: "Hace {count} horas",
      day_sunday: "Domingo",
      day_monday: "Lunes",
      day_tuesday: "Martes",
      day_wednesday: "Miércoles",
      day_thursday: "Jueves",
      day_friday: "Viernes",
      day_saturday: "Sábado",
      pin_directory_confirm: "Fijar directorio '{name}'?",
      unpin_directory_confirm: "Quitar directorio '{name}'?"
    },
    "en-US": {
      app_title: "File Picker",
      app_close: "Closing application...",
      search_placeholder: "Search files and folders...",
      internal_storage: "Internal Storage",
      sd_card: "SD Card",
      sort_name_asc: "Name (A-Z)",
      sort_name_desc: "Name (Z-A)",
      sort_size_asc: "Size (Smaller)",
      sort_size_desc: "Size (Larger)",
      sort_date_desc: "Date (Newer)",
      sort_date_asc: "Date (Older)",
      no_files: "No files found",
      items_count: "{count} item",
      items_count_plural: "{count} items",
      items_selected: "Selected items:",
      select_all: "{count} selected",
      select_all_plural: "{count} selected",
      copy_success: "{count} item copied successfully!",
      copy_success_plural: "{count} items copied successfully!",
      copy_empty: "No item selected to copy",
      copy_error: "Error copying items to clipboard",
      timestamp_just_now: "Just now",
      timestamp_minute_ago: "1 minute ago",
      timestamp_minutes_ago: "{count} minutes ago",
      timestamp_hour_ago: "1 hour ago",
      timestamp_hours_ago: "{count} hours ago",
      day_sunday: "Sunday",
      day_monday: "Monday",
      day_tuesday: "Tuesday",
      day_wednesday: "Wednesday",
      day_thursday: "Thursday",
      day_friday: "Friday",
      day_saturday: "Saturday",
      pin_directory_confirm: "Pin directory '{name}'?",
      unpin_directory_confirm: "Unpin directory '{name}'?"
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

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return {
    initialize,
    translate,
    translatePlural,
    capitalize,
    getCurrentLocale: () => state.currentLocale
  };
})(currentEnvironment);
