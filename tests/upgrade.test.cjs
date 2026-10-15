const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const start = source.indexOf("async function requestPlanUpgrade(");
const end = source.indexOf("function normalizeDesiredPlan(", start);
function setup(loggedIn = true) {
  const user = { id: "family-user", name: "Ana Teste", approved: true, active: true, accessLevel: "family", licenseExpiresAt: "" };
  let saved;
  let response;
  const context = vm.createContext({
    Date, encodeURIComponent,
    readSiteInfo: () => ({ monthlyPrice: 19.90, premiumPrice: 349.90, whatsapp: "31975466907" }),
    onlyDigits: (value) => String(value).replace(/\D/g, ""),
    getSessionUser: () => loggedIn ? user : null,
    readBody: async (req) => req.body,
    readUsers: () => [{ ...user }], writeUsers: (users) => { saved = users[0]; },
    paymentUrlForPlan: (plan) => `https://payments.example/${plan}`,
    sendJson: (_res, status, body) => { response = { status, body }; }
  });
  vm.runInContext(source.slice(start, end), context);
  return { context, saved: () => saved, response: () => response };
}

test("existing family account can choose each paid plan without a new registration", async () => {
  for (const plan of ["monthly", "premium"]) {
    const state = setup();
    await state.context.requestPlanUpgrade({ body: { plan } }, {});
    assert.equal(state.response().status, 200);
    assert.equal(state.saved().id, "family-user");
    assert.equal(state.saved().requestedPlan, plan);
    assert.equal(state.saved().accessLevel, "family");
    assert.equal(state.saved().licenseExpiresAt, "");
    assert.equal(state.response().body.paymentUrl, `https://payments.example/${plan}`);
    const whatsapp = new URL(state.response().body.whatsappUrl);
    assert.equal(whatsapp.pathname, "/5531975466907");
    assert.ok(whatsapp.searchParams.get("text").includes("Ana Teste"));
    assert.ok(state.response().body.message.includes("comprovante"));
  }
});

test("upgrade requires a signed-in account", async () => {
  const state = setup(false);
  await state.context.requestPlanUpgrade({ body: { plan: "premium" } }, {});
  assert.equal(state.response().status, 401);
  assert.equal(state.saved(), undefined);
});

test("invalid plan cannot change the account", async () => {
  const state = setup();
  await state.context.requestPlanUpgrade({ body: { plan: "admin" } }, {});
  assert.equal(state.response().status, 400);
  assert.equal(state.saved(), undefined);
});
