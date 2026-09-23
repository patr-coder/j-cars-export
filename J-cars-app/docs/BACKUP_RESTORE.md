# Backup & restore

What needs backing up, and how to get it back. Two things hold data:

1. **The Postgres database**: vehicles, orders, payments, CMS content, users (`auth.users`), audit log.
2. **Supabase Storage**: vehicle photos (`vehicle-images`, public) and payment proofs + export documents (`order-files`, private). These files are **not** in the database dump.

## 1. Automatic backups (hosted project)

Supabase takes daily backups of hosted projects. How long they're kept, and whether point-in-time recovery is available, depends on the plan. Check **Project → Database → Backups** in the Supabase dashboard. On the Free plan there are no downloadable backups, so the manual backup below is the only copy you control.

Restore from the dashboard by picking a backup there. It **replaces the whole database** of that project.

## 2. Manual database backup

Run before every migration on the hosted project, and on a schedule (weekly at minimum):

```bash
DATABASE_URL="$(op read 'op://<vault>/<item>/database-url')" scripts/backup-db.sh
```

- `DATABASE_URL` is the **Session pooler** connection string from **Project → Connect**, percent-encoded. Keep it in 1Password and never in the repo or in `.env.local`.
- The script writes `backups/<UTC timestamp>/roles.sql`, `schema.sql`, `data.sql` (owner-only file permissions; `backups/` is gitignored).
- The dump contains client personal data and payment records. Store it encrypted (e.g. as a 1Password document or on an encrypted drive), never in a shared folder or chat.
- `scripts/backup-db.sh --local` backs up the local `supabase start` stack instead.

## 3. Storage backup

```bash
supabase storage cp -r ss:///vehicle-images ./backups/storage/vehicle-images --experimental --linked
supabase storage cp -r ss:///order-files ./backups/storage/order-files --experimental --linked
```

(`--linked` needs `supabase link --project-ref <ref>` once.) `order-files` holds payment proofs and B/Ls: treat it like the database dump.

## 4. Restore into a new (empty) project

Use a **new** Supabase project, or one you're willing to wipe.

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file backups/<ts>/roles.sql \
  --file backups/<ts>/schema.sql \
  --command 'SET session_replication_role = replica' \
  --file backups/<ts>/data.sql \
  --dbname "$NEW_DATABASE_URL"
```

`session_replication_role = replica` disables triggers while data loads. Otherwise every restored row would fire the audit trigger and the vehicle/order sync triggers again. Then copy Storage back (`supabase storage cp -r ./backups/storage/vehicle-images ss:///vehicle-images ...`), point `NEXT_PUBLIC_SUPABASE_URL`/keys in Vercel at the new project, and redeploy.

**After a restore, check:** row counts of `vehicles`, `orders`, `payments`, `profiles` and `auth.users` match what you expect; you can sign in as an admin; a vehicle photo and a payment proof open; `/admin/audit` shows the history.

## Verified

2026-09-23: a `--local` backup was restored into a scratch database emulating a fresh project (Supabase-managed schemas present, `public` empty). All table row counts, the 5 `auth.users`, all 45 RLS policies and the 17 audit triggers matched the source.

## Retention (recommended)

Keep daily dumps for 7 days, weekly for 8 weeks, and one per month for a year. Delete older dumps: they hold personal data that shouldn't be kept longer than needed.
