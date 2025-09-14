import { getClient } from './sb-client.js';

async function init(){
  const body = document.body;
  const slug = body.getAttribute('data-doc-slug') || document.querySelector('meta[name="doc:slug"]')?.content;
  if (!slug) return; // nothing to do

  const sb = await getClient();
  const { data, error } = await sb.from('documents').select('*').eq('slug', slug).eq('published', true).order('updated_at',{ascending:false}).limit(1).single();
  if (error || !data) return;

  const titleEl = document.querySelector('[data-doc-title]');
  const bodyEl  = document.querySelector('[data-doc-body]');
  if (titleEl && data.title) titleEl.textContent = data.title;
  if (bodyEl && data.body) {
    // Allow HTML body from DB; sanitize if needed
    bodyEl.innerHTML = data.body;
  }
}
document.addEventListener('DOMContentLoaded', init);
