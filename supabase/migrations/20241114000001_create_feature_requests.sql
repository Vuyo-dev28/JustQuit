create table
  public.feature_requests (
    id uuid not null default gen_random_uuid (),
    user_id uuid null,
    request text not null,
    created_at timestamp with time zone not null default now(),
    constraint feature_requests_pkey primary key (id),
    constraint feature_requests_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

alter table public.feature_requests enable row level security;

create policy "Allow authenticated users to insert their own feature requests" on public.feature_requests
  for insert
  to authenticated
  with check (auth.uid () = user_id);
