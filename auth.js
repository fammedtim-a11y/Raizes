const authState = { user: null, initialized: false };

document.addEventListener("DOMContentLoaded", () => {
  bindAuthTabs();
  bindAuthForms();
  loadPublicSiteInfo();
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
  document.body.dataset.master = authState.user?.username === "08047232657" ? "true" : "false";
  if (userChanged) renderAuthSlots();
  renderLicenseNotice();
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
    if (userChanged) loadCommunicationCenter();
    if (userChanged) loadAdminAnalytics();
  }
}

function authShouldHoldAdminSession() {
  return Boolean(window.raizesIsSavingLessons || window.raizesIsPreparingImages || window.raizesIsSavingContent);
}

function userSignature(user) {
  if (!user) return "";
  return [user.username, user.role, user.accessLevel, user.approved, user.active, user.licenseDaysRemaining].join("|");
}

function renderAuthSlots() {
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.classList.toggle("visible", authState.user?.role === "admin");
  });
  document.querySelectorAll(".master-only").forEach((el) => {
    el.classList.toggle("visible", authState.user?.username === "08047232657");
  });

  document.querySelectorAll(".auth-slot").forEach((slot) => {
    if (authState.user) {
      const licenseText = userLicenseText(authState.user);
      slot.innerHTML = `
        <span class="auth-profile-summary">
          <strong>${authEscapeHtml(authState.user.name || authState.user.username)}</strong>
          ${licenseText ? `<small>${authEscapeHtml(licenseText)}</small>` : ""}
        </span>
        <button class="tab auth-logout" type="button">Sair</button>
      `;
      slot.querySelector(".auth-logout").addEventListener("click", logout);
    } else {
      slot.innerHTML = '<a class="tab" href="index.html#contato">Contato</a><a class="tab auth-login" href="login.html">Entrar / Cadastrar</a>';
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
  const siteInfoForm = document.querySelector("#siteInfoForm");

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await apiPost("/api/login", formData(loginForm));
    if (result.error) {
      if (result.renewalRequired) {
        setAuthMessage(`${result.error} `, true);
        renderRenewalPaymentAction(result.paymentUrl || "https://pag.ae/81WaCzV4m");
        return;
      }
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

  if (siteInfoForm) {
    loadAdminSiteInfo();
    siteInfoForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const result = await apiPost("/api/admin/site-info", await siteInfoPayload(siteInfoForm));
      setActionMessage("#siteInfoMessage", result.error || result.message || "Informacoes salvas.", Boolean(result.error));
      if (!result.error && result.info) {
        fillSiteInfoForm(siteInfoForm, result.info);
        applySiteInfo(result.info);
      }
    });
    document.querySelector("#addTeamMemberBtn")?.addEventListener("click", () => addTeamMemberEditor());
    document.querySelector("#refreshAnalyticsBtn")?.addEventListener("click", loadAdminAnalytics);
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
  ["username", "name", "email", "phone", "address", "church", "churchCity"].forEach((key) => {
    if (form.elements[key]) form.elements[key].value = user?.[key] || "";
  });
}

function renderLicenseNotice() {
  document.querySelectorAll(".license-expiry-notice").forEach((notice) => notice.remove());
  const user = authState.user;
  if (!user || user.role === "admin") return;
  const days = Number(user.licenseDaysRemaining);
  if (!Number.isFinite(days) || days > 15) return;
  const notice = document.createElement("div");
  notice.className = `license-expiry-notice${days <= 3 ? " urgent" : ""}`;
  notice.innerHTML = `
    <strong>${days <= 0 ? "Sua licença venceu" : `Sua licença vence em ${days} dia(s)`}</strong>
    <span>Fale com o administrador para manter seu acesso ativo ao Raízes Kids.</span>
  `;
  document.body.prepend(notice);
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
  window.raizesAdminPendingUsers = data.users.filter((user) => user.role !== "admin" && !user.approved).length;
  window.raizesAdminExpiringUsers = data.users.filter((user) => user.role !== "admin" && user.approved && user.active !== false && Number(user.licenseDaysRemaining || 0) <= 15).length;
  const latestAccess = data.users
    .map((user) => user.lastAccessAt || user.lastLoginAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];
  window.raizesAdminLastAccessLabel = latestAccess ? new Date(latestAccess).toLocaleString("pt-BR") : "Sem acesso registrado";
  window.renderAdminDashboard?.();
  document.querySelector("#exportUsersCsvBtn")?.addEventListener("click", () => exportUsersCsv(data.users));
  list.querySelectorAll("[data-toggle-user-details]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".user-admin-card");
      const expanded = card?.classList.toggle("expanded");
      button.textContent = expanded ? "Ocultar detalhes" : "Ver detalhes";
    });
  });

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

  list.querySelectorAll("[data-renew-license]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = list.querySelector(`[data-license-date="${button.dataset.renewLicense}"]`);
      const licenseExpiresAt = input?.value || "";
      if (!licenseExpiresAt && !window.confirm("Nenhuma data foi informada. Renovar por mais 364 dias?")) return;
      adminAction(`/api/admin/users/${button.dataset.renewLicense}/renew-license`, { licenseExpiresAt });
    });
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
  window.raizesAccessLogs = logs;
  const compact = document.querySelector("#userManagePanel")?.classList.contains("active");
  const visibleLogs = compact ? logs.slice(0, 12) : logs;
  list.innerHTML = logs.length
    ? `${compact ? '<h3>Últimas utilizações</h3>' : ""}${visibleLogs.map(renderAccessLogCard).join("")}`
    : '<p class="muted-line">Nenhum acesso registrado ainda.</p>';
  const refreshButton = document.querySelector("#refreshAccessLogsBtn");
  if (refreshButton) refreshButton.onclick = loadAdminAccessLogs;
  const exportButton = document.querySelector("#exportAccessLogsCsvBtn");
  if (exportButton) exportButton.onclick = () => exportAccessLogsCsv(window.raizesAccessLogs || []);
  const clearButton = document.querySelector("#clearAccessLogsBtn");
  if (clearButton) clearButton.onclick = clearAccessLogs;
}

