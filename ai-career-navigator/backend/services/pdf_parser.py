# services/pdf_parser.py - Extract raw text from uploaded PDF using PyMuPDF
import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file provided as bytes.
    Raises ValueError if no extractable text is found.
    """
    try:
        # Open the PDF from bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Failed to open PDF file: {str(e)}")
    
    text = ""
    for page in doc:
        text += page.get_text()
    
    doc.close()
    
    # Check if the extracted text is empty or just whitespace
    if not text.strip():
        raise ValueError("No extractable text found in the PDF. Please ensure it is not a scanned image.")
        
    return text
