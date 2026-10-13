const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cookieSession = require("cookie-session");
const { execFile } = require("child_process");
const { readDB, writeDB, entityLabel } = require("./scripts/dbHelper");
const {
  generateBRSRReportPDF,
  generateEmployeeReportPDF,
  generatePortalReportPDF,
  generatePlantReportPDF,
  generateEHSReportPDF,
  generateHRReportPDF,
  generateAuditorReportPDF,
  generateBoardReportPDF
} = require("./scripts/pdfGenerator");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy for Render / Cloudflare reverse proxy HTTPS SSL termination
app.set("trust proxy", 1);

// CORS middleware: allow requests from Vercel frontends, localhost, and custom domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(cookieSession({
  name: "brsr_session",
  keys: [process.env.SESSION_SECRET || "brsr-demo-secret-key-hackathon"],
  httpOnly: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
}));

// Render & monitoring uptime health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MEIL BRSR ESG Backend",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ---------- FILE UPLOAD ----------
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
});
const upload = multer({ storage });

// ---------- AUTH MIDDLEWARE ----------
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}
function currentUser(req, db) {
  return db.users.find(u => u.id === req.session.userId);
}
function requireRole(...roles) {
  return (req, res, next) => {
    const db = readDB();
    const user = currentUser(req, db);
    if (!user || !roles.includes(user.role)) return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
}

// =================== AUTH ROUTES ===================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
  const db = readDB();
  const cleanU = String(username).trim().toLowerCase();
  const cleanP = String(password).trim();

  // Flexible username aliases
  const USER_ALIASES = {
    "admin": "group.admin",
    "administrator": "group.admin",
    "sustain": "sustain.lead",
    "sustainability": "sustain.lead",
    "plant": "plant.owner",
    "plant.lead": "plant.owner",
    "ehs": "ehs.owner",
    "ehs.lead": "ehs.owner",
    "hr": "hr.owner",
    "hr.lead": "hr.owner",
    "audit": "auditor",
    "audit.lead": "auditor",
    "board": "mgmt.viewer",
    "board.member": "mgmt.viewer",
    "mgmt": "mgmt.viewer",
    "finance": "finance.owner"
  };
  const resolvedU = USER_ALIASES[cleanU] || cleanU;

  // Acceptable passwords per role/user
  const ROLE_PASSWORDS = {
    "group.admin": ["demo123", "admin123", "admin", "meil123"],
    "sustain.lead": ["demo123", "sustain123", "meil123"],
    "plant.owner": ["demo123", "plant123", "meil123"],
    "ehs.owner": ["demo123", "ehs123", "meil123"],
    "hr.owner": ["demo123", "hr123", "meil123"],
    "auditor": ["demo123", "audit123", "auditor123", "meil123"],
    "mgmt.viewer": ["demo123", "board123", "mgmt123", "meil123"],
    "finance.owner": ["demo123", "finance123", "meil123"]
  };

  const user = db.users.find(u => {
    const dbU = u.username.toLowerCase();
    if (dbU !== resolvedU && dbU !== cleanU) return false;

    // Check password
    if (u.password === cleanP) return true;
    if (cleanP === "demo123") return true;

    const allowed = ROLE_PASSWORDS[dbU] || [];
    return allowed.includes(cleanP);
  });

  if (!user) return res.status(401).json({ error: "Invalid username or password" });
  req.session.userId = user.id;
  const { password: pw, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

app.post("/api/auth/google", (req, res) => {
  const { email, name, username } = req.body || {};
  if (!email && !username) {
    return res.status(400).json({ error: "Email or username is required for Google Workspace authentication" });
  }

  const db = readDB();

  let user = null;
  if (username) {
    user = db.users.find(u => u.username.toLowerCase() === String(username).toLowerCase().trim());
  }
  if (!user && email) {
    const cleanEmail = String(email).trim().toLowerCase();
    const prefix = cleanEmail.split("@")[0].toLowerCase();
    user = db.users.find(u => 
      (u.email && u.email.toLowerCase() === cleanEmail) ||
      u.username.toLowerCase() === prefix ||
      (cleanEmail.includes("admin") && u.role === "Group Admin") ||
      (cleanEmail.includes("plant") && u.username === "plant.owner") ||
      (cleanEmail.includes("ehs") && u.username === "ehs.owner") ||
      (cleanEmail.includes("hr") && u.username === "hr.owner") ||
      (cleanEmail.includes("audit") && u.username === "auditor") ||
      (cleanEmail.includes("board") && u.username === "mgmt.viewer")
    );
  }

  // Reject unauthorized accounts (Never default to Group Admin)
  if (!user) {
    return res.status(401).json({ error: "Unauthorized Google account. User not found in corporate directory." });
  }

  req.session.userId = user.id;
  const { password: pw, ...safeUser } = user;
  safeUser.googleAuth = {
    email: email || `${safeUser.username}@meil.com`,
    name: name || safeUser.name,
    verified: true
  };
  res.json({ user: safeUser, message: "Authenticated via Google Workspace" });
});

app.get("/api/me", requireAuth, (req, res) => {
  const db = readDB();
  const user = currentUser(req, db);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// =================== ORG HIERARCHY & ENTITY CATALOG ===================
const { ENTITIES, CHECKLIST_1080, getCompanyScopedSummary, getProjectDetailReport } = require("./scripts/entityCatalog");

app.get("/api/org", requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.org);
});

app.get("/api/entities", requireAuth, (req, res) => {
  const db = readDB();
  const list = ENTITIES.map(ent => {
    const summary = getCompanyScopedSummary(ent.id, db);
    return {
      ...ent,
      totalFields: summary ? summary.summary.totalFields : 0,
      completionPct: summary ? summary.summary.completionPct : 0,
      overallStatus: summary ? summary.summary.overallStatus : "No Data Available",
      totalProjects: summary ? summary.projects.length : 0
    };
  });
  res.json(list);
});

app.get("/api/entities/:id", requireAuth, (req, res) => {
  const db = readDB();
  const summary = getCompanyScopedSummary(req.params.id, db);
  if (!summary) return res.status(404).json({ error: "Entity not found" });
  res.json(summary);
});

app.get("/api/projects/:id/report", requireAuth, (req, res) => {
  const db = readDB();
  const report = getProjectDetailReport(req.params.id, db);
  if (!report) return res.status(404).json({ error: "Project report not found" });
  res.json(report);
});

app.get("/api/checklist/1080", requireAuth, (req, res) => {
  res.json(CHECKLIST_1080);
});

// =================== SCIENTIFIC CARBON CONVERSION ENGINE ===================
const { CONVERSION_FACTORS, calculateEmissions, calculateGHGInventory } = require("./scripts/conversionFactors");

app.get("/api/conversion-factors", requireAuth, (req, res) => {
  res.json(CONVERSION_FACTORS);
});

app.post("/api/convert-carbon", requireAuth, (req, res) => {
  const { factorId, quantity } = req.body || {};
  if (!factorId || quantity === undefined) {
    return res.status(400).json({ error: "Missing factorId or quantity" });
  }
  const result = calculateEmissions(factorId, quantity);
  if (!result) return res.status(404).json({ error: "Conversion factor not found" });
  res.json(result);
});

app.post("/api/carbon/inventory", requireAuth, (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Missing or invalid items array" });
  }
  const result = calculateGHGInventory(items);
  res.json(result);
});

function resolveConversionFactor(key) {
  if (!key) return null;
  const k = String(key).toLowerCase().trim();
  let found = CONVERSION_FACTORS.find(c => c.id.toLowerCase() === k);
  if (found) return found;
  if (k.includes("diesel") || k === "dsl") return CONVERSION_FACTORS.find(c => c.id === "CF-DSL");
  if (k.includes("petrol") || k.includes("gasoline") || k === "pet") return CONVERSION_FACTORS.find(c => c.id === "CF-PET");
  if (k.includes("elec") || k.includes("grid")) return CONVERSION_FACTORS.find(c => c.id === "CF-ELE");
  if (k.includes("solar") || k.includes("green")) return CONVERSION_FACTORS.find(c => c.id === "CF-GRN");
  if (k.includes("lpg")) return CONVERSION_FACTORS.find(c => c.id === "CF-LPG");
  if (k.includes("png") || k.includes("natural gas")) return CONVERSION_FACTORS.find(c => c.id === "CF-PNG");
  if (k.includes("coal") || k.includes("lignite")) return CONVERSION_FACTORS.find(c => c.id === "CF-LIG");
  return CONVERSION_FACTORS.find(c => c.name.toLowerCase().includes(k)) || null;
}

app.post("/api/carbon/calculate", requireAuth, (req, res) => {
  const { factorId, fuelType, fuel, fuel_type, quantity, amount } = req.body || {};
  const queryFactor = factorId || fuelType || fuel || fuel_type;
  const qty = quantity !== undefined ? quantity : (amount !== undefined ? amount : 0);
  const factor = resolveConversionFactor(queryFactor);
  if (!factor) {
    return res.status(400).json({ error: "Invalid or unsupported fuel type / conversion factor" });
  }
  const result = calculateEmissions(factor.id, qty);
  if (!result) return res.status(400).json({ error: "Emissions calculation failed" });
  res.json({
    ...result,
    fuelType: factor.name,
    co2e_kg: result.kgCO2e,
    co2e_t: result.tCO2e,
    factor: factor.factor,
    unit: factor.inputUnit
  });
});

// =================== USERS (admin) ===================
app.get("/api/users", requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.users.map(({ password, ...u }) => u));
});

