create extension if not exists pgcrypto;

create table if not exists public.survey_sections (
  id text primary key,
  display_order integer not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.survey_questions (
  id text primary key,
  section_id text not null references public.survey_sections(id) on delete cascade,
  display_order integer not null,
  label text not null,
  question_type text not null,
  is_required boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.survey_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  industry text not null,
  warehouse_count text not null,
  priority text not null,
  launch_window text not null,
  suggested_package text not null,
  summary_tags text[] not null default '{}',
  answers jsonb not null
);

alter table public.survey_sections enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_submissions enable row level security;

drop policy if exists "questions are readable" on public.survey_questions;
create policy "questions are readable"
  on public.survey_questions
  for select
  using (true);

drop policy if exists "sections are readable" on public.survey_sections;
create policy "sections are readable"
  on public.survey_sections
  for select
  using (true);

drop policy if exists "submissions can be inserted by anyone" on public.survey_submissions;
create policy "submissions can be inserted by anyone"
  on public.survey_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "submissions are viewable by authenticated users" on public.survey_submissions;
create policy "submissions are viewable by authenticated users"
  on public.survey_submissions
  for select
  to authenticated
  using (true);

drop policy if exists "submissions are updateable by authenticated users" on public.survey_submissions;
create policy "submissions are updateable by authenticated users"
  on public.survey_submissions
  for update
  to authenticated
  using (true)
  with check (true);

insert into public.survey_sections (id, display_order, title, description)
values
  ('profile', 1, 'Operasyon Profili', 'Firmanizin depo yapisini ve ekip olcegini toplar.'),
  ('processes', 2, 'Surec Oncelikleri', 'Hangi modullerin once acilmasi gerektigini tanimlar.'),
  ('inventory', 3, 'Stok ve Lokasyon', 'Izlenebilirlik ve raf derinligi ihtiyacini belirler.'),
  ('users', 4, 'Kullanici ve Yetki', 'Yetki modeli ile onay beklentisini cikarir.'),
  ('integrations', 5, 'Entegrasyon ve Cihaz', 'ERP, barkod ve yazici katmanlarini toplar.'),
  ('timeline', 6, 'Takvim ve Iletisim', 'Oncelik, hedef tarih ve iletisim alanlarini tutar.')
on conflict (id) do update set
  display_order = excluded.display_order,
  title = excluded.title,
  description = excluded.description;
