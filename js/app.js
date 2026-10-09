/**
 * VYRON AI EXPLAINER — Comprehensive Client Application
 * Intelligent Multilingual Public Document Simplifier & Jargon Decoder
 */

// Global State
const state = {
    backendUrl: "http://127.0.0.1:8000",
    isBackendOnline: false,
    hasGeminiKey: false,
    currentTab: "paneText",
    selectedFile: null,
    extractedSourceText: "",
    lastAnalysisData: null,
    speechUtterance: null,
    speechIsPaused: false
};

// Sample Notices for Instant Hackathon Demonstration
const SAMPLE_DOCUMENTS = {
    tax: `MUNICIPAL CORPORATION OF GREATER MUMBAI
ASSESSMENT & COLLECTION DEPARTMENT
DEMAND NOTICE UNDER SECTION 202 OF THE MMC ACT

Notice No: MCGM/AC/2026/8942-B
Date of Issue: 15-September-2026
Assessee: M/s Krishna Traders & Property Holdings
Ward: K-West, Andheri West, Mumbai - 400058

SUBJECT: STATUTORY DEMAND FOR OUTSTANDING PROPERTY TAX & DRAINAGE AMENITY CESS

Whereas your registered commercial tenement bearing Property Account No. 89-42-0091-00 is in default of municipal property tax, you are hereby called upon to remit the aggregate statutory dues of ₹42,650/- (Rupees Forty-Two Thousand Six Hundred and Fifty only) within thirty (30) days from the service of this notice.

Failure to remit the aforementioned sum prior to 15-October-2026 shall attract a compulsory penal interest surcharge @ 2% per mensem pursuant to Section 207-A of the MMC Act. 

Furthermore, in the event of persistent non-compliance, distress warrant proceedings shall be initiated without further reference, including the physical attachment and distress of movable property, attachment of bank accounts, or severance of municipal water supply connection.

APPEAL & GRIEVANCE:
If the assessee disputes the rateable value assessed herein, an official statutory objection memorandum may be submitted in Form 'C' to the Deputy Municipal Commissioner (Assessments) at the Ward Office within twenty-one (21) days of receipt, accompanied by proof of pre-deposit of 50% of the disputed demand amount.

By Order of the Municipal Commissioner.`,

    university: `CENTRAL COUNCIL FOR HIGHER EDUCATION & RESEARCH
DIRECTORATE OF ACADEMIC AFFAIRS & EXAMINATIONS
CIRCULAR NO: CCHER/EXAM/REVAL/2026-04

Date: 02 October 2026
To: All Affiliated Constituent Colleges & Deans of Faculties

SUBJECT: MANDATORY DISQUALIFICATION POLICY & SUBMISSION OF END-SEMESTER CONDONATION DOSSIERS

1. ATTENDANCE CONDONATION REGULATIONS:
Pursuant to Ordinance VIII-B, candidate scholars must maintain aggregate biometric attendance of not less than 75% in each stipulated pedagogical module. Candidates possessing attendance between 60% and 74.9% due to substantiated medical incapacity may petition for a Condonation Certificate upon remittance of a non-refundable administrative processing surcharge of ₹1,500/- accompanied by an official affidavit on non-judicial stamp paper.

2. HARD DEADLINE FOR PORTAL ENROLLMENT:
All condonation applications must be endorsed by the Head of Department and electronically uploaded to the Samarth Portal (https://samarth.edu.in/portal/condone) on or before 25-October-2026 (5:00 PM IST). Under no circumstances shall offline physical representations be entertained post the deadline.

3. PENALTY:
Scholars failing to rectify their provisional debarment shall be strictly precluded from obtaining the Admit Card / Hall Ticket for the ensuing Winter Examination Series commencing 10-November-2026. Furthermore, existing merit scholarship disbursements shall be placed in provisional abeyance pending disciplinary audit.

Helpline: academic-support@ccher.ac.in | 011-2389-0091`,

    bank: `RESERVE BANK GUIDELINES COMPLIANCE NOTIFICATION
APEX NATIONAL BANK — FRAUD MONITORING & RISK MITIGATION CELL
NOTICE OF PROVISIONAL INACTIVATION OF UNVERIFIED ACCOUNTS

Reference: ANB/KYC-AUDIT/OCT-2026/7710
Customer ID: 9028471109

Dear Account Holder,

SUBJECT: PERIODIC KYC RE-AUTHENTICATION MANDATE (PREVENTION OF MONEY LAUNDERING ACT)

In compliance with statutory Master Directions issued under the Prevention of Money Laundering Act (PMLA) and Section 35A of the Banking Regulation Act, periodic Updation of Customer Identification Data is mandatory for high-risk and medium-risk savings accounts.

Your account has been flagged for Re-KYC compliance. You are urgently required to furnish the following self-attested documents:
1. Proof of Identity (Aadhaar Card, Passport, or Voter ID).
2. Proof of Address not older than three (3) months.
3. Recent Form 60 or Permanent Account Number (PAN) Card.

DEADLINE & CONSEQUENCES:
The requisite dossier must be presented in person at your home branch or uploaded via our secure banking app before 31-October-2026. 

In default thereof, your account will be placed under 'Debit Freeze' status, precluding UPI transfers, ATM cash withdrawals, and recurring automated standing instructions (NACH/EMIs). No monetary penalties are levied for KYC updation.

For digital verification: https://apexbank.in/kyc-portal | Toll-free: 1800-425-0099.`
};

