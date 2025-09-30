export const buyers = [
  {
    id: 'buyer-1',
    name: 'Taylor Kim',
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
