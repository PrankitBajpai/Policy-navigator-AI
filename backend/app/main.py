from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
# ROOT
# =========================
@app.get("/")
def root():
    return {
        "message": "Policy Navigator Backend Running 🚀"
    }

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