window.loadAdminAccessLogs = loadAdminAccessLogs;

async function loadAdminAnalytics() {
  const panel = document.querySelector("#analyticsDashboard");
  if (!panel || !authState.user || authState.user.role !== "admin") return;
  const data = await apiGet("/api/admin/analytics");
  if (data.error) {
    panel.innerHTML = `<p class="muted-line">${authEscapeHtml(data.error)}</p>`;
    return;
  }
  renderAdminAnalytics(data.analytics || {});
}

window.loadAdminAnalytics = loadAdminAnalytics;

function renderAdminAnalytics(analytics) {
  const panel = document.querySelector("#analyticsDashboard");
  if (!panel) return;
  const totals = analytics.totals || {};
  const expiringUsers = analytics.expiringUsers || [];
  panel.innerHTML = `
    <section class="analytics-metric-grid">
      ${analyticsMetric("👥", totals.users, "Usuários cadastrados")}
      ${analyticsMetric("✅", totals.approvedUsers, "Usuários ativos")}
      ${analyticsMetric("⏳", totals.pendingUsers, "Aguardando aprovação")}
      ${analyticsMetric("⚠️", totals.expiringUsers, "Licenças vencendo")}
      ${analyticsMetric("📖", totals.lessons, "Lições")}
      ${analyticsMetric("▶️", totals.videos, "Vídeos manuais")}
      ${analyticsMetric("🕘", totals.active7Days, "Usuários ativos em 7 dias")}
      ${analyticsMetric("🔔", totals.notifications, "Novidades ativas")}
    </section>
    <section class="analytics-grid">
      ${analyticsList("Licenças próximas do vencimento", expiringUsers.map((user) => ({
        title: user.name || user.username,
        meta: `${user.days} dia(s) restantes · ${user.email || "sem email"}`
      })), "Nenhuma licença vencendo nos próximos 15 dias.")}
      ${analyticsList("Conteúdos mais vistos", (analytics.popularContent || []).map((item) => ({
        title: item.label,
        meta: `${item.count} visualização(ões)`
      })), "Os conteúdos vistos passarão a aparecer aqui.")}
      ${analyticsList("Páginas mais acessadas", (analytics.popularPages || []).map((item) => ({
        title: item.label,
        meta: `${item.count} acesso(s)`
      })), "Ainda não há páginas acessadas.")}
      ${analyticsList("Dispositivos", (analytics.devices || []).map((item) => ({
        title: item.label,
        meta: `${item.count} registro(s)`
      })), "Sem dados de dispositivo.")}
      ${analyticsList("Últimos acessos", (analytics.recentAccesses || []).map((log) => ({
        title: log.name || log.username || "Usuário",
        meta: `${formatDateTime(log.at)} · ${log.path || log.event || "acesso"}`
      })), "Nenhum acesso registrado.")}
    </section>
  `;
}

