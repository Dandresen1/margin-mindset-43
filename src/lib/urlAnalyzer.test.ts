import { describe, it, expect } from 'vitest';
import { detectProvider } from './urlAnalyzer';

describe('detectProvider', () => {
  it('amazon dp', () => {
    const r = detectProvider('https://www.amazon.com/dp/B08N5WRWNW?ref_=abc&utm_source=x');
    expect(r.provider).toBe('amazon');
    expect(r.id).toBe('B08N5WRWNW');
    expect(r.canonicalUrl).toMatch(/\/dp\/B08N5WRWNW$/);
  });

  it('etsy listing', () => {
    const r = detectProvider('https://www.etsy.com/listing/123456789/cute-mug?utm_campaign=xyz');
    expect(r.provider).toBe('etsy');
    expect(r.id).toBe('123456789');
  });

  it('aliexpress item', () => {
    const r = detectProvider('https://www.aliexpress.com/item/1005006722334455.html?aff=1');
    expect(r.provider).toBe('aliexpress');
    expect(r.id).toBe('1005006722334455');
  });

  it('alibaba product-detail', () => {
    const r = detectProvider('https://www.alibaba.com/product-detail/whatever-thing_1600555123456.html');
    expect(r.provider).toBe('alibaba');
    expect(r.id).toBe('1600555123456');
  });

  it('walmart ip', () => {
    const r = detectProvider('https://www.walmart.com/ip/123456789');
    expect(r.provider).toBe('walmart');
    expect(r.id).toBe('123456789');
  });

  it('shopify products', () => {
    const r = detectProvider('https://brand.myshopify.com/products/widget-pro');
    expect(r.provider).toBe('shopify');
    expect(r.id).toBe('widget-pro');
  });

  it('generic unknown domain allowed', () => {
    const r = detectProvider('https://example.com/some-page?utm_source=x');
    expect(r.provider).toBe('generic');
    expect(r.canonicalUrl).toBe('https://example.com/some-page');
  });

  it('adds https if missing', () => {
    const r = detectProvider('example.com/thing');
    expect(r.canonicalUrl).toBe('https://example.com/thing');
  });
});
