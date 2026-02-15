from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
from ..services import encryption, gemini_service
import datetime

router = APIRouter(prefix="/journal", tags=["journal"])

@router.post("/entry", response_model=schemas.JournalEntryResponse)
async def create_entry(
    entry: schemas.JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Use Gemini for Analysis (as requested: "Send user journal input to Gemini")
    try:
        from ..services import gemini_service
        # For journal, we just want the analysis, so we can use the same service
        gemini_data = await gemini_service.get_gemini_response(f"JOURNAL ENTRY ANALYSIS: {entry.content}")
        analysis = gemini_data.get("analysis", {})
        
        stress_score = analysis.get("stress_score", 5)
        emotion_label = analysis.get("emotion_detected", "Neutral")
        sentiment = analysis.get("sentiment", "Neutral")
        keywords = analysis.get("keywords_found", [])
        rec_action = analysis.get("recommended_action", "None")
        is_crisis = analysis.get("crisis_flag", False)
    except Exception as e:
        print(f"Gemini Journal Analysis Error: {e}")
        stress_score = 5
        emotion_label = "Neutral"
        sentiment = "Neutral"
        keywords = []
        rec_action = "None"
        is_crisis = False

    stress_level = "Low"
    if stress_score >= 10: stress_level = "Critical"
    elif stress_score >= 7: stress_level = "High"
    elif stress_score >= 4: stress_level = "Moderate"

    # Encrypt content
    encrypted = encryption.encrypt_content(entry.content)
    
    # Save to DB
    db_entry = models.JournalEntry(
        encrypted_content=encrypted,
        sentiment_score=1.0 if sentiment == "Positive" else -1.0 if sentiment == "Negative" else 0.0,
        emotion_label=emotion_label,
        stress_score=stress_score,
        stress_level=stress_level,
        is_high_risk=is_crisis or stress_score >= 10,
        user_id=current_user.id
    )
    db.add(db_entry)
    
    # Update stats
    stats = db.query(models.UserStats).filter(models.UserStats.user_id == current_user.id).first()
    if stats:
        stats.xp_points += 10
        now = datetime.datetime.utcnow()
        stats.last_journal_date = now
    
    db.commit()
    db.refresh(db_entry)
    
    # Prepare response
    return {
        "id": db_entry.id,
        "content": entry.content,
        "sentiment_score": db_entry.sentiment_score,
        "emotion_label": db_entry.emotion_label,
        "stress_score": db_entry.stress_score,
        "stress_level": db_entry.stress_level,
        "is_high_risk": db_entry.is_high_risk,
        "created_at": db_entry.created_at
    }


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    entries = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id
    ).order_by(models.JournalEntry.created_at.desc()).all()
    
    # Decrypt for the user to see their own logs
    results = []
    for entry in entries:
        try:
            # If it's a chat log, it might not be full encryption or might have a prefix
            content = entry.encrypted_content
            if content.startswith("[Chat Log]: "):
                decrypted = content
            else:
                decrypted = encryption.decrypt_content(content)
        except:
            decrypted = "[Decryption Failed]"
            
        results.append({
            "id": entry.id,
            "content": decrypted,
            "sentiment_score": entry.sentiment_score,
            "emotion_label": entry.emotion_label,
            "stress_score": entry.stress_score,
            "stress_level": entry.stress_level,
            "analysis_summary": entry.analysis_summary,
            "is_high_risk": entry.is_high_risk,
            "created_at": entry.created_at
        })

    return results
