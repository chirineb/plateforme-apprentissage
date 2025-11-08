from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas import schemas
from app.crud.crud import course_crud
from app.models.user import User 
from app.api.auth import verify_role

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("/", response_model=schemas.CourseOut)
async def create_course(
    course: schemas.CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_role(["teacher", "admin"]))
):
    db_course = await course_crud.create_course(db, course, current_user.id)
    return db_course

@router.get("/", response_model=List[schemas.CourseOut])
async def read_courses(db: AsyncSession = Depends(get_db)):
    return await course_crud.get_courses(db)

@router.get("/{course_id}", response_model=schemas.CourseOut)
async def read_course(course_id: int, db: AsyncSession = Depends(get_db)):
    course = await course_crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=schemas.CourseOut)
async def update_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_role(["teacher", "admin"]))
):
    course = await course_crud.update_course(db, course_id, course_update)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.delete("/{course_id}", response_model=schemas.CourseOut)
async def delete_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_role(["teacher", "admin"]))
):
    course = await course_crud.delete_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course