// IFTTT Integration Configuration
export const iftttConfig = {
  webhookUrl: 'https://maker.ifttt.com/use/BwqhI7ZBqzhcyPP8np0Ij',
  events: {
    newBuyerRegistration: 'new_buyer_registered',
    newMatching: 'buyer_property_match',
    messageReceived: 'subscription_message_sent',
    communityInterest: 'community_interest_updated',
    priceAlert: 'price_alert_triggered'
  }
};

// Community interest data for the homepage map - Kingston, Ontario
export const communityInterest = [
  { 
    name: 'Downtown Kingston', 
    coordinates: [44.2312, -76.4860], 
    activeBuyers: 18, 
    avgBudget: 695000,
    topFeatures: ['Waterfront access', 'Historic character', 'Walking distance']
  },
  { 
    name: 'Westbrook', 
    coordinates: [44.2156, -76.5234], 
    activeBuyers: 24, 
    avgBudget: 750000,
    topFeatures: ['Family-friendly', 'New developments', 'Good schools']
  },
  { 
    name: 'Cataraqui', 
    coordinates: [44.2445, -76.4234], 
    activeBuyers: 15, 
    avgBudget: 825000,
    topFeatures: ['Waterfront', 'Luxury homes', 'Golf courses']
  },
  { 
    name: 'Kingston East', 
    coordinates: [44.2234, -76.4156], 
    activeBuyers: 22, 
    avgBudget: 580000,
    topFeatures: ['Affordable housing', 'Transit access', 'Shopping centers']
  },
  { 
    name: 'Sydenham', 
    coordinates: [44.1934, -76.5123], 
    activeBuyers: 12, 
    avgBudget: 920000,
    topFeatures: ['Rural feel', 'Large lots', 'Privacy']
  }
];

// Buyer market insights for homepage - Kingston, Ontario
export const buyerInsights = {
  prequalificationRate: 72, // % of buyers who are pre-qualified
  totalBuyers: 91,
  purchaseTimelines: [
    { period: 'Now', percentage: 22, count: 20 },
    { period: '3 months', percentage: 38, count: 35 },
    { period: '6 months', percentage: 25, count: 23 },
    { period: 'This year', percentage: 15, count: 13 }
  ],
  topWants: [
    { feature: 'Close to schools', percentage: 45, count: 41 },
    { feature: '3+ bedrooms', percentage: 42, count: 38 },
    { feature: '2+ bathrooms', percentage: 38, count: 35 },
    { feature: 'Home office', percentage: 35, count: 32 },
    { feature: 'Garage/parking', percentage: 32, count: 29 },
    { feature: 'Waterfront access', percentage: 28, count: 25 }
  ]
};

// Kingston Real Estate Market Data (Based on realtor.ca research)
export const kingstonMarketData = {
  city: 'Kingston',
  province: 'Ontario',
  lastUpdated: '2025-09-30',
  marketTrend: 'stable', // 'rising', 'falling', 'stable'
  averageHomePrices: {
    overall: 685000,
    detached: 785000,
    semiDetached: 625000,
    townhouse: 495000,
    condo: 385000
  },
  priceChangeYearOverYear: {
    overall: 2.1, // percentage
    detached: 1.8,
    semiDetached: 2.5,
    townhouse: 3.2,
    condo: 4.1
  },
  averageDaysOnMarket: 28,
  marketActivity: {
    newListings: 156,
    soldProperties: 142,
    activeListings: 234
  },
  neighbourhoodBreakdown: {
    'Downtown Kingston': { avgPrice: 595000, trend: 'rising', daysOnMarket: 22 },
    'Westbrook': { avgPrice: 725000, trend: 'stable', daysOnMarket: 31 },
    'Cataraqui': { avgPrice: 845000, trend: 'rising', daysOnMarket: 25 },
    'Kingston East': { avgPrice: 565000, trend: 'stable', daysOnMarket: 35 },
    'Sydenham': { avgPrice: 925000, trend: 'stable', daysOnMarket: 42 }
  },
  propertyTypeBreakdown: {
    '2BR/1BA': { avgPrice: 425000, trend: 1.5, inventory: 23 },
    '2BR/2BA': { avgPrice: 485000, trend: 2.1, inventory: 31 },
    '3BR/2BA': { avgPrice: 645000, trend: 2.3, inventory: 42 },
    '3BR/3BA': { avgPrice: 725000, trend: 1.9, inventory: 28 },
    '4BR/2BA': { avgPrice: 785000, trend: 1.6, inventory: 19 },
    '4BR/3BA': { avgPrice: 895000, trend: 2.8, inventory: 15 }
  }
};

