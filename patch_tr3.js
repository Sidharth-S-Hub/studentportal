const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

// Use regex to catch \r\n or \n
content = content.replace(/return `\r?\n\s*<tr>\r?\n\s*<td>\r?\n\s*<label for="profile-photo-/g, 'return `\n          <tr>\n            <td style="width: 40px; text-align: center;"><input type="checkbox" class="student-checkbox" value="${s.id}" onchange="AdminDashboard.toggleStudentSelection()"></td>\n            <td>\n              <label for="profile-photo-');

fs.writeFileSync('frontend/js/admin-dashboard.js', content, 'utf8');
