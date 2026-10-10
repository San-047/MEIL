# MEIL BRSR ESG Reporting Portal

A full-stack working prototype of an online portal for **BRSR (Business Responsibility and
Sustainability Reporting) reporting of Corporate ESG Reports**, built for a large infrastructure
group (modelled on MEIL — Megha Engineering and Infrastructures Limited) with subsidiaries,
business units, plants/projects, and departments.

Built for **Problem Statement 08**: *"Development of an online portal for BRSR reporting of
Corporate ESG Reports."*

---

## 1. Setup

**Requirements:** Node.js 18+, Python 3.8+ (with no external pip packages needed — only the
standard library is used).

```bash
npm install
npm run seed
npm start
```

The app runs at **http://localhost:3000**

### Voice control (English and Hindi)

Every page, including sign-in, has a small voice button in the top bar. Click **Voice** once to
start continuous voice control; it stays on while moving between portal pages. Click it again (or
use **Alt+V**) to stop. Open the nearby arrow to choose English or Hindi/Hinglish and see the last
recognized phrase. Chrome or Edge with microphone permission is recommended; browser speech
recognition requires HTTPS or localhost. Passwords should be entered with the keyboard.

Examples: “open dashboard” / “डैशबोर्ड खोलो”, “open data entry” / “डेटा एंट्री खोलो”,
“search for emissions” / “उत्सर्जन खोजो”, “edit row 123” / “पंक्ति 123 संपादित करो”,
“set status to submitted” / “स्थिति submitted करो”, “click preview report” / “रिपोर्ट देखें”,
“logout” / “लॉग आउट”. You can also say “read page” to hear a short summary. Voice commands can
activate the visible controls, tabs, filters, links, and form fields on the current page. Deleting a
user requires a second spoken confirmation.

`npm run seed` regenerates `data/db.json` with fresh synthetic demo data (org hierarchy, users,
BRSR registry entries, assignments, evidence, audit trail, and intentional data errors for the
validation demo). Re-run it any time to reset the dataset.

---

## 2. Demo Login Credentials

All demo users share the password **`demo123`**.

| Username        | Name            | Role                  | Scope                          |
|------------------|-----------------|------------------------|----------------------------------|
| `group.admin`    | Ramesh Kumar    | Group Admin            | Entire group                     |
| `sustain.lead`   | Anjali Rao      | Sustainability Lead    | Entire group                     |
| `hr.owner`       | Suresh Reddy    | Department Owner       | HR, Nagarjuna Sagar Hydro Plant  |
| `ehs.owner`      | Priya Nair      | Department Owner       | EHS, Nagarjuna Sagar Hydro Plant |
| `plant.owner`    | Vikram Singh    | Plant/Project Owner    | Godavari Thermal Project         |
| `auditor`        | Kavitha Iyer    | Auditor                | Read/trace across group          |
| `mgmt.viewer`    | Arjun Menon     | Management Viewer      | Read-only, group-wide            |
| `finance.owner`  | Deepa Krishnan  | Department Owner       | Finance, Nagarjuna Sagar Hydro   |

The login screen has one-click buttons to auto-fill each demo user.

---

## 3. Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no frameworks). Canvas-based charts (bar, line,
  donut) implemented from scratch — no charting libraries.
- **Backend:** Node.js + Express (REST API), `cookie-session` for auth, `multer` for evidence
  file uploads.
- **Validation engine:** Python 3 (`scripts/validate.py`), invoked by the Node backend via
  `child_process.execFile`, standard library only.
- **Database:** A single JSON document store (`data/db.json`) — chosen over SQLite for
  transparency and zero native-dependency risk in a hackathon environment, while keeping the
  same read/write contract a SQL-backed version would use.
- No React/Angular/Vue/Next.js, no Django/Flask/Java/PHP, no cloud services, no paid APIs.

---

## 4. Architecture

