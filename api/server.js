import http from 'http';
import { parse } from 'url';
import { PROVIDER_PRECEDENCE, trendSeries } from './marketTrendsData.js';
import {
  createShare,
  deleteShare,
  getHome,
  getHomeOwnerId,
  getShare,
  getWishlistMatchSummary,
  getWishlistSnapshot,
  sanitiseScope,
  updateShare,
  upsertShare,
} from './dataStore.js';

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);
const FALLBACK_GEOS = {
  'board:REBGV': ['cma:59933'],
  'board:TRREB': ['cma:535']
};

const DISCLOSURE_COPY = [
  'For budgeting context only — not financial advice.',
  'Sources are refreshed nightly. Licensed CREA MLS® HPI is prioritised when coverage is available.'
];

function normalisePropertyType(input) {
  if (!input) return 'composite';
  return String(input).trim().toLowerCase();
}

function normaliseGeoCode(input) {
  return String(input ?? '').trim();
}

function providerRank(provider) {
  const index = PROVIDER_PRECEDENCE.indexOf(provider);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function buildSearchOrder(geoCode) {
  const normalised = normaliseGeoCode(geoCode);
  if (!normalised) return [];
  const extras = FALLBACK_GEOS[normalised] ?? [];
  return [normalised, ...extras];
}

function filterSeriesByGeo(geoCandidates) {
  for (const geo of geoCandidates) {
    const matches = trendSeries.filter((series) => series.geo_code === geo);
    if (matches.length) {
      return { geo, matches };
    }
  }
  return { geo: geoCandidates[0] ?? null, matches: [] };
}

function selectPrimaryBenchmark(matches, requestedPropertyType) {
  const propertyFallback = requestedPropertyType === 'composite'
    ? ['composite']
    : [requestedPropertyType, 'composite'];
  const benchmarkCandidates = matches.filter((series) => series.metric === 'benchmarkPrice');
  const sorted = benchmarkCandidates
    .filter((series) => propertyFallback.includes(series.property_type))
    .sort((a, b) => {
      const providerDiff = providerRank(a.provider) - providerRank(b.provider);
      if (providerDiff !== 0) return providerDiff;
      const aIsExact = a.property_type === requestedPropertyType;
      const bIsExact = b.property_type === requestedPropertyType;
      if (aIsExact && !bIsExact) return -1;
      if (bIsExact && !aIsExact) return 1;
      return 0;
    });
  return sorted[0] ?? null;
}

function buildSourceList(matches) {
  return matches
    .sort((a, b) => providerRank(a.provider) - providerRank(b.provider))
    .map((series) => ({
      provider: series.provider,
      metric: series.metric,
      geoCode: series.geo_code,
      propertyType: series.property_type,
      period: series.period,
      lastUpdated: series.meta?.lastUpdated ?? series.period,
      coverage: series.meta?.coverage,
      licensed: Boolean(series.meta?.licensed),
      precedence: providerRank(series.provider) === Number.MAX_SAFE_INTEGER
        ? null
        : providerRank(series.provider) + 1
    }));
}

function buildTrend(series) {
  if (!series?.meta?.trend) return [];
  return series.meta.trend.map((point) => ({
    period: point.period,
    value: point.value
  }));
}

function buildSupplementary(seriesList, primaryMetric = 'benchmarkPrice') {
  return seriesList
    .filter((series) => series.metric !== primaryMetric)
    .map((series) => ({
      provider: series.provider,
      metric: series.metric,
      propertyType: series.property_type,
      period: series.period,
      value: series.value,
      yoyChangePct: series.meta?.yoyChangePct ?? null,
      lastUpdated: series.meta?.lastUpdated ?? series.period,
      trend: buildTrend(series),
      coverage: series.meta?.coverage,
      licensed: Boolean(series.meta?.licensed)
    }));
}

function respondJson(res, statusCode, payload, extraHeaders = {}) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  Object.entries(extraHeaders).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      res.setHeader(key, value);
    }
  });
  if (statusCode === 204) {
    res.end();
    return;
  }
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function parseScopes(headerValue) {
  if (!headerValue) return [];
  return String(headerValue)
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function attachAuthContext(req) {
  const userId = req.headers['x-user-id'] ? String(req.headers['x-user-id']) : null;
  const role = req.headers['x-role'] ? String(req.headers['x-role']) : null;
  const scopes = parseScopes(req.headers['x-scopes']);
  const auth = { userId, role, scopes };
  req.auth = auth;
  return auth;
}

function requireAuth(req, res) {
  const auth = req.auth ?? attachAuthContext(req);
  if (!auth.userId || !auth.role) {
    respondJson(res, 401, { code: 'UNAUTHENTICATED', message: 'Authentication is required for this route.' });
    return null;
  }
  return auth;
}

function isSellerForHome(auth, homeOwnerId) {
  return auth.role === 'seller' && auth.userId === homeOwnerId;
}

function isManagingAgent(auth) {
  return auth.role === 'agent' && auth.scopes.includes('homes:manage');
}

async function canReadSharedHome(req, res, homeId) {
  const auth = requireAuth(req, res);
  if (!auth) {
    return null;
  }

  const ownerId = await Promise.resolve(getHomeOwnerId(homeId));
  if (ownerId && (isSellerForHome(auth, ownerId) || isManagingAgent(auth))) {
    req.shareScope = { address: true, photos: true, profile: true };
    return req.shareScope;
  }

  if (auth.role !== 'buyer') {
    respondJson(res, 403, { code: 'FORBIDDEN', message: 'Only buyers with a valid share grant may view this resource.' });
    return null;
  }

  const share = await Promise.resolve(getShare({ homeId, buyerId: auth.userId }));
  if (!share) {
    respondJson(res, 403, { code: 'NO_SHARE', message: 'Owner has not shared this home.' });
    return null;
  }
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    respondJson(res, 403, { code: 'SHARE_EXPIRED', message: 'Share has expired.' });
    return null;
  }
  req.shareScope = share.scope ?? {};
  return req.shareScope;
}

