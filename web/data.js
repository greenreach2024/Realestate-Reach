export const homeShares = [
  {
    id: 'share-1',
    wishlistId: 'wishlist-1',
    homeId: 'home-1',
    grantedAt: '2024-03-18T16:05:00Z',
    scope: {
      alias: true,
      specs: true,
      priceExpectation: true,
      timeline: true,
      area: true,
      insights: true,
      address: false,
      photos: false,
    },
  },
  {
    id: 'share-2',
    wishlistId: 'wishlist-1',
    homeId: 'home-sim-417',
    grantedAt: '2024-02-01T08:00:00Z',
    revokedAt: '2024-03-01T12:00:00Z',
    scope: {
      alias: true,
      specs: true,
      priceExpectation: true,
      timeline: false,
      area: false,
      insights: false,
      address: false,
      photos: false,
    },
  },
];

export const buyers = [
  {
    id: 'buyer-1',
    alias: 'Taylor K.',
    wishlists: [
      {
        id: 'wishlist-1',
        name: 'Port Moody Family Haven',
        summary: 'Detached home near parks with space for hybrid work and EV charging.',
        matchRange: '68-92%',
        matchedProfiles: 18,
        topScore: 92,
        budget: { min: 950000, max: 1200000 },
        timeline: '3-6m',
        preApproved: true,
        active: true,
        details: { type: 'Detached house', beds: 3, baths: 3, sizeMin: 1900, sizeMax: null },
        locations: [
          { id: 'loc-1', label: 'Port Moody Centre polygon', type: 'polygon', value: 'polygon-123', priority: 1, count: 12 },
          { id: 'loc-2', label: 'Pleasantside radius', type: 'radius', value: 'radius-450m', priority: 2, count: 6 },
        ],
        features: {
          must: ['Backyard', 'Dedicated office', 'EV-ready parking'],
          nice: ['Secondary suite', 'Trail access'],
        },
        analytics: {
          supplyCount: 18,
          gap: 'Typical profiles nearby: 2 baths; you require 3.',
          trend: 'Demand in Port Moody Centre up 12% this month.',
        },
        stats: {
          matchingHomes: 18,
          topFit: 92,
          newMatches: 5,
          upgradeEligible: true,
        },
        fitBreakdown: {
          location: 0.93,
          price: 1,
          mustHave: 0.86,
          niceToHave: 0.6,
        },
        matches: [
          {
            id: 'wishlist-1-match-1',
            homeId: 'home-1',
            alias: 'Evergreen Terrace Home',
            maskedAlias: 'Home · 4821',
            fitPercent: 92,
            priceExpectation: 985000,
            type: 'Detached house',
            beds: 4,
            baths: 3,
            areaTag: 'Port Moody Centre',
            timelineAlignment: 'Owner exploring a 3-6 month move',
            newThisWeek: true,
            fitBreakdown: {
              location: 0.94,
              price: 1,
              mustHave: 0.86,
              niceToHave: 0.62,
            },
            factors: [
              {
                label: 'Location coverage',
                value: 0.94,
                note: 'Polygon and radius overlap give near-perfect geo alignment.',
              },
              {
                label: 'Price fit',
                value: 1,
                note: 'Owner expectation inside your $1.2M ceiling.',
              },
              {
                label: 'Must-have coverage',
                value: 0.86,
                note: 'Backyard, office, EV parking satisfied; secondary suite missing.',
              },
              {
                label: 'Nice-to-have coverage',
                value: 0.62,
                note: 'Trail access nearby but no suite for multi-generational living.',
              },
            ],
            note: 'High intent homeowner prepping Home Profile materials; 60-day closing ideal.',
          },
          {
            id: 'wishlist-1-match-2',
            homeId: 'home-sim-417',
            alias: 'Heritage Mountain Retreat',
            maskedAlias: 'Home · 4172',
            fitPercent: 87,
            priceExpectation: 1120000,
            type: 'Detached house',
            beds: 4,
            baths: 3,
            areaTag: 'Heritage Mountain',
            timelineAlignment: 'Owner targeting 6-9 month downsizing',
            newThisWeek: false,
            fitBreakdown: {
              location: 0.88,
              price: 0.92,
              mustHave: 0.82,
              niceToHave: 0.58,
            },
            factors: [
              {
                label: 'Location coverage',
                value: 0.88,
                note: 'Inside your Polygon priority but higher elevation than radius.',
              },
              {
                label: 'Price fit',
                value: 0.92,
                note: 'Seller aims for $1.12M — still within max budget.',
              },
              {
                label: 'Must-have coverage',
                value: 0.82,
                note: 'Dedicated office convertible loft meets work-from-home need.',
              },
              {
                label: 'Nice-to-have coverage',
                value: 0.58,
                note: 'Backyard backs onto greenbelt but no income suite.',
              },
            ],
            note: 'Owner will consider including Level 2 charger with acceptable offer.',
          },
          {
            id: 'wishlist-1-match-3',
            homeId: 'home-sim-903',
            alias: 'Pleasantside Modern Build',
            maskedAlias: 'Home · 9038',
            fitPercent: 81,
            priceExpectation: 1250000,
            type: 'Detached house',
            beds: 3,
            baths: 3,
            areaTag: 'Pleasantside',
            timelineAlignment: 'Owner open to off-market conversations',
            newThisWeek: true,
            fitBreakdown: {
              location: 0.9,
              price: 0.78,
              mustHave: 0.74,
              niceToHave: 0.52,
            },
            factors: [
              {
                label: 'Location coverage',
                value: 0.9,
                note: 'Wishlist radius coverage fully covers the street segment.',
              },
              {
                label: 'Price fit',
                value: 0.78,
                note: 'Owner wants $1.25M — outside stated ceiling unless flexibility added.',
              },
              {
                label: 'Must-have coverage',
                value: 0.74,
                note: 'EV parking ready; office currently shared loft space.',
              },
              {
                label: 'Nice-to-have coverage',
                value: 0.52,
                note: 'Trail access nearby; no suite potential without renovation.',
              },
            ],
            note: 'Would entertain rent-back to align with your 3-6 month timeline.',
          },
        ],
        market: {
          area: 'Port Moody & Pleasantside',
          estimatedRange: { low: 965000, high: 1180000 },
          paymentEstimate: '$5,210/mo · 20% down · 5.5% fixed (OSFI MQR 7.5%)',
          trend: {
            change: '+6.8% YoY',
            values: [68, 69, 70, 71, 72, 74, 76, 77, 79, 80, 82, 84],
          },
          sources: ['CREA HPI', 'Teranet-NB HPI', 'CMHC', 'RBC'],
          commentary: 'Tri-Cities detached values keep climbing as inventory stays tight. Sellers monitor serious buyers before going public.',
        },
      },
      {
        id: 'wishlist-2',
        name: 'False Creek Waterfront Condo',
        summary: 'Lock-and-leave condo with concierge support and seawall access.',
        matchRange: '54-80%',
        matchedProfiles: 9,
        topScore: 80,
        budget: { min: 780000, max: 950000 },
        timeline: '0-3m',
        preApproved: false,
        active: true,
        details: { type: 'Condo', beds: 2, baths: 2, sizeMin: 900, sizeMax: 1200 },
        locations: [
          { id: 'loc-3', label: 'Olympic Village radius', type: 'radius', value: 'radius-300m', priority: 1, count: 5 },
          { id: 'loc-4', label: 'Coal Harbour pin', type: 'pin', value: 'pin-123', priority: 2, count: 4 },
        ],
        features: {
          must: ['Water view', 'Secure parking'],
          nice: ['Concierge', 'Fitness centre', 'Guest suite'],
        },
        analytics: {
          supplyCount: 9,
          gap: 'Most Home Profiles here include 1.5 baths; you need 2.',
          trend: 'Demand spike in Olympic Village up 7% this week.',
        },
        stats: {
          matchingHomes: 9,
          topFit: 80,
          newMatches: 2,
          upgradeEligible: false,
        },
        fitBreakdown: {
          location: 0.88,
          price: 0.96,
          mustHave: 0.74,
          niceToHave: 0.55,
        },
        matches: [
          {
            id: 'wishlist-2-match-1',
            homeId: 'home-2',
            alias: 'Seawalk Condo (Private)',
            maskedAlias: 'Home · 7710',
            fitPercent: 80,
            priceExpectation: 915000,
            type: 'Condo',
            beds: 2,
            baths: 2,
            areaTag: 'False Creek',
            timelineAlignment: 'Owner monitoring market · flexible within 3 months',
            newThisWeek: true,
            fitBreakdown: {
              location: 0.9,
              price: 0.96,
              mustHave: 0.72,
              niceToHave: 0.58,
            },
            factors: [
              {
                label: 'Location coverage',
                value: 0.9,
                note: 'Within Olympic Village radius and seawall proximity requirement.',
              },
              {
                label: 'Price fit',
                value: 0.96,
                note: 'Expectation sits just under your $950K ceiling.',
              },
              {
                label: 'Must-have coverage',
                value: 0.72,
                note: 'Water view and secure parking checked; concierge optional add-on.',
              },
              {
                label: 'Nice-to-have coverage',
                value: 0.58,
                note: 'Guest suite missing but fitness amenity present.',
              },
            ],
            note: 'Owner would allow pre-inspection ahead of a soft Home Profile reveal.',
          },
          {
            id: 'wishlist-2-match-2',
            homeId: 'home-sim-992',
            alias: 'Aquabus Marina Loft',
            maskedAlias: 'Home · 9924',
            fitPercent: 74,
            priceExpectation: 970000,
            type: 'Condo',
            beds: 2,
            baths: 2,
            areaTag: 'Olympic Village',
            timelineAlignment: 'Owner relocating abroad · wants 60-90 day close',
            newThisWeek: false,
            fitBreakdown: {
              location: 0.86,
              price: 0.88,
              mustHave: 0.7,
              niceToHave: 0.5,
            },
            factors: [
              {
                label: 'Location coverage',
                value: 0.86,
                note: 'Steps from seawall but slightly east of preferred polygon.',
              },
              {
                label: 'Price fit',
                value: 0.88,
                note: 'Asking stretches past current budget by $20K.',
              },
              {
                label: 'Must-have coverage',
                value: 0.7,
                note: 'Water glimpse not full view; parking secured.',
              },
              {
                label: 'Nice-to-have coverage',
                value: 0.5,
                note: 'Concierge present; guest suite absent.',
              },
            ],
            note: 'Owner invites early offers in exchange for flexible possession.',
          },
          {
            id: 'wishlist-2-match-3',
            homeId: 'home-sim-221',
            alias: 'Coal Harbour Pied-à-terre',
            maskedAlias: 'Home · 2216',
            fitPercent: 68,
            priceExpectation: 930000,
            type: 'Condo',
            beds: 2,
            baths: 2,
            areaTag: 'Coal Harbour',
            timelineAlignment: 'Owner testing demand quietly',
            newThisWeek: false,
            fitBreakdown: {
              location: 0.78,
              price: 0.94,
              mustHave: 0.68,
              niceToHave: 0.46,
            },
            factors: [
              {
                label: 'Location coverage',
                value: 0.78,
                note: 'Outside initial radius but still waterfront with marina access.',
              },
              {
                label: 'Price fit',
                value: 0.94,
                note: 'Expectation aligns with $950K cap with room for fees.',
              },
              {
                label: 'Must-have coverage',
                value: 0.68,
                note: 'Secure parking confirmed; view partial due to neighbouring tower.',
              },
              {
                label: 'Nice-to-have coverage',
                value: 0.46,
                note: 'Concierge available; fitness centre compact.',
              },
            ],
            note: 'Homeowner curious about rent-to-own structures if buyer timing shifts.',
          },
        ],
        market: {
          area: 'False Creek & Downtown Waterfront',
          estimatedRange: { low: 835000, high: 975000 },
          paymentEstimate: '$4,110/mo · 20% down · 5.4% fixed (OSFI MQR 7.4%)',
          trend: {
            change: '+4.1% YoY',
            values: [64, 63, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75],
          },
          sources: ['CREA HPI', 'Teranet-NB HPI', 'CMHC', 'RBC'],
          commentary: 'Waterfront condo pricing rebounded this spring as investors re-entered the market.',
        },
      },
    ],
    messages: [
      {
        id: 'thread-31',
        counterparty: 'Seller · Evergreen Terrace',
        wishlistId: 'wishlist-1',
        preview: 'We are prepping a Home Profile that hits 90% of your wishlist. Want anonymised specs?',
        status: 'Reply ready',
        disclosureRequested: false,
      },
      {
        id: 'thread-48',
        counterparty: 'Agent Pro · Maya S.',
        wishlistId: 'wishlist-2',
        preview: 'A waterfront homeowner authorised outreach — 78% match. Shall I share anonymised media?',
        status: 'Muted',
        disclosureRequested: true,
      },
    ],
    notifications: [
      { id: 'note-1', type: 'match', message: 'New Home Profile matches Port Moody Family Haven at 91%.' },
      { id: 'note-2', type: 'trend', message: 'Demand in Olympic Village is trending +7% week over week.' },
    ],
  },
];

