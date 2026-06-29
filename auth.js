const authState = { user: null, initialized: false };

document.addEventListener("DOMContentLoaded", () => {
  bindAuthTabs();
  bindAuthForms();
  refreshSession();
  window.setInterval(refreshSession, 60000);
});

async function refreshSession() {
  let data;
  try {
    data = await apiGet("/api/session");
  } catch {
    if (document.body.dataset.page === "admin" && authShouldHoldAdminSession()) return;
    return;
  }
  if (document.body.dataset.page === "admin" && authShouldHoldAdminSession() && !data.user) return;
  const previousSignature = userSignature(authState.user);
  authState.user = data.user;
  const currentSignature = userSignature(authState.user);
  const userChanged = !authState.initialized || previousSignature !== currentSignature;
  if (data.message && !authState.user) {
    showNotice(data.message, true);
    await apiPost("/api/logout", {});
  }
  document.body.classList.toggle("is-authenticated", Boolean(authState.user));
  document.body.classList.toggle("is-visitor", !authState.user);
  document.body.dataset.accessLevel = authState.user?.accessLevel || "";
  if (userChanged) renderAuthSlots();
  showStoredNotice();
  if (userChanged) window.onRaizesAuthChange?.(authState.user);
  authState.initialized = true;

  if (document.body.dataset.page === "admin") {
    if (!authState.user || authState.user.role !== "admin") {
      if (authShouldHoldAdminSession()) return;
      showNotice("Sua sessão oscilou. Salve novamente se a mensagem de confirmação não aparecer.", true);
      window.location.href = "login.html?next=gerenciamento.html";
      return;
    }
    if (userChanged) loadAdminUsers();
    if (userChanged) loadAdminAccessLogs();
  }
}

function authShouldHoldAdminSession() {
  return Boolean(window.raizesIsSavingLessons || window.raizesIsPreparingImages);
}

function userSignature(user) {
  if (!user) return "";
  return [user.username, user.role, user.accessLevel, user.approved, user.active].join("|");
}

function renderAuthSlots() {
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.classList.toggle("visible", authState.user?.role === "admin");
  });

  document.querySelectorAll(".auth-slot").forEach((slot) => {
    if (authState.user) {
      slot.innerHTML = `
        <span class="auth-name">${authEscapeHtml(authState.user.name || authState.user.username)}</span>
        <a class="tab auth-profile" href="perfil.html">Perfil</a>
        <button class="tab auth-logout" type="button">Sair</button>
      `;
      slot.querySelector(".auth-logout").addEventListener("click", logout);
    } else {
      slot.innerHTML = '<a class="tab auth-login" href="login.html">Entrar / Cadastrar</a>';
    }
  });
}

function bindAuthTabs() {
  const buttons = document.querySelectorAll("[data-auth-tab]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-auth-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.authPanel === button.dataset.authTab);
      });
      setAuthMessage("");
    });
  });
}

function bindAuthForms() {
  const loginForm = document.querySelector("#loginForm");
  const registerForm = document.querySelector("#registerForm");
  const resetForm = document.querySelector("#resetForm");
  const profileForm = document.querySelector("#profileForm");

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await apiPost("/api/login", formData(loginForm));
    if (result.error) {
      setAuthMessage(result.error, true);
      return;
    }
    if (result.message) sessionStorage.setItem("raizes-auth-notice", result.message);
    const next = new URLSearchParams(location.search).get("next") || "index.html";
    window.location.href = result.user.role === "admin" && next.includes("gerenciamento") ? "gerenciamento.html" : next;
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await apiPost("/api/register", formData(registerForm));
    setAuthMessage(result.error || result.message || "Cadastro enviado.", Boolean(result.error));
    if (!result.error) {
      registerForm.reset();
      sessionStorage.setItem("raizes-auth-notice", result.message || "Cadastro enviado para aprovacao.");
      window.location.href = "vendas.html";
    }
  });

  resetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await apiPost("/api/password-reset", formData(resetForm));
    setAuthMessage(result.error || result.message || "Senha redefinida.", Boolean(result.error));
    if (!result.error) resetForm.reset();
  });

  if (profileForm) {
    loadProfile(profileForm);
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = formData(profileForm);
      delete data.username;
      const result = await apiPost("/api/profile", data);
      setAuthMessage(result.error || result.message || "Perfil atualizado.", Boolean(result.error));
      if (!result.error && result.user) fillProfileForm(profileForm, result.user);
    });
  }
}

