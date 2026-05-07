from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import json
import os
from groq import Groq

# ROUTES
from app.api.chat import router as chat_router
from app.api.schemes import router as schemes_router
from app.api.compare import router as compare_router
from app.api.recommend import router as recommend_router
from app.api.news import router as news_router

app = FastAPI(
    title="Policy Navigator API",
    description="RAG Based Government Policy Assistant",
    version="1.0.0"
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://rtghjmkloplkjnb.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SQLITE DATABASE
# =========================
DATABASE_NAME = "policy.db"

def init_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_policies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scheme_id TEXT UNIQUE,
            name TEXT,
            category TEXT,
            state TEXT,
            ministry TEXT,
            benefit TEXT,
            eligibility TEXT,
            deadline TEXT,
            link TEXT,
            online INTEGER
        )
    """)
    conn.commit()
    conn.close()

init_db()

# =========================
# PYDANTIC MODELS
# =========================
class Policy(BaseModel):
    id: str | int
    name: str
    category: str | None = None
    state: str | None = None
    ministry: str | None = None
    benefit: str | None = None
    eligibility: str | None = None
    deadline: str | None = None
    link: str | None = None
    online: bool | None = None

class CompareRequest(BaseModel):
    schemeA: str
    schemeB: str

class SchemeDetailRequest(BaseModel):
    scheme: dict

# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {"message": "Policy Navigator Backend Running"}

# =========================
# SAVE POLICY
# =========================
@app.post("/saved-policies")
def save_policy(policy: Policy):
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO saved_policies (
                scheme_id, name, category, state, ministry,
                benefit, eligibility, deadline, link, online
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(policy.id), policy.name, policy.category,
            policy.state, policy.ministry, policy.benefit,
            policy.eligibility, policy.deadline, policy.link,
            1 if policy.online else 0
        ))
        conn.commit()
        conn.close()
        return {"success": True, "message": "Policy saved successfully"}
    except sqlite3.IntegrityError:
        return {"success": False, "message": "Policy already saved"}
    except Exception as e:
        return {"success": False, "message": str(e)}

# =========================
# GET SAVED POLICIES
# =========================
@app.get("/saved-policies")
def get_saved_policies():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM saved_policies ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# =========================
# DELETE SAVED POLICY
# =========================
@app.delete("/saved-policies/{scheme_id}")
def delete_saved_policy(scheme_id: str):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM saved_policies WHERE scheme_id = ?", (scheme_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Policy removed from saved"}

# =========================
# COMPARE SCHEMES (GROQ)
# =========================
@app.post("/api/compare")
async def compare_schemes(request: CompareRequest):
    prompt = f"""You are an expert on Indian government schemes. Compare these two schemes and return ONLY valid JSON with no markdown or code blocks.

Scheme A: {request.schemeA}
Scheme B: {request.schemeB}

Return this exact JSON:
{{
  "summary": "3-4 sentence comparison paragraph explaining both schemes and who should choose which.",
  "schemeA": {{
    "id": 1,
    "name": "{request.schemeA}",
    "category": "fill this",
    "benefit": "fill this",
    "eligibility": "fill this",
    "deadline": "fill this",
    "link": "",
    "online": true
  }},
  "schemeB": {{
    "id": 2,
    "name": "{request.schemeB}",
    "category": "fill this",
    "benefit": "fill this",
    "eligibility": "fill this",
    "deadline": "fill this",
    "link": "",
    "online": true
  }},
  "comparison": [
    {{"field": "Category",     "schemeA": "value", "schemeB": "value"}},
    {{"field": "Ministry",     "schemeA": "value", "schemeB": "value"}},
    {{"field": "Main Benefit", "schemeA": "value", "schemeB": "value"}},
    {{"field": "Eligibility",  "schemeA": "value", "schemeB": "value"}},
    {{"field": "Deadline",     "schemeA": "value", "schemeB": "value"}},
    {{"field": "Apply Online", "schemeA": "Yes or No", "schemeB": "Yes or No"}},
    {{"field": "Target Group", "schemeA": "value", "schemeB": "value"}},
    {{"field": "Scheme Level", "schemeA": "Central or State", "schemeB": "Central or State"}}
  ]
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Return only valid JSON. No markdown. No code blocks. No explanation."},
                {"role": "user",   "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        return result
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# SCHEME DETAIL (GROQ)
# =========================
@app.post("/api/scheme-detail")
async def scheme_detail(request: SchemeDetailRequest):
    scheme = request.scheme
    name        = scheme.get("scheme_name") or scheme.get("name", "This scheme")
    category    = scheme.get("schemecategory") or scheme.get("category", "General")
    level       = scheme.get("level") or scheme.get("state", "Central")
    benefits    = scheme.get("benefits") or scheme.get("benefit", "Not specified")
    eligibility = scheme.get("eligibility", "Not specified")
    application = scheme.get("application", "Not specified")
    documents   = scheme.get("documents", "Not specified")

    prompt = f"""You are a helpful Indian government scheme advisor explaining to a common citizen.

Scheme: {name}
Category: {category}
Level: {level}
Benefits: {benefits}
Eligibility: {eligibility}
How to Apply: {application}
Documents: {documents}

Explain clearly with these sections:
1. **What is this scheme?**
2. **Who can apply?**
3. **What will you get?**
4. **How to apply?**
5. **Documents needed**
6. **Tips to remember**

Use simple language and bullet points."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# API ROUTES
# =========================
app.include_router(chat_router,     prefix="/chat",     tags=["Chat"])
app.include_router(schemes_router,  prefix="/schemes",  tags=["Schemes"])
app.include_router(compare_router,  prefix="/compare",  tags=["Compare"])
app.include_router(recommend_router,prefix="/recommend",tags=["Recommendations"])
app.include_router(news_router,     prefix="/news",     tags=["News"])

# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health_check():
    return {"status": "ok", "backend": "running"}