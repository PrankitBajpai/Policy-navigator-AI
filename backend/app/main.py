from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

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

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
# PYDANTIC MODEL
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


# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {
        "message": "Policy Navigator Backend Running 🚀"
    }


# =========================
# SAVE POLICY API
# =========================

@app.post("/saved-policies")
def save_policy(policy: Policy):

    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO saved_policies (
                scheme_id,
                name,
                category,
                state,
                ministry,
                benefit,
                eligibility,
                deadline,
                link,
                online
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(policy.id),
            policy.name,
            policy.category,
            policy.state,
            policy.ministry,
            policy.benefit,
            policy.eligibility,
            policy.deadline,
            policy.link,
            1 if policy.online else 0
        ))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": "Policy saved successfully"
        }

    except sqlite3.IntegrityError:
        return {
            "success": False,
            "message": "Policy already saved"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# =========================
# GET SAVED POLICIES
# =========================

@app.get("/saved-policies")
def get_saved_policies():

    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM saved_policies
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    policies = [dict(row) for row in rows]

    return policies


# =========================
# API ROUTES
# =========================

# AI Chat / RAG
app.include_router(
    chat_router,
    prefix="/chat",
    tags=["Chat"]
)

# Browse Schemes
app.include_router(
    schemes_router,
    prefix="/schemes",
    tags=["Schemes"]
)

# Compare Policies
app.include_router(
    compare_router,
    prefix="/compare",
    tags=["Compare"]
)

# Recommendation System
app.include_router(
    recommend_router,
    prefix="/recommend",
    tags=["Recommendations"]
)

# News API
app.include_router(
    news_router,
    prefix="/news",
    tags=["News"]
)

# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "backend": "running"
    }
@app.delete("/saved-policies/{scheme_id}")
def delete_saved_policy(scheme_id: str):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM saved_policies WHERE scheme_id = ?",
        (scheme_id,)
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Policy removed from saved"
    }
@app.delete("/saved-policies/{scheme_id}")
def delete_saved_policy(scheme_id: str):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM saved_policies WHERE scheme_id = ?",
        (scheme_id,)
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Policy removed from saved"
    }
app.include_router(
    schemes_router,
    prefix="/schemes",
    tags=["Schemes"]
)