export const buyerMapRegions = [
  // Added lat/lng to support Leaflet map rendering
  { id: 'region-1', label: 'Port Moody Centre', count: 12, lat: 49.2838, lng: -122.8311, x: 32, y: 48 },
  { id: 'region-2', label: 'Pleasantside', count: 6, lat: 49.3006, lng: -122.9000, x: 18, y: 62 },
  { id: 'region-3', label: 'Olympic Village', count: 5, lat: 49.2706, lng: -123.1036, x: 58, y: 38 },
  { id: 'region-4', label: 'Coal Harbour', count: 4, lat: 49.2917, lng: -123.1239, x: 72, y: 22 },
];

export const homeProfiles = [
  {
    id: 'home-1',
    nickname: 'Evergreen Terrace Home',
    address: '123 Evergreen Terrace, Port Moody, BC',
    status: 'Open to offers',
    priceExpectation: 985000,
    location: 'Port Moody (approx.)',
    lat: 49.289,
    lng: -122.84,
    summary: '4 bed, 3 bath craftsman home with EV-ready garage and mature trees.',
    matchScore: 88,
    matchBand: 'Top match 92%',
    matchedBuyers: 26,
    gapHint: 'Most buyers want 3 baths; you currently list 2.5.',
    topWishlistSnippet: 'Port Moody Family Haven · budget up to $1.2M · 3-6m timeline',
    heroImage:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    specs: {
      type: 'Detached house',
      beds: 4,
      baths: 3,
      parking: 'EV-ready 2-car garage',
      size: '2,480 sq ft',
      lot: '6,500 sq ft lot',
      built: '2014',
    },
    demandSnapshot: {
      matchCount: 26,
      topMatch: 92,
      preapprovedCount: 14,
      newSince: 5,
    },
    wishlistFit: {
      location: 0.94,
      price: 1,
      mustHave: 0.86,
      niceToHave: 0.62,
    },
    buyerMatches: [
      {
        id: 'home-1-match-1',
        alias: 'Taylor K.',
        maskedAlias: 'Buyer · 4821',
        matchPercent: 92,
        preApproved: true,
        budget: { min: 950000, max: 1200000 },
        timeline: '3-6 months',
        locationTag: 'Port Moody Centre',
        isNew: true,
        mustHaveStatus: {
          met: ['Backyard', 'Dedicated office', 'EV-ready parking'],
          missing: ['Secondary suite'],
        },
        contributions: [
          { factor: 'Location fit', value: 0.48 },
          { factor: 'Price alignment', value: 0.2 },
          { factor: 'Features', value: 0.22 },
          { factor: 'Lifestyle', value: 0.1 },
        ],
        summary: 'Hits EV-ready parking and home office requirements; lacks secondary suite for income flexibility.',
      },
      {
        id: 'home-1-match-2',
        alias: 'Jordan & Priya',
        maskedAlias: 'Buyer household · 7359',
        matchPercent: 88,
        preApproved: true,
        budget: { min: 900000, max: 1100000 },
        timeline: '0-3 months',
        locationTag: 'Heritage Mountain',
        mustHaveStatus: {
          met: ['3+ bedrooms', 'Backyard', 'EV charging'],
          missing: [],
        },
        contributions: [
          { factor: 'Location fit', value: 0.42 },
          { factor: 'Price alignment', value: 0.2 },
          { factor: 'Features', value: 0.24 },
          { factor: 'Lifestyle', value: 0.14 },
        ],
        summary: 'Fully meets must-haves; fast movers looking to close this quarter.',
      },
      {
        id: 'home-1-match-3',
        alias: 'Buyer · Partnered Agent',
        maskedAlias: 'Buyer · 1864',
        matchPercent: 81,
        preApproved: false,
        budget: { min: 850000, max: 980000 },
        timeline: '6-9 months',
        locationTag: 'Pleasantside radius',
        mustHaveStatus: {
          met: ['Backyard', 'Quiet street'],
          missing: ['Finished basement'],
        },
        contributions: [
          { factor: 'Location fit', value: 0.5 },
          { factor: 'Price alignment', value: 0.18 },
          { factor: 'Features', value: 0.18 },
          { factor: 'Lifestyle', value: 0.14 },
        ],
        summary: 'Location perfect. Buyer will upgrade match by finishing basement or offering flex space.',
      },
      {
        id: 'home-1-match-4',
        alias: 'Alex (Relocating)',
        maskedAlias: 'Buyer · 9044',
        matchPercent: 76,
        preApproved: true,
        budget: { min: 1000000, max: 1150000 },
        timeline: '3-6 months',
        locationTag: 'Greater Tri-Cities',
        mustHaveStatus: {
          met: ['3+ bedrooms', 'EV parking'],
          missing: ['Walk-out basement'],
        },
        contributions: [
          { factor: 'Location fit', value: 0.38 },
          { factor: 'Price alignment', value: 0.22 },
          { factor: 'Features', value: 0.24 },
          { factor: 'Lifestyle', value: 0.16 },
        ],
        summary: 'Strong budget fit; asking about basement conversion options before engaging.',
      },
    ],
    featureFitMatrix: [
      {
        feature: '3+ bedrooms',
        requiredPercent: 0.96,
        homeHas: true,
        insight: 'Meets almost every matched buyer. Highlight bedroom sizes in the media set.',
      },
      {
        feature: 'Dedicated office',
        requiredPercent: 0.68,
        homeHas: true,
        insight: 'Remote-work buyers cite this as a differentiator. Showcase the office staging.',
      },
      {
        feature: 'Secondary suite',
        requiredPercent: 0.41,
        homeHas: false,
        insight: 'Consider outlining potential layout for suite conversion to capture income-seeker segment.',
      },
      {
        feature: 'EV charging',
        requiredPercent: 0.54,
        homeHas: true,
        insight: 'Charging-ready garage satisfies most electrified buyer wishlists.',
      },
      {
        feature: 'Walkable to schools',
        requiredPercent: 0.37,
        homeHas: true,
        insight: 'School proximity messaging resonates with family buyers in backlog.',
      },
    ],
    priceBuckets: [
      { label: 'Under $900K', count: 4, maxBudget: 900000 },
      { label: '$900K - $1M', count: 9, maxBudget: 1000000 },
      { label: '$1M - $1.1M', count: 8, maxBudget: 1100000 },
      { label: '$1.1M+', count: 5, maxBudget: 1300000 },
    ],
    simulation: {
      baseMatchCount: 26,
      baseTopMatch: 92,
      priceElasticity: 0.9,
      topMatchSensitivity: 14,
      priceRange: {
        min: 886000,
        max: 1083500,
        step: 5000,
      },
      featureToggles: [
        {
          id: 'add-suite',
          label: 'Add secondary suite (future-ready)',
          description: 'Model suite conversion to capture income-seeker demand.',
          impact: { matches: 4, topMatch: 3 },
        },
        {
          id: 'add-solar',
          label: 'Highlight solar readiness',
          description: 'Mark roof wiring as solar-ready for sustainability-focused buyers.',
          impact: { matches: 2, topMatch: 2 },
        },
      ],
    },
    access: 'free',
  },
  {
    id: 'home-2',
    nickname: 'Seawalk Condo (Private)',
    address: '88 Creekside Quay, Vancouver, BC',
    status: 'Not for sale',
    priceExpectation: 915000,
    location: 'False Creek (approx.)',
    summary: 'South-facing condo with marina view, concierge, and EV parking ready.',
    heroImage:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    specs: {
      type: 'Condo',
      beds: 2,
      baths: 2,
      parking: '1 secure stall',
      size: '1,020 sq ft',
      built: '2017',
    },
    matchScore: 82,
    matchBand: 'Match range 68-82%',
    matchedBuyers: 11,
    gapHint: '47% of buyers request 2 parking stalls; you have 1.',
    topWishlistSnippet: 'Waterfront buyers under $950K · timeline 0-3m',
    demandSnapshot: {
      matchCount: 11,
      topMatch: 82,
      preapprovedCount: 5,
      newSince: 2,
    },
    wishlistFit: {
      location: 0.88,
      price: 0.96,
      mustHave: 0.74,
      niceToHave: 0.55,
    },
    buyerMatches: [],
    featureFitMatrix: [
      {
        feature: 'Water view',
        requiredPercent: 0.72,
        homeHas: true,
        insight: 'Showcase panoramic views to maximise perceived alignment.',
      },
      {
        feature: 'Secure parking',
        requiredPercent: 0.64,
        homeHas: true,
        insight: 'One stall hits most wishlists; second stall upgrade could add reach.',
      },
      {
        feature: 'Concierge',
        requiredPercent: 0.38,
        homeHas: true,
        insight: 'Concierge services resonate with lock-and-leave buyers.',
      },
      {
        feature: 'Guest suite',
        requiredPercent: 0.41,
        homeHas: false,
        insight: 'Consider partner amenities to satisfy guest stay expectations.',
      },
    ],
    priceBuckets: [
      { label: 'Under $850K', count: 3, maxBudget: 850000 },
      { label: '$850K - $900K', count: 4, maxBudget: 900000 },
      { label: '$900K - $950K', count: 6, maxBudget: 950000 },
    ],
    simulation: {
      baseMatchCount: 11,
      baseTopMatch: 82,
      priceElasticity: 0.7,
      topMatchSensitivity: 10,
      priceRange: {
        min: 840000,
        max: 1005000,
        step: 5000,
      },
      featureToggles: [
        {
          id: 'add-parking',
          label: 'Offer 2nd parking stall',
          description: 'Model an incentive for an additional stall to unlock more wishlists.',
          impact: { matches: 3, topMatch: 4 },
        },
      ],
    },
    access: 'upgrade',
  },
];

