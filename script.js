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
  platinum: { label: "Platinum", updates: 2, windowDays: 7, price: 35000, slots: 10, type: "business" }
};

const promotionRoles = ["silver", "gold", "platinum"];

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
  const { role } = getCurrentUser();
  const isLoggedIn = Boolean(localStorage.getItem("atbcUserEmail"));
  if (!isLoggedIn || !["admin", "president"].includes(role)) {
    showToast("Authorized access is required.");
    return;
  }
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

function getCurrentUser() {
  const role = localStorage.getItem("atbcRole") || "visitor";
  const email = localStorage.getItem("atbcUserEmail") || "";
  const name = localStorage.getItem("atbcUserName") || "ATBC member";
  return { role, email, name };
}

function getProfiles() {
  const saved = localStorage.getItem("atbcProfiles");
  return saved ? JSON.parse(saved) : {};
}

function saveProfile(email, profile) {
  const profiles = getProfiles();
  profiles[email] = { ...(profiles[email] || {}), ...profile, updatedAt: new Date().toISOString() };
  localStorage.setItem("atbcProfiles", JSON.stringify(profiles));
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

function mediaMarkup(item) {
  const image = item.image || item.imageUrl;
  const detail = item.details || item.longDescription;
  const link = item.link;
  return `
    ${image ? `<img class="content-card-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title || item.offerTitle || item.businessName || "ATBC update")}" />` : ""}
    ${detail ? `<p class="content-card-detail">${escapeHtml(detail)}</p>` : ""}
    ${link ? `<a class="activity-read-more" href="${escapeHtml(link)}" target="_blank" rel="noreferrer noopener">Open link</a>` : ""}
  `;
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
      ${mediaMarkup(item)}
      <a class="activity-read-more" href="${href}">Read update</a>
      <button class="activity-delete-btn role-president-only" type="button" data-delete-activity="${escapeHtml(item.id)}">Delete</button>
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
    const role = localStorage.getItem("atbcRole") || "visitor";
    const isLoggedIn = Boolean(localStorage.getItem("atbcUserEmail"));
    if (!isLoggedIn || !["admin", "president"].includes(role)) {
      showToast("Authorized access is required.");
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const item = {
      id: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `activity-${Date.now()}`,
      title: data.title,
      date: data.date,
      category: data.category,
      summary: data.summary,
      image: data.image || "",
      link: data.link || "",
      details: data.details || ""
    };
    saveActivities([item, ...getActivities()]);
    form.reset();
    renderActivitySlider();
    renderActivityList();
    showToast("Activity posted.");
  });
}

function promotionLimitFor(role) {
  return promotionRoles.includes(role) ? tierRules[role] : null;
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
    publicList.innerHTML = approved.length ? approved.map((item) => promotionCard(item, { publicView: true })).join("") : `<p class="empty-state">No member promotions are currently published.</p>`;
  }

  if (memberList) {
    const mine = promotions.filter((item) => item.ownerEmail === currentEmail);
    memberList.innerHTML = mine.length ? mine.map((item) => promotionCard(item, { memberControls: true, showStatus: true })).join("") : `<p class="empty-state">No promotions submitted yet.</p>`;
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
    const managed = promotions;
    approvalList.innerHTML = managed.length ? managed.map((item) => promotionCard(item, { approvalControls: true, showStatus: true })).join("") : `<p class="empty-state">No promotions have been submitted yet.</p>`;
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
    approvalList.querySelectorAll("[data-admin-delete-promotion]").forEach((button) => {
      button.addEventListener("click", () => {
        if (localStorage.getItem("atbcRole") !== "admin" || !localStorage.getItem("atbcUserEmail")) {
          showToast("Admin access is required.");
          return;
        }
        savePromotions(getPromotions().filter((item) => item.id !== button.dataset.adminDeletePromotion));
        renderPromotions();
        showToast("Promotion deleted.");
      });
    });
  }

  const limit = document.getElementById("promotionLimitText");
  if (limit) {
    const rule = promotionLimitFor(role);
    limit.textContent = rule ? `${rule.label} members can update promotions ${rule.updates} time${rule.updates > 1 ? "s" : ""} every ${rule.windowDays === 7 ? "week" : "month"}.` : "";
  }
}

