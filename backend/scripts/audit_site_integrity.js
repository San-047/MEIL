const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const pagesDir = path.join(rootDir, 'frontend', 'pages');
const jsDir = path.join(rootDir, 'frontend', 'js');
const serverFile = path.join(rootDir, 'backend', 'server.js');
const serverCode = fs.readFileSync(serverFile, 'utf8');

// Extract all registered routes from server.js
const serverRoutes = [];
const routeRegex = /app\.(get|post|put|delete|patch)\(\s*["'`]([^"'`]+)["'`]/g;
let m;
while ((m = routeRegex.exec(serverCode)) !== null) {
  serverRoutes.push({ method: m[1].toUpperCase(), route: m[2] });
}

console.log(`\n======================================================`);
console.log(`🔍 BRSR ESG PLATFORM COMPLETE INTEGRITY AUDITOR`);
console.log(`======================================================\n`);
console.log(`✓ Total Server Endpoints Registered: ${serverRoutes.length}`);

// Get all pages
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
pages.push('../index.html');
console.log(`✓ Total HTML Pages Scanned: ${pages.length}\n`);

let missingFiles = [];
let routeChecks = [];

pages.forEach(p => {
  const pPath = path.resolve(pagesDir, p);
  if (!fs.existsSync(pPath)) {
    missingFiles.push({ page: p, error: 'File does not exist' });
    return;
  }
  const content = fs.readFileSync(pPath, 'utf8');

  // Check script src
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  while ((m = scriptRegex.exec(content)) !== null) {
    const src = m[1].split('?')[0];
    if (src.startsWith('http') || src.startsWith('//')) continue;
    const resolved = path.resolve(path.dirname(pPath), src);
    if (!fs.existsSync(resolved)) {
      missingFiles.push({ page: p, type: 'script', file: src });
    }
  }

  // Check stylesheet href
  const linkRegex = /<link\s+[^>]*href=["']([^"']+)["']/gi;
  while ((m = linkRegex.exec(content)) !== null) {
    const href = m[1].split('?')[0];
    if (href.startsWith('http') || href.startsWith('//') || href.includes('fonts.')) continue;
    const resolved = path.resolve(path.dirname(pPath), href);
    if (!fs.existsSync(resolved)) {
      missingFiles.push({ page: p, type: 'stylesheet', file: href });
    }
  }

  // Check fetch('/api/...') calls
  const fetchRegex = /fetch\(\s*["'`](\/api\/[^"'`\?\s]+)["'`]/g;
  while ((m = fetchRegex.exec(content)) !== null) {
    routeChecks.push({ source: p, endpoint: m[1] });
  }

  // Check inline api('...') calls
  const apiRegex = /api\(\s*["'`]([^"'`\?\s]+)["'`]/g;
  while ((m = apiRegex.exec(content)) !== null) {
    const ep = m[1].startsWith('/') ? '/api' + m[1] : '/api/' + m[1];
    routeChecks.push({ source: p, endpoint: ep });
  }
});

// Scan all frontend JS files
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
jsFiles.forEach(jf => {
  const jfPath = path.join(jsDir, jf);
  const content = fs.readFileSync(jfPath, 'utf8');

  const fetchRegex = /fetch\(\s*["'`](\/api\/[^"'`\?\s]+)["'`]/g;
  while ((m = fetchRegex.exec(content)) !== null) {
    routeChecks.push({ source: jf, endpoint: m[1] });
  }

  const apiRegex = /api\(\s*["'`]([^"'`\?\s]+)["'`]/g;
  while ((m = apiRegex.exec(content)) !== null) {
    const ep = m[1].startsWith('/') ? '/api' + m[1] : '/api/' + m[1];
    routeChecks.push({ source: jf, endpoint: ep });
  }
});

function matchRoute(calledUrl) {
  // Normalize parameters e.g. /api/entries/${id}/evidence or /api/entries/E0001/approve
  for (const s of serverRoutes) {
    const regexPattern = '^' + s.route.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$';
    if (new RegExp(regexPattern).test(calledUrl)) {
      return true;
    }
  }
  return false;
}

const missingEndpoints = [];
routeChecks.forEach(rc => {
  // Ignore dynamic variable calls that can't be statically resolved if template literal
  if (rc.endpoint.includes('${') || rc.endpoint.includes('+')) return;
  if (!matchRoute(rc.endpoint)) {
    missingEndpoints.push(rc);
  }
});

console.log(`--- ASSET INTEGRITY REPORT ---`);
if (missingFiles.length === 0) {
  console.log(`✅ All scripts and stylesheets exist and are linked correctly.`);
} else {
  console.error(`❌ Found ${missingFiles.length} missing asset references:`, missingFiles);
}

console.log(`\n--- API ROUTE COVERAGE REPORT ---`);
console.log(`✓ Total client API calls scanned: ${routeChecks.length}`);
if (missingEndpoints.length === 0) {
  console.log(`✅ 100% of static API endpoints called by frontend exist on server!`);
} else {
  console.error(`❌ Found ${missingEndpoints.length} potentially unhandled API endpoints:`, missingEndpoints);
}
