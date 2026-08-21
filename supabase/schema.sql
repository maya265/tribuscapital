-- Tribus Capital client portal — run this once in the Supabase SQL editor
-- (Project → SQL Editor → New query → paste all of this → Run)

-- ---------- Tables ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  national_id text,
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  loan_number text not null,
  loan_type text,
  principal_amount numeric(12,2),
  status text not null default 'active',
  start_date date,
  created_at timestamptz not null default now()
);

create table public.loan_documents (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  title text not null,
  storage_path text not null,      -- '<client_id>/<loan_id>/<filename>'
  document_type text,              -- 'contract' | 'statement' | 'id_copy' ...
  uploaded_at timestamptz not null default now()
);

-- Auto-create a blank profile row when an admin invites a new auth user,
-- so the admin edits an existing row instead of inserting one with a
-- hand-copied UUID.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------

alter table public.profiles enable row level security;
alter table public.loans enable row level security;
alter table public.loan_documents enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "loans_select_own" on public.loans
  for select using (client_id = auth.uid());

create policy "loan_documents_select_own" on public.loan_documents
  for select using (
    exists (
      select 1 from public.loans
      where loans.id = loan_documents.loan_id
        and loans.client_id = auth.uid()
    )
  );

-- No insert/update/delete policies are defined anywhere on purpose.
-- With RLS enabled and no write policy, the browser (anon key + client
-- session) cannot write at all — only the Supabase dashboard (service_role)
-- can create/edit clients, loans, and documents. This matches the "admin
-- provisions everything" workflow in supabase/ADMIN-GUIDE.md.

-- ---------- API access grants ----------
-- Required because the project was created with "Automatically expose new
-- tables" turned off (the safer setting Supabase itself recommends) — so
-- these tables need to be exposed to the Data API explicitly. Only the
-- "authenticated" role gets access (logged-in clients); "anon" gets none,
-- so an unauthenticated request has no table-level access at all, on top
-- of the RLS policies above.

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select on public.loans to authenticated;
grant select on public.loan_documents to authenticated;

-- ---------- Storage ----------
-- Run this AFTER creating a bucket named 'loan-documents' (set to Private)
-- in Storage → New bucket.

create policy "loan_documents_download_own"
on storage.objects for select
using (
  bucket_id = 'loan-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