// Preapproval Success Statistics (Research-based)
export const preapprovalStats = {
  successRates: {
    preapproved: {
      purchaseWithin3Months: 68,
      purchaseWithin6Months: 87,
      purchaseWithin12Months: 94
    },
    notPreapproved: {
      purchaseWithin3Months: 23,
      purchaseWithin6Months: 45,
      purchaseWithin12Months: 62
    }
  },
  withAgent: {
    purchaseWithin3Months: 71,
    purchaseWithin6Months: 89,
    averageNegotiationSavings: 15200
  },
  withoutAgent: {
    purchaseWithin3Months: 38,
    purchaseWithin6Months: 58,
    averageNegotiationSavings: 3400
  }
};

// Enhanced Buyer Profile Structure
export const buyerProfileStructure = {
  profile: {
    contactInfo: {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      preferredContact: 'email' // 'email', 'phone', 'text'
    },
    budget: {
      min: null,
      max: null,
      currency: 'CAD'
    },
    timeline: '', // 'immediate', '3months', '6months', '12months', 'flexible'
    mortgageStatus: '', // 'preapproved', 'prequalified', 'none'
    mortgageDetails: {
      preapprovalAmount: null,
      lenderName: '',
      expiryDate: null,
      verified: false
    },
    preferences: {
      contactFromAgents: false,
      contactFromMortgage: false,
      marketingEmails: false,
      matchNotifications: true
    }
  },
  wishlists: [] // Array of wishlist objects
};

// Wishlist Structure Template
export const wishlistTemplate = {
  id: '',
  name: '',
  description: '',
  isActive: true,
  createdDate: '',
  lastModified: '',
  budget: {
    min: null,
    max: null
  },
  timeline: '',
  locations: [], // Array of location objects
  propertyDetails: {
    type: [], // 'house', 'condo', 'townhouse', 'semi-detached'
    bedrooms: { min: null, max: null },
    bathrooms: { min: null, max: null },
    sqft: { min: null, max: null }
  },
  features: {
    mustHave: [], // Required features
    niceToHave: [] // Preferred features
  },
  lifestyle: {
    nearSchools: false,
    nearTransit: false,
    nearWaterfront: false,
    nearParks: false,
    nearShopping: false,
    walkScore: null // 0-100
  },
  analytics: {
    matches: 0,
    topMatch: 0,
    avgPrice: 0,
    newThisWeek: 0
  }
};

// Location Structure
export const locationStructure = {
  id: '',
  type: '', // 'postal', 'city', 'polygon', 'radius', 'pin'
  data: {
    postalCode: '',
    city: '',
    coordinates: [], // [lat, lng] or polygon coordinates
    radius: null, // in km
    address: ''
  },
  priority: 1, // 1-5 weighting
  name: '' // User-friendly name like "Downtown Kingston"
};

// Available Property Features
export const propertyFeatures = {
  mustHave: [
    'Garage',
    'Parking space',
    'Finished basement',
    'Unfinished basement',
    'Home office',
    'Master ensuite',
    'Walk-in closet',
    'Hardwood floors',
    'Updated kitchen',
    'Updated bathrooms',
    'Laundry room',
    'Mudroom',
    'Fireplace',
    'Central air',
    'Pool',
    'Deck/patio',
    'Fenced yard',
    'Garden space',
    'Storage shed',
    'EV charging'
  ],
  niceToHave: [
    'Open concept',
    'Vaulted ceilings',
    'Bay windows',
    'Skylight',
    'Crown molding',
    'Granite counters',
    'Stainless appliances',
    'Gas stove',
    'Island kitchen',
    'Butler pantry',
    'Wine cellar',
    'Wet bar',
    'Home gym space',
    'Guest room',
    'Nanny suite',
    'In-law suite',
    'Workshop',
    'Interlock driveway',
    'Mature trees',
    'Corner lot'
  ]
};

