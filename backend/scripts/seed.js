const fs = require("fs");
const path = require("path");
const { buildFullRegistry, PRINCIPLES } = require("./indicators");
const { ENTITIES, CHECKLIST_1080 } = require("./entityCatalog");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- ORG HIERARCHY (Authentic MEIL Group Structure from CRISIL / Filings) ----------
const org = {
  group: { id: "GRP", name: "Megha Engineering and Infrastructures Limited (MEIL)" },
  subsidiaries: [
    {
      id: "SUB1", name: "MEIL Holdings Limited (MHL)",
      businessUnits: [
        {
          id: "BU1", name: "Electric Mobility & EHV Manufacturing",
          plants: [
            {
              id: "PLANT1", name: "Olectra Greentech Ltd.",
              departments: [
                { id: "DEPT1", name: "HR" },
                { id: "DEPT2", name: "Environment / EHS" },
                { id: "DEPT3", name: "Finance / Procurement" },
                { id: "DEPT4", name: "Compliance" }
              ]
            },
            {
              id: "PLANT2", name: "Evey Trans Pvt. Ltd.",
              departments: [
                { id: "DEPT5", name: "Operations & Fleet" },
                { id: "DEPT6", name: "Environment / EHS" },
                { id: "DEPT7", name: "Finance" },
                { id: "DEPT8", name: "Compliance" }
              ]
            }
          ]
        },
        {
          id: "BU2", name: "Hydro & Power Projects Division",
          plants: [
            {
              id: "PLANT3", name: "KU Power Projects Ltd.",
              departments: [
                { id: "DEPT9", name: "Operations" },
                { id: "DEPT10", name: "Environment / EHS" },
                { id: "DEPT11", name: "Finance" },
                { id: "DEPT12", name: "Compliance" }
              ]
            },
            {
              id: "PLANT4", name: "KU Dhauladhar Hydro Power Ltd.",
              departments: [
                { id: "DEPT13", name: "Plant Operations" },
                { id: "DEPT14", name: "EHS" },
                { id: "DEPT15", name: "Finance" },
                { id: "DEPT16", name: "Compliance" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "SUB2", name: "MEIL Advanced Technologies Private Limited",
      businessUnits: [
        {
          id: "BU3", name: "Strategic Communications & Electronics",
          plants: [
            {
              id: "PLANT5", name: "ICOMM Tele Limited",
              departments: [
                { id: "DEPT17", name: "R&D / Systems" },
                { id: "DEPT18", name: "EHS" },
                { id: "DEPT19", name: "Finance" },
                { id: "DEPT20", name: "Compliance" }
              ]
            },
            {
              id: "PLANT6", name: "ICOMM Energy Limited",
              departments: [
                { id: "DEPT21", name: "Grid Operations" },
                { id: "DEPT22", name: "EHS" },
                { id: "DEPT23", name: "Finance" },
                { id: "DEPT24", name: "Compliance" }
              ]
            },
            {
              id: "PLANT18", name: "ICOMM Limited",
              departments: [
                { id: "DEPT69", name: "Manufacturing" },
                { id: "DEPT70", name: "EHS" },
                { id: "DEPT71", name: "Finance" }
              ]
            },
            {
              id: "PLANT19", name: "ICOMM Electronics Limited",
              departments: [
                { id: "DEPT72", name: "Production" },
                { id: "DEPT73", name: "Quality Assurance" }
              ]
            },
            {
              id: "PLANT20", name: "ICOMM International Nigeria Limited",
              departments: [
                { id: "DEPT74", name: "International Operations" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "SUB3", name: "MEIL Global Holdings B.V. (International)",
      businessUnits: [
        {
          id: "BU4", name: "Drilling Rigs & Oilfield Equipment",
          plants: [
            {
              id: "PLANT7", name: "Drillmec S.p.A. (Design & Mfg)",
              departments: [
                { id: "DEPT25", name: "Heavy Engineering" },
                { id: "DEPT26", name: "HSE" },
                { id: "DEPT27", name: "Finance" },
                { id: "DEPT28", name: "Compliance" }
              ]
            },
            {
              id: "PLANT8", name: "Petreven (Oil & Gas Drilling)",
              departments: [
                { id: "DEPT29", name: "Drilling Operations" },
                { id: "DEPT30", name: "HSE" },
                { id: "DEPT31", name: "Finance" },
                { id: "DEPT32", name: "Compliance" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "SUB4", name: "MEIL Direct Utilities & Gas Subsidiaries",
      businessUnits: [
        {
          id: "BU5", name: "City Gas & Bulk Water Distribution",
          plants: [
            {
              id: "PLANT9", name: "Megha Gas (City Gas Distribution)",
              departments: [
                { id: "DEPT33", name: "Pipeline Distribution" },
                { id: "DEPT34", name: "EHS" },
                { id: "DEPT35", name: "Finance" },
                { id: "DEPT36", name: "Compliance" }
              ]
            },
            {
              id: "PLANT10", name: "MEIL (Bhubaneswar) Bulk Water Projects Pvt. Ltd.",
              departments: [
                { id: "DEPT37", name: "Water Works" },
                { id: "DEPT38", name: "EHS" },
                { id: "DEPT39", name: "Finance" },
                { id: "DEPT40", name: "Compliance" }
              ]
            },
            {
              id: "PLANT11", name: "MEIL Green Energy Limited",
              departments: [
                { id: "DEPT41", name: "Solar Operations" },
                { id: "DEPT42", name: "EHS" },
                { id: "DEPT43", name: "Finance" },
                { id: "DEPT44", name: "Compliance" }
              ]
            },
            {
              id: "PLANT21", name: "MEIL Pura Limited",
              departments: [
                { id: "DEPT75", name: "Utilities" }
              ]
            },
            {
              id: "PLANT22", name: "MEIL Sai Rama Oil & Gas Pvt. Ltd.",
              departments: [
                { id: "DEPT76", name: "Operations" }
              ]
            },
            {
              id: "PLANT23", name: "MEIL EV Trans Ltd.",
              departments: [
                { id: "DEPT77", name: "Fleet" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "SUB5", name: "Infrastructure / Road Project SPVs",
      businessUnits: [
        {
          id: "BU6", name: "National Highways & Expressways",
          plants: [
            {
              id: "PLANT12", name: "MEIL Balsua - Hiranagar Expressway Pvt. Ltd.",
              departments: [
                { id: "DEPT45", name: "Civil Projects" },
                { id: "DEPT46", name: "Safety & EHS" },
                { id: "DEPT47", name: "Commercial" },
                { id: "DEPT48", name: "Quality Assurance" }
              ]
            },
            {
              id: "PLANT13", name: "MEIL Vijayawada Bypass Roadways Pvt. Ltd.",
              departments: [
                { id: "DEPT49", name: "Site Engineering" },
                { id: "DEPT50", name: "Safety & EHS" },
                { id: "DEPT51", name: "Commercial" },
                { id: "DEPT52", name: "Quality Assurance" }
              ]
            },
            { id: "PLANT24", name: "MEIL Amas Shivrampur Roadways Pvt. Ltd.", departments: [{ id: "DEPT78", name: "Site Ops" }] },
            { id: "PLANT25", name: "MEIL Appa Junction Manneguda Roadways Pvt. Ltd.", departments: [{ id: "DEPT79", name: "Site Ops" }] },
            { id: "PLANT26", name: "MEIL Ramnagar Four Lane Roadways Pvt. Ltd.", departments: [{ id: "DEPT80", name: "Site Ops" }] },
            { id: "PLANT27", name: "MEIL Pileru Kalur Roadways Pvt. Ltd.", departments: [{ id: "DEPT81", name: "Site Ops" }] },
            { id: "PLANT28", name: "MEIL Gadwal Julekal Roadways Pvt. Ltd.", departments: [{ id: "DEPT82", name: "Site Ops" }] },
            { id: "PLANT29", name: "MEIL Kalyanpur Roadways Pvt. Ltd.", departments: [{ id: "DEPT83", name: "Site Ops" }] },
            { id: "PLANT30", name: "MEIL Kolhapur Roadways Pvt. Ltd.", departments: [{ id: "DEPT84", name: "Site Ops" }] },
            { id: "PLANT31", name: "MEIL Chengala Roadways Pvt. Ltd.", departments: [{ id: "DEPT85", name: "Site Ops" }] },
            { id: "PLANT32", name: "MEIL Neeleshwaram Roadways Pvt. Ltd.", departments: [{ id: "DEPT86", name: "Site Ops" }] }
          ]
        }
      ]
    },
    {
      id: "SUB6", name: "Power & Thermal Energy Entities",
      businessUnits: [
        {
          id: "BU7", name: "Independent Power Producers (IPPs)",
          plants: [
            {
              id: "PLANT14", name: "Meghavaram Power Pvt. Ltd.",
              departments: [
                { id: "DEPT53", name: "Thermal Generation" },
                { id: "DEPT54", name: "EHS" },
                { id: "DEPT55", name: "Finance" },
                { id: "DEPT56", name: "Compliance" }
              ]
            },
            {
              id: "PLANT15", name: "SEPC Power Pvt. Ltd.",
              departments: [
                { id: "DEPT57", name: "Plant Ops" },
                { id: "DEPT58", name: "EHS" },
                { id: "DEPT59", name: "Finance" },
                { id: "DEPT60", name: "Compliance" }
              ]
            },
            { id: "PLANT33", name: "TP Power Holdings Pvt. Ltd.", departments: [{ id: "DEPT87", name: "Power Holdings" }] },
            { id: "PLANT34", name: "MEIL Anpara Energy Ltd.", departments: [{ id: "DEPT88", name: "Thermal Generation" }] }
          ]
        }
      ]
    },
    {
      id: "SUB7", name: "Other Support & Manufacturing Entities",
      businessUnits: [
        {
          id: "BU8", name: "Manufacturing & Shared Services",
          plants: [
            {
              id: "PLANT16", name: "MEIL Fibre Glass Industries",
              departments: [
                { id: "DEPT61", name: "Production" },
                { id: "DEPT62", name: "Safety" },
                { id: "DEPT63", name: "Accounts" },
                { id: "DEPT64", name: "Compliance" }
              ]
            },
            {
              id: "PLANT17", name: "MEIL Media Ltd.",
              departments: [
                { id: "DEPT65", name: "Broadcasting" },
                { id: "DEPT66", name: "Admin" },
                { id: "DEPT67", name: "Finance" },
                { id: "DEPT68", name: "Legal" }
              ]
            },
            { id: "PLANT35", name: "MEIL Infrastructure Projects Ltd.", departments: [{ id: "DEPT89", name: "EPC Operations" }] },
            { id: "PLANT36", name: "MEIL Utilities & Services Pvt. Ltd.", departments: [{ id: "DEPT90", name: "Shared Services" }] },
            { id: "PLANT37", name: "MEIL HR Services Pvt. Ltd.", departments: [{ id: "DEPT91", name: "HR Services" }] }
          ]
        }
      ]
    }
  ]
};

function allPlants() {
  const out = [];
  org.subsidiaries.forEach(s => s.businessUnits.forEach(b => b.plants.forEach(p => {
    out.push({ subsidiaryId: s.id, subsidiaryName: s.name, businessUnitId: b.id, businessUnitName: b.name, plantId: p.id, plantName: p.name, departments: p.departments });
  })));
  return out;
}

// ---------- USERS ----------
const users = [
  { id: "U1", username: "group.admin", password: "demo123", name: "Ramesh Kumar", role: "Group Admin", scope: {} },
  { id: "U2", username: "sustain.lead", password: "demo123", name: "Anjali Rao", role: "Sustainability Lead", scope: {} },
  { id: "U3", username: "hr.owner", password: "demo123", name: "Suresh Reddy", role: "Department Owner", scope: { departmentId: "DEPT1", plantId: "PLANT1" } },
  { id: "U4", username: "ehs.owner", password: "demo123", name: "Priya Nair", role: "Department Owner", scope: { departmentId: "DEPT2", plantId: "PLANT1" } },
  { id: "U5", username: "plant.owner", password: "demo123", name: "Vikram Singh", role: "Plant/Project Owner", scope: { plantId: "PLANT9" } },
  { id: "U6", username: "auditor", password: "demo123", name: "Kavitha Iyer", role: "Auditor", scope: {} },
  { id: "U7", username: "mgmt.viewer", password: "demo123", name: "Arjun Menon", role: "Management Viewer", scope: {} },
  { id: "U8", username: "finance.owner", password: "demo123", name: "Deepa Krishnan", role: "Department Owner", scope: { departmentId: "DEPT3", plantId: "PLANT1" } }
];

// ---------- REGISTRY (catalog) ----------
const registry = buildFullRegistry();

// ---------- ENTRIES ----------
let entryId = 1;
const entries = [];
const now = new Date();
const FY = "FY 2025-26";
const PFY = "FY 2024-25";

function rnd(min, max) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const statuses = ["Not Started", "In Progress", "Submitted", "Needs Correction", "Approved"];

registry.filter(r => r.section === "A").forEach(r => {
  entries.push(makeEntry(r, { subsidiaryId: null, businessUnitId: null, plantId: null, departmentId: null }, "Group Admin"));
});

registry.filter(r => r.section === "B").forEach(r => {
  entries.push(makeEntry(r, { subsidiaryId: null, businessUnitId: null, plantId: null, departmentId: null }, "Sustainability Lead"));
});

// Do not fabricate ESG metrics for newly added entities (PLANT18-37).
// Only seed Section C entries for original 17 reporting entities (PLANT1-17).
const reportingPlantIds = [
  "PLANT1", "PLANT2", "PLANT3", "PLANT4", "PLANT5", "PLANT6", "PLANT7", "PLANT8",
  "PLANT9", "PLANT10", "PLANT11", "PLANT12", "PLANT13", "PLANT14", "PLANT15", "PLANT16", "PLANT17"
];
const reportingPlants = allPlants().filter(p => reportingPlantIds.includes(p.plantId));

registry.filter(r => r.section === "C").forEach(r => {
  reportingPlants.forEach(p => {
    const dept = p.departments[Math.floor(Math.random() * p.departments.length)];
    entries.push(makeEntry(r, {
      subsidiaryId: p.subsidiaryId, businessUnitId: p.businessUnitId, plantId: p.plantId, departmentId: dept.id
    }, "Department Owner"));
  });
});

function makeEntry(reg, entityPath, ownerRole) {
  const id = "E" + String(entryId++).padStart(4, "0");
  let current = "", previous = "";
  if (reg.unit === "%") {
    previous = rnd(10, 60);
    current = Math.min(100, Math.max(0, Math.round((previous * (1 + rnd(-0.15, 0.15))) * 100) / 100));
  }
  else if (reg.unit === "boolean") { current = pick(["Yes", "No"]); previous = pick(["Yes", "No"]); }
  else if (reg.unit === "text") { current = ""; previous = ""; }
  else if (reg.unit === "count" || reg.unit === "INR Lakhs" || reg.unit === "GJ" || reg.unit === "KL" || reg.unit === "MT" || reg.unit === "tCO2e" || reg.unit === "rate") {
    previous = rnd(50, 5000);
    current = Math.round((previous * (1 + rnd(-0.15, 0.15))) * 100) / 100;
  }
  return {
    id, indicatorId: reg.id, section: reg.section, principle: reg.principle, indicator: reg.indicator,
    type: reg.type, coreKpi: reg.coreKpi, unit: reg.unit,
    entityPath, currentFY: current, previousFY: previous,
    remarks: "", evidenceRequired: !!reg.coreKpi, evidenceId: null,
    owner: ownerRole, status: pick(statuses),
    reviewerComments: "", dueDate: dueDateFor(), reminder: false
  };
}

function dueDateFor() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 45) - 15);
  return d.toISOString().split("T")[0];
}

// Consistent synthetic data for specific plants
reportingPlants.forEach((p, idx) => {
  function findEntry(indicatorSubstr, plantId) {
    return entries.find(e => e.indicator.includes(indicatorSubstr) && (!plantId || e.entityPath.plantId === plantId));
  }

  // Energy consistency
  const ren = findEntry("energy consumption (renewable)", p.plantId);
  const nonRen = findEntry("energy consumption (non-renewable)", p.plantId);
  const total = findEntry("energy consumption (overall)", p.plantId);
  if (ren && nonRen && total) {
    ren.currentFY = rnd(200, 800);
    nonRen.currentFY = rnd(500, 1500);
    total.currentFY = Math.round((ren.currentFY + nonRen.currentFY) * 100) / 100;
  }

  // Stakeholder complaints consistency
  const filed = findEntry("Complaints filed by stakeholders", p.plantId);
  const pending = findEntry("Complaints pending resolution", p.plantId);
  if (filed && pending) {
    filed.currentFY = Math.floor(rnd(5, 25));
    pending.currentFY = Math.floor(rnd(0, filed.currentFY));
  }
});

// ---------- AUDIT TRAIL ----------
const auditTrail = [
  { id: "AUD00001", timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), user: "Anjali Rao", action: "Policy Approved", field: "Policy covering P1", indicatorId: "B-P1-01", entity: "Group", oldValue: "No", newValue: "Yes", evidenceLink: null, entryId: "E0014" },
  { id: "AUD00002", timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), user: "Suresh Reddy", action: "Value Updated", field: "Total number of employees", indicatorId: "A-06", entity: "Group", oldValue: 12500, newValue: 13240, evidenceLink: null, entryId: "E0006" },
  { id: "AUD00003", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), user: "Priya Nair", action: "Evidence Uploaded", field: "Total Scope 1 GHG emissions", indicatorId: "C-P6-02", entity: "MEIL Holdings Limited (MHL) / Olectra Greentech Ltd.", oldValue: null, newValue: "EV00001", evidenceLink: "EV00001", entryId: "E0124" },
  { id: "AUD00004", timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), user: "Vikram Singh", action: "Status Change", field: "Total water withdrawal", indicatorId: "C-P6-01", entity: "MEIL Direct Utilities & Gas Subsidiaries / Megha Gas (City Gas Distribution)", oldValue: "In Progress", newValue: "Submitted", evidenceLink: null, entryId: "E0210" }
];

// ---------- ASSIGNMENTS ----------
const assignments = entries
  .filter(e => e.section === "C" || (e.section === "B" && Math.random() < 0.15))
  .map((e, i) => ({
    id: "AS" + String(i + 1).padStart(4, "0"),
    entryId: e.id,
    indicatorId: e.indicatorId,
    indicator: e.indicator,
    entityPath: e.entityPath,
    owner: users.find(u => u.role === "Department Owner" && (!e.entityPath.plantId || u.scope.plantId === e.entityPath.plantId))?.name || "Department Owner (unassigned)",
    dueDate: e.dueDate,
    status: e.status,
    reminder: e.reminder,
    reviewerComments: e.status === "Needs Correction" ? "Please re-verify source data and re-upload evidence." : ""
  }));

// ---------- EVIDENCE ----------
const evidence = [];
let evId = 1;
entries.filter(e => e.coreKpi && Math.random() < 0.6).forEach(e => {
  const id = "EV" + String(evId++).padStart(4, "0");
  evidence.push({
    id, fileName: `${e.indicatorId}_evidence_${e.id}.pdf`,
    linkedEntryId: e.id, linkedIndicator: e.indicator,
    uploadedBy: pick(users.filter(u => u.role === "Department Owner")).name,
    uploadedDate: dueDateFor(),
    evidenceType: pick(["Utility Bill", "Internal Audit Report", "Third-party Certificate", "Policy Document", "Statutory Filing"]),
    fileSizeKB: rnd(120, 4800),
    verificationStatus: pick(["Verified", "Pending Review", "Rejected"])
  });
  e.evidenceId = id;
});

// ---------- WRITE DATABASE ----------
const db = {
  meta: {
    currentFY: FY,
    currentFYLabel: "FY 2025-26",
    previousFY: PFY,
    previousFYLabel: "FY 2024-25",
    seededAt: now.toISOString()
  },
  org,
  entities: ENTITIES,
  checklist1080: CHECKLIST_1080,
  users,
  registry,
  entries,
  assignments,
  evidence,
  auditTrail
};

fs.writeFileSync(path.join(DATA_DIR, "db.json"), JSON.stringify(db, null, 2));
console.log(`\n  Database seeded with Authentic MEIL Group Companies!`);
console.log(`  Subsidiaries: ${org.subsidiaries.length}`);
console.log(`  Operating Entities / Plants: ${allPlants().length}`);
console.log(`  Catalog Entities: ${ENTITIES.length}`);
console.log(`  Entries: ${entries.length} | Assignments: ${assignments.length} | Evidence: ${evidence.length}\n`);
