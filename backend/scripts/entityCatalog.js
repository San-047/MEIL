// Canonical MEIL Entity Catalog & 1080.pdf Checklist
// Reference: C:\Users\shubh\OneDrive\Pictures\Screenshots\Screenshot 2026-09-29 115743.png
// Reference: D:\BPUT 1.O\1080.pdf

const CHECKLIST_1080 = [
  // P1 — Ethics, Transparency & Accountability
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 1, title: "Training and awareness on NGRBC principles" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 2, title: "Fines, penalties, settlements and awards" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 3, title: "Anti-corruption and anti-bribery practices" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 4, title: "Disciplinary action related to corruption/bribery" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 5, title: "Conflict-of-interest related complaints" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 6, title: "Corrective action on corruption/conflict-of-interest issues" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 7, title: "Awareness programmes for value-chain partners" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 8, title: "Number of days of accounts payable" },
  { pCode: "P1", pName: "Ethics, Transparency & Accountability", seq: 9, title: "Openness of business: trading houses, dealers, related parties, loans and investments" },

  // P2 — Sustainable & Safe Goods/Services
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 1, title: "R&D; investment for environmental/social impact" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 2, title: "Capital expenditure for environmental/social impact" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 3, title: "Sustainable sourcing" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 4, title: "Safe reclamation, reuse, recycling or disposal of products" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 5, title: "Extended Producer Responsibility (EPR)" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 6, title: "Life Cycle Assessment (LCA)" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 7, title: "Products/services with significant social or environmental impact" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 8, title: "Corrective action based on LCA findings" },
  { pCode: "P2", pName: "Sustainable & Safe Goods/Services", seq: 9, title: "Sustainable/recycled input materials and related practices" },

  // P3 — Employee Well-being
  { pCode: "P3", pName: "Employee Well-being", seq: 1, title: "Employee/worker well-being benefits" },
  { pCode: "P3", pName: "Employee Well-being", seq: 2, title: "Spending on well-being measures" },
  { pCode: "P3", pName: "Employee Well-being", seq: 3, title: "Accessibility of workplace" },
  { pCode: "P3", pName: "Employee Well-being", seq: 4, title: "Equal opportunity and diversity-related information" },
  { pCode: "P3", pName: "Employee Well-being", seq: 5, title: "Return-to-work and retention after parental leave" },
  { pCode: "P3", pName: "Employee Well-being", seq: 6, title: "Grievance mechanisms" },
  { pCode: "P3", pName: "Employee Well-being", seq: 7, title: "Minimum wages" },
  { pCode: "P3", pName: "Employee Well-being", seq: 8, title: "Health and safety training" },
  { pCode: "P3", pName: "Employee Well-being", seq: 9, title: "Skill-upgradation training" },
  { pCode: "P3", pName: "Employee Well-being", seq: 10, title: "Performance and career-development reviews" },
  { pCode: "P3", pName: "Employee Well-being", seq: 11, title: "Occupational health and safety management system" },
  { pCode: "P3", pName: "Employee Well-being", seq: 12, title: "Work-related hazards and risk assessment" },
  { pCode: "P3", pName: "Employee Well-being", seq: 13, title: "Safety incidents and injuries" },
  { pCode: "P3", pName: "Employee Well-being", seq: 14, title: "Fatalities / high-consequence injuries" },
  { pCode: "P3", pName: "Employee Well-being", seq: 15, title: "Occupational health services" },
  { pCode: "P3", pName: "Employee Well-being", seq: 16, title: "Social security and employee benefits" },
  { pCode: "P3", pName: "Employee Well-being", seq: 17, title: "POSH / sexual-harassment related information" },
  { pCode: "P3", pName: "Employee Well-being", seq: 18, title: "Value-chain worker/employee well-being" },
  { pCode: "P3", pName: "Employee Well-being", seq: 19, title: "Human-rights and employee-related practices" },
  { pCode: "P3", pName: "Employee Well-being", seq: 20, title: "Training coverage" },
  { pCode: "P3", pName: "Employee Well-being", seq: 21, title: "Other workforce welfare indicators" },

  // P4 — Stakeholder Engagement
  { pCode: "P4", pName: "Stakeholder Engagement", seq: 1, title: "Process for identifying key stakeholders" },
  { pCode: "P4", pName: "Stakeholder Engagement", seq: 2, title: "Key stakeholder groups and engagement frequency" },
  { pCode: "P4", pName: "Stakeholder Engagement", seq: 3, title: "Stakeholder communication channels" },
  { pCode: "P4", pName: "Stakeholder Engagement", seq: 4, title: "Stakeholder concerns/topics raised" },
  { pCode: "P4", pName: "Stakeholder Engagement", seq: 5, title: "Stakeholder consultation with the Board" },
  { pCode: "P4", pName: "Stakeholder Engagement", seq: 6, title: "Use of stakeholder feedback in environmental/social decisions" },
  { pCode: "P4", pName: "Stakeholder Engagement", seq: 7, title: "Engagement with vulnerable or marginalized groups" },

  // P5 — Human Rights
  { pCode: "P5", pName: "Human Rights", seq: 1, title: "Human-rights training" },
  { pCode: "P5", pName: "Human Rights", seq: 2, title: "Minimum-wage information" },
  { pCode: "P5", pName: "Human Rights", seq: 3, title: "Gross wages paid to females" },
  { pCode: "P5", pName: "Human Rights", seq: 4, title: "Human-rights due diligence" },
  { pCode: "P5", pName: "Human Rights", seq: 5, title: "Human-rights complaints/grievances" },
  { pCode: "P5", pName: "Human Rights", seq: 6, title: "Corrective/remedial actions" },
  { pCode: "P5", pName: "Human Rights", seq: 7, title: "POSH / sexual-harassment complaints" },
  { pCode: "P5", pName: "Human Rights", seq: 8, title: "Child labour" },
  { pCode: "P5", pName: "Human Rights", seq: 9, title: "Forced/involuntary labour" },
  { pCode: "P5", pName: "Human Rights", seq: 10, title: "Discrimination" },
  { pCode: "P5", pName: "Human Rights", seq: 11, title: "Human-rights performance review" },
  { pCode: "P5", pName: "Human Rights", seq: 12, title: "Human-rights risks in operations" },
  { pCode: "P5", pName: "Human Rights", seq: 13, title: "Human-rights risks in the value chain" },
  { pCode: "P5", pName: "Human Rights", seq: 14, title: "Human-rights policies" },
  { pCode: "P5", pName: "Human Rights", seq: 15, title: "Remediation/prevention measures" },

  // P6 — Environment
  { pCode: "P6", pName: "Environment", seq: 1, title: "Energy consumption and energy intensity" },
  { pCode: "P6", pName: "Environment", seq: 2, title: "Renewable vs non-renewable energy" },
  { pCode: "P6", pName: "Environment", seq: 3, title: "Water withdrawal and consumption" },
  { pCode: "P6", pName: "Environment", seq: 4, title: "Water intensity" },
  { pCode: "P6", pName: "Environment", seq: 5, title: "GHG emissions — Scope 1 and Scope 2" },
  { pCode: "P6", pName: "Environment", seq: 6, title: "GHG/emission intensity" },
  { pCode: "P6", pName: "Environment", seq: 7, title: "Air emissions" },
  { pCode: "P6", pName: "Environment", seq: 8, title: "Waste generated" },
  { pCode: "P6", pName: "Environment", seq: 9, title: "Waste recycled/reused/disposed" },
  { pCode: "P6", pName: "Environment", seq: 10, title: "Hazardous waste" },
  { pCode: "P6", pName: "Environment", seq: 11, title: "Plastic waste" },
  { pCode: "P6", pName: "Environment", seq: 12, title: "E-waste" },
  { pCode: "P6", pName: "Environment", seq: 13, title: "Waste-management practices" },
  { pCode: "P6", pName: "Environment", seq: 14, title: "Water/wastewater management" },
  { pCode: "P6", pName: "Environment", seq: 15, title: "Biodiversity / ecologically sensitive areas" },
  { pCode: "P6", pName: "Environment", seq: 16, title: "Environmental impact assessment" },
  { pCode: "P6", pName: "Environment", seq: 17, title: "Environmental compliance" },
  { pCode: "P6", pName: "Environment", seq: 18, title: "Environmental penalties/non-compliance" },
  { pCode: "P6", pName: "Environment", seq: 19, title: "Green/environmental initiatives" },
  { pCode: "P6", pName: "Environment", seq: 20, title: "Climate/environmental risks and mitigation" },
  { pCode: "P6", pName: "Environment", seq: 21, title: "Additional environmental/leadership disclosures" },

  // P7 — Responsible Policy Advocacy
  { pCode: "P7", pName: "Responsible Policy Advocacy", seq: 1, title: "Trade/industry chamber and association memberships" },
  { pCode: "P7", pName: "Responsible Policy Advocacy", seq: 2, title: "Anti-competitive conduct and corrective action" },
  { pCode: "P7", pName: "Responsible Policy Advocacy", seq: 3, title: "Public-policy positions advocated" },

  // P8 — Inclusive Growth & Equitable Development
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 1, title: "Social Impact Assessment (SIA)" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 2, title: "Rehabilitation & Resettlement (R&R;)" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 3, title: "Community grievance mechanism" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 4, title: "Procurement from MSMEs/small producers" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 5, title: "Procurement from local/district suppliers" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 6, title: "CSR projects" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 7, title: "CSR spending in aspirational districts" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 8, title: "Negative social impacts and corrective actions" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 9, title: "Preferential procurement from marginalized/vulnerable groups" },
  { pCode: "P8", pName: "Inclusive Growth & Equitable Development", seq: 10, title: "Benefits from intellectual property/traditional knowledge" },

  // P9 — Consumer Responsibility
  { pCode: "P9", pName: "Consumer Responsibility", seq: 1, title: "Consumer complaint/feedback mechanism" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 2, title: "Turnover from environmentally/socially responsible products/services" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 3, title: "Consumer complaints — data privacy" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 4, title: "Consumer complaints — advertising" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 5, title: "Consumer complaints — cybersecurity" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 6, title: "Consumer complaints — essential services" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 7, title: "Consumer complaints — restrictive/unfair trade practices" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 8, title: "Product recalls due to safety issues" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 9, title: "Cybersecurity/data-privacy policy" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 10, title: "Corrective actions for consumer-related issues" },
  { pCode: "P9", pName: "Consumer Responsibility", seq: 11, title: "Product/service information and responsible consumer communication" }
];

