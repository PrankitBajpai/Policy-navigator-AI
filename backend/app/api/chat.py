from fastapi import APIRouter
from pydantic import BaseModel
from app.rag.rag_chain import ask_rag

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/")
async def chat(request: ChatRequest):

    response = ask_rag(request.query)

    return response