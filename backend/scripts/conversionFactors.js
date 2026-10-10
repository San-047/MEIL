/**
 * MEIL ESG Scientific Carbon Conversion Factor Library
 * Standard emission factors aligned with IPCC 2006, CEA Baseline Version 19, and GHG Protocol.
 * Corporate technical parameters for Scope 1, Scope 2, and Scope 3 greenhouse gas calculations.
 */

const CONVERSION_FACTORS = [
  {
    id: "CF-DSL",
    name: "High Speed Diesel (HSD)",
    category: "Liquid Fuels",
    scope: "Scope 1",
    inputUnit: "Litres",
    outputUnit: "tCO2e",
    factor: 0.00268,
    factorPerUnit: 2.68,
    factorPerUnitDisplay: "2.68 kg CO2e / Litre",
    standard: "IPCC 2006 / GHG Protocol",
    description: "Used in stationary generators, excavators, heavy earthmovers & site transit"
  },
  {
    id: "CF-PET",
    name: "Motor Spirit (Petrol)",
    category: "Liquid Fuels",
    scope: "Scope 1",
    inputUnit: "Litres",
    outputUnit: "tCO2e",
    factor: 0.00231,
    factorPerUnit: 2.31,
    factorPerUnitDisplay: "2.31 kg CO2e / Litre",
    standard: "IPCC 2006 Guidelines",
    description: "Site inspection vehicles, utility pumps, and 2-wheelers"
  },
  {
    id: "CF-LIG",
    name: "Lignite Coal (Thermal Boilers)",
    category: "Solid Fuels",
    scope: "Scope 1",
    inputUnit: "Metric Tonnes",
    outputUnit: "tCO2e",
    factor: 1.41,
    factorPerUnit: 1.41,
    factorPerUnitDisplay: "1.41 tCO2e / Tonne",
    standard: "CEA / IPCC Stationary Combustion",
    description: "Captive thermal generation boilers using low-rank lignite coal"
  },
  {
    id: "CF-ANT",
    name: "Anthracite Coal (High Grade)",
    category: "Solid Fuels",
    scope: "Scope 1",
    inputUnit: "Metric Tonnes",
    outputUnit: "tCO2e",
    factor: 2.42,
    factorPerUnit: 2.42,
    factorPerUnitDisplay: "2.42 tCO2e / Tonne",
    standard: "IPCC 2006 Stationary Combustion",
    description: "Industrial furnaces, heavy pipe fabrication & high-temperature boilers"
  },
  {
    id: "CF-CNG",
    name: "Compressed Natural Gas (CNG)",
    category: "Gaseous Fuels",
    scope: "Scope 1",
    inputUnit: "kg",
    outputUnit: "tCO2e",
    factor: 0.00275,
    factorPerUnit: 2.75,
    factorPerUnitDisplay: "2.75 kg CO2e / kg",
    standard: "GHG Protocol Transport Tool",
    description: "City gas fleet, light logistics, and clean piped CNG burners"
  },
  {
    id: "CF-LPG",
    name: "Liquefied Petroleum Gas (LPG)",
    category: "Gaseous Fuels",
    scope: "Scope 1",
    inputUnit: "kg",
    outputUnit: "tCO2e",
    factor: 0.00298,
    factorPerUnit: 2.98,
    factorPerUnitDisplay: "2.98 kg CO2e / kg",
    standard: "IPCC 2006 Energy Guidelines",
    description: "Site labor colonies, industrial preheating & welding operations"
  },
  {
    id: "CF-GRD",
    name: "Indian National Grid Electricity (Thermal Baseline)",
    category: "Purchased Electricity",
    scope: "Scope 2",
    inputUnit: "kWh",
    outputUnit: "tCO2e",
    factor: 0.000716,
    factorPerUnit: 0.716,
    factorPerUnitDisplay: "0.716 kg CO2e / kWh (0.716 tCO2e/MWh)",
    standard: "CEA CO2 Baseline Database for Indian Power Sector (Ver. 19)",
    description: "Purchased grid electricity from state distribution utilities (DISCOMs)"
  },
  {
    id: "CF-GRN",
    name: "Green Renewable Power (Solar / Wind PPA)",
    category: "Purchased Electricity",
    scope: "Scope 2",
    inputUnit: "kWh",
    outputUnit: "tCO2e",
    factor: 0.0,
    factorPerUnit: 0.0,
    factorPerUnitDisplay: "0.000 kg CO2e / kWh",
    standard: "GHG Protocol Scope 2 Market-Based Guidance",
    description: "Dedicated renewable power purchase agreements with zero direct emission factor"
  },
  {
    id: "CF-AIR",
    name: "Commercial Air Business Travel",
    category: "Business Travel",
    scope: "Scope 3",
    inputUnit: "Passenger-km",
    outputUnit: "tCO2e",
    factor: 0.00015,
    factorPerUnit: 0.15,
    factorPerUnitDisplay: "0.150 kg CO2e / Passenger-km",
    standard: "ICAO Carbon Calculator / DEFRA",
    description: "Flight tickets for corporate executives and site engineers"
  },
  {
    id: "CF-RAI",
    name: "Indian Railways Business Travel",
    category: "Business Travel",
    scope: "Scope 3",
    inputUnit: "Passenger-km",
    outputUnit: "tCO2e",
    factor: 0.000035,
    factorPerUnit: 0.035,
    factorPerUnitDisplay: "0.035 kg CO2e / Passenger-km",
    standard: "Indian Railways Sustainability Guidelines",
    description: "Inter-city site inspections and regional project travel"
  }
];

