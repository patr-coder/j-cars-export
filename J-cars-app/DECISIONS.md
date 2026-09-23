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

## Phase 2: admin mutations go through the RLS-governed client, not the service-role admin client

`src/actions/vehicles.ts`, `vehicle-images.ts`, and `catalog.ts` all call `createClient()` from `src/lib/supabase/server.ts` (the same cookie-based, anon-scoped client every page already uses) rather than the service-role admin client from `src/lib/supabase/admin.ts`. RLS (migration `0006`) already grants `admin`/`inventory_manager` full read/write on `vehicles`/`vehicle_images`/`vehicle_features`, and `admin`-only write on `makes`/`models`/`locations` — so the signed-in staff user's own session is sufficient, and RLS becomes the real authorization boundary (matching the comment already in `src/lib/auth/roles.ts`: "every action must check this too" — `requireRole()` in each action is the second layer, not the only one). The service-role client stays confined to `scripts/seed.ts`, its original and only use — widening its usage surface into request-handling code would trade a narrow, well-understood exception for a broad one.

## Phase 2: ref_no is auto-generated, not admin-entered

New vehicles get `JC-XXXX` assigned server-side (`src/lib/catalog/ref-no.ts`), by reading every existing `ref_no` and taking the highest numeric suffix + 1 — not a `max()`/text sort, since `"JC-9"` would otherwise sort after `"JC-10"` as a string. No retry-on-conflict loop for a concurrent double-create; acceptable for a low-concurrency internal admin tool with a handful of staff accounts. `ref_no` is read-only once a vehicle exists (shown but not editable in the edit form), since it's baked into the public slug (`buildVehicleSlug`, Phase 1).

## Phase 2: "archiver" collapses into "dépublier" — no `archived` status value

Spec §4.2 lists créer/modifier/dupliquer/publier-dépublier/réserver/vendre/archiver/supprimer as admin actions, but the `vehicle_status` enum (migration `0001`) only has `available`/`reserved`/`sold`/`in_transit` — there's no `archived` value, and adding one wasn't warranted by anything Phase 2 actually needs yet. "Réserver"/"vendre" map directly to `setVehicleStatus`; "archiver" and "dépublier" both just mean `published = false` (`setVehiclePublished`). If a later phase needs a real distinction (e.g. "archived but keep the status history"), add the enum value then rather than guessing its shape now.

## Phase 2: photo manager ships without drag-and-drop, compression, or watermarking

Spec §4.3 calls drag-and-drop reorder, automatic compression, thumbnail generation, and logo watermarking "indispensables." `src/components/admin/photo-manager.tsx` ships multi-file upload, previews, set-primary, delete, and alt text — reorder is a pair of up/down buttons instead of drag-and-drop (no new DnD dependency), and compression/thumbnailing/watermarking are deferred entirely; uploaded files land in the `vehicle-images` bucket as-is. This mirrors Phase 1's own precedent (shipping a usable subset over full UI polish, e.g. no gallery lightbox) rather than blocking Phase 2 on image-processing work. Flagged here as an open item, not a silent gap — worth a dedicated polish pass once there's real inventory-photo volume to justify it.

## Phase 2: admin vehicle search is a single `.ilike()` on `ref_no`, not a `.or()` across columns

`getAdminVehicles` (`src/lib/catalog/queries.ts`) searches `ref_no` only. A tempting alternative — `.or('ref_no.ilike.%q%,description.ilike.%q%')` — folds the raw search string into a PostgREST filter-expression string; a `q` containing a comma or parenthesis would reshape the filter's logic, not just the search term (not classic SQL injection, since PostgREST still parameterizes the actual query, but still an unintended-query-shape bug for admin-controlled input). Single-column `.ilike()` sidesteps the whole class of issue.

## Phase 2: photo upload never trusts the uploaded filename or declared type

The `security-auditor` subagent caught a real path-traversal risk in the first pass of `uploadVehicleImages` (`src/actions/vehicle-images.ts`): the storage key was built as `` `${vehicleId}/${crypto.randomUUID()}-${file.name}` ``, and `file.name` in a multipart request is fully attacker-controllable — a crafted request (not just a browser file picker) could set a filename containing `/` or `..` and place or overwrite objects outside that vehicle's own prefix in the single, fully-public `vehicle-images` bucket. Fixed by never interpolating `file.name` into the path at all: the file's declared MIME type is checked against an allowlist (`image/jpeg`/`image/png`/`image/webp`), the storage key uses only `${vehicleId}/${crypto.randomUUID()}.${extension}`, and `contentType` passed to Storage comes from that same allowlist rather than the client-declared `file.type` verbatim — otherwise a public bucket could be made to serve back an attacker-chosen `Content-Type` (e.g. `image/svg+xml` with an inline `<script>`) at a public URL. Also added a per-upload file-count cap (10) and per-file size cap (5MB), since neither existed before.