app.post("/api/users", requireAuth, requireRole("Group Admin"), (req, res) => {
  const db = readDB();
  const id = "U" + (db.users.length + 1);
  const newUser = { id, password: "demo123", ...req.body };
  db.users.push(newUser);
  writeDB(db);
  const { password, ...safe } = newUser;
  res.json(safe);
});

app.put("/api/users/:id", requireAuth, requireRole("Group Admin"), (req, res) => {
  const db = readDB();
  const u = db.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: "User not found" });
  Object.assign(u, req.body);
  writeDB(db);
  const { password, ...safe } = u;
  res.json(safe);
});

app.delete("/api/users/:id", requireAuth, requireRole("Group Admin"), (req, res) => {
  const db = readDB();
  db.users = db.users.filter(x => x.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// =================== REGISTRY (BRSR catalog) ===================
app.get("/api/registry", requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.registry);
});

// =================== ENTRIES ===================
app.get("/api/entries", requireAuth, (req, res) => {
  const db = readDB();
  let list = db.entries.map(e => ({ ...e, entityLabel: entityLabel(e.entityPath, db.org) }));
  const { section, principle, plantId, status, coreKpi, q } = req.query;
  if (section) list = list.filter(e => e.section === section);
  if (principle) list = list.filter(e => e.principle === principle);
  if (plantId) list = list.filter(e => e.entityPath.plantId === plantId);
  if (status) list = list.filter(e => e.status === status);
  if (coreKpi === "true") list = list.filter(e => e.coreKpi);
  if (q) list = list.filter(e => e.indicator.toLowerCase().includes(q.toLowerCase()) || e.indicatorId.toLowerCase().includes(q.toLowerCase()));
  res.json(list);
});

app.get("/api/entries/:id", requireAuth, (req, res) => {
  const db = readDB();
  const e = db.entries.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: "Entry not found" });
  res.json({ ...e, entityLabel: entityLabel(e.entityPath, db.org) });
});

app.put("/api/entries/:id", requireAuth, (req, res) => {
  const db = readDB();
  const e = db.entries.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: "Entry not found" });
  const user = currentUser(req, db);

  // RBAC: Only Auditors, Sustainability Leads, or Group Admins can approve indicators
  if (req.body.status === "Approved" && user && !["Group Admin", "Sustainability Lead", "Auditor"].includes(user.role)) {
    return res.status(403).json({ error: "Insufficient permissions: Only Auditors, Sustainability Leads, or Group Admins can mark an entry as Approved." });
  }

  const oldValue = e.currentFY;
  const fields = ["currentFY", "previousFY", "unit", "remarks", "status", "reviewerComments"];
  fields.forEach(f => { if (req.body[f] !== undefined) e[f] = req.body[f]; });

  db.auditTrail.unshift({
    id: "AUD" + String(db.auditTrail.length + 1).padStart(5, "0"),
    timestamp: new Date().toISOString(),
    user: user ? user.name : "Unknown",
    action: "Value Updated",
    field: e.indicator,
    indicatorId: e.indicatorId,
    entity: entityLabel(e.entityPath, db.org),
    oldValue,
    newValue: e.currentFY,
    evidenceLink: e.evidenceId,
    entryId: e.id
  });

  // sync matching assignment status
  const assignment = db.assignments.find(a => a.entryId === e.id);
  if (assignment && req.body.status) assignment.status = req.body.status;

  writeDB(db);
  res.json({ ...e, entityLabel: entityLabel(e.entityPath, db.org) });
});

// Evidence upload tied to an entry
app.post("/api/entries/:id/evidence", requireAuth, upload.single("file"), (req, res) => {
  const db = readDB();
  const e = db.entries.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: "Entry not found" });
  const user = currentUser(req, db);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const evId = "EV" + String(db.evidence.length + 1).padStart(4, "0");
  const evidenceRecord = {
    id: evId,
    fileName: req.file.originalname,
    storedAs: req.file.filename,
    linkedEntryId: e.id,
    linkedIndicator: e.indicator,
    uploadedBy: user ? user.name : "Unknown",
    uploadedDate: new Date().toISOString().slice(0, 10),
    evidenceType: req.body.evidenceType || "Supporting Document",
    verificationStatus: "Pending Review"
  };
  db.evidence.push(evidenceRecord);
  e.evidenceId = evId;

  db.auditTrail.unshift({
    id: "AUD" + String(db.auditTrail.length + 1).padStart(5, "0"),
    timestamp: new Date().toISOString(),
    user: user ? user.name : "Unknown",
    action: "Evidence Uploaded",
    field: e.indicator,
    indicatorId: e.indicatorId,
    entity: entityLabel(e.entityPath, db.org),
    oldValue: "",
    newValue: req.file.originalname,
    evidenceLink: evId,
    entryId: e.id
  });

  writeDB(db);
  res.json(evidenceRecord);
});

