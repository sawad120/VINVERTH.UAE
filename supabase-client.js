(() => {
  const config = window.VinverthSupabaseConfig;
  if (!config?.url || !config?.publishableKey || !window.supabase?.createClient) return;

  const client = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.VinverthSupabase = { client, config };
})();
