import http from 'http';
import { parse } from 'url';
import { PROVIDER_PRECEDENCE, trendSeries } from './marketTrendsData.js';

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
  res.end(JSON.stringify(payload));
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

const server = http.createServer((req, res) => {
  const { pathname, query } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/healthz') {
    respondJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  if (req.method === 'GET' && pathname === '/market-trends') {
    handleMarketTrends(req, res, query);
    return;
  }

  respondJson(res, 404, { error: 'NotFound', detail: 'Route not found.' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Market trends service listening on :${PORT}`);
});

export default server;