export const sellerHotspots = [
  { 
    id: 'hotspot-1', 
    label: 'Port Moody Centre', 
    buyers: 18, 
    lat: 49.2838, 
    lng: -122.8311,
    x: 34, 
    y: 52 
  },
  { 
    id: 'hotspot-2', 
    label: 'Burke Mountain', 
    buyers: 9, 
    lat: 49.3321, 
    lng: -122.9658,
    x: 22, 
    y: 30 
  },
  { 
    id: 'hotspot-3', 
    label: 'False Creek', 
    buyers: 14, 
    lat: 49.2687, 
    lng: -123.1207,
    x: 64, 
    y: 42 
  },
  { 
    id: 'hotspot-4', 
    label: 'Coal Harbour', 
    buyers: 11, 
    lat: 49.2945, 
    lng: -123.1307,
    x: 76, 
    y: 18 
  },
];

export const sellerAnalytics = {
  budgetDistribution: [
    { label: 'Under $900K', value: 22 },
    { label: '$900K - $1.2M', value: 46 },
    { label: '$1.2M+', value: 32 },
  ],
  featureDemand: [
    'Dedicated office (58%)',
    'EV charging (41%)',
    'Secondary suite (29%)',
  ],
  timelineDemand: [
    { label: '0-3m', value: 36 },
    { label: '3-6m', value: 44 },
    { label: '6-12m', value: 20 },
  ],
  paidInsights: {
    trendsLockedCopy: 'Upgrade to unlock historical demand trends and benchmark your home against your market segment.',
  },
};

