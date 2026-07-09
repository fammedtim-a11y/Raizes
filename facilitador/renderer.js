const state = {
  loggedIn: false,
  cardImage: "",
  activityImage: "",
  attachments: []
};

const ages = [
  "0 a 2 anos - Berçário",
  "3 a 4 anos - Maternal",
  "5 a 6 anos - Jardim",
  "7 a 10 anos - Primários",
  "11 a 12 anos - Juniores"
];

const fieldsByType = {
  lesson: [
    ["title", "Titulo da licao", "Ex.: Deus criou tudo", "text", true],
    ["category", "Categoria", "Ex.: Criacao", "text", true],
    ["age", "Idade", "", "age", true],
    ["verse", "Versiculo", "Ex.: Genesis 1:31", "text", false],
    ["principle", "Principio", "Ex.: Deus criou tudo", "text", false],
    ["keyword", "Palavra-chave", "Ex.: Criacao", "text", false],
    ["youtubeUrl", "Link do YouTube", "Opcional", "url", false],
    ["createdMonth", "Mes de inclusao", "", "month", false]
  ],
  trail: [
    ["title", "Titulo da trilha", "Ex.: Louvor para abertura", "text", true],
    ["url", "Link do YouTube", "Cole o link do video", "url", true],
    ["category", "Categoria", "Ex.: Louvor", "text", true],
    ["age", "Idade", "", "age", false],
    ["playlist", "Temporada ou playlist", "Ex.: Julho 2026", "text", false],
    ["season", "Mes de inclusao", "Ex.: 2026-07", "text", false],
    ["description", "Descricao curta", "Resumo exibido na trilha", "text", false]
  ],
  training: [
    ["title", "Titulo do treinamento", "Ex.: Seguranca no ministerio", "text", true],
    ["category", "Categoria", "Ex.: Seguranca", "text", true],
    ["season", "Temporada", "Ex.: MTO 2026", "text", false],
    ["createdMonth", "Mes de inclusao", "", "month", false],
    ["youtubeUrl", "Link do YouTube", "Opcional", "url", false],
    ["description", "Descricao curta", "Resumo para o card", "text", false]
  ],
  ebf: [
    ["title", "Titulo da EBF", "Ex.: EBF Completa 2026", "text", true],
    ["category", "Categoria", "Ex.: EBF", "text", true],
    ["season", "Temporada", "Ex.: Ferias 2026", "text", false],
    ["createdMonth", "Mes de inclusao", "", "month", false],
    ["description", "Descricao curta", "Resumo para o card", "text", false]
  ]
};

const els = {
  baseUrl: document.querySelector("#baseUrl"),
  loginForm: document.querySelector("#loginForm"),
  username: document.querySelector("#username"),
  password: document.querySelector("#password"),
  loginMessage: document.querySelector("#loginMessage"),
  sessionStatus: document.querySelector("#sessionStatus"),
  contentType: document.querySelector("#contentType"),
  contentForm: document.querySelector("#contentForm"),
  dynamicFields: document.querySelector("#dynamicFields"),
  richEditor: document.querySelector("#richEditor"),
  saveMessage: document.querySelector("#saveMessage"),
  saveButton: document.querySelector("#saveButton"),
  cardImage: document.querySelector("#cardImage"),
  activityImage: document.querySelector("#activityImage"),
  attachments: document.querySelector("#attachments"),
  previewArea: document.querySelector("#previewArea"),
  activityImageBox: document.querySelector("#activityImageBox"),
  attachmentsBox: document.querySelector("#attachmentsBox")
};

init();

async function init() {
  const config = await window.raizesFacilitador.loadConfig();
  els.baseUrl.value = config.baseUrl || "https://raizes-fic9.onrender.com";
  els.username.value = config.lastUsername || "";
  renderFields();
  bindEvents();
}

