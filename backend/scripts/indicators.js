// BRSR Indicator catalog (synthetic, structured per SEBI BRSR format)
// Section A: General Disclosures, Section B: Management & Process, Section C: Principle-wise performance

const PRINCIPLES = [
  { code: "P1", name: "Ethics, Transparency and Accountability" },
  { code: "P2", name: "Sustainable and Safe Goods/Services" },
  { code: "P3", name: "Employee and Worker Wellbeing" },
  { code: "P4", name: "Stakeholder Responsiveness" },
  { code: "P5", name: "Human Rights" },
  { code: "P6", name: "Environment Protection and Restoration" },
  { code: "P7", name: "Responsible Public Policy Influence" },
  { code: "P8", name: "Inclusive Growth and Equitable Development" },
  { code: "P9", name: "Consumer Value and Responsibility" }
];

// Section A: General Disclosures (entity-level, not principle-linked)
const SECTION_A = [
  { id: "A-01", section: "A", subgroup: "Entity Details", principle: null, indicator: "Legal name of the entity", type: "essential", coreKpi: false, unit: "text", owner: "Group Admin" },
  { id: "A-02", section: "A", subgroup: "Entity Details", principle: null, indicator: "CIN / registration number", type: "essential", coreKpi: false, unit: "text", owner: "Group Admin" },
  { id: "A-03", section: "A", subgroup: "Products/Services", principle: null, indicator: "Number of major products/services offered", type: "essential", coreKpi: false, unit: "count", owner: "Sustainability Lead" },
  { id: "A-04", section: "A", subgroup: "Operations", principle: null, indicator: "Number of plants/offices (national)", type: "essential", coreKpi: false, unit: "count", owner: "Group Admin" },
  { id: "A-05", section: "A", subgroup: "Operations", principle: null, indicator: "Number of plants/offices (international)", type: "essential", coreKpi: false, unit: "count", owner: "Group Admin" },
  { id: "A-06", section: "A", subgroup: "Employees/Workers", principle: null, indicator: "Total number of employees", type: "essential", coreKpi: true, unit: "count", owner: "HR / Department Owner" },
  { id: "A-07", section: "A", subgroup: "Employees/Workers", principle: null, indicator: "Total number of workers", type: "essential", coreKpi: true, unit: "count", owner: "HR / Department Owner" },
  { id: "A-08", section: "A", subgroup: "Employees/Workers", principle: null, indicator: "Turnover rate - permanent employees", type: "leadership", coreKpi: false, unit: "%", owner: "HR / Department Owner" },
  { id: "A-09", section: "A", subgroup: "Holding/Subsidiary/JV", principle: null, indicator: "Number of holding/subsidiary/associate companies", type: "essential", coreKpi: false, unit: "count", owner: "Group Admin" },
  { id: "A-10", section: "A", subgroup: "CSR", principle: null, indicator: "CSR applicability (Y/N)", type: "essential", coreKpi: false, unit: "boolean", owner: "Sustainability Lead" },
  { id: "A-11", section: "A", subgroup: "CSR", principle: null, indicator: "CSR amount spent (INR Lakhs)", type: "essential", coreKpi: true, unit: "INR Lakhs", owner: "Sustainability Lead" },
  { id: "A-12", section: "A", subgroup: "Transparency & Compliance", principle: null, indicator: "Number of complaints on conduct/anti-corruption", type: "essential", coreKpi: false, unit: "count", owner: "Compliance / Department Owner" },
  { id: "A-13", section: "A", subgroup: "ESG Risks/Opportunities", principle: null, indicator: "Material ESG risks identified", type: "leadership", coreKpi: false, unit: "count", owner: "Sustainability Lead" }
];

// Section B: Management and Process Disclosures (one set per principle)
function buildSectionB() {
  const rows = [];
  PRINCIPLES.forEach(p => {
    rows.push({ id: `B-${p.code}-01`, section: "B", subgroup: "Policy", principle: p.code, indicator: `Policy covering ${p.name} (Y/N)`, type: "essential", coreKpi: false, unit: "boolean", owner: "Sustainability Lead" });
    rows.push({ id: `B-${p.code}-02`, section: "B", subgroup: "Board Approval", principle: p.code, indicator: `Policy approved by Board for ${p.code}`, type: "essential", coreKpi: false, unit: "boolean", owner: "Sustainability Lead" });
    rows.push({ id: `B-${p.code}-03`, section: "B", subgroup: "Procedures", principle: p.code, indicator: `Specific procedures/mechanisms in place for ${p.code}`, type: "essential", coreKpi: false, unit: "text", owner: "Department Owner" });
    rows.push({ id: `B-${p.code}-04`, section: "B", subgroup: "Goals & Commitments", principle: p.code, indicator: `Goals/targets adopted for ${p.code}`, type: "leadership", coreKpi: false, unit: "text", owner: "Sustainability Lead" });
    rows.push({ id: `B-${p.code}-05`, section: "B", subgroup: "Governance", principle: p.code, indicator: `Governance responsibility designated for ${p.code}`, type: "essential", coreKpi: false, unit: "text", owner: "Sustainability Lead" });
    rows.push({ id: `B-${p.code}-06`, section: "B", subgroup: "Policy Review", principle: p.code, indicator: `Frequency of policy review for ${p.code}`, type: "leadership", coreKpi: false, unit: "text", owner: "Sustainability Lead" });
    rows.push({ id: `B-${p.code}-07`, section: "B", subgroup: "Compliance Status", principle: p.code, indicator: `Compliance with statutory requirements for ${p.code}`, type: "essential", coreKpi: false, unit: "boolean", owner: "Compliance" });
    rows.push({ id: `B-${p.code}-08`, section: "B", subgroup: "Reasons for Non-Coverage", principle: p.code, indicator: `Reason if policy not adopted for ${p.code}`, type: "essential", coreKpi: false, unit: "text", owner: "Sustainability Lead" });
  });
  return rows;
}

