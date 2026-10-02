const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const names = ["familyFeaturedItem", "familyDevotionalUrl", "familyEstimatedMinutes"];
const isolatedSource = names.map((name) => {
  const start = source.search(new RegExp(`^function ${name}\\(`, "m"));
  assert.ok(start >= 0, `Missing function: ${name}`);
  const next = source.slice(start + 1).search(/^(?:async )?function /m);
  return source.slice(start, next < 0 ? source.length : start + 1 + next);
}).join("\n");

function setup() {
  const context = vm.createContext({
    URL, Date, location: { href: "https://raizeskids.com/index.html#devocional" },
    stripHtmlToText: (value) => value.replace(/<[^>]+>/g, " ")
  });
  vm.runInContext(isolatedSource, context);
  return { context };
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

test("reading estimate has a minimum for short devotionals", () => {
  const { context } = setup();
  assert.equal(context.familyEstimatedMinutes({ sections: {} }), 5);
});
