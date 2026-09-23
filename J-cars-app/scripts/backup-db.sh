#!/usr/bin/env bash
# Dumps a Supabase database (roles, schema, data) to backups/<timestamp>/.
# The connection string comes from the environment, never from this repo:
#
#   DATABASE_URL="$(op read 'op://<vault>/<item>/database-url')" scripts/backup-db.sh
#   scripts/backup-db.sh --local        # the local `supabase start` stack
#
# Storage files (vehicle photos, payment proofs, documents) are not in the
# database; see docs/BACKUP_RESTORE.md for copying the buckets.
# The URL is passed to the Supabase CLI as an argument, so run this on a
# machine you don't share with other users.
set -euo pipefail

if [[ "${1:-}" == "--local" ]]; then
  target=(--local)
elif [[ -n "${DATABASE_URL:-}" ]]; then
  target=(--db-url "$DATABASE_URL")
else
  echo "Set DATABASE_URL (percent-encoded) or pass --local." >&2
  exit 1
fi

# Dumps contain client personal data: owner-only from the moment they exist.
umask 077
out="backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$out"

supabase db dump "${target[@]}" --role-only -f "$out/roles.sql"
supabase db dump "${target[@]}" -f "$out/schema.sql"
supabase db dump "${target[@]}" --data-only --use-copy -f "$out/data.sql"

echo "Backup written to $out"
