const AGE_GROUPS = [
  "Berçário: 0 a 2 anos",
  "Maternal: 3 a 4 anos",
  "Jardim: 5 a 6 anos",
  "Primários: 7 a 8 anos",
  "Pré-Juniores: 9 a 10 anos",
  "Juniores: 11 e 12 anos"
];

const AGE_ALIASES = {
  "1 e 2": "Berçário: 0 a 2 anos",
  "0 a 2": "Berçário: 0 a 2 anos",
  "3 e 4": "Maternal: 3 a 4 anos",
  "3 a 4": "Maternal: 3 a 4 anos",
  "5 e 6": "Jardim: 5 a 6 anos",
  "5 a 6": "Jardim: 5 a 6 anos",
  "7 a 10": "Primários: 7 a 8 anos",
  "7 a 8": "Primários: 7 a 8 anos",
  "9 a 10": "Pré-Juniores: 9 a 10 anos",
  "11 e 12": "Juniores: 11 e 12 anos"
};

AGE_GROUPS.splice(0, AGE_GROUPS.length,
  "0 a 2 anos - Berçário",
  "3 a 4 anos - Maternal",
  "5 a 6 anos - Jardim",
  "7 a 10 anos - Primários",
  "11 a 12 anos - Juniores"
);
Object.assign(AGE_ALIASES, {
  "1 e 2": "0 a 2 anos - Berçário",
  "0 a 2": "0 a 2 anos - Berçário",
  "Berçário: 0 a 2 anos": "0 a 2 anos - Berçário",
  "3 e 4": "3 a 4 anos - Maternal",
  "3 a 4": "3 a 4 anos - Maternal",
  "Maternal: 3 a 4 anos": "3 a 4 anos - Maternal",
  "5 e 6": "5 a 6 anos - Jardim",
  "5 a 6": "5 a 6 anos - Jardim",
  "Jardim: 5 a 6 anos": "5 a 6 anos - Jardim",
  "7 a 10": "7 a 10 anos - Primários",
  "7 a 8": "7 a 10 anos - Primários",
  "9 a 10": "7 a 10 anos - Primários",
  "Primários: 7 a 8 anos": "7 a 10 anos - Primários",
  "Pré-Juniores: 9 a 10 anos": "7 a 10 anos - Primários",
  "11 e 12": "11 a 12 anos - Juniores",
  "11 a 12": "11 a 12 anos - Juniores",
  "Juniores: 11 e 12 anos": "11 a 12 anos - Juniores"
});
const CATEGORIES = [
  "Deus Pai",
  "Deus Filho",
  "Deus Espírito Santo",
  "Pecado",
  "Profecia",
  "Missionários",
  "Fé",
  "Promessa",
  "Gratidão",
  "Criação",
  "Obediência",
  "Aliança",
  "Coração",
  "Bênção",
  "Amor",
  "Tempo"
];

const SECTIONS = [
  ["objectives", "Objetivos da lição", "target", "🎯"],
  ["welcome", "Recepção e acolhimento", "heart", "🤍"],
  ["icebreaker", "Quebra-gelo", "spark", "✨"],
  ["openingPrayer", "Oração inicial", "pray", "🙏"],
  ["worshipOffering", "Louvor e oferta", "music", "🎵"],
  ["bibleLesson", "Lição bíblica", "book", "📖"],
  ["practice", "Aplicação prática", "hands", "🙌"],
  ["memoryVerse", "Memorização do versículo", "bookmark", "🕊️"],
  ["activity", "Atividade", "palette", "🎨"],
  ["finalPrayer", "Oração final", "pray", "🌿"],
  ["snack", "Lanche", "palette", "🍞"]
];

const DEVOTIONAL_FIELDS = [
  ["devotional", "Culto em Família", "📖"],
  ["prayer", "Oração", "🙏"],
  ["activity", "Vamos brincar?", "🎨"]
];

const TRAINING_FIELDS = [
  ["content", "Conteúdo do treinamento", "🎓"],
  ["notes", "Orientações ao líder", "📝"]
];

const EBF_FIELDS = [
  ["content", "Conteúdo da EBF", "🎪"],
  ["schedule", "Programação", "🗓️"],
  ["notes", "Orientações", "📝"]
];

const DATA_VERSION = window.RAIZES_LESSONS_VERSION || "manual-v1";
const DEFAULT_LESSONS = Array.isArray(window.RAIZES_LESSONS_DATA) ? window.RAIZES_LESSONS_DATA : [];

const ICONS = {
  target: '<path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" /><path d="M12 17a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" /><path d="M12 13a1 1 0 1 0-1-1 1 1 0 0 0 1 1Z" />',
  heart: '<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />',
  spark: '<path d="M13 2 6 14h6l-1 8 7-12h-6l1-8Z" />',
  pray: '<path d="M8 11V5a2 2 0 0 1 4 0v6M12 11V4a2 2 0 0 1 4 0v8" /><path d="M8 11 5.5 8.5a2 2 0 1 0-3 2.6L9 18v4h7v-4l3-5" />',
  music: '<path d="M9 18V5l12-2v13" /><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />',
  book: '<path d="M4 19.5V5.8A2.8 2.8 0 0 1 6.8 3H20v15H7a3 3 0 0 0-3 3Z" /><path d="M8 7h8M8 11h6" />',
  hands: '<path d="M7 11V5a2 2 0 0 1 4 0v6M13 11V6a2 2 0 0 1 4 0v7" /><path d="M5 12 3.7 10.7a2 2 0 0 0-2.8 2.8L8 21h8l4-5" />',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z" />',
  palette: '<path d="M12 22a10 10 0 1 1 10-10c0 2-1.2 3-3 3h-1.6a2 2 0 0 0-1.4 3.4l.3.3A2 2 0 0 1 15 22h-3Z" /><path d="M7.5 10.5h.01M10.5 7.5h.01M14.5 7.5h.01M16.5 11.5h.01" />'
};

const state = {
  lessons: loadLessons(),
  devotionals: loadCollection("raizes-devotionals", []),
  trainings: loadCollection("raizes-trainings", []),
  ebfs: loadCollection("raizes-ebf", []),
  manualVideos: loadManualVideos(),
  activeId: null,
  activeDevotionalId: null,
  activeTrainingId: null,
  activeEbfId: null,
  activeVideoId: null,
  tab: "home",
  manageTab: "lessons",
  trailsRendered: false,
  authUser: null,
  cardImageReadToken: "",
  activityImageReadToken: "",
  cardImagePromise: null,
  activityImagePromise: null,
  contentImageReadToken: "",
  contentImagePromise: null,
  contentFilePromise: null,
  savingLessons: false
};

const $ = (selector) => document.querySelector(selector);
const isAdminPage = document.body.dataset.page === "admin";

const els = {
  tabs: document.querySelectorAll("[data-tab]"),
  filterToolbar: $("#filterToolbar"),
  homeView: $("#homeView"),
  devotionalView: $("#devotionalView"),
  trainingView: $("#trainingView"),
  ebfView: $("#ebfView"),
  studyView: $("#studyView"),
  trailsView: $("#trailsView"),
  manageView: $("#manageView"),
  search: $("#searchInput"),
  categoryFilter: $("#categoryFilter"),
  ageFilter: $("#ageFilter"),
  testamentFilter: $("#testamentFilter"),
  specialFilter: $("#specialFilter"),
  createdMonthFilter: $("#createdMonthFilter"),
  lessonList: $("#lessonList"),
  lessonCount: $("#lessonCount"),
  reader: $("#lessonReader"),
  form: $("#lessonForm"),
  lessonId: $("#lessonId"),
  title: $("#titleInput"),
  category: $("#categoryInput"),
  age: $("#ageInput"),
  verse: $("#verseInput"),
  cardImage: $("#cardImageInput"),
  cardImagePreview: $("#cardImagePreview"),
  activityImage: $("#activityImageInput"),
  activityImagePreview: $("#activityImagePreview"),
  sectionFields: $("#sectionFields"),
  categoryOptions: $("#categoryOptions"),
  newLesson: $("#newLessonBtn"),
  ebookPrint: $("#ebookPrintBtn"),
  clearForm: $("#clearFormBtn"),
  duplicateLesson: $("#duplicateLessonBtn"),
  deleteLesson: $("#deleteLessonBtn"),
  savePrevLesson: $("#savePrevLessonBtn"),
  saveNextLesson: $("#saveNextLessonBtn"),
  exportJson: $("#exportJsonBtn"),
  importJson: $("#importJsonInput"),
  lessonActionMessage: $("#lessonActionMessage"),
  ebookPrintArea: $("#ebookPrintArea"),
  trailGrid: $("#trailGrid"),
  trailCount: $("#trailCount"),
  streamPlayer: $("#streamPlayer"),
  streamHero: $("#streamHero"),
  streamQuickNav: $("#streamQuickNav"),
  videoForm: $("#videoForm"),
  videoId: $("#videoId"),
  videoTitle: $("#videoTitleInput"),
  videoUrl: $("#videoUrlInput"),
  videoCategory: $("#videoCategoryInput"),
  videoAge: $("#videoAgeInput"),
  videoLesson: $("#videoLessonInput"),
  videoDescription: $("#videoDescriptionInput"),
  videoPlaylist: $("#videoPlaylistInput"),
  videoSeason: $("#videoSeasonInput"),
  videoFeatured: $("#videoFeaturedInput"),
  videoTrending: $("#videoTrendingInput"),
  videoRecommended: $("#videoRecommendedInput"),
  clearVideo: $("#clearVideoBtn"),
  deleteVideo: $("#deleteVideoBtn"),
  savePrevVideo: $("#savePrevVideoBtn"),
  saveNextVideo: $("#saveNextVideoBtn"),
  videoActionMessage: $("#videoActionMessage"),
  lessonAdminList: $("#lessonAdminList"),
  trailAdminList: $("#trailAdminList"),
  videoAdminList: $("#videoAdminList")
};

init();

window.onRaizesAuthChange = (user) => {
  state.authUser = user || null;
  applyAccessVisibility();
  renderLimitedNotice();
  renderList();
  renderReader();
  if (state.trailsRendered) renderTrails();
};

function init() {
  if (els.sectionFields) renderSectionFields();
  fillFilters();
  bindEvents();
  applyAccessVisibility();
  state.activeId = state.lessons[0]?.id || null;
  render();
  if (isAdminPage) {
    setManageTab(location.hash === "#trilhas" ? "trails" : location.hash === "#devocionais" ? "devotionals" : location.hash === "#treinamentos" ? "trainings" : location.hash === "#ebf" ? "ebf" : location.hash === "#usuarios" ? "users" : location.hash === "#acessos" ? "access" : location.hash === "#contato" ? "contact" : "lessons");
    loadIntoForm(getActiveLesson());
  } else {
    const initialTab = location.hash === "#trilhas" ? "trails" : location.hash === "#licoes" ? "study" : location.hash === "#treinamentos" ? "training" : location.hash === "#devocional" ? "devotional" : location.hash === "#ebf" ? "ebf" : "home";
    setTab(initialTab);
  }
  drawSky();
  renderLimitedNotice();
  syncLessonsFromServer();
  syncContentFromServer();
}

function loadLessons() {
  const savedVersion = localStorage.getItem("raizes-lessons-version");
  const saved = localStorage.getItem("raizes-lessons");
  if (!saved || savedVersion !== DATA_VERSION) {
    const lessons = normalizeLessonDates(DEFAULT_LESSONS);
    saveLessonsCache(lessons);
    return lessons;
  }
  try {
    const parsed = JSON.parse(saved);
    const lessons = Array.isArray(parsed) ? normalizeLessonDates(parsed) : normalizeLessonDates(DEFAULT_LESSONS);
    saveLessonsCache(lessons);
    return lessons;
  } catch {
    return normalizeLessonDates(DEFAULT_LESSONS);
  }
}

function loadCollection(key, fallback) {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveCollectionCache(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    localStorage.removeItem(key);
  }
}

function normalizeLessonDates(lessons) {
  const fallbackDate = "2026-06-01T00:00:00.000Z";
  return lessons.map((lesson) => ({
    ...lesson,
    age: normalizeAgeLabel(lesson.age),
    createdAt: lesson.createdAt || lesson.includedAt || lesson.updatedAt || fallbackDate
  }));
}

function normalizeAgeLabel(age) {
  const value = String(age || "").trim();
  return AGE_ALIASES[value] || value || AGE_GROUPS[0];
}

function ageText(age, fallback = "Todas as idades") {
  const normalized = normalizeAgeLabel(age);
  return normalized || fallback;
}

function saveLessons() {
  saveLessonsCache(state.lessons);
}

function saveLessonsCache(lessons) {
  const lightweightLessons = lessons.map((lesson) => ({
    ...lesson,
    cardImage: "",
    activityImage: ""
  }));
  try {
    localStorage.setItem("raizes-lessons", JSON.stringify(lightweightLessons));
    localStorage.setItem("raizes-lessons-version", DATA_VERSION);
  } catch {
    localStorage.removeItem("raizes-lessons");
    try {
      localStorage.setItem("raizes-lessons", JSON.stringify(lightweightLessons));
      localStorage.setItem("raizes-lessons-version", DATA_VERSION);
    } catch {
      // O catálogo completo vem do servidor; o cache local é apenas uma conveniência.
    }
  }
}

