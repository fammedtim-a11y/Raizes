const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LESSONS_FILE = path.join(DATA_DIR, "lessons.json");
const sessions = new Map();
const revokedSessions = new Map();
const loginAttempts = new Map();

const initialUsers = [
  {
    id: crypto.randomUUID(),
    username: "08047232657",
    role: "admin",
    accessLevel: "prime",
    approved: true,
    active: true,
    name: "Administrador",
    email: "",
    address: "",
    church: "",
    createdAt: new Date().toISOString(),
    passwordHash: "scrypt$ad9cb02c3f56477bc808bc8ebeb30744$00d31583eab5101a4b934cd19afdb623523938276a836ea49bd993672f90c052053d08b0eca1480b4fbdfe0481918e44cb99169e6f17a9b0a4c48187babbeec5"
  },
  {
    id: crypto.randomUUID(),
    username: "1453505",
    role: "user",
    accessLevel: "prime",
    approved: true,
    active: true,
    name: "Usuário de uso 1",
    email: "",
    address: "",
    church: "",
    createdAt: new Date().toISOString(),
    passwordHash: "scrypt$128d7510866f9039962fda1403dfc9e2$7b1f518e11bafd56e3f4907b3c85c76bbc77cb58ed964f56bcc21cf8b471b47e05b619507640ceaac045f709ff6f87e95bb605054bbe9107aa3ec69b4392d8a9"
  },
  {
    id: crypto.randomUUID(),
    username: "08692663654",
    role: "user",
    accessLevel: "prime",
    approved: true,
    active: true,
    name: "Usuário de uso 2",
    email: "",
    address: "",
    church: "",
    createdAt: new Date().toISOString(),
    passwordHash: "scrypt$38b2a349119c7cc694b17a2956d1f410$9aa225f270f7acbd4293fd5cf3746e05e619ff718332bfbf3053ec5836cf07ec7df0edb9416147868e6e48cc60ec3f24d59e647450d5051fcac01d2c73520735"
  }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

ensureData();

const server = http.createServer(async (req, res) => {
  try {
    setSecurityHeaders(res);
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await handleStatic(req, res, url);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Erro interno do servidor." });
  }
});

server.listen(PORT, () => {
  console.log(`Raizes Kids rodando na porta ${PORT}`);
});

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    writeUsers(initialUsers);
  }
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/session") {
    const session = getSessionState(req);
    sendJson(res, 200, { user: publicUser(session.user), message: session.message || "" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/lessons") {
    const lessons = readLessons();
    if (!lessons) {
      sendJson(res, 404, { error: "Catálogo ainda não foi salvo no servidor." });
      return;
    }
    sendJson(res, 200, { lessons });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    await login(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/logout") {
    logout(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/register") {
    await register(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/password-reset") {
    await passwordResetRequest(req, res);
    return;
  }

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET" && url.pathname === "/api/admin/users") {
    sendJson(res, 200, { users: readUsers().map(publicAdminUser) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/lessons") {
    sendJson(res, 200, { lessons: readLessons() || [] });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/lessons") {
    await updateLessons(req, res);
    return;
  }

  const approveMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/approve$/);
  if (req.method === "POST" && approveMatch) {
    updateUserApproval(res, approveMatch[1], true);
    return;
  }

  const deactivateMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/deactivate$/);
  if (req.method === "POST" && deactivateMatch) {
    updateUserActive(res, deactivateMatch[1], false);
    return;
  }

  const activateMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/activate$/);
  if (req.method === "POST" && activateMatch) {
    updateUserActive(res, activateMatch[1], true);
    return;
  }

  const resetMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/password$/);
  if (req.method === "POST" && resetMatch) {
    await adminResetPassword(req, res, resetMatch[1]);
    return;
  }

  const accessMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/access$/);
  if (req.method === "POST" && accessMatch) {
    await updateUserAccess(req, res, accessMatch[1]);
    return;
  }

  sendJson(res, 404, { error: "Rota não encontrada." });
}

async function handleStatic(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Método não permitido.");
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/admin") pathname = "/gerenciamento.html";

  if (pathname === "/gerenciamento.html") {
    const user = getSessionUser(req);
    if (!user || user.role !== "admin") {
      redirect(res, `/login.html?next=${encodeURIComponent("/gerenciamento.html")}`);
      return;
    }
  }

  if (pathname.startsWith("/data/") || pathname.includes("..")) {
    sendText(res, 403, "Acesso negado.");
    return;
  }

  const filePath = path.join(ROOT, pathname);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, "Arquivo não encontrado.");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