function buildSharedHomePayload(home, scope = {}) {
  if (!home) return null;
  const safeScope = typeof scope === 'object' && scope !== null ? scope : {};
  return {
    id: home.id,
    type: home.type,
    beds: home.beds,
    baths: home.baths,
    featureSummary: safeScope.profile ? home.feature_summary : undefined,
    photos: safeScope.photos
      ? (Array.isArray(home.photos) ? home.photos.map((photo) => ({ id: photo.id, url: photo.cdn_url })) : [])
      : [],
    address: safeScope.address
      ? home.full_address
      : { area: home.neighbourhood, city: home.city },
  };
}

function buildWishlistAggregateResponse(snapshot) {
  if (!snapshot) return null;
  const topFit = snapshot.topFit
    ? { homeId: snapshot.topFit.homeId, score: snapshot.topFit.score }
    : null;
  return {
    id: snapshot.id,
    matchCount: snapshot.matchCount,
    topFit,
    newSince: snapshot.newSince,
  };
}

function normaliseExpiry(value) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function handleMarketTrends(req, res, query) {
  const geoCode = normaliseGeoCode(query.geoCode ?? query.geo_code);
  const propertyType = normalisePropertyType(query.propertyType ?? query.property_type);

  if (!geoCode) {
    respondJson(res, 400, {
      error: 'geoCode is required',
      detail: 'Pass a geoCode such as board:REBGV or cma:59933 to retrieve market trends.'
    });
    return;
  }

  const searchOrder = buildSearchOrder(geoCode);
  if (!searchOrder.length) {
    respondJson(res, 404, {
      error: 'NotFound',
      detail: `No market trend coverage registered for geoCode ${geoCode}.`
    });
    return;
  }

  const { geo: resolvedGeo, matches } = filterSeriesByGeo(searchOrder);

  if (!matches.length) {
    respondJson(res, 404, {
      error: 'NotFound',
      detail: `No trend series available for ${geoCode} (${propertyType}).`
    });
    return;
  }

  const primary = selectPrimaryBenchmark(matches, propertyType);

  if (!primary) {
    respondJson(res, 404, {
      error: 'NotFound',
      detail: `No benchmarkPrice metric available for ${geoCode} (${propertyType}).`
    });
    return;
  }

  const response = {
    geoCode: resolvedGeo,
    geoName: primary.geo_name,
    propertyType: primary.property_type,
    requestedPropertyType: propertyType,
    metric: primary.metric,
    benchmarkPrice: primary.value,
    currency: primary.meta?.currency ?? 'CAD',
    yoyChangePct: primary.meta?.yoyChangePct ?? null,
    lastUpdated: primary.meta?.lastUpdated ?? primary.period,
    period: primary.period,
    provider: primary.provider,
    trendSeries: buildTrend(primary),
    sources: buildSourceList(matches),
    disclosures: DISCLOSURE_COPY,
    supplementaryMetrics: buildSupplementary(matches)
  };

  if (primary.meta?.range) {
    response.range = {
      low: primary.meta.range.low,
      high: primary.meta.range.high,
      label: 'estimate'
    };
  }

  if (primary.meta?.ingestedAt) {
    response.ingestedAt = primary.meta.ingestedAt;
  }

  const headers = {
    'x-source': `${primary.provider};period=${primary.period}`
  };

  respondJson(res, 200, response, headers);
}

