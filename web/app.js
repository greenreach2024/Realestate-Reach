import { buyers, listings, agents, mortgageLeads, notifications, subscriptions, onboardingFlows, communityInterest, userSubscriptions, buyerInsights } from './data.js';

console.log('App.js loaded successfully');
console.log('Data imported:', { buyers: buyers?.length, listings: listings?.length });

// Immediate visual feedback that the script is running
try {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.innerHTML += '<br><strong>📜 Script loaded and executing...</strong>';
  }
} catch (e) {
  console.log('Could not update loading indicator immediately:', e);
}

// Matchmaking Engine Implementation
class MatchmakingEngine {
  static calculateMatchScore(listing, wishlist) {
    let score = 0;
    let maxScore = 0;

    // Location scoring (40% weight) - mandatory
    const locationScore = this.calculateLocationScore(listing, wishlist);
    score += locationScore * 0.4;
    maxScore += 0.4;

    // Price alignment (30% weight) - mandatory
    const priceScore = this.calculatePriceScore(listing, wishlist);
    score += priceScore * 0.3;
    maxScore += 0.3;

    // Feature matching (20% weight)
    const featureScore = this.calculateFeatureScore(listing, wishlist);
    score += featureScore * 0.2;
    maxScore += 0.2;

    // Timeline compatibility (10% weight)
    const timelineScore = this.calculateTimelineScore(listing, wishlist);
    score += timelineScore * 0.1;
    maxScore += 0.1;

    return Math.round((score / maxScore) * 100);
  }

  static calculateLocationScore(listing, wishlist) {
    // Simplified location matching - in real implementation would use PostGIS
    const listingLocation = listing.address.toLowerCase();
    const wishlistLocations = wishlist.locations.map(loc => loc.toLowerCase());
    
    for (const location of wishlistLocations) {
      if (listingLocation.includes(location.toLowerCase())) {
        return 1.0; // Perfect match
      }
    }
    return 0.6; // Partial match for demo
  }

  static calculatePriceScore(listing, wishlist) {
    const listingPrice = listing.price;
    const { min, max } = wishlist.budget;
    
    if (listingPrice >= min && listingPrice <= max) {
      return 1.0; // Perfect price fit
    } else if (listingPrice < min) {
      return Math.max(0, 1 - (min - listingPrice) / min * 2);
    } else {
      return Math.max(0, 1 - (listingPrice - max) / max * 2);
    }
  }

  static calculateFeatureScore(listing, wishlist) {
    // Simplified feature matching
    const mustHaveCount = wishlist.mustHaves.length;
    const niceToHaveCount = wishlist.niceToHaves.length;
    
    let mustHaveMatches = 0;
    let niceToHaveMatches = 0;
    
    // In real implementation, would check listing features against requirements
    mustHaveMatches = Math.floor(mustHaveCount * 0.8); // 80% match for demo
    niceToHaveMatches = Math.floor(niceToHaveCount * 0.6); // 60% match for demo
    
    const mustHaveScore = mustHaveCount > 0 ? mustHaveMatches / mustHaveCount : 1;
    const niceToHaveScore = niceToHaveCount > 0 ? niceToHaveMatches / niceToHaveCount : 1;
    
    return (mustHaveScore * 0.7) + (niceToHaveScore * 0.3);
  }

  static calculateTimelineScore(listing, wishlist) {
    // Simplified timeline matching
    const timelineMap = {
      '0-3 months': 1.0,
      '3-6 months': 0.8,
      '6-12 months': 0.6,
      '12+ months': 0.4
    };
    
    return timelineMap[wishlist.timeline] || 0.5;
  }

  static findMatches(wishlist) {
    return listings.map(listing => ({
      listing,
      score: this.calculateMatchScore(listing, wishlist)
    })).filter(match => match.score >= 50) // Only show matches above 50%
    .sort((a, b) => b.score - a.score);
  }
}

// Subscription and messaging controls
class SubscriptionManager {
  static canUserMessage(userId, userRole) {
    const subscription = userSubscriptions[userId];
    if (!subscription) return false;
    
    // Buyers are always free and cannot initiate messaging
    if (userRole === 'buyer') return false;
    
    // All other roles need paid subscriptions to message
    return subscription.canMessage;
  }

  static getUpgradePrompt(userRole) {
    const prompts = {
      buyer: "Messaging is available to sellers and agents. Sellers can contact you about matches!",
      seller: "Upgrade to Seller Pro to message buyers and unlock detailed analytics.",
      agent: "Agent Pro subscription required for messaging and advanced analytics.",
      mortgage: "Subscription required to contact qualified leads."
    };
    
    return prompts[userRole] || "Subscription required for messaging features.";
  }
}

const appRoot = document.getElementById('app-root');
const roleSelect = document.getElementById('role-select');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');