function promotionCard(item, options = {}) {
  const { memberControls = false, approvalControls = false, showStatus = false, publicView = false } = options;
  const statusLabel = item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Pending";
  return `
    <article class="promotion-card">
      ${showStatus ? `<div class="activity-card-meta"><span class="activity-badge">${escapeHtml(item.tier || "Member")}</span><span class="activity-date">${escapeHtml(statusLabel)}</span></div>` : ""}
      <h3>${escapeHtml(item.businessName)}</h3>
      <p>${escapeHtml(item.description)}</p>
      ${mediaMarkup(item)}
      ${item.website ? `<a class="activity-read-more" href="${escapeHtml(item.website)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.offerTitle || "Visit business")}</a>` : publicView ? "" : `<span class="activity-read-more">${escapeHtml(item.offerTitle || "Member announcement")}</span>`}
      ${memberControls ? `<div class="promotion-actions"><button class="btn btn-outline-navy" data-edit-promotion="${escapeHtml(item.id)}" type="button">Edit</button><button class="btn btn-red" data-delete-promotion="${escapeHtml(item.id)}" type="button">Delete</button></div>` : ""}
      ${approvalControls ? `<div class="promotion-actions">${item.status !== "approved" ? `<button class="btn btn-primary" data-approve-promotion="${escapeHtml(item.id)}" type="button">Approve</button>` : ""}<button class="btn btn-outline-navy" data-reject-promotion="${escapeHtml(item.id)}" type="button">Reject</button><button class="btn btn-red" data-admin-delete-promotion="${escapeHtml(item.id)}" type="button">Delete</button></div>` : ""}
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
  if (form.elements.image) form.elements.image.value = item.image || "";
  if (form.elements.details) form.elements.details.value = item.details || "";
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
      image: data.image || "",
      details: data.details || "",
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
  const { role, name: currentName } = getCurrentUser();
  const isLoggedIn = Boolean(localStorage.getItem("atbcUserEmail"));
  document.body.dataset.role = role;
  document.body.classList.toggle("is-logged-in", isLoggedIn);
  document.querySelectorAll(".role-editor-only").forEach((el) => {
    el.style.display = isLoggedIn && ["admin", "president"].includes(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-president-only").forEach((el) => {
    el.style.display = isLoggedIn && ["admin", "president"].includes(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-admin-only").forEach((el) => {
    el.style.display = isLoggedIn && role === "admin" ? "block" : "none";
  });
  document.querySelectorAll(".role-member-only").forEach((el) => {
    el.style.display = isLoggedIn && promotionLimitFor(role) ? "block" : "none";
  });
  document.querySelectorAll(".role-visitor-only").forEach((el) => {
    el.style.display = role === "visitor" && isLoggedIn ? "block" : "none";
  });
  document.querySelectorAll(".role-logged-in-only").forEach((el) => {
    el.style.display = isLoggedIn ? "block" : "none";
  });
  const status = document.getElementById("roleStatus");
  const roleLabel = role === "visitor" ? "Registered user" : role;
  if (status) status.innerHTML = `Current access: ${roleLabel}`;
  const title = document.getElementById("dashboardTitle");
  const intro = document.getElementById("dashboardIntro");
  if (title) title.textContent = `Welcome, ${currentName}.`;
  if (intro) intro.textContent = promotionLimitFor(role) ? `${tierRules[role].label} member access is active.` : `${roleLabel} access is active.`;
  updateAccountNavigation(role, isLoggedIn);
}

function updateAccountNavigation(role, isLoggedIn) {
  document.querySelectorAll('.main-nav a[href="login.html"]').forEach((link) => {
    if (isLoggedIn) {
      link.textContent = role === "president" ? "President" : "Dashboard";
      link.setAttribute("href", role === "president" ? "president.html" : "dashboard.html");
      link.classList.add("account-link");
    } else {
      link.textContent = "Login";
      link.setAttribute("href", "login.html");
      link.classList.remove("account-link");
    }
  });
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
        notifications: data.notifications === "on",
        registeredAt: new Date().toISOString()
      };
      saveUsers([user, ...users]);
      saveProfile(email, {
        name: user.name,
        email,
        notifications: {
          atbcUpdates: data.notifications === "on",
          memberPromotions: data.notifications === "on"
        }
      });
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
  if (tierInput) tierInput.value = tierRules[selectedTier] ? selectedTier : "silver";
  if (tierTitle) tierTitle.textContent = `${rule.label} Membership`;
  renderMembershipApplication(rule);
  form.querySelectorAll('input[name="duration"]').forEach((input) => {
    input.addEventListener("change", () => renderMembershipApplication(rule));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const email = data.email.trim().toLowerCase();
    const isPromotionMember = promotionRoles.includes(data.tier);
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
    saveProfile(email, {
      name: user.name,
      email,
      phone: data.phone,
      company: data.businessName,
      position: data.position,
      tier: data.tier,
      notifications: { atbcUpdates: true, memberPromotions: true }
    });
    localStorage.setItem("atbcRole", user.role);
    localStorage.setItem("atbcUserName", user.name);
    localStorage.setItem("atbcUserEmail", user.email);
    addLoginLog(user);
    window.location.href = isPromotionMember ? "promotion.html" : "dashboard.html";
  });
}

function memberRoleLabel(role, tier) {
  if (promotionRoles.includes(role)) return `${tierRules[role].label} member`;
  if (tierRules[tier]?.type === "individual") return `${tierRules[tier].label} member`;
  if (role === "admin") return "Admin";
  if (role === "president") return "President";
  return "Registered user";
}

function renderDashboardHome() {
  const shell = document.getElementById("memberHomeShell");
  if (!shell) return;
  const { email, name, role } = getCurrentUser();
  const profile = getProfiles()[email] || {};
  const users = getUsers();
  const completionItems = [
    Boolean(profile.photo),
    Boolean(profile.phone),
    Boolean(profile.company),
    Boolean(profile.position)
  ];
  const completion = 25 + completionItems.filter(Boolean).length * 18;
  const approvedPromos = getPromotions().filter((item) => item.status === "approved").slice(0, 3);
  const activities = getActivities().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const memberCount = users.filter((user) => promotionRoles.includes(user.role) || tierRules[user.tier]).length;
  shell.innerHTML = `
    <aside class="member-home-sidebar">
      <article class="member-profile-card">
        <div class="profile-avatar">${profile.photo ? `<img src="${escapeHtml(profile.photo)}" alt="${escapeHtml(name)}" />` : escapeHtml(name.slice(0, 2).toUpperCase())}</div>
        <h2>${escapeHtml(name)}</h2>
        <p>${escapeHtml(memberRoleLabel(role, profile.tier))}</p>
        <a class="btn btn-outline-navy" href="profile.html">My profile</a>
      </article>
      <article class="member-quick-card">
        <h3>ATBC member access</h3>
        <p>View activity updates, events, member listings, and approved member promotions.</p>
        <a href="member-directory.html">Browse members</a>
      </article>
    </aside>
    <section class="member-feed">
      <article class="feed-card feed-feature">
        <p class="eyebrow">Main ATBC event</p>
        <h2>Australia-Thailand Business Outlook Forum</h2>
        <p>Senior members, partners, and guests connect around trade outlooks, investment pathways, and practical bilateral opportunities.</p>
        <div class="feed-actions"><a class="btn btn-primary" href="events.html">View events</a><a class="btn btn-outline-navy" href="activity.html">Activity updates</a></div>
      </article>
      ${activities.map((item) => `<article class="feed-card"><span>${escapeHtml(item.category)} - ${formatDate(item.date)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><a href="activity.html#${escapeHtml(item.id)}">Read update</a></article>`).join("")}
      <article class="feed-card">
        <p class="eyebrow">Member promotions</p>
        <h3>${approvedPromos.length ? "Latest member promotions" : "Promotion board"}</h3>
        <p>${approvedPromos.length ? approvedPromos.map((item) => escapeHtml(item.businessName)).join(", ") : "Silver, Gold, and Platinum member promotions will appear here."}</p>
        <a href="promotion.html">View promotions</a>
      </article>
    </section>
    <aside class="member-home-sidebar">
      <article class="member-progress-card">
        <p class="eyebrow">Complete your profile</p>
        <div class="progress-ring"><strong>${Math.min(completion, 100)}%</strong><span>Complete</span></div>
        <a class="btn btn-gold" href="profile.html">Update profile</a>
      </article>
      <article class="member-quick-card">
        <h3>Notifications</h3>
        <p>ATBC email notifications are prepared for new events, activity updates, and member promotions.</p>
        <a href="profile.html#notificationSettings">Manage preferences</a>
      </article>
      <article class="member-quick-card">
        <h3>Network snapshot</h3>
        <p>${memberCount} paid or individual member account${memberCount === 1 ? "" : "s"} registered in this site workspace.</p>
      </article>
    </aside>
  `;
}

function setupProfileForm() {
  const form = document.getElementById("profileForm");
  if (!form) return;
  const { email, name } = getCurrentUser();
  const profile = getProfiles()[email] || {};
  const userEmail = document.getElementById("profileEmail");
  if (userEmail) userEmail.value = email;
  Object.entries({
    profileName: profile.name || name,
    profilePhoto: profile.photo || "",
    profilePhone: profile.phone || "",
    profileCompany: profile.company || "",
    profilePosition: profile.position || "",
    profileIndustry: profile.industry || "",
    profileBio: profile.bio || ""
  }).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  });
  const atbcUpdates = document.getElementById("notifyAtbc");
  const memberPromos = document.getElementById("notifyPromotions");
  if (atbcUpdates) atbcUpdates.checked = profile.notifications?.atbcUpdates !== false;
  if (memberPromos) memberPromos.checked = profile.notifications?.memberPromotions !== false;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    saveProfile(email, {
      name: data.name,
      photo: data.photo,
      phone: data.phone,
      company: data.company,
      position: data.position,
      industry: data.industry,
      bio: data.bio,
      notifications: {
        atbcUpdates: data.notifyAtbc === "on",
        memberPromotions: data.notifyPromotions === "on"
      }
    });
    const users = getUsers().map((user) => user.email === email ? { ...user, name: data.name } : user);
    saveUsers(users);
    localStorage.setItem("atbcUserName", data.name);
    showToast("Profile saved.");
  });
}

