-- Keep database-required metadata out of the admin product form.
insert into public.product_categories (name, slug, is_active)
values ('Admin additions', 'admin-additions', true)
on conflict (slug) do update set is_active = true;

create or replace function public.set_admin_product_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category_id is null then
    select id into new.category_id
    from public.product_categories
    where slug = 'admin-additions'
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists products_set_admin_defaults on public.products;
create trigger products_set_admin_defaults
before insert on public.products
for each row execute function public.set_admin_product_defaults();
