# Design & Engineering Handoff – Day 10

## Context
This handoff packages the assets and implementation notes needed to unblock both design and engineering today. It synthesises the latest feature priorities around public demand discovery and the buyer/seller/agent onboarding flows.

## Figma Library Deliverables
- **Token Library**
  - Define colours, typography, spacing, radius, and elevation tokens with naming aligned to the public marketing site and in-app surfaces.
  - Include semantic variants for backgrounds, text, interactive states, and critical alerts to accelerate theme adoption.
- **Hero Module**
  - Responsive hero layout covering desktop, tablet, and mobile.
  - Variants for buyer, seller, and agent narratives, each with background imagery guidance and CTA hierarchy.
- **Stepper Card**
  - Component states for idle, active, completed, and disabled steps.
  - Slot guidance for headline, helper copy, and optional metadata (e.g., "2 min setup").
- **Match Chip**
  - Badge styles for match quality (Excellent / Good / Emerging) and count chips for buyer demand.
  - Include monochrome fallback for dark/light imagery contexts.
- **Gate Modal**
  - Layout variants for seller upgrade prompts and agent pro upsell.
  - Document copy slots, CTA ordering, and telemetry hooks.
- **Demand Tiles**
  - Grid tiles summarising buyer counts, budget ranges, and top features.
  - Provide guidance for iconography and microcopy length limits.
- **Heatmap Canvas**
  - States for loading, empty, hovered, and selected neighbourhoods.
  - Accessibility considerations (colour contrast, tooltip behaviour).
- **Empty States**
  - Patterns for zero matches, zero demand data, and gated analytics.
  - Include illustration references and CTA patterns (primary vs. secondary).

## Frontend Implementation Scope
- **Token + Base Component Foundations**
  - Land the design token set (colour, typography, spacing) in the component library and expose CSS variables or theme objects for React usage.
  - Implement base components (`Hero`, `StepperCard`, `MatchChip`, `GateModal`, `DemandTile`, `HeatmapCanvas`, `EmptyState`) with Storybook examples and accessibility notes.
- **Landing Page + Public Teasers**
  - Build the public landing experience plus three teaser pages highlighting buyer wishlists, seller demand analytics, and agent pro insights.
  - Ensure responsive behaviour, SEO metadata, and instrumentation for conversion funnels.
- **API Integration Hooks**
  - Connect to existing endpoints for aggregate counts (total buyers, active sellers, active agents) and match previews for featured areas.
  - Implement loading/error skeletons and caching strategy for the teasers.
  - Surface telemetry events for CTA clicks, teaser interactions, and API error states.

## Copy Deliverables
- **Buyer Flow Questions**
  - Refine and ship leading questions that qualify areas, budget readiness, feature priorities, and timeline.
- **Seller Flow Questions**
  - Finalise prompts around property highlights, target buyer segments, readiness to contact, and pricing expectations.
- **Agent Flow Questions**
  - Deliver questions focusing on service regions, buyer backlog, collaboration preferences, and success metrics.
- **Voice & Tone Notes**
  - Ensure all flows maintain the Realestate Ready tone: confident, data-backed, and privacy-forward.

## Next Steps
- Publish the Figma library updates to the shared workspace and notify engineering once component documentation is live.
- Engineering to pull tokens and base components into the repository, targeting a feature branch for review by EOD.
- Copy team to deliver approved strings in localisation files and flag dependencies for telemetry or analytics events.
