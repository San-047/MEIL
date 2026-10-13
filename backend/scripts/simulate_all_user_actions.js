const http = require('http');

function req(options, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { 'Cookie': cookie } : {}),
        ...(options.headers || {})
      }
    };
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        const setCookie = res.headers['set-cookie'];
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data,
          raw: data,
          cookie: setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : cookie
        });
      });
    });
    r.on('error', reject);
    if (body) {
      r.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    r.end();
  });
}

async function runFullAudit() {
  console.log('🚀 STARTING COMPREHENSIVE PLATFORM INTEGRITY AUDIT...\n');
  const issues = [];

  // 1. Healthcheck
  const h = await req({ path: '/api/health' });
  if (h.status !== 200) issues.push(`Healthcheck failed: ${h.status}`);
  else console.log('✓ Healthcheck endpoint: OK (200)');

  // 2. Roles to test
  const roles = [
    { u: 'admin', p: 'admin123', name: 'Group Admin' },
    { u: 'plant.owner', p: 'plant123', name: 'Plant Owner' },
    { u: 'ehs.owner', p: 'ehs123', name: 'EHS Lead' },
    { u: 'hr.owner', p: 'hr123', name: 'HR Lead' },
    { u: 'auditor', p: 'audit123', name: 'Auditor' },
    { u: 'mgmt.viewer', p: 'board123', name: 'Board Member' }
  ];

  for (const r of roles) {
    const login = await req({ path: '/api/login', method: 'POST' }, { username: r.u, password: r.p });
    if (login.status !== 200 || !login.cookie) {
      issues.push(`Login failed for ${r.u}: Status ${login.status}`);
      continue;
    }
    console.log(`✓ Authentication for ${r.name} (${r.u}): OK (200)`);

    // Test me endpoint
    const me = await req({ path: '/api/me' }, null, login.cookie);
    if (me.status !== 200) issues.push(`GET /api/me failed for ${r.u}`);

    // Test common endpoints
    const endpoints = [
      '/api/dashboard',
      '/api/entities',
      '/api/evidence',
      '/api/entries',
      '/api/assignments',
      '/api/conversion-factors',
      '/api/validation'
    ];

    for (const ep of endpoints) {
      const res = await req({ path: ep }, null, login.cookie);
      if (res.status >= 500) {
        issues.push(`Server error 500 on ${ep} for ${r.name}`);
      }
    }
  }

  // 3. Test PDF generation for all reports
  const pdfReports = [
    '/api/report/pdf',
    '/api/reports/pdf/master',
    '/api/reports/pdf/auditor',
    '/api/reports/pdf/board',
    '/api/reports/pdf/plant',
    '/api/reports/pdf/ehs',
    '/api/reports/pdf/hr',
    '/api/reports/pdf/portal'
  ];

  const adminLogin = await req({ path: '/api/login', method: 'POST' }, { username: 'admin', password: 'admin123' });
  for (const pdfUrl of pdfReports) {
    const pRes = await req({ path: pdfUrl }, null, adminLogin.cookie);
    if (pRes.status !== 200) {
      issues.push(`PDF Report failed: ${pdfUrl} (Status ${pRes.status})`);
    } else {
      console.log(`✓ PDF Generation [${pdfUrl}]: OK (${pRes.raw.length} bytes)`);
    }
  }

  // 4. Test Carbon Calculation Engine
  const calcRes = await req({ path: '/api/carbon/calculate', method: 'POST' }, { fuelType: 'diesel', quantity: 500 }, adminLogin.cookie);
  if (calcRes.status !== 200 || !calcRes.data.co2e_kg) {
    issues.push(`Carbon calculation failed: ${JSON.stringify(calcRes.data)}`);
  } else {
    console.log(`✓ Scientific Carbon Accounting: OK (${calcRes.data.co2e_kg} kg CO2e calculated)`);
  }

  // 5. Test Unified AI Dispatcher
  const aiRes = await req({ path: '/api/ai/unified-assistant', method: 'POST' }, { message: 'Namaste, what is MEIL Scope 1 emissions?', mode: 'auto' }, adminLogin.cookie);
  if (aiRes.status !== 200 || !aiRes.data.reply) {
    issues.push(`AI Assistant failed: Status ${aiRes.status}`);
  } else {
    console.log(`✓ AI Copilot Engine: OK (Provider: ${aiRes.data.service || 'Groq/Gemini'})`);
  }

  // 6. Test Evidence Registration
  const evReg = await req({ path: '/api/evidence/register', method: 'POST' }, {
    fileName: 'Audit_Test_Integrity_Document.pdf',
    linkedIndicator: 'P6-E1',
    evidenceType: 'Safety Log',
    entityPath: { plantId: 'PLANT1' },
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }, adminLogin.cookie);

  if (evReg.status !== 200 || !evReg.data.evidence) {
    issues.push(`Evidence registration failed: Status ${evReg.status}`);
  } else {
    console.log(`✓ Evidence Management Pipeline: OK (Evidence ID: ${evReg.data.evidence.id})`);
  }

  console.log('\n======================================================');
  if (issues.length === 0) {
    console.log('🌟 AUDIT SUCCESS: 0 ISSUES FOUND! SITE IS 100% OPERATIONAL');
  } else {
    console.log(`⚠️ AUDIT FOUND ${issues.length} ISSUES:`);
    issues.forEach(i => console.log('  ❌ ' + i));
  }
  console.log('======================================================\n');
}

runFullAudit().catch(console.error);
