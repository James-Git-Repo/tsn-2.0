// Fix card links to route to /viewer/* or /editor/* without breaking clicks
(function(){
  const sp = new URLSearchParams(location.search);
  let mode = (localStorage.getItem('mode') || sp.get('mode') || 'viewer').toLowerCase();
  mode = mode === 'editor' ? 'editor' : 'viewer';
  const base = `/${mode}`;

  // attach hrefs on any element with data-slug (prefer <a>)
  document.querySelectorAll('[data-slug]').forEach(el => {
    const slug = el.getAttribute('data-slug');
    if (!slug) return;
    const href = `${base}/${slug}`;
    if (el.tagName === 'A') {
      el.setAttribute('href', href);
      el.removeAttribute('onclick'); // avoid preventDefault traps
    } else {
      el.addEventListener('click', () => location.href = href);
    }
  });

  // Editor-only cards (e.g., New Project)
  document.querySelectorAll('[data-editor-only]').forEach(el => {
    el.style.display = (mode === 'editor') ? '' : 'none';
  });

  // Optional small UI affordance to switch mode (if you add buttons with data-mode-switch)
  document.querySelectorAll('[data-mode-switch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const m = btn.getAttribute('data-mode-switch');
      localStorage.setItem('mode', m);
      const url = new URL(location.href);
      url.searchParams.set('mode', m);
      location.href = url.toString();
    });
  });
})();
