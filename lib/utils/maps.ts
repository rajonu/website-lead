import { WebsiteLead } from '@/lib/types/lead';

/**
 * Returns a direct, clickable Google Maps URL for the lead.
 * If the lead already has a verified Google Maps URL in its sources, it returns that.
 * Otherwise, it constructs an official Google Maps search URL targeting
 * the exact business name and location so clicking opens the business profile.
 */
export function getLeadGoogleMapsUrl(lead: WebsiteLead): string {
  const existingSourceUrl = lead.sources?.find(
    (s) => s.url && (s.url.includes('google.com/maps') || s.url.includes('maps.google.com') || s.url.includes('maps.app.goo.gl'))
  )?.url;

  if (existingSourceUrl) {
    return existingSourceUrl;
  }

  // Construct official Google Maps Search URL
  const address = lead.location?.full || [lead.location?.city, lead.location?.stateRegion, lead.location?.country].filter(Boolean).join(', ');
  const query = `${lead.name}, ${address}`.trim();

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
