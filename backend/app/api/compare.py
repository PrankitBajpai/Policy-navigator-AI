from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CompareRequest(BaseModel):
    scheme_a: str
    scheme_b: str


@router.get("/")
async def compare_status():
    return {
        "message": "Compare API Running"
    }


@router.post("/")
async def compare_schemes(data: CompareRequest):

    comparison = {
        "scheme_a": data.scheme_a,
        "scheme_b": data.scheme_b,
        "comparison": f"Comparison between {data.scheme_a} and {data.scheme_b}"
    }

    return comparison