// Language map for SpeechSynthesis BCP-47 tags
const SPEECH_LANG_MAP = {
    'en': 'en-GB',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'or': 'or-IN',
    'as': 'as-IN',
    'ur': 'ur-PK',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE'
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    initEngineHealthCheck();
    initTabs();
    initSampleSelector();
    initDropzonesAndUploads();
    initCameraScanner();
    initAudioControls();
    initWorkflowSubmission();
    initResetAndCopy();
    initCustomTermExplainer();
    initExplanationSimplifier();
    initModal();
});

/* ==========================================================================
   1. Backend Connectivity & Health Check
   ========================================================================== */
async function initEngineHealthCheck() {
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    const modalBackendStatus = document.getElementById("modalBackendStatus");

    try {
        const res = await fetch(`${state.backendUrl}/api/health`, { method: "GET" });
        if (res.ok) {
            const data = await res.json();
            state.isBackendOnline = true;
            state.hasGeminiKey = data.ai_engine_configured;

            if (data.ai_engine_configured) {
                statusDot.className = "status-dot green";
                statusText.innerText = "Vyron AI Cloud: Connected (Gemini 1.5 Flash Active)";
                if (modalBackendStatus) {
                    modalBackendStatus.innerHTML = `🟢 <strong>Connected to FastAPI Backend</strong><br>AI Provider: Google Gemini (${data.active_model})<br>All Advanced NLP & Legal Extraction Features Active.`;
                }
            } else {
                statusDot.className = "status-dot yellow";
                statusText.innerText = "Vyron Hybrid Mode: Connected (Real Translation, Gemini Key Optional)";
                if (modalBackendStatus) {
                    modalBackendStatus.innerHTML = `🟡 <strong>Backend Connected in Hybrid Mode</strong><br>Real translation active. To enable full contextual AI reasoning, configure <code>GEMINI_API_KEY</code> in <code>.env</code>.`;
                }
            }
            return;
        }
    } catch (e) {
        // Backend not reachable
    }

    state.isBackendOnline = false;
    statusDot.className = "status-dot yellow";
    statusText.innerText = "Vyron Client Hybrid Mode: Live Translation & In-Browser OCR Active";
    if (modalBackendStatus) {
        modalBackendStatus.innerHTML = `⚪ <strong>Standalone Client Mode Active</strong><br>Backend server is offline. Running live free translation, client-side PDF.js, and WASM Tesseract.js directly in your browser!`;
    }
}

/* ==========================================================================
   2. Input Mode Tabs Navigation
   ========================================================================== */
function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            const targetPaneId = btn.getAttribute("data-tab");
            state.currentTab = targetPaneId;

            document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) targetPane.classList.add("active");
        });
    });

    // Character counter for textarea
    const sourceText = document.getElementById("sourceText");
    const charCount = document.getElementById("charCount");
    sourceText.addEventListener("input", () => {
        charCount.innerText = `${sourceText.value.length} characters`;
    });

    document.getElementById("clearTextBtn").addEventListener("click", () => {
        sourceText.value = "";
        charCount.innerText = "0 characters";
    });
}

/* ==========================================================================
   3. Sample Notice Selector (Hackathon Demo Acceleration)
   ========================================================================== */
function initSampleSelector() {
    const sampleSelect = document.getElementById("sampleDocSelect");
    sampleSelect.addEventListener("change", (e) => {
        const key = e.target.value;
        if (!key || !SAMPLE_DOCUMENTS[key]) return;

        // Switch to direct text tab
        document.getElementById("tabText").click();
        const textarea = document.getElementById("sourceText");
        textarea.value = SAMPLE_DOCUMENTS[key];
        document.getElementById("charCount").innerText = `${textarea.value.length} characters`;

        // Highlight input card momentarily
        const inputCard = document.querySelector(".input-card");
        inputCard.style.boxShadow = "0 0 35px var(--primary-glow)";
        setTimeout(() => inputCard.style.boxShadow = "", 800);
    });
}

/* ==========================================================================
   4. Drag & Drop and File Upload Ingestion (PDF & Images)
   ========================================================================== */
