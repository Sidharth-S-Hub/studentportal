const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/css/style.css');
let cssContent = fs.readFileSync(cssPath, 'utf-8');

if (!cssContent.includes('.sidebar-hidden')) {
  cssContent += `
/* Sidebar Toggle Custom Classes */
.dashboard-layout.sidebar-hidden .sidebar {
  display: none !important;
}
.sidebar-toggle-btn {
  background: transparent;
  border: none;
  color: var(--slate-600);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
  margin-right: 12px;
}
.sidebar-toggle-btn:hover {
  background: var(--slate-100);
  color: var(--primary);
}
.topbar-left-cluster {
  display: flex;
  align-items: center;
}
`;
  fs.writeFileSync(cssPath, cssContent, 'utf-8');
}

const updateHtml = (filePath) => {
  let html = fs.readFileSync(filePath, 'utf-8');
  if (!html.includes('sidebar-toggle-btn')) {
    html = html.replace('<div class="topbar-title">', `<div class="topbar-left-cluster">
          <button class="sidebar-toggle-btn" onclick="document.querySelector('.dashboard-layout').classList.toggle('sidebar-hidden')" title="Toggle Sidebar">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div class="topbar-title">`);
    html = html.replace('<div class="topbar-actions">', '</div>\n        <div class="topbar-actions">');
    fs.writeFileSync(filePath, html, 'utf-8');
  }
};

updateHtml(path.join(__dirname, 'frontend/student/dashboard.html'));
updateHtml(path.join(__dirname, 'frontend/admin/dashboard.html'));
console.log('Sidebar toggle added');
