from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from service import apis
from db import prisma

load_dotenv()

if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/emergency_response"
    print(f"Warning: DATABASE_URL not found in environment. Using default: {os.getenv('DATABASE_URL')}")

@asynccontextmanager
async def lifespan(app: FastAPI):

    try:
        print("Connecting to database...")
        await prisma.connect()
        print("Connected to database successfully")
    except Exception as e:
        print(f"Error connecting to database: {e}")
    
    yield 

    try:
        await prisma.disconnect()
        print("Disconnected from database")
    except Exception as e:
        print(f"Error disconnecting from database: {e}")


app = FastAPI(
    title="Emergency Response API",
    description="API for Tamil Nadu Emergency Response System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(apis, prefix="/apis")

@app.get("/")
def read_root():
    return {"version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=5000, reload=True)