async function syncLessonsFromServer() {
  try {
    const response = await fetch("/api/lessons", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.lessons)) return;
    state.lessons = normalizeLessonDates(data.lessons);
    saveLessons();
    state.activeId = state.lessons.some((lesson) => lesson.id === state.activeId)
      ? state.activeId
      : state.lessons[0]?.id || null;
    fillFilters();
    render();
    if (isAdminPage) loadIntoForm(getActiveLesson());
    if (state.trailsRendered) renderTrails();
  } catch {
    // Sem conexão com o catálogo do servidor, o sistema mantém o catálogo local como fallback.
  }
}

async function syncContentFromServer() {
  await Promise.all([
    syncCollectionFromServer("/api/devotionals", "devotionals", "raizes-devotionals"),
    syncCollectionFromServer("/api/trainings", "trainings", "raizes-trainings"),
    syncCollectionFromServer("/api/ebf", "ebfs", "raizes-ebf")
  ]);
  state.activeDevotionalId = state.devotionals.some((item) => item.id === state.activeDevotionalId)
    ? state.activeDevotionalId
    : state.devotionals[0]?.id || null;
  state.activeTrainingId = state.trainings.some((item) => item.id === state.activeTrainingId)
    ? state.activeTrainingId
    : state.trainings[0]?.id || null;
  state.activeEbfId = state.ebfs.some((item) => item.id === state.activeEbfId)
    ? state.activeEbfId
    : state.ebfs[0]?.id || null;
  renderDevotionals();
  renderTrainings();
  renderEbfs();
  renderContentAdminLists();
}

async function syncCollectionFromServer(url, stateKey, cacheKey) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data[stateKey])) return;
    state[stateKey] = normalizeContentItems(data[stateKey]);
    saveCollectionCache(cacheKey, state[stateKey]);
  } catch {
    // O cache local segura a navegação se a conexão oscilar.
  }
}

function normalizeContentItems(items) {
  return items.map((item) => ({
    ...item,
    createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
    sections: item.sections || {},
    attachments: Array.isArray(item.attachments) ? item.attachments : []
  }));
}

async function saveLessonsToServer() {
  saveLessons();
  if (!isAdminPage) return;
  state.savingLessons = true;
  window.raizesIsSavingLessons = true;
  try {
    const response = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessons: state.lessons })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Não foi possível salvar as lições no servidor.");
    }
    if (Array.isArray(data.lessons)) {
      state.lessons = normalizeLessonDates(data.lessons);
      saveLessons();
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Falha de conexão ao salvar. A imagem pode estar grande demais ou a internet oscilou; tente novamente.");
    }
    throw error;
  } finally {
    state.savingLessons = false;
    window.raizesIsSavingLessons = false;
  }
}

function loadManualVideos() {
  const saved = localStorage.getItem("raizes-manual-videos");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map((video) => ({ ...video, age: video.age ? normalizeAgeLabel(video.age) : "" })) : [];
  } catch {
    return [];
  }
}

function saveManualVideos() {
  localStorage.setItem("raizes-manual-videos", JSON.stringify(state.manualVideos));
}

function bindEvents() {
  document.querySelectorAll(".nav-menu").forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      document.querySelectorAll(".nav-menu[open]").forEach((openMenu) => {
        if (openMenu !== menu) openMenu.removeAttribute("open");
      });
    });
  });

  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setTab(tab.dataset.tab);
      tab.closest("details")?.removeAttribute("open");
    });
  });

  document.querySelectorAll("[data-jump-tab]").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.jumpTab));
  });

  document.querySelectorAll("[data-age-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const mappedAge = button.dataset.ageSelect;
      els.ageFilter.value = mappedAge;
      renderList();
      if (state.trailsRendered) renderTrails();
      setTab("study");
      scrollToLessonRail();
    });
  });

  document.querySelectorAll("[data-manage-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      setManageTab(button.dataset.manageTab);
      button.closest("details")?.removeAttribute("open");
    });
  });

  document.querySelectorAll("[data-lesson-rail-prev], [data-lesson-rail-next]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!els.lessonList) return;
      const direction = button.dataset.lessonRailPrev !== undefined ? -1 : 1;
      els.lessonList.scrollBy({ left: direction * Math.round(els.lessonList.clientWidth * 0.9), behavior: "smooth" });
    });
  });

  const refreshFilteredViews = debounce(() => {
    renderActiveFilteredView();
  }, 120);
  [els.search, els.categoryFilter, els.ageFilter, els.testamentFilter, els.specialFilter, els.createdMonthFilter].filter(Boolean).forEach((el) => {
    el.addEventListener("input", refreshFilteredViews);
    el.addEventListener("change", refreshFilteredViews);
  });

  els.newLesson?.addEventListener("click", () => {
    clearForm();
    if (els.manageView) setTab("manage");
    setManageTab("lessons");
    els.title.focus();
  });

  els.ebookPrint?.addEventListener("click", printEbook);
  els.clearForm?.addEventListener("click", () => clearForm({ confirm: true }));
  els.duplicateLesson?.addEventListener("click", duplicateCurrentLesson);
  els.deleteLesson?.addEventListener("click", deleteCurrentLesson);
  els.form?.addEventListener("submit", saveFromForm);
  els.savePrevLesson?.addEventListener("click", () => moveLessonInForm(-1));
  els.saveNextLesson?.addEventListener("click", () => moveLessonInForm(1));
  els.cardImage?.addEventListener("change", handleCardImage);
  els.activityImage?.addEventListener("change", handleActivityImage);
  els.videoForm?.addEventListener("submit", saveVideoFromForm);
  els.clearVideo?.addEventListener("click", () => clearVideoForm({ confirm: true }));
  els.deleteVideo?.addEventListener("click", deleteCurrentVideo);
  els.savePrevVideo?.addEventListener("click", () => moveVideoInForm(-1));
  els.saveNextVideo?.addEventListener("click", () => moveVideoInForm(1));
  els.exportJson?.addEventListener("click", exportJson);
  els.importJson?.addEventListener("change", importJson);
  document.querySelectorAll(".content-editor").forEach((form) => bindContentEditor(form));
  window.addEventListener("resize", debounce(drawSky, 160));
}

function setTab(tabName) {
  if (!canAccessTab(tabName)) tabName = state.authUser ? "devotional" : "home";
  const previousTab = state.tab;
  state.tab = tabName;
  if (previousTab !== tabName) resetFilters();
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  els.homeView?.classList.toggle("active", tabName === "home");
  els.devotionalView?.classList.toggle("active", tabName === "devotional");
  els.trainingView?.classList.toggle("active", tabName === "training");
  els.ebfView?.classList.toggle("active", tabName === "ebf");
  els.studyView?.classList.toggle("active", tabName === "study");
  els.trailsView?.classList.toggle("active", tabName === "trails");
  els.manageView?.classList.toggle("active", tabName === "manage");
  els.filterToolbar?.classList.toggle("hidden", !["study", "trails", "devotional", "training", "ebf"].includes(tabName));
  updateFilterVisibility(tabName);
  if (previousTab === "trails" && tabName !== "trails") stopTrailPlayback();
  if (tabName === "trails" && !state.trailsRendered) {
    setTimeout(() => {
      renderTrails();
      state.trailsRendered = true;
    }, 0);
  }
  renderActiveFilteredView();
}

function updateFilterVisibility(tabName) {
  const contentFields = new Set(["search", "category", "month"]);
  document.querySelectorAll("[data-filter-field]").forEach((field) => {
    const visible = !["devotional", "training", "ebf"].includes(tabName) || contentFields.has(field.dataset.filterField);
    field.classList.toggle("filter-hidden", !visible);
  });
}

function resetFilters() {
  if (els.search) els.search.value = "";
  if (els.categoryFilter) els.categoryFilter.value = "Todas";
  if (els.ageFilter) els.ageFilter.value = "Todas";
  if (els.testamentFilter) els.testamentFilter.value = "Todos";
  if (els.specialFilter) els.specialFilter.value = "Todas";
  if (els.createdMonthFilter) els.createdMonthFilter.value = "";
}

function stopTrailPlayback() {
  if (!els.streamPlayer) return;
  // Remove o iframe do YouTube ao sair de Trilhas, garantindo que o video pare.
  els.streamPlayer.innerHTML = "";
  state.trailsRendered = false;
}

function setManageTab(tabName) {
  state.manageTab = tabName;
  document.querySelectorAll("[data-manage-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.manageTab === tabName);
  });
  $("#lessonManagePanel")?.classList.toggle("active", tabName === "lessons");
  $("#devotionalManagePanel")?.classList.toggle("active", tabName === "devotionals");
  $("#trailManagePanel")?.classList.toggle("active", tabName === "trails");
  $("#trainingManagePanel")?.classList.toggle("active", tabName === "trainings");
  $("#ebfManagePanel")?.classList.toggle("active", tabName === "ebf");
  $("#userManagePanel")?.classList.toggle("active", tabName === "users");
  $("#accessManagePanel")?.classList.toggle("active", tabName === "access");
  $("#contactManagePanel")?.classList.toggle("active", tabName === "contact");
  if (tabName === "access") window.loadAdminAccessLogs?.();
  if (tabName === "contact") window.loadAdminSiteInfo?.();
}

function applyAccessVisibility() {
  document.querySelectorAll("[data-tab='home']").forEach((el) => {
    el.classList.remove("hidden");
  });
  document.querySelectorAll("[data-min-access]").forEach((el) => {
    const visible = !state.authUser || (state.authUser.accessLevel === "test" && el.dataset.tab === "ebf" ? false : canAccessLevel(el.dataset.minAccess));
    el.classList.toggle("hidden", !visible);
  });
  document.querySelectorAll(".nav-menu").forEach((menu) => {
    const visibleItems = [...menu.querySelectorAll(".nav-submenu .tab")]
      .some((item) => !item.classList.contains("hidden") && window.getComputedStyle(item).display !== "none");
    menu.classList.toggle("hidden", !visibleItems);
  });
  if (state.authUser && !canAccessTab(state.tab)) setTab("devotional");
}

function canAccessTab(tabName) {
  if (!state.authUser || state.authUser.role === "admin") return true;
  if (tabName === "home") return true;
  if (state.authUser.accessLevel === "test") return ["devotional", "trails", "study", "training"].includes(tabName);
  if (tabName === "devotional") return true;
  if (["study", "trails"].includes(tabName)) return canAccessLevel("leader");
  if (tabName === "training") return canAccessLevel("prime");
  if (tabName === "ebf") return canAccessLevel("prime");
  return canAccessLevel("prime");
}

function canAccessLevel(required) {
  if (!state.authUser || state.authUser.role === "admin") return true;
  const order = { simple: 1, test: 3, leader: 2, prime: 3 };
  const current = order[state.authUser.accessLevel || "prime"] || 1;
  return current >= (order[required] || 1);
}

function scrollToLessonRail() {
  const target = els.filterToolbar || els.studyView;
  window.requestAnimationFrame(() => {
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (els.lessonList) els.lessonList.scrollLeft = 0;
  });
}

function render() {
  fillFilters();
  fillVideoLessonOptions();
  renderList();
  renderReader();
  renderDevotionals();
  renderTrainings();
  renderEbfs();
  renderLessonAdminList();
  renderTrailAdminList();
  renderVideoAdminList();
}

function renderActiveFilteredView() {
  if (state.tab === "devotional") {
    renderDevotionals();
    return;
  }
  if (state.tab === "training") {
    renderTrainings();
    return;
  }
  if (state.tab === "ebf") {
    renderEbfs();
    return;
  }
  if (state.tab === "trails") {
    renderTrailAdminList();
    if (state.trailsRendered) renderTrails();
    return;
  }
  renderList();
  renderLessonAdminList();
}

function fillFilters() {
  const contentCategories = [...state.devotionals, ...state.trainings, ...state.ebfs].map((item) => item.category).filter(Boolean);
  const categories = unique([...CATEGORIES, ...state.lessons.map((lesson) => lesson.category).filter(Boolean), ...contentCategories]);
  if (els.categoryFilter) fillSelect(els.categoryFilter, ["Todas", ...categories]);
  if (els.ageFilter) fillSelect(els.ageFilter, ["Todas", ...AGE_GROUPS]);
  if (els.categoryOptions) {
    els.categoryOptions.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}"></option>`).join("");
  }
}

function fillSelect(select, values) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = values.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  select.value = values.includes(current) ? current : values[0];
}

function renderSectionFields() {
  if (!els.sectionFields) return;
  els.sectionFields.innerHTML = SECTIONS.map(([key, label]) => `
    <label>
      <span>${label}</span>
      <textarea id="section-${key}" placeholder="Digite o conteúdo de ${label.toLowerCase()}"></textarea>
    </label>
  `).join("");
}

