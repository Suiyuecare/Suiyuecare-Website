import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const baseline = await readFile(new URL('../supabase/migrations/20260518000100_create_cms_schema.sql', import.meta.url), 'utf8');
const pagesSchema = baseline.match(/create table if not exists public\.pages \([\s\S]*?\n\);/i)?.[0];
assert.ok(pagesSchema, 'Use the original page schema for the seed regression.');
const seed = await readFile(new URL('../supabase/migrations/20260518000500_seed_default_cms_pages.sql', import.meta.url), 'utf8');
const db = new PGlite();
try {
  await db.exec("create type public.cms_publish_status as enum ('draft', 'scheduled', 'published', 'archived'); create table public.profiles(id uuid primary key);");
  await db.exec(pagesSchema);
  await db.exec(seed);
  const pages = await db.query('select slug, seo_title, seo_description, published_at, content_json from public.pages order by sort_order');
  assert.deepEqual(pages.rows.map(page => page.slug), ['home', 'about', 'milestones', 'home-care', 'day-care', 'community', 'nursing', 'migrant-training', 'quality', 'talent', 'health', 'courses', 'investors', 'ir-finance', 'ir-governance', 'ir-shareholders', 'contact']);
  const community = pages.rows.find(page => page.slug === 'community');
  assert.equal(community.seo_title, '社區據點｜歲悅長照集團');
  assert.equal(community.seo_description, '社區健康促進、共餐、活動與照顧支持據點。');
  assert.deepEqual(community.content_json, {});
  await db.exec(seed);
  assert.equal((await db.query('select count(*)::int count from public.pages')).rows[0].count, 17);
  assert.deepEqual((await db.query('select published_at from public.pages order by sort_order')).rows.map(page => page.published_at), pages.rows.map(page => page.published_at));
  console.log('ok - CMS seed executes against original schema, preserves 17 pages and remains idempotent');
} finally {
  await db.close();
}
