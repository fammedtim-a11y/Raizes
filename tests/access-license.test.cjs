const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const functions = ["downgradeExpiredUserToFamily", "renewUserLicense", "addLicenseDays", "licenseDaysRemaining"];
const isolatedSource = functions.map((name) => {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, "m"));
  assert.ok(start >= 0, `Missing function: ${name}`);
  const next = source.slice(start + 1).search(/^(?:async )?function /m);
  return source.slice(start, next < 0 ? source.length : start + 1 + next);
}).join("\n");

function setup(overrides = {}) {
  const user = {
    id: "test-user", role: "user", accessLevel: "leader", approved: true,
    active: true, licenseExpiresAt: "2020-01-01T00:00:00.000Z", ...overrides
  };
  let stored = { ...user };
  let response;
  const context = vm.createContext({
    Date, LICENSE_DAYS: 31, DAY_MS: 86400000,
    readUsers: () => [{ ...stored }],
    writeUsers: (users) => { stored = { ...users[0] }; },
    readBody: async (req) => req.body || {},
    publicAdminUser: (value) => value,
    sendJson: (_res, status, body) => { response = { status, body }; }
  });
  vm.runInContext(isolatedSource, context);
  return { context, user, saved: () => stored, response: () => response };
}

test("expired paid access becomes free family access", () => {
  const state = setup();
  assert.equal(state.context.downgradeExpiredUserToFamily(state.user), true);
  assert.equal(state.saved().accessLevel, "family");
  assert.equal(state.saved().previousPaidAccess, "leader");
  assert.equal(state.saved().licenseExpiresAt, "");
  assert.equal(state.saved().active, true);
});

test("pending and manually disabled users are not reactivated by expiry", () => {
  for (const overrides of [{ approved: false }, { active: false, deactivatedByAdmin: true }]) {
    const state = setup(overrides);
    assert.equal(state.context.downgradeExpiredUserToFamily(state.user), false);
    assert.equal(state.saved().accessLevel, "leader");
  }
});

test("free, admin and unexpired accounts do not downgrade", () => {
  for (const overrides of [{ accessLevel: "family" }, { role: "admin" }, { licenseExpiresAt: "2099-01-01T00:00:00.000Z" }]) {
    const state = setup(overrides);
    assert.equal(state.context.downgradeExpiredUserToFamily(state.user), false);
  }
});

test("renewal restores the previous paid plan with the selected expiry", async () => {
  for (const previousPaidAccess of ["leader", "prime"]) {
    const state = setup({ accessLevel: "family", previousPaidAccess, licenseExpiresAt: "", deactivatedByAdmin: true });
    await state.context.renewUserLicense({ body: { licenseExpiresAt: "2099-10-01" } }, {}, state.user.id);
    assert.equal(state.response().status, 200);
    assert.equal(state.saved().accessLevel, previousPaidAccess);
    assert.equal(state.saved().deactivatedByAdmin, false);
    assert.equal(state.saved().licenseExpiresAt, "2099-10-02T02:59:59.999Z");
  }
});

test("family accounts without a previous paid plan need an explicit plan selection", async () => {
  const state = setup({ accessLevel: "family", licenseExpiresAt: "" });
  await state.context.renewUserLicense({ body: {} }, {}, state.user.id);
  assert.equal(state.response().status, 400);
  assert.equal(state.saved().accessLevel, "family");
});

test("invalid renewal dates do not persist access changes", async () => {
  const state = setup({ accessLevel: "family", previousPaidAccess: "prime", licenseExpiresAt: "" });
  await state.context.renewUserLicense({ body: { licenseExpiresAt: "invalid" } }, {}, state.user.id);
  assert.equal(state.response().status, 400);
  assert.equal(state.saved().accessLevel, "family");
});
