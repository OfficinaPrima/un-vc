import type { Request } from "express";

// Public Supabase project values (publishable key is safe server-side too).
const SUPABASE_URL = "https://mnawrtomfagillerceer.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cIVTwBgRBGwGY264wJxNaw_m_JXHsdE";

export type AuthUser = { id: string; email: string | null };

/**
 * Verify the Supabase access token on the request's Authorization header by
 * asking Supabase who it belongs to. Returns the user, or null if there is no
 * valid token. This is how the backend securely knows which account is acting.
 */
export async function getUser(req: Request): Promise<AuthUser | null> {
  const header = req.headers["authorization"];
  if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length);

  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
    });
    if (!r.ok) return null;
    const u = (await r.json()) as { id?: string; email?: string | null };
    if (!u?.id) return null;
    return { id: u.id, email: u.email ?? null };
  } catch {
    return null;
  }
}
