const fs = require('fs');

let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const oldTr = 'return `\n          <tr>\n            <td>\n              <img src="${s.profile_photo_url}"';
const newTr = 'return `\n          <tr>\n            <td><input type="checkbox" class="student-checkbox" value="${s.id}" onchange="AdminDashboard.toggleStudentSelection()"></td>\n            <td>\n              <img src="${s.profile_photo_url}"';

if (content.includes(oldTr)) {
  content = content.replace(oldTr, newTr);
  fs.writeFileSync('frontend/js/admin-dashboard.js', content, 'utf8');
  console.log("Patched TR.");
} else {
  console.log("Could not find TR.");
}