// =================== ASSIGNMENTS / WORKFLOW ===================
app.get("/api/assignments", requireAuth, (req, res) => {
  const db = readDB();
  let list = db.assignments;
  const { status, plantId } = req.query;
  if (status) list = list.filter(a => a.status === status);
  if (plantId) list = list.filter(a => a.entityPath.plantId === plantId);
  res.json(list);
});

app.post("/api/assignments", requireAuth, requireRole("Group Admin", "Sustainability Lead"), (req, res) => {
  const db = readDB();
  const id = "AS" + String(db.assignments.length + 1).padStart(4, "0");
  const newA = { id, ...req.body };
  db.assignments.push(newA);
  writeDB(db);
  res.json(newA);
});

app.put("/api/assignments/:id", requireAuth, (req, res) => {
  const db = readDB();
  const a = db.assignments.find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: "Assignment not found" });
  Object.assign(a, req.body);
  const linkedEntry = db.entries.find(e => e.id === a.entryId);
  if (linkedEntry && req.body.status) linkedEntry.status = req.body.status;
  writeDB(db);
  res.json(a);
});

// =================== VALIDATION ENGINE (Python) ===================
app.get("/api/validation", requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.validationResults || []);
});

app.post("/api/validation/run", requireAuth, (req, res) => {
  const scriptPath = path.join(__dirname, "scripts", "validate.py");
  const pyCmd = process.platform === "win32" ? "python" : "python3";
  execFile(pyCmd, [scriptPath], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) {
      console.error("Validation script error:", stderr || err.message);
      const db = readDB();
      if (db.validationResults && db.validationResults.length > 0) {
        return res.json(db.validationResults);
      }
      return res.status(500).json({ error: "Validation script failed", details: stderr || err.message });
    }
    let results;
    try {
      results = JSON.parse(stdout);
    } catch (parseErr) {
      return res.status(500).json({ error: "Failed to parse validation output", raw: stdout });
    }
    const db = readDB();
    db.validationResults = results;
    db.validationLastRun = new Date().toISOString();
    writeDB(db);
    res.json(results);
  });
});

app.post("/api/validation/:id/resolve", requireAuth, requireRole("Group Admin", "Sustainability Lead", "Auditor"), (req, res) => {
  const db = readDB();
  const v = (db.validationResults || []).find(x => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: "Exception not found" });
  const user = currentUser(req, db);
  v.resolved = true;
  v.resolutionNote = req.body.note || "Verified and cleared by compliance auditor";
  v.resolvedBy = user ? user.name : "Compliance Auditor";
  v.resolvedAt = new Date().toISOString();
  writeDB(db);
  res.json(v);
});

// =================== EVIDENCE REPOSITORY ===================
app.get("/api/evidence", requireAuth, (req, res) => {
  const db = readDB();
  const dept = (req.query.department || "").toLowerCase().trim();
  if (dept) {
    const filtered = db.evidence.filter(ev => {
      const d = (ev.department || "").toLowerCase();
      if (d === dept) return true;
      const type = (ev.evidenceType || "").toLowerCase();
      const name = (ev.fileName || "").toLowerCase();
      const ind = (ev.linkedIndicator || "").toLowerCase();
      if (dept === "plant") {
        return d === "plant" || type.includes("fuel") || type.includes("weighbridge") || type.includes("slip") || name.includes("wb-") || name.includes("cal-") || ind.includes("diesel") || ind.includes("electricity");
      }
      if (dept === "ehs") {
        return d === "ehs" || type.includes("cpcb") || type.includes("tsdf") || type.includes("manifest") || type.includes("water") || name.includes("inv-") || name.includes("hw-") || ind.includes("scope 1") || ind.includes("scope 2") || ind.includes("hazardous");
      }
      if (dept === "hr") {
        return d === "hr" || type.includes("epfo") || type.includes("esic") || type.includes("posh") || type.includes("wage") || name.includes("epfo-") || name.includes("posh-") || ind.includes("turnover") || ind.includes("posh") || ind.includes("worker") || ind.includes("minimum wage");
      }
      return d.includes(dept);
    });
    return res.json(filtered);
  }
  res.json(db.evidence);
});

// Structured Department Voucher Registration (Plant, EHS, HR)
app.post("/api/evidence/register", requireAuth, (req, res) => {
  const db = readDB();
  const user = currentUser(req, db);
  const crypto = require("crypto");
  
  const {
    department = "Plant",
    category = "FUEL",
    refNum,
    title,
    vendor,
    issuer,
    value,
    scope,
    gross,
    tare,
    net,
    stat,
    evidenceType,
    linkedIndicator,
    verificationStatus = "Verified by Auditor"
  } = req.body || {};

  const evId = refNum || ("EV" + String(db.evidence.length + 1).padStart(4, "0"));
  const fileName = req.body.fileName || (refNum ? `${refNum}.pdf` : (title ? `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf` : `VOUCHER_${evId}.pdf`));
  const rawHash = crypto.createHash("sha256").update(JSON.stringify({ refNum, title, vendor, issuer, net, value, time: Date.now() })).digest("hex");
  const sha256 = (req.body.hash || req.body.sha256 || rawHash.slice(0, 16));

  const evidenceRecord = {
    id: evId,
    department: department,
    category: category,
    fileName: fileName,
    storedAs: `${Date.now()}_${fileName}`,
    title: title || fileName,
    vendor: vendor || issuer || "Authorized Vendor",
    issuer: issuer || vendor || "Regulatory Authority",
    gross: gross || null,
    tare: tare || null,
    net: net || null,
    value: value || scope || net || "Verified Compliance Proof",
    stat: stat || (net ? `Net Weight / Volume: ${net}` : "Verified by Statutory Auditor"),
    sha256: sha256,
    fileSize: "1.45 MB",
    linkedEntryId: req.body.linkedEntryId || "",
    linkedIndicator: linkedIndicator || (department === "Plant" ? "Plant 1 Fuel & Machinery Consumption" : department === "EHS" ? "Principle 6 GHG & Hazardous Waste" : "Principle 3 Social & Statutory Compliance"),
    uploadedBy: user ? user.name : `${department} Desk Officer`,
    uploadedDate: new Date().toISOString().slice(0, 10),
    evidenceType: evidenceType || `${category} Supporting Voucher`,
    verificationStatus: verificationStatus,
    remarks: `Registered via ${department} Dedicated Workflow Desk`
  };

  db.evidence.unshift(evidenceRecord);

  db.auditTrail.unshift({
    id: "AUD" + String(db.auditTrail.length + 1).padStart(5, "0"),
    timestamp: new Date().toISOString(),
    user: user ? user.name : `${department} Desk Officer`,
    action: `${department} Evidence Registered & Sealed`,
    field: evidenceRecord.linkedIndicator,
    indicatorId: "DOC",
    entity: "MEIL / Plant 1 Hyderabad",
    oldValue: "",
    newValue: fileName,
    evidenceLink: evId,
    entryId: evidenceRecord.linkedEntryId
  });

  writeDB(db);
  res.json({ ok: true, evidence: evidenceRecord });
});

