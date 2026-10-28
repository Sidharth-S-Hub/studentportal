const fs = require('fs');

function patchJS(file, searchStr, appendStr) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(appendStr)) {
    content = content.replace(searchStr, searchStr + ',\n      ' + appendStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched ' + file);
  }
}

patchJS('frontend/js/student-dashboard.js',
  "'tab-activity': { heading: 'Activity Tracker', sub: 'Your platform engagement metrics' }",
  "'tab-tickets': { heading: 'Support Tickets', sub: 'Manage your support requests' }"
);

patchJS('frontend/js/admin-dashboard.js',
  "'tab-emails': { heading: 'System Emails', sub: 'Global email dispatch logs' }",
  "'tab-tickets': { heading: 'Support Tickets', sub: 'Manage student support tickets' }"
);
