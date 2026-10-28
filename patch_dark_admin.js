const fs = require('fs');
let content = fs.readFileSync('frontend/admin/dashboard.html', 'utf8');

const oldHtml = `<div class="topbar-actions">
            <button type="button" class="btn btn-secondary" id="btn-admin-authenticator">Set Up Authenticator</button>`;

const newHtml = `<div class="topbar-actions">
            <button type="button" class="btn btn-secondary" onclick="document.body.classList.toggle('dark-mode')">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              Dark Mode
            </button>
            <button type="button" class="btn btn-secondary" id="btn-admin-authenticator">Set Up Authenticator</button>`;

content = content.replace(oldHtml, newHtml);

fs.writeFileSync('frontend/admin/dashboard.html', content);