function initDropzonesAndUploads() {
    // PDF Drag & Drop
    const pdfDropzone = document.getElementById("pdfDropzone");
    const pdfInput = document.getElementById("pdfFileInput");
    const pdfPreviewCard = document.getElementById("pdfPreviewCard");
    const pdfFileName = document.getElementById("pdfFileName");
    const pdfFileMeta = document.getElementById("pdfFileMeta");

    pdfDropzone.addEventListener("click", () => pdfInput.click());
    pdfDropzone.addEventListener("dragover", (e) => { e.preventDefault(); pdfDropzone.classList.add("dragover"); });
    pdfDropzone.addEventListener("dragleave", () => pdfDropzone.classList.remove("dragover"));
    pdfDropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        pdfDropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handlePdfFile(e.dataTransfer.files[0]);
        }
    });

    pdfInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            handlePdfFile(e.target.files[0]);
        }
    });

    document.getElementById("removePdfBtn").addEventListener("click", () => {
        state.selectedFile = null;
        pdfInput.value = "";
        pdfPreviewCard.style.display = "none";
        pdfDropzone.style.display = "block";
    });

    async function handlePdfFile(file) {
        if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
            showError("Invalid File Format", "Please upload a valid PDF document.");
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            showError("File Too Large", "PDF exceeds maximum allowed limit of 15MB.");
            return;
        }

        state.selectedFile = file;
        pdfDropzone.style.display = "none";
        pdfPreviewCard.style.display = "flex";
        pdfFileName.innerText = file.name;
        pdfFileMeta.innerText = `Parsing pages... | ${(file.size / 1024).toFixed(1)} KB`;

        // Extract client-side via PDF.js for instant preview & fallback resilience
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;
            pdfFileMeta.innerText = `${numPages} Page(s) | ${(file.size / 1024).toFixed(1)} KB`;

            let extractedText = "";
            const maxPages = Math.min(numPages, 10);
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
            }
            state.extractedSourceText = extractedText.trim();
        } catch (e) {
            pdfFileMeta.innerText = `PDF ready for server extraction | ${(file.size / 1024).toFixed(1)} KB`;
        }
    }

    // Image Drag & Drop
    const imageDropzone = document.getElementById("imageDropzone");
    const imageInput = document.getElementById("imageFileInput");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    const imagePreview = document.getElementById("imagePreview");
    const imageMetaText = document.getElementById("imageMetaText");

    imageDropzone.addEventListener("click", () => imageInput.click());
    imageDropzone.addEventListener("dragover", (e) => { e.preventDefault(); imageDropzone.classList.add("dragover"); });
    imageDropzone.addEventListener("dragleave", () => imageDropzone.classList.remove("dragover"));
    imageDropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        imageDropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    imageInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
    });

    document.getElementById("removeImageBtn").addEventListener("click", () => {
        state.selectedFile = null;
        imageInput.value = "";
        imagePreviewContainer.style.display = "none";
        imageDropzone.style.display = "block";
    });

    function handleImageFile(file) {
        if (!file.type.startsWith("image/")) {
            showError("Invalid File Format", "Please select a JPG, PNG, or WEBP image.");
            return;
        }
        state.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imageDropzone.style.display = "none";
            imagePreviewContainer.style.display = "block";
            imageMetaText.innerText = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        };
        reader.readAsDataURL(file);
    }
}

/* ==========================================================================
   5. Live Camera Scanner (WebRTC + Snapshot)
   ========================================================================== */
function initCameraScanner() {
    const startCameraBtn = document.getElementById("startCameraBtn");
    const cameraContainer = document.getElementById("cameraContainer");
    const cameraPlaceholder = document.getElementById("cameraPlaceholder");
    const cameraFeed = document.getElementById("cameraFeed");
    const captureBtn = document.getElementById("captureBtn");
    const cancelCameraBtn = document.getElementById("cancelCameraBtn");
    let cameraStream = null;

    startCameraBtn.addEventListener("click", async () => {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            cameraFeed.srcObject = cameraStream;
            cameraPlaceholder.style.display = "none";
            cameraContainer.style.display = "block";
        } catch (err) {
            showError("Camera Access Denied", "Please allow camera access in your browser permissions to photograph physical notices.");
        }
    });

    cancelCameraBtn.addEventListener("click", () => {
        stopCamera();
    });

    captureBtn.addEventListener("click", () => {
        // Flash capture effect
        cameraContainer.style.opacity = "0.4";
        setTimeout(() => cameraContainer.style.opacity = "1", 150);

        const canvas = document.createElement("canvas");
        canvas.width = cameraFeed.videoWidth || 1280;
        canvas.height = cameraFeed.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");

        stopCamera();

        // Switch to Image Tab & populate preview
        document.getElementById("tabImage").click();
        const imageDropzone = document.getElementById("imageDropzone");
        const imagePreviewContainer = document.getElementById("imagePreviewContainer");
        const imagePreview = document.getElementById("imagePreview");
        const imageMetaText = document.getElementById("imageMetaText");

        imagePreview.src = dataUrl;
        imageDropzone.style.display = "none";
        imagePreviewContainer.style.display = "block";
        imageMetaText.innerText = `Camera_Capture_${Date.now()}.jpg`;

        // Convert dataURL to Blob for state.selectedFile
        canvas.toBlob(blob => {
            state.selectedFile = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        }, "image/jpeg");
    });

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        cameraContainer.style.display = "none";
        cameraPlaceholder.style.display = "block";
    }
}

/* ==========================================================================
   6. Optical Character Recognition (Tesseract.js In-Browser Worker)
   ========================================================================== */
async function runClientSideOcr(imageSource) {
    const ocrProgressContainer = document.getElementById("ocrProgressContainer");
    const ocrProgressBar = document.getElementById("ocrProgressBar");
    const ocrStatusLabel = document.getElementById("ocrStatusLabel");

    ocrProgressContainer.style.display = "block";
    ocrProgressBar.style.width = "0%";
    ocrStatusLabel.innerText = "Initializing Optical Character Recognition (OCR)...";

    try {
        const worker = await Tesseract.createWorker("eng");
        await worker.setParameters({
            tessedit_char_whitelist: ''
        });

        const result = await worker.recognize(imageSource);
        await worker.terminate();

        ocrProgressBar.style.width = "100%";
        ocrStatusLabel.innerText = "OCR Completed!";
        setTimeout(() => { ocrProgressContainer.style.display = "none"; }, 800);

        return result.data.text.trim();
    } catch (err) {
        ocrProgressContainer.style.display = "none";
        throw new Error("OCR Processing Failed: " + err.message);
    }
}

/* ==========================================================================
   7. Main Workflow Processing & Submission Pipeline
   ========================================================================== */