async function logout() {
  await apiPost("/api/logout", {});
  window.location.href = "index.html";
}

async function loadProfile(form) {
  const data = await apiGet("/api/profile");
  if (data.error) {
    setAuthMessage(data.error, true);
    window.setTimeout(() => {
      window.location.href = "login.html?next=perfil.html";
    }, 1200);
    return;
  }
  fillProfileForm(form, data.user);
}

function fillProfileForm(form, user) {
  ["username", "name", "email", "phone", "address", "church"].forEach((key) => {
    if (form.elements[key]) form.elements[key].value = user?.[key] || "";
  });
}

async function loadAdminUsers() {
  const list = document.querySelector("#adminUsersList");
  if (!list) return;
  const data = await apiGet("/api/admin/users");
  if (data.error) {
    list.innerHTML = `<p class="muted-line">${authEscapeHtml(data.error)}</p>`;
    return;
  }

  list.innerHTML = `
    <div class="admin-export-row">
      <button class="icon-button primary" type="button" id="exportUsersCsvBtn">Exportar Excel</button>
    </div>
    ${data.users.map(renderAdminUserCard).join("")}
  `;
  document.querySelector("#exportUsersCsvBtn")?.addEventListener("click", () => exportUsersCsv(data.users));

  list.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", async () => {
      const result = await adminAction(`/api/admin/users/${button.dataset.approve}/approve`, {});
      if (!result?.error) window.alert("Usuario aprovado. Ele vera a confirmacao no proximo acesso.");
    });
  });

  list.querySelectorAll("[data-deactivate]").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.confirm("Desativar este usuario? Ele nao conseguira acessar o sistema.")) {
        adminAction(`/api/admin/users/${button.dataset.deactivate}/deactivate`, {});
      }
    });
  });

  list.querySelectorAll("[data-activate]").forEach((button) => {
    button.addEventListener("click", () => adminAction(`/api/admin/users/${button.dataset.activate}/activate`, {}));
  });

  list.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", async () => {
      const password = window.prompt("Digite a nova senha de 6 digitos para este usuario:");
      if (!/^\d{6}$/.test(password || "")) {
        window.alert("A senha precisa ter exatamente 6 digitos.");
        return;
      }
      await adminAction(`/api/admin/users/${button.dataset.reset}/password`, { password });
    });
  });

  list.querySelectorAll("[data-access-level]").forEach((select) => {
    select.addEventListener("change", () => {
      adminAction(`/api/admin/users/${select.dataset.accessLevel}/access`, { accessLevel: select.value });
    });
  });
}

async function loadAdminAccessLogs() {
  const list = document.querySelector("#adminAccessLogsList");
  if (!list) return;
  const data = await apiGet("/api/admin/access-logs");
  if (data.error) {
    list.innerHTML = `<p class="muted-line">${authEscapeHtml(data.error)}</p>`;
    return;
  }
  const logs = Array.isArray(data.logs) ? data.logs : [];
  list.innerHTML = logs.length ? logs.map(renderAccessLogCard).join("") : '<p class="muted-line">Nenhum acesso registrado ainda.</p>';
  const refreshButton = document.querySelector("#refreshAccessLogsBtn");
  if (refreshButton) refreshButton.onclick = loadAdminAccessLogs;
}

window.loadAdminAccessLogs = loadAdminAccessLogs;

function renderAccessLogCard(log) {
  return `
    <article class="access-log-card">
      <div>
        <strong>${authEscapeHtml(log.name || log.username || "Usuario")}</strong>
        <span>${authEscapeHtml(log.event || "acesso")} - ${authEscapeHtml(log.path || "")}</span>
        <small>${formatDateTime(log.at)} - ${authEscapeHtml(log.device || "Dispositivo")}</small>
      </div>
      <div>
        <small>CPF: ${authEscapeHtml(log.username || "")}</small>
        <small>IP: ${authEscapeHtml(log.ip || "")}</small>
      </div>
    </article>
  `;
}

