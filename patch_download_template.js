const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const replacement = `  downloadBulkTemplate() {
    const csvContent = "Name,Personal Email,Phone Number,Course,Batch,Username,Joining Date\\nJohn Doe,john.doe@example.com,1234567890,Computer Science,2023,johndoe123,2023-08-01";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async handleBulkImport(e) {`;

content = content.replace("  async handleBulkImport(e) {", replacement);

fs.writeFileSync('frontend/js/admin-dashboard.js', content);