// Debug: Check if elements exist
console.log('DOM Elements Check:', {
  appRoot: !!appRoot,
  roleSelect: !!roleSelect,
  modal: !!modal,
  modalTitle: !!modalTitle,
  modalContent: !!modalContent
});

if (!appRoot) {
  console.error('app-root element not found!');
}

const state = {
  view: 'landing',
  role: 'buyer',
  buyerId: buyers[0]?.id || 'buyer-1',
};

const safeStructuredClone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const generateId = (prefix) => {
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2);
  return `${prefix}-${random}`;
};

const navButtons = document.querySelectorAll('.nav-btn');
if (navButtons.length > 0) {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.dataset.target;
      renderApp();
    });
  });
} else {
  console.warn('No nav buttons found');
}

if (roleSelect) {
  roleSelect.addEventListener('change', (event) => {
    state.role = event.target.value;
    state.view = 'role';
    renderApp();
  });
} else {
  console.warn('Role select element not found');
}

if (modal) {
  modal.addEventListener('close', () => {
    modalContent.innerHTML = '';
  });
} else {
  console.warn('Modal element not found');
}

function renderApp() {
  console.log('renderApp called, current state:', state);
  
  if (!appRoot) {
    console.error('Cannot render: appRoot element not found');
    return;
  }
  
  // Remove loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
  
  appRoot.innerHTML = '';

  try {
    switch (state.view) {
      case 'landing':
        appRoot.append(renderLanding());
        break;
      case 'auth':
        appRoot.append(renderOnboarding());
        break;
      case 'notifications':
        appRoot.append(renderNotifications());
        break;
      case 'subscription':
        appRoot.append(renderSubscriptions());
        break;
      case 'role':
      default:
        appRoot.append(renderRoleExperience());
    }
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    appRoot.innerHTML = `
      <div style="padding: 2rem; background: #fee; border: 1px solid #fcc; border-radius: 0.5rem;">
        <h2>Error Loading Application</h2>
        <p>There was an error loading the application. Please check the console for details.</p>
        <pre>${error.message}</pre>
      </div>
    `;
  }
}