function bindEvents() {
  els.loginForm.addEventListener("submit", login);
  els.contentType.addEventListener("change", () => {
    clearMedia();
    renderFields();
  });
  els.contentForm.addEventListener("submit", saveContent);
  els.cardImage.addEventListener("change", async () => {
    state.cardImage = await readImageFile(els.cardImage.files[0]);
    renderPreview();
  });
  els.activityImage.addEventListener("change", async () => {
    state.activityImage = await readImageFile(els.activityImage.files[0]);
    renderPreview();
  });
  els.attachments.addEventListener("change", async () => {
    state.attachments = await Promise.all([...els.attachments.files].map(readAnyFile));
    renderPreview();
  });
  document.querySelector(".rich-toolbar").addEventListener("click", (event) => {
    const action = event.target.closest("[data-rich]")?.dataset.rich;
    if (action) applyRichAction(action);
  });
  document.querySelector("#fontName").addEventListener("change", (event) => {
    if (event.target.value) document.execCommand("fontName", false, event.target.value);
    event.target.value = "";
    els.richEditor.focus();
  });
  document.querySelector("#fontSize").addEventListener("change", (event) => {
    if (event.target.value) applyFontSize(event.target.value);
    event.target.value = "";
    els.richEditor.focus();
  });
  document.querySelector("#fontColor").addEventListener("input", (event) => {
    document.execCommand("foreColor", false, event.target.value);
    els.richEditor.focus();
  });
}

async function login(event) {
  event.preventDefault();
  setMessage(els.loginMessage, "Entrando...");
  try {
    const data = await window.raizesFacilitador.login({
      baseUrl: els.baseUrl.value,
      username: els.username.value,
      password: els.password.value
    });
    if (data.user?.role !== "admin") throw new Error("Este acesso nao e administrador.");
    state.loggedIn = true;
    els.sessionStatus.textContent = `${data.user.name || data.user.username} conectado`;
    setMessage(els.loginMessage, "Login administrativo confirmado.");
  } catch (error) {
    state.loggedIn = false;
    setMessage(els.loginMessage, error.message || "Nao foi possivel entrar.", true);
  }
}

function renderFields() {
  const type = els.contentType.value;
  els.dynamicFields.innerHTML = fieldsByType[type].map(renderField).join("");
  els.richEditor.innerHTML = "";
  els.activityImageBox.style.display = type === "trail" ? "none" : "grid";
  els.attachmentsBox.style.display = ["training", "ebf"].includes(type) ? "grid" : "none";
}

function renderField([name, label, placeholder, type, required]) {
  if (type === "age") {
    return `
      <label>
        ${label}
        <select name="${name}" ${required ? "required" : ""}>
          <option value="">Selecione</option>
          ${ages.map((age) => `<option value="${escapeHtml(age)}">${escapeHtml(age)}</option>`).join("")}
        </select>
      </label>
    `;
  }
  return `
    <label class="${name === "description" ? "span-2" : ""}">
      ${label}
      <input name="${name}" type="${type}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""} />
    </label>
  `;
}

async function saveContent(event) {
  event.preventDefault();
  if (!state.loggedIn) {
    setMessage(els.saveMessage, "Entre como administrador antes de salvar.", true);
    return;
  }
  els.saveButton.disabled = true;
  setMessage(els.saveMessage, "Salvando no servidor...");
  try {
    const type = els.contentType.value;
    const item = buildItem(type);
    const result = await window.raizesFacilitador.saveContent({
      baseUrl: els.baseUrl.value,
      type,
      item
    });
    setMessage(els.saveMessage, `Salvo com sucesso. Total agora: ${result.count}.`);
    els.contentForm.reset();
    els.richEditor.innerHTML = "";
    clearMedia();
  } catch (error) {
    setMessage(els.saveMessage, error.message || "Nao foi possivel salvar.", true);
  } finally {
    els.saveButton.disabled = false;
  }
}

