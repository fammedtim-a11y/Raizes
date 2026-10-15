const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

function setup() {
  const previous = { monthlyPrice: 19.90, premiumPrice: 349.90, pixKey: "", about: "Preservar", contactEmail: "admin@example.com", whatsapp: "31975466907", instagram: "@raizeskids_", siteUrl: "www.raizeskids.com", paymentUrl: "https://example.com/monthly", premiumPaymentUrl: "https://example.com/premium", paymentQrImage: "old-qr.png", teamMembers: [{ name: "Equipe" }] };
  let saved;
  let response;
  const context = vm.createContext({
    URL, Date, readBody: async (req) => req.body, readSiteInfo: () => saved || previous,
    defaultSiteInfo: previous, cleanText: (v) => v, normalizeEmail: (v) => v,
    onlyDigits: (v) => String(v).replace(/\D/g, ""), normalizePaymentQrImage: (v) => v,
    normalizeTeamMembers: (v) => v, writeSiteInfo: (v) => { saved = v; },
    sendJson: (_res, status, body) => { response = { status, body }; }
  });
  const start = source.indexOf("async function updateSiteInfo(");
  vm.runInContext(source.slice(start, source.indexOf("function normalizeTeamMembers(", start)), context);
  const planStart = source.indexOf("function normalizeDesiredPlan(");
  vm.runInContext(source.slice(planStart, source.indexOf("async function passwordResetRequest(", planStart)), context);
  return { context, saved: () => saved, response: () => response };
}

test("Pix and prices persist without deleting the existing team, QR or contact", async () => {
  const s = setup();
  await s.context.updateSiteInfo({ body: { pixKey: "pix@example.com", monthlyPrice: "24.90", premiumPrice: "399.90" } }, {});
  assert.equal(s.response().status, 200);
  assert.equal(s.saved().about, "Preservar");
  assert.equal(s.saved().teamMembers[0].name, "Equipe");
  assert.equal(s.saved().paymentQrImage, "old-qr.png");
  assert.equal(s.saved().monthlyPrice, 24.90);
  assert.equal(s.context.paymentUrlForPlan("monthly"), "/pagamento.html?plan=monthly");
  assert.equal(s.context.paymentUrlForPlan("premium"), "/pagamento.html?plan=premium");
  assert.equal(s.context.paymentUrlForPlan("family"), "");
});

test("clearing Pix restores the configured checkout links", async () => {
  const s = setup();
  await s.context.updateSiteInfo({ body: { pixKey: "" } }, {});
  assert.equal(s.context.paymentUrlForPlan("monthly"), "https://example.com/monthly");
  assert.equal(s.context.paymentUrlForPlan("premium"), "https://example.com/premium");
});

test("invalid prices, Pix and unsafe payment links cannot be saved", async () => {
  for (const body of [{ monthlyPrice: "" }, { monthlyPrice: -1 }, { premiumPrice: "NaN" }, { monthlyPrice: 10.001 }, { pixKey: "<script>" }, { paymentUrl: "javascript:alert(1)" }]) {
    const s = setup();
    await s.context.updateSiteInfo({ body }, {});
    assert.equal(s.response().status, 400);
    assert.equal(s.saved(), undefined);
  }
});
