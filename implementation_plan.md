# Aura - Privacy-First AI Mental Health Companion Implementation Plan

## Phase 1: Foundation & Backend Setup
- [x] Initialize project structure (`aura-backend/`, `aura-frontend/`)
- [x] Set up Backend with FastAPI
    - [x] `app/main.py`: Entry point
    - [x] `app/models.py`: SQLAlchemy models (User, JournalEntry, MoodTrend)
    - [x] `app/schemas.py`: Pydantic models
    - [x] `app/database.py`: PostgreSQL connection
- [x] Implement Security
    - [x] Anonymous UUID-based auth
    - [x] AES-256 encryption for journal content
    - [x] JWT token generation

## Phase 2: AI Pipeline Implementation
- [x] Create `app/services/`
    - [x] `sentiment.py`: DistilBERT integration via HuggingFace
    - [x] `emotion.py`: RoBERTa integration
    - [x] `risk.py`: BART MNLI for crisis detection
    - [x] `llm_agent.py`: DialoGPT/LLM decision logic
- [x] Implement Stress Index calculation formula 

## Phase 3: Frontend Foundation
- [x] Initialize React + TS with Vite
- [x] Set up Tailwind CSS with futuristic green/glassmorphism theme
- [x] Install dependencies: `lucide-react`, `recharts`, `axios`, `framer-motion`
- [x] Implement core layout & navigation

## Phase 4: Core Features Development
- [x] **AI Journal Board**: Text input + Speech-to-text (Whisper)
- [x] **Stress Analytics**: Recharts graphs + Weekly Mood Report
- [x] **Crisis System**: Risk detection triggers + Crisis UI
- [x] **Breathing Exercises**: 4-7-8 and Box breathing with animations
- [x] **Focus Mode**: Music integration (Spotify/YouTube) + Study techniques
- [x] **Gamification**: Streaks, XP, and badges

## Phase 5: Polish & Mini-games
- [x] **Rage Room**: Browser-based glass-breaking game
- [x] Privacy banner & "Not a replacement for therapy" disclaimers
- [x] Transitions and soft-glow aesthetics

## Phase 6: Deployment Preparation
- [x] Environment variables config
- [x] Render (Backend) and Vercel (Frontend) config files
