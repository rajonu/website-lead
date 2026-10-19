#!/usr/bin/env node

/**
 * Autopilot Hourly Cron Runner
 * 
 * Invoked every hour via cron or systemd timer on the Raspberry Pi:
 * 0 * * * * node /home/raj/website-lead/scripts/autopilot-cron.mjs >> /home/raj/website-lead/data/autopilot.log 2>&1
 */

const port = process.env.PORT || '3050';
const endpoint = process.env.AUTOPILOT_URL || `http://127.0.0.1:${port}/api/autopilot/run`;

async function main() {
  const now = new Date().toISOString();
  console.log(`[${now}] 🤖 [Autopilot Cron] Triggering hourly background cycle...`);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Autopilot-Cron/1.0',
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[${now}] ❌ [Autopilot Cron] HTTP ${res.status}: ${text}`);
      process.exit(1);
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      console.error(`[${now}] ❌ [Autopilot Cron] Empty or non-JSON response from server.`);
      process.exit(1);
    }

    if (data.success) {
      const resData = data.result || {};
      console.log(
        `[${now}] ✅ [Autopilot Cron] Cycle succeeded! Market: ${resData.market || 'N/A'} | Action: ${
          resData.action || 'done'
        } | Lead: ${resData.lead?.name || 'N/A'}`
      );
      process.exit(0);
    } else {
      console.warn(
        `[${now}] ⚠️ [Autopilot Cron] Cycle returned unsuccessful: ${data.result?.error || data.error || 'Check logs'}`
      );
      process.exit(0);
    }
  } catch (err) {
    console.error(
      `[${now}] ❌ [Autopilot Cron] Connection failed to ${endpoint}. Is the server active on port ${port}?`,
      err?.message || err
    );
    process.exit(1);
  }
}

main();
