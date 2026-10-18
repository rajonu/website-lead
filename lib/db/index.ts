import fs from 'fs';
import path from 'path';
import { WebsiteLead, LifecycleStage } from '@/lib/types/lead';
import { initialSeedLeads } from './seed-data';
import { logger } from '@/lib/logger';

const DATA_DIR =
  process.env.DATA_DIR ||
  (fs.existsSync('/home/raj/website-lead/data')
    ? '/home/raj/website-lead/data'
    : path.join(process.cwd(), 'data'));
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');


// Ensure data directory exists
function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(initialSeedLeads, null, 2), 'utf-8');
      logger.info('Initialized lead database with seed data', { count: initialSeedLeads.length });
    }
  } catch (err) {
    logger.error('Failed to initialize lead database file', err);
  }
}

export class LeadRepository {
  private static readAll(): WebsiteLead[] {
    ensureDataFile();
    try {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      return JSON.parse(data) as WebsiteLead[];
    } catch (err) {
      logger.error('Failed reading leads file, falling back to seed data', err);
      return initialSeedLeads;
    }
  }

  private static writeAll(leads: WebsiteLead[]): void {
    ensureDataFile();
    try {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed writing leads to database file', err);
      throw new Error('Database write error');
    }
  }

  static async getAllLeads(filter?: {
    market?: string;
    lifecycle?: LifecycleStage;
    minScore?: number;
  }): Promise<WebsiteLead[]> {
    const leads = this.readAll();
    return leads.filter((lead) => {
      if (filter?.market && filter.market !== 'ALL') {
        const leadMarket = lead.experiment?.market || lead.location.country;
        if (leadMarket !== filter.market && !lead.location.country.includes(filter.market)) {
          return false;
        }
      }
      if (filter?.lifecycle && lead.lifecycle !== filter.lifecycle) {
        return false;
      }
      if (filter?.minScore && (lead.qualification?.score ?? 0) < filter.minScore) {
        return false;
      }
      return true;
    });
  }

  static async getLeadById(id: string): Promise<WebsiteLead | null> {
    const leads = this.readAll();
    return leads.find((l) => l.id === id) || null;
  }

  static async getLeadBySlug(slug: string): Promise<WebsiteLead | null> {
    const leads = this.readAll();
    return leads.find((l) => l.slug === slug || l.preview?.slug === slug) || null;
  }

  static async saveLead(lead: WebsiteLead): Promise<WebsiteLead> {
    const leads = this.readAll();
    const existingIndex = leads.findIndex((l) => l.id === lead.id || l.slug === lead.slug);
    
    lead.updatedAt = new Date().toISOString();
    if (existingIndex >= 0) {
      leads[existingIndex] = lead;
    } else {
      leads.unshift(lead);
    }

    this.writeAll(leads);
    return lead;
  }

  static async updateLead(id: string, updates: Partial<WebsiteLead>): Promise<WebsiteLead | null> {
    const leads = this.readAll();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const updated: WebsiteLead = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    leads[index] = updated;
    this.writeAll(leads);
    logger.info('Lead updated', { id, lifecycle: updated.lifecycle });
    return updated;
  }

  static async getDailyRecommendations(limit = 5): Promise<WebsiteLead[]> {
    const leads = this.readAll();
    // Return leads with high scores that are ready for review or newly qualified
    return leads
      .filter((l) => ['review', 'demo_ready', 'qualified', 'high_score'].includes(l.lifecycle))
      .sort((a, b) => (b.qualification?.score ?? 0) - (a.qualification?.score ?? 0))
      .slice(0, limit);
  }

  static async getContactedLeads(): Promise<WebsiteLead[]> {
    const leads = this.readAll();
    return leads
      .filter((l) => ['contacted', 'replied', 'interested', 'client'].includes(l.lifecycle) || (l.outreach?.events && l.outreach.events.length > 0))
      .sort((a, b) => {
        const dateA = a.outreach?.events?.[a.outreach.events.length - 1]?.at || a.updatedAt;
        const dateB = b.outreach?.events?.[b.outreach.events.length - 1]?.at || b.updatedAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }


  static async getFunnelMetrics(marketFilter?: string) {
    const leads = await this.getAllLeads(marketFilter ? { market: marketFilter } : undefined);

    const metrics = {
      totalDiscovered: leads.length,
      researched: leads.filter((l) => l.research?.summary).length,
      qualifiedHighScore: leads.filter((l) => (l.qualification?.score ?? 0) >= 80).length,
      awaitingReview: leads.filter((l) => l.lifecycle === 'review' || l.humanReview?.decision === 'pending').length,
      demosReady: leads.filter((l) => l.preview?.status === 'qa_required' || l.preview?.status === 'approved' || l.generatedSite).length,
      contacted: leads.filter((l) => ['contacted', 'replied', 'interested', 'client', 'maintenance'].includes(l.lifecycle)).length,
      replied: leads.filter((l) => ['replied', 'interested', 'client', 'maintenance'].includes(l.lifecycle)).length,
      activeClients: leads.filter((l) => l.customer?.isCustomer || l.lifecycle === 'client' || l.lifecycle === 'maintenance').length,
    };

    return metrics;
  }
}
