from fastapi import (APIRouter, Depends, UploadFile, File, Form, status, HTTPException)
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os
import shutil
from pathlib import Path
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy import select
from app.db.database import get_db
from app.models.pdf import PDF
from app.schemas.schemas import PDFOut
from app.models.user import User, RoleEnum
from app.core.permissions import allow_roles

router = APIRouter(prefix="/pdfs", tags=["PDFs"])

# Where PDFs will be stored
UPLOAD_DIR = "app/uploads/pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# UPLOAD PDF TO A COURSE

@router.post(
    "/upload",
    response_model=PDFOut,
    status_code=status.HTTP_201_CREATED
)
async def upload_pdf_to_course(
    course_id: int = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allow_roles(RoleEnum.teacher, RoleEnum.admin)),
    ):
    #Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    #Save file
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    #Save metadata in DB
    pdf = PDF(
        title=title,
        file_path=file_path,
        course_id=course_id
    )

    db.add(pdf)
    await db.commit()
    await db.refresh(pdf)

    return pdf


#  LIST PDFs BY COURSE

@router.get(
    "/course/{course_id}",
    response_model=List[PDFOut]
)
async def get_pdfs_by_course(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PDF).where(PDF.course_id == course_id)
    )
    return result.scalars().all()



@router.delete("/{pdf_id}")
async def delete_pdf(
    pdf_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allow_roles(RoleEnum.teacher, RoleEnum.admin)),
):
    result = await db.execute(
        select(PDF).where(PDF.id == pdf_id)
    )
    pdf = result.scalar_one_or_none()

    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    # 🗑 supprimer le fichier du disque
    if pdf.file_path and os.path.exists(pdf.file_path):
        os.remove(pdf.file_path)

    await db.delete(pdf)
    await db.commit()

    return JSONResponse(
        status_code=200,
        content={"message": "PDF supprimé avec succès"}
    )

@router.get("/{pdf_id}/open")
async def open_pdf(
    pdf_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(allow_roles(RoleEnum.teacher, RoleEnum.admin, RoleEnum.student)),
):
    result = await db.execute(
        select(PDF).where(PDF.id == pdf_id)
    )
    pdf = result.scalar_one_or_none()

    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    file_path = Path(pdf.file_path)  # ✅ s'assurer que Path est importé

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=str(file_path),  # ✅ convertir en string si nécessaire
        media_type="application/pdf",
        filename=file_path.name
    )