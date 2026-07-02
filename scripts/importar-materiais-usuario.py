from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

import pdfplumber
from docx import Document


ROOT = Path(__file__).resolve().parents[1]
PAIS_DIR = Path(r"C:\Users\Dell Latitude\Downloads\Pais")
EBF_DIR = Path(r"C:\Users\Dell Latitude\Downloads\ebf")
ASSETS_EBF_DIR = ROOT / "assets" / "ebf"
OUTPUT = ROOT / "seed-imports.js"


def clean_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")


def pdf_text(path: Path) -> str:
    pages: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")
    return clean_text("\n".join(pages))


def docx_text(path: Path) -> str:
    document = Document(path)
    paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return clean_text("\n".join(paragraphs))


def age_from_name(name: str) -> str:
    normalized = name.upper()
    if "3 E 4" in normalized or "3 A 4" in normalized:
        return "3 a 4 anos - Maternal"
    if "5 E 6" in normalized or "5 A 6" in normalized:
        return "5 a 6 anos - Jardim"
    if "7 A 10" in normalized or "7 E 10" in normalized:
        return "7 a 10 anos - Primários"
    if "0 A 2" in normalized or "1 E 2" in normalized:
        return "0 a 2 anos - Berçário"
    if "11" in normalized and "12" in normalized:
        return "11 a 12 anos - Juniores"
    return "7 a 10 anos - Primários"


def lesson_title_from_name(name: str) -> str:
    stem = Path(name).stem
    if "DIA DOS PAIS" in stem.upper():
        return "Especial Dia dos Pais"
    stem = re.sub(r"\b\d+\s*(E|A)\s*\d+\s*ANOS\b", "", stem, flags=re.I)
    stem = re.sub(r"AGOSTO\s*2025", "", stem, flags=re.I)
    stem = re.sub(r"LI[ÇC][ÃA]O\s*\d+", "", stem, flags=re.I)
    stem = re.sub(r"CENTRAL\s*CRIAN[ÇC]A", "", stem, flags=re.I)
    return clean_text(stem.title()) or "Lição importada"


def first_matching(text: str, patterns: list[str], fallback: str = "") -> str:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.I | re.S)
        if match:
            return clean_text(match.group(1))
    return fallback


def build_lessons() -> list[dict]:
    lessons: list[dict] = []
    for pdf in sorted(PAIS_DIR.glob("*.pdf")):
        text = pdf_text(pdf)
        title = lesson_title_from_name(pdf.name)
        age = age_from_name(pdf.name)
        verse = first_matching(
            text,
            [
                r"Vers[íi]culo(?:\s+b[íi]blico)?[:\s]+(.{20,220}?)(?:\n[A-ZÁÉÍÓÚÃÕÇ ]{4,}:|\n\n)",
                r"Texto\s*b[íi]blico[:\s]+(.{20,180}?)(?:\n[A-ZÁÉÍÓÚÃÕÇ ]{4,}:|\n\n)",
            ],
            "Honra teu pai e tua mãe.",
        )
        objective = first_matching(
            text,
            [r"Princ[íi]pio[:\s]+(.{10,160}?)(?:\n|Palavra-chave|Vers[íi]culo)"],
            "Valorizar e honrar a família como presente de Deus.",
        )
        lesson_id = f"pais-2025-dia-dos-pais-{slugify(age)}"
        lessons.append(
            {
                "id": lesson_id,
                "title": title,
                "category": "Dia dos Pais",
                "age": age,
                "verse": verse,
                "createdAt": "2026-07-02T00:00:00.000Z",
                "source": "pais-import-20260702",
                "testOnly": True,
                "cardImage": "",
                "activityImage": "",
                "sections": {
                    "objectives": objective,
                    "welcome": "Receba as crianças com alegria e apresente o tema especial do Dia dos Pais.",
                    "icebreaker": "",
                    "openingPrayer": "Ore agradecendo a Deus pela família e pedindo um coração ensinável.",
                    "worshipOffering": "",
                    "bibleLesson": text,
                    "practice": "",
                    "memoryVerse": verse,
                    "activity": "",
                    "finalPrayer": "Ore para que cada criança pratique honra, gratidão e amor dentro de casa.",
                    "snack": "",
                },
                "seedManaged": True,
            }
        )
    return lessons


def build_ebfs() -> list[dict]:
    ebfs: list[dict] = []
    for docx in sorted(EBF_DIR.glob("*.docx")):
        text = docx_text(docx)
        asset_name = f"{slugify(docx.stem)}.docx"
        ASSETS_EBF_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(docx, ASSETS_EBF_DIR / asset_name)
        ebfs.append(
            {
                "id": slugify(docx.stem),
                "title": "EBF 2026 - Conta pra Todo Mundo!",
                "category": "EBF Completa",
                "season": "EBF 2026",
                "createdAt": "2026-07-02T00:00:00.000Z",
                "description": "Material completo para Escola Bíblica de Férias.",
                "cardImage": "",
                "activityImage": "",
                "attachments": [
                    {
                        "name": docx.name,
                        "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "url": f"/assets/ebf/{asset_name}",
                    }
                ],
                "sections": {
                    "content": text,
                    "schedule": "",
                    "notes": "Material importado do arquivo original informado para alimentar a aba EBF.",
                },
                "seedManaged": True,
            }
        )
    return ebfs


def main() -> None:
    imported_lessons = build_lessons()
    seeded_ebfs = build_ebfs()
    payload = (
        "// Materiais importados das pastas locais indicadas pelo administrador.\n"
        "// O servidor mescla estes itens pelo id sem apagar edicoes feitas no gerenciamento.\n\n"
        f"const importedLessons = {json.dumps(imported_lessons, ensure_ascii=False, indent=2)};\n\n"
        f"const seededEbfs = {json.dumps(seeded_ebfs, ensure_ascii=False, indent=2)};\n\n"
        "module.exports = { importedLessons, seededEbfs };\n"
    )
    OUTPUT.write_text(payload, encoding="utf-8")
    print(f"Gerado {OUTPUT} com {len(imported_lessons)} licoes e {len(seeded_ebfs)} EBF.")


if __name__ == "__main__":
    main()
