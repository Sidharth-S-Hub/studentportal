const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const startStr = '  async submitEditStudent(e) {';
const endStr = '    },';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `  async submitEditStudent(e) {
    e.preventDefault();
    const id = document.getElementById('edit-student-id').value;
    const name = document.getElementById('edit-student-name').value;
    const personal_email = document.getElementById('edit-student-email').value;
    const phone = document.getElementById('edit-student-phone').value;
    const course = document.getElementById('edit-student-course').value;
    const batch = document.getElementById('edit-student-batch').value;

    const res = await Auth.api('/api/students/' + id, {
      method: 'PUT',
      body: JSON.stringify({ name, personal_email, phone, course, batch })
    });

    if (res.ok) {
      const photoInput = document.getElementById('edit-student-photo');
      if (photoInput && photoInput.files.length > 0) {
        const formData = new FormData();
        formData.append('photo', photoInput.files[0]);
        const photoRes = await fetch('/api/students/' + id + '/profile-photo', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + Auth.getToken()
          },
          body: formData
        });
        if (!photoRes.ok) {
          const photoData = await photoRes.json();
          Swal.fire('Warning', 'Details updated but failed to upload photo: ' + (photoData.message || 'Unknown error'), 'warning');
          return;
        }
      }
      showToast('Student details updated successfully', 'success');
      this.closeModals();
      this.loadStudents();
    } else {
      Swal.fire('Error', res.data.message || 'Failed to update student', 'error');
    }`;
    
    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync('frontend/js/admin-dashboard.js', content);
} else {
    console.log("Could not find start or end index");
}
