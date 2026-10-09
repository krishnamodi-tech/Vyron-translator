# 🚀 VYRON AI Explainer — Intelligent Multilingual Document Simplifier

![VYRON Logo](logo.jpg)

**VYRON AI Explainer** is a multimodal public service platform designed to empower citizens with varying digital and legal literacy. Rather than simply substituting words literally (like standard translation tools), VYRON decomposes complex official notices, letters, circulars, and government schemes into:
1. **Plain-Language Explanations** (at Layman, Standard, or Legal detail levels).
2. **Actionable Citizen Summaries** (Deadlines, Required Documents, Fees, and Warnings).
3. **Contextual Jargon Dictionaries** (Official terms decoded with everyday real-world analogies).
4. **Resonant Acoustic Voice Output** (Deep-frequency, deliberate J.A.R.V.I.S. voice tuning).

---

## 🏗️ Project Architecture & File Structure

```text
vyron_translator/
├── index.html                  # Upgraded UI with 3D perspective, input tabs & dashboard
├── logo.jpg                    # High-resolution 3D liquid glass VYRON emblem
├── main.py                     # Root runner entry point for the FastAPI server
├── .env.example                # Configuration template with placeholder credentials
├── .gitignore                  # Prevents accidental credential/log leakage
├── css/
│   └── style.css               # Futuristic cyberpunk glassmorphism, 3D tilt & animations
├── js/
│   └── app.js                  # Frontend orchestrator: WebRTC, PDF.js, Tesseract & API hooks
├── backend/
│   ├── run.py                  # Direct runner script (python backend/run.py)
│   ├── requirements.txt        # Production Python dependencies
│   ├── .env.example            # Backend-specific environment template
│   └── app/
│       ├── __init__.py
│       ├── config.py           # Environment loader & credential validator
│       ├── main.py             # FastAPI ASGI server with CORS, health & process endpoints
│       └── services/
│           ├── __init__.py
│           ├── extractor.py    # Robust PDF extraction (pypdf) & character validation
│           ├── translator.py   # Text chunking & multi-lingual translation engine
│           └── ai_engine.py    # Google Gemini 1.5 Flash client + Grounded fallback engine
└── strategy.html               # Hackathon Command Center & Pitch Strategy Dashboard
```

---

## ⚡ Key Features Implemented

| Feature | Implementation | Credential Requirement |
| :--- | :--- | :--- |
| **Multimodal Ingestion** | 4 Tabs: Direct Text, PDF Upload (Drag-and-Drop), Image Upload, Live Camera (WebRTC) | ❌ None (Local APIs & Browser Sensor) |
| **Document Text Extraction** | Client `PDF.js v3.11` & Server `pypdf v6.19` with page-count analytics | ❌ None (Zero-cost client/server parsing) |
| **In-Browser OCR** | `Tesseract.js v5` WASM Worker for scanned letters and webcam captures | ❌ None (Runs locally on device) |
| **Multilingual Translation** | Preserves numbers, dates, legal sections across 16+ Indian & International languages | ❌ None (Direct translation endpoint) |
| **3-Level Explanation** | Layman (5th-grader), Standard (Civic), Detailed (Clause-by-clause legal analysis) | 🔑 Optional (Enhanced with Gemini 1.5) |
| **Jargon Decoded Matrix** | Contextual definitions, source sentence references, and real-world analogies | 🔑 Optional (Heuristic fallback active) |
| **What You Need To Do** | Explicit action checklist, deadlines, fees, eligibility, and penalties | 🔑 Optional (Grounded rule-based fallback active) |
| **Interactive Term Explainer** | On-demand decoding for custom words or highlighted phrases | 🔑 Optional (Enhanced with Gemini 1.5) |
| **Acoustic J.A.R.V.I.S. Audio** | Web Speech API tuned with deep pitch (`0.1`) and deliberate cadence (`0.85x`) | ❌ None (Runs on-device via Web Speech API) |
| **Transparent Status Indicator**| Real-time connection badge informing judges whether AI Cloud or Hybrid Mode is active | ❌ None (Real-time telemetry) |

---

## 🛠️ Installation & Local Setup

### 1. Prerequisites
- Python 3.10+ installed
- Modern web browser (Chrome, Edge, Firefox, or Safari)

### 2. Backend Installation
Open your terminal in the `vyron_translator` directory and run:

```bash
# Install required backend dependencies
python -m pip install -r backend/requirements.txt
```

### 3. Environment Configuration
Copy the configuration template:
```bash
cp .env.example .env
```
*(Optional)* Add your free Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey):
```env
GEMINI_API_KEY=your_actual_gemini_key_here
```
> **Note:** If `GEMINI_API_KEY` is not provided, VYRON automatically activates **Hybrid Mode**, delivering real multilingual translation, client-side OCR, and rule-based action extraction without throwing errors or breaking the demo.

### 4. Running the Application
Start the backend server:
```bash
python main.py
```
*The server will start on `http://127.0.0.1:8000` with hot-reload enabled.*

Now simply open `index.html` in your browser, or serve it locally:
```bash
# In a separate terminal tab:
python -m http.server 3000
```
Visit `http://localhost:3000` in your browser.

---

## 🔒 Security, Privacy & Responsible Explanations

1. **No Accidental Data Storage:** Uploaded PDFs and images are processed strictly in memory and are discarded immediately after text extraction.
2. **Credential Safety:** API keys are restricted to server-side `.env` files and are never sent or exposed to client JavaScript.
3. **Strict Non-Hallucination Policy:** If a deadline, fee, or document requirement is not mentioned in the source document, the system explicitly outputs *"Not specified in the provided document"* rather than fabricating advice.
4. **Civic Disclaimer:** VYRON clearly displays disclaimers that simplified translations do not constitute formal legal counsel.

---

## 🧪 Verification & Test Results

The full pipeline was verified across multiple realistic test scenarios:

| Test Case | Input Document | Result |
| :--- | :--- | :--- |
| **1. Official Notice (Sample)** | Municipal Property Tax Demand Notice (₹42,650, 30 days) | ✅ Extracted ₹42,650 dues, deadline (15-Oct-2026), 2% penalty, and Form 'C' appeal requirement. |
| **2. Multi-page PDF** | 6-Page User-Uploaded Academic Document | ✅ Server parsed 6 pages (2,435 characters) via `pypdf`, generated clean Hindi summary. |
| **3. Optical Character Recognition** | Webcam / Photo Capture | ✅ Captured frame, converted to DataURL, processed via `Tesseract.js` worker. |
| **4. Multilingual Speech** | Hindi (`hi-IN`) and English (`en-GB`) TTS | ✅ Speech synthesized with low pitch (`0.1`) and British/Indian male voice profiles. |
| **5. Input Validation** | Empty text / 2-character string | ✅ Correctly returned HTTP 400 with helpful error messages ("Input text too short"). |
| **6. Interactive Term Explainer**| Custom term search ("statutory", "distress warrant") | ✅ Returned 200 OK with contextual definition and audio read-aloud option. |

---

## 🌐 Secure Cloud Deployment

### Deploying Frontend
The frontend consists of static assets (`index.html`, `css/`, `js/`, `logo.jpg`):
- **Netlify Drop:** Drag and drop the folder to [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel:** Run `vercel` in the project root.
- **GitHub Pages:** Push to repository and enable GitHub Pages in Settings.

### Deploying Backend (FastAPI)
- **Render / Railway:** Connect your GitHub repo, set build command to `pip install -r backend/requirements.txt`, and start command to `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`.
- Set `GEMINI_API_KEY` in the hosting provider's Environment Variables dashboard.

---
*Developed with ❤️ by Team Vyron.*
