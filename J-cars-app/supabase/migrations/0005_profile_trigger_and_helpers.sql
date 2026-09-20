-- Auto-create a profiles row for every new auth user. Runs as the function
-- owner (security definer), so it can insert into public.profiles even
-- before any RLS policy grants the new user write access to it.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reads the caller's role without going through RLS on profiles, which
-- avoids the self-recursion a normal policy on profiles would hit if it
-- tried to query profiles.role directly for the admin-access check.
create function public.get_my_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;
