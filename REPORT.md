# HumanAI Build Report

## 1. What Was Built

HumanAI is a complete SaaS web app for rewriting AI-generated text into more natural human writing. The project is split into a Django REST backend and a React + Vite frontend, with JWT auth, Google login support, subscription plan gating, Stripe checkout/portal/webhooks, monthly word quotas, history, file uploads for paid plans, Celery background jobs, Docker deployment files, and a Stitch-inspired dark SaaS UI.

The Stitch ZIP included a Settings screen, screenshot, and design system. I used those visual decisions across the full app: dark background, elevated glass cards, violet primary actions, Plus Jakarta Sans headings, Inter body text, subtle borders, compact sidebar, responsive bottom navigation, and restrained workspace layouts.

## 2. How It Works

A user pastes text or uploads a supported file, chooses a mode, and submits a humanizer job. The frontend sends the request to Django. Django validates the user's plan and remaining words, records usage, queues a Celery task, calls the aihumanize.io API, stores the finished result, and the frontend polls until the output is ready.

```text
User text/file
  -> React frontend
  -> Django REST API
  -> Celery background job
  -> aihumanize.io API
  -> Django stores result
  -> React polls and displays humanized text
```

## 3. Backend Files Explained

| File | What it does |
|---|---|
| backend/manage.py | Runs Django management commands. |
| backend/requirements.txt | Lists all Python dependencies requested for the API, Celery, Stripe, file parsing, and deployment. |
| backend/.env.example | Documents every backend environment variable and placeholder API key value. |
| backend/Dockerfile | Builds the Django API image and runs Gunicorn. |
| backend/config/settings.py | Configures Django apps, env loading, database, JWT, CORS, Google auth, Stripe, Celery, static files, and media. |
| backend/config/urls.py | Mounts admin, auth, humanizer, billing, and social auth routes. |
| backend/config/celery.py | Configures Celery and the monthly word reset beat schedule. |
| backend/config/wsgi.py | Provides the WSGI application for Gunicorn. |
| backend/config/asgi.py | Provides the ASGI application for Django. |
| backend/apps/users/models.py | Defines the custom email-based User, Subscription, and UsageLog models. |
| backend/apps/users/serializers.py | Serializes user and subscription data for the frontend. |
| backend/apps/users/views.py | Implements register, login, Google auth, logout, refresh, profile, password change, and account deletion. |
| backend/apps/users/tasks.py | Resets monthly word usage for all users. |
| backend/apps/users/urls.py | Defines auth endpoint routes. |
| backend/apps/users/migrations/0001_initial.py | Creates user, subscription, and usage tables. |
| backend/apps/humanizer/models.py | Defines the HumanizerJob model and status/mode choices. |
| backend/apps/humanizer/serializers.py | Serializes full jobs and history previews. |
| backend/apps/humanizer/views.py | Handles text/file submission, plan checks, quota checks, job creation, polling, and history. |
| backend/apps/humanizer/tasks.py | Runs the aihumanize.io call in Celery and stores success/failure state. |
| backend/apps/humanizer/urls.py | Defines humanizer endpoint routes. |
| backend/apps/humanizer/migrations/0001_initial.py | Creates the humanizer job table. |
| backend/apps/billing/models.py | Stores processed Stripe webhook event IDs for idempotency. |
| backend/apps/billing/serializers.py | Validates checkout plan requests. |
| backend/apps/billing/views.py | Implements Stripe checkout, billing portal, webhooks, plan updates, and subscription status. |
| backend/apps/billing/urls.py | Defines billing endpoint routes. |
| backend/apps/billing/migrations/0001_initial.py | Creates the billing event table. |
| backend/utils/aihumanize_client.py | Calls the aihumanize.io humanize API and returns the result text. |
| backend/utils/file_parser.py | Extracts text from .txt, .docx, and .pdf uploads. |

## 4. Frontend Files Explained

