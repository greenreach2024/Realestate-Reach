# Share Object – Data Model (PostgreSQL)

## Purpose
The `shares` table governs the privacy contract between a seller-owned Home Profile and a buyer. A Share is created only when an
owner explicitly opts in to show a buyer additional details. It encodes:

- which Home Profile is being shared,
- the buyer (and optional wishlist) receiving access,
- the exact fields that may be rendered inside the permissioned Shared Home View,
- whether messaging is unlocked, and
- lifecycle events such as expiry or revocation.

This object is the source of truth for what a buyer can see beyond aggregate match counts. UI surfaces must query the share to
determine whether to load photos, specifications, or address details.

## Schema Overview

### Enumerations
```sql
CREATE TYPE share_status AS ENUM ('pending', 'active', 'revoked', 'expired');
```

### Table: `shares`
| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (`DEFAULT gen_random_uuid()`). |
| `home_profile_id` | `uuid` | `NOT NULL` → references `home_profiles(id)` (`ON DELETE CASCADE`). |
| `owner_account_id` | `uuid` | `NOT NULL` → references `accounts(id)`; must match the Home Profile owner. |
| `buyer_account_id` | `uuid` | `NOT NULL` → references `accounts(id)` (buyers only). |
| `buyer_wishlist_id` | `uuid` | Nullable → references `buyer_wishlists(id)`; ties context for analytics. |
| `status` | `share_status` | `NOT NULL DEFAULT 'pending'`. Only `active` shares unlock detail views. |
| `granted_capabilities` | `jsonb` | `NOT NULL`; structured payload describing which fields are exposed. |
| `allow_chat` | `boolean` | `NOT NULL DEFAULT false`; becomes true when seller explicitly enables messaging for this share. |
| `share_token` | `text` | `NOT NULL UNIQUE`; short-lived identifier used for deep links/notifications. |
| `expires_at` | `timestamptz` | Optional expiry. When elapsed, status transitions to `expired`. |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()`. |
| `created_by` | `uuid` | `NOT NULL` → references `accounts(id)` (who initiated the share). |
| `updated_at` | `timestamptz` | `NOT NULL DEFAULT now()`; maintained by triggers. |
| `revoked_at` | `timestamptz` | Set when owner rescinds access. |
| `revoked_by` | `uuid` | References `accounts(id)`; who revoked. |
| `last_viewed_at` | `timestamptz` | Updated when buyer opens the Shared Home View. |

Recommended indexes:
```sql
CREATE INDEX shares_home_profile_idx ON shares (home_profile_id) WHERE status = 'active';
CREATE INDEX shares_buyer_idx ON shares (buyer_account_id) WHERE status = 'active';
CREATE UNIQUE INDEX shares_unique_active ON shares (home_profile_id, buyer_account_id, coalesce(buyer_wishlist_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE status = 'active';
```

### Granted Capabilities Payload
`granted_capabilities` is a normalized JSONB object to express field-level permissions. Example:
```json
{
  "fields": {
    "summary": true,
    "photos": true,
    "specs": ["beds", "baths", "square_feet"],
    "address": { "mask_level": "block" },
    "pricing": { "expectation": true, "history": false }
  },
  "documents": ["feature_sheet_pdf"],
  "notes": "Shared for Taylor K. – expires after staging is complete"
}
```
Rules:
- `fields.summary` must be true for any share (fallback view).
- Addresses default to masked (`mask_level = 'block'` or `'neighbourhood'`); `mask_level = 'full'` must be explicitly granted.
- UI derives which sections to render by inspecting this payload—no field is shown unless explicitly truthy.

### Lifecycle
1. **pending** – share created but not yet delivered (e.g., awaiting double opt-in). Buyers cannot see details.
2. **active** – share visible to the buyer; Shared Home View surfaces permitted fields. Notifications point to `/shares/{share_token}`.
3. **revoked** – owner rescinds access; share is removed from buyer view but retained for audit history.
4. **expired** – system moves share out of circulation at `expires_at` or when the Home Profile is archived.

Audit needs are covered by appending rows into `share_events` (append-only) whenever status or capabilities change:
```sql
CREATE TABLE share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_account_id uuid NOT NULL REFERENCES accounts(id)
);
```
This table powers compliance reporting and buyer notifications.

### Access Enforcement
- Shared Home View queries require `WHERE share_token = $1 AND status = 'active'` and must join `home_profiles` using a policy that
  checks `shares.buyer_account_id = current_buyer_id()`.
- REST controllers expose `/shares/:token` returning only allowed fields derived from `granted_capabilities`.
- Chat access is unlocked when `allow_chat = true`; otherwise the UI keeps the contact button disabled.
- Any analytic counts remain available without a share; record-level details always pass through this access check.

### Notifications & Deep Links
When a share becomes `active`, the notifier service emits:
- an in-app notification referencing the share token,
- optional email/SMS copy containing the deep link (token only; no direct IDs), and
- metadata for telemetry (`share_id`, `home_profile_id`, `buyer_wishlist_id`).

These signals allow the buyer UI to route directly to a scoped Shared Home View while respecting the opt-in controls described in
section A of the spec.