export const agents = {
  analyticsCards: [
    {
      title: 'Regional buyer demand',
      points: [
        '162 active buyers across Downtown & False Creek.',
        'Tri-Cities up 28% YoY for move-up buyers.',
        'Heatmaps aggregate wishlist polygons via Azure Cognitive Search.',
      ],
    },
    {
      title: 'Pipeline breakdown',
      points: [
        '234 active Buyer Wishlists in Greater Vancouver.',
        '65% pre-approved · 22% seeking financing support.',
        'Average budget $1.18M across prioritised markets.',
      ],
    },
    {
      title: 'Feature trends',
      points: [
        'EV charging requests up 19% in the last quarter.',
        'Dedicated workspaces remain top 3 feature.',
        '2+ parking stalls trending upward in suburbs.',
      ],
    },
  ],
  matches: [
    {
      alias: 'Port Moody Family Haven',
      area: 'Port Moody / Coquitlam',
      score: 92,
      properties: ['Evergreen Terrace Home', 'Heritage Woods Retreat'],
    },
    {
      alias: 'Waterfront condo seekers',
      area: 'False Creek',
      score: 80,
      properties: ['Seawalk Condo', 'Aquarius Villas 1702'],
    },
    {
      alias: 'Townhome starters',
      area: 'Langley',
      score: 74,
      properties: ['Willowbrook Crossing 12', 'Walnut Grove Gardens 6'],
    },
  ],
};

