// assets/auth.js
import { getClient } from './sb-client.js';

let dlg;

/* Open auth modal */
export async function openAuthModal() {
  ensureDialog();
  dlg.showModal();
}

/* Close auth modal */
function closeAuthModal() {
  dlg?.close();
}

/* Ensure dialog exists (injected once) */
function ensureDialog() {
  if (dlg) return;
  dlg = document.createElement('dialog');
  dlg.id = 'authDlg';
  dlg.innerHTML = `
    <form method="dialog" style="min-width:320px;padding:16px;display:grid;gap:10px">
      <h3 style="margin:0 0 8px">Sign in</h3>
      <label>Email
        <input id="authEmail" type="email" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
      </label>
      <label>Password
        <input id="authPass" type="password" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px">
      </label>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
        <button value="cancel" type="button" id="btnCancel">Cancel</button>
        <button id="btnLogin" type="button">Login</button>
      </div>
      <p id="authMsg" style="color:#c00;margin:8px 0 0;display:none"></p>
    </form>
  `;
  document.body.appendChild(dlg);

  dlg.querySelector('#btnCancel').addEventListener('click', () => closeAuthModal());
  dlg.querySelector('#btnLogin').addEventListener('click', onLogin);
}

async function onLogin() {
  const msg = dlg.querySelector('#authMsg');
  msg.style.display = 'none';
  try {
    const email = dlg.querySelector('#authEmail').value.trim();
    const password = dlg.querySelector('#authPass').value;
    const sb = await getClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    closeAuthModal();
    // opzionale: ricorda modalità editor
    localStorage.setItem('mode', 'editor');
    // ricarica per attivare guard e visibilità editor
    location.reload();
  } catch (e) {
    msg.textContent = e.message || 'Login failed';
    msg.style.display = 'block';
  }
}

/* Global shortcuts */
document.addEventListener('keydown', async (e) => {
  const key = (e.key || '').toLowerCase();
  if (e.ctrlKey && e.shiftKey && key === 'e') {
    e.preventDefault();
    await openAuthModal();
  }
  if (e.ctrlKey && e.shiftKey && key === 'l') {
    e.preventDefault();
    try {
      const sb = await getClient();
      await sb.auth.signOut();
      localStorage.removeItem('mode');
      location.reload();
    } catch {}
  }
});
