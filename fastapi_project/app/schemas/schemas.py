from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from app.models.user import RoleEnum, LevelEnum
from typing import List, Optional 
from enum import Enum 


class LevelEnum(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

# Base schema (shared fields)
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: RoleEnum = RoleEnum.student
    level: LevelEnum = LevelEnum.beginner


# For creating a user (with password)
class UserCreate(UserBase):
    password: str

    @field_validator("email")
    def validate_email_domain(cls, v):
        allowed_domains = ["gmail.com", "uvt.rnu.tn", "isetbz.rnu.tn"]
        domain = v.split("@")[-1]
        if domain not in allowed_domains:
            raise ValueError(f"Email domain '{domain}' not allowed.")
        return v

# For updating a user
class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    role: RoleEnum | None = None
    level: LevelEnum | None = None
    password: str | None = None
    is_active: bool | None = None
    
# For returning a user (to client)
class UserOut(UserBase):
    id: int
    username: str
    email:str
    role: str 
    level: Optional[LevelEnum] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,  # obligatoire pour from_orm() en Pydantic v2
        "use_enum_values": True
    }

class TeacherOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    model_config = {
        "from_attributes": True
    }


#courses
class CourseBase(BaseModel):
    title: str
    description: str | None = None
    is_published: bool | None = True
    

class CourseCreate(CourseBase):
    title: str
    description: str | None = None
    is_published: bool = True
    teacher_id: int

class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None

class CourseOut(CourseBase):
    id: int
    title: str
    description: str | None
    is_published: bool
    teacher: Optional[TeacherOut] = None    
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }    



class PDFOut(BaseModel):
    id: int
    title: str
    uploaded_at: datetime
    course_id: int

    model_config = {
        "from_attributes": True
    }

    
#enrollement
class EnrollmentBase(BaseModel):
    course_id: int

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentOut(EnrollmentBase):
    id: int
    student_id: int
    enrolled_at: datetime

    model_config = {"from_attributes": True}



#quiz 

class QuizOptionCreate(BaseModel):
    text: str
    is_correct: bool


class QuizQuestionCreate(BaseModel):
    question: str
    options: List[QuizOptionCreate]


class QuizCreate(BaseModel):
    title: str
    course_id: int
    questions: List[QuizQuestionCreate]

class QuizAnswer(BaseModel):
    question_id: int
    option_id: int


class QuizSubmit(BaseModel):
    answers: List[QuizAnswer]

class QuizOptionOut(BaseModel):
    id: int
    text: str

    model_config = {"from_attributes": True}

class QuizQuestionOut(BaseModel):
    id: int
    question: str
    options: List[QuizOptionOut]

    model_config = {"from_attributes": True}

class QuizOut(BaseModel):
    id: int
    title: str
    course_id: int
    created_at: Optional[datetime] = None
    questions: Optional[List] = []

    class Config:
        from_attributes = True
    
class QuizResultOut(BaseModel):
    score: int
    total: int
    percentage: float
    passed: bool
    can_retry: bool

#Admin
class AdminDashboardOut(BaseModel):
    total_users: int
    total_students: int
    total_teachers: int
    total_courses: int
    total_pdfs: int
    total_enrollments: int

class UpdateUserRole(BaseModel):
    role: RoleEnum

class CourseAdminOut(BaseModel):
    id: int
    title: str
    description: str | None
    is_published: bool
    teacher_id: int
    teacher_name: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
