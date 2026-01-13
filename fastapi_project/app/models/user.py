from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

# RoleEnum avec Python enum
class RoleEnum(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class LevelEnum(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # ✅ Utiliser SQLEnum ici pour éviter les collisions avec Python Enum
    role = Column(SQLEnum(RoleEnum, native_enum=False), nullable=False, default=RoleEnum.student)
    level = Column(SQLEnum(LevelEnum, native_enum=False), nullable=False, default=LevelEnum.beginner)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    courses = relationship("Course", back_populates="owner", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")

    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")




