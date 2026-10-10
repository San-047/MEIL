const crypto = require("crypto");

function initEnterpriseState(db) {
  if (!db.enterpriseState) {
    db.enterpriseState = {
      plant: {
        dieselBunkeredL: 42500,
        gridKwh: 119250,
        waterInflowKL: 14250,
        waterRecycledKL: 5486,
        wasteHazardousMT: 12.4,
        signoffStatus: "LOCKED",
        signoffHash: "7d49e3bf19a820c8120b08fae082103498a1048bcae91048b29",
        signoffTimestamp: "2025-10-28T18:30:00.000Z",
        logs: [
          { id: "LOG-01", type: "DG", date: "Today · Shift A", asset: "DG Set 2 (500 kVA Standby)", primary: "8.5 Hrs · 740 L HSD", equiv: "0.625 MT · 1.98 tCO2e", ref: "WB-IOCL-99824", operator: "VS-9428", status: "Verified & Sampled" },
          { id: "LOG-02", type: "GRID", date: "Today · Shift A", asset: "TSSPDCL Dedicated 33kV", primary: "3,820 kWh Draw", equiv: "152.8 MWh gross (×40 CT)", ref: "MTR-TSS-8831", operator: "VS-9428", status: "Verified & Sampled" },
          { id: "LOG-03", type: "STP", date: "Yesterday · Shift C", asset: "Plant STP Inflow Flowmeter", primary: "480 KL Inflow", equiv: "185 KL Treated (38.5% recycled)", ref: "LOG-STP-0931", operator: "RK-7712", status: "Verified & Sampled" },
          { id: "LOG-04", type: "DG", date: "Yesterday · Shift B", asset: "DG Set 1 (500 kVA Standby)", primary: "6.0 Hrs · 520 L HSD", equiv: "0.439 MT · 1.39 tCO2e", ref: "WB-IOCL-99818", operator: "RK-7712", status: "Verified & Sampled" },
          { id: "LOG-05", type: "TSDF", date: "24 Oct 2025", asset: "TSDF Paint Sludge Bin", primary: "2.4 MT Hazardous", equiv: "HWMP Dundigal Manifest", ref: "CPCB-F10-4412", operator: "VS-9428", status: "Verified & Sampled" }
        ]
      },
      ehs: {
        scope1_tCO2e: 113.90,
        scope2_tCO2e: 85.38,
        solarAvoided_tCO2e: 47.08,
        netGHG_tCO2e: 152.20,
        waterRecycledPct: 38.5,
        anomalies: [
          {
            id: "ANOM-01",
            severity: "high",
            title: "Plant 1 Standby DG Set 2 — 18-Hour Run Spike (+24.2%)",
            date: "14 Oct 2025",
            asset: "DG Set 2 (500 kVA)",
            status: "Auditor Approved",
            cause: "TSSPDCL 33kV feeder blackout during storm. Fuel bunkered 1,620 L HSD.",
            ref: "WB-IOCL-99824"
          },
          {
            id: "ANOM-02",
            severity: "medium",
            title: "Plant 1 STP Hydraulic Inflow Surge (+18.0%)",
            date: "18 Oct 2025",
            asset: "STP Equalization Tank",
            status: "Documented",
            cause: "Monsoon rainwater catchment into balancing pond. Recycled output rose proportionately.",
            ref: "LOG-STP-0931"
          }
        ]
      },
      hr: {
        totalWorkforce: 1240,
        permanent: 480,
        contractual: 760,
        femaleWorkforce: 192,
        genderDiversityPct: 15.5,
        wageParityRatio: 0.96,
        openPoshCases: 0,
        ltifr: 0.12,
        fatalities: 0,
        safetyTrainingHrsAvg: 42.5
      },
      auditor: {
        totalPopulationCount: 142,
        sampleSize: 15,
        samplesTested: 15,
        materialDiscrepancyPct: 0.04,
        sealStatus: "READY FOR FINAL SIGN-OFF",
        sealHash: "SEAL-ISAE-3000-BSR-MEIL-2025-Q3",
        samples: [
          { id: "SMP-01", facility: "Plant 1 Complex", ind: "P6.1 Scope 1 Fuel", claim: "42,500 L HSD", voucher: "42,500 L (35.91 MT net slip)", ref: "WB-IOCL-99824", status: "Verified & Sealed", hash: "9f83ab29c4e015d89f81a74e5bd8037b51e06fa91b5c46d328" },
          { id: "SMP-02", facility: "Plant 1 Complex", ind: "P6.2 Scope 2 Grid", claim: "119,250 kWh", voucher: "119,250 kWh (×40 CT/PT ratio)", ref: "EB-TSS-1184", status: "Verified & Sealed", hash: "28e7c10b4923f6e4a8b71329c011e48f72a6d4e8c1b920194a" },
          { id: "SMP-03", facility: "Plant 1 Complex", ind: "P6.3 Water Balance", claim: "5,486 KL STP Recycled", voucher: "5,486 KL (38.5% inflow recycle)", ref: "LOG-STP-0931", status: "Verified & Sealed", hash: "7b4c9102ef190a38d729a8b1c4e9f01249e0b12984ac918342" },
          { id: "SMP-04", facility: "Plant 1 Complex", ind: "P6.4 TSDF Waste", claim: "12.4 MT Hazardous", voucher: "12.4 MT HWMP Dundigal Manifest", ref: "HW-TSDF-0492", status: "Verified & Sealed", hash: "d41d8cd98f00b204e9800998ecf8427e014798bcae91048b29" },
          { id: "SMP-05", facility: "Plant 1 Complex", ind: "P3.1 Social / EPFO", claim: "1,240 Workforce PF", voucher: "1,240 ECR Remittance Verified", ref: "EPFO-ECR-2025-10", status: "Verified & Sealed", hash: "8a192bc014892019ab71029481029481902481029481920481" }
        ],
        queries: [
          { id: "WP-01", title: "Plant 1 IOCL Tanker Tare Reconciliation", target: "Plant 1 Complex", status: "Closed", desc: "0.35 MT tare variance on tanker TS-08-AB-9921 resolved with Fab City calibration slip." },
          { id: "WP-02", title: "TSSPDCL Dedicated 33kV Multiplier Verification", target: "Plant 1 Grid", status: "Closed", desc: "Confirmation of CT/PT ratio 40 validated via DISCOM inspection card." }
        ]
      },
      board: {
        reSharePct: 35.5,
        emissionIntensity: 42.8,
        crisilScore: 74,
        msciRating: "A",
        debtSavingsCr: 2.775,
        assuranceStatus: "Clean Limited Assurance Opinion Issued",
        approvalStatus: "APPROVED BY BOARD (Ready for Stock Exchanges)",
        approvalHash: "SEAL-BOD-2025-Q3: 4f192b0ac81920bfeac891048bcae91048b293847291048bcae91048b291048b"
      }
    };
  }
  return db.enterpriseState;
}

