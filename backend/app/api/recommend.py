from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class RecommendationRequest(BaseModel):
    age: int
    income: int
    state: str
    occupation: str


@router.get("/")
async def recommend_status():
    return {
        "message": "Recommendation API Running"
    }


@router.post("/")
async def recommend_schemes(data: RecommendationRequest):

    recommendations = [
        "PM Kisan Samman Nidhi",
        "Ayushman Bharat",
        "PM Awas Yojana"
    ]

    return {
        "user_data": data,
        "recommended_schemes": recommendations
    }