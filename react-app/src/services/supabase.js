import { createClient } from "@supabase/supabase-js";

export const SUPABASE_CONFIG = {
  url: "https://kbzmmiipwerrybyjuaxv.supabase.co",
  publishableKey: "sb_publishable_GzLs9VdAK8oziEutyGyvAA__OcS1KFS",
  contactCaptureEnabled: false
};

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
