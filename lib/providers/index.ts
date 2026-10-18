import { WebsiteLead } from '@/lib/types/lead';
import { logger } from '@/lib/logger';

export interface RawBusinessRecord {
  providerId: string;
  name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  sourceUrl?: string;
}

export interface BusinessProvider {
  name: string;
  search(params: {
    market: string;
    city: string;
    niche: string;
    limit?: number;
  }): Promise<RawBusinessRecord[]>;
}

export class JsonFileProvider implements BusinessProvider {
  name = 'json-import';

  async search(): Promise<RawBusinessRecord[]> {
    // Allows importing from custom JSON dumps
    return [];
  }
}

/**
 * Normalizes business identity to prevent duplicate creation
 */
export function generateCanonicalSlug(name: string, city: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const cleanCity = city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${cleanName}-${cleanCity}`;
}

export function deduplicateRecords(
  existingLeads: WebsiteLead[],
  incomingRecords: RawBusinessRecord[]
): RawBusinessRecord[] {
  const existingSlugs = new Set(existingLeads.map((l) => l.slug));
  const existingPhones = new Set(
    existingLeads.flatMap((l) => l.contacts.filter((c) => c.channel === 'phone').map((c) => c.value.replace(/[^0-9]/g, '')))
  );

  return incomingRecords.filter((rec) => {
    const slug = generateCanonicalSlug(rec.name, rec.city);
    if (existingSlugs.has(slug)) {
      logger.debug('Skipping duplicate by slug', { slug });
      return false;
    }

    if (rec.phone) {
      const cleanPhone = rec.phone.replace(/[^0-9]/g, '');
      if (cleanPhone && existingPhones.has(cleanPhone)) {
        logger.debug('Skipping duplicate by phone', { phone: rec.phone });
        return false;
      }
    }

    return true;
  });
}