export const mortgageLeads = [
  {
    threadId: 'mortgage-14',
    buyerAlias: 'Port Moody Family Haven',
    status: 'Requested contact',
    location: 'Port Moody',
    budget: { min: 950000, max: 1150000 },
    timeline: '3-6m',
    notes: 'Needs updated pre-approval and bridge financing guidance.',
  },
  {
    threadId: 'mortgage-27',
    buyerAlias: 'False Creek Waterfront Condo',
    status: 'Not pre-approved',
    location: 'Vancouver',
    budget: { min: 780000, max: 950000 },
    timeline: '0-3m',
    notes: 'Interested in rate holds and flexible down payment options.',
  },
];

export const notifications = [
  { role: 'Buyer', trigger: 'New Home Profile matches wishlist', channels: ['Push', 'Email'] },
  { role: 'Seller', trigger: 'High-intent buyer matched Home Profile', channels: ['In-app', 'Email'] },
  { role: 'Agent', trigger: 'Demand spike in subscribed area', channels: ['Email digest'] },
  { role: 'Mortgage Agent', trigger: 'Buyer requests financing outreach', channels: ['SMS', 'Email'] },
];

export const subscriptions = [
  {
    name: 'Buyer · Free',
    price: '$0',
    features: [
      'Unlimited public Buyer Wishlists',
      'Match analytics & gap hints',
      'Secure messaging (respond only)',
      'Mortgage pre-approval badge',
    ],
  },
  {
    name: 'Seller · Free',
    price: '$0',
    features: [
      'Home Profile storage',
      'Match counts & score bands',
      'Gap hints & upgrade prompts',
      'Geo heatmap preview',
    ],
  },
  {
    name: 'Seller · Pro',
    price: '$69 / month',
    features: [
      'Buyer wishlist snippets (anonymised)',
      'Direct in-app messaging',
      'Demand trend analytics',
      'Export & compare Home Profiles',
    ],
  },
  {
    name: 'Agent · Pro',
    price: '$149 / month',
    features: [
      'Regional heatmaps',
      'Multi-home matchmaking',
      'Buyer pipeline analytics',
      'Team collaboration seats',
    ],
  },
  {
    name: 'Mortgage Agent',
    price: '$89 / month',
    features: [
      'Verified buyer leads',
      'Secure chat templates',
      'Demand segmentation',
      'Compliance logging',
    ],
  },
];

