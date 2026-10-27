-- Jalankan seluruh script ini di Supabase Dashboard > SQL Editor > New query
-- lalu klik "Run".

create table if not exists storage_kv (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value text not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

-- Aktifkan Row Level Security: wajib, supaya user A tidak bisa baca/tulis data user B
alter table storage_kv enable row level security;

-- Policy: user hanya boleh mengelola baris miliknya sendiri
create policy "Users can manage their own storage"
on storage_kv
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
