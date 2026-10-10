// Injected Plus Jakarta Sans Google Font Link
(function loadCustomFont() {
  if (typeof document !== "undefined" && !document.getElementById("custom-font-link")) {
    const l = document.createElement("link");
    l.id = "custom-font-link";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
})();

// =========================================================================
// BUTTERY SMOOTH INERTIAL SCROLL ENGINE (LENIS INTEGRATION)
// =========================================================================
(function initSmoothScrollEngine() {
  if (typeof window === "undefined") return;
  // Don't bind on fixed height chat page
  if (window.location.pathname.includes("ai-assistant.html")) return;

  function startLenis() {
    if (window.Lenis && !window.__lenisInitialized) {
      window.__lenisInitialized = true;
      const lenis = new window.Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
        infinite: false
      });

      window.lenis = lenis;

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Load local Lenis
  const s = document.createElement("script");
  s.src = "../js/lenis.min.js";
  s.onload = startLenis;
  s.onerror = () => {
    // CDN fallback
    const cdn = document.createElement("script");
    cdn.src = "https://unpkg.com/lenis@1.1.18/dist/lenis.min.js";
    cdn.onload = startLenis;
    document.head.appendChild(cdn);
  };
  document.head.appendChild(s);
})();

// ===================== API HELPER =====================
const API_BASE = (typeof window !== "undefined" && (window.BRSR_API_BASE || localStorage.getItem("BRSR_API_BASE"))) || "/api";

async function api(path, options = {}) {
  const opts = Object.assign({ credentials: "include" }, options);
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    opts.body = JSON.stringify(opts.body);
  }
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, opts);
  if (res.status === 401) {
    window.location.href = "/pages/login.html";
    return null;
  }
  let data;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) throw new Error((data && data.error) || "Request failed");
  return data;
}

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ===================== NAV DEFINITION =====================
const NAV_ICONS = {
  dashboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
  entry: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  building: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>`,
  alert: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  clip: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
  search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  report: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
  ai: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  settings: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  inbox: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
  bolt: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  factory: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"></path><path d="M6 20V8l6 4V4l6 4v12"></path></svg>`,
  shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  leaf: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>`,
  clipboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
  users: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  scales: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h18"></path></svg>`,
  lock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  briefcase: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
  dollar: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  scroll: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
  chart: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
};

const ALL_NAV_ITEMS = [
  { href: "dashboard.html", label: "Executive Dashboard", icon: NAV_ICONS.chart },
  { href: "data-entry.html", label: "BRSR Data Entry", icon: NAV_ICONS.entry },
  { href: "assignments.html", label: "Assignments & Submissions", icon: NAV_ICONS.building },
  { href: "validation.html", label: "Validation Exceptions", icon: NAV_ICONS.alert },
  { href: "evidence.html", label: "Evidence Repository", icon: NAV_ICONS.clip },
  { href: "audit.html", label: "Audit Trail & Assurance", icon: NAV_ICONS.search },
  { href: "reports.html", label: "Master SEBI Report", icon: NAV_ICONS.report },
  { href: "ai-assistant.html", label: "AI Report Assistant", icon: NAV_ICONS.ai },
  { href: "admin.html", label: "Admin & Factor Config", icon: NAV_ICONS.settings }
];

