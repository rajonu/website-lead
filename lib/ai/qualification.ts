import { WebsiteLead, QualificationData } from '@/lib/types/lead';

export function calculateLeadScore(lead: Partial<WebsiteLead>): QualificationData {
  let score = 50; // Base score
  let confidence = 0.8;
  const positiveFactors: string[] = [];
  const penalties: string[] = [];

  const market = lead.experiment?.market || lead.location?.country || 'US';
  const isBd = market === 'BD' || market.includes('Bangladesh');

  // 1. Website Status & Mobile Audit Evaluation
  const websiteStatus = lead.website?.status || 'unknown';
  const mobileAudit = lead.website?.mobileAudit;

  if (mobileAudit && !mobileAudit.isMobileFriendly) {
    score += 35;
    positiveFactors.push(
      `Existing site is not mobile-friendly (Mobile score: ${mobileAudit.mobileScore}/100) with ${mobileAudit.issues.length} detected mobile defects`
    );
  } else if (websiteStatus === 'weak' || websiteStatus === 'broken') {
    score += 25;
    positiveFactors.push('Existing website is outdated or mobile-unfriendly; prime candidate for mobile redesign');
  } else if (websiteStatus === 'none') {
    score += 25;
    positiveFactors.push('No website attached to Google Business listing (High opportunity)');
  } else if (websiteStatus === 'adequate' || websiteStatus === 'strong') {
    score -= 30;
    penalties.push('Business already has an adequate modern mobile presence');
  }

  // 2. Google Reputation & Reviews
  const rating = lead.businessSignals?.rating || 0;
  const reviews = lead.businessSignals?.reviewCount || 0;

  if (reviews >= 50) {
    score += 15;
    positiveFactors.push(`High social proof with ${reviews} Google reviews`);
  } else if (reviews >= 20) {
    score += 10;
    positiveFactors.push(`Solid review count (${reviews} reviews) indicating active trade`);
  } else if (reviews < 5) {
    score -= 10;
    penalties.push('Low review count (< 5 reviews); lower public activity confidence');
  }

  if (rating >= 4.5) {
    score += 10;
    positiveFactors.push(`Exceptional ${rating}★ customer rating`);
  }

  // 3. Contactability
  const hasPhone = lead.contacts?.some((c) => c.channel === 'phone');
  const hasWhatsApp = lead.contacts?.some((c) => c.channel === 'whatsapp');
  const hasEmail = lead.contacts?.some((c) => c.channel === 'email');

  if (isBd) {
    if (hasWhatsApp || hasPhone) {
      score += 15;
      positiveFactors.push('Direct WhatsApp/Phone booking channel verified for Dhaka market');
    }
  } else {
    if (hasEmail) {
      score += 10;
      positiveFactors.push('Verified business email found for personal outreach');
    }
    if (hasPhone) {
      score += 5;
      positiveFactors.push('Direct phone contact available for follow-up');
    }
  }

  // Bound score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine recommendation tier
  let recommendation: 'reject' | 'low' | 'medium' | 'high' | 'priority' = 'medium';
  if (score >= 90) recommendation = 'priority';
  else if (score >= 80) recommendation = 'high';
  else if (score >= 60) recommendation = 'medium';
  else if (score >= 40) recommendation = 'low';
  else recommendation = 'reject';

  // Recommended outreach channel
  const recommendedChannel = isBd ? 'whatsapp' : (hasEmail ? 'email' : 'phone');

  return {
    score,
    confidence,
    recommendation,
    positiveFactors,
    penalties,
    reason: positiveFactors.slice(0, 2).join('. ') + '.',
    recommendedChannel,
    outreachAngle: isBd 
      ? 'Show bilingual catalog preview with instant WhatsApp booking button.' 
      : 'Show mobile call-to-action preview highlighting their top customer reviews.',
    scoredAt: new Date().toISOString(),
    scoringVersion: `v1.2-${market.toLowerCase()}`,
  };
}
