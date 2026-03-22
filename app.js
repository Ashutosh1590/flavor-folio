/* ============================================================
   FLAVOR FOLIO — app.js
   All data is stored in localStorage under these keys:
     ff_profile   → { name, role, kitchen, station, serviceTime }
     ff_recipes   → [ { id, name, emoji, category, station, portions,
                         time, allergens, ingredients, method, notes,
                         createdAt } ]
     ff_prep      → [ { id, name, qty, station, due, priority,
                         done, createdAt } ]
     ff_timers    → [ { id, label, total, remaining, running, createdAt } ]
     ff_stats     → { recipesAdded, prepsDone, timersRun }
   ============================================================ */

// ─────────────────────────────────────────────
//  STORAGE HELPERS
// ─────────────────────────────────────────────
const DB = {
  get(key) {
    try {
      const data = localStorage.getItem("ff_" + key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      console.error("DB get error:", err);
      return null;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem("ff_" + key, JSON.stringify(val));
      return true;
    } catch (err) {
      console.error("DB set error:", err);
      // Check if quota exceeded
      if (err.name === "QuotaExceededError") {
        toast("⚠️ Storage full. Please delete some items.");
      }
      return false;
    }
  },
  getList(key) {
    const data = this.get(key);
    return Array.isArray(data) ? data : [];
  },
  uid() {
    // Use crypto.randomUUID if available, fallback to timestamp method
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },
};

// ─────────────────────────────────────────────
//  INTERNATIONALIZATION (i18n)
// ─────────────────────────────────────────────
const translations = {
  en: {
    // Onboarding
    continue: "Continue →",
    skip: "Skip intro",
    next: "Next →",
    ob_title_1: "Built for the Line,<br/>Not the Living Room",
    ob_body_1:
      "A professional recipe & prep management tool designed for the speed and precision of kitchen service.",
    ob_title_2: "Prep Lists with Expiry Alerts",
    ob_body_2:
      "Track tasks by station in real kitchen units — batch, pan, case — and get alerts before items expire mid-service.",
    ob_title_3: "Import Recipes in Seconds",
    ob_body_3:
      "Type manually, paste a link, or scan a printed recipe card. Allergens and timers are auto-tagged.",
    enter_kitchen: "Enter the Kitchen 🔥",
    choose_language: "Choose Your Language<br/>Elige tu idioma",
    select_language: "Select your preferred language to get started",

    // Navigation
    home: "Home",
    recipes: "Recipes",
    timers: "Timers",
    prep: "Prep",
    profile: "Profile",

    // Home Screen
    good_morning: "Good morning",
    good_afternoon: "Good afternoon",
    good_evening: "Good evening",
    chef: "Chef",
    tonight_shift: "Tonight's Shift",
    service_time: "Service Time",
    service_in: "Service in",
    service_tonight: "Service tonight",
    service_started: "Service started",
    your_station: "Your Station",
    saute_station: "Sauté Station",
    timer: "Timer",
    view: "View →",
    todays_prep_list: "⚡ Today's Prep List",
    all_clear: "All Clear! 🎉",
    tasks_remaining: "Tasks Remaining",
    tap_to_view: "Tap to view",
    tap_to_view_full: "Tap to view full list",
    urgent: "URGENT",
    urgent_tap: "urgent · Tap to view",
    recent_recipes: "Recent Recipes",
    see_all: "See all →",
    urgent_prep: "Urgent Prep",
    full_list: "Full list →",
    no_urgent_tasks: "No urgent tasks 🎉",
    no_recipes_yet: "No recipes yet — add one in Recipes 📖",
    recipes_count: "Recipes",
    prep_done: "Prep Done",
    loading: "Loading…",

    // Recipe Page
    add_recipe: "Add Recipe",
    search_recipes: "Search recipes...",
    filter_recipes: "Filter recipes",
    all: "All",
    appetizer: "Appetizer",
    main: "Main",
    dessert: "Dessert",
    side: "Side",
    sauce: "Sauce",
    drink: "Drink",
    no_recipes_found:
      "No recipes found.<br/>Tap <strong>＋</strong> to add your first recipe.",
    portions: "portions",
    por: "por",

    // Recipe Detail
    scale_portions: "🔢 Scale portions",
    allergens: "⚠️ Allergens",
    no_allergens: "✓ No allergens declared",
    ingredients: "Ingredients",
    no_ingredients: "No ingredients added.",
    method: "Method",
    no_method: "No method steps added.",
    view_plating: "🍽 View Plating Guide",
    add_to_prep: "📋 Add to Prep List",
    start_timer: "⏱ Start Timer",
    delete_recipe: "🗑 Delete Recipe",
    delete_confirm: "Delete this recipe? This cannot be undone.",

    // Add Recipe Modal
    add_new_recipe: "Add New Recipe",
    choose_method: "Choose how you'd like to add your recipe.",
    manual_entry: "Manual Entry",
    manual_desc: "Type in all recipe details",
    camera_import: "Camera Import",
    camera_desc: "Scan a recipe card or page",
    import_link: "Import Link",
    import_link_desc: "Paste a URL from the web",

    // Manual Entry Form
    fill_details: "Fill in all the recipe details below.",
    recipe_name_req: "Recipe Name *",
    recipe_name_placeholder: "e.g. Duck Confit",
    cook_time: "Cook Time (HH:MM) *",
    cook_time_placeholder: "01:30",
    portions_label: "Portions *",
    portions_placeholder: "4",
    emoji_icon: "Emoji/Icon",
    emoji_placeholder: "🍽",
    category: "Category",
    select_category: "Select category...",
    starter: "Starter",
    garnish: "Garnish",
    station: "Station",
    station_placeholder: "e.g. Sauté, Grill, Pastry",
    allergens_label: "Allergens (comma-separated)",
    allergens_placeholder: "dairy, nuts, gluten",
    ingredients_label: "Ingredients (one per line)",
    ingredients_placeholder: "2 duck legs\n1 tbsp salt\n500g duck fat",
    method_label: "Method (one step per line)",
    method_placeholder:
      "Season duck legs with salt\nSear skin side down\nCover with duck fat",
    notes_label: "Chef Notes",
    notes_placeholder: "Tips, variations, or personal notes",
    reminder_frequency: "Reminder Frequency",
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Biweekly",
    monthly: "Monthly",
    dairy: "Dairy",
    tree_nut: "Tree Nut",
    soy: "Soy",
    allium: "Allium",
    gluten: "Gluten",
    peanut: "Peanut",
    shellfish: "Shellfish",
    sesame: "Sesame",
    save_recipe: "Save Recipe ✓",

    // Import Link
    import_from_link: "Import from Link",
    paste_url: "Paste a recipe URL and we'll extract the details.",
    recipe_url: "Recipe URL *",
    url_placeholder: "https://example.com/recipe",
    import_recipe: "Import Recipe 🔗",

    // Timer Page
    no_active_timers: "No Active Timers",
    start_timer_desc:
      "Start a timer to track your cooking times with precision",
    start_a_timer: "Start a Timer ⏱️",
    common_tasks: "Common Tasks",
    hard_boiled: "Hard Boiled",
    blanch_greens: "Blanch Greens",
    dry_pasta: "Dry Pasta",
    white_rice: "White Rice",
    min: "min",

    // New Timer Modal
    new_timer: "New Timer",
    choose_preset: "Choose a preset or set custom duration",
    quick_presets: "⚡ Quick Presets",
    custom_timer: "⏱️ Custom Timer",
    label: "Label",
    timer_label_placeholder: "e.g. Duck Confit · Oven",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    start_custom_timer: "Start Custom Timer ⏱",

    // Prep Page
    prep_list: "Prep List",
    of: "of",
    complete: "complete",
    today: "Today",
    done: "DONE",
    normal: "NORMAL",
    low: "LOW",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
    no_prep_tasks:
      "No prep tasks yet.<br/>Tap <strong>＋</strong> to add your first task.",
    no_tasks_here: "No tasks here.<br/>Tap <strong>＋</strong> to add one.",

    // Add Prep Modal
    new_prep_task: "New Prep Task",
    task_name_req: "Task Name *",
    task_placeholder: "e.g. Blanch & shock green beans",
    quantity: "Quantity",
    quantity_placeholder: "2 pans",
    ingredient: "Ingredient",
    ingredient_placeholder: "Duck leg",
    unit: "Unit",
    add_ingredient: "＋ Add Ingredient",
    day_of_week: "Day of Week",
    select_day: "Select day...",
    priority: "Priority",
    urgent_priority: "🔴 Urgent",
    normal_priority: "⚪ Normal",
    low_priority: "🟢 Low",
    add_to_list: "Add to List ✓",

    // Profile Page
    edit_profile: "Edit Profile",
    your_name: "Your Name *",
    name_placeholder: "Chef Alex",
    role: "Role",
    role_placeholder: "Sauté Cook, Sous Chef…",
    restaurant: "Restaurant / Kitchen",
    restaurant_placeholder: "The Grand Kitchen",
    service_time_label: "Service Time",
    save_profile: "Save Profile ✓",
    line_cook: "Line Cook",
    settings: "Settings",
    appearance: "Appearance",
    language_settings: "Language",
    change_language: "Change Language",
    data_management: "Data Management",
    export_data: "Export Data",
    export_desc: "Download backup as JSON",
    clear_all_data: "Clear All Data",
    clear_desc: "Reset app to factory state",
    about: "About",
    version: "FLAVOR FOLIO v1.0 · BUILT FOR THE LINE",

    // Conversion Calculator
    conversion_calc: "Conversion Calc",
    kitchen_converter: "Kitchen unit converter.",
    weight: "⚖️ Weight",
    volume: "🥛 Volume",
    temp: "🌡 Temp",
    portion_calc: "🍽 Portion",
    amount: "Amount",
    result: "Result",
    from: "From",
    to: "To",
    quick_reference: "Quick Reference",
    kitchen_temps: "Kitchen Temps",
    poultry: "Poultry",
    fish: "Fish",
    beef_med: "Beef Med",
    oven: "Oven",
    roast: "Roast",
    high: "High",
    orig_recipe: "Original Recipe Makes",
    scale_to: "Scale to",
    scale_factor: "Scale Factor",
    multiply_all: "Multiply all ingredients by this number",
    common_scales: "Common Scales",
    double_batch: "Double batch",
    half_batch: "Half batch",
    banquet_prep: "Banquet prep",
    tasting_menu: "Tasting menu",

    // Common Actions
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",

    // Toast Messages
    recipe_saved: "✅ Recipe saved!",
    recipe_deleted: "🗑 Recipe deleted",
    timer_started: "⏱ Timer started!",
    timer_removed: "🗑 Timer removed",
    prep_saved: "✅ Prep task saved!",
    prep_removed: "🗑 Task removed",
    profile_saved: "✅ Profile saved!",
    data_exported: "📤 Data exported!",
    all_cleared: "🗑 All data cleared",
    photo_added: "✅ Photo added! Save recipe to keep it",
    photo_removed: "🗑 Photo removed",
    processing_image: "📸 Processing image...",
    image_captured: "✅ Image captured! Fill in details manually",
    recipe_imported: "✅ Recipe imported! Review and save",
    extracting_text: "🔍 Extracting text from image...",
    text_extracted: "✨ Recipe details extracted!",
    ocr_failed: "⚠️ Could not extract text. Please enter manually.",
    set_duration: "⚠️ Set a duration first",
    name_required: "⚠️ Recipe name is required",
    task_required: "⚠️ Task name is required",
    url_required: "⚠️ Please enter a URL",
    invalid_url: "⚠️ Invalid URL format",
    select_image: "⚠️ Please select an image file",
    image_too_large: "⚠️ Image too large. Max",
    import_failed: "❌ Failed to import. Try manual entry.",
    fetch_failed: "❌ Failed to fetch recipe",
  },
  es: {
    // Onboarding
    continue: "Continuar →",
    skip: "Saltar introducción",
    next: "Siguiente →",
    ob_title_1: "Construido para la Línea,<br/>No para la Sala",
    ob_body_1:
      "Una herramienta profesional de gestión de recetas y preparación diseñada para la velocidad y precisión del servicio de cocina.",
    ob_title_2: "Listas de Preparación con Alertas de Caducidad",
    ob_body_2:
      "Rastrea tareas por estación en unidades de cocina reales — lote, sartén, caja — y recibe alertas antes de que los artículos caduquen durante el servicio.",
    ob_title_3: "Importa Recetas en Segundos",
    ob_body_3:
      "Escribe manualmente, pega un enlace o escanea una tarjeta de receta impresa. Los alérgenos y temporizadores se etiquetan automáticamente.",
    enter_kitchen: "Entrar a la Cocina 🔥",
    choose_language: "Choose Your Language<br/>Elige tu idioma",
    select_language: "Selecciona tu idioma preferido para comenzar",

    // Navigation
    home: "Inicio",
    recipes: "Recetas",
    timers: "Temporizadores",
    prep: "Preparación",
    profile: "Perfil",

    // Home Screen
    good_morning: "Buenos días",
    good_afternoon: "Buenas tardes",
    good_evening: "Buenas noches",
    chef: "Chef",
    tonight_shift: "Turno de Esta Noche",
    service_time: "Hora de Servicio",
    service_in: "Servicio en",
    service_tonight: "Servicio esta noche",
    service_started: "Servicio iniciado",
    your_station: "Tu Estación",
    saute_station: "Estación de Salteado",
    timer: "Temporizador",
    view: "Ver →",
    todays_prep_list: "⚡ Lista de Preparación de Hoy",
    all_clear: "¡Todo Listo! 🎉",
    tasks_remaining: "Tareas Pendientes",
    tap_to_view: "Toca para ver",
    tap_to_view_full: "Toca para ver la lista completa",
    urgent: "URGENTE",
    urgent_tap: "urgente · Toca para ver",
    recent_recipes: "Recetas Recientes",
    see_all: "Ver todas →",
    urgent_prep: "Preparación Urgente",
    full_list: "Lista completa →",
    no_urgent_tasks: "¡Sin tareas urgentes! 🎉",
    no_recipes_yet: "Aún no hay recetas — añade una en Recetas 📖",
    recipes_count: "Recetas",
    prep_done: "Preparación Hecha",
    loading: "Cargando…",

    // Recipe Page
    add_recipe: "Añadir Receta",
    search_recipes: "Buscar recetas...",
    filter_recipes: "Filtrar recetas",
    all: "Todas",
    appetizer: "Aperitivo",
    main: "Principal",
    dessert: "Postre",
    side: "Guarnición",
    sauce: "Salsa",
    drink: "Bebida",
    no_recipes_found:
      "No se encontraron recetas.<br/>Toca <strong>＋</strong> para añadir tu primera receta.",
    portions: "porciones",
    por: "por",

    // Recipe Detail
    scale_portions: "🔢 Escalar porciones",
    allergens: "⚠️ Alérgenos",
    no_allergens: "✓ Sin alérgenos declarados",
    ingredients: "Ingredientes",
    no_ingredients: "No se añadieron ingredientes.",
    method: "Método",
    no_method: "No se añadieron pasos del método.",
    view_plating: "🍽 Ver Guía de Emplatado",
    add_to_prep: "📋 Añadir a Lista de Preparación",
    start_timer: "⏱ Iniciar Temporizador",
    delete_recipe: "🗑 Eliminar Receta",
    delete_confirm: "¿Eliminar esta receta? Esto no se puede deshacer.",

    // Add Recipe Modal
    add_new_recipe: "Añadir Nueva Receta",
    choose_method: "Elige cómo te gustaría añadir tu receta.",
    manual_entry: "Entrada Manual",
    manual_desc: "Escribe todos los detalles de la receta",
    camera_import: "Importar con Cámara",
    camera_desc: "Escanea una tarjeta o página de receta",
    import_link: "Importar Enlace",
    import_link_desc: "Pega una URL de la web",

    // Manual Entry Form
    fill_details: "Completa todos los detalles de la receta a continuación.",
    recipe_name_req: "Nombre de la Receta *",
    recipe_name_placeholder: "ej. Confit de Pato",
    cook_time: "Tiempo de Cocción (HH:MM) *",
    cook_time_placeholder: "01:30",
    portions_label: "Porciones *",
    portions_placeholder: "4",
    emoji_icon: "Emoji/Ícono",
    emoji_placeholder: "🍽",
    category: "Categoría",
    station: "Estación",
    station_placeholder: "ej. Salteado, Parrilla, Pastelería",
    allergens_label: "Alérgenos (separados por comas)",
    allergens_placeholder: "lácteos, nueces, gluten",
    ingredients_label: "Ingredientes (uno por línea)",
    ingredients_placeholder:
      "2 patas de pato\n1 cucharada de sal\n500g de grasa de pato",
    method_label: "Método (un paso por línea)",
    method_placeholder:
      "Sazonar las patas de pato con sal\nSellar con la piel hacia abajo\nCubrir con grasa de pato",
    notes_label: "Notas del Chef",
    notes_placeholder: "Consejos, variaciones o notas personales",
    save_recipe: "Guardar Receta ✓",

    // Import Link
    import_from_link: "Importar desde Enlace",
    paste_url: "Pega la URL de una receta y extraeremos los detalles.",
    recipe_url: "URL de la Receta *",
    url_placeholder: "https://ejemplo.com/receta",
    import_recipe: "Importar Receta 🔗",

    // Timer Page
    no_active_timers: "Sin Temporizadores Activos",
    start_timer_desc:
      "Inicia un temporizador para rastrear tus tiempos de cocción con precisión",
    start_a_timer: "Iniciar Temporizador ⏱️",
    common_tasks: "Tareas Comunes",
    hard_boiled: "Huevos Duros",
    blanch_greens: "Blanquear Verduras",
    dry_pasta: "Pasta Seca",
    white_rice: "Arroz Blanco",
    min: "min",

    // New Timer Modal
    new_timer: "Nuevo Temporizador",
    choose_preset: "Elige un preajuste o establece una duración personalizada",
    quick_presets: "⚡ Preajustes Rápidos",
    custom_timer: "⏱️ Temporizador Personalizado",
    label: "Etiqueta",
    timer_label_placeholder: "ej. Confit de Pato · Horno",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    start_custom_timer: "Iniciar Temporizador ⏱",

    // Prep Page
    prep_list: "Lista de Preparación",
    of: "de",
    complete: "completo",
    today: "Hoy",
    done: "HECHO",
    normal: "NORMAL",
    low: "BAJO",
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    sunday: "Dom",
    no_prep_tasks:
      "Aún no hay tareas de preparación.<br/>Toca <strong>＋</strong> para añadir tu primera tarea.",
    no_tasks_here:
      "No hay tareas aquí.<br/>Toca <strong>＋</strong> para añadir una.",

    // Add Prep Modal
    new_prep_task: "Nueva Tarea de Preparación",
    task_name_req: "Nombre de la Tarea *",
    task_placeholder: "ej. Blanquear y enfriar judías verdes",
    quantity: "Cantidad",
    quantity_placeholder: "2 sartenes",
    ingredient: "Ingrediente",
    ingredient_placeholder: "Pata de pato",
    unit: "Unidad",
    add_ingredient: "＋ Añadir Ingrediente",
    day_of_week: "Día de la Semana",
    select_day: "Seleccionar día...",
    priority: "Prioridad",
    urgent_priority: "🔴 Urgente",
    normal_priority: "⚪ Normal",
    low_priority: "🟢 Bajo",
    add_to_list: "Añadir a la Lista ✓",

    // Profile Page
    edit_profile: "Editar Perfil",
    your_name: "Tu Nombre *",
    name_placeholder: "Chef Alex",
    role: "Rol",
    role_placeholder: "Cocinero de Salteado, Sous Chef…",
    restaurant: "Restaurante / Cocina",
    restaurant_placeholder: "La Gran Cocina",
    service_time_label: "Hora de Servicio",
    save_profile: "Guardar Perfil ✓",
    line_cook: "Cocinero de Línea",
    settings: "Configuración",
    appearance: "Apariencia",
    language_settings: "Idioma",
    change_language: "Cambiar Idioma",
    data_management: "Gestión de Datos",
    export_data: "Exportar Datos",
    export_desc: "Descargar respaldo como JSON",
    clear_all_data: "Borrar Todos los Datos",
    clear_desc: "Restablecer aplicación a estado de fábrica",
    about: "Acerca de",
    version: "FLAVOR FOLIO v1.0 · CONSTRUIDO PARA LA LÍNEA",

    // Conversion Calculator
    conversion_calc: "Calculadora de Conversión",
    kitchen_converter: "Convertidor de unidades de cocina.",
    weight: "⚖️ Peso",
    volume: "🥛 Volumen",
    temp: "🌡 Temperatura",
    portion_calc: "🍽 Porción",
    amount: "Cantidad",
    result: "Resultado",
    from: "De",
    to: "A",
    quick_reference: "Referencia Rápida",
    kitchen_temps: "Temperaturas de Cocina",
    poultry: "Aves",
    fish: "Pescado",
    beef_med: "Res Media",
    oven: "Horno",
    roast: "Asado",
    high: "Alto",
    orig_recipe: "Receta Original Para",
    scale_to: "Escalar a",
    scale_factor: "Factor de Escala",
    multiply_all: "Multiplica todos los ingredientes por este número",
    common_scales: "Escalas Comunes",
    double_batch: "Lote doble",
    half_batch: "Medio lote",
    banquet_prep: "Preparación para banquete",
    tasting_menu: "Menú degustación",

    // Common Actions
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    close: "Cerrar",

    // Toast Messages
    recipe_saved: "✅ ¡Receta guardada!",
    recipe_deleted: "🗑 Receta eliminada",
    timer_started: "⏱ ¡Temporizador iniciado!",
    timer_removed: "🗑 Temporizador eliminado",
    prep_saved: "✅ ¡Tarea de preparación guardada!",
    prep_removed: "🗑 Tarea eliminada",
    profile_saved: "✅ ¡Perfil guardado!",
    data_exported: "📤 ¡Datos exportados!",
    all_cleared: "🗑 Todos los datos borrados",
    photo_added: "✅ ¡Foto añadida! Guarda la receta para conservarla",
    photo_removed: "🗑 Foto eliminada",
    processing_image: "📸 Procesando imagen...",
    image_captured: "✅ ¡Imagen capturada! Completa los detalles manualmente",
    recipe_imported: "✅ ¡Receta importada! Revisa y guarda",
    extracting_text: "🔍 Extrayendo texto de la imagen...",
    text_extracted: "✨ ¡Detalles de la receta extraídos!",
    ocr_failed:
      "⚠️ No se pudo extraer el texto. Por favor ingresa manualmente.",
    set_duration: "⚠️ Establece una duración primero",
    name_required: "⚠️ El nombre de la receta es obligatorio",
    task_required: "⚠️ El nombre de la tarea es obligatorio",
    url_required: "⚠️ Por favor ingresa una URL",
    invalid_url: "⚠️ Formato de URL inválido",
    select_image: "⚠️ Por favor selecciona un archivo de imagen",
    image_too_large: "⚠️ Imagen demasiado grande. Máximo",
    import_failed: "❌ Error al importar. Intenta entrada manual.",
    fetch_failed: "❌ Error al obtener receta",

    // Additional Modal Translations
    select_category: "Seleccionar categoría...",
    starter: "Entrada",
    garnish: "Guarnición",
    reminder_frequency: "Frecuencia de Recordatorio",
    daily: "Diario",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
    dairy: "Lácteos",
    tree_nut: "Frutos Secos",
    soy: "Soja",
    allium: "Allium",
    gluten: "Gluten",
    peanut: "Cacahuete",
    shellfish: "Mariscos",
    sesame: "Sésamo",
    hour: "hora",
    hours: "horas",
    temperature: "Temperatura",
  },
};

let currentLang = DB.get("language") || "en";

function selectLanguage(lang) {
  currentLang = lang;
  DB.set("language", lang);

  // Update visual selection
  document
    .querySelectorAll(".lang-btn")
    .forEach((btn) => btn.classList.remove("selected"));
  document
    .querySelector(`[onclick*="selectLanguage('${lang}')"]`)
    ?.classList.add("selected");

  // Update checkmarks
  document.getElementById("check-en").textContent = lang === "en" ? "✓" : "";
  document.getElementById("check-es").textContent = lang === "es" ? "✓" : "";

  // Apply translations
  applyTranslations();

  // Update current language display in profile
  updateLanguageDisplay();
}

function changeLanguageFromProfile(lang) {
  currentLang = lang;
  DB.set("language", lang);

  // Update profile modal selection
  document
    .querySelectorAll("#m-language .lang-btn")
    .forEach((btn) => btn.classList.remove("selected"));
  document.getElementById(`lang-btn-${lang}`)?.classList.add("selected");

  // Update checkmarks
  document.getElementById("profile-check-en").textContent =
    lang === "en" ? "✓" : "";
  document.getElementById("profile-check-es").textContent =
    lang === "es" ? "✓" : "";

  // Apply translations
  applyTranslations();

  // Update current language display
  updateLanguageDisplay();

  // Close modal
  closeM("m-language");

  toast(
    "✅ " +
      (lang === "en"
        ? "Language changed to English"
        : "Idioma cambiado a Español"),
  );
}

function updateLanguageDisplay() {
  const display = document.getElementById("current-lang-display");
  if (display) {
    display.textContent = currentLang === "en" ? "English" : "Español";
  }
}

function applyTranslations() {
  const lang = currentLang;

  // Translate all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Translate all placeholders with data-i18n-placeholder attribute
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
}

function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

// ─────────────────────────────────────────────
//  DARK MODE
// ─────────────────────────────────────────────
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  DB.set("darkMode", isDark);

  const statusEl = document.getElementById("dark-mode-status");
  if (statusEl) {
    statusEl.textContent = isDark ? "On" : "Off";
  }

  toast(isDark ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
}

function initDarkMode() {
  const isDark = DB.get("darkMode");
  if (isDark) {
    document.body.classList.add("dark");
    const statusEl = document.getElementById("dark-mode-status");
    if (statusEl) {
      statusEl.textContent = "On";
    }
  }
}

// Initialize language on load
if (DB.get("language")) {
  currentLang = DB.get("language");
  setTimeout(() => {
    selectLanguage(currentLang);
    applyTranslations();
    updateLanguageDisplay();

    // Update profile modal selection
    document
      .querySelectorAll("#m-language .lang-btn")
      .forEach((btn) => btn.classList.remove("selected"));
    document
      .getElementById(`lang-btn-${currentLang}`)
      ?.classList.add("selected");
    document.getElementById("profile-check-en").textContent =
      currentLang === "en" ? "✓" : "";
    document.getElementById("profile-check-es").textContent =
      currentLang === "es" ? "✓" : "";
  }, 100);
}

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function navigate(s) {
  document
    .querySelectorAll(".screen")
    .forEach((e) => e.classList.remove("active"));
  const el = document.getElementById("screen-" + s);
  if (!el) return;
  el.classList.add("active");
  el.querySelector(".scroll")?.scrollTo(0, 0);

  // Refresh dynamic screens on every visit
  if (s === "home") renderHome();
  if (s === "recipes") renderRecipeList();
  if (s === "prep") renderPrepList();
  if (s === "timer") renderTimerList();
  if (s === "profile") renderProfile();
}

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("on"), 2500);
}