```
brsr-portal/
├── server.js                 # Express app: all REST routes, auth, report generation
├── scripts/
│   ├── indicators.js         # BRSR indicator catalog (Section A/B/C, 9 NGRBC principles)
│   ├── seed.js                # Generates org hierarchy, users, entries, assignments,
│   │                           # evidence, audit trail, and intentional validation errors
│   ├── validate.py            # Python validation engine (10 checks, 3 severities)
│   └── dbHelper.js            # Shared JSON read/write + entity-label helper
├── data/
│   └── db.json                # Generated data store (created by npm run seed)
├── uploads/                   # Evidence files uploaded through the UI land here
├── public/
│   ├── css/style.css          # Shared design system (cards, tables, badges, forms)
│   ├── css/voice.css          # Voice control panel styling
│   ├── js/common.js           # API wrapper, auth guard, sidebar, canvas chart helpers
│   ├── js/voice.js            # English/Hindi speech recognition and voice commands
│   └── pages/
│       ├── login.html
│       ├── dashboard.html
│       ├── org.html            # Organization hierarchy tree
│       ├── data-entry.html     # BRSR field entry + evidence upload
│       ├── assignments.html    # Workflow / task tracking
│       ├── validation.html     # Validation exceptions (Critical/Warning/Info)
│       ├── evidence.html       # Evidence repository
│       ├── audit.html          # Audit trail + Core KPI → evidence tracing
│       ├── reports.html        # Report builder (Comprehensive/Lite/Core, JSON/CSV/HTML)
│       └── admin.html          # Admin panel (users, org view, field catalog)
└── package.json
```

**Data flow for validation:** the Node server calls `python3 scripts/validate.py`, which reads
`data/db.json`, runs 10 categories of checks over every BRSR entry, and prints a JSON array of
results to stdout. Node parses this, stores it back into `db.json` as `validationResults`, and
serves it to the Validation Exceptions page — a genuine Node ⇄ Python integration, not a mock.

**Organization hierarchy modelled:** Group (MEIL) → 2 Subsidiaries → Business Units →
3 Plants/Projects → 4 Departments each (HR, Environment/EHS, Finance/Procurement, Compliance).

**BRSR structure implemented in full:**
- **Section A** — General Disclosures (13 fields: entity details, products/services, operations,
  employees/workers, holding/subsidiary/JV, CSR, transparency & compliance, ESG risks).
- **Section B** — Management & Process Disclosures, generated for **all 9 NGRBC principles**
  (policy, board approval, procedures, goals, governance, review frequency, compliance status,
  reasons for non-adoption) — 72 fields.
- **Section C** — Principle-wise Performance across all 9 principles (energy, water, emissions,
  wages, complaints, human rights, public policy, inclusive growth, consumer value) — assigned
  per plant, with **BRSR Core KPI** flags on the SEBI Core indicators.

160 total disclosure entries are seeded across the group, each carrying: section, principle,
essential/leadership type, Core KPI flag, unit, current FY value, previous FY value, owner,
status, and whether evidence is required.

---

## 5. Validation Examples

`npm run seed` deliberately injects known-bad data so the validation engine has something to
catch on first run (also re-triggerable from the UI via "Run Validation Now"):

| Check | Example injected error |
|---|---|
| Percentage out of range | Employee turnover rate recorded as 145% |
| Improbable/negative value | Total water withdrawal recorded as −450 KL |
| Internal reconciliation — energy | Renewable + non-renewable ≠ total energy for one plant |
| Internal reconciliation — complaints | Pending complaints (25) exceed filed complaints (10) |
| Internal reconciliation — wages | Female wages exceed total employee wages |
| Mandatory field missing | An essential Section C indicator left blank |
| Year-on-year variance | Scope 1 emissions jump from 1,000 → 3,200 tCO2e (>40%) |
| Unit mismatch | An energy field recorded against "MWh" vs catalog unit "GJ" |
| Missing evidence for Core KPI | A BRSR Core KPI with `evidenceRequired = true` and no file |
| Approaching deadline (Info) | Assignments still "Not Started" within 7 days of due date |

Each result carries a severity — **Critical / Warning / Info** — and is fully filterable in the
Validation Exceptions page.

---

## 6. Feature Checklist

- ✅ Login system with 6 distinct roles and scoped demo users
- ✅ Dashboard: overall completion, Section A/B/C completion, per-principle completion,
  per-plant completion, open exceptions by severity, pending approvals, overdue submissions,
  assurance readiness score, multi-year KPI trend charts
