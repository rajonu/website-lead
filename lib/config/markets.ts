export interface MarketConfig {
  id: string;
  name: string;
  country: string;
  currency: string;
  currencySymbol: string;
  primaryChannels: string[];
  cities: Array<{
    name: string;
    suggestedNiches: string[];
  }>;
  pricingTiers: Array<{
    name: string;
    setupFee: number;
    monthlyFee: number;
    description: string;
  }>;
}

export const MARKETS: Record<string, MarketConfig> = {
  US: {
    id: "US",
    name: "United States",
    country: "United States",
    currency: "USD",
    currencySymbol: "$",
    primaryChannels: ["email", "phone"],
    cities: [
      {
        name: "Dallas–Fort Worth, TX",
        suggestedNiches: ["HVAC", "Plumbing", "Roofing"]
      },
      {
        name: "Houston, TX",
        suggestedNiches: ["HVAC", "Plumbing", "Roofing"]
      },
      {
        name: "Orlando, FL",
        suggestedNiches: ["HVAC", "Plumbing", "Pool Services", "Landscaping"]
      }
    ],
    pricingTiers: [
      { name: "Starter", setupFee: 0, monthlyFee: 49, description: "One-page managed site, SSL, hosting, tap-to-call" },
      { name: "Growth", setupFee: 99, monthlyFee: 99, description: "Custom domain, high-priority edits, review sync" },
      { name: "Scale", setupFee: 199, monthlyFee: 149, description: "Full local SEO, direct booking, emergency call CTA" }
    ]
  },
  UK: {
    id: "UK",
    name: "United Kingdom",
    country: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    primaryChannels: ["email", "phone", "whatsapp"],
    cities: [
      {
        name: "Manchester",
        suggestedNiches: ["Plumbing", "Electrical", "Builders / Trades"]
      },
      {
        name: "Birmingham",
        suggestedNiches: ["Plumbing", "Electrical", "Builders / Trades"]
      },
      {
        name: "Leeds",
        suggestedNiches: ["Home Services", "Roofing", "Joinery"]
      }
    ],
    pricingTiers: [
      { name: "Trade Starter", setupFee: 0, monthlyFee: 39, description: "Fast mobile site, Gas Safe/NICEIC badge, hosting" },
      { name: "Trade Pro", setupFee: 50, monthlyFee: 79, description: "Custom .co.uk domain, monthly updates, call routing" }
    ]
  },
  BD: {
    id: "BD",
    name: "Bangladesh",
    country: "Bangladesh",
    currency: "BDT",
    currencySymbol: "৳",
    primaryChannels: ["whatsapp", "phone", "facebook"],
    cities: [
      {
        name: "Dhaka (Banani, Dhanmondi, Gulshan, Uttara)",
        suggestedNiches: [
          "Beauty Salon / Spa",
          "Dental Clinics",
          "Interior Design & Furniture",
          "Restaurants & Cafes",
          "Car Workshop & Detailing"
        ]
      }
    ],
    pricingTiers: [
      { name: "Local Starter", setupFee: 1500, monthlyFee: 1500, description: "One-page catalog, WhatsApp booking, hosting" },
      { name: "Dhaka Business Hub", setupFee: 3000, monthlyFee: 2500, description: "Custom .com/.bd domain, Facebook pixel, rate card" },
      { name: "Premium Clinic / Studio", setupFee: 5000, monthlyFee: 3500, description: "Multi-service catalog, appointment booking" }
    ]
  }
};
