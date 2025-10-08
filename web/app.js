import {
  buyers,
  buyerMapRegions,
  propertyProfiles,
  sellerHotspots,
  agents,
  mortgageLeads,
  notifications,
  subscriptions,
  onboardingFlows,
} from './data.js';
import { auth, renderAuthActions, renderLoginPage, renderRegistrationPage } from './auth.js';

const appRoot = document.getElementById('app-root');
const roleSelect = document.getElementById('role-select');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');

const state = {
  view: 'landing',
  role: 'buyer',
  buyerId: buyers[0].id,
  sellerTier: 'free',
};

// Gating helpers for Seller/Agent
function canSeeSnippets() {
  return (state.role === 'seller' || state.role === 'agent') && (state.sellerTier === 'pro');
}
function canMessage() {
  return (state.role === 'seller' || state.role === 'agent') && (state.sellerTier === 'pro');
}

// Lightweight adapter (mock). Replace with /api/matches/property/:id/summary later.
function getPropertyMatchSummary(profile) {
  if (!profile) {
    return { matches: 0, topScore: 0, gaps: [], snippet: '' };
  }

  const snapshot = profile.demandSnapshot || {};
  const matches = Number.isFinite(snapshot.matchCount)
    ? snapshot.matchCount
    : (profile.matchedBuyers ?? 0);
  const topScore = Number.isFinite(snapshot.topMatch)
    ? snapshot.topMatch
    : (profile.matchScore ?? 0);
  const gaps = Array.isArray(profile.gapInsights) && profile.gapInsights.length
    ? profile.gapInsights
    : (profile.gapHint ? [profile.gapHint] : []);
  const snippet = profile.topWishlistSnippet
    || 'Matching buyers surface as wishlists are published. Upgrade to see anonymised snippets.';

  return { matches, topScore, gaps, snippet };
}

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
    if (button.dataset && button.dataset.target) {
      state.view = button.dataset.target;
      renderApp();
    }
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

// Expose handlers used by inline onclick in index.html
// These must be on window because app.js is an ES module
window.showNotificationCenter = () => {
  state.view = 'notifications';
  renderApp();
};

window.showNotificationSettings = () => {
  modalTitle.textContent = 'Notification settings';
  modalContent.innerHTML = `
    <form class="form-grid">
      <label class="checkbox-label"><input type="checkbox" checked /> Email alerts</label>
      <label class="checkbox-label"><input type="checkbox" checked /> In-app notifications</label>
      <label class="checkbox-label"><input type="checkbox" /> SMS (high-priority only)</label>
      <div class="form-actions">
        <button class="primary-button" type="submit">Save</button>
      </div>
    </form>
  `;
  modalContent.querySelector('form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.close();
  });
  modal.showModal();
};

function renderApp() {
  appRoot.innerHTML = '';

  switch (state.view) {
    case 'landing':
      appRoot.append(renderLanding());
      break;
    case 'login':
      appRoot.append(renderLoginPage());
      break;
    case 'register':
      appRoot.append(renderRegistrationPage());
      break;
    case 'auth':
      appRoot.append(renderOnboarding());
      break;
    case 'messages':
      appRoot.append(renderMessenger());
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

// Expose simple navigation for other modules (e.g., auth.js) and inline buttons
window.gotoView = (view) => {
  state.view = view;
  renderApp();
};

// Allow auth to complete and align SPA role state
window.authComplete = (role) => {
  try {
    const sel = document.getElementById('role-select');
    if (sel) sel.value = role;
  } catch {}
  state.role = role;
  state.view = 'role';
  renderAuthActions();
  renderApp();
};

function renderMessenger() {
  const section = createSection({
    title: 'In-app messages',
    description: 'Anonymized conversations aligned to buyer wishlists and property profiles. The system publishes demand, not supply.',
  });

  const s = auth.state;
  if (!s) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>Sign in to view messages</h3>
      <p>Messaging is in-app and anonymized. No emails or phone numbers are disclosed unless both parties consent.</p>
      <div class="form-actions">
        <button class="primary-button" type="button" id="msg-login">Sign in</button>
        <button class="ghost-button" type="button" id="msg-register">Register</button>
      </div>
    `;
    card.querySelector('#msg-login')?.addEventListener('click', () => window.openAuthModal('login'));
    card.querySelector('#msg-register')?.addEventListener('click', () => window.openAuthModal('register'));
    section.append(card);
    return section;
  }

  const threads = getThreadsForRole(s.role);
  if (!threads.length) {
    section.append(createEmptyState('No conversations yet. When demand aligns, threads will appear here.'));
    return section;
  }

  const list = document.createElement('ul');
  list.className = 'notification-list';
  threads.forEach((t) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3>${t.subject}</h3>
            <p class="section-description">Thread is anonymized • Linked: ${t.linkedAlias}</p>
          </div>
          <span class="badge">${t.status}</span>
        </div>
        <div class="card-body">
          <p>${t.snippet}</p>
        </div>
        <footer class="card-footer">
          <button class="ghost-button" data-id="${t.id}" data-action="open">Open chat</button>
          <button class="ghost-button" data-id="${t.id}" data-action="mute">${t.status === 'Muted' ? 'Unmute' : 'Mute'}</button>
          <button class="ghost-button" data-id="${t.id}" data-action="disclose">Request disclosure</button>
        </footer>
      </div>
    `;
    list.append(li);
  });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const t = threads.find((x) => x.id === id);
    if (!t) return;
    if (action === 'open') openChat(t.id, t.counterparty);
    if (action === 'mute') {
      t.status = t.status === 'Muted' ? 'Reply ready' : 'Muted';
      renderApp();
    }
    if (action === 'disclose') openDisclosurePrompt({ counterparty: t.counterparty });
  });

  section.append(list);
  return section;
}

function getThreadsForRole(role) {
  // Map data.js structures to generic thread list for demo purposes
  if (role === 'buyer') {
    const b = buyers[0];
    return (b.messages || []).map((m) => ({
      id: m.id,
      subject: m.counterparty,
      linkedAlias: b.wishlists.find((w) => w.id === m.wishlistId)?.name || 'Wishlist',
      status: m.status,
      snippet: m.preview,
      counterparty: m.counterparty,
    }));
  }
  if (role === 'mortgage') {
    return (mortarize(mortgageLeads) || []).map((lead) => ({
      id: lead.threadId,
      subject: `Lead: ${lead.buyerAlias}`,
      linkedAlias: lead.buyerAlias,
      status: lead.status,
      snippet: `Budget ${formatCurrency(lead.budget.min)} - ${formatCurrency(lead.budget.max)} · ${lead.timeline}`,
      counterparty: lead.buyerAlias,
    }));
  }
  // Sellers and agents in free mode: no threads until upgrade/demo
  return [];
}

function mortarize(x) { return Array.isArray(x) ? x : []; }

function renderLanding() {
  const section = createSection({
    title: 'Demand-led matchmaking for Realestate Ready',
    description:
      'Realestate Ready is not an MLS or property listing site. Buyers publish wishlists; sellers and agents compare private property profiles against demand. The platform publishes demand, not supply.',
  });

  const hero = document.createElement('div');
  hero.className = 'hero';
  hero.innerHTML = `
    <div>
      <h2>Match private supply to visible buyer demand</h2>
      <p>Buyer Wishlists surface true demand. Sellers analyse how their Property Profiles stack up, upgrade for outreach, and keep every conversation anonymised until disclosure.</p>
      <div class="pill-group">
        <span class="pill">Buyer Wishlists</span>
        <span class="pill">Match scoring</span>
        <span class="pill">Demand analytics</span>
        <span class="pill">In-app messaging</span>
      </div>
    </div>
    <div class="hero-illustration" role="presentation" aria-hidden="true"></div>
  `;

  section.append(hero);

  const highlights = document.createElement('div');
  highlights.className = 'grid grid-3';

  const cards = [
    {
      title: 'Buyer-first visibility',
      body: 'Public Buyer Wishlists (anonymized) showcase demand bands, geo priorities, and pre-approval badges—never personal information.',
    },
    {
      title: 'Private supply intelligence',
      body: 'Sellers and agents benchmark Property Profiles for AI-driven comparisons—no homes are listed for sale.',
    },
    {
      title: 'Compliance by design',
      body: 'In-app, anonymized messaging with disclosure controls and privacy-safe maps. The system publishes demand, not supply.',
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
    title: 'Buyer dashboard · My Wishlists',
    description: 'Manage public Buyer Wishlists, monitor match analytics, and respond to paid sellers or agents who reach out.',
  });

  section.append(
    renderMapCard({
      title: 'Search areas',
      description: 'Hover to see how many Property Profiles currently match in each focus area.',
      regions: buyerMapRegions,
      formatter: (region) => `Matched ${region.count} Property Profiles`,
      emptyCopy: 'Add areas to your wishlists to populate this demand map.',
    }),
  );

  const wishlistGrid = document.createElement('div');
  wishlistGrid.className = 'grid grid-2';

  if (!buyer.wishlists.length) {
    wishlistGrid.append(createEmptyState('No matches yet — widen your budget or add more areas.'));
  } else {
    buyer.wishlists.forEach((wishlist) => {
      wishlistGrid.append(renderBuyerWishlistCard(buyer, wishlist));
    });
  }

  const actions = document.createElement('article');
  actions.className = 'card';
  actions.innerHTML = `
    <div class="card-header">
      <div>
        <h3>Create a new Buyer Wishlist</h3>
        <p class="section-description">Capture desired areas, budget, and features. Sellers see anonymised demand instantly.</p>
      </div>
      <span class="badge">Public</span>
    </div>
    <div class="card-body">
      <p>Use the wizard to add polygons, postal codes, budget bands, and lifestyle needs. Matchmaking runs immediately after saving.</p>
    </div>
    <footer class="card-footer">
      <button class="primary-button" id="new-wishlist-btn">Launch wishlist wizard</button>
    </footer>
  `;
  actions.querySelector('#new-wishlist-btn').addEventListener('click', () => openWishlistForm('Create Buyer Wishlist'));

  section.append(wishlistGrid, actions, renderBuyerInsights(buyer), renderBuyerMessaging(buyer), renderBuyerNotifications(buyer));
  return section;
}