// All 41 uniquely named entities from Screenshot 2026-09-29 115743.png
const ENTITIES = [
  // 1. Parent Flagship
  {
    id: "ENT-MEIL",
    name: "Megha Engineering and Infrastructures Limited (MEIL)",
    type: "Parent / Flagship Company",
    branch: "Parent / Group Company",
    branches: ["Parent / Group Company"],
    sector: "Infrastructure & Engineering",
    description: "Flagship Company – Unlisted Public Limited",
    plantId: null,
    childProjectIds: ["PLANT1", "PLANT2", "PLANT3", "PLANT4", "PLANT5", "PLANT6", "PLANT7", "PLANT8", "PLANT9", "PLANT10", "PLANT11", "PLANT12", "PLANT13", "PLANT14", "PLANT15", "PLANT16", "PLANT17"]
  },

  // 2. MEIL Holdings Limited (MHL)
  {
    id: "ENT-MHL",
    name: "MEIL Holdings Limited (MHL)",
    type: "Holding Company",
    branch: "MEIL Holdings Limited (MHL)",
    branches: ["MEIL Holdings Limited (MHL)"],
    sector: "Holding & Investments",
    description: "Holding Company",
    plantId: null,
    childProjectIds: ["PLANT1", "PLANT2", "PLANT3", "PLANT4"]
  },
  {
    id: "PLANT1",
    name: "Olectra Greentech Ltd.",
    type: "Operating Subsidiary",
    branch: "MEIL Holdings Limited (MHL)",
    branches: ["MEIL Holdings Limited (MHL)"],
    sector: "Manufacturing / Transport & Mobility",
    description: "Electric Buses & EHV Insulators Manufacturing",
    plantId: "PLANT1",
    childProjectIds: ["PLANT1"]
  },
  {
    id: "PLANT2",
    name: "Evey Trans Pvt. Ltd.",
    type: "Operating Subsidiary",
    branch: "MEIL Holdings Limited (MHL)",
    branches: ["MEIL Holdings Limited (MHL)"],
    sector: "Transport & Mobility",
    description: "Electric Bus Operations & Public Transport",
    plantId: "PLANT2",
    childProjectIds: ["PLANT2"]
  },
  {
    id: "PLANT3",
    name: "KU Power Projects Ltd.",
    type: "Operating Subsidiary",
    branch: "MEIL Holdings Limited (MHL)",
    branches: ["MEIL Holdings Limited (MHL)", "Power / Energy Entities"],
    sector: "Power & Energy",
    description: "Power Projects (Also under Power/Energy Entities)",
    plantId: "PLANT3",
    childProjectIds: ["PLANT3"]
  },
  {
    id: "PLANT4",
    name: "KU Dhauladhar Hydro Power Ltd.",
    type: "Operating Subsidiary",
    branch: "MEIL Holdings Limited (MHL)",
    branches: ["MEIL Holdings Limited (MHL)", "Power / Energy Entities"],
    sector: "Power & Energy",
    description: "Hydro Power (Also under Power/Energy Entities)",
    plantId: "PLANT4",
    childProjectIds: ["PLANT4"]
  },

  // 3. MEIL Advanced Technologies Private Limited
  {
    id: "ENT-MAT",
    name: "MEIL Advanced Technologies Private Limited",
    type: "Holding Company",
    branch: "MEIL Advanced Technologies Private Limited",
    branches: ["MEIL Advanced Technologies Private Limited"],
    sector: "Holding & Technology",
    description: "Holding Company",
    plantId: null,
    childProjectIds: ["PLANT5", "PLANT6"]
  },
  {
    id: "PLANT5",
    name: "ICOMM Tele Limited",
    type: "Operating Subsidiary",
    branch: "MEIL Advanced Technologies Private Limited",
    branches: ["MEIL Advanced Technologies Private Limited"],
    sector: "Telecom & Communications",
    description: "Strategic Communications & Electronics",
    plantId: "PLANT5",
    childProjectIds: ["PLANT5"]
  },
  {
    id: "PLANT6",
    name: "ICOMM Energy Limited",
    type: "Operating Subsidiary",
    branch: "MEIL Advanced Technologies Private Limited",
    branches: ["MEIL Advanced Technologies Private Limited"],
    sector: "Power & Energy / Telecom",
    description: "Power Transmission & Telecom Infrastructure",
    plantId: "PLANT6",
    childProjectIds: ["PLANT6"]
  },
  {
    id: "PLANT18",
    name: "ICOMM Limited",
    type: "Operating Subsidiary",
    branch: "MEIL Advanced Technologies Private Limited",
    branches: ["MEIL Advanced Technologies Private Limited"],
    sector: "Telecom & Communications",
    description: "Telecom & Power Towers Infrastructure",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT19",
    name: "ICOMM Electronics Limited",
    type: "Operating Subsidiary",
    branch: "MEIL Advanced Technologies Private Limited",
    branches: ["MEIL Advanced Technologies Private Limited"],
    sector: "Manufacturing / Electronics",
    description: "Defense & Strategic Electronics Hardware",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT20",
    name: "ICOMM International Nigeria Limited",
    type: "Operating Subsidiary",
    branch: "MEIL Advanced Technologies Private Limited",
    branches: ["MEIL Advanced Technologies Private Limited"],
    sector: "Telecom & Communications / International",
    description: "International Telecom & Turnkey Infrastructure",
    plantId: null,
    childProjectIds: []
  },

  // 4. MEIL Global Holdings B.V.
  {
    id: "ENT-MGH",
    name: "MEIL Global Holdings B.V.",
    type: "Holding Company",
    branch: "MEIL Global Holdings B.V.",
    branches: ["MEIL Global Holdings B.V."],
    sector: "Holding & Investments / International",
    description: "International Holding Company",
    plantId: null,
    childProjectIds: ["PLANT7", "PLANT8"]
  },
  {
    id: "PLANT7",
    name: "Drillmec",
    type: "Operating Subsidiary",
    branch: "MEIL Global Holdings B.V.",
    branches: ["MEIL Global Holdings B.V."],
    sector: "Manufacturing / Oil & Gas",
    description: "Drilling Rigs – Design & Manufacturing",
    plantId: "PLANT7",
    childProjectIds: ["PLANT7"]
  },
  {
    id: "PLANT8",
    name: "Petreven",
    type: "Operating Subsidiary",
    branch: "MEIL Global Holdings B.V.",
    branches: ["MEIL Global Holdings B.V."],
    sector: "Oil & Gas",
    description: "Oil & Gas Drilling Services",
    plantId: "PLANT8",
    childProjectIds: ["PLANT8"]
  },

  // 5. MEIL Direct Subsidiaries
  {
    id: "PLANT9",
    name: "Megha Gas",
    type: "Operating Subsidiary",
    branch: "MEIL Direct Subsidiaries",
    branches: ["MEIL Direct Subsidiaries"],
    sector: "Gas / City Gas Distribution",
    description: "City Gas Distribution (CGD)",
    plantId: "PLANT9",
    childProjectIds: ["PLANT9"]
  },
  {
    id: "PLANT21",
    name: "MEIL Pura Limited",
    type: "Operating Subsidiary",
    branch: "MEIL Direct Subsidiaries",
    branches: ["MEIL Direct Subsidiaries"],
    sector: "Infrastructure / Utilities",
    description: "Infrastructure & Rural Utilities",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT22",
    name: "MEIL Sai Rama Oil & Gas Pvt. Ltd.",
    type: "Operating Subsidiary",
    branch: "MEIL Direct Subsidiaries",
    branches: ["MEIL Direct Subsidiaries"],
    sector: "Oil & Gas",
    description: "Oil & Gas Exploration & Operations",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT10",
    name: "MEIL (Bhubaneswar) Bulk Water Projects Pvt. Ltd.",
    type: "Operating Subsidiary",
    branch: "MEIL Direct Subsidiaries",
    branches: ["MEIL Direct Subsidiaries"],
    sector: "Infrastructure / Water",
    description: "Water Infrastructure & Bulk Water Supply",
    plantId: "PLANT10",
    childProjectIds: ["PLANT10"]
  },
  {
    id: "PLANT23",
    name: "MEIL EV Trans Ltd.",
    type: "Operating Subsidiary",
    branch: "MEIL Direct Subsidiaries",
    branches: ["MEIL Direct Subsidiaries"],
    sector: "Transport & Mobility",
    description: "EV & Transport Related Operations",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT11",
    name: "MEIL Green Energy Limited",
    type: "Operating Subsidiary",
    branch: "MEIL Direct Subsidiaries",
    branches: ["MEIL Direct Subsidiaries", "Power / Energy Entities"],
    sector: "Power & Energy / Renewable",
    description: "Renewable Energy (Also under Power/Energy Entities)",
    plantId: "PLANT11",
    childProjectIds: ["PLANT11"]
  },

  // 6. Infrastructure / Road Project SPVs
  {
    id: "PLANT12",
    name: "MEIL Balsua - Hiranagar Expressway Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Expressway Project SPV",
    plantId: "PLANT12",
    childProjectIds: ["PLANT12"]
  },
  {
    id: "PLANT24",
    name: "MEIL Amas Shivrampur Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "HAM Roadways Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT25",
    name: "MEIL Appa Junction Manneguda Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "HAM Roadways Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT26",
    name: "MEIL Ramnagar Four Lane Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Four Lane Highway Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT27",
    name: "MEIL Pileru Kalur Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "HAM Roadways Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT28",
    name: "MEIL Gadwal Julekal Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Roadways Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT29",
    name: "MEIL Kalyanpur Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Roadways Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT30",
    name: "MEIL Kolhapur Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Roadways Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT13",
    name: "MEIL Vijayawada Bypass Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Express Bypass Highway SPV",
    plantId: "PLANT13",
    childProjectIds: ["PLANT13"]
  },
  {
    id: "PLANT31",
    name: "MEIL Chengala Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Highway Corridor Project SPV",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT32",
    name: "MEIL Neeleshwaram Roadways Pvt. Ltd.",
    type: "Project SPV",
    branch: "Infrastructure / Road Project SPVs",
    branches: ["Infrastructure / Road Project SPVs"],
    sector: "Infrastructure / Roads & Expressways",
    description: "Highway Corridor Project SPV",
    plantId: null,
    childProjectIds: []
  },

  // 7. Power / Energy Entities
  {
    id: "PLANT14",
    name: "Meghavaram Power Pvt. Ltd.",
    type: "Power & Energy Entity",
    branch: "Power / Energy Entities",
    branches: ["Power / Energy Entities"],
    sector: "Power & Energy",
    description: "Thermal Power Generation (IPP)",
    plantId: "PLANT14",
    childProjectIds: ["PLANT14"]
  },
  {
    id: "PLANT15",
    name: "SEPC Power Pvt. Ltd.",
    type: "Power & Energy Entity",
    branch: "Power / Energy Entities",
    branches: ["Power / Energy Entities"],
    sector: "Power & Energy",
    description: "Thermal Power Generation (IPP)",
    plantId: "PLANT15",
    childProjectIds: ["PLANT15"]
  },
  {
    id: "PLANT33",
    name: "TP Power Holdings Pvt. Ltd.",
    type: "Power & Energy Entity",
    branch: "Power / Energy Entities",
    branches: ["Power / Energy Entities"],
    sector: "Power & Energy",
    description: "Power Holdings & Investments",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT34",
    name: "MEIL Anpara Energy Ltd.",
    type: "Power & Energy Entity",
    branch: "Power / Energy Entities",
    branches: ["Power / Energy Entities"],
    sector: "Power & Energy",
    description: "Thermal & Renewable Energy Generation",
    plantId: null,
    childProjectIds: []
  },

  // 8. Other Entities
  {
    id: "PLANT17",
    name: "MEIL Media Ltd.",
    type: "Support & Manufacturing Entity",
    branch: "Other Entities",
    branches: ["Other Entities"],
    sector: "Media & Communications",
    description: "Media & Communications",
    plantId: "PLANT17",
    childProjectIds: ["PLANT17"]
  },
  {
    id: "PLANT16",
    name: "MEIL Fibre Glass Industries",
    type: "Support & Manufacturing Entity",
    branch: "Other Entities",
    branches: ["Other Entities"],
    sector: "Manufacturing",
    description: "Composite Pipes & Fibre Glass Products",
    plantId: "PLANT16",
    childProjectIds: ["PLANT16"]
  },
  {
    id: "PLANT35",
    name: "MEIL Infrastructure Projects Ltd.",
    type: "Support & Manufacturing Entity",
    branch: "Other Entities",
    branches: ["Other Entities"],
    sector: "Infrastructure & Engineering",
    description: "EPC Projects & Engineering Services",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT36",
    name: "MEIL Utilities & Services Pvt. Ltd.",
    type: "Support & Manufacturing Entity",
    branch: "Other Entities",
    branches: ["Other Entities"],
    sector: "Utilities & Shared Services",
    description: "Facility & Shared Services Management",
    plantId: null,
    childProjectIds: []
  },
  {
    id: "PLANT37",
    name: "MEIL HR Services Pvt. Ltd.",
    type: "Support & Manufacturing Entity",
    branch: "Other Entities",
    branches: ["Other Entities"],
    sector: "Human Resources & Support Services",
    description: "Workforce Support & HR Operations",
    plantId: null,
    childProjectIds: []
  },

  // 9. Unnamed Placeholder Card (as required by prompt)
  {
    id: "ENT-OTHER-SPVS",
    name: "Other entities — names not provided",
    type: "Indicative Group Placeholder",
    branch: "Other Entities",
    branches: ["Other Entities", "Infrastructure / Road Project SPVs"],
    sector: "Various SPVs & Subsidiaries",
    description: "CRISIL Consolidation Listing (~250 project SPVs & other direct/international entities)",
    isPlaceholder: true,
    plantId: null,
    childProjectIds: []
  }
];

