from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from app.db.database import get_db
from app.schemas.schemas import QuizSubmit, QuizCreate, QuizOut
from app.crud.crud import QuizCRUD
from app.api.auth import get_current_user
from app.models.user import RoleEnum, User
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from app.core.permissions import allow_roles


router = APIRouter(prefix="/quizzes", tags=["Quiz"])

# Instancier QuizCRUD
quiz_crud = QuizCRUD()

# SUBMIT QUIZ (STUDENT)
@router.post("/{quiz_id}/submit")
async def submit_quiz_endpoint(
    quiz_id: int,
    data: QuizSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.student:
        raise HTTPException(status_code=403, detail="Only students can submit quizzes")

    result = await quiz_crud.submit_quiz(db, current_user.id, quiz_id, data.answers)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result

# CREATE QUIZ (TEACHER/ADMIN)
@router.post("/create", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
async def create_quiz_endpoint(
    quiz_data: QuizCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allow_roles(RoleEnum.teacher, RoleEnum.admin))
):
    quiz = await quiz_crud.create_quiz(db, quiz_data, current_user.id, current_user.role)
    return quiz

# GET QUIZ
@router.get("/{quiz_id}")
async def get_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = await quiz_crud.get_quiz_by_id(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return {
        "id": quiz.id,
        "title": quiz.title,
        "course_id": quiz.course_id,
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "options": [{"id": o.id, "text": o.text, "is_correct": o.is_correct} for o in q.options]
            } for q in quiz.questions
        ]
    }

# GET QUIZZES BY COURSE
@router.get("/course/{course_id}")
async def get_quizzes_by_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Quiz)
        .where(Quiz.course_id == course_id)
        .options(selectinload(Quiz.questions).selectinload(QuizQuestion.options))
    )
    quizzes = result.scalars().all()

    return quizzes