function renderBuyerWishlistCard(buyer, wishlist) {
  const template = document.getElementById('buyer-wishlist-template');
  const node = template.content.firstElementChild.cloneNode(true);

  node.querySelector('.wishlist-name').textContent = wishlist.name;
  node.querySelector('.wishlist-summary').textContent = wishlist.summary;

  const preBadge = node.querySelector('.preapproval-badge');
  preBadge.hidden = !wishlist.preApproved;

  const statusBadge = node.querySelector('.wishlist-status');
  statusBadge.textContent = wishlist.active
    ? `Matched ${wishlist.matchedProfiles} Property Profiles`
    : 'Archived wishlist';

  const details = node.querySelector('.wishlist-details');
  details.innerHTML = `
    <div>
      <dt>Budget</dt>
      <dd>${formatCurrency(wishlist.budget.min)} - ${formatCurrency(wishlist.budget.max)}</dd>
    </div>
    <div>
      <dt>Property type</dt>
      <dd>${wishlist.details.type}</dd>
    </div>
    <div>
      <dt>Beds / Baths</dt>
      <dd>${wishlist.details.beds} / ${wishlist.details.baths}</dd>
    </div>
    <div>
      <dt>Timeline</dt>
      <dd>${wishlist.timeline}</dd>
    </div>
    <div>
      <dt>Match range</dt>
      <dd>${wishlist.matchRange}</dd>
    </div>
    <div>
      <dt>Top score</dt>
      <dd>${wishlist.topScore}%</dd>
    </div>
  `;

  const areaList = node.querySelector('.wishlist-areas');
  areaList.innerHTML = `
    <h4>Areas</h4>
    <ul class="area-list">
      ${wishlist.locations
        .map((area) => `<li><span class="area-type">${area.type}</span> ${area.label} · Priority ${area.priority}</li>`)
        .join('')}
    </ul>
  `;

  const mustGroup = node.querySelector('.wishlist-must');
  mustGroup.innerHTML = '<strong>Must-have features</strong>';
  wishlist.features.must.forEach((feature) => {
    const pill = document.createElement('span');
    pill.className = 'pill must-have';
    pill.textContent = feature;
    mustGroup.append(pill);
  });

  const niceGroup = node.querySelector('.wishlist-nice');
  niceGroup.innerHTML = '<strong>Nice-to-have features</strong>';
  wishlist.features.nice.forEach((feature) => {
    const pill = document.createElement('span');
    pill.className = 'pill nice-to-have';
    pill.textContent = feature;
    niceGroup.append(pill);
  });

  node.querySelector('.view-wishlist').addEventListener('click', () => openWishlistModal(wishlist));
  node.querySelector('.edit-wishlist').addEventListener('click', () => openWishlistForm('Edit Buyer Wishlist', wishlist));
  node.querySelector('.duplicate-wishlist').addEventListener('click', () => duplicateWishlist(buyer.id, wishlist.id));
  node.querySelector('.archive-wishlist').addEventListener('click', () => archiveWishlist(buyer.id, wishlist.id));

  return node;
}

function renderBuyerInsights(buyer) {
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="section-header">
      <h2>Wishlist insights</h2>
      <p class="section-description">Compare Supply vs Me analytics, gap hints, and demand trends for each Buyer Wishlist.</p>
    </div>
  `;

  if (!buyer.wishlists.length) {
    section.append(createEmptyState('Create a wishlist to unlock Supply vs Me analytics.'));
    return section;
  }

  const grid = document.createElement('div');
  grid.className = 'analytics-grid';
  buyer.wishlists.forEach((wishlist) => {
    const card = document.createElement('article');
    card.className = 'analytics-card';
    card.innerHTML = `
      <h3>${wishlist.name}</h3>
      <p><strong>Supply vs Me:</strong> ${wishlist.analytics.supplyCount} Property Profiles · ${wishlist.matchRange}</p>
      <p>${wishlist.analytics.gap}</p>
      <p>${wishlist.analytics.trend}</p>
    `;
    grid.append(card);
  });

  section.append(grid);
  return section;
}

function renderBuyerMessaging(buyer) {
  const messagingSection = document.createElement('section');
  messagingSection.className = 'section';
  messagingSection.innerHTML = `
    <div class="section-header">
      <h2>Messages</h2>
      <p class="section-description">Threads appear when a paid seller or agent contacts you. Replies stay anonymised unless you choose to disclose.</p>
    </div>
  `;

  if (!buyer.messages.length) {
    messagingSection.append(createEmptyState('No conversations yet — your wishlists are visible to sellers analysing demand.'));
    return messagingSection;
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid-2';
  buyer.messages.forEach((thread) => {
    const card = document.createElement('article');
    card.className = 'card';
    const linkedWishlist = buyer.wishlists.find((w) => w.id === thread.wishlistId)?.name ?? 'Wishlist removed';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${thread.counterparty}</h3>
          <p class="section-description">Linked to wishlist: ${linkedWishlist}</p>
        </div>
        <span class="badge">${thread.status}</span>
      </div>
      <div class="card-body">
        <p>${thread.preview}</p>
      </div>
      <footer class="card-footer">
        <button class="ghost-button" data-thread="${thread.id}" data-action="open">Open anonymised chat</button>
        <button class="ghost-button" data-thread="${thread.id}" data-action="mute">${thread.status === 'Muted' ? 'Unmute thread' : 'Mute thread'}</button>
        <button class="ghost-button" data-thread="${thread.id}" data-action="disclose">${thread.disclosureRequested ? 'Review disclosure request' : 'Reveal identity'}</button>
      </footer>
    `;
    grid.append(card);
  });

  messagingSection.append(grid);

  messagingSection.querySelectorAll('button[data-thread]').forEach((button) => {
    const threadId = button.dataset.thread;
    button.addEventListener('click', () => {
      const thread = buyer.messages.find((item) => item.id === threadId);
      if (!thread) return;
      switch (button.dataset.action) {
        case 'open':
          openChat(threadId, thread.counterparty);
          break;
        case 'mute':
          toggleThreadMute(thread);
          renderApp();
          break;
        case 'disclose':
          openDisclosurePrompt(thread);
          break;
        default:
          break;
      }
    });
  });

  return messagingSection;
}

function renderBuyerNotifications(buyer) {
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="section-header">
      <h2>Notifications</h2>
      <p class="section-description">Stay informed about new matches, inbound outreach, and area trend shifts.</p>
    </div>
  `;

  if (!buyer.notifications?.length) {
    section.append(createEmptyState('Notifications will appear here once new matches or trends trigger alerts.'));
    return section;
  }

  const list = document.createElement('ul');
  list.className = 'notification-list';
  buyer.notifications.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.type.toUpperCase()}</strong> · ${item.message}`;
    list.append(li);
  });

  section.append(list);
  return section;
}

function renderSellerExperience() {
  const container = document.createElement('div');
  container.className = 'property-profile';

  const home = (propertyProfiles || [])[0];

  if (!home) {
    const emptySection = createSection({
      title: 'Property profile (v2)',
      description: 'Add your property to unlock buyer demand analytics and match-based messaging.',
    });
    const emptyBody = document.createElement('div');
    emptyBody.className = 'card-body';
    emptyBody.append(createEmptyState('No property profile yet — add address, specs, and key features to surface matching buyers.'));
    emptySection.append(emptyBody);
    container.append(emptySection);
    return container;
  }

  container.append(
    renderPropertyHero(home),
    renderDemandSnapshotSection(home),
    renderWishlistFitSection(home),
    renderBuyerMatchesSection(home),
    renderFeatureFitSection(home),
    renderPricePositioningSection(home),
    renderDemandMapSection(home),
    renderSellerActionPanel(home),
  );

  return container;
}

