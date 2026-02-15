from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    entries = relationship("JournalEntry", back_populates="owner")
    stats = relationship("UserStats", back_populates="user", uselist=False)

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    encrypted_content = Column(Text, nullable=False)
    sentiment_score = Column(Float)
    emotion_label = Column(String)
    stress_score = Column(Float) # 1-10 scale
    stress_level = Column(String)
    analysis_summary = Column(Text)
    is_high_risk = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))

    owner = relationship("User", back_populates="entries")

class ActivitySession(Base):
    __tablename__ = "activity_sessions"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String) # "game", "pomodoro", "breathing"
    score = Column(Integer, default=0)
    duration_seconds = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))

class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    streak_count = Column(Integer, default=0)
    xp_points = Column(Integer, default=0)
    pomodoro_completed = Column(Integer, default=0)
    last_journal_date = Column(DateTime)

    user = relationship("User", back_populates="stats")

