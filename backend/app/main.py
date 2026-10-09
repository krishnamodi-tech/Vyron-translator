import time
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import settings
from .services.extractor import extract_text_from_pdf, validate_text_input, ExtractionError
from .services.translator import translate_via_google_endpoint
from .services.ai_engine import VyronAIEngine

app = FastAPI(
    title="VYRON AI Explainer — Backend API",
    description="Multilingual Public Document Simplifier and Jargon Decoded Platform",
    version="2.0.0"
)

# CORS Middleware
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
if not origins or "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_engine = VyronAIEngine(
    api_key=settings.GEMINI_API_KEY,
    model=settings.GEMINI_MODEL
)

start_time = time.time()

# Request Models for JSON endpoints
class SimplifyMoreRequest(BaseModel):
    paragraph: str
    target_lang: str = "hi"

class ExplainTermRequest(BaseModel):
    term: str
    context: str = ""
    target_lang: str = "hi"

@app.get("/api/health")
async def health_check():
    """Returns real-time backend operational status, credentials presence, and engine mode."""
    return {
        "status": "online",
        "uptime_seconds": int(time.time() - start_time),
        "ai_engine_configured": ai_engine.is_configured,
        "active_model": settings.GEMINI_MODEL if ai_engine.is_configured else "None (Hybrid Fallback Mode)",
        "features": {
            "pdf_extraction": True,
            "multilingual_translation": True,
            "jargon_decoding": True,
            "audio_tts_support": True,
            "interactive_term_explainer": True
        },
        "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_MB
    }

@app.post("/api/process-document")
async def process_document(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    target_lang: str = Form("hi"),
    explanation_level: str = Form("standard")
):
    """
    Main multimodal pipeline endpoint:
    1. Ingests raw text or uploaded PDF.
    2. Extracts clean structured content.
    3. Translates into the selected language.
    4. Generates Simple Meaning (at requested level), Jargon Decoded, and Action Items.
    """
    extracted_text = ""
    metadata = {"source": "text_input"}

    # Handle File Upload
    if file:
        file_bytes = await file.read()
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        content_type = file.content_type or ""
        filename = (file.filename or "").lower()

        if "pdf" in content_type or filename.endswith(".pdf"):
            try:
                extracted_text, metadata = extract_text_from_pdf(file_bytes)
            except ExtractionError as e:
                raise HTTPException(status_code=400, detail=str(e))
        elif any(img_type in content_type for img_type in ["image", "jpeg", "jpg", "png", "webp"]):
            # For images: if client provided extracted text (from Tesseract.js), use it.
            if text and text.strip():
                extracted_text = text.strip()
                metadata = {"source": "image_client_ocr", "filename": file.filename}
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Image received. Client-side OCR (Tesseract.js) or textual content required for this image."
                )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format ({content_type}). Please upload a PDF or Image (JPG, PNG)."
            )
    elif text:
        try:
            extracted_text = validate_text_input(text)
            metadata = {"source": "manual_text"}
        except ExtractionError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(
            status_code=400,
            detail="No document text or file provided. Please paste text or upload a document."
        )

    # Step 2: Full Literal Translation (for the side-by-side / raw translated view)
    literal_translation = translate_via_google_endpoint(extracted_text[:4000], target_lang)

    # Step 3: AI Intelligence Engine (Simplification, Jargon Extraction, Action Items)
    analysis = ai_engine.analyze_document(
        document_text=extracted_text,
        target_lang=target_lang,
        level=explanation_level
    )

    # Assemble complete unified response
    return {
        "status": "success",
        "metadata": metadata,
        "original_text": extracted_text,
        "literal_translated_text": literal_translation["translated_text"],
        "target_lang": target_lang,
        "analysis": analysis
    }

@app.post("/api/simplify-more")
async def simplify_more(req: SimplifyMoreRequest):
    """Re-simplifies a confusing paragraph further using everyday analogies."""
    if not req.paragraph.strip():
        raise HTTPException(status_code=400, detail="Paragraph text required.")
    result = ai_engine.simplify_more(req.paragraph, req.target_lang)
    return result

@app.post("/api/explain-term")
async def explain_term(req: ExplainTermRequest):
    """Provides an on-demand contextual explanation for a highlighted word or phrase."""
    if not req.term.strip():
        raise HTTPException(status_code=400, detail="Term required.")
    result = ai_engine.explain_single_term(req.term, req.context, req.target_lang)
    return result
