# Implementation Plan for Wishlist Builder and Market Trends Expansion

## Overview
This plan breaks down the work needed to deliver the Wishlist Builder (v2), /market-trends aggregator (Tier 1), and Areas ingest + /areas/suggest initiatives. Each ticket includes goals, key tasks, dependencies, and deliverables to ensure alignment with acceptance criteria and Definitions of Done (DoD).

---

## A. Wishlist Builder (v2)

### FE-01 Build MapCanvas + AreaDrawToolbar + AreaList
- **Goal:** Provide interactive area selection via polygon and radius drawing with support for weighted areas.
- **Key Tasks:**
  - Implement `MapCanvas` component with map provider integration and base layers.
  - Build `AreaDrawToolbar` enabling polygon and radius drawing modes; persist drawn shapes with weights.
  - Create `AreaList` UI to display drawn/saved areas with editing controls.
  - Wire components together with state management (Context or Redux) and synchronization to backend models.
- **Dependencies:** Requires area geometry data (from initiative C) and consistent area weighting schema.
- **Deliverables / DoD Alignment:** Drawing and listing areas must match acceptance criteria; all updated APIs covered by contract tests.

### FE-02 Implement AreasSuggestInput → `/areas/suggest`
- **Goal:** Add autosuggest input that queries the backend for area suggestions.
- **Key Tasks:**
  - Create reusable `AreasSuggestInput` component with debounce and async fetching.
  - Integrate with `/areas/suggest` endpoint using TRGM + prefix search responses.
  - Display source labels (municipal, OSM, etc.) and handle fallback when no results.
- **Dependencies:** Backend `/areas/suggest` endpoint (initiative C, BE-05) must be available.
- **Deliverables / DoD Alignment:** Autosuggest resolves canonical names in target cities; contract tests ensure API compatibility.

### FE-03 Filters Accordion (type/price/beds/baths; must-haves vs nice-to-haves)
- **Goal:** Provide structured filters for wishlist criteria with prioritization levels.
- **Key Tasks:**
  - Design accordion UI grouping filter categories.
  - Implement form controls for property type, price, beds, baths.
  - Add toggle or weighting system to differentiate must-haves vs nice-to-haves.
  - Persist selections to state and backend models.
- **Dependencies:** Shared state from FE-01 and backend schema updates.
- **Deliverables / DoD Alignment:** Matches UX acceptance criteria; ensures filters serialize to API contracts.

### FE-04 BudgetCoachPanel → `/market-trends` + source badges & timestamps
- **Goal:** Surface market trend insights with data freshness indicators.
- **Key Tasks:**
  - Build `BudgetCoachPanel` UI fetching data from `/market-trends` endpoint.
  - Display trend metrics with source badges (Teranet, StatCan NHPI, CMHC HMIP) and timestamps.
  - Handle loading/error states and telemetry instrumentation.
- **Dependencies:** Backend `/market-trends` endpoint (initiative B, BE-03) and monitoring (BE-04).
- **Deliverables / DoD Alignment:** Shows data for relevant CMAs with <45-day freshness; includes telemetry events.

### FE-05 Detail View Components: `SnapshotTiles`, `FitBreakdown`, `MatchedHomesTable`
- **Goal:** Present detailed wishlist summaries and matched homes.
- **Key Tasks:**
  - Implement reusable visual tiles summarizing key metrics.
  - Build `FitBreakdown` component illustrating must-have vs nice-to-have alignment.
  - Create `MatchedHomesTable` with sortable listings and quick actions.
  - Integrate telemetry for user interactions.
- **Dependencies:** Requires filter outputs and matched homes data sources.
- **Deliverables / DoD Alignment:** Components meet checklist acceptance criteria and pass contract tests where applicable.

### QA-A11Y/Perf; Telemetry Events
- **Goal:** Ensure accessibility, performance, and analytics coverage.
- **Key Tasks:**
  - Run accessibility audits (axe, screen reader checks) and fix issues.
  - Conduct performance profiling on key flows; optimize as needed.
  - Validate telemetry events across new components and flows.
