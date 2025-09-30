import { buyers, listings, agents, mortgageLeads, notifications, subscriptions, onboardingFlows } from './data.js';

const appRoot = document.getElementById('app-root');
const roleSelect = document.getElementById('role-select');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');

const state = {
  view: 'landing',
  role: 'buyer',
  buyerId: buyers[0].id,
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
navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.view = button.dataset.target;
    renderApp();
  });
});

roleSelect.addEventListener('change', (event) => {
  state.role = event.target.value;
  state.view = 'role';
  renderApp();
});

modal.addEventListener('close', () => {
  modalContent.innerHTML = '';
});

function renderApp() {
  appRoot.innerHTML = '';

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
      <button class="primary-button" id="new-wishlist-btn">Launch wizard</button>
    </div>
  `;

  actions.querySelector('#new-wishlist-btn').addEventListener('click', () => openWishlistForm('Create wishlist'));

  section.append(wishlistGrid, actions, renderBuyerMessaging(buyer));
  return section;
}

function renderBuyerMessaging(buyer) {
  const messagingSection = document.createElement('section');
  messagingSection.className = 'section';
  messagingSection.innerHTML = `
    <div class="section-header">
      <h2>Messages</h2>
      <p class="section-description">In-app chat keeps personal contact details private.</p>
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
    button.addEventListener('click', (event) => openChat(event.target.dataset.thread));
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

function openChat(threadId) {
  modalTitle.textContent = 'Secure messaging';
  modalContent.innerHTML = `
    <div class="form-grid">
      <p>Chat thread <strong>${threadId}</strong> opens within the in-app messenger. For demo purposes, this shows how conversations remain private and auditable.</p>
      <textarea placeholder="Type a reply..." rows="4"></textarea>
      <div class="form-actions">
        <button class="primary-button">Send message</button>
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

renderApp();
