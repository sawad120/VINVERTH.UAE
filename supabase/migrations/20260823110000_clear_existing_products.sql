-- One-time catalogue reset requested for the VINVERTH product table.
-- Product images and aliases cascade from products; Storage objects are not removed by this SQL.
delete from public.products;