function analyticsMetric(icon, value, label) {
  return `
    <article class="analytics-metric">
      <span>${icon}</span>
      <strong>${Number(value || 0)}</strong>
      <small>${authEscapeHtml(label)}</small>
    </article>
  `;
}

function analyticsList(title, items, emptyText) {
  return `
    <article class="analytics-card">
      <h3>${authEscapeHtml(title)}</h3>
      ${items.length ? items.map((item) => `
        <div class="analytics-row">
          <strong>${authEscapeHtml(item.title)}</strong>
          <small>${authEscapeHtml(item.meta)}</small>
        </div>
      `).join("") : `<p class="muted-line">${authEscapeHtml(emptyText)}</p>`}
    </article>
  `;
}

async function loadCommunicationCenter() {
  const form = document.querySelector("#communicationForm");
  if (!form) return;
  bindCommunicationForm();
  await Promise.all([loadCommunicationAudience(), loadCommunicationCampaigns()]);
}

window.loadCommunicationCenter = loadCommunicationCenter;

function bindCommunicationForm() {
  const form = document.querySelector("#communicationForm");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";
  document.querySelector("#previewAudienceBtn")?.addEventListener("click", loadCommunicationAudience);
  ["#communicationChannelInput", "#communicationAccessInput", "#communicationStatusInput"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("change", loadCommunicationAudience);
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = communicationPayload();
    const result = await apiPost("/api/admin/comunicacao/campanhas", payload);
    const message = document.querySelector("#communicationActionMessage");
    if (message) {
      message.textContent = result.error || `Campanha criada para ${result.campaign?.recipientCount || 0} destinatário(s).`;
      message.classList.toggle("error", Boolean(result.error));
      message.classList.add("visible");
    }
    if (!result.error) {
      renderCommunicationCampaigns([result.campaign]);
      await loadCommunicationCampaigns();
    }
  });
}

function communicationPayload() {
  return {
    channel: document.querySelector("#communicationChannelInput")?.value || "both",
    accessLevel: document.querySelector("#communicationAccessInput")?.value || "all",
    status: document.querySelector("#communicationStatusInput")?.value || "approved",
    subject: document.querySelector("#communicationSubjectInput")?.value || "",
    message: document.querySelector("#communicationMessageInput")?.value || ""
  };
}

async function loadCommunicationAudience() {
  const list = document.querySelector("#communicationAudienceList");
  if (!list) return;
  const payload = communicationPayload();
  const channel = payload.channel === "both" ? "all" : payload.channel;
  const query = new URLSearchParams({ accessLevel: payload.accessLevel, status: payload.status, channel });
  const data = await apiGet(`/api/admin/comunicacao/audiencia?${query}`);
  if (data.error) {
    list.innerHTML = `<p class="muted-line">${authEscapeHtml(data.error)}</p>`;
    return;
  }
  const users = data.users || [];
  list.innerHTML = users.length
    ? users.map((user) => `
      <article class="communication-recipient-card">
        <strong>${authEscapeHtml(user.name || user.username)}</strong>
        <span>${authEscapeHtml(user.email || "Sem email")} · ${authEscapeHtml(formatPhoneDisplay(user.phone) || "Sem WhatsApp")}</span>
        <small>${authEscapeHtml(user.church || "Igreja não informada")} · ${authEscapeHtml(user.accessLevel || "")}</small>
      </article>
    `).join("")
    : '<p class="muted-line">Nenhum destinatário encontrado para este filtro.</p>';
}

