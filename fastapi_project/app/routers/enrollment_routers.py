from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas import schemas
from app.crud.crud import EnrollmentCRUD
from app.models.user import User, RoleEnum
from app.core.permissions import allow_roles
router = APIRouter(prefix="/enrollments", tags=["Enrollments"])
enrollment_crud = EnrollmentCRUD()

@router.post("/", response_model=schemas.EnrollmentOut)
async def enroll_in_course(
    enrollment: schemas.EnrollmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allow_roles(RoleEnum.student)) 
):
    return await enrollment_crud.enroll_student(db, current_user.id, enrollment.course_id)
