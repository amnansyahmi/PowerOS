# PowerOS status — 9 October 2026

PowerOS copies OpenKuasaOS, a separate community project. It does not contain
the proprietary KuasaOS backend. This inventory compares source code with
Kuasa's public product descriptions, not its private implementation.

## Security

Implemented foundation:

- Supabase email/password sign-up, sign-in, recovery and session refresh code.
- Protected app/account routes redirect signed-out visitors to login. Missing
  auth configuration also denies entry. Public sample screens require an
  explicit server-only `POWEROS_ALLOW_PUBLIC_PREVIEW=1` opt-in.
- Real sign-out actions, clearing the session rather than just linking to login.
- Same-origin confirmation redirects reject protocol-relative, backslash and
  encoded separator/control-character destinations.
- Input validation in auth actions; Next.js Server Action origin checks.
- Security headers for MIME sniffing, framing and referrer handling.
- Neon server-only parameterized queries with a verified Supabase subject.
- Non-administrative `poweros_runtime` SQL role and row-level security on the
  user/workspace/membership/audit tables. Tenant context is transaction-local.
- Workspace owners/admins can rename the workspace; viewers cannot. Membership
  writes go through a scoped function, not direct table grants.
- PWA caches contain only public icons and an offline message. Private pages
  and API responses are not cached, and protected responses use no-store.

Still missing: module/field-level authorization, working team invitations and
permission settings, MFA/session management UI, app-level abuse controls,
business-operation audit trails, a reviewed CSP for the whole app, retention
and restore procedures, upload authorization/scanning, and a deployment review.
The account/security screen is largely presentation. Passing the current tests
does not establish production security for payroll or company records.

## Neon database

- Project: `PowerOS` / `restless-meadow-07853436`, Singapore, PostgreSQL 17.
- Main branch: `br-rapid-bar-b3uw9qdj`; database: `poweros`.
- Development branch: `br-purple-brook-b321g4bz` / `dev-foundation`.
- Applied migration: `db/migrations/001_neon_tenancy.sql`.
- Tables: `app_users`, `orgs`, `org_members`, `audit_events`, `schema_migrations`.
- Credentials are kept in ignored local environment files; never in Git.
- `DATABASE_URL`: pooled connection using `poweros_runtime`.
- `DATABASE_URL_UNPOOLED`: owner/direct connection for migration tooling only.
- The separately provisioned API-created `poweros_app` role is unused. Neon
  grants its API-created roles administrative privileges; the application uses
  the SQL-created restricted runtime role instead.

Supabase remains the **identity provider**. Set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` alongside
`DATABASE_URL` on your host. Enable/configure the required Supabase auth email
and anonymous-demo flows using the upstream setup guidance. No Supabase tenancy
tables are needed when `DATABASE_URL` is set. New workspaces then store verified
user IDs and memberships in Neon. For a Supabase-only deployment, omit
`DATABASE_URL` and use the original Supabase migrations instead.

To recreate the Neon foundation, provision a `poweros_owner` database owner and
create the restricted role using SQL (not Neon's default role-creation API):

```sql
CREATE ROLE poweros_runtime LOGIN PASSWORD '<generated secret>'
  NOBYPASSRLS NOCREATEDB NOCREATEROLE NOINHERIT;
```

Apply the migration with the owner's direct connection, for example
`psql "$DATABASE_URL_UNPOOLED" -f db/migrations/001_neon_tenancy.sql`.
Test changes on a development branch first. The runtime role may set identity
context, so its credential must remain server-only; the application must
authenticate the subject before setting it.

This database is a tenancy foundation. Employee, payroll, CRM, invoice and
other business tables and persistence flows have **not** been implemented.
Supabase login credentials and a production deployment were not configured in
this task, so real-user sign-up/sign-in against the hosted app remains unverified.

## Gaps against publicly documented KuasaOS

| Capability | PowerOS status |
| --- | --- |
| Shared customer/employee records across modules | Sample records; no shared business database yet |
| Live CEO/CMO/CHRO/CFO agents, voice, source/tool logs and usage cost | Scripted replies and interface; no live tools/model/voice |
| Meta ad publishing, generated creatives and autopilot rules | UI only; external APIs and job execution missing |
| WhatsApp knowledge-base chatbot and WhatsApp/email/SMS campaigns | UI only; connections, delivery, consent and jobs missing |
| CRM follow-up automations and won-deal-to-invoice flow | Local/sample screens; no durable workflows |
| CSV contact mapping, employee self-onboarding and PDF bank import | No complete import pipelines |
| HRIS, attendance, shifts, leave, claims and approvals | Sample screens; no persistent workflows or employee scoping |
| Payroll EPF/SOCSO/EIS/PCB rate tables and employee payslips | Displayed examples; no verified calculation engine |
| Recruitment, resume parsing, skills tests and DISC/DOPE assessments | Candidate/jobs UI; parsing and assessment engines missing |
| Double-entry accounting, reconciliation and auditable reports | Sample tables/charts; no posting/reconciliation engine |
| MyInvois submission, response storage and QR invoice PDFs | Status UI only; integration missing |
| Receipt OCR/drafts and Telegram confirmation-to-posting | Receipt inbox UI; OCR and Telegram workflow missing |
| Real multi-client switching, assigned-account access, marketplace apps | Presentation and tenancy foundation; complete flows missing |
| AI credit wallet, top-up, subscriptions and payment processing | Sample billing/credit values; no transactions or metering |
| Native employee mobile app with device biometrics | PowerOS is now a PWA; native/device-biometric flows not implemented |
| Meeting recording/transcription/summaries | Missing; Kuasa's public HIRA page labels this **Soon** |

Sources reviewed on 9 October 2026:
- https://launch.kuasa.ai/
- https://launch.kuasa.ai/ara
- https://launch.kuasa.ai/hira
- https://launch.kuasa.ai/safa
- https://launch.kuasa.ai/c-suite
- https://apps.apple.com/mx/app/kuasa/id6801379733

Kuasa's HIRA documentation says statutory submissions remain a manual step.
SAFA describes SST reports as preparation for filing, not filing itself. Do not
treat those as capabilities it automatically performs.

## Mobile/PWA and validation

Added manifest, 192/512px icons plus maskable and Apple icons, home-screen install
guide, six-module phone navigation, focus-trapped drawers, safe-area spacing,
phone-sized input text, table scrolling and requested zoom controls. Offline
business editing, push notification delivery and biometric login are not included.

Validation performed: production build, lint, existing unit tests, Neon runtime
role/isolation/viewer tests, route smoke checks, and Chromium browser checks at
320/390/430px. Browser checks cover navigation, drawers, viewport/gesture
controls, manifest/icons, service-worker registration, private-cache isolation,
offline recovery and protected-route redirects. The native iPhone home-screen
installation flow still needs an actual-device check after HTTPS deployment.
