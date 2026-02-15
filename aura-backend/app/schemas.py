from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JournalEntryBase(BaseModel):
    content: str

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryResponse(BaseModel):
    id: int
    content: Optional[str] = None # Added content field for UI
    sentiment_score: Optional[float]
    emotion_label: Optional[str]
    stress_score: Optional[float]
    stress_level: Optional[str] = "Moderate"
    analysis_summary: Optional[str] = None
    is_high_risk: bool
    created_at: datetime


    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    streak_count: int
    xp_points: int
    
    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    recent_entries: List[JournalEntryResponse]
    stats: UserStatsResponse
    weekly_report: Optional[str]
