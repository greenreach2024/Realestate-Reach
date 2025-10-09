import {
  buyers,
  buyerMapRegions,
  homeProfiles,
  sellerHotspots,
  agents,
  mortgageLeads,
  notifications,
  subscriptions,
  onboardingFlows,
} from './data.js';
import { auth, renderAuthActions, renderLoginPage, renderRegistrationPage } from './auth.js';

const budgetBenchmarks = {
  'Port Moody Centre': { house: 1100000, townhouse: 925000, condo: 780000 },
  Pleasantside: { house: 1040000, townhouse: 910000, condo: 720000 },
  'Olympic Village': { house: 1300000, townhouse: 1080000, condo: 920000 },
  'Coal Harbour': { house: 1500000, townhouse: 1180000, condo: 1050000 },
  Kitsilano: { house: 1650000, townhouse: 1250000, condo: 990000 },
  'Mount Pleasant': { house: 1380000, townhouse: 1120000, condo: 880000 },
  Default: { house: 975000, townhouse: 865000, condo: 695000 },
};

const appRoot = document.getElementById('app-root');
const sidebarContainer = document.getElementById('sidebar-container');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarToggle = document.getElementById('sidebar-toggle');
const globalNewButton = document.getElementById('global-new-button');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');

const SIDEBAR_PIN_KEY = 'rr_sidebar_pinned';
let storedPinPreference = true;
try {
  const stored = localStorage.getItem(SIDEBAR_PIN_KEY);
  if (stored !== null) {
    storedPinPreference = stored === 'true';
  }
} catch (error) {
  storedPinPreference = true;
}

const state = {
  view: 'role',
  role: 'buyer',
  buyerId: buyers[0].id,
  sellerTier: 'free',
  selectedWishlistId: buyers?.[0]?.wishlists?.[0]?.id ?? null,
  sidebarPinned: storedPinPreference,
  userRoles: ['buyer', 'seller', 'agent'],
};

let roleSelect = null;

// Gating helpers for Seller/Agent
function canSeeSnippets() {
  return (state.role === 'seller' || state.role === 'agent') && (state.sellerTier === 'pro');
}
function canMessage() {
  return (state.role === 'seller' || state.role === 'agent') && (state.sellerTier === 'pro');
}

// Lightweight adapter (mock). Replace with /api/matches/home/:id/summary later.
function getHomeMatchSummary(profile) {
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

const SIDEBAR_ITEMS = [
  { id: 'buyer-wishlists', label: 'Wishlists', icon: '📝', view: 'role', roles: ['buyer'], role: 'buyer' },
  { id: 'buyer-budget', label: 'Budget Coach', icon: '📈', view: 'budget-coach', roles: ['buyer'], role: 'buyer' },
  { id: 'buyer-messages', label: 'Messages', icon: '💬', view: 'messages', roles: ['buyer'], role: 'buyer' },
  { id: 'buyer-account', label: 'Account', icon: '🛡️', view: 'account', roles: ['buyer'], role: 'buyer' },
  { id: 'seller-homes', label: 'My Homes', icon: '🏠', view: 'seller-homes', roles: ['seller'], role: 'seller' },
  { id: 'seller-matches', label: 'Buyer Matches', icon: '🎯', view: 'seller-matches', roles: ['seller'], role: 'seller' },
  { id: 'seller-insights', label: 'Insights', icon: '📊', view: 'seller-insights', roles: ['seller'], role: 'seller' },
  { id: 'seller-messages', label: 'Messages', icon: '💬', view: 'messages', roles: ['seller'], role: 'seller' },
  { id: 'seller-billing', label: 'Subscriptions & Billing', icon: '💳', view: 'seller-billing', roles: ['seller'], role: 'seller' },
  { id: 'agent-analytics', label: 'Demand Analytics', icon: '🔥', view: 'agent-analytics', roles: ['agent'], role: 'agent' },
  { id: 'agent-segments', label: 'Buyer Segments', icon: '👥', view: 'agent-segments', roles: ['agent'], role: 'agent' },
  { id: 'agent-homes', label: 'My Sellers & Homes', icon: '🏘️', view: 'agent-homes', roles: ['agent'], role: 'agent' },
  { id: 'agent-messages', label: 'Messages', icon: '💬', view: 'messages', roles: ['agent'], role: 'agent' },
  { id: 'agent-billing', label: 'Billing & Licenses', icon: '🧾', view: 'agent-billing', roles: ['agent'], role: 'agent' },
];

const DEFAULT_VIEW_BY_ROLE = {
  buyer: 'role',
  seller: 'seller-homes',
  agent: 'agent-analytics',
  mortgage: 'role',
};

const NEW_BUTTON_LABELS = {
  buyer: 'New Wishlist',
  seller: 'New Home',
  agent: 'New Segment',
  mortgage: 'New Lead',
};

function getDefaultViewForRole(role) {
  return DEFAULT_VIEW_BY_ROLE[role] ?? 'role';
}

function isCompactViewport() {
  return window.matchMedia('(max-width: 1024px)').matches;
}

function isDrawerViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function getVisibleSidebarItems(role) {
  return SIDEBAR_ITEMS.filter((item) => item.roles.includes(role));
}

function getActiveSidebarId(role, view) {
  const items = getVisibleSidebarItems(role);
  const match = items.find((item) => item.view === view);
  return match?.id ?? items[0]?.id ?? null;
}

function updateGlobalNewButton() {
  if (!globalNewButton) return;
  const label = NEW_BUTTON_LABELS[state.role] ?? 'New';
  globalNewButton.textContent = label;
  globalNewButton.setAttribute('aria-label', label);
}

function bindRoleSelect(select) {
  if (roleSelect === select) return;
  if (roleSelect) {
    roleSelect.removeEventListener('change', handleRoleChange);
  }
  roleSelect = select;
  if (roleSelect) {
    roleSelect.addEventListener('change', handleRoleChange);
  }
}

function closeSidebarDrawer() {
  if (!document.body.classList.contains('sidebar-open')) return;
  document.body.classList.remove('sidebar-open');
  if (sidebarOverlay) sidebarOverlay.hidden = true;
  if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
  renderSidebar();
}

function handleRoleChange(event) {
  const nextRole = event.target.value;
  state.role = nextRole;
  state.view = getDefaultViewForRole(nextRole);
  closeSidebarDrawer();
  renderSidebar();
  renderApp();
}

function handleSidebarNavigation(item) {
  if (item.role && state.role !== item.role) {
    state.role = item.role;
  }
  state.view = item.view;
  closeSidebarDrawer();
  renderSidebar();
  renderApp();
}

function handleGlobalNewClick() {
  if (state.role === 'buyer') {
    openWishlistForm('Create Buyer Wishlist');
    return;
  }
  if (state.role === 'seller') {
    const home = (homeProfiles || [])[0] ?? { priceExpectation: '', status: 'Not for sale', summary: '' };
    openEditHomeModal(home);
    return;
  }
  if (state.role === 'agent') {
    openAgentSegmentModal();
    return;
  }
  window.openAuthModal?.('register');
}

function renderSidebar() {
  if (!sidebarContainer) return;
  const isResponsive = isCompactViewport();
  const isDrawer = isDrawerViewport();
  const drawerOpen = document.body.classList.contains('sidebar-open');
  const shouldCollapse = (!state.sidebarPinned && !isResponsive) || (isResponsive && !drawerOpen);

  sidebarContainer.classList.toggle('sidebar--collapsed', shouldCollapse && !drawerOpen);
  sidebarContainer.classList.toggle('sidebar--expanded', drawerOpen || (!shouldCollapse));
  sidebarContainer.classList.toggle('sidebar--drawer', isDrawer);

  sidebarContainer.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar__inner';

  const header = document.createElement('div');
  header.className = 'sidebar__header';
  const title = document.createElement('span');
  title.className = 'sidebar__title';
  title.textContent = 'Buyer Registry';
  header.append(title);

  const pinButton = document.createElement('button');
  pinButton.className = 'sidebar__pin';
  pinButton.type = 'button';
  pinButton.setAttribute('aria-pressed', state.sidebarPinned ? 'true' : 'false');
  pinButton.setAttribute('aria-label', state.sidebarPinned ? 'Collapse navigation' : 'Pin navigation');
  pinButton.textContent = state.sidebarPinned ? '📌' : '📍';
  pinButton.addEventListener('click', () => {
    state.sidebarPinned = !state.sidebarPinned;
    try { localStorage.setItem(SIDEBAR_PIN_KEY, String(state.sidebarPinned)); } catch {}
    renderSidebar();
  });
  header.append(pinButton);

  const nav = document.createElement('nav');
  nav.className = 'sidebar__nav';
  nav.setAttribute('aria-label', 'Primary');

  const list = document.createElement('ul');
  list.className = 'sidebar__list';
  const visibleItems = getVisibleSidebarItems(state.role);
  const activeId = getActiveSidebarId(state.role, state.view);
  const threads = getThreadsForRole(state.role);
  const unread = threads.filter((thread) => thread.status && /new|ready/i.test(thread.status)).length;

  visibleItems.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'sidebar__item';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sidebar__link';
    button.dataset.id = item.id;
    if (item.id === activeId) {
      button.setAttribute('aria-current', 'page');
    }

    const icon = document.createElement('span');
    icon.className = 'sidebar__icon';
    icon.textContent = item.icon;
    button.append(icon);

    const label = document.createElement('span');
    label.className = 'sidebar__label';
    label.textContent = item.label;
    button.append(label);

    if (item.view === 'messages' && unread > 0) {
      const badge = document.createElement('span');
      badge.className = 'sidebar__badge';
      badge.textContent = unread.toString();
      button.append(badge);
      button.title = `${item.label} (${unread} unread)`;
    } else {
      button.title = item.label;
    }

    button.addEventListener('click', () => handleSidebarNavigation(item));
    li.append(button);
    list.append(li);
  });

  if (!visibleItems.length) {
    const placeholder = document.createElement('p');
    placeholder.className = 'section-description';
    placeholder.textContent = 'Navigation unavailable for this role.';
    nav.append(placeholder);
  }

  const focusable = Array.from(list.querySelectorAll('.sidebar__link'));
  focusable.forEach((button, index) => {
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'].includes(event.key)) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        button.click();
        return;
      }
      event.preventDefault();
      if (focusable.length === 0) return;
      let nextIndex = index;
      if (event.key === 'ArrowDown') {
        nextIndex = (index + 1) % focusable.length;
      } else if (event.key === 'ArrowUp') {
        nextIndex = (index - 1 + focusable.length) % focusable.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = focusable.length - 1;
      }
      focusable[nextIndex].focus();
    });
  });

  nav.append(list);
  wrapper.append(header, nav);

  const multiRole = Array.isArray(state.userRoles) && state.userRoles.length > 1;
  const footer = document.createElement('div');
  footer.className = 'sidebar__footer';
  if (multiRole) {
    const switcher = document.createElement('div');
    switcher.className = 'role-switcher';
    const label = document.createElement('label');
    label.setAttribute('for', 'role-select');
    label.textContent = 'Role experience';
    const select = document.createElement('select');
    select.id = 'role-select';
    state.userRoles.forEach((role) => {
      const option = document.createElement('option');
      option.value = role;
      option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
      select.append(option);
    });
    select.value = state.role;
    switcher.append(label, select);
    footer.append(switcher);
    bindRoleSelect(select);
  } else {
    bindRoleSelect(null);
  }

  if (footer.children.length) {
    wrapper.append(footer);
  }

  sidebarContainer.append(wrapper);
  updateGlobalNewButton();
  if (sidebarOverlay) {
    sidebarOverlay.hidden = !drawerOpen;
  }
}

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    const open = !document.body.classList.contains('sidebar-open');
    if (open) {
      document.body.classList.add('sidebar-open');
      sidebarToggle.setAttribute('aria-expanded', 'true');
      renderSidebar();
    } else {
      closeSidebarDrawer();
    }
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    closeSidebarDrawer();
  });
}

