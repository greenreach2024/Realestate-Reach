# Trending Data for Buyers – “Budget Coach”

## Overview
The “Budget Coach” experience curates market benchmarks, affordability guidance, and compliance-aware disclosures for buyers exploring multiple areas and property types. The goal is to deliver a sourced, non-promissory snapshot of price and payment expectations while clarifying methodology, licensing boundaries, and stress-test requirements.

## Data Coverage and Sources

| Data Element | Description | Primary Source | Notes |
| --- | --- | --- | --- |
| Benchmark price by area & property type | Core KPI shown at the most granular licensed level available. | CREA MLS® HPI | Surface methodology explainer and link to CREA documentation. |
| Benchmark price fallback | CMA-level repeat-sales benchmark when CREA coverage is unavailable. | Teranet–National Bank HPI | Expose repeat-sales methodology summary. |
| New home context | Adds context where new-build benchmarks differ materially. | StatCan NHPI | Use sparingly; highlight coverage limits. |
| Supplementary market indicators | Starts, completions, inventories, median prices (where provided). | CMHC HMIP | Include footnote clarifying publication cadence. |
| Affordability context | Percentage of median household income required for ownership costs. | RBC Housing Affordability Measure | Show CMA or provincial figure matching user selection. |
| Indicative mortgage rates | Daily rate pull to support payment estimate chip. | External aggregator (e.g., Ratehub.ca) | Pair with OSFI stress-test footnote. |
| Stress-test qualifying rate | OSFI minimum qualifying rate (MQR). | OSFI guidelines | Always display beside payment estimate. |

All data surfaces include inline source icons that link to the relevant documentation or release. Caching strategy: nightly refresh for Tier 1 public feeds (Teranet–NB HPI, StatCan NHPI, CMHC HMIP, RBC affordability). CREA MLS® HPI is ingested under licensing terms; when unavailable, the UI automatically falls back to the Tier 1 CMA-level metrics.

## UI Presentation

### Estimated Market Range Module
* **Anchor**: Latest benchmark price for the selected property type and area aggregation (board or CMA).
* **Range band**: ± range derived from feature dispersion and multi-area blends. Includes hover tooltip clarifying calculation logic.
* **Source treatment**: CREA, Teranet–NB, or CMHC icons adjacent to the range. Clicking opens methodology modal with source transparency.

### Payment & Qualification Chips
* **Monthly payment at today’s rate**: Calculated with the indicative rate feed. Always shows effective rate, amortization assumption, and date of the quote.
* **Qualify at MQR**: Displays the OSFI minimum qualifying rate (greater of contract rate + 2% or 5.25%). Tooltip summarises Guideline B-20 stress-test rules and links to OSFI.

### Trend Context
* **12-month sparkline**: Visualizes the YoY trajectory for the chosen composite (board/CMA). Caption example: “Composite HPI in Calgary CMA down 5.5% YoY.”
* **Contextual releases**: When local real estate boards publish commentary (e.g., TRREB), surface as optional context cards. News sources such as Reuters may also be referenced when providing economic commentary.

## Data Pipeline
1. **Nightly ingestion (Tier 1 public feeds)**
   * Teranet–National Bank HPI (CMA-level repeat-sales index).
   * Statistics Canada NHPI (new home price index).
   * CMHC Housing Market Information Portal (HMIP) metrics (starts, completions, inventory, median prices where available).
   * RBC Housing Affordability Measure (CMA/provincial).
2. **Licensed ingestion (Tier 2)**
   * CREA MLS® HPI at board/area and property-type level. Respect licensing scope; when data is restricted, revert to Tier 1 metrics.
3. **Rates integration**
   * Pull daily indicative rates from an approved aggregator (e.g., Ratehub.ca) to compute payment estimates.
   * Always display the OSFI MQR qualifier alongside rates, preventing misinterpretation.
4. **Caching & Refresh**
   * Cache nightly feed results with timestamped provenance.
   * Trigger manual refresh hooks for urgent updates (e.g., OSFI rate changes).

## Compliance & Trademark Considerations
* Avoid implying Realestate Reach is an MLS or referencing MLS® districts without authorization.
* Include footer disclosure clarifying CREA’s guidance on the MLS® mark representing services, not a database.
* Do not display board-owned boundaries unless explicit permission is secured; rely on publicly shareable geographic aggregations (CMA, municipality, or custom radius searches).

## Open Questions
* Confirm exact range methodology for multi-area selection (weighted blend vs. percentile band).
* Validate availability of historical RBC affordability data per CMA for sparkline overlays.
* Determine service-level agreements for indicative rate providers and fallback messaging if data is stale.
