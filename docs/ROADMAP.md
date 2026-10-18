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

### Initial markets
Start with two markets so results can be compared without spreading the project too thin.

**United States**
- Dallas–Fort Worth: HVAC, plumbers, roofers
- Houston: HVAC, plumbers, roofers
- Orlando: HVAC, plumbers, landscaping / pool-related home services

**United Kingdom**
- Manchester: plumbers, electricians, builders / construction trades
- Birmingham: plumbers, electricians, builders / construction trades
- Leeds: building and home-service trades

These are test hypotheses, not permanent market decisions. The winning market/niche must be determined from our own funnel data.

### Validation batches
- Collect/research up to ~100 candidates per city × niche test batch when practical.
- Do not automatically create demos for all candidates.
- Score every candidate first.
- Send only the strongest candidates into demo/review.
- During the initial manual phase, personally contact only approximately 2–5 top prospects per day.

### Winner definition
Do not optimize for reply rate alone. Track the complete funnel:

`researched → qualified → high-score → demo → approved → contacted → replied → interested → paid → 30/60/90-day retained → profit`

Primary comparison metric: paying and retained customers plus contribution/profit per 100 researched leads.

---

## Phase 1 — Core Platform & Simple Dashboard

### Development/deployment
- Develop on Raj's PC/Mac.
- Keep source in GitHub.
- Initial production/validation deployment may run on Raj's Raspberry Pi using Docker and Cloudflare Tunnel.
- The Pi already hosts other services, so monitor CPU, RAM, storage and job concurrency carefully.
- Design the application so migration to a VPS is straightforward when workload or customer importance increases.
- Production must not depend on Raj's PC/Mac remaining powered on.

### UI rule
The admin UI must stay intentionally simple and mobile-friendly. Avoid enterprise-CRM complexity.

Dashboard should answer immediately:
- How many businesses were discovered today?
- How many were researched?
- How many qualified?
- Which 2–5 are recommended today?
- Which demos need review?
- Who has been contacted?
- Who replied/is interested?
- Which clients need maintenance or attention?

Recommended pipeline board:

`New Leads → AI Research → High Score → Demo Ready → Review → Contacted → Replied → Interested → Client → Maintenance`

Each high-score lead card should show the score, confidence, concise reasons, contact routes, website status, preview status and `Approve` / `Skip` actions.

### Core technical foundation
- Next.js application for dashboard + preview renderer.
- PostgreSQL/Supabase-compatible persistence layer.
- Background job/queue abstraction.
- Scheduler for discovery/research jobs.
- Dockerized deployment.
- Environment-based configuration and secrets.
- Structured logs and basic health monitoring.
- Idempotent jobs and deduplication.

---

## Phase 2 — Lead Discovery & Provider Abstraction

Do not make the project dependent on directly scraping Google Maps pages.

Create a provider interface so the same pipeline can accept:
- an approved Places/business-data API,
- licensed third-party providers,
- manually imported CSV/JSON,
- future sources without changing downstream logic.

For every discovered business capture source/provenance and timestamps.

### Discovery inputs
- country
- city/metro
- niche/category
- optional search radius/area
- provider configuration

### Deduplication
Use stable provider IDs where available plus normalized business identity/location/contact fields. Never create a new prospect every time the same business appears in another search.

---

## Phase 3 — AI Research, Website Audit & Qualification

AI is the intelligence layer, not the source of truth.

Research should determine:
- active/inactive confidence
- website status: none / broken / weak / adequate / strong
- website weaknesses when present
- rating/review/activity signals when legitimately available
- business category and likely customer journey
- publicly listed email, phone, WhatsApp and social/contact routes
- whether calls, bookings, quotes, visits or enquiries are economically meaningful
- what a better web presence could concretely improve
- source/provenance for factual claims

### Qualification score
Use a configurable 0–100 score rather than a fixed rule such as `reviews >= 20`.

Possible components:
- website opportunity / weakness
- evidence the business is active
- service/customer value
- reputation/activity signals
- reachable public business contact
- quality of available factual content/assets
- clear conversion opportunity
- market/niche fit

Store both the numeric score and human-readable reasons. Store confidence and penalties as well.

### AI safety/data rules
- Never invent services, credentials, awards, prices, reviews or business facts.
- Distinguish sourced facts from AI-generated marketing presentation.
- Mark uncertain data explicitly.
- Keep provenance for important facts.
- High score alone never authorizes outreach during Phase 1.

---

## Phase 4 — Preview Website Generator

Generate previews only for leads that pass the configured qualification threshold or are manually requested.

### Preview requirements
- mobile-first
- fast loading
- professional but niche-appropriate
- reusable templates
- factual content only
- strong call/quote/booking/contact CTA based on niche
- clear preview state before client authorization

### Initial template families
1. Home & Local Services — plumbing, HVAC, roofing, electrical, landscaping, pool services.
2. Construction & Trades — builders and related UK trades.
3. Additional templates only after data justifies expanding niches.

The renderer should use structured lead/site data, not generate one-off source code per lead.

Generate a shareable preview URL and optionally a screenshot/thumbnail for outreach/review.

---

## Phase 5 — Human QA & Daily Recommendation Queue

This is a core feature, not temporary UI.

Each day the system can research a larger pool but should surface only the strongest opportunities.

For each recommended prospect show:
- business summary
- score + confidence
- exactly why it is recommended
- website audit summary
- evidence/sources
- contact options
- generated preview
- suggested personal outreach message
- Approve
- Skip / Reject with reason
- Hold / revisit later

Rejection reasons should feed future scoring experiments.

---

## Phase 6 — Personal Outreach, Not Bulk Outreach