function buildItem(type) {
  const data = Object.fromEntries(new FormData(els.contentForm).entries());
  const createdAt = monthToDate(data.createdMonth);
  if (type === "lesson") {
    return {
      id: randomId("lesson"),
      title: data.title,
      category: data.category,
      age: data.age,
      verse: data.verse,
      principle: data.principle,
      keyword: data.keyword,
      cardImage: state.cardImage,
      activityImage: state.activityImage,
      createdAt,
      sections: {
        story: withYoutube(els.richEditor.innerHTML, data.youtubeUrl),
        objective: data.principle || "",
        activity: ""
      }
    };
  }
  if (type === "trail") {
    return {
      id: randomId("video"),
      source: "manual",
      title: data.title,
      url: data.url,
      youtubeId: youtubeId(data.url),
      category: data.category,
      age: data.age,
      description: data.description || textFromHtml(els.richEditor.innerHTML),
      playlist: data.playlist,
      season: data.season,
      featured: true,
      trending: false,
      recommended: true,
      createdAt
    };
  }
  if (type === "training") {
    return {
      id: randomId("training"),
      title: data.title,
      category: data.category,
      season: data.season,
      createdAt,
      youtubeUrl: data.youtubeUrl,
      description: data.description,
      cardImage: state.cardImage,
      activityImage: state.activityImage,
      attachments: state.attachments,
      sections: {
        content: withYoutube(els.richEditor.innerHTML, data.youtubeUrl),
        notes: ""
      }
    };
  }
  return {
    id: randomId("ebf"),
    title: data.title,
    category: data.category,
    season: data.season,
    createdAt,
    description: data.description,
    cardImage: state.cardImage,
    activityImage: state.activityImage,
    attachments: state.attachments,
    sections: {
      content: els.richEditor.innerHTML,
      schedule: "",
      notes: ""
    }
  };
}

function applyRichAction(action) {
  els.richEditor.focus();
  if (action === "upper" || action === "lower") {
    const selection = window.getSelection();
    const selected = selection?.toString() || "";
    if (selected) {
      document.execCommand("insertText", false, action === "upper" ? selected.toLocaleUpperCase("pt-BR") : selected.toLocaleLowerCase("pt-BR"));
    }
    return;
  }
  document.execCommand(action, false, null);
}

function applyFontSize(size) {
  document.execCommand("fontSize", false, "3");
  els.richEditor.querySelectorAll("font[size='3']").forEach((font) => {
    font.removeAttribute("size");
    font.style.fontSize = `${size}px`;
  });
}

async function readImageFile(file) {
  if (!file) return "";
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxWidth = 1400;
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

async function readAnyFile(file) {
  return {
    name: file.name,
    type: file.type || "application/octet-stream",
    url: await readFileAsDataUrl(file)
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function renderPreview() {
  const previews = [];
  if (state.cardImage) previews.push(`<div class="preview-card"><img src="${state.cardImage}" alt=""><strong>Card pronto</strong></div>`);
  if (state.activityImage) previews.push(`<div class="preview-card"><img src="${state.activityImage}" alt=""><strong>Atividade pronta</strong></div>`);
  state.attachments.forEach((file) => previews.push(`<div class="preview-card"><strong>${escapeHtml(file.name)}</strong><p>${escapeHtml(file.type || "Arquivo")}</p></div>`));
  els.previewArea.innerHTML = previews.join("");
}

function clearMedia() {
  state.cardImage = "";
  state.activityImage = "";
  state.attachments = [];
  els.cardImage.value = "";
  els.activityImage.value = "";
  els.attachments.value = "";
  renderPreview();
}

function monthToDate(value) {
  return value ? `${value}-01T00:00:00.000Z` : new Date().toISOString();
}

function withYoutube(html, url) {
  return url ? `${html || ""}<p>${escapeHtml(url)}</p>` : html || "";
}

function youtubeId(url) {
  const value = String(url || "");
  const match = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : "";
}

function textFromHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent.trim();
}

function setMessage(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle("error", Boolean(isError));
}

function randomId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
