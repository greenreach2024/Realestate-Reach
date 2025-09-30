# Buyer Registry – UX & Engineering Specification

## Overview
Buyer Registry is a buyer-centric real estate marketplace that inverts the traditional MLS model. Buyers publish detailed wishlists outlining the homes they want, while sellers, realtors, and mortgage agents subscribe to match against that demand, unlock insights, and communicate through the platform. This document summarises the planned user experience, feature set, data flows, and Azure-centric architecture required to deliver the platform.

## User Roles & Access Control
- **Buyer** (free): Creates one or more wishlists that capture desired locations, pricing, timelines, and feature preferences. Buyers can view matches but can only converse once a seller or agent initiates contact. Optional mortgage pre-approval badges and lender contact opt-ins enhance their visibility.
- **Seller / Homeowner**: Publishes property listings. Free sellers receive aggregate demand metrics (match counts, scores); paid sellers unlock buyer detail, messaging, and analytics.
- **Realtor / Agent**: Licensed professionals on a paid Pro tier. They manage listings for multiple sellers and access advanced regional analytics, buyer insights, and proactive outreach tools.
- **Mortgage Agent / Lender**: Subscription users that receive buyer leads who either request contact or lack pre-approval, enabling targeted financing conversations.
- **Administrator / Developer** (future): Elevated access to raw analytics for industry insights, powered by the same data pipelines.

Role-based access is enforced through middleware that verifies both role and subscription tier before granting permissions (e.g., viewing buyer profiles, initiating chat).

## Onboarding & Authentication
1. **Landing Page & Role Selection**: Public marketing page routes new users to role-specific onboarding.
2. **Account Creation**: Azure AD B2C (or similar) provides email/social sign-up with MFA, CAPTCHA, and verified email. Roles are assigned during registration.
3. **Buyer Onboarding**: Collects personal details, budget, purchase timeline, mortgage status, and optional document uploads prior to first wishlist creation.
4. **Seller Onboarding**: Guided wizard for property details, media uploads, and optional agent linkage.
5. **Agent Onboarding**: Captures licensing details, validates credentials, and collects subscription payment prior to dashboard access.
6. **Mortgage Agent Onboarding**: Registers company credentials, preferred regions, and handles subscription payment.
7. **Subscription & Payments**: Paid roles are checked at login; upgrades handled via Stripe (or equivalent) with contextual upgrade prompts.
8. **Navigation Patterns**: Authenticated app features a top navigation bar (dashboard, messages, account) and contextual side navigation per role. Multi-role users can switch roles.

## Buyer Experience
### Dashboard
- Wishlist cards summarising match counts and recent activity.
- Quick actions for wishlist creation and profile management.
- Notifications for new matches, unread messages, and system alerts.
- Optional insights showing market demand statistics for selected areas.

### Wishlist Creation & Management
- Multi-step wizard capturing name/description, geospatial preferences (map tools, postal codes, polygons), budget, property requirements, must-have vs. nice-to-have features, lifestyle amenities, timeline, and financing status.
- Opt-in flag exposes buyers to mortgage agents; pre-approved status surfaces as a badge.
- Upon save, the matchmaking engine runs, returning counts and top match scores.
- Management console provides edit/duplicate/delete, analytics per wishlist (match distribution, budget insights), and the ability to archive/disable wishlists.

### Messaging
- Inbox of chat threads scoped by listing/wishlist with anonymised counterpart identifiers.
- Real-time chat powered by WebSockets/Azure SignalR with optional attachments.
- Messaging access unlocked once counterpart engages or permissions allow.

### Notifications & Settings
- Email/push alerts for matches and messages with configurable frequency.
- Profile page for personal data updates, password changes, notification preferences, and document status.

## Seller Experience
### Dashboard & Listings
- Card/table view of listings with thumbnails, core property facts, match score, count of matching buyers, and listing status.
- Filters and quick actions to add new listings.

### Listing Workflow
- Address lookup, property attributes, pricing details, photo/document uploads, description, and feature tagging.
- Saving triggers matchmaking to calculate buyer matches and presents immediate feedback.
- Free tier emphasises aggregate stats with upgrade prompts; paid tier reveals detailed buyer insights.

### Analytics & Messaging
- Demand analytics visualising buyer budgets, feature interest, geography, and timelines; pro tiers gain trend analyses and comparisons across listings.
- Integrated messaging mirrors buyer interface, enabling seller-initiated chats with matched buyers when unlocked.
- Notifications for new matches, messages, listing engagement, and subscription reminders.

