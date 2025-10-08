# Realestate-Reach

This repository contains the early discovery assets for the Realestate Reach buyer-first marketplace. It currently includes a long-form product/engineering specification and a vanilla HTML prototype that can be used for stakeholder demos and concept validation.

## Contents

1. **Buyer Registry UX & Engineering Specification** – a detailed product and platform blueprint located at `docs/buyer-registry-ux-engineering-spec.md`.
2. **Buyer Registry Experience Demo** – a static front-end prototype located in the `web/` directory that visualises the core workflows for buyers, sellers, agents, and mortgage professionals.

## Getting started

### Prerequisites

* Any modern web browser (Chrome, Edge, Safari, or Firefox recommended).
* Python 3 (optional) for running a local static file server.

### Running the demo

The prototype is built with vanilla HTML, CSS, and JavaScript (ES modules). No build step is required.

1. Navigate to the `web/` directory.
2. Serve the folder with a static web server (`python -m http.server 8000`) or open `index.html` directly in the browser.
3. Use the navigation bar to explore landing content, onboarding flows, notifications, subscription plans, and each persona’s workspace.
4. Interact with wishlist cards, Home Profile insights, lead cards, and modal forms to experience the demand-led workflows described in the specification.

### Market trends prototype service

The repository includes a lightweight `/market-trends` API mock to demonstrate how Tier 1 data sources (CREA, Teranet–NB HPI, StatCan, CMHC) are prioritised. To run it locally:

1. From the repository root, start the service with `node api/server.js` (no build step required).
2. Query the endpoint, providing a `geoCode` and optional `propertyType` query parameter, for example:
   ```bash
   curl "http://localhost:3000/market-trends?geoCode=board:REBGV&propertyType=detached"
   ```
3. The response includes the selected benchmark price, YoY change, trend series, disclosures, and the `x-source` header denoting the active provider.

### Demo preview

Screenshots and GIFs of the prototype will live in the `docs/media/` directory. Add them as you iterate to make stakeholder demos easier.

## Repository structure

```
├── docs/
│   ├── buyer-registry-ux-engineering-spec.md
│   └── adr/
│       └── 0001-cloud-platform-and-maps.md
├── web/
│   ├── app.js
│   ├── data.js
│   ├── index.html
│   └── styles.css
├── .github/
│   ├── CODEOWNERS
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── config.yml
│   ├── dependabot.yml
│   ├── pull_request_template.md
│   └── workflows/
│       ├── ci.yml
│       └── codeql.yml
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
└── README.md
```

## Roadmap snapshot

| Theme | Next actions |
| --- | --- |
| **Platform alignment** | Execute ADR-0001 to finalise the Azure-first stack and replace Google Maps usage in the prototype with Azure Maps SDK. |
| **MVP foundations** | Bootstrap a Next.js + NestJS TypeScript monorepo with shared models, Postgres/PostGIS migrations, and baseline auth. |
| **Quality gates** | Adopt ESLint + Prettier configs, add unit/e2e tests, and expand CI to cover linting, type-checking, builds, and Playwright smoke tests. |
| **Growth & compliance** | Integrate Stripe billing, notification services, and document privacy/consent policies aligned with Canadian regulations. |

## Governance

* Review the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before opening issues or pull requests.
* Security disclosures should follow the guidance in [SECURITY.md](SECURITY.md).
* Ownership and default reviewers are configured in [.github/CODEOWNERS](.github/CODEOWNERS). Update this file as the team grows.

## Browser compatibility

The demo uses modern browser APIs (`dialog`, `structuredClone`, `crypto.randomUUID`). For the best experience, use the latest versions of Chrome, Edge, Safari, or Firefox.

---

If you need help turning the roadmap into actionable tickets or bootstrapping the production codebase, open an issue using the templates provided.
