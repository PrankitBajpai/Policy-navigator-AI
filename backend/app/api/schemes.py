from fastapi import APIRouter

router = APIRouter()

dummy_schemes = [
    {
        "id": 1,
        "name": "PM Kisan Samman Nidhi",
        "category": "Agriculture",
        "state": "Central",
        "benefit": "₹6000/year"
    },
    {
        "id": 2,
        "name": "Ayushman Bharat",
        "category": "Health",
        "state": "Central",
        "benefit": "₹5 lakh health cover"
    }
]


@router.get("/")
async def get_schemes():
    return dummy_schemes


@router.get("/{scheme_id}")
async def get_scheme_by_id(scheme_id: int):

    for scheme in dummy_schemes:
        if scheme["id"] == scheme_id:
            return scheme

    return {
        "message": "Scheme not found"
    }