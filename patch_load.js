const fs = require('fs');

function patchLoad(file, searchStr, appendStr) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(appendStr)) {
    content = content.replace(searchStr, searchStr + '\n    ' + appendStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched load in ' + file);
  }
}

patchLoad('frontend/js/student-dashboard.js',
  "if (tabId === 'tab-activity') this.loadSelfActivity();",
  "if (tabId === 'tab-tickets') this.loadTickets();"
);

patchLoad('frontend/js/admin-dashboard.js',
  "if (tabId === 'tab-emails') this.loadEmailLogs();",
  "if (tabId === 'tab-tickets') this.loadTickets();"
);
