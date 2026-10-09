"""
VYRON AI Explainer — Backend Server Entry Point
Run with: python main.py
"""
import sys
import os
from pathlib import Path

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

backend_path = Path(__file__).resolve().parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"[VYRON] Starting Backend Server on http://{settings.HOST}:{settings.PORT}")
    print(f"[VYRON] Gemini Key Status: {'CONFIGURED' if settings.has_gemini_key else 'UNCONFIGURED (Running in Hybrid Mode)'}")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)
