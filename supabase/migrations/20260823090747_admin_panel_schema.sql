-- VINVERTH admin panel: data model, RLS, private product media, and audit trail.
-- Apply only through the Supabase CLI or SQL editor; never expose a service-role key to the browser.

create extension if not exists pgcrypto with schema extensions;

create type public.product_status as enum ('draft', 'published', 'archived');
create type public.message_status as enum ('new', 'in_progress', 'resolved', 'archived');
create type public.subscriber_status as enum ('subscribed', 'unsubscribed');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table public.product_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  sku text not null unique check (char_length(trim(sku)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 160),
  category_id uuid not null references public.product_categories(id) on delete restrict,
  gender text not null default 'Unisex' check (gender in ('Men', 'Women', 'Unisex')),
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= price),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  status public.product_status not null default 'draft',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  badge text not null default '' check (char_length(badge) <= 60),
  description text not null default '' check (char_length(description) <= 5000),
  uv text not null default '' check (char_length(uv) <= 160),
  material text not null default '' check (char_length(material) <= 160),
  size text not null default '' check (char_length(size) <= 160),
  seo_title text not null default '' check (char_length(seo_title) <= 160),
  seo_description text not null default '' check (char_length(seo_description) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index products_public_listing_idx on public.products (status, is_featured desc, sort_order, created_at desc);
create index products_category_listing_idx on public.products (category_id, status, sort_order);

create table public.product_images (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text,
  external_url text,
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  check (num_nonnulls(storage_path, external_url) = 1)
);

create unique index product_images_single_primary_idx on public.product_images (product_id) where is_primary;
create index product_images_product_idx on public.product_images (product_id, is_primary desc, sort_order, created_at);

create table public.product_aliases (
  alias text primary key check (char_length(trim(alias)) between 2 and 160),
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index product_aliases_product_idx on public.product_aliases (product_id);

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default 'VINVERTH Eyewear',
  support_email text not null default 'support@vinverth.com',
  whatsapp_number text not null default '971565741398' check (whatsapp_number ~ '^[0-9]{8,15}$'),
  instagram_url text not null default '',
  logo_url text not null default '',
  announcement_text text not null default '' check (char_length(announcement_text) <= 240),
  default_currency char(3) not null default 'USD' check (default_currency ~ '^[A-Z]{3}$'),
  default_seo_title text not null default '' check (char_length(default_seo_title) <= 160),
  default_seo_description text not null default '' check (char_length(default_seo_description) <= 320),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.contact_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  email text not null check (email = lower(trim(email)) and char_length(email) <= 254),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  status public.message_status not null default 'new',
  admin_notes text not null default '' check (char_length(admin_notes) <= 5000),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  handled_by uuid references auth.users(id) on delete set null
);
create index contact_messages_queue_idx on public.contact_messages (status, submitted_at desc);

create table public.newsletter_subscribers (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null unique check (email = lower(trim(email)) and char_length(email) <= 254),
  status public.subscriber_status not null default 'subscribed',
  subscribed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.audit_log (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and is_active = true
  );
$$;

create or replace function public.is_admin_mfa()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
    and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;

create or replace function public.set_row_metadata()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    if new.created_by is null then new.created_by := auth.uid(); end if;
  end if;
  if new.updated_by is null then new.updated_by := auth.uid(); end if;
  return new;
end;
$$;

create or replace function public.set_message_metadata()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status in ('resolved', 'archived') and new.handled_by is null then
    new.handled_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.log_audit_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_data jsonb;
begin
  if tg_table_name in ('contact_messages', 'newsletter_subscribers') then
    record_data := jsonb_build_object('status', case when tg_op = 'DELETE' then old.status else new.status end);
  elsif tg_op = 'DELETE' then
    record_data := to_jsonb(old) - array['created_at', 'updated_at', 'created_by', 'updated_by'];
  else
    record_data := to_jsonb(new) - array['created_at', 'updated_at', 'created_by', 'updated_by'];
  end if;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    case when tg_op = 'DELETE' then old.id::text else new.id::text end,
    record_data
  );
  return coalesce(new, old);
end;
$$;

create trigger product_categories_set_metadata before insert or update on public.product_categories
for each row execute function public.set_row_metadata();
create trigger products_set_metadata before insert or update on public.products
for each row execute function public.set_row_metadata();
create trigger product_images_set_metadata before insert or update on public.product_images
for each row execute function public.set_row_metadata();
create trigger site_settings_set_metadata before update on public.site_settings
for each row execute function public.set_row_metadata();
create trigger contact_messages_set_metadata before update on public.contact_messages
for each row execute function public.set_message_metadata();
create trigger newsletter_subscribers_set_metadata before update on public.newsletter_subscribers
for each row execute function public.set_row_metadata();

create trigger product_categories_audit after insert or update or delete on public.product_categories
for each row execute function public.log_audit_change();
create trigger products_audit after insert or update or delete on public.products
for each row execute function public.log_audit_change();
create trigger product_images_audit after insert or update or delete on public.product_images
for each row execute function public.log_audit_change();
create trigger site_settings_audit after update on public.site_settings
for each row execute function public.log_audit_change();
create trigger contact_messages_audit after update or delete on public.contact_messages
for each row execute function public.log_audit_change();
create trigger newsletter_subscribers_audit after update or delete on public.newsletter_subscribers
for each row execute function public.log_audit_change();

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.admin_users enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_aliases enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.audit_log enable row level security;

revoke all on table public.admin_users, public.product_categories, public.products, public.product_images,
  public.product_aliases, public.site_settings, public.contact_messages, public.newsletter_subscribers,
  public.audit_log from anon, authenticated;

grant select on table public.product_categories, public.products, public.product_images,
  public.product_aliases, public.site_settings to anon, authenticated;
grant select, insert, update, delete on table public.product_categories, public.products, public.product_images,
  public.product_aliases, public.contact_messages, public.newsletter_subscribers to authenticated;
grant update on table public.site_settings to authenticated;
grant select on table public.audit_log to authenticated;

revoke all on function public.is_admin(), public.is_admin_mfa() from public;
grant execute on function public.is_admin(), public.is_admin_mfa() to authenticated;

create policy "Public reads active categories" on public.product_categories for select to anon, authenticated using (is_active = true);
create policy "MFA admins manage categories" on public.product_categories for all to authenticated using ((select public.is_admin_mfa())) with check ((select public.is_admin_mfa()));

create policy "Public reads published products" on public.products for select to anon, authenticated using (status = 'published');
create policy "MFA admins manage products" on public.products for all to authenticated using ((select public.is_admin_mfa())) with check ((select public.is_admin_mfa()));

create policy "Public reads published product media" on public.product_images for select to anon, authenticated using (
  exists (select 1 from public.products where products.id = product_images.product_id and products.status = 'published')
);
create policy "MFA admins manage product media" on public.product_images for all to authenticated using ((select public.is_admin_mfa())) with check ((select public.is_admin_mfa()));

create policy "Public reads aliases for published products" on public.product_aliases for select to anon, authenticated using (
  exists (select 1 from public.products where products.id = product_aliases.product_id and products.status = 'published')
);
create policy "MFA admins manage product aliases" on public.product_aliases for all to authenticated using ((select public.is_admin_mfa())) with check ((select public.is_admin_mfa()));

create policy "Public reads site settings" on public.site_settings for select to anon, authenticated using (id = 1);
create policy "MFA admins update site settings" on public.site_settings for update to authenticated using ((select public.is_admin_mfa())) with check ((select public.is_admin_mfa()));

create policy "MFA admins manage contact messages" on public.contact_messages for all to authenticated using ((select public.is_admin_mfa())) with check ((select public.is_admin_mfa()));
create policy "MFA admins manage newsletter subscribers" on public.newsletter_subscribers for all to authenticated using ((select public.is_admin_mfa())) with check ((select public.is_admin_mfa()));
create policy "MFA admins read audit log" on public.audit_log for select to authenticated using ((select public.is_admin_mfa()));

create view public.public_catalog_products with (security_invoker = true) as
select
  p.id,
  p.sku,
  p.slug,
  p.name,
  c.name as category,
  c.slug as category_slug,
  p.gender,
  p.price,
  p.compare_at_price,
  p.currency,
  p.badge,
  p.description,
  p.uv,
  p.material,
  p.size,
  p.is_featured,
  p.sort_order,
  case
    when p.stock_quantity <= 0 then 'Out of stock'
    when p.stock_quantity <= p.low_stock_threshold then 'Low stock'
    else 'In stock'
  end as stock,
  image.storage_path as primary_image_path,
  image.external_url as primary_image_url,
  image.alt_text as primary_image_alt
from public.products p
join public.product_categories c on c.id = p.category_id
left join lateral (
  select pi.storage_path, pi.external_url, pi.alt_text
  from public.product_images pi
  where pi.product_id = p.id
  order by pi.is_primary desc, pi.sort_order, pi.created_at
  limit 1
) image on true
where p.status = 'published' and c.is_active = true;

grant select on public.public_catalog_products to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Published product media is readable" on storage.objects for select to anon, authenticated using (
  bucket_id = 'product-media'
  and exists (
    select 1
    from public.product_images pi
    join public.products p on p.id = pi.product_id
    where pi.storage_path = name and p.status = 'published'
  )
);
create policy "MFA admins manage product media objects" on storage.objects for all to authenticated using (
  bucket_id = 'product-media' and (select public.is_admin_mfa())
) with check (
  bucket_id = 'product-media' and (select public.is_admin_mfa())
);
