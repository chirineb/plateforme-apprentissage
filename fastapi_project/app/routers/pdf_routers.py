from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.schemas.schemas import PDFCreate, PDFOut
from app.crud.crud import pdf_crud
from app.api.auth import verify_role

router = APIRouter(prefix="/pdfs", tags=["PDFs"])

@router.post("/{course_id}", response_model=PDFOut)
async def add_pdf_to_course(
    course_id: int,
    pdf_data: PDFCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(verify_role(["teacher", "admin"]))
):
    return await pdf_crud.create_pdf(db, pdf_data, course_id)

@router.get("/course/{course_id}", response_model=List[PDFOut])
async def list_pdfs(course_id: int, db: AsyncSession = Depends(get_db)):
    return await pdf_crud.get_pdfs_by_course(db, course_id)

@router.delete("/{pdf_id}", response_model=PDFOut)
async def delete_pdf(
    pdf_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(verify_role(["teacher", "admin"]))
):
    pdf = await pdf_crud.delete_pdf(db, pdf_id)
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    return pdf
