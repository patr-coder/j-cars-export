# Architectural Decisions

## Next.js 16 renamed `middleware.ts` → `proxy.ts`

`create-next-app@latest` resolved to Next.js 16.3.5, which deprecated the `middleware` file convention in favor of `proxy` (same behavior, renamed file/export — see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Session refresh lives in `src/proxy.ts`, calling `updateSession()` in `src/lib/supabase/middleware.ts` (that helper file keeps its name — it's the `@supabase/ssr` pattern's name, not a Next.js file convention).

## Supabase requires explicit GRANTs now — added migration 0007

`supabase/config.toml`'s generated comment on `auto_expose_new_tables` says new `public` schema tables are **no longer auto-exposed** to the `anon`/`authenticated`/`service_role` API roles by default — on hosted projects too, not just local. Confirmed by hitting `permission denied for table countries` while seeding, even with RLS policies in place (GRANT is evaluated before RLS). `0007_grants.sql` adds the GRANTs plus matching `ALTER DEFAULT PRIVILEGES` so future migrations don't need to repeat this.

## `get_my_role()` as a `SECURITY DEFINER` function

A plain RLS policy on `profiles` that reads `profiles.role` to decide access would recurse into itself. `get_my_role()` (migration 0005) runs as the function owner, bypassing RLS for that one lookup, and every other policy calls it instead of querying `profiles` directly.

## Seed data via `scripts/seed.ts`, not `supabase/seed.sql`

Chosen over Supabase's auto-run `seed.sql` because the seeded staff/client accounts need real `auth.users` rows with working passwords, and `supabase.auth.admin.createUser()` is the supported, version-stable way to create one. Hand-inserting into `auth.users`/`auth.identities` with `crypt()` works today but is an internal-schema hack that can break across GoTrue/CLI upgrades. `[db.seed]` is disabled in `supabase/config.toml` to avoid confusion about which path seeds the DB. Idempotent via upsert on natural keys (slug/code/ref_no) or a manual existence check where no natural key exists (locations, shipping_rates); auth users are looked up by email if `createUser` reports "already registered."

## Migrated to the hosted project via direct `psql`, not the Supabase MCP connector

The owner's hosted project (`sgcalyaioghsyxtjgmmj`) lives in a different Supabase account than the one this session's Supabase MCP connector is authorized for (`list_projects` only returned "roboco-op's Org" projects; `get_project` on the target ref returned a permission error). Rather than requiring a connector re-auth, applied the 7 migration files directly with `psql "$CONNECTION_STRING" -f <file>` using the project's own "Direct connection" string (Settings → Database), which only needed the DB password, not account-level access. `SUPABASE_SERVICE_ROLE_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`/`NEXT_PUBLIC_SUPABASE_URL` in `.env.local` came from Settings → API the same way.

## Added `SEED_AUTH_USERS` flag to `scripts/seed.ts`

Needed to seed the hosted project's catalog/reference tables without also creating the 5 demo auth accounts (a shared `DevPassword123!` is fine on a throwaway local Docker instance, not on a real internet-reachable project). `SEED_AUTH_USERS=false npx tsx --env-file=.env.local scripts/seed.ts` skips section 5 (auth users + role assignment) entirely; vehicles seeding doesn't depend on it. Defaults to `true` so plain `npm run seed` against local dev is unchanged.

## Local Supabase ports shifted to 563xx

This machine already runs two other local Supabase projects occupying the default 543xx range and a 553xx range. `supabase/config.toml` was shifted to 563xx (`api.port`, `db.port`, `shadow_port`, `db.pooler.port`, `studio.port`, `local_smtp.port`, `analytics.port`, `edge_runtime.inspector_port`) to avoid a port collision. This is local-machine-specific, not something to carry into a teammate's environment; if it ever collides there too, same fix.

## Node ≥22 required, without changing this machine's global default

`@supabase/supabase-js` (installed: 2.116.x) now hard-requires Node ≥22 — `createClient()` throws immediately on Node <22 because it needs a native `WebSocket` global for its realtime client, even when realtime is never used. This machine's default Node is 20.18.1, and other projects on it may depend on that. Rather than changing the global/default Node (`n`, `nvm`, or relinking Homebrew), this project pins itself via `.nvmrc` (`22`) and `package.json` `"engines"`, and every command in this session ran with a Homebrew-installed Node 22.23.2 explicitly prepended to `PATH`. Whoever picks this up next should `nvm use` (or equivalent) before running any `npm` script — see the note in PROGRESS.md.

## `chassis_no_private` / `vin_private` are row-level protected only, not column-masked

Postgres RLS is row-level: the `vehicles_select_published_or_staff` policy (migration 0006) correctly restricts *which rows* an anonymous visitor can read, but any role that can read a row gets every column, including the two that spec §3.3 says should be "partiellement masqué publiquement." True column masking needs a `vehicles_public` view (or excluding those columns from the public-facing query) — deferred to Phase 1, when the public vehicle-detail query path is actually built, rather than guessing its shape now.

## Workflow status is split across three enum columns, not one

Spec §3.6's single lifecycle (`lead → inquiry → quote_sent → reserved → awaiting_payment → paid → preparing_export → booked_shipping → shipped → arrived → completed`) doesn't map onto one column: `inquiries.status`, `quotes.status`, and `orders.status` each own part of it (migration 0001's `inquiry_status`/`quote_status`/`order_status` enums). This is a reasonable, documented split — revisit if Phase 3 (quotes) or Phase 5 (shipping) needs the stages to read as one continuous timeline.

## shadcn/ui: Radix base, Nova preset

The shadcn CLI (current version) prompts for a component library (Base UI / React Aria / Radix UI) and a visual preset. Chose Radix for ecosystem compatibility (existing shadcn blocks/community components assume it) and Nova (Lucide icons + Geist font) since `create-next-app`'s default template already uses Geist.

## Reconciled brand blue with the companion `J-cars-design` repo

A sibling repo (`../J-cars-design`) appeared mid-session: a dedicated brand design system (logo assets, `STYLE_GUIDE.md`, `tokens/colors.json`, `tokens/tailwind.tokens.ts`, and a `j-cars-design` Claude Code subagent for brand review), explicitly built to be copied into `J-cars-app` per its own README. Its sampled brand blue is `#3E60D9`, one shade off from this session's own independent PDF sampling (`#3361E1` — same source file, different rasterization path). Treated `J-cars-design` as the source of truth (it's the dedicated design-system deliverable spec §19 Phase 0 calls for) and updated `--brand-blue` in `globals.css` to `#3E60D9`.

A `brand/` folder (STYLE_GUIDE.md + tokens/, correctly pointing at this repo's own `Logo/logo-transparent-pdf.pdf` rather than the design repo's `assets/logo/...` path) and `.claude/agents/j-cars-design.md` showed up in this repo on their own shortly before this session copied its own near-duplicate — evidence of another agent session working the same integration step concurrently. Kept that better-adapted `brand/` folder and deleted this session's redundant copy (originally placed at `design/`) rather than have two slightly different sources of the same tokens in one repo.

Open item, not acted on: the style guide recommends a geometric sans UI typeface (Inter/Poppins) over the scaffold's default Geist, but flags the font match as unconfirmed. Left Geist in place for Phase 0 rather than swapping fonts on a guess — revisit once the logo's actual typeface is confirmed.

## Found and gitignored a stray `recovery-codes.txt`

A `recovery-codes.txt` appeared at the repo root mid-session (not created by this session) containing what look like MFA/account recovery codes, a browser session identifier, and a plaintext `database-password`. Added it to `.gitignore` immediately so it can never be committed; did not delete it, since its origin and whether the owner still needs it are unknown. **Flagged to the user — this file should be moved out of the project directory (e.g., into 1Password) and, if the listed database password is real and live, rotated.**

## Phase 1: vehicle slug is one segment, not nested per make/model

Kept Phase 0's existing `src/app/(public)/cars/[slug]/page.tsx` route rather than restructuring to `cars/[make]/[model]/[ref]`. Spec §12's `/cars/toyota/land-cruiser/ref-12345` is an illustrative example of clean URLs generally; spec §11's file convention (`cars/[slug]/`) is the binding folder structure, and Phase 0 already built it that way. The slug is `{makeSlug}-{modelSlug}-{refNo}` (`src/lib/catalog/slug.ts`); since `ref_no` is always exactly two hyphen-joined tokens (`JC-0001`), resolving a slug back to a vehicle just takes the *last two* dash-separated tokens of the whole slug — correct even when the model slug itself contains hyphens (`cr-v`, `land-cruiser`).

## Phase 1: filters are a plain GET form, not client state

`/stock`'s filters (`src/components/search/stock-filters.tsx`) submit via `<form method="get">` with the URL's search params as the single source of truth — no fetch, no client-side result state, matches the server-rendering pattern every other page in this app already uses. The one bit of client JS is the make→model cascading dropdown (narrowing visible `<option>`s on change) — that's a "use client" component, but it still submits as a normal form; the cascade is a UX nicety, not a requirement for the form to work.

## Phase 1: split `constants.ts` out of `queries.ts` after a real build failure

`stock-filters.tsx` (a "use client" component) originally imported `BODY_TYPES`/`FUEL_TYPES`/`TRANSMISSIONS` from `queries.ts`. That failed the production build: "You're importing a module that depends on next/headers... in the Pages Router" — because importing *anything* from `queries.ts` pulls in its server-only Supabase client code into the client bundle, regardless of which export is actually used. Moved the three pure constant arrays into `src/lib/catalog/constants.ts` (no Supabase import), which both the client filter form and the server query functions/home page import from. Lesson for later phases: a file mixing server-only data access with client-safe constants is a trap the bundler won't catch until build time — split them from the start next time.

## Phase 1: cast raw Supabase rows to hand-written interfaces instead of fighting embedded-relation type inference

`getVehicles`/`getVehicleBySlug` (`src/lib/catalog/queries.ts`) select embedded `make:makes(...)`/`model:models(...)`/`vehicle_images(...)` relations. Rather than relying on supabase-js's inferred type for that embedded shape (finicky in this version, similar to the earlier friction with the seed script's generic `upsert<T>`), the raw `.select()` result is cast once to an explicit `RawListRow`/inline type matching the select string, then mapped into the app's own `VehicleListItem`/`VehicleDetail` types. Same pragmatic trade-off as `scripts/seed.ts`'s `orThrow` helper: less compile-time guarantee on the raw DB row, none needed since it's immediately mapped into a fully-typed shape.

## Phase 1: Storage bucket RLS mirrors table RLS

`vehicle-images` (migration `0008`) is a public bucket with `storage.objects` policies following the exact same shape as the table policies in migration `0006`: public `select`, `admin`/`inventory_manager` write, using the same `get_my_role()` helper. No new pattern introduced.

## Real logo used from Phase 0, not a placeholder

The spec's plan called for a placeholder swappable logo since branding is nominally an owner decision "before production" (spec §25). A `Logo/logo-transparent-pdf.pdf` appeared in the project directory mid-session — the owner's actual "J-cars Exports" wordmark + globe mark, in black and `#3361e1` blue. Used it directly (converted to SVG/PNG via `pdftocairo`) instead of building a throwaway placeholder, since it satisfies spec §5/§25's actual requirement more directly than a generic stand-in would. `Logo.tsx` stays the single swap point if it's ever replaced.