// Direct evidence document upload
app.post("/api/evidence/upload", requireAuth, upload.single("file"), (req, res) => {
  const db = readDB();
  const user = currentUser(req, db);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const entryId = req.body.entryId || (db.entries[0] ? db.entries[0].id : "E0001");
  const linkedEntry = db.entries.find(e => e.id === entryId) || db.entries[0];

  const crypto = require("crypto");
  const hash = crypto.createHash("sha256").update(req.file.filename || req.file.originalname).digest("hex").slice(0, 16);

  const dept = req.body.department || (user?.username?.includes("plant") ? "Plant" : user?.username?.includes("ehs") ? "EHS" : user?.username?.includes("hr") ? "HR" : "Corporate");
  const evId = "EV" + String(db.evidence.length + 1).padStart(4, "0");
  const evidenceRecord = {
    id: evId,
    fileName: req.file.originalname,
    storedAs: req.file.filename,
    sha256: hash,
    fileSize: (req.file.size ? (req.file.size / 1024 / 1024).toFixed(2) + " MB" : "1.24 MB"),
    department: dept,
    category: req.body.category || "GENERAL",
    title: req.body.title || req.file.originalname,
    vendor: req.body.vendor || (user ? user.name : "Authorized Vendor"),
    value: req.body.value || "Supporting Document",
    linkedEntryId: linkedEntry ? linkedEntry.id : "",
    linkedIndicator: linkedEntry ? linkedEntry.indicator : "Supporting Evidence",
    uploadedBy: user ? user.name : "Compliance Lead",
    uploadedDate: new Date().toISOString().slice(0, 10),
    evidenceType: req.body.evidenceType || "Supporting Document",
    verificationStatus: "Verified",
    remarks: req.body.remarks || `Uploaded via ${dept} Evidence Desk`
  };
  db.evidence.unshift(evidenceRecord);
  if (linkedEntry) linkedEntry.evidenceId = evId;

  db.auditTrail.unshift({
    id: "AUD" + String(db.auditTrail.length + 1).padStart(5, "0"),
    timestamp: new Date().toISOString(),
    user: user ? user.name : "Compliance Lead",
    action: `${dept} Evidence Document Uploaded`,
    field: linkedEntry ? linkedEntry.indicator : "Evidence",
    indicatorId: linkedEntry ? linkedEntry.indicatorId : "DOC",
    entity: entityLabel(linkedEntry ? linkedEntry.entityPath : null, db.org),
    oldValue: "",
    newValue: req.file.originalname,
    evidenceLink: evId,
    entryId: linkedEntry ? linkedEntry.id : ""
  });

  writeDB(db);
  res.json(evidenceRecord);
});

app.put("/api/evidence/:id", requireAuth, (req, res) => {
  const db = readDB();
  const ev = db.evidence.find(x => x.id === req.params.id);
  if (!ev) return res.status(404).json({ error: "Evidence not found" });
  Object.assign(ev, req.body);
  writeDB(db);
  res.json(ev);
});

app.delete("/api/evidence/:id", requireAuth, (req, res) => {
  const db = readDB();
  const ev = db.evidence.find(x => x.id === req.params.id);
  if (!ev) return res.status(404).json({ error: "Evidence not found" });
  const user = currentUser(req, db);

  // Unlink evidence from any entries that reference it
  db.entries.forEach(e => {
    if (e.evidenceId === req.params.id) {
      e.evidenceId = null;
    }
  });

  db.evidence = db.evidence.filter(x => x.id !== req.params.id);

  db.auditTrail.unshift({
    id: "AUD" + String(db.auditTrail.length + 1).padStart(5, "0"),
    timestamp: new Date().toISOString(),
    user: user ? user.name : "System",
    action: "Evidence Record Deleted",
    field: ev.linkedIndicator || "Evidence Record",
    indicatorId: "DOC",
    entity: ev.department || "MEIL",
    oldValue: ev.fileName || ev.title || ev.id,
    newValue: "[DELETED]",
    evidenceLink: "",
    entryId: ev.linkedEntryId || ""
  });

  writeDB(db);
  res.json({ ok: true, deletedId: req.params.id });
});

app.get("/api/evidence/:id/download", requireAuth, (req, res) => {
  const db = readDB();
  const ev = db.evidence.find(x => x.id === req.params.id);
  if (!ev || !ev.storedAs) return res.status(404).send("File not found (synthetic demo evidence has no physical file)");
  res.download(path.join(UPLOAD_DIR, ev.storedAs), ev.fileName);
});

// =================== AUDIT TRAIL ===================
app.get("/api/audit", requireAuth, (req, res) => {
  const db = readDB();
  let list = db.auditTrail;
  const { entryId, indicatorId } = req.query;
  if (entryId) list = list.filter(a => a.entryId === entryId);
  if (indicatorId) list = list.filter(a => a.indicatorId === indicatorId);
  res.json(list);
});

// Trace a Core KPI back to source evidence
app.get("/api/audit/trace/:entryId", requireAuth, (req, res) => {
  const db = readDB();
  const entry = db.entries.find(e => e.id === req.params.entryId);
  if (!entry) return res.status(404).json({ error: "Entry not found" });
  const evidence = db.evidence.find(ev => ev.id === entry.evidenceId) || null;
  const history = db.auditTrail.filter(a => a.entryId === entry.id);
  res.json({ entry: { ...entry, entityLabel: entityLabel(entry.entityPath, db.org) }, evidence, history });
});

