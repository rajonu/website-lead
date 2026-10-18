# Outreach & Conversion Strategy — Personal, High-Quality First

## Goal
Outreach is not a bulk-email operation. The system's job is to research many businesses and help Raj personally contact only a few unusually strong opportunities with useful work already prepared.

Initial target: approximately **2–5 excellent prospects per day**.

## Positioning
Raj contacts the prospect as a real web developer, not as an anonymous automated sales machine.

The value proposition is:
- I found a concrete web-presence opportunity for your business.
- I researched it first.
- I prepared a useful preview so you can judge the work rather than a promise.
- You can ask for changes before deciding.
- If it creates value, it can become a managed production site.

Avoid manipulative claims, fake urgency, invented statistics and exaggerated compliments.

## Initial Sender Identity
Preferred model:
- dedicated mailbox on `d4f.me`, e.g. `raj@d4f.me`
- real sender name: Raj
- genuine developer/portfolio identity
- SPF/DKIM/DMARC configured correctly
- low volume and individualized messages

The primary business logic should not depend on bulk-sending software.

## Channel Priority
### 1. Personal email — initial primary channel
Use when a legitimate public business email/contact route is available and outreach is appropriate for the target market.

### 2. WhatsApp — selective secondary channel
Use only when the business has publicly presented WhatsApp as a business contact route and the use is appropriate/compliant. Do not assume WhatsApp is automatically the best channel by country.

### 3. Manual phone
Useful for some home-service/trade niches after research, especially when phone is clearly the business's normal enquiry route.

### 4. LinkedIn / business social DM
Use selectively where a legitimate owner/business route is available.

### 5. Contact form
Potential fallback when it is clearly intended for business enquiries and use is appropriate.

### 6. SMS
Only where legally/operationally appropriate; not an automatic fallback.

## Daily Outreach Workflow

`AI recommendation → Raj reviews evidence → Raj reviews preview → message draft → Raj edits/approves → send/manual contact → event logged → follow-up reminder → reply → sales stage`

For each recommended prospect, dashboard should show:
- business name/category/location
- qualification score and confidence
- why this prospect is worth contacting
- website status/audit
- relevant sourced facts
- available contact channels
- preview link/screenshot
- suggested outreach angle
- editable draft
- Approve / Skip / Hold

## Message Principles
A good first message should be short and specific:
1. Introduce Raj naturally.
2. Show why this specific business was selected.
3. Mention one concrete observed website/web-presence opportunity.
4. Share the already-prepared preview.
5. Ask for a low-friction response.
6. Make it easy to decline/stop contact.

Do not use a universal claim such as a specific percentage of consumers requiring a website unless a current reliable source supports it and using the statistic genuinely improves the message.

## Draft Pattern — Email

**Subject ideas**
- `Made a quick website preview for [Business Name]`
- `A website idea for [Business Name]`

**Body pattern**

```text
Hi [Name/Business Name],

I'm Raj, a web developer. I came across [Business Name] while researching [niche] businesses in [city].

[One short, factual personalized observation explaining the opportunity.]

I put together a quick mobile-friendly website preview for the business so you can see the idea rather than just read a sales pitch:

[Preview Link]

If you like the direction, I'm happy to adjust the details and explain how I could put it live on your own domain and manage it for you.

If it isn't useful, no problem — just let me know and I won't follow up.

Best,
Raj
[portfolio / relevant contact]
```

The AI should adapt wording to the actual business and must not insert unsupported facts.

## Follow-up Strategy
Do not automatically hammer every non-responder.

Suggested initial experiment:
- initial personal message
- one useful follow-up after a tested delay
- optionally one final follow-up only when justified
- then stop

A follow-up should add something: a correction, screenshot, useful observation or requested change. Avoid fake scarcity such as claiming a preview must be removed for server capacity unless that is genuinely true.

## Suppression & Opt-Out
Maintain a durable suppression state.

Stop further outreach when:
- prospect asks not to be contacted
- contact is invalid
- complaint occurs
- business is unsuitable/closed
- Raj manually suppresses it
- market/channel rules require it

Suppression should apply across automated channel suggestions so the system does not switch channels simply because email was declined.

## Reply Handling
Classify/log replies without losing the original text/context:
- positive/interested
- question
- requests changes
- pricing request
- not now
- not interested
- already has solution
- wrong contact
- opt-out
- complaint

AI may summarize and recommend a next action, but Raj remains in control initially.

## Conversion Flow

`Interested → clarify needs → update preview if needed → agree scope/price → checkout/approval → domain → production publish → onboarding`

Keep friction low. The prospect should not have to repeat business information already verified; they should correct/approve it.

## Pricing Experiments
Pricing is a hypothesis until customers pay and remain customers.

Initial test points may include roughly `$49`, `$99`, and `$149` monthly tiers, annual options and setup-fee/no-setup-fee variants. Do not present any one number as proven.

Measure conversion, support burden, retention and contribution margin by package.

## What to Measure
Per market, niche and channel:
- researched leads
- qualified/high-score leads
- demos generated
- human approvals
- contacts attempted/delivered
- replies
- positive replies
- interested opportunities
- paid conversions
- time to close
- 30/60/90-day retention
- opt-outs/complaints
- support time
- revenue/contribution per 100 researched leads

Reply rate is diagnostic, not the final success metric.

## Market Experiments
Initial hypotheses:
- US: Dallas–Fort Worth, Houston, Orlando; HVAC/plumbing/roofing and selected home services.
- UK: Manchester, Birmingham, Leeds; plumbing/electrical/building trades.

The system should compare results and change priorities based on real conversion/retention data.

## Core Rule
The competitive advantage is not sending more messages. It is using automation and AI to find the few businesses where Raj can send a genuinely relevant personal message backed by a useful pre-built preview.