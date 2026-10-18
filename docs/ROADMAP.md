# Website Lead Engine — A-to-Z Project Roadmap

## Goal
Build a simple, pipeline-first system that continuously discovers local businesses likely to benefit from a better website, researches and scores them with AI, creates factual pre-built previews for the strongest opportunities, lets Raj manually approve a very small number of high-quality prospects for personal outreach, converts interested businesses into recurring managed website clients, and supports them through maintenance, retention, referral and expansion.

The system is an internal tool first. It may become a SaaS/product later, but that must not complicate the initial build.

## Operating Principle
Quality over volume. The system may research many businesses, but Phase 1 should recommend only the best 2–5 prospects per day for human review and personal outreach. Do not build a bulk-email machine.

Primary pipeline:
`New Leads → AI Research → Qualified → High Score → Demo Ready → Human Review → Approved → Contacted → Replied → Interested → Client → Maintenance → Retained / Referral / Upsell`

---

## Phase 0 — Market Validation & Experiment Matrix

### Market Track A — United States
- Dallas–Fort Worth: HVAC, plumbers, roofers
- Houston: HVAC, plumbers, roofers
- Orlando: HVAC, plumbers, landscaping / pool-related home services

### Market Track B — United Kingdom
- Manchester: plumbers, electricians, builders / construction trades
- Birmingham: plumbers, electricians, builders / construction trades
- Leeds: building and home-service trades

### Market Track C — Bangladesh (separate local-market strategy)
Bangladesh must be measured as its own market rather than using US/UK pricing, positioning or outreach assumptions.

**Initial geography:** Dhaka first. Expand only after learning from real results.

**Priority niches:**
1. Beauty salon / spa
2. Dental clinics and suitable small/private clinics
3. Interior design / furniture businesses
4. Real-estate agencies/developers
5. Restaurants/cafes with meaningful ordering/reservation/location needs
6. Car workshop/detailing
7. Event/wedding services
8. Established Facebook-first fashion/lifestyle businesses where an owned web presence/catalog could add value

**Bangladesh opportunity profile:** prioritize active businesses with a strong Facebook/social presence, reviews or visible customer activity but weak/no owned website. Do not position the website as a replacement for Facebook. Position it as the business's professional owned conversion hub: own domain + services/catalog + Google/search destination + call/WhatsApp/Messenger + booking/quote/enquiry where relevant.

**Bangladesh scoring adjustments:** allow market-specific scoring weights for social activity, public phone/WhatsApp/Messenger routes, website ownership gap, niche customer value, booking/quote/catalog opportunity, and ability to demonstrate clear improvement. Do not require the same review thresholds or contact patterns used in US/UK.

**Bangladesh outreach:** support Bangla, English or mixed Bangla-English drafts depending on the business. Personal/manual outreach remains the initial model. WhatsApp, Messenger, phone and email may have different practical importance than in US/UK, so channel performance must be measured rather than assumed.

**Bangladesh pricing is independent:** store pricing by market/currency. Do not convert US prices mechanically into BDT. Test local willingness-to-pay using BDT packages and/or setup + monthly maintenance structures. Determine actual numbers from manual sales conversations and retention data before treating any price as standard.

Possible Bangladesh pricing experiments should be configuration, not hard-coded business truth. Compare:
- low-friction setup + monthly managed hosting/support
- higher one-time setup + lower maintenance
- recurring managed packages with domain/hosting/updates/support
- annual package/renewal

Track support burden, domain/API costs, payment collection friction, conversion and retention before selecting the winning local package.

### Validation batches
- Collect/research up to ~100 candidates per city × niche test batch when practical.
- Do not automatically create demos for all candidates.
- Score every candidate first.
- Send only the strongest candidates into demo/review.
- During the initial manual phase, personally contact only approximately 2–5 top prospects per day.

### Winner definition
Do not optimize for reply rate alone. Track:
`researched → qualified → high-score → demo → approved → contacted → replied → interested → paid → 30/60/90-day retained → profit`

Compare paying/retained customers and contribution/profit per 100 researched leads separately by country, city, niche, channel and pricing model.

---

## Phase 1 — Core Platform & Simple Dashboard

### Development/deployment
- Develop on Raj's PC/Mac.
- Keep source in GitHub.
- Initial production/validation deployment may run on Raj's Raspberry Pi using Docker and Cloudflare Tunnel.
- Monitor CPU, RAM, storage and job concurrency carefully.
- Keep migration to a VPS straightforward.
- Production must not depend on Raj's PC/Mac remaining powered on.

### UI rule
Keep the admin UI intentionally simple, mobile-friendly and pipeline-first.

Dashboard answers immediately:
- businesses discovered/researched/qualified today
- best 2–5 recommendations
- demos needing review
- contacted/replied/interested
- clients needing maintenance/attention
- market filter: US / UK / Bangladesh

Pipeline:
`New Leads → AI Research → High Score → Demo Ready → Review → Contacted → Replied → Interested → Client → Maintenance`

Lead cards show score, confidence, concise reasons, market/niche, contact routes, website status, preview status and Approve/Skip.

### Core foundation
- Next.js dashboard + preview renderer
- PostgreSQL/Supabase-compatible persistence
- background job/queue abstraction
- scheduler
- Docker
- environment secrets/configuration
- structured logs/health monitoring
- idempotency/deduplication
- market-specific configuration including currency, language, scoring, outreach and pricing experiments

---

## Phase 2 — Lead Discovery & Provider Abstraction
Do not depend on directly scraping Google Maps pages. Create provider interfaces for approved Places/business-data APIs, licensed providers, manual CSV/JSON and future sources. Capture source/provenance/timestamps.

