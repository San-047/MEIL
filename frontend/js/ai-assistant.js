// ===================== UNIFIED ESG AI ASSISTANT ENGINE =====================
// Integrates 3 Deployed Railway ESG Microservices:
// 1. Environmental ESG Reporting Chatbot (POST /chat)
// 2. ESG Report Processing API (POST /process/{report_id})
// 3. Employee and ESG Reporting API (POST /extract, POST /extract-report, GET /fetch-report-pdf)
// Plus SEBI BRSR Principle Visualizer Engine

const PRINCIPLES = [
  { code: "P1", name: "Ethics, Transparency & Accountability", keywords: ["ethics", "transparency", "accountability", "corruption", "bribery", "anti-corruption", "p1"] },
  { code: "P2", name: "Sustainable & Safe Goods/Services", keywords: ["sustainable", "safe", "goods", "services", "sourcing", "lifecycle", "epr", "recycling", "p2"] },
  { code: "P3", name: "Employee Well-being", keywords: ["employee", "well-being", "wellbeing", "worker", "safety", "wages", "training", "health", "posh", "p3"] },
  { code: "P4", name: "Stakeholder Engagement", keywords: ["stakeholder", "engagement", "consultation", "feedback", "p4"] },
  { code: "P5", name: "Human Rights", keywords: ["human rights", "rights", "discrimination", "child labour", "forced labour", "gender", "p5"] },
  { code: "P6", name: "Environment", keywords: ["environment", "ghg", "emission", "energy", "water", "waste", "carbon", "climate", "biodiversity", "pollution", "p6"] },
  { code: "P7", name: "Responsible Policy Advocacy", keywords: ["policy", "advocacy", "trade", "anti-competitive", "chamber", "p7"] },
  { code: "P8", name: "Inclusive Growth & Equitable Development", keywords: ["inclusive", "growth", "equitable", "csr", "community", "msme", "procurement", "social impact", "p8"] },
  { code: "P9", name: "Consumer Responsibility", keywords: ["consumer", "customer", "complaint", "data privacy", "cybersecurity", "product recall", "p9"] }
];

// Mode Prompts Dictionary
const MODE_PROMPTS = {
  auto: [
    { title: "Show P6 Environment", desc: "Energy, emissions & water under Principle 6", prompt: "Show P6 Environment" },
    { title: "Scope 1 & 2 Emissions", desc: "Overview of direct and electricity emissions", prompt: "What is MEIL Scope 1 and Scope 2 emissions overview?" },
    { title: "Workforce & Safety", desc: "Headcount, diversity & safety records", prompt: "Give me workforce headcount and safety LTIFR records" },
    { title: "All 9 BRSR Principles", desc: "Comprehensive disclosure analysis", prompt: "all" }
  ],
  environmental: [
    { title: "Scope 1 vs Scope 2", desc: "Direct fuel vs purchased grid power guidance", prompt: "Explain difference between Scope 1 and Scope 2 emissions with EPC examples" },
    { title: "Water Recycling Disclosures", desc: "Disclosing rainwater harvesting & wastewater", prompt: "How should an EPC infrastructure company disclose water withdrawal under BRSR Principle 6?" },
    { title: "Net-Zero & Science Targets", desc: "Decarbonization roadmap milestones", prompt: "What are net-zero GHG target requirements under SEBI BRSR Principle 6?" },
    { title: "Renewable PPA Offsets", desc: "Solar & wind power credit calculation", prompt: "How do renewable energy PPAs reduce Scope 2 market-based emissions?" }
  ],
  emissions: [
    { title: "Process Report #1", desc: "Trigger batch ESG report pipeline", prompt: "Process report #1" },
    { title: "Check Processing Status", desc: "Inspect upstream Railway emission unit", prompt: "Check ESG report processing pipeline status" },
    { title: "Scientific Carbon Factors", desc: "Inspect GHG Protocol conversion factors", prompt: "Show scientific carbon emission conversion factors for HSD and Grid" },
    { title: "Avoided Emissions Review", desc: "Audit solar PPA clean avoided tCO2e", prompt: "Verify avoided emissions calculation for 37.8M kWh clean solar power" }
  ],
  workforce: [
    { title: "Extract MEIL Workforce", desc: "Query Employee ESG API for headcount", prompt: "Extract employee data for MEIL" },
    { title: "Gender Diversity Ratio", desc: "Female representation across levels", prompt: "What are the gender diversity and equal remuneration disclosures for MEIL?" },
    { title: "Safety & Zero Harm", desc: "LTIFR, fatalities and training hours", prompt: "Show safety metrics and zero fatality audit records" },
    { title: "Fair Wages & POSH", desc: "Minimum wages and committee compliance", prompt: "Extract POSH committee cases and minimum wages compliance" }
  ],
  charts: [
    { title: "Show P6 Environment", desc: "Interactive bar & donut charts for P6", prompt: "Show P6 Environment" },
    { title: "Compare P1, P3, P5", desc: "Ethics, Employee & Human Rights", prompt: "P1, P3, P5" },
    { title: "P3 Workforce Disclosures", desc: "Training, safety & wages visualization", prompt: "P3" },
    { title: "All 9 Principles Charts", desc: "Complete visual dashboard across all principles", prompt: "all" }
  ]
};

