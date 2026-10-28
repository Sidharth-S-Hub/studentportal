const fs = require('fs');
let content = fs.readFileSync('frontend/student/dashboard.html', 'utf8');

const oldTopbarHtml = `<div class="topbar-actions">
          <span class="badge badge-active" id="student-status-badge">Account Active</span>`;

const newTopbarHtml = `<div class="topbar-actions">
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.body.classList.toggle('dark-mode')">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            Dark Mode
          </button>
          <span class="badge badge-active" id="student-status-badge">Account Active</span>`;

content = content.replace(oldTopbarHtml, newTopbarHtml);

const oldAuthHtml = `<button type="button" class="btn btn-secondary" id="btn-authenticator-setup">Set Up Authenticator</button>`;
const newAuthHtml = `<button type="button" class="btn btn-secondary" id="btn-authenticator-setup">Set Up Authenticator</button>
<span id="student-verified-tick" style="display:none; color: #3b82f6; font-weight: 500; font-size: 14px; align-items: center; gap: 4px;">
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  Authenticated
</span>`;

content = content.replace(oldAuthHtml, newAuthHtml);

fs.writeFileSync('frontend/student/dashboard.html', content);
