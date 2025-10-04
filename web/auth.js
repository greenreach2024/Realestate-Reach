// Lightweight auth state + forms for Buyer, Seller, Agent, Mortgage roles
// No PII stored; this is a front-end demo of role-based UX flows.

export const AUTH_ROLES = ["buyer", "seller", "agent", "mortgage"];

const storageKey = "rr_demo_auth";

export const auth = {
  get state() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  },
  signIn(email, role) {
    const next = { email, role, token: `demo-${role}-${Date.now()}` };
    localStorage.setItem(storageKey, JSON.stringify(next));
    renderAuthActions();
    return next;
  },
  signOut() {
    localStorage.removeItem(storageKey);
    renderAuthActions();
  },
};

// Modal-based quick auth (used by inline buttons and Messages view)
export function openAuthModal(mode = 'login') {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  if (!modal || !modalTitle || !modalContent) {
    // Fallback to dedicated views if modal isn't present
    window.gotoView?.(mode === 'register' ? 'register' : 'login');
    return;
  }

  if (mode === 'register') {
    modalTitle.textContent = 'Create account';
    modalContent.innerHTML = `
      <form class="form-grid" id="quick-register">
        <label>Email<input name="email" type="email" required placeholder="you@example.com"/></label>
        <label>Role
          <select name="role">${AUTH_ROLES.map((r) => `<option value="${r}">${r}</option>`).join('')}</select>
        </label>
        <label class="checkbox-label"><input type="checkbox" name="terms" required/> I agree to the Terms</label>
        <div class="form-actions"><button class="primary-button" type="submit">Create account</button></div>
      </form>
    `;
    modalContent.querySelector('#quick-register')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const email = String(f.get('email'));
      const role = String(f.get('role'));
      if (!email || !role) return;
      auth.signIn(email, role);
      modal.close();
      window.authComplete?.(role);
    });
  } else {
    modalTitle.textContent = 'Sign in';
    modalContent.innerHTML = `
      <form class="form-grid" id="quick-login">
        <label>Email<input name="email" type="email" required placeholder="you@example.com"/></label>
        <label>Role
          <select name="role">${AUTH_ROLES.map((r) => `<option value="${r}">${r}</option>`).join('')}</select>
        </label>
        <label>Password<input name="password" type="password" required minlength="6"/></label>
        <div class="form-actions">
          <button class="primary-button" type="submit">Sign in</button>
          <button class="ghost-button" type="button" id="to-register">Create account</button>
        </div>
      </form>
    `;
    modalContent.querySelector('#quick-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const email = String(f.get('email'));
      const role = String(f.get('role'));
      if (!email || !role) return;
      auth.signIn(email, role);
      modal.close();
      window.authComplete?.(role);
    });
    modalContent.querySelector('#to-register')?.addEventListener('click', () => openAuthModal('register'));
  }

  modal.showModal();
}

