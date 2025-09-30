// Community interest data for the homepage map
export const communityInterest = [
  { 
    name: 'Port Moody Centre', 
    coordinates: [49.2837, -122.8434], 
    activeBuyers: 14, 
    avgBudget: 1180000,
    topFeatures: ['EV charging', 'Home office', 'Transit access']
  },
  { 
    name: 'Coal Harbour', 
    coordinates: [49.2944, -123.1289], 
    activeBuyers: 22, 
    avgBudget: 920000,
    topFeatures: ['Water view', 'Concierge', 'Walking distance']
  },
  { 
    name: 'Olympic Village', 
    coordinates: [49.2644, -123.1147], 
    activeBuyers: 18, 
    avgBudget: 875000,
    topFeatures: ['Modern amenities', 'Seawall access', 'Pet-friendly']
  },
  { 
    name: 'Langley', 
    coordinates: [49.1666, -122.6445], 
    activeBuyers: 31, 
    avgBudget: 950000,
    topFeatures: ['Family-friendly', 'Newer builds', 'Good schools']
  },
  { 
    name: 'Burnaby Heights', 
    coordinates: [49.2666, -123.0145], 
    activeBuyers: 12, 
    avgBudget: 1050000,
    topFeatures: ['Character homes', 'Local shops', 'Transit']
  }
];

// Buyer market insights for homepage
export const buyerInsights = {
  prequalificationRate: 67, // % of buyers who are pre-qualified
  totalBuyers: 97,
  purchaseTimelines: [
    { period: 'Now', percentage: 18, count: 17 },
    { period: '3 months', percentage: 35, count: 34 },
    { period: '6 months', percentage: 28, count: 27 },
    { period: 'This year', percentage: 19, count: 19 }
  ],
  topWants: [
    { feature: 'Close to schools', percentage: 42, count: 41 },
    { feature: '4+ bedrooms', percentage: 38, count: 37 },
    { feature: '3+ bathrooms', percentage: 35, count: 34 },
    { feature: 'Home office', percentage: 31, count: 30 },
    { feature: 'EV charging', percentage: 28, count: 27 },
    { feature: 'Transit access', percentage: 26, count: 25 }
  ]
};

// User subscription status tracking
export const userSubscriptions = {
  'buyer-1': { role: 'buyer', tier: 'free', canMessage: false },
  'seller-1': { role: 'seller', tier: 'pro', canMessage: true },
  'agent-1': { role: 'agent', tier: 'pro', canMessage: true },
  'mortgage-1': { role: 'mortgage', tier: 'paid', canMessage: true }
};

export const buyers = [
  {
    id: 'buyer-1',
    name: 'Taylor Kim',
    subscription: 'free',
    wishlists: [
      {
        id: 'wishlist-1',
        name: 'Family home in Port Moody',
        description: 'Looking for a detached home with space for hybrid work and EV charging.',
        matches: 12,
        topMatch: 88,
        budget: { min: 950000, max: 1200000 },
        timeline: '3-6 months',
        locations: ['Port Moody Centre', 'Pleasantside'],
        mustHaves: ['3+ bedrooms', 'Dedicated office', 'Backyard'],
        niceToHaves: ['Secondary suite', 'EV-ready garage'],
        active: true,
        analytics: { avgPrice: 1080000, newThisWeek: 3 },
      },
      {
        id: 'wishlist-2',
        name: 'Waterfront condo',
        description: 'Lock-and-leave condo for frequent travel, steps to seawall.',
        matches: 6,
        topMatch: 79,
        budget: { min: 750000, max: 950000 },
        timeline: '0-3 months',
        locations: ['Coal Harbour', 'Olympic Village'],
        mustHaves: ['2 bedrooms', 'Water view'],
        niceToHaves: ['Concierge', 'Gym access'],
        active: true,
        analytics: { avgPrice: 905000, newThisWeek: 1 },
      },
    ],
    messages: [
      {
        id: 'thread-31',
        counterparty: 'Riverfront Townhomes',
        wishlist: 'Family home in Port Moody',
        preview: 'We just released a layout with a dedicated office—let us know if you want a walkthrough.',
        status: 'New reply',
      },
      {
        id: 'thread-62',
        counterparty: 'Agent: Maya Singh',
        wishlist: 'Waterfront condo',
        preview: 'I have a new listing matching 82% of your wishlist criteria. Interested in a private viewing?',
        status: 'Waiting',
      },
    ],
  },
];

export const listings = [
  {
    id: 'listing-1',
    address: '123 Evergreen Terrace, Port Moody',
    status: 'Active',
    summary: '4 bed, 3 bath craftsman home near Rocky Point Park with EV-ready garage.',
    score: 87,
    matchedBuyers: 14,
    price: 1180000,
    type: 'Detached house',
    photo: 'https://images.unsplash.com/photo-1600607687920-4e2a87c35e23?auto=format&fit=crop&w=900&q=80',
    highlights: ['14 active buyers', '82% location fit', 'Upgrade to unlock messaging'],
    metrics: { feature: 84, location: 92, timeline: 75 },
    topWishlists: [
      { alias: 'Family home in Port Moody', score: 88 },
      { alias: 'North Shore upsizers', score: 81 },
    ],
  },
  {
    id: 'listing-2',
    address: '908 Seawalk Crescent, Vancouver',
    status: 'Coming soon',
    summary: 'South-facing waterfront condo with concierge, fitness centre, and marina access.',
    score: 82,
    matchedBuyers: 9,
    price: 930000,
    type: 'Condo',
    photo: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    highlights: ['9 active buyers', '54% pre-approved', '2 mortgage leads'],
    metrics: { feature: 78, location: 89, timeline: 68 },
    topWishlists: [
      { alias: 'Waterfront condo', score: 84 },
      { alias: 'Downsizers seeking amenities', score: 77 },
    ],
  },
];