async function handleCreateShare(req, res, homeId) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const home = getHome(homeId);
  if (!home) {
    respondJson(res, 404, { code: 'HOME_NOT_FOUND', message: 'Home not found.' });
    return;
  }

  const ownerId = getHomeOwnerId(homeId);
  if (!(isSellerForHome(auth, ownerId) || isManagingAgent(auth))) {
    respondJson(res, 403, { code: 'FORBIDDEN', message: 'Only the owner or managing agent may share this home.' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    respondJson(res, 400, { code: 'INVALID_JSON', message: 'Body must be valid JSON.', detail: error.message });
    return;
  }

  const buyerId = body?.buyerId ? String(body.buyerId) : null;
  if (!buyerId) {
    respondJson(res, 400, { code: 'INVALID_REQUEST', message: 'buyerId is required.' });
    return;
  }

  const scope = sanitiseScope(body.scope ?? {});
  const expiresAt = normaliseExpiry(body.expiresAt);
  const record = upsertShare(homeId, { buyerId, scope, expiresAt });
  respondJson(res, 201, record);
}

async function handleUpdateShare(req, res, homeId, shareId) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const home = getHome(homeId);
  if (!home) {
    respondJson(res, 404, { code: 'HOME_NOT_FOUND', message: 'Home not found.' });
    return;
  }

  const ownerId = getHomeOwnerId(homeId);
  if (!(isSellerForHome(auth, ownerId) || isManagingAgent(auth))) {
    respondJson(res, 403, { code: 'FORBIDDEN', message: 'Only the owner or managing agent may update share grants.' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    respondJson(res, 400, { code: 'INVALID_JSON', message: 'Body must be valid JSON.', detail: error.message });
    return;
  }

  const updates = {};
  if (typeof body.scope !== 'undefined') {
    updates.scope = sanitiseScope(body.scope);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'expiresAt')) {
    updates.expiresAt = normaliseExpiry(body.expiresAt);
  }

  const record = updateShare(homeId, shareId, updates);
  if (!record) {
    respondJson(res, 404, { code: 'SHARE_NOT_FOUND', message: 'Share not found for this home.' });
    return;
  }
  respondJson(res, 200, record);
}

async function handleDeleteShare(req, res, homeId, shareId) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const home = getHome(homeId);
  if (!home) {
    respondJson(res, 404, { code: 'HOME_NOT_FOUND', message: 'Home not found.' });
    return;
  }

  const ownerId = getHomeOwnerId(homeId);
  if (!(isSellerForHome(auth, ownerId) || isManagingAgent(auth))) {
    respondJson(res, 403, { code: 'FORBIDDEN', message: 'Only the owner or managing agent may revoke shares.' });
    return;
  }

  const success = deleteShare(homeId, shareId);
  if (!success) {
    respondJson(res, 404, { code: 'SHARE_NOT_FOUND', message: 'Share not found for this home.' });
    return;
  }
  respondJson(res, 204, null);
}

