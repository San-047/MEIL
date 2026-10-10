/**
 * AI Copilot Semantic Engine for MEIL BRSR ESG Command Center
 * Supports:
 * - Devanagari to Latin Phonetic Transliteration
 * - Hinglish ASR Phonetic Error Autocorrection
 * - Levenshtein Distance & Token Overlap Fuzzy Matching
 * - Compound Command Chaining ("aur", "then", "fir", "karke")
 * - Optional Google Gemini LLM API Reasoning (when GEMINI_API_KEY is available)
 */

const https = require("https");

// Common Hindi & Devanagari Terminology Dictionary
const DEVANAGARI_DICT = {
  "नागार्जुन": "nagarjuna",
  "सागर": "sagar",
  "गोदावरी": "godavari",
  "कालेश्वरम": "kaleshwaram",
  "सुरेश": "suresh",
  "रेड्डी": "reddy",
  "प्रिया": "priya",
  "नायर": "nair",
  "विक्रम": "vikram",
  "सिंह": "singh",
  "अनन्या": "ananya",
  "वर्मा": "verma",
  "ओलेक्ट्रा": "olectra",
  "इलेक्ट्रा": "olectra",
  "ग्रीनटेक": "greentech",
  "इवी": "evey",
  "एवी": "evey",
  "ड्रिलमेक": "drillmec",
  "पेट्रेवेन": "petreven",
  "मेघा": "megha",
  "गैस": "gas",
  "आईकॉम": "icomm",
  "भुवनेश्वर": "bhubaneswar",
  "बलसुआ": "balsua",
  "हिरानगर": "hiranagar",
  "विजयवाड़ा": "vijayawada",
  "मेघावरम": "meghavaram",
  "फाइबर": "fibre",
  "ग्लास": "glass",
  "मीडिया": "media",
  "पानी": "water",
  "जल": "water",
  "वॉटर": "water",
  "बिजली": "electricity",
  "विद्युत": "electricity",
  "ऊर्जा": "energy",
  "सर्च": "search",
  "खोज": "search",
  "खोजो": "search",
  "ढूंढो": "search",
  "एडिट": "edit",
  "बदलो": "edit",
  "संपादित": "edit",
  "खोलो": "open",
  "खोल": "open",
  "स्कोप": "scope",
  "वैलिडेशन": "validation",
  "सत्यापन": "validation",
  "जांच": "validation",
  "रिपोर्ट": "report",
  "डाउनलोड": "download",
  "एक्सपोर्ट": "export",
  "क्रिटिकल": "critical",
  "गंभीर": "critical",
  "वार्निंग": "warning",
  "चेतावनी": "warning",
  "अप्रूव": "approved",
  "स्वीकृत": "approved",
  "सेव": "save",
  "जमा": "save",
  "बंद": "close",
  "रद्द": "cancel",
  "डैशबोर्ड": "dashboard",
  "ऑडिट": "audit"
};