While testing this with a real (>1MB) sample photo, hit Next's own default Server Actions body limit (1MB) first — a 500 with a raw Next.js error page, before `uploadVehicleImages` ever got a chance to run its own validation. Set `experimental.serverActions.bodySizeLimit` to `50mb` in `next.config.ts`, sized to this exact worst case (10 files × 5MB), not left at the framework default. The two limits have to be read together: the app-level cap decides what's a *reasonable* upload, the framework-level cap has to be at least that large or every upload near the app's own limit fails with an unhelpful framework error instead of the friendly one.

## Phase 2: `audit_logs` not wired up yet — deferred, not forgotten

The schema already has an `audit_logs` table (migration `0004`, admin-only RLS) that nothing in Phase 2 writes to — publishing/unpublishing, deleting a vehicle, and deleting a make/model/location all happen with no application-level record of which staff account did it. Spec §19 lists "audit log" explicitly under Phase 6, so this is left for that phase rather than half-building it now; flagged here (per the `security-auditor` review) so it's a deliberate deferral, not a gap nobody noticed.

## Phase 2: makes/models/locations get create+delete from the admin UI, not edit

`src/app/admin/catalog/page.tsx` only exposes adding a new row and deleting an existing one — no inline edit. Renaming a make/model after vehicles already reference it is rare enough (and the slug would need to move with it, affecting existing public URLs) that it wasn't worth a form for Phase 2; delete-and-recreate covers the mistake-fixing case for a make/model that isn't in use yet, and the FK constraint blocks deleting one that is (surfaced as a friendly message via `?error=`, not a 500).

## Real logo used from Phase 0, not a placeholder

The spec's plan called for a placeholder swappable logo since branding is nominally an owner decision "before production" (spec §25). A `Logo/logo-transparent-pdf.pdf` appeared in the project directory mid-session — the owner's actual "J-cars Exports" wordmark + globe mark, in black and `#3361e1` blue. Used it directly (converted to SVG/PNG via `pdftocairo`) instead of building a throwaway placeholder, since it satisfies spec §5/§25's actual requirement more directly than a generic stand-in would. `Logo.tsx` stays the single swap point if it's ever replaced.

## Phase 3: `inquiries.vehicle_id` made nullable, `shipping_rates` gained three fee columns

Migration `0009`. Spec's own `inquiries` table (§8) has `vehicle_id` as required, but `/contact` needs to work as a general contact form, not just a per-vehicle "Get Quote" — confirmed with the owner, made nullable. Separately, spec §3.4's calculator output list includes "frais locaux/export" alongside freight/insurance/inspection/certificate, but the schema had no column for it and the spec insists the calculator must be "piloté par les tables admin, jamais hardcodé" — rather than reach for `site_settings` (a Phase 6 CMS table, not yet given an admin UI) added `inspection_fee_usd`/`certificate_fee_usd`/`local_export_fee_usd` directly on `shipping_rates`, since these fees plausibly vary by destination/route anyway. Also confirmed with the owner.

## Phase 3: quotes only originate from inquiries — no standalone "create quote" flow

Matches the spec's own workflow (`lead → inquiry → quote_sent`, §3.6) literally: `/admin/quotes/new` requires `?inquiryId=`, and every quote's vehicle/user/contact info is inherited from that inquiry rather than picked independently. This also sidesteps needing a client picker UI — a real gap, since `quotes.user_id` is nullable (guest leads have no account) and there's no natural "search clients" flow built yet. If staff later want to proactively quote someone with no prior inquiry, the smallest fix is letting them create a placeholder inquiry first, not a second quote-creation path.

## Phase 3: guest (no-account) leads are a first-class case, not an edge case