// State Variables
let currentMode = "auto";
let currentCompanyId = "";
let currentCompanyName = "MEIL Group";
let currentProjectId = "";
let currentProjectName = "";
let currentSessionId = "";
let chatBusy = false;
let speechRecognizer = null;
let conversationHistory = [];

// ===================== INITIALIZATION =====================
async function initAIAssistant() {
  await loadCompanies();
  renderPromptCards();
  setupInputHandlers();
  fetchAndRenderHealth();
}

// ===== Quick Prompt Trigger =====
window.triggerQuickPrompt = function(promptText) {
  const input = document.getElementById("chatInput");
  if (!input) return;
  input.value = promptText;
  handleSend();
};

// ===== Set Copilot Mode =====
window.setCopilotMode = function(mode) {
  currentMode = mode;
  document.querySelectorAll(".mode-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });

  const modeLabels = {
    auto: "Smart Router",
    environmental: "Environmental AI",
    emissions: "Emission Processing",
    workforce: "Workforce & Social",
    charts: "BRSR Visualizer"
  };
  const modePlaceholders = {
    auto: 'Ask an ESG question or enter an instruction (e.g. "Show P6" or "Scope 1 overview")...',
    environmental: 'Ask Environmental Chatbot (e.g. "How to calculate water recycling under P6?")...',
    emissions: 'Enter report processing command (e.g. "Process report #1")...',
    workforce: 'Query workforce intelligence (e.g. "Extract employee data for MEIL")...',
    charts: 'Enter principle codes to visualize (e.g. "P6", "P1, P3, P5", or "all")...'
  };

  const lbl = document.getElementById("sessionModeLabel");
  if (lbl) lbl.textContent = modeLabels[mode] || mode;

  const inp = document.getElementById("chatInput");
  if (inp) inp.placeholder = modePlaceholders[mode] || "Ask an ESG question...";

  renderPromptCards();
};

// ===== Render Prompt Cards =====
function renderPromptCards() {
  const grid = document.getElementById("promptsGrid");
  if (!grid) return;

  const prompts = MODE_PROMPTS[currentMode] || MODE_PROMPTS.auto;
  grid.innerHTML = prompts.map(p => `
    <div class="suggest-card" onclick="triggerQuickPrompt('${escAttr(p.prompt)}')">
      <div>
        <div class="s-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div class="s-title">${escHtml(p.title)}</div>
        <div class="s-desc">${escHtml(p.desc)}</div>
      </div>
      <div class="s-arrow">→</div>
    </div>
  `).join("");
}

// ===== Switch Right Tabs =====
window.switchRightTab = function(tabName) {
  const visPanel = document.getElementById("rpVisualizer");
  if (visPanel) visPanel.style.display = "flex";
};

// ===== Fetch Microservices Health =====
async function fetchAndRenderHealth() {
  const container = document.getElementById("inspectorHealthContent");
  const dotEnv = document.getElementById("dotEnvSrv");
  const dotEmis = document.getElementById("dotEmisSrv");
  const dotEmp = document.getElementById("dotEmpSrv");

  try {
    const res = await fetch("/api/ai/microservices/health");
    if (!res.ok) throw new Error("Health check failed HTTP " + res.status);
    const health = await res.json();

    function getDotClass(status) {
      if (status === "ONLINE") return "srv-dot";
      if (status === "DEGRADED" || status === "KEY_REQUIRED") return "srv-dot warn";
      return "srv-dot err";
    }
    function getStatusBadge(status) {
      if (status === "ONLINE") return '<span style="color:#34d399; font-weight:700;">ONLINE</span>';
      if (status === "DEGRADED" || status === "KEY_REQUIRED") return '<span style="color:#f5b72e; font-weight:700;">DEGRADED</span>';
      return '<span style="color:#f87171; font-weight:700;">UNAVAILABLE</span>';
    }

    // Update Dots
    if (dotEnv) dotEnv.className = getDotClass(health.environmentalChatbot?.status);
    if (dotEmis) dotEmis.className = getDotClass(health.emissionProcessing?.status);
    if (dotEmp) dotEmp.className = getDotClass(health.employeeReporting?.status);

    if (container) {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;">
            <div><strong style="color:#fff;">1. Environmental Chatbot:</strong> ${getStatusBadge(health.environmentalChatbot?.status)}</div>
            <span style="font-size:10.5px; color:#8c8c94;">${escHtml(health.environmentalChatbot?.note || 'POST /chat operational')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;">
            <div><strong style="color:#fff;">2. ESG Report Processing:</strong> ${getStatusBadge(health.emissionProcessing?.status)}</div>
            <span style="font-size:10.5px; color:#8c8c94;">${escHtml(health.emissionProcessing?.note || 'POST /process requires API Key')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div><strong style="color:#fff;">3. Employee ESG Reporting:</strong> ${getStatusBadge(health.employeeReporting?.status)}</div>
            <span style="font-size:10.5px; color:#8c8c94;">${escHtml(health.employeeReporting?.note || 'Supabase + Groq Connected')}</span>
          </div>
        </div>
      `;
    }
  } catch (e) {
    if (container) container.innerHTML = `<span style="color:#f87171;">Could not fetch microservice health: ${e.message}</span>`;
  }
}

// ===== Direct Microservice Runner =====
window.testDirectService = async function(type) {
  switchRightTab("inspector");
  const rawBox = document.getElementById("rawApiResponse");
  const badge = document.getElementById("inspStatusBadge");
  if (badge) { badge.textContent = "RUNNING"; badge.style.color = "#f5b72e"; }

  if (rawBox) rawBox.textContent = `Dispatching test call to ${type.toUpperCase()} microservice...`;

  try {
    let result = null;
    if (type === "env") {
      const res = await fetch("/api/ai/environment-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What is Scope 1 emissions?", projectId: 1 })
      });
      result = await res.json();
    } else if (type === "process") {
      const res = await fetch("/api/ai/emission-process/1", { method: "POST" });
      result = await res.json();
    } else if (type === "employee") {
      const res = await fetch("/api/ai/employee-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: currentCompanyName || "MEIL" })
      });
      result = await res.json();
    }

    if (rawBox) rawBox.textContent = JSON.stringify(result, null, 2);
    const isOk = result && result.ok !== false && !result.error && !result.detail;
    if (badge) {
      if (isOk) {
        badge.textContent = "200 SUCCESS";
        badge.style.color = "#34d399";
      } else {
        const statusCode = result?.status || (result?.isConfigurationError ? 503 : "STATUS");
        badge.textContent = `HTTP ${statusCode} (${result?.isConfigurationError ? 'KEY REQUIRED' : 'UPSTREAM ISSUE'})`;
        badge.style.color = "#f5b72e";
      }
    }
  } catch (err) {
    if (rawBox) rawBox.textContent = `Error: ${err.message}`;
    if (badge) { badge.textContent = "NETWORK ERROR"; badge.style.color = "#f87171"; }
  }
};

// ===== Load Companies & Projects =====
async function loadCompanies() {
  const sel = document.getElementById("companySelect");
  try {
    const entities = await api("/entities");
    sel.innerHTML = '<option value="">Select a company</option>';
    entities.forEach(e => {
      if (e.isPlaceholder) return;
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = e.name;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", onCompanyChange);
    if (entities.length > 0) {
      sel.selectedIndex = 1;
      await onCompanyChange();
    }
  } catch (err) {
    const defaults = [
      { id: "ENT-MEIL", name: "Megha Engineering and Infrastructures Limited (MEIL)" },
      { id: "PLANT1", name: "Olectra Greentech Ltd." },
      { id: "ENT-MHL", name: "MEIL Holdings Limited (MHL)" }
    ];
    sel.innerHTML = '<option value="">Select a company</option>';
    defaults.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = e.name;
      sel.appendChild(opt);
    });
    sel.selectedIndex = 1;
    currentCompanyId = "ENT-MEIL";
    currentCompanyName = defaults[0].name;
    const projSel = document.getElementById("projectSelect");
    if (projSel) {
      projSel.innerHTML = `
        <option value="">Select a project</option>
        <option value="PLANT1" selected>Plant 01 EV Bus Manufacturing Complex (92%)</option>
        <option value="PLANT4">Plant 04 Heavy Engineering & Fabrication (88%)</option>
      `;
      currentProjectId = "PLANT1";
      currentProjectName = "Plant 01 EV Bus Manufacturing Complex";
    }
    updateContextPill();
  }
}

async function onCompanyChange() {
  const compId = document.getElementById("companySelect").value;
  const compSel = document.getElementById("companySelect");
  const projSel = document.getElementById("projectSelect");
  currentCompanyId = compId || "ENT-MEIL";
  currentCompanyName = compSel.options[compSel.selectedIndex]?.textContent || "MEIL Group";
  currentProjectId = "";
  currentProjectName = "";
  updateContextPill();

  if (!compId) {
    projSel.innerHTML = '<option value="">Select a project</option>';
    return;
  }

  projSel.innerHTML = '<option value="">Loading projects...</option>';
  try {
    const data = await api("/entities/" + compId);
    if (data && data.projects && data.projects.length > 0) {
      projSel.innerHTML = '<option value="">Select a project</option>';
      data.projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name + " (" + p.completionPct + "%)";
        projSel.appendChild(opt);
      });
      projSel.selectedIndex = 1;
      onProjectChange();
    } else {
      projSel.innerHTML = '<option value="">No projects available</option>';
    }
    projSel.addEventListener("change", onProjectChange);
  } catch (err) {
    projSel.innerHTML = `
      <option value="">Select a project</option>
      <option value="PLANT1" selected>Plant 01 EV Bus Manufacturing Complex (92%)</option>
      <option value="PLANT4">Plant 04 Heavy Engineering & Fabrication (88%)</option>
    `;
    currentProjectId = "PLANT1";
    currentProjectName = "Plant 01 EV Bus Manufacturing Complex";
    updateContextPill();
  }
}

function onProjectChange() {
  const sel = document.getElementById("projectSelect");
  currentProjectId = sel.value;
  currentProjectName = sel.options[sel.selectedIndex]?.textContent || "";
  updateContextPill();
}

function updateContextPill() {
  const pill = document.getElementById("ctxPill");
  const text = document.getElementById("ctxPillText");
  if (!pill) return;
  if (currentCompanyId && currentProjectId) {
    pill.classList.add("ready");
    pill.innerHTML = `<span>✓</span> <span>Ready to explore</span>`;
  } else {
    pill.classList.remove("ready");
    pill.innerHTML = `<span>ⓘ</span> <span>Select both to get started</span>`;
  }
}

// ===== Input Handlers =====
function setupInputHandlers() {
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  if (sendBtn) sendBtn.addEventListener("click", handleSend);
  if (input) {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
}

// ===== Conversation Reset =====
window.resetConversation = function() {
  currentSessionId = "";
  conversationHistory = [];
  const feed = document.getElementById("chatFeed");
  const ctrl = document.getElementById("sessionCtrlBar");
  const hero = document.getElementById("heroIntro");
  const shortId = document.getElementById("sessionShortId");

  if (feed) { feed.innerHTML = ""; feed.style.display = "none"; }
  if (ctrl) ctrl.style.display = "none";
  if (hero) hero.style.display = "block";
  if (shortId) shortId.textContent = "New";
  toast("Conversation session cleared.");
};

// ===================== CORE DISPATCH & SEND HANDLER =====================
window.handleSend = handleSend;
async function handleSend() {
  if (chatBusy) return;
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const text = (input ? input.value : "").trim();
  if (!text) return;

  // 1. CLEAR INPUT FIELD
  if (input) input.value = "";

  // 2. IMMEDIATELY REVEAL CHAT FEED & HIDE HERO BANNER
  const feed = document.getElementById("chatFeed");
  const hero = document.getElementById("heroIntro");
  const ctrl = document.getElementById("sessionCtrlBar");

  if (hero) hero.style.display = "none";
  if (ctrl) ctrl.style.display = "flex";
  if (feed) {
    feed.style.display = "flex";
  }

  // 3. RENDER USER MESSAGE BUBBLE INSTANTLY
  appendUserMessage(text);

  // 4. SHOW TYPING INDICATOR INSTANTLY
  showTypingIndicator("AI is thinking...");
  chatBusy = true;
  if (sendBtn) sendBtn.disabled = true;

  // 5. SET IN-MEMORY DEFAULTS WITHOUT BLOCKING
  if (!currentCompanyId) currentCompanyId = "ENT-MEIL";
  if (!currentProjectId) currentProjectId = "PLANT1";
  if (!currentCompanyName) currentCompanyName = "MEIL Group";

  const lower = text.toLowerCase();
  if (lower.includes("pdf") || (lower.includes("report") && (lower.includes("download") || lower.includes("generate")))) {
    removeTypingIndicator();
    chatBusy = false;
    if (sendBtn) sendBtn.disabled = false;
    appendAssistantMessage(`
      <strong>Consolidated SEBI BRSR & Portal Reports Ready!</strong><br>
      Aap niche diye gaye kisi bhi portal ka official PDF report download kar sakte hain:<br><br>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
        <a href="/api/reports/pdf/master" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#f5b72e; color:#000; font-weight:800; font-size:12px; padding:7px 14px; border-radius:6px; text-decoration:none;">
          📥 Master SEBI Report (PDF)
        </a>
        <a href="/api/reports/pdf/plant" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#1e1e24; border:1px solid #f5b72e; color:#f5b72e; font-weight:700; font-size:12px; padding:7px 12px; border-radius:6px; text-decoration:none;">
          ⚙️ Plant Operations PDF
        </a>
        <a href="/api/reports/pdf/ehs" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#1e1e24; border:1px solid #34d399; color:#34d399; font-weight:700; font-size:12px; padding:7px 12px; border-radius:6px; text-decoration:none;">
          🌿 EHS Carbon PDF
        </a>
        <a href="/api/reports/pdf/hr" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#1e1e24; border:1px solid #c084fc; color:#c084fc; font-weight:700; font-size:12px; padding:7px 12px; border-radius:6px; text-decoration:none;">
          👥 HR Social PDF
        </a>
        <a href="/api/reports/pdf/auditor" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#1e1e24; border:1px solid #38bdf8; color:#38bdf8; font-weight:700; font-size:12px; padding:7px 12px; border-radius:6px; text-decoration:none;">
          🔍 Auditor Seal PDF
        </a>
        <a href="/api/reports/pdf/board" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#1e1e24; border:1px solid #f5b72e; color:#f5b72e; font-weight:700; font-size:12px; padding:7px 12px; border-radius:6px; text-decoration:none;">
          👔 Board Briefing PDF
        </a>
      </div>
    `);
    return;
  }

  // Check if Mode is explicitly Charts OR query directly asks for Principle charts
  const principleCodes = parsePrinciples(text);
  if (currentMode === "charts" || (currentMode === "auto" && principleCodes && principleCodes.length > 0 && isVisualRequest(text))) {
    switchRightTab("visualizer");
    try {
      await generateCharts(principleCodes || ["P6"]);
      removeTypingIndicator();
      appendAssistantMessage(
        `Generated interactive comparison charts for **${(principleCodes || ["P6"]).join(", ")}** from live project records. You can examine current vs previous fiscal metrics in the **Report Visualizer** panel.`,
        { service: "BRSR Analytics Visualizer", mode: "charts" }
      );
    } catch (err) {
      removeTypingIndicator();
      appendAssistantMessage(`Failed to generate charts: ${err.message}`, { service: "BRSR Engine", isError: true });
    } finally {
      chatBusy = false;
      if (sendBtn) sendBtn.disabled = false;
    }
    return;
  }

  // Instant response for common greetings so user never experiences lag on 'hii'
  const isGreeting = /^(hi|hii|hiii|hiiii|hlw|hlww|hlwww|hello|hey|heyy|namaste|pranam|kya haal hai|kaise ho|hlo|helo|how|howw|bye|byee|tata)\b/i.test(lower);
  if (isGreeting) {
    setTimeout(() => {
      removeTypingIndicator();
      appendAssistantMessage(
        `Namaste! Main **BPUT 2.O** ka Unified ESG AI Assistant hoon. Main teeno Railway microservices ke sath live connected hoon.\n\nAap mujhse ye sab pooch sakte hain:\n• **🌿 Scope 1, 2, 3 Emissions:** Diesel, CNG ya grid electricity ke tCO₂e calculations\n• **💧 Water & Waste:** Water withdrawal, STP recycling % ya CPCB hazardous waste rules\n• **👥 Workforce Governance:** Headcount, gender diversity ratio ya safety LTIFR\n• **📊 Charts:** *"Show P6"* ya *"all"* bolkar right side panel mein live BRSR visual graphs dekhein`,
        { service: "Unified ESG Copilot", mode: "auto" }
      );
      chatBusy = false;
      if (sendBtn) sendBtn.disabled = false;
    }, 200);
    return;
  }

  // Dispatched Microservice AI Request
  try {
    const response = await fetch("/api/ai/unified-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        mode: currentMode,
        sessionId: currentSessionId || undefined,
        projectId: 1,
        companyName: currentCompanyName || "MEIL",
        reportId: 1
      })
    });

    const result = await response.json();
    removeTypingIndicator();

    // Store Session ID if returned (Environmental Chatbot)
    if (result.sessionId) {
      currentSessionId = result.sessionId;
      const shortId = document.getElementById("sessionShortId");
      if (shortId) shortId.textContent = currentSessionId.slice(0, 8) + "…";
    }

    // Update Inspector Payload
    const rawBox = document.getElementById("rawApiResponse");
    const badge = document.getElementById("inspStatusBadge");
    if (rawBox) rawBox.textContent = JSON.stringify(result, null, 2);
    if (badge) {
      const isCallOk = response.ok && result.ok !== false && !result.error;
      badge.textContent = isCallOk ? "200 SUCCESS" : `HTTP ${response.status || result.status || 502}`;
      badge.style.color = isCallOk ? "#34d399" : "#f5b72e";
    }

    if (result.reply) {
      appendAssistantMessage(result.reply, {
        service: result.service || "ESG Intelligence Assistant",
        mode: result.modeUsed || currentMode,
        upstreamNote: result.upstreamNote
      });
    } else if (result.error) {
      appendAssistantMessage(
        `**${result.service || 'Upstream Service'} Note:**\n${result.error}`,
        { service: result.service || "ESG Intelligence", isWarning: true }
      );
    } else if (result.data) {
      // Formatted JSON representation
      appendAssistantMessage(
        `**Service Output (${result.service || 'Microservice'}):**\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\``,
        { service: result.service || "Microservice", mode: currentMode }
      );
    } else {
      appendAssistantMessage("Received response from ESG services.", { service: "ESG Engine" });
    }

  } catch (err) {
    removeTypingIndicator();
    appendAssistantMessage(`Communication error: ${err.message}. Please check local network or backend server.`, {
      service: "System Error",
      isError: true
    });
  } finally {
    chatBusy = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

function isVisualRequest(text) {
  const lower = text.toLowerCase();
  return lower.includes("chart") || lower.includes("visual") || lower.includes("graph") ||
         lower.includes("show") || lower.includes("dikhao") || lower.includes("display") ||
         lower.includes("all") || lower.includes("sab");
}

// ===== Append Chat Bubbles =====
function appendUserMessage(text) {
  const feed = document.getElementById("chatFeed");
  if (!feed) return;

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble-user";
  bubble.textContent = text;
  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;
}

function appendAssistantMessage(content, meta = {}) {
  const feed = document.getElementById("chatFeed");
  if (!feed) return;

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble-ai";

  const badgeText = meta.service || "Unified ESG Assistant";
  const formattedHtml = renderMarkdown(content);

  bubble.innerHTML = `
    <div class="ai-header">
      <span class="ai-source-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        ${escHtml(badgeText)}
      </span>
      <button class="copy-msg-btn" onclick="copyBubbleText(this)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy
      </button>
    </div>
    <div class="ai-md-body">${formattedHtml}</div>
    ${meta.upstreamNote ? `<div style="font-size:11px; color:#f5b72e; margin-top:8px; border-top:1px dashed rgba(255,255,255,0.08); padding-top:4px;">ⓘ ${escHtml(meta.upstreamNote)}</div>` : ''}
  `;

  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;
}

function showTypingIndicator(text = "Thinking...") {
  removeTypingIndicator();
  const feed = document.getElementById("chatFeed");
  if (!feed) return;

  const ind = document.createElement("div");
  ind.id = "chatTypingIndicator";
  ind.className = "chat-typing-indicator";
  ind.innerHTML = `
    <div class="typing-dots">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
    <span>${escHtml(text)}</span>
  `;
  feed.appendChild(ind);
  feed.scrollTop = feed.scrollHeight;
}

function removeTypingIndicator() {
  const ind = document.getElementById("chatTypingIndicator");
  if (ind) ind.remove();
}

window.copyBubbleText = function(btn) {
  const body = btn.closest(".chat-bubble-ai")?.querySelector(".ai-md-body");
  if (body) {
    navigator.clipboard.writeText(body.innerText).then(() => {
      btn.innerHTML = `✓ Copied`;
      setTimeout(() => {
        btn.innerHTML = `
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg> Copy`;
      }, 2000);
    });
  }
};

// ===================== ROBUST MARKDOWN TO HTML RENDERER =====================
function renderMarkdown(md) {
  if (!md) return "";
  let text = String(md);

  // Code blocks ```language ... ```
  text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="insp-code" style="margin:8px 0; background:#08080a;"><code>${escHtml(code.trim())}</code></pre>`;
  });

  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08); padding:2px 5px; border-radius:4px; font-family:monospace; font-size:11px; color:#fce794;">$1</code>');

  // Headings
  text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Blockquotes
  text = text.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Markdown Tables (| a | b |)
  const lines = text.split('\n');
  let inTable = false;
  let tableHtml = '';
  const finalLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      // Table line
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      // Check if separator line (e.g. |---|---|)
      const isSep = cells.every(c => /^[-:]+$/.test(c));

      if (!inTable) {
        inTable = true;
        tableHtml = '<table class="ai-md-table"><thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      } else if (isSep) {
        // separator row, skip
        continue;
      } else {
        tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table>';
        finalLines.push(tableHtml);
      }
      finalLines.push(lines[i]);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table>';
    finalLines.push(tableHtml);
  }

  text = finalLines.join('\n');

  // Bullet points
  text = text.replace(/^\s*[-•]\s+(.*$)/gim, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');

  // Paragraphs
  text = text.split('\n\n').map(p => {
    if (p.startsWith('<h') || p.startsWith('<table') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<block')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return text;
}

// ===== Principle Parsing Logic =====
function parsePrinciples(text) {
  const lower = text.toLowerCase().trim();

  // "all" keyword
  if (/^all\b/i.test(lower) || /\ball\s*(9|nine)?\s*principles?\b/i.test(lower) ||
      lower === "sab" || lower === "sabhi" || lower === "sab dikha" ||
      lower === "sab dikhao" || lower === "all reports" || lower === "everything" ||
      /\bsab\s*(dikha|dikhao|de|do)\b/i.test(lower) || /\bsabhi\b/i.test(lower) ||
      /\bpura\s*report\b/i.test(lower) || /\bfull\s*report\b/i.test(lower)) {
    return PRINCIPLES.map(p => p.code);
  }

  // Direct P1-P9 pattern
  const pMatches = text.match(/\bP[1-9]\b/gi);
  if (pMatches && pMatches.length > 0) {
    return [...new Set(pMatches.map(p => p.toUpperCase()))];
  }

  // "Principle 1", "Principle 6"
  const numMatches = text.match(/principle\s*([1-9])/gi);
  if (numMatches) {
    return [...new Set(numMatches.map(m => "P" + m.match(/[1-9]/)[0]))];
  }

  // Match by keyword
  const matched = [];
  PRINCIPLES.forEach(p => {
    const hit = p.keywords.some(kw => lower.includes(kw));
    if (hit) matched.push(p.code);
  });
  if (matched.length > 0) return [...new Set(matched)];

  return null;
}

// ===================== BRSR CHART GENERATOR =====================
async function generateCharts(principleCodes) {
  const report = await api("/projects/" + currentProjectId + "/report");
  if (!report || !report.principles) {
    throw new Error("Could not load report data for project " + currentProjectId);
  }

  const selectedPrinciples = report.principles.filter(p => principleCodes.includes(p.code));
  if (selectedPrinciples.length === 0) {
    throw new Error("No disclosure data found for principles " + principleCodes.join(", "));
  }

  const emptyState = document.getElementById("rpEmpty");
  const liveContainer = document.getElementById("rpLive");

  if (emptyState) emptyState.style.display = "none";
  if (liveContainer) {
    liveContainer.style.display = "flex";
    liveContainer.innerHTML = "";
  }

  // Summary box
  const summaryBox = document.createElement("div");
  summaryBox.style.cssText = "border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 12px;";
  summaryBox.innerHTML = `
    <div style="font-size: 13.5px; font-weight: 800; color: #fff;">${escHtml(report.project.name)}</div>
    <div style="font-size: 11.5px; color: #8c8c94; margin-top: 2px;">
      Reporting Cycle: <strong style="color:#f5b72e;">${report.reportingPeriod.currentFY}</strong> • Completion: <strong style="color:#34d399;">${report.stats.completionPct}%</strong>
    </div>
  `;
  liveContainer.appendChild(summaryBox);

  // Build principle visual blocks
  selectedPrinciples.forEach(principle => {
    const block = document.createElement("div");
    block.className = "live-pr-block";

    const title = document.createElement("div");
    title.className = "live-pr-title";
    title.innerHTML = `<span>${principle.code} — ${principle.name}</span><span style="font-size:11px;color:#8c8c94;font-weight:normal;">${principle.items ? principle.items.length : 0} indicators</span>`;
    block.appendChild(title);

    const items = principle.items || [];
    const numericItems = items.filter(it =>
      it.hasData && it.currentFY !== "Not entered" &&
      (typeof it.currentFY === "number" || !isNaN(parseFloat(it.currentFY)))
    );
    const qualItems = items.filter(it => {
      if (!it.hasData) return true;
      if (it.currentFY === "Not entered") return true;
      if (typeof it.currentFY === "string" && isNaN(parseFloat(it.currentFY))) return true;
      return false;
    });

    if (numericItems.length > 0) {
      block.appendChild(createBarChartForItems(numericItems, report.reportingPeriod, principle.code));
    }

    const statusCounts = { entered: 0, notEntered: 0 };
    items.forEach(it => {
      if (it.hasData && it.currentFY !== "Not entered") statusCounts.entered++;
      else statusCounts.notEntered++;
    });
    if (items.length > 0) {
      block.appendChild(createDonutChart(statusCounts, principle.code, items.length));
    }

    if (qualItems.length > 0) {
      block.appendChild(createStatusTable(qualItems));
    }

    liveContainer.appendChild(block);
  });
}

function createBarChartForItems(items, period, pCode) {
  const wrap = document.createElement("div");
  wrap.className = "live-chart-wrap";

  const displayItems = items.slice(0, 8);
  const labels = displayItems.map(it => {
    const s = it.indicator || "";
    return s.length > 18 ? s.slice(0, 16) + "…" : s;
  });
  const currentVals = displayItems.map(it => parseFloat(it.currentFY) || 0);
  const prevVals = displayItems.map(it => {
    if (it.previousFY === "No data available" || it.previousFY === "Not entered") return 0;
    return parseFloat(it.previousFY) || 0;
  });
  const units = [...new Set(displayItems.map(it => it.unit).filter(u => u && u !== "—"))];

  const titleDiv = document.createElement("div");
  titleDiv.style.cssText = "font-size:11px; font-weight:700; color:#8c8c94; margin-bottom:6px; display:flex; justify-content:space-between;";
  titleDiv.innerHTML = `<span>Current vs Previous FY</span><span>${units.join(", ") || ""}</span>`;
  wrap.appendChild(titleDiv);

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "170px";
  wrap.appendChild(canvas);

  setTimeout(() => drawComparisonBarChart(canvas, labels, currentVals, prevVals, period), 50);

  const actions = document.createElement("div");
  actions.className = "live-chart-actions";
  const dlBtn = document.createElement("button");
  dlBtn.className = "btn-c-action";
  dlBtn.textContent = "⬇ PNG";
  dlBtn.onclick = () => downloadCanvas(canvas, `${pCode}_barchart.png`);
  actions.appendChild(dlBtn);

  const zoomBtn = document.createElement("button");
  zoomBtn.className = "btn-c-action";
  zoomBtn.textContent = "🔍 Larger";
  zoomBtn.onclick = () => showLightbox(canvas);
  actions.appendChild(zoomBtn);

  wrap.appendChild(actions);
  return wrap;
}

function drawComparisonBarChart(canvas, labels, currentVals, prevVals, period) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.clientWidth * 2;
  const H = canvas.height = canvas.clientHeight * 2;
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 30, right: 16, bottom: 60, left: 45 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const n = labels.length;
  const allVals = [...currentVals, ...prevVals];
  const max = Math.max(...allVals, 1) * 1.15;
  const groupW = chartW / n;
  const barW = groupW * 0.32;

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = pad.top + chartH * (i / 3);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = "#666";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(max * (1 - i / 3)).toLocaleString(), pad.left - 6, y + 5);
  }

  // Draw Bars
  labels.forEach((label, i) => {
    const gx = pad.left + i * groupW + groupW * 0.16;

    // Prev FY
    const pH = chartH * (prevVals[i] / max);
    ctx.fillStyle = "#3e3e46";
    ctx.fillRect(gx, pad.top + chartH - pH, barW, pH);

    // Curr FY
    const cH = chartH * (currentVals[i] / max);
    const grad = ctx.createLinearGradient(0, pad.top + chartH - cH, 0, pad.top + chartH);
    grad.addColorStop(0, "#f5b72e");
    grad.addColorStop(1, "#b88210");
    ctx.fillStyle = grad;
    ctx.fillRect(gx + barW + 3, pad.top + chartH - cH, barW, cH);

    // Label
    ctx.fillStyle = "#8c8c94";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(gx + barW, pad.top + chartH + 14);
    ctx.rotate(-0.35);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });

  // Legend
  ctx.font = "14px sans-serif";
  const lx = W - pad.right - 170;
  ctx.fillStyle = "#3e3e46"; ctx.fillRect(lx, 10, 10, 10);
  ctx.fillStyle = "#888"; ctx.textAlign = "left";
  ctx.fillText(period.previousFY || "Prev", lx + 14, 20);

  ctx.fillStyle = "#f5b72e"; ctx.fillRect(lx + 80, 10, 10, 10);
  ctx.fillStyle = "#f5b72e"; ctx.fillText(period.currentFY || "Curr", lx + 94, 20);
}

function createDonutChart(counts, pCode, total) {
  const wrap = document.createElement("div");
  wrap.className = "live-chart-wrap";

  const titleDiv = document.createElement("div");
  titleDiv.style.cssText = "font-size:11px; font-weight:700; color:#8c8c94; margin-bottom:6px;";
  titleDiv.innerHTML = `<span>Coverage Breakdown</span>`;
  wrap.appendChild(titleDiv);

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "140px";
  wrap.appendChild(canvas);

  setTimeout(() => {
    drawDonut(canvas, [
      { label: "Entered", value: counts.entered, color: "#34d399" },
      { label: "Not Entered", value: counts.notEntered, color: "rgba(245,183,46,0.3)" }
    ]);
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const pct = total > 0 ? Math.round((counts.entered / total) * 100) : 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pct + "%", cx, cy - 6);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#8c8c94";
    ctx.fillText("coverage", cx, cy + 16);
  }, 50);

  const legend = document.createElement("div");
  legend.style.cssText = "font-size:11px;color:#8c8c94;padding:6px 0 0;display:flex;gap:12px;justify-content:center;";
  legend.innerHTML = `<span>🟢 Entered: <strong>${counts.entered}</strong></span><span>🟡 Pending: <strong>${counts.notEntered}</strong></span>`;
  wrap.appendChild(legend);

  return wrap;
}

function createStatusTable(items) {
  const wrap = document.createElement("div");
  wrap.className = "live-chart-wrap";
  wrap.innerHTML = `
    <div style="font-size:11px; font-weight:700; color:#8c8c94; margin-bottom:6px;">Qualitative Disclosures</div>
    <table style="width:100%; border-collapse:collapse; font-size:11.5px; color:#ccc;">
      <tbody>
        ${items.slice(0, 5).map(it => `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
            <td style="padding: 5px 0;">${escHtml(it.indicator)}</td>
            <td style="text-align:right; color:#f5b72e; padding: 5px 0;">${escHtml(String(it.currentFY || 'Not entered'))}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  return wrap;
}

// ===================== UTILITY HELPERS =====================
function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function escAttr(str) {
  return String(str || "").replace(/"/g, "&quot;").replace(/'/g, "\\'");
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function showLightbox(canvas) {
  const overlay = document.createElement("div");
  overlay.className = "chart-lightbox";
  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  overlay.appendChild(img);
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}
