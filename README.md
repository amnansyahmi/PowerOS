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

This is a copy of the upstream implementation, not a completion of its planned features. Most business screens use sample data. Auth and tenancy code are included, but require your own Supabase project and migrations. AI responses and external integrations are not fully connected. Rebranding does not make these features production-ready.

## Run locally

Use Node.js 20+ and pnpm.

```bash
git clone https://github.com/amnansyahmi/PowerOS.git
cd PowerOS
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. Fill in your own Supabase URL and anon key in `.env.local`, apply the included migrations in timestamp order, and follow the upstream self-hosting/auth setup before testing sign-in. Keep secrets out of Git. `poweros.example` addresses are demonstration placeholders; configure real contact and SMTP details before hosting.

Environment variable identifiers are kept compatible with upstream, including the optional `OPENKUASA_*` tooling/model variables. No database, provider credentials or deployed service is bundled.

## Checks

```bash
pnpm lint
pnpm test
pnpm build
pnpm smoke:routes
```

Database integration tests require a configured test Supabase project; without one, they skip. Route smoke checks run after a production build.

## Licence

[AGPL-3.0-only](LICENSE). Copyright © 2026 OpenKuasa contributors. Modified versions served over a network must offer their corresponding source under the same licence. PowerOS is an independent fork and is not affiliated with OpenKuasa or any proprietary KuasaOS product.