function initWorkflowSubmission() {
    const translateBtn = document.getElementById("translateBtn");
    const aiCore = document.getElementById("aiCore");
    const pipeline = document.getElementById("processingPipeline");
    const resultsWrapper = document.getElementById("resultsWrapper");

    translateBtn.addEventListener("click", async () => {
        hideError();
        let textToProcess = "";

        // Ingestion based on current active tab
        if (state.currentTab === "paneText") {
            textToProcess = document.getElementById("sourceText").value.trim();
            if (!textToProcess) {
                showError("No Text Provided", "Please paste or type an official notice into the text box, or select a sample notice.");
                return;
            }
        } else if (state.currentTab === "panePdf") {
            if (!state.selectedFile && !state.extractedSourceText) {
                showError("No PDF Selected", "Please drag and drop or browse a PDF notice before decoding.");
                return;
            }
            textToProcess = state.extractedSourceText;
        } else if (state.currentTab === "paneImage" || state.currentTab === "paneCamera") {
            const imagePreview = document.getElementById("imagePreview");
            if (!state.selectedFile && !imagePreview.src) {
                showError("No Image Selected", "Please upload or capture a document photo.");
                return;
            }
            // Execute OCR if not already extracted
            try {
                textToProcess = await runClientSideOcr(imagePreview.src);
                state.extractedSourceText = textToProcess;
            } catch (err) {
                showError("OCR Error", err.message);
                return;
            }
        }

        const targetLang = document.getElementById("targetLang").value;
        const level = document.querySelector('input[name="explanationLevel"]:checked').value;

        // Visual Pipeline Activation
        aiCore.classList.add("processing");
        pipeline.style.display = "block";
        resultsWrapper.style.display = "none";
        translateBtn.disabled = true;
        translateBtn.style.opacity = "0.7";

        updatePipelineStep(1, "Extracting text and verifying structure...");

        try {
            let resultData = null;

            if (state.isBackendOnline) {
                // Call FastAPI Backend Server
                updatePipelineStep(2, "Translating document content...");
                const formData = new FormData();
                if (textToProcess) {
                    formData.append("text", textToProcess);
                } else if (state.selectedFile) {
                    formData.append("file", state.selectedFile);
                }
                formData.append("target_lang", targetLang);
                formData.append("explanation_level", level);

                const response = await fetch(`${state.backendUrl}/api/process-document`, {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    const errJson = await response.json().catch(() => ({}));
                    throw new Error(errJson.detail || `Server returned error status ${response.status}`);
                }

                updatePipelineStep(3, "Synthesizing simplified meaning & intent...");
                await new Promise(r => setTimeout(r, 400));
                updatePipelineStep(4, "Decoding official jargon & identifying actions...");
                await new Promise(r => setTimeout(r, 300));

                resultData = await response.json();
            } else {
                // Standalone Client-Side Hybrid Execution
                updatePipelineStep(2, "Translating document via direct endpoint...");
                const translated = await clientTranslate(textToProcess, targetLang);

                updatePipelineStep(3, "Simplifying intent and citizen takeaways...");
                await new Promise(r => setTimeout(r, 400));

                updatePipelineStep(4, "Extracting actionable deadlines and jargon...");
                await new Promise(r => setTimeout(r, 300));

                const analysis = await clientHeuristicAnalysis(textToProcess, translated.text, targetLang, level);
                resultData = {
                    status: "success",
                    metadata: { source: "client_standalone" },
                    original_text: textToProcess,
                    literal_translated_text: translated.text,
                    target_lang: targetLang,
                    analysis: analysis
                };
            }

            // Render complete dashboard
            state.lastAnalysisData = resultData;
            renderResultsDashboard(resultData);

            pipeline.style.display = "none";
            resultsWrapper.style.display = "flex";
            resultsWrapper.scrollIntoView({ behavior: "smooth", block: "start" });

        } catch (err) {
            showError("Processing Failure", err.message || "Failed to process the document.");
            pipeline.style.display = "none";
        } finally {
            aiCore.classList.remove("processing");
            translateBtn.disabled = false;
            translateBtn.style.opacity = "1";
        }
    });

    // Results Tab Switcher
    const resTabs = document.querySelectorAll(".res-tab");
    resTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            resTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const targetViewId = tab.getAttribute("data-view");
            document.querySelectorAll(".result-view-panel").forEach(p => p.classList.remove("active"));
            const targetPanel = document.getElementById(targetViewId);
            if (targetPanel) targetPanel.classList.add("active");
        });
    });
}

function updatePipelineStep(stepNum, statusText) {
    document.getElementById("pipelineStatusText").innerText = statusText;
    for (let i = 1; i <= 4; i++) {
        const node = document.getElementById(`step${i}`);
        const line = document.getElementById(`line${i}`);
        if (i <= stepNum) {
            node.classList.add("active");
            if (line) line.classList.add("active");
        } else {
            node.classList.remove("active");
            if (line) line.classList.remove("active");
        }
    }
}

/* ==========================================================================
   8. Client-Side Fallback Translation & Heuristic Logic
   ========================================================================== */