function renderLanding() {
  const section = createSection({
    title: 'Demand-led real estate intelligence',
    description:
      'Explore how Buyer Registry flips the MLS model by centring qualified buyers. Walk through experience demos for each role to see the demand-first workflows.',
  });

  const hero = document.createElement('div');
  hero.className = 'hero';
  hero.innerHTML = `
    <div>
      <h2>Match supply to real buyer demand</h2>
      <p>Buyers share rich wishlists, sellers unlock analytics and outreach, and agents gain regional intelligence. The prototype below highlights the unified product vision.</p>
      <div class="pill-group">
        <span class="pill">Buyer wishlists</span>
        <span class="pill">Match scores</span>
        <span class="pill">Analytics</span>
        <span class="pill">Secure messaging</span>
      </div>
    </div>
    <div class="hero-illustration" role="presentation" aria-hidden="true"></div>
  `;

  section.append(hero);

  // Community Interest Map
  const mapSection = document.createElement('div');
  mapSection.className = 'community-map-section';
  mapSection.innerHTML = `
    <div class="section-header">
      <h2>Buyer Interest Communities</h2>
      <p class="section-description">Live view of communities where registered buyers are actively searching</p>
    </div>
    <div class="map-container">
      <div id="google-map" class="google-map-container">
        <div class="map-loading">
          🗺️ Loading interactive map...
          <br><small>Powered by Google Maps</small>
        </div>
      </div>
      <div class="map-legend">
        <h4>Active Buyer Interest</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-dot high"></span>
            <span>High Interest (20+ buyers)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot medium"></span>
            <span>Medium Interest (10-19 buyers)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot low"></span>
            <span>Active Interest (5-9 buyers)</span>
          </div>
        </div>
      </div>
    </div>
    <div class="map-summary">
      <div class="grid grid-3">
        <div class="stat-card">
          <h3>${communityInterest.reduce((sum, c) => sum + c.activeBuyers, 0)}</h3>
          <p>Active Buyers</p>
        </div>
        <div class="stat-card">
          <h3>${communityInterest.length}</h3>
          <p>Communities</p>
        </div>
        <div class="stat-card">
          <h3>$${Math.round(communityInterest.reduce((sum, c) => sum + c.avgBudget, 0) / communityInterest.length / 1000)}K</h3>
          <p>Avg Budget</p>
        </div>
      </div>
    </div>
  `;

  section.append(mapSection);

  // Initialize Google Map after the section is added to DOM
  setTimeout(() => {
    initCommunityMap();
  }, 100);

  // Buyer Market Insights Section
  const insightsSection = document.createElement('div');
  insightsSection.className = 'buyer-insights-section';
  insightsSection.innerHTML = `
    <div class="section-header">
      <h2>📊 Buyer Market Insights</h2>
      <p class="section-description">Real-time analytics from our active buyer registry</p>
    </div>
    
    <div class="insights-grid">
      <!-- Pre-qualification Rate -->
      <div class="insight-card">
        <div class="insight-header">
          <h3>Pre-Qualified Buyers</h3>
          <div class="insight-metric">
            <span class="metric-value">${buyerInsights.prequalificationRate}%</span>
            <span class="metric-label">of ${buyerInsights.totalBuyers} buyers</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${buyerInsights.prequalificationRate}%"></div>
        </div>
        <p class="insight-note">${Math.round(buyerInsights.totalBuyers * buyerInsights.prequalificationRate / 100)} buyers have mortgage pre-approval</p>
      </div>

      <!-- Purchase Timeline -->
      <div class="insight-card">
        <div class="insight-header">
          <h3>Looking to Purchase</h3>
        </div>
        <div class="timeline-breakdown">
          ${buyerInsights.purchaseTimelines.map(timeline => `
            <div class="timeline-item">
              <div class="timeline-label">
                <span class="timeline-period">${timeline.period}</span>
                <span class="timeline-count">${timeline.count} buyers</span>
              </div>
              <div class="timeline-bar">
                <div class="timeline-fill" style="width: ${timeline.percentage}%"></div>
                <span class="timeline-percentage">${timeline.percentage}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Top Buyer Wants -->
      <div class="insight-card">
        <div class="insight-header">
          <h3>Most Common Buyer Wants</h3>
        </div>
        <div class="wants-list">
          ${buyerInsights.topWants.slice(0, 6).map((want, index) => `
            <div class="want-item">
              <div class="want-rank">${index + 1}</div>
              <div class="want-details">
                <span class="want-feature">${want.feature}</span>
                <div class="want-stats">
                  <span class="want-percentage">${want.percentage}%</span>
                  <span class="want-count">(${want.count} buyers)</span>
                </div>
              </div>
              <div class="want-bar">
                <div class="want-fill" style="width: ${want.percentage}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  section.append(insightsSection);

  const highlights = document.createElement('div');
  highlights.className = 'grid grid-3';

  const cards = [
    {
      title: 'Buyer-first Workflows',
      body: 'Granular wishlists, location tools, and match analytics give buyers confidence and surface qualified demand for the market.',
    },
    {
      title: 'Revenue-enabled Access',
      body: 'Sellers, agents, and lenders graduate from aggregate demand signals to direct outreach through paid tiers.',
    },
    {
      title: 'Azure-native Architecture',
      body: 'Managed PostgreSQL, Cognitive Search, SignalR, and Functions power secure matchmaking, analytics, and messaging.',
    },
  ];

  cards.forEach((card) => {
    const el = document.createElement('article');
    el.className = 'analytics-card';
    el.innerHTML = `<h3>${card.title}</h3><p>${card.body}</p>`;
    highlights.append(el);
  });

  section.append(highlights);
  return section;
}

function renderOnboarding() {
  const flows = onboardingFlows[state.role];
  const section = createSection({
    title: 'Role-specific onboarding',
    description: 'Screen-by-screen walkthrough of account creation requirements and verification steps.',
  });

  const list = document.createElement('ol');
  list.className = 'form-grid';

  flows.forEach((step) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${step.title}</strong><p>${step.description}</p>`;
    list.append(item);
  });

  section.append(list);
  return section;
}