// Timeline Options
export const timelineOptions = [
  { value: 'immediate', label: 'Ready to buy now', priority: 5 },
  { value: '3months', label: 'Within 3 months', priority: 4 },
  { value: '6months', label: 'Within 6 months', priority: 3 },
  { value: '12months', label: 'Within 12 months', priority: 2 },
  { value: 'flexible', label: 'Just browsing/flexible', priority: 1 }
];

// Mortgage Status Options
export const mortgageStatusOptions = [
  { 
    value: 'preapproved', 
    label: 'Pre-approved with lender', 
    badge: true,
    description: 'You have a conditional approval letter from a lender',
    benefits: ['Strong negotiating position', 'Faster closing', 'Seller confidence']
  },
  { 
    value: 'prequalified', 
    label: 'Pre-qualified estimate', 
    badge: false,
    description: 'You have an estimated approval amount based on income',
    benefits: ['Know your budget range', 'Ready for next step']
  },
  { 
    value: 'none', 
    label: 'Not yet started', 
    badge: false,
    description: 'Haven\'t begun the mortgage approval process',
    benefits: ['We can connect you with specialists', 'Free consultation available']
  }
];

// Seller Profile Structure
export const sellerProfileStructure = {
  contactInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContact: 'email'
  },
  role: {
    type: '', // 'homeowner' or 'agent'
    agentLicense: '', // if agent
    brokerage: '', // if agent
    clientCount: 0 // if agent
  },
  agentConnection: {
    hasAgent: false,
    agentId: null,
    agentName: '',
    agentContact: '',
    commissionAgreement: ''
  },
  subscription: {
    tier: 'free', // 'free' or 'premium'
    features: [],
    expiryDate: null
  },
  preferences: {
    marketingEmails: true,
    newMatchNotifications: true,
    messageNotifications: true,
    weeklyReports: false,
    priceDropAlerts: false
  }
};

// Property Listing Structure
export const propertyListingStructure = {
  basicInfo: {
    address: {
      street: '',
      city: 'Kingston',
      province: 'Ontario',
      postalCode: '',
      coordinates: { lat: null, lng: null }
    },
    propertyType: '',
    bedrooms: null,
    bathrooms: null,
    squareFootage: null,
    lotSize: null,
    parkingSpaces: 0,
    yearBuilt: null
  },
  pricing: {
    askingPrice: null,
    priceHistory: [],
    notes: '',
    strataFees: null,
    propertyTaxes: null,
    utilities: []
  },
  features: {
    interior: [],
    exterior: [],
    amenities: [],
    location: [],
    accessibility: []
  },
  media: {
    photos: [],
    virtualTour: null,
    floorPlan: null,
    documents: []
  },
  description: {
    highlights: '',
    neighborhood: '',
    schools: '',
    transportation: ''
  },
  listingDetails: {
    status: 'draft', // 'draft', 'active', 'sold', 'expired'
    listingDate: null,
    daysOnMarket: 0,
    views: 0,
    inquiries: 0
  }
};

// Seller Role Options
export const sellerRoleOptions = [
  {
    id: 'homeowner',
    name: 'Property Owner',
    icon: '🏡',
    description: 'I own the property I want to sell',
    benefits: ['Direct control over listing', 'No commission fees', 'Set your own terms']
  },
  {
    id: 'agent',
    name: 'Real Estate Agent',
    icon: '👔',
    description: 'I represent clients selling properties',
    benefits: ['Manage multiple listings', 'Client relationship tools', 'Professional dashboard']
  }
];

