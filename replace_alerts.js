const fs = require('fs');
const path = require('path');

const jsFiles = [
  path.join(__dirname, 'frontend', 'js', 'admin-dashboard.js'),
  path.join(__dirname, 'frontend', 'js', 'student-dashboard.js'),
  path.join(__dirname, 'frontend', 'js', 'auth.js')
];

for (const file of jsFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Remove the old hacky window.alert override if it exists
  content = content.replace(/window\.alert\s*=\s*function\s*\([^)]*\)\s*\{\s*Swal\.fire\([^)]*\)\s*\}\s*;\s*/g, '');

  // Replace alert('...') or alert(...)
  // Using a simple regex for alert(xxx). Note: Doesn't handle nested parens perfectly, but works for most strings.
  content = content.replace(/(\b(?:return\s+)?)\balert\((['\][\s\S]*?['\])\)/g, '.fire(\"Notice\", , \"info\")');
  content = content.replace(/(\b(?:return\s+)?)\balert\(([^)]+)\)/g, (match, p1, p2) => {
    if (p2.includes('Swal.fire')) return match; // ignore already swal
    return \\Swal.fire('Notice', \, 'info')\;
  });

  // For prompts, we can't easily globally regex them if they expect a synchronous return.
  // We need to rewrite editStudent, setupAuthenticator manually.

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Removed old alert overrides and replaced alerts with Swal.fire');
