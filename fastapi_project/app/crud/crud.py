from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from passlib.context import CryptContext
from app.models.user import User
from app.models.course import Course
from app.models.pdf import PDF
from app.models.enrollment import Enrollment
from app.schemas.schemas import UserCreate, UserUpdate, CourseCreate, CourseUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCRUD:
    def __init__(self):
        self.pwd_context = pwd_context

    async def get_user_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_user_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalars().first()

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> User | None:
        result = await db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def get_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    async def create_user(self, db: AsyncSession, user: UserCreate) -> User:
        hashed_password = self._hash_password(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role,
            is_active=True
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def update_user(self, db: AsyncSession, user_id: int, user_update: UserUpdate) -> User | None:
        result = await db.execute(select(User).filter(User.id == user_id))
        db_user = result.scalars().first()
        
        if not db_user:
            return None

        update_data = user_update.dict(exclude_unset=True)
        
        # Handle password hashing separately
        if 'password' in update_data:
            update_data['hashed_password'] = self._hash_password(update_data.pop('password'))
        
        for field, value in update_data.items():
            setattr(db_user, field, value)

        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def delete_user(self, db: AsyncSession, user_id: int) -> User | None:
        result = await db.execute(select(User).filter(User.id == user_id))
        db_user = result.scalars().first()
        
        if not db_user:
            return None

        await db.delete(db_user)
        await db.commit()
        return db_user

    def _hash_password(self, password: str) -> str:
        """Hash password with bcrypt, ensuring it's within 72 bytes limit"""
        # Encode to bytes first, then truncate to 72 bytes, then decode back
        password_bytes = password.encode('utf-8')[:72]
        truncated_password = password_bytes.decode('utf-8', errors='ignore')
        return self.pwd_context.hash(truncated_password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        # Apply same truncation logic for verification
        password_bytes = plain_password.encode('utf-8')[:72]
        truncated_password = password_bytes.decode('utf-8', errors='ignore')
        return self.pwd_context.verify(truncated_password, hashed_password)

# Create a singleton instance
user_crud = UserCRUD()

#courses
class CourseCRUD:
    async def create_course(self, db: AsyncSession, course: CourseCreate, teacher_id: int):
        db_course = Course(
            title=course.title,
            description=course.description,
            teacher_id=teacher_id
        )
        db.add(db_course)
        await db.commit()
        await db.refresh(db_course)
        return db_course

    async def get_courses(self, db: AsyncSession):
        result = await db.execute(select(Course))
        return result.scalars().all()

    async def get_course_by_id(self, db: AsyncSession, course_id: int):
        result = await db.execute(select(Course).where(Course.id == course_id))
        return result.scalar_one_or_none()

    async def update_course(self, db: AsyncSession, course_id: int, course_update: CourseUpdate):
        course = await self.get_course_by_id(db, course_id)
        if not course:
            return None
        for key, value in course_update.dict(exclude_unset=True).items():
            setattr(course, key, value)
        await db.commit()
        await db.refresh(course)
        return course

    async def delete_course(self, db: AsyncSession, course_id: int):
        course = await self.get_course_by_id(db, course_id)
        if not course:
            return None
        await db.delete(course)
        await db.commit()
        return course

course_crud = CourseCRUD()

#pdfs 
class PDFCRUD:
    async def create_pdf(self, db: AsyncSession, pdf_data, course_id: int):
        db_pdf = PDF(**pdf_data.dict(), course_id=course_id)
        db.add(db_pdf)
        await db.commit()
        await db.refresh(db_pdf)
        return db_pdf

    async def get_pdfs_by_course(self, db: AsyncSession, course_id: int):
        result = await db.execute(select(PDF).where(PDF.course_id == course_id))
        return result.scalars().all()

    async def delete_pdf(self, db: AsyncSession, pdf_id: int):
        result = await db.execute(select(PDF).where(PDF.id == pdf_id))
        pdf = result.scalars().first()
        if not pdf:
            return None
        await db.delete(pdf)
        await db.commit()
        return pdf

pdf_crud = PDFCRUD()

#enrollement 
class EnrollmentCRUD:
    async def enroll_student(self, db: AsyncSession, student_id: int, course_id: int):
        enrollment = Enrollment(student_id=student_id, course_id=course_id)
        db.add(enrollment)
        await db.commit()
        await db.refresh(enrollment)
        return enrollment

    async def get_student_courses(self, db: AsyncSession, student_id: int):
        result = await db.execute(
            select(Enrollment).filter(Enrollment.student_id == student_id)
        )
        return result.scalars().all()