function renderList() {
  if (!els.lessonList || !els.lessonCount) return;
  const lessons = filteredLessons();
  const locked = catalogIsLimited();
  if (lessons.length && !lessons.some((lesson) => lesson.id === state.activeId)) {
    state.activeId = lessons[0].id;
  }
  // Visitante ve todos os cards, mas cada item recebe estado visual de bloqueio.
  els.lessonCount.textContent = locked ? `${lessons.length} item(ns) bloqueado(s)` : `${lessons.length} item(ns)`;
  els.lessonList.innerHTML = lessons.map((lesson) => renderLessonCard(lesson, locked)).join("");

  els.lessonList.querySelectorAll(".lesson-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.activeId = card.dataset.id;
      renderList();
      renderReader();
      if (!catalogIsLimited()) loadIntoForm(getActiveLesson());
    });
  });

  renderLimitedNotice();
}

function renderLessonCard(lesson, locked) {
  const visual = lessonVisual(lesson);
  return `
    <button
      class="lesson-card ${lesson.id === state.activeId ? "active" : ""} ${locked ? "locked" : ""}"
      style="--lesson-primary:${visual.primary};--lesson-soft:${visual.soft};--lesson-accent:${visual.accent}"
      type="button"
      data-id="${escapeHtml(lesson.id)}">
      ${renderLessonCover(lesson, visual)}
      <strong>${escapeHtml(lesson.title)}</strong>
      <span class="lesson-card-verse">${escapeHtml(lesson.category || "Sem categoria")}</span>
      <span class="lesson-card-age">${escapeHtml(ageText(lesson.age))}</span>
      <span class="lesson-meta">
        ${locked ? '<span class="pill lock-pill">🔒 Bloqueado</span>' : ""}
      </span>
    </button>
  `;
}

function renderLessonCover(lesson, visual) {
  if (lesson.cardImage) {
    return `
      <span class="lesson-cover custom-cover">
        <img src="${escapeHtml(lesson.cardImage)}" alt="Capa da lição ${escapeHtml(lesson.title)}" />
        <span class="lesson-cover-ref">${escapeHtml(visual.reference)}</span>
      </span>
    `;
  }
  return `
    <span class="lesson-cover">
      <span class="lesson-cover-ref">${escapeHtml(visual.reference)}</span>
      <span class="lesson-cover-book">${escapeHtml(visual.book)}</span>
      <span class="lesson-cover-principle">${escapeHtml(visual.principle)}</span>
      <span class="lesson-cover-mark">${visual.emoji}</span>
      <span class="lesson-cover-shine"></span>
      <span class="lesson-cover-piece piece-a"></span>
      <span class="lesson-cover-piece piece-b"></span>
    </span>
  `;
}

function renderReader() {
  if (!els.reader) return;
  const lesson = getActiveLesson();
  if (!lesson) {
    els.reader.innerHTML = "";
    return;
  }

  if (catalogIsLimited()) {
    renderLockedReader(lesson);
    return;
  }

  const template = $("#readerTemplate").content.cloneNode(true);
  const theme = categoryTheme(lesson.category);
  els.reader.style.setProperty("--theme", theme.primary);
  els.reader.style.setProperty("--theme-soft", theme.soft);
  template.querySelector(".reader-hero").style.setProperty("--theme", theme.primary);
  template.querySelector(".reader-hero").style.setProperty("--theme-soft", theme.soft);
  template.querySelector(".reader-kicker").textContent = "Lição bíblica infantil";
  template.querySelector("h2").textContent = lesson.title;
  template.querySelector(".reader-category").textContent = `${theme.emoji} ${lesson.category}`;
  template.querySelector(".reader-age").textContent = `👧 ${ageText(lesson.age)}`;
  template.querySelector(".reader-verse strong").textContent = lesson.verse || "Versículo não informado";
  const timeline = template.querySelector(".section-timeline");

  timeline.innerHTML = SECTIONS.map(([key, label, icon, emoji]) => {
    const text = lesson.sections?.[key]?.trim();
    if (!text) return "";
    return `
      <section class="lesson-section">
        <span class="section-icon" aria-hidden="true"><span>${emoji}</span><svg viewBox="0 0 24 24">${ICONS[icon]}</svg></span>
        <div class="section-body">
          <h3><span>${emoji}</span>${label}</h3>
          ${renderLessonTextWithPlayers(text)}
        </div>
      </section>
    `;
  }).join("");

  if (lesson.activityImage) {
    timeline.insertAdjacentHTML("beforeend", `
      <section class="lesson-section activity-art">
        <span class="section-icon" aria-hidden="true"><span>🖍️</span></span>
        <div class="section-body">
          <h3><span>🖍️</span>Imagem para atividade de colorir</h3>
          <img src="${escapeHtml(lesson.activityImage)}" alt="Atividade de colorir da lição ${escapeHtml(lesson.title)}" />
        </div>
      </section>
    `);
  }

  els.reader.innerHTML = "";
  els.reader.append(template);
  $("#printPdfBtn").addEventListener("click", printCurrentLesson);
}

function renderDevotionals() {
  renderContentArea({
    items: state.devotionals,
    activeKey: "activeDevotionalId",
    listSelector: "#devotionalList",
    countSelector: "#devotionalCount",
    readerSelector: "#devotionalReader",
    emptyTitle: "Nenhum culto em família cadastrado",
    emptyText: "Cadastre cultos em família no gerenciamento para orientar as famílias durante a semana.",
    typeLabel: "Culto em Família",
    fields: DEVOTIONAL_FIELDS,
    onChange: renderDevotionals
  });
}

function renderTrainings() {
  renderContentArea({
    items: state.trainings,
    activeKey: "activeTrainingId",
    listSelector: "#trainingList",
    countSelector: "#trainingCount",
    readerSelector: "#trainingReader",
    emptyTitle: "Nenhum treinamento cadastrado",
    emptyText: "Cadastre treinamentos com vídeos, imagens e anexos para os líderes.",
    typeLabel: "Treinamento",
    fields: TRAINING_FIELDS,
    onChange: renderTrainings
  });
}

function renderEbfs() {
  renderContentArea({
    items: state.ebfs,
    activeKey: "activeEbfId",
    listSelector: "#ebfList",
    countSelector: "#ebfCount",
    readerSelector: "#ebfReader",
    emptyTitle: "Nenhuma EBF cadastrada",
    emptyText: "Cadastre materiais completos de EBF no gerenciamento para usuarios Prime.",
    typeLabel: "EBF Completa",
    fields: EBF_FIELDS,
    onChange: renderEbfs
  });
}

function renderContentArea(config) {
  const list = document.querySelector(config.listSelector);
  const count = document.querySelector(config.countSelector);
  const reader = document.querySelector(config.readerSelector);
  if (!list || !reader) return;
  const items = filteredContentItems(normalizeContentItems(config.items));
  if (count) count.textContent = `${items.length} item(ns)`;
  if (!items.length) {
    list.innerHTML = "";
    reader.innerHTML = `<div class="reader-empty"><h2>${config.emptyTitle}</h2><p>${config.emptyText}</p></div>`;
    return;
  }
  if (!items.some((item) => item.id === state[config.activeKey])) state[config.activeKey] = items[0].id;
  const active = items.find((item) => item.id === state[config.activeKey]) || items[0];
  list.innerHTML = items.map((item) => renderContentCard(item, item.id === active.id, config.typeLabel)).join("");
  list.querySelectorAll("[data-content-id]").forEach((card) => {
    card.addEventListener("click", () => {
      state[config.activeKey] = card.dataset.contentId;
      config.onChange();
    });
  });
  reader.innerHTML = renderContentReader(active, config);
}

function filteredContentItems(items) {
  const term = normalize(els.search?.value || "");
  const category = els.categoryFilter?.value || "Todas";
  const createdMonth = els.createdMonthFilter?.value || "";
  const filtered = items.filter((item) => {
    const content = normalize([
      item.title,
      item.category,
      item.season,
      item.verse,
      item.principle,
      item.bibleText,
      item.description,
      ...Object.values(item.sections || {})
    ].join(" "));
    const matchesTerm = !term || content.includes(term);
    const matchesCategory = category === "Todas" || item.category === category;
    const matchesCreatedMonth = !createdMonth || lessonMonthKey(item.createdAt) === createdMonth;
    return matchesTerm && matchesCategory && matchesCreatedMonth;
  });
  return isTestUser() ? filtered.slice(0, 1) : filtered;
}

function isTestUser() {
  return state.authUser?.accessLevel === "test" && state.authUser.role !== "admin";
}

function renderContentCard(item, active, typeLabel) {
  const visual = categoryTheme(item.category || typeLabel);
  const cover = item.cardImage
    ? `<div class="lesson-cover custom-cover"><img src="${escapeHtml(item.cardImage)}" alt="" /></div>`
    : `<div class="lesson-cover"><span class="lesson-cover-book">${escapeHtml(typeLabel)}</span><span class="lesson-cover-principle">${escapeHtml(item.principle || item.description || item.title)}</span><span class="lesson-cover-ref">${escapeHtml(item.season || formatMonthYear(item.createdAt))}</span></div>`;
  if (typeLabel === "Culto em Família") {
    return `
      <button class="lesson-card devotional-card ${active ? "active" : ""}" style="--lesson-primary:${visual.primary};--lesson-soft:${visual.soft};--lesson-accent:${visual.accent}" type="button" data-content-id="${escapeHtml(item.id)}">
        ${cover}
        <strong class="devotional-card-title">${escapeHtml(item.title || "Culto em Família")}</strong>
        <span class="devotional-card-category">${escapeHtml(item.category || "Sem categoria")}</span>
        <span class="devotional-card-verse">${escapeHtml(item.bibleText || item.verse || "Texto bíblico não informado")}</span>
      </button>
    `;
  }
  return `
    <button class="lesson-card ${active ? "active" : ""}" style="--lesson-primary:${visual.primary};--lesson-soft:${visual.soft};--lesson-accent:${visual.accent}" type="button" data-content-id="${escapeHtml(item.id)}">
      ${cover}
      <span class="lesson-card-topic">${escapeHtml(item.category || typeLabel)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <span class="lesson-card-age">${escapeHtml(item.description || item.season || formatMonthYear(item.createdAt))}</span>
      <span class="lesson-card-verse">${escapeHtml(item.bibleText || item.verse || item.principle || "Conteúdo de apoio")}</span>
    </button>
  `;
}

function renderContentReader(item, config) {
  const theme = categoryTheme(item.category || config.typeLabel);
  const linkedVideo = renderContentLinkedVideoSection(item, config.typeLabel);
  const attachments = item.attachments?.length ? `
    <section class="lesson-section">
      <div class="section-icon">📎</div>
      <div class="section-body">
        <h3>Anexos</h3>
        <div class="attachment-list">${item.attachments.map((file) => `<a class="icon-button" href="${escapeHtml(file.url)}" target="_blank" rel="noreferrer">${escapeHtml(file.name || "Anexo")}</a>`).join("")}</div>
      </div>
    </section>
  ` : "";
  return `
    <header class="reader-hero">
      <div class="reader-glow" aria-hidden="true"></div>
      <div class="reader-title-block">
        <span class="reader-kicker">${escapeHtml(config.typeLabel)} · ${escapeHtml(item.season || formatMonthYear(item.createdAt))}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <div class="reader-meta">
          <span class="reader-chip">${theme.emoji} ${escapeHtml(item.category || config.typeLabel)}</span>
          ${item.bibleText ? `<span class="reader-chip">${escapeHtml(item.bibleText)}</span>` : ""}
        </div>
        ${item.verse ? `<p class="reader-verse"><span>Versículo</span><strong>${escapeHtml(item.verse)}</strong></p>` : ""}
      </div>
    </header>
    <div class="section-timeline">
      ${linkedVideo}
      ${item.principle ? `<section class="lesson-section"><div class="section-icon">🌱</div><div class="section-body"><h3>Princípio</h3><p>${escapeHtml(item.principle)}</p></div></section>` : ""}
      ${config.fields.map(([key, label, emoji]) => {
        const text = item.sections?.[key]?.trim();
        if (!text) return "";
        return `<section class="lesson-section"><div class="section-icon">${emoji}</div><div class="section-body"><h3>${label}</h3>${renderLessonTextWithPlayers(text)}</div></section>`;
      }).join("")}
      ${item.activityImage ? `<section class="lesson-section activity-art"><div class="section-icon">🎨</div><div class="section-body"><h3>${config.typeLabel === "Treinamento" ? "Imagem do treinamento" : "Atividade"}</h3><img src="${escapeHtml(item.activityImage)}" alt="${config.typeLabel === "Treinamento" ? "Imagem do treinamento" : "Atividade"}" /></div></section>` : ""}
      ${attachments}
    </div>
  `;
}