### Settings
- Manage profile data, associate co-sellers or agents, and handle billing/subscription management.

## Realtor / Agent Experience
- **Regional Analytics Dashboard** with demand heatmaps, buyer funnel metrics, filterable insights, drill-down wishlists, and data export.
- **Listing Management** supporting multiple sellers, co-listing, and bulk uploads.
- **Buyer Prospecting Tools** enabling match listings→buyers, buyers→listings, and multi-listing demand assessment.
- **Advanced Analytics** covering feature trends, price distributions, buyer timelines, supply-demand comparisons, and future pre-construction dashboards.
- **Messaging** with buyers and sellers, including group chats and compliance logging.
- **Notifications & Subscription Management** for demand shifts, buyer status changes, and plan administration.

## Mortgage Agent Experience
- **Lead Dashboard** listing buyers who opted in or lack pre-approval, filterable by location, budget, and timeline.
- **Lead Detail & Outreach** flows open secure chats to discuss financing options.
- **Lead Analytics** summarising mortgage-related demand metrics.
- **Profile & Billing** pages for credentials, coverage regions, availability, and subscription details.

## Data Architecture & Matchmaking
- **Database**: Azure Database for PostgreSQL (with PostGIS) stores Buyers, Buyer_Wishlists, Buyer_Wishlist_Locations, Buyer_Wishlist_Features, Sellers/Listings, Matches, Agents, Subscriptions, Messages, and Notifications.
- **Search Index**: Azure Cognitive Search or Elasticsearch indexes listings and wishlist locations for performant geospatial and feature queries.
- **Matchmaking Engine**: Triggered on wishlist or listing changes via Azure Functions/background jobs.
  - Candidate selection uses geo and budget filters.
  - Scoring factors include location, price (mandatory), property type, feature fit (must-have vs nice-to-have), lifestyle amenities, and timeline alignment.
  - Weighted scoring outputs a normalised percentage stored in Matches.
  - Notifications dispatched when thresholds or new matches occur.
- **Demand Analytics Pipelines**: Scheduled jobs aggregate demand metrics, time-series trends, and buyer insights served via APIs and cached views.
- **Security**: PII encrypted at rest; role-based checks at API level; audit logs for key actions.

## Messaging & Notifications
- Real-time chat via Azure SignalR with persisted messages and moderation filters.
- Notification system (Azure Functions + Service Bus/Queue) orchestrates email/push/SMS alerts for matches, messages, system events, and subscription states using services like SendGrid or Azure Communication Services.
- User-configurable notification channels and frequency (instant vs digest).

## Subscription & Monetisation
- Tiering: Buyers free; Sellers (Free vs Paid), Agents (Basic vs Pro), Mortgage Agents (Paid), Developers/Institutions (future paid analytics).
- Feature gating enforced both in UI and backend middleware.
- Centralised upgrade flows and billing management via Subscriptions table integrated with Stripe/Moneris.

## Azure Infrastructure Overview
- **Authentication**: Azure AD B2C with custom attributes for roles/licensing.
- **Hosting**: Frontend (React) on Azure Static Web Apps/App Service; backend (Node.js/Express or Django) on App Service or AKS.
- **Storage**: Azure Blob Storage for media with CDN distribution.
- **Messaging**: Azure SignalR Service for chat.
- **Background Processing**: Azure Functions/Logic Apps plus Queue Storage or Service Bus for matchmaking and notifications.
- **Notifications**: Azure Notification Hubs + SendGrid/Azure Communication Services.
- **Monitoring**: Azure Monitor and Application Insights for telemetry.
- **Security & Compliance**: Encryption at rest, HTTPS everywhere, Azure Key Vault for secrets, PIPEDA-compliant hosting.

## Security & Compliance Considerations
- Identity/document verification for buyers (ID, mortgage approval) and agents (license validation).
- Encryption in transit and at rest; avoid storing highly sensitive identifiers.
- Enforced in-app communication keeps personal contact details private.
- Audit trails for significant actions and legal acceptance logging (ToS, privacy policy).

## Appendix: High-Level Data Flow
1. User creates/updates wishlist or listing.
2. Event triggers matchmaking job.
3. Geo-search + filters identify candidate matches.
4. Match score calculated and stored.
5. Notifications sent and dashboards updated.
6. Aggregation jobs periodically update analytics datasets.

This specification consolidates the UX flows, feature gating, backend logic, and Azure platform choices required to build Buyer Registry’s demand-led marketplace.
