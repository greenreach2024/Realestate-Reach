# ADR 0001: Cloud platform and maps provider

* **Status**: Proposed
* **Date**: 2024-02-19
* **Decision drivers**:
  * Align early prototypes with the target production environment to reduce rework.
  * Maintain consistency between product specification (Azure leaning) and prototype implementation (recent Google Maps experiments).
  * Leverage managed services that accelerate time-to-market for geospatial matching and communications.

## Context

The Buyer Registry concept requires geospatial search, secure identity management, role-based entitlements, and real-time notifications. The engineering specification highlights Azure Active Directory B2C, Azure PostgreSQL, SignalR, and Cognitive Search, while a recent prototype branch added a Google Maps integration for visualising wishlists.

Running mixed Azure and Google Cloud services introduces duplicated billing, security policies, and SDK maintenance overhead. Choosing a single cloud "golden path" now will streamline the MVP build and make it easier to enable CI/CD, observability, and cost controls.

## Decision

Adopt an **Azure-first** deployment and mapping strategy for the MVP:

* Platform: Azure App Service (or Azure Kubernetes Service for scale), Azure Database for PostgreSQL Flexible Server with PostGIS, Azure Blob Storage, Azure Key Vault, Azure Front Door, and Azure Monitor/Application Insights.
* Identity & access: Azure Active Directory B2C for user authentication with custom policies for buyer, seller, agent, and lender roles.
* Real-time messaging: Azure SignalR Service for chat, notifications, and match updates.
* Geospatial visualisation: Azure Maps Web SDK for the buyer/seller experiences, replacing the experimental Google Maps integration in the prototype.

## Consequences

* Prototype work that relies on Google Maps must be ported to Azure Maps to avoid API key sprawl.
* Engineering teams can take advantage of a consistent Azure security model, including Key Vault and managed identities, when integrating services.
* Future ADRs can focus on service-level concerns (e.g., eventing, search) knowing that Azure is the default.
* If requirements change (e.g., strong preference for Google Maps features), a follow-up ADR should document the rationale for revisiting this decision.

## Alternatives considered

* **Hybrid Azure + Google Cloud** – Provides best-of-breed per service but increases governance and DevOps overhead; rejected for MVP.
* **Full Google Cloud Platform** – Would align with the prototype experiment but contradicts existing stakeholder alignment and documentation; requires re-authoring identity strategy.
* **Multi-tenant SaaS** – Using third-party proptech platforms would reduce build effort but fails the buyer-first differentiation and data ownership goals.