function renderMemberDirectory() {
  const list = document.getElementById("memberDirectoryList");
  if (!list) return;
  const users = getUsers().filter((user) => promotionRoles.includes(user.role) || tierRules[user.tier]);
  const profiles = getProfiles();
  const seeded = [
    { name: "M.L. Laksasubha Kridakon", role: "President", company: "Australia Thailand Business Council", tier: "president" },
    { name: "ATBC Secretariat", role: "Administration", company: "Australia Thailand Business Council", tier: "admin" }
  ];
  const members = [...seeded, ...users.map((user) => ({ ...user, ...(profiles[user.email] || {}) }))];
  list.innerHTML = members.map((member) => `
    <article class="directory-card">
      <div class="profile-avatar small">${member.photo ? `<img src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)}" />` : escapeHtml((member.name || "AT").slice(0, 2).toUpperCase())}</div>
      <div>
        <h3>${escapeHtml(member.name || "ATBC member")}</h3>
        <p>${escapeHtml(member.company || member.businessName || "Member organisation")}</p>
        <span>${escapeHtml(memberRoleLabel(member.role, member.tier))}</span>
      </div>
    </article>
  `).join("");
}

function renderEvents() {
  const list = document.getElementById("eventsList");
  if (!list) return;
  const events = [
    { title: "Australia-Thailand Business Outlook Forum", date: "2026-08-20", location: "Bangkok", text: "A flagship discussion on investment conditions, market access, and member opportunities." },
    { title: "Member Networking Evening", date: "2026-09-05", location: "Bangkok", text: "A practical relationship-building evening for members, sponsors, and partner organisations." },
    { title: "Trade Mission Briefing", date: "2026-09-28", location: "Hybrid", text: "A preparatory session for businesses exploring cross-border trade missions and roadshows." }
  ];
  list.innerHTML = events.map((event) => `
    <article class="event-card">
      <span>${formatDate(event.date)} - ${escapeHtml(event.location)}</span>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.text)}</p>
      <a class="btn btn-outline-navy" href="contact.html">Register interest</a>
    </article>
  `).join("");
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
  if (unitPrice) unitPrice.textContent = formatBaht(rule.price);
  if (lineTotal) lineTotal.textContent = formatBaht(totals.subtotal);
  if (fee) fee.textContent = formatBaht(totals.applicationFee);
  if (tax) tax.textContent = formatBaht(totals.tax);
  if (balance) balance.textContent = formatBaht(totals.total);
  const one = document.getElementById("durationOne");
  const two = document.getElementById("durationTwo");
  const three = document.getElementById("durationThree");
  if (one) one.textContent = formatBaht(rule.price);
  if (two) two.textContent = formatBaht(rule.price * 2 * 0.9);
  if (three) three.textContent = formatBaht(rule.price * 3 * 0.85);
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
  renderDashboardHome();
  setupProfileForm();
  renderMemberDirectory();
  renderEvents();
  updateHeader();
  updateProgress();
});
