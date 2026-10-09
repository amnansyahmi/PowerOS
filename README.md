# PowerOS

A cobalt-blue and navy fork of [OpenKuasaOS](https://github.com/OpenKuasa/OpenKuasaOS). The upstream layouts, modules, screens, routes and interactions are retained, with PowerOS branding.

Copied from upstream commit `72331e44ab726cea2ccfba752b8a78126eeb6eb3` on 9 October 2026. See [NOTICE.md](NOTICE.md) for attribution and modifications, and [the original README](docs/upstream/README.md) for the complete module inventory and upstream documentation.

## Included

- Tuah AI command centre and the Sari assistant.
- Jebat advertising, Kasturi CRM, Lekiu HR/payroll, Lekir recruitment and Bendahara finance.
- Marketing, pricing, privacy, authentication/onboarding and account pages.
- Supabase authentication helpers, tenancy migrations, tests and email templates.
- Original responsive layouts, SVG icons, component library and locked dependencies.

## Current state

This is a copy of the upstream implementation, not a completion of its planned features. Most business screens use sample data. Auth remains in Supabase; a Neon-compatible tenancy foundation is now included. Configure Supabase Auth and the restricted Neon runtime connection to enable private workspaces. AI responses and external integrations are not fully connected. Rebranding does not make these features production-ready.

## Run locally

Use Node.js 20+ and pnpm.

```bash
git clone https://github.com/amnansyahmi/PowerOS.git
cd PowerOS
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. Fill in your own Supabase Auth URL and anon key in `.env.local`, plus the restricted Neon `DATABASE_URL`. See [database and security setup](docs/STATUS.md). For Supabase-only deployments, the original migrations remain available. Keep secrets out of Git. `poweros.example` addresses are demonstration placeholders; configure real contact and SMTP details before hosting.

Environment variable identifiers are kept compatible with upstream, including the optional `OPENKUASA_*` tooling/model variables. No database, provider credentials or deployed service is bundled.

## Checks

```bash
pnpm lint
pnpm test
pnpm build
pnpm smoke:routes
pnpm smoke:browser
```

Database integration tests require a configured test Supabase project; without one, they skip. Route smoke checks run after a production build.

## Licence

[AGPL-3.0-only](LICENSE). Copyright © 2026 OpenKuasa contributors. Modified versions served over a network must offer their corresponding source under the same licence. PowerOS is an independent fork and is not affiliated with OpenKuasa or any proprietary KuasaOS product.

## Mobile and PWA

PowerOS supports standalone home-screen installation with branded icons, iPhone safe areas, a six-app bottom navigation, accessible phone drawers, and local horizontal table scrolling. The user-requested viewport/gesture controls reduce pinch and double-tap zoom; phone inputs use at least 16px text to prevent focus zoom. Browser accessibility overrides can still apply.

Install from the user menu; iPhone users receive Safari Share → Add to Home Screen instructions. Serve over HTTPS. The service worker caches only public installation assets and an offline message, never authenticated screens or API responses. It does not support offline business edits or push notifications yet.

Protected app routes deny unauthenticated access by default, including when auth is unconfigured. To show **public sample screens** on an intentional demo deployment, set the server-only `POWEROS_ALLOW_PUBLIC_PREVIEW=1`. Do not enable that flag for real company data.
