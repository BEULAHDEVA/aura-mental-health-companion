# Aura – Privacy-First AI Mental Health Companion

Aura is a production-ready, privacy-first AI journaling and mental wellness assistant designed for students experiencing academic stress.

## Features
- **AI Journaling**: Sentiment & emotion analysis using DistilBERT and RoBERTa.
- **Stress Analytics**: Track mood trends with interactive Recharts graphs.
- **Crisis Detection**: Zero-shot classification (BART MNLI) for high-risk detection.
- **Privacy First**: Anonymous UUID-based authentication and AES-256 encrypted storage.
- **Focus Mode**: Spotify integration and study technique suggestions.
- **Gamification**: XP points and streaks for consistent self-care.
- **Rage Room**: Interactive glass-breaking mini-game for stress relief.
- **Mini-Aura LLM**: A custom-trained local Transformer model for private conversation.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (SQLite for local), JWT.
- **AI**: HuggingFace Inference API (Whisper, RoBERTa, DistilBERT, BART MNLI).

## Setup Instructions

### 1. Backend Setup
1. Navigate to `aura-backend/`.
2. Create a `.env` file from `.env.example`.
3. Fill in your `HF_API_TOKEN` (from HuggingFace).
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to `aura-frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Design Philosophy
Aura uses a **futuristic soft-glow aesthetic** with **glassmorphism** UI components. The emerald green color palette is chosen for its calming effects, combined with smooth transitions to reduce cognitive load.

---
*Disclaimer: Aura is an AI companion and is not a replacement for professional therapy or medical advice. For emergencies, please contact local authorities or a crisis hotline.*
