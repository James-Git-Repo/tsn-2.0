// Minimal Supabase client bootstrapping for static hosting
// Usage: set window.SUPABASE_URL and window.SUPABASE_ANON_KEY before importing,
// or set data-supabase-url / data-supabase-anon on <html>.
let _sbPromise;
export async function getClient() {
  if (window.supabase) return window.supabase;
  if (_sbPromise) return _sbPromise;
  _sbPromise = (async () => {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const html = document.documentElement;
    const url = window.SUPABASE_URL || html.getAttribute('data-supabase-url');
    const key = window.SUPABASE_ANON_KEY || html.getAttribute('data-supabase-anon');
    if (!url || !key) {
      throw new Error('[sb-client] Missing Supabase config. Define window.SUPABASE_URL & window.SUPABASE_ANON_KEY or html[data-supabase-*].');
    }
    window.supabase = createClient(url, key);
    return window.supabase;
  })();
  return _sbPromise;
}