function renderPropertyHero(home) {
  const section = document.createElement('section');
  section.className = 'section property-hero';

  const details = document.createElement('div');
  details.className = 'property-hero__details';

  const header = document.createElement('header');
  header.className = 'property-hero__header';
  const headerText = document.createElement('div');
  headerText.innerHTML = `
    <p class="eyebrow">Property profile · seller view</p>
    <h2>${home.nickname || 'Property profile'}</h2>
    <p class="section-description">${home.address || home.location || 'Location withheld for privacy'}</p>
  `;
  const statusBadge = document.createElement('span');
  statusBadge.className = `status-badge ${formatStatusClass(home.status)}`;
  statusBadge.textContent = home.status || 'Status unavailable';
  header.append(headerText, statusBadge);
  details.append(header);

  const topline = document.createElement('div');
  topline.className = 'property-hero__topline';
  topline.append(
    renderHeroMetric('Asking price', formatCurrency(home.askingPrice)),
    renderHeroMetric('Top match', formatPercent(home?.demandSnapshot?.topMatch ?? home.matchScore, 0)),
    renderHeroMetric('Matching buyers', `${home?.demandSnapshot?.matchCount ?? home.matchedBuyers ?? 0}`),
  );
  details.append(topline);

  if (home.summary) {
    const summary = document.createElement('p');
    summary.className = 'property-hero__summary';
    summary.textContent = home.summary;
    details.append(summary);
  }

  const specsList = document.createElement('dl');
  specsList.className = 'hero-specs';
  const specs = [
    { label: 'Type', value: home.specs?.type || home.type || '—' },
    { label: 'Beds', value: Number.isFinite(home.specs?.beds) ? `${home.specs.beds} bd` : '—' },
    { label: 'Baths', value: Number.isFinite(home.specs?.baths) ? `${home.specs.baths} ba` : '—' },
    { label: 'Size', value: home.specs?.size || '—' },
    { label: 'Parking', value: home.specs?.parking || '—' },
    { label: 'Built', value: home.specs?.built || '—' },
  ];
  specs.forEach(({ label, value }) => {
    const block = document.createElement('div');
    block.innerHTML = `<dt>${label}</dt><dd>${value}</dd>`;
    specsList.append(block);
  });
  details.append(specsList);

  const actions = document.createElement('div');
  actions.className = 'property-hero__actions';
  const editButton = document.createElement('button');
  editButton.className = 'ghost-button';
  editButton.type = 'button';
  editButton.textContent = 'Edit listing';
  const shareButton = document.createElement('button');
  shareButton.className = 'ghost-button';
  shareButton.type = 'button';
  shareButton.textContent = 'Share to agent';
  const messageButton = document.createElement('button');
  messageButton.className = 'primary-button';
  messageButton.type = 'button';
  messageButton.textContent = canMessage() ? 'Message matched buyers' : 'Upgrade to contact matched buyers';
  actions.append(editButton, shareButton, messageButton);
  details.append(actions);

  editButton.addEventListener('click', () => openEditListingModal(home));
  shareButton.addEventListener('click', () => openShareModal(home));
  messageButton.addEventListener('click', () => {
    if (!canMessage()) {
      openUpgradePrompt();
      return;
    }
    openChat(`property-${home.id}`, 'Matched buyers');
  });

  const media = document.createElement('figure');
  media.className = 'property-hero__media';
  const img = document.createElement('img');
  img.src = home.heroImage || 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80';
  img.alt = `${home.nickname || 'Property'} primary photo`;
  img.loading = 'lazy';
  media.append(img);

  section.append(details, media);
  return section;
}

function formatStatusClass(status) {
  if (!status) return 'status-badge--unknown';
  const normalised = status.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `status-badge--${normalised || 'unknown'}`;
}

function renderHeroMetric(label, value) {
  const metric = document.createElement('div');
  metric.className = 'hero-metric';
  metric.innerHTML = `
    <h3>${value ?? '—'}</h3>
    <p class="section-description">${label}</p>
  `;
  return metric;
}

function renderDemandSnapshotSection(home) {
  const section = document.createElement('section');
  section.className = 'section demand-snapshot';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Demand snapshot</h2>
        <p class="section-description">Server-rendered KPIs refreshed when matches update.</p>
      </div>
    </div>
  `;

  const ribbon = document.createElement('div');
  ribbon.className = 'upgrade-ribbon';
  ribbon.innerHTML = `
    <span>Unlock buyer profiles & secure chat</span>
    <button class="primary-button" type="button">Upgrade</button>
  `;
  ribbon.querySelector('button').addEventListener('click', () => openUpgradePrompt());
  section.querySelector('.section-header')?.append(ribbon);

  const snapshot = home.demandSnapshot || {};
  const grid = document.createElement('div');
  grid.className = 'kpi-grid';
  grid.append(
    renderKpiTile('Matching buyers', snapshot.matchCount ?? home.matchedBuyers ?? 0),
    renderKpiTile('Top match', formatPercent(snapshot.topMatch ?? home.matchScore, 0)),
    renderKpiTile('Pre-approved buyers', snapshot.preapprovedCount ?? 0),
    renderKpiTile('New in last 7 days', snapshot.newSince ?? 0, { subtext: 'Auto-refreshes nightly' }),
  );
  section.append(grid, createInfoBanner('Snapshot updates within 10 seconds of saving listing changes.'));
  return section;
}

function renderKpiTile(label, value, { subtext } = {}) {
  const card = document.createElement('article');
  card.className = 'kpi-card';
  card.innerHTML = `
    <h3>${value ?? '—'}</h3>
    <p>${label}</p>
    ${subtext ? `<span class="kpi-subtext">${subtext}</span>` : ''}
  `;
  return card;
}

function renderWishlistFitSection(home) {
  const section = document.createElement('section');
  section.className = 'section wishlist-fit';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Wishlist fit</h2>
        <p class="section-description">Breakdown of how this property scores across weighted buyer requirements.</p>
      </div>
    </div>
  `;

  const fit = home.wishlistFit || {};
  const grid = document.createElement('div');
  grid.className = 'wishlist-fit__grid';
  grid.append(
    createFitBar('Location fit (highest weight)', fit.location),
    createFitBar('Price fit (gate)', fit.price, 'If the listing price exceeds a buyer’s max budget the match score is 0.'),
    createFitBar('Must-haves covered', fit.mustHave, `${formatPercent(fit.mustHave, 0)} of required features met.`),
    createFitBar('Nice-to-haves covered', fit.niceToHave, `${formatPercent(fit.niceToHave, 0)} of optional features hit.`),
  );
  section.append(grid, createInfoBanner('Match score = (Location × %location) + (Feature × %feature) + (Lifestyle × %amenity). Price is a gate.', 'muted'));
  return section;
}

function createFitBar(label, value, description) {
  const bar = document.createElement('div');
  bar.className = 'fit-bar';
  const numeric = Number(value);
  const ratio = Number.isFinite(numeric) ? (numeric > 1 ? numeric / 100 : numeric) : 0;
  const pct = Math.max(0, Math.min(1, ratio));
  bar.innerHTML = `
    <div class="fit-bar__header">
      <span>${label}</span>
      <strong>${formatPercent(pct, 0)}</strong>
    </div>
    <div class="fit-bar__meter"><span style="width:${(pct * 100).toFixed(1)}%"></span></div>
    ${description ? `<p class="section-description">${description}</p>` : ''}
  `;
  return bar;
}

