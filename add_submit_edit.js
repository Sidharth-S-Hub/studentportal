const fs = require('fs');

let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const submitLogic = `
  async submitEditStudent(e) {
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
      showToast('Student details updated successfully', 'success');
      this.closeModals();
      this.loadStudents();
    } else {
      Swal.fire('Error', res.data.message || 'Failed to update student', 'error');
    }
  },
`;

if (!content.includes('submitEditStudent')) {
  content = content.replace("async editStudent(studentId)", submitLogic + "\n  async editStudent(studentId)");
  fs.writeFileSync('frontend/js/admin-dashboard.js', content, 'utf8');
}