| File | What it does |
|---|---|
| frontend/package.json | Defines React/Vite scripts and all requested frontend dependencies. |
| frontend/package-lock.json | Locks installed frontend dependency versions. |
| frontend/.env.example | Documents frontend environment variables. |
| frontend/index.html | Sets metadata, fonts, title, and the root React mount node. |
| frontend/tailwind.config.js | Defines the HumanAI color palette, fonts, glow, and theme tokens. |
| frontend/postcss.config.js | Enables Tailwind and Autoprefixer. |
| frontend/vite.config.js | Configures the Vite React dev server. |
| frontend/Dockerfile | Builds the React app and serves it from Nginx. |
| frontend/src/main.jsx | Mounts React with Google OAuth and toast providers. |
| frontend/src/App.jsx | Defines public, auth, protected, layout, and redirect routes. |
| frontend/src/index.css | Adds Tailwind layers and shared Stitch-style component classes. |
| frontend/src/api/axios.js | Creates the Axios client with JWT and 401 handling. |
| frontend/src/api/auth.js | Wraps login, register, Google auth, profile, logout, password, and delete calls. |
| frontend/src/api/humanizer.js | Wraps humanizer submit, poll, and history calls. |
| frontend/src/api/billing.js | Wraps billing status, checkout, and portal calls. |
| frontend/src/store/authStore.js | Stores user/session state with localStorage persistence and auth actions. |
| frontend/src/hooks/usePolling.js | Polls jobs until they finish or fail. |
| frontend/src/hooks/useWordCount.js | Calculates live word counts from text. |
| frontend/src/utils/planGating.js | Centralizes mode and file-upload plan rules. |
| frontend/src/components/layout/AppLayout.jsx | Provides responsive app chrome with sidebar and mobile bottom nav. |
| frontend/src/components/layout/Sidebar.jsx | Renders logo, nav links, active state, plan badge, words meter, and upgrade CTA. |
| frontend/src/components/ui/ModeSelector.jsx | Renders gated writing mode pills with locked-state toasts. |
| frontend/src/components/ui/OutputPanel.jsx | Shows read-only output with copy, download, fade-in, and word count. |
| frontend/src/components/ui/WordsMeter.jsx | Displays quota usage and color-coded progress. |
| frontend/src/components/ui/LoadingSkeleton.jsx | Shows a shimmer loading state for output generation. |
| frontend/src/components/ui/PlanBadge.jsx | Displays colored plan labels. |
| frontend/src/components/ui/UpgradeBanner.jsx | Warns low-quota users and links to pricing. |
| frontend/src/components/ui/FileUploadButton.jsx | Handles paid-plan file upload gating and selection. |
| frontend/src/pages/Landing.jsx | Builds the requested landing page, before/after demo, feature pills, steps, and pricing preview. |
| frontend/src/pages/Humanizer.jsx | Implements the main text/file input, mode selection, submit flow, polling, and result display. |
| frontend/src/pages/History.jsx | Lists previous jobs with search, copy, expand/collapse, and pagination. |
| frontend/src/pages/Pricing.jsx | Shows plan cards, annual toggle, checkout redirect, billing portal, and comparison table. |
| frontend/src/pages/Login.jsx | Implements email/password login and Google sign-in. |
| frontend/src/pages/Register.jsx | Implements account creation, terms checkbox, and Google sign-in. |
| frontend/src/pages/Settings.jsx | Implements profile, password, subscription, free upgrade cards, and delete account modal. |

## 5. API Keys You Need to Add

| Service | Where to get it | File | Variable |
|---|---|---|---|
| aihumanize.io | Buy $25/mo plan at aihumanize.io -> dashboard | backend/.env | AIHUMANIZE_API_KEY |
| Google OAuth Client ID | console.cloud.google.com -> APIs -> Credentials | backend/.env + frontend/.env | GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / VITE_GOOGLE_CLIENT_ID |
| Stripe Secret Key | dashboard.stripe.com -> Developers -> API Keys | backend/.env | STRIPE_SECRET_KEY |
| Stripe Webhook Secret | dashboard.stripe.com -> Webhooks -> add endpoint | backend/.env | STRIPE_WEBHOOK_SECRET |
| Stripe Price IDs | dashboard.stripe.com -> Products -> create 3 plans | backend/.env | STRIPE_PRICE_STARTER / STRIPE_PRICE_PRO / STRIPE_PRICE_BUSINESS |
| Django Secret Key | Generate at: https://djecrety.ir | backend/.env | SECRET_KEY |
| Database URL | Your Postgres connection string | backend/.env | DATABASE_URL |

## 6. How to Run Locally

```bash
# 1. Start Redis
redis-server

# 2. Backend
cd backend
cp .env.example .env
# -> fill in your API keys in .env first
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 3. Celery (new terminal)
cd backend
celery -A config worker --loglevel=info

# 4. Frontend (new terminal)
cd frontend
cp .env.example .env
# -> fill in VITE_API_URL and VITE_GOOGLE_CLIENT_ID
npm install
npm run dev
```

## 7. How to Deploy with Docker

```bash
cp backend/.env.example backend/.env
# fill in all keys in backend/.env
docker-compose up --build
# App runs at http://localhost
```

## 8. Subscription Plans Summary

| Plan | Price | Words/month | Modes |
|---|---:|---:|---|
| Free | $0 | 500 | Standard only |
| Starter | $7/mo | 5,000 | Standard + Casual |
| Pro | $15/mo | 15,000 | All 4 modes + file upload |
| Business | $39/mo | 50,000 | All 4 modes + file upload + API |

## 9. Known Limitations

- aihumanize.io API response format must be verified. Update `backend/utils/aihumanize_client.py` if the response key is different from `result`, `output`, or `text`.
- File upload only works for Pro and Business plans.
- Monthly word reset runs on the 1st of each month via Celery Beat, so the celery-beat service must be running.
- The Stitch ZIP only included a Settings screen and design system, so I extended those exact visual rules to Landing, Humanizer, History, Pricing, Login, and Register using the same color, spacing, typography, glass cards, borders, and navigation patterns.
- I added Django migrations, `wsgi.py`, `asgi.py`, `package-lock.json`, `.gitignore`, Stripe webhook idempotency storage, and account deletion support because they are needed for a complete working app.

## 10. Verification Performed

```bash
cd frontend
npm install
npm run build

cd backend
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate --noinput
```

The frontend production build passed. Django system checks passed with no issues, and migrations applied successfully during verification.

