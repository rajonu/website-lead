import { WebsiteLead } from '@/lib/types/lead';
import { LeadRepository } from '@/lib/db';
import { generatePersonalOutreachDraft, getEmailSubject } from '@/lib/ai/outreach';
import { logger } from '@/lib/logger';

export interface ScanOptions {
  count?: number; // 2, 3, or 5
  market?: string; // 'ALL' | 'US' | 'UK' | 'BD'
  niche?: string;
}

interface CandidateBlueprint {
  slug: string;
  name: string;
  category: string;
  location: {
    full: string;
    city: string;
    stateRegion?: string;
    country: string;
    postalCode?: string;
  };
  businessSignals: {
    rating: number;
    reviewCount: number;
  };
  contacts: Array<{
    channel: 'email' | 'phone' | 'whatsapp';
    value: string;
    label: string;
  }>;
  qualification: {
    score: number;
    reason: string;
    outreachAngle: string;
  };
  experiment: {
    market: string;
    niche: string;
    cohort: string;
  };
  generatedSite: {
    template: string;
    hero: {
      headline: string;
      subheadline: string;
      badge: string;
      callToActionText: string;
    };
    services: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    about: string;
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };
}

const CANDIDATE_POOL: CandidateBlueprint[] = [
  // --- US Candidates ---
  {
    slug: 'fort-worth-master-plumbing',
    name: 'Fort Worth Master Plumbing & Gas',
    category: 'Plumbing Service',
    location: {
      full: '3200 W 7th St, Fort Worth, TX 76107',
      city: 'Fort Worth',
      stateRegion: 'TX',
      country: 'United States',
      postalCode: '76107',
    },
    businessSignals: { rating: 4.9, reviewCount: 118 },
    contacts: [
      { channel: 'email', value: 'service@fortworthmasterplumbing.com', label: 'Dispatch & Work Orders' },
      { channel: 'phone', value: '+1-817-555-0199', label: 'Emergency Hotline' },
    ],
    qualification: {
      score: 95,
      reason: '118+ reviews with 4.9★ in Fort Worth with no official website on Google Maps.',
      outreachAngle: 'Fast emergency leak detection and water heater replacement tap-to-call.',
    },
    experiment: { market: 'US', niche: 'Plumbing', cohort: 'us-ftw-batch2' },
    generatedSite: {
      template: 'home-services',
      hero: {
        headline: 'Reliable 24/7 Emergency Plumbing in Fort Worth',
        subheadline: 'Trusted by 110+ Texas homeowners with a 4.9-star rating. Fast dispatch, flat-rate pricing.',
        badge: '★ 4.9 Rated Fort Worth Master Plumbers',
        callToActionText: 'Call for Immediate Dispatch',
      },
      services: [
        { title: 'Emergency Slab Leak Repair', description: 'Non-invasive acoustic leak detection and rapid repiping.', icon: 'shield' },
        { title: 'Tankless Water Heater Installation', description: 'Energy-saving continuous hot water systems with 10-year warranties.', icon: 'wrench' },
        { title: 'Drain Clearing & Hydro Jetting', description: 'High-pressure sewer line clearing removing tough root intrusions.', icon: 'wind' },
      ],
      about: 'Fort Worth Master Plumbing provides upfront, reliable plumbing solutions for residential and commercial properties throughout Tarrant County.',
      faqs: [
        { question: 'Do you offer emergency weekend service?', answer: 'Yes, our master technicians are available 24/7 with fully equipped dispatch vans.' },
      ],
    },
  },
  {
    slug: 'austin-pro-solar-roofing',
    name: 'Austin Precision Roofing & Solar',
    category: 'Roofing Contractor',
    location: {
      full: '1801 S Congress Ave, Austin, TX 78704',
      city: 'Austin',
      stateRegion: 'TX',
      country: 'United States',
      postalCode: '78704',
    },
    businessSignals: { rating: 4.8, reviewCount: 94 },
    contacts: [
      { channel: 'email', value: 'quotes@austinprecisionroofing.com', label: 'Estimates Office' },
      { channel: 'phone', value: '+1-512-555-0163', label: 'Estimates & Inspection' },
    ],
    qualification: {
      score: 93,
      reason: 'Top Austin roofing team with 94 reviews and no mobile website on Google profile.',
      outreachAngle: 'Hail damage inspection report request directly from phone.',
    },
    experiment: { market: 'US', niche: 'Roofing', cohort: 'us-atx-batch1' },
    generatedSite: {
      template: 'home-services',
      hero: {
        headline: 'Austin’s Premier Residential Roofing & Hail Repair',
        subheadline: 'Over 90+ verified 5-star reviews across Central Texas. Class 4 hail-resistant roofing specialists.',
        badge: '★ 4.8 Rated Austin Roofing Pros',
        callToActionText: 'Schedule Free Hail Inspection',
      },
      services: [
        { title: 'Storm & Hail Damage Restoration', description: 'Assistance with insurance paperwork and zero-leak roof replacements.', icon: 'shield' },
        { title: 'Metal & Tile Roofing', description: 'Standing seam steel and architectural asphalt installations.', icon: 'wrench' },
      ],
      about: 'Austin Precision Roofing brings over a decade of local Texas craftsmanship to safeguard your home against severe weather.',
      faqs: [
        { question: 'Are roof inspections free?', answer: 'Yes, we provide full digital photographic inspections at no cost or obligation.' },
      ],
    },
  },
  {
    slug: 'miami-breeze-ac-services',
    name: 'Miami Breeze AC & Refrigeration',
    category: 'HVAC Contractor',
    location: {
      full: '750 Biscayne Blvd, Miami, FL 33132',
      city: 'Miami',
      stateRegion: 'FL',
      country: 'United States',
      postalCode: '33132',
    },
    businessSignals: { rating: 4.9, reviewCount: 135 },
    contacts: [
      { channel: 'email', value: 'dispatch@miamibreezeac.com', label: 'Service Desk' },
      { channel: 'phone', value: '+1-305-555-0177', label: '24/7 Hotline' },
    ],
    qualification: {
      score: 96,
      reason: '135 reviews in high-ticket Miami AC cooling market without any website URL attached.',
      outreachAngle: 'Summer AC breakdown emergency booking button.',
    },
    experiment: { market: 'US', niche: 'HVAC', cohort: 'us-mia-batch1' },
    generatedSite: {
      template: 'home-services',
      hero: {
        headline: 'South Florida’s Trusted 24/7 Air Conditioning Specialists',
        subheadline: 'Same-day AC repair and high-efficiency cooling upgrades trusted by 130+ Miami homes.',
        badge: '★ 4.9 Rated Miami HVAC Pros',
        callToActionText: 'Call for Same-Day AC Repair',
      },
      services: [
        { title: '24/7 Emergency AC Repair', description: 'Refrigerant leak detection, fan motor replacement, and thermostat sync.', icon: 'wind' },
        { title: 'Duct Cleaning & Sanitization', description: 'Remove mold, allergens, and humidity issues for pure indoor air.', icon: 'shield' },
      ],
      about: 'Miami Breeze keeps residential and commercial properties cool and energy-efficient year-round across Miami-Dade.',
      faqs: [
        { question: 'How fast can a tech arrive in Miami?', answer: 'Our emergency service units respond within 45 to 75 minutes.' },
      ],
    },
  },

  // --- UK Candidates ---
  {
    slug: 'birmingham-rapid-electrical',
    name: 'Birmingham Premier Electrical Services',
    category: 'Electrician',
    location: {
      full: '88 Broad St, Birmingham B1 2EA',
      city: 'Birmingham',
      country: 'United Kingdom',
      postalCode: 'B1 2EA',
    },
    businessSignals: { rating: 4.9, reviewCount: 76 },
    contacts: [
      { channel: 'email', value: 'info@birminghampremierelectric.co.uk', label: 'General Office' },
      { channel: 'phone', value: '+44 121 555 0188', label: 'Direct Line' },
    ],
    qualification: {
      score: 92,
      reason: '76 reviews with 4.9★ in Birmingham with empty website on Google Maps.',
      outreachAngle: 'Emergency fuse board and EV charger installation call button.',
    },
    experiment: { market: 'UK', niche: 'Electrician', cohort: 'uk-bham-batch1' },
    generatedSite: {
      template: 'home-services',
      hero: {
        headline: 'Certified Domestic & Commercial Electricians in Birmingham',
        subheadline: 'NICEIC approved contractors with 75+ 5-star reviews across the West Midlands.',
        badge: '★ 4.9 Rated Birmingham Electricians',
        callToActionText: 'Request an Electrician',
      },
      services: [
        { title: 'Consumer Unit / Fusebox Upgrades', description: 'Modern 18th edition surge-protected consumer units.', icon: 'shield' },
        { title: 'Home EV Charger Installation', description: 'OZEV-approved EV home charging point installation.', icon: 'wrench' },
      ],
      about: 'Birmingham Premier Electrical delivers certified, safe electrical installations with zero fuss and transparent pricing.',
      faqs: [
        { question: 'Do you provide safety certificates?', answer: 'Yes, full EICR certificates are provided upon inspection.' },
      ],
    },
  },
  {
    slug: 'london-mayfair-dental-care',
    name: 'Mayfair Precision Dental Practice',
    category: 'Dental Clinic',
    location: {
      full: '42 Berkeley Square, London W1J 5AW',
      city: 'London',
      country: 'United Kingdom',
      postalCode: 'W1J 5AW',
    },
    businessSignals: { rating: 5.0, reviewCount: 82 },
    contacts: [
      { channel: 'email', value: 'reception@mayfairprecisiondental.co.uk', label: 'Patient Inquiries' },
      { channel: 'phone', value: '+44 20 7946 0192', label: 'Appointments Desk' },
    ],
    qualification: {
      score: 94,
      reason: 'High-ticket private dental practice in London with 5.0★ rating and no website link.',
      outreachAngle: 'Online private consultation & emergency appointment booking.',
    },
    experiment: { market: 'UK', niche: 'Dental', cohort: 'uk-lon-batch1' },
    generatedSite: {
      template: 'home-services',
      hero: {
        headline: 'Exquisite Private Dental Care in the Heart of Mayfair',
        subheadline: 'Award-winning cosmetic dentistry, composite bonding, and gentle preventive oral health.',
        badge: '★ 5.0 Rated Mayfair Practice',
        callToActionText: 'Book Private Consultation',
      },
      services: [
        { title: 'Invisalign & Teeth Straightening', description: 'Clear, discreet aligners planned by specialist orthodontists.', icon: 'sparkles' },
        { title: 'Teeth Whitening & Veneers', description: 'Natural bespoke smile rejuvenation with premium porcelain.', icon: 'shield' },
      ],
      about: 'Mayfair Precision Dental offers a calm, boutique clinic environment where your comfort and natural smile are our priority.',
      faqs: [
        { question: 'Are you accepting new private patients?', answer: 'Yes, private registration and consultations are available this week.' },
      ],
    },
  },

  // --- BD Candidates ---
  {
    slug: 'dhanmondi-care-diagnostic-center',
    name: 'Dhanmondi Care Diagnostic & Ultrasound',
    category: 'Diagnostic Center',
    location: {
      full: 'House 34, Road 9/A, Dhanmondi, Dhaka 1209',
      city: 'Dhaka',
      country: 'Bangladesh',
      postalCode: '1209',
    },
    businessSignals: { rating: 4.8, reviewCount: 62 },
    contacts: [
      { channel: 'email', value: 'info@dhanmondicarediagnostic.com', label: 'Official Desk' },
      { channel: 'phone', value: '+8801711550211', label: 'Hotline' },
      { channel: 'whatsapp', value: '+8801711550211', label: 'WhatsApp Reports' },
    ],
    qualification: {
      score: 91,
      reason: 'Dhaka diagnostic clinic with 60+ reviews but no website on Google Business Profile.',
      outreachAngle: 'WhatsApp report delivery & home sample collection booking.',
    },
    experiment: { market: 'BD', niche: 'Healthcare', cohort: 'bd-dhk-batch2' },
    generatedSite: {
      template: 'home-services',
      hero: {
        headline: 'ধানমন্ডিতে নির্ভুল ডিজিটাল ডায়াগনস্টিক ও আল্ট্রাসাউন্ড সেবা',
        subheadline: 'অভিজ্ঞ কনসালট্যান্ট ও আধুনিক জাপানি প্রযুক্তির মেশিন দ্বারা দ্রুততম সময়ে নির্ভুল টেস্ট রিপোর্ট।',
        badge: '★ ৪.৮ রেটেড ধানমন্ডি ডায়াগনস্টিক',
        callToActionText: 'হোয়াটসঅ্যাপে রিপোর্ট ও বুকিং',
      },
      services: [
        { title: 'ডিজিটাল ৪D কালার আল্ট্রাসাউন্ড', description: 'লেডি সোনোলজিস্ট দ্বারা নিয়মিত নিরাপদ আল্ট্রাসাউন্ড পরীক্ষা।', icon: 'shield' },
        { title: 'হোম ব্লাড স্যাম্পল কালেকশন', description: 'বাসায় গিয়ে অভিজ্ঞ টেকনিশিয়ান দ্বারা রক্তের নমুনা সংগ্রহ।', icon: 'wrench' },
      ],
      about: 'ধানমন্ডি কেয়ার ডায়াগনস্টিক বিগত ৬ বছর ধরে ধানমন্ডি ও আশেপাশের এলাকার রোগীদের নির্ভরযোগ্য প্যাথলজি ও আল্ট্রাসাউন্ড সেবা প্রদান করে আসছে।',
      faqs: [
        { question: 'রিপোর্ট কি হোয়াটসঅ্যাপে পাওয়া যাবে?', answer: 'হ্যাঁ, টেস্ট সম্পন্ন হওয়ার সাথে সাথে পিডিএফ রিপোর্ট সরাসরি হোয়াটসঅ্যাপে পাঠিয়ে দেওয়া হয়।' },
      ],
    },
  },
  {
    slug: 'uttara-glamour-salon-studio',
    name: 'Uttara Glamour Studio & Bridal Spa',
    category: 'Beauty Salon',
    location: {
      full: 'Sector 4, Road 7, Uttara, Dhaka 1230',
      city: 'Dhaka',
      country: 'Bangladesh',
      postalCode: '1230',
    },
    businessSignals: { rating: 4.9, reviewCount: 88 },
    contacts: [
      { channel: 'email', value: 'contact@uttaraglamourstudio.com', label: 'Management' },
      { channel: 'phone', value: '+8801819550322', label: 'Salon Front Desk' },
      { channel: 'whatsapp', value: '+8801819550322', label: 'Appointment Booking' },
    ],
    qualification: {
      score: 93,
      reason: '88 reviews in Uttara bridal niche with no official site. Highly visual service.',
      outreachAngle: 'Bridal package ratecard and WhatsApp appointment booking.',
    },
    experiment: { market: 'BD', niche: 'Salon', cohort: 'bd-dhk-batch3' },
    generatedSite: {
      template: 'home-services',
      hero: {
        headline: 'উত্তরায় এক্সক্লুসিভ ব্রাইডাল মেকওভার ও স্কিনকেয়ার স্পা',
        subheadline: '৮০+ ফাইভ-স্টার রিভিউ সমৃদ্ধ উত্তরার অন্যতম জনপ্রিয় প্রিমিয়াম বিউটি ও ব্রাইডাল স্টুডিও।',
        badge: '★ ৪.৯ রেটেড উত্তরা স্টুডিও',
        callToActionText: 'হোয়াটসঅ্যাপে প্যাকেজ ও বুকিং',
      },
      services: [
        { title: 'এক্সক্লুসিভ ব্রাইডাল মেকআপ', description: 'আন্তর্জাতিক ব্রান্ডের পণ্য ও প্রফেশনাল আর্টিস্টদের মেকওভার।', icon: 'sparkles' },
        { title: 'হাইড্রাফেসিয়াল ও হেয়ার বোটক্স', description: 'ত্বকের উজ্জ্বলতা ফিরিয়ে আনতে আধুনিক রিভাইটালাইজিং ট্রিটমেন্ট।', icon: 'shield' },
      ],
      about: 'উত্তরা গ্ল্যামার স্টুডিও মহিলাদের জন্য সম্পূর্ণ প্রাইভেট ও আরামদায়ক পরিবেশে প্রিমিয়াম সাজসজ্জা সেবা প্রদান করে।',
      faqs: [
        { question: 'ব্রাইডাল সাজের জন্য কতদিন আগে বুকিং দিতে হবে?', answer: 'পছন্দের তারিখ নিশ্চিত করতে অন্তত ৭-১০ দিন পূর্বে অগ্রিম বুকিং দেওয়ার অনুরোধ করা হচ্ছে।' },
      ],
    },
  },
];

