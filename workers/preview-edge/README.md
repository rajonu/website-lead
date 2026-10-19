# Website Lead — Cloudflare Edge Preview Worker

This standalone Cloudflare Worker serves public pre-built website previews on `live.d4f.me/*` and custom client domains directly from Cloudflare Edge (Workers KV).

## Architecture Highlights
- **100% Decoupled Uptime:** Previews remain accessible even if your Raspberry Pi is restarted, powered down, or offline.
- **Sub-20ms Response Time:** Sites are cached across Cloudflare's 300+ worldwide edge locations.
- **Automatic Fallback:** If a preview hasn't been uploaded to KV yet, the Worker gracefully proxies the request back to the Raspberry Pi tunnel (`https://lead.d4f.me/preview/:slug`), so nothing is ever broken.
- **Custom Client Domains:** Supports mapping paying client domains (e.g. `apexcomfortdallas.com`) directly to their generated site via KV (`domain:<host>`).

---

## 1-Time Setup & Deployment

### Step 1: Install Wrangler (if not already installed)
```bash
npm install -g wrangler
# or run with npx inside this folder
```

### Step 2: Log in to Cloudflare
```bash
npx wrangler login
```

### Step 3: Create Cloudflare Workers KV Namespace
```bash
npx wrangler kv:namespace create PREVIEWS_KV
```
Copy the returned `id` (e.g., `4a7b3c2d1e...`) and paste it into `wrangler.jsonc`:
```jsonc
"kv_namespaces": [
  {
    "binding": "PREVIEWS_KV",
    "id": "<PASTE_KV_ID_HERE>"
  }
]
```

### Step 4: Deploy the Worker
```bash
npx wrangler deploy
```

### Step 5: Attach Domain in Cloudflare Dashboard
1. Go to **Cloudflare Dashboard** -> **Workers & Pages** -> **website-lead-preview-edge**.
2. Go to **Settings** -> **Domains & Routes** -> **Add Custom Domain**.
3. Add `live.d4f.me` (or configure a route: `live.d4f.me/*`).

---

## Syncing Previews from Raspberry Pi

In your main app `.env.local` (on Mac and Raspberry Pi), set:
```bash
CLOUDFLARE_API_TOKEN="your-api-token-with-kv-write-permission"
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
CLOUDFLARE_KV_NAMESPACE_ID="your-kv-namespace-id"
CLOUDFLARE_EDGE_DOMAIN="live.d4f.me"
```

Once configured, the Raspberry Pi will automatically push generated sites to Cloudflare Edge whenever you click **"Deploy to Edge"** in the Dashboard, or via CLI:
```bash
npm run deploy:edge
```