function renderAdminUserCard(user) {
  const accessLevel = user.accessLevel || "prime";
  const accessLabel = accessLevel === "simple" ? "Simples" : accessLevel === "leader" ? "Lideres" : "Prime";
  const status = user.role === "admin"
    ? "Administrador"
    : user.active === false
      ? "Desativado"
      : user.approved
        ? "Ativo"
        : "Aguardando aprovacao";
  const stateClass = user.active === false ? "inactive" : user.approved ? "approved" : "pending";
  const accessControl = user.role === "admin" ? "" : `
    <label class="user-access-control">
      <span>Categoria</span>
      <select data-access-level="${authEscapeHtml(user.id)}">
        <option value="simple" ${accessLevel === "simple" ? "selected" : ""}>Simples</option>
        <option value="leader" ${accessLevel === "leader" ? "selected" : ""}>Lideres</option>
        <option value="prime" ${accessLevel === "prime" ? "selected" : ""}>Prime</option>
      </select>
    </label>
  `;
  const actionButtons = user.role === "admin" ? '<span class="pill">Administrador</span>' : `
    ${accessControl}
    ${!user.approved ? `<button class="icon-button primary" type="button" data-approve="${authEscapeHtml(user.id)}">Aprovar</button>` : ""}
    ${user.active === false
      ? `<button class="icon-button primary" type="button" data-activate="${authEscapeHtml(user.id)}">Reativar</button>`
      : `<button class="icon-button danger" type="button" data-deactivate="${authEscapeHtml(user.id)}">Desativar</button>`}
    <button class="icon-button" type="button" data-reset="${authEscapeHtml(user.id)}">Nova senha</button>
  `;

  return `
    <article class="user-admin-card ${stateClass}">
      <div>
        <strong>${authEscapeHtml(user.name || user.username)}</strong>
        <span>${authEscapeHtml(user.username)} - ${authEscapeHtml(user.email || "Sem email")}</span>
        <small>Telefone: ${authEscapeHtml(user.phone || "Nao informado")}</small>
        <small>${authEscapeHtml(user.church || "Igreja nao informada")} - ${authEscapeHtml(user.address || "Endereco nao informado")}</small>
        <small>Status: ${status} - Categoria: ${accessLabel}</small>
        <small>Criado: ${formatDateTime(user.createdAt)} - Ultimo acesso: ${formatDateTime(user.lastAccessAt)}</small>
        ${user.resetRequested ? "<em>Solicitou redefinicao de senha</em>" : ""}
      </div>
      <div class="user-actions">${actionButtons}</div>
    </article>
  `;
}

function exportUsersCsv(users) {
  const headers = ["Nome", "CPF", "Email", "Telefone", "Igreja", "Endereco", "Status", "Categoria", "Criado em", "Aprovado em", "Ultimo login", "Ultimo acesso"];
  const rows = users.map((user) => {
    const accessLevel = user.accessLevel === "simple" ? "Simples" : user.accessLevel === "leader" ? "Lideres" : "Prime";
    const status = user.role === "admin" ? "Administrador" : user.active === false ? "Desativado" : user.approved ? "Ativo" : "Aguardando aprovacao";
    return [
      user.name,
      user.username,
      user.email,
      user.phone,
      user.church,
      user.address,
      status,
      accessLevel,
      formatDateTime(user.createdAt),
      formatDateTime(user.approvedAt),
      formatDateTime(user.lastLoginAt),
      formatDateTime(user.lastAccessAt)
    ];
  });
  downloadCsv("usuarios-raizes.csv", headers, rows);
}

function downloadCsv(filename, headers, rows) {
  const escapeCell = (value) => `"${String(value || "").replaceAll('"', '""')}"`;
  const content = [
    "sep=;",
    headers.map(escapeCell).join(";"),
    ...rows.map((row) => row.map(escapeCell).join(";"))
  ].join("\r\n");
  const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR");
}

async function adminAction(url, body) {
  const result = await apiPost(url, body);
  if (result.error) window.alert(result.error);
  await loadAdminUsers();
  return result;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function apiGet(url) {
  const res = await fetch(url, { credentials: "same-origin" });
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

function setAuthMessage(message, error = false) {
  const el = document.querySelector("#authMessage");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", error);
}

function showStoredNotice() {
  const message = sessionStorage.getItem("raizes-auth-notice");
  if (!message) return;
  sessionStorage.removeItem("raizes-auth-notice");
  showNotice(message);
}

function showNotice(message, error = false) {
  const notice = document.createElement("div");
  notice.className = `session-notice${error ? " error" : ""}`;
  notice.textContent = message;
  document.body.prepend(notice);
  window.setTimeout(() => notice.remove(), error ? 11000 : 7000);
}

function authEscapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
