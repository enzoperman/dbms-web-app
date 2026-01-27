# COERTS - Centralized Online Enrollment Request and Tracking System

Modern web app for managing enrollment requests (overload, override, manual tagging) for the **Computer Engineering Department**. It includes a React frontend, an Express API for local development, and a Vercel-ready serverless API that share a MySQL database via Prisma.

## Key Features
- Online submission of multi-subject enrollment requests
- Real-time status tracking with staff remarks
- Role-based access for students, staff, chairperson, and admin
- Auditable history of requests and status transitions

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, React Hook Form, lucide-react
- Backend (local): Node.js, Express, Prisma, JWT, bcrypt, Zod
- Serverless API (Vercel): Node.js serverless functions with Prisma client
- Database: MySQL 8 (Prisma)

## Project Structure
```
dbms-web/
├── api/                 # Vercel serverless API (auth, requests, students, status)
│   ├── _lib/            # Prisma client, auth helpers, CORS, validation
│   ├── auth/[...path].js
│   ├── requests/[...path].js
│   ├── students/[...path].js
│   └── status/[...path].js
├── client/              # React frontend (Vite)
│   └── src/
│       ├── pages/
│       │   ├── auth/
│       │   ├── student/
│       │   └── staff/
│       ├── layouts/
│       ├── context/
│       └── services/
├── server/              # Express API for local dev
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
├── vercel.json          # Vercel serverless routing
├── .nvmrc               # Node version specification
├── README.md
├── SETUP.md
├── COERTS_Development_Guide.md
└── database_test.ipynb  # Database testing notebook
```

## Quick Start (MySQL)
1) Install prerequisites
- Node.js 18+
- MySQL 8 (local server) and the `mysql` client

2) Install dependencies
```bash
# from repo root
npm run install:all
```

3) Create the database and user
```bash
mysql -u root -p -e "\
CREATE DATABASE G4104 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\
CREATE USER '4104'@'%' IDENTIFIED BY 'abc4104';\
GRANT ALL PRIVILEGES ON G4104.* TO '4104'@'%';\
FLUSH PRIVILEGES;"
```

4) Configure environment
```bash
cd server
cp .env.example .env
```

5) Migrate and seed the database
```bash
cd server
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

6) Run locally
```bash
# Backend API
cd server && npm run dev

# Frontend
cd client && npm run dev
```
- Frontend: http://localhost:5173
- API (Express): http://localhost:3000

Or run both:
```bash
npm run dev
```

## Environment Variables (server/.env)
- DATABASE_URL: MySQL connection string (e.g., `mysql://4104:abc4104@localhost:3306/G4104`)
- DIRECT_URL: Optional non-pooled MySQL connection string for Prisma Migrate (can mirror `DATABASE_URL`)
- JWT_SECRET: Secret for signing tokens
- JWT_EXPIRES_IN: Token lifetime (e.g., 7d)
- PORT: API port (default 3000)
- CLIENT_URL: Allowed origin for CORS (e.g., http://localhost:5173)

## Available Scripts
- Root: `npm run install:all`, `npm run dev`, `npm run dev:server`, `npm run dev:client`, `npm run build`, `npm run start`, `npm run db:setup`, `npm run db:seed`, `npm run build:vercel`
- Server: `npm run dev`, `npm start`, `npm run db:migrate`, `npm run db:generate`, `npm run db:seed`, `npm run db:studio`
- Client: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

## Seeded Demo Accounts
After `npm run db:seed` (in server):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pup.edu.ph | admin123 |
| Staff | staff@pup.edu.ph | staff123 |
| Chairperson | chairperson@pup.edu.ph | chair123 |
| Student | student@pup.edu.ph | student123 |

## License
MIT License. See LICENSE for details.
