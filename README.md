# HumanAI

HumanAI is a SaaS-style AI text humanizer. Users can paste AI-generated text, choose a writing mode, and receive a more natural human-sounding rewrite. The app includes authentication, email verification, monthly word limits, plan-based feature gating, file upload support for paid plans, Stripe billing hooks, and background processing with Celery.

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Axios |
| Backend | Django 5, Django REST Framework, Simple JWT |
| Background Jobs | Celery, Redis |
| Database | PostgreSQL in Docker, SQLite fallback for local dev |
| Billing | Stripe Checkout, Stripe Customer Portal, webhooks |
| Deployment | Docker Compose, Nginx, Gunicorn |

## Project Structure

```text
backend/        Django REST API, Celery tasks, billing, auth, file parsing
frontend/       React + Vite app
nginx/          Nginx reverse proxy config
docker-compose.yml
REPORT.md       Detailed build report and file explanations
```

## Main Features

- Email/password registration and login
- Email confirmation before login
- Google OAuth login support
- Light and dark mode
- Humanizer job submission and polling
- Writing modes: Standard, Casual, Academic, Aggressive
- Monthly word quota tracking
- Plan gating for modes and file upload
- History page with search, copy, and expand
- Stripe checkout, customer portal, and webhooks
- Docker-based deployment setup

## Environment Files

Create these files before running the app:

```text
backend/.env
frontend/.env
```

You can copy from the examples:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Important backend values:

```env
SECRET_KEY=REPLACE_WITH_RANDOM_SECRET_KEY
DATABASE_URL=postgres://user:password@localhost:5432/humanai_db
REDIS_URL=redis://localhost:6379/0
AIHUMANIZE_API_KEY=REPLACE_WITH_AIHUMANIZE_KEY
GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY=REPLACE_WITH_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_STRIPE_WEBHOOK_SECRET
FRONTEND_URL=http://localhost:5173
```

Important frontend values:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=REPLACE_WITH_GOOGLE_CLIENT_ID
```

For email confirmation in local development, leaving `EMAIL_HOST` empty will print confirmation emails in the Django terminal. For real email delivery, configure SMTP in `backend/.env`.

## Run Locally Without Docker

Start Redis first:

```powershell
redis-server
```

Backend:

```powershell
cd backend
copy .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Celery worker in a second terminal:

```powershell
cd backend
celery -A config worker --loglevel=info
```

Frontend in a third terminal:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Run With Docker

For Docker, update `backend/.env`:

```env
DATABASE_URL=postgres://user:password@db:5432/humanai_db
REDIS_URL=redis://redis:6379/0
FRONTEND_URL=http://localhost
ALLOWED_HOSTS=localhost,127.0.0.1,web
CORS_ALLOWED_ORIGINS=http://localhost
```

Update `frontend/.env`:

```env
VITE_API_URL=http://localhost
```

Start everything:

```powershell
docker compose up --build
```

Run migrations:

```powershell
docker compose exec web python manage.py migrate
```

Open:

```text
http://localhost
```

## Useful Commands

```powershell
# Django checks
cd backend
python manage.py check
python manage.py migrate

# Frontend build
cd frontend
npm run build

# Docker logs
docker compose logs -f web
docker compose logs -f celery
docker compose logs -f nginx
```

## Subscription Plans

| Plan | Price | Words/month | Features |
|---|---:|---:|---|
| Free | $0 | 500 | Standard mode |
| Starter | $7/mo | 5,000 | Standard + Casual |
| Pro | $15/mo | 15,000 | All modes + file upload |
| Business | $39/mo | 50,000 | All modes + file upload + API |

## Notes

- The aihumanize.io response format should be verified against the live API. The current client accepts `result`, `output`, or `text`.
- Real Stripe and Google OAuth flows require valid dashboard credentials.
- Email verification works locally through console output if SMTP is not configured.
- Never commit real `.env` files or API keys.