async function clientTranslate(text, targetLang) {
    if (targetLang === "en") return { text: text };
    const chunk = text.slice(0, 2500);
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`;
        const res = await fetch(url);
        if (res.ok) {
            const json = await res.json();
            let translatedText = "";
            if (json && json[0]) {
                translatedText = json[0].map(item => item[0]).join('');
            }
            if (translatedText.trim()) return { text: translatedText };
        }
    } catch (e) {
        // Fallback to MyMemory
    }

    try {
        const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.slice(0, 450))}&langpair=en|${targetLang}`;
        const res2 = await fetch(url2);
        if (res2.ok) {
            const json2 = await res2.json();
            const t = json2.responseData?.translatedText;
            if (t && !t.startsWith("MYMEMORY WARNING")) return { text: t };
        }
    } catch (e) {}

    return { text: text };
}

async function clientHeuristicAnalysis(rawText, translatedBody, targetLang, level) {
    // Extract dates
    const dateMatches = rawText.match(/\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}|\d+\s+days?)\b/gi);
    const deadlineRaw = dateMatches ? Array.from(new Set(dateMatches)).slice(0, 3).join(", ") : "";

    // Extract fees
    const feeMatches = rawText.match(/(?:Rs\.?|INR|₹|\$)\s*[\d,]+(?:\.\d{2})?/gi);
    const feesRaw = feeMatches ? Array.from(new Set(feeMatches)).slice(0, 3).join(", ") : "";

    // Translate common phrases to selected target language
    const notSpecified = (await clientTranslate("Not specified in the provided document", targetLang)).text;
    const deadlineVal = deadlineRaw ? (await clientTranslate(deadlineRaw, targetLang)).text : notSpecified;
    const feeVal = feesRaw ? (await clientTranslate(feesRaw, targetLang)).text : notSpecified;

    const action1 = (await clientTranslate("Carefully review the translated terms and obligations above.", targetLang)).text;
    const action2 = (await clientTranslate("Ensure compliance and submit required forms before the deadline.", targetLang)).text;

    const takeaway1 = (await clientTranslate("Official notice translated into your selected language.", targetLang)).text;
    const takeaway2 = (await clientTranslate(`Important deadlines mentioned: ${deadlineRaw || 'None'}`, targetLang)).text;
    const takeaway3 = (await clientTranslate(`Total fees or dues mentioned: ${feesRaw || 'None'}`, targetLang)).text;

    const warning = (await clientTranslate("Please verify specific conditions and penalty clauses against the original document.", targetLang)).text;
    const docs = (await clientTranslate("Identification or official documents as cited in original text.", targetLang)).text;
    const elig = (await clientTranslate("All named persons, entities, or account holders specified in circular.", targetLang)).text;
    const penalties = (await clientTranslate("Administrative penalties, distress proceedings, or interest surcharges may apply if ignored.", targetLang)).text;
    const docType = (await clientTranslate("Government Notice / Circular", targetLang)).text;

    // Extract high-syllable jargon words
    const words = rawText.match(/\b[A-Za-z]{8,}\b/g) || [];
    const uniqueWords = Array.from(new Set(words)).slice(0, 3);
    const jargonList = [];

    for (const w of uniqueWords) {
        const sentenceMatch = rawText.match(new RegExp(`([^.?!]*\\b${w}\\b[^.?!]*[.?!])`, 'i'));
        const sent = sentenceMatch ? sentenceMatch[1].trim() : `Contains statutory term '${w}'.`;
        const meaning = (await clientTranslate(w, targetLang)).text;
        const ctx = (await clientTranslate(`Statutory term appearing in notice: '${meaning}'`, targetLang)).text;
        const ex = (await clientTranslate("Official legal terminology requiring strict compliance.", targetLang)).text;

        jargonList.push({
            term: w,
            simple_meaning: meaning,
            contextual_meaning: ctx,
            example: ex,
            source_sentence: sent
        });
    }

    return {
        ai_engine_active: false,
        engine_note: "Client Hybrid Mode: Real translation active without cloud credentials.",
        detected_source_language: "Auto-Detected",
        document_type: docType,
        simple_explanation: {
            overall_purpose: translatedBody.slice(0, 260) + (translatedBody.length > 260 ? "..." : ""),
            level: level,
            simplified_body: translatedBody,
            key_takeaways: [takeaway1, takeaway2, takeaway3],
            ambiguities_or_warnings: warning
        },
        what_you_need_to_do: {
            required_actions: [action1, action2],
            deadlines: deadlineVal,
            fees_and_payments: feeVal,
            required_documents: [docs],
            eligibility_conditions: elig,
            contact_and_links: notSpecified,
            penalties_or_consequences: penalties
        },
        jargon_decoded: jargonList
    };
}

/* ==========================================================================
   9. Results Dashboard Rendering
   ========================================================================== */
