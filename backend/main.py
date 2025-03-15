from contextlib import asynccontextmanager
from fastapi import FastAPI
from routes.compression import router as compression_router
from database import db

@asynccontextmanager
async def lifespan(app: FastAPI):
  await db.connect()
  yield
  await db.disconnect()

app = FastAPI(lifespan=lifespan)
app.include_router(compression_router, prefix="/api")

@app.get("/")
async def root():
  return {"message": "neucomp API is running."}