function renderBuyerMatchesSection(home) {
  const section = document.createElement('section');
  section.className = 'section buyer-matches';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Buyer matches</h2>
        <p class="section-description">Sorted by match score. Open a row to see why the match scored that way.</p>
      </div>
    </div>
  `;

  if (!canSeeSnippets()) {
    section.append(createInfoBanner('Buyer identities and messaging unlock with Seller · Pro. Aggregated insights remain visible.', 'warning'));
  }

  const matches = Array.isArray(home.buyerMatches) ? home.buyerMatches : [];
  if (!matches.length) {
    section.append(createEmptyState('We’re tracking buyers in your area. Matches will appear as new wishlists align to this property.'));
    return section;
  }

  const table = document.createElement('table');
  table.className = 'matches-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Buyer</th>
        <th scope="col">Match %</th>
        <th scope="col">Mortgage</th>
        <th scope="col">Budget vs price</th>
        <th scope="col">Timeline</th>
        <th scope="col">Location overlap</th>
        <th scope="col">Must-haves</th>
        <th scope="col" class="align-right">Action</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement('tbody');
  matches.forEach((match) => {
    const alias = canSeeSnippets() ? (match.alias || 'Buyer (anonymised)') : (match.maskedAlias || 'Buyer · upgrade required');
    const row = document.createElement('tr');
    row.className = 'match-row';
    const matchClass = match.matchPercent >= 85 ? 'chip--high' : match.matchPercent >= 70 ? 'chip--mid' : 'chip--low';
    row.innerHTML = `
      <td>
        <div class="match-alias">
          <span>${alias}</span>
          ${match.isNew ? '<span class="chip chip--new">New</span>' : ''}
        </div>
      </td>
      <td><span class="chip ${matchClass}">${formatPercent(match.matchPercent, 0)}</span></td>
      <td><span class="status-dot ${match.preApproved ? 'status-dot--success' : 'status-dot--pending'}">${match.preApproved ? 'Pre-approved' : 'Not yet'}</span></td>
      <td>${describeBudgetAlignment(match, home.askingPrice)}</td>
      <td>${match.timeline || '—'}</td>
      <td>${match.locationTag || home.location || '—'}</td>
      <td>${summarizeMustHaveStatus(match)}</td>
      <td class="align-right"><button class="ghost-button match-cta" type="button">${canMessage() ? 'Message' : 'Unlock messaging'}</button></td>
    `;

    const detailRow = document.createElement('tr');
    detailRow.className = 'match-detail';
    detailRow.hidden = true;

    let detailContent = '';
    if (canSeeSnippets()) {
      const met = Array.isArray(match.mustHaveStatus?.met) && match.mustHaveStatus.met.length
        ? `<ul>${match.mustHaveStatus.met.map((item) => `<li>${item}</li>`).join('')}</ul>`
        : '<p class="section-description">No specific must-haves logged.</p>';
      const gaps = Array.isArray(match.mustHaveStatus?.missing) && match.mustHaveStatus.missing.length
        ? `<ul>${match.mustHaveStatus.missing.map((item) => `<li>${item}</li>`).join('')}</ul>`
        : '<p class="section-description">No conflicts.</p>';
      detailContent = `
        <div class="match-breakdown">
          <div>
            <h4>Why it fits</h4>
            <p>${match.summary || 'Score breakdown is recalculating.'}</p>
            <div class="match-features">
              <div>
                <h5>Must-haves met</h5>
                ${met}
              </div>
              <div>
                <h5>Gaps</h5>
                ${gaps}
              </div>
            </div>
          </div>
          <div>
            <h4>Score drivers</h4>
            ${renderContributionList(match.contributions)}
          </div>
        </div>
      `;
    } else {
      detailContent = '<div class="locked-message">Upgrade to Seller · Pro to view factor-level breakdowns and buyer context.</div>';
    }

    detailRow.innerHTML = `<td colspan="8">${detailContent}</td>`;

    const ctaButton = row.querySelector('.match-cta');
    ctaButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!canMessage()) {
        openUpgradePrompt();
      } else {
        openChat(`property-${home.id}-${match.id}`, alias);
      }
    });

    row.addEventListener('click', () => {
      const willOpen = detailRow.hidden;
      detailRow.hidden = !willOpen;
      row.classList.toggle('is-open', willOpen);
    });

    tbody.append(row, detailRow);
  });
  table.append(tbody);
  section.append(table);
  return section;
}

function renderFeatureFitSection(home) {
  const section = document.createElement('section');
  section.className = 'section feature-fit';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Feature-fit matrix</h2>
        <p class="section-description">Aggregated from matched buyer must-haves to surface upgrade guidance.</p>
      </div>
    </div>
  `;

  const features = Array.isArray(home.featureFitMatrix) ? home.featureFitMatrix : [];
  const matrix = document.createElement('div');
  matrix.className = 'feature-matrix';

  if (!features.length) {
    matrix.append(createEmptyState('Matrix will populate once enough buyer matches share must-have data.'));
  } else {
    features.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'feature-card';
      if (!item.propertyHas) {
        card.classList.add('feature-card--gap');
      }
      card.innerHTML = `
        <header>
          <h3>${item.feature}</h3>
          <span class="chip ${item.propertyHas ? 'chip--high' : 'chip--warning'}">${formatPercent(item.requiredPercent ?? 0, 0)} require</span>
        </header>
        <p class="section-description">${item.insight || 'Insight pending recalculation.'}</p>
        <p class="feature-card__status">${item.propertyHas ? 'This listing: ✓' : 'This listing: ✗'}</p>
      `;
      matrix.append(card);
    });
  }

  section.append(matrix);
  return section;
}

function renderPricePositioningSection(home) {
  const section = document.createElement('section');
  section.className = 'section price-position';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Price positioning vs buyer budgets</h2>
        <p class="section-description">Distribution of matched buyers by maximum budget with asking price overlay.</p>
      </div>
    </div>
  `;

  const buckets = Array.isArray(home.priceBuckets) ? home.priceBuckets : [];
  const histogram = document.createElement('div');
  histogram.className = 'price-histogram';

  if (!buckets.length) {
    const empty = createEmptyState('Budget histogram appears once buyers match this property.');
    empty.classList.add('histogram-empty');
    histogram.append(empty);
  } else {
    const maxCount = Math.max(...buckets.map((b) => b.count || 0), 1);
    buckets.forEach((bucket) => {
      const bar = document.createElement('div');
      bar.className = 'price-bar';
      const height = Math.max(4, Math.round(((bucket.count || 0) / maxCount) * 100));
      bar.innerHTML = `
        <div class="price-bar__value" style="height:${height}%"></div>
        <span class="price-bar__count">${bucket.count ?? 0}</span>
        <span class="price-bar__label">${bucket.label}</span>
      `;
      histogram.append(bar);
    });

    const budgets = buckets
      .map((bucket) => bucket.maxBudget)
      .filter((value) => Number.isFinite(value));
    const minBudget = budgets.length ? Math.min(...budgets, home.askingPrice || 0) : home.askingPrice || 0;
    const maxBudget = budgets.length ? Math.max(...budgets, home.askingPrice || 0) : home.askingPrice || 0;
    const ratio = maxBudget === minBudget ? 0.5 : ((home.askingPrice || minBudget) - minBudget) / (maxBudget - minBudget);
    const marker = document.createElement('div');
    marker.className = 'price-histogram__marker';
    marker.style.left = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    marker.innerHTML = `<span>${formatCurrency(home.askingPrice)} asking</span>`;
    histogram.append(marker);
  }

  section.append(histogram);

  const sim = home.simulation || {};
  const whatIf = document.createElement('div');
  whatIf.className = 'what-if-panel';
  const heading = document.createElement('h3');
  heading.textContent = 'What-if simulation';
  whatIf.append(heading);

  const priceRange = sim.priceRange || {};
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = `${priceRange.min ?? Math.round((home.askingPrice || 0) * 0.9)}`;
  slider.max = `${priceRange.max ?? Math.round((home.askingPrice || 0) * 1.1)}`;
  slider.step = `${priceRange.step ?? 1000}`;
  slider.value = `${home.askingPrice || slider.min}`;

  const sliderLabel = document.createElement('label');
  sliderLabel.className = 'what-if-panel__label';
  sliderLabel.textContent = 'Adjust asking price (±10%)';
  const sliderRow = document.createElement('div');
  sliderRow.className = 'what-if-panel__slider';
  sliderRow.append(slider);
  const priceReadout = document.createElement('span');
  priceReadout.className = 'what-if-panel__value';
  priceReadout.textContent = formatCurrency(Number(slider.value));
  sliderRow.append(priceReadout);
  sliderLabel.append(sliderRow);
  whatIf.append(sliderLabel);

  const togglesWrapper = document.createElement('div');
  togglesWrapper.className = 'toggle-grid';
  if (Array.isArray(sim.featureToggles) && sim.featureToggles.length) {
    const toggleHeading = document.createElement('p');
    toggleHeading.className = 'section-description';
    toggleHeading.textContent = 'Toggle hypothetical feature upgrades to preview demand shifts.';
    whatIf.append(toggleHeading);
    sim.featureToggles.forEach((toggle) => {
      const label = document.createElement('label');
      label.className = 'toggle-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = toggle.id;
      label.append(checkbox);
      const copy = document.createElement('div');
      copy.innerHTML = `<strong>${toggle.label}</strong><p class="section-description">${toggle.description || ''}</p>`;
      label.append(copy);
      togglesWrapper.append(label);
    });
    whatIf.append(togglesWrapper);
  }

  const projection = document.createElement('div');
  projection.className = 'projection-metrics';
  projection.innerHTML = `
    <div>
      <span class="label">Projected matching buyers</span>
      <strong data-field="matches">${sim.baseMatchCount ?? home?.demandSnapshot?.matchCount ?? 0}</strong>
    </div>
    <div>
      <span class="label">Projected top match %</span>
      <strong data-field="top-match">${formatPercent(sim.baseTopMatch ?? home?.demandSnapshot?.topMatch ?? home.matchScore, 0)}</strong>
    </div>
  `;
  whatIf.append(projection);

  const updateProjection = () => {
    const selectedToggles = [];
    if (Array.isArray(sim.featureToggles)) {
      sim.featureToggles.forEach((toggle) => {
        const checkbox = togglesWrapper.querySelector(`input[value="${toggle.id}"]`);
        if (checkbox?.checked) {
          selectedToggles.push(toggle);
        }
      });
    }
    const price = Number(slider.value);
    priceReadout.textContent = formatCurrency(price);
    const { projectedMatches, projectedTopMatch } = projectSimulationOutcome(home, price, selectedToggles);
    projection.querySelector('[data-field="matches"]').textContent = projectedMatches.toString();
    projection.querySelector('[data-field="top-match"]').textContent = formatPercent(projectedTopMatch, 0);
  };

  if (!canSeeSnippets()) {
    slider.disabled = true;
    togglesWrapper.querySelectorAll('input').forEach((input) => { input.disabled = true; });
    whatIf.append(createInfoBanner('Upgrade to Seller · Pro to run price simulations and feature toggles.', 'warning'));
  } else {
    slider.addEventListener('input', updateProjection);
    togglesWrapper.addEventListener('change', updateProjection);
    updateProjection();
  }

  section.append(whatIf);
  return section;
}

function projectSimulationOutcome(home, price, selectedToggles = []) {
  const sim = home.simulation || {};
  const baseMatches = sim.baseMatchCount ?? home?.demandSnapshot?.matchCount ?? 0;
  const baseTopMatch = sim.baseTopMatch ?? home?.demandSnapshot?.topMatch ?? home.matchScore ?? 0;
  const basePrice = home.askingPrice || price;
  const elasticity = sim.priceElasticity ?? 0.8;
  const topSensitivity = sim.topMatchSensitivity ?? 10;
  const priceDelta = basePrice ? (price - basePrice) / basePrice : 0;

  let projectedMatches = baseMatches * (1 - elasticity * priceDelta);
  let projectedTopMatch = baseTopMatch - priceDelta * topSensitivity;

  selectedToggles.forEach((toggle) => {
    const impact = toggle?.impact || {};
    if (Number.isFinite(impact.matches)) {
      projectedMatches += impact.matches;
    }
    if (Number.isFinite(impact.topMatch)) {
      projectedTopMatch += impact.topMatch;
    }
  });

  return {
    projectedMatches: Math.max(0, Math.round(projectedMatches)),
    projectedTopMatch: Math.max(0, Math.min(100, Math.round(projectedTopMatch))),
  };
}

function renderDemandMapSection(home) {
  if (canSeeSnippets()) {
    const hotspots = Array.isArray(sellerHotspots)
      ? sellerHotspots.map((region) => ({ ...region, count: region.buyers ?? region.count ?? 0 }))
      : [];
    return renderMapCard({
      title: 'Who’s looking here',
      description: 'Heatmap of wishlist locations covering this property. Counts remain anonymised.',
      regions: hotspots,
      formatter: (region) => `${region.count || 0} buyers searching here`,
      emptyCopy: 'Demand map loads once buyer wishlists include this area.',
    });
  }

  const section = document.createElement('section');
  section.className = 'section map-locked';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Who’s looking here</h2>
        <p class="section-description">Upgrade to Seller · Pro to see anonymised geo heatmaps of buyer wishlists.</p>
      </div>
      <button class="primary-button" type="button">Upgrade</button>
    </div>
  `;
  section.querySelector('button')?.addEventListener('click', () => openUpgradePrompt());

  const total = (sellerHotspots || []).reduce((sum, region) => sum + (region.buyers || region.count || 0), 0);
  const preview = document.createElement('div');
  preview.className = 'map-locked__preview';
  preview.innerHTML = `
    <div class="map-locked__blur"></div>
    <div class="map-locked__overlay">
      <strong>${total} buyers</strong>
      <span>tracking this broader area</span>
      <p>Upgrade to view heatmap granularity without revealing identities.</p>
    </div>
  `;

  const list = document.createElement('ul');
  list.className = 'map-locked__list';
  (sellerHotspots || []).slice(0, 3).forEach((region) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${region.label}</strong><span>${region.buyers || region.count || 0} buyers</span>`;
    list.append(item);
  });

  section.append(preview, list);
  return section;
}

function renderSellerActionPanel(home) {
  const section = document.createElement('section');
  section.className = 'section action-panel';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Action panel</h2>
        <p class="section-description">Keep momentum with demand-driven next steps.</p>
      </div>
    </div>
  `;

  const actions = [
    {
      label: 'Edit listing',
      description: 'Update specs, media, or disclosures to refresh the match engine.',
      locked: false,
      handler: () => openEditListingModal(home),
    },
    {
      label: 'Invite / link agent',
      description: 'Share a read-only demand snapshot with your agent or advisor.',
      locked: false,
      handler: () => openShareModal(home, { mode: 'agent' }),
    },
    {
      label: 'Message matched buyers',
      description: 'Start anonymised chats inside the platform (no PII exchange).',
      locked: !canMessage(),
      handler: () => {
        if (!canMessage()) {
          openUpgradePrompt();
        } else {
          openChat(`property-${home.id}`, 'Matched buyers');
        }
      },
    },
    {
      label: 'Share demand snapshot (Pro)',
      description: 'Generate a shareable view with masked buyer data.',
      locked: !canSeeSnippets(),
      handler: () => {
        if (!canSeeSnippets()) {
          openUpgradePrompt();
        } else {
          openShareModal(home, { mode: 'snapshot' });
        }
      },
    },
  ];

  const list = document.createElement('ul');
  list.className = 'action-list';
  actions.forEach((action) => {
    const item = document.createElement('li');
    if (action.locked) item.classList.add('is-locked');
    item.innerHTML = `
      <div>
        <strong>${action.label}</strong>
        <p class="section-description">${action.description}</p>
      </div>
      <button class="${action.locked ? 'ghost-button' : 'primary-button'}" type="button">${action.locked ? 'Upgrade to unlock' : 'Open'}</button>
    `;
    const button = item.querySelector('button');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      action.handler();
    });
    list.append(item);
  });

  section.append(list);
  return section;
}