// Enhanced Subscription Tiers with Location Monitoring
export const subscriptionTiers = {
  homeowner: {
    free: {
      id: 'homeowner-free',
      name: 'Free Homeowner',
      price: 0,
      icon: '🏠',
      features: [
        'Create 1 property listing',
        'View number of interested buyers',
        'Basic market demand insights',
        'Property photo uploads (up to 5)',
        'Email notifications',
        'Community insights'
      ],
      limitations: [
        'Cannot see buyer contact details',
        'No direct messaging with buyers',
        'Limited analytics and trends',
        'No location monitoring',
        'No instant notifications'
      ],
      locationMonitoring: {
        enabled: false,
        zones: 0,
        radius: 0
      }
    },
    premium: {
      id: 'homeowner-premium',
      name: 'Premium Homeowner',
      price: 29,
      period: 'month',
      icon: '⭐',
      features: [
        'All Free features',
        'Unlimited property listings',
        'Full buyer contact details',
        'Direct messaging with buyers',
        'Monitor 2 locations (15km radius each)',
        'Instant buyer activity alerts',
        'New wishlist notifications',
        'Market trend insights',
        'Priority listing placement',
        'Advanced analytics dashboard'
      ],
      popular: true,
      locationMonitoring: {
        enabled: true,
        zones: 2,
        radius: 15, // km
        notifications: {
          newWishlist: true,
          buyerActivity: true,
          marketTrends: true,
          instantAlerts: true
        }
      }
    }
  },
  professional: {
    basic: {
      id: 'agent-basic',
      name: 'Agent Basic',
      price: 49,
      period: 'month',
      icon: '👔',
      features: [
        'Professional agent profile',
        'Client management tools (up to 25 clients)',
        'Lead generation dashboard',
        'Basic market analytics',
        'Email notifications',
        'Property listing management (up to 10)',
        'Buyer matching tools'
      ],
      limitations: [
        'No location monitoring',
        'Basic analytics only',
        'Limited client capacity',
        'Standard notification delivery'
      ],
      locationMonitoring: {
        enabled: false,
        zones: 0,
        radius: 0
      }
    },
    pro: {
      id: 'agent-pro',
      name: 'Agent Pro',
      price: 149,
      period: 'month',
      icon: '💎',
      features: [
        'Everything in Agent Basic',
        'Unlimited clients and listings',
        'Monitor 1 large region (50km radius)',
        'Advanced buyer demand analytics',
        'New buyer entry alerts',
        'Market trend shift notifications',
        'Pre-approved buyer highlights',
        'Custom market reports',
        'Priority customer support',
        'Advanced lead scoring'
      ],
      popular: true,
      locationMonitoring: {
        enabled: true,
        zones: 1,
        radius: 50, // km
        notifications: {
          newBuyerEntry: true,
          marketTrendShifts: true,
          preApprovedBuyers: true,
          demandSpikes: true,
          competitorActivity: true,
          instantAlerts: true
        }
      }
    }
  }
};

