const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const start = source.indexOf("async function downloadContent(");
const code = source.slice(start, source.indexOf("function normalizeDesiredPlan(", start));
function setup(user) {
  let status;
  let exported;
  let bodyRead = false;
  const headers = {};
  const res = { setHeader: (key, value) => { headers[key] = value; }, writeHead: (value) => { status = value; }, end() {} };
  const context = vm.createContext({
    Buffer, ROOT: "root", UPLOAD_DIR: "uploads", runningExports: 0,
    getSessionUser: () => user, readBody: async (req) => { bodyRead = true; return req.body; },
    readLessons: () => [{ id: "a", title: "Fé", sections: { activity: "Texto salvo" } }],
    readDevotionals: () => [{ id: "b", title: "Família" }], readSiteInfo: () => ({}),
    sendJson: (_res, value) => { status = value; }, console: { error() {} },
    require: () => ({ exportContent: async (...args) => { exported = args; return Buffer.from("file"); } })
  });
  vm.runInContext(code, context);
  return { context, res, headers, status: () => status, exported: () => exported, bodyRead: () => bodyRead };
}
test("guests and non-Premium users cannot download PDF or DOCX", async () => {
  for (const user of [null, { role: "user", accessLevel: "family" }, { role: "user", accessLevel: "leader" }]) {
    const s = setup(user);
    await s.context.downloadContent({ body: {} }, s.res);
    assert.equal(s.status(), 403);
    assert.equal(s.bodyRead(), false);
  }
});
test("Premium downloads use saved content and attachment headers", async () => {
  const s = setup({ role: "user", accessLevel: "prime" });
  await s.context.downloadContent({ body: { type: "lesson", format: "docx", ids: ["a"] } }, s.res);
  assert.equal(s.status(), 200);
  assert.equal(s.exported()[1][0].sections.activity, "Texto salvo");
  assert.ok(s.headers["Content-Disposition"].startsWith("attachment;"));
  assert.equal(s.context.runningExports, 0);
});
test("only admins can export an unsaved editor draft", async () => {
  for (const role of ["user", "admin"]) {
    const s = setup({ role, accessLevel: "prime" });
    await s.context.downloadContent({ body: { type: "devotional", format: "pdf", items: [{ title: "Rascunho", sections: {} }] } }, s.res);
    assert.equal(s.status(), role === "admin" ? 200 : 403);
    assert.equal(s.context.runningExports, 0);
  }
});
test("unknown ids, invalid formats and busy workers cannot create a file", async () => {
  for (const body of [{ type: "lesson", format: "pdf", ids: ["missing"] }, { type: "lesson", format: "exe", ids: ["a"] }, { type: "devotional", format: "pdf", ids: [] }]) {
    const s = setup({ role: "admin" });
    await s.context.downloadContent({ body }, s.res);
    assert.equal(s.status(), 400);
    assert.equal(s.exported(), undefined);
    assert.equal(s.context.runningExports, 0);
  }
  const s = setup({ role: "admin" });
  s.context.runningExports = 2;
  await s.context.downloadContent({ body: {} }, s.res);
  assert.equal(s.status(), 429);
});
