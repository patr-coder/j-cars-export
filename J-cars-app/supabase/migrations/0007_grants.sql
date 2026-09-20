-- Recent Supabase CLI/platform versions stopped auto-exposing new `public`
-- schema tables to the Data API roles (see the `auto_expose_new_tables`
-- note in supabase/config.toml — this is the new default on hosted
-- projects too, not just local). RLS is still the real access gate; these
-- GRANTs are the coarser "can this role query this table at all" layer
-- that has to exist underneath it.
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- So tables/sequences/functions added by future migrations get the same
-- treatment without a matching grants migration every time.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;
