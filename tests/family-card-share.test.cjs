const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const start = source.indexOf("async function shareFamilyCard(");
const code = source.slice(start, source.indexOf("function familyFeaturedItem(", start));

function setup(navigator, fetchOk = true) {
  const status = { textContent: "" };
  const button = { dataset: { shareFamily: "family-1" }, disabled: false, parentElement: { querySelector: () => status } };
  const context = vm.createContext({
    window: { open() {} },
    navigator, File, state: { devotionals: [{ id: "family-1", title: "Fé em família", cardImage: "/uploads/card.png" }] },
    familyDevotionalUrl: () => "https://raizeskids.com/index.html?devocional=family-1#devocional",
    fetch: async () => ({ ok: fetchOk, blob: async () => new Blob(["test-image"], { type: "image/png" }) })
  });
  vm.runInContext(code, context);
  return { context, button, status };
}

test("native sharing includes the card file and the chosen devotional link", async () => {
  let shared;
  const s = setup({ canShare: () => true, share: async (value) => { shared = value; } });
  await s.context.shareFamilyCard(s.button);
  assert.equal(shared.files[0].type, "image/png");
  assert.ok(shared.text.includes("devocional=family-1"));
  assert.equal(s.button.disabled, false);
});

test("unsupported browsers keep the invitation available without separate download buttons", async () => {
  const s = setup({});
  await s.context.shareFamilyCard(s.button);
  assert.equal(s.status.textContent, "");
});

test("image failures share the invitation text and restore the button", async () => {
  let shared;
  const s = setup({ canShare: () => true, share: async (value) => { shared = value; } }, false);
  await s.context.shareFamilyCard(s.button);
  assert.ok(shared.text.includes("family-1"));
  assert.equal(shared.files, undefined);
  assert.equal(s.button.disabled, false);
});

test("cancelling native sharing does not show an error", async () => {
  const s = setup({ canShare: () => true, share: async () => { throw Object.assign(new Error(), { name: "AbortError" }); } });
  await s.context.shareFamilyCard(s.button);
  assert.equal(s.status.textContent, "");
  assert.equal(s.button.disabled, false);
});
