/* ============================================================
   ATBC – Australia Thailand Business Council
   script.js — interactions, local storage demo, animations
   ============================================================ */

/* ---- DOM refs ---- */
const header          = document.getElementById('siteHeader');
const menuToggle      = document.getElementById('menuToggle');
const mainNav         = document.getElementById('mainNav');
const navProgress     = document.getElementById('navProgress');
const activityForm    = document.getElementById('activityForm');
const activityList    = document.getElementById('activityList');
const missionDetail   = document.getElementById('missionDetail');
const pillarBtns      = [...document.querySelectorAll('.mission-pillar-btn')];
const editStatementBtn  = document.getElementById('editStatementBtn');
const statementEditor   = document.getElementById('statementEditor');
const statementInput    = document.getElementById('statementInput');
const saveStatementBtn  = document.getElementById('saveStatementBtn');
const presidentStatement = document.getElementById('presidentStatement');
const toast             = document.getElementById('toast');
const toastMsg          = document.getElementById('toastMsg');
const contactForm       = document.getElementById('contactForm');
const revealEls         = [...document.querySelectorAll('.reveal')];

/* ---- Section anchors for nav tracking ---- */
const navSections = [
  { id: 'home',       navId: 'nav-home'       },
  { id: 'about',      navId: 'nav-about'      },
  { id: 'membership', navId: 'nav-membership' },
  { id: 'sponsor',    navId: 'nav-sponsor'    },
  { id: 'mission',    navId: 'nav-mission'    },
  { id: 'partners',   navId: 'nav-partners'   },
  { id: 'activity',   navId: 'nav-activity'   },
  { id: 'contact',    navId: 'nav-contact'    },
];

/* ---- Mission panel content ---- */
const missionPanels = {
  networking: {
    title: 'Business Networking and Engagement',
    body: 'Organise networking events that connect business leaders and stakeholders from Thailand and Australia, while building relationships with potential partner organisations. Our networking program provides a trusted environment for bilateral connections, introductions, and community building across both markets.'
  },
  missions: {
    title: 'Trade Missions and Roadshows',
    body: 'Develop trade missions, exhibitions, and business roadshows to promote Thai businesses in Australia and Australian businesses in Thailand through strategic partnerships and collaboration. ATBC trade missions provide direct market access, government introductions, and tailored B2B meeting programs.'
  },
  education: {
    title: 'Education and Exchange Programs',
    body: 'Foster partnerships between Australian and Thai universities and institutions to support student exchanges, internships, scholarships, and collaborative educational programs. Education exchange is a cornerstone of the long-term Australia-Thailand relationship and a key pillar of ATBC\'s mission.'
  }
};

/* ---- Default activity data ---- */
const defaultActivities = [
  {
    title: 'Australia-Thailand Trade Outlook Briefing',
    date: '2026-08-20',
    category: 'Briefing',
    summary: 'A senior member session on trade conditions, investment themes, and practical entry points across both markets — with invited commentary from government and industry representatives.'
  },
  {
    title: 'Bangkok Member Networking Evening',
    date: '2026-09-05',
    category: 'Event',
    summary: 'A focused networking event for members, sponsors, and invited government and partner representatives, held at a Bangkok venue to strengthen bilateral connections.'
  }
];

/* ============================================================
   HEADER SCROLL BEHAVIOUR
   ============================================================ */
function updateHeader() {
  const scrolled = window.scrollY > 80;
  header.classList.toggle('hero-top', !scrolled);
  header.classList.toggle('scrolled', scrolled);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function updateProgress() {
  const totalH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = totalH > 0 ? (window.scrollY / totalH) * 100 : 0;
  navProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

/* ============================================================
   ACTIVE NAV LINK (scroll spy)
   ============================================================ */
function updateActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight * 0.4;

  let active = navSections[0].navId;
  for (const s of navSections) {
    const el = document.getElementById(s.id);
    if (el && el.offsetTop <= scrollMid) active = s.navId;
  }

  navSections.forEach(s => {
    const link = document.getElementById(s.navId);
    if (link) link.classList.toggle('is-active', s.navId === active);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ============================================================
   MOBILE MENU
   ============================================================ */
menuToggle.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  // Animate bars
  const bars = menuToggle.querySelectorAll('span');
  if (open) {
    bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    bars[1].style.opacity   = '0';
    bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }
});

// Close mobile nav on link click
mainNav.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    header.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    const bars = menuToggle.querySelectorAll('span');
    bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }
});

/* ============================================================
   SCROLL-REVEAL ANIMATIONS
   ============================================================ */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach(el => revealObserver.observe(el));

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, duration = 3500) {
  toastMsg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ============================================================
   PRESIDENT STATEMENT — local storage demo
   ============================================================ */
const savedStatement = localStorage.getItem('atbcPresidentStatement');
if (savedStatement) {
  presidentStatement.textContent = savedStatement;
}
if (statementInput) {
  statementInput.value = presidentStatement.textContent;
}

editStatementBtn?.addEventListener('click', () => {
  const open = statementEditor.classList.toggle('is-open');
  editStatementBtn.textContent = open ? 'Cancel editing' : 'Edit statement (demo)';
  if (open && statementInput) {
    statementInput.value = presidentStatement.textContent;
    statementInput.focus();
  }
});

saveStatementBtn?.addEventListener('click', () => {
  const next = statementInput?.value.trim();
  if (!next) return;
  presidentStatement.textContent = next;
  localStorage.setItem('atbcPresidentStatement', next);
  statementEditor.classList.remove('is-open');
  editStatementBtn.textContent = 'Edit statement (demo)';
  showToast('President statement updated.');
});

/* ============================================================
   MISSION PILLAR SELECTOR
   ============================================================ */
pillarBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pillarBtns.forEach(b => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
    const panel = missionPanels[btn.dataset.panel];
    if (panel && missionDetail) {
      missionDetail.innerHTML = `<h3>${panel.title}</h3><p>${panel.body}</p>`;
    }
  });
});

/* ============================================================
   ACTIVITY FEED — local storage demo
   ============================================================ */
function getActivities() {
  const saved = localStorage.getItem('atbcActivities');
  return saved ? JSON.parse(saved) : [...defaultActivities];
}

function saveActivities(list) {
  localStorage.setItem('atbcActivities', JSON.stringify(list));
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}

function renderActivities() {
  const list = getActivities().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!list.length) {
    activityList.innerHTML = '<div class="activity-feed-empty">No activities yet. Use the form to post the first update.</div>';
    return;
  }
  activityList.innerHTML = list.map(item => `
    <article class="activity-card">
      <div class="activity-card-meta">
        <span class="activity-badge ${item.category}">${item.category}</span>
        <span class="activity-date">${formatDate(item.date)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
    </article>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

activityForm?.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(activityForm).entries());
  if (!data.title.trim() || !data.date || !data.summary.trim()) return;
  const list = getActivities();
  list.unshift(data);
  saveActivities(list);
  activityForm.reset();
  renderActivities();
  showToast('Activity posted successfully.');
});

renderActivities();

/* ============================================================
   CONTACT FORM — demo
   ============================================================ */
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  showToast('Message sent — our team will be in touch shortly.');
  contactForm.reset();
});

/* ============================================================
   MEMBERSHIP CARDS — keyboard accessibility
   ============================================================ */
document.querySelectorAll('.membership-card[role="button"]').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const link = card.querySelector('a');
      if (link) link.click();
    }
  });
});

/* ============================================================
   INITIAL HASH NAVIGATION
   ============================================================ */
if (window.location.hash) {
  setTimeout(() => {
    const target = document.querySelector(window.location.hash);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}