`inquiries.user_id` is nullable and RLS (`inquiries_insert_anyone`, migration 0006) already allows anonymous insert — most real leads on a marketplace like this won't have an account yet. `sendQuote` (`src/actions/quotes.ts`) resolves the recipient email as `profiles.email` when the quote has a `user_id`, falling back to the inquiry's own raw `email` column otherwise. The full breakdown is inlined directly in the "devis prêt" email (`src/lib/email/templates.ts`) rather than linking to a page, since a guest has nowhere logged-in to view it — logged-in clients additionally see it in `/account/inquiries`, guests only get the email. No separate public quote-viewing route was built for Phase 3.

## Phase 3: quote email's "other fees" line quietly absorbs the calculator's "local/export fees"

The `quotes` table (spec §8) has `other_fees` as its only catch-all column — no dedicated slot for the local/export fee once a quote is actually persisted, unlike the live public calculator (`src/components/quote/price-calculator.tsx`), which still shows it as its own line per spec §3.4 (it's ephemeral, browser-only, never saved). `createQuoteFromInquiry` folds `breakdown.localExportFee` into `other_fees` at creation time (`src/actions/quotes.ts`), and the "devis prêt" email shows one combined "Other fees (incl. local / export)" row rather than faking a split that the stored data can no longer support.

## Phase 3: email is Resend, but no-ops without `RESEND_API_KEY`

`src/lib/email/resend.ts` — spec §7/§15 names Resend as the provider and lists `RESEND_API_KEY` as an env var, but it isn't in `.env.local` yet. Rather than blocking the whole inquiry/quote workflow on getting a key, `sendEmail()` checks `getEnv().RESEND_API_KEY` and console-logs instead of throwing when it's unset — every DB write, status transition, and admin UI works today; email activates the moment the key is added, no code change needed. Only two templates exist (`src/lib/email/templates.ts`, plain HTML strings) — spec §16 lists several more ("bienvenue", "réservation confirmée", "paiement reçu", "véhicule expédié", "recherche sauvegardée"), all of which belong to later phases (Phase 4/5) and weren't built ahead of their own phase.

## Phase 3: two `getAdminInquiries`/`getAdminQuotes` lessons learned from testing, not caught by lint or typecheck

Both were real runtime bugs, not typos — worth recording so the pattern is recognized faster next time:
- **Ambiguous embedded relation**: `quotes` has two foreign keys to `profiles` (`user_id` and `created_by`), so `user:profiles(...)` in a `.select()` throws `"more than one relationship was found"` at request time — TypeScript has no way to catch this since Supabase's embed syntax is a runtime-parsed string. Fixed with the explicit constraint-name form, `user:profiles!quotes_user_id_fkey(...)` (same fix already used for `inquiries.assigned_to` in `src/lib/inquiries/queries.ts`). Any table with two-or-more FKs to the same target table needs this the moment a second embed of that target is added — worth checking for on sight, not just when Supabase complains.
- **`getAdminVehicles`'s `.ilike()`-only search discipline (Phase 2) was kept**: `getAdminInquiries`/`getAdminQuotes`'s status filters use a plain `.eq("status", filters.status as never)`, not a hand-built `.or()` string — confirmed by the Phase 3 `security-auditor` pass that the PostgREST filter-injection class of bug from Phase 2 wasn't reintroduced.

## Phase 3: `submitInquiry` hardened after a real security-auditor finding — unescaped HTML + no throttle

The first `security-auditor` pass flagged this as fix-before-merge, not a nice-to-have: `submitInquiry` is the app's only fully anonymous write-and-send-email path (`inquiries_insert_anyone`, migration 0006), and had no rate limit at all, while `src/lib/email/templates.ts` interpolated the attacker-supplied `name` field straight into HTML sent to a caller-chosen `to` address. Together that's an open mailer — repeatedly submitting with a third party's email as `email` and attacker-controlled markup as `name` could email-bomb that address or phish under this site's name. Fixed three ways: (1) `escapeHtml()` in `templates.ts` wraps every user-supplied string before interpolation (vehicle labels, amounts, and dates stay unescaped since those are server-derived, not user input); (2) a honeypot field (`company`, visually hidden in `InquiryForm`, silently accepted-but-dropped if filled) catches unsophisticated bots for free; (3) a per-email cap (5 inquiries/hour, checked against `inquiries.email` before insert) blocks the specific email-bombing abuse case with no new infrastructure. A full CAPTCHA/per-IP throttle (the auditor's suggested next step) needs a third-party service and API keys the owner would have to set up — deliberately deferred as a follow-up decision, not silently dropped.

## Phase 3: `createQuoteFromInquiry` verifies the shipping rate against the vehicle's own location

A lower-severity finding from the same audit: the form only offered rates for the vehicle's location, but the server action trusted whatever `shippingRateId` came through without checking it actually originated there — a staff member (already role-gated) could in principle submit a mismatched rate. Added a server-side check (`rate.origin_location_id !== vehicleLocationId` → reject) so the UI's restriction is also enforced where it actually matters.

## Phase 3: Playwright testing lesson — non-redirecting server actions need an explicit wait, not `networkidle`

Recurring pattern while testing Phase 3's admin flows (assign, send quote): a server action that only calls `revalidatePath()` (no `redirect()`) updates the page via a soft RSC re-render, not a browser navigation event — `page.wait_for_load_state("networkidle")` right after the triggering click can resolve *before* that re-render lands, making the very next assertion read stale content. Fix used throughout: wait for the specific expected outcome (`page.wait_for_selector(...)` or `page.wait_for_function(...)` on the changed element) instead of trusting `networkidle` timing. Same root cause as Phase 2's React-SSR-comment-node lesson — the fix is different, but the underlying rule is the same: assert on rendered state, not on network idleness.

## Reconciled the `jcars-design` skill's brand-blue tokens against the already-decided value

A `.claude/skills/jcars-design/` skill arrived via `git pull` (pushed from another session) with its own bundled `assets/jcars-tokens.css` and `references/brand-system.md`, both using `#3461E2` as the brand blue — a third, independently-sampled value, distinct from both this repo's `--brand-blue` (`#3E60D9`, `globals.css`) and the standing decision documented above ("Reconciled brand blue with the companion `J-cars-design` repo"). Since that decision already settled the question — defer to the dedicated `J-cars-design` repo as the canonical source rather than any one session's own PDF sampling — re-litigating it per-skill would let the brand color drift a little further every time a new tool samples the logo fresh. Updated the skill's tokens and docs to `#3E60D9` (and recomputed its `brand-700`/`brand-800`/`brand-100` shades to match) rather than touching `globals.css`, since the app and the design repo already agree with each other.

## Phase 3: manual-testing fixes — phone country/flag picker, vehicle preview on inquiry detail

Three fixes requested by the owner after manually testing Phase 3 in the browser, before this phase was committed:
- `InquiryForm`'s phone field (`src/components/quote/inquiry-form.tsx`, shared by both the vehicle-detail "Request a quote" section and `/contact` — one fix covers both) gained a country dial-code selector, `src/lib/phone/countries.ts` (~195 countries, ISO 3166-1 alpha-2 + ITU-T calling code, no new dependency — flag rendered from the alpha-2 code via Unicode regional-indicator math, `flagEmoji()`). `submitInquiry` (`src/actions/inquiries.ts`) combines `phoneCountry`+`phoneNumber` into one `+<dialCode> <number>` string before insert. After a first pass showed the full "🇨🇩 Congo (DRC) (+243)" option text made the select too wide next to the number field, narrowed it to flag+dial-code only (country name kept as a hover `title`, not deleted — still needed to disambiguate same-flag entries) and gave the number `Input` `flex-1 min-w-0` so it visibly has room to type, which it lacked by default in a flex row (a bare `<Input>` doesn't grow to fill remaining space without an explicit flex class).
- `/admin/inquiries/[id]` now shows a photo + link to the linked vehicle listing (`getInquiryById`, `src/lib/inquiries/queries.ts`, extended to also select `vehicle_images`/make+model slugs and compute `vehicleSlug`/`vehicleImageUrl`) — previously the vehicle was only named in a `<dl>` row with no way to actually see or open the listing from the lead.

## Phase 4: reservation is client self-service — resolves a real Phase 3 drift

Spec §19 places `orders`/reservation under Phase 4, not Phase 5 (Phase 5 is payment-proof verification and shipment tracking on top of an already-reserved order). Phase 3's own stub text (`PROGRESS.md`, `/cars/[slug]`'s disabled "Reserve Vehicle" button) had assumed reservation was Phase 5 — confirmed with the owner that spec's placement is the one to follow, and fixed the stub text/tooltips accordingly. Migration `0010_client_account.sql` replaces the all-or-nothing `orders_write_staff` RLS policy with four narrower ones: `orders_insert_owner` (a signed-in client can insert their own order — `orders.user_id` is `not null`, so unlike guest-friendly `inquiries` there's no anonymous reservation path), `orders_insert_staff`, `orders_update_owner_or_staff` (lets an owner cancel their own order), and `orders_delete_staff`.

