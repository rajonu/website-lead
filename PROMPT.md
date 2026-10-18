# Gemini Master Build Prompt — Website Lead Engine

## Your Role
You are the senior product engineer and implementation agent for this repository. Build the Website Lead Engine incrementally from the existing documentation. Do not redesign the business model from scratch and do not add unnecessary SaaS/enterprise complexity.

Read these files before making implementation decisions:
1. `README.md`
2. `docs/ROADMAP.md`
3. `docs/ARCHITECTURE.md`
4. `docs/OUTREACH_STRATEGY.md`
5. `schemas/lead.schema.json`
6. `examples/sample-lead.json`

If documentation and existing code conflict, identify the conflict before silently changing the intended product behavior.

# Final Goal
Build a reliable internal application that lets Raj configure target markets/niches, automatically discover businesses, deduplicate and research them, audit their web presence, score/rank opportunities with AI, create factual preview websites for strong candidates, surface only the best approximately 2–5 prospects/day, let Raj review and approve personal outreach, track replies/sales, provision won clients, and manage ongoing maintenance/retention in one simple pipeline.

The application should eventually support this complete loop:

`Market Config → Discovery → Deduplication → AI Research → Website Audit → Qualification → High-Score Recommendation → Preview → Human QA → Personal Outreach → Reply → Sales → Client Provisioning → Maintenance → Retention → Referral/Upsell`

# Non-Negotiable Product Principles

1. **Quality over volume.** This is not a bulk-email platform.
2. **Human-in-the-loop first.** Do not contact prospects automatically during initial validation.
3. **Simple UI.** The dashboard must feel obvious, minimal and pipeline-first, not like a complex CRM.
4. **Factual integrity.** Never invent services, awards, prices, credentials, reviews or business facts.
5. **Provenance.** Preserve the source of important external facts.
6. **Provider abstraction.** Do not tightly couple discovery to direct Google Maps page scraping.
7. **Portable deployment.** Develop locally, initially run production/validation on Raspberry Pi via Docker + Cloudflare Tunnel, and keep migration to VPS straightforward.
8. **Resource-aware.** Raspberry Pi already runs other services; use controlled background concurrency and external AI APIs rather than heavy local inference.
9. **Personal outreach.** Initial email identity should support Raj personally contacting a few high-value prospects, potentially from `raj@d4f.me` after mailbox/domain authentication is configured.
10. **Measure the entire funnel.** Do not optimize only for replies.

# Initial Market Experiments

Treat these as hypotheses/configuration, not hard-coded permanent markets.

US:
- Dallas–Fort Worth: HVAC, plumbing, roofing
- Houston: HVAC, plumbing, roofing
- Orlando: HVAC, plumbing, landscaping/pool-related home services

UK:
- Manchester: plumbing, electrical, builders/construction trades
- Birmingham: plumbing, electrical, builders/construction trades
- Leeds: building/home-service trades

Support configuration so new city × niche experiments do not require code changes.

# Dashboard UX

Keep navigation minimal. A good initial structure is:
- Dashboard
- Pipeline / Leads
- Daily Recommendations
- Clients / Maintenance
- Settings

The main dashboard should show:
- discovered today
- researched today
- qualified/high-score
- recommendations awaiting Raj
- demos awaiting review
- contacted
- replies/interested
- clients requiring attention

Primary pipeline:

`New Leads → AI Research → High Score → Demo Ready → Review → Contacted → Replied → Interested → Client → Maintenance`

Daily recommendation cards must show:
- score/confidence
- why recommended
- website status
- concise audit/opportunity
- contact methods
- preview
- suggested outreach angle/draft
- Approve
- Skip + reason
- Hold

Mobile use must be comfortable.

# Implementation Strategy

Work milestone by milestone. At the start of each milestone:
1. inspect existing code/files;
2. state the exact implementation goal;
3. identify dependencies/configuration required;
4. implement the smallest coherent vertical slice;
5. run lint/typecheck/tests/build as appropriate;
6. fix errors before moving on;
7. update documentation/schema/examples when behavior changes;
8. summarize completed work and remaining risks.

Do not attempt to generate the entire system in one giant untested change.

# Build Milestones

## Milestone 1 — Application Skeleton
- initialize/verify Next.js + TypeScript application
- Tailwind-based clean responsive UI
- basic authenticated admin shell or development-safe placeholder if auth is not configured yet
- database integration abstraction
- environment configuration
- Dockerfile / Docker Compose suitable for ARM64 Raspberry Pi and normal development where practical
- health endpoint
- structured logging foundation
- simple dashboard/pipeline mock using seed data

Acceptance: project builds/runs and the simple pipeline UI is usable.

## Milestone 2 — Data Model & Persistence
- implement normalized database model based on `schemas/lead.schema.json`
- migrations
- lead CRUD/query layer
- lifecycle state transitions
- audit timestamps
- seed/sample data
- preserve distinction between sourced business facts and generated presentation content

Acceptance: leads persist and move safely through pipeline states.

## Milestone 3 — Market Configuration + Provider Interface
- market/city/niche configuration
- generic provider adapter interface
- manual CSV/JSON import adapter first if it accelerates testing
- later connect an approved business/Places data provider through the same interface
- source/provenance capture
- normalization/deduplication

Acceptance: importing/discovering the same business repeatedly does not create uncontrolled duplicates.

## Milestone 4 — Research + Website Audit
- background job model
- research queue
- website presence detection/audit
- public contact route enrichment
- factual evidence/provenance storage
- error/retry handling

