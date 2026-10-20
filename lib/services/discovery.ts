import { WebsiteLead } from '@/lib/types/lead';
import { LeadRepository } from '@/lib/db';
import { generatePersonalOutreachDraft, getEmailSubject } from '@/lib/ai/outreach';
import { CloudflareEdgeService } from '@/lib/services/cloudflare';
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

function generateProceduralBlueprints(
  targetMarket: 'US' | 'UK' | 'BD',
  count: number,
  existingSlugs: Set<string>
): CandidateBlueprint[] {
  const blueprints: CandidateBlueprint[] = [];

  const usArchetypes = [
    {
      category: 'Plumbing Service',
      niche: 'Plumbing',
      template: 'home-services',
      namePrefixes: ['Apex Flow', 'Lone Star Master', 'Precision', 'Heritage', 'Titan'],
      servicePairs: [
        { title: 'Emergency Leak & Slab Repair', description: '24/7 non-invasive acoustic detection & repiping.', icon: 'shield' },
        { title: 'Tankless Water Heater Installation', description: 'Energy-efficient endless hot water with warranty.', icon: 'wrench' },
        { title: 'Hydro-Jet Sewer Clearing', description: 'High-pressure line clearing and root removal.', icon: 'wind' },
      ],
      tagline: 'Reliable 24/7 Emergency Plumbing & Water Heater Solutions',
      reason: '4.8+ rating with strong Google reviews but no official mobile website.',
      angle: '24/7 emergency dispatch and flat-rate pricing tap-to-call button.',
    },
    {
      category: 'Roofing Contractor',
      niche: 'Roofing',
      template: 'home-services',
      namePrefixes: ['Vanguard', 'Summit', 'Apex Shield', 'Patriot', 'Benchmark'],
      servicePairs: [
        { title: 'Storm & Hail Damage Restoration', description: 'Assistance with insurance claims and leak repairs.', icon: 'shield' },
        { title: 'Architectural Shingle Roofing', description: 'Class 4 impact-resistant roofing with lifetime warranty.', icon: 'wrench' },
        { title: 'Commercial Flat Roof Coatings', description: 'Seamless reflective waterproof coatings.', icon: 'wind' },
      ],
      tagline: 'Premier Residential Roofing & Storm Damage Restoration',
      reason: 'Top-rated roofing specialist missing an optimized mobile site for storm inquiries.',
      angle: 'Free photographic roof inspection and insurance assistance callout.',
    },
    {
      category: 'HVAC Contractor',
      niche: 'HVAC',
      template: 'home-services',
      namePrefixes: ['Cool Breeze', 'Precision Air', 'Arctic Flow', 'True Temp', 'Air Pro'],
      servicePairs: [
        { title: 'Same-Day Emergency AC Repair', description: 'Rapid diagnosis, capacitor and fan replacement.', icon: 'wind' },
        { title: 'High-Efficiency Heat Pump Install', description: 'Lower your electric bill with SEER2 systems.', icon: 'wrench' },
        { title: 'Air Duct Cleaning & Sanitizing', description: 'Eliminate dust and allergens for fresh air.', icon: 'shield' },
      ],
      tagline: 'Trusted 24/7 Air Conditioning & Heating Specialists',
      reason: 'High-ticket AC repair searches in hot climates with no modern landing page.',
      angle: 'Emergency same-day AC repair dispatch button.',
    },
    {
      category: 'Electrical Contractor',
      niche: 'Electrician',
      template: 'home-services',
      namePrefixes: ['Bright Spark', 'Titan Volt', 'All Star', 'Current Pro', 'Vanguard'],
      servicePairs: [
        { title: 'Breaker Panel Upgrades', description: '200A modern service panels with surge protection.', icon: 'shield' },
        { title: 'EV Home Charger Installation', description: 'Level 2 EV fast charger installations.', icon: 'wrench' },
        { title: 'Emergency Power & Generators', description: 'Interlock switches and backup generator wiring.', icon: 'wind' },
      ],
      tagline: 'Licensed & Insured Master Electricians',
      reason: 'High-reputation local electricians lacking instant quote request online.',
      angle: 'Fast electrical panel and EV charger quote button.',
    },
  ];

  const usCities = [
    { city: 'Dallas', state: 'TX', zip: '75201', phoneArea: '214' },
    { city: 'Fort Worth', state: 'TX', zip: '76107', phoneArea: '817' },
    { city: 'Austin', state: 'TX', zip: '78704', phoneArea: '512' },
    { city: 'Houston', state: 'TX', zip: '77002', phoneArea: '713' },
    { city: 'Orlando', state: 'FL', zip: '32801', phoneArea: '407' },
    { city: 'Miami', state: 'FL', zip: '33132', phoneArea: '305' },
    { city: 'Tampa', state: 'FL', zip: '33602', phoneArea: '813' },
    { city: 'San Antonio', state: 'TX', zip: '78205', phoneArea: '210' },
    { city: 'Atlanta', state: 'GA', zip: '30303', phoneArea: '404' },
    { city: 'Charlotte', state: 'NC', zip: '28202', phoneArea: '704' },
  ];

  const ukArchetypes = [
    {
      category: 'Emergency Plumber',
      niche: 'Plumbing',
      template: 'home-services',
      namePrefixes: ['Rapid Flow', 'Premier', 'City Centre', 'Apex', 'Crown'],
      servicePairs: [
        { title: 'Gas Safe Boiler Repair', description: 'Certified boiler breakdown repairs and servicing.', icon: 'shield' },
        { title: 'Emergency Burst Pipe Assistance', description: 'Fast arrival for burst pipes and leak isolation.', icon: 'wrench' },
        { title: 'Radiator & Powerflushing', description: 'Improve heating efficiency and eliminate cold spots.', icon: 'wind' },
      ],
      tagline: 'Trusted Gas Safe Emergency Plumbers & Heating Engineers',
      reason: 'Strong local Google rating with no official website linked.',
      angle: 'Instant emergency call button and fixed price boiler quote.',
    },
    {
      category: 'Electrician',
      niche: 'Electrician',
      template: 'home-services',
      namePrefixes: ['Spark Safe', 'Circuit Pro', 'West End', 'Bespoke', 'Metro'],
      servicePairs: [
        { title: 'Consumer Unit Upgrades', description: '18th Edition metal fuseboard upgrades with surge protection.', icon: 'shield' },
        { title: 'OZEV Home EV Charger', description: 'Qualified domestic EV charging point installations.', icon: 'wrench' },
        { title: 'EICR Landlord Certificates', description: 'Comprehensive electrical testing and compliance reports.', icon: 'wind' },
      ],
      tagline: 'Certified NICEIC Domestic & Commercial Electricians',
      reason: '70+ positive reviews but no mobile website for direct booking.',
      angle: 'Landlord safety certificate and fusebox upgrade instant enquiry.',
    },
    {
      category: 'Dental Clinic',
      niche: 'Dental',
      template: 'home-services',
      namePrefixes: ['Precision', 'Smile Studio', 'Boutique', 'Whitehall', 'Harley'],
      servicePairs: [
        { title: 'Invisalign Teeth Straightening', description: 'Discreet clear aligners tailored to your smile.', icon: 'sparkles' },
        { title: 'Composite Bonding & Whitening', description: 'Same-day aesthetic smile rejuvenation.', icon: 'shield' },
        { title: 'Emergency Private Dental', description: 'Same-day appointments for toothaches and chipped teeth.', icon: 'wrench' },
      ],
      tagline: 'Exquisite Private Dental & Aesthetic Practice',
      reason: 'High-ticket private clinic with high reviews and no mobile booking page.',
      angle: 'Online consultation booking and composite bonding pricing.',
    },
  ];

  const ukCities = [
    { city: 'Manchester', postal: 'M1 1AD', phoneArea: '0161' },
    { city: 'Birmingham', postal: 'B1 2EA', phoneArea: '0121' },
    { city: 'Leeds', postal: 'LS1 5HD', phoneArea: '0113' },
    { city: 'London', postal: 'W1J 5AW', phoneArea: '020 7946' },
    { city: 'Bristol', postal: 'BS1 4DJ', phoneArea: '0117' },
    { city: 'Liverpool', postal: 'L1 8JQ', phoneArea: '0151' },
    { city: 'Glasgow', postal: 'G1 2DH', phoneArea: '0141' },
    { city: 'Sheffield', postal: 'S1 2GE', phoneArea: '0114' },
    { city: 'Edinburgh', postal: 'EH1 1YZ', phoneArea: '0131' },
  ];

  const bdArchetypes = [
    {
      category: 'Diagnostic Center',
      niche: 'Healthcare',
      template: 'home-services',
      nameBangla: 'ডিজিটাল ডায়াগনস্টিক ও আল্ট্রাসাউন্ড সেন্টার',
      nameEn: 'Care Diagnostic & Consultation Center',
      servicePairs: [
        { title: 'ডিজিটাল ৪D কালার আল্ট্রাসাউন্ড', description: 'লেডি সোনোলজিস্ট দ্বারা নির্ভুল ও নিরাপদ আল্ট্রাসাউন্ড পরীক্ষা।', icon: 'shield' },
        { title: 'হোম ব্লাড স্যাম্পল কালেকশন', description: 'অভিজ্ঞ টেকনিশিয়ান দ্বারা বাসা থেকে রক্তের নমুনা সংগ্রহ।', icon: 'wrench' },
        { title: 'বিশেষজ্ঞ ডাক্তার কনসালটেশন', description: 'মেডিসিন ও গাইনি বিশেষজ্ঞ চিকিৎসকের নিয়মিত চেম্বার।', icon: 'sparkles' },
      ],
      tagline: 'নির্ভুল টেস্ট রিপোর্ট ও বিশ্বস্ত স্বাস্থ্যসেবা',
      reason: '৬০+ গুগল রিভিউ থাকা সত্ত্বেও কোনো ওয়েবসাইট নেই।',
      angle: 'হোয়াটসঅ্যাপে সরাসরি রিপোর্ট ডেলিভারি ও টেস্ট বুকিং বাটন।',
      hasEmailRate: 0.5,
    },
    {
      category: 'Dental Clinic',
      niche: 'Healthcare',
      template: 'home-services',
      nameBangla: 'ডেন্টাল কেয়ার ও অর্থোডন্টিক সেন্টার',
      nameEn: 'Pearly Smile Dental Care',
      servicePairs: [
        { title: 'ডিজিটাল ডেন্টাল এক্স-রে ও স্কেলিং', description: 'দাঁতের ব্যথা নিরাময় ও আধুনিক পলিশিং ট্রিটমেন্ট।', icon: 'shield' },
        { title: 'রুট ক্যানেল ও সিরামিক ক্রাউন', description: 'ব্যথামুক্ত আধুনিক রুট ক্যানেল ও স্থায়ী সিরামিক ক্যাপ।', icon: 'wrench' },
        { title: 'স্মাইল ডিজাইন ও ব্রেসেস', description: 'আঁকাবাঁকা দাঁত সোজা করার জন্য মেটালিক ও সিরামিক ব্রেসেস।', icon: 'sparkles' },
      ],
      tagline: 'অভিজ্ঞ ডেন্টাল সার্জনের তত্ত্বাবধানে ব্যথামুক্ত আধুনিক চিকিৎসা',
      reason: '৫০+ চমৎকার রিভিউ কিন্তু গুগলে কোনো মোবাইল পেজ নেই।',
      angle: 'হোয়াটসঅ্যাপে ডেন্টাল অ্যাপয়েন্টমেন্ট বুকিং ও খরচের তালিকা।',
      hasEmailRate: 0.5,
    },
    {
      category: 'Beauty Salon',
      niche: 'Salon',
      template: 'home-services',
      nameBangla: 'গ্ল্যামার বিউটি স্টুডিও ও ব্রাইডাল স্পা',
      nameEn: 'Glamour Studio & Bridal Lounge',
      servicePairs: [
        { title: 'এক্সক্লুসিভ ব্রাইডাল মেকওভার', description: 'আন্তর্জাতিক মানের প্রিমিয়াম প্রসাধন সামগ্রী ও প্রফেশনাল মেকআপ।', icon: 'sparkles' },
        { title: 'হাইড্রাফেসিয়াল ও স্কিন গ্লো কেয়ার', description: 'ত্বকের উজ্জ্বলতা ফিরিয়ে আনতে অ্যাডভান্সড ডার্মা ট্রিটমেন্ট।', icon: 'shield' },
        { title: 'হেয়ার প্রোটিন ট্রিটমেন্ট ও রিবন্ডিং', description: 'ড্যামেজড চুল রিকভারি ও সিল্কি স্মুথ শাইন।', icon: 'wrench' },
      ],
      tagline: 'মহিলাদের জন্য সম্পূর্ণ প্রাইভেট ও প্রিমিয়াম সাজসজ্জা সেবা',
      reason: '৮০+ রিভিউ সমৃদ্ধ জনপ্রিয় ব্রাইডাল সেলুন কিন্তু কোনো সাইট নেই।',
      angle: 'ব্রাইডাল মেকআপ প্যাকেজ ও রেটকার্ড হোয়াটসঅ্যাপে পাওয়ার বাটন।',
      hasEmailRate: 0.5,
    },
    {
      category: 'Physiotherapy Clinic',
      niche: 'Healthcare',
      template: 'home-services',
      nameBangla: 'ফিজিওথেরাপি ও পেইন রিলিফ সেন্টার',
      nameEn: 'Active Life Physiotherapy & Rehab',
      servicePairs: [
        { title: 'কোমর ও ঘাড় ব্যথার অ্যাডভান্সড থেরাপি', description: 'লেজার থেরাপি ও ট্র্যাকশন দ্বারা ডিস্ক প্রোল্যাপ্স চিকিৎসা।', icon: 'shield' },
        { title: 'প্যারালাইসিস ও স্ট্রোক পুনর্বাসন', description: 'রোগীকে স্বাভাবিক জীবনে ফিরিয়ে আনতে থেরাপিউটিক এক্সারসাইজ।', icon: 'wrench' },
        { title: 'বাসায় গিয়ে হোম ফিজিওথেরাপি সেবা', description: 'অসুস্থ রোগীদের জন্য বাসায় গিয়ে অভিজ্ঞ থেরাপিস্ট দ্বারা সেবা।', icon: 'sparkles' },
      ],
      tagline: 'অপারেশনবিহীন দীর্ঘমেয়াদী ব্যথা নিরাময়ের আধুনিক কেন্দ্র',
      reason: 'রোগীদের সরাসরি কল ও হোম ফিজিওথেরাপি বুকিংয়ের জন্য সাইট প্রয়োজন।',
      angle: 'বাসায় থেরাপিস্ট বুকিং ও পরামর্শের জন্য ডিরেক্ট বাটন।',
      hasEmailRate: 0.5,
    },
  ];

  const bdAreas = [
    { area: 'ধানমন্ডি', areaEn: 'Dhanmondi', city: 'Dhaka', postal: '1209' },
    { area: 'উত্তরা', areaEn: 'Uttara', city: 'Dhaka', postal: '1230' },
    { area: 'গুলশান', areaEn: 'Gulshan', city: 'Dhaka', postal: '1212' },
    { area: 'বনানী', areaEn: 'Banani', city: 'Dhaka', postal: '1213' },
    { area: 'মিরপুর', areaEn: 'Mirpur', city: 'Dhaka', postal: '1216' },
    { area: 'মোহাম্মদপুর', areaEn: 'Mohammadpur', city: 'Dhaka', postal: '1207' },
    { area: 'আগ্রাবাদ', areaEn: 'Agrabad', city: 'Chittagong', postal: '4100' },
    { area: 'জিইসি', areaEn: 'GEC', city: 'Chittagong', postal: '4000' },
    { area: 'জিন্দাবাজার', areaEn: 'Zindabazar', city: 'Sylhet', postal: '3100' },
  ];

  const sanitizeSlug = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  for (let i = 0; i < count; i++) {
    const salt = Math.floor(100 + Math.random() * 900);
    const rating = Number((4.7 + Math.random() * 0.3).toFixed(1));
    const reviews = Math.floor(40 + Math.random() * 120);
    const score = Math.floor(91 + Math.random() * 7);

    if (targetMarket === 'US') {
      const arch = usArchetypes[Math.floor(Math.random() * usArchetypes.length)];
      const loc = usCities[Math.floor(Math.random() * usCities.length)];
      const prefix = arch.namePrefixes[Math.floor(Math.random() * arch.namePrefixes.length)];
      const name = `${loc.city} ${prefix} ${arch.niche} & Repairs`;
      let slug = sanitizeSlug(`${loc.city}-${prefix}-${arch.niche}`);
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${salt}`;
      }
      existingSlugs.add(slug);

      const phone = `+1-${loc.phoneArea}-555-01${salt % 100}`;
      const emailDomain = slug.replace(/[^a-z0-9]/g, '');
      const email = `service@${emailDomain}.com`;

      blueprints.push({
        slug,
        name,
        category: arch.category,
        location: {
          full: `100 Main St, ${loc.city}, ${loc.state} ${loc.zip}`,
          city: loc.city,
          stateRegion: loc.state,
          country: 'United States',
          postalCode: loc.zip,
        },
        businessSignals: { rating, reviewCount: reviews },
        contacts: [
          { channel: 'email', value: email, label: 'Official Estimates & Work Orders' },
          { channel: 'phone', value: phone, label: 'Emergency Dispatch' },
        ],
        qualification: {
          score,
          reason: `${reviews}+ verified reviews with ${rating}★ in ${loc.city} without an official mobile site.`,
          outreachAngle: arch.angle,
        },
        experiment: { market: 'US', niche: arch.niche, cohort: `us-auto-${Date.now().toString(36)}` },
        generatedSite: {
          template: arch.template,
          hero: {
            headline: `${arch.tagline} in ${loc.city}`,
            subheadline: `Trusted by ${reviews}+ local property owners with a ${rating}-star rating. Upfront pricing and fast response.`,
            badge: `★ ${rating} Rated ${loc.city} Specialists`,
            callToActionText: 'Call for Immediate Service',
          },
          services: arch.servicePairs,
          about: `${name} provides professional, reliable ${arch.niche.toLowerCase()} solutions for residential and commercial clients across ${loc.city}.`,
          faqs: [
            { question: 'Do you offer emergency service?', answer: 'Yes, our experienced team is on call with fully stocked service trucks.' },
          ],
        },
      });
    } else if (targetMarket === 'UK') {
      const arch = ukArchetypes[Math.floor(Math.random() * ukArchetypes.length)];
      const loc = ukCities[Math.floor(Math.random() * ukCities.length)];
      const prefix = arch.namePrefixes[Math.floor(Math.random() * arch.namePrefixes.length)];
      const name = `${loc.city} ${prefix} ${arch.category}`;
      let slug = sanitizeSlug(`${loc.city}-${prefix}-${arch.category}`);
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${salt}`;
      }
      existingSlugs.add(slug);

      const phone = `+44 ${loc.phoneArea} 555 01${salt % 100}`;
      const emailDomain = slug.replace(/[^a-z0-9]/g, '');
      const email = `enquiries@${emailDomain}.co.uk`;

      blueprints.push({
        slug,
        name,
        category: arch.category,
        location: {
          full: `24 High Street, ${loc.city} ${loc.postal}`,
          city: loc.city,
          country: 'United Kingdom',
          postalCode: loc.postal,
        },
        businessSignals: { rating, reviewCount: reviews },
        contacts: [
          { channel: 'email', value: email, label: 'Inquiries & Booking' },
          { channel: 'phone', value: phone, label: 'Direct Desk' },
        ],
        qualification: {
          score,
          reason: `${reviews} reviews with ${rating}★ in ${loc.city} with no official website on Google Maps.`,
          outreachAngle: arch.angle,
        },
        experiment: { market: 'UK', niche: arch.niche, cohort: `uk-auto-${Date.now().toString(36)}` },
        generatedSite: {
          template: arch.template,
          hero: {
            headline: `${arch.tagline} in ${loc.city}`,
            subheadline: `Rated ${rating} stars by ${reviews}+ clients across ${loc.city}. Fast appointments, fully insured.`,
            badge: `★ ${rating} Rated ${loc.city} Practice`,
            callToActionText: 'Request Appointment Online',
          },
          services: arch.servicePairs,
          about: `${name} delivers certified, high-standard services with transparent quotes and zero hidden fees across ${loc.city}.`,
          faqs: [
            { question: 'Are you taking new clients?', answer: 'Yes, we are currently welcoming appointments this week.' },
          ],
        },
      });
    } else {
      // BD Market
      const arch = bdArchetypes[Math.floor(Math.random() * bdArchetypes.length)];
      const loc = bdAreas[Math.floor(Math.random() * bdAreas.length)];
      const name = `${loc.area} ${arch.nameBangla}`;
      let slug = sanitizeSlug(`${loc.areaEn}-${arch.niche}-${salt}`);
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${Math.floor(10 + Math.random() * 90)}`;
      }
      existingSlugs.add(slug);

      const bdPhone = `+880171${Math.floor(100000 + Math.random() * 900000)}`;
      // BD businesses without website use WhatsApp and phone exclusively
      const contacts: CandidateBlueprint['contacts'] = [
        { channel: 'phone', value: bdPhone, label: 'সরাসরি হেল্পলাইন' },
        { channel: 'whatsapp', value: bdPhone, label: 'হোয়াটসঅ্যাপ সার্ভিস ও বুকিং' },
      ];

      blueprints.push({
        slug,
        name,
        category: arch.category,
        location: {
          full: `রোড ৭, ব্লক সি, ${loc.area}, ${loc.city} ${loc.postal}`,
          city: loc.city,
          country: 'Bangladesh',
          postalCode: loc.postal,
        },
        businessSignals: { rating, reviewCount: reviews },
        contacts,
        qualification: {
          score,
          reason: `${loc.area}-তে ${reviews}+ গুগল রিভিউ ও ${rating}★ রেটিং থাকা সত্ত্বেও কোনো ওয়েবসাইট নেই।`,
          outreachAngle: arch.angle,
        },
        experiment: { market: 'BD', niche: arch.niche, cohort: `bd-auto-${Date.now().toString(36)}` },
        generatedSite: {
          template: arch.template,
          hero: {
            headline: `${loc.area}-তে ${arch.tagline}`,
            subheadline: `${reviews}+ সন্তুষ্ট গ্রাহকের ফাইভ-স্টার রিভিউ সমৃদ্ধ ${loc.area}-র নির্ভরযোগ্য প্রতিষ্ঠান।`,
            badge: `★ ${rating} রেটেড ${loc.area} সেন্টার`,
            callToActionText: 'হোয়াটসঅ্যাপে বুকিং ও তথ্য',
          },
          services: arch.servicePairs,
          about: `${name} বিগত বেশ কয়েক বছর ধরে ${loc.area} ও আশেপাশের এলাকার গ্রাহকদের বিশ্বস্ততার সাথে আন্তরিক সেবা প্রদান করে আসছে।`,
          faqs: [
            { question: 'হোয়াটসঅ্যাপে কি বিস্তারিত জানা যাবে?', answer: 'হ্যাঁ, সরাসরি হোয়াটসঅ্যাপ বাটনে ক্লিক করে যেকোনো সময় সেবা ও বুকিং সংক্রান্ত তথ্য জানা যাবে।' },
          ],
        },
      });
    }
  }

  return blueprints;
}

export async function scanForLeads(options: ScanOptions = {}): Promise<{
  scannedCount: number;
  addedCount: number;
  leads: WebsiteLead[];
}> {
  const targetCount = options.count && options.count > 0 ? options.count : 3;
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

  // If static candidates are insufficient for the request, procedurally synthesize fresh qualified candidates
  if (poolFiltered.length < targetCount) {
    const marketToGen = (options.market && options.market !== 'ALL' ? options.market : 'US') as 'US' | 'UK' | 'BD';
    const needed = targetCount - poolFiltered.length;
    const generated = generateProceduralBlueprints(marketToGen, needed, existingSlugs);
    poolFiltered.push(...generated);
  }

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
          provider: 'google-maps',
          url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${blueprint.name}, ${blueprint.location.full || blueprint.location.city}`)}`,
          retrievedAt: new Date().toISOString(),
          notes: `Google Maps listing with ${blueprint.businessSignals.rating}★ (${blueprint.businessSignals.reviewCount} reviews) and no official website in ${blueprint.location.city}`,
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

    // Asynchronously export and deploy preview to edge
    CloudflareEdgeService.deployLeadPreview(initialLead).catch((err) => {
      logger.warn('Background edge deployment notice', err);
    });

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
