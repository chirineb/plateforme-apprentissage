from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload


from app.core.permissions import allow_roles
from app.models.user import RoleEnum, User
from app.db.database import get_db
from app.crud.crud import course_crud
from app.models.course import Course
from app.models.pdf import PDF
from app.models.quiz import Quiz
from app.models.enrollment import Enrollment
from app.schemas.schemas import UserOut, AdminDashboardOut, UpdateUserRole, CourseOut, CourseAdminOut, CourseCreate

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard", response_model=AdminDashboardOut)
async def admin_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    total_users = await db.scalar(select(func.count(User.id)))
    total_courses = await db.scalar(select(func.count(Course.id)))
    total_pdfs = await db.scalar(select(func.count(PDF.id)))
    total_enrollments = await db.scalar(select(func.count(Enrollment.id)))
    total_students = await db.scalar(select(func.count(User.id)).where(User.role == RoleEnum.student))
    total_teachers = await db.scalar(select(func.count(User.id)).where(User.role == RoleEnum.teacher))

    return AdminDashboardOut(
        total_users=total_users,
        total_students=total_students,
        total_teachers=total_teachers,
        total_courses=total_courses,
        total_pdfs=total_pdfs,
        total_enrollments=total_enrollments
    )
@router.get("/users", response_model=list[UserOut])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    data: UpdateUserRole,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    #Chercher l'utilisateur
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #Modifier le rôle
    user.role = data.role

    #Sauvegarder en base
    await db.commit()
    await db.refresh(user)

    return {
        "message": "User role updated successfully",
        "user_id": user.id,
        "new_role": user.role
    }

@router.patch("/users/{user_id}/toggle_active")
async def toggle_user_active(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    await db.commit()
    await db.refresh(user)

    status = "active" if user.is_active else "inactive"
    return {"message": f"User is now {status}", "user_id": user.id, "is_active": user.is_active}

# ---------------- Delete user ----------------
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()

    return {"message": "User deleted successfully", "user_id": user_id}

@router.get("/courses", response_model=list[CourseAdminOut])
async def get_all_courses(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    # On charge le cours et son propriétaire (professeur)
    result = await db.execute(
        select(Course).options(selectinload(Course.owner))
    )
    courses = result.scalars().all()

    # On transforme les objets en dictionnaire attendu par le schema
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "is_published": c.is_published,
            "teacher_id": c.owner.id,
            "teacher_name": c.owner.username,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        }
        for c in courses
    ]

@router.post("/courses", response_model=CourseOut)
async def create_course_as_admin(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    
    # Vérifier que le teacher existe
    teacher = await db.get(User, course_data.teacher_id)
    if not teacher or teacher.role != RoleEnum.teacher:
        raise HTTPException(status_code=400, detail="Invalid teacher ID")
    
    new_course = await course_crud.create_course(
        db=db,
        course=course_data,
        teacher_id=course_data.teacher_id
    )
    
    return new_course

@router.delete("/courses/{course_id}", response_model=dict)
async def delete_course_as_admin(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    # Vérifier si le cours existe
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Cours non trouvé")
    
    await db.delete(course)
    await db.commit()
    
    return {"message": "Cours supprimé avec succès", "course_id": course_id}
 
############## 

@router.get("/courses/{course_id}")
async def get_course_by_id(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(allow_roles(RoleEnum.admin))
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # PDFs du cours
    result_pdfs = await db.execute(select(PDF).where(PDF.course_id == course_id))
    pdfs = result_pdfs.scalars().all()

    # Quiz du cours
    result_quiz = await db.execute(select(Quiz).where(Quiz.course_id == course_id))
    quizzes = result_quiz.scalars().all()

    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "teacher_id": course.owner.id,
            "teacher_name": course.owner.username,
        },
        "pdfs": [{"id": p.id, "title": p.title, "file_url": p.file_url} for p in pdfs],
        "quizzes": [{"id": q.id, "title": q.title} for q in quizzes],
    }