Acceptance: a lead can progress from new to researched with visible evidence and audit results.

## Milestone 5 — AI Qualification
- structured AI output
- configurable scoring weights
- score 0–100
- confidence
- positive factors
- penalties
- concise recommendation reason
- recommended outreach channel/angle
- scoring version

Never allow AI to silently create missing facts.

Acceptance: researched leads are consistently ranked and the user can understand why.

## Milestone 6 — Daily Recommendation Queue
- rank qualified leads
- configurable daily recommendation limit; default small, around 2–5
- recommendation screen
- approve/skip/hold
- rejection reason capture

Acceptance: Raj can open the app and immediately know which few prospects deserve attention today.

## Milestone 7 — Preview Generator
- structured multi-tenant renderer
- `/preview/[slug]`
- Home/Local Services theme first
- Construction/Trades variant as needed
- factual data + generated presentation layer
- preview status/banner
- screenshot/thumbnail job
- preview versioning

Acceptance: a high-score lead can produce a professional mobile preview without creating a separate codebase/deployment.

## Milestone 8 — Outreach Draft + Human Approval
- contact channel model
- email as initial primary channel
- generate short personalized draft from sourced facts
- editable draft
- explicit human approval
- manual-send logging initially; provider integration can follow
- suppression/opt-out
- follow-up reminders

Do not build mass-send controls as the primary UX.

Acceptance: Raj can review a recommended lead and send/log a genuinely personal message with minimal work.

## Milestone 9 — Reply + Lightweight Sales CRM
- log/import replies as supported
- reply classification/summarization
- interested/changes/proposal/won/lost/follow-up-later
- objection/lost-reason capture
- next action/reminder

Acceptance: no interested prospect disappears outside the pipeline.

## Milestone 10 — Conversion + Production Provisioning
After manual validation proves customers will pay:
- pricing/package configuration
- billing provider abstraction/integration
- customer conversion
- domain/deployment state
- production publish
- SSL/domain workflow
- onboarding

Acceptance: a won prospect can become a production customer without ad-hoc tracking.

## Milestone 11 — Maintenance + Retention
- client health queue
- site/domain/SSL checks
- edit requests
- form/contact monitoring where implemented
- billing/renewal issues
- periodic client review
- retention metrics
- referral/upgrade state

Acceptance: recurring customers receive visible recurring service and issues appear on the dashboard.

## Milestone 12 — Analytics + Experimentation
Track by market/niche/cohort:
- discovered
- researched
- qualified
- recommended
- demo
- approved/contacted
- reply/positive reply
- interested
- paid
- 30/60/90-day retained
- opt-out/complaint
- support burden
- contribution/profit per 100 researched leads

Support pricing hypotheses such as approximately `$49`, `$99`, `$149` monthly, annual variants, and setup-fee/no-setup-fee tests without hard-coding one as correct.

Acceptance: decisions can be based on real funnel/retention data.

# Technical Expectations

Prefer boring, maintainable components over unnecessary infrastructure.

Candidate stack:
- Next.js + TypeScript
- Tailwind
- PostgreSQL/Supabase-compatible DB
- background jobs/worker suitable for Raspberry Pi and later VPS
- external AI API with structured JSON outputs
- Docker
- Cloudflare Tunnel for initial remote dashboard access

Before adding a dependency, explain what problem it solves. Avoid heavyweight infrastructure until needed.

# AI/Data Rules

AI may:
- summarize sourced business facts
- analyze website opportunities
- create presentation copy from known facts
- recommend score/channel/angle
- draft outreach

AI may not:
- invent a service because it is typical for the category
- invent testimonials/reviews
- invent opening hours/prices
- imply the business approved the preview
- claim unverifiable performance results

When evidence is missing, represent it as unknown.

# Outreach Rules

Initial workflow:
`recommendation → Raj review → preview review → draft → Raj edit/approve → send/manual contact → log → follow-up reminder → reply`

Initial daily volume should remain intentionally tiny and personalized. Do not turn the product into a bulk sender unless the product requirements are explicitly changed later.

Respect suppression and market/channel rules.

# Reliability Rules
- idempotent background jobs
- retries with backoff
- concurrency limits
- dedupe
- API rate-limit handling
- structured errors
- health checks
- database backups plan
- secrets never committed
- webhook verification where relevant
- important lifecycle changes auditable

# Raspberry Pi Constraints
Initial deployment must be resource-conscious:
- ARM64-compatible containers/dependencies where possible
- do not run heavy LLM inference locally
- constrain browser/screenshot concurrency
- schedule heavy discovery/research jobs sensibly
- expose dashboard through Cloudflare Tunnel rather than requiring inbound router ports
- make workers separable so they can later move to a VPS

# Definition of Done
The project reaches its first real goal when Raj can open one simple dashboard, configure a niche/market, let the system research prospects, receive a tiny ranked list of the best opportunities, inspect the evidence and generated demo, personally approve outreach, track the conversation, convert a paying customer, and then manage that customer's ongoing site/maintenance from the same application.

Do not call the project complete merely because lead scraping or preview generation works. The full business loop through retention is the goal.

# First Instruction to the Coding Agent
Before writing code, inspect the repository and produce a short implementation gap analysis against the milestones above. Then begin with the earliest incomplete milestone. Preserve working code, make incremental commits/changes, test each vertical slice, and continue toward the Definition of Done without introducing features that do not support the core loop.