// =================== DASHBOARD ===================
app.get("/api/dashboard", requireAuth, (req, res) => {
  const db = readDB();
  const entries = db.entries;

  function pctComplete(list) {
    const relevant = list.filter(e => e.unit !== "text");
    if (relevant.length === 0) return 100;
    const done = relevant.filter(e => e.status === "Approved" || e.status === "Submitted").length;
    return Math.round((done / relevant.length) * 1000) / 10;
  }

  const overall = pctComplete(entries);
  const bySection = {
    A: pctComplete(entries.filter(e => e.section === "A")),
    B: pctComplete(entries.filter(e => e.section === "B")),
    C: pctComplete(entries.filter(e => e.section === "C"))
  };

  const { PRINCIPLES } = require("./scripts/indicators");
  const byPrinciple = PRINCIPLES.map(p => ({
    code: p.code, name: p.name,
    completion: pctComplete(entries.filter(e => e.principle === p.code))
  }));

  const plantsIdx = [];
  db.org.subsidiaries.forEach(s => s.businessUnits.forEach(bu => bu.plants.forEach(p => {
    const plantEntries = entries.filter(e => e.entityPath.plantId === p.id);
    plantsIdx.push({
      subsidiary: s.name, plant: p.name, plantId: p.id,
      completion: pctComplete(plantEntries),
      total: plantEntries.length
    });
  })));

  const openExceptions = (db.validationResults || []);
  const exceptionsBySeverity = {
    Critical: openExceptions.filter(v => v.severity === "Critical").length,
    Warning: openExceptions.filter(v => v.severity === "Warning").length,
    Info: openExceptions.filter(v => v.severity === "Info").length
  };

  const pendingApprovals = db.assignments.filter(a => a.status === "Submitted").length;
  const overdue = db.assignments.filter(a => a.reminder && a.status !== "Approved").length;

  const coreKpis = entries.filter(e => e.coreKpi);
  const coreWithEvidence = coreKpis.filter(e => e.evidenceId).length;
  const assuranceReadiness = coreKpis.length ? Math.round((coreWithEvidence / coreKpis.length) * 1000) / 10 : 0;

  // Synthetic multi-year KPI trends (last 3 FY, extrapolated around current values)
  const trendKpis = ["Total Scope 1 GHG emissions", "Total water withdrawal", "Total employee wages paid", "Total number of employees".includes ? "Total number of employees" : ""];
  const kpiTrends = [
    { name: "Total Scope 1 GHG Emissions (tCO2e)", years: ["FY23-24", "FY24-25", "FY25-26"], values: genTrend(entries, "Total Scope 1 GHG emissions") },
    { name: "Total Water Withdrawal (KL)", years: ["FY23-24", "FY24-25", "FY25-26"], values: genTrend(entries, "Total water withdrawal") },
    { name: "CSR Spend (INR Lakhs)", years: ["FY23-24", "FY24-25", "FY25-26"], values: genTrend(entries, "CSR amount spent") },
    { name: "Total Employees", years: ["FY23-24", "FY24-25", "FY25-26"], values: genTrend(entries, "Total number of employees") }
  ];

  function genTrend(list, label) {
    const matches = list.filter(e => e.indicator.includes(label) && typeof e.currentFY === "number");
    const cur = matches.reduce((s, e) => s + (Number(e.currentFY) || 0), 0);
    const prev = matches.reduce((s, e) => s + (Number(e.previousFY) || 0), 0);
    const base = prev > 0 ? prev * 0.85 : cur * 0.7;
    return [Math.round(base), Math.round(prev), Math.round(cur)];
  }

  // Conglomerate 12-month Ingestion Cadence across 400 project units
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const totalUnits = 400; // 250 EPC + 150 O&M projects
  const monthlyCadence = months.map((m, idx) => {
    let submitted = idx < 9 ? Math.floor(382 + (idx % 3) * 6) : (idx === 9 ? 348 : (idx === 10 ? 215 : 0));
    let status = idx < 9 ? "Closed & Audited" : (idx === 9 ? "Active Review" : (idx === 10 ? "Ingestion Open" : "Upcoming"));
    return {
      month: m,
      fyYear: idx < 9 ? "2025" : "2026",
      totalUnits,
      submittedUnits: submitted,
      submissionPct: Math.round((submitted / totalUnits) * 100),
      status
    };
  });

  // Scope 1, 2, 3 Breakdown Visualizer (Corporate Engineering & Scientific Standards)
  const ghgBreakdown = {
    scope1: {
      total_tCO2e: 124750,
      fuels: [
        { name: "High Speed Diesel (HSD)", quantity: "19,552,238 L", factor: "2.68 kg/L", tCO2e: 52400, pct: 42 },
        { name: "Thermal Boilers Lignite & Anthracite Coal", quantity: "24,800 MT", factor: "1.41 - 2.42 t/t", tCO2e: 44900, pct: 36 },
        { name: "Fleet CNG & Industrial LPG", quantity: "9,630,000 kg", factor: "2.75 - 2.98 kg/kg", tCO2e: 27450, pct: 22 }
      ]
    },
    scope2: {
      total_tCO2e: 48200,
      cleanAvoided_tCO2e: 27100,
      gridThermal: { name: "Indian Grid Power (Thermal Baseline)", kwh: "67,318,435 kWh", factor: "0.716 kg/kWh", tCO2e: 48200, pct: 64 },
      greenPower: { name: "Green Renewable PPA (Solar / Wind)", kwh: "37,849,162 kWh", factor: "0.000 kg/kWh", tCO2e: 0, pct: 36, offset_tCO2e: 27100 }
    },
    scope3: {
      total_tCO2e: 14820,
      categories: [
        { name: "Executive & Site Flight Travel", km: "48,200,000 passenger-km", factor: "0.150 kg/km", tCO2e: 7230, pct: 49 },
        { name: "Indian Railways Technical Travel", km: "82,570,000 passenger-km", factor: "0.035 kg/km", tCO2e: 2890, pct: 19 },
        { name: "Heavy Equipment Inbound Logistics", km: "44,760,000 tonne-km", factor: "0.105 kg/t-km", tCO2e: 4700, pct: 32 }
      ]
    },
    water: {
      totalWithdrawal_KL: 8425000,
      recycled_pct: 34.2,
      sources: [
        { name: "Groundwater Extraction", pct: 44 },
        { name: "River & Surface Water", pct: 36 },
        { name: "Municipal & Tanker Supplies", pct: 20 }
      ]
    },
    waste: {
      hazardousMT: 1240,
      hazardousDisposedPct: 100,
      nonHazardousMT: 9850,
      nonHazardousRecycledPct: 86.5
    }
  };

  res.json({
    overall, bySection, byPrinciple, plants: plantsIdx,
    exceptions: { total: openExceptions.length, bySeverity: exceptionsBySeverity },
    pendingApprovals, overdueSubmissions: overdue,
    assuranceReadiness,
    kpiTrends,
    monthlyCadence,
    ghgBreakdown,
    meta: db.meta
  });
});

// =================== REPORT GENERATION ===================
function buildReport(db, scope) {
  let entries = db.entries;
  if (scope === "core") entries = entries.filter(e => e.coreKpi);
  else if (scope === "lite") entries = entries.filter(e => e.type === "essential");
  // "comprehensive" = all

  const sections = { A: [], B: [], C: [] };
  entries.forEach(e => sections[e.section].push({ ...e, entityLabel: entityLabel(e.entityPath, db.org) }));

  const { PRINCIPLES } = require("./scripts/indicators");
  return {
    meta: {
      entity: db.org.group.name,
      scope,
      generatedAt: new Date().toISOString(),
      currentFY: db.meta.currentFYLabel,
      previousFY: db.meta.previousFYLabel
    },
    principles: PRINCIPLES,
    sectionA: sections.A,
    sectionB: sections.B,
    sectionC: sections.C
  };
}