function getNavItemsForUser(user) {
  const role = user.role || "";
  const username = user.username || "";

  if (role === "Group Admin" || role === "Sustainability Lead") {
    return [
      { href: "dashboard.html", label: "Group Command Center", icon: NAV_ICONS.building },
      { href: "assignments.html", label: "Subsidiary Submissions (42)", icon: NAV_ICONS.inbox },
      { href: "validation.html", label: "Validation Exceptions Desk", icon: NAV_ICONS.alert },
      { href: "reports.html", label: "Master SEBI BRSR Publisher", icon: NAV_ICONS.report },
      { href: "evidence.html", label: "Evidence Repository", icon: NAV_ICONS.clip },
      { href: "portal-ehs.html", label: "Carbon Calculation Engine", icon: NAV_ICONS.bolt },
      { href: "ai-assistant.html", label: "AI Report Assistant", icon: NAV_ICONS.ai },
      ...(role === "Group Admin" ? [{ href: "admin.html", label: "Admin & Factor Config", icon: NAV_ICONS.settings }] : [])
    ];
  }

  if (role === "Plant/Project Owner" || username.includes("plant")) {
    return [
      { href: "portal-plant.html", label: "Plant 1 Operations Desk", icon: NAV_ICONS.factory },
      { href: "plant-log.html", label: "Site Machinery & Energy Log", icon: NAV_ICONS.entry },
      { href: "plant-evidence.html", label: "Weighbridge Slips Gallery", icon: NAV_ICONS.clip },
      { href: "plant-signoff.html", label: "Monthly Site Sign-Off & Lock", icon: NAV_ICONS.shield },
      { href: "ai-plant.html", label: "Field Machinery AI Copilot", icon: NAV_ICONS.ai }
    ];
  }

  if (username.includes("ehs")) {
    return [
      { href: "portal-ehs.html", label: "EHS Command Center", icon: NAV_ICONS.leaf },
      { href: "ehs-ledger.html", label: "Environmental Ledger (P6)", icon: NAV_ICONS.clipboard },
      { href: "ehs-evidence.html", label: "Fuel Bills & Manifests Vault", icon: NAV_ICONS.clip },
      { href: "ehs-variance.html", label: "Emission Spike & Variance Desk", icon: NAV_ICONS.alert },
      { href: "ai-ehs.html", label: "Carbon Accounting AI Copilot", icon: NAV_ICONS.ai }
    ];
  }

  if (username.includes("hr")) {
    return [
      { href: "portal-hr.html", label: "Workforce & People Desk", icon: NAV_ICONS.users },
      { href: "hr-ledger.html", label: "Section A & P3 Social Ledger", icon: NAV_ICONS.entry },
      { href: "hr-posh.html", label: "POSH Register & Compliance", icon: NAV_ICONS.scales },
      { href: "hr-evidence.html", label: "Payroll & Social Proofs Vault", icon: NAV_ICONS.clip },
      { href: "ai-hr.html", label: "Chief People & POSH AI Copilot", icon: NAV_ICONS.ai }
    ];
  }

  if (role === "Auditor" || username.includes("auditor")) {
    return [
      { href: "portal-auditor.html", label: "Assurance Command Desk", icon: NAV_ICONS.search },
      { href: "auditor-sampling.html", label: "10% Random Sampling (ISAE 3000)", icon: NAV_ICONS.chart },
      { href: "auditor-evidence.html", label: "Cryptographic SHA-256 Verifier", icon: NAV_ICONS.lock },
      { href: "auditor-discrepancies.html", label: "Audit Discrepancies & Logbook", icon: NAV_ICONS.alert },
      { href: "ai-auditor.html", label: "Statutory Assurance AI Copilot", icon: NAV_ICONS.ai }
    ];
  }

  if (role === "Management Viewer" || username.includes("mgmt")) {
    return [
      { href: "portal-board.html", label: "Boardroom ESG Dossier", icon: NAV_ICONS.briefcase },
      { href: "board-kpis.html", label: "NGRBC 9 Principles Scorecard", icon: NAV_ICONS.chart },
      { href: "board-ratings.html", label: "ESG Rating Readiness & Capital", icon: NAV_ICONS.dollar },
      { href: "board-governance.html", label: "Board Resolutions & Approvals", icon: NAV_ICONS.scroll },
      { href: "ai-board.html", label: "Board Strategic AI Advisor", icon: NAV_ICONS.ai }
    ];
  }

  return ALL_NAV_ITEMS;
}