function renderResultsDashboard(data) {
    const analysis = data.analysis;
    const simple = analysis.simple_explanation;
    const actions = analysis.what_you_need_to_do;
    const jargon = analysis.jargon_decoded || [];

    // Document Type
    document.getElementById("documentTypeBadge").innerText = analysis.document_type || "Official Document";

    // Overall Purpose
    document.getElementById("simpleOverallPurpose").innerText = simple.overall_purpose || "No summary available.";

    // Simplified Body
    const bodyContainer = document.getElementById("simpleExplanationBody");
    bodyContainer.innerHTML = "";
    const paragraphs = (simple.simplified_body || "").split("\n\n");
    paragraphs.forEach(pText => {
        if (pText.trim()) {
            const p = document.createElement("p");
            p.innerText = pText.trim();
            bodyContainer.appendChild(p);
        }
    });

    // Key Takeaways
    const takeawaysBox = document.getElementById("takeawaysBox");
    const takeawaysList = document.getElementById("takeawaysList");
    if (simple.key_takeaways && simple.key_takeaways.length > 0) {
        takeawaysBox.style.display = "block";
        takeawaysList.innerHTML = simple.key_takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join("");
    } else {
        takeawaysBox.style.display = "none";
    }

    // Ambiguities / Warnings
    const ambiguitiesBox = document.getElementById("ambiguitiesBox");
    const ambiguitiesText = document.getElementById("ambiguitiesText");
    if (simple.ambiguities_or_warnings) {
        ambiguitiesBox.style.display = "flex";
        ambiguitiesText.innerText = simple.ambiguities_or_warnings;
    } else {
        ambiguitiesBox.style.display = "none";
    }

    // 2. Action Items Matrix
    const actionChecklist = document.getElementById("actionChecklist");
    actionChecklist.innerHTML = "";
    const requiredActions = actions.required_actions || ["Review document instructions."];
    requiredActions.forEach((act, idx) => {
        const item = document.createElement("label");
        item.className = "action-check-item";
        item.innerHTML = `
            <input type="checkbox" id="actionCheck_${idx}">
            <span>${escapeHtml(act)}</span>
        `;
        actionChecklist.appendChild(item);
    });

    document.getElementById("actionDeadline").innerText = actions.deadlines || "Not specified in the provided document";
    document.getElementById("actionFees").innerText = actions.fees_and_payments || "Not specified in the provided document";
    
    // Required Documents list formatting
    const docVal = Array.isArray(actions.required_documents) ? actions.required_documents.join(", ") : (actions.required_documents || "Not specified in the provided document");
    document.getElementById("actionDocuments").innerText = docVal;
    
    document.getElementById("actionPenalties").innerText = actions.penalties_or_consequences || "Not specified in the provided document";
    document.getElementById("actionEligibility").innerText = actions.eligibility_conditions || "Not specified in the provided document";
    document.getElementById("actionContact").innerText = actions.contact_and_links || "Not specified in the provided document";

    // 3. Jargon Grid
    const jargonGrid = document.getElementById("jargonCardsContainer");
    jargonGrid.innerHTML = "";
    if (jargon.length === 0) {
        jargonGrid.innerHTML = `<div class="jargon-card"><div class="jargon-context">No complex bureaucratic jargon detected in this document.</div></div>`;
    } else {
        jargon.forEach(item => {
            const card = document.createElement("div");
            card.className = "jargon-card";
            card.innerHTML = `
                <div class="jargon-card-top">
                    <span class="jargon-term">${escapeHtml(item.term)}</span>
                    <button class="icon-btn speak-term-btn" type="button" data-term="${escapeHtml(item.term)}" data-meaning="${escapeHtml(item.simple_meaning)}">
                        🔊 Read
                    </button>
                </div>
                <div class="jargon-meaning">👉 ${escapeHtml(item.simple_meaning)}</div>
                <div class="jargon-context"><strong>Context:</strong> ${escapeHtml(item.contextual_meaning)}</div>
                ${item.example ? `<div class="jargon-example"><strong>Example:</strong> ${escapeHtml(item.example)}</div>` : ''}
                ${item.source_sentence ? `<div class="jargon-source">"${escapeHtml(item.source_sentence)}"</div>` : ''}
            `;
            jargonGrid.appendChild(card);
        });

        // Attach term speech listeners
        jargonGrid.querySelectorAll(".speak-term-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const term = btn.getAttribute("data-term");
                const meaning = btn.getAttribute("data-meaning");
                speakText(`${term}. ${meaning}`, data.target_lang);
            });
        });
    }

    // 4. Literal Translated Document
    document.getElementById("literalTranslationBox").innerText = data.literal_translated_text || "Translation not available.";

    // 5. Raw Extracted Source Text
    document.getElementById("rawSourceTextBox").innerText = data.original_text || "Source text not available.";
}

/* ==========================================================================
   10. Audio & Speech Synthesis Engine (J.A.R.V.I.S. Tuning)
   ========================================================================== */
function initAudioControls() {
    const playBtn = document.getElementById("playAudioBtn");
    const pauseBtn = document.getElementById("pauseAudioBtn");
    const stopBtn = document.getElementById("stopAudioBtn");
    const playIcon = document.getElementById("playAudioIcon");
    const playText = document.getElementById("playAudioText");
    const speechRateSelect = document.getElementById("speechRateSelect");

    playBtn.addEventListener("click", () => {
        if (state.speechIsPaused) {
            window.speechSynthesis.resume();
            state.speechIsPaused = false;
            pauseBtn.style.display = "inline-flex";
            playBtn.style.display = "none";
            return;
        }

        const purpose = document.getElementById("simpleOverallPurpose").innerText;
        const body = document.getElementById("simpleExplanationBody").innerText;
        const textToRead = `${purpose}. ${body}`;
        const targetLang = document.getElementById("targetLang").value;

        speakText(textToRead, targetLang);
    });

    pauseBtn.addEventListener("click", () => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            state.speechIsPaused = true;
            pauseBtn.style.display = "none";
            playBtn.style.display = "inline-flex";
            playText.innerText = "Resume Speech";
        }
    });

    stopBtn.addEventListener("click", () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            resetAudioButtons();
        }
    });

    function resetAudioButtons() {
        state.speechIsPaused = false;
        playBtn.style.display = "inline-flex";
        pauseBtn.style.display = "none";
        stopBtn.style.display = "none";
        playIcon.innerText = "🔊";
        playText.innerText = "Play Audio (Jarvis Voice)";
    }

    window.resetAudioButtons = resetAudioButtons;
}