function computeHash(dataString) {
  return crypto.createHash("sha256").update(dataString + Date.now()).digest("hex");
}

function addPlantLog(db, user, payload) {
  const state = initEnterpriseState(db);
  const equip = payload.equipment || "DG Set 1 & 2 (500 kVA Genset)";
  const qty = parseFloat(payload.qty) || 0;
  const ref = payload.slipRef || `SLIP-${Date.now().toString().slice(-5)}`;
  const runHours = parseFloat(payload.runHours) || 8.0;

  let type = "DG";
  let equiv = "";
  let primary = "";

  if (equip.toLowerCase().includes("dg") || equip.toLowerCase().includes("diesel")) {
    type = "DG";
    const tonnes = (qty * 0.845 / 1000).toFixed(3);
    const co2 = (qty * 2.68 / 1000).toFixed(2);
    equiv = `${tonnes} MT · ${co2} tCO2e`;
    primary = `${runHours} Hrs · ${qty} L HSD`;
    
    // Update State
    state.plant.dieselBunkeredL += qty;
    const addedCo2 = parseFloat(co2);
    state.ehs.scope1_tCO2e = parseFloat((state.ehs.scope1_tCO2e + addedCo2).toFixed(2));
    state.ehs.netGHG_tCO2e = parseFloat((state.ehs.netGHG_tCO2e + addedCo2).toFixed(2));

    // Anomaly Check (> 15% spike check)
    if (qty > 1200) {
      state.ehs.anomalies.unshift({
        id: `ANOM-${Date.now().toString().slice(-4)}`,
        severity: "high",
        title: `Plant 1 Diesel Surge (+${((qty / 800 - 1) * 100).toFixed(1)}%)`,
        date: "Today · Active Alert",
        asset: equip,
        status: "Under EHS Investigation",
        cause: `Logged ${qty} L bunkered against run time ${runHours} hrs. Voucher ${ref}.`,
        ref: ref
      });
    }
  } else if (equip.toLowerCase().includes("grid") || equip.toLowerCase().includes("power")) {
    type = "GRID";
    const mwh = (qty * 40 / 1000).toFixed(2);
    const co2 = (mwh * 0.716).toFixed(2);
    equiv = `${mwh} MWh (×40 CT) · ${co2} tCO2e`;
    primary = `${qty} kWh Advance`;

    state.plant.gridKwh += qty;
    const addedCo2 = parseFloat(co2);
    state.ehs.scope2_tCO2e = parseFloat((state.ehs.scope2_tCO2e + addedCo2).toFixed(2));
    state.ehs.netGHG_tCO2e = parseFloat((state.ehs.netGHG_tCO2e + addedCo2).toFixed(2));
  } else if (equip.toLowerCase().includes("water") || equip.toLowerCase().includes("stp")) {
    type = "STP";
    primary = `${qty} KL Inflow`;
    const rec = (qty * 0.385).toFixed(0);
    equiv = `${rec} KL Recycled (38.5%)`;

    state.plant.waterInflowKL += qty;
    state.plant.waterRecycledKL += parseFloat(rec);
  } else {
    type = "TSDF";
    primary = `${qty} MT Manifested`;
    equiv = `HWMP Dundigal Secured Landfill`;
    state.plant.wasteHazardousMT = parseFloat((state.plant.wasteHazardousMT + qty).toFixed(2));
  }

  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    type: type,
    date: "Just Now · Shift A",
    asset: equip,
    primary: primary,
    equiv: equiv,
    ref: ref,
    operator: user ? user.name : "Vikram Singh",
    status: "Verified & Sampled"
  };

  state.plant.logs.unshift(newLog);

  // Automatically add voucher to Auditor Sample pool
  state.auditor.totalPopulationCount += 1;
  const hash = computeHash(ref + equip + qty);
  state.auditor.samples.unshift({
    id: `SMP-${Date.now().toString().slice(-4)}`,
    facility: "Plant 1 Complex",
    ind: type === "DG" ? "P6.1 Scope 1 Fuel" : type === "GRID" ? "P6.2 Scope 2 Grid" : "P6.3 Water/Waste",
    claim: primary,
    voucher: `${primary} (${equiv})`,
    ref: ref,
    status: "Verified & Sealed",
    hash: hash
  });

  // Recompute Board Metrics
  state.board.emissionIntensity = parseFloat((state.ehs.netGHG_tCO2e / 3.55).toFixed(1)); // Intensity formula

  // Add to Audit Trail
  if (db.auditTrail) {
    db.auditTrail.unshift({
      id: `AT-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      user: user ? user.name : "Vikram Singh",
      role: user ? user.role : "Plant/Project Owner",
      action: "FIELD_OPERATION_LOG",
      details: `Logged ${primary} for ${equip} [Ref: ${ref}]`,
      sha256: hash
    });
  }

  return { state, newLog, hash };
}

function lockPlantMonth(db, user, pin) {
  const state = initEnterpriseState(db);
  const hash = computeHash(`PLANT1-MONTH-LOCK-${pin}`);
  state.plant.signoffStatus = "LOCKED";
  state.plant.signoffHash = `SIG-PLANT1-2025-Q3-SHA256: ${hash}`;
  state.plant.signoffTimestamp = new Date().toISOString();

  // Audit Trail
  if (db.auditTrail) {
    db.auditTrail.unshift({
      id: `AT-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      user: user ? user.name : "Vikram Singh",
      role: "Plant/Project Owner",
      action: "SITE_MONTHLY_LOCK",
      details: "Plant 1 operational cycle signed off with cryptographic PIN verification",
      sha256: hash
    });
  }

  return { state, hash };
}