// Common English ASR mishearings of Indian accents / Hinglish
const ASR_PHONETIC_CORRECTIONS = [
  // Compound / conjunctions
  { regex: /\b(?:and|our)\b/gi, replace: "aur" },

  // Verbs & actions
  { regex: /\bopen\s+(?:car|kart|kar|kr|call)\b/gi, replace: "open kar" },
  { regex: /\bedit\s+(?:car|kart|kar|kr)\b/gi, replace: "edit kar" },
  { regex: /\b(?:cardo|car\s+do|card\s+o|curfew|cur\s+do)\b/gi, replace: "kar do" },
  { regex: /\b(?:khol\s+de|khol\s+do|call\s+kar|cold\s+kar|hold\s+kar)\b/gi, replace: "khol do" },
  { regex: /\b(?:leak|lake|like|leek)\b/gi, replace: "likh" },
  { regex: /\b(?:wallah|wallet|roller|valah|walah|well\s+it)\b/gi, replace: "wala" },
  { regex: /\b(?:save\s+car|safe\s+kar)\b/gi, replace: "save kar" },
  { regex: /\b(?:trace\s+car|trace\s+call)\b/gi, replace: "trace kar" },

  // Real MEIL Entities (CRISIL / Corporate Structure)
  { regex: /\b(?:electra|electra greentech|olectra greentech|olectra green|olectra)\b/gi, replace: "olectra greentech" },
  { regex: /\b(?:heavy trans|every trans|av trans|ev trans|evey trans|evey)\b/gi, replace: "evey trans" },
  { regex: /\b(?:i com|eye com|i come|icom tele|icomm tele|i comm|icomm)\b/gi, replace: "icomm tele" },
  { regex: /\b(?:drill make|drill mic|drill mec|drillmec)\b/gi, replace: "drillmec" },
  { regex: /\b(?:petro ven|petro win|petreven)\b/gi, replace: "petreven" },
  { regex: /\b(?:mega gas|megha gas|megha)\b/gi, replace: "megha gas" },
  { regex: /\b(?:balsua|balsua hiranagar|hiranagar)\b/gi, replace: "balsua hiranagar" },
  { regex: /\b(?:vijaywada|vijayawada bypass|vijayawada)\b/gi, replace: "vijayawada bypass" },
  { regex: /\b(?:mega varam|meghavaram power|meghavaram)\b/gi, replace: "meghavaram power" },
  { regex: /\b(?:fiber glass|fibre glass)\b/gi, replace: "fibre glass" },
  { regex: /\b(?:meil media|media ltd)\b/gi, replace: "meil media" },

  // Legacy entities for backwards compatibility
  { regex: /\b(?:nokia\s+sugar|not\s+good\s+enough\s+sugar|nagarjun\s+sugar|nagarjun\s+sagar|nagar\s+juna\s+sagar|nagar\s+juna|nagarjun)\b/gi, replace: "nagarjuna sagar" },
  { regex: /\b(?:kalesh\s+warm|kalash\s+warm|kalesh\s+waram|collection\s+warm|kale\s+showroom|clash\s+war|kailash\s+waram|kalesh)\b/gi, replace: "kaleshwaram" },
  { regex: /\b(?:goodavari|godavary|go\s+davari|godawari)\b/gi, replace: "godavari" },

  // Entities: Personnel
  { regex: /\b(?:suresh\s+ready|suresh\s+redi|suraj\s+reddy|soresh\s+reddy)\b/gi, replace: "suresh reddy" },
  { regex: /\b(?:priya\s+nayar|priya\s+naer|riya\s+nair|priya\s+neir)\b/gi, replace: "priya nair" },
  { regex: /\b(?:bikram\s+singh|vikram\s+sing|vikram\s+seen)\b/gi, replace: "vikram singh" },

  // Indicators: Electricity & Water
  { regex: /\b(?:electric\s+city|bijli|bijlee|current)\b/gi, replace: "electricity" },
  { regex: /\b(?:paani|pani|jal)\b/gi, replace: "water" },

  // Dropdown options: Scope & Severity
  { regex: /\b(?:scope\s+light|scope\s+late|lite\s+scope)\b/gi, replace: "scope lite" },
  { regex: /\b(?:scope\s+car|car\s+scope|core\s+kpi)\b/gi, replace: "scope core" }
];

// Devanagari character to Latin phonetic mapping
const CHAR_MAP = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh",
  "ष": "sh", "स": "s", "ह": "h", "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy",
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri",
  "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "्": "",
  "ं": "n", "ँ": "n", "ः": "h"
};

/**
 * Transliterates Devanagari string to Latin phonetic equivalent
 */
function transliterateDevanagari(text) {
  if (!text) return "";
  let words = text.split(/\s+/);
  let convertedWords = words.map(w => {
    if (DEVANAGARI_DICT[w]) return DEVANAGARI_DICT[w];
    let res = "";
    for (let i = 0; i < w.length; i++) {
      let ch = w[i];
      res += CHAR_MAP[ch] !== undefined ? CHAR_MAP[ch] : ch;
    }
    return res;
  });
  return convertedWords.join(" ");
}

