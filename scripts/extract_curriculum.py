from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from docx import Document


SOURCE = Path(r"C:\Users\Dell Latitude\Downloads\CURRICULUM GENESIS  1 2 3.docx")
OUTPUT = Path(__file__).resolve().parents[1] / "lessons-data.js"

SECTION_KEYS = {
    "OBJETIVOS DA LICAO": "objectives",
    "RECEPCAO E ACOLHIMENTO": "welcome",
    "QUEBRA-GELO": "icebreaker",
    "ORACAO INICIAL": "openingPrayer",
    "LOUVOR E OFERTA": "worshipOffering",
    "LICAO BIBLICA": "bibleLesson",
    "APLICACAO PRATICA": "practice",
    "MEMORIZACAO DO VERSICULO": "memoryVerse",
    "MEMORIZACAO DE VERSICULO": "memoryVerse",
    "ATIVIDADE": "activity",
    "ORACAO FINAL": "finalPrayer",
    "LANCHE": "snack",
}

AGE_PATTERNS = [
    (re.compile(r"\b1\s*E\s*2\b", re.I), "1 e 2"),
    (re.compile(r"\b3\s*E\s*4\b", re.I), "3 e 4"),
    (re.compile(r"\b5\s*E\s*6\b", re.I), "5 e 6"),
    (re.compile(r"\b7\s*A\s*10\b", re.I), "7 a 10"),
]


def norm(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"\s+", " ", text)
    return text.strip().upper()