function renderNotifications() {
  const section = createSection({
    title: 'Notification centre',
    description: 'System, match, and messaging alerts differ per role and respect user frequency preferences.',
  });

  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Audience</th>
        <th>Trigger</th>
        <th>Channel</th>
      </tr>
    </thead>
    <tbody>
      ${notifications
        .map(
          (n) => `
            <tr>
              <td>${n.role}</td>
              <td>${n.trigger}</td>
              <td>${n.channels.join(', ')}</td>
            </tr>
          `,
        )
        .join('')}
    </tbody>
  `;

  section.append(table);
  return section;
}

function renderSubscriptions() {
  const section = createSection({
    title: 'Subscription tiers',
    description: 'Feature gating and value ladders for each persona.',
  });

  const grid = document.createElement('div');
  grid.className = 'analytics-grid';

  subscriptions.forEach((plan) => {
    const card = document.createElement('article');
    card.className = 'analytics-card';
    card.innerHTML = `
      <div class="section-header">
        <h3>${plan.name}</h3>
        <span class="badge">${plan.price}</span>
      </div>
      <ul>
        ${plan.features.map((feature) => `<li>${feature}</li>`).join('')}
      </ul>
    `;
    grid.append(card);
  });

  section.append(grid);
  return section;
}

function renderRoleExperience() {
  switch (state.role) {
    case 'buyer':
      return renderBuyerExperience();
    case 'seller':
      return renderSellerExperience();
    case 'agent':
      return renderAgentExperience();
    case 'mortgage':
    default:
      return renderMortgageExperience();
  }
}

function renderBuyerExperience() {
  const buyer = buyers.find((b) => b.id === state.buyerId) ?? buyers[0];
  const section = createSection({
    title: `${buyer.name}'s dashboard`,
    description: 'Manage wishlists, review matches, and collaborate with sellers or agents.',
  });

  const wishlistGrid = document.createElement('div');
  wishlistGrid.className = 'grid grid-2';

  buyer.wishlists.forEach((wishlist) => {
    const template = document.getElementById('buyer-wishlist-template');
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.wishlist-name').textContent = wishlist.name;
    node.querySelector('.wishlist-status').textContent = wishlist.active ? 'Active' : 'Archived';
    node.querySelector('.wishlist-description').textContent = wishlist.description;
    node.querySelector('.wishlist-matches').textContent = `${wishlist.matches} listings`;
    node.querySelector('.wishlist-score').textContent = `${wishlist.topMatch}%`;
    node.querySelector('.wishlist-budget').textContent = `$${wishlist.budget.min.toLocaleString()} - $${wishlist.budget.max.toLocaleString()}`;
    node.querySelector('.wishlist-timeline').textContent = wishlist.timeline;

    const features = node.querySelector('.wishlist-features');
    wishlist.mustHaves.forEach((feature) => {
      const pill = document.createElement('span');
      pill.className = 'pill must-have';
      pill.textContent = feature;
      features.append(pill);
    });

    wishlist.niceToHaves.forEach((feature) => {
      const pill = document.createElement('span');
      pill.className = 'pill nice-to-have';
      pill.textContent = feature;
      features.append(pill);
    });

    node.querySelector('.view-wishlist').addEventListener('click', () => openWishlistModal(wishlist));
    node.querySelector('.edit-wishlist').addEventListener('click', () => openWishlistForm('Edit wishlist', wishlist));
    node.querySelector('.duplicate-wishlist').addEventListener('click', () => duplicateWishlist(buyer.id, wishlist.id));

    wishlistGrid.append(node);
  });

  const actions = document.createElement('div');
  actions.className = 'card';
  actions.innerHTML = `
    <div class="card-header">
      <h3>Create new wishlist</h3>
    </div>
    <div class="card-body">
      <p>Capture new search areas or lifestyle needs. The matchmaking engine will instantly recalculate relevant listings.</p>
      <div class="form-actions">
        <button class="primary-button" id="new-wishlist-btn">Launch wizard</button>
        <button class="ghost-button" id="run-matchmaking-btn">🔍 Run matchmaking demo</button>
      </div>
    </div>
  `;

  actions.querySelector('#new-wishlist-btn').addEventListener('click', () => openWishlistForm('Create wishlist'));
  actions.querySelector('#run-matchmaking-btn').addEventListener('click', () => demonstrateMatchmaking(buyer));

  section.append(wishlistGrid, actions, renderBuyerMessaging(buyer));
  return section;
}

function renderBuyerMessaging(buyer) {
  const messagingSection = document.createElement('section');
  messagingSection.className = 'section';
  messagingSection.innerHTML = `
    <div class="section-header">
      <h2>Messages</h2>
      <p class="section-description">In-app chat keeps personal contact details private. Buyers can respond when sellers or agents initiate contact.</p>
    </div>
    <div class="messaging-notice">
      <div class="notice-card">
        <h3>🔒 Messaging for Buyers</h3>
        <p>As a registered buyer, you can <strong>receive and respond</strong> to messages from sellers, agents, and mortgage professionals. You cannot initiate conversations, but they can contact you about matches!</p>
        <div class="notice-features">
          <span class="pill">✓ Receive messages</span>
          <span class="pill">✓ Respond to inquiries</span>
          <span class="pill">✓ Private & secure</span>
        </div>
      </div>
    </div>
    <div class="grid grid-2">
      ${buyer.messages
        .map(
          (thread) => `
            <article class="card">
              <div class="card-header">
                <h3>${thread.counterparty}</h3>
                <span class="badge">${thread.status}</span>
              </div>
              <div class="card-body">
                <p><strong>Wishlist:</strong> ${thread.wishlist}</p>
                <p>${thread.preview}</p>
              </div>
              <div class="card-footer">
                <button class="ghost-button" data-thread="${thread.id}">Open chat</button>
              </div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;

  messagingSection.querySelectorAll('button[data-thread]').forEach((button) => {
    button.addEventListener('click', (event) => openChat(event.target.dataset.thread, 'buyer'));
  });

  return messagingSection;
}

