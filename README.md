Hey I am Cooked...

# CookBook

A full-stack recipe-sharing platform built with React 18 + Vite 5 (frontend) and Node.js + Express + Prisma (backend).

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite 5, TanStack Query v5, Zustand, Framer Motion, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 4, TypeScript, Prisma ORM |
| Database | MySQL 8 |
| Auth | JWT (access token in memory) + httpOnly refresh cookie |
| Storage | Local disk / Cloudinary / AWS S3 (configurable) |

## Prerequisites

- Node.js ≥ 18
- MySQL 8 running locally (or a hosted connection string)
- npm ≥ 9

## Setup

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and set at minimum:
- `DATABASE_URL` — MySQL connection string  
  e.g. `mysql://root:password@localhost:3306/cookbook`
- `ACCESS_TOKEN_SECRET` — random 64-char string
- `REFRESH_TOKEN_SECRET` — different random 64-char string

### 3. Database setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

This creates the schema and seeds demo data:
- Users: `alice@cookbook.dev`, `bob@cookbook.dev`, `carol@cookbook.dev` (password: `password123`)
- 12 sample recipes across all categories

### 4. Run in development

```bash
# Terminal 1 — backend (port 4000)
cd backend
npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173.

## Storage Drivers

Set `STORAGE_DRIVER` in `backend/.env`:

| Value | Description |
|-------|-------------|
| `local` | Saves files to `backend/uploads/` (default) |
| `cloudinary` | Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `s3` | Requires `AWS_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |

## Project Structure

```
cookbook/
├── backend/
│   ├── prisma/          # Schema & seed
│   ├── src/
│   │   ├── config/      # env, constants
│   │   ├── controllers/ # HTTP handlers
│   │   ├── middlewares/ # auth, validate, upload, error
│   │   ├── routes/      # Express routers
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── services/    # Business logic
│   │   ├── types/       # TypeScript declarations
│   │   └── utils/       # AppError, asyncHandler, jwt, hash, storage
│   └── server.ts
└── frontend/
    └── src/
        ├── components/  # shared UI + shadcn/ui primitives
        ├── features/    # auth, recipes, recipe-form, favorites, comments, profile
        ├── hooks/       # useDebounce, useMediaQuery, useTheme, useToast
        ├── layouts/     # RootLayout, AuthLayout
        ├── lib/         # axios, queryClient, utils, constants
        ├── pages/       # lazy-loaded page components
        ├── providers/   # QueryProvider, ThemeProvider, AuthProvider
        ├── router/      # createBrowserRouter config
        ├── store/       # Zustand UI store
        └── types/       # API types
```

## API Reference

All endpoints are prefixed with `/api/v1`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login |
| POST | `/auth/refresh` | cookie | Rotate refresh token |
| POST | `/auth/logout` | ✓ | Logout |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/recipes` | — | List recipes (search/filter/paginate) |
| GET | `/recipes/popular` | — | Popular recipes |
| GET | `/recipes/mine` | ✓ | My recipes |
| GET | `/recipes/:id` | — | Recipe detail |
| POST | `/recipes` | ✓ | Create recipe |
| PATCH | `/recipes/:id` | ✓ | Update recipe |
| DELETE | `/recipes/:id` | ✓ | Delete recipe |
| GET | `/favorites` | ✓ | My favourite IDs |
| POST | `/favorites/:id` | ✓ | Add favourite |
| DELETE | `/favorites/:id` | ✓ | Remove favourite |
| GET | `/comments/recipe/:id` | — | Recipe comments |
| POST | `/comments/recipe/:id` | ✓ | Add comment |
| PATCH | `/comments/:id` | ✓ | Edit comment |
| DELETE | `/comments/:id` | ✓ | Delete comment |
| GET | `/profile/:userId` | — | Public profile |
| PATCH | `/profile` | ✓ | Update profile |
| POST | `/upload/image` | ✓ | Upload image |
| GET | `/health` | — | Health check |
