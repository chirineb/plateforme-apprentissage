from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class PDF(Base):
    __tablename__ = "pdfs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    file_path = Column(String, nullable=False)  # Path to the stored file
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    course = relationship("Course", back_populates="pdfs")

    def __repr__(self):
        return f"<PDF id={self.id} title={self.title} course_id={self.course_id}>"
