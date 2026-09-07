import assert from "node:assert/strict";
import { outlineArticleBody, renderArticleOutline } from "../article-reading-outline.mjs";

const sample = '<section id="reading-section-1"><h2>先看重點</h2><p>原有正文</p><h2 id="original">FAQ &amp; References</h2><h2 id="original">重複標題</h2><h2><strong>完整清單</strong></h2></section>';
const { content, headings } = outlineArticleBody(sample);
assert.equal(headings.length, 4);
assert.equal(new Set(headings.map((heading) => heading.id)).size, 4);
assert.equal(headings[0].id, 'reading-section-2');
assert.equal(headings[1].id, 'original');
assert.equal(headings[3].label, '完整清單');
assert.ok(content.includes('<p>原有正文</p>'));
assert.ok(content.includes('tabindex="-1"'));
assert.ok(renderArticleOutline(headings).includes('FAQ &amp; References'));
assert.ok(renderArticleOutline(headings).includes('data-article-anchor'));
assert.equal(renderArticleOutline([]), '');
assert.equal(renderArticleOutline([{ id: 'one', label: '唯一段落' }]), '');
assert.equal(outlineArticleBody('<h2></h2><p>不刪除正文</p>').content, '<h2></h2><p>不刪除正文</p>');
console.log('ok - deterministic accessible article outline preserves content and existing anchors');