- ✅ Organization hierarchy: Group → Subsidiary → Business Unit → Plant/Project → Department
- ✅ Full BRSR structure: Section A, Section B (all 9 principles), Section C (all 9 principles)
- ✅ BRSR disclosure registry with all required metadata fields
- ✅ Data collection workflow / assignments with due dates, status, reminders, reviewer comments
- ✅ Data entry forms: current/previous FY, unit, remarks, evidence upload, comments
- ✅ Python validation engine with 10 check types and 3 severities
- ✅ Evidence repository with verification workflow and download
- ✅ Audit trail with old/new value tracking and Core-KPI-to-evidence tracing
- ✅ Report generation: Comprehensive / Lite / Core scopes; JSON, CSV, printable HTML exports
- ✅ Admin panel: users/roles, org view, disclosure field catalog
- ✅ Synthetic demo data across group, 2 subsidiaries, 3 plants, 12 departments
- ✅ Professional corporate UI: sidebar nav, cards, tables, badges, filters, canvas charts,
  responsive layout
- ✅ Voice control across sign-in and all portal modules, with English and Hindi commands,
  navigation, form entry, filters, tabs, visible actions, spoken page summaries, and deletion confirmation

---

## 7. How This Solves BRSR Reporting for Corporate ESG Reports

MEIL Group has ~250 projects across India and abroad, each of which must ultimately roll up into
one SEBI-compliant BRSR filing. Today that means spreadsheets, emails, and manual consolidation
across dozens of departments — slow, error-prone, and impossible to audit.

This portal gives MEIL:

1. **A single structured registry** for every SEBI BRSR indicator (Section A/B/C, all 9 NGRBC
   principles, Essential vs Leadership, Core KPI flags) instead of ad-hoc spreadsheets.
2. **Granular ownership** — fields can be assigned down to a specific plant and department, with
   due dates, status tracking, and reviewer feedback loops, so nothing falls through the cracks
   across 250 projects.
3. **Automated data quality control** — the Python validation engine catches the exact class of
   errors that break BRSR filings (reconciliation mismatches, out-of-range percentages, missing
   Core KPI evidence) *before* they reach the final report, not after an auditor finds them.
4. **Audit-ready traceability** — every value change is logged with who/when/old/new, and every
   BRSR Core KPI can be traced back to its supporting evidence file in one click, which is
   exactly what assurance providers require under SEBI's reasonable/limited assurance regime.
5. **One-click consolidated reporting** — Comprehensive, Lite, or Core-only report scopes,
   exportable as a printable HTML report, JSON, or CSV, generated from live data instead of being
   manually re-typed every filing cycle.
6. **Executive visibility** — the dashboard gives Group Admin and Management Viewer roles a
   real-time view of completion %, assurance readiness, and open exceptions across the entire
   group, without waiting for a quarter-end consolidation exercise.

---

## 8. Hackathon Judging Pitch

**Problem:** MEIL Group must report ESG performance under SEBI's BRSR framework across ~250
projects and multiple subsidiaries — a reporting burden that doesn't have a purpose-built system
today.

**What we built:** A complete, runnable full-stack prototype — not a mockup — that models the
entire BRSR reporting lifecycle: registry → assignment → data entry → automated Python
validation → evidence → audit trail → consolidated report generation, wrapped in a role-based
portal covering Group Admin, Sustainability Lead, Department Owner, Plant/Project Owner, Auditor,
and Management Viewer.

**Why it matters:**
- It directly encodes the SEBI BRSR structure (Section A/B/C, all 9 NGRBC principles, Essential
  vs Leadership indicators, Core KPIs) rather than a generic form builder.
- The **Python validation engine** is a real differentiator: 10 distinct checks catch the exact
  data-integrity issues (reconciliation mismatches, missing Core KPI evidence, YoY variance
  spikes) that would otherwise surface only during external assurance.
- **Full traceability** from any Core KPI back to its source evidence file and complete change
  history — the single hardest requirement to retrofit once a reporting process already exists
  in spreadsheets.
- Runs entirely offline with `npm install && npm run seed && npm start` — no cloud dependency, no
  paid API keys, so it's immediately deployable inside MEIL's own infrastructure.

**What's next:** SQL-backed persistence for concurrent multi-user write scale, SSO integration,
configurable approval chains per principle, and automated XBRL/SEBI-format export.