function renderPropertyCard(profile) {
  // Try template first
  const tpl = document.getElementById('property-card-template');
  const summary = getPropertyMatchSummary(profile);
  const pct = Math.round(summary.topScore || 0);

  const applyIntoNode = (node) => {
    // Title line
    const nameEl = node.querySelector('.property-name') || node.querySelector('.prop-card__type');
    const locEl = node.querySelector('.property-location');
    const bandEl = node.querySelector('.property-band') || node.querySelector('.js-score');
    const buyersEl = node.querySelector('.property-buyers') || node.querySelector('.js-buyers');

    if (nameEl) nameEl.textContent = profile?.nickname || `${profile?.type || 'Home'} • ${profile?.beds ?? '—'} bd / ${profile?.baths ?? '—'} ba`;
    if (locEl) locEl.textContent = profile?.location || 'Approx. area set';
    if (bandEl) bandEl.textContent = pct ? `${pct}%` : '—';
    if (buyersEl) buyersEl.textContent = (summary.matches ?? 0).toString();

    // Optional meta
    const meta = node.querySelector('.property-summary') || node.querySelector('.prop-card__snippet');
    if (meta) meta.textContent = canSeeSnippets() ? summary.snippet : 'We found matching buyers. Upgrade to view anonymized wishlist snippets.';

    const gapsUl = node.querySelector('.property-gaps') || node.querySelector('.prop-card__gaps');
    if (gapsUl) {
      gapsUl.innerHTML = '';
      (summary.gaps || []).forEach(g => {
        const li = document.createElement('li'); li.textContent = g; gapsUl.appendChild(li);
      });
      gapsUl.hidden = !canSeeSnippets() ? false : (summary.gaps?.length ?? 0) === 0;
    }

    // Actions and gating
    const insightsBtn = node.querySelector('.view-insights') || node.querySelector('.js-insights');
    const messageBtn = node.querySelector('.contact-buyers') || node.querySelector('.js-message');
    const upgradeBtn = node.querySelector('.js-upgrade');

    insightsBtn?.addEventListener('click', () => openPropertyInsights(profile));

    if (messageBtn) {
      if (!canMessage()) {
        messageBtn.disabled = true;
        messageBtn.title = 'Upgrade to contact buyers';
        messageBtn.addEventListener('click', () => openUpgradePrompt());
        if (upgradeBtn) upgradeBtn.hidden = false;
      } else {
        messageBtn.disabled = false;
        messageBtn.textContent = 'Message matched buyers';
        messageBtn.addEventListener('click', () => openChat(`property-${profile?.id || 'unknown'}`, 'Matched buyers'));
      }
    }
    return node;
  };

  if (tpl?.content?.firstElementChild) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    return applyIntoNode(node);
  }

  // Fallback: build card programmatically (works even if template missing)
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-header">
      <div>
        <h3 class="property-name">${profile?.nickname || (profile?.type || 'Home')}</h3>
        <p class="section-description property-location">${profile?.location || 'Approx. area set'}</p>
      </div>
      <span class="badge property-band">${pct ? pct + '%' : '—'}</span>
    </div>
    <div class="card-body">
      <p class="property-summary">${canSeeSnippets() ? summary.snippet : 'We found matching buyers. Upgrade to view anonymized wishlist snippets.'}</p>
      <dl class="property-metrics">
        <div><dt>Matching buyers</dt><dd class="property-buyers">${summary.matches}</dd></div>
        <div><dt>Match score</dt><dd>${pct}%</dd></div>
      </dl>
      <ul class="property-gaps"></ul>
    </div>
    <footer class="card-footer">
      <button class="ghost-button view-insights">View insights</button>
      <button class="primary-button contact-buyers">${canMessage() ? 'Message matched buyers' : 'Upgrade to contact buyers'}</button>
    </footer>
  `;
  const gapsUl = card.querySelector('.property-gaps');
  (summary.gaps || []).forEach(g => { const li = document.createElement('li'); li.textContent = g; gapsUl.appendChild(li); });

  const msgBtn = card.querySelector('.contact-buyers');
  if (!canMessage()) {
    msgBtn.addEventListener('click', () => openUpgradePrompt());
    msgBtn.disabled = false; // keep clickable to show upgrade
    msgBtn.title = 'Upgrade to contact buyers';
  } else {
    msgBtn.addEventListener('click', () => openChat(`property-${profile?.id || 'unknown'}`, 'Matched buyers'));
  }
  card.querySelector('.view-insights').addEventListener('click', () => openPropertyInsights(profile));
  return card;
}

function renderAgentExperience() {
  const section = createSection({
    title: 'Agent Pro analytics',
    description: 'Analyze buyer wishlists and compare private seller property profiles. No property advertising occurs here.',
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
        <th>Buyer Wishlist</th>
        <th>Target Area</th>
        <th>Match Score</th>
        <th>Aligned Property Profiles</th>
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
              <td>${match.properties.join(', ')}</td>
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
    description: 'Prioritise buyers who request outreach or need financing support.',
  });

  const leadGrid = document.createElement('div');
  leadGrid.className = 'grid grid-2';

  mortgageLeads.forEach((lead) => {
    const template = document.getElementById('lead-card-template');
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector('.lead-name').textContent = lead.buyerAlias;
    node.querySelector('.lead-status').textContent = lead.status;
    node.querySelector('.lead-location').textContent = lead.location;
    node.querySelector('.lead-budget').textContent = `${formatCurrency(lead.budget.min)} - ${formatCurrency(lead.budget.max)}`;
    node.querySelector('.lead-timeline').textContent = lead.timeline;
    node.querySelector('.lead-notes').textContent = lead.notes;
    node.querySelector('.start-chat').addEventListener('click', () => openChat(lead.threadId, lead.buyerAlias));

    leadGrid.append(node);
  });

  section.append(leadGrid);
  return section;
}

function openWishlistModal(wishlist) {
  modalTitle.textContent = `${wishlist.name} · Match insights`;
  const formattedLocations = wishlist.locations
    .map((location) => `${location.label} (${location.type}) · Priority ${location.priority}`)
    .join('<br />');

  modalContent.innerHTML = `
    <div class="form-grid">
      <div>
        <h3>Location focus</h3>
        <p>${formattedLocations}</p>
      </div>
      <div>
        <h3>Feature priorities</h3>
        <ul>
          ${wishlist.features.must.map((f) => `<li><strong>Must:</strong> ${f}</li>`).join('')}
          ${wishlist.features.nice.map((f) => `<li><strong>Nice:</strong> ${f}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h3>Supply vs Me</h3>
        <p>Matched Property Profiles: ${wishlist.matchedProfiles}</p>
        <p>Top match score: ${wishlist.topScore}%</p>
        <p>${wishlist.analytics.gap}</p>
        <p>${wishlist.analytics.trend}</p>
      </div>
    </div>
  `;
  modal.showModal();
}

function openWishlistForm(title, wishlist) {
  modalTitle.textContent = title;
  const baseData = wishlist ? safeStructuredClone(wishlist) : {
    id: generateId('wishlist'),
    name: '',
    summary: '',
    matchRange: '—',
    matchedProfiles: 0,
    topScore: 0,
    budget: { min: 0, max: 0 },
    timeline: '0-3m',
    preApproved: false,
    details: { type: 'Detached house', beds: 3, baths: 2, sizeMin: null, sizeMax: null },
    locations: [],
    features: { must: [], nice: [] },
    analytics: { supplyCount: 0, gap: 'Analytics pending.', trend: '' },
    active: true,
  };

  const wizardState = {
    step: 0,
    data: baseData,
  };

  const steps = [
    {
      title: 'Areas',
      description: 'Add postal codes, polygons, or radius areas. Priority influences match scoring.',
      render: (container) => renderAreasStep(container, wizardState),
      validate: () => wizardState.data.locations.length > 0,
    },
    {
      title: 'Budget & timeline',
      description: 'Capture your price band, move-in window, and mortgage pre-approval status.',
      render: (container) => renderBudgetStep(container, wizardState),
      validate: (container) => {
        const form = container.querySelector('form');
        if (!form.reportValidity()) return false;
        const formData = new FormData(form);
        wizardState.data.budget.min = Number(formData.get('min'));
        wizardState.data.budget.max = Number(formData.get('max'));
        wizardState.data.timeline = formData.get('timeline');
        wizardState.data.preApproved = formData.get('preApproved') === 'on';
        wizardState.data.summary = formData.get('summary');
        return true;
      },
    },
    {
      title: 'Property details',
      description: 'Select property type, bedroom/bath counts, and optional size range.',
      render: (container) => renderDetailsStep(container, wizardState),
      validate: (container) => {
        const form = container.querySelector('form');
        if (!form.reportValidity()) return false;
        const formData = new FormData(form);
        wizardState.data.details.type = formData.get('type');
        wizardState.data.details.beds = Number(formData.get('beds'));
        wizardState.data.details.baths = Number(formData.get('baths'));
        wizardState.data.details.sizeMin = formData.get('sizeMin') ? Number(formData.get('sizeMin')) : null;
        wizardState.data.details.sizeMax = formData.get('sizeMax') ? Number(formData.get('sizeMax')) : null;
        return true;
      },
    },
    {
      title: 'Features',
      description: 'Split requirements into must-haves and nice-to-haves.',
      render: (container) => renderFeaturesStep(container, wizardState),
      validate: (container) => {
        const form = container.querySelector('form');
        const formData = new FormData(form);
        wizardState.data.features.must = formData
          .get('must')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        wizardState.data.features.nice = formData
          .get('nice')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        return true;
      },
    },
    {
      title: 'Review & save',
      description: 'Confirm your structured payload and review immediate match analytics.',
      render: (container) => renderReviewStep(container, wizardState),
      validate: () => true,
    },
  ];

  const renderWizard = () => {
    modalContent.innerHTML = '';

    const progress = document.createElement('ol');
    progress.className = 'wizard-progress';
    steps.forEach((step, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${step.title}`;
      if (index === wizardState.step) {
        li.className = 'active';
      } else if (index < wizardState.step) {
        li.className = 'complete';
      }
      progress.append(li);
    });

    const container = document.createElement('div');
    container.className = 'wizard-step';
    const currentStep = steps[wizardState.step];
    const header = document.createElement('header');
    header.innerHTML = `<h3>${currentStep.title}</h3><p class="section-description">${currentStep.description}</p>`;
    container.append(header);

    const body = document.createElement('div');
    currentStep.render(body);
    container.append(body);

    const actions = document.createElement('div');
    actions.className = 'form-actions wizard-actions';

    if (wizardState.step > 0) {
      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.className = 'ghost-button';
      backButton.textContent = 'Back';
      backButton.addEventListener('click', () => {
        wizardState.step -= 1;
        renderWizard();
      });
      actions.append(backButton);
    }

    const primaryButton = document.createElement('button');
    primaryButton.type = 'button';
    primaryButton.className = 'primary-button';
    primaryButton.textContent = wizardState.step === steps.length - 1 ? 'Save wishlist' : 'Next';
    primaryButton.addEventListener('click', () => {
      if (!steps[wizardState.step].validate(body)) {
        body.querySelector('form')?.reportValidity();
        return;
      }
      if (wizardState.step === steps.length - 1) {
        saveWishlist(wizardState.data, Boolean(wishlist));
        return;
      }
      wizardState.step += 1;
      renderWizard();
    });
    actions.append(primaryButton);

    modalContent.append(progress, container, actions);
  };

  const renderAreasStep = (container, state) => {
    container.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'area-list editable';

    const renderList = () => {
      list.innerHTML = '';
      state.data.locations.forEach((location, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="area-type">${location.type}</span> ${location.label} · Priority ${location.priority}`;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ghost-button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          state.data.locations.splice(index, 1);
          renderList();
        });
        li.append(remove);
        list.append(li);
      });
      if (!state.data.locations.length) {
        const empty = document.createElement('li');
        empty.textContent = 'No areas added yet.';
        list.append(empty);
      }
    };

    renderList();
    container.append(list);

    const form = document.createElement('form');
    form.className = 'form-grid';
    form.innerHTML = `
      <label>Area type
        <select name="type">
          <option value="polygon">Polygon</option>
          <option value="radius">Radius</option>
          <option value="pin">Pin</option>
          <option value="pc">Postal code</option>
        </select>
      </label>
      <label>Label / description
        <input name="label" required placeholder="e.g., Port Moody Centre" />
      </label>
      <label>Priority (1-5)
        <input name="priority" type="number" min="1" max="5" value="1" />
      </label>
      <button class="ghost-button" type="submit">Add area</button>
    `;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      state.data.locations.push({
        id: generateId('loc'),
        type: formData.get('type'),
        label: formData.get('label'),
        value: `${formData.get('type')}-${formData.get('label')}`,
        priority: Number(formData.get('priority')),
        count: 0,
      });
      form.reset();
      renderList();
    });

    container.append(form);
  };

  const renderBudgetStep = (container, state) => {
    const form = document.createElement('form');
    form.className = 'form-grid';
    form.innerHTML = `
      <label>Wishlist summary
        <input name="summary" placeholder="Short description" value="${state.data.summary ?? ''}" />
      </label>
      <label>Budget minimum
        <input name="min" type="number" min="0" value="${state.data.budget.min || ''}" required />
      </label>
      <label>Budget maximum
        <input name="max" type="number" min="0" value="${state.data.budget.max || ''}" required />
      </label>
      <label>Timeline
        <select name="timeline">
          ${['0-3m', '3-6m', '6-12m', '>12m']
            .map((option) => `<option value="${option}" ${state.data.timeline === option ? 'selected' : ''}>${option}</option>`)
            .join('')}
        </select>
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="preApproved" ${state.data.preApproved ? 'checked' : ''} /> Mortgage pre-approved
      </label>
    `;
    container.append(form);
  };

  const renderDetailsStep = (container, state) => {
    const form = document.createElement('form');
    form.className = 'form-grid';
    form.innerHTML = `
      <label>Property type
        <select name="type">
          ${['Detached house', 'Townhome', 'Condo', 'Duplex', 'Acreage']
            .map((option) => `<option value="${option}" ${state.data.details.type === option ? 'selected' : ''}>${option}</option>`)
            .join('')}
        </select>
      </label>
      <label>Bedrooms
        <input type="number" name="beds" min="0" value="${state.data.details.beds}" />
      </label>
      <label>Bathrooms
        <input type="number" name="baths" min="0" value="${state.data.details.baths}" />
      </label>
      <label>Min size (sqft)
        <input type="number" name="sizeMin" min="0" value="${state.data.details.sizeMin ?? ''}" />
      </label>
      <label>Max size (sqft)
        <input type="number" name="sizeMax" min="0" value="${state.data.details.sizeMax ?? ''}" />
      </label>
    `;
    container.append(form);
  };

  const renderFeaturesStep = (container, state) => {
    const form = document.createElement('form');
    form.className = 'form-grid';
    form.innerHTML = `
      <label>Must-have features (comma separated)
        <textarea name="must" placeholder="e.g., Backyard, Dedicated office">${state.data.features.must.join(', ')}</textarea>
      </label>
      <label>Nice-to-have features (comma separated)
        <textarea name="nice" placeholder="e.g., Trail access, EV-ready parking">${state.data.features.nice.join(', ')}</textarea>
      </label>
    `;
    container.append(form);
  };

  const renderReviewStep = (container, state) => {
    const summary = simulateMatchSummary(state.data);
    state.data.matchedProfiles = summary.matches;
    state.data.topScore = summary.topScore;
    state.data.matchRange = summary.matchRange;
    state.data.analytics = {
      supplyCount: summary.matches,
      gap: summary.gapHint,
      trend: summary.trend,
    };

    const payload = {
      locations: state.data.locations.map((location, index) => ({
        type: location.type,
        value: location.value,
        priority: location.priority ?? index + 1,
      })),
      budget: state.data.budget,
      timeline: state.data.timeline,
      preApproved: state.data.preApproved,
      details: {
        type: state.data.details.type.toLowerCase().includes('condo') ? 'condo' : 'house',
        beds: state.data.details.beds,
        baths: state.data.details.baths,
        sizeMin: state.data.details.sizeMin,
        sizeMax: state.data.details.sizeMax,
      },
      features: state.data.features,
      visibility: 'public',
    };

    container.innerHTML = `
      <div class="form-grid">
        <article class="analytics-card">
          <h3>Match summary</h3>
          <p>Matches: ${summary.matches} Property Profiles</p>
          <p>Top score: ${summary.topScore}%</p>
          <p>${summary.gapHint}</p>
          <p>${summary.trend}</p>
        </article>
        <article class="analytics-card">
          <h3>Normalised payload</h3>
          <pre class="payload-preview">${JSON.stringify(payload, null, 2)}</pre>
        </article>
      </div>
    `;
  };

  const saveWishlist = (data, isEditing) => {
    const buyer = buyers.find((b) => b.id === state.buyerId);
    const clone = safeStructuredClone(data);
    const existingIndex = buyer.wishlists.findIndex((w) => w.id === clone.id);
    if (existingIndex >= 0) {
      buyer.wishlists.splice(existingIndex, 1, clone);
    } else {
      buyer.wishlists.unshift(clone);
    }
    modal.close();
    renderApp();
  };

  renderWizard();
  modal.showModal();
}