// Explicit mappings from 1080.pdf checklist to synthetic database indicators
const INDICATOR_MAP_1080 = {
  "P1-1": ["Percentage of directors/KMP trained on anti-corruption", "Policy covering P1"],
  "P1-2": ["Fines, penalties, settlements and awards"],
  "P1-3": ["Anti-corruption and anti-bribery practices", "Number of corruption/bribery complaints"],
  "P1-4": ["Disciplinary action related to corruption/bribery"],
  "P1-5": ["Conflict-of-interest related complaints"],
  "P1-6": ["Corrective action on corruption/conflict-of-interest issues"],
  "P1-7": ["Awareness programmes for value-chain partners"],
  "P1-8": ["Number of days of accounts payable"],
  "P1-9": ["Openness of business: trading houses, dealers, related parties, loans and investments"],

  "P2-1": ["R&D and capex investment in sustainability", "R&D; investment for environmental/social impact"],
  "P2-2": ["Capital expenditure for environmental/social impact"],
  "P2-3": ["Percentage of inputs sourced sustainably", "Sustainable sourcing"],
  "P2-4": ["Safe reclamation, reuse, recycling or disposal of products"],
  "P2-5": ["Extended Producer Responsibility (EPR)"],
  "P2-6": ["Life Cycle Assessment (LCA)"],
  "P2-7": ["Products/services with significant social or environmental impact"],
  "P2-8": ["Corrective action based on LCA findings"],
  "P2-9": ["Sustainable/recycled input materials and related practices"],

  "P3-1": ["Employee/worker well-being benefits"],
  "P3-2": ["Spending on well-being measures"],
  "P3-3": ["Accessibility of workplace"],
  "P3-4": ["Equal opportunity and diversity-related information", "Wages paid to female employees"],
  "P3-5": ["Return-to-work and retention after parental leave"],
  "P3-6": ["Grievance mechanisms"],
  "P3-7": ["Minimum wages", "Total employee wages paid"],
  "P3-8": ["Health and safety training"],
  "P3-9": ["Skill-upgradation training"],
  "P3-10": ["Performance and career-development reviews"],
  "P3-11": ["Occupational health and safety management system"],
  "P3-12": ["Work-related hazards and risk assessment"],
  "P3-13": ["Safety incidents and injuries", "Number of workplace injuries (LTIFR)"],
  "P3-14": ["Fatalities / high-consequence injuries"],
  "P3-15": ["Occupational health services"],
  "P3-16": ["Social security and employee benefits"],
  "P3-17": ["POSH / sexual-harassment related information"],
  "P3-18": ["Value-chain worker/employee well-being"],
  "P3-19": ["Human-rights and employee-related practices"],
  "P3-20": ["Training coverage"],
  "P3-21": ["Other workforce welfare indicators"],

  "P4-1": ["Process for identifying key stakeholders"],
  "P4-2": ["Key stakeholder groups and engagement frequency", "Number of stakeholder consultations held"],
  "P4-3": ["Stakeholder communication channels"],
  "P4-4": ["Stakeholder concerns/topics raised", "Complaints filed by stakeholders", "Complaints pending resolution"],
  "P4-5": ["Stakeholder consultation with the Board"],
  "P4-6": ["Use of stakeholder feedback in environmental/social decisions"],
  "P4-7": ["Engagement with vulnerable or marginalized groups"],

  "P5-1": ["Human-rights training", "Percentage of employees trained on human rights"],
  "P5-2": ["Minimum-wage information"],
  "P5-3": ["Gross wages paid to females", "Wages paid to female employees"],
  "P5-4": ["Human-rights due diligence"],
  "P5-5": ["Human-rights complaints/grievances", "Number of human rights complaints"],
  "P5-6": ["Corrective/remedial actions"],
  "P5-7": ["POSH / sexual-harassment complaints"],
  "P5-8": ["Child labour"],
  "P5-9": ["Forced/involuntary labour"],
  "P5-10": ["Discrimination"],
  "P5-11": ["Human-rights performance review"],
  "P5-12": ["Human-rights risks in operations"],
  "P5-13": ["Human-rights risks in the value chain"],
  "P5-14": ["Human-rights policies"],
  "P5-15": ["Remediation/prevention measures"],

  "P6-1": ["Energy consumption and energy intensity", "Total energy consumption (overall)"],
  "P6-2": ["Renewable vs non-renewable energy", "Total energy consumption (renewable)", "Total energy consumption (non-renewable)"],
  "P6-3": ["Water withdrawal and consumption", "Total water withdrawal"],
  "P6-4": ["Water intensity"],
  "P6-5": ["GHG emissions — Scope 1 and Scope 2", "Total Scope 1 GHG emissions", "Total Scope 2 GHG emissions"],
  "P6-6": ["GHG/emission intensity"],
  "P6-7": ["Air emissions"],
  "P6-8": ["Waste generated", "Total waste generated"],
  "P6-9": ["Waste recycled/reused/disposed"],
  "P6-10": ["Hazardous waste"],
  "P6-11": ["Plastic waste"],
  "P6-12": ["E-waste"],
  "P6-13": ["Waste-management practices"],
  "P6-14": ["Water/wastewater management"],
  "P6-15": ["Biodiversity / ecologically sensitive areas"],
  "P6-16": ["Environmental impact assessment"],
  "P6-17": ["Environmental compliance"],
  "P6-18": ["Environmental penalties/non-compliance"],
  "P6-19": ["Green/environmental initiatives"],
  "P6-20": ["Climate/environmental risks and mitigation"],
  "P6-21": ["Additional environmental/leadership disclosures"],

  "P7-1": ["Trade/industry chamber and association memberships", "Number of trade/industry chambers engaged with"],
  "P7-2": ["Anti-competitive conduct and corrective action", "Corrective actions on anti-competitive conduct"],
  "P7-3": ["Public-policy positions advocated"],

  "P8-1": ["Social Impact Assessment (SIA)"],
  "P8-2": ["Rehabilitation & Resettlement (R&R;)"],
  "P8-3": ["Community grievance mechanism"],
  "P8-4": ["Procurement from MSMEs/small producers"],
  "P8-5": ["Procurement from local/district suppliers", "Number of persons employed from local community"],
  "P8-6": ["CSR projects", "CSR projects benefiting vulnerable/marginalized groups"],
  "P8-7": ["CSR spending in aspirational districts"],
  "P8-8": ["Negative social impacts and corrective actions"],
  "P8-9": ["Preferential procurement from marginalized/vulnerable groups"],
  "P8-10": ["Benefits from intellectual property/traditional knowledge"],

  "P9-1": ["Consumer complaint/feedback mechanism", "Number of consumer complaints"],
  "P9-2": ["Turnover from environmentally/socially responsible products/services"],
  "P9-3": ["Consumer complaints — data privacy"],
  "P9-4": ["Consumer complaints — advertising"],
  "P9-5": ["Consumer complaints — cybersecurity"],
  "P9-6": ["Consumer complaints — essential services"],
  "P9-7": ["Consumer complaints — restrictive/unfair trade practices"],
  "P9-8": ["Product recalls due to safety issues"],
  "P9-9": ["Cybersecurity/data-privacy policy"],
  "P9-10": ["Corrective actions for consumer-related issues"],
  "P9-11": ["Product/service information and responsible consumer communication", "Percentage of products with information on usage/safety"]
};