async function handleGetSharedHome(req, res, homeId) {
  const scope = await canReadSharedHome(req, res, homeId);
  if (!scope) return;

  const home = getHome(homeId);
  if (!home) {
    respondJson(res, 404, { code: 'HOME_NOT_FOUND', message: 'Home not found.' });
    return;
  }

  const payload = buildSharedHomePayload(home, scope);
  respondJson(res, 200, payload);
}

async function handleWishlistSnapshot(req, res, wishlistId) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const snapshot = getWishlistSnapshot(wishlistId);
  if (!snapshot) {
    respondJson(res, 404, { code: 'WISHLIST_NOT_FOUND', message: 'Wishlist not found.' });
    return;
  }

  const payload = buildWishlistAggregateResponse(snapshot);
  respondJson(res, 200, payload);
}

async function handleWishlistMatches(req, res, wishlistId) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const snapshot = getWishlistSnapshot(wishlistId);
  if (!snapshot) {
    respondJson(res, 404, { code: 'WISHLIST_NOT_FOUND', message: 'Wishlist not found.' });
    return;
  }

  const aggregate = buildWishlistAggregateResponse(snapshot);

  if (auth.role === 'buyer') {
    respondJson(res, 200, {
      ...aggregate,
      homes: [],
      restricted: true,
      message: 'Buyer access is limited to aggregate insights. Request a share grant for itemised details.',
    });
    return;
  }

  const matches = getWishlistMatchSummary(wishlistId);
  respondJson(res, 200, {
    ...aggregate,
    homes: matches,
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname, query } = parse(req.url, true);

  try {
    if (req.method === 'GET' && pathname === '/healthz') {
      respondJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    if (req.method === 'GET' && pathname === '/market-trends') {
      handleMarketTrends(req, res, query);
      return;
    }

    const createShareMatch = pathname.match(/^\/homes\/([^/]+)\/shares$/);
    if (createShareMatch && req.method === 'POST') {
      await handleCreateShare(req, res, createShareMatch[1]);
      return;
    }

    const shareDetailMatch = pathname.match(/^\/homes\/([^/]+)\/shares\/([^/]+)$/);
    if (shareDetailMatch) {
      if (req.method === 'PATCH') {
        await handleUpdateShare(req, res, shareDetailMatch[1], shareDetailMatch[2]);
        return;
      }
      if (req.method === 'DELETE') {
        await handleDeleteShare(req, res, shareDetailMatch[1], shareDetailMatch[2]);
        return;
      }
    }

    const sharedHomeMatch = pathname.match(/^\/shared\/homes\/([^/]+)$/);
    if (sharedHomeMatch && req.method === 'GET') {
      await handleGetSharedHome(req, res, sharedHomeMatch[1]);
      return;
    }

    const wishlistSnapshotMatch = pathname.match(/^\/wishlists\/([^/]+)\/supply-snapshot$/);
    if (wishlistSnapshotMatch && req.method === 'GET') {
      await handleWishlistSnapshot(req, res, wishlistSnapshotMatch[1]);
      return;
    }

    const wishlistMatchesMatch = pathname.match(/^\/wishlists\/([^/]+)\/matched-homes$/);
    if (wishlistMatchesMatch && req.method === 'GET') {
      await handleWishlistMatches(req, res, wishlistMatchesMatch[1]);
      return;
    }

    respondJson(res, 404, { error: 'NotFound', detail: 'Route not found.' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error', error);
    if (!res.headersSent) {
      respondJson(res, 500, { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    } else {
      res.destroy();
    }
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Market trends service listening on :${PORT}`);
});

export default server;
