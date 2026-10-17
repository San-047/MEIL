const fs = require('fs');
const path = require('path');

const pagesDir = path.resolve('frontend/pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

pages.forEach(file => {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const idx = content.indexOf('id="app-shell"');
  if (idx !== -1) {
    const after = content.slice(idx, idx + 400);
    const tagMatch = after.match(/<div[^>]*class=["']([^"']+)["']/g);
    console.log(file, '->', tagMatch ? tagMatch.slice(0, 3) : 'none');
  } else {
    console.log(file, '-> NO APP SHELL');
  }
});