function speakText(text, langCode) {
    if (!('speechSynthesis' in window)) {
        showError("Speech Unsupported", "Your browser does not support speech synthesis.");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const mappedLang = SPEECH_LANG_MAP[langCode] || 'hi-IN';
    utterance.lang = mappedLang;

    // Acoustic J.A.R.V.I.S. Tuning
    utterance.pitch = 0.1; // Deep frequency shift
    const rateVal = parseFloat(document.getElementById("speechRateSelect")?.value || "0.85");
    utterance.rate = rateVal;

    // Smart Voice Profile Routing
    const voices = window.speechSynthesis.getVoices();
    if (langCode === 'en') {
        const jarvisVoice = voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-UK') && (v.name.includes('Male') || v.name === 'Daniel'));
        if (jarvisVoice) utterance.voice = jarvisVoice;
    } else if (langCode === 'hi') {
        const hiMale = voices.find(v => v.lang.includes('hi') && (v.name.toLowerCase().includes('male') || v.name.includes('Rishi')));
        if (hiMale) utterance.voice = hiMale;
    }

    const playBtn = document.getElementById("playAudioBtn");
    const pauseBtn = document.getElementById("pauseAudioBtn");
    const stopBtn = document.getElementById("stopAudioBtn");

    utterance.onstart = () => {
        playBtn.style.display = "none";
        pauseBtn.style.display = "inline-flex";
        stopBtn.style.display = "inline-flex";
    };

    utterance.onend = () => {
        if (window.resetAudioButtons) window.resetAudioButtons();
    };

    utterance.onerror = () => {
        if (window.resetAudioButtons) window.resetAudioButtons();
    };

    state.speechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
}

/* ==========================================================================
   11. Interactive Features: "Explain More Simply" & Custom Term Decoder
   ========================================================================== */
function initExplanationSimplifier() {
    const simplifyBtn = document.getElementById("simplifyMoreBtn");
    simplifyBtn.addEventListener("click", async () => {
        const purpose = document.getElementById("simpleOverallPurpose").innerText;
        const targetLang = document.getElementById("targetLang").value;

        simplifyBtn.innerText = "⚡ Simplifying further...";
        simplifyBtn.disabled = true;

        try {
            if (state.isBackendOnline) {
                const res = await fetch(`${state.backendUrl}/api/simplify-more`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paragraph: purpose, target_lang: targetLang })
                });
                if (res.ok) {
                    const data = await res.json();
                    insertSimplifiedAnalogyBox(data.simplified_text, data.analogy);
                    return;
                }
            }

            // Fallback simplification
            insertSimplifiedAnalogyBox(
                `सीधे शब्दों में: यह एक सरकारी नोटिस है जिसे समय सीमा से पहले पूरा करना अनिवार्य है।`,
                `जैसे स्कूल का होमवर्क आखिरी तारीख से पहले जमा करना होता है, वैसे ही यह फॉर्म जमा करें।`
            );
        } catch (e) {
            // Ignore
        } finally {
            simplifyBtn.innerText = "⚡ Explain More Simply";
            simplifyBtn.disabled = false;
        }
    });

    function insertSimplifiedAnalogyBox(text, analogy) {
        let box = document.getElementById("superSimpleAnalogyBox");
        if (!box) {
            box = document.createElement("div");
            box.id = "superSimpleAnalogyBox";
            box.style.background = "rgba(195, 255, 0, 0.1)";
            box.style.border = "1px solid var(--primary)";
            box.style.borderRadius = "var(--radius-md)";
            box.style.padding = "16px";
            box.style.margin = "14px 0";
            const purposeBox = document.querySelector(".purpose-highlight-box");
            purposeBox.parentNode.insertBefore(box, purposeBox.nextSibling);
        }
        box.innerHTML = `
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--primary); margin-bottom: 6px;">👶 5TH-GRADER EVERYDAY TRANSLATION</div>
            <p style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 8px;">${escapeHtml(text)}</p>
            ${analogy ? `<div style="font-size: 0.88rem; color: var(--text-muted); font-style: italic;">💡 Analogy: ${escapeHtml(analogy)}</div>` : ''}
        `;
        box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function initCustomTermExplainer() {
    const input = document.getElementById("customTermInput");
    const btn = document.getElementById("explainCustomTermBtn");

    btn.addEventListener("click", async () => {
        const term = input.value.trim();
        if (!term) return;

        btn.innerText = "Decoding...";
        btn.disabled = true;

        const targetLang = document.getElementById("targetLang").value;
        const context = state.extractedSourceText ? state.extractedSourceText.slice(0, 300) : "";

        try {
            let termResult = null;
            if (state.isBackendOnline) {
                const res = await fetch(`${state.backendUrl}/api/explain-term`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ term, context, target_lang: targetLang })
                });
                if (res.ok) {
                    termResult = await res.json();
                }
            }

            if (!termResult) {
                const tr = await clientTranslate(term, targetLang);
                termResult = {
                    term: term,
                    simple_meaning: tr.text,
                    contextual_meaning: `Custom search term decoded into selected language.`,
                    example: `Review document to locate specific requirements.`,
                    source_sentence: `Custom query.`
                };
            }

            // Prepend new jargon card to top of grid
            const jargonGrid = document.getElementById("jargonCardsContainer");
            const card = document.createElement("div");
            card.className = "jargon-card";
            card.style.borderColor = "var(--primary)";
            card.innerHTML = `
                <div class="jargon-card-top">
                    <span class="jargon-term">${escapeHtml(termResult.term)} <span class="badge badge-accent">Searched</span></span>
                    <button class="icon-btn speak-term-btn" type="button" data-term="${escapeHtml(termResult.term)}" data-meaning="${escapeHtml(termResult.simple_meaning)}">
                        🔊 Read
                    </button>
                </div>
                <div class="jargon-meaning">👉 ${escapeHtml(termResult.simple_meaning)}</div>
                <div class="jargon-context"><strong>Context:</strong> ${escapeHtml(termResult.contextual_meaning)}</div>
                ${termResult.example ? `<div class="jargon-example"><strong>Example:</strong> ${escapeHtml(termResult.example)}</div>` : ''}
            `;
            jargonGrid.prepend(card);

            card.querySelector(".speak-term-btn").addEventListener("click", () => {
                speakText(`${termResult.term}. ${termResult.simple_meaning}`, targetLang);
            });

            input.value = "";
            card.scrollIntoView({ behavior: "smooth", block: "nearest" });

        } catch (e) {
            showError("Term Lookup Failed", e.message);
        } finally {
            btn.innerText = "Decode Term";
            btn.disabled = false;
        }
    });
}

