const fs = require('fs');
let content = fs.readFileSync('frontend/admin/dashboard.html', 'utf8');

const replacement = \<button type="button" class="btn btn-primary" id="btn-quick-add-student">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Add Student
          </button>
          <input type="file" id="bulk-import-file" accept=".xlsx, .xls, .csv" style="display: none;" onchange="AdminDashboard.handleBulkImport(event)">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('bulk-import-file').click()">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Bulk Import
          </button>\;

content = content.replace(/<button type="button" class="btn btn-primary" id="btn-quick-add-student">[\s\S]*?Add Student\s*<\/button>/, replacement);

fs.writeFileSync('frontend/admin/dashboard.html', content);