if (globalNewButton) {
  globalNewButton.addEventListener('click', handleGlobalNewClick);
}

window.addEventListener('resize', () => {
  renderSidebar();
});

modal.addEventListener('close', () => {
  modalContent.innerHTML = '';
});

// Expose handlers used by inline onclick in index.html
// These must be on window because app.js is an ES module
window.showNotificationCenter = () => {
  closeSidebarDrawer();
  state.view = 'notifications';
  renderApp();
};

window.showNotificationSettings = () => {
  closeSidebarDrawer();
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
  renderSidebar();
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
    case 'budget-coach':
      appRoot.append(renderBuyerBudgetCoachView());
      break;
    case 'account':
      appRoot.append(renderAccountPrivacyView());
      break;
    case 'seller-homes':
      appRoot.append(renderSellerExperience());
      break;
    case 'seller-matches':
      appRoot.append(renderSellerMatchesView());
      break;
    case 'seller-insights':
      appRoot.append(renderSellerInsightsView());
      break;
    case 'seller-billing':
      appRoot.append(renderSellerBillingView());
      break;
    case 'agent-analytics':
      appRoot.append(renderAgentExperience());
      break;
    case 'agent-segments':
      appRoot.append(renderAgentSegmentsView());
      break;
    case 'agent-homes':
      appRoot.append(renderAgentHomesView());
      break;
    case 'agent-billing':
      appRoot.append(renderAgentBillingView());
      break;
    case 'role':
    default:
      appRoot.append(renderRoleExperience());
  }
}

// Expose simple navigation for other modules (e.g., auth.js) and inline buttons
window.gotoView = (view) => {
  closeSidebarDrawer();
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
  if (!state.userRoles.includes(role)) {
    state.userRoles = [...state.userRoles, role];
  }
  state.view = getDefaultViewForRole(role);
  renderAuthActions();
  renderApp();
};

function renderMessenger() {
  const section = createSection({
    title: 'In-app messages',
    description: 'Anonymized conversations aligned to buyer wishlists and Home Profiles. The system publishes demand, not supply.',
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
      'Realestate Ready is not an MLS or property advertising site. Buyers publish wishlists; sellers and agents compare private Home Profiles against demand. The platform publishes demand, not supply.',
  });

  const hero = document.createElement('div');
  hero.className = 'hero';
  hero.innerHTML = `
    <div>
      <h2>Match private supply to visible buyer demand</h2>
      <p>Buyer Wishlists surface true demand. Sellers analyse how their Home Profiles stack up, upgrade for outreach, and keep every conversation anonymised until disclosure.</p>
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
      body: 'Sellers and agents benchmark Home Profiles for AI-driven comparisons—no homes are listed for sale.',
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
  if (!buyer) {
    return createEmptyState('No buyer profiles available.');
  }

  if (!Array.isArray(buyer.wishlists) || !buyer.wishlists.length) {
    const wrapper = document.createElement('div');
    wrapper.className = 'buyer-experience';
    wrapper.append(createEmptyState('Create a wishlist to unlock Supply vs Me analytics.'), renderBuyerMessaging(buyer), renderBuyerNotifications(buyer));
    return wrapper;
  }

  if (!buyer.wishlists.some((w) => w.id === state.selectedWishlistId)) {
    state.selectedWishlistId = buyer.wishlists[0]?.id ?? null;
  }

  const wishlist = buyer.wishlists.find((w) => w.id === state.selectedWishlistId) ?? buyer.wishlists[0];
  const wrapper = document.createElement('div');
  wrapper.className = 'buyer-experience';

  wrapper.append(renderWishlistProfile(buyer, wishlist));
  wrapper.append(renderBuyerInsights(buyer), renderBuyerMessaging(buyer), renderBuyerNotifications(buyer));
  return wrapper;
}

function renderBuyerBudgetCoachView() {
  const buyer = buyers.find((b) => b.id === state.buyerId) ?? buyers[0];
  const container = document.createElement('div');
  container.className = 'buyer-experience';

  const wishlist = buyer?.wishlists?.find((w) => w.id === state.selectedWishlistId) ?? buyer?.wishlists?.[0] ?? null;
  const section = createSection({
    title: 'Budget Coach',
    description: 'Track how your price guardrails align with live market shifts. Owners choose if/what to share — demand context only.',
  });

  if (wishlist) {
    section.append(renderBudgetCoachCard(wishlist));
  } else {
    section.append(createEmptyState('Create a wishlist to unlock personalised Budget Coach guidance.'));
  }

  container.append(section);
  if (buyer) {
    container.append(renderBuyerMessaging(buyer), renderBuyerNotifications(buyer));
  }
  return container;
}

function renderAccountPrivacyView() {
  const section = createSection({
    title: 'Account & Privacy',
    description: 'Control how your wishlists, notifications, and messaging preferences are shared across the registry.',
  });

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-header">
      <h3>Privacy controls</h3>
      <p class="section-description">Buyers publish demand only. No addresses or personal contact details are shown.</p>
    </div>
    <div class="card-body">
      <ul class="feature-list">
        <li><strong>Share scope</strong>: Owners decide if address, photos, or profile details are visible.</li>
        <li><strong>Messaging</strong>: All conversations stay in-app until both parties consent to disclose info.</li>
        <li><strong>Notifications</strong>: Opt into demand alerts without exposing buyer or seller identities.</li>
      </ul>
      <div class="form-actions">
        <button class="ghost-button" type="button" onclick="showNotificationSettings()">Notification preferences</button>
      </div>
    </div>
  `;

  section.append(card);
  return section;
}

function renderWishlistProfile(buyer, wishlist) {
  const container = document.createElement('section');
  container.className = 'wishlist-v2';

  container.append(
    renderWishlistHeader(buyer, wishlist),
    renderWishlistSearchShell(wishlist),
    renderWishlistSnapshot(wishlist),
    renderWishlistBody(wishlist),
  );

  return container;
}

function renderWishlistHeader(buyer, wishlist) {
  const header = document.createElement('article');
  header.className = 'card wishlist-v2__header-card';

  const content = document.createElement('div');
  content.className = 'wishlist-v2__header-content';

  const left = document.createElement('div');
  left.className = 'wishlist-v2__header-left';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'wishlist-v2__eyebrow';
  eyebrow.textContent = 'Buyer · Wishlist Profile';
  left.append(eyebrow);

  const title = document.createElement('h2');
  title.textContent = `Your Wishlist: ${wishlist.name}`;
  left.append(title);

  const subline = document.createElement('p');
  subline.className = 'section-description';
  subline.textContent = "We match your wishlist to homeowners. You'll only see home details when an owner shares their profile with you.";
  left.append(subline);

  if (wishlist.summary) {
    const summary = document.createElement('p');
    summary.className = 'wishlist-v2__summary';
    summary.textContent = wishlist.summary;
    left.append(summary);
  }

  const badges = document.createElement('div');
  badges.className = 'wishlist-v2__badges';
  if (wishlist.preApproved) {
    const pre = document.createElement('span');
    pre.className = 'badge badge--accent';
    pre.textContent = 'Pre-approved';
    badges.append(pre);
  }
  const timeline = document.createElement('span');
  timeline.className = 'badge badge--outline';
  timeline.textContent = `Timeline: ${wishlist.timeline}`;
  badges.append(timeline);
  left.append(badges);

  const right = document.createElement('div');
  right.className = 'wishlist-v2__header-actions';

  if (buyer.wishlists.length > 1) {
    const switcher = document.createElement('label');
    switcher.className = 'wishlist-v2__switcher';
    switcher.textContent = 'Switch wishlist';

    const select = document.createElement('select');
    buyer.wishlists.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name;
      if (item.id === wishlist.id) {
        option.selected = true;
      }
      select.append(option);
    });
    select.addEventListener('change', (event) => {
      state.selectedWishlistId = event.target.value;
      renderApp();
    });
    switcher.append(select);
    right.append(switcher);
  }

  const buttons = document.createElement('div');
  buttons.className = 'wishlist-v2__buttons';

  const createButton = document.createElement('button');
  createButton.className = 'primary-button';
  createButton.textContent = 'New wishlist';
  createButton.addEventListener('click', () => openWishlistForm('Create Buyer Wishlist'));
  buttons.append(createButton);

  const viewButton = document.createElement('button');
  viewButton.className = 'ghost-button';
  viewButton.textContent = 'View analytics';
  viewButton.addEventListener('click', () => openWishlistModal(wishlist));
  buttons.append(viewButton);

  const editButton = document.createElement('button');
  editButton.className = 'ghost-button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => openWishlistForm('Edit Buyer Wishlist', wishlist));
  buttons.append(editButton);

  const duplicateButton = document.createElement('button');
  duplicateButton.className = 'ghost-button';
  duplicateButton.textContent = 'Duplicate';
  duplicateButton.addEventListener('click', () => duplicateWishlist(buyer.id, wishlist.id));
  buttons.append(duplicateButton);

  const archiveButton = document.createElement('button');
  archiveButton.className = 'ghost-button';
  archiveButton.textContent = wishlist.active ? 'Archive' : 'Restore';
  archiveButton.addEventListener('click', () => archiveWishlist(buyer.id, wishlist.id));
  buttons.append(archiveButton);

  right.append(buttons);

  content.append(left, right);
  header.append(content);

  return header;
}

function renderWishlistSearchShell(wishlist) {
  const shell = document.createElement('div');
  shell.className = 'wishlist-v2__search-shell';

  const mapPanel = document.createElement('article');
  mapPanel.className = 'card wishlist-v2__map-panel';

  const mapHeader = document.createElement('div');
  mapHeader.className = 'wishlist-v2__map-header';
  mapHeader.innerHTML = `
    <h3>Wishlist map</h3>
    <p class="section-description">Matches update as homeowners publish private Home Profiles in these areas.</p>
  `;
  mapPanel.append(mapHeader);

  const mapId = `wishlist-map-${wishlist.id}-${Math.random().toString(16).slice(2)}`;
  const mapCanvas = document.createElement('div');
  mapCanvas.id = mapId;
  mapCanvas.className = 'wishlist-v2__map';
  mapPanel.append(mapCanvas);

  const areaPills = document.createElement('div');
  areaPills.className = 'wishlist-v2__area-pills';
  if (Array.isArray(wishlist.locations) && wishlist.locations.length) {
    wishlist.locations.forEach((location) => {
      const pill = document.createElement('span');
      pill.className = 'pill wishlist-v2__area-pill';
      const count = Number.isFinite(location.count) ? ` · ${location.count} matches` : '';
      pill.innerHTML = `<strong>${location.label}</strong> · ${location.type} · Priority ${location.priority}${count}`;
      areaPills.append(pill);
    });
  } else {
    const empty = document.createElement('p');
    empty.className = 'section-description';
    empty.textContent = 'Add polygons, postal codes, or radius areas to guide the match engine.';
    areaPills.append(empty);
  }
  mapPanel.append(areaPills);

  initWishlistMap(mapId, wishlist);

  shell.append(mapPanel, renderWishlistFilters(wishlist));
  return shell;
}

