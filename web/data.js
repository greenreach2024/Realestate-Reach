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
          gap: 'Most Property Profiles here include 1.5 baths; you need 2.',
          trend: 'Demand spike in Olympic Village up 7% this week.',
        },
      },
    ],
    messages: [
      {
        id: 'thread-31',
        counterparty: 'Seller · Evergreen Terrace',
        wishlistId: 'wishlist-1',
        preview: 'We are prepping a Property Profile that hits 90% of your wishlist. Want anonymised specs?',
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
      { id: 'note-1', type: 'match', message: 'New Property Profile matches Port Moody Family Haven at 91%.' },
      { id: 'note-2', type: 'trend', message: 'Demand in Olympic Village is trending +7% week over week.' },
    ],
  },
];

export const buyerMapRegions = [
  { id: 'region-1', label: 'Port Moody Centre', count: 12, x: 32, y: 48 },
  { id: 'region-2', label: 'Pleasantside', count: 6, x: 18, y: 62 },
  { id: 'region-3', label: 'Olympic Village', count: 5, x: 58, y: 38 },
  { id: 'region-4', label: 'Coal Harbour', count: 4, x: 72, y: 22 },
];

export const propertyProfiles = [
  {
    id: 'property-1',
    nickname: 'Evergreen Terrace Home',
    location: 'Port Moody (approx.)',
    summary: '4 bed, 3 bath craftsman home with EV-ready garage and mature trees.',
    matchScore: 88,
    matchBand: 'Top match 92%',
    matchedBuyers: 18,
    gapHint: 'Most buyers want 3 baths; you currently list 2.5.',
    topWishlistSnippet: 'Port Moody Family Haven · budget up to $1.2M · 3-6m timeline',
    access: 'free',
  },
  {
    id: 'property-2',
    nickname: 'Seawalk Condo (Private)',
    location: 'False Creek (approx.)',
    summary: 'South-facing condo with marina view, concierge, and EV parking ready.',
    matchScore: 82,
    matchBand: 'Match range 68-82%',
    matchedBuyers: 11,
    gapHint: '47% of buyers request 2 parking stalls; you have 1.',
    topWishlistSnippet: 'Waterfront buyers under $950K · timeline 0-3m',
    access: 'upgrade',
  },
];

export const sellerHotspots = [
  { id: 'hotspot-1', label: 'Port Moody Centre', buyers: 18, x: 34, y: 52 },
  { id: 'hotspot-2', label: 'Burke Mountain', buyers: 9, x: 22, y: 30 },
  { id: 'hotspot-3', label: 'False Creek', buyers: 14, x: 64, y: 42 },
  { id: 'hotspot-4', label: 'Coal Harbour', buyers: 11, x: 76, y: 18 },
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
    trendsLockedCopy: 'Upgrade to unlock historical demand trends and compare multiple Property Profiles side by side.',
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
  { role: 'Buyer', trigger: 'New Property Profile matches wishlist', channels: ['Push', 'Email'] },
  { role: 'Seller', trigger: 'High-intent buyer matched Property Profile', channels: ['In-app', 'Email'] },
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
      'Property Profile storage',
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
      'Export & compare Property Profiles',
    ],
  },
  {
    name: 'Agent · Pro',
    price: '$149 / month',
    features: [
      'Regional heatmaps',
      'Multi-property matchmaking',
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
    { title: 'Property basics', description: 'Approximate address, property type, bed/bath counts, and pricing.' },
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
