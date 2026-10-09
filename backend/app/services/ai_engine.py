import json
import re
import requests
from typing import Dict, Any, List
from .translator import LANGUAGE_NAMES, translate_via_google_endpoint, translate_single_chunk

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Cleans markdown fences or surrounding noise from an LLM response and parses JSON."""
    raw_text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
    if match:
        raw_text = match.group(1).strip()
    return json.loads(raw_text)

class VyronAIEngine:
    def __init__(self, api_key: str = "", model: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model = model

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith("your_"))

    def analyze_document(
        self,
        document_text: str,
        target_lang: str = "hi",
        level: str = "standard"
    ) -> Dict[str, Any]:
        """
        Executes the multi-stage document comprehension pipeline.
        Returns structured analysis matching all Master Prompt specifications.
        """
        lang_name = LANGUAGE_NAMES.get(target_lang, target_lang)
        doc_trimmed = document_text[:18000]

        if not self.is_configured:
            return self._fallback_analysis(doc_trimmed, target_lang, level)

        prompt = f"""
You are VYRON AI, an expert public legal and official document simplifier for citizens.
Analyze this official notice/document and translate/simplify it completely into {lang_name}.

EXPLANATION LEVEL REQUESTED: {level.upper()}
(If 'VERY_SIMPLE', use 5th-grader everyday vocabulary. If 'STANDARD', use clear, friendly civic language. If 'DETAILED', explain clause-by-clause with all conditions).

CRITICAL GROUNDING RULES:
1. Every single explanation, action item, takeaway, and jargon meaning MUST BE IN {lang_name}. Do NOT output English explanations unless target language is English.
2. Do NOT invent deadlines, fees, or requirements not present in the document.
3. If a deadline, fee, or document is not mentioned, you MUST explicitly write in {lang_name}: "दस्तावेज़ में निर्दिष्ट नहीं है" (or equivalent in {lang_name}).
4. Output STRICTLY a valid JSON object matching the requested schema. No markdown outside the JSON.

SCHEMA REQUIRED:
{{
  "detected_source_language": "English / Hindi / etc.",
  "document_type": "Government Notice / Court Order / University Circular / etc.",
  "simple_explanation": {{
    "overall_purpose": "2-3 sentences explaining what this document is about in plain {lang_name}",
    "level": "{level}",
    "simplified_body": "Clear, readable explanation in {lang_name} broken into natural paragraphs",
    "key_takeaways": [
      "Point 1 in {lang_name}",
      "Point 2 in {lang_name}"
    ],
    "ambiguities_or_warnings": "Any missing information, penalties, or conditions citizens must be careful about in {lang_name}"
  }},
  "what_you_need_to_do": {{
    "required_actions": [
      "Immediate step 1 in {lang_name}",
      "Immediate step 2 in {lang_name}"
    ],
    "deadlines": "Specific deadline mentioned in {lang_name}, OR 'Not specified in document'",
    "fees_and_payments": "Specific amount mentioned, OR 'Not specified in document'",
    "required_documents": [
      "Document 1 mentioned in {lang_name}"
    ],
    "eligibility_conditions": "Who this applies to in {lang_name}",
    "contact_and_links": "Phone, email, or website mentioned, OR 'Not specified in document'",
    "penalties_or_consequences": "What happens if ignored in {lang_name}"
  }},
  "jargon_decoded": [
    {{
      "term": "Original legal/official term in document",
      "simple_meaning": "Ultra-simple translation/definition in {lang_name}",
      "contextual_meaning": "How it specifically applies to this citizen's case in {lang_name}",
      "example": "A short, everyday relatable real-world example in {lang_name}",
      "source_sentence": "Exact sentence where this term appears in the original text"
    }}
  ]
}}

