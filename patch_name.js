const fs = require('fs');
let content = fs.readFileSync('frontend/admin/dashboard.html', 'utf8');

content = content.replace(
  '<div class="user-brief-name" id="admin-display-name">Administrator</div>',
  '<div class="user-brief-name" style="display:flex; align-items:center;"><span id="admin-display-name">Administrator</span><svg id="admin-verified-tick" style="display:none; color: #3b82f6; width: 16px; height: 16px; margin-left: 6px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="2FA Authenticated"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>'
);

fs.writeFileSync('frontend/admin/dashboard.html', content);
