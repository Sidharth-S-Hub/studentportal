const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const regex = /document.getElementById\('edit-student-batch'\).value = student.batch \|\| '';/g;
content = content.replace(regex, `document.getElementById('edit-student-batch').value = student.batch || '';
    const previewDiv = document.getElementById('edit-student-photo-preview');
    if (previewDiv) {
        if (student.profile_photo) {
            previewDiv.innerHTML = '<img src="' + student.profile_photo + '" style="max-width: 100px; max-height: 100px; border-radius: 4px;">';
        } else {
            previewDiv.innerHTML = '';
        }
    }`);
fs.writeFileSync('frontend/js/admin-dashboard.js', content);
