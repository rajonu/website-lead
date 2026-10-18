/**
 * Curated high-resolution contextual imagery per business niche.
 * Used when raw Google Maps photo extraction has low resolution or missing assets.
 */

export interface IndustryVisuals {
  heroBanner: string;
  gallery: Array<{
    url: string;
    caption: string;
  }>;
}

const CATEGORY_VISUALS: Record<string, IndustryVisuals> = {
  hvac: {
    heroBanner: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
        caption: 'Certified Equipment & Diagnostic Tools'
      },
      {
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        caption: 'High-Efficiency Central AC & Heating Systems'
      },
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        caption: 'Rapid Residential Response Team'
      }
    ]
  },
  plumbing: {
    heroBanner: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        caption: 'Precision Leak Repair & Pipe Installation'
      },
      {
        url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
        caption: 'Modern Bathroom & Fixture Upgrades'
      },
      {
        url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
        caption: 'Emergency Boiler & Heating Diagnostics'
      }
    ]
  },
  roofing: {
    heroBanner: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        caption: 'Complete Shingle & Metal Roof Installation'
      },
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        caption: 'Storm Damage & Leak Emergency Tarping'
      },
      {
        url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
        caption: 'Drone & Photographic Inspection Reports'
      }
    ]
  },
  salon: {
    heroBanner: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        caption: 'Exclusive Bridal & Party Makeover Studio'
      },
      {
        url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
        caption: 'Hair Spa, Keratin & Protein Treatments'
      },
      {
        url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        caption: 'Hydra Facial & Rejuvenation Therapy'
      }
    ]
  },
  dental: {
    heroBanner: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
        caption: 'Modern Pain-Free Dental Technology'
      },
      {
        url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
        caption: 'Teeth Whitening & Aesthetic Smile Design'
      },
      {
        url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
        caption: 'Comprehensive Family Dental Consultations'
      }
    ]
  },
  restaurant: {
    heroBanner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        caption: 'Authentic Gourmet Dishes & Fresh Ingredients'
      },
      {
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        caption: 'Cozy Dining Ambiance & Family Tables'
      },
      {
        url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
        caption: 'Chef Specials & Reserve Cocktails'
      }
    ]
  },
  default: {
    heroBanner: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        caption: 'Professional Craftsmanship & Top-Tier Service'
      },
      {
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        caption: 'Transparent Quotes & Guaranteed Satisfaction'
      },
      {
        url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
        caption: 'Trusted by Hundreds of Local Clients'
      }
    ]
  }
};

export function getVisualsForCategory(category: string): IndustryVisuals {
  const cat = category.toLowerCase();
  if (cat.includes('hvac') || cat.includes('ac') || cat.includes('air conditioning') || cat.includes('heating')) {
    return CATEGORY_VISUALS.hvac;
  }
  if (cat.includes('plumb') || cat.includes('drain') || cat.includes('boiler')) {
    return CATEGORY_VISUALS.plumbing;
  }
  if (cat.includes('roof')) {
    return CATEGORY_VISUALS.roofing;
  }
  if (cat.includes('salon') || cat.includes('spa') || cat.includes('beauty') || cat.includes('hair') || cat.includes('parlor') || cat.includes('makeup')) {
    return CATEGORY_VISUALS.salon;
  }
  if (cat.includes('dent') || cat.includes('orthodont') || cat.includes('clinic')) {
    return CATEGORY_VISUALS.dental;
  }
  if (cat.includes('restaur') || cat.includes('cafe') || cat.includes('dining') || cat.includes('food') || cat.includes('pizza') || cat.includes('bakery')) {
    return CATEGORY_VISUALS.restaurant;
  }
  return CATEGORY_VISUALS.default;
}
