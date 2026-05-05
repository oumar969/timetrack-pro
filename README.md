# TimeTrack Pro

Tidsregistreringssystem bygget med React + Node/Express + PostgreSQL (MVC arkitektur).

## Stack
- **Frontend**: React, React Router, Recharts, Axios
- **Backend**: Node.js, Express, JWT auth
- **Database**: PostgreSQL
- **Auth**: JWT tokens (admin), navn+kode (medarbejdere)

## Kom i gang

### 1. Klon repo
```bash
git clone https://github.com/oumar969/timetrack-pro.git
cd timetrack-pro
```

### 2. Start database (PostgreSQL)
```bash
docker-compose up db -d
```

### 3. Backend
```bash
cd backend
cp .env.example .env   # ret DATABASE_URL og JWT_SECRET
npm install
node src/config/migrate.js   # opret tabeller + seed data
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

| Method | Route | Beskrivelse | Auth |
|--------|-------|-------------|------|
| POST | /api/auth/login | Admin login → JWT | Nej |
| POST | /api/clock/in | Medarbejder stemmer ind | Nej |
| POST | /api/clock/out | Medarbejder stemmer ud | Nej |
| GET | /api/employees | Alle medarbejdere | JWT |
| POST | /api/employees | Opret medarbejder | JWT |
| DELETE | /api/employees/:id | Slet medarbejder | JWT |
| GET | /api/sessions | Historik | JWT |
| GET | /api/analytics/week | Ugentlig analyse | JWT |

## Default login
- Admin: `admin` / `admin123`
- Demo medarbejdere: Jonas Hansen (1234), Sara Nielsen (5678), Mikkel Larsen (9012)
