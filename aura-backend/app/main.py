from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, journal, analytics, chat
import os
from dotenv import load_dotenv

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aura API", description="Privacy-First AI Mental Health Companion")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(analytics.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Aura API", "status": "online"}
