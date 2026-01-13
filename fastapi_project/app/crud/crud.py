from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.user import RoleEnum
from app.models.course import Course
from app.models.pdf import PDF
from app.models.enrollment import Enrollment
from app.schemas.schemas import UserCreate, UserUpdate, CourseCreate, CourseUpdate
from app.models.quiz import Quiz, QuizOption, QuizQuestion, QuizResult
from app.schemas.schemas import QuizCreate, QuizAnswer, QuizOut
from sqlalchemy import and_



class UserCRUD:

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
        db_user = User(
            username=user.username,
            email=user.email,
            password=user.password,  
            role=user.role,
            level=user.level,
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
        for field, value in update_data.items():
            setattr(db_user, field, value)  # store plain password directly
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

    def verify_password(self, plain_password: str, db_password: str) -> bool:
        """Compare plain password directly"""
        return plain_password == db_password


user_crud = UserCRUD()

# Courses CRUD

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

# PDFs CRUD

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


# Enrollment CRUD

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


enrollment_crud = EnrollmentCRUD()

#quiz crud

PASS_SCORE = 70  

class QuizCRUD:
    # Création d'un quiz (prof/admin)

    async def create_quiz(self, db: AsyncSession, quiz_data: QuizCreate, user_id: int, user_role: RoleEnum):
        course_res = await db.execute(
            select(Course).where(Course.id == quiz_data.course_id)
        )
        course = course_res.scalars().first()

        if not course:
            raise ValueError("Course not found")

        # Vérification des permissions
        if user_role == RoleEnum.teacher and course.teacher_id != user_id:
            raise ValueError("Not authorized to create quiz for this course")

        # Créer le quiz
        quiz = Quiz(
            title=quiz_data.title,
            course_id=quiz_data.course_id
        )
        db.add(quiz)
        await db.commit()
        await db.refresh(quiz)

        # Créer questions + options
        for q in quiz_data.questions:
            question = QuizQuestion(
                quiz_id=quiz.id,
                question=q.question
            )
            db.add(question)
            await db.flush()  # pour récupérer question.id

            for opt in q.options:
                option = QuizOption(
                    question_id=question.id,
                    text=opt.text,
                    is_correct=opt.is_correct
                )
                db.add(option)

        await db.commit()
        return quiz

    
    async def get_quiz_by_id(self, db: AsyncSession, quiz_id: int):
        result = await db.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id)
            .options(
                selectinload(Quiz.questions)
                .selectinload(QuizQuestion.options)
            )
        )
        quiz = result.scalars().first()
        return quiz


    # SUBMIT QUIZ (STUDENT)
    
    async def submit_quiz(
        self,
        db: AsyncSession,
        user_id: int,
        quiz_id: int,
        answers: list[QuizAnswer]
    ):
        # Vérifier si déjà validé
        passed_res = await db.execute(
            select(QuizResult).where(
                and_(
                    QuizResult.user_id == user_id,
                    QuizResult.quiz_id == quiz_id,
                    QuizResult.passed == True
                )
            )
        )
        passed_result = passed_res.scalars().first()

        if passed_result:
            return {
                "score": passed_result.score,
                "total": passed_result.total,
                "percentage": passed_result.percentage,
                "passed": True,
                "can_retry": False
            }

        # Charger quiz + questions + options
        quiz_res = await db.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id)
            .options(
                selectinload(Quiz.questions)
                .selectinload(QuizQuestion.options)
            )
        )
        quiz = quiz_res.scalars().first()

        if not quiz:
            raise ValueError("Quiz not found")

        total_questions = len(quiz.questions)
        if total_questions == 0:
            raise ValueError("Quiz has no questions")


        # Calcul du score (SÉCURISÉ)
        score = 0
        answered_questions = set()

        for answer in answers:
            option_res = await db.execute(
                select(QuizOption)
                .join(QuizQuestion)
                .where(
                    QuizOption.id == answer.option_id,
                    QuizQuestion.quiz_id == quiz_id
                )
            )
            option = option_res.scalars().first()

            if not option:
                continue  # option invalide

            question_id = option.question_id
            if question_id in answered_questions:
                continue  # déjà répondu

            answered_questions.add(question_id)

            if option.is_correct:
                score += 1

        percentage = round((score / total_questions) * 100, 2)
        passed = percentage >= PASS_SCORE

        # Sauvegarder le résultat
        quiz_result = QuizResult(
            user_id=user_id,
            quiz_id=quiz_id,
            score=score,
            total=total_questions,
            percentage=percentage,
            passed=passed
        )
        db.add(quiz_result)
        await db.commit()

        # Mettre à jour le niveau utilisateur
        await self.update_user_level(db, user_id)

        return {
            "score": score,
            "total": total_questions,
            "percentage": percentage,
            "passed": passed,
            "can_retry": not passed
        }

    # UPDATE USER LEVEL

    async def update_user_level(self, db: AsyncSession, user_id: int):
        res = await db.execute(
            select(QuizResult).where(QuizResult.user_id == user_id)
        )
        results = res.scalars().all()

        if not results:
            return

        avg = sum(r.percentage for r in results) / len(results)

        user_res = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_res.scalars().first()

        if not user:
            return

        if avg >= 80:
            user.level = "advanced"
        elif avg >= 50:
            user.level = "intermediate"
        else:
            user.level = "beginner"
        await db.commit()

quiz_crud = QuizCRUD()



