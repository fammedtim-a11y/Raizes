const fs = require("fs");
const path = require("path");

const files = [
  "index.html",
  "gerenciamento.html",
  "app.js",
  "lessons-data.js"
];

const cp1252 = new Map([
  ["€", 0x80], ["‚", 0x82], ["ƒ", 0x83], ["„", 0x84], ["…", 0x85],
  ["†", 0x86], ["‡", 0x87], ["ˆ", 0x88], ["‰", 0x89], ["Š", 0x8a],
  ["‹", 0x8b], ["Œ", 0x8c], ["Ž", 0x8e], ["‘", 0x91], ["’", 0x92],
  ["“", 0x93], ["”", 0x94], ["•", 0x95], ["–", 0x96], ["—", 0x97],
  ["˜", 0x98], ["™", 0x99], ["š", 0x9a], ["›", 0x9b], ["œ", 0x9c],
  ["ž", 0x9e], ["Ÿ", 0x9f]
]);

function encodeWindows1252(value) {
  const bytes = [];
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code <= 0xff) {
      bytes.push(code);
    } else if (cp1252.has(char)) {
      bytes.push(cp1252.get(char));
    } else {
      return null;
    }
  }
  return Buffer.from(bytes);
}

function repairLine(line) {
  if (!/[ÃÂâð]/.test(line)) return line;
  const bytes = encodeWindows1252(line);
  if (!bytes) return line;
  const fixed = bytes.toString("utf8");
  const replacementCount = (fixed.match(/\uFFFD/g) || []).length;
  return replacementCount ? line : fixed;
}

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;
  const original = fs.readFileSync(fullPath, "utf8");
  const repaired = original.split(/\r?\n/).map(repairLine).join("\n");
  if (repaired !== original) {
    fs.writeFileSync(fullPath, repaired, "utf8");
    console.log(`repaired ${file}`);
  }
}
