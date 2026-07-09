const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow = null;
let sessionCookie = "";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: "Raizes Kids - Gestão",
    backgroundColor: "#f6fbff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("config:load", () => {
  return readConfig();
});

ipcMain.handle("config:save", (_event, config) => {
  writeConfig({ ...readConfig(), ...config });
  return readConfig();
});

ipcMain.handle("api:login", async (_event, payload) => {
  const baseUrl = normalizeBaseUrl(payload.baseUrl);
  const data = await apiRequest(baseUrl, "/api/login", {
    method: "POST",
    body: { username: payload.username, password: payload.password },
    captureCookie: true
  });
  writeConfig({ ...readConfig(), baseUrl, lastUsername: payload.username || "" });
  return data;
});

ipcMain.handle("api:save-content", async (_event, payload) => {
  const baseUrl = normalizeBaseUrl(payload.baseUrl || readConfig().baseUrl);
  const map = collectionMap(payload.type);
  const current = await apiRequest(baseUrl, map.getUrl, { method: "GET" });
  const items = Array.isArray(current[map.key]) ? current[map.key] : [];
  const item = { ...payload.item, id: payload.item.id || randomId(), createdAt: payload.item.createdAt || new Date().toISOString() };
  const nextItems = [item, ...items.filter((existing) => existing.id !== item.id)];
  const saved = await apiRequest(baseUrl, map.postUrl, {
    method: "POST",
    body: { [map.key]: nextItems }
  });
  return {
    ok: true,
    savedAt: saved.savedAt || new Date().toISOString(),
    item,
    count: Array.isArray(saved[map.key]) ? saved[map.key].length : nextItems.length
  };
});

async function apiRequest(baseUrl, apiPath, options = {}) {
  const response = await fetch(new URL(apiPath, baseUrl), {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Raizes-Facilitador/1.0",
      ...(sessionCookie ? { Cookie: sessionCookie } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (options.captureCookie) {
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) sessionCookie = setCookie.split(";")[0];
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Falha na comunicacao com o servidor (${response.status}).`);
  }
  return data;
}

function collectionMap(type) {
  const maps = {
    lesson: { key: "lessons", getUrl: "/api/admin/lessons", postUrl: "/api/admin/lessons" },
    training: { key: "trainings", getUrl: "/api/admin/trainings", postUrl: "/api/admin/trainings" },
    ebf: { key: "ebfs", getUrl: "/api/admin/ebf", postUrl: "/api/admin/ebf" },
    trail: { key: "videos", getUrl: "/api/admin/videos", postUrl: "/api/admin/videos" }
  };
  if (!maps[type]) throw new Error("Tipo de conteudo invalido.");
  return maps[type];
}

function normalizeBaseUrl(value) {
  const baseUrl = String(value || "https://raizes-fic9.onrender.com").trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(baseUrl)) return `https://${baseUrl}`;
  return baseUrl;
}

function readConfig() {
  const file = configPath();
  if (!fs.existsSync(file)) {
    return { baseUrl: "https://raizes-fic9.onrender.com", lastUsername: "" };
  }
  try {
    return { baseUrl: "https://raizes-fic9.onrender.com", lastUsername: "", ...JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch {
    return { baseUrl: "https://raizes-fic9.onrender.com", lastUsername: "" };
  }
}

function writeConfig(config) {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), "utf8");
}

function configPath() {
  return path.join(app.getPath("userData"), "config.json");
}

function randomId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
