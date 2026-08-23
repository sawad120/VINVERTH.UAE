import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authorization = request.headers.get("authorization");
  if (!authorization) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
  const { data: allowed, error: authError } = await userClient.rpc("is_admin_mfa");
  if (authError || !allowed) return json({ error: "MFA administrator access required" }, 403);

  let productId: string;
  try {
    ({ productId } = await request.json());
  } catch {
    return json({ error: "Invalid JSON request" }, 400);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId || "")) return json({ error: "Invalid product id" }, 400);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return json({ error: "Server deletion configuration is missing" }, 500);
  const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
  const { data: images, error: imageError } = await adminClient.from("product_images").select("storage_path").eq("product_id", productId);
  if (imageError) return json({ error: imageError.message }, 500);
  const paths = (images || []).map((image) => image.storage_path).filter((path): path is string => Boolean(path) && !/^https?:\/\//i.test(path));
  if (paths.length) {
    const { error: storageError } = await adminClient.storage.from("product-media").remove(paths);
    if (storageError) return json({ error: storageError.message }, 500);
  }
  const { data: deleted, error: deleteError } = await adminClient.from("products").delete().eq("id", productId).select("id").maybeSingle();
  if (deleteError) return json({ error: deleteError.message }, 500);
  if (!deleted) return json({ error: "Product not found" }, 404);
  return json({ ok: true });
});
