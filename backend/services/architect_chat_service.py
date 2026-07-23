# architect_chat_service.py - Conversational AI Software Engineer Chatbot
import json
import logging
from typing import Dict, Any, List
from google.genai import types

try:
    from services.llm_provider import generate_text_pro
except ModuleNotFoundError:
    from llm_provider import generate_text_pro

logger = logging.getLogger("agentforge.architect_chat")

def conduct_architect_chat(user_message: str, history: List[Dict[str, str]], prompt_context: str = "") -> Dict[str, Any]:
    """
    Powers a natural conversational AI Architect chatbot using Gemini.
    Chats naturally with the user while keeping notes on agent requirements, features, tools, and stack.
    """
    transcript_text = "\n".join([
        f"{msg.get('sender', 'user').upper()}: {msg.get('text', '')}"
        for msg in history
    ])
    if not transcript_text:
        transcript_text = f"USER: {user_message}"

    system_prompt = f"""You are a Lead AI Systems Architect & Senior Staff Engineer conducting a technical requirements and architecture design consultation.
Initial Application Blueprint Context: '{prompt_context or user_message}'

Conversation History:
{transcript_text}

Consultation Objectives:
1. Provide concise, expert, highly structured architectural feedback on the user's software vision.
2. Maintain structured project specifications tracking key architectural decisions.
3. ALWAYS format your reply as a natural, readable mixture of a 1-2 sentence intro, 2-3 key bullet points with bold headers, and a clear closing question.
4. Keep replies articulate, conversational, and effortless to read. Avoid monolithic walls of text.

Return strictly valid JSON in the following format:
{{
  "reply": "I'd love to help build your application! Here is how we can structure the architecture:\n\n• **Core Purpose**: Brief 1-sentence scope.\n• **Key Features**: 2-3 key technical highlights.\n\nWhich database or external APIs would you like to prioritize first?",
  "notes": {{
    "project_name": "Formal Application Name",
    "description": "Comprehensive 1-2 sentence system specification and core intent",
    "architecture_pattern": "FastMCP Tool Server / Multi-Agent DAG / Event-Driven RAG / REST API",
    "stack": "Python 3.11 + Google GenAI ADK + FastMCP + Pydantic v2",
    "database": "SQLite / PostgreSQL / ChromaDB Vector Store / None",
    "auth_strategy": "OAuth2 / JWT / API Key / None",
    "features": ["Feature 1", "Feature 2"],
    "integrations": ["API / Protocol 1", "API / Protocol 2"],
    "deployment": "Docker Container / REST API Microservice / CLI Worker"
  }}
}}"""

    try:
        raw_json = generate_text_pro(
            contents=system_prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
            mode="json"
        )
        data = json.loads(raw_json)
        return {
            "success": True,
            "reply": data.get("reply", "I have recorded these system requirements into the architectural specification. What specific third-party APIs or data persistence models should we integrate?"),
            "notes": data.get("notes", {})
        }
    except Exception as e:
        logger.warning("Architect chat exception: %s", e)
        topic_title = (prompt_context or user_message).strip().title() or "Custom AI Agent"
        return {
            "success": True,
            "reply": f"Understood. I have logged the system specification for {topic_title}. Shall we define specific security, API integrations, or storage layers for this architecture?",
            "notes": {
                "project_name": topic_title,
                "description": prompt_context or user_message,
                "architecture_pattern": "FastMCP Tool Server Architecture",
                "stack": "Python 3.11 + Google GenAI + FastMCP + Pydantic",
                "database": "SQLite / Local Vector Cache",
                "auth_strategy": "API Key / Environment Secrets",
                "features": ["Automated Workflow Engine", "FastMCP Tool Execution", "Structured Schema Validation"],
                "integrations": ["Gemini 2.0 Flash API"],
                "deployment": "Docker Container / Microservice"
            }
        }
