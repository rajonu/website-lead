#!/usr/bin/env node
/**
 * Dispatch real live Brevo emails for the 4 previously simulated leads.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Load environment variables
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(ROOT_DIR, envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

function resolveBrevoApiKey() {
  const rawKey = process.env.BREVO_API_KEY;
  if (!rawKey || typeof rawKey !== 'string') return null;
  const trimmed = rawKey.trim();
  if (trimmed.startsWith('xkeysib-')) return trimmed;
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed?.api_key) return parsed.api_key.trim();
    } catch {}
  }
  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
    if (decoded.startsWith('xkeysib-')) return decoded.trim();
    if (decoded.startsWith('{')) {
      const parsed = JSON.parse(decoded);
      if (parsed?.api_key) return parsed.api_key.trim();
    }
  } catch {}
  return null;
}

const apiKey = resolveBrevoApiKey();
if (!apiKey) {
  console.error('❌ Brevo API key could not be resolved!');
  process.exit(1);
}

function renderTransactionalEmailHtml(textContent) {
  let safe = textContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  safe = safe.replace(/^-{5,}$/gm, '<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 16px 0;" />');
  safe = safe.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 600; text-decoration: underline;">$1</a>'
  );
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

const DATA_DIR = path.join(ROOT_DIR, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const AUTOPILOT_FILE = path.join(DATA_DIR, 'autopilot.json');

const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
let autopilotState = fs.existsSync(AUTOPILOT_FILE) ? JSON.parse(fs.readFileSync(AUTOPILOT_FILE, 'utf-8')) : null;

const targetSlugs = [
  'sheffield-premier-emergency-plumber',
  'birmingham-apex-emergency-plumber',
  'austin-vanguard-electrician',
  'orlando-benchmark-roofing',
];

console.log(`Sending live emails for ${targetSlugs.length} simulated prospects via Brevo v3 API...`);

for (const slug of targetSlugs) {
  const lead = leads.find((l) => l.slug === slug);
  if (!lead) {
    console.error(`⚠️ Lead with slug "${slug}" not found in leads.json`);
    continue;
  }

  const toEmail = lead.contacts.find((c) => c.channel === 'email')?.value;
  if (!toEmail) {
    console.error(`⚠️ No email contact found for ${lead.name}`);
    continue;
  }

  const subject = `Website preview for ${lead.name}`;
  const textContent = lead.outreach?.draft || '';
  const htmlContent = renderTransactionalEmailHtml(textContent);

  const payload = {
    sender: {
      name: 'Raj Syful',
      email: 'raj@d4f.me',
    },
    to: [
      {
        email: toEmail.trim(),
        name: lead.name.trim(),
      },
    ],
    subject: subject.trim(),
    textContent: textContent.trim(),
    htmlContent,
  };

  process.stdout.write(`Sending live email to ${lead.name} <${toEmail}>... `);

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.messageId) {
      console.error(`❌ FAILED (HTTP ${res.status}):`, data?.message || 'Unknown Brevo error');
      continue;
    }

    const liveMessageId = data.messageId;
    console.log(`✅ SENT! Message ID: ${liveMessageId}`);

    // Update lead outreach events
    const now = new Date().toISOString();
    lead.lifecycle = 'contacted';
    if (!lead.outreach) lead.outreach = {};
    if (!lead.outreach.events) lead.outreach.events = [];

    // Filter out previous dry-run events for email sent
    lead.outreach.events = lead.outreach.events.filter((e) => !(e.channel === 'email' && e.type === 'sent' && e.notes?.includes('[DRY RUN]')));

    lead.outreach.events.push({
      channel: 'email',
      type: 'sent',
      at: now,
      notes: `Sent transactional email via Brevo to ${toEmail} (Subject: "${subject}"). Message ID: ${liveMessageId}`,
    });

    // Update autopilot log entry if present
    if (autopilotState && autopilotState.recentLogs) {
      const logEntry = autopilotState.recentLogs.find((l) => l.leadSlug === slug && l.action === 'email_sent');
      if (logEntry) {
        logEntry.dryRun = false;
        logEntry.messageId = liveMessageId;
        logEntry.details = `Automated email sent to ${toEmail}. Message ID: ${liveMessageId}`;
        logEntry.timestamp = now;
      }
    }
  } catch (err) {
    console.error(`❌ Network error sending to ${lead.name}:`, err.message);
  }
}

// Save updated files
fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
if (autopilotState) {
  fs.writeFileSync(AUTOPILOT_FILE, JSON.stringify(autopilotState, null, 2), 'utf-8');
}

console.log('✅ Updated data/leads.json and data/autopilot.json with live Brevo delivery details!');
