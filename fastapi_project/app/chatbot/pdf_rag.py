from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.chatbot.chat_ai import chat_with_user
from app.chatbot.pdf_rag import chat_with_pdf
from app.db.database import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# Requête envoyée par l'étudiant
class ChatRequest(BaseModel):
    question: str
    course_id: int | None = None  # facultatif, si tu veux utiliser le PDF RAG

@router.post("/ask")
async def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Chatbot pédagogique.
    Si course_id est fourni, utilise le PDF RAG.
    Sinon, chat général selon le profil de l'étudiant.
    """
    try:
        if request.course_id:
            # Chat avec le PDF du cours
            response = chat_with_pdf(
                user_id=current_user.id,
                course_id=request.course_id,
                question=request.question
            )
        else:
            # Chat général
            response = chat_with_user(
                user_id=current_user.id,
                level=current_user.level,
                field=current_user.field,
                goal=current_user.goal,
                question=request.question
            )

        return {"answer": response}  # frontend attend "answer"

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
