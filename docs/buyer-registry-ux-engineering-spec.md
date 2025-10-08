# Realestate Ready – UX & Engineering Specification

## 0. Purpose & Positioning
Realestate Ready mirrors the familiar navigation and polish of MLS.ca while flipping the marketplace logic. Instead of showcasing public seller listings, the platform publishes **Buyer Wishlists** so that supply-side users can analyse real demand. Sellers and agents keep their **Home Profiles** private and use the analytics workspace to decide when and how to engage buyers. No personally identifiable information (PII) is surfaced in public views, and all conversations stay inside the product with anonymised aliases.

- **Public surface**: anonymised Buyer Wishlists with geo context, budget bands, feature priorities, and match scores.
- **Private surface**: Home Profiles owned by sellers or agents. They never appear in public search results.
- **In-app communications**: only available to paying sellers and agents once a match is established. Buyers can reply but never initiate contact.

## 1. Global Product Rules
### Data visibility
- Buyer Wishlists are public. They expose criteria, demand signals, and match metrics without any PII.
- Home Profiles are private. Sellers and agents use them only for matchmaking, analytics, and outreach.

### Contact permissions
- Only paid sellers and paid agents can start a conversation with a matched buyer through anonymised in-app messaging.
- Buyers respond from the inbox and choose whether to disclose identity. All disclosures are explicit actions and logged.

### Pre-subscription experience
- Free sellers can load a Home Profile and immediately see comparative analytics: number of matched buyers, score ranges, and demand gaps (e.g., "Most buyers want 3 baths; this profile lists 2").
- These high-level analytics sit outside the paywall to drive upgrade conversion.

### Privacy & compliance
- Never render email addresses, phone numbers, or exact street addresses in the UI.
- Any buyer/seller disclosure toggle triggers an audit log entry.
- Map interactions respect privacy by snapping to block-level granularity.

### Map UX parity
- Geo maps are present on both buyer and seller workspaces.
- Buyers see matched Home Profiles per area; sellers see buyer demand hotspots.
- Hovering over an area reveals the count: buyers per region on the seller side, matched Home Profiles on the buyer side.

### Subscription gating
| Persona | Free tier | Paid tier |
| --- | --- | --- |
| Seller | Match counts, score bands, gap hints | Buyer wishlist snippets, demand trends, messaging |
| Agent (Pro) | N/A | Regional analytics, multi-property matching, messaging |
| Buyer | Unlimited wishlists, analytics, respond to inbound messages | Paid upgrades not required |

Terminology: always refer to public artefacts as **Buyer Wishlists** and private artefacts as **Home Profiles**. Avoid "listing" when describing seller experiences.

### Notes on positioning (copy & compliance)
- Buyer surfaces consistently refer to the experience as managing a **Wishlist**—never "search".
- Seller experiences present properties as **Home Profiles**—never "listings".
- Maintain **price expectation** as the naming for seller pricing. It is a gating criterion in match scoring.
- All outreach remains in-app with anonymised identities. No PII is shown by default in any workflow.

## 2. Web Application Screens
### 2.1 Buyer Experience (mirrors MLS listing browsing)
1. **Buyer Dashboard (My Wishlists)**
   - Map component centred on selected neighbourhoods. Hover states display `Matched {N} home profiles` per polygon/pin.
   - Wishlist cards styled like MLS listings but summarising the buyer's requirements. Each card shows:
     - Target areas (pins/polygons/radii) and priority
     - Budget range, property type, bedrooms/bathrooms, timeline
     - Must-have and nice-to-have tags
     - Pre-approval badge when toggled
     - Status chip: `Matched X home profiles`
   - Actions: Create, Edit, Duplicate, Archive.

2. **Create/Edit Wishlist Wizard**
   - Step 1 – Areas: add postal codes, draw polygons/radii, or drop pins; supports priorities.
   - Step 2 – Budget & Timeline: capture min/max, move-in window, and pre-approval toggle (controls badge).
   - Step 3 – Property Details: property type, bedrooms, bathrooms, optional size range.
   - Step 4 – Features: split must-haves and nice-to-haves.
   - Step 5 – Review: show normalised payload ready for persistence and the immediate analytics call (`Matches: N; Top score: Y%`).
   - Saved wishlists always use the schema:
     ```json
     {
       "locations": [{ "type": "polygon|radius|pc", "value": "...", "priority": 1 }],
       "budget": { "min": 800000, "max": 1100000 },
       "timeline": "3-6m",
       "preApproved": true,
       "details": { "type": "house", "beds": 3, "baths": 2, "sizeMin": null, "sizeMax": null },
       "features": { "must": ["garage"], "nice": ["homeOffice"] },
       "visibility": "public"
     }
     ```

3. **Buyer Analytics (Wishlist Insights)**
   - `Supply vs Me` tile summarising match counts, score ranges, and notable gaps.
   - Gap hints example: `Typical profiles nearby: 2 baths; you require 3`.
   - Optional trend tile per area when data exists (e.g., `Demand in Area A rising 8% this month`).

4. **Buyer Messaging**
   - Inbox shows anonymised threads created only after a paid seller/agent reaches out.
   - Buyers can mute conversations or toggle `Reveal identity`, which requires explicit confirmation and logging.

