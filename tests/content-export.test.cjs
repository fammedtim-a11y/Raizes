const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { richBlocks, plainText, readImage, exportContent } = require("../content-export");
const root = path.join(__dirname, "..");
const options = { root, uploadDir: path.join(root, "data/uploads") };

test("rich text keeps explicit breaks and emphasis without turning HTML whitespace into paragraphs", () => {
  const blocks = richBlocks('<p>Uma <strong>palavra</strong>\n importante.<br>Segunda linha.</p>\n<p><br></p><p>Fim.</p>');
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].runs.find((r) => r.bold).text, "palavra");
  assert.ok(blocks[0].runs.some((r) => r.text === "\n"));
});

test("lists and encoded verses export as clean text", () => {
  const blocks = richBlocks('<ul><li>Tempo</li><li>Corpo</li></ul><ol><li>Primeiro</li><li>Segundo</li></ol>');
  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].list.ordered, false);
  assert.equal(blocks[3].list.number, 2);
  assert.equal(plainText('&amp;lt;p&amp;gt;Deus é amor&amp;lt;/p&amp;gt;'), "Deus é amor");
  assert.equal(plainText('Deus &amp; amor&nbsp;'), "Deus & amor");
  assert.equal(plainText('<script>alert(1)</script><p>Seguro</p>'), "Seguro");
});

test("image input cannot read arbitrary files or make external network requests", async () => {
  assert.equal(await readImage("https://example.com/image.png", options), null);
  assert.equal(await readImage("file:///etc/passwd", options), null);
  await assert.rejects(readImage("/uploads/../../server.js", options), /inválido/);
});

test("PDF and DOCX exports generate real files for individual and batch content without mutating it", async () => {
  const items = [
    { id: "one", title: "Caráter", category: "Fé", verse: "Deus é amor.", sections: { devotional: "<p>Texto <b>importante</b>.</p><ul><li>Ouvir</li><li>Orar</li></ul>" } },
    { id: "two", title: "Culto em Família", sections: { devotional: "Outro encontro." } }
  ];
  const before = JSON.stringify(items);
  for (const format of ["pdf", "docx"]) {
    for (const selected of [[items[0]], items]) {
      const buffer = await exportContent("devotional", selected, format, options);
      assert.equal(buffer.subarray(0, format === "pdf" ? 4 : 2).toString(), format === "pdf" ? "%PDF" : "PK");
      assert.ok(buffer.length > 1000);
    }
  }
  assert.equal(JSON.stringify(items), before);
});
