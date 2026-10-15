const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
function loadFunction(name, context) {
  const start = source.search(new RegExp(`^function ${name}\\(`, "m"));
  assert.ok(start >= 0);
  const next = source.slice(start + 1).search(/^(?:async )?function /m);
  vm.runInContext(source.slice(start, start + 1 + next), context);
}

function setup(t) {
  const root = path.resolve(__dirname, "..", "tmp");
  fs.mkdirSync(root, { recursive: true });
  const dir = fs.mkdtempSync(path.join(root, "devotional-preservation-"));
  t.after(() => {
    assert.equal(path.dirname(dir), root);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const file = path.join(dir, "devotionals.json");
  const context = vm.createContext({
    fs, path, crypto, Date, DATA_DIR: dir, DEVOTIONALS_FILE: file,
    console: { error() {} }, sortDevotionals: (items) => items
  });
  loadFunction("writeDevotionals", context);
  loadFunction("mergeSeedFile", context);
  return { context, dir, file };
}

test("restart preserves edited seed titles, text, formatting and images", (t) => {
  const { context, file } = setup(t);
  const saved = [{ id: "week-two", seedManaged: true, title: "Criatividade e Cuidado.", verse: "<p>Versiculo editado</p>", sections: { devotional: "Texto novo do administrador" }, cardImage: "/uploads/current.jpg" }];
  fs.writeFileSync(file, JSON.stringify(saved));
  const before = fs.readFileSync(file, "utf8");
  const seeds = [{ id: "week-two", title: "Culto em Familia - Semana 2", sections: { devotional: "Texto antigo" } }];
  context.mergeSeedFile(file, seeds, context.writeDevotionals);
  context.mergeSeedFile(file, seeds, context.writeDevotionals);
  assert.equal(fs.readFileSync(file, "utf8"), before);
});

test("new seed content can be added without replacing existing content", (t) => {
  const { context, file } = setup(t);
  const saved = { id: "existing", title: "Conteudo editado", seedManaged: true };
  fs.writeFileSync(file, JSON.stringify([saved]));
  context.mergeSeedFile(file, [{ id: "existing", title: "Antigo" }, { id: "new", title: "Novo" }], context.writeDevotionals);
  const result = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.deepEqual(result[0], saved);
  assert.equal(result[1].id, "new");
});

test("invalid stored data is preserved instead of replaced by seeds", (t) => {
  const { context, file } = setup(t);
  for (const value of ["incomplete JSON", '{"unexpected":true}']) {
    fs.writeFileSync(file, value);
    context.mergeSeedFile(file, [{ id: "seed" }], context.writeDevotionals);
    assert.equal(fs.readFileSync(file, "utf8"), value);
  }
});

test("saving creates a full previous-version backup and replaces the file atomically", (t) => {
  const { context, file, dir } = setup(t);
  const previous = JSON.stringify([{ id: "original", title: "Original" }]);
  fs.writeFileSync(file, previous);
  context.writeDevotionals([{ id: "updated", title: "Atualizado" }]);
  const backups = fs.readdirSync(path.join(dir, "backups", "devotionals"));
  assert.equal(backups.length, 1);
  assert.equal(fs.readFileSync(path.join(dir, "backups", "devotionals", backups[0]), "utf8"), previous);
  assert.equal(JSON.parse(fs.readFileSync(file, "utf8"))[0].id, "updated");
  assert.equal(fs.readdirSync(dir).filter((name) => name.endsWith(".tmp")).length, 0);
});

test("failed backup prevents overwriting the current content", (t) => {
  const { context, file, dir } = setup(t);
  const previous = '[{"id":"preserve-me"}]';
  fs.writeFileSync(file, previous);
  fs.writeFileSync(path.join(dir, "backups"), "Cannot create a directory here");
  assert.throws(() => context.writeDevotionals([{ id: "replacement" }]));
  assert.equal(fs.readFileSync(file, "utf8"), previous);
});
