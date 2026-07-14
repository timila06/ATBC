const pages = [...document.querySelectorAll(".page")];
const navLinks = [...document.querySelectorAll(".main-nav a")];
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const activityForm = document.querySelector("#activityForm");
const activityList = document.querySelector("#activityList");
const missionDetail = document.querySelector("#missionDetail");
const missionCards = [...document.querySelectorAll(".mission-card")];

const missionPanels = {
  networking: {
    title: "Business Networking and Engagement",
    body: "Organise networking events that connect business leaders and stakeholders from Thailand and Australia while building relationships with potential partner organisations."
  },
  missions: {
    title: "Trade Missions and Roadshows",
    body: "Develop trade missions, exhibitions, and business roadshows to promote Thai businesses in Australia through strategic partnerships and collaboration."
  },
  education: {
    title: "Education and Exchange Programs",
    body: "Foster partnerships between Australian and Thai universities to support student exchanges, internships, scholarships, and collaborative educational programs."
  }
};

const starterActivities = [
  {
    title: "Australia-Thailand Trade Outlook Briefing",
    date: "2026-08-20",
    category: "Briefing",
    summary: "A senior member session on trade conditions, investment themes, and practical entry points for both markets."
  },
  {
    title: "Bangkok Member Networking Evening",
    date: "2026-09-05",
    category: "Event",
    summary: "A focused networking event for members, sponsors, and invited government and partner representatives."
  }
];

function storedActivities() {
  const saved = localStorage.getItem("atbcActivities");
  return saved ? JSON.parse(saved) : starterActivities;
}

function saveActivities(activities) {
  localStorage.setItem("atbcActivities", JSON.stringify(activities));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function renderActivities() {
  const activities = storedActivities().sort((a, b) => new Date(b.date) - new Date(a.date));
  activityList.innerHTML = activities
    .map(
      (item) => `
        <article class="activity-card">
          <div class="activity-meta">
            <span>${item.category}</span>
            <span>${formatDate(item.date)}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
        </article>
      `
    )
    .join("");
}

function showPage(hash) {
  const target = hash && document.querySelector(hash) ? hash : "#home";
  pages.forEach((page) => page.classList.toggle("is-active", `#${page.id}` === target));
  navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === target));
  header.classList.remove("nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "instant" });
}

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("hashchange", () => showPage(window.location.hash));

activityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(activityForm).entries());
  saveActivities([data, ...storedActivities()]);
  activityForm.reset();
  renderActivities();
});

missionCards.forEach((card) => {
  card.addEventListener("click", () => {
    missionCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    const panel = missionPanels[card.dataset.panel];
    missionDetail.innerHTML = `<h3>${panel.title}</h3><p>${panel.body}</p>`;
  });
});

renderActivities();
showPage(window.location.hash);
