import json
import re
import sys
import unicodedata
from pathlib import Path

import pdfplumber
from docx import Document


MTO_PATH = Path(r"G:\Meu Drive\Ministerio com Crianças\2026\MTO 01 - final.docx")
CULTOS_DIR = Path(r"G:\Meu Drive\As pais Discipuladores")


def slugify(value):
    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text or "conteudo"


def clean(value):
    value = re.sub(r"[ \t]+", " ", value or "")
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def title_case(value):
    words = value.strip().split()
    small = {"de", "da", "do", "das", "dos", "e", "a", "o", "em", "ao"}
    result = []
    for index, word in enumerate(words):
        lower = word.lower()
        result.append(lower if index and lower in small else lower[:1].upper() + lower[1:])
    return " ".join(result)


def docx_blocks(path):
    doc = Document(path)
    paragraphs = []
    for paragraph in doc.paragraphs:
        text = clean(paragraph.text)
        if text:
            paragraphs.append((paragraph.style.name if paragraph.style else "", text))
    return paragraphs


def mto_section_text(paragraphs, start_title, stop_titles):
    collecting = False
    parts = []
    for style, text in paragraphs:
        if text == start_title:
            collecting = True
            continue
        if collecting and text in stop_titles:
            break
        if collecting:
            parts.append(text)
    return clean("\n".join(parts))


def extract_mto_trainings():
    paragraphs = docx_blocks(MTO_PATH)
    headings = [text for style, text in paragraphs if style.startswith("Heading 1") or style.startswith("Heading 2")]
    selected = [
        ("Fundamentos da proteção infantil", "APRESENTAÇÃO", "ASPECTOS E CONCEITOS"),
        ("Aspectos legais e conceitos de risco", "ASPECTOS E CONCEITOS", "PROCEDIMENTOS OPERACIONAIS PADRÃO (POP)"),
        ("Regra dos dois voluntários", "A REGRA DOS DOIS VOLUNTÁRIOS", "USO DE BANHEIROS E VESTIÁRIOS"),
        ("Uso de banheiros e vestiários", "USO DE BANHEIROS E VESTIÁRIOS", "PREVENÇÃO AO BULLYING E CYBERBULLYING"),
        ("Prevenção ao bullying e cyberbullying", "PREVENÇÃO AO BULLYING E CYBERBULLYING", "GERENCIAMENTO DE CRISES E INCIDENTES"),
        ("Gerenciamento de crises e incidentes", "GERENCIAMENTO DE CRISES E INCIDENTES", "SINAIS DE VULNERABILIDADE E HIGIENE PESSOAL"),
        ("Sinais de vulnerabilidade e higiene pessoal", "SINAIS DE VULNERABILIDADE E HIGIENE PESSOAL", "MANEJO DE LESÕES FÍSICAS E SUSPEITA DE AGRESSÃO"),
        ("Lesões físicas e suspeita de agressão", "MANEJO DE LESÕES FÍSICAS E SUSPEITA DE AGRESSÃO", "IDENTIFICAÇÃO DE NEGLIGÊNCIA E ABANDONO"),
        ("Negligência e abandono", "IDENTIFICAÇÃO DE NEGLIGÊNCIA E ABANDONO", "EXPOSIÇÃO A CONTEÚDOS IMPRÓPRIOS E PORNOGRAFIA"),
        ("Conteúdos impróprios e pornografia", "EXPOSIÇÃO A CONTEÚDOS IMPRÓPRIOS E PORNOGRAFIA", "INTERAÇÃO FÍSICA E LIMITES CORPORAIS (O SEMÁFORO DO TOQUE)"),
        ("Interação física e limites corporais", "INTERAÇÃO FÍSICA E LIMITES CORPORAIS (O SEMÁFORO DO TOQUE)", "FLUXO DE DENÚNCIA E RESPOSTA INSTITUCIONAL"),
        ("Escuta, denúncia e resposta institucional", "FLUXO DE DENÚNCIA E RESPOSTA INSTITUCIONAL", "ADEQUAÇÃO DO AMBIENTE E CAPACITAÇÃO CONTINUADA"),
        ("Ambiente seguro e capacitação continuada", "ADEQUAÇÃO DO AMBIENTE E CAPACITAÇÃO CONTINUADA", "ANEXO 1 – TERMO DE COMPROMISSO E ADESÃO AO MTO 01"),
    ]
    stop_titles = set(headings)
    trainings = []
    for index, (title, start, stop) in enumerate(selected, start=1):
        body = mto_section_text(paragraphs, start, {stop})
        body = body[:4200].strip()
        trainings.append({
            "id": f"mto-01-{index:02d}-{slugify(title)}",
            "title": title,
            "category": "Segurança ministerial",
            "season": "MTO 01/2026",
            "createdAt": "2026-06-29T00:00:00.000Z",
            "description": "Treinamento de proteção infantil e segurança do ministério.",
            "youtubeUrl": "",
            "cardImage": "",
            "activityImage": "",
            "attachments": [],
            "sections": {
                "content": body,
                "notes": "Conteúdo importado do Manual Técnico Operacional nº 01/2026. Material de uso interno para líderes autorizados; revise os procedimentos com a liderança antes de aplicar em casos sensíveis."
            }
        })
    return trainings


def pdf_text(path):
    pages = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            if text.strip():
                pages.append(text)
    return clean("\n".join(pages))


