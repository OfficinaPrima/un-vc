import { createClient } from "@supabase/supabase-js";

// Supabase project connection for the browser.
// The publishable key is safe to ship in client code (protected by RLS).
const SUPABASE_URL = "https://mnawrtomfagillerceer.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cIVTwBgRBGwGY264wJxNaw_m_JXHsdE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