function renderWishlistFilters(wishlist) {
  const panel = document.createElement('article');
  panel.className = 'card wishlist-v2__filters-panel';

  const header = document.createElement('div');
  header.innerHTML = `
    <h3>Filters from your wishlist</h3>
    <p class="section-description">Adjusting filters updates the saved wishlist. Nothing is publicly listed.</p>
  `;
  panel.append(header);

  const grid = document.createElement('div');
  grid.className = 'wishlist-v2__filter-grid';
  const details = wishlist.details ?? {};

  const filters = [
    { label: 'Price range', value: formatBudgetBand(wishlist.budget) },
    { label: 'Property type', value: details.type ?? 'Any' },
    { label: 'Bedrooms', value: details.beds ? `${details.beds}+` : 'Flexible' },
    { label: 'Bathrooms', value: details.baths ? `${details.baths}+` : 'Flexible' },
    { label: 'Min size', value: details.sizeMin ? `${details.sizeMin} sq ft` : 'No minimum' },
    { label: 'Max size', value: details.sizeMax ? `${details.sizeMax} sq ft` : 'Open' },
  ];

  filters.forEach((filter) => {
    grid.append(renderWishlistFilterField(filter.label, filter.value));
  });

  panel.append(grid);

  const mustGroup = document.createElement('div');
  mustGroup.className = 'wishlist-v2__feature-group';
  mustGroup.innerHTML = '<h4>Must-haves</h4>';
  if (Array.isArray(wishlist.features?.must) && wishlist.features.must.length) {
    wishlist.features.must.forEach((feature) => {
      const chip = document.createElement('span');
      chip.className = 'pill wishlist-v2__feature-pill';
      chip.textContent = feature;
      mustGroup.append(chip);
    });
  } else {
    const empty = document.createElement('p');
    empty.className = 'section-description';
    empty.textContent = 'Add at least one non-negotiable to focus matches.';
    mustGroup.append(empty);
  }

  const niceGroup = document.createElement('div');
  niceGroup.className = 'wishlist-v2__feature-group';
  niceGroup.innerHTML = '<h4>Nice-to-haves</h4>';
  if (Array.isArray(wishlist.features?.nice) && wishlist.features.nice.length) {
    wishlist.features.nice.forEach((feature) => {
      const chip = document.createElement('span');
      chip.className = 'pill wishlist-v2__feature-pill wishlist-v2__feature-pill--nice';
      chip.textContent = feature;
      niceGroup.append(chip);
    });
  } else {
    const empty = document.createElement('p');
    empty.className = 'section-description';
    empty.textContent = 'Wishlist keeps flexible amenities separate from must-haves.';
    niceGroup.append(empty);
  }

  panel.append(mustGroup, niceGroup);

  const footer = document.createElement('p');
  footer.className = 'wishlist-v2__filters-note';
  footer.textContent = 'Matches refresh privately — homeowners opt in before you can chat.';
  panel.append(footer);

  return panel;
}

function renderWishlistSnapshot(wishlist) {
  const stats = getWishlistStats(wishlist);
  const wrapper = document.createElement('div');
  wrapper.className = 'wishlist-v2__snapshot';

  const snapshot = document.createElement('div');
  snapshot.className = 'wishlist-v2__snapshot-row';

  const metrics = [
    { label: 'Matching homes (owners)', value: stats.matchingHomes?.toLocaleString?.() ?? '0' },
    { label: 'Top fit', value: `${stats.topFit ?? 0}%` },
    { label: 'New matches this week', value: stats.newMatches?.toLocaleString?.() ?? '0' },
  ];

  metrics.forEach((metric) => {
    const card = document.createElement('article');
    card.className = 'card wishlist-v2__snapshot-card';
    card.innerHTML = `
      <p class="wishlist-v2__snapshot-label">${metric.label}</p>
      <p class="wishlist-v2__snapshot-value">${metric.value}</p>
    `;
    snapshot.append(card);
  });

  if (stats.upgradeEligible) {
    const upgrade = document.createElement('article');
    upgrade.className = 'card wishlist-v2__snapshot-card wishlist-v2__snapshot-card--cta';
    upgrade.innerHTML = `
      <p class="wishlist-v2__snapshot-label">Upgrade</p>
      <p class="wishlist-v2__snapshot-value">Unlock homeowner chat (when a match opts in)</p>
      <p class="section-description">Messaging unlocks after a homeowner approves contact or with Buyer · Pro.</p>
      <button class="primary-button" type="button">Explore plans</button>
    `;
    upgrade.querySelector('button')?.addEventListener('click', () => window.gotoView?.('subscription'));
    snapshot.append(upgrade);
  }

  wrapper.append(snapshot);

  const guardrail = document.createElement('p');
  guardrail.className = 'wishlist-v2__snapshot-note';
  guardrail.textContent = 'Owners choose if/what to share. Counts and scores only until a seller opts in.';
  wrapper.append(guardrail);

  return wrapper;
}

function renderWishlistBody(wishlist) {
  const body = document.createElement('div');
  body.className = 'wishlist-v2__body';

  const main = document.createElement('div');
  main.className = 'wishlist-v2__main';
  main.append(renderWishlistFitCard(wishlist), renderWishlistPrivacyCard());

  const aside = document.createElement('aside');
  aside.className = 'wishlist-v2__aside';
  aside.append(renderBudgetCoachCard(wishlist));

  body.append(main, aside);
  return body;
}

function renderWishlistFitCard(wishlist) {
  const breakdown = computeWishlistFitBreakdown(wishlist);
  const priceGate = breakdown.price === 0 && Number.isFinite(Number(wishlist?.budget?.max));

  const card = document.createElement('article');
  card.className = 'card wishlist-v2__fit-card';
  card.innerHTML = `
    <div class="card-header">
      <div>
        <h3>Fit breakdown</h3>
        <p class="section-description">Weighted scoring used when matching your wishlist to private Home Profiles.</p>
      </div>
    </div>
  `;

  const list = document.createElement('ul');
  list.className = 'wishlist-v2__fit-list';

  [
    { label: 'Location coverage', value: breakdown.location },
    { label: 'Price fit', value: breakdown.price },
    { label: 'Must-have coverage', value: breakdown.mustHave },
    { label: 'Nice-to-have coverage', value: breakdown.niceToHave },
  ].forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="wishlist-v2__fit-label">${item.label}</div>
      <div class="wishlist-v2__fit-bar"><span style="width:${Math.min(100, Math.max(0, item.value * 100))}%;"></span></div>
      <div class="wishlist-v2__fit-score">${formatPercent(item.value)}</div>
    `;
    list.append(li);
  });

  card.append(list);

  if (priceGate) {
    const gate = document.createElement('p');
    gate.className = 'wishlist-v2__fit-gate';
    gate.textContent = 'Price fit is gated because at least one owner expects above your max budget.';
    card.append(gate);
  }

  if (wishlist.analytics?.gap) {
    const gap = document.createElement('p');
    gap.className = 'wishlist-v2__fit-gap';
    gap.textContent = wishlist.analytics.gap;
    card.append(gap);
  }

  if (wishlist.analytics?.trend) {
    const trend = document.createElement('p');
    trend.className = 'wishlist-v2__fit-trend';
    trend.textContent = wishlist.analytics.trend;
    card.append(trend);
  }

  return card;
}

function renderWishlistPrivacyCard() {
  const card = document.createElement('article');
  card.className = 'card wishlist-v2__privacy-card';
  card.innerHTML = `
    <div class="card-header">
      <div>
        <h3>Shared Home Views</h3>
        <p class="section-description">Owners choose what to share and when.</p>
      </div>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'card-body wishlist-v2__privacy-body';

  const list = document.createElement('ul');
  list.className = 'wishlist-v2__privacy-list';

  [
    'When a homeowner shares a Home Profile with you, we notify you and link to a permissioned Shared Home View with only the fields they approved (photos and street address stay masked unless granted).',
    'Chat stays in-app and unlocks only after the owner allows outreach, keeping identities private until both sides agree to connect.'
  ].forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  });

  body.append(list);
  card.append(body);
  return card;
}

function renderBudgetCoachCard(wishlist) {
  const market = wishlist.market ?? {};
  const card = document.createElement('article');
  card.className = 'card wishlist-v2__coach-card';

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <h3>Budget Coach & Trends</h3>
      <p class="section-description">Estimated market range for your wishlist in ${market.area ?? (wishlist.locations?.[0]?.label ?? 'selected areas')}.</p>
    </div>
  `;
  card.append(header);

  const body = document.createElement('div');
  body.className = 'card-body wishlist-v2__coach-body';

  const rangeText = market.estimatedRange
    ? `${formatCurrency(market.estimatedRange.low)} – ${formatCurrency(market.estimatedRange.high)}`
    : 'Range pending more comps.';
  const range = document.createElement('p');
  range.className = 'wishlist-v2__coach-range';
  range.innerHTML = `<span>Estimated range</span> ${rangeText}`;

  const payment = document.createElement('p');
  payment.className = 'wishlist-v2__coach-payment';
  payment.innerHTML = `<span>Payment estimate</span> ${market.paymentEstimate ?? 'Add mortgage inputs to see payments.'}`;

  const trendWrapper = document.createElement('div');
  trendWrapper.className = 'wishlist-v2__coach-trend';

  const trendHeader = document.createElement('div');
  trendHeader.className = 'wishlist-v2__coach-trend-header';
  trendHeader.innerHTML = `<span>12-month trend</span><strong>${market.trend?.change ?? '—'}</strong>`;

  const sparkline = createSparkline(market.trend?.values);
  sparkline.classList.add('wishlist-v2__sparkline');

  const sources = document.createElement('div');
  sources.className = 'wishlist-v2__coach-sources';
  if (Array.isArray(market.sources) && market.sources.length) {
    sources.innerHTML = market.sources.map((source) => `<span class="badge badge--outline">${source}</span>`).join('');
  }

  trendWrapper.append(trendHeader, sparkline, sources);

  const commentary = document.createElement('p');
  commentary.className = 'wishlist-v2__coach-commentary';
  commentary.textContent = market.commentary ?? 'Trend commentary will populate as datasets refresh.';

  body.append(range, payment, trendWrapper, commentary);
  card.append(body);

  return card;
}

function formatBudgetBand(budget = {}) {
  const min = Number(budget?.min);
  const max = Number(budget?.max);
  const hasMin = Number.isFinite(min) && min > 0;
  const hasMax = Number.isFinite(max) && max > 0;
  if (hasMin && hasMax) {
    return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }
  if (hasMin) {
    return `From ${formatCurrency(min)}`;
  }
  if (hasMax) {
    return `Up to ${formatCurrency(max)}`;
  }
  return 'Flexible';
}

function renderWishlistFilterField(label, value) {
  const field = document.createElement('label');
  field.className = 'wishlist-v2__filter-field';
  const title = document.createElement('span');
  title.textContent = label;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value ?? '—';
  input.readOnly = true;
  field.append(title, input);
  return field;
}

function getWishlistStats(wishlist) {
  const stats = wishlist.stats ?? {};
  return {
    matchingHomes: Number.isFinite(stats.matchingHomes) ? stats.matchingHomes : wishlist.matchedProfiles ?? 0,
    topFit: Number.isFinite(stats.topFit) ? stats.topFit : wishlist.topScore ?? 0,
    newMatches: Number.isFinite(stats.newMatches) ? stats.newMatches : 0,
    upgradeEligible: Boolean(stats.upgradeEligible),
  };
}

function computeWishlistFitBreakdown(wishlist) {
  const aggregate = aggregateFitScores(wishlist);
  const base = wishlist.fitBreakdown ?? {};
  const price = computePriceFitScore(wishlist, aggregate.price ?? base.price ?? 0.85);
  return {
    location: base.location ?? aggregate.location ?? 0.75,
    price,
    mustHave: base.mustHave ?? aggregate.mustHave ?? 0.7,
    niceToHave: base.niceToHave ?? aggregate.niceToHave ?? 0.55,
  };
}

function aggregateFitScores(wishlist) {
  const matches = Array.isArray(wishlist.matches) ? wishlist.matches : [];
  if (!matches.length) return {};
  const totals = { location: 0, price: 0, mustHave: 0, niceToHave: 0 };
  matches.forEach((match) => {
    const fit = match.fitBreakdown ?? {};
    if (Number.isFinite(fit.location)) totals.location += fit.location;
    if (Number.isFinite(fit.price)) totals.price += fit.price;
    if (Number.isFinite(fit.mustHave)) totals.mustHave += fit.mustHave;
    if (Number.isFinite(fit.niceToHave)) totals.niceToHave += fit.niceToHave;
  });
  const divisor = matches.length || 1;
  return {
    location: totals.location / divisor,
    price: totals.price / divisor,
    mustHave: totals.mustHave / divisor,
    niceToHave: totals.niceToHave / divisor,
  };
}

function computePriceFitScore(wishlist, fallback = 0.8) {
  const matches = Array.isArray(wishlist.matches) ? wishlist.matches : [];
  const expectations = matches
    .map((match) => Number(match.priceExpectation))
    .filter((value) => Number.isFinite(value));
  const budgetMax = Number(wishlist?.budget?.max);

  if (Number.isFinite(budgetMax) && expectations.some((price) => price > budgetMax)) {
    return 0;
  }

  if (!expectations.length) {
    return fallback;
  }

  const withinBudget = expectations.every((price) => !Number.isFinite(budgetMax) || price <= budgetMax);
  if (!withinBudget) {
    return Math.min(fallback, 0.7);
  }

  return wishlist.fitBreakdown?.price ?? fallback;
}

function createSparkline(values) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sparkline';

  if (!Array.isArray(values) || values.length < 2) {
    const placeholder = document.createElement('p');
    placeholder.className = 'section-description';
    placeholder.textContent = 'Trend data pending.';
    wrapper.append(placeholder);
    return wrapper;
  }

  const width = 180;
  const height = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const lastValue = values[values.length - 1];
  const lastX = width;
  const lastY = height - ((lastValue - min) / range) * height;

  wrapper.innerHTML = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <polyline points="${points}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      <circle cx="${lastX}" cy="${lastY}" r="3" fill="#2563eb" />
    </svg>
  `;

  return wrapper;
}

