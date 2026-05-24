from pathlib import Path

import fitz
from docx import Document


def parse_file(file) -> str:
    suffix = Path(file.name).suffix.lower()
    if suffix == ".txt":
        return file.read().decode("utf-8")
    if suffix == ".docx":
        document = Document(file)
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    if suffix == ".pdf":
        content = []
        with fitz.open(stream=file.read(), filetype="pdf") as document:
            for page in document:
                content.append(page.get_text())
        return "\n".join(content)
    raise ValueError("Unsupported file type. Upload .txt, .docx, or .pdf.")

