const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const names = ["familyFeaturedItem", "familyDevotionalUrl", "familyProgressKey", "readFamilyProgress", "saveFamilyProgress", "rememberFamilyReading", "familyEstimatedMinutes"];
const isolatedSource = names.map((name) => {
  const start = source.search(new RegExp(`^function ${name}\\(`, "m"));
  assert.ok(start >= 0, `Missing function: ${name}`);
  const next = source.slice(start + 1).search(/^(?:async )?function /m);
  return source.slice(start, next < 0 ? source.length : start + 1 + next);
}).join("\n");

function setup() {
  const storage = new Map();
  const state = { authUser: { id: "family-one" } };
  const context = vm.createContext({
    state, URL, Date, location: { href: "https://raizeskids.com/index.html#devocional" },
    stripHtmlToText: (value) => value.replace(/<[^>]+>/g, " "),
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) }
  });
  vm.runInContext(isolatedSource, context);
  return { context, state, storage };
}

test("explicit weekly choice wins; newest item is the fallback", () => {
  const { context } = setup();
  const items = [
    { id: "old", createdAt: "2020-01-01", familyFeatured: true },
    { id: "new", createdAt: "2026-10-01" },
    { id: "hidden", createdAt: "2099-01-01", active: false }
  ];
  assert.equal(context.familyFeaturedItem(items).id, "old");
  items[0].familyFeatured = false;
  assert.equal(context.familyFeaturedItem(items).id, "new");
  assert.equal(context.familyFeaturedItem([]), undefined);
});

test("weeks with identical dates use numeric order", () => {
  const { context } = setup();
  assert.equal(context.familyFeaturedItem([{ id: "two", season: "Semana 2" }, { id: "ten", season: "Semana 10" }]).id, "ten");
});

test("sharing points to the chosen devotional", () => {
  const { context } = setup();
  const url = new URL(context.familyDevotionalUrl("family & faith"));
  assert.equal(url.origin, "https://raizeskids.com");
  assert.equal(url.searchParams.get("devocional"), "family & faith");
  assert.equal(url.hash, "#devocional");
});

test("completion and continuation remain isolated by account", () => {
  const { context, state } = setup();
  assert.equal(context.saveFamilyProgress({ completed: { lesson: "done" }, lastId: "lesson" }), true);
  context.rememberFamilyReading("next");
  assert.equal(context.readFamilyProgress().completed.lesson, "done");
  assert.equal(context.readFamilyProgress().lastId, "next");
  state.authUser = { id: "family-two" };
  assert.equal(Object.keys(context.readFamilyProgress().completed).length, 0);
  state.authUser = null;
  assert.equal(context.saveFamilyProgress({}), false);
});

test("corrupted browser storage recovers without breaking the reader", () => {
  const { context, storage } = setup();
  storage.set("raizes-family-progress:family-one", "invalid JSON");
  assert.equal(context.readFamilyProgress().lastId, null);
  assert.equal(context.familyEstimatedMinutes({ sections: {} }), 5);
});
