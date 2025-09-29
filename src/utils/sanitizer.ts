import sanitizeHtml from 'sanitize-html';

export function sanitize(html?: string) {
  if (!html) return null;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'iframe',
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen'],
    },
    allowedSchemesByTag: {
      iframe: ['https', 'http'],
    },
  });
}
