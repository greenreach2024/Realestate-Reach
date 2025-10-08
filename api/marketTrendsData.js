export const PROVIDER_PRECEDENCE = ['crea', 'teranet', 'statcan', 'cmhc'];

export const trendSeries = [
  {
    provider: 'crea',
    geo_code: 'board:REBGV',
    geo_name: 'Real Estate Board of Greater Vancouver',
    property_type: 'composite',
    metric: 'benchmarkPrice',
    period: '2024-03',
    value: 1234500,
    meta: {
      currency: 'CAD',
      yoyChangePct: 0.068,
      lastUpdated: '2024-03-31',
      coverage: 'REBGV board composite',
      licensed: true,
      precision: 'high',
      ingestedAt: '2024-04-01T03:15:00Z',
      sourceDate: '2024-03-31',
      trend: [
        { period: '2023-04', value: 1085000 },
        { period: '2023-05', value: 1092000 },
        { period: '2023-06', value: 1101000 },
        { period: '2023-07', value: 1110000 },
        { period: '2023-08', value: 1118000 },
        { period: '2023-09', value: 1129000 },
        { period: '2023-10', value: 1142000 },
        { period: '2023-11', value: 1150000 },
        { period: '2023-12', value: 1163000 },
        { period: '2024-01', value: 1184000 },
        { period: '2024-02', value: 1201000 },
        { period: '2024-03', value: 1234500 }
      ]
    }
  },
  {
    provider: 'crea',
    geo_code: 'board:REBGV',
    geo_name: 'Real Estate Board of Greater Vancouver',
    property_type: 'detached',
    metric: 'benchmarkPrice',
    period: '2024-03',
    value: 1527000,
    meta: {
      currency: 'CAD',
      yoyChangePct: 0.072,
      lastUpdated: '2024-03-31',
      coverage: 'REBGV detached benchmark',
      licensed: true,
      precision: 'medium',
      range: { low: 1470000, high: 1580000 },
      ingestedAt: '2024-04-01T03:15:00Z',
      sourceDate: '2024-03-31',
      trend: [
        { period: '2023-04', value: 1380000 },
        { period: '2023-05', value: 1388000 },
        { period: '2023-06', value: 1399000 },
        { period: '2023-07', value: 1406000 },
        { period: '2023-08', value: 1419000 },
        { period: '2023-09', value: 1435000 },
        { period: '2023-10', value: 1458000 },
        { period: '2023-11', value: 1462000 },
        { period: '2023-12', value: 1479000 },
        { period: '2024-01', value: 1498000 },
        { period: '2024-02', value: 1512000 },
        { period: '2024-03', value: 1527000 }
      ]
    }
  },
  {
    provider: 'teranet',
    geo_code: 'cma:59933',
    geo_name: 'Vancouver CMA',
    property_type: 'composite',
    metric: 'benchmarkPrice',
    period: '2024-02',
    value: 987000,
    meta: {
      currency: 'CAD',
      yoyChangePct: 0.042,
      lastUpdated: '2024-02-29',
      coverage: 'Teranet–National Bank HPI',
      licensed: false,
      precision: 'medium',
      range: { low: 965000, high: 1012000 },
      ingestedAt: '2024-03-15T04:05:00Z',
      sourceDate: '2024-02-29',
      trend: [
        { period: '2023-03', value: 948000 },
        { period: '2023-06', value: 952000 },
        { period: '2023-09', value: 964000 },
        { period: '2023-12', value: 978000 },
        { period: '2024-02', value: 987000 }
      ]
    }
  },
  {
    provider: 'statcan',
    geo_code: 'cma:59933',
    geo_name: 'Vancouver CMA',
    property_type: 'new_home',
    metric: 'priceIndex',
    period: '2024-01',
    value: 119.7,
    meta: {
      yoyChangePct: -0.008,
      lastUpdated: '2024-02-15',
      coverage: 'Statistics Canada NHPI',
      licensed: false,
      precision: 'high',
      ingestedAt: '2024-02-16T05:45:00Z',
      sourceDate: '2024-01-31',
      trend: [
        { period: '2023-02', value: 118.3 },
        { period: '2023-05', value: 118.9 },
        { period: '2023-08', value: 119.4 },
        { period: '2023-11', value: 119.5 },
        { period: '2024-01', value: 119.7 }
      ]
    }
  },
  {
    provider: 'cmhc',
    geo_code: 'cma:59933',
    geo_name: 'Vancouver CMA',
    property_type: 'composite',
    metric: 'monthsOfInventory',
    period: '2024-02',
    value: 3.1,
    meta: {
      lastUpdated: '2024-03-10',
      coverage: 'CMHC HMIP',
      precision: 'medium',
      ingestedAt: '2024-03-11T02:00:00Z',
      sourceDate: '2024-02-28',
      trend: [
        { period: '2023-11', value: 4.2 },
        { period: '2023-12', value: 3.9 },
        { period: '2024-01', value: 3.5 },
        { period: '2024-02', value: 3.1 }
      ]
    }
  },
  {
    provider: 'crea',
    geo_code: 'board:TRREB',
    geo_name: 'Toronto Regional Real Estate Board',
    property_type: 'composite',
    metric: 'benchmarkPrice',
    period: '2024-03',
    value: 1138000,
    meta: {
      currency: 'CAD',
      yoyChangePct: -0.012,
      lastUpdated: '2024-03-31',
      coverage: 'TRREB composite benchmark',
      licensed: true,
      precision: 'medium',
      range: { low: 1095000, high: 1180000 },
      ingestedAt: '2024-04-01T04:05:00Z',
      sourceDate: '2024-03-31',
      trend: [
        { period: '2023-04', value: 1169000 },
        { period: '2023-07', value: 1152000 },
        { period: '2023-10', value: 1148000 },
        { period: '2024-01', value: 1135000 },
        { period: '2024-03', value: 1138000 }
      ]
    }
  },
  {
    provider: 'teranet',
    geo_code: 'cma:535',
    geo_name: 'Toronto CMA',
    property_type: 'composite',
    metric: 'benchmarkPrice',
    period: '2024-02',
    value: 902000,
    meta: {
      currency: 'CAD',
      yoyChangePct: -0.018,
      lastUpdated: '2024-02-29',
      coverage: 'Teranet–National Bank HPI',
      licensed: false,
      precision: 'high',
      ingestedAt: '2024-03-14T05:35:00Z',
      sourceDate: '2024-02-29',
      trend: [
        { period: '2023-03', value: 915000 },
        { period: '2023-06', value: 910000 },
        { period: '2023-09', value: 906000 },
        { period: '2023-12', value: 904000 },
        { period: '2024-02', value: 902000 }
      ]
    }
  },
  {
    provider: 'cmhc',
    geo_code: 'cma:535',
    geo_name: 'Toronto CMA',
    property_type: 'composite',
    metric: 'salesToNewListingsRatio',
    period: '2024-02',
    value: 0.51,
    meta: {
      lastUpdated: '2024-03-10',
      coverage: 'CMHC HMIP',
      precision: 'medium',
      ingestedAt: '2024-03-11T02:10:00Z',
      sourceDate: '2024-02-28',
      trend: [
        { period: '2023-11', value: 0.47 },
        { period: '2023-12', value: 0.49 },
        { period: '2024-01', value: 0.5 },
        { period: '2024-02', value: 0.51 }
      ]
    }
  }
];
