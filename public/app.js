function setText(id, value = '') {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setLink(id, label = '', href = '#') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = label;
  el.href = href || '#';
}

function setSectionVisible(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? '' : 'none';
}

async function loadContent() {
  const res = await fetch('/api/content');
  const data = await res.json();

  const settings = data.settings || {};
  const visible = settings.showSections || {};

  const logoText = `${data.site.companyName || 'LifeCare'} `;
  document.getElementById('logo').innerHTML = `${logoText}<span>Staffing</span>`;
  document.getElementById('footer-logo').innerHTML = `${logoText}<span>Staffing</span>`;
  setText('footer-tagline', data.site.tagline);
  setText('contact-phone', `Phone: ${data.contact.phone || ''}`);
  setText('contact-email', `Email: ${data.contact.email || ''}`);
  setText('office-line1', data.contact.officeLine1);
  setText('office-line2', data.contact.officeLine2);
  setText('apply-btn', data.site.applyButtonText || 'Apply Now');

  // Nav
  const nav = document.getElementById('main-nav');
  nav.innerHTML = (data.navigation || []).map((item) => `<a href="${item.href}">${item.label}</a>`).join('');
  if (settings.showAdminLink) nav.innerHTML += '<a href="/admin">Admin</a>';

  // Hero
  document.getElementById('hero-image').src = data.hero.backgroundImage;
  setText('hero-eyebrow', data.hero.eyebrow);
  setText('hero-title', data.hero.title);
  setText('hero-description', data.hero.description);
  setLink('hero-primary', data.hero.primaryCtaLabel, data.hero.primaryCtaHref);
  setLink('hero-secondary', data.hero.secondaryCtaLabel, data.hero.secondaryCtaHref);

  // Services
  const servicesGrid = document.getElementById('services-grid');
  servicesGrid.innerHTML = (data.services || [])
    .map((s) => `<article class="card"><h3>${s.title}</h3><p>${s.description}</p></article>`)
    .join('');

  // About
  setText('about-eyebrow', data.about.eyebrow);
  setText('about-title', data.about.title);
  setText('about-description', data.about.description);
  document.getElementById('about-image').src = data.about.image;

  // Leadership
  setText('leadership-eyebrow', data.leadership.eyebrow);
  setText('leadership-title', data.leadership.title);
  setText('leadership-subtitle', data.leadership.subtitle);
  const grid = document.getElementById('leaders-grid');
  grid.innerHTML = (data.leaders || [])
    .map(
      (leader, idx) => `
      <article class="leader-card ${idx === 0 ? 'highlight' : ''}">
        <img class="leader-photo" src="${leader.photo}" alt="${leader.name}" />
        <h3>${leader.name}</h3>
        <p class="role">${leader.title}</p>
        <p class="leader-bio">${leader.bio}</p>
        <a href="${leader.linkedin}" target="_blank" rel="noopener noreferrer" class="profile-link">View LinkedIn</a>
      </article>`
    )
    .join('');

  // Jobs
  setText('jobs-eyebrow', data.jobs.eyebrow);
  setText('jobs-title', data.jobs.title);
  setText('jobs-description', data.jobs.description);
  document.getElementById('jobs-image').src = data.jobs.image;
  setLink('jobs-cta', data.jobs.ctaLabel, data.jobs.ctaHref);
  document.getElementById('jobs-tags').innerHTML = (data.jobs.tags || []).map((t) => `<span>${t}</span>`).join('');

  // CTA
  setText('cta-title', data.cta.title);
  setText('cta-description', data.cta.description);
  setLink('cta-button', data.cta.buttonLabel, data.cta.buttonHref);

  // Functionality toggles
  setSectionVisible('services-section', visible.services !== false);
  setSectionVisible('about-section', visible.about !== false);
  setSectionVisible('leadership-section', visible.leadership !== false);
  setSectionVisible('jobs-section', visible.jobs !== false);
  setSectionVisible('cta-section', visible.cta !== false);
  setSectionVisible('footer-section', visible.footer !== false);
}

loadContent().catch(() => {
  const grid = document.getElementById('leaders-grid');
  if (grid) grid.innerHTML = '<p>Unable to load content right now.</p>';
});
