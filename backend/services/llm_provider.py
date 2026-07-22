import os
import ast
import json
import time
import concurrent.futures
from typing import Any, Dict, List, Optional

import requests
from google import genai


from dotenv import load_dotenv

load_dotenv()

def _get_gemini_client():
    load_dotenv(override=True)
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if key:
        return genai.Client(api_key=key)
    return None

def _get_openrouter_key():
    load_dotenv(override=True)
    return os.getenv("OPENROUTER_API_KEY", "").strip()


def _call_gemini(contents: str, config: Any = None, models: Optional[List[str]] = None) -> str:
    client = _get_gemini_client()
    if not client:
        raise RuntimeError("Gemini API key not configured")

    model_list = models or ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"]
    last_err = None

    for model_name in model_list:
        try:
            kwargs: Dict[str, Any] = {"model": model_name, "contents": contents}
            if config is not None:
                kwargs["config"] = config
            response = client.models.generate_content(**kwargs)
            return (response.text or "").strip()
        except Exception as exc:
            last_err = exc
            err_str = str(exc)
            if "401" in err_str or "UNAUTHENTICATED" in err_str:
                print(f"[WARN] Gemini primary call failed: {err_str[:120]}... Trying OpenRouter fallback.")
                break
            if any(k in err_str for k in ["429", "RESOURCE_EXHAUSTED", "503", "UNAVAILABLE", "500", "504", "OVERLOADED"]):
                print(f"[INFO] Gemini model {model_name} rate-limited/busy ({err_str[:60]}...), trying fallback model...")
                time.sleep(1.0)
                continue
            if any(k in err_str for k in ["404", "NOT_FOUND"]):
                print(f"[INFO] Gemini model {model_name} not found, trying fallback...")
                continue
            break

    if last_err:
        raise last_err
    raise RuntimeError("All Gemini model fallbacks failed")


def _call_openrouter(contents: str, model: Optional[str] = None, response_format: Optional[Dict[str, Any]] = None) -> str:
    key = _get_openrouter_key()
    if not key:
        raise RuntimeError("OpenRouter API key not configured")

    models_to_try = [model] if model else [
        "google/gemini-2.0-flash-lite-001",
        "meta-llama/llama-3.2-1b-instruct:free",
        "deepseek/deepseek-r1:free",
        "qwen/qwen-2.5-coder-32b-instruct:free"
    ]

    last_err = None
    for m in models_to_try:
        if not m:
            continue
        try:
            payload: Dict[str, Any] = {
                "model": m,
                "messages": [
                    {"role": "user", "content": contents}
                ],
                "temperature": 0.2,
            }
            if response_format:
                payload["response_format"] = response_format

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": os.getenv("OPENROUTER_HTTP_REFERER", "http://localhost:3000"),
                    "X-Title": os.getenv("OPENROUTER_APP_NAME", "AgentForge"),
                },
                json=payload,
                timeout=20,
            )
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                last_err = RuntimeError(f"OpenRouter HTTP {response.status_code}: {response.text[:100]}")
        except Exception as exc:
            last_err = exc
            continue

    if last_err:
        raise last_err
    raise RuntimeError("All OpenRouter model fallbacks failed")


def _normalize_text(text: str) -> str:
    return (text or "").strip().replace("```python", "").replace("```", "")


def _is_json_text(text: str) -> bool:
    try:
        json.loads(_normalize_text(text))
        return True
    except Exception:
        return False


def _is_valid_python(text: str) -> bool:
    try:
        ast.parse(_normalize_text(text))
        return True
    except Exception:
        return False


def _score_candidate(text: str, mode: str = "code") -> int:
    normalized = _normalize_text(text)
    score = len(normalized)

    if not normalized:
        return -1000

    if mode == "json":
        if _is_json_text(normalized):
            score += 2000
        if normalized.startswith("{") and normalized.endswith("}"):
            score += 200
        if "```" in text:
            score -= 300
        return score

    if mode == "general":
        if "```" in text:
            score -= 500
        if len(normalized.split()) > 40:
            score += 150
        if normalized.count(".") >= 2:
            score += 100
        if normalized.count("\n") >= 2:
            score += 50
        if _is_valid_python(normalized):
            score -= 300
        return score

    if _is_valid_python(normalized):
        score += 2000
    if "if __name__ == \"__main__\"" in normalized:
        score += 200
    if "import " in normalized:
        score += 100
    if "```" in text:
        score -= 500
    if "pass" in normalized and len(normalized) < 200:
        score -= 100
    return score


def _choose_best_candidate(candidates: List[str], mode: str = "code") -> str:
    valid_candidates = [candidate for candidate in candidates if candidate and candidate.strip()]
    if not valid_candidates:
        return ""
    if mode == "json":
        for candidate in valid_candidates:
            if _is_json_text(candidate):
                return _normalize_text(candidate)
    else:
        for candidate in valid_candidates:
            if _is_valid_python(candidate):
                return _normalize_text(candidate)

    scored = sorted(valid_candidates, key=lambda item: _score_candidate(item, mode=mode), reverse=True)
    return _normalize_text(scored[0])


def generate_text_with_fallback(
    contents: str,
    config: Any = None,
    response_format: Optional[Dict[str, Any]] = None,
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free",
) -> str:
    """Generate text with Gemini first, then OpenRouter as a fallback."""
    try:
        return _call_gemini(contents, config=config)
    except Exception as gemini_error:
        print(f"[WARN] Gemini failed, using OpenRouter fallback: {gemini_error}")

    try:
        return _call_openrouter(contents, model=openrouter_model, response_format=response_format)
    except Exception as openrouter_error:
        raise RuntimeError(f"Both Gemini and OpenRouter failed: {openrouter_error}") from openrouter_error


def generate_text_pro(
    contents: str,
    config: Any = None,
    response_format: Optional[Dict[str, Any]] = None,
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free",
    mode: str = "code",
) -> str:
    """Fast, responsive LLM provider trying Gemini 2.0 Flash first, falling back to OpenRouter on failure."""
    if _get_gemini_client():
        try:
            res = _call_gemini(contents, config=config)
            if res and res.strip():
                return res
        except Exception as exc:
            print(f"[WARN] Gemini primary call failed: {exc}")

    if _get_openrouter_key():
        try:
            return _call_openrouter(contents, model=openrouter_model, response_format=response_format)
        except Exception as exc:
            print(f"[WARN] OpenRouter fallback failed: {exc}")

    raise RuntimeError("No valid output from Gemini or OpenRouter LLM providers")