export function renderLoginPage() {
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="section-header">
      <h2>Sign in</h2>
      <p class="section-description">Access your role experience and anonymized messaging.</p>
    </div>
    <article class="card">
      <form class="form-grid" id="login-form">
        <label>Email
          <input name="email" type="email" required placeholder="you@example.com" />
        </label>
        <label>Role
          <select name="role">
            ${AUTH_ROLES.map((r) => `<option value="${r}">${r}</option>`).join('')}
          </select>
        </label>
        <label>Password
          <input name="password" type="password" required minlength="6" />
        </label>
        <div class="form-actions">
          <button class="primary-button" type="submit">Sign in</button>
          <button class="ghost-button" type="button" id="goto-register">Create account</button>
        </div>
      </form>
    </article>
  `;

  section.querySelector('#login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const role = String(fd.get('role'));
    auth.signIn(email, role);
    window.authComplete?.(role);
  });
  section.querySelector('#goto-register')?.addEventListener('click', () => window.gotoView?.('register'));
  return section;
}

export function renderRegistrationPage() {
  // Multi-step wizard using existing CSS (.wizard-progress, .wizard-step)
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="section-header">
      <h2>Create your account</h2>
      <p class="section-description">Standard registration with role selection. No PII is published; messaging is anonymized.</p>
    </div>
  `;

  const wizard = { step: 0, data: { email: '', password: '', role: 'buyer', terms: false, marketing: false } };
  const steps = [
    {
      title: 'Email & password',
      render: () => `
        <form class="form-grid" id="reg-step-1">
          <label>Email<input name="email" type="email" required placeholder="you@example.com" value="${wizard.data.email}"/></label>
          <label>Password<input name="password" type="password" required minlength="6"/></label>
        </form>
      `,
      collect: (root) => {
        const f = new FormData(root.querySelector('#reg-step-1'));
        wizard.data.email = String(f.get('email'));
        wizard.data.password = String(f.get('password'));
        return wizard.data.email && wizard.data.password.length >= 6;
      },
    },
    {
      title: 'Choose your role',
      render: () => `
        <form class="form-grid" id="reg-step-2">
          <label>Role
            <select name="role">${AUTH_ROLES.map((r) => `<option value="${r}" ${wizard.data.role===r?'selected':''}>${r}</option>`).join('')}</select>
          </label>
        </form>
      `,
      collect: (root) => {
        const f = new FormData(root.querySelector('#reg-step-2'));
        wizard.data.role = String(f.get('role'));
        return true;
      },
    },
    {
      title: 'Consent & preferences',
      render: () => `
        <form class="form-grid" id="reg-step-3">
          <label class="checkbox-label"><input type="checkbox" name="terms" required/> I agree to the Terms</label>
          <label class="checkbox-label"><input type="checkbox" name="marketing"/> Email me updates (optional)</label>
        </form>
      `,
      collect: (root) => {
        const form = root.querySelector('#reg-step-3');
        if (!form.reportValidity()) return false;
        const f = new FormData(form);
        wizard.data.terms = f.get('terms') === 'on';
        wizard.data.marketing = f.get('marketing') === 'on';
        return wizard.data.terms;
      },
    },
  ];

  const progress = document.createElement('ol');
  progress.className = 'wizard-progress';
  const container = document.createElement('div');
  container.className = 'wizard-step';
  const actions = document.createElement('div');
  actions.className = 'form-actions wizard-actions';

  const render = () => {
    progress.innerHTML = steps
      .map((s, i) => `<li class="${i===wizard.step?'active':i<wizard.step?'complete':''}">${i+1}. ${s.title}</li>`) 
      .join('');
    container.innerHTML = `<header><h3>${steps[wizard.step].title}</h3></header><div class="wizard-body">${steps[wizard.step].render()}</div>`;
    actions.innerHTML = '';
    if (wizard.step > 0) {
      const back = document.createElement('button');
      back.type = 'button'; back.className = 'ghost-button'; back.textContent = 'Back';
      back.addEventListener('click', () => { wizard.step -= 1; render(); });
      actions.append(back);
    }
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'primary-button';
    next.textContent = wizard.step === steps.length - 1 ? 'Create account' : 'Next';
    next.addEventListener('click', () => {
      const ok = steps[wizard.step].collect(container);
      if (!ok) return;
      if (wizard.step === steps.length - 1) {
        auth.signIn(wizard.data.email, wizard.data.role);
        window.authComplete?.(wizard.data.role);
        return;
      }
      wizard.step += 1; render();
    });
    actions.append(next);
  };

  render();
  section.append(progress, container, actions);

  return section;
}

// Update header buttons to route to views
export function renderAuthActions() {
  const el = document.getElementById('auth-actions');
  if (!el) return;
  const s = auth.state;
  if (!s) {
    el.innerHTML = `
      <button class="ghost-button" id="btn-register">Register</button>
      <button class="primary-button" id="btn-login">Sign in</button>
    `;
  } else {
    el.innerHTML = `
      <span class="badge">${s.role}</span>
      <button class="ghost-button" id="btn-logout">Sign out</button>
    `;
  }
  document.getElementById('btn-register')?.addEventListener('click', () => window.gotoView?.('register'));
  document.getElementById('btn-login')?.addEventListener('click', () => window.gotoView?.('login'));
  document.getElementById('btn-logout')?.addEventListener('click', () => auth.signOut());
}

// Expose helpers for inline calls and ensure header actions render
// Even as a module, attach to window for other modules and inline onclicks
// Safe no-ops if already defined
if (typeof window !== 'undefined') {
  window.openAuthModal = openAuthModal;
  window.renderAuthActions = renderAuthActions;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderAuthActions());
  } else {
    // If DOM is already ready, render immediately
    try { renderAuthActions(); } catch {}
  }
}
