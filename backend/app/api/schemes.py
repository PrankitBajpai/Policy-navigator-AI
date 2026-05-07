from fastapi import APIRouter
from pydantic import BaseModel
import csv
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "schemes_cleaned.csv")


def normalize_row(row, index):
    return {
        "id": row.get("id") or row.get("scheme_id") or str(index + 1),
        "name": row.get("name") or row.get("scheme_name") or row.get("title") or "",
        "category": row.get("category") or "General",
        "state": row.get("state") or "Central (All India)",
        "ministry": row.get("ministry") or row.get("department") or "Government of India",
        "benefit": row.get("benefit") or row.get("benefits") or row.get("summary") or "",
        "eligibility": row.get("eligibility") or "",
        "deadline": row.get("deadline") or "Not specified",
        "link": row.get("link") or row.get("url") or row.get("official_link") or "",
        "online": True,
    }


def load_schemes():
    schemes = []

    if not os.path.exists(CSV_PATH):
        return schemes

    with open(CSV_PATH, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for index, row in enumerate(reader):
            schemes.append(normalize_row(row, index))

    return schemes


@router.get("")
@router.get("/")
async def get_schemes():
    return load_schemes()


@router.get("/{scheme_id}")
async def get_scheme_by_id(scheme_id: str):
    schemes = load_schemes()

    for scheme in schemes:
        if str(scheme["id"]) == str(scheme_id):
            return scheme

    return {
        "message": "Scheme not found"
    }


class RecommendationRequest(BaseModel):
    age: int | None = None
    gender: str | None = None
    state: str | None = None
    category: str | None = None
    occupation: str | None = None
    income: str | None = None
    caste: str | None = None
    background: str | None = None


@router.post("/recommend")
async def recommend_schemes(user: RecommendationRequest):
    schemes = load_schemes()
    recommended = []

    user_text = f"""
    {user.age}
    {user.gender}
    {user.state}
    {user.category}
    {user.occupation}
    {user.income}
    {user.caste}
    {user.background}
    """.lower()

    for scheme in schemes:
        score = 0

        scheme_text = f"""
        {scheme.get("name")}
        {scheme.get("category")}
        {scheme.get("state")}
        {scheme.get("ministry")}
        {scheme.get("benefit")}
        {scheme.get("eligibility")}
        """.lower()

        if user.category and user.category.lower() in scheme_text:
            score += 4

        if user.state and (
            user.state.lower() in scheme_text
            or "central" in scheme.get("state", "").lower()
            or "all india" in scheme.get("state", "").lower()
        ):
            score += 3

        if user.gender and user.gender.lower() in scheme_text:
            score += 2

        if user.occupation and user.occupation.lower() in scheme_text:
            score += 3

        if user.caste and user.caste.lower() in scheme_text:
            score += 2

        if user.background and user.background.lower() in scheme_text:
            score += 2

        for word in user_text.split():
            if len(word) > 3 and word in scheme_text:
                score += 1

        if score > 0:
            item = scheme.copy()
            item["match_score"] = score
            recommended.append(item)

    recommended.sort(key=lambda x: x["match_score"], reverse=True)

    return recommended[:30]