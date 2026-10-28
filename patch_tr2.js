const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const oldTrStart = 'return `\n          <tr>\n            <td>\n              <label for="profile-photo-';
const newTrStart = 'return `\n          <tr>\n            <td><input type="checkbox" class="student-checkbox" value="${s.id}" onchange="AdminDashboard.toggleStudentSelection()"></td>\n            <td>\n              <label for="profile-photo-';

if (content.includes(oldTrStart)) {
  content = content.replace(oldTrStart, newTrStart);
  fs.writeFileSync('frontend/js/admin-dashboard.js', content, 'utf8');
}
