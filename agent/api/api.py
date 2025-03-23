from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from service import apis
from db import prisma

load_dotenv()

# Check if DATABASE_URL is set
if not os.getenv("DATABASE_URL"):
    # Set a default DATABASE_URL if not provided in environment
    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/emergency_response"
    print(f"Warning: DATABASE_URL not found in environment. Using default: {os.getenv('DATABASE_URL')}")

# Define lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to the database
    try:
        print("Connecting to database...")
        await prisma.connect()
        print("Connected to database successfully")
    except Exception as e:
        print(f"Error connecting to database: {e}")
        # Don't raise the exception here to allow the application to start anyway
        # This helps for debugging or if you want to run without a database during development
    
    yield  # This is where FastAPI runs and serves requests
    
    # Shutdown: disconnect from the database
    try:
        await prisma.disconnect()
        print("Disconnected from database")
    except Exception as e:
        print(f"Error disconnecting from database: {e}")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Emergency Response API",
    description="API for Tamil Nadu Emergency Response System",
    version="1.0.0",
    lifespan=lifespan
)

# Add GZip middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API router
app.include_router(apis, prefix="/apis")

# Root endpoint
@app.get("/")
def read_root():
    return {"version": "1.0.0"}

# Run the FastAPI app with uvicorn when this script is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=5000, reload=True)