// ─────────────────────────────────────────────
//  MODALS
// ─────────────────────────────────────────────
function showM(id) {
  document.getElementById(id)?.classList.add("on");

  // Initialize manual entry form with one ingredient row
  if (id === "m-manual-entry") {
    const container = document.getElementById("ingredients-list");
    if (container && container.children.length === 0) {
      addIngredientRow();
    }
  }

  // Initialize prep task form with one ingredient row
  if (id === "m-addprep") {
    const container = document.getElementById("prep-ingredients-list");
    if (container && container.children.length === 0) {
      addPrepIngredientRow();
    }
  }
}
function closeM(id) {
  document.getElementById(id)?.classList.remove("on");
}
function bgC(e, id) {
  if (e.target.id === id) closeM(id);
}

// ─────────────────────────────────────────────
//  ONBOARDING
// ─────────────────────────────────────────────
let obI = -1; // Start at -1 for language selection
function obNext() {
  const currentSlide =
    obI === -1
      ? document.getElementById("obs-lang")
      : document.getElementById("obs" + obI);
  if (currentSlide) currentSlide.classList.remove("on");

  obI++;
  const nextSlide = document.getElementById("obs" + obI);
  if (nextSlide) {
    nextSlide.classList.add("on");
  } else {
    navigate("home");
  }
}