// Notification Types and Configuration
export const notificationTypes = {
  // Homeowner notifications
  newWishlistInZone: {
    id: 'new_wishlist_zone',
    title: 'New Buyer Wishlist',
    description: 'A buyer posted a new wishlist in your monitored area',
    icon: '🎯',
    category: 'buyer_activity',
    userTypes: ['homeowner'],
    subscriptionRequired: 'premium'
  },
  wishlistUpdateInZone: {
    id: 'wishlist_update_zone',
    title: 'Buyer Wishlist Updated',
    description: 'A buyer updated their wishlist in your monitored area',
    icon: '✏️',
    category: 'buyer_activity',
    userTypes: ['homeowner'],
    subscriptionRequired: 'premium'
  },
  buyerActivityInZone: {
    id: 'buyer_activity_zone',
    title: 'Buyer Activity Alert',
    description: 'Increased buyer activity in your monitored area',
    icon: '📈',
    category: 'market_activity',
    userTypes: ['homeowner'],
    subscriptionRequired: 'premium'
  },
  
  // Professional notifications
  newBuyerInRegion: {
    id: 'new_buyer_region',
    title: 'New Buyer in Region',
    description: 'A new buyer has registered in your monitored region',
    icon: '👤',
    category: 'lead_generation',
    userTypes: ['professional'],
    subscriptionRequired: 'pro'
  },
  marketTrendShift: {
    id: 'market_trend_shift',
    title: 'Market Trend Alert',
    description: 'Significant market trend change detected in your region',
    icon: '📊',
    category: 'market_intelligence',
    userTypes: ['professional'],
    subscriptionRequired: 'pro'
  },
  preApprovedBuyerAlert: {
    id: 'preapproved_buyer',
    title: 'Pre-approved Buyer',
    description: 'A pre-approved buyer is active in your region',
    icon: '💰',
    category: 'qualified_leads',
    userTypes: ['professional'],
    subscriptionRequired: 'pro'
  },
  demandSpikeAlert: {
    id: 'demand_spike',
    title: 'Demand Spike',
    description: 'Unusual demand increase for specific property types',
    icon: '🚀',
    category: 'market_opportunity',
    userTypes: ['professional'],
    subscriptionRequired: 'pro'
  },
  
  // Universal notifications
  messageReceived: {
    id: 'message_received',
    title: 'New Message',
    description: 'You have received a new message',
    icon: '💬',
    category: 'communication',
    userTypes: ['homeowner', 'professional'],
    subscriptionRequired: 'premium'
  },
  listingViewed: {
    id: 'listing_viewed',
    title: 'Listing Viewed',
    description: 'Someone viewed your property listing',
    icon: '👁️',
    category: 'listing_activity',
    userTypes: ['homeowner', 'professional'],
    subscriptionRequired: 'free'
  }
};

// Notification Delivery Preferences
export const notificationPreferences = {
  frequency: {
    instant: {
      id: 'instant',
      name: 'Instant Alerts',
      description: 'Receive notifications immediately as they happen',
      icon: '⚡'
    },
    hourly: {
      id: 'hourly',
      name: 'Hourly Digest',
      description: 'Receive a summary every hour',
      icon: '⏰'
    },
    daily: {
      id: 'daily',
      name: 'Daily Digest',
      description: 'Receive a daily summary at your preferred time',
      icon: '📅'
    },
    weekly: {
      id: 'weekly',
      name: 'Weekly Summary',
      description: 'Receive a weekly market summary',
      icon: '📊'
    }
  },
  channels: {
    inApp: {
      id: 'in_app',
      name: 'In-App Notifications',
      description: 'Show notifications within the platform',
      icon: '🔔',
      enabled: true
    },
    email: {
      id: 'email',
      name: 'Email Notifications',
      description: 'Send notifications to your email address',
      icon: '📧',
      enabled: true
    },
    push: {
      id: 'push',
      name: 'Push Notifications',
      description: 'Send push notifications to your devices',
      icon: '📱',
      enabled: false
    },
    sms: {
      id: 'sms',
      name: 'SMS Alerts',
      description: 'Send critical alerts via SMS (premium only)',
      icon: '💬',
      enabled: false,
      subscriptionRequired: 'premium'
    }
  }
};

// Location Monitoring Zones Structure
export const locationMonitoringStructure = {
  homeownerZone: {
    name: 'My Monitoring Zone',
    centerLat: null,
    centerLng: null,
    radius: 15, // km
    address: '',
    nickname: '',
    active: true,
    notifications: {
      newWishlist: true,
      wishlistUpdate: true,
      buyerActivity: true,
      marketTrends: true
    },
    alertThresholds: {
      buyerActivity: 3, // number of new activities to trigger alert
      priceChange: 5 // percentage change to trigger alert
    }
  },
  professionalRegion: {
    name: 'My Territory',
    centerLat: null,
    centerLng: null,
    radius: 50, // km
    address: '',
    nickname: '',
    active: true,
    notifications: {
      newBuyers: true,
      marketTrends: true,
      preApprovedBuyers: true,
      demandSpikes: true,
      competitorActivity: true
    },
    alertThresholds: {
      newBuyersPerDay: 2,
      demandSpike: 20, // percentage increase
      marketTrendShift: 10 // percentage change
    }
  }
};

