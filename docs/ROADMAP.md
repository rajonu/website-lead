# Project Implementation Roadmap

This roadmap breaks down the development of the **Website Lead Engine** into 4 actionable milestones.

---

## 🎯 Milestone 1: Validation & Manual Prototype (Week 1)
> **Objective:** Prove conversion and message response rate with zero automation overhead.

- [x] Define business model and target niches (Barbershops, Clinics, Roofers, Plumbers, Restaurants).
- [x] Create project blueprint, data schemas (`lead.schema.json`), and strategy playbooks.
- [ ] Manually find 30 Google Business Profiles with > 20 reviews and no website.
- [ ] Build 1 master HTML/Tailwind landing page template.
- [ ] Manually populate 10 preview links and send cold WhatsApp/Email pitches.
- [ ] Record response rate, feedback, and objections.

---

## 🏗️ Milestone 2: Multi-Tenant Dynamic Website Engine (Week 2)
> **Objective:** Build the single-codebase rendering engine to generate instant branded landing pages from JSON.

- [ ] Initialize Next.js 15 (App Router) + Tailwind CSS project in this repo.
- [ ] Design 3 distinct responsive industry templates:
  - `Theme 1: Local Services` (Plumbing, Roofing, Electrician, Auto Repair)
  - `Theme 2: Health & Beauty` (Barber, Salon, Spa, Dental Clinic)
  - `Theme 3: Food & Dining` (Pizzeria, Cafe, Bistro, Bakery)
- [ ] Implement dynamic route `/preview/[slug]`.
- [ ] Connect Supabase PostgreSQL database to store and serve lead profiles.
- [ ] Implement OpenGraph (OG) image generation & mobile screenshot automation via Puppeteer.
- [ ] Deploy to Cloudflare Pages with custom domain wildcard support.

---

## 🤖 Milestone 3: Automated Scraping & AI Enrichment Pipeline (Week 3)
> **Objective:** Automate lead extraction from Google Maps and AI copy generation.

- [ ] Write Python / Node.js Google Maps crawler script (or integrate Apify / Outscraper API).
- [ ] Filter logic: `website == null`, `rating >= 4.0`, `reviews >= 20`.
- [ ] Integrate Gemini API (Flash model) for auto-generating:
  - Catchy hero titles and value proposition copy.
  - Tailored service offerings based on category and review keywords.
  - FAQ section addressing common client concerns.
- [ ] Auto-save enriched data to Supabase and trigger preview URL generation.

---

## 🚀 Milestone 4: Outreach Dispatcher & SaaS Custom Domain Provisioning (Week 4)
> **Objective:** Scale outreach safely and automate domain attachment upon client payment.

- [ ] Set up cold email sequence via Instantly.ai / Resend.
- [ ] Configure WhatsApp Cloud API / Baileys bridge for safe, rate-limited messaging.
- [ ] Build basic Admin Dashboard (or Retool / Next.js Admin) to view:
  - Lead pipeline status (`scraped` ➔ `preview_ready` ➔ `contacted` ➔ `converted`).
- [ ] Integrate Stripe / Lemon Squeezy subscription checkout.
- [ ] Integrate Cloudflare for SaaS API for automated custom domain SSL provisioning when client pays.
