# Website Lead — Safe Hybrid Cloudflare Migration

## Project

Repository: `rajonu/website-lead`

The application currently runs successfully in production on a Raspberry Pi using Docker.

Current stack includes:
- Next.js 16
- React 19
- Docker / Docker Compose
- Server-side API routes
- Persistent local `/data` storage
- Raspberry Pi deployment
- Cloudflare Tunnel capability

## Objective

Convert the project to a **hybrid architecture** without breaking the existing Raspberry Pi production system.

Target architecture:

```text
                    PUBLIC INTERNET
                          |
                          v
              Cloudflare DNS / CDN
                          |
             +------------+------------+
             |                         |
             v                         v
     Public Generated Sites      Main App / Dashboard
     Cloudflare Workers          Raspberry Pi
     or static hosting           Docker
                                 |
                                 +-- API
                                 +-- Lead Engine
                                 +-- Authentication
                                 +-- Discovery
                                 +-- Automation
                                 +-- Persistent Data
```

The Raspberry Pi must remain the **main private engine/control center**.

Public customer websites and generated preview websites should eventually be deployable independently to Cloudflare so normal visitors do not depend on the Raspberry Pi being online.

## CRITICAL SAFETY RULE

DO NOT immediately modify the working production architecture.

First audit the entire repository.

Do not delete, rename, overwrite, migrate, or restructure existing production components until their purpose and dependencies are understood.

The currently working Raspberry Pi deployment must remain operational throughout the migration.

Do not make destructive changes to:
- existing Docker deployment
- `docker-compose.yml`
- production environment variables
- persistent `/data`
- authentication
- existing API behavior
- Cloudflare Tunnel
- existing domains
- working preview URLs
- lead/discovery engine

Never delete existing data.

Never expose private API endpoints, credentials, tokens, environment variables, or Raspberry Pi administration interfaces publicly.

## Phase 1 — Repository Audit

Before changing code, inspect the complete repository.

Determine:
1. Which components are UI-only.
2. Which components require Next.js server execution.
3. Which API routes exist.
4. Which routes read or write `/data`.
5. Which features depend on Raspberry Pi local storage.
6. Which features require Node.js APIs.
7. Which processes are long-running or background processes.
8. Which pages are public.
9. Which pages are private/dashboard pages.
10. How preview websites are generated.
11. Whether generated websites are static or require server-side rendering.
12. Which environment variables are required.
13. Which services communicate with external APIs.
14. Which routes require authentication.
15. Which parts can safely execute in Cloudflare Workers.

Produce an architecture report BEFORE implementing the migration.

## Phase 2 — Classify Components

Classify every important component into one of these groups.

### A — Raspberry Pi Only

Examples:
- main lead engine
- discovery engine
- automation
- persistent local data
- administrative dashboard backend
- private APIs
- long-running processes
- local filesystem operations

These remain on Raspberry Pi unless there is a strong technical reason to migrate them later.

### B — Cloudflare Compatible

Examples:
- public static websites
- generated customer websites
- generated previews
- static assets
- lightweight public endpoints

These should be candidates for Cloudflare deployment.

### C — Shared / API Connected

Components where Cloudflare-hosted public pages need information from the Raspberry Pi.

For these, design a secure API boundary. Do NOT expose the entire Raspberry Pi application. Only expose explicitly required endpoints.

## Phase 3 — Public Website Architecture

The preferred design is:

```text
Website Lead Engine
       |
       | generates/builds site
       v
Deployment Layer
       |
       v
Cloudflare
       |
       +-- customer-site-1
       +-- customer-site-2
       +-- preview-site-1
       +-- preview-site-2
```

Public sites should preferably be **self-contained static deployments** whenever possible.

Once published, a public site should continue working even if:
- Raspberry Pi is offline
- home internet is unavailable
- Cloudflare Tunnel to Raspberry Pi is temporarily unavailable

Avoid runtime dependency on Raspberry Pi unless the public site genuinely requires dynamic information.

## Phase 4 — Deployment Strategy

Evaluate the current Cloudflare platform and choose the appropriate supported deployment architecture.

Prefer Cloudflare Workers/static assets for new Cloudflare deployments where appropriate.

Do not blindly convert the whole Next.js application into a Worker. Instead, separate the public website deployment layer from the main engine.

Create a clean deployment mechanism where the Raspberry Pi engine can publish/update generated sites.

The eventual workflow should resemble:

```text
Lead discovered
      ↓
Website Lead generates preview
      ↓
Preview files/build produced
      ↓
Deploy to Cloudflare
      ↓
Unique public preview URL
      ↓
Customer approves
      ↓
Production domain connected
```

## Phase 5 — Preserve Existing System

The existing Raspberry Pi deployment must continue functioning during development.

New functionality should be introduced incrementally. Where practical, implement new Cloudflare functionality alongside the existing implementation before switching traffic.

Do not perform a big-bang migration.

## Phase 6 — Data Safety

Treat `/data` as production data.

Before any operation affecting it:
1. identify its structure;
2. identify every reader/writer;
3. confirm persistence behavior;
4. create a backup strategy;
5. verify rollback.

Do not automatically migrate `/data` to another database or storage service. The hybrid architecture specifically allows this data to remain on Raspberry Pi.

## Phase 7 — Deployment Isolation

Public generated sites must be isolated from the main Website Lead application.

A failure in a customer website deployment must NOT break:
- Website Lead dashboard
- lead engine
- discovery
- authentication
- other customer sites
- Raspberry Pi production deployment

Design deployments so individual public sites can be updated or rolled back independently.

## Phase 8 — Verification

Before changing production traffic, test:
- dashboard
- login
- API routes
- lead data
- discovery
- preview generation
- public preview URL
- public production website
- static assets
- mobile rendering
- domain routing
- SSL
- Raspberry Pi restart
- Docker restart
- Cloudflare deployment
- rollback

Also test this scenario:

```text
Raspberry Pi OFFLINE
```

Already-published public websites should remain available whenever their functionality does not inherently require the Pi.

## Git Safety

Use small, reversible changes.

Before implementation:
- inspect current Git status;
- identify the production branch;
- preserve the known-working state;
- create a dedicated migration branch.

Do NOT force push.
Do NOT rewrite Git history.
Do NOT delete the working production deployment.

Commit migration work in small logical steps.

## Required Output Before Coding

Before making implementation changes, give me:
1. Current architecture discovered from the repository.
2. Components that must remain on Raspberry Pi.
3. Components that can move to Cloudflare.
4. Public-site deployment architecture.
5. Required code changes.
6. Required Cloudflare resources.
7. Security implications.
8. Data migration requirements, if any.
9. Step-by-step migration plan.
10. Rollback plan.
11. Expected downtime.

Then STOP.

Wait for my approval before modifying the project.

The overriding priority is:

**Do not break the currently working Website Lead production system.**
