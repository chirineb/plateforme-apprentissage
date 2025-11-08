from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from enum import Enum

# Same enum for the API layer
class RoleEnum(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

# Base schema (shared fields)
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: RoleEnum = RoleEnum.student

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
    password: str | None = None
    is_active: bool | None = None

# For returning a user (to client)
class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,  # obligatoire pour from_orm() en Pydantic v2
        "use_enum_values": True
    }

#courses
class CourseBase(BaseModel):
    title: str
    description: str | None = None
    is_published: bool | None = True
    

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None

class CourseOut(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }    

class PDFBase(BaseModel):
    title: str
    file_path: str

class PDFCreate(PDFBase):
    pass

class PDFOut(PDFBase):
    id: int
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
