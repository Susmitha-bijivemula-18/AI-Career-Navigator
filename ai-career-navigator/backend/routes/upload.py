# routes/upload.py - Handles PDF resume upload and skill extraction
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_parser import extract_text_from_pdf
from services.skill_extractor import extract_skills

router = APIRouter()

@router.post("/resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF file upload, extracts text, and returns matching skills.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # Read file contents into bytes
        file_bytes = await file.read()
        
        # Extract text from PDF
        text = extract_text_from_pdf(file_bytes)
        
        # Extract skills from text
        extracted_skills = extract_skills(text)
        
        return {"extracted_skills": extracted_skills}
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
