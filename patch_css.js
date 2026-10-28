const fs = require('fs');
const file = 'frontend/css/style.css';
let content = fs.readFileSync(file, 'utf8');

// Improve spacing and typography
content = content.replace(/body\s*\{[\s\S]*?\}/, `body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--slate-50);
  color: var(--slate-800);
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  line-height: 1.6;
}`);

content = content.replace(/\.card\s*\{[\s\S]*?\}/, `.card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  border: 1px solid var(--slate-100);
  display: flex;
  flex-direction: column;
  height: 100%;
}`);

// Stat cards 
content = content.replace(/\.stat-card\s*\{[\s\S]*?\}/, `.stat-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid var(--slate-100);
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
}`);

// Grid gaps
content = content.replace(/gap:\s*16px/g, 'gap: 24px');
content = content.replace(/padding:\s*16px/g, 'padding: 24px');

fs.writeFileSync(file, content, 'utf8');
console.log('Patched style.css');