function renderSellerExperience() {
  const section = createSection({
    title: 'Seller / homeowner workspace',
    description: 'Optimise listings with demand metrics and paid upgrades for outreach.',
  });

  const listingGrid = document.createElement('div');
  listingGrid.className = 'grid grid-2';

  listings.forEach((listing) => {
    const template = document.getElementById('listing-card-template');
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.listing-hero').src = listing.photo;
    node.querySelector('.listing-address').textContent = listing.address;
    node.querySelector('.listing-status').textContent = listing.status;
    node.querySelector('.listing-summary').textContent = listing.summary;
    node.querySelector('.listing-score').textContent = `${listing.score}%`;
    node.querySelector('.listing-matches').textContent = `${listing.matchedBuyers} buyers`;
    node.querySelector('.listing-price').textContent = `$${listing.price.toLocaleString()}`;
    node.querySelector('.listing-type').textContent = listing.type;

    const chips = node.querySelector('.insight-chips');
    listing.highlights.forEach((highlight) => {
      const span = document.createElement('span');
      span.className = 'insight-chip';
      span.textContent = highlight;
      chips.append(span);
    });

    node.querySelector('.view-insights').addEventListener('click', () => openListingInsights(listing));
    node.querySelector('.contact-buyers').addEventListener('click', () => openUpgradePrompt());

    listingGrid.append(node);
  });

  section.append(listingGrid, renderSellerAnalytics());
  return section;
}

function renderSellerAnalytics() {
  const analytics = document.createElement('section');
  analytics.className = 'section';
  analytics.innerHTML = `
    <div class="section-header">
      <h2>Demand analytics</h2>
      <p class="section-description">Aggregate interest by budget, features, and buyer timelines.</p>
    </div>
    <div class="analytics-grid">
      <article class="analytics-card">
        <h3>Budget distribution</h3>
        ${renderMetric('Under $900K', 45)}
        ${renderMetric('$900K - $1.1M', 30)}
        ${renderMetric('$1.1M+', 25)}
      </article>
      <article class="analytics-card">
        <h3>Top requested features</h3>
        <ul>
          <li>3+ bedrooms (82% of matched buyers)</li>
          <li>Dedicated office space (54%)</li>
          <li>EV-ready parking (31%)</li>
        </ul>
      </article>
      <article class="analytics-card">
        <h3>Timeline urgency</h3>
        ${renderMetric('0-3 months', 38)}
        ${renderMetric('3-6 months', 42)}
        ${renderMetric('6+ months', 20)}
      </article>
    </div>
  `;

  return analytics;
}

function renderMetric(label, value) {
  return `
    <div>
      <div class="section-description" style="font-size:0.85rem;">${label}</div>
      <div class="metric-bar"><span style="width:${value}%;"></span></div>
    </div>
  `;
}