## Phase 4: a Postgres trigger syncs `vehicles.status` from `orders.status`, not client-side RLS

`vehicles` UPDATE stays `admin`/`inventory_manager`-only (unchanged) — a client reserving a vehicle has no RLS path to flip `vehicles.status` to `reserved` themselves. Rather than widen that RLS (which would let any signed-in client edit arbitrary vehicle fields, not just status), added `sync_vehicle_status_from_order()` — a `security definer` trigger on `orders` (same pattern as `handle_new_user()`, migration 0005) that flips the vehicle to `reserved` on insert and back to `available` when an order is cancelled. Deliberately narrow: it does not attempt to handle `paid`/`sold` — that belongs to Phase 5 once `payments` rows exist to drive it, and building that now would be guessing at a workflow this phase doesn't own.

## Phase 4: no auto-expiry job for `reserved_until`

`reserveVehicle` (`src/actions/orders.ts`) sets a 72h hold (`RESERVATION_HOLD_HOURS`), but nothing automatically cancels an order or frees the vehicle when that time passes — this project has no cron/scheduler yet (same gap as the saved-search "email on new match" alert, below). `/admin/orders` flags an expired-but-still-`reserved` hold inline (`reservedUntil < now`) so staff can manually follow up or cancel; real automatic expiry is a documented follow-up, not silently dropped.