// Helper: Calculate scoped company metrics
function getCompanyScopedSummary(entityId, db) {
  const entity = ENTITIES.find(e => e.id === entityId) || ENTITIES.find(e => e.plantId === entityId);
  if (!entity) return null;

  const childProjectIds = entity.childProjectIds || [];
  const entries = db.entries || [];
  const relevantEntries = entries.filter(e => {
    if (childProjectIds.includes(e.entityPath.plantId)) return true;
    if (entity.plantId && e.entityPath.plantId === entity.plantId) return true;
    return false;
  });

  const totalFields = relevantEntries.length;
  const submitted = relevantEntries.filter(e => e.status === "Submitted").length;
  const approved = relevantEntries.filter(e => e.status === "Approved").length;
  const inProgress = relevantEntries.filter(e => e.status === "In Progress").length;
  const notStarted = relevantEntries.filter(e => e.status === "Not Started" || e.status === "Needs Correction").length;
  const completed = submitted + approved;
  const completionPct = totalFields > 0 ? Math.round((completed / totalFields) * 1000) / 10 : 0;

  // Principle-wise breakdown
  const PRINCIPLES = [
    { code: "P1", name: "Ethics, Transparency & Accountability" },
    { code: "P2", name: "Sustainable & Safe Goods/Services" },
    { code: "P3", name: "Employee Well-being" },
    { code: "P4", name: "Stakeholder Engagement" },
    { code: "P5", name: "Human Rights" },
    { code: "P6", name: "Environment" },
    { code: "P7", name: "Responsible Policy Advocacy" },
    { code: "P8", name: "Inclusive Growth & Equitable Development" },
    { code: "P9", name: "Consumer Responsibility" }
  ];

  const principleBreakdown = PRINCIPLES.map(p => {
    const pEntries = relevantEntries.filter(e => e.principle === p.code);
    const pTotal = pEntries.length;
    const pDone = pEntries.filter(e => e.status === "Approved" || e.status === "Submitted").length;
    const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
    return {
      code: p.code,
      name: p.name,
      total: pTotal,
      completed: pDone,
      completionPct: pPct,
      status: pTotal === 0 ? "No Data Submitted" : pPct >= 80 ? "High Completion" : pPct >= 40 ? "In Progress" : "Initiated"
    };
  });

  // Projects list
  const projects = [];
  childProjectIds.forEach(pId => {
    // Find plant details in org
    let plantInfo = null;
    let subName = "";
    let buName = "";
    db.org.subsidiaries.forEach(s => s.businessUnits.forEach(bu => bu.plants.forEach(p => {
      if (p.id === pId) {
        plantInfo = p;
        subName = s.name;
        buName = bu.name;
      }
    })));

    if (plantInfo) {
      const pEntries = entries.filter(e => e.entityPath.plantId === pId);
      const pDone = pEntries.filter(e => e.status === "Approved" || e.status === "Submitted").length;
      const pPct = pEntries.length > 0 ? Math.round((pDone / pEntries.length) * 100) : 0;
      projects.push({
        id: plantInfo.id,
        name: plantInfo.name,
        subsidiary: subName,
        businessUnit: buName,
        departments: plantInfo.departments ? plantInfo.departments.map(d => d.name) : [],
        totalFields: pEntries.length,
        completedFields: pDone,
        completionPct: pPct,
        status: pEntries.length === 0 ? "Not Started" : pPct >= 70 ? "Approved" : pPct >= 30 ? "In Progress" : "Submitted"
      });
    }
  });

  return {
    entity: {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      branch: entity.branch,
      branches: entity.branches,
      sector: entity.sector,
      description: entity.description,
      isPlaceholder: !!entity.isPlaceholder
    },
    reportingPeriod: {
      currentFY: (db.meta && db.meta.currentFYLabel) || "FY 2025-26",
      previousFY: (db.meta && db.meta.previousFYLabel) || "FY 2024-25"
    },
    summary: {
      totalFields,
      completed,
      submitted,
      approved,
      inProgress,
      notStarted,
      completionPct,
      overallStatus: totalFields === 0 ? "No Data Available" : completionPct >= 60 ? "On Track" : "In Progress"
    },
    principleBreakdown,
    projects
  };
}

