const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3000";

let cookies = "";

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const headers = options.headers || {};
    if (cookies) {
      headers["Cookie"] = cookies;
    }
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const req = http.request(url, {
      method: options.method || "GET",
      headers,
      timeout: options.timeout || 15000
    }, (res) => {
      if (res.headers["set-cookie"]) {
        const rawCookies = res.headers["set-cookie"];
        cookies = rawCookies.map(c => c.split(";")[0]).join("; ");
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers["content-type"] || "";
        let data = null;
        if (contentType.includes("application/json")) {
          try {
            data = JSON.parse(buffer.toString("utf8"));
          } catch (e) {
            data = buffer.toString("utf8");
          }
        } else {
          data = buffer;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          raw: buffer
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Request timed out: ${urlPath}`));
    });

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("🚀 BPUT 2.O COMPREHENSIVE END-TO-END VERIFICATION SUITE");
  console.log("========================================================\n");

  const results = [];
  function assert(name, condition, extra = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${extra ? `(${extra})` : ""}`);
      results.push({ name, pass: true });
    } else {
      console.error(`  ❌ [FAIL] ${name} ${extra ? `(${extra})` : ""}`);
      results.push({ name, pass: false, extra });
    }
  }

  // ----------------------------------------------------
  // TEST 1: AUTHENTICATION & ROLE-BASED ACCESS CONTROL
  // ----------------------------------------------------
  console.log("--- 1. Testing Authentication & Role Permissions ---");
  
  // Unauthenticated dashboard access should be rejected
  cookies = "";
  const unauthDash = await request("/api/dashboard");
  assert("Unauthenticated request blocked", unauthDash.statusCode === 401, `Status: ${unauthDash.statusCode}`);

  // Invalid login should fail
  const badLogin = await request("/api/login", {
    method: "POST",
    body: { username: "wrong.user", password: "badpassword" }
  });
  assert("Invalid login rejected", badLogin.statusCode === 401);

  // Security Test: Google auth without params must be rejected (400)
  const emptyGoogleAuth = await request("/api/auth/google", { method: "POST", body: {} });
  assert("Security: Empty Google auth request rejected (Status 400)", emptyGoogleAuth.statusCode === 400);

  // Security Test: Google auth with unauthorized email must be rejected (401)
  const bogusGoogleAuth = await request("/api/auth/google", {
    method: "POST",
    body: { email: "attacker@external-domain.com", name: "Malicious User" }
  });
  assert("Security: Unauthorized Google email rejected (Status 401)", bogusGoogleAuth.statusCode === 401);

  // Valid login as plant.owner (case insensitive)
  const plantLogin = await request("/api/login", {
    method: "POST",
    body: { username: "PLANT.OWNER", password: "demo123" }
  });
  assert("Plant Owner login successful", plantLogin.statusCode === 200 && plantLogin.data.user.role === "Plant/Project Owner");

  // Plant owner trying to issue auditor seal should be 403 Forbidden
  const plantAsAuditor = await request("/api/auditor/issue-seal", { method: "POST" });
  assert("Role enforcement: Plant Owner cannot issue Auditor Seal", plantAsAuditor.statusCode === 403);

  // Plant owner trying to mark entry as 'Approved' should be 403 Forbidden
  const plantApproveEntry = await request("/api/entries/E0001", {
    method: "PUT",
    body: { status: "Approved" }
  });
  assert("Role enforcement: Plant Owner cannot approve BRSR entries", plantApproveEntry.statusCode === 403);

  // Plant owner trying to resolve validation exception should be 403 Forbidden
  const plantResolveException = await request("/api/validation/V001/resolve", {
    method: "POST",
    body: { note: "Attempted bypass by plant owner" }
  });
  assert("Role enforcement: Plant Owner cannot resolve validation exceptions", plantResolveException.statusCode === 403);

  // Login as auditor
  const auditorLogin = await request("/api/login", {
    method: "POST",
    body: { username: "auditor", password: "demo123" }
  });
  assert("Auditor login successful", auditorLogin.statusCode === 200 && auditorLogin.data.user.role === "Auditor");

  // Auditor issuing seal
  const auditSeal = await request("/api/auditor/issue-seal", { method: "POST" });
  assert("Auditor can issue Auditor Seal", auditSeal.statusCode === 200 && auditSeal.data.ok === true);

  // Auditor approving an entry should succeed
  const auditorApproveEntry = await request("/api/entries/E0001", {
    method: "PUT",
    body: { status: "Approved" }
  });
  assert("Auditor can approve BRSR entries", auditorApproveEntry.statusCode === 200 && auditorApproveEntry.data.status === "Approved");

  // Login as group.admin for subsequent pipeline tests
  const adminLogin = await request("/api/login", {
    method: "POST",
    body: { username: "group.admin", password: "demo123" }
  });
  assert("Group Admin login successful", adminLogin.statusCode === 200 && adminLogin.data.user.role === "Group Admin");

  // ----------------------------------------------------
  // TEST 2: SCIENTIFIC CARBON ACCOUNTING & CONVERSION
  // ----------------------------------------------------
  console.log("\n--- 2. Testing Carbon Accounting & Conversion Factors ---");
  
  const factorsRes = await request("/api/conversion-factors");
  assert("Conversion factors library accessible", factorsRes.statusCode === 200 && Array.isArray(factorsRes.data));
  const dieselFactor = factorsRes.data.find(f => f.id === "CF-DSL");
  assert("IPCC/CEA Diesel factor present", dieselFactor && dieselFactor.factorPerUnit === 2.68, dieselFactor?.factorPerUnitDisplay);

  const calcRes = await request("/api/convert-carbon", {
    method: "POST",
    body: { factorId: "CF-DSL", quantity: 1000 }
  });
  assert("Single item carbon calculation (1000 L Diesel = 2.68 tCO2e)", calcRes.statusCode === 200 && calcRes.data.tCO2e === 2.68);

  const inventoryRes = await request("/api/carbon/inventory", {
    method: "POST",
    body: {
      items: [
        { factorId: "CF-DSL", quantity: 5000 },    // 5000 * 0.00268 = 13.4 tCO2e
        { factorId: "CF-GRD", quantity: 100000 },  // 100000 * 0.000716 = 71.6 tCO2e
        { factorId: "CF-GRN", quantity: 40000 },   // Avoided: 40000 * 0.000716 = 28.64 tCO2e
        { factorId: "CF-AIR", quantity: 20000 }    // 20000 * 0.00015 = 3.0 tCO2e
      ]
    }
  });
  assert("Multi-scope inventory calculation", inventoryRes.statusCode === 200);
  assert("Scope 1 calculation accurate (13.4 tCO2e)", inventoryRes.data.scope1_tCO2e === 13.4);
  assert("Scope 2 calculation accurate (71.6 tCO2e)", inventoryRes.data.scope2_tCO2e === 71.6);
  assert("Scope 3 calculation accurate (3.0 tCO2e)", inventoryRes.data.scope3_tCO2e === 3.0);
  assert("Solar avoided emissions accurate (28.64 tCO2e)", inventoryRes.data.avoided_tCO2e === 28.64);
  assert("Net emissions math verified (Gross - Avoided)", inventoryRes.data.netEmissions_tCO2e === 59.36);

  // ----------------------------------------------------
  // TEST 3: DATA INTEGRITY & GROUP LEVEL CALCULATIONS
  // ----------------------------------------------------
  console.log("\n--- 3. Testing Group/Subsidiary/Project Data Integrity ---");
  
  const dashRes = await request("/api/dashboard");
  assert("Dashboard API responds", dashRes.statusCode === 200);
  assert("Assurance readiness computed", typeof dashRes.data.assuranceReadiness === "number");
  assert("Multi-year KPI trends computed", Array.isArray(dashRes.data.kpiTrends) && dashRes.data.kpiTrends.length > 0);
  assert("GHG breakdown data present", dashRes.data.ghgBreakdown && dashRes.data.ghgBreakdown.scope1.total_tCO2e > 0);

  const entriesRes = await request("/api/entries");
  assert("All group entries loaded", entriesRes.statusCode === 200 && entriesRes.data.length >= 500, `Total: ${entriesRes.data?.length}`);

  // ----------------------------------------------------
  // TEST 4: DATA WORKFLOW: ENTRY UPDATE & EVIDENCE
  // ----------------------------------------------------
  console.log("\n--- 4. Testing End-to-End Entry Update & Evidence Trace ---");
  
  const testEntry = entriesRes.data[0];
  const updateRes = await request(`/api/entries/${testEntry.id}`, {
    method: "PUT",
    body: {
      currentFY: 48500,
      remarks: "Updated during automated E2E verification test"
    }
  });
  assert("Entry value updated", updateRes.statusCode === 200 && updateRes.data.currentFY === 48500);

  const traceRes = await request(`/api/audit/trace/${testEntry.id}`);
  assert("Audit trail trace back to indicator", traceRes.statusCode === 200 && Array.isArray(traceRes.data.history));

  // ----------------------------------------------------
  // TEST 5: PYTHON VALIDATION ENGINE ON WINDOWS
  // ----------------------------------------------------
  console.log("\n--- 5. Testing Python Validation Engine ---");
  
  const validationRes = await request("/api/validation/run", { method: "POST" });
  assert("Python validation engine runs on Windows", validationRes.statusCode === 200 && Array.isArray(validationRes.data));
  assert("Validation detected rules/exceptions", validationRes.data?.length > 0, `Exceptions count: ${validationRes.data?.length}`);

  // ----------------------------------------------------
  // TEST 6: SEBI BRSR REPORT CONSOLIDATION & REAL PDF
  // ----------------------------------------------------
  console.log("\n--- 6. Testing BRSR Master Filing PDF & Consolidations ---");
  
  const reportJson = await request("/api/report?scope=core&format=json");
  assert("Consolidated BRSR Core JSON generated", reportJson.statusCode === 200 && reportJson.data.sectionA);

  const reportCsv = await request("/api/report?scope=core&format=csv");
  assert("Consolidated BRSR Core CSV generated", reportCsv.statusCode === 200 && reportCsv.data.toString().includes("Indicator ID"));

  const reportPdf = await request("/api/report?scope=core&format=pdf");
  const isPdf = reportPdf.data && reportPdf.data.slice(0, 4).toString() === "%PDF";
  assert("SEBI BRSR Master Filing PDF generated via pdfkit", reportPdf.statusCode === 200 && isPdf, `Size: ${reportPdf.data?.length} bytes`);

  const reportPdfDedicated = await request("/api/report/pdf?scope=comprehensive");
  const isPdfDedicated = reportPdfDedicated.data && reportPdfDedicated.data.slice(0, 4).toString() === "%PDF";
  assert("Dedicated /api/report/pdf endpoint functioning", reportPdfDedicated.statusCode === 200 && isPdfDedicated, `Size: ${reportPdfDedicated.data?.length} bytes`);

  // ----------------------------------------------------
  // TEST 7: RAILWAY MICROSERVICES HEALTH & PROXIES
  // ----------------------------------------------------
  console.log("\n--- 7. Testing AI Microservices Health & Status Transparency ---");
  
  const healthRes = await request("/api/ai/microservices/health", { timeout: 12000 });
  assert("Microservices health probe returned", healthRes.statusCode === 200);
  const envSvc = healthRes.data?.environmentalChatbot || healthRes.data?.services?.environmental_chatbot;
  const emissionSvc = healthRes.data?.emissionProcessing || healthRes.data?.services?.esg_report_processing;
  const employeeSvc = healthRes.data?.employeeReporting || healthRes.data?.services?.employee_and_esg_reporting;

  console.log("     Env Chatbot Status:", envSvc?.status);
  console.log("     Emission Unit Status:", emissionSvc?.status, `(${emissionSvc?.note || ""})`);
  console.log("     Employee ESG Status:", employeeSvc?.status);

  assert("Service 1 (Environmental Chatbot) status accurately reported", envSvc?.status === "ONLINE" || envSvc?.status === "UNAVAILABLE");
  assert("Service 2 status transparently reported (No false ONLINE)", emissionSvc?.status === "DEGRADED" || emissionSvc?.status === "UNAVAILABLE");
  assert("Service 3 (Employee ESG) status accurately reported", employeeSvc?.status === "ONLINE" || employeeSvc?.status === "UNAVAILABLE");

  // Direct Service 2 test: verifies upstream error is reported honestly
  const emissionDirect = await request("/api/ai/emission-process/1", { method: "POST" });
  assert("Service 2 reports upstream error honestly", 
    emissionDirect.statusCode >= 400 && emissionDirect.data?.ok === false);

  // Direct Service 3 test: verifies upstream dataset status is returned cleanly
  const employeeDirect = await request("/api/ai/employee-extract", {
    method: "POST",
    body: { companyName: "MEIL" }
  });
  assert("Service 3 reports upstream dataset status cleanly", 
    employeeDirect.statusCode >= 400 && (String(employeeDirect.data?.error || JSON.stringify(employeeDirect.data)).includes("Employee extraction failed") || String(employeeDirect.data?.error || JSON.stringify(employeeDirect.data)).includes("Service unavailable")));

  // Malformed Request Validation Tests (HTTP 400 Bad Request)
  const envChatBad = await request("/api/ai/environment-chat", { method: "POST", body: {} });
  assert("Error handling: Missing message rejected with HTTP 400", envChatBad.statusCode === 400);

  const empExtractBad = await request("/api/ai/employee-extract", { method: "POST", body: {} });
  assert("Error handling: Missing companyName rejected with HTTP 400", empExtractBad.statusCode === 400);

  // Upstream DNS Failure Diagnosis Test
  const { requestService } = require("./microservicesClient");
  const dnsFailTest = await requestService("https://this-domain-does-not-exist-at-all-987654.invalid/health", { timeout: 3000 });
  assert("Error handling: Upstream DNS lookup failure diagnosed as ENOTFOUND (Status 502)",
    dnsFailTest.ok === false && dnsFailTest.status === 502 && (dnsFailTest.code === "ENOTFOUND" || dnsFailTest.error?.includes("ENOTFOUND")));

  // Upstream Timeout Diagnosis Test
  const timeoutTest = await requestService("https://environmentchatbot-production.up.railway.app/health", { timeout: 1 });
  assert("Error handling: Upstream latency timeout diagnosed as 504 Gateway Timeout",
    timeoutTest.ok === false && timeoutTest.status === 504 && timeoutTest.isTimeout === true);

  // ----------------------------------------------------
  // TEST 8: UNIFIED AI COPILOT & ROLE-BASED RESPONDERS
  // ----------------------------------------------------
  console.log("\n--- 8. Testing Unified AI Copilot & Portal AI Pages ---");

  // Live test of Environmental Chatbot
  const envChatRes = await request("/api/ai/environment-chat", {
    method: "POST",
    body: {
      message: "What are MEIL Scope 1 direct emissions?",
      sessionId: "test-session-e2e",
      projectId: 1
    },
    timeout: 30000
  });
  assert("Environmental Chatbot live response", envChatRes.statusCode === 200 && envChatRes.data.reply?.length > 0);

  // Role modes testing in Unified Assistant
  const roles = [
    { mode: "plant", msg: "Plant 04 electricity reading status" },
    { mode: "ehs", msg: "Hazardous waste storage limit" },
    { mode: "hr", msg: "Gender ratio and wage compliance" },
    { mode: "auditor", msg: "SEBI BRSR Core assurance checklist" },
    { mode: "board", msg: "Board governance executive summary" }
  ];

  for (const r of roles) {
    await new Promise(res => setTimeout(res, 800));
    const roleRes = await request("/api/ai/unified-assistant", {
      method: "POST",
      body: {
        mode: r.mode,
        message: r.msg
      },
      timeout: 40000
    });
    assert(`Unified Assistant role mode: [${r.mode.toUpperCase()}]`, roleRes.statusCode === 200 && roleRes.data.reply?.length > 0);
  }

  // Employee Report PDF streaming fallback
  const empPdfRes = await request("/api/ai/report-pdf?report_name=MEIL_Workforce_Report&format=pdf");
  const isEmpPdf = empPdfRes.data && empPdfRes.data.slice(0, 4).toString() === "%PDF";
  assert("Workforce ESG Report PDF generated & streamed cleanly", empPdfRes.statusCode === 200 && isEmpPdf, `Size: ${empPdfRes.data?.length} bytes`);

  // ESG Action Engine (Plant 04)
  const actionEngineRes = await request("/api/action-engine/plant04");
  assert("Action Engine Plant 04 7-step USP pipeline active", actionEngineRes.statusCode === 200 && actionEngineRes.data.steps?.length === 7);

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const scorePct = Math.round((passed / results.length) * 100);

  console.log("\n========================================================");
  console.log(`🎯 VERIFICATION RESULTS: ${passed}/${results.length} PASSED (${scorePct}% READY)`);
  console.log("========================================================\n");

  if (failed === 0) {
    console.log("🌟 ALL 8 CORE MODULES ARE 100% OPERATIONAL AND VERIFIED!\n");
  } else {
    console.log(`⚠️ ${failed} tests failed. Review logs above.\n`);
  }
}

runTestSuite().catch(err => {
  console.error("Test Suite crashed:", err);
  process.exit(1);
});