Discovery inputs: country, city/metro, niche/category, optional area/radius and provider configuration.

Deduplicate using stable provider IDs where available plus normalized business identity/location/contact fields.

---

## Phase 3 — AI Research, Website Audit & Qualification
AI is the intelligence layer, not the source of truth.

Research active/inactive confidence, website state, weaknesses, legitimate reputation/activity signals, category/customer journey, public contact routes, economic/conversion opportunity and provenance.

Use configurable 0–100 scoring. Components can include website opportunity, activity, customer/job value, reputation/activity, contactability, factual assets, conversion opportunity and market/niche fit. Scoring profiles may differ by market.

Never invent services, credentials, awards, prices, reviews or facts. Mark uncertainty and retain provenance. High score never authorizes outreach by itself during validation.

---

## Phase 4 — Preview Website Generator
Generate previews only after qualification or manual request. Requirements: mobile-first, fast, professional, reusable, factual, niche-appropriate CTA, clear preview state.

Template families initially:
1. Home & Local Services
2. Construction & Trades
3. Bangladesh Local Business / Social-to-Web conversion template family, with niche variants only as validated

Use structured lead/site data rather than separate source code per lead. Generate shareable preview and optional screenshot.

---

## Phase 5 — Human QA & Daily Recommendation Queue
Research can run broadly; surface only strongest opportunities. Show business summary, score/confidence, recommendation reasons, website audit, evidence, contacts, preview, outreach draft, Approve, Skip with reason and Hold.

---

## Phase 6 — Personal Outreach, Not Bulk Outreach
Raj acts as a real developer contacting a few carefully selected businesses personally.

International initial identity can use a dedicated personal-style mailbox on `d4f.me` such as `raj@d4f.me` with proper email authentication. Bangladesh may use the channel/language that best fits each business while retaining human approval.

Channels supported generically: email, publicly offered business WhatsApp, manual phone, LinkedIn, Facebook/Instagram business DM, contact form, and SMS where appropriate.

Workflow:
`Recommended → Human approves → Draft → Human reviews/edits → Send/manual send → Log → Follow-up reminder → Reply → Sales`

Maintain suppression/opt-out globally.

---

## Phase 7 — Reply, Sales & Conversion CRM
Lightweight stages: contacted, replied, interested, needs changes, proposal/pricing, won, lost, follow-up later. Record objections, requested edits, quoted market-specific plan/price/currency, next action and lost reason.

Conversion:
`Preview → Interested → Corrections → Approval/checkout → Domain → Production → Onboarding`

---

## Phase 8 — Market-Specific Pricing Experiments & Billing
Never assume universal pricing.

**US/UK hypotheses:** approximately $49/$99/$149-equivalent tiers, annual discounts and setup-fee experiments may be tested; none is considered proven.

**Bangladesh:** separate BDT pricing experiments. Do not derive price by FX conversion. Test local setup/monthly/annual structures from real conversations and willingness-to-pay.

Pricing configuration must support country/market, currency, setup fee, recurring amount, billing interval, included support/edits, domain treatment and experiment cohort.

Track domain, hosting, API, outreach, payment fees, support labor, refunds/taxes/fees, contribution margin and retention.

Billing integration follows manual willingness-to-pay validation.

---

## Phase 9 — Client Provisioning & Production Sites
Validate business data, connect domain, provision SSL, publish approved version, create customer state, record billing, onboard client and preserve useful version history. Keep preview and production states distinct.

---

## Phase 10 — Maintenance & Retention
Cover uptime/SSL/hosting, backups/versioning, security/platform updates, defined edits, form/contact health, domain renewal, analytics/performance summary, payment issues and plan-based improvements.

Track 30/60/90-day retention, logo/revenue churn, support time, failed payments, upgrades, referrals and account health by market.

---

## Phase 11 — Referral & Expansion
After demonstrable value: referrals/testimonials, additional pages, booking/quote workflows, locations, business email, content/analytics and clearly scoped local-search/conversion work.

---

## Phase 12 — Controlled Automation
Daily automation may discover, dedupe, research, audit, score, generate previews for top candidates, place best 2–5 in Raj's queue, draft outreach, wait for approval, and schedule follow-up. Automate further only when quality/compliance/business metrics justify it.

---

## Phase 13 — Optimization & Possible SaaS
Optimize city × niche × country performance, scoring weights, no-site vs weak-site, templates, channels/languages, message/CTA, cadence, pricing, acquisition cost, contribution margin, retention and support load. Consider multi-user SaaS only after the internal loop works reliably.

---

## Data/Schema Requirements
Support identity, geography/category, market/currency/language profile, provenance, website audit, public contacts, activity signals, AI research, qualification, assets, generated content separated from facts, preview versions, human review, outreach/suppression, replies/sales, market-specific pricing quote, customer/subscription, domain/deployment, maintenance/account health, funnel timestamps and audit history.

---

## Guardrails
Human approval during validation; no fabricated facts or implied endorsement; respect provider/platform and country/channel rules; opt-out/suppression; secure secrets; rate limits; safe retries/idempotency; provenance/auditability; independently disableable automation.

---

## Definition of MVP Success
Raj can configure a country/city/niche, let the system discover/research/dedupe/score, see a few best recommendations, understand why, review a factual preview, approve/edit personal outreach, track replies, quote the correct market-specific pricing, convert a prospect, and manage maintenance/retention in the same simple application.

That full business loop is the goal.