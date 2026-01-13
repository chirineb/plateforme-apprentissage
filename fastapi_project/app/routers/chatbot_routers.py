from fastapi import APIRouter
from pydantic import BaseModel
from app.chatbot.chat_ai import simple_chat  
router = APIRouter(prefix="/chatbot", tags=["Chatbot Simple"])


class ChatRequest(BaseModel):
    question: str

@router.post("/chat")  
async def chat(request: ChatRequest):
    """
    Chatbot simple : réponse à une question sans personnalisation
    """
    answer = simple_chat(request.question)  
    return {"answer": answer}