async function initLayout(activeHref) {
  const user = await requireLogin();
  if (!user) return null;

  const shell = document.getElementById("app-shell");
  const navList = getNavItemsForUser(user);

  const navHtml = navList
    .map(item => `<a href="${item.href}" class="${item.href === activeHref ? "active" : ""}"><span class="nav-icon" style="display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; width:18px;">${item.icon}</span><span>${item.label}</span></a>`)
    .join("");

  shell.insertAdjacentHTML("afterbegin", `
    <div class="sidebar">
      <div class="brand">
        <div class="logo-mark">M</div>
        <div>
          <div style="font-weight:800; font-size:14px; letter-spacing:0.02em;">MEIL ESG PORTAL</div>
          <div style="font-size:10px; color:#8c8c94; letter-spacing:0.08em;">ENTERPRISE ESG SYSTEM</div>
        </div>
      </div>
      <nav>${navHtml}</nav>
      
      <div class="user-box">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <div class="name" style="font-size:13.5px; font-weight:700;">${user.name}</div>
          <span style="font-size:10px; padding:3px 8px; border-radius:6px; background:rgba(245,183,46,0.15); color:#f5b72e; font-weight:700;">${user.role}</span>
        </div>
        <div class="role" style="font-size:11.5px; color:#8c8c94; margin-bottom:12px;">${user.username}</div>
        
        <div class="role-switcher-box" style="padding-top:12px; border-top:1px solid rgba(255,255,255,0.07); margin-bottom:14px;">
          <label style="font-size:10px; color:#8c8c94; text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:6px; font-weight:600;">Demo Role Switcher</label>
          <select id="quickRoleSwitch" style="width:100%; font-size:11.5px; padding:8px 10px; background:#0c0c10; border:1px solid rgba(245,183,46,0.3); border-radius:8px; color:#f5b72e; outline:none; cursor:pointer;">
            <option value="group.admin" ${user.username === 'group.admin' ? 'selected' : ''}>Group Administrator (Corporate HQ)</option>
            <option value="sustain.lead" ${user.username === 'sustain.lead' ? 'selected' : ''}>Sustainability Lead</option>
            <option value="plant.owner" ${user.username === 'plant.owner' ? 'selected' : ''}>Plant/EPC Owner (Site)</option>
            <option value="ehs.owner" ${user.username === 'ehs.owner' ? 'selected' : ''}>EHS & Fuels Officer</option>
            <option value="hr.owner" ${user.username === 'hr.owner' ? 'selected' : ''}>HR & Safety Officer</option>
            <option value="auditor" ${user.username === 'auditor' ? 'selected' : ''}>ESG Statutory Auditor</option>
            <option value="mgmt.viewer" ${user.username === 'mgmt.viewer' ? 'selected' : ''}>Management Board Viewer</option>
          </select>
        </div>

        <button class="logout-btn" id="logoutBtn" style="width:100%; padding:9px 12px; border-radius:8px; font-size:12.5px;">Log out</button>
      </div>
    </div>
  `);

  document.getElementById("quickRoleSwitch").addEventListener("change", async (e) => {
    const uname = e.target.value;
    toast(`Switching to ${uname}…`);
    try {
      await api("/login", { method: "POST", body: { username: uname, password: "demo123" } });
      if (uname === "group.admin" || uname === "sustain.lead") {
        window.location.href = "dashboard.html";
      } else if (uname === "plant.owner") {
        window.location.href = "portal-plant.html";
      } else if (uname === "ehs.owner") {
        window.location.href = "portal-ehs.html";
      } else if (uname === "hr.owner") {
        window.location.href = "portal-hr.html";
      } else if (uname === "auditor") {
        window.location.href = "portal-auditor.html";
      } else if (uname === "mgmt.viewer") {
        window.location.href = "portal-board.html";
      } else {
        window.location.href = "data-entry.html";
      }
    } catch (err) {
      toast("Switch failed");
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await api("/logout", { method: "POST" });
    window.location.href = "/pages/login.html";
  });

  // Inject Role Boundary Strip at top of .content
  const contentEl = document.querySelector(".content");
  if (contentEl && !document.getElementById("roleScopeBanner")) {
    let scopeDesc = "MEIL Corporate HQ · Full Conglomerate Boundary (42 Subsidiaries, 250+ Units)";
    let scopeBadge = "Conglomerate HQ";
    let scopeColor = "#f5b72e";

    const uname = user.username || "";
    if (uname.includes("ehs")) {
      scopeDesc = "EHS Operational Custody · Principle 6 (Environment), Scope 1 & 2 GHG Fuels, Water Withdrawal & Waste Manifests";
      scopeBadge = "EHS Dept (Plant 1)";
      scopeColor = "#34d399";
    } else if (uname.includes("hr")) {
      scopeDesc = "HR & Social Governance · Section A (Workforce Roster), Gender Diversity, POSH & Fair Wages";
      scopeBadge = "HR Dept (Plant 1)";
      scopeColor = "#c084fc";
    } else if (user.role === "Plant/Project Owner") {
      scopeDesc = "Site Operational Scope · Plant 1 EV Manufacturing Complex & Project In-Charge Desk";
      scopeBadge = "Plant 1 Site Office";
      scopeColor = "#fbbf24";
    } else if (user.role === "Auditor") {
      scopeDesc = "Statutory ESG Assurance · SEBI BRSR Core Reasonable Assurance Sampling & Cryptographic SHA-256 Verification";
      scopeBadge = "Statutory ESG Auditor";
      scopeColor = "#60a5fa";
    } else if (user.role === "Management Viewer") {
      scopeDesc = "Executive Boardroom Dossier · Strategic ESG Scorecard, Decarbonization Roadmap & Final Filing Review";
      scopeBadge = "Board of Directors";
      scopeColor = "#a78bfa";
    }

    contentEl.insertAdjacentHTML("afterbegin", `
      <div id="roleScopeBanner" style="background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.08); border-left:4px solid ${scopeColor}; border-radius:12px; padding:14px 22px; margin-bottom:30px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; box-shadow: 0 4px 18px rgba(0,0,0,0.25);">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:11.5px; text-transform:uppercase; font-weight:800; color:${scopeColor}; letter-spacing:0.06em;">Operational Boundary:</span>
          <span style="font-size:13px; color:#cbd5e1; line-height:1.5;">${scopeDesc}</span>
        </div>
        <div>
          <span class="chip" style="background:${scopeColor}1a; color:${scopeColor}; border:1px solid ${scopeColor}4d; font-size:12px; font-weight:700; padding:5px 14px; border-radius:999px;">${scopeBadge}</span>
        </div>
      </div>
    `);
  }

  return user;
}

async function requireLogin() {
  try {
    const data = await api("/me");
    return data ? data.user : null;
  } catch (e) {
    window.location.href = "/pages/login.html";
    return null;
  }
}

// ===================== FORMAT HELPERS =====================
function fmtNum(v) {
  if (v === "" || v === null || v === undefined) return "—";
  if (typeof v === "number") return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return v;
}
function severityBadge(sev) {
  const cls = sev === "Critical" ? "badge-critical" : sev === "Warning" ? "badge-warning" : "badge-info";
  return `<span class="badge ${cls}">${sev}</span>`;
}
function statusBadge(status) {
  return `<span class="status-badge" data-status="${status}">${status}</span>`;
}

// ===================== SIMPLE CANVAS CHARTS =====================
function drawBarChart(canvas, labels, values, opts = {}) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.clientWidth * 2;
  const H = canvas.height = canvas.clientHeight * 2;
  ctx.clearRect(0, 0, W, H);
  ctx.scale(1, 1);
  const pad = 40 * 2;
  const max = opts.max || Math.max(...values, 1) * 1.15;
  const barW = (W - pad * 1.2) / values.length * 0.6;
  const gap = (W - pad * 1.2) / values.length;
  ctx.font = "22px Segoe UI, Arial";
  ctx.fillStyle = "#8e9cb0";
  values.forEach((v, i) => {
    const x = pad * 0.5 + i * gap + (gap - barW) / 2;
    const barH = (H - pad) * (v / max);
    const y = H - pad * 0.6 - barH;
    const grad = ctx.createLinearGradient(0, y, 0, H - pad * 0.6);
    grad.addColorStop(0, opts.color || "#f5b72e");
    grad.addColorStop(1, opts.color2 || "#b88210");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(v.toFixed ? v.toFixed(0) : v, x + barW / 2, y - 10);
    ctx.fillStyle = "#8e9cb0";
    ctx.font = "20px Segoe UI, Arial";
    const label = String(labels[i]).length > 14 ? String(labels[i]).slice(0, 13) + "…" : labels[i];
    ctx.fillText(label, x + barW / 2, H - pad * 0.25);
    ctx.font = "22px Segoe UI, Arial";
  });
  // axis line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.moveTo(pad * 0.5, H - pad * 0.6);
  ctx.lineTo(W - pad * 0.3, H - pad * 0.6);
  ctx.stroke();
}

