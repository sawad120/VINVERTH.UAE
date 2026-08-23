-- ============================================================
-- Migration: Bypass MFA requirement for admin write operations
-- This replaces is_admin_mfa() to use is_admin() only,
-- removing the aal2 JWT check that blocks all CUD operations
-- when 2FA is bypassed on the frontend.
-- ============================================================

-- Step 1: Replace is_admin_mfa() to simply delegate to is_admin()
create or replace function public.is_admin_mfa()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin();
$$;

-- Step 2: Drop and recreate all RLS policies that used is_admin_mfa()
-- so they now allow any active admin (no aal2 check) to write.

-- product_categories
drop policy if exists "MFA admins manage categories" on public.product_categories;
create policy "Admins manage categories" on public.product_categories
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- products
drop policy if exists "MFA admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- product_images
drop policy if exists "MFA admins manage product media" on public.product_images;
create policy "Admins manage product media" on public.product_images
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- product_aliases
drop policy if exists "MFA admins manage product aliases" on public.product_aliases;
create policy "Admins manage product aliases" on public.product_aliases
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- site_settings
drop policy if exists "MFA admins update site settings" on public.site_settings;
create policy "Admins update site settings" on public.site_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- contact_messages
drop policy if exists "MFA admins manage contact messages" on public.contact_messages;
create policy "Admins manage contact messages" on public.contact_messages
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- newsletter_subscribers
drop policy if exists "MFA admins manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins manage newsletter subscribers" on public.newsletter_subscribers
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- audit_log
drop policy if exists "MFA admins read audit log" on public.audit_log;
create policy "Admins read audit log" on public.audit_log
  for select to authenticated
  using ((select public.is_admin()));

-- storage.objects (product-media bucket)
drop policy if exists "MFA admins manage product media objects" on storage.objects;
create policy "Admins manage product media objects" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-media' and (select public.is_admin()))
  with check (bucket_id = 'product-media' and (select public.is_admin()));
