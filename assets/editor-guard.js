// assets/editor-guard.js (NUOVA VERSIONE)
import { getClient } from './sb-client.js';

(async () => {
  try {
    const sb = await getClient();
    const { data } = await sb.auth.getUser();
    const user = data?.user || null;
    if (!user) {
      alert('Devi autenticarti per accedere all’Editor.');
      const url = new URL('/viewer', location.origin);
      url.searchParams.set('reason', 'forbidden');
      location.replace(url.toString());
    }
  } catch (e) {
    console.warn('[editor-guard]', e.message);
    const url = new URL('/viewer', location.origin);
    url.searchParams.set('reason', 'error');
    location.replace(url.toString());
  }
})();
