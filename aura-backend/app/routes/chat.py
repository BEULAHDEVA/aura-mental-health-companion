from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
from ..services import hf_service
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    model_type: str = "gemini" # Default to gemini, can be 'aura'

@router.post("/message")
async def chat_message(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Choose between local LLM or Gemini
    if req.model_type == "aura":
        try:
            from ..services import local_llm_service
            response_text = await local_llm_service.generate_response(req.message)
            # For local model, we use simple heuristic analysis or fallback
            stress_score = 3 
            emotion_label = "Calm"
            sentiment = "Neutral"
            keywords = []
            rec_action = "Continue reflecting"
            is_crisis = False
        except Exception as e:
            print(f"Local LLM Error: {e}")
            response_text = "Mini-Aura is still processing. Try Gemini for now."
            stress_score = 5
            emotion_label = "Neutral"
            sentiment = "Neutral"
            keywords = []
            rec_action = "None"
            is_crisis = False
    else:
        # Use Gemini for the LLM response and analysis
        try:
            from ..services import gemini_service
            gemini_data = await gemini_service.get_gemini_response(req.message)
            
            response_text = gemini_data.get("reply", "I'm here for you.")
            analysis_obj = gemini_data.get("analysis", {})
            
            stress_score = analysis_obj.get("stress_score", 5)
            emotion_label = analysis_obj.get("emotion_detected", "Neutral")
            sentiment = analysis_obj.get("sentiment", "Neutral")
            keywords = analysis_obj.get("keywords_found", [])
            rec_action = analysis_obj.get("recommended_action", "None")
            is_crisis = analysis_obj.get("crisis_flag", False)
        except Exception as e:
            print(f"Gemini Error: {e}")
            response_text = "I'm here for you. Tell me more about what's on your mind. 🌿"
            stress_score = 5
            emotion_label = "Neutral"
            sentiment = "Neutral"
            keywords = []
            rec_action = "None"
            is_crisis = False

    # Map stress score to level for UI
    stress_level = "Low"
    if stress_score >= 10: stress_level = "Critical"
    elif stress_score >= 7: stress_level = "High"
    elif stress_score >= 4: stress_level = "Moderate"

    analysis = {
        "sentiment": sentiment,
        "stress_level": stress_level,
        "stress_score": stress_score,
        "emotion_detected": emotion_label,
        "keywords_detected": keywords,
        "recommended_action": rec_action,
        "crisis_flag": is_crisis or stress_score >= 10
    }


    # Persist to DB
    db_entry = models.JournalEntry(
        encrypted_content=f"[Chat Log]: {req.message}",
        sentiment_score=1.0 if sentiment == "Positive" else -1.0 if sentiment == "Negative" else 0.0,
        emotion_label=emotion_label,
        stress_score=stress_score,
        stress_level=stress_level,
        user_id=current_user.id
    )
    db.add(db_entry)
    
    # Update XP for chatting
    stats = db.query(models.UserStats).filter(models.UserStats.user_id == current_user.id).first()
    if stats:
        stats.xp_points += 5
    
    db.commit()

    return {
        "reply": response_text,
        "analysis": analysis
    }