export const onboardingFlows = {
  buyer: [
    { title: 'Profile creation', description: 'Capture household info and purchase timeline (kept private).' },
    { title: 'Mortgage status', description: 'Upload optional pre-approval to unlock the verified badge.' },
    { title: 'Wishlist wizard', description: 'Define areas, budget, features, and lifestyle needs.' },
    { title: 'Privacy controls', description: 'Choose visibility for mortgage agents and communication preferences.' },
  ],
  seller: [
    { title: 'Home basics', description: 'Approximate address, home type, bed/bath counts, and pricing.' },
    { title: 'Feature tagging', description: 'Highlight amenities like EV charging, rental suites, and accessibility.' },
    { title: 'Upgrade preview', description: 'Review buyer demand analytics before choosing Seller Pro.' },
  ],
  agent: [
    { title: 'Licence verification', description: 'Submit brokerage details and licence number for validation.' },
    { title: 'Subscription selection', description: 'Choose Agent Pro tier and configure billing via Stripe.' },
    { title: 'Territory setup', description: 'Select service regions to seed demand heatmaps and alerts.' },
  ],
  mortgage: [
    { title: 'Credential review', description: 'Provide lender licence, company information, and compliance docs.' },
    { title: 'Lead preferences', description: 'Pick target geographies, budgets, and buyer segments for routing.' },
    { title: 'Messaging setup', description: 'Activate secure chat templates and disclosure statements.' },
  ],
};