function renderAgentExperience() {
  const section = createSection({
    title: 'Agent Pro analytics',
    description: 'Discover buyer heatmaps, demand funnels, and multi-listing match strategies.',
  });

  const overview = document.createElement('div');
  overview.className = 'analytics-grid';

  agents.analyticsCards.forEach((card) => {
    const el = document.createElement('article');
    el.className = 'analytics-card';
    el.innerHTML = `<h3>${card.title}</h3><ul>${card.points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
    overview.append(el);
  });

  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Wishlist</th>
        <th>Target Area</th>
        <th>Match Score</th>
        <th>Aligned Listings</th>
      </tr>
    </thead>
    <tbody>
      ${agents.matches
        .map(
          (match) => `
            <tr>
              <td>${match.alias}</td>
              <td>${match.area}</td>
              <td>${match.score}%</td>
              <td>${match.listings.join(', ')}</td>
            </tr>
          `,
        )
        .join('')}
    </tbody>
  `;

  section.append(overview, table);
  return section;
}

function renderMortgageExperience() {
  const section = createSection({
    title: 'Mortgage agent workspace',
    description: 'Prioritise leads who request outreach or need financing support.',
  });

  const leadGrid = document.createElement('div');
  leadGrid.className = 'grid grid-2';

  mortgageLeads.forEach((lead) => {
    const template = document.getElementById('lead-card-template');
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.lead-name').textContent = lead.name;
    node.querySelector('.lead-status').textContent = lead.status;
    node.querySelector('.lead-location').textContent = lead.location;
    node.querySelector('.lead-budget').textContent = `$${lead.budget.min.toLocaleString()} - $${lead.budget.max.toLocaleString()}`;
    node.querySelector('.lead-timeline').textContent = lead.timeline;
    node.querySelector('.lead-notes').textContent = lead.notes;
    node.querySelector('.start-chat').addEventListener('click', () => openChat(lead.threadId));

    leadGrid.append(node);
  });

  section.append(leadGrid);
  return section;
}

function openWishlistModal(wishlist) {
  modalTitle.textContent = `${wishlist.name} · Match insights`;
  modalContent.innerHTML = `
    <div class="form-grid">
      <div>
        <h3>Location focus</h3>
        <p>${wishlist.locations.join(', ')}</p>
      </div>
      <div>
        <h3>Feature priorities</h3>
        <ul>
          ${wishlist.mustHaves.map((f) => `<li><strong>Must:</strong> ${f}</li>`).join('')}
          ${wishlist.niceToHaves.map((f) => `<li><strong>Nice:</strong> ${f}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h3>Analytics</h3>
        <p>Average listing price in focus area: $${wishlist.analytics.avgPrice.toLocaleString()}</p>
        <p>Matching sellers: ${wishlist.matches}</p>
        <p>New matches this week: ${wishlist.analytics.newThisWeek}</p>
      </div>
    </div>
  `;
  modal.showModal();
}

function openWishlistForm(title, wishlist) {
  modalTitle.textContent = title;
  modalContent.innerHTML = `
    <form id="wishlist-form" class="form-grid">
      <label>
        Wishlist name
        <input name="name" required value="${wishlist?.name ?? ''}" />
      </label>
      <label>
        Target locations (comma separated)
        <input name="locations" value="${wishlist?.locations.join(', ') ?? ''}" />
      </label>
      <label>
        Budget range
        <div class="form-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
          <input name="min" type="number" min="0" placeholder="Min" value="${wishlist?.budget.min ?? ''}" />
          <input name="max" type="number" min="0" placeholder="Max" value="${wishlist?.budget.max ?? ''}" />
        </div>
      </label>
      <label>
        Timeline
        <select name="timeline">
          ${['0-3 months', '3-6 months', '6+ months']
            .map((option) => `<option value="${option}" ${wishlist?.timeline === option ? 'selected' : ''}>${option}</option>`)
            .join('')}
        </select>
      </label>
      <label>
        Must-have features
        <textarea name="mustHaves" placeholder="List features separated by commas">${wishlist?.mustHaves.join(', ') ?? ''}</textarea>
      </label>
      <label>
        Nice-to-have features
        <textarea name="niceToHaves" placeholder="List features separated by commas">${wishlist?.niceToHaves.join(', ') ?? ''}</textarea>
      </label>
      <div class="form-actions">
        <button type="submit" class="primary-button">Save wishlist</button>
      </div>
    </form>
  `;

  modal.showModal();

  const form = document.getElementById('wishlist-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const updatedWishlist = {
      id: wishlist?.id ?? generateId('wishlist'),
      name: formData.get('name'),
      locations: formData.get('locations').split(',').map((item) => item.trim()).filter(Boolean),
      budget: {
        min: Number(formData.get('min')),
        max: Number(formData.get('max')),
      },
      timeline: formData.get('timeline'),
      mustHaves: formData.get('mustHaves').split(',').map((item) => item.trim()).filter(Boolean),
      niceToHaves: formData.get('niceToHaves').split(',').map((item) => item.trim()).filter(Boolean),
      description: wishlist?.description ?? 'Updated wishlist requirements.',
      matches: wishlist?.matches ?? 0,
      topMatch: wishlist?.topMatch ?? 0,
      active: true,
      analytics: wishlist?.analytics ?? { avgPrice: 0, newThisWeek: 0 },
    };

    const buyer = buyers.find((b) => b.id === state.buyerId);
    const existingIndex = buyer.wishlists.findIndex((w) => w.id === updatedWishlist.id);
    if (existingIndex >= 0) {
      buyer.wishlists.splice(existingIndex, 1, updatedWishlist);
    } else {
      buyer.wishlists.push({ ...updatedWishlist, matches: Math.floor(Math.random() * 15), topMatch: 75 + Math.floor(Math.random() * 20) });
    }

    modal.close();
    renderApp();
  });
}

function duplicateWishlist(buyerId, wishlistId) {
  const buyer = buyers.find((b) => b.id === buyerId);
  const wishlist = buyer.wishlists.find((w) => w.id === wishlistId);
  const clone = safeStructuredClone(wishlist);
  clone.id = generateId('wishlist');
  clone.name = `${clone.name} (Copy)`;
  clone.analytics.newThisWeek = 0;
  clone.matches = Math.floor(clone.matches * 0.6);
  clone.topMatch = Math.min(100, clone.topMatch - 5);
  buyer.wishlists.unshift(clone);
  renderApp();
}

function openListingInsights(listing) {
  modalTitle.textContent = `${listing.address} · Buyer demand`; 
  modalContent.innerHTML = `
    <div class="form-grid">
      <div>
        <h3>Match quality</h3>
        ${renderMetric('Feature fit', listing.metrics.feature)}
        ${renderMetric('Location overlap', listing.metrics.location)}
        ${renderMetric('Timeline alignment', listing.metrics.timeline)}
      </div>
      <div>
        <h3>Top wishlists</h3>
        <ul>
          ${listing.topWishlists.map((item) => `<li>${item.alias} · ${item.score}% match</li>`).join('')}
        </ul>
      </div>
      <div>
        <h3>Upgrade message</h3>
        <p>Upgrade to unlock buyer profiles and start direct conversations with the ${listing.matchedBuyers} matched buyers.</p>
      </div>
    </div>
  `;
  modal.showModal();
}

function openUpgradePrompt() {
  modalTitle.textContent = 'Upgrade required';
  modalContent.innerHTML = `
    <p>Messaging buyers and viewing detailed analytics is reserved for Seller Pro accounts. Upgrade now to unlock conversations, lead insights, and export capabilities.</p>
    <div class="form-actions">
      <button class="ghost-button" value="cancel">Later</button>
      <button class="primary-button" value="confirm">Upgrade to Pro</button>
    </div>
  `;
  modal.showModal();
}

function openChat(threadId, userRole = state.role) {
  const userId = state.role === 'buyer' ? state.buyerId : `${state.role}-1`;
  
  // Check if user can message
  if (!SubscriptionManager.canUserMessage(userId, userRole)) {
    modalTitle.textContent = 'Messaging Access';
    modalContent.innerHTML = `
      <div class="subscription-notice">
        <h3>💬 ${userRole === 'buyer' ? 'Buyer Messaging' : 'Subscription Required'}</h3>
        <p>${SubscriptionManager.getUpgradePrompt(userRole)}</p>
        ${userRole === 'buyer' ? `
          <div class="buyer-messaging-info">
            <p><strong>Good news!</strong> You can still:</p>
            <ul>
              <li>✓ Receive messages from sellers and agents</li>
              <li>✓ Respond to their inquiries</li>
              <li>✓ Get notified about new matches</li>
            </ul>
            <p>Sellers and agents with subscriptions can initiate conversations with you.</p>
          </div>
        ` : `
          <div class="form-actions">
            <button class="ghost-button" value="cancel">Later</button>
            <button class="primary-button" value="confirm">Upgrade Now</button>
          </div>
        `}
      </div>
    `;
    modal.showModal();
    return;
  }
  
  modalTitle.textContent = 'Secure messaging';
  modalContent.innerHTML = `
    <div class="form-grid">
      <p>Chat thread <strong>${threadId}</strong> opens within the in-app messenger. For demo purposes, this shows how conversations remain private and auditable.</p>
      <div class="chat-preview">
        <div class="message received">
          <p>Hi! I noticed your listing matches several buyer wishlists. Are you open to a quick call?</p>
          <span class="timestamp">2 hours ago</span>
        </div>
        <div class="message sent">
          <p>Absolutely! I'm available this afternoon. What questions do you have?</p>
          <span class="timestamp">1 hour ago</span>
        </div>
      </div>
      <textarea placeholder="Type a reply..." rows="4"></textarea>
      <div class="form-actions">
        <button class="ghost-button">Attach File</button>
        <button class="primary-button">Send message</button>
      </div>
    </div>
  `;
  modal.showModal();
}

function demonstrateMatchmaking(buyer) {
  const wishlist = buyer.wishlists[0]; // Use first wishlist for demo
  const matches = MatchmakingEngine.findMatches(wishlist);
  
  modalTitle.textContent = '🔍 Matchmaking Engine Demo';
  modalContent.innerHTML = `
    <div class="matchmaking-demo">
      <h3>Running matchmaking for: "${wishlist.name}"</h3>
      <div class="wishlist-criteria">
        <p><strong>Budget:</strong> $${wishlist.budget.min.toLocaleString()} - $${wishlist.budget.max.toLocaleString()}</p>
        <p><strong>Locations:</strong> ${wishlist.locations.join(', ')}</p>
        <p><strong>Timeline:</strong> ${wishlist.timeline}</p>
      </div>
      
      <div class="matching-results">
        <h4>🎯 Found ${matches.length} matches:</h4>
        ${matches.map(match => `
          <div class="match-result">
            <div class="match-header">
              <h5>${match.listing.address}</h5>
              <span class="match-score">${match.score}%</span>
            </div>
            <p class="match-details">
              ${match.listing.summary}<br>
              <strong>Price:</strong> $${match.listing.price.toLocaleString()} | 
              <strong>Type:</strong> ${match.listing.type}
            </p>
            <div class="score-breakdown">
              <small>
                📍 Location: ${Math.round(MatchmakingEngine.calculateLocationScore(match.listing, wishlist) * 40)}% | 
                💰 Price: ${Math.round(MatchmakingEngine.calculatePriceScore(match.listing, wishlist) * 30)}% | 
                🏠 Features: ${Math.round(MatchmakingEngine.calculateFeatureScore(match.listing, wishlist) * 20)}% | 
                ⏰ Timeline: ${Math.round(MatchmakingEngine.calculateTimelineScore(match.listing, wishlist) * 10)}%
              </small>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="algorithm-info">
        <h4>🧮 Algorithm Details:</h4>
        <ul>
          <li><strong>Location Matching (40%):</strong> PostGIS proximity + polygon overlap</li>
          <li><strong>Price Alignment (30%):</strong> Budget range compatibility</li>
          <li><strong>Feature Scoring (20%):</strong> Must-have vs nice-to-have weighting</li>
          <li><strong>Timeline Fit (10%):</strong> Purchase timeline alignment</li>
        </ul>
      </div>
      
      <div class="form-actions">
        <button class="primary-button" value="close">Close Demo</button>
      </div>
    </div>
  `;
  modal.showModal();
}

function createSection({ title, description }) {
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="section-header">
      <h2>${title}</h2>
      <p class="section-description">${description}</p>
    </div>
  `;
  return section;
}

// Google Maps Integration
let map;
let markers = [];

function initMap() {
  console.log('Google Maps API loaded');
  // This will be called when Google Maps API loads
  // The actual map initialization happens in initCommunityMap
}

function initCommunityMap() {
  const mapContainer = document.getElementById('google-map');
  if (!mapContainer) {
    console.log('Map container not found, retrying...');
    setTimeout(initCommunityMap, 500);
    return;
  }

  if (!window.google || !window.google.maps) {
    console.log('Google Maps API not loaded yet, showing fallback');
    mapContainer.innerHTML = `
      <div class="map-fallback">
        <h3>🗺️ Interactive Map</h3>
        <p>Google Maps integration ready - API key needed for full functionality</p>
        <div class="community-list">
          ${communityInterest.map(community => `
            <div class="community-item">
              <div class="community-info">
                <h4>${community.name}</h4>
                <p><strong>${community.activeBuyers}</strong> active buyers</p>
                <p>Avg budget: <strong>$${community.avgBudget.toLocaleString()}</strong></p>
                <div class="features">
                  ${community.topFeatures.slice(0, 2).map(feature => `<span class="pill">${feature}</span>`).join('')}
                </div>
              </div>
              <div class="buyer-indicator ${community.activeBuyers >= 20 ? 'high' : community.activeBuyers >= 10 ? 'medium' : 'low'}">
                ${community.activeBuyers}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  try {
    // Center map on Vancouver area
    const vancouverCenter = { lat: 49.2827, lng: -123.1207 };
    
    map = new google.maps.Map(mapContainer, {
      zoom: 10,
      center: vancouverCenter,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add markers for each community
    communityInterest.forEach(community => {
      const position = {
        lat: community.coordinates[0],
        lng: community.coordinates[1]
      };

      // Create custom marker
      const markerColor = community.activeBuyers >= 20 ? '#dc2626' : 
                         community.activeBuyers >= 10 ? '#ea580c' : '#16a34a';

      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: community.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="map-info-window">
            <h4>${community.name}</h4>
            <p><strong>${community.activeBuyers}</strong> active buyers</p>
            <p>Avg budget: <strong>$${community.avgBudget.toLocaleString()}</strong></p>
            <div class="info-features">
              ${community.topFeatures.slice(0, 3).map(feature => `<span class="info-pill">${feature}</span>`).join('')}
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close other info windows
        markers.forEach(m => m.infoWindow.close());
        infoWindow.open(map, marker);
      });

      markers.push({ marker, infoWindow });
    });

    console.log('Google Map initialized with', markers.length, 'community markers');

  } catch (error) {
    console.error('Error initializing Google Map:', error);
    mapContainer.innerHTML = `
      <div class="map-error">
        <h3>⚠️ Map Loading Error</h3>
        <p>Unable to load interactive map. Please check console for details.</p>
      </div>
    `;
  }
}

// Make initMap available globally for Google Maps callback
window.initMap = initMap;

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Immediate visual feedback
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.innerHTML = `
      <h2>🔄 Loading Buyer Registry...</h2>
      <p>DOM loaded, initializing JavaScript...</p>
      <div style="margin: 1rem 0; padding: 1rem; background: #e3f2fd; border-radius: 5px;">
        <strong>Debug Info:</strong><br>
        - Script loaded: ✅<br>
        - DOM ready: ✅<br>
        - Initializing app...<br>
      </div>
    `;
  }
  
  setTimeout(() => {
    renderApp();
  }, 100);
});

// Fallback initialization if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, event listener will handle it
  console.log('DOM still loading, waiting...');
} else {
  // DOM is already loaded
  console.log('DOM already loaded, initializing app immediately...');
  
  // Immediate visual feedback
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.innerHTML = `
      <h2>🔄 Loading Buyer Registry...</h2>
      <p>DOM already loaded, initializing JavaScript...</p>
      <div style="margin: 1rem 0; padding: 1rem; background: #e3f2fd; border-radius: 5px;">
        <strong>Debug Info:</strong><br>
        - Script loaded: ✅<br>
        - DOM ready: ✅<br>
        - Initializing app...<br>
      </div>
    `;
  }
  
  setTimeout(() => {
    renderApp();
  }, 100);
}
