# Volunteer Scheduler — Claude Context

## What This Is
A volunteer scheduling web app for **De Sering**. Volunteers browse upcoming events and sign up for roles. Admins manage events, templates, users, and signups.

## Tech Stack
- **Next.js 15** (App Router) + **React 19** + **TypeScript 5**
- **Payload CMS 3** — headless CMS, auth, admin panel, REST API, collection definitions
- **PostgreSQL 16** — via `@payloadcms/db-postgres`
- **Panda CSS** + **Park UI** (Ark UI) — styling (Olive accent, Sand gray, 2xl radius); scoped with `.use-panda` to avoid Payload admin conflicts
- **TanStack React Query 5** — client-side data fetching/caching
- **Zod 4** — user input validation; **TypeBox** — API request validation
- **Pino** — structured logging (`src/lib/logger.ts`)
- **Vitest** — unit testing
- **Biome** — linting + formatting (double quotes, 2-space indent, no ESLint/Prettier)
- **React Email** + **Nodemailer** + **ical-generator** — signup confirmation emails with iCal attachments

## Route Groups
- `(scheduler)` — volunteer-facing UI: home, auth, account, `/api` routes
- `(payload)` — Payload admin panel at `/admin` and `/payload-api`

## Collections
| Collection | Key Fields | Notes |
|---|---|---|
| Users | email, preferredName, phoneNumber (E.164), roles (admin/editor/volunteer) | Payload built-in auth, 7-day token |
| Events | title, start_date, end_date, description (rich text), tags, sections, roles, signups | |
| Sections | title, description, event (required) | Cascade-deleted with event via hook |
| Roles | title, description, maxSignups (0=unlimited), event, section (optional) | |
| Signups | user, role, event | afterChange hook triggers confirmation email |
| Tags | text | |
| EventTemplates | Admin-only; nested sections+roles arrays | Used to bulk-create events |

## Directory Structure
```
src/
  app/
    (scheduler)/         # Volunteer-facing pages + REST API routes
      auth/              # sign-in, register, forgot/reset-password
      account/           # my-events, settings
      api/events, tags/
    (payload)/           # Admin panel
  collections/           # Payload collection definitions + access control + hooks
    access/              # admins(), anyone(), adminAndThemselves(), checkRole()
    users/access/
  components/
    ui/                  # Panda CSS styled components + recipes
    event-details-sheet/ # Event detail slide-over modal
    event-overview/      # Main event listing (server + client pair pattern)
  actions/               # Server actions for all mutations (auth, signup, etc.)
  lib/
    services/            # Data fetching: get-events, get-event-details, get-user, etc.
    mappers/             # group-events-by-date.ts
    schemas/             # Zod schemas
    email/               # send-email.ts, create-ical-event.ts
    logger.ts
  views/calendar-view/   # Custom Payload admin calendar view
  email/templates/       # React Email templates (signup-confirmation)
  migrations/            # Payload DB migrations (auto-applied in dev, manual in prod)
  payload.config.ts      # Payload CMS configuration
  payload-types.ts       # Auto-generated — never edit directly
```

## Key Patterns
- **Server/client component pairs** — `foo.server.tsx` + `foo.client.tsx` files
- **Server actions** — dedicated files under `src/actions/`, handle form submissions and mutations
- **Typed responses** — `{ success: boolean, error?: string }` with Zod field errors flattened
- **Access control** — composable: `admins()`, `anyone()`, `adminAndThemselves()`, `checkRole()`
- **Auto-generated files** — `payload-types.ts` and `styled-system/` are never edited directly

## Auth & Roles
- Payload built-in email+password auth, 7-day token expiry
- Roles: `admin` (full access), `editor` (event/content editing), `volunteer` (read + own signups/account)
- `getUser()` in `src/lib/services/get-user.ts` reads auth from request headers

## Dev Setup
```bash
# Start DB + mail server
docker compose -f docker-compose.dev.yml up -d

npm run dev       # Next.js dev server
npm run test      # Vitest
npm run coverage  # Coverage report
```

**Environment variables** (see `.env.example`):
```
DATABASE_URI=postgres://schedule:schedule@localhost:5432/schedule
PAYLOAD_SECRET=...
EMAIL_FROM_ADDRESS=schedule@localhost
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
```