OFFICIAL DOCUMENT CONTENT:
\"\"\"
{doc_trimmed}
\"\"\"
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }

        try:
            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                result_json = res.json()
                raw_content = result_json["candidates"][0]["content"]["parts"][0]["text"]
                parsed = clean_json_response(raw_content)
                parsed["ai_engine_active"] = True
                parsed["engine_note"] = f"Processed with Google Gemini ({self.model})"
                return parsed
            else:
                err_msg = res.json().get("error", {}).get("message", res.text)
                return self._fallback_analysis(doc_trimmed, target_lang, level, error_note=f"Gemini API Error: {err_msg}")
        except Exception as e:
            return self._fallback_analysis(doc_trimmed, target_lang, level, error_note=f"Network/AI Error: {str(e)}")

    def explain_single_term(self, term: str, context: str, target_lang: str = "hi") -> Dict[str, Any]:
        """Interactively explains a user-selected term in context."""
        lang_name = LANGUAGE_NAMES.get(target_lang, target_lang)

        if not self.is_configured:
            term_tr = translate_single_chunk(term, target_lang)
            ctx_tr = translate_single_chunk(f"This term appears in the document: '{context[:80]}...'", target_lang)
            return {
                "term": term,
                "simple_meaning": term_tr,
                "contextual_meaning": ctx_tr,
                "example": translate_single_chunk("Official terminology requiring formal compliance.", target_lang),
                "source_sentence": context,
                "ai_engine_active": False
            }

        prompt = f"""
Explain this official/legal term in {lang_name} based on the surrounding context:
Term: "{term}"
Context sentence: "{context}"

Return strictly JSON:
{{
  "term": "{term}",
  "simple_meaning": "Plain everyday meaning in {lang_name}",
  "contextual_meaning": "What it specifically means in this sentence in {lang_name}",
  "example": "A real-world simple example in {lang_name}",
  "source_sentence": "{context}"
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
        }
        try:
            res = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=15)
            if res.status_code == 200:
                return clean_json_response(res.json()["candidates"][0]["content"]["parts"][0]["text"])
        except Exception:
            pass

        term_tr = translate_single_chunk(term, target_lang)
        return {
            "term": term,
            "simple_meaning": term_tr,
            "contextual_meaning": translate_single_chunk(context, target_lang),
            "example": translate_single_chunk("Official requirement.", target_lang),
            "source_sentence": context
        }

    def simplify_more(self, paragraph: str, target_lang: str = "hi") -> Dict[str, Any]:
        """Provides an ultra-simplified 5th-grader version of a confusing paragraph."""
        lang_name = LANGUAGE_NAMES.get(target_lang, target_lang)

        if not self.is_configured:
            tr = translate_single_chunk(paragraph, target_lang)
            analogy = translate_single_chunk("Like a homework deadline that must be submitted to avoid punishment, complete this required procedure.", target_lang)
            return {
                "simplified_text": tr,
                "analogy": analogy,
                "ai_engine_active": False
            }

        prompt = f"""
Take this paragraph and explain it MUCH MORE SIMPLY in {lang_name}.
Imagine explaining it to a rural citizen with zero legal education.
Use an analogy or real-life comparison if helpful.

Paragraph:
\"\"\"{paragraph}\"\"\"

