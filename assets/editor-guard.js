// Very light editor route guard.
// Replace this with Supabase Auth check if desired.
(function(){
  const allowed = localStorage.getItem('EDITOR_ALLOWED') === '1';
  if (!allowed) {
    const url = new URL('/viewer', location.origin);
    url.searchParams.set('reason', 'forbidden');
    alert('Editor is restricted. Redirecting to viewer.');
    location.replace(url.toString());
  }
})();
