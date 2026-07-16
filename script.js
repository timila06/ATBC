const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navProgress = document.getElementById("navProgress");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");

const defaultActivities = [
  {
    id: "trade-outlook-briefing",
    title: "Australia-Thailand Trade Outlook Briefing",
    date: "2026-08-20",
    category: "Briefing",
    summary: "A senior member session on trade conditions, investment themes, and practical entry points across both markets."
  },
  {
    id: "bangkok-networking-evening",
    title: "Bangkok Member Networking Evening",
    date: "2026-09-05",
    category: "Event",
    summary: "A focused networking event for members, sponsors, government representatives, and partner organisations."
  },
  {
    id: "education-exchange-roundtable",
    title: "Education Exchange Roundtable",
    date: "2026-09-28",
    category: "News",
    summary: "A roundtable exploring student exchange, internships, scholarships, and institutional partnerships."
  }
];

function showToast(message) {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function updateHeader() {
  if (!header) return;
  const scrolled = window.scrollY > 80 || !document.getElementById("home");
  header.classList.toggle("hero-top", !scrolled);
  header.classList.toggle("scrolled", scrolled);
}

function updateProgress() {
  if (!navProgress) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  navProgress.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : "0%";
}

function getActivities() {
  const saved = localStorage.getItem("atbcActivities");
  return saved ? JSON.parse(saved) : defaultActivities;
}

function saveActivities(list) {
  localStorage.setItem("atbcActivities", JSON.stringify(list));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function activityCard(item, compact = false) {
  const href = `activity.html#${item.id}`;
  return `
    <article class="activity-card ${compact ? "activity-card-compact" : ""}" id="${item.id}">
      <div class="activity-card-meta">
        <span class="activity-badge ${escapeHtml(item.category)}">${escapeHtml(item.category)}</span>
        <span class="activity-date">${formatDate(item.date)}</span>
      </div>
      <h3><a href="${href}">${escapeHtml(item.title)}</a></h3>
      <p>${escapeHtml(item.summary)}</p>
      <a class="activity-read-more" href="${href}">Read update</a>
    </article>
  `;
}

function renderActivitySlider() {
  const slider = document.getElementById("activitySlider");
  if (!slider) return;
  const list = getActivities().sort((a, b) => new Date(b.date) - new Date(a.date));
  slider.innerHTML = list.map((item) => activityCard(item, true)).join("");
}

function renderActivityList() {
  const listEl = document.getElementById("activityList");
  if (!listEl) return;
  const list = getActivities().sort((a, b) => new Date(b.date) - new Date(a.date));
  listEl.innerHTML = list.map((item) => activityCard(item)).join("");
}

function setupActivityForm() {
  const form = document.getElementById("activityForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const item = {
      id: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `activity-${Date.now()}`,
      title: data.title,
      date: data.date,
      category: data.category,
      summary: data.summary
    };
    saveActivities([item, ...getActivities()]);
    form.reset();
    renderActivitySlider();
    renderActivityList();
    showToast("Activity posted.");
  });
}

function setupSliderButtons() {
  const slider = document.getElementById("activitySlider");
  const prev = document.getElementById("activityPrev");
  const next = document.getElementById("activityNext");
  if (!slider || !prev || !next) return;
  prev.addEventListener("click", () => slider.scrollBy({ left: -360, behavior: "smooth" }));
  next.addEventListener("click", () => slider.scrollBy({ left: 360, behavior: "smooth" }));
}

function applyRoleAccess() {
  const role = localStorage.getItem("atbcRole") || "visitor";
  document.body.dataset.role = role;
  document.querySelectorAll(".role-editor-only").forEach((el) => {
    el.style.display = ["admin", "updater"].includes(role) ? "" : "none";
  });
  const status = document.getElementById("roleStatus");
  if (status) status.innerHTML = role === "visitor" ? "Current role: Visitor" : `Current role: ${role}`;
}

function setupLoginRoles() {
  document.querySelectorAll(".role-card").forEach((card) => {
    card.addEventListener("click", () => {
      localStorage.setItem("atbcRole", card.dataset.role);
      applyRoleAccess();
      showToast(`Logged in as ${card.dataset.role}.`);
    });
  });
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    showToast("Message sent.");
  });
}

function setupMenu() {
  if (!menuToggle || !mainNav || !header) return;
  menuToggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

function setupReveal() {
  const items = [...document.querySelectorAll(".reveal")];
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

window.addEventListener("scroll", () => {
  updateHeader();
  updateProgress();
}, { passive: true });

setupMenu();
setupReveal();
renderActivitySlider();
renderActivityList();
setupActivityForm();
setupSliderButtons();
setupLoginRoles();
setupContactForm();
applyRoleAccess();
updateHeader();
updateProgress();
