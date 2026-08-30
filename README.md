# LogKeep

Media tracking app for managing your reading progress. Track manga, manhwa, novels, books, and more with status filters, search, and progress tracking.

LogKeep runs as two services: a Next.js frontend and a standalone Express API. The browser never talks to Supabase or third-party APIs directly.

## Tech Stack

**Frontend**
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Framer Motion

**Backend (`server/`)**
- Node.js + Express
- TypeScript
- Zod for request validation
- Supabase (Postgres)

## Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - React components
- `lib/` - API client used by the components
- `types/` - TypeScript type definitions
- `supabase/` - Database setup SQL
- `server/` - Express API (routes, services, Supabase access)

## Getting Started

Requires Node 20 or newer.

Install dependencies for both services:

```bash
npm install
cd server && npm install && cd ..
```

Env files (gitignored, create locally):

- `.env.local` — frontend (`NEXT_PUBLIC_API_URL`)
- `server/.env.local` — backend (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `CORS_ORIGIN`)


Run both services in separate terminals:

```bash
# Terminal 1 - API on port 4000
cd server && npm run dev

# Terminal 2 - frontend on port 3000
npm run dev
```

Open http://localhost:3000.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service check |
| GET | `/api/media` | List items, optional `?status=` filter |
| POST | `/api/media` | Create an item |
| PATCH | `/api/media/:id` | Edit an item |
| PATCH | `/api/media/:id/progress` | Update chapter progress |
| DELETE | `/api/media/:id` | Delete an item |
| GET | `/api/search` | Search Open Library and Jikan via `?q=` and `?type=` |

Progress has its own route because the server only lets a chapter count move forward, while a full edit is allowed to correct it downward.

Rules enforced by the API rather than the UI:
- A chapter count cannot exceed the series total
- Reaching the total marks an item finished and stamps `date_completed`
- Logging progress on a to-read item moves it to reading
- Progress cannot move backwards

## Features

- Track reading progress with chapter/volume numbers
- Filter by status (Reading, To-Read, Completed)
- Search by title
- Collapsible card views
- Dark/light mode toggle
- Progress bars for completed items
- Add, edit, and update media entries
