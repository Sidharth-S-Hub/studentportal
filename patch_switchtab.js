const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const oldCode = `    // Tab-specific lazy refreshes`;
const newCode = `    // Toggle bulk import/export visibility
    const bulkImportBtn = document.getElementById('btn-bulk-import');
    const bulkDownloadBtn = document.getElementById('btn-bulk-download');
    if (bulkImportBtn) bulkImportBtn.style.display = (tabId === 'tab-students') ? 'inline-block' : 'none';
    if (bulkDownloadBtn) bulkDownloadBtn.style.display = (tabId === 'tab-students') ? 'inline-block' : 'none';

    // Tab-specific lazy refreshes`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('frontend/js/admin-dashboard.js', content);