/**
 * Normalize and clean speech query
 */
function normalizeQuery(raw) {
  let clean = String(raw || "").trim();
  // Transliterate Devanagari if present
  if (/[\u0900-\u097F]/.test(clean)) {
    clean = transliterateDevanagari(clean);
  }
  // Apply phonetic ASR corrections
  for (const corr of ASR_PHONETIC_CORRECTIONS) {
    clean = clean.replace(corr.regex, corr.replace);
  }
  return clean
    .toLowerCase()
    .replace(/[।,!?;:"'(){}\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Levenshtein distance between two strings
 */
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * String similarity ratio [0, 1]
 */
function stringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const dist = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

/**
 * Strip conversational fillers
 */
function stripFillers(str) {
  return str
    .replace(/\b(bhai|yaar|bhaiya|kripya|please|zara|thoda|arey|oye|sun|suno|dekh|dekho)\b/gi, " ")
    .replace(/\b(karo|kar do|kar de|kar dena|khol de|kholo|khol|dikhao|dikha do|dikha)\b/gi, " ")
    .replace(/\b(chalao|chala do|chala|laga do|laga de|badlo|badal do|badal)\b/gi, " ")
    .replace(/\b(hata|hatao|hata do|nikal|nikal do|nikalo|chalo|le chal|jao|pe jao)\b/gi, " ")
    .replace(/\b(wala|wali|wale|ka|ki|ke|ko|se|me|mein|par|pe|bhi|toh|to)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse compound chained instructions
 */
function parseChainedInstructions(query) {
  return query
    .split(/\s+(?:aur|then|fir|phir|uske baad|karke|krke)\s+/i)
    .map(p => p.trim())
    .filter(Boolean);
}

/**
 * Autonomous Local Semantic Planner
 */
function planActionLocal(instruction, scene, page) {
  const clean = normalizeQuery(instruction);
  const stripped = stripFillers(clean);

  // 1. Search Bar Action
  if (/\b(?:search|find|dhundho|filter|khojo)\b/i.test(clean) || /\b(?:likh|type)\b/i.test(clean)) {
    if (scene.searchInputs && scene.searchInputs.length > 0) {
      if (/(?:clear search|search hata|filter hata|search clear|saaf)/i.test(clean)) {
        return {
          intent: "clear_search",
          thought: "User requested to clear active search filter.",
          actions: [{ type: "clear_search", selector: scene.searchInputs[0].selector || "#fSearch" }],
          reply: "Search filter clear kar diya hai."
        };
      }

      // Check if it's purely a focus request (e.g. "search bar open kar", "search box kholo")
      if (/^(?:search bar|search box|search field)\s*(?:open|khol|focus|pe jao)?\s*(?:kar|karo|do|de)?$/i.test(clean)) {
        return {
          intent: "focus_search",
          thought: "User requested to focus search bar.",
          actions: [{ type: "focus_search", selector: scene.searchInputs[0].selector || "#fSearch" }],
          reply: "Search bar open kar diya hai, boliye kya search karna hai?"
        };
      }

      let queryTerm = clean
        .replace(/^(?:search bar|search box)?\s*(?:open|khol|focus)?\s*(?:aur|then|fir)?\s*/i, "")
        .replace(/\b(?:search|find|dhundho|filter|likh|likho|type|dalo|daal)\b/gi, " ")
        .replace(/\b(?:me|mein|bar|box|field|wala|wali|wale|kar|karo|do|de|lagao|laga|chuno|batao|dikhao|ka|ki|ke)\b/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (queryTerm.length >= 2) {
        return {
          intent: "search",
          thought: `Extracted search query term: "${queryTerm}". Target: search input.`,
          actions: [{
            type: "search",
            selector: scene.searchInputs[0].selector || "#fSearch",
            value: queryTerm
          }],
          reply: `“${queryTerm}” search kar diya hai.`
        };
      }

      return {
        intent: "focus_search",
        thought: "User requested to focus search bar.",
        actions: [{ type: "focus_search", selector: scene.searchInputs[0].selector || "#fSearch" }],
        reply: "Search bar open kar diya hai."
      };
    }
  }

  // 2. Table Row Entity Targeting (Project, Company, Person, Indicator)
  if (scene.tableRows && scene.tableRows.length > 0) {
    let bestRow = null;
    let highestScore = 0;
    const tokens = stripped
      .replace(/\b(edit|open|khol|dikha|row|line|project|plant|company|status|set|approved|submitted)\b/gi, " ")
      .split(" ")
      .filter(t => t.length >= 2);

    for (const row of scene.tableRows) {
      const rowText = (row.cleanFull || row.fullText || "").toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (rowText.includes(tok)) {
          score += tok.length >= 5 ? 5 : 3;
        } else {
          // Check fuzzy similarity with row words
          const rowWords = rowText.split(/\s+/);
          for (const rw of rowWords) {
            if (stringSimilarity(tok, rw) >= 0.75) {
              score += 4;
              break;
            }
          }
        }
      }
      const fullPhrase = tokens.join(" ");
      if (fullPhrase.length >= 4 && rowText.includes(fullPhrase)) {
        score += 15;
      }
      if (score > highestScore) {
        highestScore = score;
        bestRow = row;
      }
    }

    if (bestRow && highestScore >= 3) {
      // Find the most descriptive label from cells
      let label = `Row ${bestRow.index}`;
      if (bestRow.cells && bestRow.cells.length > 0) {
        const matchedCell = bestRow.cells.find(c => tokens.some(t => c.toLowerCase().includes(t)));
        label = matchedCell || bestRow.cells[1] || bestRow.cells[0];
      }

      // 2.1 Check if row status change requested
      if (/(?:status|approved|submitted|in progress|verified|rejected)/i.test(clean) && bestRow.rowSelect) {
        let targetStatus = "Approved";
        if (/submitted/i.test(clean)) targetStatus = "Submitted";
        if (/in progress/i.test(clean)) targetStatus = "In Progress";
        if (/verified/i.test(clean)) targetStatus = "Verified";
        if (/rejected/i.test(clean)) targetStatus = "Rejected";

        return {
          intent: "change_row_status",
          thought: `Targeting "${label}" status select to "${targetStatus}".`,
          actions: [{
            type: "change_row_status",
            rowIndex: bestRow.index,
            status: targetStatus
          }],
          reply: `“${label}” ka status “${targetStatus}” kar diya hai.`
        };
      }

      // 2.2 Download file
      if (/(?:download|file|pdf)/i.test(clean) && bestRow.downloadLink) {
        return {
          intent: "download_row_file",
          thought: `Downloading file for row "${label}".`,
          actions: [{ type: "click_element", selector: `tbody tr:nth-child(${bestRow.index}) a` }],
          reply: `“${label}” ki file download kar di hai.`
        };
      }

      // 2.3 Default: Edit/Open row
      return {
        intent: "edit_row",
        thought: `Matched table row "${label}" with score ${highestScore}. Clicking action button.`,
        actions: [{
          type: "click_row",
          rowIndex: bestRow.index,
          label
        }],
        reply: `“${label}” ka edit form khol diya hai.`
      };
    }
  }

  // 3. Dropdowns (Scope, Severity, KPI Trace)
  if (/(?:scope|lite|core|comprehensive)/i.test(clean)) {
    let scopeVal = "lite";
    let scopeLabel = "Lite";
    if (/core/i.test(clean)) { scopeVal = "core"; scopeLabel = "Core KPIs"; }
    if (/comprehensive|full|pura/i.test(clean)) { scopeVal = "comprehensive"; scopeLabel = "Comprehensive"; }
    return {
      intent: "set_scope",
      thought: `Setting Report Scope to "${scopeLabel}".`,
      actions: [{ type: "set_select", selector: "#scope", value: scopeVal }],
      reply: `Report Scope ${scopeLabel} set kar diya hai.`
    };
  }

  if (/(?:severity|critical|warning|info)/i.test(clean)) {
    let sev = "Critical";
    if (/warning/i.test(clean)) sev = "Warning";
    if (/info/i.test(clean)) sev = "Info";
    if (/all|sab/i.test(clean)) sev = "";
    return {
      intent: "set_severity",
      thought: `Filtering severity to "${sev || 'All'}".`,
      actions: [{ type: "set_select", selector: "#fSeverity", value: sev }],
      reply: `Severity ${sev || 'All'} filter kar di hai.`
    };
  }

  if (/(?:trace|kpi)/i.test(clean)) {
    const kpiMatch = stripped.replace(/\b(?:trace|kpi|select|daba|karo|kar)\b/gi, "").trim();
    return {
      intent: "trace_kpi",
      thought: `Tracing KPI: "${kpiMatch}".`,
      actions: [
        { type: "select_kpi_option", query: kpiMatch },
        { type: "click_element", selector: "#traceBtn" }
      ],
      reply: `KPI trace kar diya hai.`
    };
  }

  // 3.1 Dynamic Dropdowns Matching (Plant/Company, Principle, Section, Status)
  if (scene.selects && scene.selects.length > 0) {
    let bestSelect = null;
    let bestOption = null;
    let highestOptScore = 0;

    for (const sel of scene.selects) {
      if (!sel.options) continue;
      for (const opt of sel.options) {
        if (!opt.value) continue;
        const optText = (opt.text || "").toLowerCase();
        let score = 0;
        const tokens = stripped.split(" ").filter(t => t.length >= 2);
        for (const tok of tokens) {
          if (optText.includes(tok)) {
            score += tok.length >= 5 ? 5 : 3;
          } else {
            const optWords = optText.split(/\s+/);
            for (const ow of optWords) {
              if (stringSimilarity(tok, ow) >= 0.75) {
                score += 4;
                break;
              }
            }
          }
        }
        if (score > highestOptScore) {
          highestOptScore = score;
          bestSelect = sel;
          bestOption = opt;
        }
      }
    }

    if (bestSelect && bestOption && highestOptScore >= 3 && /(?:filter|select|chuno|set|lagao|karo|plant|company|status|principle|section|dalo)/i.test(clean)) {
      return {
        intent: "set_select",
        thought: `Matched dropdown #${bestSelect.id} option: "${bestOption.text}".`,
        actions: [{ type: "set_select", selector: "#" + bestSelect.id, value: bestOption.value }],
        reply: `“${bestOption.text}” filter set kar diya hai.`
      };
    }
  }

  // 4. Modal Editing (Current FY, Previous FY, Remarks, Save, Close)
  if (scene.activeModal) {
    const currentFY = clean.match(/(?:current|value)\s*(?:is|to|me)?\s*([0-9.]+)/i);
    const previousFY = clean.match(/(?:previous)\s*(?:is|to|me)?\s*([0-9.]+)/i);
    const actions = [];
    if (currentFY) actions.push({ type: "set_input", selector: "#fCurrentFY", value: currentFY[1] });
    if (previousFY) actions.push({ type: "set_input", selector: "#fPreviousFY", value: previousFY[1] });
    if (/(?:save|submit|surakshit)/i.test(clean)) {
      actions.push({ type: "click_element", selector: "#saveEntryBtn, #saveUserBtn, .btn-primary" });
    }
    if (/(?:close|cancel|band)/i.test(clean)) {
      actions.push({ type: "click_element", selector: "#closeModal, .modal-close" });
    }
    if (actions.length > 0) {
      return {
        intent: "modal_action",
        thought: "Performing in-modal edits.",
        actions,
        reply: "Modal me data update kar diya hai."
      };
    }
  }

  // 5. Tabs & Sections
  if (/(?:section a|sec a)/i.test(clean)) {
    return {
      intent: "switch_tab",
      actions: [{ type: "click_element", selector: "[data-tab='a']" }],
      reply: "Section A tab open kar diya hai."
    };
  }
  if (/(?:section b|sec b)/i.test(clean)) {
    return {
      intent: "switch_tab",
      actions: [{ type: "click_element", selector: "[data-tab='b']" }],
      reply: "Section B tab open kar diya hai."
    };
  }
  if (/(?:section c|sec c)/i.test(clean)) {
    return {
      intent: "switch_tab",
      actions: [{ type: "click_element", selector: "[data-tab='c']" }],
      reply: "Section C tab open kar diya hai."
    };
  }
  if (/(?:users|roles)/i.test(clean)) {
    return {
      intent: "switch_tab",
      actions: [{ type: "click_element", selector: "[data-tab='users']" }],
      reply: "Users & Roles tab open kar diya hai."
    };
  }
  if (/(?:departments|plants|org)/i.test(clean)) {
    return {
      intent: "switch_tab",
      actions: [{ type: "click_element", selector: "[data-tab='org']" }],
      reply: "Departments & Plants tab open kar diya hai."
    };
  }

  // 6. Action Buttons (Validation, Preview, Export)
  if (/(?:run validation|validation run|check kar)/i.test(clean)) {
    return {
      intent: "run_validation",
      actions: [{ type: "click_element", selector: "#runBtn" }],
      reply: "Validation check start kar di hai."
    };
  }
  if (/(?:preview report|preview dikha)/i.test(clean)) {
    return {
      intent: "preview_report",
      actions: [{ type: "click_element", selector: "#previewBtn" }],
      reply: "Report preview generate kar diya hai."
    };
  }
  if (/(?:export csv|csv export|download csv)/i.test(clean)) {
    return {
      intent: "export_csv",
      actions: [{ type: "click_element", selector: "#csvBtn" }],
      reply: "CSV report export ho rahi hai."
    };
  }

  // 7. Route Navigation
  const ROUTES = [
    { file: "dashboard.html", aliases: ["dashboard", "home", "analytics", "overview"] },
    { file: "data-entry.html", aliases: ["data entry", "brsr data entry", "indicators"] },
    { file: "assignments.html", aliases: ["assignments", "workflow", "tasks"] },
    { file: "validation.html", aliases: ["validation", "exceptions", "errors"] },
    { file: "evidence.html", aliases: ["evidence", "repository", "documents", "files"] },
    { file: "audit.html", aliases: ["audit trail", "audit", "history", "logs"] },
    { file: "reports.html", aliases: ["report builder", "reports", "generate report"] },
    { file: "ai-assistant.html", aliases: ["ai report assistant", "ai assistant", "ai chat", "ai report", "report chat"] },
    { file: "admin.html", aliases: ["admin panel", "admin", "users and roles", "settings"] }
  ];

  for (const r of ROUTES) {
    if (r.aliases.some(a => clean.includes(a))) {
      return {
        intent: "navigate",
        thought: `Navigating to ${r.file}.`,
        actions: [{ type: "navigate", file: r.file }],
        reply: `${r.file.replace('.html', '')} page open kar diya hai.`
      };
    }
  }

  // 8. Scrolling & Page Controls
  if (/(?:scroll down|niche|down)/i.test(clean)) {
    return {
      intent: "scroll_down",
      actions: [{ type: "scroll", direction: "down" }],
      reply: "Niche scroll kar diya hai."
    };
  }
  if (/(?:scroll up|upar|up)/i.test(clean)) {
    return {
      intent: "scroll_up",
      actions: [{ type: "scroll", direction: "up" }],
      reply: "Upar scroll kar diya hai."
    };
  }
  if (/(?:scroll to top|top)/i.test(clean)) {
    return {
      intent: "scroll_top",
      actions: [{ type: "scroll", direction: "top" }],
      reply: "Top par scroll kar diya hai."
    };
  }

  return {
    intent: "unknown",
    thought: `Could not determine exact action for "${clean}".`,
    actions: [],
    reply: "Samajh nahi aaya, thoda alag tarike se bol kar dekhiye ya 'help' bole."
  };
}

/**
 * Optional Google Gemini LLM API Reasoning
 */
async function queryGeminiLLM(apiKey, query, scene, page) {
  return new Promise((resolve) => {
    const prompt = `You are the Autonomous AI Copilot for MEIL BRSR ESG Command Center.
The user is on page: "${page}".
Current DOM Scene:
- Search Inputs: ${JSON.stringify(scene.searchInputs?.map(s => s.selector || s.id))}
- Dropdowns: ${JSON.stringify(scene.selects?.map(s => ({ id: s.id, options: s.options?.map(o => o.text) })))}
- Table Rows: ${JSON.stringify(scene.tableRows?.slice(0, 8).map(r => ({ index: r.index, text: r.cleanFull })))}
- Tabs: ${JSON.stringify(scene.tabs?.map(t => t.text))}

User said (Hindi/Hinglish/English): "${query}"

Return a strict JSON response with:
{
  "thought": "brief reasoning",
  "reply": "friendly 1-line Hindi/Hinglish response to user",
  "actions": [
    { "type": "search"|"click_row"|"change_row_status"|"set_select"|"click_element"|"navigate"|"scroll", ...options }
  ]
}`;

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      },
      timeout: 5000
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            resolve(JSON.parse(text));
          } else {
            resolve(null);
          }
        } catch (_) {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(body);
    req.end();
  });
}

/**
 * Main Controller: Processes query through Compound Chainer, Semantic Planner & LLM
 * Supports multi-alternative candidate ranking from SpeechRecognition
 */
async function processCopilotQuery({ query, alternatives = [], scene = {}, page = "dashboard.html", apiKey = process.env.GEMINI_API_KEY }) {
  const candidateList = [];
  if (Array.isArray(query)) candidateList.push(...query);
  else if (query) candidateList.push(query);
  if (Array.isArray(alternatives)) candidateList.push(...alternatives);

  // Deduplicate candidates
  const uniqueCandidates = Array.from(new Set(candidateList.map(c => String(c || "").trim()).filter(Boolean)));

  let bestResult = null;

  for (const candidate of uniqueCandidates) {
    const normQuery = normalizeQuery(candidate);
    const instructions = parseChainedInstructions(normQuery);

    const allActions = [];
    const thoughts = [];
    const replies = [];

    for (const inst of instructions) {
      let result = null;

      // 1. Try Gemini LLM if key is present
      if (apiKey) {
        try {
          result = await queryGeminiLLM(apiKey, inst, scene, page);
        } catch (_) {}
      }

      // 2. Fallback to Local Semantic Brain
      if (!result || !result.actions || result.actions.length === 0) {
        result = planActionLocal(inst, scene, page);
      }

      if (result) {
        if (result.thought) thoughts.push(result.thought);
        if (result.reply) replies.push(result.reply);
        if (Array.isArray(result.actions)) allActions.push(...result.actions);
      }
    }

    if (allActions.length > 0) {
      return {
        query: normQuery,
        rawQuery: candidate,
        thought: thoughts.join(" | "),
        reply: replies.join(" Aur "),
        actions: allActions
      };
    }

    if (!bestResult) {
      bestResult = {
        query: normQuery,
        rawQuery: candidate,
        thought: thoughts.join(" | "),
        reply: replies.join(" Aur "),
        actions: []
      };
    }
  }

  return bestResult || {
    query: "",
    rawQuery: "",
    thought: "No matching action found.",
    reply: "Samajh nahi aaya, thoda alag tarike se bol kar dekhiye.",
    actions: []
  };
}

module.exports = {
  normalizeQuery,
  transliterateDevanagari,
  levenshteinDistance,
  stringSimilarity,
  stripFillers,
  parseChainedInstructions,
  planActionLocal,
  processCopilotQuery
};
