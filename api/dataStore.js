const homes = new Map([
  ['home-100', {
    id: 'home-100',
    ownerId: 'seller-123',
    type: 'townhouse',
    beds: 3,
    baths: 2,
    feature_summary: 'Three-level end unit with EV-ready parking and a private rooftop terrace.',
    photos: [
      { id: 'home-100-photo-1', cdn_url: 'https://cdn.example.com/homes/home-100/1.jpg' },
      { id: 'home-100-photo-2', cdn_url: 'https://cdn.example.com/homes/home-100/2.jpg' }
    ],
    full_address: '123 Seaview Drive, Port Moody, BC',
    neighbourhood: 'Seaview',
    city: 'Port Moody',
  }],
  ['home-210', {
    id: 'home-210',
    ownerId: 'seller-456',
    type: 'condo',
    beds: 2,
    baths: 2,
    feature_summary: 'Waterfront outlook with flex office and concierge amenities.',
    photos: [
      { id: 'home-210-photo-1', cdn_url: 'https://cdn.example.com/homes/home-210/1.jpg' }
    ],
    full_address: '1702 Aquarius Villas, Vancouver, BC',
    neighbourhood: 'Yaletown',
    city: 'Vancouver',
  }]
]);

const wishlistSnapshots = new Map([
  ['wishlist-1', {
    id: 'wishlist-1',
    matchCount: 27,
    topFit: { homeId: 'home-100', score: 92 },
    newSince: '2024-01-18T00:00:00.000Z'
  }],
  ['wishlist-2', {
    id: 'wishlist-2',
    matchCount: 11,
    topFit: { homeId: 'home-210', score: 88 },
    newSince: '2024-01-11T00:00:00.000Z'
  }]
]);

const wishlistMatchSummaries = new Map([
  ['wishlist-1', [
    {
      id: 'home-100',
      alias: 'Evergreen Terrace Home',
      matchPercent: 92,
      area: 'Port Moody',
      priceBand: '$1.05M - $1.18M'
    },
    {
      id: 'home-210',
      alias: 'Aquarius Villas 1702',
      matchPercent: 81,
      area: 'Vancouver',
      priceBand: '$1.18M - $1.26M'
    }
  ]],
]);

const shares = new Map();
let shareCounter = 0;

const allowedScopeKeys = new Set(['address', 'profile', 'photos']);

function getHomeById(homeId) {
  return homes.get(homeId) ?? null;
}

export function getHomeOwnerId(homeId) {
  const home = getHomeById(homeId);
  return home?.ownerId ?? null;
}

export function getHome(homeId) {
  return getHomeById(homeId);
}

export function sanitiseScope(scope = {}) {
  if (typeof scope !== 'object' || scope === null) {
    return {};
  }
  return Object.entries(scope).reduce((acc, [key, value]) => {
    if (allowedScopeKeys.has(key) && Boolean(value)) {
      acc[key] = true;
    }
    return acc;
  }, {});
}

export function createShare(homeId, { buyerId, scope, expiresAt }) {
  const id = `share-${++shareCounter}`;
  const now = new Date().toISOString();
  const sanitisedScope = sanitiseScope(scope);
  const record = {
    id,
    home_id: homeId,
    buyer_id: buyerId,
    scope: sanitisedScope,
    created_at: now,
    updated_at: now,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
  };
  shares.set(id, record);
  return record;
}

export function updateShare(homeId, shareId, { scope, expiresAt }) {
  const existing = shares.get(shareId);
  if (!existing || existing.home_id !== homeId) {
    return null;
  }
  const sanitisedScope = typeof scope === 'undefined' ? existing.scope : sanitiseScope(scope);
  const updated = {
    ...existing,
    scope: sanitisedScope,
    updated_at: new Date().toISOString(),
    expires_at: typeof expiresAt === 'undefined' || expiresAt === null
      ? null
      : new Date(expiresAt).toISOString(),
  };
  shares.set(shareId, updated);
  return updated;
}

export function deleteShare(homeId, shareId) {
  const existing = shares.get(shareId);
  if (!existing || existing.home_id !== homeId) {
    return false;
  }
  return shares.delete(shareId);
}

export function getShare({ homeId, buyerId }) {
  for (const share of shares.values()) {
    if (share.home_id === homeId && share.buyer_id === buyerId) {
      return share;
    }
  }
  return null;
}

export function getShareById(homeId, shareId) {
  const share = shares.get(shareId);
  if (!share || share.home_id !== homeId) {
    return null;
  }
  return share;
}

export function upsertShare(homeId, { buyerId, scope, expiresAt }) {
  const existing = getShare({ homeId, buyerId });
  if (existing) {
    return updateShare(homeId, existing.id, { scope, expiresAt });
  }
  return createShare(homeId, { buyerId, scope, expiresAt });
}

export function getWishlistSnapshot(wishlistId) {
  return wishlistSnapshots.get(wishlistId) ?? null;
}

export function getWishlistMatchSummary(wishlistId) {
  return wishlistMatchSummaries.get(wishlistId) ?? [];
}

export function listSharesForHome(homeId) {
  return Array.from(shares.values()).filter((share) => share.home_id === homeId);
}

export function resetShares() {
  shares.clear();
  shareCounter = 0;
}