function drawLineChart(canvas, labels, series, opts = {}) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.clientWidth * 2;
  const H = canvas.height = canvas.clientHeight * 2;
  ctx.clearRect(0, 0, W, H);
  const pad = 50 * 2;
  const allVals = series.flatMap(s => s.values);
  const max = Math.max(...allVals) * 1.15 || 1;
  const min = Math.min(0, Math.min(...allVals));
  const colors = ["#f5b72e", "#ffffff", "#34d399", "#f87171"];
  const stepX = (W - pad * 1.3) / (labels.length - 1);

  // grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = pad * 0.4 + (H - pad * 1.1) * (g / 4);
    ctx.beginPath(); ctx.moveTo(pad * 0.7, y); ctx.lineTo(W - pad * 0.3, y); ctx.stroke();
  }

  series.forEach((s, si) => {
    ctx.strokeStyle = colors[si % colors.length];
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    s.values.forEach((v, i) => {
      const x = pad * 0.7 + i * stepX;
      const y = H - pad * 0.6 - (H - pad * 1.1) * ((v - min) / (max - min || 1));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    s.values.forEach((v, i) => {
      const x = pad * 0.7 + i * stepX;
      const y = H - pad * 0.6 - (H - pad * 1.1) * ((v - min) / (max - min || 1));
      ctx.fillStyle = colors[si % colors.length];
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    });
  });

  ctx.fillStyle = "#8e9cb0";
  ctx.font = "20px Segoe UI, Arial";
  ctx.textAlign = "center";
  labels.forEach((l, i) => {
    const x = pad * 0.7 + i * stepX;
    ctx.fillText(l, x, H - pad * 0.2);
  });
}

function drawDonut(canvas, segments) {
  // segments: [{label, value, color}]
  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement || (typeof document !== "undefined" && document.getElementById("rpLive"));
  const pw = parent && parent.clientWidth > 0 ? (parent.clientWidth - 24) : 0;
  const cw = canvas.clientWidth > 0 ? canvas.clientWidth : (pw > 0 ? pw : 340);
  const ch = canvas.clientHeight > 0 ? canvas.clientHeight : 140;
  const W = canvas.width = Math.max(Math.round(cw * 2), 600);
  const H = canvas.height = Math.max(Math.round(ch * 2), 280);
  ctx.clearRect(0, 0, W, H);
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const cx = W / 2, cy = H / 2;
  const r = Math.max(Math.min(W, H) / 2 - 14, 25);
  const rInner = Math.max(r * 0.62, 12);
  let start = -Math.PI / 2;
  segments.forEach(seg => {
    const angle = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    start += angle;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.fillStyle = "#0c0c0e";
  ctx.fill();
}
