import os
from dotenv import load_dotenv

# LOAD ENV VARIABLES
load_dotenv()

# =========================================
# API KEYS
# =========================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# =========================================
# MODEL CONFIG
# =========================================

MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "llama-3.1-8b-instant"
)

# =========================================
# DATABASE
# =========================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./policies.db"
)

# =========================================
# VECTOR DATABASE
# =========================================

VECTOR_DB_PATH = "app/vectorstore/faiss_index"

# =========================================
# EMBEDDING MODEL
# =========================================

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# =========================================
# CHUNK SETTINGS
# =========================================

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

# =========================================
# NEWS API
# =========================================

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

# =========================================
# APP SETTINGS
# =========================================

APP_NAME = "Policy Navigator AI"

DEBUG = True