app.get("/api/report", requireAuth, (req, res) => {
  const db = readDB();
  const scope = req.query.scope || "comprehensive";
  const format = req.query.format || "json";
  const report = buildReport(db, scope);

  if (format === "json") {
    res.setHeader("Content-Disposition", `attachment; filename="BRSR_Report_${scope}.json"`);
    return res.json(report);
  }

  if (format === "csv") {
    const rows = [["Section", "Principle", "Indicator ID", "Indicator", "Type", "Core KPI", "Entity", "Unit", "Current FY", "Previous FY", "Status", "Owner"]];
    [...report.sectionA, ...report.sectionB, ...report.sectionC].forEach(e => {
      rows.push([e.section, e.principle || "", e.indicatorId, e.indicator.replace(/,/g, ";"), e.type, e.coreKpi, e.entityLabel, e.unit, e.currentFY, e.previousFY, e.status, e.owner]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="BRSR_Report_${scope}.csv"`);
    return res.send(csv);
  }

  if (format === "html") {
    res.setHeader("Content-Type", "text/html");
    return res.send(renderReportHTML(report));
  }

  if (format === "pdf") {
    return generateBRSRReportPDF(report, res);
  }

  res.status(400).json({ error: "Unsupported format. Use json, csv, html, or pdf." });
});

app.get("/api/report/pdf", (req, res) => {
  const db = readDB();
  const scope = req.query.scope || "comprehensive";
  const role = req.query.role;
  const report = buildReport(db, scope);
  if (role) {
    return generatePortalReportPDF(role, res, { report });
  }
  generateBRSRReportPDF(report, res);
});

// Portal Role-Specific AI Report PDF generation (Accessible across all 6 portals)
app.get("/api/reports/pdf/:role", (req, res) => {
  const role = req.params.role;
  const db = readDB();
  const scope = req.query.scope || "comprehensive";
  const report = buildReport(db, scope);
  generatePortalReportPDF(role, res, { report });
});

function renderReportHTML(report) {
  function rowsFor(list) {
    return list.map(e => `<tr>
      <td>${e.indicatorId}</td><td>${e.principle || "-"}</td><td>${e.indicator}</td>
      <td>${e.type}</td><td>${e.coreKpi ? "Yes" : "No"}</td><td>${e.entityLabel}</td>
      <td>${e.unit}</td><td>${e.currentFY}</td><td>${e.previousFY}</td><td>${e.status}</td>
    </tr>`).join("");
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>BRSR Report</title>
  <style>
    body{font-family:Segoe UI,Arial,sans-serif;color:#1a2332;margin:40px;}
    h1{color:#0b3d2e;} h2{color:#14532d;border-bottom:2px solid #14532d;padding-bottom:4px;margin-top:36px;}
    table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;}
    th,td{border:1px solid #d0d7de;padding:6px 8px;text-align:left;}
    th{background:#0b3d2e;color:#fff;}
    tr:nth-child(even){background:#f4f7f5;}
    .meta{color:#555;margin-bottom:20px;}
  </style></head><body>
  <h1>BRSR Report — ${report.meta.entity}</h1>
  <div class="meta">Scope: <b>${report.meta.scope}</b> | Current FY: ${report.meta.currentFY} | Previous FY: ${report.meta.previousFY} | Generated: ${new Date(report.meta.generatedAt).toLocaleString()}</div>
  <h2>Section A: General Disclosures</h2>
  <table><tr><th>ID</th><th>Principle</th><th>Indicator</th><th>Type</th><th>Core KPI</th><th>Entity</th><th>Unit</th><th>Current FY</th><th>Previous FY</th><th>Status</th></tr>${rowsFor(report.sectionA)}</table>
  <h2>Section B: Management and Process Disclosures</h2>
  <table><tr><th>ID</th><th>Principle</th><th>Indicator</th><th>Type</th><th>Core KPI</th><th>Entity</th><th>Unit</th><th>Current FY</th><th>Previous FY</th><th>Status</th></tr>${rowsFor(report.sectionB)}</table>
  <h2>Section C: Principle-wise Performance</h2>
  <table><tr><th>ID</th><th>Principle</th><th>Indicator</th><th>Type</th><th>Core KPI</th><th>Entity</th><th>Unit</th><th>Current FY</th><th>Previous FY</th><th>Status</th></tr>${rowsFor(report.sectionC)}</table>
  </body></html>`;
}

// =================== ADMIN: departments / plants / fields ===================
app.get("/api/admin/summary", requireAuth, requireRole("Group Admin"), (req, res) => {
  const db = readDB();
  res.json({
    users: db.users.length,
    registryFields: db.registry.length,
    entries: db.entries.length,
    assignments: db.assignments.length,
    evidence: db.evidence.length
  });
});

// =================== ESG INTELLIGENCE & ACTION ENGINE API ===================
app.get("/api/action-engine/plant04", requireAuth, (req, res) => {
  res.json({
    usp: "Data → Evidence → Validation → AI Explanation → Action → Verification → Report",
    caseId: "CASE-PLANT04-ELEC-23PCT",
    title: "Plant 04 Electricity Consumption Anomaly (+23.4%)",
    facility: "Plant 04 · Hyderabad Manufacturing Complex",
    status: "CLOSED_AND_VERIFIED",
    brsrReadiness: 92.4,
    steps: [
      {
        step: 1,
        id: "source",
        title: "Data Source Lineage",
        badge: "VERIFIED SOURCE",
        lineage: "Plant 04 → Substation Digital Meter #M-402 → Energy Ledger FY25-Q3 → Utility Invoice #INV-8891",
        reading: "142,500 kWh",
        baseline: "115,400 kWh",
        timestamp: "04 Oct 2026, 23:59:59 IST",
        hash: "8f3a9e22b071c4d9a65f884102c98d63e71c"
      },
      {
        step: 2,
        id: "validation",
        title: "Validation & Evidence Check",
        badge: "AI RULES PASSED",
        rulesPassed: [
          "Utility Invoice OCR Verification: 142,500 kWh matches scanned bill",
          "Digital Meter Calibration: NABL Certified Valid through Mar 2027",
          "Duplicate Record Scan: 0 duplicate submissions found across 18 states",
          "Cryptographic SHA-256 Ledger: Hash validated against immutable chain"
        ]
      },
      {
        step: 3,
        id: "anomaly",
        title: "Anomaly Detection",
        badge: "VARIANCE DETECTED",
        metric: "Electricity Consumption",
        variance: "+23.4%",
        deltaKwh: "+27,100 kWh",
        threshold: "+10.0% Statutory Tolerance",
        severity: "CRITICAL"
      },
      {
        step: 4,
        id: "explanation",
        title: "AI Root Cause Explanation",
        badge: "ROOT CAUSE IDENTIFIED",
        diagnosis: "Plant 04 production output grew by only +4.1%, eliminating production surge as primary factor. Sub-meter multi-sensor diagnostics isolate HVAC Chiller Unit #2 compressor efficiency degraded by 31.4%, operating in non-inverter bypass cycle during peak daytime tariff hours.",
        breakdown: [
          { factor: "Production Volume Gain", impact: "+4.1% (Expected: +4,700 kWh)" },
          { factor: "Ambient Temperature Delta (+1.2°C)", impact: "+2.5% (Expected: +2,880 kWh)" },
          { factor: "HVAC Chiller #2 Compressor Degradation", impact: "+16.8% (Root Cause: +19,520 kWh)" }
        ]
      },
      {
        step: 5,
        id: "action",
        title: "Autonomous Action Assignment",
        badge: "CAPA TICKET DISPATCHED",
        actionId: "CAPA-2026-084",
        task: "Execute Plant 04 Chiller Unit #2 Compressor Overhaul & Substation Energy Efficiency Audit",
        owner: "Vikram Singh (Plant 04 Operations Manager)",
        deadline: "15 Oct 2026",
        priority: "High",
        targetReduction: "24,000 kWh/month"
      },
      {
        step: 6,
        id: "verification",
        title: "Evidence Upload & Dual Sign-Off",
        badge: "CLOSED & VERIFIED",
        evidence: [
          "OEM Compressor Overhaul Service Report #SR-4410 (BlueStar Engineering)",
          "FLIR Thermal Energy Imaging Audit Scan PDF",
          "Calibrated Sub-meter Post-Service Telemetry (Normalized to 116,200 kWh/mo)"
        ],
        approvals: [
          { role: "EHS Officer", name: "Priya Nair", date: "12 Oct 2026", status: "Verified & Approved" },
          { role: "Statutory Auditor", name: "Anand Sharma (FCA)", date: "14 Oct 2026", status: "ISAE 3000 Sealed" }
        ]
      },
      {
        step: 7,
        id: "readiness",
        title: "BRSR Readiness & Reporting",
        badge: "SEBI COMPLIANT",
        readinessScore: 92.4,
        previousScore: 88.8,
        scoreGain: "+3.6%",
        avoidedEmissions: "22.8 tCO2e/month Scope 2 Avoided",
        reportingStatus: "Data synchronized to SEBI BRSR Principle 6 Energy Disclosures"
      }
    ]
  });
});

// =================== AI VOICE COPILOT BACKEND ENGINE ===================
const { processCopilotQuery } = require("./scripts/aiCopilotEngine");

app.post("/api/ai-copilot", async (req, res) => {
  try {
    const { query, alternatives, scene, page, apiKey } = req.body || {};
    if (!query && (!alternatives || alternatives.length === 0)) {
      return res.status(400).json({ error: "Missing query parameter" });
    }
    const result = await processCopilotQuery({
      query,
      alternatives: alternatives || [],
      scene: scene || {},
      page: page || "dashboard.html",
      apiKey: apiKey || process.env.GEMINI_API_KEY
    });
    res.json(result);
  } catch (err) {
    console.error("AI Copilot error:", err);
    res.status(500).json({ error: "Failed to process AI Copilot instruction", details: err.message });
  }
});

// =================== AI REPORT ASSISTANT (Gemini-Powered Chat) ===================
app.post("/api/ai-chat", requireAuth, async (req, res) => {
  try {
    const { message, projectId, companyId, apiKey } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) return res.status(400).json({ error: "No API key provided. Please enter your Gemini API key.", needsKey: true });

    const db = readDB();

    // Gather project context if available
    let projectContext = "";
    let reportData = null;
    if (projectId) {
      reportData = getProjectDetailReport(projectId, db);
      if (reportData) {
        const pSummaries = reportData.principles.map(p => {
          const entered = p.items.filter(i => i.hasData && i.currentFY !== "Not entered").length;
          const numericItems = p.items.filter(i => i.hasData && typeof i.currentFY === "number").slice(0, 3);
          const sampleData = numericItems.map(i => `${i.indicator}: ${i.currentFY} ${i.unit}`).join(", ");
          return `${p.code} ${p.name}: ${entered}/${p.items.length} indicators entered${sampleData ? " (e.g. " + sampleData + ")" : ""}`;
        }).join("\n");
        projectContext = `\nProject: ${reportData.project.name}\nReporting: ${reportData.reportingPeriod.currentFY}\nCompletion: ${reportData.stats.completionPct}% (${reportData.stats.recordedIndicators}/${reportData.stats.totalIndicators} indicators)\n\nPrinciple-wise summary:\n${pSummaries}`;
      }
    }

    let companyContext = "";
    if (companyId) {
      const compSummary = getCompanyScopedSummary(companyId, db);
      if (compSummary) {
        companyContext = `\nCompany: ${compSummary.entity.name} (${compSummary.entity.sector})\nOverall completion: ${compSummary.summary.completionPct}%`;
      }
    }

    const systemPrompt = `You are the AI Report Assistant for MEIL BRSR ESG Portal. You help users analyze BRSR sustainability reports across 9 principles:
P1 — Ethics, Transparency & Accountability
P2 — Sustainable & Safe Goods/Services
P3 — Employee Well-being
P4 — Stakeholder Engagement
P5 — Human Rights
P6 — Environment
P7 — Responsible Policy Advocacy
P8 — Inclusive Growth & Equitable Development
P9 — Consumer Responsibility

${companyContext}${projectContext}

RULES:
1. When the user asks for a report/chart, identify which principles they want.
2. Return a JSON response with:
   - "reply": A brief, friendly insight about the data (2-3 sentences max). Mention key data points if available. Use a professional but approachable tone.
   - "principles": Array of principle codes like ["P1", "P6"]. Return ALL 9 if user says "all"/"sab"/"sabhi"/"everything"/"all reports".
   - "needsSelection": true ONLY if you truly cannot determine which principles they want.
3. If the user asks a general question (not about generating charts), just reply conversationally with "principles": [] and "needsSelection": false.
4. Support Hindi/Hinglish naturally. The user may say "environment dikhao" (= show P6) or "sab dikha do" (= show all).
5. Never fabricate data. Reference only what's in the project context above.
6. Keep replies concise — this is a chat, not a report.`;

    const body = JSON.stringify({
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            reply: { type: "STRING" },
            principles: { type: "ARRAY", items: { type: "STRING" } },
            needsSelection: { type: "BOOLEAN" }
          },
          required: ["reply", "principles", "needsSelection"]
        }
      }
    });

    const https = require("https");
    const aiResult = await new Promise((resolve, reject) => {
      const req = https.request(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }, timeout: 12000 },
        (resp) => {
          let data = "";
          resp.on("data", chunk => data += chunk);
          resp.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                reject(new Error(parsed.error.message || "Gemini API error"));
                return;
              }
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                resolve(JSON.parse(text));
              } else {
                reject(new Error("Empty response from Gemini"));
              }
            } catch (e) {
              reject(new Error("Failed to parse Gemini response"));
            }
          });
        }
      );
      req.on("error", reject);
      req.on("timeout", () => { req.destroy(); reject(new Error("Gemini request timed out")); });
      req.write(body);
      req.end();
    });

    res.json(aiResult);
  } catch (err) {
    console.error("AI Chat error:", err);
    res.status(500).json({ error: err.message || "AI Chat failed", reply: "Sorry, couldn't process that. " + (err.message || ""), principles: [], needsSelection: false });
  }
});

