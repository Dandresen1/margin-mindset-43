const CANONICAL: Record<string, string> = {
  apparel: "apparel",
  clothes: "apparel",
  fashion: "apparel",
  "apparel & accessories": "apparel",
  tshirts: "apparel",
  "t-shirts": "apparel",
  hoodies: "apparel",

  electronics: "electronics",
  gadgets: "electronics",
  audio: "electronics",
  headphones: "electronics",
  "consumer electronics": "electronics",

  beauty: "beauty",
  cosmetics: "beauty",
  skincare: "beauty",
  makeup: "beauty",

  home: "home",
  "home & kitchen": "home",
  kitchen: "home",
  decor: "home",
  "home goods": "home",

  jewelry: "jewelry",
  accessories: "jewelry"
};

export function toCanonicalCategory(input?: string): string {
  if (!input) return "default";
  const key = input.trim().toLowerCase();
  return CANONICAL[key] || key || "default";
}

export default CANONICAL;