async function loadCommunicationCampaigns() {
  const data = await apiGet("/api/admin/comunicacao/campanhas");
  if (!data.error) renderCommunicationCampaigns(data.campaigns || []);
}

function renderCommunicationCampaigns(campaigns) {
  const list = document.querySelector("#communicationCampaignList");
  if (!list) return;
  list.innerHTML = campaigns.length
    ? campaigns.map(renderCommunicationCampaignCard).join("")
    : '<p class="muted-line">Nenhuma campanha criada ainda.</p>';
}

function renderCommunicationCampaignCard(campaign) {
  const emailLinks = campaign.emailLinks || [];
  const whatsappLinks = campaign.whatsappLinks || [];
  return `
    <article class="communication-campaign-card">
      <div>
        <strong>${authEscapeHtml(campaign.subject || "Campanha")}</strong>
        <span>${authEscapeHtml(campaign.channel || "both")} · ${Number(campaign.recipientCount || 0)} destinatário(s)</span>
        <small>${formatDateTime(campaign.createdAt)}</small>
      </div>
      <div class="communication-link-list">
        ${emailLinks.slice(0, 8).map((link) => `<a class="icon-button" href="${authEscapeHtml(link.href)}">Email: ${authEscapeHtml(link.name || link.email)}</a>`).join("")}
        ${whatsappLinks.slice(0, 8).map((link) => `<a class="icon-button accent" href="${authEscapeHtml(link.href)}" target="_blank" rel="noreferrer">WhatsApp: ${authEscapeHtml(link.name || link.phone)}</a>`).join("")}
        ${(emailLinks.length + whatsappLinks.length) > 16 ? `<small>Mostrando primeiros envios. Total de links: ${emailLinks.length + whatsappLinks.length}</small>` : ""}
      </div>
    </article>
  `;
}

async function clearAccessLogs() {
  if (!window.confirm("Apagar todos os registros de acesso? Esta acao nao pode ser desfeita.")) return;
  const result = await apiPost("/api/admin/access-logs/clear", {});
  if (result.error) {
    window.alert(result.error);
    return;
  }
  await loadAdminAccessLogs();
}

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
  const accessLabel = accessLevel === "simple" ? "Simples" : accessLevel === "leader" ? "Líderes" : "Prime";
  const licenseText = user.role === "admin" ? "Acesso administrativo" : `${Number(user.licenseDaysRemaining || 0)} dias de acesso disponivel`;
  const status = user.role === "admin"
    ? "Administrador"
    : user.active === false
      ? "Desativado"
      : user.approved
        ? "Ativo"
        : "Aguardando aprovacao";
  const stateClass = user.active === false ? "inactive" : user.approved ? "approved" : "pending";
  const expiresDateValue = user.licenseExpiresAt ? new Date(user.licenseExpiresAt).toISOString().slice(0, 10) : "";
  const accessControl = user.role === "admin" ? "" : `
    <label class="user-access-control">
      <span>Categoria</span>
      <select data-access-level="${authEscapeHtml(user.id)}">
        <option value="simple" ${accessLevel === "simple" ? "selected" : ""}>Simples</option>
        <option value="leader" ${accessLevel === "leader" ? "selected" : ""}>Líderes</option>
        <option value="prime" ${accessLevel === "prime" ? "selected" : ""}>Prime</option>
      </select>
    </label>
  `;
  const actionButtons = user.role === "admin" ? '<span class="pill">Administrador</span>' : `
    ${accessControl}
    <label class="user-access-control">
      <span>Expira em</span>
      <input type="date" data-license-date="${authEscapeHtml(user.id)}" value="${authEscapeHtml(expiresDateValue)}" />
    </label>
    ${!user.approved ? `<button class="icon-button primary" type="button" data-approve="${authEscapeHtml(user.id)}">Aprovar</button>` : ""}
    ${user.active === false
      ? `<button class="icon-button primary" type="button" data-activate="${authEscapeHtml(user.id)}">Reativar</button>`
      : `<button class="icon-button danger" type="button" data-deactivate="${authEscapeHtml(user.id)}">Desativar</button>`}
    <button class="icon-button accent" type="button" data-renew-license="${authEscapeHtml(user.id)}">Salvar licença</button>
    <button class="icon-button" type="button" data-reset="${authEscapeHtml(user.id)}">Nova senha</button>
  `;

  return `
    <article class="user-admin-card ${stateClass}">
      <div class="user-admin-summary">
        <div>
          <strong>${authEscapeHtml(user.name || user.username)}</strong>
          <span>${status} - ${accessLabel}</span>
        </div>
        <small>Última utilização: ${formatDateTime(user.lastAccessAt || user.lastLoginAt) || "Sem acesso registrado"}</small>
        <button class="icon-button" type="button" data-toggle-user-details>Ver detalhes</button>
      </div>
      <div class="user-admin-details">
        <small>CPF: ${authEscapeHtml(user.username)}</small>
        <small>Email: ${authEscapeHtml(user.email || "Sem email")}</small>
        <small>Telefone: ${authEscapeHtml(user.phone || "Nao informado")}</small>
        <small>Igreja: ${authEscapeHtml(user.church || "Igreja nao informada")} - ${authEscapeHtml(user.churchCity || "Cidade nao informada")}</small>
        <small>Endereço: ${authEscapeHtml(user.address || "Endereco nao informado")}</small>
        <small>Licença: ${authEscapeHtml(licenseText)}${user.licenseExpiresAt ? ` - vence em ${formatDate(user.licenseExpiresAt)}` : ""}</small>
        <small>Criado: ${formatDateTime(user.createdAt)} - Aprovado: ${formatDateTime(user.approvedAt)}</small>
        ${user.renewalRequested ? "<em>Solicitou renovacao de licenca</em>" : ""}
        ${user.resetRequested ? "<em>Solicitou redefinicao de senha</em>" : ""}
      </div>
      <div class="user-actions">${actionButtons}</div>
    </article>
  `;
}

