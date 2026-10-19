# Cloudflare Hybrid Edge Architecture & Setup Guide

This guide details the **Safe Hybrid Cloudflare Architecture** implemented for `website-lead`.

---

## 1. Architectural Overview

```text
                               PUBLIC INTERNET
                                      |
                                      v
                             Cloudflare DNS / CDN
                                      |
                 +--------------------+--------------------+
                 |                                         |
                 v (live.d4f.me & client domains)          v (lead.d4f.me)
     +--------------------------------+         +--------------------+
     |    Cloudflare Edge Worker      |         | Cloudflare Tunnel  |
     |        + Workers KV            |         | (Protected Ingress)|
     |  (Self-Contained Preview Sites)|         +--------------------+
     +--------------------------------+                    |
                 ^                                         v
                 |                               +--------------------+
                 | (REST API Edge Publish)       |    Raspberry Pi    |
                 +-------------------------------| (Main Engine / DB) |
                                                 | - Dashboard (3050) |
                                                 | - Discovery Engine |
                                                 | - Brevo API Email  |
                                                 | - Persistent /data |
                                                 +--------------------+
```

### Key Principles
1. **Raspberry Pi is the Private Control Center:**
   - Holds administrative dashboard (`lead.d4f.me`), authentication cookie (`167570`), lead discovery, Brevo email sending, and persistent data (`data/leads.json`).
   - Remains behind Cloudflare Tunnel with zero open inbound router ports.
2. **Cloudflare Edge is the Public Showcase:**
   - Previews (`live.d4f.me/:slug`) and client customer websites are served directly from Cloudflare Edge KV.
   - **Zero Uptime Dependency on Pi:** If the Raspberry Pi restarts, is turned off, or home internet blips, public visitors can still browse pre-built sites with sub-20ms load times.
3. **Automatic Dual-Mode Fallback:**
   - The Cloudflare Edge Worker checks Workers KV first.
   - If a preview hasn't been uploaded to KV yet, it transparently proxies the request back to the Pi (`https://lead.d4f.me/preview/:slug`), so links never 404 during migration.

---

## 2. Setting Up Cloudflare (5 Minutes)

### Step 1: Create a Cloudflare Workers KV Namespace
In the Cloudflare Dashboard:
1. Navigate to **Workers & Pages** -> **KV**.
2. Click **Create Namespace**. Name it: `WEBSITE_LEAD_PREVIEWS`.
3. Note the returned **Namespace ID** (e.g. `a1b2c3d4e5f6...`).

*Or via Wrangler CLI:*
```bash
npx wrangler kv:namespace create PREVIEWS_KV
```

### Step 2: Create a Scoped Cloudflare API Token
1. In Cloudflare Dashboard, go to **My Profile** -> **API Tokens** -> **Create Token**.
2. Use **Custom Token** and grant:
   - `Account` -> `Workers KV Storage` -> **Edit**
   - `Account` -> `Workers Scripts` -> **Edit**
3. Set Account Resources to **Include: All accounts** (or your specific account).
4. Save and copy the generated token.

### Step 3: Deploy the Edge Worker
Inside the repository:
```bash
cd workers/preview-edge
```
Update `wrangler.jsonc` with your KV Namespace ID:
```jsonc
  "kv_namespaces": [
    {
      "binding": "PREVIEWS_KV",
      "id": "YOUR_KV_NAMESPACE_ID"
    }
  ]
```
Deploy to Cloudflare Edge:
```bash
npx wrangler deploy
```

### Step 4: Map `live.d4f.me` to the Worker
1. Go to **Cloudflare Dashboard** -> **Workers & Pages** -> select `website-lead-preview-edge`.
2. Go to **Settings** -> **Domains & Routes** -> **Add Custom Domain**.
3. Enter `live.d4f.me`.
4. Cloudflare automatically configures edge routing and SSL.

---

## 3. Configuring the Raspberry Pi

Add the credentials to `/home/raj/website-lead/.env.local` (and your local `.env.local` on Mac):

```bash
# Cloudflare Edge Sync
CLOUDFLARE_API_TOKEN="your-api-token"
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_KV_NAMESPACE_ID="your-kv-namespace-id"
CLOUDFLARE_EDGE_DOMAIN="live.d4f.me"
```

---

## 4. How Previews are Published

### Option A: From the Dashboard (1-Click)
In the **Daily Recommendations Queue**, **Pipeline**, or **Clients Manager**:
- Click **"Deploy to Edge"** or **"Sync to Cloudflare"** on any lead or client card.
- The Pi renders the self-contained static HTML and pushes it to Cloudflare KV.
- A badge will show: `Edge Ready`.

### Option B: Batch CLI Sync
Run the batch publisher script anytime:
```bash
npm run deploy:edge
```
This iterates over all active leads, creates local static backups in `data/exported-sites/`, and syncs them directly to Cloudflare Edge KV.

---

## 5. Verification & Testing

### Verification Test: Pi Offline Scenario
1. Deploy a preview to edge (e.g. `example-comfort-hvac-dallas`).
2. Verify it loads in your browser at `https://live.d4f.me/example-comfort-hvac-dallas`.
3. Temporarily stop the service on the Pi:
   ```bash
   sudo systemctl stop website-lead.service
   ```
4. Hard-refresh `https://live.d4f.me/example-comfort-hvac-dallas` on your phone or computer.
5. **Result:** The site continues loading with 100% uptime and instant speed because it is served entirely from Cloudflare Edge KV!
6. Restart the service on the Pi:
   ```bash
   sudo systemctl start website-lead.service
   ```

---

## 6. Rollback Plan

If you ever want to revert back to serving previews directly from the Raspberry Pi:
1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** -> `website-lead-preview-edge`.
2. Disable or remove the route for `live.d4f.me`.
3. In DNS / Cloudflare Tunnel, ensure `live.d4f.me` routes to your tunnel `website-lead` ingress.
4. Because the Pi's internal Next.js preview route (`app/preview/[slug]/page.tsx`) was preserved and never deleted, traffic immediately reverts to the Pi with 0 downtime.