function finishOnboarding() {
  DB.set("onboarded", true);
  navigate("home");
}

// ─────────────────────────────────────────────
//  CLOCK
// ─────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const str = h + ":" + m;
  document.querySelectorAll(".sb-t").forEach((el) => (el.textContent = str));
}
updateClock();
setInterval(updateClock, 30000);

// ─────────────────────────────────────────────
//  HOME SCREEN
// ─────────────────────────────────────────────
function renderHome() {
  const profile = DB.get("profile") || {};
  const recipes = DB.getList("recipes");
  const prepList = DB.getList("prep");
  const timers = DB.getList("timers");

  // Greeting
  const hour = new Date().getHours();
  const greetKey =
    hour < 12 ? "good_morning" : hour < 17 ? "good_afternoon" : "good_evening";
  const emoji = hour < 12 ? " 🌅" : hour < 17 ? " ☀️" : " 🔪";
  const greet = t(greetKey) + emoji;
  const el_greeting = document.getElementById("home-greeting");
  const el_name = document.getElementById("home-name");
  if (el_greeting) el_greeting.textContent = greet;
  if (el_name)
    el_name.textContent = profile.name
      ? t("chef") + " " + profile.name
      : t("chef");

  // Avatar
  const avatar = document.getElementById("home-avatar");
  if (avatar) avatar.textContent = (profile.name || "C")[0].toUpperCase();

  // Station + service time
  const stationEl = document.getElementById("home-station");
  const serviceEl = document.getElementById("home-service-time");
  const countdownEl = document.getElementById("home-service-countdown");
  if (stationEl) stationEl.textContent = profile.station || "Your Station";
  if (serviceEl && profile.serviceTime) {
    const [sh, sm] = profile.serviceTime.split(":");
    const h = parseInt(sh),
      mi = parseInt(sm);
    const ampm = h >= 12 ? "PM" : "AM";
    const disp =
      (h % 12 || 12) + ":" + String(mi).padStart(2, "0") + " " + ampm;
    serviceEl.textContent = disp;

    // Countdown
    const now = new Date();
    const service = new Date();
    service.setHours(h, mi, 0);
    const diff = service - now;
    if (diff > 0) {
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (countdownEl) countdownEl.textContent = `Service in ${hrs}h ${mins}m`;
    } else {
      if (countdownEl) countdownEl.textContent = "Service started";
    }
  }

  // Prep stats
  const total = prepList.length;
  const done = prepList.filter((p) => p.done).length;
  const urgent = prepList.filter(
    (p) => !p.done && p.priority === "urgent",
  ).length;

  const prepCount = document.getElementById("home-prep-count");
  const prepSub = document.getElementById("home-prep-sub");
  const urgCount = document.getElementById("home-urgent-count");
  const prepStat = document.getElementById("home-prep-stat");

  if (prepCount)
    prepCount.textContent =
      total === 0 ? "All Clear! 🎉" : `${total - done} Tasks Remaining`;
  if (prepSub)
    prepSub.textContent =
      urgent > 0 ? `${urgent} urgent · Tap to view` : "Tap to view full list";
  if (urgCount) urgCount.textContent = urgent;
  if (prepStat) prepStat.textContent = `${done}/${total}`;

  // Recipe count
  const recipeCount = document.getElementById("home-recipe-count");
  if (recipeCount) recipeCount.textContent = recipes.length;

  // Active timer banner
  const running = timers.filter((t) => t.running && t.remaining > 0);
  const timerBanner = document.getElementById("home-active-timer");
  const timerLbl = document.getElementById("home-timer-lbl");
  if (timerBanner) {
    if (running.length > 0) {
      timerBanner.style.display = "flex";
      if (timerLbl) timerLbl.textContent = running[0].label || "Timer";
    } else {
      timerBanner.style.display = "none";
    }
  }

  // Recent recipes scroll
  const scroll = document.getElementById("home-recipe-scroll");
  if (scroll) {
    if (recipes.length === 0) {
      scroll.innerHTML =
        '<div class="rcard-empty">No recipes yet — add one in Recipes 📖</div>';
    } else {
      scroll.innerHTML = recipes
        .slice(-5)
        .reverse()
        .map((r) => {
          // Show photo if available, otherwise show emoji with gradient
          const imgContent = r.photo
            ? `<div class="rimg" style="background-image:url(${r.photo});background-size:cover;background-position:center"></div>`
            : `<div class="rimg" style="background:linear-gradient(135deg,#111,#2d6312)">${r.emoji || "🍽"}</div>`;

          return `
          <div class="rcard" onclick="openRecipeDetail('${r.id}')">
            ${imgContent}
            <div class="rbody">
              <div class="rname">${esc(r.name)}</div>
              <div class="rmeta">${r.portions || 1} por · ${esc(r.time || "—")}</div>
            </div>
          </div>
        `;
        })
        .join("");
    }
  }

  // Urgent prep on home
  const urgList = document.getElementById("home-urgent-list");
  if (urgList) {
    const urgentItems = prepList
      .filter((p) => !p.done && p.priority === "urgent")
      .slice(0, 5);
    if (urgentItems.length === 0) {
      urgList.innerHTML =
        '<div class="empty-state" style="padding:20px;font-size:13px">No urgent tasks 🎉</div>';
    } else {
      urgList.innerHTML = urgentItems
        .map(
          (p) => `
        <div class="qp-row" onclick="togglePrepFromHome('${p.id}', this)">
          <div class="qp-chk ${p.done ? "done" : ""}">${p.done ? "✓" : ""}</div>
          <div style="flex:1">
            <div class="qp-name ${p.done ? "done" : ""}">${esc(p.name)}</div>
            <div class="qp-meta">${esc(p.qty || "")}${p.station ? " · " + esc(p.station) : ""}</div>
          </div>
          <span class="badge urg">URGENT</span>
        </div>
      `,
        )
        .join("");
    }
  }
}

function togglePrepFromHome(id, row) {
  const list = DB.getList("prep");
  const item = list.find((p) => p.id === id);
  if (!item) return;
  item.done = !item.done;

  if (item.done) {
    const stats = DB.get("stats") || {};
    stats.prepsDone = (stats.prepsDone || 0) + 1;
    DB.set("stats", stats);
  }

  DB.set("prep", list);
  renderHome();
}

// ─────────────────────────────────────────────
//  RECIPES
// ─────────────────────────────────────────────
let activeCategory = "all";
let activeRecipeId = null;

function renderRecipeList(filter) {
  const search =
    document.getElementById("recipe-search")?.value?.toLowerCase() || "";
  let recipes = DB.getList("recipes");

  if (activeCategory && activeCategory !== "all") {
    recipes = recipes.filter((r) => r.category === activeCategory);
  }
  if (search) {
    recipes = recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        (r.station || "").toLowerCase().includes(search) ||
        (r.category || "").toLowerCase().includes(search),
    );
  }

  const list = document.getElementById("recipe-list");
  if (!list) return;

  if (recipes.length === 0) {
    list.innerHTML =
      '<div class="empty-state">No recipes found.<br/>Tap <strong>＋</strong> to add your first recipe.</div>';
    return;
  }

  list.innerHTML = recipes
    .map((r) => {
      // Show photo if available, otherwise show emoji
      const thumbContent = r.photo
        ? `<img src="${r.photo}" style="width:100%;height:100%;object-fit:cover" />`
        : `<div style="background:linear-gradient(135deg,#111,#2d5a12);width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px">${r.emoji || "🍽"}</div>`;

      return `
      <div class="rli" onclick="openRecipeDetail('${r.id}')">
        <div class="rli-thumb" style="overflow:hidden">
          ${thumbContent}
        </div>
        <div style="flex:1">
          <div class="rli-name">${esc(r.name)}</div>
          <div class="rli-meta">${capitalize(r.category || "Recipe")} · ${r.portions || 1} por · ${esc(r.time || "—")}</div>
          <div class="rli-tags">
            ${(r.allergens || [])
              .slice(0, 3)
              .map((a) => `<span class="tag r">⚠ ${esc(a)}</span>`)
              .join("")}
            ${r.station ? `<span class="tag n">${esc(r.station)}</span>` : ""}
          </div>
        </div>
        <div class="rli-arr">›</div>
      </div>
    `;
    })
    .join("");
}

function filterRecipes() {
  renderRecipeList();
}

function filterByCategory(el, cat) {
  activeCategory = cat;
  document
    .querySelectorAll("#recipe-chips .chip")
    .forEach((c) => c.classList.remove("on"));
  el.classList.add("on");
  renderRecipeList();
}

