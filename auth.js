const authState = { user: null };

document.addEventListener("DOMContentLoaded", () => {
  bindAuthTabs();
  bindAuthForms();
  refreshSession();
});

async function refreshSession() {
  const data = await apiGet("/api/session");
  authState.user = data.user;
  renderAuthSlots();
  if (document.body.dataset.page === "admin") {
    if (!authState.user || authState.user.role !== "admin") {
      window.location.href = "login.html?next=gerenciamento.html";
      return;
    }
    loadAdminUsers();
  }
}

function renderAuthSlots() {
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.classList.toggle("visible", authState.user?.role === "admin");
  });

  document.querySelectorAll(".auth-slot").forEach((slot) => {
    if (authState.user) {
      slot.innerHTML = `
        <span class="auth-name">${escapeHtml(authState.user.name || authState.user.username)}</span>
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

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = formData(loginForm);
    const result = await apiPost("/api/login", body);
    if (result.error) {
      setAuthMessage(result.error, true);
      return;
    }
    const next = new URLSearchParams(location.search).get("next") || "index.html";
    window.location.href = result.user.role === "admin" && next.includes("gerenciamento") ? "gerenciamento.html" : next;
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = formData(registerForm);
    const result = await apiPost("/api/register", body);
    setAuthMessage(result.error || result.message || "Cadastro enviado.", Boolean(result.error));
    if (!result.error) registerForm.reset();
  });

  resetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await apiPost("/api/password-reset", formData(resetForm));
    setAuthMessage(result.error || result.message || "Pedido enviado.", Boolean(result.error));
    if (!result.error) resetForm.reset();
  });
}

async function logout() {
  await apiPost("/api/logout", {});
  window.location.href = "index.html";
}

async function loadAdminUsers() {
  const list = document.querySelector("#adminUsersList");
  if (!list) return;
  const data = await apiGet("/api/admin/users");
  if (data.error) {
    list.innerHTML = `<p class="muted-line">${escapeHtml(data.error)}</p>`;
    return;
  }

  list.innerHTML = data.users.map((user) => `
    <article class="user-admin-card ${user.approved ? "approved" : "pending"}">
      <div>
        <strong>${authEscapeHtml(user.name || user.username)}</strong>
        <span>${authEscapeHtml(user.username)} · ${authEscapeHtml(user.email || "Sem email")}</span>
        <small>${authEscapeHtml(user.church || "Igreja não informada")} · ${authEscapeHtml(user.address || "Endereço não informado")}</small>
        ${user.resetRequested ? '<em>Solicitou redefinição de senha</em>' : ""}
      </div>
      <div class="user-actions">
        ${user.role === "admin" ? '<span class="pill">Administrador</span>' : `
          <button class="icon-button primary" type="button" data-approve="${authEscapeHtml(user.id)}">Aprovar</button>
          <button class="icon-button danger" type="button" data-reject="${authEscapeHtml(user.id)}">Bloquear</button>
          <button class="icon-button" type="button" data-reset="${authEscapeHtml(user.id)}">Nova senha</button>
        `}
      </div>
    </article>
  `).join("");

  list.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", () => adminAction(`/api/admin/users/${button.dataset.approve}/approve`, {}));
  });
  list.querySelectorAll("[data-reject]").forEach((button) => {
    button.addEventListener("click", () => adminAction(`/api/admin/users/${button.dataset.reject}/reject`, {}));
  });
  list.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", async () => {
      const password = window.prompt("Digite a nova senha de 6 dígitos para este usuário:");
      if (!/^\d{6}$/.test(password || "")) {
        window.alert("A senha precisa ter exatamente 6 dígitos.");
        return;
      }
      await adminAction(`/api/admin/users/${button.dataset.reset}/password`, { password });
    });
  });
}

async function adminAction(url, body) {
  const result = await apiPost(url, body);
  if (result.error) window.alert(result.error);
  await loadAdminUsers();
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

function authEscapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
