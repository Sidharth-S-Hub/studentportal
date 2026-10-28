const fs = require('fs');
let content = fs.readFileSync('frontend/admin/dashboard.html', 'utf8');

const oldBulkHtml = <button type="button" class="btn btn-secondary" onclick="document.getElementById('bulk-import-file').click()">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Bulk Import
          </button>;

const newBulkHtml = <button type="button" class="btn btn-secondary" id="btn-bulk-import" style="display: none;" onclick="document.getElementById('bulk-import-file').click()">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Bulk Import
          </button>
          <button type="button" class="btn btn-secondary" id="btn-bulk-download" style="display: none;" onclick="AdminDashboard.downloadBulkTemplate()">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Download Template
          </button>;

content = content.replace(oldBulkHtml, newBulkHtml);

fs.writeFileSync('frontend/admin/dashboard.html', content);