function duplicateWishlist(buyerId, wishlistId) {
  const buyer = buyers.find((b) => b.id === buyerId);
  const wishlist = buyer.wishlists.find((w) => w.id === wishlistId);
  const clone = safeStructuredClone(wishlist);
  clone.id = generateId('wishlist');
  clone.name = `${clone.name} (Copy)`;
  clone.summary = `${clone.summary} (copy)`;
  clone.analytics.trend = 'Fresh copy — analytics recalculating soon.';
  clone.matchedProfiles = Math.max(0, Math.floor(clone.matchedProfiles * 0.6));
  clone.topScore = Math.max(40, Math.min(100, clone.topScore - 4));
  clone.matchRange = 'Recalculating';
  buyer.wishlists.unshift(clone);
  renderApp();
}

function archiveWishlist(buyerId, wishlistId) {
  const buyer = buyers.find((b) => b.id === buyerId);
  const wishlist = buyer.wishlists.find((w) => w.id === wishlistId);
  if (!wishlist) return;
  wishlist.active = !wishlist.active;
  if (!wishlist.active) {
    wishlist.matchedProfiles = 0;
    wishlist.matchRange = 'Archived';
  }
  renderApp();
}

function openEditListingModal(home) {
  modalTitle.textContent = 'Edit listing';
  modalContent.innerHTML = `
    <form class="form-grid">
      <label>
        <span>Asking price</span>
        <input type="number" value="${home.askingPrice || ''}" />
      </label>
      <label>
        <span>Status</span>
        <select>
          ${['Active', 'Under Contract', 'Off-market preview'].map((status) => `<option value="${status}" ${status === home.status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
      </label>
      <label>
        <span>Headline summary</span>
        <textarea rows="3">${home.summary || ''}</textarea>
      </label>
      <p class="section-description">Saving pushes updates to the match engine and refreshes the demand snapshot within 10 seconds.</p>
      <div class="form-actions">
        <button class="ghost-button" type="button" id="cancel-edit-listing">Cancel</button>
        <button class="primary-button" type="submit">Save changes</button>
      </div>
    </form>
  `;
  modalContent.querySelector('#cancel-edit-listing')?.addEventListener('click', () => modal.close());
  modalContent.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    modal.close();
  });
  modal.showModal();
}

function openShareModal(home, { mode } = {}) {
  const shareMode = mode || 'agent';
  const isSnapshot = shareMode === 'snapshot';
  modalTitle.textContent = isSnapshot ? 'Share demand snapshot' : 'Share with agent';
  const urlFragment = `${home.id}-${shareMode}`;
  const shareUrl = `https://reach.example.com/share/${urlFragment}`;
  modalContent.innerHTML = `
    <div class="form-grid">
      <p>${isSnapshot
        ? 'Generate a read-only view of buyer demand with masked data. Recipients see aggregates but no PII.'
        : 'Invite an agent to collaborate on this Property Profile. They will see anonymised demand data.'}</p>
      <label>
        <span>Share link</span>
        <input type="text" value="${shareUrl}" readonly />
      </label>
      <div class="form-actions">
        <button class="ghost-button" type="button" id="close-share-modal">Close</button>
        <button class="primary-button" type="button" id="copy-share-link">Copy link</button>
      </div>
    </div>
  `;
  modalContent.querySelector('#close-share-modal')?.addEventListener('click', () => modal.close());
  modalContent.querySelector('#copy-share-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    const btn = event.currentTarget;
    if (btn) {
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy link'; }, 1600);
    }
  });
  modal.showModal();
}

