import requests
from typing import Dict, Any, List

# Supported Language Name Mapping
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "bn": "Bengali (বাংলা)",
    "te": "Telugu (తెలుగు)",
    "mr": "Marathi (मराठी)",
    "ta": "Tamil (தமிழ்)",
    "gu": "Gujarati (ગુજરાતી)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "as": "Assamese (অসমীয়া)",
    "ur": "Urdu (اردو)",
    "es": "Spanish (Español)",
    "fr": "French (Français)",
    "de": "German (Deutsch)",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}

def chunk_text(text: str, max_chars: int = 2000) -> List[str]:
    """Splits text into paragraph-preserving chunks to avoid API size limits."""
    if len(text) <= max_chars:
        return [text]

    paragraphs = text.split("\n")
    chunks = []
    current = []
    current_len = 0

    for p in paragraphs:
        if current_len + len(p) + 1 > max_chars and current:
            chunks.append("\n".join(current))
            current = [p]
            current_len = len(p)
        else:
            current.append(p)
            current_len += len(p) + 1

    if current:
        chunks.append("\n".join(current))

    return chunks

def translate_single_chunk(chunk: str, target_lang: str) -> str:
    """Translates a single chunk using dict-chrome-ex, with fallback to MyMemory."""
    if not chunk.strip():
        return ""
    if target_lang == "en":
        # If target is English and source is likely English, return directly
        return chunk

    # Primary: Google Translation Endpoint with Chrome Extension client identifier
    try:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "dict-chrome-ex",
            "sl": "auto",
            "tl": target_lang,
            "dt": "t",
            "q": chunk
        }
        res = requests.get(url, params=params, headers=HEADERS, timeout=8)
        if res.status_code == 200:
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0 and data[0]:
                translated = "".join([segment[0] for segment in data[0] if segment and segment[0]])
                if translated.strip():
                    return translated
    except Exception:
        pass

    # Secondary Fallback: MyMemory API
    try:
        url = "https://api.mymemory.translated.net/get"
        params = {
            "q": chunk[:500],
            "langpair": f"en|{target_lang}"
        }
        res = requests.get(url, params=params, headers=HEADERS, timeout=8)
        if res.status_code == 200:
            data = res.json()
            t = data.get("responseData", {}).get("translatedText", "")
            if t and not t.startswith("MYMEMORY WARNING"):
                return t
    except Exception:
        pass

    return chunk

def translate_via_google_endpoint(text: str, target_lang: str) -> Dict[str, Any]:
    """
    Translates text in chunks and preserves document formatting.
    """
    if target_lang == "en":
        return {
            "translated_text": text,
            "detected_source_lang": "en",
            "target_lang": "en"
        }

    chunks = chunk_text(text, max_chars=1800)
    translated_parts = []

    for chunk in chunks:
        tr = translate_single_chunk(chunk, target_lang)
        translated_parts.append(tr)

    full_translated = "\n".join(translated_parts)
    return {
        "translated_text": full_translated,
        "detected_source_lang": "auto",
        "target_lang": target_lang
    }
