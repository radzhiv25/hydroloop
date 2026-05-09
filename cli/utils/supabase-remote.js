/**
 * Supabase REST + Auth for CLI (offline-first companion to local Conf store).
 * Expects HYDROLOOP_* or NEXT_PUBLIC_* env vars; anon key only (never service role).
 */
import { createClient } from "@supabase/supabase-js";

const TOK_ACCESS = "sb_access_token";
const TOK_REFRESH = "sb_refresh_token";

export function getSupabaseCredentials() {
  const url =
    process.env.HYDROLOOP_SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";
  const anonKey =
    process.env.HYDROLOOP_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";
  return { url, anonKey };
}

export function isRemoteConfigured(creds = getSupabaseCredentials()) {
  return Boolean(creds.url && creds.anonKey);
}

/**
 * Creates a client and restores session from store tokens. Refreshes if near expiry.
 * @returns {Promise<{ ok: true, supabase: import('@supabase/supabase-js').SupabaseClient, userId: string } | { ok: false, reason: string }>}
 */
export async function getAuthedRemoteClient(store) {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return { ok: false, reason: "missing_env" };
  }

  const accessToken = store.get(TOK_ACCESS);
  const refreshToken = store.get(TOK_REFRESH);
  if (!accessToken || !refreshToken) {
    return { ok: false, reason: "not_logged_in" };
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    return { ok: false, reason: "session_invalid", detail: sessionError.message };
  }

  const {
    data: { session },
    error: getErr,
  } = await supabase.auth.getSession();

  if (getErr || !session?.user) {
    return { ok: false, reason: "no_user", detail: getErr?.message };
  }

  const expMs = session.expires_at ? session.expires_at * 1000 : 0;
  const shouldRefresh = expMs > 0 && expMs - Date.now() < 120_000;

  let activeSession = session;

  if (shouldRefresh) {
    const { data: ref, error: refErr } = await supabase.auth.refreshSession();
    if (!refErr && ref.session) {
      activeSession = ref.session;
      store.set(TOK_ACCESS, ref.session.access_token);
      store.set(TOK_REFRESH, ref.session.refresh_token);
    }
  }

  const userId = activeSession.user.id;

  store.set(TOK_ACCESS, activeSession.access_token);
  store.set(TOK_REFRESH, activeSession.refresh_token);

  return { ok: true, supabase, userId };
}

export function persistTokensFromSession(store, session) {
  if (!session?.access_token || !session?.refresh_token) return;
  store.set(TOK_ACCESS, session.access_token);
  store.set(TOK_REFRESH, session.refresh_token);
}

export function clearRemoteSession(store) {
  store.delete(TOK_ACCESS);
  store.delete(TOK_REFRESH);
}

export function hasStoredSession(store) {
  return Boolean(store.get(TOK_ACCESS) && store.get(TOK_REFRESH));
}