5. **Buyer Notifications**
   - Alerts for new matches, inbound messages, and significant area demand shifts.

### 2.2 Seller Experience (inverse of MLS seller tools)
1. **Seller Dashboard (My Homes)**
   - Map with heat or pin overlays showing buyer hotspots. Hover tooltip: `{N} buyers searching here now`.
   - Home Profile cards (private) featuring: home summary, match score bands, count of matching buyers, top wishlist snippet.
   - Pre-subscription analytics highlight what is accessible for free and what requires upgrade.
   - Primary actions: `Add Home Profile`, `Upgrade to Contact Buyers`, `Find an Agent (Pro)`.

2. **Create/Edit Home Profile**
   - Step-based flow: approximate address/pin, core details (type, beds, baths, size, parking, age), feature tags, optional private media upload.
   - On save, immediately call match summary endpoint and show counts + score.

3. **Demand Analytics (Seller Insights)**
   - Budget distribution of matched buyers, feature demand alignment, geographic heat, and timeline demand.
   - Trends and compare views unlocked behind the paid wall.

4. **Seller Messaging (Paid Only)**
   - In-app anonymised threads with disclosure controls and moderation.
   - Free tier sees an upgrade prompt instead of message composer.

5. **Notifications**
   - Events for new matches, match score changes, analytics nudges, and upgrade prompts.

6. **Seller Settings**
   - Manage Home Profiles, subscriptions, billing, notification preferences, and optional Realtor (Pro) linkage.

### 2.3 Agent & Mortgage Views
- Agents gain regional analytics, multi-home match orchestration, and messaging similar to seller paid tier but scaled for multiple homes.
- Mortgage agents access buyers who opted in or lack pre-approval, with secure chat templates and compliance-ready disclosures.

## 3. Map & Hover Behaviour
- Shared map component reads geo layers (pins, polygons, radii) for both buyers and sellers.
- Hover reveals counts: `Matched {N} home profiles` for buyers; `{N} buyers searching here` for sellers.
- Tooltips avoid street-level precision; data is aggregated to neighbourhood blocks.

### 3.1 Neighbourhood data strategy
- Implement a three-layer hierarchy of neighbourhood sources to balance accuracy, coverage, and licensing:
  1. **Layer A – Municipal open data**: ingest official neighbourhood/local area polygons from cities that publish open data (e.g., City of Toronto, City of Vancouver, Montréal). These names feed autosuggest options and polygon pickers for the most precise experience.
  2. **Layer B – OpenStreetMap**: supplement municipal coverage with OSM `place=neighbourhood` features and `boundary=place` polygons. Label these as "community-named areas" in the UI to set expectations about variability and allow buyers to draw custom polygons when needed.
  3. **Layer C – Commercial datasets (optional)**: layer in Mapbox Boundaries tiles plus neighbourhood labels from Mapbox Streets or Google Places API when municipal/OSM data is sparse. Treat these as label hints rather than authoritative polygons.
- Store canonical areas in a shared table with fields `id`, `name`, `alt_names`, `source`, `geom`, and `license`. Back this data with Elasticsearch/geo indexes to support `/areas/suggest?q=` and `/areas/{id}` endpoints.
- Keep Azure Maps as the base map provider and render neighbourhood polygons as custom vector layers on top of it.
- Exclude MLS® board proprietary areas/districts unless explicit licensing is obtained; they must not appear in search or analytics.

## 4. Access & Gating Rules
- Central guard middleware checks both role and subscription tier before returning protected data or enabling messaging actions.
- UI surfaces gating with disabled buttons and contextual tooltips (`Upgrade to contact buyers`).
- Buyers remain free; sellers/agents must upgrade for detailed analytics and outreach.

## 5. Match Scoring Contract
- Mandatory filters: location containment + price overlap.
- Weighted factors (default): Location 50, Features 30, Lifestyle/Amenities 15, Timeline 5.
- Example stored payload:
  ```json
    {
      "homeId": "h123",
    "wishlistId": "w456",
    "score": 0.82,
    "factors": {
      "location": 1.0,
      "price": 1.0,
      "features": 0.7,
      "lifestyle": 0.6,
      "timeline": 0.5
    }
  }
  ```
- Matches recalculate on wishlist or Home Profile updates and trigger relevant notifications.

## 6. UI States & Empty States
- Buyer empty: `No matches yet — widen your budget or add more areas.`
- Seller empty: `We found 18 buyers in your area; top match 78%. Upgrade to view trends & contact.`
- Messaging empty: `Upgrade required to start a conversation.`

## 7. Compliance & Privacy
- No PII ever appears in UI strings or payloads.
- All communications stay in-app and are logged.
- Identity disclosures are explicit, gated, and audit logged.

## 8. Engineering Notes
- Keep role/subscription checks in shared guards across frontend and API.
- Recommended routing:
  - `/buyer/dashboard`, `/buyer/wishlists/:id`
  - `/seller/dashboard`, `/seller/homes/:id`
  - `/messages`, `/account/subscription`
- Default branch is `main`; all feature branches follow `feature/<scope>-<desc>` naming.
- Every PR must pass linting and base tests prior to merge.

This specification captures the Realestate Ready demand-led marketplace experience, emphasising buyer-first visibility, privacy-conscious analytics, and revenue-gated outreach tools.