- **Dependencies:** Completion of feature implementations above.
- **Deliverables / DoD Alignment:** Accessibility and performance checks complete; telemetry verified.

---

## B. `/market-trends` Aggregator (Tier 1)

### BE-01 Create `trend_series` Table & DAO
- **Goal:** Persist normalized trend data for multiple sources.
- **Key Tasks:**
  - Design schema covering CMA, source, metric type, period, value, freshness timestamp.
  - Implement DAO/repository with CRUD and range query helpers.
  - Add migrations and unit tests.
- **Dependencies:** None, but informs downstream ETL jobs.
- **Deliverables / DoD Alignment:** Database schema ready; contract tests cover DAO operations.

### BE-02 ETL Jobs: Teranet, StatCan NHPI, CMHC HMIP (Nightly)
- **Goal:** Ingest external data sources into `trend_series` nightly.
- **Key Tasks:**
  - Build ETL pipelines for each source with data normalization and validation.
  - Schedule nightly runs; handle retries and logging.
  - Store freshness metadata for monitoring.
- **Dependencies:** Requires BE-01 schema.
- **Deliverables / DoD Alignment:** ETL jobs maintain <45-day freshness for CMAs used by active wishlists.

### BE-03 `/market-trends` Endpoint + Precedence & Range Logic
- **Goal:** Serve aggregated trend data with precedence across sources.
- **Key Tasks:**
  - Implement API endpoint that selects freshest data within defined precedence rules.
  - Support querying by CMA and date range; include source metadata.
  - Cover endpoint with contract and integration tests.
- **Dependencies:** BE-01, BE-02.
- **Deliverables / DoD Alignment:** Endpoint returns data for all required CMAs meeting freshness requirements.

### BE-04 Monitoring: Freshness & Error Rates; `x-source` Header
- **Goal:** Provide observability for trend data delivery.
- **Key Tasks:**
  - Instrument ETL jobs and endpoint with metrics on freshness, errors, and latency.
  - Add dashboards/alerts for SLA breaches.
  - Include `x-source` response header indicating data source.
- **Dependencies:** Endpoint and ETL must be operational.
- **Deliverables / DoD Alignment:** Monitoring in place ensuring sustained freshness; header available in responses.

---

## C. Areas Ingest + `/areas/suggest`

### DATA-01 Ingest Vancouver Local Areas; Toronto Neighbourhoods; Montréal Quartiers
- **Goal:** Populate canonical area datasets for key cities.
- **Key Tasks:**
  - Source municipal datasets for each city; standardize schema (id, name, geometry, metadata).
  - Load into data warehouse/staging tables with validation.
  - Track source provenance for display and precedence.
- **Dependencies:** Requires access to municipal data.
- **Deliverables / DoD Alignment:** Canonical areas available for autosuggest and snapping.

### DATA-02 OSM Fallback via Overpass/Geofabrik; Dedupe & Precedence (Municipal > OSM)
- **Goal:** Provide fallback areas where municipal data is missing.
- **Key Tasks:**
  - Implement OSM extraction pipeline using Overpass/Geofabrik.
  - Deduplicate against municipal datasets; apply precedence rules favoring municipal data.
  - Annotate records with source labels for UI display.
- **Dependencies:** DATA-01 ingestion pipeline.
- **Deliverables / DoD Alignment:** Fallback areas function for nearby communities when municipal data absent.

### BE-05 `/areas/suggest` (TRGM + Prefix Search; Return Source Label)
- **Goal:** Deliver performant autosuggest responses.
- **Key Tasks:**
  - Implement backend search leveraging trigram indexes and prefix matching.
  - Return canonical area names, IDs, geometries references, and source labels.
  - Ensure contract tests cover search behaviors and ranking.
- **Dependencies:** DATA-01, DATA-02 datasets.
- **Deliverables / DoD Alignment:** Autosuggest resolves canonical names; fallback works for nearby communities.

