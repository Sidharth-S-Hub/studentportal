const fs = require('fs');

let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

// Fix the syntax error from powershell missing quotes
content = content.replace("Auth.api(/api/students/ + studentId);", "Auth.api('/api/students/' + studentId);");

fs.writeFileSync('frontend/js/admin-dashboard.js', content, 'utf8');