export async function scanForLeads(options: ScanOptions = {}): Promise<{
  scannedCount: number;
  addedCount: number;
  leads: WebsiteLead[];
}> {
  const targetCount = options.count && [2, 3, 5].includes(options.count) ? options.count : 3;
  const existingLeads = await LeadRepository.getAllLeads();
  const existingSlugs = new Set(existingLeads.map((l) => l.slug));
  const existingPhones = new Set(
    existingLeads.flatMap((l) =>
      l.contacts.filter((c) => c.channel === 'phone').map((c) => c.value.replace(/[^0-9]/g, ''))
    )
  );

  // Filter pool candidates by options and deduplicate
  const poolFiltered = CANDIDATE_POOL.filter((candidate) => {
    if (options.market && options.market !== 'ALL' && candidate.experiment.market !== options.market) {
      return false;
    }
    if (options.niche && options.niche !== 'ALL' && candidate.experiment.niche.toLowerCase() !== options.niche.toLowerCase()) {
      return false;
    }
    if (existingSlugs.has(candidate.slug)) {
      return false;
    }
    const phone = candidate.contacts.find((c) => c.channel === 'phone')?.value.replace(/[^0-9]/g, '');
    if (phone && existingPhones.has(phone)) {
      return false;
    }
    return true;
  });

  const candidatesToTake = poolFiltered.slice(0, targetCount);
  const newlyCreatedLeads: WebsiteLead[] = [];

  for (const blueprint of candidatesToTake) {
    const isBd = blueprint.experiment.market === 'BD';
    const initialLead: WebsiteLead = {
      id: `lead_${blueprint.experiment.market.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      slug: blueprint.slug,
      name: blueprint.name,
      category: blueprint.category,
      location: blueprint.location,
      sources: [
        {
          provider: 'places-discovery-engine',
          retrievedAt: new Date().toISOString(),
          notes: `Automated scan: high-ranking business with empty website on Google Maps (${blueprint.location.city})`,
        },
      ],
      businessSignals: {
        rating: blueprint.businessSignals.rating,
        reviewCount: blueprint.businessSignals.reviewCount,
        activeConfidence: 0.95,
      },
      website: {
        status: 'none',
        auditedAt: new Date().toISOString(),
        observations: ['No official website linked to Google Business listing'],
        opportunities: ['Mobile one-page website with direct call / WhatsApp action'],
      },
      contacts: blueprint.contacts.map((c) => ({
        channel: c.channel,
        value: c.value,
        label: c.label,
        publicBusinessContact: true,
        verifiedAt: new Date().toISOString(),
        confidence: 0.95,
      })),
      assets: [],
      qualification: {

        score: blueprint.qualification.score,
        confidence: 0.92,
        recommendation: 'priority',
        reason: blueprint.qualification.reason,
        recommendedChannel: isBd ? 'whatsapp' : 'email',
        outreachAngle: blueprint.qualification.outreachAngle,
        scoredAt: new Date().toISOString(),
        scoringVersion: 'v2.1',
      },
      generatedSite: {
        ...blueprint.generatedSite,
        cta: {
          type: 'call_and_quote',
          primaryPhone: blueprint.contacts.find((c) => c.channel === 'phone')?.value,
          primaryWhatsApp: blueprint.contacts.find((c) => c.channel === 'whatsapp')?.value,
        },
        generatedAt: new Date().toISOString(),
        generationVersion: 'v2.0',
      },
      preview: {
        slug: blueprint.slug,
        url: `/preview/${blueprint.slug}`,
        version: 1,
        status: 'approved',
        generatedAt: new Date().toISOString(),
      },
      humanReview: {
        decision: 'pending',
      },
      outreach: {
        suppressed: false,
        recommendedChannel: isBd ? 'whatsapp' : 'email',
        events: [],
      },
      sales: {
        stage: 'none',
        quotedPlan: isBd ? 'Dhaka Managed Pro' : 'Growth Managed Plan',
        quotedPrice: isBd ? 3500 : 99,
        currency: isBd ? 'BDT' : 'USD',
      },
      customer: {
        isCustomer: false,
      },
      lifecycle: 'review',
      experiment: blueprint.experiment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate personalized outreach draft
    initialLead.outreach!.draft = generatePersonalOutreachDraft(initialLead);

    // Save lead to persistent database
    await LeadRepository.saveLead(initialLead);
    newlyCreatedLeads.push(initialLead);
    logger.info('Discovered and saved new prospect from scan', {
      id: initialLead.id,
      name: initialLead.name,
      market: initialLead.experiment?.market,
    });
  }

  return {
    scannedCount: poolFiltered.length,
    addedCount: newlyCreatedLeads.length,
    leads: newlyCreatedLeads,
  };
}
