const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
function loadFunction(name, context) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, "m"));
  assert.ok(start >= 0);
  const next = source.slice(start + 1).search(/^(?:async )?function /m);
  vm.runInContext(source.slice(start, start + 1 + next), context);
}

test("PDF uses editor text and prepared images without saving the lesson", async () => {
  const lessons = [{ id: "lesson-one", createdAt: "2026-01-01", title: "Saved title" }];
  let imagesReady = false;
  const context = vm.createContext({
    state: { lessons }, crypto: { randomUUID: () => "draft" },
    syncAllRichTextEditors() {}, waitForLessonImages: async () => { imagesReady = true; },
    normalizeAgeLabel: (value) => value, SECTIONS: [["bibleLesson"]],
    $: () => ({ value: "Current editor content" }),
    els: {
      form: { reportValidity: () => true }, lessonId: { value: "lesson-one" },
      title: { value: "Edited title" }, category: { value: "Faith" },
      age: { value: "3 a 4 anos - Maternal" }, verse: { value: "Verse" },
      cardImagePreview: { dataset: { image: "new-cover" } },
      activityImagePreview: { dataset: { image: "new-activity" } }
    }
  });
  loadFunction("lessonFromEditor", context);
  const lesson = await context.lessonFromEditor();
  assert.equal(imagesReady, true);
  assert.equal(lesson.title, "Edited title");
  assert.equal(lesson.sections.bibleLesson, "Current editor content");
  assert.equal(lesson.activityImage, "new-activity");
  assert.equal(lessons[0].title, "Saved title");
});

test("lesson and devotional exports use the existing print pipeline", async () => {
  for (const type of ["lesson", "devotional"]) {
    let printed = false;
    let exported;
    const item = { title: "Draft content", sections: { devotional: "Family content" } };
    const context = vm.createContext({
      canExportPdf: () => true, getActiveLesson: () => { throw new Error("Wrong source"); },
      els: { ebookPrintArea: { innerHTML: "" } },
      buildPrintEbookHtml: (items) => { exported = items[0]; return "lesson-print"; },
      buildPrintContentHtml: (contentType, value) => { assert.equal(contentType, "devotional"); exported = value; return "devotional-print"; },
      document: { body: { classList: { add() {}, remove() {} } } },
      waitForEbookLayout: async () => {},
      window: { addEventListener() {}, removeEventListener() {}, print: () => { printed = true; } }
    });
    const name = type === "lesson" ? "printCurrentLesson" : "printContentPdf";
    loadFunction(name, context);
    if (type === "lesson") await context[name](item);
    else await context[name](type, item);
    assert.equal(exported, item);
    assert.equal(printed, true);
  }
});