## Phase 4: invoices reuse order/quote data — no new table, no PDF

Spec §24 explicitly marks PDF invoice generation as a V2 feature, and there's nothing else in the spec defining what an "invoice" record needs beyond what a quote already produces. Confirmed with the owner: `/account/invoices` (`src/app/account/invoices/page.tsx`) is a read-only render of `getClientOrders()`'s data, reusing the same quote-breakdown fields the "devis prêt" email already formats — no `invoices` table, no numbering scheme separate from `orders.order_no`. `getOrderById`/`getClientOrders`/`getAdminOrders` (`src/lib/orders/queries.ts`) all select the linked quote's breakdown at list level (not just detail), specifically so the invoices list can render it without an N+1 fetch per order.

## Phase 4: consignee fields on `profiles` are an assumption, not a spec definition

Spec never defines what a "consignee" record contains — "Profil / consignee" appears only as a section label (§2.2/§3.5). Added a minimal, reasonable MVP set (`consignee_name`, `consignee_company`, `consignee_address`, `consignee_city`, `consignee_country`, `consignee_phone`, all nullable — most clients will self-consign) via migration `0010`. Flagged here as an assumption since it's the kind of thing a real export business may want to define more precisely (tax ID? notify party? multiple consignees per client?) — cheap to extend later, not worth guessing further than this now.

## Phase 4: saved-search email alerts are stored but not sent

`saved_searches.email_alerts` (existing column, Phase 0) is captured by the new "Save this search" form (`src/components/search/save-search-button.tsx`) and shown on `/account/searches`, but no job actually diffs new listings against saved filters and sends the "nouveau véhicule correspondant" email from spec §16. Building that needs a scheduling mechanism this project doesn't have yet (no pg_cron, no Vercel Cron) — deliberately deferred, same treatment as Phase 3's CAPTCHA/per-IP throttle follow-up: the preference is captured so turning the feature on later doesn't need a UI/schema change, just the job itself.

## Fixed `npm run seed` silently targeting the hosted project instead of local

