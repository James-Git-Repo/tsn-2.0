import { getClient } from './sb-client.js';
const TABLE = 'documents';
const AUDIT = 'audit_log';
function nowIso(){ return new Date().toISOString(); }

export async function fetchDocument(slug, { publishedOnly = true } = {}) {
  const sb = await getClient();
  let q = sb.from(TABLE).select('*').eq('slug', slug).order('updated_at', { ascending: false }).limit(1).single();
  if (publishedOnly) q = q.eq('published', true);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function upsertDraft(slug, { title, body, author }) {
  const sb = await getClient();
  const payload = {
    slug, title: title ?? null, body: body ?? null,
    published: false, updated_at: nowIso(), author: author ?? null
  };
  const { data, error } = await sb.from(TABLE).upsert(payload, { onConflict: 'slug' }).select('*').single();
  if (error) throw error;
  await logAudit('save_draft', slug, author);
  return data;
}

export async function publish(slug, { title, body, author }) {
  const sb = await getClient();
  // Ensure draft exists / update content if provided
  const { error: upErr } = await sb.from(TABLE).upsert({
    slug, title: title ?? null, body: body ?? null,
    updated_at: nowIso()
  }, { onConflict: 'slug' });
  if (upErr) throw upErr;
  const { data, error } = await sb.from(TABLE).update({ published: true, updated_at: nowIso() })
    .eq('slug', slug).select('*').single();
  if (error) throw error;
  await logAudit('publish', slug, author);
  return data;
}

export async function logAudit(action, slug, author){
  try{
    const sb = await getClient();
    await sb.from(AUDIT).insert({
      ts: nowIso(), action, slug, author: author ?? null
    });
  }catch(e){ console.warn('[audit]', e.message); }
}