function exportUsersCsv(users) {
  const headers = ["Nome", "CPF", "Email", "Telefone", "Igreja", "Cidade da Igreja", "Endereco", "Status", "Categoria", "Dias de acesso", "Vencimento da licenca", "Criado em", "Aprovado em", "Ultimo login", "Ultimo acesso"];
  const rows = users.map((user) => {
    const accessLevel = user.accessLevel === "simple" ? "Simples" : user.accessLevel === "leader" ? "Líderes" : "Prime";
    const status = user.role === "admin" ? "Administrador" : user.active === false ? "Desativado" : user.approved ? "Ativo" : "Aguardando aprovacao";
    return [
      user.name,
      user.username,
      user.email,
      user.phone,
      user.church,
      user.churchCity,
      user.address,
      status,
      accessLevel,
      user.role === "admin" ? "Admin" : Number(user.licenseDaysRemaining || 0),
      formatDate(user.licenseExpiresAt),
      formatDateTime(user.createdAt),
      formatDateTime(user.approvedAt),
      formatDateTime(user.lastLoginAt),
      formatDateTime(user.lastAccessAt)
    ];
  });
  downloadCsv("usuarios-raizes.csv", headers, rows);
}

function exportAccessLogsCsv(logs) {
  const headers = ["Data", "Evento", "Pagina", "Nome", "CPF", "Email", "Dispositivo", "IP", "Navegador completo"];
  const rows = logs.map((log) => [
    formatDateTime(log.at),
    log.event,
    log.path,
    log.name,
    log.username,
    log.email,
    log.device,
    log.ip,
    log.userAgent
  ]);
  downloadCsv("acessos-raizes.csv", headers, rows);
}

async function loadPublicSiteInfo() {
  try {
    const data = await apiGet("/api/site-info");
    if (data.info) applySiteInfo(data.info);
  } catch {
    // As informacoes fixas do HTML continuam visiveis se o servidor oscilar.
  }
}

async function loadAdminSiteInfo() {
  const form = document.querySelector("#siteInfoForm");
  if (!form) return;
  const data = await apiGet("/api/admin/site-info");
  if (data.error) {
    setActionMessage("#siteInfoMessage", data.error, true);
    return;
  }
  fillSiteInfoForm(form, data.info || {});
}

