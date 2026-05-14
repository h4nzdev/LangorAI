-- LangorAI Database Schema
-- Run this in your Supabase SQL editor at https://app.supabase.com/project/_/sql

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  username          text unique not null,
  avatar            text default '👤',
  level             text default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced', 'Pro')),
  points            integer default 0,
  streak            integer default 0,
  last_active_date  date,
  total_sessions    integer default 0,
  total_minutes     integer default 0,
  learning_goal     text,
  proficiency_level text,
  wins              integer default 0,
  losses            integer default 0,
  draws             integer default 0,
  created_at        timestamptz default now()
);

-- ─── Practice Sessions ───────────────────────────────────────────────────────
create table if not exists practice_sessions (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references profiles(id) on delete cascade not null,
  topic            text not null,
  duration_minutes integer default 0,
  grammar_score    integer default 0,
  fluency_score    integer default 0,
  confidence_score integer default 0,
  error_count      integer default 0,
  created_at       timestamptz default now()
);

-- ─── Battle Rooms ────────────────────────────────────────────────────────────
create table if not exists battle_rooms (
  id          uuid default uuid_generate_v4() primary key,
  error_limit integer not null check (error_limit in (5, 10, 20)),
  status      text default 'waiting' check (status in ('waiting', 'active', 'completed')),
  winner_id   uuid references profiles(id),
  created_at  timestamptz default now(),
  started_at  timestamptz,
  ended_at    timestamptz
);

-- ─── Battle Participants ──────────────────────────────────────────────────────
create table if not exists battle_participants (
  id          uuid default uuid_generate_v4() primary key,
  room_id     uuid references battle_rooms(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  error_count integer default 0,
  accuracy    integer default 100,
  is_ready    boolean default false,
  joined_at   timestamptz default now(),
  unique(room_id, user_id)
);

-- ─── Matchmaking Queue ───────────────────────────────────────────────────────
create table if not exists matchmaking_queue (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references profiles(id) on delete cascade not null unique,
  error_limit integer not null check (error_limit in (5, 10, 20)),
  joined_at   timestamptz default now()
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table profiles           enable row level security;
alter table practice_sessions  enable row level security;
alter table battle_rooms       enable row level security;
alter table battle_participants enable row level security;
alter table matchmaking_queue  enable row level security;

-- profiles
create policy "Profiles are public" on profiles for select using (true);
create policy "Users can create their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- practice_sessions
create policy "Users can view own sessions" on practice_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on practice_sessions for insert with check (auth.uid() = user_id);

-- battle_rooms
create policy "Battle rooms are public" on battle_rooms for select using (true);
create policy "Authenticated can create rooms" on battle_rooms for insert with check (auth.role() = 'authenticated');
create policy "Participants can update rooms" on battle_rooms for update using (
  exists (select 1 from battle_participants where room_id = battle_rooms.id and user_id = auth.uid())
);

-- battle_participants
create policy "Participants are public" on battle_participants for select using (true);
create policy "Users can join battles" on battle_participants for insert with check (auth.uid() = user_id);
create policy "Users can update own battle data" on battle_participants for update using (auth.uid() = user_id);

-- matchmaking_queue
create policy "Queue visible to authenticated" on matchmaking_queue for select using (auth.role() = 'authenticated');
create policy "Users can join queue" on matchmaking_queue for insert with check (auth.uid() = user_id);
create policy "Users can leave queue" on matchmaking_queue for delete using (auth.uid() = user_id);

-- ─── Auto-create profile on signup ──────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(split_part(new.email, '@', 1), ''),
      'Player_' || substr(new.id::text, 1, 6)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Helper: increment session stats ────────────────────────────────────────
create or replace function increment_session_stats(p_user_id uuid, p_minutes integer)
returns void as $$
begin
  update profiles
  set
    total_sessions = total_sessions + 1,
    total_minutes  = total_minutes + p_minutes,
    last_active_date = current_date
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Real-time is handled via Supabase Broadcast channels (free on all plans).
-- No publication or replica setup is required.
