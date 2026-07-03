const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { seededDevotionals, seededTrainings } = require("./seed-content");
const { importedLessons, seededEbfs } = require("./seed-imports");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LESSONS_FILE = path.join(DATA_DIR, "lessons.json");
const DEVOTIONALS_FILE = path.join(DATA_DIR, "devotionals.json");
const TRAININGS_FILE = path.join(DATA_DIR, "trainings.json");
const EBFS_FILE = path.join(DATA_DIR, "ebf.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const ACCESS_LOG_FILE = path.join(DATA_DIR, "access-log.json");
const SITE_INFO_FILE = path.join(DATA_DIR, "site-info.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const LICENSE_DAYS = 364;
const DAY_MS = 1000 * 60 * 60 * 24;
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
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

const defaultSiteInfo = {
  about: "Raizes Kids e uma plataforma criada para facilitar a vida de lideres e discipuladores de criancas, reunindo licoes, trilhas, cultos em familia e materiais de apoio em um so lugar.",
  contactEmail: "raizes.r12@gmail.com",
  whatsapp: "31971773756",
  instagram: "@raizes_r12",
  siteUrl: "https://raizes-fic9.onrender.com/"
};

const ageAliases = {
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

Object.assign(ageAliases, {
  "1 e 2": "0 a 2 anos - BerÃ§Ã¡rio",
  "0 a 2": "0 a 2 anos - BerÃ§Ã¡rio",
  "BerÃ§Ã¡rio: 0 a 2 anos": "0 a 2 anos - BerÃ§Ã¡rio",
  "3 e 4": "3 a 4 anos - Maternal",
  "3 a 4": "3 a 4 anos - Maternal",
  "Maternal: 3 a 4 anos": "3 a 4 anos - Maternal",
  "5 e 6": "5 a 6 anos - Jardim",
  "5 a 6": "5 a 6 anos - Jardim",
  "Jardim: 5 a 6 anos": "5 a 6 anos - Jardim",
  "7 a 10": "7 a 10 anos - PrimÃ¡rios",
  "7 a 8": "7 a 10 anos - PrimÃ¡rios",
  "9 a 10": "7 a 10 anos - PrimÃ¡rios",
  "PrimÃ¡rios: 7 a 8 anos": "7 a 10 anos - PrimÃ¡rios",
  "PrÃ©-Juniores: 9 a 10 anos": "7 a 10 anos - PrimÃ¡rios",
  "11 e 12": "11 a 12 anos - Juniores",
  "11 a 12": "11 a 12 anos - Juniores",
  "Juniores: 11 e 12 anos": "11 a 12 anos - Juniores"
});

const initialDevotionals = seededDevotionals.length ? seededDevotionals : [
  {
    id: "culto-familia-semana-16",
    title: "Culto em Família - Semana 16",
    category: "Família",
    season: "Semana 16",
    createdAt: "2026-06-01T00:00:00.000Z",
    verse: '"Nunca lhes falte o zelo, sejam fervorosos no espírito, sirvam ao Senhor." Rm 12.11',
    principle: "Vou valorizar tudo o que Deus me der.",
    bibleText: "Esaú despreza a primogenitura - Gn 25.29-34",
    cardImage: "",
    activityImage: "",
    sections: {
      devotional: "Hoje vamos conversar sobre os presentes de Deus, sobre tudo que Ele já nos deu e sobre o que ainda pode nos dar. Na correria dos nossos dias, podemos deixar de perceber as pequenas coisas que Deus faz por nós. Precisamos ser gratos sempre e valorizar o Senhor pelo que Ele fez, faz e ainda fará. Assim como Esaú desprezou o presente que havia recebido de Deus, nós também perdemos a bênção quando desprezamos aquilo que Ele nos dá. Devemos cuidar bem do que recebemos: nossa família, nossa casa, nosso corpo, nossos materiais e cada oportunidade.",
      prayer: "Senhor, muito obrigado por estar sempre conosco, por cada presente que já me deu e pelo que ainda tem para mim. Me ensine a ser mais cuidadoso com as minhas coisas e com os presentes que me dá. Obrigado pela minha família, por mais um dia de vida. Amém!",
      activity: "Vamos brincar? Prepare um café da tarde, café da manhã, almoço ou jantar especial para a criança. Diga que você valoriza a vida dela e o privilégio de viverem juntos como família. Use esse momento para reforçar que também devemos valorizar e agradar a Deus todos os dias."
    }
  }
];

const initialTrainings = seededTrainings;
const initialEbfs = seededEbfs;

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
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    writeUsers(initialUsers);
  }
  if (!fs.existsSync(LESSONS_FILE) && importedLessons.length) {
    writeLessons(importedLessons);
  }
  if (!fs.existsSync(DEVOTIONALS_FILE)) {
    writeDevotionals(initialDevotionals);
  }
  if (!fs.existsSync(TRAININGS_FILE)) {
    writeTrainings(initialTrainings);
  }
  if (!fs.existsSync(EBFS_FILE)) {
    writeEbfs(initialEbfs);
  }
  mergeSeedContent();
  applyUserAdministrationUpdates();
  applySiteInfoContactUpdates();
  loadSessions();
}

function mergeSeedContent() {
  mergeLessonSeeds();
  mergeSeedFile(DEVOTIONALS_FILE, seededDevotionals, writeDevotionals);
  mergeSeedFile(TRAININGS_FILE, seededTrainings, writeTrainings);
  mergeSeedFile(EBFS_FILE, seededEbfs, writeEbfs);
}

function mergeLessonSeeds() {
  if (!importedLessons.length || !fs.existsSync(LESSONS_FILE)) return;
  const current = readLessonsRaw();
  const merged = addMissingImportedLessons(current);
  if (merged.changed) writeLessons(merged.lessons);
}

function mergeSeedFile(filePath, seedItems, writeFn) {
  if (!seedItems.length || !fs.existsSync(filePath)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const current = Array.isArray(parsed) ? parsed : [];
    const seedsById = new Map(seedItems.map((item) => [item.id, item]));
    let changed = false;
    const merged = current.map((item) => {
      const seed = seedsById.get(item.id);
      if (!seed) return item;
      seedsById.delete(item.id);
      if (!shouldRefreshSeedItem(item)) return item;
      changed = true;
      return {
        ...seed,
        cardImage: item.cardImage || seed.cardImage || "",
        activityImage: item.activityImage || seed.activityImage || "",
        updatedAt: item.updatedAt || seed.updatedAt
      };
    });
    const missing = [...seedsById.values()].filter((item) => item.id);
    if (missing.length) changed = true;
    if (changed) writeFn([...merged, ...missing]);
  } catch {
    writeFn(seedItems);
  }
}

function applyUserAdministrationUpdates() {
  const users = readUsers();
  const before = JSON.stringify(users);
  const removeUsernames = new Set(["00000000022", "04797262648"]);
  const keptUsers = users.filter((user) => !removeUsernames.has(user.username));
  const adminUsernames = new Set(["08047232657", "08692663654"]);
  keptUsers.forEach((user) => {
    if (adminUsernames.has(user.username)) {
      user.role = "admin";
      user.accessLevel = "prime";
      user.approved = true;
      user.active = true;
    }
    if (user.username === "349326076" && !user.licensePatch20260702) {
      user.licenseExpiresAt = new Date(Date.now() + DAY_MS).toISOString();
      user.approved = true;
      user.active = true;
      user.licensePatch20260702 = true;
    }
    if (user.username === "11111111111" && !user.licensePatch20260702) {
      user.licenseExpiresAt = new Date(Date.now() + 2 * DAY_MS).toISOString();
      user.approved = true;
      user.active = true;
      user.licensePatch20260702 = true;
    }
  });
  if (JSON.stringify(keptUsers) !== before) writeUsers(keptUsers);
}

function applySiteInfoContactUpdates() {
  const info = readSiteInfo();
  const next = { ...info };
  if (!next.contactEmail || next.contactEmail === "raizes@gmail.com") next.contactEmail = defaultSiteInfo.contactEmail;
  if (!next.whatsapp || onlyDigits(next.whatsapp) === "31971773756") next.whatsapp = defaultSiteInfo.whatsapp;
  if (!next.instagram || next.instagram === "@raizeskids") next.instagram = defaultSiteInfo.instagram;
  if (JSON.stringify(next) !== JSON.stringify(info)) writeSiteInfo(next);
}

function shouldRefreshSeedItem(item) {
  if (item.seedManaged) return true;
  if (item.id === "culto-familia-semana-16") {
    const text = String(item.sections?.devotional || "");
    return text.includes("Hoje vamos conversar sobre os presentes de Deus, sobre tudo que Ele ja nos deu")
      || text.includes("Hoje vamos conversar sobre os presentes de Deus, sobre tudo que Ele já nos deu");
  }
  return false;
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

  if (req.method === "GET" && url.pathname === "/api/devotionals") {
    sendJson(res, 200, { devotionals: readDevotionals() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/trainings") {
    sendJson(res, 200, { trainings: readTrainings() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/ebf") {
    sendJson(res, 200, { ebfs: readEbfs() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/site-info") {
    sendJson(res, 200, { info: readSiteInfo() });
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

  if (req.method === "POST" && url.pathname === "/api/register-test") {
    await registerTest(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/password-reset") {
    await passwordResetRequest(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/profile") {
    const user = getSessionUser(req);
    if (!user) {
      sendJson(res, 403, { error: "Entre novamente para editar seu perfil." });
      return;
    }
    sendJson(res, 200, { user: publicProfileUser(user) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/profile") {
    await updateProfile(req, res);
    return;
  }

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET" && url.pathname === "/api/admin/users") {
    sendJson(res, 200, { users: readUsers().map(publicAdminUser) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/access-logs") {
    sendJson(res, 200, { logs: adminAccessLogs().slice(-300).reverse() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/access-logs/clear") {
    writeAccessLogs([]);
    sendJson(res, 200, { ok: true, message: "Registros de acesso apagados." });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/site-info") {
    sendJson(res, 200, { info: readSiteInfo() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/site-info") {
    await updateSiteInfo(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/backup") {
    sendSystemBackup(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/lessons") {
    sendJson(res, 200, { lessons: readLessons() || [] });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/devotionals") {
    sendJson(res, 200, { devotionals: readDevotionals() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/devotionals") {
    await updateDevotionals(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/trainings") {
    sendJson(res, 200, { trainings: readTrainings() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/trainings") {
    await updateTrainings(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/ebf") {
    sendJson(res, 200, { ebfs: readEbfs() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/ebf") {
    await updateEbfs(req, res);
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

  const renewMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/renew-license$/);
  if (req.method === "POST" && renewMatch) {
    renewUserLicense(res, renewMatch[1]);
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

  if (pathname.startsWith("/uploads/")) {
    await sendUpload(req, res, pathname);
    return;
  }

  const filePath = path.join(ROOT, pathname);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, "Arquivo não encontrado.");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") {
    const user = getSessionUser(req);
    if (user) appendAccessLog(req, "page", user, pathname);
  }
  sendFile(req, res, filePath, mimeTypes[ext] || "application/octet-stream", ext === ".html" ? "no-store" : "public, max-age=3600");
}

// Entrega as imagens cadastradas nas lições sem expor a pasta data inteira.
async function sendUpload(req, res, pathname) {
  const relativeName = pathname.replace(/^\/uploads\//, "");
  const filePath = path.join(UPLOAD_DIR, relativeName);
  if (!filePath.startsWith(UPLOAD_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, "Arquivo não encontrado.");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  sendFile(req, res, filePath, mimeTypes[ext] || "application/octet-stream", "public, max-age=31536000, immutable");
}

function sendFile(req, res, filePath, contentType, cacheControl) {
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl
  };
  const shouldGzip = acceptsGzip(req) && isCompressible(contentType);
  if (shouldGzip) {
    headers["Content-Encoding"] = "gzip";
    headers.Vary = "Accept-Encoding";
  }
  res.writeHead(200, headers);
  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => res.destroy());
  if (shouldGzip) {
    stream.pipe(zlib.createGzip()).pipe(res);
    return;
  }
  stream.pipe(res);
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
    if (user.renewalRequested || (user.licenseExpiresAt && licenseDaysRemaining(user) <= 0)) {
      sendJson(res, 403, {
        error: "Sua licenca venceu. Renove o acesso para continuar usando o Raizes Kids.",
        renewalRequired: true,
        paymentUrl: "https://pag.ae/81WaCzV4m"
      });
      return;
    }
    sendJson(res, 403, { error: "Seu acesso esta desativado. Fale com o administrador." });
    return;
  }

  if (user.role !== "admin" && licenseDaysRemaining(user) <= 0) {
    const users = readUsers();
    const savedUser = users.find((item) => item.id === user.id);
    if (savedUser) {
      savedUser.active = false;
      savedUser.renewalRequested = true;
      savedUser.updatedAt = new Date().toISOString();
      writeUsers(users);
    }
    sendJson(res, 403, {
      error: "Sua licenca venceu. Renove o acesso para continuar usando o Raizes Kids.",
      renewalRequired: true,
      paymentUrl: "https://pag.ae/81WaCzV4m"
    });
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
  writeSessions();
  markUserAccess(user.id, { lastLoginAt: new Date().toISOString() });
  appendAccessLog(req, "login", user, "/api/login");
  res.setHeader("Set-Cookie", sessionCookie(sessionId));
  const sharedPasswordMessage = removedSessions
    ? "Sua senha foi usada em outro dispositivo. Por seguranca, a sessao anterior foi encerrada."
    : "";
  sendJson(res, 200, { user: publicUser(user), message: [approvalMessage, sharedPasswordMessage].filter(Boolean).join(" ") });
}

function logout(req, res) {
  const sessionId = getCookie(req, "rk_session");
  if (sessionId) {
    sessions.delete(sessionId);
    writeSessions();
  }
  res.setHeader("Set-Cookie", "rk_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  sendJson(res, 200, { ok: true });
}

async function register(req, res) {
  const body = await readBody(req);
  const username = onlyDigits(body.cpf || "");
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!body.name || !username || !body.email || !body.phone || !body.address || !body.church || !body.churchCity) {
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
    phone: onlyDigits(body.phone || ""),
    address: cleanText(body.address),
    church: cleanText(body.church),
    churchCity: cleanText(body.churchCity),
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

async function registerTest(req, res) {
  const body = await readBody(req);
  const username = onlyDigits(body.cpf || "");
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!body.name || !username || !body.email || !body.phone || !body.address || !body.church || !body.churchCity) {
    sendJson(res, 400, { error: "Preencha todos os dados do cadastro teste." });
    return;
  }
  if (!/^\d{6}$/.test(password) || password !== confirmPassword) {
    sendJson(res, 400, { error: "A senha precisa ter 6 dÃ­gitos e a confirmaÃ§Ã£o deve ser igual." });
    return;
  }

  const users = readUsers();
  if (users.some((user) => user.username === username)) {
    sendJson(res, 409, { error: "CPF jÃ¡ cadastrado." });
    return;
  }

  users.push({
    id: crypto.randomUUID(),
    username,
    role: "user",
    accessLevel: "test",
    approved: true,
    active: true,
    name: cleanText(body.name),
    email: cleanText(body.email),
    phone: onlyDigits(body.phone || ""),
    address: cleanText(body.address),
    church: cleanText(body.church),
    churchCity: cleanText(body.churchCity),
    resetRequested: false,
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    licenseExpiresAt: new Date(Date.now() + 3 * DAY_MS).toISOString(),
    passwordHash: hashPassword(password)
  });
  writeUsers(users);
  sendJson(res, 201, { ok: true, message: "Cadastro teste liberado por 3 dias. Entre com seu CPF e senha." });
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
    ensureUserLicense(user);
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
  if (active) {
    user.approved = true;
    ensureUserLicense(user);
  }
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  sendJson(res, 200, { user: publicAdminUser(user) });
}

function renewUserLicense(res, id) {
  const users = readUsers();
  const user = users.find((item) => item.id === id);
  if (!user || user.role === "admin") {
    sendJson(res, 404, { error: "Usuario nao encontrado." });
    return;
  }
  addLicenseDays(user, LICENSE_DAYS);
  user.active = true;
  user.approved = true;
  user.renewalRequested = false;
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  sendJson(res, 200, { user: publicAdminUser(user), message: "Licenca renovada por 364 dias." });
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
  if (!["simple", "test", "leader", "prime"].includes(accessLevel)) {
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
    writeSessions();
    return { user: null, message: "Sua sessao expirou. Entre novamente para continuar." };
  }
  const user = readUsers().find((item) => item.id === session.userId) || null;
  if (user?.active === false) {
    sessions.delete(sessionId);
    writeSessions();
    return { user: null, message: "Seu acesso foi desativado. Fale com o administrador." };
  }
  if (user?.role !== "admin" && licenseDaysRemaining(user) <= 0) {
    const users = readUsers();
    const savedUser = users.find((item) => item.id === user.id);
    if (savedUser) {
      savedUser.active = false;
      savedUser.renewalRequested = true;
      savedUser.updatedAt = new Date().toISOString();
      writeUsers(users);
    }
    sessions.delete(sessionId);
    writeSessions();
    return { user: null, message: "Sua licenca venceu. Renove o acesso para continuar usando o Raizes Kids." };
  }
  markUserAccess(user.id, { lastAccessAt: new Date().toISOString() });
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
  if (removed) writeSessions();
  return removed;
}

function loadSessions() {
  if (!fs.existsSync(SESSIONS_FILE)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
    Object.entries(parsed || {}).forEach(([sessionId, session]) => {
      if (session?.userId && session.expiresAt > Date.now()) {
        sessions.set(sessionId, session);
      }
    });
  } catch {
    sessions.clear();
  }
}

function writeSessions() {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(Object.fromEntries(sessions), null, 2), "utf8");
}

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")).map(normalizeUser);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function markUserAccess(userId, fields) {
  const users = readUsers();
  const user = users.find((item) => item.id === userId);
  if (!user) return;
  if (fields.lastAccessAt && !fields.lastLoginAt) {
    const previous = new Date(user.lastAccessAt || 0).getTime();
    if (Date.now() - previous < 1000 * 60 * 5) return;
  }
  Object.assign(user, fields);
  writeUsers(users);
}

function readAccessLogs() {
  if (!fs.existsSync(ACCESS_LOG_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(ACCESS_LOG_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccessLogs(logs) {
  fs.writeFileSync(ACCESS_LOG_FILE, JSON.stringify(logs.slice(-2000), null, 2), "utf8");
}

function adminAccessLogs() {
  const usersById = new Map(readUsers().map((user) => [user.id, user]));
  return readAccessLogs().map((log) => {
    const user = usersById.get(log.userId);
    return {
      ...log,
      name: user?.name || log.name || "",
      username: user?.username || log.username || "",
      email: user?.email || log.email || ""
    };
  });
}

function appendAccessLog(req, event, user, targetPath) {
  const logs = readAccessLogs();
  logs.push({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    event,
    path: targetPath || "",
    userId: user?.id || "",
    username: user?.username || "",
    name: user?.name || "",
    email: user?.email || "",
    ip: clientIp(req),
    device: deviceLabel(req.headers["user-agent"] || ""),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 300)
  });
  writeAccessLogs(logs);
}

function readSiteInfo() {
  if (!fs.existsSync(SITE_INFO_FILE)) return { ...defaultSiteInfo };
  try {
    const parsed = JSON.parse(fs.readFileSync(SITE_INFO_FILE, "utf8"));
    return { ...defaultSiteInfo, ...(parsed || {}) };
  } catch {
    return { ...defaultSiteInfo };
  }
}

function writeSiteInfo(info) {
  fs.writeFileSync(SITE_INFO_FILE, JSON.stringify({ ...defaultSiteInfo, ...info }, null, 2), "utf8");
}

function readLessons() {
  if (!fs.existsSync(LESSONS_FILE)) return null;
  const merged = addMissingImportedLessons(readLessonsRaw());
  if (merged.changed) writeLessons(merged.lessons);
  return merged.lessons;
}

function writeLessons(lessons) {
  fs.writeFileSync(LESSONS_FILE, JSON.stringify(lessons, null, 2), "utf8");
}

function readLessonsRaw() {
  const parsed = JSON.parse(fs.readFileSync(LESSONS_FILE, "utf8"));
  return Array.isArray(parsed) ? normalizeLessonAges(parsed) : [];
}

function addMissingImportedLessons(lessons) {
  if (!importedLessons.length) return { lessons, changed: false };
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  let changed = false;
  importedLessons.forEach((seed) => {
    if (byId.has(seed.id)) return;
    byId.set(seed.id, { ...seed, age: normalizeAgeLabel(seed.age) });
    changed = true;
  });
  return { lessons: [...byId.values()], changed };
}

function readDevotionals() {
  if (!fs.existsSync(DEVOTIONALS_FILE)) return initialDevotionals;
  const parsed = JSON.parse(fs.readFileSync(DEVOTIONALS_FILE, "utf8"));
  return Array.isArray(parsed) ? sortDevotionals(normalizeContentDates(parsed)) : [];
}

function writeDevotionals(devotionals) {
  fs.writeFileSync(DEVOTIONALS_FILE, JSON.stringify(sortDevotionals(devotionals), null, 2), "utf8");
}

function readTrainings() {
  if (!fs.existsSync(TRAININGS_FILE)) return initialTrainings;
  const parsed = JSON.parse(fs.readFileSync(TRAININGS_FILE, "utf8"));
  return Array.isArray(parsed) ? normalizeContentDates(parsed) : [];
}

function writeTrainings(trainings) {
  fs.writeFileSync(TRAININGS_FILE, JSON.stringify(trainings, null, 2), "utf8");
}

function readEbfs() {
  if (!fs.existsSync(EBFS_FILE)) return initialEbfs;
  const parsed = JSON.parse(fs.readFileSync(EBFS_FILE, "utf8"));
  return Array.isArray(parsed) ? normalizeContentDates(parsed) : [];
}

function writeEbfs(ebfs) {
  fs.writeFileSync(EBFS_FILE, JSON.stringify(ebfs, null, 2), "utf8");
}

async function updateLessons(req, res) {
  const body = await readBody(req);
  const lessons = Array.isArray(body.lessons) ? body.lessons : null;
  if (!lessons) {
    sendJson(res, 400, { error: "Lista de lições inválida." });
    return;
  }
  try {
    const storedLessons = persistLessonImages(lessons);
    writeLessons(storedLessons);
    sendJson(res, 200, { ok: true, lessons: storedLessons, savedAt: new Date().toISOString() });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Nao foi possivel salvar as imagens." });
  }
}

async function updateDevotionals(req, res) {
  const body = await readBody(req);
  const devotionals = Array.isArray(body.devotionals) ? body.devotionals : null;
  if (!devotionals) {
    sendJson(res, 400, { error: "Lista de cultos em familia invalida." });
    return;
  }
  try {
    const stored = persistContentFiles(devotionals, "devotional");
    writeDevotionals(stored);
    sendJson(res, 200, { ok: true, devotionals: stored, savedAt: new Date().toISOString() });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Nao foi possivel salvar os arquivos." });
  }
}

async function updateTrainings(req, res) {
  const body = await readBody(req);
  const trainings = Array.isArray(body.trainings) ? body.trainings : null;
  if (!trainings) {
    sendJson(res, 400, { error: "Lista de treinamentos invalida." });
    return;
  }
  try {
    const stored = persistContentFiles(trainings, "training");
    writeTrainings(stored);
    sendJson(res, 200, { ok: true, trainings: stored, savedAt: new Date().toISOString() });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Nao foi possivel salvar os arquivos." });
  }
}

async function updateEbfs(req, res) {
  const body = await readBody(req);
  const ebfs = Array.isArray(body.ebfs) ? body.ebfs : null;
  if (!ebfs) {
    sendJson(res, 400, { error: "Lista de EBF invalida." });
    return;
  }
  try {
    const stored = persistContentFiles(ebfs, "ebf");
    writeEbfs(stored);
    sendJson(res, 200, { ok: true, ebfs: stored, savedAt: new Date().toISOString() });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Nao foi possivel salvar os arquivos." });
  }
}

function sendSystemBackup(res) {
  try {
    const archive = createBackupArchive();
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    res.writeHead(200, {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="backup-raizes-${stamp}.tar.gz"`,
      "Cache-Control": "no-store"
    });
    res.end(archive);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Nao foi possivel gerar o backup geral." });
  }
}

function createBackupArchive() {
  const chunks = [];
  for (const file of collectBackupFiles()) {
    addTarEntry(chunks, file.name, fs.readFileSync(file.path), fs.statSync(file.path));
  }
  chunks.push(Buffer.alloc(1024));
  return zlib.gzipSync(Buffer.concat(chunks));
}

function collectBackupFiles() {
  const files = [];
  const seen = new Set();
  collectBackupTree(ROOT, "", files, seen);
  if (path.resolve(DATA_DIR) !== path.resolve(ROOT, "data")) {
    collectBackupTree(DATA_DIR, "data", files, seen);
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

function collectBackupTree(baseDir, archiveBase, files, seen) {
  if (!fs.existsSync(baseDir)) return;
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (shouldSkipBackupEntry(entry.name)) continue;
    const fullPath = path.join(baseDir, entry.name);
    const relativeName = archiveBase ? path.posix.join(archiveBase, entry.name) : entry.name;
    if (entry.isDirectory()) {
      collectBackupTree(fullPath, relativeName, files, seen);
      continue;
    }
    if (!entry.isFile()) continue;
    const realPath = fs.realpathSync(fullPath);
    if (seen.has(realPath)) continue;
    seen.add(realPath);
    files.push({ path: fullPath, name: relativeName.replace(/\\/g, "/") });
  }
}

function shouldSkipBackupEntry(name) {
  return [
    ".git",
    ".agents",
    ".codex",
    "node_modules",
    ".env",
    ".env.local",
    "npm-debug.log"
  ].includes(name);
}

function addTarEntry(chunks, name, content, stat) {
  const header = buildTarHeader(name, content.length, stat);
  chunks.push(header, content, Buffer.alloc((512 - (content.length % 512)) % 512));
}

function buildTarHeader(name, size, stat) {
  const header = Buffer.alloc(512);
  const { filename, prefix } = splitTarName(name);
  header.write(filename, 0, 100, "utf8");
  header.write(octal(stat.mode & 0o777, 8), 100, 8, "ascii");
  header.write(octal(0, 8), 108, 8, "ascii");
  header.write(octal(0, 8), 116, 8, "ascii");
  header.write(octal(size, 12), 124, 12, "ascii");
  header.write(octal(Math.floor(stat.mtimeMs / 1000), 12), 136, 12, "ascii");
  header.fill(0x20, 148, 156);
  header.write("0", 156, 1, "ascii");
  header.write("ustar", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  if (prefix) header.write(prefix, 345, 155, "utf8");
  const checksum = [...header].reduce((total, value) => total + value, 0);
  header.write(checksum.toString(8).padStart(6, "0"), 148, 6, "ascii");
  header[154] = 0;
  header[155] = 0x20;
  return header;
}

function splitTarName(name) {
  const cleanName = name.replace(/^\/+/, "");
  if (Buffer.byteLength(cleanName) <= 100) return { filename: cleanName, prefix: "" };
  const parts = cleanName.split("/");
  const filename = parts.pop();
  const prefix = parts.join("/");
  if (Buffer.byteLength(filename) <= 100 && Buffer.byteLength(prefix) <= 155) {
    return { filename, prefix };
  }
  throw new Error(`Arquivo com caminho muito longo para backup: ${cleanName}`);
}

function octal(value, length) {
  const text = Math.max(0, Number(value) || 0).toString(8);
  return `${text.padStart(length - 1, "0")}\0`;
}

function normalizeContentDates(items) {
  return items.map((item) => ({
    ...item,
    createdAt: item.createdAt || item.includedAt || item.updatedAt || new Date().toISOString()
  }));
}

function sortDevotionals(items) {
  return [...items].sort((a, b) => {
    const rankA = devotionalChronologyRank(a);
    const rankB = devotionalChronologyRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return String(a.title || "").localeCompare(String(b.title || ""), "pt-BR", { numeric: true });
  });
}

function devotionalChronologyRank(item) {
  const source = `${item.season || ""} ${item.title || ""} ${item.id || ""}`;
  const weekMatch = source.match(/semana\D*(\d+)/i);
  if (weekMatch) return Number(weekMatch[1]);
  const date = new Date(item.createdAt || item.updatedAt || 0).getTime();
  return Number.isFinite(date) && date > 0 ? 10000 + date : Number.MAX_SAFE_INTEGER;
}

// Antes de salvar o catálogo, transforma fotos base64 em arquivos reais.
// Isso deixa lessons.json leve e evita queda do servidor em salvamentos grandes.
function persistLessonImages(lessons) {
  return lessons.map((lesson) => ({
    ...lesson,
    age: normalizeAgeLabel(lesson.age),
    cardImage: storeDataImage(lesson.cardImage, "card"),
    activityImage: storeDataImage(lesson.activityImage, "activity")
  }));
}

function persistContentFiles(items, prefix) {
  return normalizeContentDates(items).map((item) => ({
    ...item,
    cardImage: storeDataImage(item.cardImage, `${prefix}-card`),
    activityImage: storeDataImage(item.activityImage, `${prefix}-activity`),
    attachments: Array.isArray(item.attachments)
      ? item.attachments.map((attachment) => persistAttachment(attachment, prefix)).filter(Boolean)
      : []
  }));
}

function persistAttachment(attachment, prefix) {
  if (!attachment) return null;
  if (attachment.url && !String(attachment.url).startsWith("data:")) return attachment;
  const storedUrl = storeDataFile(attachment.url, prefix, attachment.name);
  if (!storedUrl) return null;
  return {
    name: cleanText(attachment.name || "Anexo"),
    type: cleanText(attachment.type || ""),
    url: storedUrl
  };
}

function normalizeLessonAges(lessons) {
  return lessons.map((lesson) => ({ ...lesson, age: normalizeAgeLabel(lesson.age) }));
}

function normalizeAgeLabel(age) {
  const value = String(age || "").trim();
  return ageAliases[value] || value || "0 a 2 anos - Berçário";
}

function storeDataImage(value, prefix) {
  if (!value || typeof value !== "string" || !value.startsWith("data:image/")) return value || "";

  const match = value.match(/^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return "";

  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 12 * 1024 * 1024) {
    throw new Error("Imagem muito grande. Reduza a imagem antes de salvar.");
  }

  const ext = mime.includes("png") ? ".png" : mime.includes("webp") ? ".webp" : ".jpg";
  const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 24);
  const filename = `${prefix}-${hash}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

function storeDataFile(value, prefix, originalName = "arquivo") {
  if (!value || typeof value !== "string" || !value.startsWith("data:")) return value || "";

  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return "";

  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 24 * 1024 * 1024) {
    throw new Error("Arquivo muito grande. Use anexos de ate 24MB.");
  }

  const ext = safeFileExtension(originalName, mime);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 24);
  const filename = `${prefix}-file-${hash}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

function safeFileExtension(name, mime) {
  const ext = path.extname(String(name || "")).toLowerCase();
  if (/^\.(pdf|xlsx?|docx?|pptx?|txt|csv|png|jpe?g|webp)$/.test(ext)) return ext;
  if (mime.includes("pdf")) return ".pdf";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return ".xlsx";
  if (mime.includes("word")) return ".docx";
  if (mime.includes("presentation")) return ".pptx";
  if (mime.includes("png")) return ".png";
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("webp")) return ".webp";
  return ".bin";
}

async function updateProfile(req, res) {
  const sessionUser = getSessionUser(req);
  if (!sessionUser) {
    sendJson(res, 403, { error: "Entre novamente para editar seu perfil." });
    return;
  }

  const body = await readBody(req);
  if (!body.name || !body.email || !body.phone || !body.address || !body.church || !body.churchCity) {
    sendJson(res, 400, { error: "Preencha nome, email, telefone, endereco, igreja e cidade da igreja." });
    return;
  }

  const users = readUsers();
  const user = users.find((item) => item.id === sessionUser.id);
  if (!user) {
    sendJson(res, 404, { error: "Usuario nao encontrado." });
    return;
  }

  user.name = cleanText(body.name);
  user.email = cleanText(body.email);
  user.phone = onlyDigits(body.phone || "");
  user.address = cleanText(body.address);
  user.church = cleanText(body.church);
  user.churchCity = cleanText(body.churchCity);
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  sendJson(res, 200, { ok: true, user: publicProfileUser(user), message: "Perfil atualizado." });
}

async function updateSiteInfo(req, res) {
  const body = await readBody(req);
  const info = {
    about: cleanText(body.about || defaultSiteInfo.about),
    contactEmail: normalizeEmail(body.contactEmail || defaultSiteInfo.contactEmail),
    whatsapp: onlyDigits(body.whatsapp || defaultSiteInfo.whatsapp),
    instagram: cleanText(body.instagram || defaultSiteInfo.instagram),
    siteUrl: cleanText(body.siteUrl || defaultSiteInfo.siteUrl),
    updatedAt: new Date().toISOString()
  };
  writeSiteInfo(info);
  sendJson(res, 200, { ok: true, info, message: "Informacoes de contato atualizadas." });
}

async function passwordResetRequest(req, res) {
  const body = await readBody(req);
  const username = onlyDigits(body.cpf || body.username || "");
  const email = normalizeEmail(body.email || "");
  const phone = onlyDigits(body.phone || "");
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");
  if (!username || !email || !phone || !password || password !== confirmPassword || !/^\d{6}$/.test(password)) {
    sendJson(res, 400, { error: "Informe CPF, email, telefone e uma nova senha de 6 digitos." });
    return;
  }

  const users = readUsers();
  const user = users.find((item) => item.username === username);
  if (!user || normalizeEmail(user.email) !== email || onlyDigits(user.phone || "") !== phone) {
    sendJson(res, 403, { error: "Os dados informados nao conferem com o cadastro." });
    return;
  }

  user.passwordHash = hashPassword(password);
  user.resetRequested = false;
  user.updatedAt = new Date().toISOString();
  writeUsers(users);
  revokeUserSessions(user.id);
  sendJson(res, 200, { ok: true, message: "Senha redefinida. Voce ja pode entrar com a nova senha." });
}

function normalizeUser(user) {
  const normalized = {
    ...user,
    accessLevel: user.role === "admin" ? "prime" : user.accessLevel || "prime",
    phone: user.phone || "",
    churchCity: user.churchCity || ""
  };
  if (normalized.role === "admin") return normalized;
  if (normalized.approved && normalized.active !== false && !normalized.licenseExpiresAt) {
    normalized.licenseExpiresAt = new Date(Date.now() + LICENSE_DAYS * DAY_MS).toISOString();
  }
  return normalized;
}

function ensureUserLicense(user) {
  if (user.role === "admin") return;
  if (!user.licenseExpiresAt || licenseDaysRemaining(user) <= 0) {
    user.licenseExpiresAt = new Date(Date.now() + LICENSE_DAYS * DAY_MS).toISOString();
  }
  user.renewalRequested = false;
}

function addLicenseDays(user, days) {
  const currentExpiresAt = new Date(user.licenseExpiresAt || 0).getTime();
  const base = Number.isFinite(currentExpiresAt) && currentExpiresAt > Date.now() ? currentExpiresAt : Date.now();
  user.licenseExpiresAt = new Date(base + days * DAY_MS).toISOString();
}

function licenseDaysRemaining(user) {
  if (!user || user.role === "admin") return 9999;
  const expiresAt = new Date(user.licenseExpiresAt || 0).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return 0;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / DAY_MS));
}

function publicLicenseFields(user) {
  return {
    licenseExpiresAt: user.role === "admin" ? "" : user.licenseExpiresAt || "",
    licenseDaysRemaining: user.role === "admin" ? null : licenseDaysRemaining(user),
    renewalRequested: Boolean(user.renewalRequested)
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
      if (data.length > 80 * 1024 * 1024) {
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
  return { id: user.id, username: user.username, role: user.role, accessLevel: user.accessLevel || "prime", approved: user.approved, active: user.active !== false, name: user.name, ...publicLicenseFields(user) };
}

function publicProfileUser(user) {
  return {
    username: user.username,
    role: user.role,
    accessLevel: user.accessLevel || "prime",
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    church: user.church || "",
    churchCity: user.churchCity || "",
    ...publicLicenseFields(user)
  };
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
    phone: user.phone || "",
    address: user.address,
    church: user.church,
    churchCity: user.churchCity || "",
    resetRequested: Boolean(user.resetRequested),
    renewalRequested: Boolean(user.renewalRequested),
    ...publicLicenseFields(user),
    createdAt: user.createdAt,
    approvedAt: user.approvedAt || "",
    updatedAt: user.updatedAt || "",
    lastLoginAt: user.lastLoginAt || "",
    lastAccessAt: user.lastAccessAt || ""
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
  const text = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (acceptsGzip(res.req) && text.length > 1024) {
    headers["Content-Encoding"] = "gzip";
    headers.Vary = "Accept-Encoding";
    res.writeHead(status, headers);
    res.end(zlib.gzipSync(text));
    return;
  }
  res.writeHead(status, headers);
  res.end(text);
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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function deviceLabel(userAgent) {
  const value = String(userAgent || "");
  const device = /Mobile|Android|iPhone|iPad/i.test(value) ? "Celular/Tablet" : "Computador";
  const browser = value.includes("Edg/") ? "Edge"
    : value.includes("Chrome/") ? "Chrome"
      : value.includes("Firefox/") ? "Firefox"
        : value.includes("Safari/") ? "Safari"
          : "Navegador";
  return `${device} - ${browser}`;
}

function acceptsGzip(req) {
  return String(req?.headers?.["accept-encoding"] || "").includes("gzip");
}

function isCompressible(contentType) {
  return /text|javascript|json|svg|html|css/i.test(contentType);
}