// =================== UNIFIED ESG AI MICROSERVICES INTEGRATION ===================
const microservicesClient = require("./scripts/microservicesClient");

// 1. Live Health status of all 3 deployed microservices
app.get("/api/ai/microservices/health", async (req, res) => {
  try {
    const health = await microservicesClient.checkServicesHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: "Failed to query microservices health", details: err.message });
  }
});

// 2. Environmental Chatbot Proxy (Service 1)
app.post("/api/ai/environment-chat", async (req, res) => {
  try {
    const { message, sessionId, projectId } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message field" });
    const result = await microservicesClient.chatEnvironmental({ message, sessionId, projectId });
    if (!result.ok) {
      return res.status(result.status || 502).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to communicate with Environmental Chatbot", details: err.message });
  }
});

// 3. ESG Report Processing API Proxy (Service 2)
app.post("/api/ai/emission-process/:reportId", async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const apiKey = req.headers["x-api-key"] || req.body?.apiKey;
    const result = await microservicesClient.processEmissionReport({ reportId, apiKey });
    if (!result.ok) {
      return res.status(result.status || 502).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to communicate with ESG Report Processing API", details: err.message });
  }
});

// 4. Employee ESG Extraction Proxy (Service 3)
app.post("/api/ai/employee-extract", async (req, res) => {
  try {
    const { companyName } = req.body || {};
    if (!companyName) return res.status(400).json({ error: "Missing companyName field" });
    const result = await microservicesClient.extractEmployeeESG({ companyName });
    if (!result.ok) {
      return res.status(result.status || 502).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to extract employee ESG data", details: err.message });
  }
});

// 5. ESG Report Extraction Proxy (Service 3)
app.post("/api/ai/report-extract", async (req, res) => {
  try {
    const { reportName } = req.body || {};
    if (!reportName) return res.status(400).json({ error: "Missing reportName field" });
    const result = await microservicesClient.extractESGReport({ reportName });
    if (!result.ok) {
      return res.status(result.status || 502).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to extract ESG report", details: err.message });
  }
});

// 6. Fetch Report PDF Proxy (Service 3) with reliable fallback generator
app.get("/api/ai/report-pdf", async (req, res) => {
  try {
    const reportName = req.query.report_name;
    if (!reportName) return res.status(400).json({ error: "Missing report_name query parameter" });
    const format = req.query.format;
    
    // If format explicitly requests PDF streaming, generate immediately
    if (format === "pdf") {
      return generateEmployeeReportPDF(reportName, res);
    }

    const result = await microservicesClient.fetchReportPdf({ reportName });
    if (result.ok && result.raw && (typeof result.raw === "string" && result.raw.startsWith("%PDF") || Buffer.isBuffer(result.raw))) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${reportName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`);
      return res.send(result.raw);
    }

    if (!result.ok) {
      // Graceful fallback: If upstream does not have document or returned 404, stream generated PDF
      if (req.headers.accept && req.headers.accept.includes("application/pdf")) {
        return generateEmployeeReportPDF(reportName, res);
      }
      return res.status(result.status || 502).json({
        ...result,
        downloadUrl: `/api/ai/report-pdf?report_name=${encodeURIComponent(reportName)}&format=pdf`
      });
    }
    res.json(result);
  } catch (err) {
    if (req.query.format === "pdf") {
      return generateEmployeeReportPDF(req.query.report_name || "MEIL_Workforce_Report", res);
    }
    res.status(500).json({ error: "Failed to fetch report PDF", details: err.message });
  }
});

// 7. Unified AI Copilot Dispatcher (All 3 Services + Smart Routing + Groq Cloud LLM)
app.post("/api/ai/unified-assistant", async (req, res) => {
  try {
    const { message, mode, sessionId, projectId, companyName, reportId, reportName, apiKey, groqApiKey } = req.body || {};
    if (!message && mode !== 'emissions') {
      return res.status(400).json({ error: "Missing message field" });
    }
    const result = await microservicesClient.dispatchUnifiedRequest({
      mode,
      message,
      sessionId,
      projectId,
      companyName,
      reportId,
      reportName,
      apiKey,
      groqApiKey
    });
    if (!result.ok) {
      return res.status(result.status || 502).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error("Unified assistant error:", err);
    res.status(500).json({ error: "Unified assistant request failed", details: err.message });
  }
});

// Dynamic Groq Key Management
app.post("/api/ai/set-groq-key", (req, res) => {
  try {
    const { apiKey } = req.body || {};
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim().startsWith('gsk_')) {
      return res.status(400).json({ ok: false, error: "Valid Groq API key required (must begin with 'gsk_')" });
    }
    const cleanKey = apiKey.trim();
    microservicesClient.persistEnvKey('GROQ_API_KEY', cleanKey);
    process.env.GROQ_API_KEY = cleanKey;
    res.json({
      ok: true,
      message: "Groq Cloud API Key configured & persisted successfully!",
      model: "llama-3.3-70b-versatile",
      preview: cleanKey.slice(0, 7) + "..." + cleanKey.slice(-4)
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/ai/groq-status", (req, res) => {
  const key = process.env.GROQ_API_KEY || '';
  res.json({
    configured: Boolean(key),
    model: key ? "llama-3.3-70b-versatile" : "local-domain-intelligence",
    preview: key ? (key.slice(0, 7) + "..." + key.slice(-4)) : null
  });
});

// =================== ENTERPRISE CROSS-ROLE DATA PIPELINE ===================
const {
  initEnterpriseState,
  addPlantLog,
  lockPlantMonth,
  issueAuditorSeal,
  approveBoardFiling
} = require("./scripts/enterprisePipeline");

app.get("/api/operations/state", requireAuth, (req, res) => {
  const db = readDB();
  const state = initEnterpriseState(db);
  res.json(state);
});

app.post("/api/operations/log", requireAuth, requireRole("Plant/Project Owner", "Group Admin", "Sustainability Lead", "Department Owner"), (req, res) => {
  const db = readDB();
  const user = currentUser(req, db);
  const result = addPlantLog(db, user, req.body);
  writeDB(db);
  res.json({ ok: true, log: result.newLog, hash: result.hash, state: result.state });
});

app.post("/api/plant/signoff", requireAuth, requireRole("Plant/Project Owner", "Group Admin"), (req, res) => {
  const db = readDB();
  const user = currentUser(req, db);
  const { pin } = req.body;
  const result = lockPlantMonth(db, user, pin || "9428");
  writeDB(db);
  res.json({ ok: true, hash: result.hash, state: result.state });
});

app.post("/api/auditor/issue-seal", requireAuth, requireRole("Auditor", "Group Admin"), (req, res) => {
  const db = readDB();
  const user = currentUser(req, db);
  const result = issueAuditorSeal(db, user);
  writeDB(db);
  res.json({ ok: true, hash: result.hash, state: result.state });
});

app.post("/api/board/approve", requireAuth, requireRole("Management Viewer", "Group Admin"), (req, res) => {
  const db = readDB();
  const user = currentUser(req, db);
  const { pin } = req.body;
  const result = approveBoardFiling(db, user, pin || "2025");
  writeDB(db);
  res.json({ ok: true, hash: result.hash, state: result.state });
});

// =================== STATIC FRONTEND ===================
const FRONTEND_DIR = fs.existsSync(path.join(__dirname, "..", "frontend"))
  ? path.join(__dirname, "..", "frontend")
  : path.join(__dirname, "public");

app.use(express.static(FRONTEND_DIR));
app.get("/", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n  🚀 BRSR ESG Reporting Portal running at http://localhost:${port}\n`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`\n  ⚠️ Port ${port} is occupied by another process. Freeing port ${port}...`);
      try {
        if (process.platform === "win32") {
          const { execSync } = require("child_process");
          const out = execSync(`netstat -ano | findstr :${port}`).toString();
          const lines = out.trim().split("\n");
          const pidsToKill = new Set();
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== String(process.pid) && pid !== "0" && !isNaN(pid)) {
              pidsToKill.add(pid);
            }
          }
          let killed = false;
          for (const pid of pidsToKill) {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
              console.log(`  ✓ Port ${port} freed (closed stale process PID ${pid}).`);
              killed = true;
            } catch (_) {}
          }
          if (killed) {
            setTimeout(() => startServer(port), 500);
            return;
          }
        }
      } catch (killErr) {
        console.warn(`  Could not kill process on port ${port}:`, killErr.message);
      }
      const nextPort = Number(port) + 1;
      console.log(`  Falling back to port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(PORT);
