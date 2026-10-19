import fs from 'fs';
import path from 'path';
import { WebsiteLead, CloudflareDeploymentData } from '@/lib/types/lead';
import { renderPublicSiteHtml } from './site-renderer';
import { logger } from '@/lib/logger';

export interface CloudflareDeployResult {
  success: boolean;
  edgeUrl: string;
  mode: 'cloudflare_edge' | 'local_export';
  deployedAt: string;
  error?: string;
  note?: string;
}

const DATA_DIR =
  process.env.DATA_DIR ||
  (fs.existsSync('/home/raj/website-lead/data')
    ? '/home/raj/website-lead/data'
    : path.join(process.cwd(), 'data'));

const EXPORTS_DIR = path.join(DATA_DIR, 'exported-sites');

function ensureExportsDir(): void {
  try {
    if (!fs.existsSync(EXPORTS_DIR)) {
      fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    }
  } catch (err) {
    logger.error('Failed to create exported-sites directory', err);
  }
}

export class CloudflareEdgeService {
  private static getCredentials() {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim() || '';
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || '';
    const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID?.trim() || '';
    const edgeDomain = process.env.CLOUDFLARE_EDGE_DOMAIN?.trim() || 'live.d4f.me';

    return {
      apiToken,
      accountId,
      namespaceId,
      edgeDomain,
      isConfigured: Boolean(apiToken && accountId && namespaceId),
    };
  }

  /**
   * Check if Cloudflare Edge deployment credentials are set up.
   */
  static isConfigured(): boolean {
    return this.getCredentials().isConfigured;
  }

  /**
   * Test Cloudflare credentials and KV connection.
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const { apiToken, accountId, namespaceId, isConfigured } = this.getCredentials();
    if (!isConfigured) {
      return {
        success: false,
        message: 'Cloudflare credentials missing. Set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_KV_NAMESPACE_ID in .env.local',
      };
    }

    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys?limit=1`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        return {
          success: false,
          message: `Cloudflare API error (${res.status}): ${data?.errors?.[0]?.message || 'Authentication failed'}`,
        };
      }

      return {
        success: true,
        message: 'Successfully connected to Cloudflare Workers KV namespace!',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error communicating with Cloudflare',
      };
    }
  }

  /**
   * Deploy or sync a lead's website to Cloudflare Edge KV and local static export.
   * Completely safe and non-blocking: always produces a local HTML export even if Cloudflare is offline.
   */
  static async deployLeadPreview(lead: WebsiteLead): Promise<CloudflareDeployResult> {
    ensureExportsDir();
    const html = renderPublicSiteHtml(lead);
    const now = new Date().toISOString();

    // 1. Always save a copy locally in data/exported-sites/<slug>.html
    const localExportPath = path.join(EXPORTS_DIR, `${lead.slug}.html`);
    try {
      fs.writeFileSync(localExportPath, html, 'utf-8');
      logger.info('Saved static HTML export locally', { slug: lead.slug, path: localExportPath });
    } catch (err) {
      logger.error('Failed writing local HTML export', err);
    }

    const { apiToken, accountId, namespaceId, edgeDomain, isConfigured } = this.getCredentials();

    // 2. If Cloudflare credentials are not set, return graceful local-only result
    if (!isConfigured) {
      return {
        success: true,
        mode: 'local_export',
        edgeUrl: `/preview/${lead.slug}`,
        deployedAt: now,
        note: 'Saved locally as static HTML. Configure Cloudflare credentials in .env.local for automatic global Edge deployment.',
      };
    }

    // 3. Deploy to Cloudflare Workers KV via Cloudflare REST API
    try {
      // Key format: site:<slug>
      const kvKey = `site:${lead.slug}`;
      const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(kvKey)}`;

      const res = await fetch(kvUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: html,
      });

      const resJson = await res.json().catch(() => null);

      if (!res.ok || (resJson && !resJson.success)) {
        const errorMsg = resJson?.errors?.[0]?.message || `HTTP ${res.status}`;
        logger.error('Failed publishing to Cloudflare KV', undefined, { slug: lead.slug, error: errorMsg });
        return {
          success: false,
          mode: 'local_export',
          edgeUrl: `/preview/${lead.slug}`,
          deployedAt: now,
          error: `Cloudflare KV deployment error: ${errorMsg}`,
        };
      }

      // If lead has a custom domain, also map domain:<customDomain> -> lead.slug
      const customDomain = lead.customer?.customDomain?.trim();
      if (customDomain) {
        const domainKey = `domain:${customDomain.toLowerCase()}`;
        const domainUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(domainKey)}`;

        await fetch(domainUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'text/plain',
          },
          body: lead.slug,
        }).catch((err) => logger.warn('Failed setting custom domain KV pointer', { error: String(err) }));
      }

      const edgeUrl = `https://${edgeDomain}/${lead.slug}`;
      logger.info('Lead preview successfully deployed to Cloudflare Edge', {
        slug: lead.slug,
        edgeUrl,
      });

      return {
        success: true,
        mode: 'cloudflare_edge',
        edgeUrl,
        deployedAt: now,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown network error';
      logger.error('Cloudflare Edge deployment exception', err);
      return {
        success: false,
        mode: 'local_export',
        edgeUrl: `/preview/${lead.slug}`,
        deployedAt: now,
        error: `Cloudflare Edge sync error: ${errorMsg}`,
      };
    }
  }

  /**
   * Remove a site from Cloudflare Edge KV and local exports.
   */
  static async deleteLeadPreview(slug: string, customDomain?: string): Promise<boolean> {
    const { apiToken, accountId, namespaceId, isConfigured } = this.getCredentials();

    // Remove local export
    try {
      const localExportPath = path.join(EXPORTS_DIR, `${slug}.html`);
      if (fs.existsSync(localExportPath)) {
        fs.unlinkSync(localExportPath);
      }
    } catch (err) {
      logger.warn('Failed deleting local HTML export', { error: String(err) });
    }

    if (!isConfigured) return true;

    try {
      const kvKey = `site:${slug}`;
      const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(kvKey)}`;

      await fetch(kvUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiToken}` },
      });

      if (customDomain) {
        const domainKey = `domain:${customDomain.toLowerCase()}`;
        const domainUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(domainKey)}`;
        await fetch(domainUrl, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${apiToken}` },
        });
      }

      return true;
    } catch (err) {
      logger.error('Error removing key from Cloudflare KV', err);
      return false;
    }
  }
}