function calculateEmissions(factorId, quantity) {
  const item = CONVERSION_FACTORS.find(c => c.id === factorId);
  if (!item) return null;
  const num = parseFloat(quantity) || 0;
  const tCO2e = Number((num * item.factor).toFixed(4));
  return {
    factorId: item.id,
    name: item.name,
    scope: item.scope,
    quantity: num,
    inputUnit: item.inputUnit,
    factorPerUnitDisplay: item.factorPerUnitDisplay,
    standard: item.standard,
    tCO2e: tCO2e,
    kgCO2e: Number((tCO2e * 1000).toFixed(2))
  };
}

function calculateGHGInventory(items = []) {
  let scope1_tCO2e = 0;
  let scope2_tCO2e = 0;
  let scope3_tCO2e = 0;
  let avoided_tCO2e = 0;

  const calculatedItems = items.map(item => {
    const res = calculateEmissions(item.factorId, item.quantity);
    if (!res) return null;
    if (res.scope === "Scope 1") scope1_tCO2e += res.tCO2e;
    if (res.scope === "Scope 2") {
      if (item.factorId === "CF-GRN") {
        const avoided = Number(((parseFloat(item.quantity) || 0) * 0.000716).toFixed(4));
        avoided_tCO2e += avoided;
        res.avoided_tCO2e = avoided;
      } else {
        scope2_tCO2e += res.tCO2e;
      }
    }
    if (res.scope === "Scope 3") scope3_tCO2e += res.tCO2e;
    return res;
  }).filter(Boolean);

  const totalGross_tCO2e = Number((scope1_tCO2e + scope2_tCO2e + scope3_tCO2e).toFixed(4));
  const netEmissions_tCO2e = Number((totalGross_tCO2e - avoided_tCO2e).toFixed(4));

  return {
    calculatedItems,
    scope1_tCO2e: Number(scope1_tCO2e.toFixed(4)),
    scope2_tCO2e: Number(scope2_tCO2e.toFixed(4)),
    scope3_tCO2e: Number(scope3_tCO2e.toFixed(4)),
    avoided_tCO2e: Number(avoided_tCO2e.toFixed(4)),
    totalGross_tCO2e,
    netEmissions_tCO2e,
    standardsComplied: [
      "IPCC 2006 Guidelines for National Greenhouse Gas Inventories",
      "CEA CO2 Baseline Database for Indian Power Sector (Ver. 19)",
      "GHG Protocol Corporate Accounting and Reporting Standard",
      "SEBI BRSR Core Circular SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122"
    ]
  };
}

module.exports = {
  CONVERSION_FACTORS,
  calculateEmissions,
  calculateGHGInventory
};