### Phase 1 sender model
Raj acts as a real web developer contacting a small number of carefully selected businesses personally.

Preferred initial identity:
- dedicated personal-style mailbox on `d4f.me`, e.g. `raj@d4f.me`
- proper SPF/DKIM/DMARC configuration
- real signature/identity
- low daily volume

Do not build the initial product around mass cold-email infrastructure.

### Channel strategy
Primary: personal email.

Secondary, only where appropriate and compliant:
- publicly offered business WhatsApp
- manual phone call
- LinkedIn
- Facebook/Instagram business DM
- contact form
- SMS where legally/operationally appropriate

The application should store available channels and recommend an appropriate channel; it should not blindly contact the same prospect everywhere.

### Outreach workflow
`Recommended → Human approves → Message draft → Human reviews/edits → Send/manual send → Log event → Follow-up reminder → Reply → Sales stage`

Initial target: approximately 2–5 excellent personal contacts/day, not bulk campaigns.

Maintain suppression/opt-out state and stop outreach when requested.

---

## Phase 7 — Reply, Sales & Conversion CRM

Keep CRM intentionally lightweight.

Sales stages:
- contacted
- replied
- interested
- needs changes
- proposal/pricing
- won
- lost
- follow-up later

Record:
- reply sentiment/outcome
- objections
- requested demo edits
- quoted plan/price
- next action/date
- lost reason

Conversion flow:

`Preview → Interested reply → Requested corrections → Approval/checkout → Domain → Production publish → Onboarding`

---

## Phase 8 — Pricing Experiments & Billing

Do not assume one universal price.

Initial price points to test as hypotheses may include approximately:
- $49/month
- $99/month
- $149/month
- annual discounts
- setup fee vs no setup fee

Package by recurring value, not merely page count.

Track direct costs including domain, hosting, APIs, outreach, payment fees, support labor, refunds and taxes/fees where applicable.

Billing/provider integration comes after manual willingness-to-pay validation.

---

## Phase 9 — Client Provisioning & Production Sites

After conversion:
- validate/correct all business data
- attach/connect client domain
- provision SSL
- publish approved version
- create customer/account state
- record billing status
- send onboarding/welcome information
- preserve version/history where practical

Preview and client production states must be distinct.

---

## Phase 10 — Maintenance & Retention

Recurring revenue requires visible recurring value.

Client operations should cover:
- uptime/SSL/hosting health
- backups/versioning
- security/platform updates
- defined content-edit allowance
- contact/form monitoring
- domain renewal tracking
- analytics/performance summary
- failed payment follow-up
- periodic conversion/content improvements by plan

Dashboard should surface accounts requiring attention rather than hiding them in a generic customer list.

Track:
- 30/60/90-day retention
- logo churn
- revenue churn
- support time per account
- failed payments
- upgrades
- referrals
- customer health

---

## Phase 11 — Referral & Expansion

After demonstrable value:
- request testimonial/referral
- additional pages
- quote/booking workflows
- multiple locations
- business email
- content/analytics services
- clearly scoped local-search/conversion improvements

Never force irrelevant upsells.

---

## Phase 12 — Controlled Automation

Automation should increase only after the manual loop produces trustworthy data.

Potential daily automation:
1. Run configured city × niche discovery.
2. Deduplicate.
3. Research candidates.
4. Audit websites.
5. Score/rank.
6. Generate previews for top candidates according to policy.
7. Put best 2–5 in Raj's approval queue.
8. Generate draft outreach.
9. Wait for human approval before sending/contacting.
10. Schedule follow-up reminders and update pipeline events.

Later, specific stages may become automatic only when quality, compliance and business metrics justify it.

---

## Phase 13 — Optimization & Possible SaaS Product

Once there is enough real data, optimize:
- city × niche performance
- scoring weights
- no-site vs weak-site conversion
- preview template
- outreach channel
- message/CTA
- follow-up cadence
- pricing/package
- acquisition cost
- contribution margin
- churn/retention
- support load

Only after the internal system works reliably should we consider multi-user/agency/SaaS features.

---

## Data/Schema Requirements

The schema must support at minimum:
- lead identity and normalized business identity
- geography/category
- source/provider/provenance
- website audit
- public contact methods
- rating/review/activity signals
- AI research payload
- qualification score, confidence, reasons and penalties
- assets/photos with provenance
- generated site content separated from factual source data
- preview versions/status
- human review decision
- outreach recommendation/channel
- outreach events and suppression state
- replies/objections/sales stage
- customer/subscription state
- domain/deployment state
- maintenance/account-health state
- analytics/funnel timestamps
- audit history

See `schemas/lead.schema.json`; keep it synchronized with implementation.

---

## Required System Guardrails

- Human approval before outreach during validation.
- No fabricated business facts.
- No implied business endorsement before authorization.
- Respect provider/platform terms and country/channel marketing rules.
- Respect opt-outs and suppression.
- Never expose secrets in frontend/logs.
- Rate-limit expensive/external jobs.
- Retry safely and idempotently.
- Maintain provenance and auditability.
- Make every automated stage independently disableable.

---

## Definition of MVP Success

The MVP is successful when Raj can:
1. Configure a market/niche search.
2. Let the system discover, research, deduplicate and score prospects.
3. Open one simple dashboard and see the best recommended leads.
4. Understand why each lead was selected.
5. Review a factual pre-built preview.
6. Approve/edit a personal outreach message.
7. Contact a few high-quality prospects from his real developer identity.
8. Track replies and move prospects through the pipeline.
9. Convert a prospect to a managed production site.
10. See ongoing maintenance/retention actions in the same system.

That end-to-end loop is the goal. Everything else is secondary until it works.