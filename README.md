# Mauksh AI

A modern Vedic Numerology AI starter for `ai.mauksh.com`.

## Run locally

```bash
npm install
cp .env.example .env.local
# add OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000.

## Current MVP

- Modern Mauksh AI interface
- Numerology onboarding
- Mulank calculation
- Bhagyank calculation
- Name number calculation
- Vedic grid: 3 1 9 / 6 7 5 / 2 8 4
- Century digits excluded from grid
- Zero ignored in grid
- Personalized AI prompt
- Free / ₹49 / ₹99 plan UI
- Question counter in the browser

## Production billing

The current plan switch is only a UI preview. Do NOT use it as production billing.

For production:
1. Create Shopify products/subscriptions.
2. Authenticate users.
3. Store subscription status and monthly usage server-side.
4. Use Shopify webhooks to activate/deactivate access.
5. Enforce 3/30/100 question limits server-side.
6. Add a database such as Supabase/Postgres.
7. Add rate limiting and abuse protection.

## Numerology note

The calculation engine intentionally separates deterministic calculations from AI interpretation. Update `lib/numerology.ts` with your exact Mauksh name-number mapping and any additional rules before launch.