Return strictly JSON:
{{
  "simplified_text": "Ultra simple explanation in {lang_name}",
  "analogy": "Short everyday comparison in {lang_name}"
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "response_mime_type": "application/json"}
        }
        try:
            res = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=15)
            if res.status_code == 200:
                return clean_json_response(res.json()["candidates"][0]["content"]["parts"][0]["text"])
        except Exception:
            pass

        tr = translate_single_chunk(paragraph, target_lang)
        return {
            "simplified_text": tr,
            "analogy": translate_single_chunk("Direct everyday translation.", target_lang)
        }

    def _fallback_analysis(
        self,
        document_text: str,
        target_lang: str,
        level: str,
        error_note: str = ""
    ) -> Dict[str, Any]:
        """
        Full localized fallback: Translates the document, action items, takeaways,
        and jargon into the user's selected target language.
        """
        # 2. Extract dates & fees
        date_matches = re.findall(r"\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}|\d+\s+days?)\b", document_text, re.IGNORECASE)
        deadlines_raw = ", ".join(set(date_matches[:3])) if date_matches else ""

        fee_matches = re.findall(r"(?:Rs\.?|INR|₹|\$)\s*[\d,]+(?:\.\d{2})?", document_text, re.IGNORECASE)
        fees_raw = ", ".join(set(fee_matches[:3])) if fee_matches else ""

        # Batch translate all template strings in ONE SINGLE call for sub-second performance
        delimiter = "\n[[SPLIT]]\n"
        template_pack = [
            document_text[:2500],
            "Not specified in the provided document",
            deadlines_raw if deadlines_raw else "None",
            fees_raw if fees_raw else "None",
            "Carefully review the translated terms and obligations above.",
            "Ensure compliance and submit required forms before the deadline.",
            "Official notice translated into your selected language.",
            f"Important deadlines mentioned: {deadlines_raw if deadlines_raw else 'None'}",
            f"Total fees or dues mentioned: {fees_raw if fees_raw else 'None'}",
            "Please verify specific conditions and penalty clauses against the original document.",
            "Identification or official documents as cited in original text.",
            "All named persons, entities, or account holders specified in circular.",
            "Administrative penalties, distress proceedings, or interest surcharges may apply if ignored.",
            "Government Notice / Circular"
        ]

        # Extract up to 3 jargon words
        words = re.findall(r"\b[A-Za-z]{8,}\b", document_text)
        unique_jargon = list(dict.fromkeys(words))[:3]
        for w in unique_jargon:
            template_pack.append(w)
            template_pack.append(f"Statutory term appearing in notice: '{w}'")
            template_pack.append("Official legal terminology requiring strict compliance.")

        batch_str = delimiter.join(template_pack)
        batch_translated = translate_single_chunk(batch_str, target_lang)
        t_items = batch_translated.split(delimiter)

        # Fallback safeguard in case delimiter count differs
        def get_item(idx, default_fallback):
            if idx < len(t_items) and t_items[idx].strip():
                return t_items[idx].strip()
            return default_fallback

        translated_body = get_item(0, document_text[:2500])
        not_specified_tr = get_item(1, "Not specified in the provided document")
        deadlines_val = get_item(2, deadlines_raw) if deadlines_raw else not_specified_tr
        fees_val = get_item(3, fees_raw) if fees_raw else not_specified_tr
        action1_tr = get_item(4, "Carefully review the translated terms and obligations above.")
        action2_tr = get_item(5, "Ensure compliance and submit required forms before the deadline.")
        takeaway1_tr = get_item(6, "Official notice translated into your selected language.")
        takeaway2_tr = get_item(7, f"Important deadlines mentioned: {deadlines_raw}")
        takeaway3_tr = get_item(8, f"Total fees or dues mentioned: {fees_raw}")
        warning_tr = get_item(9, "Please verify specific conditions against original document.")
        docs_tr = get_item(10, "Identification or official documents as cited in original text.")
        elig_tr = get_item(11, "All named entities or account holders specified in circular.")
        penalties_tr = get_item(12, "Administrative penalties may apply if ignored.")
        doc_type_tr = get_item(13, "Government Notice / Circular")

        # Reconstruct jargon items
        jargon_items = []
        cursor = 14
        for w in unique_jargon:
            sentence_match = re.search(rf"([^.?!]*\b{re.escape(w)}\b[^.?!]*[.?!])", document_text)
            sent = sentence_match.group(1).strip() if sentence_match else f"Contains term {w}."
            term_meaning = get_item(cursor, w)
            context_meaning = get_item(cursor + 1, f"Term: {w}")
            example_meaning = get_item(cursor + 2, "Official legal terminology.")
            cursor += 3

            jargon_items.append({
                "term": w,
                "simple_meaning": term_meaning,
                "contextual_meaning": context_meaning,
                "example": example_meaning,
                "source_sentence": sent
            })

        note = "Client & Server Hybrid Mode: Real translation active. GEMINI_API_KEY optional for deeper contextual reasoning."
        if error_note:
            note += f" ({error_note})"

        purpose_summary = translated_body[:300] + ("..." if len(translated_body) > 300 else "")

        return {
            "ai_engine_active": False,
            "engine_note": note,
            "detected_source_language": "English",
            "document_type": doc_type_tr,
            "simple_explanation": {
                "overall_purpose": purpose_summary,
                "level": level,
                "simplified_body": translated_body,
                "key_takeaways": [takeaway1_tr, takeaway2_tr, takeaway3_tr],
                "ambiguities_or_warnings": warning_tr
            },
            "what_you_need_to_do": {
                "required_actions": [action1_tr, action2_tr],
                "deadlines": deadlines_val,
                "fees_and_payments": fees_val,
                "required_documents": [docs_tr],
                "eligibility_conditions": elig_tr,
                "contact_and_links": not_specified_tr,
                "penalties_or_consequences": penalties_tr
            },
            "jargon_decoded": jargon_items
        }