function openPropertyInsights(profile) {
  const snapshot = profile.demandSnapshot || {};
  const fit = profile.wishlistFit || {};
  modalTitle.textContent = `${profile.nickname || 'Property profile'} · Demand insights`;

  modalContent.innerHTML = `
    <div class="form-grid">
      <article class="analytics-card">
        <h3>Demand snapshot</h3>
        <p><strong>${snapshot.matchCount ?? profile.matchedBuyers ?? 0}</strong> matching buyers</p>
        <p><strong>${formatPercent(snapshot.topMatch ?? profile.matchScore, 0)}</strong> top match</p>
        <p><strong>${snapshot.preapprovedCount ?? 0}</strong> pre-approved buyers</p>
      </article>
      <article class="analytics-card">
        <h3>Wishlist fit</h3>
        <ul>
          <li>Location: ${formatPercent(fit.location, 0)}</li>
          <li>Price: ${formatPercent(fit.price, 0)} (gate)</li>
          <li>Must-haves: ${formatPercent(fit.mustHave, 0)}</li>
          <li>Nice-to-haves: ${formatPercent(fit.niceToHave, 0)}</li>
        </ul>
        <p class="section-description">${profile.gapHint || 'Gaps will appear as the match engine compares buyer must-haves.'}</p>
      </article>
      <article class="analytics-card">
        <h3>Next step</h3>
        <p>${canSeeSnippets()
          ? 'Start conversations with top matches or share a demand snapshot with your advisor.'
          : 'Upgrade to Seller · Pro to unlock buyer profiles, run what-if simulations, and message matches.'}</p>
        <div class="form-actions">
          <button class="${canSeeSnippets() ? 'ghost-button' : 'primary-button'}" type="button">${canSeeSnippets() ? 'Close' : 'Upgrade to contact buyers'}</button>
        </div>
      </article>
    </div>
  `;

  const actionButton = modalContent.querySelector('button');
  if (actionButton) {
    actionButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (canSeeSnippets()) {
        modal.close();
      } else {
        openUpgradePrompt();
      }
    });
  }
  modal.showModal();
}

