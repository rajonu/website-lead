# 🌐 Website Lead Engine — Acquisition, Demo & Retention Blueprint

> Find qualified local businesses without strong websites, create useful pre-built previews, reach decision-makers with value-first outreach, convert them to recurring plans, and retain them through measurable ongoing service.

## 1. Core Business Model

This project is a micro-agency / SaaS-assisted service pipeline. The product is not simply “a website”; the recurring offer is a managed web presence: hosting, SSL, domain assistance, edits, lead/contact features, analytics, reliability and ongoing improvements.

Primary workflow:

```mermaid
flowchart LR
 A[Lead Discovery] --> B[Qualification]
 B --> C[Data Enrichment]
 C --> D[Pre-built Preview]
 D --> E[Human QA]
 E --> F[Personalized Outreach]
 F --> G[Follow-up]
 G --> H[Conversion]
 H --> I[Domain + Production Site]
 I --> J[Maintenance + Retention]
 J --> K[Referral / Upsell]
```

## 2. Lead Qualification — Quality Before Volume

Prioritize businesses where a website can plausibly create business value.

Store and score:
- business name, category, city/country and Google Business Profile URL
- rating and review count
- website status: none / broken / weak / adequate
- phone and publicly listed contact channels
- business hours, services, photos and review themes
- likely decision-maker/contact route when legitimately available
- lead source and timestamp
- outreach consent/suppression status
- qualification score and reason

Suggested scoring signals:
- no website or clearly weak/outdated website
- healthy review volume and recent activity
- service category where calls, bookings, quotes or visits matter
- usable business photos/content
- reachable public business contact
- evidence the business is active

Do not treat an arbitrary review threshold as universal. Test thresholds by niche and geography.

## 3. AI Enrichment & Preview Generation

AI may generate:
- concise hero proposition
- services summary/cards
- review/theme summaries
- FAQ drafts
- calls-to-action
- contact/location sections
- SEO title/description drafts

Rules:
- never invent services, awards, prices, testimonials or credentials
- retain provenance for factual business data
- flag uncertain generated claims for human review
- run a QA gate before outreach

Preview URLs can follow a structure such as `preview.example.com/{slug}`. The demo should be fast, mobile-first and clearly presented as a preview until accepted by the business.

## 4. Outreach System

The outreach strategy is “show useful work first,” not generic bulk pitching.

Sequence to test:
1. Initial personalized message: identify the business and explain that a preview was prepared.
2. Provide the preview link and one concrete reason it may help (calls, bookings, quote requests, directions, menu/services, etc.).
3. Low-friction CTA: ask whether they want it published/customized rather than forcing a meeting.
4. Follow-up 1 after a tested delay.
5. Follow-up 2 with a useful observation or improvement, not merely “checking in.”
6. Stop after the configured sequence and honor opt-outs/suppression.

Channels can include compliant cold email, WhatsApp where appropriate/allowed, phone/manual follow-up, and local referrals/partnerships. Channel rules, consent requirements and anti-spam/privacy obligations must be checked for each target country before scaling.

Track by campaign/channel:
- delivered
- preview visits
- replies
- positive replies
- qualified conversations
- conversions
- unsubscribes/complaints
- acquisition cost
- time-to-close

No response-rate claim should be presented as fact until our own campaign data supports it.

## 5. Pricing — Test, Don’t Guess

Start with simple packages and validate willingness-to-pay by niche and market.

### Starter
- one-page managed site
- SSL + hosting
- contact/call/WhatsApp CTA
- basic edits/support allowance

### Growth
- everything in Starter
- custom domain management/assistance
- analytics/reporting
- additional sections or conversion features
- higher edit/support allowance

### Premium / Local Growth
- everything in Growth
- booking/quote integrations where applicable
- ongoing conversion/SEO improvements within a clearly defined scope
- priority support

Test monthly vs annual billing and optional setup fees. Do not hard-code `$19–$29`, margin percentages, or cost assumptions as universal truths. Maintain a cost model containing domain, infrastructure, API/enrichment, outreach, payment processing, support labor, refunds and taxes/fees where applicable.

Core unit economics:

`Gross Margin = Revenue - Direct Service Costs`

`Contribution Margin = Revenue - Direct Service Costs - Variable Support/Acquisition Costs`

`CAC = Sales + Outreach Spend / New Paying Customers`

Track retention/churn before making LTV claims.

## 6. Conversion Flow

