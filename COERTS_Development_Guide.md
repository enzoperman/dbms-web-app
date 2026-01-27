# COERTS Development Guide

## Local Development Workflow
1. Install dependencies: `npm run install:all`
2. Start MySQL locally
3. Configure server `.env`
4. Run migrations + seed
5. Start dev servers: `npm run dev`

## Roles
- ADMIN: Full access
- STAFF: Request review/remarks
- CHAIR: Approves escalated requests
- STUDENT: Submits requests

## Project Modules
- Client: React + Vite + Tailwind
- Server: Express + Prisma + JWT
- API: Vercel serverless functions

## API Conventions
- Base: `/api`
- Auth: `/api/auth/*`
- Requests: `/api/requests/*`
- Students: `/api/students/*`
- Status: `/api/status/*`

## Security Notes
- JWT secret must be long and random
- Use strong DB credentials in production
- Enable HTTPS in deployment

## Seeded Demo Users (local)
- Admin: admin@pup.edu.ph / admin123
- Staff: staff@pup.edu.ph / staff123
- Chairperson: chairperson@pup.edu.ph / chair123
- Student: student@pup.edu.ph / student123