function renderContentLinkedVideoSection(item, typeLabel) {
  const candidateTexts = [
    item.youtubeUrl,
    item.description,
    item.verse,
    item.principle,
    item.bibleText
  ].filter((value) => getYouTubeId(value || ""));
  const sectionText = candidateTexts.find(Boolean);
  if (!sectionText) return "";
  const title = typeLabel === "Treinamento" ? "Vídeo do treinamento" : "Vídeo do culto em família";
  return `
    <section class="lesson-section">
      <div class="section-icon">🎬</div>
      <div class="section-body">
        <h3>${title}</h3>
        ${renderLessonTextWithPlayers(sectionText)}
      </div>
    </section>
  `;
}

function renderLessonTextWithPlayers(text) {
  const urlPattern = /(https?:\/\/[^\s<]+)/g;
  let html = "";
  let cursor = 0;
  let match;

  // Cada link do YouTube ganha um player logo abaixo do proprio link na licao.
  // A funcao linkify continua separada para o PDF/e-book, que nao deve imprimir players.
  while ((match = urlPattern.exec(text))) {
    const rawUrl = match[0];
    const url = trimTrailingUrlPunctuation(rawUrl);
    const trailing = rawUrl.slice(url.length);
    const youtubeId = getYouTubeId(url);

    html += formatLessonTextFragment(text.slice(cursor, match.index));
    html += `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>`;
    if (youtubeId) html += buildInlineLessonVideo(youtubeId);
    html += formatLessonTextFragment(trailing);
    cursor = match.index + rawUrl.length;
  }

  html += formatLessonTextFragment(text.slice(cursor));
  return `<div class="lesson-section-copy">${html}</div>`;
}

function buildInlineLessonVideo(youtubeId) {
  return `
    <div class="lesson-inline-video" aria-label="Player do vídeo citado na lição">
      <div class="lesson-inline-video-frame">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${escapeHtml(youtubeId)}?rel=0&modestbranding=1"
          title="Vídeo de apoio da lição"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
    </div>
  `;
}

function trimTrailingUrlPunctuation(url) {
  return url.replace(/[),.;!?]+$/g, "");
}

function formatLessonTextFragment(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

// Mantem o acervo visivel para visitantes, mas protege o conteudo completo.
// Assim a pessoa percebe o valor do sistema antes de entrar ou cadastrar.
function renderLockedReader(lesson) {
  const theme = categoryTheme(lesson.category);
  els.reader.style.setProperty("--theme", theme.primary);
  els.reader.style.setProperty("--theme-soft", theme.soft);
  els.reader.innerHTML = `
    <section class="locked-reader">
      <span class="locked-icon">🔒</span>
      <span class="reader-kicker">Conteúdo exclusivo</span>
      <h2>${escapeHtml(lesson.title)}</h2>
      <p>Esta lição já está disponível no catálogo, mas o plano completo é liberado apenas para usuários com acesso ativo.</p>
      <div class="lesson-meta">
        <span class="pill">${escapeHtml(lesson.category || "Lição")}</span>
        <span class="pill">${escapeHtml(ageText(lesson.age, "Todas as idades"))}</span>
        <span class="pill lock-pill">Bloqueado</span>
      </div>
      <div class="home-login-actions">
        <a class="icon-button primary" href="login.html">Entrar</a>
        <a class="icon-button accent" href="login.html">Cadastrar</a>
      </div>
    </section>
  `;
}

function printCurrentLesson() {
  document.body.classList.remove("ebook-printing");
  if (els.ebookPrintArea) els.ebookPrintArea.innerHTML = "";
  window.print();
}

function filteredLessons() {
  const term = normalize(els.search?.value || "");
  const category = els.categoryFilter?.value || "Todas";
  const age = els.ageFilter?.value || "Todas";
  const testament = els.testamentFilter?.value || "Todos";
  const special = els.specialFilter?.value || "Todas";
  const createdMonth = els.createdMonthFilter?.value || "";

  const filtered = state.lessons.filter((lesson) => {
    const content = normalize([
      lesson.title,
      lesson.category,
      lesson.age,
      lesson.verse,
      ...Object.values(lesson.sections || {})
    ].join(" "));

    const matchesTerm = !term || content.includes(term);
    const matchesCategory = category === "Todas" || lesson.category === category;
    const matchesAge = age === "Todas" || normalizeAgeLabel(lesson.age) === age;
    const matchesTestament = testament === "Todos" || inferTestament(content) === testament;
    const matchesSpecial = special === "Todas" || content.includes(normalize(special));
    const matchesCreatedMonth = !createdMonth || lessonMonthKey(lesson.createdAt) === createdMonth;
    return matchesTerm && matchesCategory && matchesAge && matchesTestament && matchesSpecial && matchesCreatedMonth;
  });
  return isTestUser() ? filtered.filter((lesson) => lesson.testOnly || lesson.source === "pais-import-20260702") : filtered;
}

function lessonMonthKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Visitantes enxergam o tamanho do acervo, mas nao acessam o conteudo interno.
// O administrador e usuarios logados continuam com acesso normal.
function catalogIsLimited() {
  return !isAdminPage && !state.authUser;
}

function renderLimitedNotice() {
  const target = state.tab === "trails" ? els.trailGrid : els.lessonList;
  if (!target || !catalogIsLimited()) {
    document.querySelectorAll(".limited-notice").forEach((notice) => notice.remove());
    return;
  }
  const parent = target.parentElement;
  if (!parent || parent.querySelector(".limited-notice")) return;
  parent.insertAdjacentHTML("afterbegin", `
    <div class="limited-notice">
      <strong>Catálogo visível, acesso protegido</strong>
      <span>Você está vendo tudo que existe. Entre para abrir lições, trilhas, cultos em família e EBF completa.</span>
      <a href="login.html">Entrar</a>
    </div>
  `);
}

function inferTestament(content) {
  const oldTestament = [
    "genesis", "exodo", "levitico", "numeros", "deuteronomio", "josue", "juizes", "rute",
    "samuel", "reis", "cronicas", "esdras", "neemias", "ester", "jo", "salmos", "proverbios",
    "eclesiastes", "canticos", "isaias", "jeremias", "lamentacoes", "ezequiel", "daniel",
    "oseias", "joel", "amos", "obadias", "jonas", "miqueias", "naum", "habacuque",
    "sofonias", "ageu", "zacarias", "malaquias", "criacao", "abraao", "moises", "davi"
  ];
  const newTestament = [
    "mateus", "marcos", "lucas", "joao", "atos", "romanos", "corintios", "galatas",
    "efesios", "filipenses", "colossenses", "tessalonicenses", "timoteo", "tito", "filemom",
    "hebreus", "tiago", "pedro", "judas", "apocalipse", "jesus", "evangelho", "apostolo",
    "discipulos", "paulo"
  ];
  if (oldTestament.some((term) => content.includes(term))) return "Antigo Testamento";
  if (newTestament.some((term) => content.includes(term))) return "Novo Testamento";
  return "";
}

async function saveFromForm(event) {
  event.preventDefault();
  try {
    showActionMessage("lesson", "Salvando lição no servidor...");
    const lesson = await persistLessonFromForm();
    if (!lesson) return;
    showActionMessage("lesson", `Lição "${lesson.title}" salva no banco de dados.`);
    if (els.studyView) {
      setTab("study");
    } else {
      setManageTab("lessons");
    }
  } catch (error) {
    showActionMessage("lesson", error.message || "Não foi possível salvar a lição.", true);
  }
}

async function persistLessonFromForm() {
  if (!els.form?.reportValidity()) return null;
  await waitForLessonImages();
  const id = els.lessonId.value || crypto.randomUUID();
  const existingLesson = state.lessons.find((item) => item.id === id);
  const lesson = {
    id,
    createdAt: existingLesson?.createdAt || new Date().toISOString(),
    title: els.title.value.trim(),
    category: els.category.value.trim(),
    age: normalizeAgeLabel(els.age.value),
    verse: els.verse.value.trim(),
    cardImage: els.cardImagePreview.dataset.image || "",
    activityImage: els.activityImagePreview.dataset.image || "",
    sections: {}
  };

  SECTIONS.forEach(([key]) => {
    lesson.sections[key] = $(`#section-${key}`).value.trim();
  });

  const index = state.lessons.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.lessons[index] = lesson;
  } else {
    state.lessons.unshift(lesson);
  }

  state.activeId = id;
  await saveLessonsToServer();
  const savedLesson = state.lessons.find((item) => item.id === id) || lesson;
  render();
  loadIntoForm(savedLesson);
  return savedLesson;
}

function moveLessonInForm(direction) {
  const currentId = els.lessonId.value || state.activeId;
  const nextLesson = getAdjacentLesson(currentId, direction);
  if (!nextLesson) {
    showActionMessage("lesson", "Não há outra lição neste filtro.");
    return;
  }
  state.activeId = nextLesson.id;
  loadIntoForm(nextLesson);
  renderList();
  renderReader();
  renderDevotionals();
  renderTrainings();
  renderLessonAdminList();
  showActionMessage("lesson", `Editando agora: "${nextLesson.title}".`);
  els.form?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getAdjacentLesson(currentId, direction) {
  const lessons = filteredLessons();
  if (!lessons.length) return null;
  const currentIndex = lessons.findIndex((item) => item.id === currentId);
  const nextIndex = (currentIndex < 0 ? 0 : currentIndex) + direction;
  return lessons[nextIndex] || null;
}

function loadIntoForm(lesson) {
  if (!lesson || !els.form) return;
  resetLessonImageInputs();
  els.lessonId.value = lesson.id;
  els.title.value = lesson.title || "";
  els.category.value = lesson.category || "";
  els.age.value = lesson.age || AGE_GROUPS[0];
  els.verse.value = lesson.verse || "";
  setCardImagePreview(lesson.cardImage || "");
  setActivityImagePreview(lesson.activityImage || "");
  SECTIONS.forEach(([key]) => {
    $(`#section-${key}`).value = lesson.sections?.[key] || "";
  });
}

function clearForm(options = {}) {
  if (!els.form) return;
  if (options.confirm && !window.confirm("Limpar todos os campos da lição? As alterações não salvas serão perdidas.")) {
    return;
  }
  els.form.reset();
  resetLessonImageInputs();
  els.lessonId.value = "";
  els.age.value = AGE_GROUPS[0];
  setCardImagePreview("");
  setActivityImagePreview("");
  SECTIONS.forEach(([key]) => {
    $(`#section-${key}`).value = "";
  });
  if (options.confirm) showActionMessage("lesson", "Formulário de lição limpo.");
}

function duplicateCurrentLesson() {
  const sourceId = els.lessonId.value || state.activeId;
  const source = state.lessons.find((lesson) => lesson.id === sourceId);
  if (!source) {
    showActionMessage("lesson", "Selecione uma lição para duplicar.", true);
    return;
  }

  const duplicate = {
    ...structuredClone(source),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title: `${source.title || "Lição"} (cópia)`
  };

  state.activeId = duplicate.id;
  loadIntoForm(duplicate);
  renderLessonAdminList();
  renderList();
  renderReader();
  showActionMessage("lesson", "Cópia criada no formulário. Ajuste o que desejar e clique em Salvar.");
  els.title?.focus();
  els.form?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleCardImage(event) {
  if (!els.cardImagePreview) return;
  const file = event.target.files?.[0];
  if (!file) return;
  const token = crypto.randomUUID();
  state.cardImageReadToken = token;
  window.raizesIsPreparingImages = true;
  showActionMessage("lesson", "Preparando imagem do card...");
  state.cardImagePromise = readCompressedImage(file, { maxWidth: 1280, maxHeight: 720, quality: 0.84 }).then((src) => {
    if (state.cardImageReadToken === token) {
      setCardImagePreview(src);
      showActionMessage("lesson", "Imagem do card pronta. Clique em Salvar para gravar.");
    }
    return src;
  }).catch(() => {
    if (state.cardImageReadToken === token) showActionMessage("lesson", "Não foi possível carregar esta imagem do card.", true);
    return null;
  }).finally(() => {
    if (state.cardImageReadToken === token) state.cardImagePromise = null;
    window.raizesIsPreparingImages = Boolean(state.cardImagePromise || state.activityImagePromise);
  });
}

function setCardImagePreview(src) {
  if (!els.cardImagePreview) return;
  els.cardImagePreview.dataset.image = src || "";
  els.cardImagePreview.innerHTML = src
    ? `<img src="${escapeHtml(src)}" alt="Imagem do card da lição" /><button class="icon-button danger" type="button" id="removeCardImageBtn">Remover capa</button>`
    : '<p class="muted-line">Nenhuma imagem de card cadastrada. O sistema usará a capa automática.</p>';
  const removeButton = $("#removeCardImageBtn");
  if (removeButton) {
    removeButton.addEventListener("click", () => {
      if (els.cardImage) els.cardImage.value = "";
      setCardImagePreview("");
    });
  }
}

function handleActivityImage(event) {
  if (!els.activityImagePreview) return;
  const file = event.target.files?.[0];
  if (!file) return;
  const token = crypto.randomUUID();
  state.activityImageReadToken = token;
  window.raizesIsPreparingImages = true;
  showActionMessage("lesson", "Preparando imagem da atividade...");
  state.activityImagePromise = readCompressedImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.86 }).then((src) => {
    if (state.activityImageReadToken === token) {
      setActivityImagePreview(src);
      showActionMessage("lesson", "Imagem da atividade pronta. Clique em Salvar para gravar.");
    }
    return src;
  }).catch(() => {
    if (state.activityImageReadToken === token) showActionMessage("lesson", "Não foi possível carregar esta imagem da atividade.", true);
    return null;
  }).finally(() => {
    if (state.activityImageReadToken === token) state.activityImagePromise = null;
    window.raizesIsPreparingImages = Boolean(state.cardImagePromise || state.activityImagePromise);
  });
}

