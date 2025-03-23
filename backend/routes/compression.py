from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from compressai_utils import compress_image
import shutil
import os
import uuid
from typing import Dict, Any
import traceback

router = APIRouter()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}

@router.post("/compress")
async def compress(file: UploadFile = File(...), quality: int = Form(4)):
  if not file.filename:
    return {"error": "no file provided"}
    
  file_ext = os.path.splitext(file.filename)[1].lower()
  if file_ext not in ALLOWED_EXTENSIONS:
    return {"error": f"unsupported file type. allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}
  
  try:
      unique_id = str(uuid.uuid4())
      original_filename = f"{unique_id}_{file.filename}"
      file_path = os.path.join(UPLOAD_DIR, original_filename)
      
      with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
      
      print(f"File saved to {file_path}")

      compressed_filename = f"compressed_{unique_id}_{file.filename}"
      output_path = os.path.join(UPLOAD_DIR, compressed_filename)
      print(f"Output path will be {output_path}")
      print(f"Starting compression with quality {quality}")

      results = compress_image(file_path, output_path, quality)
      
      if "error" in results:
        print(f"Compression had an error but used fallback: {results['error']}")
        note = results.get("note", "Used fallback compression")
        
        return {
          "message": f"compression completed with fallback: {note}",
          "original_image": original_filename,
          "compressed_image": compressed_filename,
          "metrics": {
            "bpp": results.get("bpp", 0.0),
            "psnr": results.get("psnr", 0.0),
            "ssim": results.get("ssim", 0.0),
            "ms_ssim": results.get("ms_ssim", 0.0)
          },
          "size_comparison": {
            "original_size": os.path.getsize(file_path),
            "compressed_size": os.path.getsize(output_path),
            "reduction_percent": round((1 - os.path.getsize(output_path) / os.path.getsize(file_path)) * 100, 2)
          },
          "warning": results.get("error", "Compression used fallback method")
        }

      return {
        "message": "compression successful",
        "original_image": original_filename,
        "compressed_image": compressed_filename,
        "metrics": results,
        "size_comparison": {
          "original_size": os.path.getsize(file_path),
          "compressed_size": os.path.getsize(output_path),
          "reduction_percent": round((1 - os.path.getsize(output_path) / os.path.getsize(file_path)) * 100, 2)
        }
      }
  except Exception as e:
     error_trace = traceback.format_exc()
     print(f"Error: {str(e)}")
     print(f"traceback: {error_trace}")
     return {"error": f"compression failed: {str(e)}", "traceback": error_trace}