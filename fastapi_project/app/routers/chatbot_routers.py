from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.crud.crud import course_crud

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_user(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = request.message.lower()

    # Personalized greeting
    if "bonjour" in message or "salut" in message:
        return {"reply": f"Bonjour {current_user.username}! Comment puis-je t’aider aujourd’hui ? 😊"}

    # Example: show enrolled courses
    if "mes cours" in message:
        courses = await course_crud.get_courses_by_user(db, current_user.id)
        if not courses:
            return {"reply": "Tu n'es inscrit à aucun cours pour le moment."}
        course_titles = ", ".join([c.title for c in courses])
        return {"reply": f"Voici tes cours actuels : {course_titles}"}

    # Default response
    return {"reply": f"{current_user.username}, je n’ai pas bien compris ta question. Peux-tu reformuler ? 🤔"}
