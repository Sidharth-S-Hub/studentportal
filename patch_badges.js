const fs = require('fs');
let sContent = fs.readFileSync('frontend/js/student-dashboard.js', 'utf8');

const sReplaceOld = "if (tabId === 'tab-inbox') this.loadInbox();";
const sReplaceNew = "if (tabId === 'tab-inbox') { this.loadInbox(); const b = document.getElementById('sidebar-unread-badge'); if (b) b.style.display = 'none'; }";

if (sContent.includes(sReplaceOld)) {
  sContent = sContent.replace(sReplaceOld, sReplaceNew);
  fs.writeFileSync('frontend/js/student-dashboard.js', sContent, 'utf8');
}

let aContent = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const aReplaceOld = "if (tabId === 'tab-messages') this.loadConversations();";
const aReplaceNew = "if (tabId === 'tab-messages') { this.loadConversations(); const b = document.getElementById('sidebar-unread-badge'); if (b) b.style.display = 'none'; }";

if (aContent.includes(aReplaceOld)) {
  aContent = aContent.replace(aReplaceOld, aReplaceNew);
  fs.writeFileSync('frontend/js/admin-dashboard.js', aContent, 'utf8');
}