### BE-06 `/areas/{id}` (Metadata; Tile Controller for Geometry)
- **Goal:** Provide detailed area metadata and geometries for drawing/snapping.
- **Key Tasks:**
  - Build endpoint returning area metadata and links to geometry tiles.
  - Implement tile controller (e.g., MVT) for polygon rendering/snapping.
  - Cover with contract/integration tests; ensure drawing integrates with FE-01.
- **Dependencies:** Area datasets and geometry storage.
- **Deliverables / DoD Alignment:** Drawing tools snap to polygons; metadata available for UI.

---

## Cross-Cutting Considerations
- **Contract Testing:** All new/updated endpoints must have contract tests executed in CI per Definition of Done.
- **Security & Compliance:** Follow existing security guidelines for data ingestion and API exposure.
- **Rollout Plan:** Coordinate feature flags and staged rollout to internal users before GA.
- **Documentation:** Update user guides and developer docs for new components and APIs.

## Security, Compliance, and Access Control
- **In-App Messaging Only:** All buyer–seller communication continues to flow through the existing messaging service. Do not introduce email/SMS previews; ensure notification copy avoids exposing PII outside the authenticated app context.
- **Privacy Notes at Gates:** Every upgrade gate, paywall, or sensitive form must include inline privacy language reinforcing how personal data is handled before data entry occurs. Copy updates ship with UX approval and screenshots captured during QA.
- **RBAC Enforcement:** Sensitive endpoints—including buyer profiles, matchmaking results, and chat threads—must respect the role matrix defined in the Buyer Registry UX spec. Reuse the existing policy middleware and add regression tests for agent, buyer, seller, and unauthenticated roles.
- **Audit Coverage:** Expand audit logging to capture gate impressions, role check failures, and access-denied events. Logs feed the compliance dashboard with the same retention window specified in SECURITY.md.
- **PII Handling:** Sanitize telemetry payloads and analytics events so that user identifiers map to hashed IDs; never send raw emails, phone numbers, or addresses to Mixpanel/GA.

## Two-Sprint Build Plan

### Sprint A — Value Before Sign-Up
- **Public Buyer Stepper:** Implement the wishlist quick-start with an anonymous session token, live match count, and guardrails preventing access to gated buyer profile content.
- **Public Seller Demand Estimator:** Surface aggregate demand counts and top match percentages derived from the matchmaking backend while keeping individual buyer data hidden.
- **Agent Analytics Teaser:** Ship a limited heatmap preview with two trend tiles sourced from existing analytics; ensure teasers stop at the upgrade gate with inline privacy notes.
- **Upgrade Gate & Plan Modals:** Connect the modal flow to the current subscription backend, enforcing RBAC so that only eligible roles see the upgrade paths.
- **Landing Page Refresh:** Update the hero, MLS vs. Buyer Registry comparison strip, and Demand Pulse module, coordinating copy with marketing and legal for compliance review.

### Sprint B — App Polish & Workflow
- **Single-Question Onboarding Steppers:** Replace the current multi-question flow for buyers and sellers with single-question steppers that respect RBAC and surface privacy context near sensitive inputs.
- **Match Score Chips & UI Redesign:** Refresh list and card layouts with match score chips, ensuring scores appear only for authorized viewers.
- **Messages UI Refresh:** Update thread lists and readers, reaffirming in-app messaging boundaries and confirming RBAC tests cover archived conversations.
- **System States:** Add empty states, skeleton loaders, and notification banners consistent with the design system and privacy guidelines.
- **Analytics & Funnels:** Wire Mixpanel/GA events for the new flows, verifying PII scrubbing and role-aware event metadata.

## G. Why this fits the project
- Reasserts the marketplace thesis: buyers articulate their needs while sellers decide how and when to expose Home Profiles and initiate outreach. No inventory-style searching is introduced.
- Leverages the existing technical stack—React front end, Node/Django services, Postgres with search extensions, and the established match engine with price gating—while focusing scope on RBAC tightening and refined UI copy.
- Aligns with the UX specification’s role-based access model and reliance on in-app messaging, preserving privacy expectations and Canadian PIPEDA compliance throughout the end-to-end flow.

