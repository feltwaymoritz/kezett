-- Kezett — Supabase schema
-- Designed for a private/single-user JFT learning application but supports auth users.
create extension if not exists pgcrypto;

create type public.question_source as enum ('google_drive','previous_exam','ai_generated');
create type public.question_category as enum ('vocabulary','grammar','listening','reading');
create type public.verification_status as enum ('verified','reconstructed','partial','needs_visual_extraction','unreadable_shortcut');

create table if not exists public.source_packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  source question_source not null,
  source_url text,
  canonical_file text,
  verification verification_status not null default 'partial',
  estimated_items int,
  sections_detected int,
  tryout_eligible boolean not null default false,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_assets (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.source_packages(id) on delete cascade,
  file_name text not null,
  drive_file_id text,
  mime_type text,
  source_url text,
  content_hash text,
  extraction_status verification_status not null default 'partial',
  raw_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  source question_source not null,
  package_id uuid references public.source_packages(id) on delete set null,
  source_asset_id uuid references public.source_assets(id) on delete set null,
  category question_category not null,
  subcategory text,
  prompt text not null,
  prompt_ja text,
  options jsonb not null check (jsonb_typeof(options)='array'),
  correct_answer int,
  explanation text,
  explanation_ja text,
  audio_url text,
  audio_text text,
  audio_origin text check (audio_origin in ('original','tts_generated','none')) default 'none',
  audio_voice text,
  image_urls jsonb not null default '[]'::jsonb,
  original_unmodified boolean not null default false,
  verification verification_status not null default 'partial',
  source_order int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists questions_source_category_idx on public.questions(source,category);
create index if not exists questions_package_idx on public.questions(package_id);

create table if not exists public.tryouts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  source_package_id uuid references public.source_packages(id) on delete set null,
  duration_seconds int not null default 3600,
  item_count int not null,
  is_published boolean not null default false,
  config jsonb not null default '{"lock_previous_sections":true,"listening_forward_only":true,"listening_max_plays":2}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tryout_questions (
  tryout_id uuid references public.tryouts(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  position int not null,
  section_order int not null,
  primary key (tryout_id,question_id),
  unique(tryout_id,position)
);

create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  kanji text,
  hiragana text not null,
  romaji text,
  meaning_id text not null,
  example_ja text,
  example_id text,
  tags text[] not null default '{}',
  source_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.kanji (
  id uuid primary key default gen_random_uuid(),
  character text unique not null,
  onyomi text[] not null default '{}',
  kunyomi text[] not null default '{}',
  meaning_id text not null,
  examples jsonb not null default '[]'::jsonb,
  example_sentence_ja text,
  example_sentence_id text,
  source_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mode text not null check (mode in ('tryout','practice','vocabulary','kanji','listening')),
  tryout_id uuid references public.tryouts(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_seconds int,
  total_items int not null default 0,
  correct_items int not null default 0,
  accuracy numeric(5,2),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.attempt_items (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.attempts(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  selected_answer int,
  is_correct boolean,
  is_flagged boolean not null default false,
  elapsed_ms int,
  created_at timestamptz not null default now(),
  unique(attempt_id,question_id)
);

create table if not exists public.study_events (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  category question_category,
  duration_seconds int not null default 0,
  item_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace view public.category_performance as
select a.user_id, q.category,
       count(*) as answered,
       avg(case when ai.is_correct then 100.0 else 0.0 end)::numeric(5,2) as accuracy
from public.attempt_items ai
join public.attempts a on a.id=ai.attempt_id
join public.questions q on q.id=ai.question_id
group by a.user_id,q.category;

-- RLS: each authenticated user can only access their own history.
alter table public.attempts enable row level security;
alter table public.attempt_items enable row level security;
alter table public.study_events enable row level security;
create policy "own attempts" on public.attempts for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own attempt items" on public.attempt_items for all using (exists(select 1 from public.attempts a where a.id=attempt_id and a.user_id=auth.uid())) with check (exists(select 1 from public.attempts a where a.id=attempt_id and a.user_id=auth.uid()));
create policy "own study events" on public.study_events for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