async function login(req, res) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    sendJson(res, 429, { error: "Muitas tentativas. Aguarde alguns minutos." });
    return;
  }

  const body = await readBody(req);
  const username = onlyDigits(body.username || "");
  const password = String(body.password || "");
  const user = readUsers().find((item) => item.username === username);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    registerAttempt(ip, false);
    sendJson(res, 401, { error: "Usuário ou senha inválidos." });
    return;
  }

  if (!user.approved) {
    sendJson(res, 403, { error: "Seu cadastro ainda aguarda aprovação do administrador." });
    return;
  }

  if (user.active === false) {
    sendJson(res, 403, { error: "Seu acesso esta desativado. Fale com o administrador." });
    return;
  }

  registerAttempt(ip, true);
  const removedSessions = revokeUserSessions(user.id);
  const approvalMessage = user.approvalNotice ? "Seu cadastro foi aprovado. Bem-vindo ao Raizes Kids!" : "";
  if (user.approvalNotice) {
    const users = readUsers();
    const savedUser = users.find((item) => item.id === user.id);
    if (savedUser) {
      savedUser.approvalNotice = false;
      savedUser.updatedAt = new Date().toISOString();
      writeUsers(users);
    }
  }
  const sessionId = crypto.randomBytes(32).toString("hex");
  sessions.set(sessionId, { userId: user.id, expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
  res.setHeader("Set-Cookie", sessionCookie(sessionId));
  const sharedPasswordMessage = removedSessions
    ? "Sua senha foi usada em outro dispositivo. Por seguranca, a sessao anterior foi encerrada."
    : "";
  sendJson(res, 200, { user: publicUser(user), message: [approvalMessage, sharedPasswordMessage].filter(Boolean).join(" ") });
}

function logout(req, res) {
  const sessionId = getCookie(req, "rk_session");
  if (sessionId) sessions.delete(sessionId);
  res.setHeader("Set-Cookie", "rk_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  sendJson(res, 200, { ok: true });
}

async function register(req, res) {
  const body = await readBody(req);
  const username = onlyDigits(body.cpf || "");
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!body.name || !username || !body.email || !body.address || !body.church) {
    sendJson(res, 400, { error: "Preencha todos os dados do cadastro." });
    return;
  }
  if (!/^\d{6}$/.test(password) || password !== confirmPassword) {
    sendJson(res, 400, { error: "A senha precisa ter 6 dígitos e a confirmação deve ser igual." });
    return;
  }

  const users = readUsers();
  if (users.some((user) => user.username === username)) {
    sendJson(res, 409, { error: "CPF já cadastrado." });
    return;
  }

  users.push({
    id: crypto.randomUUID(),
    username,
    role: "user",
    accessLevel: "simple",
    approved: false,
    active: true,
    name: cleanText(body.name),
    email: cleanText(body.email),
    address: cleanText(body.address),
    church: cleanText(body.church),
    resetRequested: false,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password)
  });
  writeUsers(users);
  sendJson(res, 201, { ok: true, message: "Cadastro enviado. Aguarde aprovação do administrador." });
}

async function passwordResetRequest(req, res) {
  const body = await readBody(req);
  const username = onlyDigits(body.username || "");
  const users = readUsers();
  const user = users.find((item) => item.username === username);
  if (user) {
    user.resetRequested = true;
    user.updatedAt = new Date().toISOString();
    writeUsers(users);
  }
  sendJson(res, 200, { ok: true, message: "Se o usuário existir, o pedido será enviado ao administrador." });
}

function updateUserApproval(res, id, approved) {
  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user || user.role === "admin") {
    sendJson(res, 404, { error: "Usuário não encontrado." });
    return;
  }
  user.approved = approved;
  if (approved) {
    user.active = true;
    user.approvalNotice = true;
    user.approvedAt = new Date().toISOString();
  }
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  sendJson(res, 200, { user: publicAdminUser(user) });
}

function updateUserActive(res, id, active) {
  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user || user.role === "admin") {
    sendJson(res, 404, { error: "UsuÃ¡rio nÃ£o encontrado." });
    return;
  }
  user.active = active;
  if (active) user.approved = true;
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  sendJson(res, 200, { user: publicAdminUser(user) });
}

async function adminResetPassword(req, res, id) {
  const body = await readBody(req);
  const password = String(body.password || "");
  if (!/^\d{6}$/.test(password)) {
    sendJson(res, 400, { error: "A nova senha precisa ter 6 dígitos." });
    return;
  }
  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user) {
    sendJson(res, 404, { error: "Usuário não encontrado." });
    return;
  }
  user.passwordHash = hashPassword(password);
  user.resetRequested = false;
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  sendJson(res, 200, { user: publicAdminUser(user) });
}