function saveRecipe() {
  const name = document.getElementById("r-name")?.value?.trim();
  if (!name) {
    toast("⚠️ Recipe name is required");
    return;
  }

  const allergenRaw = document.getElementById("r-allergens")?.value || "";
  const allergens = allergenRaw
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const ingRaw = document.getElementById("r-ingredients")?.value || "";
  const ingredients = ingRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const methodRaw = document.getElementById("r-method")?.value || "";
  const method = methodRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const recipe = {
    id: DB.uid(),
    name,
    emoji: document.getElementById("r-emoji")?.value?.trim() || "🍽",
    category: document.getElementById("r-category")?.value || "main",
    station: document.getElementById("r-station")?.value?.trim() || "",
    portions: parseInt(document.getElementById("r-portions")?.value) || 1,
    time: document.getElementById("r-time")?.value?.trim() || "",
    allergens,
    ingredients,
    method,
    notes: document.getElementById("r-notes")?.value?.trim() || "",
    createdAt: Date.now(),
  };

  // Add photo if one was captured
  const tempPhoto = DB.get("temp_recipe_photo");
  if (tempPhoto) {
    recipe.photo = tempPhoto.data;
    recipe.photoName = tempPhoto.name;
    // Clear temp photo
    localStorage.removeItem("ff_temp_recipe_photo");
    localStorage.removeItem("ff_temp_recipe_scan");
  }

  const list = DB.getList("recipes");
  list.push(recipe);
  DB.set("recipes", list);

  // Update stats
  const stats = DB.get("stats") || {};
  stats.recipesAdded = (stats.recipesAdded || 0) + 1;
  DB.set("stats", stats);

  // Clear form
  [
    "r-name",
    "r-emoji",
    "r-station",
    "r-portions",
    "r-time",
    "r-allergens",
    "r-ingredients",
    "r-method",
    "r-notes",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Clear photo preview
  const preview = document.getElementById("recipe-photo-preview");
  if (preview) preview.remove();

  closeM("m-manual-entry");
  toast("✅ Recipe saved!");
  renderRecipeList();
}

function openRecipeDetail(id) {
  const recipes = DB.getList("recipes");
  const r = recipes.find((r) => r.id === id);
  if (!r) return;

  activeRecipeId = id;

  // Reset unit system to metric when opening recipe
  currentUnitSystem = "metric";
  const slider = document.getElementById("unit-slider");
  const metricLabel = document.getElementById("unit-label-metric");
  const imperialLabel = document.getElementById("unit-label-imperial");
  if (slider) slider.classList.remove("imperial");
  if (metricLabel) metricLabel.classList.add("active");
  if (imperialLabel) imperialLabel.classList.remove("active");

  // Set hero - use photo as background if available
  const hero = document.getElementById("detail-hero");
  if (hero) {
    if (r.photo) {
      hero.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${r.photo})`;
      hero.style.backgroundSize = "cover";
      hero.style.backgroundPosition = "center";
    } else {
      hero.style.background = "linear-gradient(135deg, #111, #2d5a12)";
      hero.style.backgroundSize = "";
      hero.style.backgroundPosition = "";
    }
  }

  const emojiEl = document.getElementById("detail-emoji");
  if (emojiEl) {
    // Show emoji even if there's a photo, or hide it if you prefer
    emojiEl.textContent = r.emoji || "🍽";
  }

  document.getElementById("detail-title").textContent = r.name;

  // Display time badge
  const timeBadge = document.getElementById("detail-time-badge");
  if (timeBadge && r.time) {
    timeBadge.textContent = formatTimeDisplay(r.time);
  }

  document.getElementById("detail-sub").textContent =
    `${r.portions} portions · ${capitalize(r.category || "Recipe")}`;

  // Tags
  const tagsEl = document.getElementById("detail-tags");
  if (tagsEl) {
    tagsEl.innerHTML = [
      r.time ? `<span class="tag a">🔥 ${esc(r.time)}</span>` : "",
      r.station ? `<span class="tag n">${esc(r.station)}</span>` : "",
    ].join("");
  }

  // Allergens
  const allergEl = document.getElementById("detail-allergens");
  if (allergEl) {
    if (r.allergens && r.allergens.length > 0) {
      allergEl.innerHTML = r.allergens
        .map((a) => `<div class="achip has">⚠ ${esc(a)}</div>`)
        .join("");
    } else {
      allergEl.innerHTML =
        '<div class="achip free">✓ No allergens declared</div>';
    }
  }

  // Ingredients
  yBasePortions = r.portions || 1;
  yCurrent = r.portions || 1;
  currentIngredients = r.ingredients || [];
  renderIngredients();

  // Method
  const methodEl = document.getElementById("detail-method");
  if (methodEl) {
    if (r.method && r.method.length > 0) {
      methodEl.innerHTML = r.method
        .map(
          (step, i) => `
        <div class="step">
          <div class="step-n">${i + 1}</div>
          <div class="step-txt">${esc(step)}</div>
        </div>
      `,
        )
        .join("");
    } else {
      methodEl.innerHTML =
        '<div style="padding:14px 16px;color:var(--s3);font-size:13px">No method steps added.</div>';
    }
  }

  // Plating guide recipe name
  const pName = document.getElementById("plating-recipe-name");
  if (pName) pName.textContent = r.name + (r.station ? " · " + r.station : "");

  // Render plating guide
  renderPlatingGuide();

  navigate("detail");
}

function deleteCurrentRecipe() {
  if (!activeRecipeId) return;
  if (!confirm("Delete this recipe? This cannot be undone.")) return;
  const list = DB.getList("recipes").filter((r) => r.id !== activeRecipeId);
  DB.set("recipes", list);
  activeRecipeId = null;
  toast("🗑 Recipe deleted");
  navigate("recipes");
}

function addDetailToPrep() {
  if (!activeRecipeId) return;
  const r = DB.getList("recipes").find((r) => r.id === activeRecipeId);
  if (!r) return;

  const task = {
    id: DB.uid(),
    name: "Prep: " + r.name,
    qty: r.portions + " portions",
    station: r.station || "",
    due: "",
    priority: "normal",
    done: false,
    createdAt: Date.now(),
  };

  const list = DB.getList("prep");
  list.push(task);
  DB.set("prep", list);
  toast("📋 Added to prep list!");
}

// ─────────────────────────────────────────────
//  YIELD SCALER
// ─────────────────────────────────────────────
let yBasePortions = 1;
let yCurrent = 1;
let currentIngredients = [];

function adjY(d) {
  yCurrent = Math.max(1, yCurrent + d);
  document.getElementById("yv").textContent = yCurrent;
  document.getElementById("ym").textContent = yCurrent;
  renderIngredients();
}

function renderIngredients() {
  const container = document.getElementById("detail-ingredients");
  if (!container) return;
  const ratio = yCurrent / yBasePortions;

  if (currentIngredients.length === 0) {
    container.innerHTML =
      '<div style="padding:14px 16px;color:var(--s3);font-size:13px">No ingredients added.</div>';
    return;
  }

  container.innerHTML = currentIngredients
    .map((line) => {
      // First scale by portion ratio
      const scaled = line.replace(/(\d+\.?\d*)/g, (match) => {
        const n = parseFloat(match) * ratio;
        return Number.isInteger(n) ? n : parseFloat(n.toFixed(1));
      });

      // Then convert units if needed
      const converted = convertIngredient(scaled, 1);

      return `
      <div class="ing">
        <div class="ing-name">${esc(converted)}</div>
      </div>
    `;
    })
    .join("");
}

// ─────────────────────────────────────────────
//  PREP LIST
// ─────────────────────────────────────────────
let prepFilter = "all";
let currentPri = "urgent";

function renderPrepList() {
  const allPrep = DB.getList("prep");
  let filtered = allPrep;

  if (prepFilter === "urgent")
    filtered = allPrep.filter((p) => !p.done && p.priority === "urgent");
  else if (prepFilter === "today") filtered = allPrep.filter((p) => !p.done);
  else if (prepFilter === "done") filtered = allPrep.filter((p) => p.done);

  const total = allPrep.length;
  const done = allPrep.filter((p) => p.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // Update progress
  const pt = document.getElementById("prep-progress-text");
  const pp = document.getElementById("prep-progress-pct");
  const pf = document.getElementById("prep-pfill");
  if (pt) pt.textContent = `${done} of ${total} complete`;
  if (pp) pp.textContent = pct + "%";
  if (pf) pf.style.width = pct + "%";

  // Date
  const dateEl = document.getElementById("prep-date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  const container = document.getElementById("prep-list");
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No tasks here.<br/>Tap <strong>＋</strong> to add one.</div>';
    return;
  }

  // Group by status for 'all' view
  if (prepFilter === "all") {
    const urgent = allPrep.filter((p) => !p.done && p.priority === "urgent");
    const normal = allPrep.filter((p) => !p.done && p.priority !== "urgent");
    const doneItems = allPrep.filter((p) => p.done);

    let html = "";
    if (urgent.length)
      html +=
        `<div class="psec urg">⚡ Urgent</div>` +
        urgent.map(prepItemHTML).join("");
    if (normal.length)
      html +=
        `<div class="psec today">Today</div>` +
        normal.map(prepItemHTML).join("");
    if (doneItems.length)
      html +=
        `<div class="psec done">✓ Completed</div>` +
        doneItems.map(prepItemHTML).join("");
    container.innerHTML = html;
  } else {
    container.innerHTML = filtered.map(prepItemHTML).join("");
  }
}

function prepItemHTML(p) {
  const badgeClass = p.done
    ? "ok"
    : p.priority === "urgent"
      ? "urg"
      : p.priority === "low"
        ? "gr"
        : "gr";
  const badgeText = p.done
    ? "DONE"
    : p.priority === "urgent"
      ? "URGENT"
      : capitalize(p.priority || "normal");

  // Format ingredients display with individual checkboxes
  let ingredientsHTML = "";
  if (p.ingredients && Array.isArray(p.ingredients)) {
    if (typeof p.ingredients[0] === "object") {
      // New format with quantity and unit
      ingredientsHTML = p.ingredients
        .map((ing, idx) => {
          const ingId = `${p.id}-ing-${idx}`;
          const isDone = p.ingredientsDone && p.ingredientsDone[idx];
          return `
          <div class="prep-ing-row" onclick="event.stopPropagation();togglePrepIngredient('${p.id}', ${idx})">
            <div class="prep-ing-chk ${isDone ? "done" : ""}">${isDone ? "✓" : ""}</div>
            <div class="prep-ing-text ${isDone ? "done" : ""}">
              ${ing.quantity ? '<span class="prep-qty">' + esc(ing.quantity) + "</span> " : ""}
              ${ing.unit ? '<span class="prep-unit">' + esc(ing.unit) + "</span> " : ""}
              <span class="prep-name">${esc(ing.name)}</span>
            </div>
          </div>
        `;
        })
        .join("");
    } else {
      // Old format (just strings)
      ingredientsHTML = p.ingredients
        .map((ing, idx) => {
          const isDone = p.ingredientsDone && p.ingredientsDone[idx];
          return `
          <div class="prep-ing-row" onclick="event.stopPropagation();togglePrepIngredient('${p.id}', ${idx})">
            <div class="prep-ing-chk ${isDone ? "done" : ""}">${isDone ? "✓" : ""}</div>
            <div class="prep-ing-text ${isDone ? "done" : ""}">${esc(ing)}</div>
          </div>
        `;
        })
        .join("");
    }
  }

  return `
    <div class="prep-card">
      <div class="prep-card-header">
        <div style="flex:1">
          <div class="prep-dish-name">${esc(p.name)}</div>
          <div class="prep-meta">${[p.day ? capitalize(p.day) : "", p.station].filter(Boolean).join(" · ")}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge ${badgeClass}">${badgeText}</span>
          <button class="prep-delete" onclick="event.stopPropagation();deletePrepItem('${p.id}')">✕</button>
        </div>
      </div>
      <div class="prep-ingredients">
        ${ingredientsHTML}
      </div>
    </div>
  `;
}

function togglePrep(id) {
  const list = DB.getList("prep");
  const item = list.find((p) => p.id === id);
  if (!item) return;
  item.done = !item.done;

  if (item.done) {
    const stats = DB.get("stats") || {};
    stats.prepsDone = (stats.prepsDone || 0) + 1;
    DB.set("stats", stats);
  }

  DB.set("prep", list);
  renderPrepList();
}

function togglePrepIngredient(prepId, ingredientIndex) {
  const list = DB.getList("prep");
  const item = list.find((p) => p.id === prepId);
  if (!item) return;

  // Initialize ingredientsDone array if it doesn't exist
  if (!item.ingredientsDone) {
    item.ingredientsDone = [];
  }

  // Toggle this ingredient
  item.ingredientsDone[ingredientIndex] =
    !item.ingredientsDone[ingredientIndex];

  // Check if all ingredients are done
  if (item.ingredients) {
    const allDone = item.ingredients.every(
      (_, idx) => item.ingredientsDone[idx],
    );
    if (allDone && !item.done) {
      item.done = true;
      const stats = DB.get("stats") || {};
      stats.prepsDone = (stats.prepsDone || 0) + 1;
      DB.set("stats", stats);
    }
  }

  DB.set("prep", list);
  renderPrepList();
}

function filterPrepByDay(el, day) {
  // Remove 'on' from all day chips
  document.querySelectorAll(".chips .chip").forEach((chip) => {
    // Only remove from sibling chips in the same row
    if (chip.parentElement === el.parentElement) {
      chip.classList.remove("on");
    }
  });

  el.classList.add("on");

  // Filter prep list by day
  const allPrep = DB.getList("prep");
  const filtered = allPrep.filter((p) => p.day === day);

  const container = document.getElementById("prep-list");
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">No tasks for ${capitalize(day)}.<br/>Tap <strong>＋</strong> to add one.</div>`;
    return;
  }

  container.innerHTML = filtered.map(prepItemHTML).join("");
}

function deletePrepItem(id) {
  const list = DB.getList("prep").filter((p) => p.id !== id);
  DB.set("prep", list);
  renderPrepList();
  toast("🗑 Task removed");
}

function filterPrep(el, filter) {
  prepFilter = filter;
  document
    .querySelectorAll("#prep-chips .chip")
    .forEach((c) => c.classList.remove("on"));
  el.classList.add("on");
  renderPrepList();
}

function savePrepTask() {
  const name = document.getElementById("pt-name")?.value?.trim();
  if (!name) {
    toast("⚠️ Task name is required");
    return;
  }

  const task = {
    id: DB.uid(),
    name,
    qty: document.getElementById("pt-qty")?.value?.trim() || "",
    station: document.getElementById("pt-station")?.value?.trim() || "",
    due: document.getElementById("pt-due")?.value || "",
    priority: currentPri,
    done: false,
    createdAt: Date.now(),
  };

  const list = DB.getList("prep");
  list.push(task);
  DB.set("prep", list);

  // Clear form
  ["pt-name", "pt-qty", "pt-station", "pt-due"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  currentPri = "urgent";
  document.querySelectorAll(".pribtn").forEach((b) => b.classList.remove("on"));
  document.getElementById("pri-urgent")?.classList.add("on");

  closeM("m-addprep");
  toast("✅ Task added!");
  renderPrepList();
}

function setPri(el, pri) {
  currentPri = pri;
  document.querySelectorAll(".pribtn").forEach((b) => b.classList.remove("on"));
  el.classList.add("on");
}

// ─────────────────────────────────────────────
//  TIMERS
// ─────────────────────────────────────────────
let timerInterval = null;

function startTimerLoop() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    const timers = DB.getList("timers");
    let changed = false;

    timers.forEach((t) => {
      if (t.running && t.remaining > 0) {
        t.remaining--;
        changed = true;
        if (t.remaining === 0) {
          t.running = false;
          notifyTimerDone(t.label);
        }
      }
    });

    if (changed) {
      DB.set("timers", timers);
      // Update any visible timer displays
      updateTimerDisplays(timers);
    }
  }, 1000);
}

function updateTimerDisplays(timers) {
  // Update home banner
  const running = timers.filter((t) => t.running && t.remaining > 0);
  const homeT = document.getElementById("homeT");
  const homeBanner = document.getElementById("home-active-timer");
  const homeLbl = document.getElementById("home-timer-lbl");

  if (running.length > 0) {
    if (homeT) homeT.textContent = fmtTime(running[0].remaining);
    if (homeBanner) homeBanner.style.display = "flex";
    if (homeLbl) homeLbl.textContent = running[0].label || "Timer";
  } else {
    if (homeBanner) homeBanner.style.display = "none";
  }

  // Update timer screen if visible
  const timerScreen = document.getElementById("screen-timer");
  if (timerScreen?.classList.contains("active")) {
    timers.forEach((t) => {
      const el = document.getElementById("tmr-disp-" + t.id);
      if (el) el.textContent = fmtTime(t.remaining);
      const btn = document.getElementById("tmr-btn-" + t.id);
      if (btn) btn.textContent = t.running ? "⏸" : "▶";
      const bar = document.getElementById("tmr-bar-" + t.id);
      if (bar && t.total > 0)
        bar.style.width = (t.remaining / t.total) * 100 + "%";
    });
  }

  // Update timer badge count
  updateTimerBadge(running.length);
}

function updateTimerBadge(count) {
  const badges = document.querySelectorAll(".timer-badge");
  badges.forEach((badge) => {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  });

  // Update favicon with count
  updateFavicon(count);
}

function updateFavicon(count) {
  const favicon = document.getElementById("favicon");
  if (!favicon) return;

  if (count > 0) {
    // Create canvas to draw badge on favicon
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    // Draw leaf emoji
    ctx.font = "100px Arial";
    ctx.fillText("🍃", 10, 100);

    // Draw badge circle
    ctx.fillStyle = "#d43030";
    ctx.beginPath();
    ctx.arc(100, 28, 30, 0, 2 * Math.PI);
    ctx.fill();

    // Draw white border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw count text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(count > 9 ? "9+" : count.toString(), 100, 28);

    // Update favicon
    favicon.href = canvas.toDataURL();
  } else {
    // Reset to default leaf emoji
    favicon.href =
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🍃</text></svg>";
  }
}

function notifyTimerDone(label) {
  toast("⏰ Timer done: " + (label || "Timer"));

  // Push notification
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Timer Done!", {
      body: label || "Your timer has finished.",
      icon: "⏰",
      requireInteraction: true,
    });
  }

  // Start continuous alarm sound
  playAlarmSound();
}

// Continuous alarm sound
let alarmInterval = null;
let alarmAudio = null;

function playAlarmSound() {
  // Stop any existing alarm
  stopAlarmSound();

  // Create audio context for beep sound
  const playBeep = () => {
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  // Play immediately
  playBeep();

  // Continue playing every 2 seconds
  alarmInterval = setInterval(playBeep, 2000);

  // Show stop alarm button
  showStopAlarmButton();
}

function stopAlarmSound() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  hideStopAlarmButton();
}