Recommended sales flow:

`Preview → Interested reply → Small customization request → Checkout/approval → Domain connection → Production publish → Welcome/onboarding`

Reduce friction:
- preview already works
- business owner can request corrections before paying
- transparent scope and pricing
- simple checkout
- explicit ownership/domain/cancellation terms
- fast production activation

## 7. Retention — The Main Business Engine

Recurring revenue only works when recurring value is visible.

Provide:
- uptime/SSL/hosting management
- backups/versioning where appropriate
- security/platform updates
- a defined number/scope of content edits
- contact/form monitoring
- analytics or simple monthly/quarterly performance summary
- domain renewal reminders/management according to plan
- periodic conversion/content improvements for higher tiers

Retention workflow:
- onboarding confirmation
- early post-launch check
- periodic performance/update touchpoint
- renewal reminder where needed
- cancellation feedback and export/handover policy

Track:
- monthly logo churn
- revenue churn
- support time per account
- expansion/upgrade revenue
- referrals
- failed payments

## 8. Referral & Expansion

After the customer has received demonstrable value, request a referral or testimonial. Possible upsells should be relevant rather than automatic: additional pages, booking/quote workflows, additional locations, business email, content updates, analytics, or local-search work with an explicit scope.

## 9. Technical Architecture

Candidate stack (validate before implementation):
- Lead collection: compliant data provider/API or carefully designed collection workflow
- Enrichment: Gemini or another model with structured output
- Site engine: Next.js + Tailwind or an equivalent multi-tenant renderer
- Hosting/CDN/custom domains: Cloudflare-compatible architecture
- Database/CRM: PostgreSQL/Supabase or equivalent
- Outreach: provider selected by target market and compliance requirements
- Billing: Stripe/Lemon Squeezy or market-appropriate alternative
- Observability: errors, delivery events, preview visits, conversions and account health

Separate business/site data from generated presentation content so templates can change without re-scraping the lead.

## 10. Minimum Data Model

A lead/customer record should cover:
- identity/location/category
- source/provenance
- contact methods
- qualification score
- enrichment payload
- preview slug/version/status
- outreach events and suppression state
- replies/sales stage
- subscription/customer status
- domain/deployment state
- maintenance requests
- analytics/account-health metrics

See `schemas/lead.schema.json` for the current schema; expand it as implementation begins.

## 11. Execution Roadmap

### Phase 0 — Validation
- choose 1–2 niches and 1 initial geography
- manually qualify a small lead cohort
- create previews
- manually QA and outreach
- record every funnel event
- validate objections, pricing and willingness-to-pay

### Phase 1 — MVP Automation
- lead import/qualification
- enrichment pipeline
- preview renderer
- internal lead dashboard
- outreach event tracking

### Phase 2 — Sales & Provisioning
- checkout/subscriptions
- custom-domain provisioning
- onboarding/correction workflow
- customer/account state

### Phase 3 — Retention Operations
- maintenance queue
- analytics/reporting
- renewal/payment-failure handling
- referral/upgrade workflow

### Phase 4 — Scale
- template library by niche
- multi-market compliance/configuration
- campaign experiments
- automated QA where safe
- unit-economics dashboard

## 12. Experiments Required Before Scaling

Measure rather than assume:
- niche conversion rate
- no-website vs weak-website leads
- preview style/template
- email vs other permitted channels
- CTA wording
- follow-up cadence
- monthly vs annual pricing
- setup fee vs no setup fee
- plan packaging
- support workload
- churn and reasons

Use randomized or clearly separated cohorts when practical so changes can be evaluated rather than guessed.

## 13. Guardrails

- Do not fabricate business facts in AI-generated pages.
- Do not imply endorsement/ownership of a business before authorization.
- Respect opt-outs and maintain suppression records.
- Review privacy, marketing, platform and messaging rules for every market/channel.
- Protect API keys and customer data.
- Add rate limits, retries, idempotency and audit logs to automation.
- Keep a human review step until quality metrics justify reducing it.

## Repository

```text
website-lead/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── OUTREACH_STRATEGY.md
│   └── ROADMAP.md
├── schemas/
│   └── lead.schema.json
└── examples/
    └── sample-lead.json
```

## Next Build Priority

Before building a large scraper, complete a manual validation loop for one niche and geography. The first software milestone should make that loop faster and measurable: lead qualification → preview → QA → outreach tracking → conversion → maintenance.
