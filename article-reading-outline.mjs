function plainText(html = "") {
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Build the outline from rendered headings so rich CMS and static articles agree.
export function outlineArticleBody(html = "") {
  const headings = [];
  const occupied = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
  let sequence = 0;
  const content = html.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (_match, attributes, title) => {
    const label = plainText(title);
    if (!label) return _match;
    const existing = attributes.match(/\bid=(["'])([a-zA-Z][\w:.-]*)\1/i)?.[2];
    let id = existing;
    if (!id || headings.some((heading) => heading.id === id)) {
      do { id = `reading-section-${++sequence}`; } while (occupied.has(id));
    }
    occupied.add(id);
    headings.push({ id, label });
    const clean = attributes.replace(/\s+(?:id|tabindex)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    return `<h2${clean} id="${id}" tabindex="-1">${title}</h2>`;
  });
  return { content, headings };
}

export function renderArticleOutline(headings = []) {
  if (headings.length < 2) return "";
  // Labels come from already escaped/sanitized rendered headings. Keep entities intact.
  return `<details class="article-toc"><summary>本文目錄 <span>${headings.length} 個章節</span></summary><nav aria-label="本文章節"><ol>${headings.map(({ id, label }) => `<li><a href="#${id}" data-article-anchor>${label}</a></li>`).join("")}</ol></nav></details>`;
}
