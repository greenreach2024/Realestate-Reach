export const HOME_SHARE_SCOPE_DEFAULTS = Object.freeze({
  alias: false,
  specs: false,
  priceExpectation: false,
  timeline: false,
  area: false,
  insights: false,
  address: false,
  photos: false,
});

function normaliseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function projectShareScope(scope = {}) {
  return Object.fromEntries(
    Object.entries(HOME_SHARE_SCOPE_DEFAULTS).map(([key, defaultValue]) => [
      key,
      scope[key] === undefined ? defaultValue : Boolean(scope[key]),
    ]),
  );
}

export function normaliseShareGrant(share) {
  if (!share || typeof share !== 'object') return null;
  const grantedAt = normaliseDate(share.grantedAt) ?? new Date(0);
  const revokedAt = normaliseDate(share.revokedAt);
  return {
    ...share,
    grantedAt,
    revokedAt,
    scope: projectShareScope(share.scope),
  };
}

export function isShareActive(share, now = new Date()) {
  if (!share) return false;
  if (typeof share.status === 'string' && share.status.toLowerCase() === 'revoked') {
    return false;
  }
  const revokedAt = normaliseDate(share.revokedAt);
  if (!revokedAt) return true;
  return revokedAt.getTime() > now.getTime();
}

export function buildHomeShareIndex(shares = [], now = new Date()) {
  const index = new Map();
  const sorted = [...shares].sort((a, b) => {
    const aTime = normaliseDate(a?.grantedAt)?.getTime() ?? 0;
    const bTime = normaliseDate(b?.grantedAt)?.getTime() ?? 0;
    return aTime - bTime;
  });
  sorted.forEach((share) => {
    applyHomeShareUpdate(index, share, now);
  });
  return index;
}

export function applyHomeShareUpdate(index, share, now = new Date()) {
  if (!(index instanceof Map)) {
    throw new TypeError('homeShareIndex must be a Map');
  }
  if (!share?.wishlistId || !share?.homeId) {
    return null;
  }
  const key = `${share.wishlistId}:${share.homeId}`;
  if (!isShareActive(share, now)) {
    index.delete(key);
    return null;
  }
  const grant = normaliseShareGrant(share);
  index.set(key, grant);
  return grant;
}

export function getHomeShareGrant(index, wishlistId, homeId) {
  if (!(index instanceof Map) || !wishlistId || !homeId) {
    return null;
  }
  return index.get(`${wishlistId}:${homeId}`) ?? null;
}

export function shareAllowsField(grant, field) {
  if (!grant) return false;
  if (!Object.prototype.hasOwnProperty.call(grant.scope ?? {}, field)) {
    return false;
  }
  return Boolean(grant.scope[field]);
}
