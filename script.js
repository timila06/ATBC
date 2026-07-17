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
  { role: "president", name: "President", email: "president@atbc.org", password: "President@123" }
];

const tierRules = {
  "individual-ordinary": { label: "Individual Ordinary", updates: 0, windowDays: 30, price: 3500, slots: 1, type: "individual" },
  "individual-affiliate": { label: "Individual Affiliate", updates: 0, windowDays: 30, price: 2500, slots: 1, type: "individual" },
  silver: { label: "Silver", updates: 3, windowDays: 30, price: 12000, slots: 3, type: "business" },
  gold: { label: "Gold", updates: 1, windowDays: 7, price: 22000, slots: 6, type: "business" },
  platinum: { label: "Platinum", updates: 2, windowDays: 7, price: 35000, slots: 10, type: "business" },
  custom: { label: "Custom", updates: 2, windowDays: 7, price: 0, slots: 10, type: "business" }
};

let supabaseClient = null;

async function initSupabase() {
  const config = window.ATBC_SUPABASE || {};
  if (!config.url || !config.anonKey) return null;
  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    supabaseClient = createClient(config.url, config.anonKey);
    return supabaseClient;
  } catch {
    return null;
  }
}

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

function deleteActivity(id) {
  saveActivities(getActivities().filter((item) => item.id !== id));
  renderActivitySlider();
  renderActivityList();
  showToast("Activity deleted.");
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

function getPromotions() {
  const saved = localStorage.getItem("atbcPromotions");
  return saved ? JSON.parse(saved) : [];
}

function savePromotions(list) {
  localStorage.setItem("atbcPromotions", JSON.stringify(list));
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
      <button class="activity-delete-btn role-admin-only" type="button" data-delete-activity="${escapeHtml(item.id)}">Delete</button>
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
  listEl.querySelectorAll("[data-delete-activity]").forEach((button) => {
    button.addEventListener("click", () => deleteActivity(button.dataset.deleteActivity));
  });
  applyRoleAccess();
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

function promotionLimitFor(role) {
  return tierRules[role] || null;
}

function recentPromotionUpdates(promotion, rule) {
  const since = Date.now() - rule.windowDays * 24 * 60 * 60 * 1000;
  return (promotion.updateLog || []).filter((date) => new Date(date).getTime() >= since).length;
}

function renderPromotions() {
  const publicList = document.getElementById("promotionPublicList");
  const memberList = document.getElementById("memberPromotionList");
  const approvalList = document.getElementById("promotionApprovalList");
  const currentEmail = localStorage.getItem("atbcUserEmail") || "";
  const role = localStorage.getItem("atbcRole") || "visitor";
  const promotions = getPromotions();

  if (publicList) {
    const approved = promotions.filter((item) => item.status === "approved");
    publicList.innerHTML = approved.length ? approved.map((item) => promotionCard(item)).join("") : `<p class="empty-state">No approved promotions are currently published.</p>`;
  }

  if (memberList) {
    const mine = promotions.filter((item) => item.ownerEmail === currentEmail);
    memberList.innerHTML = mine.length ? mine.map((item) => promotionCard(item, true)).join("") : `<p class="empty-state">No promotions submitted yet.</p>`;
    memberList.querySelectorAll("[data-edit-promotion]").forEach((button) => {
      button.addEventListener("click", () => loadPromotionForEdit(button.dataset.editPromotion));
    });
    memberList.querySelectorAll("[data-delete-promotion]").forEach((button) => {
      button.addEventListener("click", () => {
        savePromotions(getPromotions().filter((item) => item.id !== button.dataset.deletePromotion));
        renderPromotions();
        showToast("Promotion deleted.");
      });
    });
  }

  if (approvalList) {
    const pending = promotions.filter((item) => item.status === "pending");
    approvalList.innerHTML = pending.length ? pending.map((item) => promotionCard(item, false, true)).join("") : `<p class="empty-state">No promotions are awaiting approval.</p>`;
    approvalList.querySelectorAll("[data-approve-promotion]").forEach((button) => {
      button.addEventListener("click", () => {
        savePromotions(getPromotions().map((item) => item.id === button.dataset.approvePromotion ? { ...item, status: "approved", approvedAt: new Date().toISOString() } : item));
        renderPromotions();
        showToast("Promotion approved.");
      });
    });
    approvalList.querySelectorAll("[data-reject-promotion]").forEach((button) => {
      button.addEventListener("click", () => {
        savePromotions(getPromotions().map((item) => item.id === button.dataset.rejectPromotion ? { ...item, status: "rejected" } : item));
        renderPromotions();
        showToast("Promotion rejected.");
      });
    });
  }

  const limit = document.getElementById("promotionLimitText");
  if (limit) {
    const rule = promotionLimitFor(role);
    limit.textContent = rule ? `${rule.label} members can update promotions ${rule.updates} time${rule.updates > 1 ? "s" : ""} every ${rule.windowDays === 7 ? "week" : "month"}.` : "";
  }
}

function promotionCard(item, includeControls = false, includeApproval = false) {
  return `
    <article class="promotion-card">
      <div class="activity-card-meta">
        <span class="activity-badge">${escapeHtml(item.tier || "Member")}</span>
        <span class="activity-date">${escapeHtml(item.status)}</span>
      </div>
      <h3>${escapeHtml(item.businessName)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <a class="activity-read-more" href="${escapeHtml(item.website)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.offerTitle || "Visit business")}</a>
      ${includeControls ? `<div class="promotion-actions"><button class="btn btn-outline-navy" data-edit-promotion="${escapeHtml(item.id)}" type="button">Edit</button><button class="btn btn-red" data-delete-promotion="${escapeHtml(item.id)}" type="button">Delete</button></div>` : ""}
      ${includeApproval ? `<div class="promotion-actions"><button class="btn btn-primary" data-approve-promotion="${escapeHtml(item.id)}" type="button">Approve</button><button class="btn btn-outline-navy" data-reject-promotion="${escapeHtml(item.id)}" type="button">Reject</button></div>` : ""}
    </article>
  `;
}

function loadPromotionForEdit(id) {
  const item = getPromotions().find((promotion) => promotion.id === id);
  const form = document.getElementById("promotionForm");
  if (!item || !form) return;
  form.elements.promotionId.value = item.id;
  form.elements.businessName.value = item.businessName;
  form.elements.offerTitle.value = item.offerTitle;
  form.elements.website.value = item.website;
  form.elements.description.value = item.description;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setupPromotionForm() {
  const form = document.getElementById("promotionForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const role = localStorage.getItem("atbcRole") || "visitor";
    const rule = promotionLimitFor(role);
    if (!rule) {
      showToast("Member access is required.");
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const promotions = getPromotions();
    const existing = data.promotionId ? promotions.find((item) => item.id === data.promotionId) : null;
    const updateLog = existing?.updateLog || [];
    if (existing && recentPromotionUpdates(existing, rule) >= rule.updates) {
      showToast("Promotion update limit reached.");
      return;
    }
    const item = {
      id: existing?.id || `promotion-${Date.now()}`,
      ownerEmail: localStorage.getItem("atbcUserEmail"),
      ownerName: localStorage.getItem("atbcUserName"),
      tier: rule.label,
      businessName: data.businessName,
      offerTitle: data.offerTitle,
      website: data.website,
      description: data.description,
      status: "pending",
      updateLog: [new Date().toISOString(), ...updateLog]
    };
    savePromotions(existing ? promotions.map((promotion) => promotion.id === existing.id ? item : promotion) : [item, ...promotions]);
    form.reset();
    renderPromotions();
    showToast("Promotion submitted for approval.");
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
    el.style.display = role === "admin" ? "block" : "none";
  });
  document.querySelectorAll(".role-president-only").forEach((el) => {
    el.style.display = ["admin", "president"].includes(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-admin-only").forEach((el) => {
    el.style.display = role === "admin" ? "block" : "none";
  });
  document.querySelectorAll(".role-member-only").forEach((el) => {
    el.style.display = promotionLimitFor(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-visitor-only").forEach((el) => {
    el.style.display = role === "visitor" ? "block" : "none";
  });
  const status = document.getElementById("roleStatus");
  if (status) status.innerHTML = role === "visitor" ? "Current role: Visitor" : `Current role: ${role}`;
  const title = document.getElementById("dashboardTitle");
  const intro = document.getElementById("dashboardIntro");
  if (title) title.textContent = `Welcome, ${currentName}.`;
  if (intro) intro.textContent = `Current access: ${role}.`;
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
      window.location.href = user.role === "president" ? "president.html" : "dashboard.html";
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

function setupMemberPaymentForm() {
  const form = document.getElementById("memberPaymentForm");
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const selectedTier = (params.get("tier") || "silver").toLowerCase();
  const tierInput = document.getElementById("selectedTier");
  const tierTitle = document.getElementById("memberTierTitle");
  const rule = tierRules[selectedTier] || tierRules.silver;
  if (tierInput) tierInput.value = selectedTier;
  if (tierTitle) tierTitle.textContent = `${rule.label} Membership`;
  renderMembershipApplication(rule);
  form.querySelectorAll('input[name="duration"]').forEach((input) => {
    input.addEventListener("change", () => renderMembershipApplication(rule));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const email = data.email.trim().toLowerCase();
    const isPromotionMember = ["silver", "gold", "platinum"].includes(data.tier);
    const users = getUsers().filter((user) => user.email !== email);
    const user = {
      role: isPromotionMember ? data.tier : "visitor",
      tier: data.tier,
      name: `${data.name.trim()} ${data.lastName?.trim() || ""}`.trim(),
      email,
      password: data.password,
      businessName: data.businessName,
      paymentMethod: data.paymentMethod,
      billingCompany: data.billingCompany,
      taxId: data.taxId,
      duration: data.duration,
      registeredAt: new Date().toISOString(),
      paidAt: new Date().toISOString()
    };
    saveUsers([user, ...users]);
    localStorage.setItem("atbcRole", user.role);
    localStorage.setItem("atbcUserName", user.name);
    localStorage.setItem("atbcUserEmail", user.email);
    addLoginLog(user);
    window.location.href = isPromotionMember ? "promotion.html" : "dashboard.html";
  });
}

function formatBaht(value) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 2 }).format(value || 0);
}

function membershipTotals(rule) {
  const duration = Number(document.querySelector('input[name="duration"]:checked')?.value || 1);
  const discounts = { 1: 0, 2: 0.1, 3: 0.15 };
  const annual = rule.price || 0;
  const subtotal = annual * duration * (1 - discounts[duration]);
  const applicationFee = rule.price ? 3000 : 0;
  const tax = (subtotal + applicationFee) * 0.07;
  const total = subtotal + applicationFee + tax;
  return { duration, subtotal, applicationFee, tax, total, annualDiscounted: annual * (1 - discounts[duration]) };
}

function renderMembershipApplication(rule) {
  const totals = membershipTotals(rule);
  const tierName = document.getElementById("applicationTierName");
  const durationText = document.getElementById("applicationDuration");
  const slots = document.getElementById("applicationSlots");
  const desc = document.getElementById("applicationDescription");
  const unitPrice = document.getElementById("unitPrice");
  const lineTotal = document.getElementById("lineTotal");
  const fee = document.getElementById("applicationFee");
  const tax = document.getElementById("taxTotal");
  const balance = document.getElementById("balanceTotal");
  const title = document.getElementById("memberTierTitle");
  if (tierName) tierName.textContent = `${rule.label} Membership`;
  if (title) title.textContent = `${rule.label} Membership`;
  if (durationText) durationText.textContent = `This is a ${totals.duration * 12}-month membership`;
  if (slots) slots.textContent = `This membership includes ${rule.slots} member slot(s)`;
  if (desc) desc.textContent = rule.type === "individual" ? "Individual membership for professionals connected to Australia-Thailand business." : "Business membership with ATBC network access and member promotion privileges.";
  if (unitPrice) unitPrice.textContent = rule.price ? formatBaht(rule.price) : "Custom";
  if (lineTotal) lineTotal.textContent = rule.price ? formatBaht(totals.subtotal) : "Quoted";
  if (fee) fee.textContent = rule.price ? formatBaht(totals.applicationFee) : "Quoted";
  if (tax) tax.textContent = rule.price ? formatBaht(totals.tax) : "Quoted";
  if (balance) balance.textContent = rule.price ? formatBaht(totals.total) : "Contact ATBC";
  const one = document.getElementById("durationOne");
  const two = document.getElementById("durationTwo");
  const three = document.getElementById("durationThree");
  if (one) one.textContent = rule.price ? formatBaht(rule.price) : "Custom";
  if (two) two.textContent = rule.price ? formatBaht(rule.price * 2 * 0.9) : "Custom";
  if (three) three.textContent = rule.price ? formatBaht(rule.price * 3 * 0.85) : "Custom";
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
initSupabase().finally(() => {
  renderActivitySlider();
  renderActivityList();
  setupActivityForm();
  setupSliderButtons();
  seedAssignedAccounts();
  setupAuthForms();
  setupMemberPaymentForm();
  setupPromotionForm();
  setupContactForm();
  applyRoleAccess();
  renderPresidentStatement();
  setupStatementForms();
  renderUserRegistry();
  renderPromotions();
  updateHeader();
  updateProgress();
});
