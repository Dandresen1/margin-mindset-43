export const SUPPORTED_PROVIDERS = [
  'amazon',
  'etsy',
  'aliexpress',
  'alibaba',
  'walmart',
  'shopify',
  'generic',
] as const;

export type Provider = (typeof SUPPORTED_PROVIDERS)[number];

export function isSupported(provider: Provider): boolean {
  return SUPPORTED_PROVIDERS.includes(provider);
}

export interface DetectResult {
  provider: Provider;
  canonicalUrl: string;
  id?: string | null;
  domain: string;
}

const TRACKING_PARAM_RE = /^(utm_|fbclid|gclid|msclkid|aff|ref)/i;

const PATTERNS: Record<string, RegExp[]> = {
  amazon: [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  ],
  etsy: [
    /\/listing\/(\d+)(?:[/?]|$)/i,
  ],
  aliexpress: [
    /\/item\/(\d+)\.html/i,
    /\/i\/(\d+)\.html/i,
  ],
  alibaba: [
    /\/product-detail\/.*?(\d+)\.html/i,
  ],
  walmart: [
    /\/ip\/(?:[^/]+\/)?(\d+)(?:[/?]|$)/i,
    /\/(?:\w+\/){1,3}(\d{7,})(?:[/?]|$)/i,
  ],
  shopify: [
    /\/products\/([a-z0-9-]+)/i,
  ],
};

function stripTracking(url: URL) {
  const params = url.searchParams;
  for (const key of Array.from(params.keys())) {
    if (TRACKING_PARAM_RE.test(key)) params.delete(key);
  }
}

function getDomain(host: string): string {
  const parts = host.split('.').filter(Boolean);
  if (parts.length <= 2) return host;
  const last = parts[parts.length - 1];
  const second = parts[parts.length - 2];
  const candidate = `${second}.${last}`;
  const secondLevel = new Set(['co.uk', 'com.au']);
  if (secondLevel.has(candidate) && parts.length >= 3) {
    return `${parts[parts.length - 3]}.${candidate}`;
  }
  return candidate;
}

export function detectProvider(raw: string): DetectResult {
  let input = raw.trim();
  if (!/^https?:\/\//i.test(input)) {
    input = `https://${input}`;
  }
  const url = new URL(input);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Unsupported protocol');
  }

  url.hostname = url.hostname.toLowerCase();
  stripTracking(url);
  const hostname = url.hostname.replace(/^www\./, '');
  const domain = getDomain(hostname);

  let provider: Provider = 'generic';
  if (/^(.+\.)?amazon\./.test(hostname)) provider = 'amazon';
  else if (domain === 'etsy.com') provider = 'etsy';
  else if (/^(.+\.)?aliexpress\./.test(hostname)) provider = 'aliexpress';
  else if (domain === 'alibaba.com') provider = 'alibaba';
  else if (domain === 'walmart.com') provider = 'walmart';
  else if (hostname.endsWith('.myshopify.com')) provider = 'shopify';

  const patterns = PATTERNS[provider] || [];
  let id: string | null = null;
  for (const p of patterns) {
    const m = url.pathname.match(p);
    if (m) {
      id = m[1];
      break;
    }
  }

  let canonicalUrl: string;
  switch (provider) {
    case 'amazon':
      canonicalUrl = id
        ? `https://www.${domain}/dp/${id}`
        : `https://www.${domain}${url.pathname}`;
      break;
    case 'etsy':
      canonicalUrl = id
        ? `https://www.etsy.com/listing/${id}`
        : `https://www.${domain}${url.pathname}`;
      break;
    case 'aliexpress':
      canonicalUrl = id
        ? `https://www.aliexpress.com/item/${id}.html`
        : `https://www.${domain}${url.pathname}`;
      break;
    case 'alibaba':
      canonicalUrl = id
        ? `https://www.alibaba.com/product-detail/_/${id}.html`
        : `https://www.${domain}${url.pathname}`;
      break;
    case 'walmart':
      canonicalUrl = id
        ? `https://www.walmart.com/ip/${id}`
        : `https://www.${domain}${url.pathname}`;
      break;
    case 'shopify':
      canonicalUrl = id
        ? `https://${hostname}/products/${id}`
        : `https://${hostname}${url.pathname}`;
      break;
    default:
      const qs = url.search;
      canonicalUrl = `https://${hostname}${url.pathname}${qs}`;
  }

  return {
    provider,
    canonicalUrl,
    id,
    domain,
  };
}
