const fs = require("node:fs/promises");
const path = require("node:path");
const { parseDocument } = require("htmlparser2");
const sharp = require("sharp");
const PdfPrinter = require("pdfmake");
const vfs = require("pdfmake/build/vfs_fonts");
const { Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer, AlignmentType, PageNumber, HeadingLevel, LevelFormat } = require("docx");

const FIELDS = {
  lesson: [["objectives", "Objetivos da lição"], ["welcome", "Recepção e acolhimento"], ["icebreaker", "Quebra-gelo"], ["openingPrayer", "Oração inicial"], ["worshipOffering", "Louvor e oferta"], ["bibleLesson", "Lição bíblica"], ["practice", "Aplicação prática"], ["memoryVerse", "Memorização do versículo"], ["activity", "Atividade"], ["finalPrayer", "Oração final"], ["snack", "Lanche"]],
  devotional: [["devotional", "Culto em Família"], ["conversation", "Conversem"], ["prayer", "Oração"], ["weeklyPractice", "Vivam durante a semana"], ["parentNotes", "Orientações aos pais"], ["activity", "Vamos brincar?"]]
};

function richBlocks(value) {
  let html = String(value || "");
  for (let depth = 0; depth < 3 && /&(?:lt|gt|amp|quot|apos|#\d+|#x[0-9a-f]+);/i.test(html); depth++) {
    html = html.replace(/&(?:lt|gt|amp|quot|apos|#\d+|#x[0-9a-f]+);/gi, (entity) => parseDocument(entity, { decodeEntities: true }).children[0]?.data || entity);
  }
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    const decoded = parseDocument(html, { decodeEntities: true }).children.map((node) => node.data || "").join("");
    return decoded.split(/\n\s*\n/).map((text) => ({ runs: [{ text: text.trim() }] })).filter((b) => b.runs[0].text);
  }
  const root = parseDocument(html, { decodeEntities: true });
  const result = [];
  let runs = [];
  let list = null;
  let listSequence = 0;
  const flush = () => {
    if (runs.some((r) => r.text.trim())) result.push({ runs, list });
    runs = [];
  };
  function walk(nodes, marks = {}, depth = 0) {
    if (depth > 60) return;
    for (const node of nodes || []) {
      if (node.type === "text") {
        const text = node.data.replace(/\s+/g, " ");
        if (text.trim() || runs.length) runs.push({ ...marks, text });
        continue;
      }
      const tag = node.name;
      if (["script", "style", "iframe", "object", "svg"].includes(tag)) continue;
      if (tag === "br") { runs.push({ ...marks, text: "\n" }); continue; }
      if (tag === "ul" || tag === "ol") {
        flush();
        const previous = list;
        const group = ++listSequence;
        let number = 0;
        for (const child of node.children || []) {
          if (child.name !== "li") continue;
          list = { ordered: tag === "ol", number: ++number, group };
          walk(child.children, marks, depth + 1);
          flush();
        }
        list = previous;
        continue;
      }
      const block = ["p", "div", "li", "h1", "h2", "h3", "h4", "blockquote", "tr"].includes(tag);
      if (block) flush();
      const next = { ...marks };
      if (["b", "strong"].includes(tag) || /font-weight\s*:\s*(bold|[6-9]00)/i.test(node.attribs?.style || "")) next.bold = true;
      if (["i", "em"].includes(tag)) next.italics = true;
      if (tag === "u") next.underline = true;
      walk(node.children, next, depth + 1);
      if (block) flush();
    }
  }
  walk(root.children);
  flush();
  return result;
}

function plainText(value) { return richBlocks(value).map((b) => b.runs.map((r) => r.text).join("")).join(" ").trim(); }

// Only read registered local images. Never fetch arbitrary URLs from export input.
async function readImage(source, { root, uploadDir }) {
  if (!source) return null;
  let data;
  if (/^data:image\/(png|jpeg|webp);base64,/i.test(source)) {
    data = Buffer.from(source.split(",")[1], "base64");
    if (data.length > 8 * 1024 * 1024) throw new Error("Imagem muito grande para exportar.");
  } else {
    const base = source.startsWith("/uploads/") ? uploadDir : source.startsWith("assets/") || source.startsWith("/assets/") ? path.join(root, "assets") : null;
    if (!base) return null;
    const relative = source.replace(/^\/?(?:uploads|assets)\//, "");
    const target = path.resolve(base, relative);
    if (!target.startsWith(path.resolve(base) + path.sep)) throw new Error("Caminho de imagem inválido.");
    data = await fs.readFile(target);
  }
  const jpeg = await sharp(data, { limitInputPixels: 40000000 }).rotate().resize({ width: 1200, height: 1500, fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 84 }).toBuffer();
  const metadata = await sharp(jpeg).metadata();
  return { data: jpeg, width: metadata.width, height: metadata.height };
}

async function prepareExport(type, items, options) {
  if (!FIELDS[type] || !items.length || items.length > 150) throw new Error("Escolha entre 1 e 150 conteúdos para exportar.");
  const cache = new Map();
  const image = (src) => {
    if (!cache.has(src)) cache.set(src, readImage(src, options));
    return cache.get(src);
  };
  const prepared = [];
  for (const item of items) {
    const sections = [];
    for (const [key, label] of [["principle", "Princípio"], ["bibleText", "Texto bíblico"], ...FIELDS[type]]) {
      const value = key in (item.sections || {}) ? item.sections[key] : item[key];
      const blocks = richBlocks(value);
      if (blocks.length) sections.push({ label, blocks });
    }
    prepared.push({ title: plainText(item.title), meta: [plainText(item.category), plainText(item.age || item.season)].filter(Boolean).join(" · "), verse: plainText(item.verse), sections, card: items.length === 1 ? await image(item.cardImage) : null, activity: await image(item.activityImage) });
  }
  return { items: prepared, logo: await image("assets/logo-raizes-kids.png"), info: options.info || {}, type };
}

function pdfText(text) { return String(text || "").replace(/[\p{Extended_Pictographic}\uFE0F]/gu, ""); }
function footerText(info) { return `${info.contactEmail || "administrador@raizeskids.com"} | ${info.whatsapp || "31975466907"} | ${info.instagram || "@raizeskids_"}`; }

async function makePdf(model) {
  const font = (name) => Buffer.from(vfs[name], "base64");
  const printer = new PdfPrinter({ Roboto: { normal: font("Roboto-Regular.ttf"), bold: font("Roboto-Medium.ttf"), italics: font("Roboto-Italic.ttf"), bolditalics: font("Roboto-MediumItalic.ttf") } });
  const images = {};
  const imageRefs = new Map();
  const dataImage = (img) => {
    if (!imageRefs.has(img)) {
      const key = `image${imageRefs.size}`;
      images[key] = `data:image/jpeg;base64,${img.data.toString("base64")}`;
      imageRefs.set(img, key);
    }
    return imageRefs.get(img);
  };
  const content = [];
  if (model.logo) content.push({ image: dataImage(model.logo), fit: [180, 180], alignment: "center", margin: [0, 35, 0, 20] });
  content.push({ text: model.items.length === 1 ? pdfText(model.items[0].title) : model.type === "lesson" ? "Lições Bíblicas" : "Cultos em Família", style: "cover" });
  content.push({ text: "Raízes Kids", alignment: "center", margin: [0, 20, 0, 12], color: "#19547b" });
  if (model.items.length === 1 && model.items[0].card) content.push({ image: dataImage(model.items[0].card), fit: [360, 200], alignment: "center", margin: [0, 10, 0, 16] });
  content.push({ text: model.items.length === 1 ? pdfText(model.items[0].meta) : `${model.items.length} conteúdos`, alignment: "center" });
  content.push({ text: "Material de apoio para o Ministério com Crianças", alignment: "center", fontSize: 10, margin: [0, 18, 0, 0] });
  for (const item of model.items) {
    content.push({ text: pdfText(item.title), style: "title", pageBreak: "before" });
    if (item.meta) content.push({ text: pdfText(item.meta), fontSize: 10, color: "#496176", margin: [0, 0, 0, 8] });
    if (item.verse) content.push({ text: pdfText(item.verse), italics: true, margin: [0, 0, 0, 10] });
    for (const section of item.sections) {
      content.push({ text: section.label, style: "heading", headlineLevel: 1 });
      for (const block of section.blocks) {
        const text = block.runs.map((run) => ({ text: pdfText(run.text), bold: run.bold, italics: run.italics, decoration: run.underline ? "underline" : undefined }));
        if (block.list) text.unshift({ text: block.list.ordered ? `${block.list.number}. ` : "• " });
        content.push({ text, alignment: "justify", margin: [block.list ? 12 : 0, 0, 0, 0] });
      }
    }
    if (item.activity) content.push({ stack: [{ text: "Atividade", style: "heading" }, { image: dataImage(item.activity), fit: [540, 590], alignment: "center" }], unbreakable: true });
  }
  const doc = printer.createPdfKitDocument({
    pageSize: "A4", pageMargins: [22.68, 58, 22.68, 58],
    defaultStyle: { font: "Roboto", fontSize: 12, lineHeight: 1 },
    styles: { cover: { fontSize: 26, bold: true, alignment: "center" }, title: { fontSize: 19, bold: true, color: "#19547b", margin: [0, 0, 0, 8] }, heading: { fontSize: 13, bold: true, color: "#19547b", margin: [0, 10, 0, 4] } },
    header: (page) => page === 1 ? null : { columns: [model.logo ? { image: dataImage(model.logo), fit: [36, 30], width: 44 } : { text: "", width: 44 }, { text: "Raízes Kids · Ministério com Crianças", fontSize: 9, margin: [0, 10, 0, 0] }], margin: [22.68, 12, 22.68, 0] },
    footer: (page, total) => page === 1 ? null : { text: `Raízes Kids · Direitos autorais protegidos pela CF art. 5º, XXVII e pela Lei nº 9.610/1998 (LDA)\n${footerText(model.info)}\n${page} / ${total}`, fontSize: 8, alignment: "center", margin: [22.68, 6, 22.68, 0] },
    pageBreakBefore: (node, following) => node.headlineLevel === 1 && following.length === 0,
    info: { title: model.items.length === 1 ? model.items[0].title : "Raízes Kids", author: "Raízes Kids" }, images, content
  });
  return new Promise((resolve, reject) => { const chunks = []; doc.on("data", (chunk) => chunks.push(chunk)); doc.on("error", reject); doc.on("end", () => resolve(Buffer.concat(chunks))); doc.end(); });
}

async function makeDocx(model) {
  const imageParagraph = (img, maxWidth, maxHeight) => {
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    return new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "jpg", data: img.data, transformation: { width: Math.round(img.width * ratio), height: Math.round(img.height * ratio) } })] });
  };
  const paragraphs = [];
  for (let index = 0; index < model.items.length; index++) {
    const item = model.items[index];
    paragraphs.push(new Paragraph({ text: item.title, heading: HeadingLevel.HEADING_1, pageBreakBefore: index > 0, keepNext: true }));
    if (item.meta) paragraphs.push(new Paragraph({ text: item.meta }));
    if (item.verse) paragraphs.push(new Paragraph({ children: [new TextRun({ text: item.verse, italics: true })] }));
    for (let sectionIndex = 0; sectionIndex < item.sections.length; sectionIndex++) {
      const section = item.sections[sectionIndex];
      paragraphs.push(new Paragraph({ text: section.label, heading: HeadingLevel.HEADING_2, keepNext: true }));
      for (const block of section.blocks) paragraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        numbering: block.list ? { reference: block.list.ordered ? "ordered" : "bullets", level: 0, instance: index * 100000 + sectionIndex * 1000 + block.list.group } : undefined,
        children: block.runs.flatMap((run) => run.text.split("\n").map((text, i) => new TextRun({ text, break: i ? 1 : undefined, bold: run.bold, italics: run.italics, underline: run.underline ? {} : undefined })))
      }));
    }
    if (item.activity) { paragraphs.push(new Paragraph({ text: "Atividade", heading: HeadingLevel.HEADING_2, keepNext: true })); paragraphs.push(imageParagraph(item.activity, 660, 730)); }
  }
  const cover = [];
  if (model.logo) cover.push(imageParagraph(model.logo, 210, 210));
  cover.push(new Paragraph({ text: model.items.length === 1 ? model.items[0].title : model.type === "lesson" ? "Lições Bíblicas" : "Cultos em Família", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
  cover.push(new Paragraph({ text: `Raízes Kids · ${model.items.length} conteúdo(s)`, alignment: AlignmentType.CENTER }));
  if (model.items.length === 1 && model.items[0].card) cover.push(imageParagraph(model.items[0].card, 480, 270));
  const margins = { top: 1150, right: 454, bottom: 1150, left: 454, header: 454, footer: 454 };
  const document = new Document({
    creator: "Raízes Kids", title: model.items[0].title,
    styles: { default: { document: { run: { font: "Arial", size: 24 }, paragraph: { spacing: { before: 0, after: 0, line: 240 } } } }, paragraphStyles: [
      { id: "Title", name: "Title", run: { font: "Arial", size: 48, bold: true, color: "000000" }, paragraph: { spacing: { before: 240, after: 240 } } },
      { id: "Heading1", name: "Heading 1", run: { font: "Arial", size: 36, bold: true, color: "19547B" }, paragraph: { spacing: { before: 0, after: 160 } } },
      { id: "Heading2", name: "Heading 2", run: { font: "Arial", size: 26, bold: true, color: "19547B" }, paragraph: { spacing: { before: 160, after: 80 } } }
    ] },
    numbering: { config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] },
      { reference: "ordered", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", start: 1, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] }
    ] },
    sections: [
      { properties: { page: { size: { width: 11906, height: 16838 }, margin: margins } }, children: cover },
      { properties: { page: { size: { width: 11906, height: 16838 }, margin: margins } },
        headers: { default: new Header({ children: [new Paragraph({ text: "Raízes Kids · Ministério com Crianças" })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${footerText(model.info)} · `, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], size: 16 })] })] }) }, children: paragraphs }
    ]
  });
  return Packer.toBuffer(document);
}

async function exportContent(type, items, format, options) {
  const model = await prepareExport(type, items, options);
  return format === "docx" ? makeDocx(model) : makePdf(model);
}

module.exports = { exportContent, richBlocks, plainText, readImage };
