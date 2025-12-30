// Default to your admin production domain when VITE_API_URL isn't set
// API base: prefer VITE_API_URL; during development use relative path '' so dev proxy works.
export const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://admin.parnanzonehomes.com');
export const SITE_BASE = API || (typeof window !== 'undefined' ? window.location.origin : '');

export function resolveImage(img) {
  if (!img) return '';
  if (/^https?:\/\//i.test(img)) return img;
  if (img.startsWith('/')) return `${SITE_BASE}${img}`;
  return `${SITE_BASE}/${img}`;
}

export function ensureProtocol(url) {
  if (!url) return url;
  try {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
      return url.replace(/^http:\/\//i, 'https://');
    }
  } catch (e) {}
  return url;
}

export function placeholderDataUrl(w = 1600, h = 900, text = 'Property Image') {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect fill='%23f3f4f6' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='36' fill='%239ca3af'>${text}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
