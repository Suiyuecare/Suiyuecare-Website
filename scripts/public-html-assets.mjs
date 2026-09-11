const localAsset = (value) => value.replace(/^(?:\.\/)?assets\//, "/assets/");
const resourceAttributes = new Set(["src", "href", "poster", "action", "data-src", "data-fallback-src", "data-image", "data-image-url", "data-background-image", "data-poster"]);
const markupTokens = /<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<\/?[A-Za-z][^\s/>]*(?:[^>"']|"[^"]*"|'[^']*')*>/gi;

// Keep existing source formatting and inline programs intact. Only resource attributes of
// actual HTML tags are rewritten; serialized CMS data and JavaScript strings are not HTML.
export function normalizePublicHtmlAssets(html) {
  return html.replace(markupTokens, (tag) => {
    if (/^<!--/.test(tag)) return tag;
    const rawText = /^<(?:script|style)\b/i.test(tag);
    const openingLength = rawText ? tag.match(/^<[A-Za-z][^\s/>]*(?:[^>"']|"[^"]*"|'[^']*')*>/)[0].length : tag.length;
    const opening = tag.slice(0, openingLength);
    const normalizedOpening = opening.replace(/(\s([^\s"'<>/=]+)\s*=\s*)(["'])(.*?)\3/gs, (match, prefix, name, quote, value) => {
      const attribute = name.toLowerCase();
      let normalized = value;
      if (resourceAttributes.has(attribute)) normalized = localAsset(value);
      else if (["srcset", "imagesrcset", "data-srcset"].includes(attribute)) {
        normalized = value.replace(/(^|,\s*)((?:\.\/)?assets\/[^\s,]+)/g, (_match, separator, source) => separator + localAsset(source));
      } else if (attribute === "style") {
        normalized = value.replace(/(\burl\(\s*(?:['"]|&quot;|&#39;)?)(?:\.\/)?assets\//gi, "$1/assets/");
      }
      return `${prefix}${quote}${normalized}${quote}`;
    });
    return normalizedOpening + tag.slice(openingLength);
  });
}
