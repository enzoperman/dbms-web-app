# COERTS Setup (Local MySQL)

## 1) Install prerequisites
- Node.js 18+ (use nvm or installer)
- MySQL 8 (local server)
- Git

## 2) Install dependencies
```bash
# from repo root
npm run install:all
```

## 3) Create database and user
```bash
mysql -u root -p -e "\
CREATE DATABASE G4104 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\
CREATE USER '4104'@'%' IDENTIFIED BY 'abc4104';\
GRANT ALL PRIVILEGES ON G4104.* TO '4104'@'%';\
FLUSH PRIVILEGES;"
```

## 4) Configure environment
```bash
cd server
cp .env.example .env
```
Update values in `.env` if needed.

## 5) Prisma migrate and seed
```bash
cd server
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

## 6) Run locally
```bash
# backend
cd server && npm run dev

# frontend
cd client && npm run dev
```
- Frontend: http://localhost:5173
- API: http://localhost:3000

## 7) Vercel (Serverless API)
- Push to GitHub
- Import the repo in Vercel
- Set environment variables in Vercel (same as server/.env)
- Deploy

## Troubleshooting
- If Prisma errors about provider, ensure `provider = "mysql"` in server/prisma/schema.prisma
- If CORS errors, set `CLIENT_URL` to your frontend URL
