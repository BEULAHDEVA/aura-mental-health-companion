from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
import datetime

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=schemas.DashboardData)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    recent_entries = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id
    ).order_by(models.JournalEntry.created_at.desc()).limit(10).all()
    
    stats = db.query(models.UserStats).filter(
        models.UserStats.user_id == current_user.id
    ).first()
    
    # Generate a simple weekly report summary
    # In a real app, you'd send the last 7 days of summaries to an LLM
    report = "Your mood has been relatively stable this week. You showed resilience during academic stress on Tuesday. Keep up the 4-7-8 breathing exercises!"
    
    return {
        "recent_entries": recent_entries,
        "stats": stats,
        "weekly_report": report
    }

@router.get("/stress-trends")
def get_stress_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Last 7 journal entries for the graph
    entries = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id
    ).order_by(models.JournalEntry.created_at.asc()).limit(14).all()
    
    return [
        {"name": e.created_at.strftime("%a"), "stress": e.stress_score}
        for e in entries
    ]

