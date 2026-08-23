import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set((Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:3000,http://127.0.0.1:3000").split(",").map((item) => item.trim()));
const headers = (origin: string | null) => ({ "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "null", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json", "Vary": "Origin" });

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: headers(origin) });
  if (!origin || !allowedOrigins.has(origin) || request.method !== "POST") return new Response(JSON.stringify({ error: "Not allowed" }), { status: 403, headers: headers(origin) });
  try {
    const { full_name, email, inquiry, captcha_token, website } = await request.json();
    if (website || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "")) || String(full_name || "").trim().length > 120 || String(inquiry || "").trim().length < 1 || String(inquiry).length > 5000) throw new Error("Please provide valid contact details.");
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!turnstileSecret) throw new Error("Contact capture is not configured yet.");
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret: turnstileSecret, response: captcha_token, remoteip: request.headers.get("x-forwarded-for")?.split(",")[0] }) }).then((response) => response.json());
    if (!verification.success) throw new Error("Security verification failed.");
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await service.from("contact_messages").insert({ full_name: String(full_name).trim(), email: String(email).trim().toLowerCase(), message: String(inquiry).trim() });
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { headers: headers(origin) });
  } catch (error) { return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed" }), { status: 400, headers: headers(origin) }); }
});
