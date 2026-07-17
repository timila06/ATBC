const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navProgress = document.getElementById("navProgress");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");

const defaultPresidentStatement = "As of July 2026, M.L. Laksasubha Kridakon will assume the role of President of the Australia Thailand Business Council (ATBC). M.L. Laksasubha brings extensive leadership experience, having served as President of the Australian Alumni Association (Thailand) for the past 10 years and as a Board Director of the Australian-Thai Chamber of Commerce (AustCham Thailand) for more than 16 years. She also made history as the first Thai female President of AustCham Thailand. In addition to her leadership roles, she is a successful business owner with interests spanning the hospitality and hotel sector, international education, training and consultancy services, and real estate development. Under her leadership, ATBC is expected to further strengthen economic, trade, and investment ties between Australia and Thailand. Working closely with key organisations such as the Thai Board of Investment (BOI), the Board of Trade of Thailand, the Thai Chamber of Commerce, and various government agencies, she will actively promote bilateral trade, investment, and business development opportunities between the two countries.";
const oldShortPresidentStatement = "As of July 2026, M.L. Laksasubha Kridakon will assume the role of President. Under her leadership, ATBC is expected to further strengthen economic, trade, and investment ties between Australia and Thailand.";

const roleAccounts = [
  { role: "admin", name: "ATBC Admin", email: "admin@atbc.org", password: "Admin@123" },
  { role: "owner", name: "Website Owner", email: "owner@atbc.org", password: "Owner@123" },
  { role: "updater", name: "Activity Updater", email: "activity@atbc.org", password: "Activity@123" },
  { role: "president", name: "President", email: "president@atbc.org", password: "President@123" }
];

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

function getUsers() {
  const saved = localStorage.getItem("atbcUsers");
  return saved ? JSON.parse(saved) : [];
}

function saveUsers(users) {
  localStorage.setItem("atbcUsers", JSON.stringify(users));
}

function getLoginLog() {
  const saved = localStorage.getItem("atbcLoginLog");
  return saved ? JSON.parse(saved) : [];
}

function addLoginLog(user) {
  const entry = {
    name: user.name,
    email: user.email,
    role: user.role,
    time: new Date().toISOString()
  };
  localStorage.setItem("atbcLoginLog", JSON.stringify([entry, ...getLoginLog()].slice(0, 40)));
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

function getPresidentStatement() {
  const saved = localStorage.getItem("atbcPresidentStatement");
  if (!saved || saved === oldShortPresidentStatement) {
    localStorage.setItem("atbcPresidentStatement", defaultPresidentStatement);
    return defaultPresidentStatement;
  }
  return saved;
}

function savePresidentStatement(value) {
  localStorage.setItem("atbcPresidentStatement", value);
}

function renderPresidentStatement() {
  const statement = getPresidentStatement();
  const statementEl = document.getElementById("presidentStatement");
  const statementInput = document.getElementById("statementText");
  const dashboardInput = document.getElementById("dashboardStatementText");
  if (statementEl) statementEl.textContent = statement;
  if (statementInput) statementInput.value = statement;
  if (dashboardInput) dashboardInput.value = statement;
}

function setupStatementForms() {
  ["statementForm", "dashboardStatementForm"].forEach((id) => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      savePresidentStatement(data.statement);
      renderPresidentStatement();
      showToast("President statement updated.");
    });
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
  const currentName = localStorage.getItem("atbcUserName") || "Visitor";
  document.body.dataset.role = role;
  document.querySelectorAll(".role-editor-only").forEach((el) => {
    el.style.display = ["admin", "updater"].includes(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-president-only").forEach((el) => {
    el.style.display = ["admin", "president"].includes(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-admin-only").forEach((el) => {
    el.style.display = role === "admin" ? "block" : "none";
  });
  document.querySelectorAll(".role-updater-only").forEach((el) => {
    el.style.display = ["admin", "updater"].includes(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-owner-only").forEach((el) => {
    el.style.display = ["admin", "owner"].includes(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-visitor-only").forEach((el) => {
    el.style.display = role === "visitor" ? "block" : "none";
  });
  const status = document.getElementById("roleStatus");
  if (status) status.innerHTML = role === "visitor" ? "Current role: Visitor" : `Current role: ${role}`;
  const title = document.getElementById("dashboardTitle");
  const intro = document.getElementById("dashboardIntro");
  if (title) title.textContent = `Welcome, ${currentName}.`;
  if (intro) intro.textContent = `Current access role: ${role}.`;
}

function setupAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      const email = data.email.trim().toLowerCase();
      const assigned = roleAccounts.find((account) => account.email === email && account.password === data.password);
      const visitor = getUsers().find((user) => user.email === email && user.password === data.password);
      const user = assigned || visitor;
      if (!user) {
        showToast("Login details do not match.");
        return;
      }
      localStorage.setItem("atbcRole", user.role);
      localStorage.setItem("atbcUserName", user.name);
      localStorage.setItem("atbcUserEmail", user.email);
      addLoginLog(user);
      window.location.href = "dashboard.html";
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm).entries());
      const email = data.email.trim().toLowerCase();
      const users = getUsers();
      if (roleAccounts.some((account) => account.email === email) || users.some((user) => user.email === email)) {
        showToast("This email is already registered.");
        return;
      }
      const user = {
        role: "visitor",
        name: data.name.trim(),
        email,
        password: data.password,
        registeredAt: new Date().toISOString()
      };
      saveUsers([user, ...users]);
      localStorage.setItem("atbcRole", "visitor");
      localStorage.setItem("atbcUserName", user.name);
      localStorage.setItem("atbcUserEmail", user.email);
      addLoginLog(user);
      window.location.href = "dashboard.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("atbcRole");
      localStorage.removeItem("atbcUserName");
      localStorage.removeItem("atbcUserEmail");
      window.location.href = "login.html";
    });
  }
}

function renderUserRegistry() {
  const registry = document.getElementById("userRegistry");
  if (!registry) return;
  const users = [...roleAccounts.map(({ password, ...account }) => ({ ...account, registeredAt: "Assigned account" })), ...getUsers()];
  const log = getLoginLog();
  registry.innerHTML = `
    <h3>Registered accounts</h3>
    <div class="data-table">
      ${users.map((user) => `<div><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(user.email)}</span><em>${escapeHtml(user.role)}</em></div>`).join("")}
    </div>
    <h3>Recent logins</h3>
    <div class="data-table">
      ${log.length ? log.map((entry) => `<div><strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.email)}</span><em>${formatDate(entry.time.slice(0, 10))}</em></div>`).join("") : "<p>No login records yet.</p>"}
    </div>
  `;
}

function seedAssignedAccounts() {
  if (localStorage.getItem("atbcAssignedAccountsSeeded")) return;
  localStorage.setItem("atbcAssignedAccountsSeeded", "true");
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
seedAssignedAccounts();
setupAuthForms();
setupContactForm();
applyRoleAccess();
renderPresidentStatement();
setupStatementForms();
renderUserRegistry();
updateHeader();
updateProgress();