Discovered while resetting local Supabase for Phase 4 testing: `supabase db reset` correctly wipes and reapplies migrations to *local* Postgres, but the chained `npm run seed` (`db:reset`'s second half) used `tsx --env-file=.env.local scripts/seed.ts` — and `.env.local` holds the **hosted** project's URL/keys (set up during the one-off hosted seeding session documented above), while the actual local credentials live in `.env.development.local` (which `next dev` also loads, with higher precedence, which is why the app itself was never affected). Since `tsx --env-file` loads only the file(s) named, `npm run seed` had been silently re-seeding the hosted project on every invocation instead of local — `db:reset` looked like it worked (no errors, "Seed complete" logged) while local stayed empty. This directly contradicts this project's own earlier documented intent ("Defaults to `true` so plain `npm run seed` against local dev is unchanged") — a real regression from whenever `.env.local` was repurposed for the hosted credentials, not something anyone deliberately decided. Fixed by pointing `seed` at `.env.development.local`; the explicit `npx tsx --env-file=.env.local scripts/seed.ts` one-off command (still needed to seed hosted deliberately) is unaffected since it names its env file explicitly.

## Phase 4: moved `ConfirmSubmitButton` and the status-badge module out of `admin/`

Both were originally under `src/components/admin/` but are now imported from client-facing `/account` pages too (`cancelOrder`'s confirm dialog, `OrderStatusBadge`) — same reasoning as the Phase 3 fix that moved `status-badge.tsx` out of `admin/` for the same cross-boundary-import reason. `ConfirmSubmitButton` moved to `src/components/confirm-submit-button.tsx`; its five existing admin importers were updated, no behavior change.

## Phase 5: order lifecycle is enforced by a trigger, not just the server action

Two pre-existing policies became exploitable once payments drive order status: `orders_update_owner_or_staff` (0010) let a client PATCH any column of their own order over REST (e.g. `status = 'paid'`), and `payments_insert_owner_or_staff` (0006) let a client insert a payment already `status = 'verified'`. The first `security-auditor` pass of Phase 5 then found the staff-side version of the same gap: `setOrderStatus` checked `ORDER_TRANSITIONS`, but a `sales` JWT could PATCH `status = 'paid'` directly and skip payment verification. Migration `0012` fixes all three at the DB layer: `enforce_order_rules()` (before-update trigger) restricts clients to `reserved|awaiting_payment → cancelled` with no other column change, restricts staff to the transition list, and only accepts `→ paid` when verified payments sum to at least `total_usd`. The owner payment-insert policy now only allows a pending, unverified row whose `proof_path` sits under that order's own `payments/` folder. `ORDER_TRANSITIONS` in `src/lib/orders/constants.ts` mirrors the trigger for the UI and must be kept in sync by hand.

## Phase 5: an order is paid when verified payments cover the total

Confirmed with the owner: a client can submit several proofs (e.g. after a rejection, or paying in two transfers), and `verifyPayment` flips the order to `paid` once the sum of verified payments ≥ `total_usd` (`src/lib/payments/rules.ts`, summed in integer cents). Staff can't mark an order paid by hand. Spec §3.7's "paiements partiels / dépôt" remains V2 in the sense that there's no deposit schedule or partial-payment terms, only multiple transfers toward one total. Refunds aren't modelled: cancelling an `awaiting_payment` order that already has verified payments is still allowed, and any refund happens offline.

## Phase 5: private `order-files` bucket, signed URLs via the session client

Payment proofs and export documents go in a private bucket (`order-files`, migration `0012`) at `{orderId}/payments/<uuid>.<ext>` and `{orderId}/documents/<uuid>.<ext>`. Storage policies derive access from the order in the first path segment: the owner or staff can read, the owner can insert only under `payments/` while the order is still payable, and only staff can write documents or delete. Files are served through 10-minute signed URLs created with the caller's cookie session client (`src/lib/storage/order-files.ts`), so Storage signs only what that user can already read, with no service role involved. A signed URL is a bearer token by design: anyone holding the link can open the file until it expires. That's the accepted trade-off of spec §14's "signed URLs documents privés". File types (PDF/JPG/PNG/WebP) and a 5MB cap are whitelisted server-side, and keys never use `file.name`, the same reasoning as the Phase 2 photo upload.

## Phase 5: bank details live in `site_settings.bank_details`

Confirmed with the owner. Migration `0012` seeds a `bank_details` row with placeholder values (`TO BE CONFIGURED`), shown on `/account/orders/[id]` next to the payment-proof form. `site_settings` is already public-read (0006), which is fine for company bank-transfer instructions. It's edited with SQL until Phase 6 adds a CMS screen for it. **The real values must be filled in before go-live, on both local and hosted.**

## Phase 5: one shipment per order, staff-maintained

`shipments` gained a unique constraint on `order_id` so `upsertShipment` can upsert. A unique constraint rather than just a unique index, so PostgREST also treats the relation as one-to-one. Shipment status (booked/in_transit/arrived/released) is staff-entered information and isn't coupled to the order status. The order lifecycle (`booked_shipping → shipped → arrived → completed`) is advanced separately, and it drives the vehicle status (`shipped → in_transit`, `paid`/`arrived → sold`) through the extended `sync_vehicle_status_from_order`. The "ETA updated" email fires only when an already-set ETA changes; the first ETA goes out with the "shipped" email. Tracking URLs must be `https://`, since they're rendered as links on the client page.