window.loadAdminSiteInfo = loadAdminSiteInfo;

function fillSiteInfoForm(form, info) {
  ["about", "contactEmail", "whatsapp", "instagram", "siteUrl"].forEach((key) => {
    if (form.elements[key]) form.elements[key].value = info?.[key] || "";
  });
  renderTeamMembersEditor(Array.isArray(info?.teamMembers) ? info.teamMembers : []);
}

function applySiteInfo(info) {
  document.querySelectorAll("[data-site-info]").forEach((el) => {
    const key = el.dataset.siteInfo;
    el.textContent = key === "whatsapp" ? formatPhoneDisplay(info?.[key]) : info?.[key] || "";
  });
  document.querySelectorAll("[data-site-link='email']").forEach((el) => {
    const email = info?.contactEmail || "";
    el.href = email ? `mailto:${email}` : "#contato";
  });
  document.querySelectorAll("[data-site-link='whatsapp']").forEach((el) => {
    const phone = String(info?.whatsapp || "").replace(/\D/g, "");
    el.href = phone ? `https://wa.me/55${phone}` : "#whatsapp";
  });
  document.querySelectorAll("[data-site-link='instagram']").forEach((el) => {
    const handle = String(info?.instagram || "").replace(/^@/, "");
    el.href = handle ? `https://instagram.com/${handle}` : "#instagram";
  });
  document.querySelectorAll("[data-site-link='siteUrl']").forEach((el) => {
    const siteUrl = info?.siteUrl || "www.raizeskids.com";
    el.href = normalizePublicUrl(siteUrl);
  });
  renderPublicTeamMembers(info?.teamMembers || []);
}

function renderTeamMembersEditor(members) {
  const list = document.querySelector("#teamMembersEditor");
  if (!list) return;
  const items = members.length ? members : [{ id: "", name: "", role: "", photoUrl: "", summary: "" }];
  list.innerHTML = items.map((member) => teamMemberEditorHtml(member)).join("");
  bindTeamMemberEditors(list);
}

function bindTeamMemberEditors(list) {
  list.querySelectorAll("[data-remove-team-member]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      button.closest(".team-member-editor")?.remove();
      if (!list.querySelector(".team-member-editor")) addTeamMemberEditor();
    });
  });
  list.querySelectorAll("[data-team-photo-file]").forEach((input) => {
    if (input.dataset.bound) return;
    input.dataset.bound = "true";
    input.addEventListener("change", async () => {
      const card = input.closest(".team-member-editor");
      const file = input.files?.[0];
      if (!card || !file) return;
      try {
        const image = await readTeamPhoto(file);
        card.querySelector('[data-team-field="photoUrl"]').value = image;
        renderTeamPhotoPreview(card, image);
      } catch {
        window.alert("Não foi possível carregar esta foto. Tente outra imagem.");
      }
    });
  });
  list.querySelectorAll("[data-remove-team-photo]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const card = button.closest(".team-member-editor");
      if (!card) return;
      card.querySelector('[data-team-field="photoUrl"]').value = "";
      const input = card.querySelector("[data-team-photo-file]");
      if (input) input.value = "";
      renderTeamPhotoPreview(card, "");
    });
  });
}

function addTeamMemberEditor(member = {}) {
  const list = document.querySelector("#teamMembersEditor");
  if (!list) return;
  list.insertAdjacentHTML("beforeend", teamMemberEditorHtml(member));
  const card = list.lastElementChild;
  card?.querySelector("[data-remove-team-member]")?.addEventListener("click", () => card.remove());
  bindTeamMemberEditors(list);
}

