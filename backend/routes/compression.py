from fastapi import APIRouter, UploadFile, File
from compressai_utils import compress_image
from database import db
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}

@router.post("/compress")
async def compress(file: UploadFile = File(...), quality: int = 4):
  file_ext = os.path.splitext(file.filename)[1].lower()
  if file_ext not in ALLOWED_EXTENSIONS:
    return {"error": f"unsupported file type. allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}
  
  try:
      file_path = os.path.join(UPLOAD_DIR, file.filename)
      with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
      
      print(f"File saved to {file_path}")

      output_path = os.path.join(UPLOAD_DIR, "compressed_" + file.filename)
      print(f"Output path will be {output_path}")
      print(f"Starting compression with quality {quality}")

      results = compress_image(file_path, output_path, quality)


      image_record = await db.compressedimage.create(
         data={
            "filename": file.filename,
            "compressedFilename": "compressed_" + file.filename,
            "quality": quality,
            "bpp": results["bpp"],
            "psnr": results["psnr"],
            "ssim": results["ssim"],
            "msSsim": results["ms_ssim"]
         }
      )

      return {
        "message": "compression successful",
        "compressed_image": output_path,
        "metrics": results,
        "database_id": image_record.id
      }
  except Exception as e:
     import traceback
     error_trace = traceback.format_exc()
     print(f"Error: {str(e)}")
     print(f"traceback: {error_trace}")
     return {"error": f"compression failed: {str(e)}", "traceback": error_trace}