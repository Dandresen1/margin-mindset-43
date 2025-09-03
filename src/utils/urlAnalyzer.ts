export type SupportedPlatform = 'amazon' | 'tiktok' | 'shopify' | 'etsy';

export interface URLAnalysisResult {
  isValid: boolean;
  platform?: SupportedPlatform;
  productName?: string;
  productId?: string;
  error?: string;
}

export class URLAnalyzer {
  private static platformPatterns = {
    amazon: {
      domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.ca', 'amazon.au'],
      patterns: [
        /\/dp\/([A-Z0-9]{10})/i,
        /\/gp\/product\/([A-Z0-9]{10})/i,
        /\/product\/([A-Z0-9]{10})/i
      ]
    },
    tiktok: {
      domains: ['tiktok.com', 'tiktokshop.com'],
      patterns: [
        /\/product\/(\d+)/i,
        /\/i\/(\d+)/i
      ]
    },
    etsy: {
      domains: ['etsy.com'],
      patterns: [
        /\/listing\/(\d+)\//i
      ]
    },
    shopify: {
      domains: ['myshopify.com', 'shopify.com'],
      patterns: [
        /\/products\/([^\/\?]+)/i
      ]
    }
  };

  static analyzeURL(url: string): URLAnalysisResult {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
      
      // Find matching platform
      for (const [platform, config] of Object.entries(this.platformPatterns)) {
        const domainMatch = config.domains.some(domain => 
          hostname === domain || hostname.endsWith('.' + domain)
        );
        
        if (domainMatch) {
          // Try to extract product ID
          let productId: string | undefined;
          for (const pattern of config.patterns) {
            const match = url.match(pattern);
            if (match) {
              productId = match[1];
              break;
            }
          }
          
          // Extract product name from URL path (basic attempt)
          const productName = this.extractProductName(urlObj, platform as SupportedPlatform);
          
          return {
            isValid: true,
            platform: platform as SupportedPlatform,
            productId,
            productName
          };
        }
      }
      
        return {
        isValid: false,
        error: 'Unsupported platform. We support Amazon, TikTok Shop, Etsy, and Shopify.'
      };
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format. Please enter a valid product URL.'
      };
    }
  }

  private static extractProductName(urlObj: URL, platform: SupportedPlatform): string | undefined {
    const pathname = urlObj.pathname;
    
    switch (platform) {
      case 'amazon':
        // Amazon URLs often have product name in path like /Product-Name-dp/B123456789/
        const amazonMatch = pathname.match(/\/([^\/]+)\/dp\//);
        if (amazonMatch) {
          return this.formatProductName(amazonMatch[1]);
        }
        break;
      case 'tiktok':
        // TikTok URLs sometimes have product name in path
        const tiktokMatch = pathname.match(/\/([^\/]+)\/product\//);
        if (tiktokMatch) {
          return this.formatProductName(tiktokMatch[1]);
        }
        break;
        
      case 'etsy':
        // Etsy URLs have product name like /listing/123456/product-name
        const etsyMatch = pathname.match(/\/listing\/\d+\/([^\/\?]+)/);
        if (etsyMatch) {
          return this.formatProductName(etsyMatch[1]);
        }
        break;
        
      case 'shopify':
        // Shopify URLs have product name like /products/product-name
        const shopifyMatch = pathname.match(/\/products\/([^\/\?]+)/);
        if (shopifyMatch) {
          return this.formatProductName(shopifyMatch[1]);
        }
        break;
    }
    
    return undefined;
  }

  private static formatProductName(rawName: string): string {
    return rawName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .substring(0, 50); // Limit length
  }

  static getPlatformDisplayName(platform: SupportedPlatform): string {
    const names = {
      amazon: 'Amazon',
      tiktok: 'TikTok Shop',
      etsy: 'Etsy',
      shopify: 'Shopify'
    };
    return names[platform];
  }

  static getDefaultPlatformSettings(platform: SupportedPlatform) {
    const defaults = {
      amazon: {
        shipping_method: 'calculated' as const,
        weight_oz: 8,
        estimated_price_range: '$15-50'
      },
      tiktok: {
        shipping_method: 'calculated' as const,
        weight_oz: 6,
        estimated_price_range: '$10-35'
      },
      etsy: {
        shipping_method: 'calculated' as const,
        weight_oz: 4,
        estimated_price_range: '$8-30'
      },
      shopify: {
        shipping_method: 'calculated' as const,
        weight_oz: 8,
        estimated_price_range: '$20-60'
      }
    };
    return defaults[platform];
  }
}