// Property Condition Options
export const propertyConditions = [
  { id: 'new', name: 'New Construction', description: 'Brand new, never lived in' },
  { id: 'excellent', name: 'Excellent', description: 'Recently updated, move-in ready' },
  { id: 'good', name: 'Good', description: 'Well maintained, minor updates needed' },
  { id: 'fair', name: 'Fair', description: 'Some renovations needed' },
  { id: 'needs_work', name: 'Needs Work', description: 'Significant renovations required' }
];

// Listing Analytics Structure
export const listingAnalytics = {
  matchMetrics: {
    totalMatches: 0,
    highScoreMatches: 0, // matches > 80%
    mediumScoreMatches: 0, // matches 60-80%
    lowScoreMatches: 0 // matches < 60%
  },
  buyerDemand: {
    totalInterestedBuyers: 0,
    averageBuyerBudget: 0,
    mostCommonTimeline: '',
    buyerLocations: []
  },
  featureDemand: {
    mostWantedFeatures: [],
    matchingFeatures: [],
    missingFeatures: []
  },
  performanceMetrics: {
    views: 0,
    inquiries: 0,
    showings: 0,
    offers: 0,
    daysOnMarket: 0
  }
};

// Property Type Options
export const propertyTypes = [
  { value: 'house', label: 'Detached House', icon: '🏠' },
  { value: 'semi-detached', label: 'Semi-Detached', icon: '🏘️' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏬' },
  { value: 'condo', label: 'Condominium', icon: '🏢' },
  { value: 'condo-townhouse', label: 'Condo Townhouse', icon: '🏫' },
  { value: 'manufactured', label: 'Manufactured/Mobile', icon: '🚐' },
  { value: 'vacant-land', label: 'Vacant Land', icon: '🌳' }
];

// Local Service Providers (Kingston Area)
export const localServiceProviders = {
  realtors: [
    {
      id: 'realtor-1',
      name: 'Sarah McKenzie',
      brokerage: 'Royal LePage ProAlliance Realty',
      specialties: ['First-time buyers', 'Waterfront properties'],
      rating: 4.8,
      reviewCount: 127,
      phoneNumber: '613-555-0101',
      email: 'sarah.mckenzie@royallepage.ca',
      neighbourhoods: ['Downtown Kingston', 'Cataraqui', 'Westbrook'],
      averageClosingTime: 45,
      clientsSaved: 18500
    },
    {
      id: 'realtor-2', 
      name: 'Michael Thompson',
      brokerage: 'Century 21 Lanthorn Real Estate',
      specialties: ['Investment properties', 'New construction'],
      rating: 4.9,
      reviewCount: 203,
      phoneNumber: '613-555-0102',
      email: 'mthompson@century21.ca',
      neighbourhoods: ['Kingston East', 'Sydenham', 'Westbrook'],
      averageClosingTime: 38,
      clientsSaved: 22300
    }
  ],
  mortgageAgents: [
    {
      id: 'mortgage-1',
      name: 'Jennifer Walsh',
      company: 'Kingston Mortgage Solutions',
      specialties: ['First-time buyer programs', 'Self-employed'],
      rating: 4.7,
      reviewCount: 89,
      phoneNumber: '613-555-0201',
      email: 'jwalsh@kingstonmortgage.ca',
      averageApprovalTime: 5,
      competitiveRates: true,
      preapprovalAccuracy: 96
    },
    {
      id: 'mortgage-2',
      name: 'David Chen',
      company: 'Dominion Lending Centres',
      specialties: ['Investment properties', 'Refinancing'],
      rating: 4.6,
      reviewCount: 156,
      phoneNumber: '613-555-0202', 
      email: 'dchen@dominionlending.ca',
      averageApprovalTime: 7,
      competitiveRates: true,
      preapprovalAccuracy: 94
    }
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