function resetLessonImageInputs() {
  state.cardImageReadToken = "";
  state.activityImageReadToken = "";
  state.cardImagePromise = null;
  state.activityImagePromise = null;
  window.raizesIsPreparingImages = false;
  if (els.cardImage) els.cardImage.value = "";
  if (els.activityImage) els.activityImage.value = "";
}

async function waitForLessonImages() {
  const pending = [state.cardImagePromise, state.activityImagePromise].filter(Boolean);
  if (!pending.length) return;
  showActionMessage("lesson", "Finalizando preparo das imagens antes de salvar...");
  await Promise.all(pending);
}

function readCompressedImage(file, options = {}) {
  const maxWidth = options.maxWidth || 1280;
  const maxHeight = options.maxHeight || 1280;
  const quality = options.quality || 0.84;
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      image.onload = () => {
        const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = reject;
      image.src = String(reader.result || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setActivityImagePreview(src) {
  if (!els.activityImagePreview) return;
  els.activityImagePreview.dataset.image = src || "";
  els.activityImagePreview.innerHTML = src
    ? `<img src="${escapeHtml(src)}" alt="Imagem da atividade de colorir" /><button class="icon-button danger" type="button" id="removeActivityImageBtn">Remover imagem</button>`
    : '<p class="muted-line">Nenhuma imagem de atividade cadastrada.</p>';
  const removeButton = $("#removeActivityImageBtn");
  if (removeButton) {
    removeButton.addEventListener("click", () => {
      if (els.activityImage) els.activityImage.value = "";
      setActivityImagePreview("");
    });
  }
}

async function deleteCurrentLesson() {
  const id = els.lessonId.value || state.activeId;
  if (!id) {
    showActionMessage("lesson", "Selecione uma lição para excluir.", true);
    return;
  }
  const lesson = state.lessons.find((item) => item.id === id);
  if (!lesson) {
    showActionMessage("lesson", "Lição não encontrada para exclusão.", true);
    return;
  }
  const confirmed = window.confirm(`Excluir a lição "${lesson.title}"? Esta ação não poderá ser desfeita.`);
  if (!confirmed) return;
  state.lessons = state.lessons.filter((item) => item.id !== id);
  state.activeId = state.lessons[0]?.id || null;
  try {
    await saveLessonsToServer();
    clearForm();
    render();
    showActionMessage("lesson", `Lição "${lesson.title}" excluída do banco de dados.`);
  } catch (error) {
    showActionMessage("lesson", error.message || "Não foi possível excluir a lição no servidor.", true);
  }
}

function fillVideoLessonOptions() {
  if (!els.videoLesson) return;
  const current = els.videoLesson.value;
  els.videoLesson.innerHTML = [
    '<option value="">Sem lição específica</option>',
    ...state.lessons.map((lesson) => `<option value="${escapeHtml(lesson.id)}">${escapeHtml(lesson.title)} · ${escapeHtml(ageText(lesson.age))}</option>`)
  ].join("");
  els.videoLesson.value = [...els.videoLesson.options].some((option) => option.value === current) ? current : "";
}

function saveVideoFromForm(event) {
  event.preventDefault();
  const video = persistVideoFromForm();
  if (!video) return;
  clearVideoForm();
  state.trailsRendered = true;
  renderTrails();
  renderTrailAdminList();
  renderVideoAdminList();
  showActionMessage("video", `Vídeo "${video.title}" salvo com sucesso.`);
  return video;
}

function persistVideoFromForm() {
  if (!els.videoForm?.reportValidity()) return null;
  const url = els.videoUrl.value.trim();
  const youtubeId = getYouTubeId(url);
  if (!youtubeId) {
    showActionMessage("video", "Informe um link válido do YouTube.", true);
    return null;
  }

  const linkedLesson = state.lessons.find((lesson) => lesson.id === els.videoLesson.value);
  const videoAge = els.videoAge.value ? normalizeAgeLabel(els.videoAge.value) : linkedLesson?.age ? normalizeAgeLabel(linkedLesson.age) : "";
  const video = {
    id: els.videoId.value || crypto.randomUUID(),
    source: "manual",
    title: els.videoTitle.value.trim() || `Vídeo de apoio · ${linkedLesson?.title || "Trilha"}`,
    url,
    youtubeId,
    category: els.videoCategory.value.trim() || linkedLesson?.category || "Trilha",
    age: videoAge,
    lessonId: els.videoLesson.value,
    description: els.videoDescription.value.trim(),
    playlist: els.videoPlaylist.value.trim(),
    season: els.videoSeason.value.trim(),
    featured: els.videoFeatured.checked,
    trending: els.videoTrending.checked,
    recommended: els.videoRecommended.checked
  };

  const index = state.manualVideos.findIndex((item) => item.id === video.id);
  if (index >= 0) {
    state.manualVideos[index] = video;
  } else {
    state.manualVideos.unshift(video);
  }

  saveManualVideos();
  state.trailsRendered = true;
  renderTrails();
  renderTrailAdminList();
  renderVideoAdminList();
  return video;
}

function moveVideoInForm(direction) {
  const currentId = els.videoId.value || state.activeVideoId;
  const nextVideo = getAdjacentManualVideo(currentId, direction);
  if (!nextVideo) {
    showActionMessage("video", "Não há outro vídeo manual neste filtro.");
    return;
  }
  loadVideoIntoForm(nextVideo);
  renderTrailAdminList();
  renderVideoAdminList();
  showActionMessage("video", `Editando agora: "${nextVideo.title}".`);
  els.videoForm?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getAdjacentManualVideo(currentId, direction) {
  const manualIds = new Set(state.manualVideos.map((video) => video.id));
  const videos = filteredVideos().filter((video) => manualIds.has(video.id));
  if (!videos.length) return null;
  const currentIndex = videos.findIndex((item) => item.id === currentId);
  const nextIndex = (currentIndex < 0 ? 0 : currentIndex) + direction;
  return videos[nextIndex] || null;
}

function loadVideoIntoForm(video) {
  if (!video || video.source !== "manual" || !els.videoForm) return;
  state.activeVideoId = video.id;
  els.videoId.value = video.id;
  els.videoTitle.value = video.title || "";
  els.videoUrl.value = video.url || "";
  els.videoCategory.value = video.category || "";
  els.videoAge.value = video.age ? normalizeAgeLabel(video.age) : "";
  els.videoLesson.value = video.lessonId || "";
  els.videoDescription.value = video.description || "";
  els.videoPlaylist.value = video.playlist || "";
  els.videoSeason.value = video.season || "";
  els.videoFeatured.checked = Boolean(video.featured);
  els.videoTrending.checked = Boolean(video.trending);
  els.videoRecommended.checked = Boolean(video.recommended);
}

function clearVideoForm(options = {}) {
  if (!els.videoForm) return;
  if (options.confirm && !window.confirm("Limpar todos os campos do vídeo? As alterações não salvas serão perdidas.")) {
    return;
  }
  els.videoForm.reset();
  els.videoId.value = "";
  els.videoLesson.value = "";
  if (options.confirm) showActionMessage("video", "Formulário de vídeo limpo.");
}

function deleteCurrentVideo() {
  const id = els.videoId.value;
  if (!id) {
    showActionMessage("video", "Selecione um vídeo manual para excluir.", true);
    return;
  }
  const video = state.manualVideos.find((item) => item.id === id);
  if (!video) {
    showActionMessage("video", "Vídeo não encontrado para exclusão.", true);
    return;
  }
  const confirmed = window.confirm(`Excluir o vídeo "${video.title}"? Esta ação não poderá ser desfeita.`);
  if (!confirmed) return;
  state.manualVideos = state.manualVideos.filter((item) => item.id !== id);
  saveManualVideos();
  clearVideoForm();
  state.trailsRendered = true;
  renderTrails();
  renderTrailAdminList();
  renderVideoAdminList();
  showActionMessage("video", `Vídeo "${video.title}" excluído com sucesso.`);
}

function renderLessonAdminList() {
  if (!els.lessonAdminList) return;
  const lessons = filteredLessons();
  if (!lessons.length) {
    els.lessonAdminList.innerHTML = '<p class="muted-line">Nenhuma lição encontrada com os filtros atuais.</p>';
    return;
  }

  els.lessonAdminList.innerHTML = lessons.map((lesson) => renderLessonAdminCard(lesson)).join("");

  els.lessonAdminList.querySelectorAll("[data-admin-lesson-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const lesson = state.lessons.find((item) => item.id === card.dataset.adminLessonId);
      if (!lesson) return;
      state.activeId = lesson.id;
      loadIntoForm(lesson);
      renderList();
      renderReader();
      renderLessonAdminList();
      els.form?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderLessonAdminCard(lesson) {
  const visual = lessonVisual(lesson);
  return `
    <button
      class="lesson-card admin-lesson-card ${lesson.id === state.activeId ? "active" : ""}"
      style="--lesson-primary:${visual.primary};--lesson-soft:${visual.soft};--lesson-accent:${visual.accent}"
      type="button"
      data-admin-lesson-id="${escapeHtml(lesson.id)}">
      ${renderLessonCover(lesson, visual)}
      <strong>${escapeHtml(lesson.title)}</strong>
      <span class="lesson-card-age">${escapeHtml(formatLessonAge(lesson.age))}</span>
      <span class="lesson-card-verse">${escapeHtml(lesson.verse || "Sem versículo informado")}</span>
      <span class="lesson-meta">
        <span class="pill">${escapeHtml(lesson.category || "Sem categoria")}</span>
        <span class="pill">${escapeHtml(formatMonthYear(lesson.createdAt))}</span>
      </span>
    </button>
  `;
}

function renderTrailAdminList() {
  if (!els.trailAdminList) return;
  const videos = filteredVideos();
  if (!videos.length) {
    els.trailAdminList.innerHTML = '<p class="muted-line">Nenhuma trilha encontrada com os filtros atuais.</p>';
    return;
  }

  els.trailAdminList.innerHTML = videos.map((video) => `
      <button class="admin-item-card ${video.id === state.activeVideoId ? "active" : ""}" type="button" data-admin-trail-id="${escapeHtml(video.id)}">
        <span class="admin-item-icon video-icon">▶</span>
        <span class="admin-item-body">
          <strong>${escapeHtml(video.title)}</strong>
          <small>${escapeHtml(video.category || "Trilha")} · ${escapeHtml(video.age ? ageText(video.age) : "Todas as idades")}</small>
          <em>${video.source === "manual" ? "Vídeo manual" : `Gerado pela lição: ${escapeHtml(video.lessonTitle || "sem título")}`}</em>
        </span>
        <span class="admin-item-action">${video.source === "manual" ? "Editar vídeo" : "Editar lição"}</span>
      </button>
    `).join("");

  els.trailAdminList.querySelectorAll("[data-admin-trail-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const video = allVideos().find((item) => item.id === card.dataset.adminTrailId);
      if (!video) return;
      state.activeVideoId = video.id;
      if (video.source === "manual") {
        loadVideoIntoForm(video);
        renderTrailAdminList();
        els.videoForm?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const lesson = state.lessons.find((item) => item.id === video.lessonId);
      if (lesson) {
        state.activeId = lesson.id;
        loadIntoForm(lesson);
        setManageTab("lessons");
        renderList();
        renderReader();
        renderLessonAdminList();
        els.form?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function renderVideoAdminList() {
  if (!els.videoAdminList) return;
  if (!state.manualVideos.length) {
    els.videoAdminList.innerHTML = '<p class="muted-line">Nenhum vídeo manual cadastrado ainda.</p>';
    return;
  }

  els.videoAdminList.innerHTML = state.manualVideos.map((video) => `
    <button class="video-admin-card" type="button" data-video-id="${escapeHtml(video.id)}">
      <strong>${escapeHtml(video.title)}</strong>
      <span>${escapeHtml(video.category || "Trilha")} · ${escapeHtml(video.age ? ageText(video.age) : "Todas as idades")}</span>
    </button>
  `).join("");

  document.querySelectorAll(".video-admin-card").forEach((card) => {
    card.addEventListener("click", () => {
      const video = state.manualVideos.find((item) => item.id === card.dataset.videoId);
      loadVideoIntoForm(video);
      setManageTab("trails");
      if (els.manageView) setTab("manage");
    });
  });
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state.lessons, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "catalogo-licoes-biblicas.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("Formato invalido");
    state.lessons = normalizeLessonDates(parsed);
    state.activeId = state.lessons[0]?.id || null;
    await saveLessonsToServer();
    clearForm();
    render();
    showActionMessage("lesson", "JSON importado e salvo no banco de dados.");
  } catch (error) {
    window.alert(error.message || "Não foi possível importar este JSON.");
  } finally {
    event.target.value = "";
  }
}

function renderTrails() {
  if (!els.trailGrid) return;
  const videos = filteredVideos();
  const locked = catalogIsLimited();
  // Nas trilhas, visitantes tambem veem o acervo completo com cadeado.
  if (els.trailCount) els.trailCount.textContent = locked ? `${videos.length} trilha(s) bloqueada(s)` : `${videos.length} vídeo(s)`;
  renderLimitedNotice();

  if (!videos.length) {
    if (els.streamPlayer) els.streamPlayer.innerHTML = "";
    if (els.streamHero) els.streamHero.innerHTML = "";
    if (els.streamQuickNav) els.streamQuickNav.innerHTML = "";
    els.trailGrid.innerHTML = `
      <div class="reader-empty compact-empty">
        <h2>Nenhum vídeo nesta seleção</h2>
        <p>Altere os filtros ou cadastre um vídeo em Gerenciamento.</p>
      </div>
    `;
    return;
  }

  if (!videos.some((video) => video.id === state.activeVideoId)) {
    state.activeVideoId = pickFeaturedVideo(videos).id;
  }

  const activeVideo = videos.find((video) => video.id === state.activeVideoId) || videos[0];
  if (locked) {
    renderLockedStreamPlayer(activeVideo);
  } else {
    renderStreamPlayer(activeVideo);
  }
  renderStreamHero(pickFeaturedVideo(videos));
  const grouped = groupVideosByShelf(videos);
  renderStreamQuickNav(grouped);
  els.trailGrid.innerHTML = grouped.map(([shelf, shelfVideos]) => `
    <section class="trail-row" id="${escapeHtml(shelfId(shelf))}" aria-label="${escapeHtml(shelf)}">
      <div class="trail-row-heading">
        <h3>${escapeHtml(shelf)}</h3>
        <div class="trail-row-controls">
          <span>${shelfVideos.length} vídeo(s)</span>
          <button class="rail-arrow" type="button" data-rail-prev="${escapeHtml(shelfId(shelf))}" aria-label="Voltar">‹</button>
          <button class="rail-arrow" type="button" data-rail-next="${escapeHtml(shelfId(shelf))}" aria-label="Avançar">›</button>
        </div>
      </div>
      <div class="trail-rail">
        ${shelfVideos.map(renderTrailCard).join("")}
      </div>
    </section>
  `).join("");

  document.querySelectorAll("[data-edit-video]").forEach((button) => {
    button.addEventListener("click", () => {
      const video = state.manualVideos.find((item) => item.id === button.dataset.editVideo);
      loadVideoIntoForm(video);
      setManageTab("trails");
      if (els.manageView) {
        setTab("manage");
      } else {
        window.location.href = "gerenciamento.html#trilhas";
      }
    });
  });

  document.querySelectorAll("[data-play-video]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedVideo = videos.find((video) => video.id === button.dataset.playVideo) || activeVideo;
      if (catalogIsLimited()) {
        renderLockedStreamPlayer(selectedVideo);
        els.streamPlayer?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      state.activeVideoId = selectedVideo.id;
      renderTrails();
      els.streamPlayer?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-rail-prev], [data-rail-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.railPrev || button.dataset.railNext;
      const row = document.getElementById(id);
      const rail = row?.querySelector(".trail-rail");
      if (!rail) return;
      const direction = button.dataset.railPrev ? -1 : 1;
      rail.scrollBy({ left: direction * Math.round(rail.clientWidth * 0.82), behavior: "smooth" });
    });
  });
}

function renderContentAdminLists() {
  renderContentAdminList("devotional", state.devotionals, "#devotionalAdminList");
  renderContentAdminList("training", state.trainings, "#trainingAdminList");
  renderContentAdminList("ebf", state.ebfs, "#ebfAdminList");
}

function contentTypeConfig(type) {
  if (type === "devotional") return { key: "devotionals", cache: "raizes-devotionals", url: "/api/admin/devotionals", label: "Culto em Família", emptyName: "culto em família", form: "#devotionalForm" };
  if (type === "ebf") return { key: "ebfs", cache: "raizes-ebf", url: "/api/admin/ebf", label: "EBF Completa", emptyName: "EBF", form: "#ebfForm" };
  return { key: "trainings", cache: "raizes-trainings", url: "/api/admin/trainings", label: "Treinamento", emptyName: "treinamento", form: "#trainingForm" };
}

function renderContentAdminList(type, items, selector) {
  const list = document.querySelector(selector);
  if (!list) return;
  if (!items.length) {
    list.innerHTML = `<p class="muted-line">Nenhum ${contentTypeConfig(type).emptyName} cadastrado ainda.</p>`;
    return;
  }
  list.innerHTML = items.map((item) => renderContentCard(item, false, contentTypeConfig(type).label).replace("data-content-id", `data-admin-${type}-id`)).join("");
  list.querySelectorAll(`[data-admin-${type}-id]`).forEach((card) => {
    card.addEventListener("click", () => {
      const item = items.find((entry) => entry.id === card.getAttribute(`data-admin-${type}-id`));
      if (item) loadContentIntoForm(type, item);
    });
  });
}

function bindContentEditor(form) {
  const type = form.dataset.contentType;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    window.raizesIsSavingContent = true;
    try {
      showContentMessage(form, "Salvando no servidor...");
      const item = await contentFromForm(type, form);
      await saveContentCollection(type, item);
      clearContentForm(form);
      showContentMessage(form, `${contentTypeConfig(type).label} salvo com sucesso.`);
    } catch (error) {
      showContentMessage(form, error.message || "Nao foi possivel salvar.", true);
    } finally {
      window.raizesIsSavingContent = false;
    }
  });
  form.querySelector("[data-content-clear]")?.addEventListener("click", () => clearContentForm(form));
  form.querySelector("[data-content-export-pdf]")?.addEventListener("click", async () => {
    try {
      const item = await contentFromForm(type, form, { includeNewAttachments: false });
      await printContentPdf(type, item);
    } catch (error) {
      showContentMessage(form, error.message || "Nao foi possivel exportar o PDF.", true);
    }
  });
  form.querySelector("[data-content-delete]")?.addEventListener("click", async () => {
    const id = form.elements.id.value;
    if (!id || !window.confirm("Excluir este item?")) return;
    const key = contentTypeConfig(type).key;
    state[key] = state[key].filter((item) => item.id !== id);
    await postContentCollection(type);
    clearContentForm(form);
    renderDevotionals();
    renderTrainings();
    renderEbfs();
    renderContentAdminLists();
  });
}

async function contentFromForm(type, form, options = {}) {
  const includeNewAttachments = options.includeNewAttachments !== false;
  const data = Object.fromEntries(new FormData(form).entries());
  const existing = findContentItem(type, data.id);
  const createdAt = data.createdMonth ? `${data.createdMonth}-01T00:00:00.000Z` : existing?.createdAt || new Date().toISOString();
  const removeCardImage = Boolean(data.removeCardImage);
  const removeActivityImage = Boolean(data.removeActivityImage);
  const removedAttachmentUrls = new Set(new FormData(form).getAll("removeAttachmentUrl").map(String));
  const item = {
    ...(existing || {}),
    id: data.id || crypto.randomUUID(),
    title: String(data.title || "").trim(),
    category: String(data.category || (type === "devotional" ? "Família" : type === "ebf" ? "EBF Completa" : "Treinamento")).trim(),
    season: String(data.season || "").trim(),
    createdAt,
    cardImage: removeCardImage ? "" : existing?.cardImage || "",
    activityImage: removeActivityImage ? "" : existing?.activityImage || "",
    attachments: (existing?.attachments || []).filter((attachment) => !removedAttachmentUrls.has(String(attachment.url || ""))),
    sections: {}
  };
  if (!item.title) throw new Error("Informe o titulo.");
  if (type === "devotional") {
    item.principle = String(data.principle || "").trim();
    item.bibleText = String(data.bibleText || "").trim();
    item.verse = String(data.verse || "").trim();
    item.sections = {
      devotional: String(data.devotional || "").trim(),
      prayer: String(data.prayer || "").trim(),
      activity: String(data.activity || "").trim()
    };
    item.activityImage = await readOptionalImage(form.elements.activityImageFile, item.activityImage);
  } else if (type === "ebf") {
    item.description = String(data.description || "").trim();
    item.sections = {
      content: String(data.content || "").trim(),
      schedule: String(data.schedule || "").trim(),
      notes: String(data.notes || "").trim()
    };
    item.activityImage = await readOptionalImage(form.elements.activityImageFile, item.activityImage);
    if (includeNewAttachments) {
      item.attachments = [...item.attachments, ...await readOptionalAttachments(form.elements.attachmentsFile)];
    }
  } else {
    item.youtubeUrl = String(data.youtubeUrl || "").trim();
    item.description = String(data.description || "").trim();
    item.sections = {
      content: String(data.content || "").trim(),
      notes: String(data.notes || "").trim()
    };
    item.activityImage = await readOptionalImage(form.elements.activityImageFile, item.activityImage);
    if (includeNewAttachments) {
      item.attachments = [...item.attachments, ...await readOptionalAttachments(form.elements.attachmentsFile)];
    }
  }
  item.cardImage = await readOptionalImage(form.elements.cardImageFile, item.cardImage);
  return item;
}

async function saveContentCollection(type, item) {
  const key = contentTypeConfig(type).key;
  const index = state[key].findIndex((entry) => entry.id === item.id);
  if (index >= 0) state[key][index] = item;
  else state[key].unshift(item);
  await postContentCollection(type);
  renderDevotionals();
  renderTrainings();
  renderEbfs();
  renderContentAdminLists();
  if (state.trailsRendered) renderTrails();
}

async function postContentCollection(type) {
  const { key, url, cache } = contentTypeConfig(type);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: state[key] })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Falha ao salvar no servidor.");
  if (Array.isArray(data[key])) state[key] = normalizeContentItems(data[key]);
  saveCollectionCache(cache, state[key]);
}

function findContentItem(type, id) {
  const key = contentTypeConfig(type).key;
  return state[key].find((item) => item.id === id);
}

function loadContentIntoForm(type, item) {
  const form = document.querySelector(contentTypeConfig(type).form);
  if (!form) return;
  form.reset();
  form.elements.id.value = item.id || "";
  form.elements.title.value = item.title || "";
  form.elements.category.value = item.category || "";
  form.elements.season.value = item.season || "";
  form.elements.createdMonth.value = lessonMonthKey(item.createdAt);
  if (type === "devotional") {
    form.elements.principle.value = item.principle || "";
    form.elements.bibleText.value = item.bibleText || "";
    form.elements.verse.value = item.verse || "";
    form.elements.devotional.value = item.sections?.devotional || "";
    form.elements.prayer.value = item.sections?.prayer || "";
    form.elements.activity.value = item.sections?.activity || "";
  } else if (type === "ebf") {
    form.elements.description.value = item.description || "";
    form.elements.content.value = item.sections?.content || "";
    form.elements.schedule.value = item.sections?.schedule || "";
    form.elements.notes.value = item.sections?.notes || "";
    renderCurrentAttachments(form, item.attachments || []);
  } else {
    form.elements.youtubeUrl.value = item.youtubeUrl || "";
    form.elements.description.value = item.description || "";
    form.elements.content.value = item.sections?.content || "";
    form.elements.notes.value = item.sections?.notes || "";
    renderCurrentAttachments(form, item.attachments || []);
  }
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearContentForm(form) {
  form.reset();
  form.elements.id.value = "";
  renderCurrentAttachments(form, []);
}

function renderCurrentAttachments(form, attachments) {
  const holder = form.querySelector("[data-current-attachments]");
  if (!holder) return;
  if (!attachments.length) {
    holder.innerHTML = `
      <div class="current-attachments-empty">
        <strong>Anexos atuais</strong>
        <span>Nenhum anexo salvo neste treinamento.</span>
      </div>
    `;
    return;
  }
  holder.innerHTML = `
    <div class="current-attachments-heading">
      <strong>Anexos atuais</strong>
      <span>Marque apenas o arquivo que deseja remover ao salvar.</span>
    </div>
    <div class="current-attachments-list">
      ${attachments.map((attachment) => `
        <label class="attachment-remove-option">
          <input name="removeAttachmentUrl" type="checkbox" value="${escapeHtml(attachment.url || "")}" />
          <span>
            <strong>${escapeHtml(attachment.name || "Anexo")}</strong>
            <small>${escapeHtml(attachment.type || "Arquivo salvo")}</small>
          </span>
        </label>
      `).join("")}
    </div>
  `;
}

async function printContentPdf(type, item) {
  if (!els.ebookPrintArea) return;
  els.ebookPrintArea.innerHTML = buildContentPdfHtml(type, item);
  document.body.classList.add("ebook-printing");
  await waitForEbookLayout();
  const cleanup = () => {
    document.body.classList.remove("ebook-printing");
    els.ebookPrintArea.innerHTML = "";
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
}

function buildContentPdfHtml(type, item) {
  const isTraining = type === "training";
  const isEbf = type === "ebf";
  const fields = isEbf ? EBF_FIELDS : isTraining ? TRAINING_FIELDS : DEVOTIONAL_FIELDS;
  const theme = categoryTheme(item.category || (isEbf ? "EBF Completa" : isTraining ? "Treinamento" : "Família"));
  const typeLabel = isEbf ? "EBF Completa" : isTraining ? "Treinamento" : "Culto em Família";
  return `
    <article class="ebook">
      <section class="ebook-cover">
        <p>Raízes Kids</p>
        <h1>${escapeHtml(typeLabel)}</h1>
        <div class="ebook-cover-line"></div>
        <span>${escapeHtml(item.title)}</span>
        <small>${escapeHtml(item.category || typeLabel)} · ${escapeHtml(item.season || formatMonthYear(item.createdAt))}</small>
      </section>
      <section class="ebook-lesson" style="--theme:${theme.primary};--theme-soft:${theme.soft}">
        <header class="ebook-lesson-header">
          <span>${theme.emoji}</span>
          <div>
            <p>${escapeHtml(item.category || typeLabel)} · ${escapeHtml(item.season || formatMonthYear(item.createdAt))}</p>
            <h2>${escapeHtml(item.title)}</h2>
            <strong>${escapeHtml(item.verse || item.principle || item.description || "Conteúdo de apoio")}</strong>
          </div>
        </header>
        <div class="ebook-sections">
          ${item.youtubeUrl ? `
            <section class="ebook-section">
              <h3>🎬 Vídeo</h3>
              <p>${escapeHtml(item.youtubeUrl)}</p>
            </section>
          ` : ""}
          ${item.principle ? `
            <section class="ebook-section">
              <h3>🌱 Princípio</h3>
              <p>${escapeHtml(item.principle)}</p>
            </section>
          ` : ""}
          ${item.bibleText ? `
            <section class="ebook-section">
              <h3>📖 Texto bíblico</h3>
              <p>${escapeHtml(item.bibleText)}</p>
            </section>
          ` : ""}
          ${fields.map(([key, label, emoji]) => {
            const text = item.sections?.[key]?.trim();
            if (!text) return "";
            return `
              <section class="ebook-section">
                <h3>${emoji} ${label}</h3>
                <p>${linkify(escapeHtml(text))}</p>
              </section>
            `;
          }).join("")}
          ${item.activityImage ? `
            <section class="ebook-section">
              <h3>🎨 ${isTraining ? "Imagem do treinamento" : "Atividade"}</h3>
              <img class="ebook-activity-image" src="${escapeHtml(item.activityImage)}" alt="${isTraining ? "Imagem do treinamento" : "Atividade"}" />
            </section>
          ` : ""}
        </div>
      </section>
    </article>
  `;
}

async function readOptionalImage(input, fallback) {
  const file = input?.files?.[0];
  if (!file) return fallback || "";
  return readCompressedImage(file, { maxWidth: 1280, maxHeight: 720, quality: 0.84 });
}

async function readOptionalAttachments(input) {
  const files = [...(input?.files || [])];
  return Promise.all(files.map(async (file) => ({
    name: file.name,
    type: file.type,
    url: await readFileDataUrl(file)
  })));
}

function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showContentMessage(form, message, error = false) {
  const el = form.querySelector(".action-message");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("visible", Boolean(message));
  el.classList.toggle("error", error);
}

function formatMonthYear(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem data";
  return date.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });
}

function renderTrailCard(video) {
  const locked = catalogIsLimited();
  const watchActions = locked
    ? '<a class="icon-button accent" href="login.html">Entrar para assistir</a>'
    : `<a class="icon-button" href="${escapeHtml(video.url)}" target="_blank" rel="noreferrer">YouTube</a>`;
  return `
    <article class="trail-card ${video.id === state.activeVideoId ? "active" : ""} ${locked ? "locked" : ""}">
      <button class="trail-thumb" type="button" data-play-video="${escapeHtml(video.id)}" aria-label="Reproduzir vídeo ${escapeHtml(video.title)}">
        <img src="https://img.youtube.com/vi/${escapeHtml(video.youtubeId)}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()" />
        <span>${locked ? "🔒" : "▶"}</span>
      </button>
      <div class="trail-content">
        <span class="trail-category-line">${escapeHtml(video.category || "Trilha")}</span>
        <h3>${escapeHtml(video.title)}</h3>
        <p>${escapeHtml(video.description || video.lessonTitle || "Vídeo de apoio para a lição.")}</p>
        ${locked ? '<span class="pill lock-pill">Bloqueado</span>' : ""}
        <div class="trail-actions">
          <button class="icon-button" type="button" data-play-video="${escapeHtml(video.id)}">${locked ? "Ver bloqueio" : "Assistir"}</button>
          ${watchActions}
          ${video.source === "manual" ? `<button class="icon-button" type="button" data-edit-video="${escapeHtml(video.id)}">Editar</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function groupVideosByShelf(videos) {
  const shelves = new Map();
  const addShelf = (name, shelfVideos) => {
    const uniqueVideos = dedupeVideos(shelfVideos).slice(0, 6);
    if (uniqueVideos.length) shelves.set(name, uniqueVideos);
  };

  addShelf("🔥 Em Alta", videos.filter((video) => video.trending || videoRank(video) >= 8));

  const manual = videos.filter((video) => video.source === "manual");
  addShelf("🎬 Cadastrados por você", manual);

  const categories = groupBy(videos, (video) => video.category || "Trilhas bíblicas");
  [...categories.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .forEach(([name, items]) => addShelf(name, items));

  return [...shelves.entries()];
}

function renderStreamPlayer(video) {
  // Nao adicionar autoplay aqui: o video deve iniciar somente quando o usuario decidir.
  els.streamPlayer.innerHTML = `
    <div class="stream-player-frame">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${escapeHtml(video.youtubeId)}?rel=0&modestbranding=1"
        title="${escapeHtml(video.title)}"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>
    </div>
    <div class="stream-player-info">
      <span class="reader-kicker">Assistindo na página</span>
      <h2>${escapeHtml(video.title)}</h2>
      <p>${escapeHtml(video.description || video.lessonTitle || "Vídeo selecionado para apoiar a lição.")}</p>
      <div class="lesson-meta">
        <span class="pill">${escapeHtml(video.category || "Trilha")}</span>
        <span class="pill">${escapeHtml(video.age ? ageText(video.age) : "Todas as idades")}</span>
        <span class="pill">${escapeHtml(video.playlist || video.season || "Catálogo")}</span>
      </div>
      <div class="trail-actions">
        <a class="icon-button accent" href="${escapeHtml(watchUrl(video))}" target="_blank" rel="noreferrer">Abrir no YouTube</a>
        <a class="icon-button" href="${escapeHtml(video.url)}" target="_blank" rel="noreferrer">Ver no YouTube</a>
      </div>
    </div>
  `;
}

// O player nao usa autoplay: o lider escolhe quando iniciar o video.
function renderLockedStreamPlayer(video) {
  els.streamPlayer.innerHTML = `
    <div class="locked-reader stream-lock">
      <span class="locked-icon">🔒</span>
      <span class="reader-kicker">Trilha exclusiva</span>
      <h2>${escapeHtml(video.title)}</h2>
      <p>Esta trilha está no acervo, mas o vídeo completo é liberado apenas para usuários com acesso ativo.</p>
      <div class="lesson-meta">
        <span class="pill">${escapeHtml(video.category || "Trilha")}</span>
        <span class="pill">${escapeHtml(video.age ? ageText(video.age) : "Todas as idades")}</span>
        <span class="pill lock-pill">Bloqueado</span>
      </div>
      <div class="home-login-actions">
        <a class="icon-button primary" href="login.html">Entrar</a>
        <a class="icon-button accent" href="login.html">Cadastrar</a>
      </div>
    </div>
  `;
}

function renderStreamHero(video) {
  const locked = catalogIsLimited();
  els.streamHero.innerHTML = `
    <div class="stream-hero-copy">
      <span class="reader-kicker">Destaque inteligente</span>
      <h2>${escapeHtml(video.title)}</h2>
      <p>${escapeHtml(video.description || video.lessonTitle || "Conteúdo em destaque para sua aula.")}</p>
      <div class="trail-actions">
        <button class="icon-button accent" type="button" data-play-video="${escapeHtml(video.id)}">${locked ? "🔒 Ver bloqueio" : "▶ Assistir agora"}</button>
        ${locked ? '<a class="icon-button" href="login.html">Entrar para liberar</a>' : `<a class="icon-button" href="${escapeHtml(watchUrl(video))}" target="_blank" rel="noreferrer">Abrir no YouTube</a>`}
      </div>
    </div>
    <button class="stream-hero-thumb" type="button" data-play-video="${escapeHtml(video.id)}">
      <img src="https://img.youtube.com/vi/${escapeHtml(video.youtubeId)}/maxresdefault.jpg" alt="" onerror="this.src='https://img.youtube.com/vi/${escapeHtml(video.youtubeId)}/hqdefault.jpg'" />
      <span>${locked ? "🔒" : "▶"}</span>
    </button>
  `;
}

function watchUrl(video) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(video.youtubeId)}`;
}

function renderStreamQuickNav(grouped) {
  els.streamQuickNav.innerHTML = grouped.slice(0, 10).map(([name]) => `
    <a href="#${escapeHtml(shelfId(name))}">${escapeHtml(name)}</a>
  `).join("");
}

function pickFeaturedVideo(videos) {
  return videos.find((video) => video.featured) || [...videos].sort((a, b) => videoRank(b) - videoRank(a))[0] || videos[0];
}

function videoRank(video) {
  let score = 0;
  if (video.featured) score += 12;
  if (video.trending) score += 9;
  if (video.recommended) score += 7;
  if (video.source === "manual") score += 4;
  if (/louvor|cria|jesus|promessa|coração|hist[oó]ria/i.test(video.title)) score += 3;
  if (video.description) score += 1;
  return score;
}

function groupBy(items, getKey) {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

function dedupeVideos(videos) {
  const seen = new Set();
  return videos.filter((video) => {
    if (seen.has(video.id)) return false;
    seen.add(video.id);
    return true;
  });
}

function shelfId(name) {
  return `shelf-${normalize(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function filteredVideos() {
  const filteredLessonIds = new Set(filteredLessons().map((lesson) => lesson.id));
  const term = normalize(els.search.value);
  const category = els.categoryFilter.value;
  const age = els.ageFilter.value;

  const videos = allVideos().filter((video) => {
    const linkedMatch = video.lessonId ? filteredLessonIds.has(video.lessonId) : true;
    const content = normalize([video.title, video.category, video.age, video.description, video.lessonTitle].join(" "));
    const matchesTerm = !term || content.includes(term);
    const matchesCategory = category === "Todas" || video.category === category;
    const matchesAge = age === "Todas" || !video.age || normalizeAgeLabel(video.age) === age;
    return linkedMatch && matchesTerm && matchesCategory && matchesAge;
  });

  return isTestUser() ? videos.slice(0, 1) : videos;
}

function allVideos() {
  const autoVideos = [];
  const seen = new Set();
  state.lessons.forEach((lesson) => {
    extractLessonVideos(lesson).forEach((video) => {
      const key = `${video.youtubeId}-${lesson.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      autoVideos.push(video);
    });
  });
  state.devotionals.forEach((devotional) => {
    extractContentVideos(devotional, "devotional").forEach((video) => {
      const key = `${video.youtubeId}-${devotional.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      autoVideos.push(video);
    });
  });
  return [...state.manualVideos, ...autoVideos];
}

function extractLessonVideos(lesson) {
  const videos = [];
  SECTIONS.forEach(([key, label]) => {
    const text = lesson.sections?.[key] || "";
    const lines = text.split(/\n+/);
    lines.forEach((line, index) => {
      const urls = line.match(/https?:\/\/[^\s)"]+/g) || [];
      urls.filter((url) => /youtu\.?be|youtube\.com/i.test(url)).forEach((url) => {
        const youtubeId = getYouTubeId(url);
        if (!youtubeId) return;
        const lineTitle = cleanVideoTitle(line.replace(url, ""));
        const previousTitle = cleanVideoTitle(lines[index - 1] || "");
        videos.push({
          id: `auto-${lesson.id}-${youtubeId}`,
          source: "lesson",
          title: lineTitle || previousTitle || `${label} · ${lesson.title}`,
          url,
          youtubeId,
          category: lesson.category,
          age: lesson.age,
          playlist: lesson.title,
          season: `Temporada ${ageText(lesson.age)}`,
          featured: false,
          trending: /louvor|oferta|biblica|cria/i.test(label + " " + line),
          recommended: /biblica|memorizacao|versiculo|aplicacao/i.test(normalize(label)),
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          description: `${label} da lição "${lesson.title}".`
        });
      });
    });
  });
  return videos;
}

function extractContentVideos(item, source) {
  const videos = [];
  const text = [
    item.title,
    item.youtubeUrl,
    item.description,
    ...Object.values(item.sections || {})
  ].filter(Boolean).join("\n");
  const urls = text.match(/https?:\/\/[^\s)"]+/g) || [];
  urls.filter((url) => /youtu\.?be|youtube\.com/i.test(url)).forEach((url) => {
    const youtubeId = getYouTubeId(url);
    if (!youtubeId) return;
    videos.push({
      id: `auto-${source}-${item.id}-${youtubeId}`,
      source,
      title: `${source === "devotional" ? "Culto em Família" : "Treinamento"} · ${item.title}`,
      url,
      youtubeId,
      category: item.category || (source === "devotional" ? "Culto em Família" : "Treinamento"),
      age: "",
      playlist: item.title,
      season: item.season || formatMonthYear(item.createdAt),
      featured: false,
      trending: source === "devotional",
      recommended: true,
      lessonId: "",
      lessonTitle: item.title,
      description: item.principle || item.description || ""
    });
  });
  return videos;
}

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1).split("/")[0];
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const embedIndex = parts.findIndex((part) => ["embed", "shorts"].includes(part));
    return embedIndex >= 0 ? parts[embedIndex + 1] : "";
  } catch {
    return "";
  }
}

function cleanVideoTitle(value) {
  return String(value || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[-–|:]+$/g, "")
    .replace(/^[-–|:]+/g, "")
    .replace(/\s*-\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function printEbook() {
  const lessons = filteredLessons();
  if (!lessons.length) {
    window.alert("Nenhuma lição ativa nos filtros para exportar.");
    return;
  }

  els.ebookPrintArea.innerHTML = buildEbookHtml(lessons);
  document.body.classList.add("ebook-printing");
  // Aguarda o navegador aplicar o HTML/CSS do livro antes de abrir a impressão.
  // Sem esta pausa curta, alguns navegadores montam o PDF com medidas antigas da tela.
  await waitForEbookLayout();
  const cleanup = () => {
    document.body.classList.remove("ebook-printing");
    els.ebookPrintArea.innerHTML = "";
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
}

function waitForEbookLayout() {
  const images = [...els.ebookPrintArea.querySelectorAll("img")];
  const loadedImages = images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  });

  return Promise.all(loadedImages).then(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

function buildEbookHtml(lessons) {
  const category = els.categoryFilter.value === "Todas" ? "Todas as categorias" : els.categoryFilter.value;
  const age = els.ageFilter.value === "Todas" ? "Todas as idades" : els.ageFilter.value;
  const today = new Date().toLocaleDateString("pt-BR");

  return `
    <article class="ebook">
      <section class="ebook-cover">
        <p>Raízes Kids</p>
        <h1>Catálogo de Lições Bíblicas</h1>
        <div class="ebook-cover-line"></div>
        <span>${escapeHtml(category)} · ${escapeHtml(age)}</span>
        <small>${lessons.length} lição(ões) · ${today}</small>
      </section>
      <section class="ebook-toc">
        <h2>Sumário</h2>
        ${lessons.map((lesson, index) => `
          <div class="ebook-toc-row">
            <strong>${String(index + 1).padStart(2, "0")}</strong>
            <span>${escapeHtml(lesson.title)}</span>
            <em>${escapeHtml(lesson.category)} · ${escapeHtml(ageText(lesson.age))}</em>
          </div>
        `).join("")}
      </section>
      ${lessons.map((lesson, index) => buildEbookLessonHtml(lesson, index + 1)).join("")}
    </article>
  `;
}

function buildEbookLessonHtml(lesson, number) {
  const theme = categoryTheme(lesson.category);
  return `
    <section class="ebook-lesson" style="--theme:${theme.primary};--theme-soft:${theme.soft}">
      <header class="ebook-lesson-header">
        <span>${String(number).padStart(2, "0")}</span>
        <div>
          <p>${theme.emoji} ${escapeHtml(lesson.category)} · ${escapeHtml(ageText(lesson.age))}</p>
          <h2>${escapeHtml(lesson.title)}</h2>
          <strong>${escapeHtml(lesson.verse || "Versículo não informado")}</strong>
        </div>
      </header>
      <div class="ebook-sections">
        ${SECTIONS.map(([key, label, icon, emoji]) => {
          const text = lesson.sections?.[key]?.trim();
          if (!text) return "";
          return `
            <section class="ebook-section">
              <h3>${emoji} ${label}</h3>
              <p>${linkify(escapeHtml(text))}</p>
            </section>
          `;
        }).join("")}
        ${lesson.activityImage ? `
          <section class="ebook-section">
            <h3>🖍️ Imagem para atividade de colorir</h3>
            <img class="ebook-activity-image" src="${escapeHtml(lesson.activityImage)}" alt="Atividade de colorir" />
          </section>
        ` : ""}
      </div>
    </section>
  `;
}

function getActiveLesson() {
  return state.lessons.find((lesson) => lesson.id === state.activeId) || state.lessons[0];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function formatLessonAge(age) {
  return age ? ageText(age) : "Todas as idades";
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function linkify(text) {
  return text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
}

function showActionMessage(scope, message, isError = false) {
  const el = scope === "video" ? els.videoActionMessage : els.lessonActionMessage;
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", isError);
  el.classList.add("visible");
  window.clearTimeout(el._hideTimer);
  el._hideTimer = window.setTimeout(() => {
    el.classList.remove("visible");
  }, 5000);
}

function coverEmoji(category) {
  return categoryTheme(category).emoji || "📖";
}

// Define a identidade visual do card usando palavras-chave do tema, objetivo e versiculo.
function lessonVisual(lesson) {
  const content = normalize([
    lesson.title,
    lesson.category,
    lesson.verse,
    lesson.sections?.objectives,
    lesson.sections?.memoryVerse
  ].join(" "));
  const reference = extractBibleReference(lesson.verse) || extractBibleReference(lesson.sections?.memoryVerse) || lesson.category || "Lição";
  const options = [
    { terms: ["genesis", "criacao", "criou", "criada", "eden"], emoji: "🌍", label: "Criação", book: "Gênesis", primary: "#2f7da4", soft: "#e7f6ff", accent: "#ffd93d" },
    { terms: ["jesus", "cristo", "salvador", "deus filho", "cruz"], emoji: "✝️", label: "Jesus", book: "João", primary: "#7b4f9d", soft: "#f4ecff", accent: "#ffd0e2" },
    { terms: ["amor", "coracao", "joao 3", "amou"], emoji: "❤️", label: "Amor de Deus", book: "João", primary: "#b84f6a", soft: "#fff0f4", accent: "#ffc4d2" },
    { terms: ["fe", "hebreus", "confiar", "crer"], emoji: "🕊️", label: "Fé", book: "Hebreus", primary: "#4f8f73", soft: "#edf8f0", accent: "#b4f084" },
    { terms: ["pecado", "perdao", "arrepend", "salvacao"], emoji: "💧", label: "Perdão", primary: "#356d8e", soft: "#edf7ff", accent: "#bfe4ff" },
    { terms: ["promessa", "alianca", "arco", "noe"], emoji: "🌈", label: "Promessa", book: "Gênesis", primary: "#a56d16", soft: "#fff7dc", accent: "#ffd93d" },
    { terms: ["obediencia", "obedecer", "mandamento"], emoji: "👣", label: "Obediência", book: "Êxodo", primary: "#4f7f69", soft: "#eff8f3", accent: "#b4f084" },
    { terms: ["gratidao", "grato", "bencao", "salmos"], emoji: "🌾", label: "Gratidão", book: "Salmos", primary: "#6f7f32", soft: "#f7f8e8", accent: "#d7e88a" },
    { terms: ["mission", "ide", "mundo", "nacoes"], emoji: "🌎", label: "Missões", book: "Mateus", primary: "#356d8e", soft: "#edf7ff", accent: "#29c7c9" },
    { terms: ["oracao", "orar", "pray"], emoji: "🙏", label: "Oração", book: "Mateus", primary: "#7758a6", soft: "#f3eeff", accent: "#d8d0ff" }
  ];
  const match = options.find((item) => item.terms.some((term) => content.includes(normalize(term))));
  if (match) return buildLessonVisual(match, lesson, reference);
  const theme = categoryTheme(lesson.category);
  return buildLessonVisual({
    emoji: theme.emoji || "📖",
    label: lesson.category || "Lição bíblica",
    primary: theme.primary || "#244c79",
    soft: theme.soft || "#eef5fb",
    accent: "#ffd93d"
  }, lesson, reference);
}

function buildLessonVisual(visual, lesson, reference) {
  const book = visual.book || extractBibleBook(reference) || inferBibleBook(`${lesson.title} ${lesson.verse} ${lesson.sections?.memoryVerse}`) || "Lição";
  return {
    ...visual,
    book: book.toUpperCase(),
    principle: visual.label || lesson.category || "Princípio bíblico",
    reference
  };
}

function extractBibleReference(value) {
  const text = String(value || "").trim();
  const match = text.match(/(?:[1-3]\s*)?[A-Za-zÀ-ÿ]+\.?\s+\d{1,3}\s*[:.]\s*\d{1,3}(?:-\d{1,3})?/);
  return match ? match[0].replace(/\s+/g, " ") : "";
}

function extractBibleBook(value) {
  const text = String(value || "").trim();
  const match = text.match(/^((?:[1-3]\s*)?[A-Za-zÀ-ÿ]+)\.?\s+\d{1,3}\s*[:.]\s*\d{1,3}/);
  return match ? match[1].replace(/\s+/g, " ") : "";
}

function inferBibleBook(value) {
  const text = normalize(value);
  const books = [
    ["genesis", "Gênesis"],
    ["exodo", "Êxodo"],
    ["levitico", "Levítico"],
    ["numeros", "Números"],
    ["deuteronomio", "Deuteronômio"],
    ["salmos", "Salmos"],
    ["proverbios", "Provérbios"],
    ["mateus", "Mateus"],
    ["marcos", "Marcos"],
    ["lucas", "Lucas"],
    ["joao", "João"],
    ["atos", "Atos"],
    ["romanos", "Romanos"],
    ["hebreus", "Hebreus"]
  ];
  return books.find(([key]) => text.includes(key))?.[1] || "";
}

function categoryTheme(category) {
  const key = normalize(category);
  const themes = [
    [["criacao", "deus pai"], { emoji: "🌤️", primary: "#2f7da4", soft: "#e9f6ff" }],
    [["deus filho", "amor"], { emoji: "✝️", primary: "#7b4f9d", soft: "#f5ecff" }],
    [["deus espirito santo", "fe"], { emoji: "🕊️", primary: "#4f8f73", soft: "#edf8f0" }],
    [["pecado"], { emoji: "💧", primary: "#8f4f62", soft: "#fff0f3" }],
    [["profecia", "promessa", "alianca"], { emoji: "🌈", primary: "#a56d16", soft: "#fff7dc" }],
    [["missionarios"], { emoji: "🌍", primary: "#356d8e", soft: "#edf7ff" }],
    [["gratidao", "bencao"], { emoji: "🌾", primary: "#6f7f32", soft: "#f7f8e8" }],
    [["obediencia", "coracao", "tempo"], { emoji: "🌿", primary: "#4f7f69", soft: "#eff8f3" }]
  ];
  return themes.find(([names]) => names.includes(key))?.[1] || { emoji: "📖", primary: "#244c79", soft: "#eef5fb" };
}

// Evita renderizar listas inteiras a cada tecla digitada nos filtros.
function debounce(callback, delay = 120) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}

function drawSky() {
  const canvas = $("#skyCanvas");
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(ratio, ratio);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#eaf6ff");
  gradient.addColorStop(0.42, "#fff8df");
  gradient.addColorStop(1, "#f4fbf3");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.36;
  drawCloud(context, width * 0.12, height * 0.18, 110);
  drawCloud(context, width * 0.76, height * 0.2, 150);
  drawCloud(context, width * 0.46, height * 0.86, 170);

  context.globalAlpha = 0.45;
  context.strokeStyle = "#d4a72c";
  context.lineWidth = 1;
  for (let i = 0; i < 36; i += 1) {
    const x = (i * 97) % width;
    const y = (i * 53) % height;
    context.beginPath();
    context.moveTo(x - 5, y);
    context.lineTo(x + 5, y);
    context.moveTo(x, y - 5);
    context.lineTo(x, y + 5);
    context.stroke();
  }
}

function drawCloud(context, x, y, size) {
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.ellipse(x, y, size * 0.7, size * 0.26, 0, 0, Math.PI * 2);
  context.ellipse(x - size * 0.32, y + size * 0.05, size * 0.42, size * 0.22, 0, 0, Math.PI * 2);
  context.ellipse(x + size * 0.36, y + size * 0.03, size * 0.46, size * 0.24, 0, 0, Math.PI * 2);
  context.fill();
}
