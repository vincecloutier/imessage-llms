-- 1) uuid support
create extension if not exists "uuid-ossp";

-- 2) profiles (1:1 with auth.users)
create table public.profiles (
  id                 uuid       primary key references auth.users(id) on delete cascade,
  display_name       text       not null,
  imessage_address   text       unique,
  telegram_address   text       unique
);
-- index on imessage_address and telegram_address (for reverse lookup by phone or email)
create index on public.profiles(imessage_address);
create index on public.profiles(telegram_address);

-- enable rls and policy
alter table public.profiles enable row level security;
create policy "user owns profile"
  on public.profiles
  for all
  using ( id = auth.uid() )
  with check ( id = auth.uid() );

-- 3) personas
create table public.personas (
  id                    uuid       primary key default uuid_generate_v4(),
  user_id               uuid       not null references public.profiles(id) on delete cascade,
  display_name          text       not null,
  prompt                text       not null,
  temperature           float4      not null,
  model                 text       not null,
  is_imessage_persona   boolean    default false,
  is_telegram_persona   boolean    default false
);
create index on public.personas(user_id);
create unique index idx_unique_imessage_persona on public.personas(user_id) where is_imessage_persona = true;
create unique index idx_unique_telegram_persona on public.personas(user_id) where is_telegram_persona = true;

alter table public.personas enable row level security;
create policy "user owns persona"
  on public.personas
  for all
  using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );


-- 4) messages
create table public.messages (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references public.profiles(id) on delete cascade,
  persona_id       uuid        not null references public.personas(id) on delete cascade,
  channel          text        not null,
  role             text, 
  content          text,
  file_path        text,      
  file_description text,
  memorized        boolean     not null default false,
  created_at       timestamptz not null default now()
);
-- compound index to fetch a persona's history in time-desc order:
create index on public.messages (persona_id, created_at desc);

alter table public.messages enable row level security;
create policy "user owns messages"
  on public.messages
  for all
  using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );


create table public.cached_signed_urls (
  user_id uuid references auth.users(id) on delete cascade, -- links to the authenticated user
  file_path text primary key, -- the original path in the storage bucket
  signed_url text not null,   -- the generated signed url
  expires_at timestamptz not null -- the timestamp when the url expires
);

alter table public.cached_signed_urls enable row level security;
create policy "allow access for own urls" on public.cached_signed_urls for all using (auth.uid() = user_id);

create table public.server (
  id int primary key check (id = 1),
  url text not null,
  created_at timestamp with time zone default now()
);
alter table public.server enable row level security;

-- 5) attachments storage bucket
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false);

create policy "user can select own attachments" on storage.objects for select using (
  bucket_id = 'attachments' and auth.uid() = owner
);

create policy "user can insert own attachments" on storage.objects for insert with check (
  bucket_id = 'attachments' and auth.uid() = owner
);

create policy "user can update own attachments" on storage.objects for update with check (
  bucket_id = 'attachments' and auth.uid() = owner
);

create policy "user can delete own attachments" on storage.objects for delete using (
  bucket_id = 'attachments' and auth.uid() = owner
);