function issueAuditorSeal(db, user) {
  const state = initEnterpriseState(db);
  const hash = computeHash(`ISAE-3000-ASSURANCE-SEAL-BSR`);
  state.auditor.sealStatus = "STATUTORY SEAL ISSUED - CLEAN OPINION";
  state.auditor.sealHash = `SEAL-ISAE-3000-BSR-MEIL-2025-Q3: ${hash}`;
  state.board.assuranceStatus = "Clean Limited Assurance Opinion Issued by BSR & Co. LLP";
  
  if (db.auditTrail) {
    db.auditTrail.unshift({
      id: `AT-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      user: user ? user.name : "Anand Sharma, FCA",
      role: "Auditor",
      action: "STATUTORY_SEAL_ISSUED",
      details: "10% ISAE 3000 Stratified Assurance Seal Issued across 42 Subsidiaries",
      sha256: hash
    });
  }

  return { state, hash };
}

function approveBoardFiling(db, user, pin) {
  const state = initEnterpriseState(db);
  const hash = computeHash(`BOD-SEBI-RELEASE-${pin}`);
  state.board.approvalStatus = "APPROVED & DISPATCHED TO NSE/BSE";
  state.board.approvalHash = `SEAL-BOD-2025-Q3: ${hash}`;

  if (db.auditTrail) {
    db.auditTrail.unshift({
      id: `AT-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      user: user ? user.name : "Dr. K. Radhakrishnan",
      role: "Management Viewer",
      action: "BOARDROOM_FILING_APPROVAL",
      details: "Board CSR Committee confirmed BRSR Core Master Filing dispatch to stock exchanges",
      sha256: hash
    });
  }

  return { state, hash };
}

module.exports = {
  initEnterpriseState,
  addPlantLog,
  lockPlantMonth,
  issueAuditorSeal,
  approveBoardFiling
};