function teamMemberEditorHtml(member) {
  return `
    <article class="team-member-editor">
      <input type="hidden" data-team-field="id" value="${authEscapeHtml(member.id || "")}" />
      <input type="hidden" data-team-field="photoUrl" value="${authEscapeHtml(member.photoUrl || "")}" />
      <label><span>Nome</span><input data-team-field="name" value="${authEscapeHtml(member.name || "")}" placeholder="Nome do colaborador" /></label>
      <label><span>Função</span><input data-team-field="role" value="${authEscapeHtml(member.role || "")}" placeholder="Ex.: Coordenação pedagógica" /></label>
      <label class="team-photo-field">
        <span>Foto 3x4</span>
        <input data-team-photo-file type="file" accept="image/png,image/jpeg,image/webp" />
        <small>Envie uma imagem vertical, estilo 3x4.</small>
      </label>
      <div class="team-photo-preview" data-team-photo-preview>
        ${teamPhotoPreviewHtml(member.photoUrl || "")}
      </div>
      <label><span>Resumo</span><textarea data-team-field="summary" rows="3" placeholder="Pequeno resumo sobre o colaborador">${authEscapeHtml(member.summary || "")}</textarea></label>
      <button class="icon-button danger" type="button" data-remove-team-member>Remover</button>
    </article>
  `;
}

function teamPhotoPreviewHtml(src) {
  return src
    ? `<img src="${authEscapeHtml(src)}" alt="Foto do colaborador" /><button class="icon-button danger" type="button" data-remove-team-photo>Remover foto</button>`
    : '<p class="muted-line">Nenhuma foto cadastrada.</p>';
}

function renderTeamPhotoPreview(card, src) {
  const preview = card.querySelector("[data-team-photo-preview]");
  if (!preview) return;
  preview.innerHTML = teamPhotoPreviewHtml(src);
  preview.querySelector("[data-remove-team-photo]")?.addEventListener("click", () => {
    card.querySelector('[data-team-field="photoUrl"]').value = "";
    const input = card.querySelector("[data-team-photo-file]");
    if (input) input.value = "";
    renderTeamPhotoPreview(card, "");
  });
}

async function readTeamPhoto(file) {
  if (window.readCompressedImage) {
    return window.readCompressedImage(file, { maxWidth: 520, maxHeight: 680, quality: 0.84 });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function siteInfoPayload(form) {
  return {
    ...formData(form),
    teamMembers: [...document.querySelectorAll(".team-member-editor")].map((card) => ({
      id: card.querySelector('[data-team-field="id"]')?.value || "",
      name: card.querySelector('[data-team-field="name"]')?.value || "",
      role: card.querySelector('[data-team-field="role"]')?.value || "",
      photoUrl: card.querySelector('[data-team-field="photoUrl"]')?.value || "",
      summary: card.querySelector('[data-team-field="summary"]')?.value || ""
    }))
  };
}

function renderPublicTeamMembers(members) {
  const list = document.querySelector("#teamMembersList");
  if (!list) return;
  const items = Array.isArray(members) ? members.filter((member) => member.name || member.summary || member.photoUrl) : [];
  list.innerHTML = items.length
    ? items.map((member) => `
      <article class="team-member-card">
        <img src="${authEscapeHtml(member.photoUrl || "assets/logo-raizes-kids.png")}" alt="${authEscapeHtml(member.name || "Colaborador Raízes Kids")}" loading="lazy" />
        <div>
          <strong>${authEscapeHtml(member.name || "Equipe Raízes Kids")}</strong>
          <span>${authEscapeHtml(member.role || "Ministério com Criança")}</span>
          <p>${authEscapeHtml(member.summary || "")}</p>
        </div>
      </article>
    `).join("")
    : '<p>Equipe Raízes Kids em organização.</p>';
}

function normalizePublicUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "#contato";
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function formatPhoneDisplay(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value || "";
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

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

function userLicenseText(user) {
  if (!user || user.role === "admin") return "Acesso administrativo";
  const days = Number(user.licenseDaysRemaining || 0);
  return `${days} ${days === 1 ? "dia" : "dias"} de acesso disponivel`;
}

function renderRenewalPaymentAction(paymentUrl) {
  const el = document.querySelector("#authMessage");
  if (!el) return;
  const link = document.createElement("a");
  link.className = "icon-button accent renewal-payment-link";
  link.href = paymentUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = "Renovar licença";
  el.append(link);
}

async function adminAction(url, body) {
  const result = await apiPost(url, body);
  if (result.error) window.alert(result.error);
  await loadAdminUsers();
  await loadAdminAccessLogs();
  return result;
}

function setActionMessage(selector, message, error = false) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("visible", Boolean(message));
  el.classList.toggle("error", error);
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
