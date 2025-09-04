import type { Provider, DetectResult } from '@/lib/urlAnalyzer';
import { detectProvider } from '@/lib/urlAnalyzer';

export interface ExtractResult {
  title?: string;
  price?: number;
  images?: string[];
  weight?: number;
  id?: string | null;
  canonicalUrl: string;
  provider: Provider;
}

async function extractAmazon(info: DetectResult): Promise<ExtractResult> {
  return { ...info } as ExtractResult;
}

async function extractEtsy(info: DetectResult): Promise<ExtractResult> {
  return { ...info } as ExtractResult;
}

async function extractAliExpress(info: DetectResult): Promise<ExtractResult> {
  return { ...info } as ExtractResult;
}

async function extractAlibaba(info: DetectResult): Promise<ExtractResult> {
  return { ...info } as ExtractResult;
}

async function extractWalmart(info: DetectResult): Promise<ExtractResult> {
  return { ...info } as ExtractResult;
}

async function extractShopify(info: DetectResult): Promise<ExtractResult> {
  return { ...info } as ExtractResult;
}

async function extractGeneric(info: DetectResult): Promise<ExtractResult> {
  return { ...info } as ExtractResult;
}

export async function analyze(raw: string): Promise<ExtractResult> {
  const info = detectProvider(raw);
  switch (info.provider) {
    case 'amazon':
      return extractAmazon(info);
    case 'etsy':
      return extractEtsy(info);
    case 'aliexpress':
      return extractAliExpress(info);
    case 'alibaba':
      return extractAlibaba(info);
    case 'walmart':
      return extractWalmart(info);
    case 'shopify':
      return extractShopify(info);
    default:
      return extractGeneric(info);
  }
}
