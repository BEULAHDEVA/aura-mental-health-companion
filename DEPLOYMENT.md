# Aura Deployment Guide

To deploy **Aura** to a production environment, follow these steps for the backend and frontend services.

## Prerequisites

- **GitHub Account**: Your code should be pushed to a repository.
- **Render Account**: For deploying the Python/FastAPI backend.
- **Vercel Account**: For deploying the React/Vite frontend.
- **HuggingFace Account**: For the `HF_API_TOKEN`.
- **Google Cloud/Deepgram/Groq Accounts**: For respective API keys.

---

## 1. Backend Deployment (Render)

We will deploy the FastAPI backend as a **Web Service** on Render.

1.  **Log in to [Render Dashboard](https://dashboard.render.com/).**
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository: `aura-mental-health-companion`.
4.  Configure the service:
    -   **Name**: `aura-backend` (or similar)
    -   **Root Directory**: `aura-backend` (Important!)
    -   **Environment**: `Python 3`
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    Add the crucial keys from your local `.env`:
    -   `HF_API_TOKEN`: *(Your HuggingFace Token)*
    -   `GOOGLE_API_KEY`: *(Your Google API Key)*
    -   `GROQ_API_KEY`: *(Your Groq API Key)*
    -   `JWT_SECRET_KEY`: *(Generate a strong random string)*
    -   `ENCRYPTION_KEY`: *(Generate a 32-byte key)*
    -   `DATABASE_URL`: *(Render provides a PostgreSQL database, see below)*

    **Database Note**: Ideally, create a **New PostgreSQL** instance on Render first, copy its `Internal Database URL`, and paste it as `DATABASE_URL` in your Web Service environment variables. If you skip this, the app will use SQLite, which is **not** recommended for production (data will be lost on restart).

6.  Click **Create Web Service**.

---

---

## 2. Frontend Deployment (Netlify)

We will deploy the React frontend on Netlify, which is great for static sites and SPAs.

1.  **Log in to [Netlify Dashboard](https://app.netlify.com/).**
2.  Click **"Add new site"** -> **"Import an existing project"**.
3.  Connect your GitHub repository.
4.  Configure the site settings:
    -   **Base directory**: `aura-frontend`
    -   **Build command**: `npm install && npm run build`
    -   **Publish directory**: `dist`
5.  **Environment Variables**:
    Go to **Site settings** -> **Environment variables**.
    -   `VITE_API_URL`: `https://your-aura-backend-on-render.com` (Copy this URL from your Render dashboard once deployed)
6.  Click **Deploy site**.

*(Alternative: You can also use **Vercel** as described in the original guide.)*

---

## 3. Final Verification

1.  Open your Vercel URL (e.g., `https://aura-frontend.vercel.app`).
2.  Try logging in (this tests the database/backend connection).
3.  Try the **Focus Mode** (tests ambient sounds).
4.  Try the **AI Journal** (tests HuggingFace/Groq integration).

**Troubleshooting:**
-   **CORS Error**: If the frontend can't talk to the backend, ensure your FastAPI backend allows requests from your Vercel domain. You might need to update `app/main.py` CORS origins to include your Vercel URL.
-   **Database Error**: Ensure the `DATABASE_URL` is correct and the database is active.
