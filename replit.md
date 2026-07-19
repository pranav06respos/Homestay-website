# Neel Kamal Homestay

A premium boutique homestay website with a full Admin CMS for Neel Kamal Homestay, Kasauli, Himachal Pradesh.

## Run & Operate

- `pnpm --filter @workspace/homestay run dev` — public website + admin CMS frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — Session signing secret
- Optional env: `ADMIN_PASSWORD` — Admin dashboard password (default: `admin1234`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion + Wouter routing
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- File uploads: multer → `/uploads/` directory served statically at `/api/uploads/`

## Where things live

- `artifacts/homestay/src/pages/public/` — public website pages (Home, Rooms, Gallery, Amenities, Attractions, About, Contact, Book)
- `artifacts/homestay/src/pages/admin/` — admin dashboard pages (Dashboard, Rooms, RoomImages, Gallery, MediaLibrary, Bookings, Attractions, Reviews, Settings, Login)
- `artifacts/homestay/src/components/layout/` — shared layouts (PublicLayout, AdminLayout)
- `artifacts/api-server/src/routes/` — API route handlers
- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle table schemas

## Architecture decisions

- **Draft/publish system**: Settings table has two rows (isDraft=false for live, isDraft=true for draft). Publishing copies draft to live row. Admin edits only update the draft row.
- **Dynamic images only**: No hardcoded images anywhere. All images served via the media library and referenced by URL. Placeholder SVG states shown when empty.
- **Session-based admin auth**: Single admin password authenticated via express-session. Password configurable via `ADMIN_PASSWORD` env var.
- **Media uploads**: Files stored in `./uploads/` directory, served statically at `/api/uploads/`. Media table tracks filename, URL, usage context.

## Product

- **Public website**: Home (hero + amenities + rooms preview + reviews), Rooms listing, Room detail with gallery carousel, Gallery (masonry), Amenities, Nearby Attractions, About, Contact, Book Now (WhatsApp integration + booking form)
- **Admin CMS**: Dashboard analytics, Room management (CRUD + availability/visibility toggles), Room image manager, Property gallery, Media library (upload/delete/multi-select), Bookings management, Attractions CRUD, Reviews CRUD, Website Settings (tabbed CMS with draft/publish workflow)

## User preferences

- No hardcoded images — all content managed through Admin Dashboard
- Website must work with empty gallery/no room images (elegant placeholders)
- Admin password: check `ADMIN_PASSWORD` env var (default: `admin1234`)

## Gotchas

- After any OpenAPI spec change: run `pnpm --filter @workspace/api-spec run codegen` before touching routes
- After any `lib/*` schema change: run `pnpm run typecheck:libs` before checking artifacts
- `pricePerNight` is a Drizzle `numeric` column — convert to/from string when reading/writing
- Session cookies use `sameSite: none` only in production — dev uses `lax`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
