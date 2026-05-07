from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

DATABASE_NAME = "policy.db"

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


class ChatRequest(BaseModel):
    message: str
    history: list = []


def search_saved_policies(query: str):
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    search_text = f"%{query}%"

    cursor.execute("""
        SELECT *
        FROM saved_policies
        WHERE 
            name LIKE ?
            OR category LIKE ?
            OR state LIKE ?
            OR ministry LIKE ?
            OR benefit LIKE ?
            OR eligibility LIKE ?
        LIMIT 5
    """, (
        search_text,
        search_text,
        search_text,
        search_text,
        search_text,
        search_text,
    ))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def build_policy_context(policies):
    if not policies:
        return ""

    context = ""

    for p in policies:
        context += f"""
Policy Name: {p.get("name")}
Category: {p.get("category")}
State: {p.get("state")}
Ministry: {p.get("ministry")}
Benefit: {p.get("benefit")}
Eligibility: {p.get("eligibility")}
Deadline: {p.get("deadline")}
Official Link: {p.get("link")}
Online Apply: {"Yes" if p.get("online") else "No"}
---
"""

    return context


@router.post("")
def chat_with_ai(req: ChatRequest):
    user_question = req.message

    matched_policies = search_saved_policies(user_question)
    policy_context = build_policy_context(matched_policies)

    if policy_context:
        system_prompt = f"""
You are PolicyNav AI, an Indian government policy assistant.

Answer the user's question using the saved policy database context below.

If the user asks about eligibility, benefits, deadline, application process, or comparison, answer clearly.

Saved Policy Database Context:
{policy_context}

Rules:
- Prefer database context first.
- Mention policy name clearly.
- If information is missing, say that it is not available in saved database.
- Keep answer simple and useful.
"""
    else:
        system_prompt = """
You are PolicyNav AI, an Indian government policy assistant.

The user's question was not found in the saved SQLite policy database.

Use your general knowledge to answer about Indian government schemes.

Rules:
- Give helpful information using Groq AI.
- Clearly mention that this answer is AI-generated because no matching saved policy was found.
- Explain eligibility, benefits, and how to apply if possible.
- Keep answer beginner-friendly.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]

    for item in req.history[-6:]:
        if item.get("role") in ["user", "assistant"]:
            messages.append({
                "role": item.get("role"),
                "content": item.get("content", "")
            })

    messages.append({
        "role": "user",
        "content": user_question,
    })

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.3,
        max_tokens=700,
    )

    reply = completion.choices[0].message.content

    return {
        "reply": reply,
        "source": "sqlite_database" if policy_context else "groq_ai"
    }