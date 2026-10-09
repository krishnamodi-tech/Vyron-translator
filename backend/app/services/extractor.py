import io
from typing import Tuple, Dict, Any
from pypdf import PdfReader

class ExtractionError(Exception):
    pass

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
    """
    Extracts text from PDF bytes.
    Returns (extracted_text, metadata).
    Raises ExtractionError on invalid or corrupted files.
    """
    if not file_bytes:
        raise ExtractionError("The uploaded PDF file is empty (0 bytes).")

    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        num_pages = len(reader.pages)
        if num_pages == 0:
            raise ExtractionError("The uploaded PDF contains no pages.")

        extracted_pages = []
        is_scanned_likely = True

        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text_clean = text.strip()
            if len(text_clean) > 20:
                is_scanned_likely = False
            extracted_pages.append(f"--- Page {idx + 1} ---\n{text_clean}")

        full_text = "\n\n".join(extracted_pages).strip()

        metadata = {
            "page_count": num_pages,
            "character_count": len(full_text),
            "is_scanned_likely": is_scanned_likely,
            "source_type": "pdf"
        }

        if is_scanned_likely and len(full_text) < 50:
            metadata["warning"] = "This PDF appears to be a scanned image without a selectable text layer. Client-side OCR fallback recommended."

        return full_text, metadata

    except Exception as e:
        if isinstance(e, ExtractionError):
            raise
        raise ExtractionError(f"Could not parse PDF document: {str(e)}")

def validate_text_input(text: str) -> str:
    """Validates raw text input."""
    clean = text.strip()
    if not clean:
        raise ExtractionError("No input text provided.")
    if len(clean) < 5:
        raise ExtractionError("Input text is too short to extract meaningful information (minimum 5 characters).")
    return clean
