# HOW TO USE — FuturePath AI

> Step-by-step guide to set up, run, and use FuturePath AI on your local machine.

---

## ✅ Prerequisites

Before you start, make sure you have these installed:

| Tool | Version | Download |
|---|---|---|
| **Python** | 3.12+ | https://python.org |
| **Node.js** | 18+ | https://nodejs.org |
| **Docker** | Latest | https://docker.com |
| **Git** | Latest | https://git-scm.com |

You also need two free API keys:

- 🤖 **Google Gemini API Key** — [Get it here](https://aistudio.google.com/) (free tier available)
- 🔐 **Google OAuth Client ID** — [Set it up here](https://console.cloud.google.com/apis/credentials)

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/futurepath-ai.git
cd "FuturePath AI"
```

---

## 🐳 Step 2 — Start the Database (Docker)

FuturePath AI uses **PostgreSQL**. Run it with Docker:

```bash
docker run --name futurepath-db \
  -e POSTGRES_DB=futurepath \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

Verify it's running:
```bash
docker ps
# You should see: futurepath-db   postgres:15   Up
```

> **Already have PostgreSQL installed locally?**  
> Create a database named `futurepath` and update the DB credentials in your `.env`.

---

## 🐍 Step 3 — Set Up the Backend

### 3a. Create a virtual environment

```bash
cd backend
python3 -m venv venv
```

Activate it:
```bash
# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 3b. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3c. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in your values:

```env
SECRET_KEY=any-long-random-string-here
DEBUG=True

DB_NAME=futurepath
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

GEMINI_API_KEY=your-key-from-aistudio.google.com
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

FRONTEND_URL=http://localhost:3000
```

### 3d. Run database migrations

```bash
python3 manage.py migrate
```

You should see a list of migrations applied with `OK`.

### 3e. Seed career data (recommended)

This populates the database with sample career paths:

```bash
python3 manage.py seed_careers
```

### 3f. Create an admin account

```bash
python3 manage.py createsuperuser
```

Enter your email and password when prompted. This account will have full admin access.

### 3g. Start the backend server

```bash
python3 manage.py runserver
```

✅ Backend is running at: **`http://localhost:8000`**  
📖 API docs: **`http://localhost:8000/api/schema/swagger-ui/`**

---

## ⚛️ Step 4 — Set Up the Frontend

Open a **new terminal tab/window**.

### 4a. Install Node dependencies

```bash
cd frontend
npm install
```

### 4b. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

> The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` must be the **same** as in the backend `.env`.

### 4c. Start the frontend dev server

```bash
npm run dev
```

✅ Frontend is running at: **`http://localhost:3000`**

---

## 🌐 Step 5 — Open the App

Open your browser and go to:
```
http://localhost:3000
```

---

## 👤 Step 6 — Create Your Account

1. Click **"Get Started"** on the landing page
2. Register with your email and a password  
   — or click **"Continue with Google"** to sign in with your Google account

---

## 🎯 Step 7 — Set Up Your Profile

This is the most important step. Go to **Settings** (bottom of the sidebar).

Fill in:

| Field | Why it matters |
|---|---|
| **Target Roles** | The AI analyzes gaps between you and THIS role |
| **Current Skills** | Used for all AI comparisons and career matching |
| **Resume Text** | Paste your CV — gives the AI the deepest context |
| **Major / Grad Year** | Used for readiness scoring |
| **Bio** | Helps AI personalize advice |
| **Experience Level** | Calibrates analysis difficulty |

> **Without a target role and skills set, most AI features won't work.**

---

## 🔍 Step 8 — Run Your First Skill Gap Analysis

1. Click **"Skill Gap"** in the sidebar
2. Click **"Analyze My Skill Gaps"**
3. Wait ~10–20 seconds for Gemini to analyze
4. Review your results:
   - **Role Alignment %** — how close you are to job-ready
   - **Gap cards** — each skill you need to improve, with priority level
5. For any gap, click:
   - **Study** → AI Advisor opens and immediately gives you a study plan
   - **Simulate** → Practice in a simulation
   - **Learn** → Generate a learning pathway

> Results are **cached for 24 hours**. Click **Re-analyze** to force a fresh analysis.

---

## 🤖 Step 9 — Chat with the AI Advisor

1. Click **"AI Advisor"** in the sidebar
2. Ask any career question, for example:
   - *"What skills do I need to become a machine learning engineer?"*
   - *"How do I prepare for a system design interview?"*
   - *"Review my career plan and tell me what's missing."*
3. Start new sessions using **"+ New Session"**
4. Delete old sessions by hovering over them and clicking the trash icon

---

## 🎭 Step 10 — Run a Simulation

1. Click **"Simulations"** in the sidebar
2. Select a career path to simulate
3. Complete the scenario
4. View your score and AI feedback
5. Your score feeds into your **Career Readiness Score** on the dashboard

---

## 📚 Step 11 — Build a Learning Pathway

1. Click **"Learning Pathway"** in the sidebar
2. Click **"Generate"** (AI creates a personalized roadmap for your target role)
3. Work through each step — click to mark as complete
4. Click **"Regenerate"** anytime for a fresh plan

---

## 🛡️ Admin Panel (Staff Only)

If you created a superuser in Step 3f, you have admin access.

1. Log in with your superuser email
2. Click **"Admin Panel"** at the bottom of the sidebar
3. Or go directly to: `http://localhost:3000/admin-panel`

**What you can do:**

| Tab | Actions |
|---|---|
| **Overview** | View platform-wide stats |
| **Users** | Search, activate/deactivate user accounts |
| **Careers** | Add / edit / delete career listings |
| **Simulations** | View all simulation logs |

**Make any existing user an admin:**
```bash
cd backend
source venv/bin/activate
python3 manage.py shell -c "
from users.models import User
u = User.objects.get(email='someone@example.com')
u.is_staff = True
u.is_superuser = True
u.save()
print('Done — they are now an admin.')
"
```

---

## 🔁 Daily Workflow (After First Setup)

Every time you want to run the app:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate      # Windows: venv\Scripts\activate
python3 manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

**Browser:**
```
http://localhost:3000
```

---

## 🐛 Troubleshooting

### `django.db.OperationalError: could not connect to server`
→ Your Docker database isn't running. Run:
```bash
docker start futurepath-db
```

### `GEMINI_API_KEY not configured`
→ You forgot to fill in `.env`. Make sure `GEMINI_API_KEY=your-key` is set and the server was restarted.

### `401 Unauthorized` on API calls
→ Your JWT token expired. Log out and log back in.

### `403 Forbidden` on Admin endpoints
→ Your account doesn't have `is_staff=True`. Follow the "Make any user an admin" step above.

### Skill Gap shows "Analysis Unavailable — Please set a target role"
→ Go to **Settings** and add at least one target role.

### Charts show "width(-1) and height(-1)"
→ This is a Recharts warning in the terminal — it doesn't affect functionality. It appears when charts render before their container has a size. Safe to ignore.

### `npm install` fails with node version errors
→ Make sure you're using Node.js 18+. Check with `node --version`.

---

## 📁 File Structure Quick Reference

```
FuturePath AI/
├── README.md                  ← Project overview
├── HOW_TO_USE.md              ← This file
├── backend/
│   ├── .env                   ← Your secrets (git-ignored)
│   ├── .env.example           ← Template to copy
│   ├── .gitignore
│   ├── requirements.txt
│   ├── manage.py
│   └── ...
└── frontend/
    ├── .env.local             ← Your secrets (git-ignored)
    ├── .env.local.example     ← Template to copy
    ├── .gitignore
    ├── package.json
    └── ...
```

---

## 🚀 Pushing to GitHub

Before pushing, make sure you've **never committed** your `.env` files:

```bash
# Check what's being tracked
git status

# If .env was accidentally staged, remove it:
git rm --cached backend/.env
git rm --cached frontend/.env.local

# Then push
git add .
git commit -m "Initial commit"
git push origin main
```

> The `.gitignore` files in both folders will automatically prevent `.env` and `.env.local` from being committed going forward.

---

*Questions? Open an issue on the GitHub repository.*
