# 🏥 AI Hospital Receptionist

**Full-Stack AI Kiosk for Hospital Patient Registration**
Built with React + FastAPI + LangGraph + Supabase

> IBM SkillsBuild Masterclass Project | GP CSN | AIML Department

---

## 📁 Project Structure

```
ai-hospital-receptionist/
├── frontend/                  # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── WelcomeScreen.jsx   # Kiosk landing page
│   │   │   └── ChatPage.jsx        # Main chat interface
│   │   ├── components/
│   │   │   ├── ChatBubble.jsx      # Message bubbles
│   │   │   ├── TypingIndicator.jsx # Animated dots
│   │   │   ├── WardBadge.jsx       # Ward classification badge
│   │   │   └── PatientSummaryCard.jsx  # Registration complete card
│   │   └── utils/
│   │       └── api.js              # Axios API calls
│   └── package.json
│
├── backend/                   # FastAPI + LangGraph
│   ├── main.py                # FastAPI app entry point
│   ├── routers/
│   │   └── api.py             # All API endpoints
│   ├── services/
│   │   ├── graph.py           # LangGraph AI workflow
│   │   └── database.py        # Supabase operations
│   ├── models/
│   │   └── schemas.py         # Pydantic request/response models
│   ├── schema.sql             # Run in Supabase SQL Editor
│   ├── requirements.txt
│   └── .env.template          # Copy to .env and fill in keys
│
└── README.md
```

---

## ⚡ Quick Start

### Step 1 — Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/ai-hospital-receptionist.git
cd ai-hospital-receptionist
```

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.template .env
# → Open .env and fill in your API keys
```

### Step 3 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **SQL Editor** → paste the contents of `backend/schema.sql` → Run
3. Go to **Settings → API** → Copy `Project URL` and `anon public` key into your `.env`

### Step 4 — Run Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) to see the Swagger UI ✅

### Step 5 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — your kiosk is live! 🎉

---

## 🧠 How It Works (LangGraph Flow)

```
User types message
        ↓
   [Router Node]          ← Classifies into ward using GPT-4o-mini
        ↓
   [Ward Node]            ← Asks for Name → Age → Query (one at a time)
        ↓
   [Complete Check]       ← Are all 3 fields collected?
     ↙        ↘
   No           Yes
(loop back)   [Webhook Node]  ← Sends JSON to relay.app
                   ↓
                  END
```

---

## 🌐 API Endpoints

| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| POST   | `/chat`         | Send message, get AI reply     |
| POST   | `/save-patient` | Save patient to Supabase       |
| GET    | `/patients`     | Fetch all patients (admin)     |
| GET    | `/health`       | Health check                   |

---

## 🚀 Deployment

### Backend → Render.com
1. Push to GitHub
2. Render → New Web Service → Connect repo → select `backend/` folder
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
5. Add environment variables from your `.env`

### Frontend → Vercel
1. Vercel → New Project → Connect GitHub repo → select `frontend/` folder
2. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
3. Deploy!

---

## 📦 Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend  | FastAPI, Python 3.11    |
| AI Flow  | LangGraph, GPT-4o-mini  |
| Database | Supabase (PostgreSQL)   |
| Webhook  | relay.app               |
| Deploy   | Render.com + Vercel     |

---

## 📊 Lean Canvas KPIs

- **Number of hospitals enrolled** → tracked in `hospitals` table
- **Number of patients using the kiosk** → tracked in `patients` table

---

## 👥 Team

- **Student:** Shivani D. Deshmukh (Enrollment: 234007)
- **Guide:** Prof. S. S. Jaiswal
- **HOD:** Dr. M. A. Ali
- **Department:** AIML, Government Polytechnic, Chhatrapati Sambhajinagar

---

*IBM SkillsBuild Masterclass 5 | AI for Good Health and Well-Being*

# Ai-Hospital-Receptionist-Website
AI Hospital Receptionist - IBM SkillsBuild Project
