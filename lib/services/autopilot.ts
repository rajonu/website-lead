import fs from 'fs';
import path from 'path';
import { WebsiteLead } from '@/lib/types/lead';
import { LeadRepository } from '@/lib/db';
import { scanForLeads } from '@/lib/services/discovery';
import { BrevoService } from '@/lib/services/brevo';
import { CloudflareEdgeService } from '@/lib/services/cloudflare';
import { getEmailSubject } from '@/lib/ai/outreach';
import { logger } from '@/lib/logger';

export interface AutopilotLogEntry {
  id: string;
  timestamp: string;
  market: 'US' | 'UK' | 'BD';
  action: 'email_sent' | 'whatsapp_queued' | 'cleaned_expired' | 'skipped' | 'error';
  leadName: string;
  leadSlug: string;
  recipient?: string;
  messageId?: string;
  details: string;
  dryRun?: boolean;
}

export interface AutopilotState {
  enabled: boolean;
  dryRun: boolean;
  rotationStep: number; // 0=UK, 1=UK, 2=US, 3=US, 4=BD
  lastRunAt?: string;
  nextRunAt?: string;
  totalRuns: number;
  emailsSent: number;
  whatsappQueued: number;
  cleanedCount: number;
  recentLogs: AutopilotLogEntry[];
}

const ROTATION_SEQUENCE: Array<'UK' | 'US' | 'BD'> = ['UK', 'UK', 'US', 'US', 'BD'];

const DATA_DIR =
  process.env.DATA_DIR ||
  (fs.existsSync('/home/raj/website-lead/data')
    ? '/home/raj/website-lead/data'
    : path.join(process.cwd(), 'data'));

const AUTOPILOT_FILE = path.join(DATA_DIR, 'autopilot.json');

const DEFAULT_STATE: AutopilotState = {
  enabled: true,
  dryRun: process.env.BREVO_DRY_RUN === 'true' || false,
  rotationStep: 0,
  totalRuns: 0,
  emailsSent: 0,
  whatsappQueued: 0,
  cleanedCount: 0,
  recentLogs: [],
};

export class AutopilotService {
  private static getState(): AutopilotState {
    try {
      if (fs.existsSync(AUTOPILOT_FILE)) {
        const raw = fs.readFileSync(AUTOPILOT_FILE, 'utf-8');
        return { ...DEFAULT_STATE, ...JSON.parse(raw) };
      }
    } catch (err) {
      logger.error('Failed to read autopilot state file', err);
    }
    return { ...DEFAULT_STATE };
  }

