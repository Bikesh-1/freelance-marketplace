# Security and production-readiness checklist

This repository uses Next.js, NextAuth credentials, Prisma, and PostgreSQL. A code change alone cannot prove hosted provider settings are enabled. Complete the deployment steps below before accepting real users or funds.

## Present in source (still test end to end)
- Credentials login and logout through NextAuth (`lib/auth.ts`, `/api/auth/[...nextauth]`).
- Passwords are hashed with bcrypt during registration.
- Registration validates email format, role, name length, and password length (8–128 characters).
- Protected route groups are gated in `proxy.ts`; every API route must still perform its own authorization checks.
- Profile completion endpoint validates fields server-side.
- Loading and error states exist on a number of screens.

## Deployment tasks requiring owner/provider access
- **Password reset:** verify the `/forgot-password` route and token/email delivery end to end. Use single-use, expiring cryptographically random tokens stored hashed; invalidate sessions or rotate credentials after reset; return a generic response to avoid account enumeration.
- **Rate limiting:** enforce shared limits at the server/edge for login, registration, reset requests, uploads, and expensive AI/blockchain endpoints. In-memory limits do not coordinate across serverless instances. Configure thresholds and return HTTP 429.
- **Database backups:** enable automated PostgreSQL backups/PITR at the database provider, define retention, restrict access, and perform a restore drill. A repository file cannot enable provider backups.
- **Row-level security:** this code uses Prisma with a server-side PostgreSQL connection. RLS policies are not confirmed from source inspection. If enabling RLS, add and test policies for each relevant table and ensure the application's DB role is subject to them.
- **API keys:** keep private credentials only in server-side environment variables (e.g. `DATABASE_URL`, `NEXTAUTH_SECRET`, Cloudinary secret, AI-service key, and server RPC credentials). Never prefix private secrets with `NEXT_PUBLIC_`; such values are bundled for browsers. Public identifiers may use that prefix only when safe. Rotate keys that were committed or exposed.
- **Analytics:** choose a privacy-appropriate provider, configure its SDK/environment variables and any required consent, then verify events in production. Do not claim analytics is installed until verified.
- **Error tracking:** configure a provider SDK, release/source-map policy, environment keys, and privacy filtering; trigger a test event. The app error pages are fallbacks, not a monitoring backend.
- **Mobile QA:** test common widths and critical flows on real mobile browsers. A responsive navbar alone does not prove every page is responsive.
- **Delete account:** implement an authenticated, re-confirmed deletion endpoint with re-authentication, explicit confirmation, related-record handling, and a retention policy. Do not cascade-delete financial or dispute records without reviewing audit and legal obligations.
- **Legal:** `/privacy` and `/terms` are starter copy; complete them with the actual operator contact, data processors, real data flows, jurisdiction-specific rights, and governing law.
- **Onboarding:** a profile-completion API exists. Verify role-aware redirects and completion state for CLIENT and FREELANCER, validation, and recovery after an interrupted flow.

## Release gate
Before production, run `npm run typecheck`, `npm run lint`, and `npm run build`; exercise auth/reset flows and authorization tests; review hosting environment variables; test a database restore; and verify rate limits, analytics, error reporting, and legal contact details.