function showStopAlarmButton() {
  let btn = document.getElementById("stop-alarm-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "stop-alarm-btn";
    btn.innerHTML = "🔕 Stop Alarm";
    btn.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      padding: 16px 32px;
      background: var(--red);
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 700;
      font-family: "DM Sans", sans-serif;
      box-shadow: 0 8px 24px rgba(212,48,48,0.4);
      cursor: pointer;
      z-index: 999;
      animation: pulse 1s infinite;
    `;
    btn.onclick = stopAlarmSound;
    document.body.appendChild(btn);

    // Add pulse animation
    if (!document.getElementById("pulse-style")) {
      const style = document.createElement("style");
      style.id = "pulse-style";
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

function hideStopAlarmButton() {
  const btn = document.getElementById("stop-alarm-btn");
  if (btn) {
    btn.remove();
  }
}

function fmtTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return [h, m, sc].map((v) => String(v).padStart(2, "0")).join(":");
}

function renderTimerList() {
  const timers = DB.getList("timers");
  const container = document.getElementById("timer-list");
  const noTimers = document.getElementById("no-timers");
  const commonSection = document.getElementById("timer-common-section");
  const commonContainer = document.getElementById("timer-common-container");

  if (!container) return;

  if (timers.length === 0) {
    container.innerHTML = "";
    if (noTimers) noTimers.style.display = "flex";
    // Always show Common Tasks - they should be visible even with no active timers
    if (commonSection) commonSection.style.display = "block";
    if (commonContainer) commonContainer.style.display = "block";
    return;
  }

  if (noTimers) noTimers.style.display = "none";
  if (commonSection) commonSection.style.display = "block";
  if (commonContainer) commonContainer.style.display = "block";

  container.innerHTML = timers
    .map(
      (t) => `
    <div class="timer-row" id="tmr-row-${t.id}">
      <div style="flex:1">
        <div class="timer-name">${esc(t.label || "Timer")}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div id="tmr-disp-${t.id}" class="timer-count" style="color:${t.remaining < 60 ? "var(--red)" : "var(--gd)"}">
          ${fmtTime(t.remaining)}
        </div>
        <button class="btn-ico" id="tmr-btn-${t.id}" onclick="toggleTimerById('${t.id}')">
          ${t.running ? "⏸" : "▶"}
        </button>
        <button class="btn-ico" onclick="deleteTimer('${t.id}')" style="background:#fceaea;color:var(--red)">✕</button>
      </div>
    </div>
    ${t.total > 0 ? `<div style="margin:0 16px 4px"><div class="pbar"><div class="pfill" id="tmr-bar-${t.id}" style="width:${Math.round((t.remaining / t.total) * 100)}%"></div></div></div>` : ""}
  `,
    )
    .join("");
}

function saveTimer() {
  const label = document.getElementById("tmr-label")?.value?.trim() || "Timer";
  const h = parseInt(document.getElementById("tmr-h")?.value) || 0;
  const m = parseInt(document.getElementById("tmr-m")?.value) || 0;
  const s = parseInt(document.getElementById("tmr-s")?.value) || 0;
  const total = h * 3600 + m * 60 + s;

  if (total === 0) {
    toast("⚠️ Set a duration first");
    return;
  }

  const timer = {
    id: DB.uid(),
    label,
    total,
    remaining: total,
    running: true,
    createdAt: Date.now(),
  };

  const list = DB.getList("timers");
  list.push(timer);
  DB.set("timers", list);

  // Stats
  const stats = DB.get("stats") || {};
  stats.timersRun = (stats.timersRun || 0) + 1;
  DB.set("stats", stats);

  ["tmr-label", "tmr-h", "tmr-m", "tmr-s"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  closeM("m-addtimer");
  toast("⏱ Timer started!");
  renderTimerList();
  startTimerLoop();
}

function quickAddTimer(minutes, customLabel) {
  const label =
    customLabel ||
    (minutes >= 60 ? minutes / 60 + "h timer" : minutes + " min timer");
  const total = minutes * 60;
  const timer = {
    id: DB.uid(),
    label,
    total,
    remaining: total,
    running: true,
    createdAt: Date.now(),
  };
  const list = DB.getList("timers");
  list.push(timer);
  DB.set("timers", list);

  const stats = DB.get("stats") || {};
  stats.timersRun = (stats.timersRun || 0) + 1;
  DB.set("stats", stats);

  closeM("m-addtimer");
  toast("⏱ " + label + " started!");
  renderTimerList();
  startTimerLoop();
}

function toggleTimerById(id) {
  const list = DB.getList("timers");
  const t = list.find((t) => t.id === id);
  if (!t) return;
  t.running = !t.running;
  DB.set("timers", list);
  renderTimerList();

  // Update badge count
  const runningCount = list.filter((t) => t.running && t.remaining > 0).length;
  updateTimerBadge(runningCount);

  if (t.running) startTimerLoop();
}

function deleteTimer(id) {
  const list = DB.getList("timers").filter((t) => t.id !== id);
  DB.set("timers", list);
  renderTimerList();

  // Update badge count
  const runningCount = list.filter((t) => t.running && t.remaining > 0).length;
  updateTimerBadge(runningCount);

  toast("🗑 Timer removed");
}

// ─────────────────────────────────────────────
//  PROFILE
// ─────────────────────────────────────────────
function renderProfile() {
  const p = DB.get("profile") || {};
  const stats = DB.get("stats") || {};
  const recipes = DB.getList("recipes");
  const prep = DB.getList("prep");

  const name = p.name || "Chef";
  document.getElementById("profile-avatar").textContent = name[0].toUpperCase();
  document.getElementById("profile-name").textContent = "Chef " + name;
  document.getElementById("profile-role").textContent =
    [p.role, p.kitchen].filter(Boolean).join(" · ") || "Line Cook";
  document.getElementById("profile-station").textContent =
    "🔥 " + (p.station || "Your Station");

  document.getElementById("stat-recipes").textContent = recipes.length;
  document.getElementById("stat-preps").textContent = prep.filter(
    (p) => p.done,
  ).length;
  document.getElementById("stat-timers").textContent = stats.timersRun || 0;
}

function openEditProfile() {
  const p = DB.get("profile") || {};
  document.getElementById("ep-name").value = p.name || "";
  document.getElementById("ep-role").value = p.role || "";
  document.getElementById("ep-kitchen").value = p.kitchen || "";
  document.getElementById("ep-station").value = p.station || "";
  document.getElementById("ep-service").value = p.serviceTime || "18:00";
  showM("m-edit-profile");
}

function saveProfile() {
  const profile = {
    name: document.getElementById("ep-name")?.value?.trim() || "",
    role: document.getElementById("ep-role")?.value?.trim() || "",
    kitchen: document.getElementById("ep-kitchen")?.value?.trim() || "",
    station: document.getElementById("ep-station")?.value?.trim() || "",
    serviceTime: document.getElementById("ep-service")?.value || "18:00",
  };
  DB.set("profile", profile);
  closeM("m-edit-profile");
  toast("✅ Profile saved!");
  renderProfile();
  renderHome();
}

// ─────────────────────────────────────────────
//  DATA MANAGEMENT
// ─────────────────────────────────────────────
function exportData() {
  const data = {
    profile: DB.get("profile"),
    recipes: DB.getList("recipes"),
    prep: DB.getList("prep"),
    stats: DB.get("stats"),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flavor-folio-backup.json";
  a.click();
  URL.revokeObjectURL(url);
  toast("📤 Data exported!");
}

function clearAllData() {
  if (!confirm("Clear ALL data? This cannot be undone.")) return;
  ["profile", "recipes", "prep", "timers", "stats", "onboarded"].forEach((k) =>
    localStorage.removeItem("ff_" + k),
  );
  toast("🗑 All data cleared");
  navigate("home");
  renderHome();
}

// ─────────────────────────────────────────────
//  PLATING GUIDE
// ─────────────────────────────────────────────
let currentPlatingPhoto = null;

function openEditPlating() {
  if (!activeRecipeId) return;

  // Load existing plating data
  const plating = DB.get("plating_" + activeRecipeId) || {};

  // Set photo preview
  currentPlatingPhoto = plating.photo || null;
  const preview = document.getElementById("plating-photo-preview");
  if (currentPlatingPhoto) {
    preview.innerHTML = `<img src="${currentPlatingPhoto}" style="width:100%;height:100%;object-fit:cover">`;
  } else {
    preview.innerHTML = `
      <div style="text-align:center;color:var(--s3);font-size:13px">
        <div style="font-size:48px;margin-bottom:8px;opacity:0.5">📸</div>
        <div>No photo selected</div>
      </div>
    `;
  }

  // Set instructions
  const instructions = plating.instructions || [];
  document.getElementById("plating-instructions").value =
    instructions.join("\n");

  // Set notes
  document.getElementById("plating-notes").value = plating.notes || "";

  showM("m-edit-plating");
}

function handlePlatingPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    currentPlatingPhoto = e.target.result;
    const preview = document.getElementById("plating-photo-preview");
    preview.innerHTML = `<img src="${currentPlatingPhoto}" style="width:100%;height:100%;object-fit:cover">`;
  };
  reader.readAsDataURL(file);
}

function removePlatingPhoto() {
  currentPlatingPhoto = null;
  const preview = document.getElementById("plating-photo-preview");
  preview.innerHTML = `
    <div style="text-align:center;color:var(--s3);font-size:13px">
      <div style="font-size:48px;margin-bottom:8px;opacity:0.5">📸</div>
      <div>No photo selected</div>
    </div>
  `;
  document.getElementById("plating-photo-input").value = "";
}

function savePlatingGuide() {
  if (!activeRecipeId) return;

  const instructionsText = document.getElementById(
    "plating-instructions",
  ).value;
  const instructions = instructionsText
    .split("\n")
    .filter((line) => line.trim());
  const notes = document.getElementById("plating-notes").value.trim();

  const platingData = {
    photo: currentPlatingPhoto,
    instructions: instructions,
    notes: notes,
  };

  DB.set("plating_" + activeRecipeId, platingData);
  closeM("m-edit-plating");
  toast("✅ Plating guide saved!");

  // Update the display
  renderPlatingGuide();
}

function renderPlatingGuide() {
  if (!activeRecipeId) return;

  const plating = DB.get("plating_" + activeRecipeId) || {};

  // Update photo display
  const photoDisplay = document.getElementById("plating-photo-display");
  if (plating.photo) {
    photoDisplay.innerHTML = `<img src="${plating.photo}" style="width:100%;height:100%;object-fit:cover">`;
  } else {
    photoDisplay.innerHTML = `
      <div style="text-align:center;color:var(--s3);font-size:13px;padding:24px">
        <div style="font-size:48px;margin-bottom:8px;opacity:0.5">📸</div>
        <div>No photo added yet</div>
        <div style="font-size:11px;margin-top:4px">Tap ✏️ to add a photo</div>
      </div>
    `;
  }

  // Update instructions
  const seqContainer = document.getElementById("plating-sequence-container");
  if (plating.instructions && plating.instructions.length > 0) {
    seqContainer.innerHTML = plating.instructions
      .map((inst, i) => {
        // Remove number prefix if exists
        const text = inst.replace(/^\d+\.\s*/, "");
        return `<div class="ps-seq"><div class="ps-n">${i + 1}</div><div class="ps-txt">${esc(text)}</div></div>`;
      })
      .join("");
  }

  // Update notes
  const notesDisplay = document.getElementById("plating-notes-display");
  if (plating.notes) {
    notesDisplay.innerHTML = `
      <div class="chef-lbl">Chef's Notes</div>
      <div class="chef-txt">${esc(plating.notes)}</div>
      <div class="chef-date">Flavor Folio · Plating Reference</div>
    `;
  }
}

// ─────────────────────────────────────────────
//  CALCULATOR
// ─────────────────────────────────────────────
const WF = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
const VF = {
  ml: 1,
  L: 1000,
  "fl oz": 29.5735,
  cup: 236.588,
  tbsp: 14.7868,
  tsp: 4.92892,
};

function cW() {
  const v = parseFloat(document.getElementById("w-in").value);
  const f = document.getElementById("w-from").value;
  const t = document.getElementById("w-to").value;
  const o = document.getElementById("w-out");
  if (isNaN(v)) {
    o.textContent = "—";
    return;
  }
  const r = (v * WF[f]) / WF[t];
  o.textContent =
    (Number.isInteger(r) ? r : parseFloat(r.toFixed(3))) + " " + t;
}
function cV() {
  const v = parseFloat(document.getElementById("v-in").value);
  const f = document.getElementById("v-from").value;
  const t = document.getElementById("v-to").value;
  const o = document.getElementById("v-out");
  if (isNaN(v)) {
    o.textContent = "—";
    return;
  }
  const r = (v * VF[f]) / VF[t];
  o.textContent =
    (Number.isInteger(r) ? r : parseFloat(r.toFixed(3))) + " " + t;
}
function cT() {
  const v = parseFloat(document.getElementById("t-in").value);
  const f = document.getElementById("t-from").value;
  const t = document.getElementById("t-to").value;
  const o = document.getElementById("t-out");
  if (isNaN(v)) {
    o.textContent = "—";
    return;
  }
  let r =
    f === "°F" && t === "°C"
      ? ((v - 32) * 5) / 9
      : f === "°C" && t === "°F"
        ? (v * 9) / 5 + 32
        : v;
  o.textContent = r.toFixed(1) + "°";
}
function cP() {
  const a = parseFloat(document.getElementById("p-orig").value);
  const b = parseFloat(document.getElementById("p-new").value);
  const o = document.getElementById("p-out");
  const h = document.getElementById("p-hint");
  if (isNaN(a) || isNaN(b) || a === 0) {
    o.textContent = "—";
    return;
  }
  o.textContent = "×" + (b / a).toFixed(2);
  h.textContent = a + " portions → " + b + " portions";
}
function setCalcTab(el, tab) {
  el.closest(".chips")
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("on"));
  el.classList.add("on");
  ["weight", "volume", "temp", "portion"].forEach((t) => {
    const p = document.getElementById("calc-" + t);
    if (p) p.classList.toggle("on", t === tab);
  });
}

// ─────────────────────────────────────────────
//  CHIP FILTER (generic)
// ─────────────────────────────────────────────
function setChip(el) {
  el.closest(".chips")
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("on"));
  el.classList.add("on");
}

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─────────────────────────────────────────────
//  INIT — runs on page load
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dark mode
  initDarkMode();

  // Request notifications permission for timer alerts
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  // Wire up edit profile button correctly
  const editBtn = document.querySelector(
    "[onclick=\"showM('m-edit-profile')\"]",
  );
  if (editBtn) editBtn.setAttribute("onclick", "openEditProfile()");

  // Start timer loop if any timers exist
  const timers = DB.getList("timers");
  if (timers.some((t) => t.running)) {
    startTimerLoop();
  }

  // Update timer badge on load
  const runningCount = timers.filter(
    (t) => t.running && t.remaining > 0,
  ).length;
  updateTimerBadge(runningCount);

  // Decide starting screen
  const onboarded = DB.get("onboarded");
  if (onboarded) {
    navigate("home");
  }
  // else onboarding screen already shown via .active on #screen-ob
});

// ─────────────────────────────────────────────
//  NEW RECIPE ENTRY FUNCTIONS
// ─────────────────────────────────────────────

let ingredientCounter = 0;
let selectedAllergens = [];
let selectedReminder = null;
let editIngredientCounter = 0;
let editSelectedAllergens = [];
let editSelectedReminder = null;
let currentUnitSystem = "metric"; // 'metric' or 'imperial'
let currentRecipeIngredients = []; // Store original ingredients for conversion

// Format time input as HH:MM
function formatTimeInput(input) {
  let value = input.value.replace(/[^0-9]/g, ""); // Remove non-digits

  if (value.length >= 2) {
    // Add colon after first 2 digits
    value = value.substring(0, 2) + ":" + value.substring(2, 4);
  }

  input.value = value;
}

// Convert HH:MM format to display format (e.g., "1h 30m")
function formatTimeDisplay(timeStr) {
  if (!timeStr) return "";

  const parts = timeStr.split(":");
  if (parts.length !== 2) return timeStr;

  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;

  if (hours === 0 && minutes === 0) return timeStr;

  let display = "";
  if (hours > 0) display += hours + "h";
  if (hours > 0 && minutes > 0) display += " ";
  if (minutes > 0) display += minutes + "m";

  return display || timeStr;
}

// Camera for recipe photo
function openCameraForRecipe() {
  // Create hidden file input for camera/photo selection
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment"; // Use camera if available

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast("⚠️ Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast("⚠️ Image too large. Max 5MB");
      return;
    }

    // Read and store the image
    const reader = new FileReader();
    reader.onload = (event) => {
      // Store image data in localStorage temporarily
      DB.set("temp_recipe_photo", {
        data: event.target.result,
        name: file.name,
        timestamp: Date.now(),
      });

      toast("✅ Photo added! Save recipe to keep it");

      // Show preview if there's a preview container
      showRecipePhotoPreview(event.target.result);
    };

    reader.onerror = () => {
      toast("❌ Failed to read image");
    };

    reader.readAsDataURL(file);
  };

  // Trigger file input
  input.click();
}

function showRecipePhotoPreview(imageData) {
  // Check if we're in the manual entry modal
  const modalTitle = document.querySelector("#m-manual-entry .mtitle");
  if (!modalTitle) return;

  // Remove existing preview if any
  const existingPreview = document.getElementById("recipe-photo-preview");
  if (existingPreview) existingPreview.remove();

  // Create preview element
  const preview = document.createElement("div");
  preview.id = "recipe-photo-preview";
  preview.style.cssText = "margin:10px 0 15px;position:relative";
  preview.innerHTML = `
    <div style="position:relative;border-radius:16px;overflow:hidden;box-shadow:var(--shadow-md)">
      <img src="${imageData}" style="width:100%;height:auto;max-height:200px;object-fit:cover;display:block" />
      <button onclick="removeRecipePhoto()" style="position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.7);color:#fff;border:none;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
    </div>
    <div style="font-size:11px;color:var(--s3);margin-top:6px;text-align:center">📸 Photo will be saved with recipe</div>
  `;

  // Insert after the subtitle
  const msub = document.querySelector("#m-manual-entry .msub");
  if (msub) {
    msub.after(preview);
  }
}

function removeRecipePhoto() {
  localStorage.removeItem("ff_temp_recipe_photo");
  const preview = document.getElementById("recipe-photo-preview");
  if (preview) preview.remove();
  toast("🗑 Photo removed");
}

// Add ingredient row with quantity and unit
function addIngredientRow() {
  const container = document.getElementById("ingredients-list");
  if (!container) return;

  const id = `ing-${ingredientCounter++}`;
  const row = document.createElement("div");
  row.id = id;
  row.style.cssText =
    "display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:10px;align-items:end";
  row.innerHTML = `
    <div>
      ${container.children.length === 0 ? '<label class="flbl">Ingredient</label>' : ""}
      <input class="finput ingredient-name" style="margin:0" type="text" placeholder="Duck leg" data-ing-name />
    </div>
    <div>
      ${container.children.length === 0 ? '<label class="flbl">Qty</label>' : ""}
      <input class="finput" style="margin:0" type="number" step="0.01" placeholder="6" data-ing-qty />
    </div>
    <div>
      ${container.children.length === 0 ? '<label class="flbl">Unit</label>' : ""}
      <select class="finput" style="margin:0" data-ing-unit>
        <option value="g">g</option>
        <option value="kg">kg</option>
        <option value="L">L</option>
        <option value="ml">ml</option>
        <option value="quart">quart</option>
        <option value="cup">cup</option>
        <option value="gallon">gallon</option>
        <option value="tsp">tsp</option>
        <option value="tbsp">tbsp</option>
        <option value="bunch">bunch</option>
        <option value="sprig">sprig</option>
        <option value="as required">as required</option>
        <option value="to taste">to taste</option>
        <option value="can">can</option>
        <option value="oz">oz</option>
        <option value="lb">lb</option>
        <option value="no.">no.</option>
      </select>
    </div>
    <button class="btn-ico" onclick="removeIngredient('${id}')" style="width:36px;height:36px;font-size:16px;margin-bottom:0">✕</button>
  `;
  container.appendChild(row);

  // Add Enter key listener to automatically add another row
  const nameInput = row.querySelector(".ingredient-name");
  if (nameInput) {
    nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addIngredientRow();
      }
    });

    // Auto-focus the new input
    setTimeout(() => nameInput.focus(), 50);
  }
}

function removeIngredient(id) {
  document.getElementById(id)?.remove();
}

// Toggle allergen selection
function toggleAllergen(btn, allergen) {
  if (btn.classList.contains("on")) {
    btn.classList.remove("on");
    selectedAllergens = selectedAllergens.filter((a) => a !== allergen);
  } else {
    btn.classList.add("on");
    selectedAllergens.push(allergen);
  }
}

// Set reminder frequency
function setReminder(btn, frequency) {
  document.querySelectorAll("#m-manual-entry .pribtn").forEach((b) => {
    if (
      b.textContent.toLowerCase().includes("daily") ||
      b.textContent.toLowerCase().includes("weekly") ||
      b.textContent.toLowerCase().includes("biweekly") ||
      b.textContent.toLowerCase().includes("monthly")
    ) {
      b.classList.remove("on");
    }
  });
  btn.classList.add("on");
  selectedReminder = frequency;
}

// Save manual recipe with all new fields
function saveManualRecipe() {
  const name = document.getElementById("r-name")?.value?.trim();
  const time = document.getElementById("r-time")?.value?.trim();
  const category = document.getElementById("r-category")?.value;
  const portions = document.getElementById("r-portions")?.value;
  const method = document.getElementById("r-method")?.value?.trim();

  // Validation
  if (!name) {
    toast("⚠️ Recipe name is required");
    return;
  }
  if (!time) {
    toast("⚠️ Cook time is required");
    return;
  }
  if (!category) {
    toast("⚠️ Category is required");
    return;
  }
  if (!portions || portions <= 0) {
    toast("⚠️ Portions must be greater than 0");
    return;
  }

  // Check for duplicate recipe names
  const existingRecipes = DB.getList("recipes");
  const duplicate = existingRecipes.find(
    (r) => r.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) {
    if (!confirm(`A recipe named "${name}" already exists. Save anyway?`)) {
      return;
    }
  }

  // Collect ingredients with validation
  const ingredientRows = document.querySelectorAll("#ingredients-list > div");
  const ingredients = [];
  ingredientRows.forEach((row) => {
    const nameInput = row.querySelector("[data-ing-name]");
    const qtyInput = row.querySelector("[data-ing-qty]");
    const unitSelect = row.querySelector("[data-ing-unit]");

    const ingredientName = nameInput?.value?.trim();
    const qty = qtyInput?.value?.trim();
    const unit = unitSelect?.value;

    if (ingredientName) {
      // Validate quantity is not negative
      if (qty && parseFloat(qty) < 0) {
        toast("⚠️ Ingredient quantities cannot be negative");
        return;
      }
      ingredients.push(`${qty || ""} ${unit || ""} ${ingredientName}`.trim());
    }
  });

  if (ingredients.length === 0) {
    toast("⚠️ Add at least one ingredient");
    return;
  }

  const methodSteps = method
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const recipe = {
    id: DB.uid(),
    name,
    emoji: "🍽",
    category,
    station: "",
    portions: parseInt(portions),
    time,
    allergens: selectedAllergens,
    ingredients,
    method: methodSteps,
    notes: "",
    reminder: selectedReminder,
    createdAt: Date.now(),
  };

  const list = DB.getList("recipes");
  list.push(recipe);
  DB.set("recipes", list);

  const stats = DB.get("stats") || {};
  stats.recipesAdded = (stats.recipesAdded || 0) + 1;
  DB.set("stats", stats);

  // Clear form
  document.getElementById("r-name").value = "";
  document.getElementById("r-time").value = "";
  document.getElementById("r-category").value = "";
  document.getElementById("r-portions").value = "";
  document.getElementById("r-method").value = "";
  document.getElementById("ingredients-list").innerHTML = "";

  // Reset selections
  selectedAllergens = [];
  selectedReminder = null;
  document
    .querySelectorAll("#m-manual-entry .pribtn.on")
    .forEach((b) => b.classList.remove("on"));

  closeM("m-manual-entry");
  toast("✅ Recipe saved!");
  renderRecipeList();
}

// Camera import placeholder
function importFromCamera() {
  closeM("m-addrecipe");

  // Create hidden file input for camera/photo selection
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment"; // Use camera if available

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast("⚠️ Please select an image file");
      return;
    }

    // Validate file size (max 10MB for OCR)
    if (file.size > 10 * 1024 * 1024) {
      toast("⚠️ Image too large. Max 10MB");
      return;
    }

    // Show processing toast
    toast("📸 Processing image...");

    // Read the image
    const reader = new FileReader();
    reader.onload = (event) => {
      // Store the captured image
      DB.set("temp_recipe_scan", {
        data: event.target.result,
        name: file.name,
        timestamp: Date.now(),
      });

      // Simulate OCR processing (in real app, this would call an OCR API)
      setTimeout(() => {
        processRecipeImage(event.target.result);
      }, 1000);
    };

    reader.onerror = () => {
      toast("❌ Failed to read image");
    };

    reader.readAsDataURL(file);
  };

  // Trigger file input
  input.click();
}

function processRecipeImage(imageData) {
  // Show processing message
  toast(t("extracting_text"));

  // Use Tesseract.js for OCR
  Tesseract.recognize(
    imageData,
    "eng+spa", // Support both English and Spanish
    {
      logger: (m) => {
        // Optional: show progress
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    },
  )
    .then(({ data: { text } }) => {
      console.log("Extracted text:", text);

      // Parse the extracted text to find recipe components
      const recipe = parseRecipeText(text);

      console.log("Parsed recipe data:", recipe);

      // Open manual entry form
      showM("m-manual-entry");

      // Show the scanned image as reference
      showRecipePhotoPreview(imageData);

      // Auto-fill form with extracted data
      const nameField = document.getElementById("r-name");
      const timeField = document.getElementById("r-time");
      const portionsField = document.getElementById("r-portions");
      const ingredientsField = document.getElementById("r-ingredients");
      const methodField = document.getElementById("r-method");
      const allergensField = document.getElementById("r-allergens");

      if (recipe.name && nameField) {
        nameField.value = recipe.name;
        console.log("Set recipe name:", recipe.name);
      }
      if (recipe.time && timeField) {
        timeField.value = recipe.time;
        console.log("Set recipe time:", recipe.time);
      }
      if (recipe.portions && portionsField) {
        portionsField.value = recipe.portions;
        console.log("Set recipe portions:", recipe.portions);
      }
      if (
        recipe.ingredients &&
        recipe.ingredients.length > 0 &&
        ingredientsField
      ) {
        ingredientsField.value = recipe.ingredients.join("\n");
        console.log("Set ingredients:", recipe.ingredients.length, "items");
      }
      if (recipe.method && recipe.method.length > 0 && methodField) {
        methodField.value = recipe.method.join("\n");
        console.log("Set method:", recipe.method.length, "steps");
      }
      if (recipe.allergens && recipe.allergens.length > 0 && allergensField) {
        allergensField.value = recipe.allergens.join(", ");
        console.log("Set allergens:", recipe.allergens);
      }

      // Show success message
      const foundItems = [];
      if (recipe.name) foundItems.push("name");
      if (recipe.ingredients.length > 0)
        foundItems.push(`${recipe.ingredients.length} ingredients`);
      if (recipe.method.length > 0)
        foundItems.push(`${recipe.method.length} steps`);

      if (foundItems.length > 0) {
        toast(`✨ Extracted: ${foundItems.join(", ")}!`);
      } else {
        toast(t("text_extracted"));
      }
    })
    .catch((err) => {
      console.error("OCR error:", err);

      // Still open the form but without auto-fill
      showM("m-manual-entry");
      showRecipePhotoPreview(imageData);
      toast(t("ocr_failed"));
    });
}

function parseRecipeText(text) {
  const recipe = {
    name: "",
    time: "",
    portions: null,
    ingredients: [],
    method: [],
    allergens: [],
  };

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Try to detect recipe name (usually first prominent line or has "Recipe" keyword)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 100 && !line.match(/^\d+/)) {
      // Likely the recipe name
      recipe.name = line.replace(/recipe/i, "").trim();
      break;
    }
  }

  // Detect time patterns
  const timePatterns = [
    /(\d+)\s*(?:h|hr|hour|hora)s?\s*(?:(\d+)\s*(?:m|min|minute|minuto)s?)?/i,
    /(\d+)\s*(?:m|min|minute|minuto)s?/i,
    /(?:time|tiempo|cook|cocinar|prep|preparar).*?(\d+)\s*(?:m|min|h|hr)/i,
  ];

  for (const line of lines) {
    for (const pattern of timePatterns) {
      const match = line.match(pattern);
      if (match) {
        const hours = match[1] ? parseInt(match[1]) : 0;
        const mins = match[2]
          ? parseInt(match[2])
          : pattern.source.includes("m|min")
            ? parseInt(match[1])
            : 0;
        if (hours > 0 || mins > 0) {
          const h = hours || Math.floor(mins / 60);
          const m = mins % 60;
          recipe.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          break;
        }
      }
    }
    if (recipe.time) break;
  }

  // Detect portions/servings
  const portionPatterns = [
    /(?:serves|servings|portions|porciones|raciones)\s*:?\s*(\d+)/i,
    /(\d+)\s*(?:servings|portions|porciones|raciones)/i,
  ];

  for (const line of lines) {
    for (const pattern of portionPatterns) {
      const match = line.match(pattern);
      if (match) {
        recipe.portions = parseInt(match[1]);
        break;
      }
    }
    if (recipe.portions) break;
  }

  // Detect ingredients and method sections with improved logic
  const ingredientKeywords =
    /ingredient|ingrediente|what you need|you will need|necesitas/i;
  const methodKeywords =
    /method|instruction|direction|preparation|step|método|instrucción|preparación|paso/i;

  let currentSection = "none"; // 'ingredients', 'method', or 'none'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if this line is a section header
    if (ingredientKeywords.test(lowerLine)) {
      currentSection = "ingredients";
      continue; // Skip the header line itself
    }

    if (methodKeywords.test(lowerLine)) {
      currentSection = "method";
      continue; // Skip the header line itself
    }

    // Process content based on current section
    if (currentSection === "ingredients") {
      // Ingredient lines typically:
      // - Start with a number/amount
      // - Start with a bullet point
      // - Are relatively short (not full sentences)
      // - Don't look like method steps
      if (line.length > 3 && line.length < 200) {
        // Check if it looks like an ingredient
        const looksLikeIngredient =
          /^[•\-\*\d]/.test(line) || // Starts with bullet or number
          /^\d+/.test(line) || // Starts with amount
          !/^(then|next|now|after|finally|meanwhile|pour|heat|cook|add|mix|stir|place|remove|set)/i.test(
            line,
          ); // Doesn't start with method words

        if (looksLikeIngredient) {
          const cleaned = line
            .replace(/^[•\-\*]\s*/, "")
            .replace(/^\d+\.\s*/, "");
          if (cleaned.length > 2) {
            recipe.ingredients.push(cleaned);
          }
        } else {
          // If we hit something that doesn't look like an ingredient, switch to method
          currentSection = "method";
          // Process this line as a method step
          if (line.length > 10) {
            const step = line
              .replace(/^\d+\.\s*/, "")
              .replace(/^[•\-\*]\s*/, "");
            if (step.length > 5) {
              recipe.method.push(step);
            }
          }
        }
      }
    } else if (currentSection === "method") {
      // Method steps are typically longer sentences
      if (line.length > 5 && line.length < 500) {
        const step = line.replace(/^\d+\.\s*/, "").replace(/^[•\-\*]\s*/, "");
        if (step.length > 5) {
          recipe.method.push(step);
        }
      }
    } else {
      // If we haven't identified a section yet, try to auto-detect
      // Lines starting with numbers followed by space and lowercase might be ingredients
      if (/^\d+\s+[a-z]/.test(line) && line.length < 100) {
        recipe.ingredients.push(line);
      }
      // Lines that are numbered steps (1., 2., etc.) are method
      else if (/^\d+\.\s+/.test(line) && line.length > 15) {
        const step = line.replace(/^\d+\.\s*/, "");
        recipe.method.push(step);
      }
    }
  }

  // Detect allergens
  const allergenKeywords = {
    en: [
      "dairy",
      "milk",
      "eggs",
      "nuts",
      "peanuts",
      "soy",
      "wheat",
      "gluten",
      "shellfish",
      "fish",
      "sesame",
    ],
    es: [
      "lácteos",
      "leche",
      "huevos",
      "nueces",
      "cacahuetes",
      "soja",
      "trigo",
      "gluten",
      "mariscos",
      "pescado",
      "sésamo",
    ],
  };

  const textLower = text.toLowerCase();
  const allAllergens = [...allergenKeywords.en, ...allergenKeywords.es];

  for (const allergen of allAllergens) {
    if (textLower.includes(allergen)) {
      const englishVersion =
        allergenKeywords.en[allergenKeywords.es.indexOf(allergen)] || allergen;
      if (!recipe.allergens.includes(englishVersion)) {
        recipe.allergens.push(englishVersion);
      }
    }
  }

  console.log("Parsed recipe:", recipe); // Debug log

  return recipe;
}

// Import from URL placeholder
async function importRecipeFromURL() {
  const url = document.getElementById("r-url")?.value?.trim();
  if (!url) {
    toast("⚠️ Please enter a URL");
    return;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    toast("⚠️ Invalid URL format");
    return;
  }

  closeM("m-import-link");
  toast("🔗 Fetching recipe...");

  try {
    // Fetch the webpage
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recipe");
    }

    const html = await response.text();

    // Parse the recipe from HTML
    const recipe = parseRecipeFromHTML(html, url);

    if (!recipe.name) {
      toast("⚠️ Could not extract recipe. Try manual entry.");
      return;
    }

    // Auto-fill the manual entry form
    showM("m-manual-entry");

    // Fill form fields
    if (recipe.name) document.getElementById("r-name").value = recipe.name;
    if (recipe.time) document.getElementById("r-time").value = recipe.time;
    if (recipe.portions)
      document.getElementById("r-portions").value = recipe.portions;
    if (recipe.emoji) document.getElementById("r-emoji").value = recipe.emoji;
    if (recipe.station)
      document.getElementById("r-station").value = recipe.station;
    if (recipe.category)
      document.getElementById("r-category").value = recipe.category;

    if (recipe.allergens) {
      document.getElementById("r-allergens").value =
        recipe.allergens.join(", ");
    }

    if (recipe.ingredients) {
      document.getElementById("r-ingredients").value =
        recipe.ingredients.join("\n");
    }

    if (recipe.method) {
      document.getElementById("r-method").value = recipe.method.join("\n");
    }

    if (recipe.notes) {
      document.getElementById("r-notes").value = recipe.notes;
    }

    // Store image if found
    if (recipe.image) {
      DB.set("temp_recipe_photo", {
        data: recipe.image,
        name: "imported-recipe.jpg",
        timestamp: Date.now(),
      });
      showRecipePhotoPreview(recipe.image);
    }

    toast("✅ Recipe imported! Review and save");
  } catch (error) {
    console.error("Import error:", error);
    toast("❌ Failed to import. Try manual entry.");
  }
}

function parseRecipeFromHTML(html, url) {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const recipe = {
    name: "",
    time: "",
    portions: 4,
    emoji: "🍽",
    ingredients: [],
    method: [],
    allergens: [],
    notes: "",
    image: null,
    category: "main",
    station: "",
  };

  // Try to find recipe using JSON-LD structured data (most reliable)
  const jsonLd = doc.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      const recipeData = Array.isArray(data)
        ? data.find((d) => d["@type"] === "Recipe")
        : data["@type"] === "Recipe"
          ? data
          : data["@graph"]?.find((d) => d["@type"] === "Recipe");

      if (recipeData) {
        recipe.name = recipeData.name || "";
        recipe.portions = parseInt(recipeData.recipeYield) || 4;

        // Parse time
        if (recipeData.totalTime) {
          recipe.time = parseDuration(recipeData.totalTime);
        } else if (recipeData.cookTime && recipeData.prepTime) {
          const cook = parseDuration(recipeData.cookTime);
          const prep = parseDuration(recipeData.prepTime);
          recipe.time = addTimes(cook, prep);
        } else if (recipeData.cookTime) {
          recipe.time = parseDuration(recipeData.cookTime);
        }

        // Get ingredients
        if (recipeData.recipeIngredient) {
          recipe.ingredients = Array.isArray(recipeData.recipeIngredient)
            ? recipeData.recipeIngredient
            : [recipeData.recipeIngredient];
        }

        // Get method/instructions
        if (recipeData.recipeInstructions) {
          if (Array.isArray(recipeData.recipeInstructions)) {
            recipe.method = recipeData.recipeInstructions
              .map((step) =>
                typeof step === "string" ? step : step.text || step.name || "",
              )
              .filter(Boolean);
          } else if (typeof recipeData.recipeInstructions === "string") {
            recipe.method = recipeData.recipeInstructions
              .split("\n")
              .filter(Boolean);
          }
        }

        // Get image
        if (recipeData.image) {
          const imageUrl = Array.isArray(recipeData.image)
            ? recipeData.image[0]
            : typeof recipeData.image === "object"
              ? recipeData.image.url
              : recipeData.image;
          if (imageUrl) {
            recipe.image = makeAbsoluteUrl(imageUrl, url);
          }
        }

        // Get category
        if (recipeData.recipeCategory) {
          recipe.category = normalizeCategory(recipeData.recipeCategory);
        }

        return recipe;
      }
    } catch (e) {
      console.log("JSON-LD parsing failed:", e);
    }
  }

  // Fallback: Try to extract from HTML elements
  // Get title
  recipe.name =
    doc.querySelector("h1")?.textContent?.trim() ||
    doc.querySelector('[itemprop="name"]')?.textContent?.trim() ||
    doc.querySelector(".recipe-title")?.textContent?.trim() ||
    "";

  // Get ingredients
  const ingredientElements = doc.querySelectorAll(
    '[itemprop="recipeIngredient"], .ingredient, li[class*="ingredient"]',
  );
  if (ingredientElements.length > 0) {
    recipe.ingredients = Array.from(ingredientElements)
      .map((el) => el.textContent.trim())
      .filter(Boolean);
  }

  // Get instructions
  const instructionElements = doc.querySelectorAll(
    '[itemprop="recipeInstructions"] li, .instruction, ol[class*="instruction"] li, .step',
  );
  if (instructionElements.length > 0) {
    recipe.method = Array.from(instructionElements)
      .map((el) => el.textContent.trim())
      .filter(Boolean);
  }

  // Get image
  const img = doc.querySelector(
    '[itemprop="image"], .recipe-image img, article img',
  );
  if (img) {
    recipe.image = makeAbsoluteUrl(img.src, url);
  }

  // Get time
  const timeEl = doc.querySelector(
    '[itemprop="totalTime"], [itemprop="cookTime"], .cook-time, .total-time',
  );
  if (timeEl) {
    const timeText = timeEl.getAttribute("content") || timeEl.textContent;
    recipe.time = parseDuration(timeText);
  }

  // Get servings
  const servingEl = doc.querySelector(
    '[itemprop="recipeYield"], .servings, .yield',
  );
  if (servingEl) {
    const servingText = servingEl.textContent;
    const match = servingText.match(/\d+/);
    if (match) recipe.portions = parseInt(match[0]);
  }

  return recipe;
}

function parseDuration(duration) {
  if (!duration) return "";

  // Handle ISO 8601 duration format (e.g., "PT1H30M")
  if (duration.startsWith("PT")) {
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    const h = hours ? hours[1] : "0";
    const m = minutes ? minutes[1] : "0";
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  }

  // Handle natural language (e.g., "1 hour 30 minutes", "90 minutes")
  const hourMatch = duration.match(/(\d+)\s*h(ou)?r/i);
  const minMatch = duration.match(/(\d+)\s*m(in)?/i);

  if (hourMatch || minMatch) {
    const h = hourMatch ? hourMatch[1] : "0";
    const m = minMatch ? minMatch[1] : "0";
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  }

  // If just a number, assume minutes
  const numMatch = duration.match(/^\d+$/);
  if (numMatch) {
    const totalMins = parseInt(numMatch[0]);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return duration;
}

function addTimes(time1, time2) {
  const [h1, m1] = time1.split(":").map((n) => parseInt(n) || 0);
  const [h2, m2] = time2.split(":").map((n) => parseInt(n) || 0);
  const totalMins = h1 * 60 + m1 + (h2 * 60 + m2);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function makeAbsoluteUrl(urlString, baseUrl) {
  try {
    return new URL(urlString, baseUrl).href;
  } catch {
    return urlString;
  }
}

function normalizeCategory(category) {
  const cat = category.toLowerCase();
  if (cat.includes("appetizer") || cat.includes("starter")) return "appetizer";
  if (cat.includes("main") || cat.includes("entree")) return "main";
  if (cat.includes("dessert") || cat.includes("sweet")) return "dessert";
  if (cat.includes("side")) return "side";
  if (cat.includes("sauce") || cat.includes("condiment")) return "sauce";
  if (cat.includes("drink") || cat.includes("beverage")) return "drink";
  return "main";
}

// ─────────────────────────────────────────────
//  NEW PREP TASK FUNCTIONS
// ─────────────────────────────────────────────

let prepIngredientCounter = 0;
let selectedPrepPriority = "normal";

function addPrepIngredientRow() {
  const container = document.getElementById("prep-ingredients-list");
  if (!container) return;

  const id = `prep-ing-${prepIngredientCounter++}`;
  const row = document.createElement("div");
  row.id = id;
  row.style.cssText = "margin-bottom:10px";
  row.innerHTML = `
    <div style="display:grid;grid-template-columns:2fr 1fr 1.2fr auto;gap:8px;align-items:end">
      <div>
        ${container.children.length === 0 ? '<label class="flbl">Ingredient</label>' : ""}
        <input class="finput" style="margin:0" type="text" placeholder="e.g. Shallots" data-prep-ing />
      </div>
      <div>
        ${container.children.length === 0 ? '<label class="flbl">Qty</label>' : ""}
        <input class="finput" style="margin:0" type="number" step="0.1" placeholder="2" data-prep-qty />
      </div>
      <div>
        ${container.children.length === 0 ? '<label class="flbl">Unit</label>' : ""}
        <select class="finput" style="margin:0" data-prep-unit>
          <option value="batch">Batch</option>
          <option value="case">Case</option>
          <option value="quart">Quart</option>
          <option value="1/3 pan">1/3 Pan</option>
          <option value="1/6 pan">1/6 Pan</option>
          <option value="hotel pan">Hotel Pan</option>
          <option value="8oz deli">8oz Deli</option>
          <option value="16oz deli">16oz Deli</option>
          <option value="no.">No.</option>
        </select>
      </div>
      <button class="btn-ico" onclick="removePrepIngredient('${id}')" style="width:36px;height:36px;font-size:16px;margin-bottom:0">✕</button>
    </div>
  `;
  container.appendChild(row);
}

function removePrepIngredient(id) {
  document.getElementById(id)?.remove();
}

function setPrepPri(btn, pri) {
  document
    .querySelectorAll("#m-addprep .pribtn")
    .forEach((b) => b.classList.remove("on"));
  btn.classList.add("on");
  selectedPrepPriority = pri;
}

function saveNewPrepTask() {
  const dishName = document.getElementById("pt-dish")?.value?.trim();
  const day = document.getElementById("pt-day")?.value;

  if (!dishName) {
    toast("⚠️ Dish name is required");
    return;
  }

  // Collect ingredients with quantities and units
  const ingredientRows = document.querySelectorAll(
    "#prep-ingredients-list > div",
  );
  const ingredients = [];
  ingredientRows.forEach((row) => {
    const ingInput = row.querySelector("[data-prep-ing]");
    const qtyInput = row.querySelector("[data-prep-qty]");
    const unitSelect = row.querySelector("[data-prep-unit]");

    const name = ingInput?.value?.trim();
    const qty = qtyInput?.value?.trim();
    const unit = unitSelect?.value;

    if (name) {
      ingredients.push({
        name: name,
        quantity: qty || "",
        unit: unit || "batch",
      });
    }
  });

  if (ingredients.length === 0) {
    toast("⚠️ Add at least one ingredient");
    return;
  }

  // Create prep task
  const task = {
    id: DB.uid(),
    name: dishName,
    ingredients: ingredients,
    day: day,
    station: "",
    due: "",
    priority: selectedPrepPriority,
    done: false,
    createdAt: Date.now(),
  };

  const list = DB.getList("prep");
  list.push(task);
  DB.set("prep", list);

  // Clear form
  document.getElementById("pt-dish").value = "";
  document.getElementById("pt-day").value = "";
  document.getElementById("prep-ingredients-list").innerHTML = "";
  selectedPrepPriority = "normal";
  document
    .querySelectorAll("#m-addprep .pribtn")
    .forEach((b) => b.classList.remove("on"));
  document.getElementById("pri-normal")?.classList.add("on");

  closeM("m-addprep");
  toast("✅ Prep task added!");
  renderPrepList();
}

// Initialize prep ingredient row when modal opens
function initPrepModal() {
  const container = document.getElementById("prep-ingredients-list");
  if (container && container.children.length === 0) {
    addPrepIngredientRow();
  }
}

// ─────────────────────────────────────────────
//  EDIT RECIPE FUNCTIONS
// ─────────────────────────────────────────────

function editCurrentRecipe() {
  const recipes = DB.getList("recipes");
  const recipe = recipes.find((r) => r.id === activeRecipeId);
  if (!recipe) return;

  // Populate form fields
  document.getElementById("e-name").value = recipe.name || "";
  document.getElementById("e-time").value = recipe.time || "";
  document.getElementById("e-category").value = recipe.category || "";
  document.getElementById("e-portions").value = recipe.portions || "";
  document.getElementById("e-method").value = (recipe.method || []).join("\n");

  // Reset and populate allergens
  editSelectedAllergens = [...(recipe.allergens || [])];
  document.querySelectorAll("#edit-allergen-btns .pribtn").forEach((btn) => {
    btn.classList.remove("on");
    const allergenMatch = btn
      .getAttribute("onclick")
      .match(/toggleEditAllergen\(this,'(.+?)'\)/);
    if (allergenMatch && editSelectedAllergens.includes(allergenMatch[1])) {
      btn.classList.add("on");
    }
  });

  // Reset and populate reminder
  editSelectedReminder = recipe.reminder || null;
  document.querySelectorAll("#edit-reminder-btns .pribtn").forEach((btn) => {
    btn.classList.remove("on");
    const reminderMatch = btn
      .getAttribute("onclick")
      .match(/setEditReminder\(this,'(.+?)'\)/);
    if (reminderMatch && editSelectedReminder === reminderMatch[1]) {
      btn.classList.add("on");
    }
  });

  // Populate ingredients
  const container = document.getElementById("edit-ingredients-list");
  container.innerHTML = "";
  editIngredientCounter = 0;

  (recipe.ingredients || []).forEach((ing, idx) => {
    // Parse ingredient string: "qty unit name"
    const parts = ing.trim().split(" ");
    let qty = "",
      unit = "",
      name = "";

    if (parts.length > 0) {
      const firstPart = parts[0];
      if (!isNaN(parseFloat(firstPart))) {
        qty = firstPart;
        if (parts.length > 1) {
          unit = parts[1];
          name = parts.slice(2).join(" ");
        }
      } else {
        name = ing;
      }
    }

    addEditIngredientRow(name, qty, unit);
  });

  if (container.children.length === 0) {
    addEditIngredientRow();
  }

  showM("m-edit-recipe");
}

function addEditIngredientRow(name = "", qty = "", unit = "g") {
  const container = document.getElementById("edit-ingredients-list");
  if (!container) return;

  const id = `edit-ing-${editIngredientCounter++}`;
  const row = document.createElement("div");
  row.id = id;
  row.style.cssText =
    "display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:10px;align-items:end";
  row.innerHTML = `
    <div>
      ${container.children.length === 0 ? '<label class="flbl">Ingredient</label>' : ""}
      <input class="finput" style="margin:0" type="text" placeholder="Duck leg" data-ing-name value="${esc(name)}" />
    </div>
    <div>
      ${container.children.length === 0 ? '<label class="flbl">Qty</label>' : ""}
      <input class="finput" style="margin:0" type="number" step="0.01" placeholder="6" data-ing-qty value="${qty}" />
    </div>
    <div>
      ${container.children.length === 0 ? '<label class="flbl">Unit</label>' : ""}
      <select class="finput" style="margin:0" data-ing-unit>
        <option value="g" ${unit === "g" ? "selected" : ""}>g</option>
        <option value="kg" ${unit === "kg" ? "selected" : ""}>kg</option>
        <option value="L" ${unit === "L" ? "selected" : ""}>L</option>
        <option value="ml" ${unit === "ml" ? "selected" : ""}>ml</option>
        <option value="quart" ${unit === "quart" ? "selected" : ""}>quart</option>
        <option value="cup" ${unit === "cup" ? "selected" : ""}>cup</option>
        <option value="gallon" ${unit === "gallon" ? "selected" : ""}>gallon</option>
        <option value="tsp" ${unit === "tsp" ? "selected" : ""}>tsp</option>
        <option value="tbsp" ${unit === "tbsp" ? "selected" : ""}>tbsp</option>
        <option value="bunch" ${unit === "bunch" ? "selected" : ""}>bunch</option>
        <option value="sprig" ${unit === "sprig" ? "selected" : ""}>sprig</option>
        <option value="as required" ${unit === "as required" ? "selected" : ""}>as required</option>
        <option value="to taste" ${unit === "to taste" ? "selected" : ""}>to taste</option>
        <option value="can" ${unit === "can" ? "selected" : ""}>can</option>
        <option value="oz" ${unit === "oz" ? "selected" : ""}>oz</option>
        <option value="lb" ${unit === "lb" ? "selected" : ""}>lb</option>
        <option value="no." ${unit === "no." ? "selected" : ""}>no.</option>
      </select>
    </div>
    <button class="btn-ico" onclick="removeEditIngredient('${id}')" style="width:36px;height:36px;font-size:16px;margin-bottom:0">✕</button>
  `;
  container.appendChild(row);
}

function removeEditIngredient(id) {
  document.getElementById(id)?.remove();
}

function toggleEditAllergen(btn, allergen) {
  if (btn.classList.contains("on")) {
    btn.classList.remove("on");
    editSelectedAllergens = editSelectedAllergens.filter((a) => a !== allergen);
  } else {
    btn.classList.add("on");
    editSelectedAllergens.push(allergen);
  }
}

function setEditReminder(btn, frequency) {
  document
    .querySelectorAll("#edit-reminder-btns .pribtn")
    .forEach((b) => b.classList.remove("on"));
  btn.classList.add("on");
  editSelectedReminder = frequency;
}

function saveEditedRecipe() {
  const name = document.getElementById("e-name")?.value?.trim();
  const time = document.getElementById("e-time")?.value?.trim();
  const category = document.getElementById("e-category")?.value;
  const portions = document.getElementById("e-portions")?.value;
  const method = document.getElementById("e-method")?.value?.trim();

  if (!name) {
    toast("⚠️ Recipe name is required");
    return;
  }
  if (!time) {
    toast("⚠️ Cook time is required");
    return;
  }
  if (!category) {
    toast("⚠️ Category is required");
    return;
  }
  if (!portions) {
    toast("⚠️ Portions is required");
    return;
  }

  // Collect ingredients
  const ingredientRows = document.querySelectorAll(
    "#edit-ingredients-list > div",
  );
  const ingredients = [];
  ingredientRows.forEach((row) => {
    const nameInput = row.querySelector("[data-ing-name]");
    const qtyInput = row.querySelector("[data-ing-qty]");
    const unitSelect = row.querySelector("[data-ing-unit]");

    const name = nameInput?.value?.trim();
    const qty = qtyInput?.value?.trim();
    const unit = unitSelect?.value;

    if (name) {
      ingredients.push(`${qty || ""} ${unit || ""} ${name}`.trim());
    }
  });

  if (ingredients.length === 0) {
    toast("⚠️ Add at least one ingredient");
    return;
  }

  const methodSteps = method
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Update recipe
  const recipes = DB.getList("recipes");
  const idx = recipes.findIndex((r) => r.id === activeRecipeId);
  if (idx === -1) return;

  recipes[idx] = {
    ...recipes[idx],
    name,
    category,
    portions: parseInt(portions),
    time,
    allergens: editSelectedAllergens,
    ingredients,
    method: methodSteps,
    reminder: editSelectedReminder,
  };

  DB.set("recipes", recipes);

  closeM("m-edit-recipe");
  toast("✅ Recipe updated!");

  // Refresh the detail view
  openRecipeDetail(activeRecipeId);
}

// ─────────────────────────────────────────────
//  UNIT CONVERSION SYSTEM
// ─────────────────────────────────────────────

function toggleUnitSystem() {
  const slider = document.getElementById("unit-slider");
  const metricLabel = document.getElementById("unit-label-metric");
  const imperialLabel = document.getElementById("unit-label-imperial");

  if (currentUnitSystem === "metric") {
    currentUnitSystem = "imperial";
    slider.classList.add("imperial");
    metricLabel.classList.remove("active");
    imperialLabel.classList.add("active");
  } else {
    currentUnitSystem = "metric";
    slider.classList.remove("imperial");
    metricLabel.classList.add("active");
    imperialLabel.classList.remove("active");
  }

  // Re-render ingredients with converted units
  renderConvertedIngredients();
}

function renderConvertedIngredients() {
  const recipes = DB.getList("recipes");
  const r = recipes.find((r) => r.id === activeRecipeId);
  if (!r) return;

  const container = document.getElementById("detail-ingredients");
  const mult = parseFloat(document.getElementById("yv")?.textContent || 1);

  container.innerHTML = (r.ingredients || [])
    .map((ing) => {
      const converted = convertIngredient(ing, mult);
      return `<div class="ing-row">${esc(converted)}</div>`;
    })
    .join("");
}

function convertIngredient(ingredient, multiplier) {
  // Parse ingredient: "qty unit name"
  const parts = ingredient.trim().split(" ");
  if (parts.length < 2) return ingredient;

  let qty = parseFloat(parts[0]);
  if (isNaN(qty)) return ingredient;

  qty *= multiplier;
  const unit = parts[1];
  const name = parts.slice(2).join(" ");

  // Convert based on current system
  let convertedQty = qty;
  let convertedUnit = unit;

  if (currentUnitSystem === "imperial") {
    // Metric to Imperial conversions
    if (unit === "g") {
      convertedQty = qty * 0.035274;
      convertedUnit = "oz";
    } else if (unit === "kg") {
      convertedQty = qty * 2.20462;
      convertedUnit = "lb";
    } else if (unit === "ml") {
      convertedQty = qty * 0.033814;
      convertedUnit = "fl oz";
    } else if (unit === "L") {
      convertedQty = qty * 0.264172;
      convertedUnit = "gallon";
    }
  } else {
    // Imperial to Metric conversions
    if (unit === "oz") {
      convertedQty = qty * 28.3495;
      convertedUnit = "g";
    } else if (unit === "lb") {
      convertedQty = qty * 0.453592;
      convertedUnit = "kg";
    } else if (unit === "fl oz" || unit === "floz") {
      convertedQty = qty * 29.5735;
      convertedUnit = "ml";
    } else if (unit === "gallon") {
      convertedQty = qty * 3.78541;
      convertedUnit = "L";
    } else if (unit === "cup") {
      convertedQty = qty * 236.588;
      convertedUnit = "ml";
    } else if (unit === "tbsp") {
      convertedQty = qty * 14.7868;
      convertedUnit = "ml";
    } else if (unit === "tsp") {
      convertedQty = qty * 4.92892;
      convertedUnit = "ml";
    }
  }

  // Format the number nicely
  convertedQty = Math.round(convertedQty * 100) / 100;

  return `${convertedQty} ${convertedUnit} ${name}`;
}
// PASTE THIS AT THE VERY END OF YOUR app.js FILE
// This fixes the "Failed to import recipe" error

// Override getRecipeFromURL with better CORS proxy handling
async function getRecipeFromURL(url) {
  // Try multiple CORS proxies in order
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  let lastError;

  for (const proxyUrl of proxies) {
    try {
      console.log("Trying proxy:", proxyUrl);

      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          Accept: "application/json, text/html",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let html;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        html = data.contents || data.data || data;
      } else {
        html = await response.text();
      }

      if (!html || html.length < 100) {
        throw new Error("Empty response");
      }

      // Try to extract JSON-LD structured data
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/s,
      );

      if (jsonLdMatch) {
        try {
          const jsonData = JSON.parse(jsonLdMatch[1]);

          // Handle arrays of JSON-LD data
          const recipeData = Array.isArray(jsonData)
            ? jsonData.find((item) => item["@type"] === "Recipe")
            : jsonData["@type"] === "Recipe"
              ? jsonData
              : null;

          if (recipeData) {
            console.log("Successfully extracted JSON-LD recipe");
            return parseJsonLdRecipe(recipeData);
          }
        } catch (e) {
          console.error("Failed to parse JSON-LD:", e);
        }
      }

      // Fallback to HTML parsing if JSON-LD not found
      console.log("Falling back to HTML parsing");
      return parseRecipeFromHTML(html, url);
    } catch (error) {
      console.error("Proxy failed:", error.message);
      lastError = error;
      // Try next proxy
      continue;
    }
  }

  // All proxies failed
  throw new Error(
    "All CORS proxies failed. " +
      (lastError ? lastError.message : "Please try manual entry."),
  );
}

console.log("✅ CORS proxy fix loaded - link import should work now!");
