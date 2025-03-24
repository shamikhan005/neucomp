from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routes.compression import router as compression_router
import os
from fastapi.responses import FileResponse
import pathlib

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(compression_router, prefix="/api")

frontend_build_dir = pathlib.Path(__file__).parent.parent / "frontend" / ".next"
if frontend_build_dir.exists():
    app.mount("/_next", StaticFiles(directory=str(frontend_build_dir / "static")), name="next-static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            return {"detail": "Not Found"}
            
        frontend_index = pathlib.Path(__file__).parent.parent / "frontend" / "out" / "index.html"
        if frontend_index.exists():
            return FileResponse(str(frontend_index))
        
        return {"message": "neucomp API is running. Frontend not built."}
else:
    @app.get("/")
    async def root():
        return {"message": "neucomp API is running."}