const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("raizesFacilitador", {
  loadConfig: () => ipcRenderer.invoke("config:load"),
  saveConfig: (config) => ipcRenderer.invoke("config:save", config),
  login: (payload) => ipcRenderer.invoke("api:login", payload),
  saveContent: (payload) => ipcRenderer.invoke("api:save-content", payload)
});
