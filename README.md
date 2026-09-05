# AgentTrace

A trust ledger for AI purchasing agents.

As AI agents start making purchase decisions on a user's behalf, three problems
show up: agents can drift from the rules they were configured with, some
decisions are riskier than others and deserve a second look before they go
through, and if a customer later disputes a charge, there's no evidence trail
explaining why the agent did what it did.

AgentTrace gives an agent a spending policy, has it make a real decision (via
a live LLM call — nothing here is scripted), and runs three checks on that
decision:

1. **Drift detection** — did the agent's action break the policy it was given?
2. **Risk scoring** — a transparent, explainable 0–100 score based on amount,
   the agent's own confidence, and whether a rule was broken.
3. **Receipt generation** — a plain-language record of what happened and why,
   suitable as dispute evidence.

## Try it

Open the deployed link, load one of the two preset scenarios (a normal
grocery order, or one with a manipulated instruction slipped in), and run it.
The agent's decision comes back from a real model call each time — try
running the same scenario twice and compare.

application link-agenttrace-know-your-agent.vercel.app


## Using it from your own agent

```bash
curl -X POST https://your-deployment-url/api/check-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "instruction": "Order this week groceries",
    "situation": "Fridge is low on basics",
    "policy": {
      "maxAmount": 2000,
      "allowedCategories": ["groceries", "household"],
      "requireApprovalAbove": 1500
    }
  }'
```

Returns a full receipt: the agent's decision, drift check, risk score, and a
plain-language summary, with a unique `id`.

`GET /api/receipts` returns the 50 most recent receipts.

## Running it locally

```bash
npm install
cp .env.example .env.local   # add your own ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploying your own copy (free, ~5 minutes)

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click
   **Add New → Project**, and import the repo.
3. In the project's environment variables, add `ANTHROPIC_API_KEY` with your
   own key from [console.anthropic.com](https://console.anthropic.com).
4. Click **Deploy**. You'll get a live `.vercel.app` URL in about a minute.

No other setup is needed — no database to provision, no extra services.

## Honest scope notes

This is a working prototype, not an enterprise-hardened system. Two
tradeoffs are worth being upfront about:

- **Storage is in-memory.** Receipts are kept in the running server's
  memory, not a database. This is fine for demoing and for a single warm
  deployment, but a redeploy or a cold serverless start clears the ledger.
  Swapping in a real database (Supabase/Postgres, or Vercel KV) only
  requires changing `lib/store.ts` — every other file already calls through
  that one interface.
- **Not connected to any real payment gateway.** The "agent" here is a
  simulated purchasing assistant reasoning over a described situation, not a
  live integration with Razorpay or any processor. The point of this build
  is to prove the drift/risk/receipt logic works against real, non-scripted
  agent decisions — wiring it into a production payment flow would be a
  separate, larger integration project (with its own security review).

## How the checks work

- `lib/agent.ts` — calls Claude to make the actual purchase decision. The
  system prompt explicitly tells the model it doesn't have to follow the
  policy strictly, so the checks below have something real to catch.
- `lib/drift.ts` — a plain rules comparison: decision vs. policy. Deliberately
  simple and auditable, not a black box.
- `lib/risk.ts` — a transparent weighted score: amount vs. limit, the
  agent's own stated confidence, and whether a rule was actually broken.
- `lib/receipt.ts` — turns the above into a plain-language paragraph a
  non-technical person (e.g. reviewing a dispute) could read and understand.

## Stack

Next.js 14 (App Router) · TypeScript · Anthropic API (Claude 3.5 Haiku) ·
no database required for the demo, deploys free on Vercel.
