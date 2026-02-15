import httpx
import os
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL_SENTIMENT = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
API_URL_EMOTION = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"
API_URL_RISK = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
API_URL_CHAT = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
API_URL_MENTAL_HEALTH = "https://api-inference.huggingface.co/models/rabiaqayyum/bert-base-uncased-mental-health-classification"
headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

async def query_hf(api_url, payload):
    async with httpx.AsyncClient() as client:
        response = await client.post(api_url, headers=headers, json=payload, timeout=30.0)
        return response.json()

async def get_sentiment(text: str):
    # DistilBERT returns list of lists like [[{'label': 'POSITIVE', 'score': 0.99}, ...]]
    result = await query_hf(API_URL_SENTIMENT, {"inputs": text})
    try:
        # Results from roberta-base-sentiment-latest are like [[{'label': 'positive', 'score': 0.99}, ...]]
        # Labels are 'positive', 'neutral', 'negative'
        emotions = result[0]
        sent_map = {res['label']: res['score'] for res in emotions}
        
        pos_score = sent_map.get('positive', 0)
        neg_score = sent_map.get('negative', 0)
        
        return pos_score - neg_score
    except:
        return 0.0

async def get_emotion(text: str):
    # RoBERTa returns list of lists
    result = await query_hf(API_URL_EMOTION, {"inputs": text})
    try:
        # result[0] is a list of emotion objects
        # Sort by score
        emotions = result[0]
        top_emotion = max(emotions, key=lambda x: x['score'])
        return top_emotion['label'], top_emotion['score']
    except:
        return "neutral", 0.0

async def check_risk(text: str):
    # BART MNLI zero-shot classification
    # Labels: "safe", "high-risk", "crisis"
    candidate_labels = ["safe", "academic stress", "high-risk crisis", "self-harm"]
    payload = {
        "inputs": text,
        "parameters": {"candidate_labels": candidate_labels}
    }
    result = await query_hf(API_URL_RISK, payload)
    try:
        labels = result.get('labels', [])
        scores = result.get('scores', [])
        # If high-risk crisis or self-harm has high score
        risk_map = dict(zip(labels, scores))
        risk_score = risk_map.get("high-risk crisis", 0) + risk_map.get("self-harm", 0)
        is_risky = risk_score > 0.6 # Threshold
        return is_risky, risk_score
    except:
        return False, 0.0

def detect_keywords(text: str):
    keywords = ["exam", "failure", "lonely", "anxiety", "hopeless", "tired", "breakup", "deadline", "overwhelmed", "stress", "quit", "die", "kill", "suicide"]
    text_lower = text.lower()
    return [k for k in keywords if k in text_lower]

def map_stress_level(score: float):
    if score < 3.0: return "Low"
    if score < 6.0: return "Moderate"
    if score < 8.5: return "High"
    return "Critical"

def calculate_stress_index(sentiment_score, emotion_label, emotion_score, risk_prob, mh_label="Normal"):
    # Stress Index = Normalized(NegSentiment * 2 + NegativeEmotions * 3 + Risk * 3 + MentalHealthState * 2)
    
    # 1. Negative Sentiment (0 to 1)
    neg_sent = max(0, -sentiment_score) 
    
    # 2. Negative Emotions Intensity (0 to 1)
    neg_emotion_weights = {
        'fear': 1.0,
        'sadness': 0.8,
        'anger': 0.9,
        'disgust': 0.5,
        'surprise': 0.2
    }
    neg_emo_val = emotion_score * neg_emotion_weights.get(emotion_label.lower(), 0)
    
    # 3. Mental Health State Weights
    mh_weights = {
        'Stress': 0.9,
        'Anxiety': 0.8,
        'Depression': 0.7,
        'Personality Disorder': 0.6,
        'Suicidal': 1.0,
        'Normal': 0.0
    }
    mh_val = mh_weights.get(mh_label, 0.0)
    
    # 4. Overall calculation
    stress = (neg_sent * 2) + (neg_emo_val * 3) + (risk_prob * 3) + (mh_val * 2)
    
    # Floor boost: if any negative indicator is high, ensure a minimum stress floor
    if risk_prob > 0.4 or neg_sent > 0.7 or neg_emo_val > 0.5:
        stress = max(stress, 5.0)

    return min(10.0, round(float(stress), 1))

async def transcribe_audio(audio_data: bytes):
    from .deepgram_service import transcribe_audio_deepgram
    return await transcribe_audio_deepgram(audio_data)

async def get_mental_health_label(text: str):
    result = await query_hf(API_URL_MENTAL_HEALTH, {"inputs": text})
    try:
        # Result is list of lists
        labels = result[0]
        top = max(labels, key=lambda x: x['score'])
        return top['label']
    except:
        return "Normal"
