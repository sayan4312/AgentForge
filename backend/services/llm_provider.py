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


GEMINI_CALL_COUNT = 0

def _call_gemini(contents: str, config: Any = None, models: Optional[List[str]] = None) -> str:
    global GEMINI_CALL_COUNT
    client = _get_gemini_client()
    if not client:
        raise RuntimeError("Gemini API key not configured")

    GEMINI_CALL_COUNT += 1
    call_id = GEMINI_CALL_COUNT
    current_time = time.strftime("%H:%M:%S")
    prompt_summary = contents[:55].strip().replace("\n", " ")
    print(f"\n⚡ [GEMINI API REQUEST #{call_id}] at {current_time} | Prompt: '{prompt_summary}...'")

    model_list = models or ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-8b"]
    last_err = None

    for model_name in model_list:
        try:
            kwargs: Dict[str, Any] = {"model": model_name, "contents": contents}
            if config is not None:
                kwargs["config"] = config
            response = client.models.generate_content(**kwargs)
            print(f"   --> Request #{call_id} [{model_name}] -> ✅ 200 SUCCESS")
            return (response.text or "").strip()
        except Exception as exc:
            last_err = exc
            err_str = str(exc)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                print(f"   --> Request #{call_id} [{model_name}] -> ❌ 429 RATE LIMIT EXCEEDED")
                time.sleep(1.0)
                continue
            elif "401" in err_str or "UNAUTHENTICATED" in err_str or "INVALID_ARGUMENT" in err_str:
                print(f"   --> Request #{call_id} [{model_name}] -> ❌ 401 INVALID AUTH KEY")
                break
            elif "404" in err_str or "NOT_FOUND" in err_str:
                print(f"   --> Request #{call_id} [{model_name}] -> ❌ 404 MODEL NOT FOUND")
                continue
            else:
                print(f"   --> Request #{call_id} [{model_name}] -> ❌ ERROR: {err_str[:100]}")
                break

    if last_err:
        raise last_err
    raise RuntimeError("All Gemini model fallbacks failed")


def _call_openrouter(contents: str, model: Optional[str] = None, response_format: Optional[Dict[str, Any]] = None) -> str:
    key = _get_openrouter_key()
    if not key:
        raise RuntimeError("OpenRouter API key not configured")

    default_free_models = [
        "qwen/qwen-2.5-coder-32b-instruct:free",
        "meta-llama/llama-3.2-1b-instruct:free",
        "google/gemini-2.0-flash-lite-preview-02-05:free"
    ]
    models_to_try = ([model] if model else []) + [m for m in default_free_models if m != model]

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
                err_msg = f"HTTP {response.status_code}: {response.text[:100]}"
                last_err = RuntimeError(f"OpenRouter {err_msg}")
        except Exception as exc:
            last_err = exc
            continue

    if last_err:
        raise last_err
    raise RuntimeError("All OpenRouter model fallbacks failed")

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
    openrouter_model: str = "deepseek/deepseek-r1:free",
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
    openrouter_model: str = "deepseek/deepseek-r1:free",
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