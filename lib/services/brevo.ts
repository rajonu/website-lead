import dns from 'dns/promises';
import { logger } from '@/lib/logger';

export interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  textContent: string;
  htmlContent?: string;
  dryRun?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  dryRun?: boolean;
  error?: string;
}

export const SENDER_CONFIG = {
  name: 'Raj Syful',
  email: 'raj@d4f.me',
} as const;


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolves Brevo API key from environment variable.
 * Handles raw API keys (e.g. xkeysib-...), JSON formats, and base64 encoded strings.
 * Never logs or exposes the key.
 */
function resolveBrevoApiKey(): string | null {
  const rawKey = process.env.BREVO_API_KEY;
  if (!rawKey || typeof rawKey !== 'string') {
    return null;
  }

  const trimmed = rawKey.trim();
  if (!trimmed) {
    return null;
  }

  // Raw Brevo v3 key
  if (trimmed.startsWith('xkeysib-')) {
    return trimmed;
  }

  // Raw JSON format: {"api_key": "..."}
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.api_key === 'string') {
        return parsed.api_key.trim();
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Base64 encoded key or JSON
  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
    if (decoded.startsWith('xkeysib-')) {
      return decoded.trim();
    }
    if (decoded.startsWith('{')) {
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed.api_key === 'string') {
        return parsed.api_key.trim();
      }
    }
  } catch {
    // Ignore base64 decode errors
  }

  return trimmed;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderTransactionalEmailHtml(textContent: string): string {
  // 1. Escape HTML special characters
  let safe = textContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Convert dashed divider lines (e.g. ----- or -------) into styled dividers
  safe = safe.replace(/^-{5,}$/gm, '<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 16px 0;" />');

  // 3. Convert markdown links [Label](url) into clickable styled <a> tags
  safe = safe.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 600; text-decoration: underline;">$1</a>'
  );

  // 4. Convert standalone bare URLs (not already in href attributes) into clickable links
  safe = safe.replace(
    /(?<!href=")(https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 600; text-decoration: underline;">$1</a>'
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
    <div style="font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-wrap;">${safe}</div>
  </div>
</body>
</html>`;
}

function sanitizeErrorMessage(msg: string): string {
  // Strip any API keys, tokens, or email addresses that might appear in third-party error traces
  return msg
    .replace(/xkeysib-[a-zA-Z0-9-]+/gi, '[REDACTED_API_KEY]')
    .replace(/ey[a-zA-Z0-9_=+-]{20,}/g, '[REDACTED_TOKEN]')
    .replace(/[a-zA-Z0-9_-]{32,}/g, '[REDACTED_SECRET]');
}

export class BrevoService {
  /**
   * Validates recipient email, subject, and text content
   */
  static validate(params: {
    toEmail: string;
    subject: string;
    textContent: string;
  }): { valid: boolean; error?: string } {
    const { toEmail, subject, textContent } = params;

    if (!toEmail || typeof toEmail !== 'string') {
      return { valid: false, error: 'Recipient email is required.' };
    }

    const trimmedEmail = toEmail.trim();
    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 254) {
      return { valid: false, error: 'Recipient email address format is invalid.' };
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return { valid: false, error: 'Email subject must be at least 3 characters.' };
    }

    if (subject.trim().length > 200) {
      return { valid: false, error: 'Email subject exceeds maximum length (200 characters).' };
    }

    if (!textContent || typeof textContent !== 'string' || textContent.trim().length < 10) {
      return { valid: false, error: 'Email body must be at least 10 characters.' };
    }

    if (textContent.trim().length > 10000) {
      return { valid: false, error: 'Email body exceeds maximum length (10,000 characters).' };
    }

    return { valid: true };
  }

  /**
   * Sends a single transactional email via Brevo API v3.
   * Strictly 1 email per invocation. Never does bulk or automation.
   */
  static async sendTransactionalEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const validation = this.validate({
      toEmail: params.toEmail,
      subject: params.subject,
      textContent: params.textContent,
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const isDryRun =
      params.dryRun !== undefined
        ? params.dryRun
        : process.env.BREVO_DRY_RUN === 'true';


    // In dry-run mode: simulate send safely without calling Brevo API
    if (isDryRun) {
      const mockMessageId = `<dry-run-${Date.now()}@d4f.me>`;
      logger.info('Brevo transactional email simulation [DRY RUN]', {
        to: params.toEmail,
        subject: params.subject,
        messageId: mockMessageId,
      });

      return {
        success: true,
        messageId: mockMessageId,
        dryRun: true,
      };
    }

    // Verify recipient domain has active MX records before sending to prevent bounces
    const domain = params.toEmail.split('@')[1]?.toLowerCase().trim();
    if (domain) {
      try {
        const mxRecords = await dns.resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
          logger.warn('Recipient domain has no active MX records. Aborting send to protect sender reputation.', { domain });
          return {
            success: false,
            error: `Domain "${domain}" has no active mail server (MX records). Contact this prospect via WhatsApp or phone instead.`,
          };
        }
      } catch (err: unknown) {
        logger.warn('DNS MX lookup failed for domain, aborting to prevent bounce', { domain, error: String(err) });
        return {
          success: false,
          error: `Domain "${domain}" does not exist or has no active mail servers. Contact this prospect via WhatsApp or phone instead.`,
        };
      }
    }

    const resolvedKey = resolveBrevoApiKey();
    if (!resolvedKey) {
      logger.error('Brevo API key is missing or not configured');
      return {
        success: false,
        error: 'Email service configuration is missing (BREVO_API_KEY is not set).',
      };
    }

    const htmlContent =
      params.htmlContent || renderTransactionalEmailHtml(params.textContent.trim());


    const payload = {
      sender: {
        name: SENDER_CONFIG.name,
        email: SENDER_CONFIG.email,
      },
      to: [
        {
          email: params.toEmail.trim(),
          ...(params.toName ? { name: params.toName.trim() } : {}),
        },
      ],
      subject: params.subject.trim(),
      textContent: params.textContent.trim(),
      htmlContent,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': resolvedKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        let safeError = 'Email delivery failed.';
        if (res.status === 401) {
          safeError = 'Email service authentication failed. Please verify the configured Brevo API key.';
        } else if (res.status === 402) {
          safeError = 'Email service account quota or credits exceeded.';
        } else if (res.status === 400) {
          const rawMessage = resData?.message || '';
          safeError = rawMessage
            ? `Email service rejected request: ${sanitizeErrorMessage(rawMessage)}`
            : 'Invalid email request parameters.';
        } else {
          safeError = `Email service responded with status ${res.status}.`;
        }

        logger.error('Brevo API delivery error', undefined, {
          status: res.status,
          code: resData?.code,
        });

        return { success: false, error: safeError };
      }

      const messageId = resData?.messageId || `<brevo-${Date.now()}@d4f.me>`;
      logger.info('Brevo transactional email sent successfully', {
        to: params.toEmail,
        messageId,
      });

      return {
        success: true,
        messageId,
        dryRun: false,
      };
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const safeError = isAbort
        ? 'Email service request timed out.'
        : 'Unable to connect to email service provider. Please verify network connectivity.';

      logger.error('Brevo API request exception', err instanceof Error ? err.message : 'Unknown error');
      return { success: false, error: safeError };
    }
  }
}
