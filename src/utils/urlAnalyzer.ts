import {
  ProductCategory,
  detectCategoryFromText,
  getEstimatedCOGS,
  getEstimatedWeight,
} from '@/lib/productDefaults';
import {
  detectProvider,
  SUPPORTED_PROVIDERS,
  isSupported,
  type Provider,
} from '@/lib/urlAnalyzer';

export interface URLAnalysisResult {
  isValid: boolean;
  platform?: Provider;
  productName?: string;
  productId?: string;
  category?: ProductCategory;
  estimatedPrice?: number;
  estimatedCOGS?: number;
  estimatedWeight?: number;
  error?: string;
}

export class URLAnalyzer {
  static analyzeURL(url: string): URLAnalysisResult {
    try {
      const info = detectProvider(url);

      if (!isSupported(info.provider)) {
        return {
          isValid: false,
          error: `Unsupported platform. We support: ${SUPPORTED_PROVIDERS.join(', ')}`,
        };
      }

      const urlObj = new URL(info.canonicalUrl);
      const productName = this.extractProductName(urlObj, info.provider);
      const category = productName ? detectCategoryFromText(productName).value : 'unknown';
      const estimatedPrice = this.extractPriceFromURL(urlObj, info.provider);
      const estimatedWeight = getEstimatedWeight(category);
      const estimatedCOGS = estimatedPrice
        ? getEstimatedCOGS(estimatedPrice, category)
        : undefined;

      return {
        isValid: true,
        platform: info.provider,
        productId: info.id ?? undefined,
        productName,
        category,
        estimatedPrice,
        estimatedCOGS,
        estimatedWeight,
      };
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format. Please enter a valid product URL.',
      };
    }
  }

  private static extractProductName(
    urlObj: URL,
    platform: Provider,
  ): string | undefined {
    const pathname = urlObj.pathname;

    switch (platform) {
      case 'amazon': {
        const match = pathname.match(/\/([^\/]+)\/dp\//);
        if (match) {
          return this.formatProductName(match[1]);
        }
        break;
      }
      case 'etsy': {
        const match = pathname.match(/\/listing\/\d+\/([^\/\?]+)/);
        if (match) {
          return this.formatProductName(match[1]);
        }
        break;
      }
      case 'shopify': {
        const match = pathname.match(/\/products\/([^\/\?]+)/);
        if (match) {
          return this.formatProductName(match[1]);
        }
        break;
      }
      // other providers: no special handling
    }

    return undefined;
  }

  private static formatProductName(rawName: string): string {
    return rawName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\b(dp|product|listing|products)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50);
  }

  private static extractPriceFromURL(
    urlObj: URL,
    platform: Provider,
  ): number | undefined {
    const searchParams = urlObj.searchParams;
    const pathname = urlObj.pathname;

    const priceParams = ['price', 'p', 'cost', 'amount'];
    for (const param of priceParams) {
      const value = searchParams.get(param);
      if (value) {
        const price = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (price > 0) return price;
      }
    }

    switch (platform) {
      case 'amazon': {
        const match = pathname.match(/\$(\d+(?:\.\d{2})?)/);
        if (match) {
          return parseFloat(match[1]);
        }
        break;
      }
      case 'etsy': {
        const match = pathname.match(/(\d+)-(?:dollar|usd|price)/i);
        if (match) {
          return parseFloat(match[1]);
        }
        break;
      }
    }

    return undefined;
  }

  static getPlatformDisplayName(platform: Provider): string {
    const names: Record<Provider, string> = {
      amazon: 'Amazon',
      etsy: 'Etsy',
      aliexpress: 'AliExpress',
      alibaba: 'Alibaba',
      walmart: 'Walmart',
      shopify: 'Shopify',
      generic: 'Other',
    };
    return names[platform];
  }

  static getDefaultPlatformSettings(platform: Provider) {
    const defaults: Record<
      Provider,
      { shipping_method: 'calculated'; weight_oz: number; estimated_price_range: string }
    > = {
      amazon: { shipping_method: 'calculated', weight_oz: 8, estimated_price_range: '$15-50' },
      etsy: { shipping_method: 'calculated', weight_oz: 4, estimated_price_range: '$8-30' },
      aliexpress: { shipping_method: 'calculated', weight_oz: 8, estimated_price_range: '$5-40' },
      alibaba: { shipping_method: 'calculated', weight_oz: 16, estimated_price_range: '$10-100' },
      walmart: { shipping_method: 'calculated', weight_oz: 8, estimated_price_range: '$10-80' },
      shopify: { shipping_method: 'calculated', weight_oz: 8, estimated_price_range: '$20-60' },
      generic: { shipping_method: 'calculated', weight_oz: 8, estimated_price_range: 'Varies' },
    };
    return defaults[platform];
  }
}