async function updateUserAccess(req, res, id) {
  const body = await readBody(req);
  const accessLevel = String(body.accessLevel || "");
  if (!["simple", "leader", "prime"].includes(accessLevel)) {
    sendJson(res, 400, { error: "Categoria de usuario invalida." });
    return;
  }
  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user || user.role === "admin") {
    sendJson(res, 404, { error: "Usuario nao encontrado." });
    return;
  }
  user.accessLevel = accessLevel;
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  revokeUserSessions(user.id);
  sendJson(res, 200, { user: publicAdminUser(user) });
}

function requireAdmin(req, res) {
  const user = getSessionUser(req);
  if (!user || user.role !== "admin") {
    sendJson(res, 403, { error: "Acesso restrito ao administrador." });
    return null;
  }
  return user;
}

function getSessionUser(req) {
  return getSessionState(req).user;
}

function getSessionState(req) {
  const sessionId = getCookie(req, "rk_session");
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) {
    const message = sessionId ? revokedSessions.get(sessionId) || "Sua sessao foi encerrada. Entre novamente para continuar." : "";
    if (sessionId) revokedSessions.delete(sessionId);
    return { user: null, message };
  }
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return { user: null, message: "Sua sessao expirou. Entre novamente para continuar." };
  }
  const user = readUsers().find((item) => item.id === session.userId) || null;
  if (user?.active === false) {
    sessions.delete(sessionId);
    return { user: null, message: "Seu acesso foi desativado. Fale com o administrador." };
  }
  return { user, message: "" };
}

function revokeUserSessions(userId) {
  let removed = 0;
  for (const [sessionId, session] of sessions.entries()) {
    if (session.userId !== userId) continue;
    sessions.delete(sessionId);
    revokedSessions.set(sessionId, "Sua senha foi usada em outro dispositivo. Esta sessao foi encerrada por seguranca.");
    removed += 1;
  }
  return removed;
}

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")).map(normalizeUser);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function readLessons() {
  if (!fs.existsSync(LESSONS_FILE)) return null;
  const parsed = JSON.parse(fs.readFileSync(LESSONS_FILE, "utf8"));
  return Array.isArray(parsed) ? parsed : [];
}

function writeLessons(lessons) {
  fs.writeFileSync(LESSONS_FILE, JSON.stringify(lessons, null, 2), "utf8");
}

async function updateLessons(req, res) {
  const body = await readBody(req);
  const lessons = Array.isArray(body.lessons) ? body.lessons : null;
  if (!lessons) {
    sendJson(res, 400, { error: "Lista de lições inválida." });
    return;
  }
  writeLessons(lessons);
  sendJson(res, 200, { ok: true, lessons, savedAt: new Date().toISOString() });
}

function normalizeUser(user) {
  return {
    ...user,
    accessLevel: user.role === "admin" ? "prime" : user.accessLevel || "prime"
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [method, salt, hash] = String(stored || "").split("$");
  if (method !== "scrypt" || !salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === check.length && crypto.timingSafeEqual(expected, check);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 25 * 1024 * 1024) {
        reject(new Error("Payload muito grande."));
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function publicUser(user) {
  if (!user) return null;
  return { username: user.username, role: user.role, accessLevel: user.accessLevel || "prime", approved: user.approved, active: user.active !== false, name: user.name };
}

function publicAdminUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    accessLevel: user.accessLevel || "prime",
    approved: user.approved,
    active: user.active !== false,
    name: user.name,
    email: user.email,
    address: user.address,
    church: user.church,
    resetRequested: Boolean(user.resetRequested),
    createdAt: user.createdAt
  };
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://img.youtube.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self'; base-uri 'self'; form-action 'self'"
  );
}

function sessionCookie(sessionId) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `rk_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200${secure}`;
}

function getCookie(req, name) {
  const cookie = req.headers.cookie || "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.split("=")[1] || "";
}

function isRateLimited(ip) {
  const item = loginAttempts.get(ip);
  return Boolean(item && item.count >= 8 && item.until > Date.now());
}

function registerAttempt(ip, success) {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }
  const item = loginAttempts.get(ip) || { count: 0, until: 0 };
  item.count += 1;
  item.until = Date.now() + 1000 * 60 * 10;
  loginAttempts.set(ip, item);
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  res.end(text);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function cleanText(value) {
  return String(value || "").trim().slice(0, 240);
}