function getRegionsForWishlist(wishlist) {
  const fallbackLat = 49.2827;
  const fallbackLng = -123.1207;
  const locations = Array.isArray(wishlist.locations) ? wishlist.locations : [];
  return locations.map((location, index) => {
    const region = buyerMapRegions.find((candidate) =>
      location.label?.toLowerCase?.().includes(candidate.label.toLowerCase()),
    );
    if (region) {
      return {
        ...region,
        count: Number.isFinite(location.count) ? location.count : region.count,
        priority: location.priority ?? 1,
      };
    }
    return {
      id: location.id ?? `fallback-${index}`,
      label: location.label ?? `Focus area ${index + 1}`,
      count: Number.isFinite(location.count) ? location.count : 0,
      lat: fallbackLat + index * 0.01,
      lng: fallbackLng - index * 0.01,
      priority: location.priority ?? 1,
    };
  });
}

function initWishlistMap(mapId, wishlist) {
  setTimeout(() => {
    const container = document.getElementById(mapId);
    if (!container) return;

    const regions = getRegionsForWishlist(wishlist).filter(
      (region) => Number.isFinite(region.lat) && Number.isFinite(region.lng),
    );

    if (typeof L === 'undefined' || !regions.length) {
      container.textContent = 'Add areas to visualise coverage.';
      container.classList.add('wishlist-v2__map--empty');
      return;
    }

    const existing = container.dataset.initialised;
    if (existing) return;
    container.dataset.initialised = 'true';

    const centerLat = regions.reduce((sum, region) => sum + region.lat, 0) / regions.length;
    const centerLng = regions.reduce((sum, region) => sum + region.lng, 0) / regions.length;

    const map = L.map(mapId, {
      zoomControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    }).setView([centerLat, centerLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    regions.forEach((region) => {
      const radius = 12 + Math.min(18, (region.count ?? 0) * 0.8);
      const marker = L.circleMarker([region.lat, region.lng], {
        radius,
        color: '#2563eb',
        weight: 2,
        fillColor: '#60a5fa',
        fillOpacity: 0.35,
      }).addTo(map);
      marker.bindTooltip(
        `${region.label}<br>${region.count ?? 0} matched homes` +
          (region.priority ? `<br>Priority ${region.priority}` : ''),
        { permanent: false, direction: 'top' },
      );
    });
  }, 60);
}

function summarizeOwnerExpectation(wishlist, match) {
  const expectation = Number(match.priceExpectation);
  const minBudget = Number(wishlist?.budget?.min);
  const maxBudget = Number(wishlist?.budget?.max);
  if (!Number.isFinite(expectation)) {
    return 'Owner expectation undisclosed';
  }
  if (Number.isFinite(maxBudget) && expectation > maxBudget) {
    return `${formatCurrency(expectation)} · above your ${formatCurrency(maxBudget)} max`;
  }
  if (Number.isFinite(minBudget) && expectation < minBudget) {
    return `${formatCurrency(expectation)} · below your ${formatCurrency(minBudget)} floor`;
  }
  return `${formatCurrency(expectation)} · inside range`;
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
    ? `Matched ${wishlist.matchedProfiles} Home Profiles`
    : 'Archived wishlist';

  const details = node.querySelector('.wishlist-details');
  details.innerHTML = `
    <div>
      <dt>Budget</dt>
      <dd>${formatCurrency(wishlist.budget.min)} - ${formatCurrency(wishlist.budget.max)}</dd>
    </div>
    <div>
      <dt>Home type</dt>
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
      <h2>Review your Wishlist</h2>
      <p class="section-description">Matching homes (owners): count only. Owners choose if/what to share.</p>
    </div>
  `;

  if (!buyer.wishlists.length) {
    section.append(createEmptyState('Create a wishlist to unlock private match insights.'));
    return section;
  }

  const grid = document.createElement('div');
  grid.className = 'analytics-grid';
  buyer.wishlists.forEach((wishlist) => {
    const card = document.createElement('article');
    card.className = 'analytics-card';
    card.innerHTML = `
      <h3>${wishlist.name}</h3>
      <p><strong>Matches:</strong> ${wishlist.analytics.supplyCount} homeowners aligned · Fit range ${wishlist.matchRange}</p>
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
      <p class="section-description">Threads appear when a paid seller or agent contacts you. Conversations stay in-app and anonymised unless you choose to disclose.</p>
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
      <p class="section-description">Counts and fit alerts only — owners decide when to surface property details.</p>
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
  container.className = 'property-profile home-profile';

  const headerSection = createSection({
    title: 'My Homes',
    description: 'See how buyer demand aligns with each Home Profile and keep outreach private until you decide otherwise.',
  });
  container.append(headerSection);

  const home = (homeProfiles || [])[0];

  if (!home) {
    const emptySection = createSection({
      title: 'Home Profile (v2)',
      description: 'Add your home to see real buyer demand. Activating a profile keeps your address private.',
    });
    const emptyBody = document.createElement('div');
    emptyBody.className = 'card-body';
    emptyBody.append(createEmptyState('Add your home to see how many buyers want a place like yours. This does not list your home for sale.'));
    emptySection.append(emptyBody);
    container.append(emptySection);
    return container;
  }

  container.append(
    renderHomeHero(home),
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

function renderSellerMatchesView() {
  const home = (homeProfiles || [])[0];
  if (!home) {
    return createEmptyState('Add a Home Profile to review anonymised buyer matches.');
  }
  const container = document.createElement('div');
  container.className = 'seller-experience';
  container.append(renderBuyerMatchesSection(home));
  return container;
}

function renderSellerInsightsView() {
  const home = (homeProfiles || [])[0];
  if (!home) {
    return createEmptyState('Insights appear once a Home Profile is activated.');
  }
  const container = document.createElement('div');
  container.className = 'seller-experience';
  container.append(
    renderDemandSnapshotSection(home),
    renderWishlistFitSection(home),
    renderFeatureFitSection(home),
    renderDemandMapSection(home),
  );
  return container;
}

function renderSellerBillingView() {
  const wrapper = document.createElement('div');
  wrapper.className = 'seller-experience';
  const section = createSection({
    title: 'Subscriptions & Billing',
    description: 'Manage Seller · Pro upgrades and review invoicing history. Billing data remains private to the owner.',
  });
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-body">
      <p>Seller · Free keeps demand aggregates visible while masking buyers. Upgrade to Seller · Pro to unlock messaging and geo heatmaps.</p>
      <ul class="feature-list">
        <li><strong>Current plan:</strong> Seller · ${state.sellerTier === 'pro' ? 'Pro' : 'Free'}</li>
        <li><strong>Next renewal:</strong> ${new Date().toLocaleDateString()}</li>
        <li><strong>Payment method:</strong> **** 4242 (secured)</li>
      </ul>
      <div class="form-actions">
        <button class="primary-button" type="button">Manage subscription</button>
      </div>
    </div>
  `;
  section.append(card);
  wrapper.append(section, renderSubscriptions());
  return wrapper;
}

function formatHomeArea(home) {
  if (!home) return 'your area';
  if (home.location) {
    const sanitized = home.location.replace(/\s*\(approx\.\)\s*/i, '').trim();
    if (sanitized) return sanitized;
  }
  if (typeof home.address === 'string') {
    const parts = home.address.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts.slice(1).join(', ');
    }
  }
  return 'your area';
}

function renderHomeHero(home) {
  const section = document.createElement('section');
  section.className = 'section property-hero';

  const area = formatHomeArea(home);
  const privacyLine = home?.address ? `Street withheld · ${area}` : area;

  const details = document.createElement('div');
  details.className = 'property-hero__details';

  const header = document.createElement('header');
  header.className = 'property-hero__header';
  const headerText = document.createElement('div');
  headerText.innerHTML = `
    <p class="eyebrow">Home Profile · Seller view</p>
    <h2>Your home at ${area}</h2>
    <p class="section-description">Private by default. Shown to buyers only when you choose.</p>
    <p class="section-description">${privacyLine}</p>
  `;
  const statusBadge = document.createElement('span');
  statusBadge.className = `status-badge ${formatStatusClass(home.status)}`;
  statusBadge.textContent = home.status || 'Home status unavailable';
  header.append(headerText, statusBadge);
  details.append(header);

  const topline = document.createElement('div');
  topline.className = 'property-hero__topline';
  topline.append(
    renderHeroMetric(
      'Price expectation',
      formatCurrency(home.priceExpectation),
      'Used only to match buyer budgets; not a public list price.',
    ),
    renderHeroMetric('Top match %', formatPercent(home?.demandSnapshot?.topMatch ?? home.matchScore, 0)),
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
    { label: 'Home type', value: home.specs?.type || home.type || '—' },
    { label: 'Beds', value: Number.isFinite(home.specs?.beds) ? `${home.specs.beds}` : '—' },
    { label: 'Baths', value: Number.isFinite(home.specs?.baths) ? `${home.specs.baths}` : '—' },
    { label: 'Living area', value: home.specs?.size || '—' },
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
  editButton.textContent = 'Edit home details';
  const shareButton = document.createElement('button');
  shareButton.className = 'ghost-button';
  shareButton.type = 'button';
  shareButton.textContent = canSeeSnippets()
    ? 'Share demand snapshot (no address)'
    : 'Upgrade to share demand snapshot';
  const messageButton = document.createElement('button');
  messageButton.className = 'primary-button';
  messageButton.type = 'button';
  messageButton.textContent = canMessage()
    ? 'Message matched buyers (Pro)'
    : 'Upgrade to message buyers';
  actions.append(editButton, shareButton, messageButton);
  details.append(actions);

  editButton.addEventListener('click', () => openEditHomeModal(home));
  shareButton.addEventListener('click', () => {
    if (!canSeeSnippets()) {
      openUpgradePrompt();
      return;
    }
    openShareModal(home, { mode: 'snapshot' });
  });
  messageButton.addEventListener('click', () => {
    if (!canMessage()) {
      openUpgradePrompt();
      return;
    }
    openChat(home.id, 'Matched buyers');
  });

  const media = document.createElement('figure');
  media.className = 'property-hero__media';
  const img = document.createElement('img');
  img.src = home.heroImage || 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80';
  img.alt = `${home.nickname || 'Home'} primary photo`;
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

function renderHeroMetric(label, value, tooltip) {
  const metric = document.createElement('div');
  metric.className = 'hero-metric';
  const tooltipMarkup = tooltip
    ? ` <span class="tooltip-icon" title="${tooltip}">ⓘ</span>`
    : '';
  metric.innerHTML = `
    <h3>${value ?? '—'}</h3>
    <p class="section-description">${label}${tooltipMarkup}</p>
  `;
  return metric;
}

function renderDemandSnapshotSection(home) {
  const section = document.createElement('section');
  section.className = 'section demand-snapshot';

  const snapshot = home.demandSnapshot || {};
  const matchCount = snapshot.matchCount ?? home.matchedBuyers ?? 0;
  const topMatch = formatPercent(snapshot.topMatch ?? home.matchScore, 0);
  const preapprovedCount = snapshot.preapprovedCount ?? 0;
  const newSince = snapshot.newSince ?? 0;

  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>Demand snapshot</h2>
        <p class="section-description">Your home currently matches ${matchCount} buyers.</p>
        <p class="section-description">Top match: ${topMatch} · Pre-approved: ${preapprovedCount} buyers · New this week: ${newSince}</p>
      </div>
    </div>
  `;

  const ribbon = document.createElement('div');
  ribbon.className = 'upgrade-ribbon';
  ribbon.innerHTML = `
    <span>Unlock buyer profiles and secure chat. Your address stays private.</span>
    <button class="primary-button" type="button">Upgrade</button>
  `;
  ribbon.querySelector('button').addEventListener('click', () => openUpgradePrompt());
  section.querySelector('.section-header')?.append(ribbon);

  const grid = document.createElement('div');
  grid.className = 'kpi-grid';
  grid.append(
    renderKpiTile('Matching Buyers', matchCount),
    renderKpiTile('Top Match %', topMatch),
    renderKpiTile('Pre-approved Buyers', preapprovedCount),
    renderKpiTile('New this week', newSince, { subtext: 'Auto-refreshes nightly' }),
  );
  section.append(grid, createInfoBanner('Snapshot updates within 10 seconds of saving Home Profile changes.'));
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
        <h2>Why your home fits buyer wishlists</h2>
        <p class="section-description">See how location, price expectation, and features power the match score.</p>
      </div>
    </div>
  `;

  const fit = home.wishlistFit || {};
  const grid = document.createElement('div');
  grid.className = 'wishlist-fit__grid';
  grid.append(
    createFitBar('Location fit (highest weight)', fit.location),
    createFitBar('Price fit (gate)', fit.price, 'If your price expectation is above a buyer’s max budget, their match score becomes 0.'),
    createFitBar('Must-haves covered', fit.mustHave, `${formatPercent(fit.mustHave, 0)} of required features met.`),
    createFitBar('Nice-to-haves covered', fit.niceToHave, `${formatPercent(fit.niceToHave, 0)} of optional features hit.`),
  );
  section.append(grid, createInfoBanner('Matching logic: location carries the most weight; price is a gate; features fine-tune the score.', 'muted'));
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
        <p class="section-description">Review who fits your home. Open a row to understand match factors.</p>
      </div>
    </div>
  `;

  if (!canSeeSnippets()) {
    section.append(createInfoBanner('Buyer identities and messaging unlock with Seller · Pro. Aggregated insights remain visible.', 'warning'));
  }

  const matches = Array.isArray(home.buyerMatches) ? home.buyerMatches : [];
  if (!matches.length) {
    section.append(createEmptyState('We’re tracking buyers in your area. Matches will appear as new wishlists align to this home.'));
    return section;
  }

  const table = document.createElement('table');
  table.className = 'matches-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Buyer alias</th>
        <th scope="col">Match %</th>
        <th scope="col">Mortgage</th>
        <th scope="col">Budget fit</th>
        <th scope="col">Timeline</th>
        <th scope="col">Must-have status</th>
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
    const locationLine = match.locationTag ? `<p class="section-description">${match.locationTag}</p>` : '';
    row.innerHTML = `
      <td>
        <div class="match-alias">
          <span>${alias}</span>
          ${match.isNew ? '<span class="chip chip--new">New</span>' : ''}
        </div>
        ${locationLine}
      </td>
      <td><span class="chip ${matchClass}">${formatPercent(match.matchPercent, 0)}</span></td>
      <td><span class="status-dot ${match.preApproved ? 'status-dot--success' : 'status-dot--pending'}">${match.preApproved ? 'Pre-approved' : 'Not yet'}</span></td>
      <td>${describeBudgetAlignment(match, home.priceExpectation)}</td>
      <td>${match.timeline || '—'}</td>
      <td>${summarizeMustHaveStatus(match)}</td>
      <td class="align-right"><button class="ghost-button match-cta" type="button">${canMessage() ? 'Message buyer' : 'Unlock messaging'}</button></td>
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

    detailRow.innerHTML = `<td colspan="7">${detailContent}</td>`;

    const ctaButton = row.querySelector('.match-cta');
    ctaButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!canMessage()) {
        openUpgradePrompt();
      } else {
        openChat(`${home.id}-${match.id}`, alias);
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
  const footerNote = document.createElement('p');
  footerNote.className = 'section-description';
  footerNote.textContent = 'Messaging is in-app and private; you decide what to share.';
  section.append(footerNote);
  return section;
}
function renderFeatureFitSection(home) {
  const section = document.createElement('section');
  section.className = 'section feature-fit';
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h2>What buyers like about your home</h2>
        <p class="section-description">Based on matched buyer must-haves; highlight strengths and address gaps.</p>
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
      if (!item.homeHas) {
        card.classList.add('feature-card--gap');
      }
      const requirePercent = formatPercent(item.requiredPercent ?? 0, 0);
      const insight = item.insight || '';
      const statusLine = item.homeHas
        ? 'Your home: ✓'
        : `Your home: ✗${insight ? ` (${insight})` : ''}`;
      const description = item.homeHas && insight ? `<p class="section-description">${insight}</p>` : '';
      card.innerHTML = `
        <header>
          <h3>${item.feature}</h3>
          <span class="chip ${item.homeHas ? 'chip--high' : 'chip--warning'}">${requirePercent} of matched buyers require</span>
        </header>
        ${description}
        <p class="feature-card__status">${statusLine}</p>
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
        <h2>Where your price expectation sits vs buyer budgets</h2>
        <p class="section-description">Distribution of matched buyers by maximum budget with your expectation overlay.</p>
      </div>
    </div>
  `;

  const buckets = Array.isArray(home.priceBuckets) ? home.priceBuckets : [];
  const histogram = document.createElement('div');
  histogram.className = 'price-histogram';

  if (!buckets.length) {
    const empty = createEmptyState('Budget histogram appears once buyers match this home.');
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
    const minBudget = budgets.length ? Math.min(...budgets, home.priceExpectation || 0) : home.priceExpectation || 0;
    const maxBudget = budgets.length ? Math.max(...budgets, home.priceExpectation || 0) : home.priceExpectation || 0;
    const ratio = maxBudget === minBudget ? 0.5 : ((home.priceExpectation || minBudget) - minBudget) / (maxBudget - minBudget);
    const marker = document.createElement('div');
    marker.className = 'price-histogram__marker';
    marker.style.left = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    marker.innerHTML = `<span>${formatCurrency(home.priceExpectation)} expectation</span>`;
    histogram.append(marker);
  }

  section.append(histogram);

  const sim = home.simulation || {};
  const whatIf = document.createElement('div');
  whatIf.className = 'what-if-panel';
  const heading = document.createElement('h3');
  heading.textContent = 'What-if simulation';
  whatIf.append(heading);
  const intro = document.createElement('p');
  intro.className = 'section-description';
  intro.textContent = 'Try adjusting your price expectation to preview how buyer matches change (no changes saved).';
  whatIf.append(intro);

  const priceRange = sim.priceRange || {};
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = `${priceRange.min ?? Math.round((home.priceExpectation || 0) * 0.9)}`;
  slider.max = `${priceRange.max ?? Math.round((home.priceExpectation || 0) * 1.1)}`;
  slider.step = `${priceRange.step ?? 1000}`;
  slider.value = `${home.priceExpectation || slider.min}`;

  const sliderLabel = document.createElement('label');
  sliderLabel.className = 'what-if-panel__label';
  sliderLabel.textContent = 'Try adjusting your price expectation (preview only)';
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
  const basePrice = home.priceExpectation || price;
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
      description: 'Heatmap of wishlist locations covering this home. Counts remain anonymised.',
      regions: hotspots,
      formatter: (region) => `${region.count || 0} buyer wishlists targeting this area`,
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
      label: 'Edit home details',
      description: 'Keep specs current so the match engine reflects your home accurately.',
      locked: false,
      handler: () => openEditHomeModal(home),
    },
    {
      label: 'Invite / link my agent',
      description: 'Send your agent a demand snapshot without revealing your address.',
      locked: false,
      handler: () => openShareModal(home, { mode: 'agent' }),
    },
    {
      label: 'Message matched buyers (Pro)',
      description: 'Start privacy-first chats with interested buyers right inside the platform.',
      locked: !canMessage(),
      handler: () => {
        if (!canMessage()) {
          openUpgradePrompt();
        } else {
          openChat(home.id, 'Matched buyers');
        }
      },
    },
    {
      label: 'Share demand snapshot (no address)',
      description: 'Generate a shareable view with aggregated demand data only.',
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
  const summary = getHomeMatchSummary(profile);
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

    insightsBtn?.addEventListener('click', () => openHomeInsights(profile));

    if (messageBtn) {
      if (!canMessage()) {
        messageBtn.disabled = true;
        messageBtn.title = 'Upgrade to message buyers';
        messageBtn.addEventListener('click', () => openUpgradePrompt());
        if (upgradeBtn) upgradeBtn.hidden = false;
      } else {
        messageBtn.disabled = false;
        messageBtn.textContent = 'Message matched buyers (Pro)';
        messageBtn.addEventListener('click', () => openChat(profile?.id || 'unknown', 'Matched buyers'));
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
      <button class="ghost-button view-insights">Open Home Profile</button>
      <button class="primary-button contact-buyers">${canMessage() ? 'Message matched buyers (Pro)' : 'Upgrade to message buyers'}</button>
    </footer>
  `;
  const gapsUl = card.querySelector('.property-gaps');
  (summary.gaps || []).forEach(g => { const li = document.createElement('li'); li.textContent = g; gapsUl.appendChild(li); });

  const msgBtn = card.querySelector('.contact-buyers');
  if (!canMessage()) {
    msgBtn.addEventListener('click', () => openUpgradePrompt());
    msgBtn.disabled = false; // keep clickable to show upgrade
    msgBtn.title = 'Upgrade to message buyers';
  } else {
    msgBtn.addEventListener('click', () => openChat(profile?.id || 'unknown', 'Matched buyers'));
  }
  card.querySelector('.view-insights').addEventListener('click', () => openHomeInsights(profile));
  return card;
}

function renderAgentExperience() {
  const section = createSection({
    title: 'Agent Pro analytics',
    description: 'Analyze buyer wishlists and compare private seller Home Profiles. No property advertising occurs here.',
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
        <th>Aligned Home Profiles</th>
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

function renderAgentSegmentsView() {
  const section = createSection({
    title: 'Buyer Segments',
    description: 'Group active demand cohorts without exposing buyer identities.',
  });
  const grid = document.createElement('div');
  grid.className = 'grid grid-2';

  (buyers || []).slice(0, 4).forEach((buyer) => {
    const wishlist = buyer?.wishlists?.[0];
    if (!wishlist) return;
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${wishlist.name}</h3>
          <p class="section-description">${wishlist.summary}</p>
        </div>
        <span class="badge">${wishlist.matchRange}</span>
      </div>
      <div class="card-body">
        <p><strong>Target areas:</strong> ${(wishlist.locations || []).map((loc) => loc.label).join(', ') || 'TBD'}</p>
        <p><strong>Budget band:</strong> ${formatBudgetBand(wishlist.budget)}</p>
        <p><strong>Top match:</strong> ${wishlist.topScore ?? '—'}%</p>
      </div>
    `;
    grid.append(card);
  });

  if (!grid.children.length) {
    grid.append(createEmptyState('Segments populate as buyers publish wishlists.'));
  }

  section.append(grid);
  return section;
}

function renderAgentHomesView() {
  const section = createSection({
    title: 'My Sellers & Homes',
    description: 'Monitor linked Home Profiles with private demand summaries.',
  });
  const grid = document.createElement('div');
  grid.className = 'grid grid-2';

  (homeProfiles || []).forEach((home) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${home.nickname || home.location || 'Home Profile'}</h3>
          <p class="section-description">${home.summary || 'Private home — demand only.'}</p>
        </div>
        <span class="badge">${home.status || 'Inactive'}</span>
      </div>
      <div class="card-body">
        <p><strong>Match count:</strong> ${home?.demandSnapshot?.matchCount ?? home.matchedBuyers ?? 0}</p>
        <p><strong>Top match:</strong> ${formatPercent(home?.demandSnapshot?.topMatch ?? home.matchScore, 0)}</p>
        <p><strong>Area:</strong> ${home.location || home.neighbourhood || 'Private'}</p>
      </div>
      <div class="card-footer">
        <button class="ghost-button" type="button">Open Home Profile</button>
      </div>
    `;
    grid.append(card);
    card.querySelector('button')?.addEventListener('click', () => openHomeInsights(home));
  });

  if (!grid.children.length) {
    grid.append(createEmptyState('Link sellers to surface shared Home Profiles.'));
  }

  section.append(grid);
  return section;
}

function renderAgentBillingView() {
  const wrapper = document.createElement('div');
  wrapper.className = 'agent-billing';
  const section = createSection({
    title: 'Billing & Licenses',
    description: 'Manage Agent · Pro seats and compliance documentation.',
  });
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-body">
      <p>Keep brokerage compliance up to date with one-click CRA/REC forms. Billing statements redact client identities by default.</p>
      <ul class="feature-list">
        <li>Seats active: 4 / 6</li>
        <li>License uploads: BC / ON current</li>
        <li>Next invoice: ${new Date().toLocaleDateString()}</li>
      </ul>
      <div class="form-actions">
        <button class="ghost-button" type="button">Download latest invoice</button>
      </div>
    </div>
  `;
  section.append(card);
  wrapper.append(section, renderSubscriptions());
  return wrapper;
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
        <p>Matched Home Profiles: ${wishlist.matchedProfiles}</p>
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
    options: {
      parking: false,
      outdoor: false,
      pets: false,
      rentalFriendly: false,
      tenure: 'Any',
      age: 'Any',
      floorAreaMin: null,
      floorAreaMax: null,
      lotSizeMin: null,
      yearBuiltMin: null,
    },
    mortgage: { contact: false, documentName: '' },
    locations: [],
    features: { must: [], nice: [] },
    analytics: { supplyCount: 0, gap: 'Analytics pending.', trend: '' },
    active: true,
  };

  baseData.options = {
    parking: false,
    outdoor: false,
    pets: false,
    rentalFriendly: false,
    tenure: 'Any',
    age: 'Any',
    floorAreaMin: null,
    floorAreaMax: null,
    lotSizeMin: null,
    yearBuiltMin: null,
    ...baseData.options,
  };
  if (baseData.details) {
    if (baseData.details.sizeMin && baseData.options.floorAreaMin == null) {
      baseData.options.floorAreaMin = baseData.details.sizeMin;
    }
    if (baseData.details.sizeMax && baseData.options.floorAreaMax == null) {
      baseData.options.floorAreaMax = baseData.details.sizeMax;
    }
  }
  baseData.mortgage = {
    contact: false,
    documentName: '',
    ...baseData.mortgage,
  };

  const wizardState = {
    step: 0,
    data: baseData,
  };

  const steps = [
    {
      title: 'Where',
      description: 'Map-first selection: draw polygons, set radius, or pin postal codes just like REALTOR.ca.',
      render: (container, updateCoach) => renderAreasStep(container, wizardState, updateCoach),
      validate: () => wizardState.data.locations.length > 0,
    },
    {
      title: 'What',
      description: 'Apply familiar MLS-style filters to shape this wishlist. You are saving demand, not advertising a property.',
      render: (container, updateCoach) => renderDetailsStep(container, wizardState, updateCoach),
      validate: (container) => {
        const form = container.querySelector('form');
        if (!form || !form.reportValidity()) return false;
        const formData = new FormData(form);
        wizardState.data.name = formData.get('name').toString().trim();
        wizardState.data.summary = formData.get('summary').toString().trim();
        wizardState.data.details.type = formData.get('type');
        wizardState.data.details.beds = Number(formData.get('beds'));
        wizardState.data.details.baths = Number(formData.get('baths'));
        wizardState.data.budget.min = Number(formData.get('min'));
        wizardState.data.budget.max = Number(formData.get('max'));
        wizardState.data.options.parking = formData.get('parking') === 'on';
        wizardState.data.options.outdoor = formData.get('outdoor') === 'on';
        wizardState.data.options.pets = formData.get('pets') === 'on';
        wizardState.data.options.rentalFriendly = formData.get('rentalFriendly') === 'on';
        wizardState.data.options.tenure = formData.get('tenure');
        wizardState.data.options.age = formData.get('age');
        wizardState.data.options.floorAreaMin = formData.get('floorAreaMin') ? Number(formData.get('floorAreaMin')) : null;
        wizardState.data.options.floorAreaMax = formData.get('floorAreaMax') ? Number(formData.get('floorAreaMax')) : null;
        wizardState.data.options.lotSizeMin = formData.get('lotSizeMin') ? Number(formData.get('lotSizeMin')) : null;
        wizardState.data.options.yearBuiltMin = formData.get('yearBuiltMin') ? Number(formData.get('yearBuiltMin')) : null;
        return wizardState.data.name.length > 0 && wizardState.data.budget.max >= wizardState.data.budget.min;
      },
    },
    {
      title: 'Must-haves vs Nice-to-haves',
      description: 'Toggle features. Must-haves are hard constraints; nice-to-haves boost scoring.',
      render: (container, updateCoach) => renderFeaturesStep(container, wizardState, updateCoach),
      validate: () => true,
    },
    {
      title: 'Timeline & financing',
      description: 'Share closing window and financing readiness. Signals power match quality.',
      render: (container, updateCoach) => renderTimelineStep(container, wizardState, updateCoach),
      validate: (container) => {
        const form = container.querySelector('form');
        if (!form || !form.reportValidity()) return false;
        const formData = new FormData(form);
        wizardState.data.timeline = formData.get('timeline');
        wizardState.data.preApproved = formData.get('preApproved') === 'on';
        wizardState.data.mortgage.contact = formData.get('mortgageOptIn') === 'on';
        const fileInput = form.querySelector('input[name="preApprovalDocument"]');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          wizardState.data.mortgage.documentName = fileInput.files[0].name;
        }
        return true;
      },
    },
    {
      title: 'Review & save',
      description: 'Confirm your buyer wishlist payload. Matches update instantly after you save.',
      render: (container) => renderReviewStep(container, wizardState),
      validate: () => true,
    },
  ];

  const renderWizard = () => {
    modalContent.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'wishlist-wizard';

    const main = document.createElement('div');
    main.className = 'wizard-main';

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
    header.innerHTML = `
      <h3>${currentStep.title}</h3>
      <p class="section-description">${currentStep.description}</p>
      <p class="wishlist-reminder">You are saving a wishlist – buyers share demand, they do not post property ads.</p>
    `;
    container.append(header);

    const body = document.createElement('div');
    const aside = document.createElement('aside');
    aside.className = 'wizard-coach';
    const updateCoach = () => renderBudgetCoach(aside, wizardState);
    currentStep.render(body, updateCoach);
    container.append(body);

    const actions = document.createElement('div');
    actions.className = 'form-actions wizard-actions';

    const secondaryButton = document.createElement('button');
    secondaryButton.type = 'button';
    secondaryButton.className = 'ghost-button';
    secondaryButton.textContent = wizardState.step === 0 ? 'Cancel' : 'Back';
    secondaryButton.addEventListener('click', () => {
      if (wizardState.step === 0) {
        modal.close();
        return;
      }
      wizardState.step -= 1;
      renderWizard();
    });
    actions.append(secondaryButton);

    const primaryButton = document.createElement('button');
    primaryButton.type = 'button';
    primaryButton.className = 'primary-button';
    primaryButton.textContent = wizardState.step === steps.length - 1 ? 'Save wishlist' : 'Next';
    primaryButton.addEventListener('click', () => {
      const current = steps[wizardState.step];
      const containerNode = main.querySelector('.wizard-step');
      if (!current.validate(containerNode)) {
        containerNode?.querySelector('form')?.reportValidity();
        return;
      }
      if (wizardState.step === steps.length - 1) {
        saveWishlist(wizardState.data);
        return;
      }
      wizardState.step += 1;
      renderWizard();
    });
    actions.append(primaryButton);

    main.append(progress, container, actions);

    renderBudgetCoach(aside, wizardState);
    layout.append(main, aside);

    modalContent.append(layout);
  };

  const renderAreasStep = (container, state, updateCoach) => {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'map-shell';

    const mapCanvas = document.createElement('div');
    mapCanvas.className = 'map-canvas';
    mapCanvas.innerHTML = `
      <div class="map-canvas__overlay">
        <p class="map-canvas__hint">Draw areas just like REALTOR.ca. Double-click the map to drop your selection.</p>
        <div class="draw-tools">
          <button type="button" data-tool="polygon" class="ghost-button">Polygon</button>
          <button type="button" data-tool="radius" class="ghost-button">Radius</button>
          <button type="button" data-tool="pin" class="ghost-button">Pin</button>
        </div>
      </div>
    `;

    const controls = document.createElement('div');
    controls.className = 'map-controls';
    controls.innerHTML = `
      <label class="search-label">Add an area to your wishlist
        <input type="search" name="areaSearch" placeholder="City, postal code, neighbourhood" list="wishlist-area-suggest" />
      </label>
      <datalist id="wishlist-area-suggest">
        ${buyerMapRegions.map((region) => `<option value="${region.label}">${region.label}</option>`).join('')}
        <option value="Kitsilano"></option>
        <option value="Mount Pleasant"></option>
      </datalist>
      <button class="primary-button" type="button" id="add-area-btn">Add to wishlist map</button>
    `;

    wrapper.append(mapCanvas, controls);
    container.append(wrapper);

    const list = document.createElement('ul');
    list.className = 'area-list editable';

    const renderList = () => {
      list.innerHTML = '';
      if (!state.data.locations.length) {
        const empty = document.createElement('li');
        empty.textContent = 'No areas added yet. Draw on the map or add areas to build your wishlist coverage.';
        list.append(empty);
        return;
      }

      state.data.locations.forEach((location, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="area-type">${location.type}</span>
          <strong>${location.label}</strong>
          <span class="area-priority">Priority ${location.priority}</span>
        `;
        const priorityInput = document.createElement('input');
        priorityInput.type = 'number';
        priorityInput.min = '1';
        priorityInput.max = '5';
        priorityInput.value = location.priority ?? 1;
        priorityInput.className = 'priority-input';
        priorityInput.addEventListener('change', (event) => {
          location.priority = Number(event.target.value);
          updateCoach();
        });

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ghost-button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          state.data.locations.splice(index, 1);
          renderList();
          updateCoach();
        });

        const toolbar = document.createElement('div');
        toolbar.className = 'area-toolbar';
        toolbar.append(priorityInput, remove);
        li.append(toolbar);
        list.append(li);
      });
    };

    const addArea = (label, type) => {
      if (!label) return;
      const typeValue = type || 'polygon';
      state.data.locations.push({
        id: generateId('loc'),
        type: typeValue,
        label,
        value: `${typeValue}-${label.toLowerCase().replace(/\s+/g, '-')}`,
        priority: state.data.locations.length + 1,
        count: Math.floor(Math.random() * 8) + 4,
      });
      renderList();
      updateCoach();
    };

    let activeTool = 'polygon';
    mapCanvas.querySelectorAll('button[data-tool]')?.forEach((button) => {
      button.addEventListener('click', () => {
        activeTool = button.dataset.tool || 'polygon';
        mapCanvas.querySelectorAll('button[data-tool]').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
    mapCanvas.querySelector('button[data-tool="polygon"]')?.classList.add('active');

    mapCanvas.addEventListener('dblclick', () => {
      const input = controls.querySelector('input[name="areaSearch"]');
      const value = input?.value.trim();
      if (value) {
        addArea(value, activeTool);
        if (input) input.value = '';
      }
    });

    controls.querySelector('#add-area-btn')?.addEventListener('click', () => {
      const input = controls.querySelector('input[name="areaSearch"]');
      addArea(input?.value.trim(), activeTool);
      if (input) input.value = '';
    });

    container.append(list);
    renderList();
  };

  const renderDetailsStep = (container, state, updateCoach) => {
    const form = document.createElement('form');
    form.className = 'form-grid form-grid--wide';
    form.innerHTML = `
      <fieldset class="fieldset">
        <legend>Wishlist identity</legend>
        <label>Wishlist title
          <input name="name" required value="${state.data.name ?? ''}" placeholder="e.g., Kitsilano family home" />
        </label>
        <label>Short description (appears to sellers)
          <input name="summary" value="${state.data.summary ?? ''}" placeholder="e.g., 3-bed home with workspace" />
        </label>
      </fieldset>
      <fieldset class="fieldset">
        <legend>Core filters</legend>
        <label>Property type
          <select name="type">
            ${['Detached house', 'Townhome', 'Condo', 'Duplex', 'Acreage']
              .map((option) => `<option value="${option}" ${state.data.details.type === option ? 'selected' : ''}>${option}</option>`)
              .join('')}
          </select>
        </label>
        <label>Bedrooms
          <input type="number" min="0" name="beds" value="${state.data.details.beds}" />
        </label>
        <label>Bathrooms
          <input type="number" min="0" name="baths" value="${state.data.details.baths}" />
        </label>
        <label>Budget minimum
          <input type="number" min="0" name="min" value="${state.data.budget.min || ''}" required />
        </label>
        <label>Budget maximum
          <input type="number" min="0" name="max" value="${state.data.budget.max || ''}" required />
        </label>
      </fieldset>
      <fieldset class="fieldset">
        <legend>Options</legend>
        <label class="checkbox-label"><input type="checkbox" name="parking" ${state.data.options.parking ? 'checked' : ''} /> Parking (garage or stall)</label>
        <label class="checkbox-label"><input type="checkbox" name="outdoor" ${state.data.options.outdoor ? 'checked' : ''} /> Outdoor space</label>
        <label class="checkbox-label"><input type="checkbox" name="pets" ${state.data.options.pets ? 'checked' : ''} /> Pet friendly</label>
        <label class="checkbox-label"><input type="checkbox" name="rentalFriendly" ${state.data.options.rentalFriendly ? 'checked' : ''} /> Rental-friendly</label>
        <label>Tenure preference
          <select name="tenure">
            ${['Any', 'Freehold', 'Strata', 'Leasehold']
              .map((option) => `<option value="${option}" ${state.data.options.tenure === option ? 'selected' : ''}>${option}</option>`)
              .join('')}
          </select>
        </label>
        <label>Age of home
          <select name="age">
            ${['Any', '0-5 years', '5-15 years', '15+ years']
              .map((option) => `<option value="${option}" ${state.data.options.age === option ? 'selected' : ''}>${option}</option>`)
              .join('')}
          </select>
        </label>
      </fieldset>
      <details class="advanced-filters" ${state.data.options.floorAreaMin || state.data.options.floorAreaMax || state.data.options.lotSizeMin || state.data.options.yearBuiltMin ? 'open' : ''}>
        <summary>Advanced filters (optional)</summary>
        <div class="advanced-grid">
          <label>Min floor area (sqft)
            <input type="number" min="0" name="floorAreaMin" value="${state.data.options.floorAreaMin ?? ''}" />
          </label>
          <label>Max floor area (sqft)
            <input type="number" min="0" name="floorAreaMax" value="${state.data.options.floorAreaMax ?? ''}" />
          </label>
          <label>Lot size minimum (sqft)
            <input type="number" min="0" name="lotSizeMin" value="${state.data.options.lotSizeMin ?? ''}" />
          </label>
          <label>Earliest year built
            <input type="number" min="1900" max="${new Date().getFullYear()}" name="yearBuiltMin" value="${state.data.options.yearBuiltMin ?? ''}" />
          </label>
        </div>
      </details>
    `;

    const syncState = () => {
      const formData = new FormData(form);
      state.data.name = formData.get('name').toString().trim();
      state.data.summary = formData.get('summary').toString().trim();
      state.data.details.type = formData.get('type');
      state.data.details.beds = Number(formData.get('beds'));
      state.data.details.baths = Number(formData.get('baths'));
      state.data.budget.min = Number(formData.get('min'));
      state.data.budget.max = Number(formData.get('max'));
      state.data.options.parking = formData.get('parking') === 'on';
      state.data.options.outdoor = formData.get('outdoor') === 'on';
      state.data.options.pets = formData.get('pets') === 'on';
      state.data.options.rentalFriendly = formData.get('rentalFriendly') === 'on';
      state.data.options.tenure = formData.get('tenure');
      state.data.options.age = formData.get('age');
      state.data.options.floorAreaMin = formData.get('floorAreaMin') ? Number(formData.get('floorAreaMin')) : null;
      state.data.options.floorAreaMax = formData.get('floorAreaMax') ? Number(formData.get('floorAreaMax')) : null;
      state.data.options.lotSizeMin = formData.get('lotSizeMin') ? Number(formData.get('lotSizeMin')) : null;
      state.data.options.yearBuiltMin = formData.get('yearBuiltMin') ? Number(formData.get('yearBuiltMin')) : null;
      updateCoach();
    };

    form.addEventListener('input', syncState);
    form.addEventListener('change', syncState);

    container.append(form);
  };

  const renderFeaturesStep = (container, state, updateCoach) => {
    const catalogue = [
      'EV-ready parking',
      'Dedicated office',
      'Outdoor space',
      'Secondary suite',
      'Pet-friendly building',
      'Transit within 10 min',
      'Rental flexibility',
      'Rooftop deck',
      'Private backyard',
      'Wheelchair accessible',
      'Pool or spa',
    ];
    const mustSet = new Set(state.data.features.must);
    const niceSet = new Set(state.data.features.nice);
    [...mustSet, ...niceSet].forEach((feature) => {
      if (feature && !catalogue.includes(feature)) {
        catalogue.push(feature);
      }
    });

    const featureGrid = document.createElement('div');
    featureGrid.className = 'feature-catalogue';

    const summary = document.createElement('div');
    summary.className = 'feature-summary';
    summary.innerHTML = `
      <article>
        <h4>Must-haves</h4>
        <ul class="pill-list"></ul>
      </article>
      <article>
        <h4>Nice-to-haves</h4>
        <ul class="pill-list"></ul>
      </article>
    `;
    const [mustList, niceList] = summary.querySelectorAll('.pill-list');

    const renderSummary = () => {
      mustList.innerHTML = state.data.features.must.length
        ? state.data.features.must.map((item) => `<li>${item}</li>`).join('')
        : '<li>No must-haves yet.</li>';
      niceList.innerHTML = state.data.features.nice.length
        ? state.data.features.nice.map((item) => `<li>${item}</li>`).join('')
        : '<li>No nice-to-haves yet.</li>';
      updateCoach();
    };

    const toggleFeature = (feature, bucket) => {
      if (bucket === 'must') {
        if (mustSet.has(feature)) {
          mustSet.delete(feature);
        } else {
          mustSet.add(feature);
          niceSet.delete(feature);
        }
      } else if (bucket === 'nice') {
        if (niceSet.has(feature)) {
          niceSet.delete(feature);
        } else {
          niceSet.add(feature);
          mustSet.delete(feature);
        }
      }
      state.data.features.must = Array.from(mustSet);
      state.data.features.nice = Array.from(niceSet);
      renderCatalogue();
      renderSummary();
    };

    const renderCatalogue = () => {
      featureGrid.innerHTML = '';
      catalogue.forEach((feature) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.innerHTML = `
          <span class="feature-label">${feature}</span>
          <div class="feature-actions">
            <button type="button" data-bucket="must" class="feature-btn ${mustSet.has(feature) ? 'active' : ''}">Must-have</button>
            <button type="button" data-bucket="nice" class="feature-btn ${niceSet.has(feature) ? 'active' : ''}">Nice-to-have</button>
          </div>
        `;
        card.querySelectorAll('.feature-btn').forEach((button) => {
          button.addEventListener('click', () => toggleFeature(feature, button.dataset.bucket));
        });
        featureGrid.append(card);
      });
    };

    const customForm = document.createElement('form');
    customForm.className = 'feature-custom';
    customForm.innerHTML = `
      <label>Add custom requirement
        <input type="text" name="customFeature" placeholder="e.g., Garden-level suite" />
      </label>
      <div class="feature-custom__actions">
        <button type="submit" class="ghost-button" data-target="must">Add as must-have</button>
        <button type="submit" class="ghost-button" data-target="nice">Add as nice-to-have</button>
      </div>
    `;

    let submitTarget = 'must';
    customForm.querySelectorAll('button[data-target]').forEach((button) => {
      button.addEventListener('click', (event) => {
        submitTarget = button.dataset.target;
      });
    });

    customForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = customForm.querySelector('input[name="customFeature"]');
      const value = input.value.trim();
      if (!value) return;
      if (!catalogue.includes(value)) catalogue.push(value);
      toggleFeature(value, submitTarget);
      input.value = '';
    });

    container.append(featureGrid, summary, customForm);
    renderCatalogue();
    renderSummary();
  };

  const renderTimelineStep = (container, state, updateCoach) => {
    const form = document.createElement('form');
    form.className = 'form-grid';
    form.innerHTML = `
      <label>Move-in timeframe
        <select name="timeline">
          ${['0-3m', '3-6m', '6-12m', '>12m']
            .map((option) => `<option value="${option}" ${state.data.timeline === option ? 'selected' : ''}>${option}</option>`)
            .join('')}
        </select>
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="preApproved" ${state.data.preApproved ? 'checked' : ''} /> Display mortgage pre-approval badge
      </label>
      <label>Upload pre-approval proof (optional)
        <input type="file" name="preApprovalDocument" accept="application/pdf,image/*" />
        ${state.data.mortgage.documentName ? `<span class="file-hint">Current file: ${state.data.mortgage.documentName}</span>` : ''}
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="mortgageOptIn" ${state.data.mortgage.contact ? 'checked' : ''} /> Yes, have a mortgage coach contact me
      </label>
      <p class="section-description">Financing signals stay private. Sellers only see badges such as “Pre-approved buyer”.</p>
    `;

    const syncState = () => {
      const formData = new FormData(form);
      state.data.timeline = formData.get('timeline');
      state.data.preApproved = formData.get('preApproved') === 'on';
      state.data.mortgage.contact = formData.get('mortgageOptIn') === 'on';
      const fileInput = form.querySelector('input[name="preApprovalDocument"]');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        state.data.mortgage.documentName = fileInput.files[0].name;
        const hint = form.querySelector('.file-hint');
        if (hint) {
          hint.textContent = `Current file: ${state.data.mortgage.documentName}`;
        } else {
          const label = fileInput.parentElement;
          if (label) {
            const span = document.createElement('span');
            span.className = 'file-hint';
            span.textContent = `Current file: ${state.data.mortgage.documentName}`;
            label.append(span);
          }
        }
      }
      updateCoach();
    };

    form.addEventListener('change', syncState);
    form.addEventListener('input', syncState);

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
      name: state.data.name,
      summary: state.data.summary,
      locations: state.data.locations.map((location, index) => ({
        type: location.type,
        value: location.value,
        priority: location.priority ?? index + 1,
      })),
      budget: state.data.budget,
      timeline: state.data.timeline,
      preApproved: state.data.preApproved,
      details: {
        type: state.data.details.type.toLowerCase().includes('condo')
          ? 'condo'
          : state.data.details.type.toLowerCase().includes('town')
            ? 'townhouse'
            : 'house',
        beds: state.data.details.beds,
        baths: state.data.details.baths,
        sizeMin: state.data.options.floorAreaMin ?? state.data.details.sizeMin,
        sizeMax: state.data.options.floorAreaMax ?? state.data.details.sizeMax,
      },
      options: state.data.options,
      features: state.data.features,
      mortgage: state.data.mortgage,
      visibility: 'public',
    };

    container.innerHTML = `
      <div class="review-grid">
        <article class="analytics-card">
          <h3>Match summary</h3>
          <p><strong>${summary.matches}</strong> Home Profiles meet your constraints.</p>
          <p><strong>${summary.topScore}%</strong> top match score · ${summary.matchRange} band.</p>
          <p>${summary.gapHint}</p>
          <p>${summary.trend}</p>
        </article>
        <article class="analytics-card">
          <h3>Wishlist recap</h3>
          <p><strong>${state.data.name || 'Untitled wishlist'}</strong></p>
          <p>${state.data.summary || 'Add a short description to help sellers recognise your household.'}</p>
          <p>Areas: ${state.data.locations.map((loc) => loc.label).join(', ') || 'Add at least one area to publish.'}</p>
          <p>Budget: ${formatCurrency(state.data.budget.min)} – ${formatCurrency(state.data.budget.max)}</p>
          <p>Type: ${state.data.details.type} · ${state.data.details.beds} bed / ${state.data.details.baths} bath</p>
          <p>Timeline: ${state.data.timeline} · Pre-approved: ${state.data.preApproved ? 'Yes' : 'No'}</p>
          <p>Must-haves: ${state.data.features.must.join(', ') || '—'}</p>
          <p>Nice-to-haves: ${state.data.features.nice.join(', ') || '—'}</p>
        </article>
        <article class="analytics-card">
          <h3>Normalised payload</h3>
          <pre class="payload-preview">${JSON.stringify(payload, null, 2)}</pre>
        </article>
      </div>
      <p class="section-description emphasise">Saving publishes your wishlist to sellers – no property ads are posted, only demand.</p>
    `;
  };

  const renderBudgetCoach = (container, state) => {
    const insights = calculateBudgetCoach(state.data);
    container.innerHTML = `
      <h3>Budget Coach</h3>
      <p class="section-description">Live affordability context for your chosen areas.</p>
      <dl class="coach-metrics">
        <div>
          <dt>Benchmark price</dt>
          <dd>${formatCurrency(insights.benchmark)}</dd>
        </div>
        <div>
          <dt>Your midpoint</dt>
          <dd>${insights.midpoint ? formatCurrency(insights.midpoint) : '—'}</dd>
        </div>
        <div>
          <dt>Coverage</dt>
          <dd>${insights.coverage}</dd>
        </div>
      </dl>
      <p>${insights.message}</p>
      <p class="section-description">${insights.timelineCopy}</p>
    `;
  };

  const calculateBudgetCoach = (data) => {
    const locations = Array.isArray(data.locations) ? data.locations : [];
    const typeLabel = data.details?.type || 'House';
    const typeKey = typeLabel.toLowerCase().includes('condo')
      ? 'condo'
      : typeLabel.toLowerCase().includes('town')
        ? 'townhouse'
        : 'house';

    const resolvedBenchmarks = locations.map((location) => {
      const matchKey = Object.keys(budgetBenchmarks).find((key) =>
        location.label?.toLowerCase().includes(key.toLowerCase())
      );
      const table = budgetBenchmarks[matchKey] || budgetBenchmarks.Default;
      return table[typeKey] ?? budgetBenchmarks.Default[typeKey];
    });

    const benchmark = resolvedBenchmarks.length
      ? Math.round(resolvedBenchmarks.reduce((sum, value) => sum + value, 0) / resolvedBenchmarks.length)
      : budgetBenchmarks.Default[typeKey];

    const midpoint = Number.isFinite(Number(data.budget?.min)) && Number.isFinite(Number(data.budget?.max))
      ? Math.round((Number(data.budget.min) + Number(data.budget.max)) / 2)
      : 0;

    let message;
    if (!midpoint) {
      message = 'Add a budget range to see how it compares with regional benchmarks.';
    } else if (midpoint > benchmark + 50000) {
      message = `You're targeting about ${formatCurrency(midpoint - benchmark)} above local benchmarks. Expect premium matches.`;
    } else if (midpoint < benchmark - 50000) {
      message = `Your midpoint is roughly ${formatCurrency(benchmark - midpoint)} under benchmark. Consider widening areas or preparing for competitive offers.`;
    } else {
      message = 'Your midpoint sits in line with benchmark pricing. Match coverage should feel strong.';
    }

    const coverage = resolvedBenchmarks.length
      ? `${locations.length} area${locations.length === 1 ? '' : 's'} mapped`
      : 'Add areas to unlock coverage stats.';

    const timelineCopy = data.preApproved
      ? `Pre-approval badge on. Sellers see you as finance-ready for a ${data.timeline} move.`
      : `No pre-approval badge yet. Adding one can lift confidence for a ${data.timeline} move.`;

    return { benchmark, midpoint, coverage, message, timelineCopy };
  };

  const saveWishlist = (data) => {
    const buyer = buyers.find((b) => b.id === state.buyerId);
    const clone = safeStructuredClone(data);
    if (clone.details) {
      clone.details.sizeMin = clone.options?.floorAreaMin ?? clone.details.sizeMin ?? null;
      clone.details.sizeMax = clone.options?.floorAreaMax ?? clone.details.sizeMax ?? null;
    }
    const existingIndex = buyer.wishlists.findIndex((w) => w.id === clone.id);
    if (existingIndex >= 0) {
      buyer.wishlists.splice(existingIndex, 1, clone);
    } else {
      buyer.wishlists.unshift(clone);
    }
    state.selectedWishlistId = clone.id;
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
  state.selectedWishlistId = clone.id;
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

function openEditHomeModal(home) {
  modalTitle.textContent = 'Edit home details';
  modalContent.innerHTML = `
    <form class="form-grid">
      <label>
        <span>Price expectation</span>
        <input type="number" value="${home.priceExpectation || ''}" />
      </label>
      <label>
        <span>Home status</span>
        <select>
          ${['Not for sale', 'Open to offers', 'Under contract (inactive)']
            .map((status) => `<option value="${status}" ${status === home.status ? 'selected' : ''}>${status}</option>`)
            .join('')}
        </select>
      </label>
      <label>
        <span>Headline summary</span>
        <textarea rows="3">${home.summary || ''}</textarea>
      </label>
      <p class="section-description">Saving updates your Home Profile and refreshes the demand snapshot within 10 seconds.</p>
      <div class="form-actions">
        <button class="ghost-button" type="button" id="cancel-edit-home">Cancel</button>
        <button class="primary-button" type="submit">Save changes</button>
      </div>
    </form>
  `;
  modalContent.querySelector('#cancel-edit-home')?.addEventListener('click', () => modal.close());
  modalContent.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    modal.close();
  });
  modal.showModal();
}

function openShareModal(home, { mode } = {}) {
  const shareMode = mode || 'agent';
  const isSnapshot = shareMode === 'snapshot';
  modalTitle.textContent = isSnapshot ? 'Share demand snapshot (no address)' : 'Share with agent';
  const urlFragment = `${home.id}-${shareMode}`;
  const shareUrl = `https://reach.example.com/share/${urlFragment}`;
  modalContent.innerHTML = `
    <div class="form-grid">
      <p>${isSnapshot
        ? 'Generate a read-only view of buyer demand with masked data. Recipients see aggregates but no PII.'
        : 'Invite an agent to collaborate on this Home Profile. They will see anonymised demand data.'}</p>
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

function openAgentSegmentModal() {
  modalTitle.textContent = 'Create buyer segment';
  modalContent.innerHTML = `
    <form class="form-grid" id="segment-form">
      <label>Segment name
        <input type="text" name="name" required placeholder="Downtown upsizers" />
      </label>
      <label>Target budget
        <input type="text" name="budget" placeholder="$950k – $1.2M" />
      </label>
      <label>Focus areas
        <textarea name="areas" rows="3" placeholder="False Creek, Port Moody, Kitsilano"></textarea>
      </label>
      <div class="form-actions">
        <button class="ghost-button" type="button" id="cancel-segment">Cancel</button>
        <button class="primary-button" type="submit">Save segment</button>
      </div>
    </form>
  `;
  modalContent.querySelector('#cancel-segment')?.addEventListener('click', () => modal.close());
  modalContent.querySelector('#segment-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    modal.close();
  });
  modal.showModal();
}

function openHomeInsights(profile) {
  const snapshot = profile.demandSnapshot || {};
  const fit = profile.wishlistFit || {};
  modalTitle.textContent = `${profile.nickname || 'Home Profile'} · Demand insights`;

  modalContent.innerHTML = `
    <div class="form-grid">
      <article class="analytics-card">
        <h3>Demand snapshot</h3>
        <p><strong>${snapshot.matchCount ?? profile.matchedBuyers ?? 0}</strong> matching buyers</p>
        <p><strong>${formatPercent(snapshot.topMatch ?? profile.matchScore, 0)}</strong> top match %</p>
        <p><strong>${snapshot.preapprovedCount ?? 0}</strong> pre-approved buyers</p>
      </article>
      <article class="analytics-card">
        <h3>Wishlist fit</h3>
        <ul>
          <li>Location: ${formatPercent(fit.location, 0)}</li>
          <li>Price expectation: ${formatPercent(fit.price, 0)} (gate)</li>
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
          <button class="${canSeeSnippets() ? 'ghost-button' : 'primary-button'}" type="button">${canSeeSnippets() ? 'Close' : 'Upgrade to message buyers'}</button>
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
              <span style="color: #1d4ed8; font-weight: bold;">${region.count} buyer wishlists active</span>
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
    return `Above buyer max (${formatCurrency(max)}) · match gated`;
  }
  if (Number.isFinite(min) && price < min) {
    return `Below buyer minimum (${formatCurrency(min)})`;
  }
  if (Number.isFinite(max)) {
    return `${formatCurrency(price)} within ${formatCurrency(max)} max`;
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
  (Array.isArray(homeProfiles) ? homeProfiles : []).forEach((profile) => {
    const card = renderPropertyCard(profile);
    container.appendChild(card);
  });
}
