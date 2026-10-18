export type LifecycleStage =
  | 'new'
  | 'researching'
  | 'qualified'
  | 'high_score'
  | 'demo_ready'
  | 'review'
  | 'approved'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'client'
  | 'maintenance'
  | 'archived'
  | 'rejected';

export type WebsiteStatus = 'unknown' | 'none' | 'broken' | 'weak' | 'adequate' | 'strong';

export type ContactChannel =
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'contact_form'
  | 'sms'
  | 'other';

export interface LeadLocation {
  full?: string;
  city?: string;
  stateRegion?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface LeadSource {
  provider: string;
  providerId?: string;
  url?: string;
  retrievedAt: string;
  notes?: string;
}

export interface BusinessSignals {
  rating?: number;
  reviewCount?: number;
  activeConfidence?: number;
  hours?: Record<string, string>;
  observations?: string[];
}

export interface WebsiteAudit {
  url?: string;
  status: WebsiteStatus;
  auditedAt?: string;
  observations?: string[];
  opportunities?: string[];
  evidence?: string[];
}

export interface ContactMethod {
  channel: ContactChannel;
  value: string;
  label?: string;
  source?: string;
  publicBusinessContact?: boolean;
  verifiedAt?: string;
  confidence?: number;
}

export interface LeadAsset {
  type?: 'photo' | 'logo' | 'other';
  url?: string;
  source?: string;
  usageNotes?: string;
}

export interface ResearchData {
  summary?: string;
  customerJourney?: string;
  conversionOpportunity?: string;
  uncertainties?: string[];
  lastResearchedAt?: string;
}

export interface QualificationData {
  score?: number;
  confidence?: number;
  recommendation?: 'unknown' | 'reject' | 'low' | 'medium' | 'high' | 'priority';
  positiveFactors?: string[];
  penalties?: string[];
  reason?: string;
  recommendedChannel?: string;
  outreachAngle?: string;
  scoredAt?: string;
  scoringVersion?: string;
}

export interface GeneratedSiteContent {
  template?: string;
  hero?: {
    headline?: string;
    subheadline?: string;
    badge?: string;
    callToActionText?: string;
  };
  services?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  about?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  cta?: {
    type?: string;
    primaryPhone?: string;
    primaryWhatsApp?: string;
  };
  generatedAt?: string;
  generationVersion?: string;
}

export interface PreviewData {
  slug?: string;
  url?: string;
  screenshotUrl?: string;
  version?: number;
  status?: 'none' | 'queued' | 'generated' | 'qa_required' | 'approved' | 'rejected';
  generatedAt?: string;
}

export interface HumanReviewData {
  decision?: 'pending' | 'approved' | 'skipped' | 'held' | 'needs_changes';
  reason?: string;
  notes?: string;
  reviewedAt?: string;
}

export interface OutreachEvent {
  channel?: string;
  type?: 'drafted' | 'approved' | 'sent' | 'delivered' | 'failed' | 'follow_up' | 'reply' | 'opt_out' | 'complaint';
  at?: string;
  notes?: string;
}

export interface OutreachData {
  suppressed?: boolean;
  suppressionReason?: string;
  recommendedChannel?: string;
  draft?: string;
  events?: OutreachEvent[];
}

export interface SalesData {
  stage?: 'none' | 'contacted' | 'replied' | 'interested' | 'changes_requested' | 'proposal' | 'won' | 'lost' | 'follow_up_later';
  replySummary?: string;
  objections?: string[];
  nextAction?: string;
  nextActionAt?: string;
  lostReason?: string;
  quotedPlan?: string;
  quotedPrice?: number;
  currency?: string;
}

export interface CustomerData {
  isCustomer?: boolean;
  customerSince?: string;
  plan?: string;
  billingStatus?: string;
  customDomain?: string;
  deploymentStatus?: string;
  accountHealth?: 'unknown' | 'healthy' | 'attention' | 'at_risk';
}

export interface MaintenanceData {
  lastHealthCheckAt?: string;
  nextReviewAt?: string;
  openTasks?: string[];
  domainRenewalAt?: string;
}

export interface ExperimentData {
  market?: string;
  niche?: string;
  cohort?: string;
  variant?: string;
}

export interface WebsiteLead {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: LeadLocation;
  sources: LeadSource[];
  businessSignals?: BusinessSignals;
  website: WebsiteAudit;
  contacts: ContactMethod[];
  assets: LeadAsset[];
  research?: ResearchData;
  qualification?: QualificationData;
  generatedSite?: GeneratedSiteContent;
  preview?: PreviewData;
  humanReview?: HumanReviewData;
  outreach?: OutreachData;
  sales?: SalesData;
  customer?: CustomerData;
  maintenance?: MaintenanceData;
  lifecycle: LifecycleStage;
  experiment?: ExperimentData;
  createdAt: string;
  updatedAt: string;
}