  private static saveState(state: AutopilotState): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(AUTOPILOT_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to save autopilot state file', err);
    }
  }

  /**
   * Get public status and recent activity logs for dashboard.
   */
  static getStatus(): AutopilotState {
    return this.getState();
  }

  /**
   * Update configuration (e.g. toggle enabled or dry-run mode).
   */
  static updateConfig(updates: Partial<Pick<AutopilotState, 'enabled' | 'dryRun'>>): AutopilotState {
    const state = this.getState();
    if (updates.enabled !== undefined) state.enabled = updates.enabled;
    if (updates.dryRun !== undefined) state.dryRun = updates.dryRun;
    this.saveState(state);
    logger.info('Autopilot configuration updated', updates);
    return state;
  }

  /**
   * Execute 1 hourly cycle:
   * 1. Determine market by rotation sequence (UK -> UK -> US -> US -> BD).
   * 2. Scrape/discover 1 qualified business prospect.
   * 3. Sync & host site immediately on Cloudflare Edge KV.
   * 4. If email exists: Send 1-to-1 cold outreach email via Brevo.
   * 5. If WhatsApp only (no email): Queue for Raj in WhatsApp review queue.
   * 6. Perform 30-day unreplied site cleanup.
   */
  static async runHourlyCycle(): Promise<{
    success: boolean;
    market: 'US' | 'UK' | 'BD';
    action: string;
    lead?: WebsiteLead;
    error?: string;
  }> {
    const state = this.getState();

    if (!state.enabled) {
      logger.info('Autopilot is currently paused. Skipping cycle.');
      return { success: false, market: 'US', action: 'paused', error: 'Autopilot is paused.' };
    }

    const currentMarket = ROTATION_SEQUENCE[state.rotationStep % ROTATION_SEQUENCE.length];
    logger.info('Starting Autopilot hourly cycle', {
      rotationStep: state.rotationStep,
      market: currentMarket,
      dryRun: state.dryRun,
    });

    try {
      // 1. Discover 1 prospect for the target market
      const scanResult = await scanForLeads({ market: currentMarket, count: 1 });
      const newLead = scanResult.leads[0];

      if (!newLead) {
        const errorMsg = `No eligible prospects available in pool for ${currentMarket}.`;
        logger.warn('Autopilot scan found no prospect', { market: currentMarket });
        return { success: false, market: currentMarket, action: 'skipped', error: errorMsg };
      }

      // 2. Ensure preview website is immediately deployed to Cloudflare Edge KV
      await CloudflareEdgeService.deployLeadPreview(newLead);
      logger.info('Autopilot deployed preview site to Cloudflare Edge', {
        slug: newLead.slug,
        market: currentMarket,
      });

      // 3. Routing: Email vs WhatsApp
      const emailContact = newLead.contacts.find((c) => c.channel === 'email')?.value;
      const whatsappContact = newLead.contacts.find((c) => c.channel === 'whatsapp' || c.channel === 'phone')?.value;

      let cycleAction: AutopilotLogEntry['action'] = 'skipped';
      let actionDetails = '';
      let messageId: string | undefined;

      if (emailContact) {
        // Prospect has an email: Send personalized 1-to-1 cold outreach via Brevo
        const draftBody = newLead.outreach?.draft || '';
        const subject = getEmailSubject(newLead);

        const sendResult = await BrevoService.sendTransactionalEmail({
          toEmail: emailContact,
          toName: newLead.name,
          subject,
          textContent: draftBody,
          dryRun: state.dryRun,
        });

        if (sendResult.success) {
          messageId = sendResult.messageId;
          cycleAction = 'email_sent';
          actionDetails = `Automated email sent to ${emailContact}${sendResult.dryRun ? ' [DRY RUN]' : ''}. Message ID: ${messageId}`;

          // Update lead record to 'contacted'
          await LeadRepository.updateLead(newLead.id, {
            lifecycle: 'contacted',
            sales: {
              ...newLead.sales,
              stage: 'contacted',
              nextAction: 'Monitor prospect reply',
              nextActionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            outreach: {
              ...newLead.outreach,
              events: [
                ...(newLead.outreach?.events || []),
                {
                  channel: 'email',
                  type: 'sent',
                  at: new Date().toISOString(),
                  notes: `Autopilot sent cold outreach via Brevo to ${emailContact}. Message ID: ${messageId}${sendResult.dryRun ? ' [DRY RUN]' : ''}`,
                },
              ],
            },
          });

          state.emailsSent += 1;
        } else if (whatsappContact) {
          // If email domain has no mail server, fall back automatically to WhatsApp outreach
          cycleAction = 'whatsapp_queued';
          actionDetails = `Email skipped (${sendResult.error}). Saved to WhatsApp Queue for Raj (${whatsappContact}).`;
          await LeadRepository.updateLead(newLead.id, {
            lifecycle: 'review',
            outreach: {
              ...newLead.outreach,
              recommendedChannel: 'whatsapp',
              events: [
                ...(newLead.outreach?.events || []),
                {
                  channel: 'whatsapp',
                  type: 'drafted',
                  at: new Date().toISOString(),
                  notes: `Autopilot routed to WhatsApp dispatch (${whatsappContact}) because email domain has no MX records`,
                },
              ],
            },
          });
          state.whatsappQueued += 1;
        } else {
          cycleAction = 'error';
          actionDetails = `Failed sending email to ${emailContact}: ${sendResult.error}`;
          logger.error('Autopilot email delivery failure', undefined, { error: sendResult.error });
        }
      } else if (whatsappContact) {
        // Prospect has NO email, but has WhatsApp (e.g. Bangladesh market):
        // Keep in review queue for Raj with WhatsApp Ready status
        cycleAction = 'whatsapp_queued';
        actionDetails = `No email found. Saved to WhatsApp Outreach Queue for Raj (${whatsappContact}).`;

        await LeadRepository.updateLead(newLead.id, {
          lifecycle: 'review',
          outreach: {
            ...newLead.outreach,
            recommendedChannel: 'whatsapp',
            events: [
              ...(newLead.outreach?.events || []),
              {
                channel: 'whatsapp',
                type: 'drafted',
                at: new Date().toISOString(),
                notes: `Autopilot queued for manual WhatsApp dispatch (${whatsappContact})`,
              },
            ],
          },
        });

        state.whatsappQueued += 1;
      }

      // 4. Perform 30-Day Auto-Cleanup of Unreplied Leads
      const cleanedCount = await this.purgeExpiredUnrepliedSites();
      if (cleanedCount > 0) {
        state.cleanedCount += cleanedCount;
      }

      // 5. Update and advance rotation state
      const now = new Date();
      state.rotationStep = (state.rotationStep + 1) % ROTATION_SEQUENCE.length;
      state.lastRunAt = now.toISOString();
      state.nextRunAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      state.totalRuns += 1;

      const logEntry: AutopilotLogEntry = {
        id: `log_${Date.now()}`,
        timestamp: now.toISOString(),
        market: currentMarket,
        action: cycleAction,
        leadName: newLead.name,
        leadSlug: newLead.slug,
        recipient: emailContact || whatsappContact,
        messageId,
        details: actionDetails,
        dryRun: state.dryRun,
      };

      state.recentLogs.unshift(logEntry);
      if (state.recentLogs.length > 50) {
        state.recentLogs = state.recentLogs.slice(0, 50);
      }

      this.saveState(state);

      logger.info('Autopilot hourly cycle completed successfully', {
        market: currentMarket,
        action: cycleAction,
        lead: newLead.name,
      });

      return {
        success: true,
        market: currentMarket,
        action: cycleAction,
        lead: newLead,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown autopilot error';
      logger.error('Autopilot cycle exception', err);
      return {
        success: false,
        market: currentMarket,
        action: 'error',
        error: errorMsg,
      };
    }
  }

  /**
   * 30-Day Retention & Cloudflare Cleanup Policy:
   * Finds leads contacted more than 30 days ago that never replied and never became clients.
   * Removes their static sites from Cloudflare Workers KV and archives them.
   */
  static async purgeExpiredUnrepliedSites(): Promise<number> {
    const leads = await LeadRepository.getAllLeads();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let purgedCount = 0;

    for (const lead of leads) {
      // Never purge clients or leads that replied
      if (lead.lifecycle === 'client' || lead.lifecycle === 'replied' || lead.lifecycle === 'interested') {
        continue;
      }

      // Check if lead was contacted over 30 days ago
      const sentEvent = lead.outreach?.events?.find((e) => e.type === 'sent');
      if (sentEvent?.at) {
        const sentTime = new Date(sentEvent.at).getTime();
        if (sentTime < thirtyDaysAgo && lead.lifecycle === 'contacted') {
          // Remove from Cloudflare Edge KV
          await CloudflareEdgeService.deleteLeadPreview(lead.slug, lead.customer?.customDomain);

          // Archive in local repository
          await LeadRepository.updateLead(lead.id, {
            lifecycle: 'archived',
            outreach: {
              ...lead.outreach,
              events: [
                ...(lead.outreach?.events || []),
                {
                  channel: 'system',
                  type: 'opt_out',
                  at: new Date().toISOString(),
                  notes: 'Autopilot 30-day retention cleanup: Removed unreplied site from Cloudflare Edge KV',
                },
              ],
            },
          });

          purgedCount += 1;
          logger.info('Purged expired 30-day unreplied site from Cloudflare', {
            slug: lead.slug,
            name: lead.name,
          });
        }
      }
    }

    return purgedCount;
  }
}