/* ==========================================================================
   12. Reset, Copy & Export Actions
   ========================================================================== */
function initResetAndCopy() {
    // Copy Simple Meaning
    document.getElementById("copySimpleBtn").addEventListener("click", () => {
        const purpose = document.getElementById("simpleOverallPurpose").innerText;
        const body = document.getElementById("simpleExplanationBody").innerText;
        copyToClipboard(`${purpose}\n\n${body}`);
    });

    // Copy Translated All
    document.getElementById("copyTranslatedBtn").addEventListener("click", () => {
        const text = document.getElementById("literalTranslationBox").innerText;
        copyToClipboard(text);
    });

    // Download Summary Report (.txt)
    document.getElementById("downloadReportBtn").addEventListener("click", () => {
        if (!state.lastAnalysisData) return;
        const analysis = state.lastAnalysisData.analysis;
        const report = `=====================================================
VYRON AI EXPLAINER — PUBLIC DOCUMENT INTELLIGENCE REPORT
=====================================================

DOCUMENT TYPE: ${analysis.document_type || "Official Notice"}
TARGET LANGUAGE: ${state.lastAnalysisData.target_lang}

-----------------------------------------------------
1. CORE PURPOSE (PLAIN SUMMARY):
-----------------------------------------------------
${analysis.simple_explanation?.overall_purpose || ""}

${analysis.simple_explanation?.simplified_body || ""}

-----------------------------------------------------
2. WHAT YOU NEED TO DO (ACTION ITEMS):
-----------------------------------------------------
* DEADLINE: ${analysis.what_you_need_to_do?.deadlines || "Not specified in document"}
* FEES / PAYMENTS: ${analysis.what_you_need_to_do?.fees_and_payments || "Not specified in document"}
* REQUIRED DOCUMENTS: ${JSON.stringify(analysis.what_you_need_to_do?.required_documents || "Not specified")}
* WARNING / PENALTY: ${analysis.what_you_need_to_do?.penalties_or_consequences || "Not specified"}

REQUIRED ACTIONS:
${(analysis.what_you_need_to_do?.required_actions || []).map((a, i) => `${i + 1}. ${a}`).join("\n")}

-----------------------------------------------------
3. DECODED JARGON TERMS:
-----------------------------------------------------
${(analysis.jargon_decoded || []).map(j => `* ${j.term}: ${j.simple_meaning}\n  Context: ${j.contextual_meaning}`).join("\n\n")}

=====================================================
Report Generated by VYRON AI (https://vyron-ai.app)
=====================================================`;

        const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `Vyron_Document_Summary_${Date.now()}.txt`;
        a.click();
    });

    // Reset Workflow
    document.getElementById("resetWorkflowBtn").addEventListener("click", () => {
        document.getElementById("resultsWrapper").style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Clear Document & Memory
    document.getElementById("clearMemoryBtn").addEventListener("click", () => {
        document.getElementById("sourceText").value = "";
        document.getElementById("charCount").innerText = "0 characters";
        document.getElementById("removePdfBtn")?.click();
        document.getElementById("removeImageBtn")?.click();
        state.selectedFile = null;
        state.extractedSourceText = "";
        state.lastAnalysisData = null;
        document.getElementById("resultsWrapper").style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard! 📋");
    }).catch(() => {
        alert("Failed to copy text.");
    });
}

/* ==========================================================================
   13. Modal & Error Handling Utilities
   ========================================================================== */
function initModal() {
    const configBtn = document.getElementById("configHelpBtn");
    const modal = document.getElementById("configModal");
    const closeBtn = document.getElementById("closeConfigModalBtn");

    configBtn.addEventListener("click", () => {
        modal.style.display = "flex";
        initEngineHealthCheck(); // Refresh status on open
    });

    closeBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
}

function showError(title, message) {
    const banner = document.getElementById("errorBanner");
    document.getElementById("errorTitle").innerText = title;
    document.getElementById("errorMsg").innerText = message;
    banner.style.display = "flex";
    banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
    document.getElementById("errorBanner").style.display = "none";
}

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Register PWA Service Worker for Mobile Installability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}