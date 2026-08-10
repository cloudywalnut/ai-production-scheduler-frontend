import { supabase } from './supabase';

// POSTs JSON to our own API routes with the current Supabase session
// attached as a Bearer token, so the route handler can identify the caller.
export async function authFetch(url: string, body: unknown) {
  const { data: { session } } = await supabase.auth.getSession();

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
    body: JSON.stringify(body),
  });
}
