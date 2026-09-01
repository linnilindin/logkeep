# LogKeep

Media tracking app for managing your reading progress. Track manga, manhwa, novels, books, and more with status filters, search, and progress tracking.

Next.js frontend and Express API. Supabase handles auth and Postgres. Installs as a PWA on mobile.

## Tech Stack

**Frontend**
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Serwist service worker (PWA)

**Backend (`server/`)**
- Node.js + Express
- TypeScript
- Zod for request validation
- Supabase (Postgres + Auth)

## Project Structure

- `app/` - Next.js app router pages and layouts, web manifest, service worker
- `components/` - React components
- `lib/` - API client, auth context, hooks
- `types/` - TypeScript type definitions
- `scripts/` - Icon generation
- `supabase/` - Database setup SQL
- `server/` - Express API (routes, services, Supabase access, Dockerfile)

## Local Development

Requires Node 20+.

```bash
npm install
cd server && npm install && cd ..
```

Create `.env.local` and `server/.env.local`, then run both services:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
npm run dev
```

Open http://localhost:3000.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service check |
| GET | `/api/media` | List items, optional `?status=` |
| POST | `/api/media` | Create item |
| PATCH | `/api/media/:id` | Edit item |
| PATCH | `/api/media/:id/progress` | Update progress |
| DELETE | `/api/media/:id` | Delete item |
| GET | `/api/search` | Search via `?q=` and `?type=` |

`/api/media` routes require `Authorization: Bearer <token>`.

## Features

- Installable PWA for mobile
- Per-user libraries with email/password auth
- Track reading progress with chapter/volume numbers
- Filter by status (Reading, To-Read, Completed)
- Search by title
- Collapsible card views
- Dark/light mode
- Add, edit, and update entries