def label_value_lines(lines, labels, max_continuation=0, stop_patterns=None):
    stop_patterns = stop_patterns or []
    for index, line in enumerate(lines):
        for label in labels:
            match = re.search(label + r"\s*:?\s*(.*)$", line, re.I)
            if not match:
                continue
            parts = [match.group(1).strip()]
            cursor = index + 1
            while cursor < len(lines) and len(parts) <= max_continuation:
                next_line = lines[cursor].strip()
                if any(re.search(pattern, next_line, re.I) for pattern in stop_patterns):
                    break
                if re.search(r"^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ\s-]{3,}:?$", next_line):
                    break
                parts.append(next_line)
                cursor += 1
            return clean(" ".join(part for part in parts if part))
    return ""


def verse_from_lines(lines):
    labels = [r"VERS[IÍ]CULO(?:\s+B[IÍ]BLICO)?", r"VERS[IÍ]CULO\s+PARA\s+MEMORIZAR"]
    references = r"(G[eê]nesis|Gn|Romanos|Rm|Jo[aã]o|Prov[eé]rbios|Pv|Salmos|Sl|Mateus|Mt|Lucas|Lc|Marcos|Mc|Ef[eé]sios|Filipenses|Fp|1\s*Jo[aã]o|2\s*Jo[aã]o|Tiago|Tg)\s*\d+[:.]\d+"
    for index, line in enumerate(lines):
        if not any(re.search(label + r"\s*:?", line, re.I) for label in labels):
            continue
        first = re.sub(r"^.*?VERS[IÍ]CULO(?:\s+B[IÍ]BLICO|\s+PARA\s+MEMORIZAR)?\s*:?\s*", "", line, flags=re.I).strip()
        parts = [first] if first else []
        for next_line in lines[index + 1:index + 5]:
            if re.search(r"^(Filho|Hoje|Você|Voce|Sabe|ANTES|VAMOS|TEXTO|PRINC[IÍ]PIO)\b", next_line, re.I):
                break
            parts.append(next_line.strip())
            if re.search(references, " ".join(parts), re.I):
                break
        return clean(" ".join(parts))
    return ""


def text_after_heading(text, headings):
    positions = []
    for heading in headings:
        match = re.search(rf"\n?{heading}\s*:?\s*", text, re.I)
        if match:
            positions.append(match.end())
    if not positions:
        return ""
    start = min(positions)
    return clean(text[start:])


def first_matching_line(text, patterns):
    for line in [clean(item) for item in text.splitlines() if clean(item)]:
        for pattern in patterns:
            if re.search(pattern, line, re.I):
                return line
    return ""


def extract_cultos():
    devotionals = []
    for path in sorted(CULTOS_DIR.glob("PAIS DICIPULADORES - CULTO FAMÍLIA SEMANA *.pdf"), key=lambda p: int(re.search(r"SEMANA\s+(\d+)", p.name, re.I).group(1))):
        week = int(re.search(r"SEMANA\s+(\d+)", path.name, re.I).group(1))
        text = pdf_text(path)
        lines = [clean(item) for item in text.splitlines() if clean(item)]
        title = f"Culto em Família - Semana {week}"
        principle = label_value_lines(lines, [r"PRINC[IÍ]PIO", r"PRINC[IÍ]PIO DO DIA"], stop_patterns=[r"PALAVRA", r"TEXTO", r"VERS"])
        verse = verse_from_lines(lines)
        bible = label_value_lines(lines, [r"TEXTO B[IÍ]BLICO", r"LEITURA B[IÍ]BLICA"], max_continuation=2, stop_patterns=[r"VERS[IÍ]CULO", r"PRINC[IÍ]PIO"])
        prayer = text_after_heading(text, [r"ANTES DE BRINCAR VAMOS ORAR", r"ORA[CÇ][AÃ]O", r"Ora[cç][aã]o"])
        prayer = re.split(r"\n(?:DURANTE A SEMANA|VAMOS BRINCAR|ATIVIDADE)\b", prayer, maxsplit=1, flags=re.I)[0]
        activity = text_after_heading(text, [r"VAMOS BRINCAR\?", r"DURANTE A SEMANA", r"ATIVIDADE"])
        if not principle:
            principle = first_matching_line(text, [r"vou ", r"vamos ", r"deus "])
        if not verse:
            verse = first_matching_line(text, [r"\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+\s+\d+[:.]\d+", r"\bRm\s+\d+[:.]\d+", r"\bGn\s+\d+[:.]\d+"])
        body = text
        if len(body) > 4300:
            body = body[:4300].rsplit("\n", 1)[0]
        devotionals.append({
            "id": f"culto-familia-semana-{week}",
            "title": title,
            "category": "Família",
            "season": f"Semana {week}",
            "createdAt": "2026-06-29T00:00:00.000Z",
            "verse": verse[:450],
            "principle": principle[:280],
            "bibleText": bible[:220],
            "cardImage": "",
            "activityImage": "",
            "sections": {
                "devotional": clean(body),
                "prayer": prayer[:1600],
                "activity": activity[:1800]
            }
        })
    return devotionals


if __name__ == "__main__":
    result = {
        "trainings": extract_mto_trainings(),
        "devotionals": extract_cultos(),
    }
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False, indent=2).encode("utf-8"))
