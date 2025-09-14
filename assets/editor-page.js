import { fetchDocument, upsertDraft, publish } from './content-api.js';

function slugFromPath(){
  // Expect /editor/<slug> (rewritten to /editor/<slug>.html if needed)
  const parts = location.pathname.split('/').filter(Boolean);
  const i = parts.indexOf('editor');
  if (i >= 0 && parts[i+1]) return parts[i+1].replace(/\.html$/, '');
  // fallback for direct file access (editor/<slug>.html)
  const last = parts[parts.length-1] || '';
  return last.replace(/\.html$/, '') || 'new_project';
}

async function init(){
  const slug = slugFromPath();
  const els = {
    title: document.querySelector('#title'),
    body: document.querySelector('#body'),
    status: document.querySelector('#status'),
    save: document.querySelector('#btn-save'),
    pub: document.querySelector('#btn-publish')
  };

  // Load latest (draft or published) if not new_project
  if (slug !== 'new_project') {
    try{
      const doc = await fetchDocument(slug, { publishedOnly: false });
      if (doc?.title) els.title.value = doc.title;
      if (doc?.body) els.body.value = doc.body;
      if (doc) els.status.textContent = doc.published ? 'published' : 'draft';
    }catch(e){
      console.warn('No existing doc for', slug, e.message);
    }
  } else {
    els.status.textContent = 'draft (new)';
  }

  // Wire actions
  els.save?.addEventListener('click', async () => {
    const slug = slugFromPath();
    const saved = await upsertDraft(slug, {
      title: els.title.value.trim(),
      body: els.body.value,
      author: window.EDITOR_AUTHOR || null
    });
    els.status.textContent = saved.published ? 'published' : 'draft';
    toast('Draft saved.');
  });

  els.pub?.addEventListener('click', async () => {
    const slug = slugFromPath();
    const published = await publish(slug, {
      title: els.title.value.trim(),
      body: els.body.value,
      author: window.EDITOR_AUTHOR || null
    });
    els.status.textContent = published.published ? 'published' : 'draft';
    toast('Published! Opening viewer...');
    setTimeout(() => location.href = `/viewer/${slug}`, 500);
  });
}

function toast(msg){
  try{
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);padding:10px 14px;background:#111;color:#fff;border-radius:8px;z-index:9999';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1600);
  }catch{ alert(msg); }
}

document.addEventListener('DOMContentLoaded', init);