def clean(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = text.replace("“", '"').replace("”", '"')
    text = text.replace("‘", "'").replace("’", "'")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def display_title(text: str) -> str:
    text = clean(text).strip("!.")
    lowered = {"a", "as", "o", "os", "e", "em", "de", "da", "das", "do", "dos", "para", "por", "com", "no", "na"}
    words = []
    for index, word in enumerate(text.lower().split()):
        bare = re.sub(r"[^A-Za-zÀ-ÿ]", "", word)
        if bare == "deus":
            words.append(word.replace(bare, "Deus"))
        elif bare in {"jose", "josé"}:
            words.append(word.replace(bare, "José"))
        elif bare in {"jaco", "jacó"}:
            words.append(word.replace(bare, "Jacó"))
        elif index > 0 and bare in lowered:
            words.append(word)
        else:
            words.append(word[:1].upper() + word[1:])
    return " ".join(words)


def display_category(text: str) -> str:
    normalized = norm(text).strip(".")
    aliases = {
        "CRIACAO": "Criação",
        "MISSAO": "Missão",
        "MISSIONARIOS": "Missionários",
        "FE": "Fé",
        "GRATIDAO": "Gratidão",
        "BENCAO": "Bênção",
        "ALIanca": "Aliança",
    }
    return aliases.get(normalized, display_title(text))


def lesson_age(header: str) -> str:
    for pattern, age in AGE_PATTERNS:
        if pattern.search(header):
            return age
    return "3 e 4"


def header_extra(header: str) -> str:
    extra = re.sub(r"\b(1\s*E\s*2|3\s*E\s*4|5\s*E\s*6|7\s*A\s*10)\b", "", header, flags=re.I)
    extra = re.sub(r"\b(ANOS?|LI[CÇ][AÃ]O)\b", "", extra, flags=re.I)
    return display_title(extra)


def is_lesson_header(text: str) -> bool:
    if len(text) > 120:
        return False
    upper = norm(text)
    has_age = any(pattern.search(text) for pattern, _ in AGE_PATTERNS)
    return has_age and ("LICAO" in upper or upper in {"5 E 6 ANOS"})


def match_section(text: str) -> tuple[str | None, str]:
    upper = norm(text)
    for label, key in SECTION_KEYS.items():
        if upper.startswith(label):
            rest = clean(text[len(text) - len(text.lstrip()):])
            rest = re.sub(re.escape(text[:0]), "", rest)
            rest = clean(re.sub(rf"^{re.escape(text[: len(text)])}$", "", text))
            rest = clean(re.sub(r"^[^:]*?:", "", text)) if ":" in text[:35] else ""
            if upper != label:
                rest = clean(text[upper.find(label) + len(label):])
            return key, rest
    return None, ""


def split_lessons(paragraphs: list[str]) -> list[list[str]]:
    starts = [i for i, text in enumerate(paragraphs) if is_lesson_header(text)]
    chunks = []
    for index, start in enumerate(starts):
        end = starts[index + 1] if index + 1 < len(starts) else len(paragraphs)
        chunks.append(paragraphs[start:end])
    return chunks


def extract_field(lines: list[str], field: str) -> str:
    label = norm(field)
    for i, line in enumerate(lines):
        upper = norm(line)
        if upper.startswith(label):
            value = re.sub(r"^[^:]*:\s*", "", line).strip()
            if value:
                next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
                if field.lower().startswith("vers") and re.match(r"^[1-3]?\s?[A-Za-zÀ-ÿ]+\s+\d", next_line):
                    value = f"{value} {next_line}"
                return clean(value)
    return ""


def infer_title(header: str, objectives: str, bible: str) -> str:
    extra = header_extra(header)
    if extra:
        return extra

    first_objective_line = objectives.splitlines()[0] if objectives else ""
    objective_title = re.search(r"OBJETIVOS DA LI[CÇ][AÃ]O\s+(.+)", header, re.I)
    if objective_title:
        return clean(objective_title.group(1).title())

    text_base = re.search(r"TEXTO\s+B[IÍ]BLICO:\s*([^\n-]+)", objectives, re.I)
    if text_base:
        value = clean(text_base.group(1))
        if value and not re.search(r"^G[eê]nesis\s+\d", value, re.I):
            return display_title(value)

    principle = re.search(r"PRINC[IÍ]PIO:\s*([^\n.]+)", objectives, re.I)
    if principle:
        value = clean(principle.group(1))
        if "sonhos grandes" in norm(value).lower():
            return "O Menino Sonhador"
        return display_title(value)

    bible_base = re.search(r"Base b[ií]blica:\s*([^\n.]+)", bible, re.I)
    if bible_base:
        return display_title(bible_base.group(1))

    return display_title(first_objective_line or "Lição bíblica")


def infer_category(objectives: str, title: str) -> str:
    keyword = extract_field(objectives.splitlines(), "Palavra-chave")
    if keyword:
        return display_category(keyword)

    search = norm(f"{title}\n{objectives}")
    if "PECADO" in search or "CONFESSARMOS" in search:
        return "Pecado"
    if "CRIACAO" in search or "CRIOU" in search:
        return "Deus Pai"
    if "ALIANCA" in search or "FIEL" in search:
        return "Promessa"
    if "AMOR" in search or "AME A DEUS" in search:
        return "Fé"
    if "GRATIDAO" in search or "VALORIZAR" in search:
        return "Gratidão"
    if "SONHOS" in search or "TEMPO" in search:
        return "Promessa"
    return "Fé"


def extract_verse(objectives: str, memory: str) -> str:
    lines = objectives.splitlines()
    for field in ["Versículo para memorizar", "Versículo bíblico", "Versículo"]:
        value = extract_field(lines, field)
        if value:
            return value
    first_memory_line = memory.splitlines()[0] if memory else ""
    return clean(first_memory_line)


def parse_chunk(chunk: list[str], index: int) -> dict:
    header = clean(chunk[0])
    sections = {key: "" for key in SECTION_KEYS.values()}
    current = "objectives"
    title_hint = ""

    for raw in chunk[1:]:
        text = clean(raw)
        key, rest = match_section(text)
        if key:
            current = key
            if key == "objectives" and rest:
                title_hint = rest
                sections[current] = append(sections[current], rest)
            elif rest:
                sections[current] = append(sections[current], rest)
            continue
        sections[current] = append(sections[current], text)

    if title_hint:
        header = f"{header} {title_hint}"

    title = infer_title(header, sections["objectives"], sections["bibleLesson"])
    category = infer_category(sections["objectives"], title)
    verse = extract_verse(sections["objectives"], sections["memoryVerse"])

    return {
        "id": f"curriculum-genesis-{index:03d}",
        "title": title,
        "category": category,
        "age": lesson_age(header),
        "verse": verse,
        "sections": {key: value for key, value in sections.items() if value},
    }


def append(existing: str, text: str) -> str:
    text = clean(text)
    if not text:
        return existing
    return f"{existing}\n{text}".strip() if existing else text


def main() -> None:
    document = Document(SOURCE)
    paragraphs = [clean(p.text) for p in document.paragraphs if clean(p.text)]
    chunks = split_lessons(paragraphs)
    lessons = [parse_chunk(chunk, index + 1) for index, chunk in enumerate(chunks)]

    payload = json.dumps(lessons, ensure_ascii=False, indent=2)
    OUTPUT.write_text(
        "window.RAIZES_LESSONS_VERSION = \"curriculum-genesis-2026-06-24-v1\";\n"
        f"window.RAIZES_LESSONS_DATA = {payload};\n",
        encoding="utf-8",
    )
    print(f"Generated {len(lessons)} lessons at {OUTPUT}")
    by_age: dict[str, int] = {}
    for lesson in lessons:
        by_age[lesson["age"]] = by_age.get(lesson["age"], 0) + 1
    print(by_age)


if __name__ == "__main__":
    main()