// Section C: Principle-wise performance (essential + leadership indicators per principle)
function buildSectionC() {
  const rows = [];
  const perPrinciple = {
    P1: [
      { s: "Ethics", ind: "Percentage of directors/KMP trained on anti-corruption", type: "essential", unit: "%", core: false },
      { s: "Ethics", ind: "Number of corruption/bribery complaints", type: "essential", unit: "count", core: true }
    ],
    P2: [
      { s: "Sustainable Products", ind: "R&D and capex investment in sustainability", type: "essential", unit: "INR Lakhs", core: false },
      { s: "Sustainable Products", ind: "Percentage of inputs sourced sustainably", type: "leadership", unit: "%", core: false }
    ],
    P3: [
      { s: "Employee Wellbeing", ind: "Total energy consumption (renewable)", type: "essential", unit: "GJ", core: true },
      { s: "Employee Wellbeing", ind: "Total energy consumption (non-renewable)", type: "essential", unit: "GJ", core: true },
      { s: "Employee Wellbeing", ind: "Total energy consumption (overall)", type: "essential", unit: "GJ", core: true },
      { s: "Employee Wellbeing", ind: "Total employee wages paid", type: "essential", unit: "INR Lakhs", core: false },
      { s: "Employee Wellbeing", ind: "Wages paid to female employees", type: "essential", unit: "INR Lakhs", core: true },
      { s: "Employee Wellbeing", ind: "Number of workplace injuries (LTIFR)", type: "essential", unit: "rate", core: true }
    ],
    P4: [
      { s: "Stakeholder Engagement", ind: "Number of stakeholder consultations held", type: "essential", unit: "count", core: false },
      { s: "Stakeholder Engagement", ind: "Complaints filed by stakeholders", type: "essential", unit: "count", core: true },
      { s: "Stakeholder Engagement", ind: "Complaints pending resolution", type: "essential", unit: "count", core: true }
    ],
    P5: [
      { s: "Human Rights", ind: "Percentage of employees trained on human rights", type: "essential", unit: "%", core: false },
      { s: "Human Rights", ind: "Number of human rights complaints", type: "essential", unit: "count", core: true }
    ],
    P6: [
      { s: "Environment", ind: "Total water withdrawal", type: "essential", unit: "KL", core: true },
      { s: "Environment", ind: "Total Scope 1 GHG emissions", type: "essential", unit: "tCO2e", core: true },
      { s: "Environment", ind: "Total Scope 2 GHG emissions", type: "essential", unit: "tCO2e", core: true },
      { s: "Environment", ind: "Total waste generated", type: "essential", unit: "MT", core: true }
    ],
    P7: [
      { s: "Public Policy", ind: "Number of trade/industry chambers engaged with", type: "leadership", unit: "count", core: false },
      { s: "Public Policy", ind: "Corrective actions on anti-competitive conduct", type: "essential", unit: "count", core: false }
    ],
    P8: [
      { s: "Inclusive Growth", ind: "CSR projects benefiting vulnerable/marginalized groups", type: "essential", unit: "count", core: false },
      { s: "Inclusive Growth", ind: "Number of persons employed from local community", type: "leadership", unit: "count", core: false }
    ],
    P9: [
      { s: "Consumer Value", ind: "Percentage of products with information on usage/safety", type: "essential", unit: "%", core: false },
      { s: "Consumer Value", ind: "Number of consumer complaints", type: "essential", unit: "count", core: true }
    ]
  };
  Object.entries(perPrinciple).forEach(([pcode, list]) => {
    list.forEach((item, i) => {
      rows.push({
        id: `C-${pcode}-${String(i + 1).padStart(2, "0")}`,
        section: "C",
        subgroup: item.s,
        principle: pcode,
        indicator: item.ind,
        type: item.type,
        coreKpi: item.core,
        unit: item.unit,
        owner: "Department Owner"
      });
    });
  });
  return rows;
}

function buildFullRegistry() {
  return [...SECTION_A, ...buildSectionB(), ...buildSectionC()];
}

module.exports = { PRINCIPLES, SECTION_A, buildSectionB, buildSectionC, buildFullRegistry };