function openUpgradePrompt() {
  modalTitle.textContent = 'Upgrade required';
  modalContent.innerHTML = `
    <p>Messaging buyers, viewing wishlist snippets, and unlocking demand trends are reserved for Seller · Pro or Agent · Pro accounts.</p>
    <div class="form-actions">
      <button class="ghost-button" value="cancel">Maybe later</button>
      <button class="primary-button" value="confirm">View upgrade plans</button>
    </div>
  `;
  modal.showModal();
}

function openChat(threadId, counterparty) {
  modalTitle.textContent = 'Secure messaging';
  modalContent.innerHTML = `
    <div class="form-grid">
      <p>Chat thread <strong>${threadId}</strong> keeps identities anonymised. Counterparty: <strong>${counterparty}</strong>.</p>
      <textarea placeholder="Type a reply..." rows="4"></textarea>
      <div class="form-actions">
        <button class="primary-button">Send message</button>
      </div>
    </div>
  `;
  modal.showModal();
}

function toggleThreadMute(thread) {
  thread.status = thread.status === 'Muted' ? 'Reply ready' : 'Muted';
}

function openDisclosurePrompt(thread) {
  modalTitle.textContent = 'Reveal identity?';
  modalContent.innerHTML = `
    <div class="form-grid">
      <p>You are about to disclose your identity to <strong>${thread.counterparty}</strong>. This action is logged for compliance.</p>
      <label class="checkbox-label">
        <input type="checkbox" id="disclosure-confirm" /> I consent to share my name and contact details in this thread.
      </label>
      <div class="form-actions">
        <button class="ghost-button" type="button" id="cancel-disclosure">Cancel</button>
        <button class="primary-button" type="button" id="confirm-disclosure" disabled>Reveal identity</button>
      </div>
    </div>
  `;

  const checkbox = modalContent.querySelector('#disclosure-confirm');
  const confirmButton = modalContent.querySelector('#confirm-disclosure');
  const cancelButton = modalContent.querySelector('#cancel-disclosure');

  checkbox.addEventListener('change', () => {
    confirmButton.disabled = !checkbox.checked;
  });
  cancelButton.addEventListener('click', () => modal.close());
  confirmButton.addEventListener('click', () => {
    thread.disclosureRequested = false;
    modal.close();
  });

  modal.showModal();
}

function renderMapCard({ title, description, regions, formatter, emptyCopy }) {
  const card = document.createElement('section');
  card.className = 'section map-card';
  card.innerHTML = `
    <div class="section-header">
      <h2>${title}</h2>
      <p class="section-description">${description}</p>
    </div>
  `;

  // Create a container for the real map
  const mapContainer = document.createElement('div');
  mapContainer.id = `map-${Date.now()}`; // Unique ID for each map
  mapContainer.style.cssText = `
    height: 280px !important;
    border-radius: 1.25rem !important;
    overflow: hidden !important;
    border: 1px solid rgba(59, 130, 246, 0.25) !important;
    z-index: 1 !important;
  `;

  card.append(mapContainer);

  // Initialize the map after the container is added to DOM
  setTimeout(() => {
    const hasLeaflet = typeof L !== 'undefined';
    const validRegions = Array.isArray(regions)
      ? regions.filter((r) => Number.isFinite(r?.lat) && Number.isFinite(r?.lng))
      : [];

    if (hasLeaflet && validRegions.length > 0) {
      // Calculate center point from valid regions only
      const centerLat = validRegions.reduce((sum, r) => sum + r.lat, 0) / validRegions.length;
      const centerLng = validRegions.reduce((sum, r) => sum + r.lng, 0) / validRegions.length;

      // Initialize Leaflet map
      const map = L.map(mapContainer.id, {
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: true,
        touchZoom: true,
        boxZoom: false,
      }).setView([centerLat, centerLng], 11);

      // Add OpenStreetMap tiles (free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add markers for each valid region
      validRegions.forEach((region) => {
        // Create custom marker with buyer count
        const markerHtml = `
          <div style="
            background: #fff;
            border: 3px solid #1d4ed8;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #1d4ed8;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
            font-size: 13px;
          ">${region.count}</div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([region.lat, region.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 5px;">
              <strong>${region.label}</strong><br>
              <span style="color: #1d4ed8; font-weight: bold;">${region.count} buyers searching</span>
            </div>
          `);

        // Add hover effects
        marker.on('mouseover', function () {
          this.openPopup();
        });
        
        marker.on('mouseout', function () {
          this.closePopup();
        });
      });

      // Fit map to show all markers
      if (validRegions.length > 1) {
        const group = L.featureGroup(
          validRegions.map(r => L.marker([r.lat, r.lng]))
        );
        map.fitBounds(group.getBounds().pad(0.1));
      }

    } else if (!Array.isArray(regions) || regions.length === 0) {
      // Show empty state if no regions
      mapContainer.style.cssText += `
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(37, 99, 235, 0.1);
        color: #64748b;
        font-style: italic;
      `;
      mapContainer.textContent = emptyCopy;
    } else {
      // Fallback if Leaflet not loaded
      mapContainer.style.cssText += `
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.3);
      `;
      mapContainer.textContent = 'Map not available for this dataset. Please refresh the page.';
    }
  }, 100);

  return card;
}

function renderMetric(label, value) {
  return `
    <div>
      <div class="section-description" style="font-size:0.85rem;">${label}</div>
      <div class="metric-bar"><span style="width:${Math.min(100, value)}%;"></span></div>
    </div>
  `;
}

function createInfoBanner(message, variant = 'neutral') {
  const banner = document.createElement('div');
  banner.className = `info-banner info-banner--${variant}`;
  banner.textContent = message;
  return banner;
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

function createEmptyState(message) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.textContent = message;
  return div;
}

function formatCurrency(value) {
  if (!value) return '$0';
  return `$${Number(value).toLocaleString()}`;
}

function formatPercent(value, decimals = 0) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  const ratio = Math.abs(numeric) <= 1 ? numeric : numeric / 100;
  return `${(ratio * 100).toFixed(decimals)}%`;
}

function describeBudgetAlignment(match, price) {
  if (!match?.budget) return '—';
  const min = Number(match.budget.min);
  const max = Number(match.budget.max);
  if (!Number.isFinite(price)) {
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    }
    return Number.isFinite(max) ? `${formatCurrency(max)} max` : 'Budget undisclosed';
  }

  if (Number.isFinite(max) && price > max) {
    return `Above buyer max (${formatCurrency(max)})`;
  }
  if (Number.isFinite(min) && price < min) {
    return `Below preferred range (${formatCurrency(min)} min)`;
  }
  if (Number.isFinite(max)) {
    return `${formatCurrency(price)} of ${formatCurrency(max)} max`;
  }
  return `${formatCurrency(price)} aligned`;
}

function summarizeMustHaveStatus(match) {
  const met = Array.isArray(match?.mustHaveStatus?.met) ? match.mustHaveStatus.met.length : 0;
  const missing = Array.isArray(match?.mustHaveStatus?.missing) ? match.mustHaveStatus.missing.length : 0;
  const total = met + missing;
  if (!total) return '<span class="musthave-chip">—</span>';
  const missingList = Array.isArray(match?.mustHaveStatus?.missing) && match.mustHaveStatus.missing.length
    ? `Missing: ${match.mustHaveStatus.missing.join(', ')}`
    : 'All must-haves satisfied';
  const className = missing ? 'musthave-chip musthave-chip--gap' : 'musthave-chip musthave-chip--pass';
  const icon = missing ? '✗' : '✓';
  return `<span class="${className}" title="${missingList}">${icon} ${met}/${total} met</span>`;
}

function renderContributionList(contributions) {
  if (!Array.isArray(contributions) || !contributions.length) {
    return '<p class="section-description">Score drivers will appear after the next match recalculation.</p>';
  }
  return `
    <ul class="contribution-list">
      ${contributions
        .map((item) => `<li><span>${item.factor || 'Factor'}</span><strong>${formatPercent(item.value ?? 0, 0)}</strong></li>`)
        .join('')}
    </ul>
  `;
}

function simulateMatchSummary(data) {
  const baseMatches = Math.max(5, data.locations.length * 4 + (data.preApproved ? 3 : 0));
  const matches = baseMatches + Math.floor(Math.random() * 6);
  const topScore = Math.min(100, 65 + Math.floor(Math.random() * 30));
  return {
    matches,
    topScore,
    matchRange: `${Math.max(40, topScore - 18)}-${topScore}%`,
    gapHint: data.features.must.includes('3 baths') ? 'Gap resolved: 3 baths requirement now covered.' : 'Typical profiles nearby: 2 baths; you require 3.',
    trend: `${data.locations[0]?.label ?? 'Your focus area'} demand up ${Math.floor(Math.random() * 10)}% this month.`,
  };
}

renderApp();

// Keep updatePropertyCards available for future use without throwing if not used
function updatePropertyCards() {
  const container = document.getElementById('property-grid') || document.querySelector('.property-grid');
  if (!container) return;
  container.innerHTML = '';
  (Array.isArray(propertyProfiles) ? propertyProfiles : []).forEach((profile) => {
    const card = renderPropertyCard(profile);
    container.appendChild(card);
  });
}
