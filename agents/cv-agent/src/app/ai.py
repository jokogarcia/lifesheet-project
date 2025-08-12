from __future__ import annotations

import os
from typing import Any, Dict, Optional, Tuple

# Google Generative AI SDK import (optional at runtime)
try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover - allow running without the SDK installed
    genai = None  # type: ignore


SYSTEM_PROMPT = (
    "You are a helpful assistant that tailors a candidate's CV to a given job description. "
    "Focus on relevance, highlight matching skills/experience, and trim unrelated content. "
    "Preserve the original JSON structure and field naming when possible."
)


def _get_client():
    """Create a Google AI client if SDK and API key are available; else raise."""
    if genai is None:
        raise RuntimeError(
            "Google AI SDK not installed. Install 'google-genai' or configure according to README."
        )
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set")
    genai.configure(api_key=api_key)
    return genai


def tailor_cv(
    *,
    original_cv: Dict[str, Any],
    job_description: str,
    additional_prompts: Optional[str] = None,
) -> Tuple[Dict[str, Any], int]:
    """
    Call an LLM to tailor the CV.

    Returns a tuple of (tailored_cv_dict, tokens_used_int).
    In dev mode (no SDK/key), returns a simple heuristic pass-through and tokens=0.
    """
    # Dev fallback without external dependency: echo the CV and annotate a field.
    if genai is None or not os.getenv("GOOGLE_API_KEY"):
        tailored = {**original_cv}
        meta_note = (
            "[dev-mode] This CV would be tailored to the provided job description. "
            "Install/configure Google AI SDK to enable real tailoring."
        )
        tailored.setdefault("_meta", {})["note"] = meta_note
        return tailored, 0

    client = _get_client()

    # Construct prompt - instruct model to output only JSON matching original structure
    user_prompt = (
        "Given the job description below (markdown) and a CV (JSON), "
        "produce a tailored CV as JSON. Keep the same top-level structure and keys where possible. "
        "You may reorder or remove irrelevant entries, and add short bullet highlights where relevant.\n\n"
        f"Job Description (Markdown):\n{job_description}\n\n"
        f"Original CV (JSON):\n{original_cv}\n\n"
    )
    if additional_prompts:
        user_prompt += f"Additional instructions:\n{additional_prompts}\n\n"
    user_prompt += (
        "Output ONLY valid JSON. Do not include backticks or any commentary."
    )

    # Example usage for Google AI SDK; exact API may differ depending on package version.
    # We keep this generic and robust to small API changes.
    try:
        model_name = os.getenv("MODEL_NAME", "gemini-2.5-flash-lite")
        model = client.GenerativeModel(model_name)
        response = model.generate_content([
            {"text": SYSTEM_PROMPT},
            {"text": user_prompt},
        ])
        text = getattr(response, "text", None)
        if not text:
            # Older SDK structures
            candidates = getattr(response, "candidates", None)
            if candidates and len(candidates) > 0:
                parts = getattr(candidates[0], "content", {}).get("parts") if isinstance(getattr(candidates[0], "content", None), dict) else None
                if parts and len(parts) > 0:
                    text = parts[0].get("text")
        if not text:
            raise RuntimeError("No text response from model")

        import json

        tailored = json.loads(text)
        # Token usage extraction if available
        tokens = 0
        usage = getattr(response, "usage_metadata", None) or getattr(response, "usage", None)
        if usage:
            tokens = (
                getattr(usage, "total_token_count", None)
                or getattr(usage, "total_tokens", None)
                or getattr(usage, "token_count", None)
                or 0
            )
        return tailored, int(tokens)
    except Exception as e:  # Surface controlled error for API failures
        raise RuntimeError(f"AI tailoring failed: {e}")
