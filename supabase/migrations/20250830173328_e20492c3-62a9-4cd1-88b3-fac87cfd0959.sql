-- Fix function search path security issue
create or replace function public.is_org_member(org uuid)
returns boolean 
language sql 
stable 
security definer
set search_path = public
as $$
  select exists(
    select 1 from memberships m
    where m.org_id = org and m.user_id = auth.uid()
  );
$$;