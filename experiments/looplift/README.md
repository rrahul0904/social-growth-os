# LoopLift — referral ladder

A clean-room referral race inspired by public referral-loop mechanics, but independently implemented.

## Product contract

- Page views and link copies never score.
- A referral scores only when a distinct participant arrives through a referral code and creates their own referral link.
- Self-referrals are rejected using a server-side HMAC fingerprint derived from IP + user agent; the same fingerprint can hold only one participant record.
- Each participant receives a one-time opaque edit token in an HttpOnly cookie.
- Referral events are immutable Vercel Blob objects keyed by referred participant ID, preventing duplicate credit for the same participant.
- Rewards: Just entered → Rising → Text line → Challenger → Banner.

## Local verification

```bash
npm install
npm test
npm run dev
```

Production requires a Vercel project connected to a private Vercel Blob store and an `ANTI_ABUSE_SECRET` environment variable.

## Routes
- `POST /api/join` — create participant, optionally credit inviter
- `GET /api/me` — current cookie-bound participant
- `POST /api/profile` — edit name/website with edit-token cookie
- `GET /api/leaderboard` — current Monday-UTC weekly leaderboard

## Security boundary
This is a production-capable prototype, not a claim of fraud-proof identity. IP+UA HMAC is a first anti-abuse layer; a public launch should add bot challenge, rate limits, abuse review, and privacy/legal review before prizes have meaningful monetary value.

## Deployment note
On 2026-10-07 EDT, Vercel's connected Hobby team returned `api-deployments-free-per-day` after exceeding 100 API deployments/day, so live deployment is blocked by hosting quota rather than by application code.