export const agents = {
  analyticsCards: [
    {
      title: 'Buyer demand heatmap',
      points: [
        'Downtown & False Creek remain hottest micro-markets (162 active buyers).',
        'Tri-Cities show 28% YoY increase in move-up buyers.',
        'Heatmap built from wishlist polygons + Azure Cognitive Search geodata.',
      ],
    },
    {
      title: 'Buyer funnel snapshot',
      points: [
        '234 active buyers in Greater Vancouver',
        '65% pre-approved · 22% seeking mortgage guidance',
        'Average stated budget: $1.18M',
      ],
    },
    {
      title: 'Feature trends',
      points: [
        'EV charging jumped 19% in the last quarter',
        'Remote workspaces remain top-3 feature',
        '2+ parking stalls trending upward in suburbs',
      ],
    },
  ],
  matches: [
    {
      alias: 'Family home in Port Moody',
      area: 'Port Moody / Coquitlam',
      score: 88,
      listings: ['123 Evergreen Terrace', 'Mountain View Estates #4'],
    },
    {
      alias: 'Waterfront downsizers',
      area: 'False Creek',
      score: 82,
      listings: ['908 Seawalk Crescent', 'Aquarius Villas 1702'],
    },
    {
      alias: 'Townhome starters',
      area: 'Langley',
      score: 74,
      listings: ['Willowbrook Crossing 12', 'Walnut Grove Gardens 6'],
    },
  ],
};

export const mortgageLeads = [
  {
    threadId: 'mortgage-14',
    name: 'Jordan P. · Wishlist: Port Moody family home',
    status: 'Requested contact',
    location: 'Port Moody',
    budget: { min: 950000, max: 1150000 },
    timeline: '3-6 months',
    notes: 'Needs updated pre-approval and guidance on bridge financing.',
  },
  {
    threadId: 'mortgage-27',
    name: 'Casey L. · Wishlist: Waterfront condo',
    status: 'Not pre-approved',
    location: 'Vancouver',
    budget: { min: 800000, max: 950000 },
    timeline: '0-3 months',
    notes: 'Interested in rate holds and flexible down payment options.',
  },
];

export const notifications = [
  { role: 'Buyer', trigger: 'New listing matches wishlist', channels: ['Push', 'Email'] },
  { role: 'Seller', trigger: 'New buyer matched listing', channels: ['In-app', 'Email'] },
  { role: 'Agent', trigger: 'Demand spike in subscribed area', channels: ['Email digest'] },
  { role: 'Mortgage Agent', trigger: 'Buyer requests contact', channels: ['SMS', 'Email'] },
];

export const subscriptions = [
  {
    name: 'Buyer · Free',
    price: '$0',
    features: ['Unlimited wishlists', 'Match analytics', 'Secure messaging (respond only)', 'Mortgage opt-in badge'],
  },
  {
    name: 'Seller · Pro',
    price: '$69 / month',
    features: ['Unlock buyer profiles', 'Direct messaging', 'Demand trend analytics', 'CSV exports'],
  },
  {
    name: 'Agent · Pro',
    price: '$149 / month',
    features: ['Regional heatmaps', 'Multi-listing matchmaking', 'Buyer pipeline analytics', 'Team collaboration seats'],
  },
  {
    name: 'Mortgage Agent',
    price: '$89 / month',
    features: ['Verified buyer leads', 'Secure chat', 'Demand segmentation', 'Performance reporting'],
  },
];

export const onboardingFlows = {
  buyer: [
    { title: 'Profile creation', description: 'Capture contact details, household info, and desired purchase timeline.' },
    { title: 'Mortgage status', description: 'Upload optional pre-approval to unlock the verified badge.' },
    { title: 'Wishlist wizard', description: 'Define locations, budget, must-have vs nice-to-have features, and lifestyle needs.' },
    { title: 'Privacy controls', description: 'Choose visibility for mortgage agents and marketing communications.' },
  ],
  seller: [
    { title: 'Property basics', description: 'Address lookup, property type, bed/bath counts, and pricing.' },
    { title: 'Media upload', description: 'Add photos, floor plans, and highlight features stored in Azure Blob Storage.' },
    { title: 'Upgrade prompt', description: 'Preview buyer demand and opt into Seller Pro for messaging + analytics.' },
  ],
  agent: [
    { title: 'License verification', description: 'Submit brokerage details and licence number for validation.' },
    { title: 'Subscription selection', description: 'Choose Agent Pro tier and configure billing via Stripe.' },
    { title: 'Territory setup', description: 'Select service regions to seed demand heatmaps and alerts.' },
  ],
  mortgage: [
    { title: 'Credential review', description: 'Provide lender licence, company information, and compliance docs.' },
    { title: 'Lead preferences', description: 'Pick target geographies, budgets, and buyer segments for lead routing.' },
    { title: 'Messaging setup', description: 'Activate secure chat templates and disclosure statements.' },
  ],
};