// Helper: Build project detail report organized under all 9 principles using 1080.pdf
function getProjectDetailReport(projectId, db) {
  // Find plant in org
  let plantInfo = null;
  let subName = "";
  let buName = "";
  db.org.subsidiaries.forEach(s => s.businessUnits.forEach(bu => bu.plants.forEach(p => {
    if (p.id === projectId) {
      plantInfo = p;
      subName = s.name;
      buName = bu.name;
    }
  })));

  const plantName = plantInfo ? plantInfo.name : projectId;
  const projectEntries = (db.entries || []).filter(e => e.entityPath.plantId === projectId);
  const validationResults = (db.validationResults || []).filter(v => v.entity && v.entity.includes(plantName));

  const checklistReport = CHECKLIST_1080.map(item => {
    const key = `${item.pCode}-${item.seq}`;
    const candidates = INDICATOR_MAP_1080[key] || [];

    // Find in project entries
    let matchedEntry = projectEntries.find(e => {
      if (e.principle && e.principle !== item.pCode) return false;
      return candidates.some(c => e.indicator.toLowerCase().includes(c.toLowerCase()));
    });

    if (!matchedEntry) {
      // Try looser token match within same principle
      matchedEntry = projectEntries.find(e => {
        if (e.principle && e.principle !== item.pCode) return false;
        const itemWords = item.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        return itemWords.some(w => e.indicator.toLowerCase().includes(w));
      });
    }

    if (matchedEntry) {
      const vIssue = validationResults.find(v => v.indicatorId === matchedEntry.indicatorId || v.indicator === matchedEntry.indicator);
      return {
        seq: item.seq,
        principleCode: item.pCode,
        principleName: item.pName,
        indicator: item.title,
        hasData: true,
        entryId: matchedEntry.id,
        indicatorId: matchedEntry.indicatorId,
        currentFY: matchedEntry.currentFY !== "" && matchedEntry.currentFY !== null && matchedEntry.currentFY !== undefined ? matchedEntry.currentFY : "Not entered",
        previousFY: matchedEntry.previousFY !== "" && matchedEntry.previousFY !== null && matchedEntry.previousFY !== undefined ? matchedEntry.previousFY : "No data available",
        unit: matchedEntry.unit || "—",
        status: matchedEntry.status || "In Progress",
        coreKpi: !!matchedEntry.coreKpi,
        remarks: matchedEntry.remarks || "",
        evidenceId: matchedEntry.evidenceId || null,
        validationState: vIssue ? { severity: vIssue.severity, message: vIssue.message } : null
      };
    } else {
      return {
        seq: item.seq,
        principleCode: item.pCode,
        principleName: item.pName,
        indicator: item.title,
        hasData: false,
        entryId: null,
        indicatorId: `CHK-${item.pCode}-${String(item.seq).padStart(2, "0")}`,
        currentFY: "Not entered",
        previousFY: "No data available",
        unit: "—",
        status: "Not entered",
        coreKpi: false,
        remarks: "",
        evidenceId: null,
        validationState: null
      };
    }
  });

  // Group by principles
  const principlesGrouped = {};
  checklistReport.forEach(item => {
    if (!principlesGrouped[item.principleCode]) {
      principlesGrouped[item.principleCode] = {
        code: item.principleCode,
        name: item.principleName,
        items: []
      };
    }
    principlesGrouped[item.principleCode].items.push(item);
  });

  const totalChecklist = checklistReport.length; // 106
  const recordedCount = checklistReport.filter(i => i.hasData && i.currentFY !== "Not entered").length;
  const pendingCount = totalChecklist - recordedCount;

  return {
    project: {
      id: projectId,
      name: plantName,
      subsidiary: subName,
      businessUnit: buName,
      departments: plantInfo && plantInfo.departments ? plantInfo.departments.map(d => d.name) : []
    },
    reportingPeriod: {
      currentFY: (db.meta && db.meta.currentFYLabel) || "FY 2025-26",
      previousFY: (db.meta && db.meta.previousFYLabel) || "FY 2024-25"
    },
    stats: {
      totalIndicators: totalChecklist,
      recordedIndicators: recordedCount,
      pendingIndicators: pendingCount,
      completionPct: Math.round((recordedCount / totalChecklist) * 1000) / 10
    },
    principles: Object.values(principlesGrouped)
  };
}

module.exports = {
  ENTITIES,
  CHECKLIST_1080,
  INDICATOR_MAP_1080,
  getCompanyScopedSummary,
  getProjectDetailReport
};
