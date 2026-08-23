-- Allow the browser login flow to verify only the currently authenticated user's admin row.
grant select on table public.admin_users to authenticated;

create policy "Authenticated users verify their own admin record"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));
