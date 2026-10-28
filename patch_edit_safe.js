const fs = require('fs');
const file = 'frontend/js/admin-dashboard.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /async editStudent\(studentId\) \{[\s\S]*?showToast\('Student details updated\.', 'success'\);\s+await this\.loadStudents\(\);\s+\},/;

const replacement = `async editStudent(studentId) {
    const current = await Auth.api(\`/api/students/\${studentId}\`);
    if (!current.ok) return Swal.fire('Error', current.data.message || 'Could not load student details.', 'error');
    const student = current.data.student;

    const { value: formValues } = await Swal.fire({
      title: 'Edit Student Details',
      html:
        '<div style="text-align: left;">' +
        '<label>Name:</label><input id="swal-edit-name" class="swal2-input" value="' + (student.name || '') + '">' +
        '<label>Personal Email:</label><input id="swal-edit-pemail" class="swal2-input" value="' + (student.personal_email || '') + '">' +
        '<label>Phone:</label><input id="swal-edit-phone" class="swal2-input" value="' + (student.phone || '') + '">' +
        '<label>Course:</label>' +
        '<select id="swal-edit-course" class="swal2-input">' +
          '<option value="Computer Science"' + (student.course === 'Computer Science' ? ' selected' : '') + '>Computer Science</option>' +
          '<option value="Business"' + (student.course === 'Business' ? ' selected' : '') + '>Business</option>' +
          '<option value="Engineering"' + (student.course === 'Engineering' ? ' selected' : '') + '>Engineering</option>' +
          '<option value="Design"' + (student.course === 'Design' ? ' selected' : '') + '>Design</option>' +
        '</select>' +
        '<label>Batch:</label><input id="swal-edit-batch" class="swal2-input" value="' + (student.batch || '') + '">' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      preConfirm: () => {
        return {
          name: document.getElementById('swal-edit-name').value,
          personal_email: document.getElementById('swal-edit-pemail').value,
          phone: document.getElementById('swal-edit-phone').value,
          course: document.getElementById('swal-edit-course').value,
          batch: document.getElementById('swal-edit-batch').value
        }
      }
    });

    if (!formValues) return;

    const res = await Auth.api(\`/api/students/\${studentId}\`, {
      method: 'PUT',
      body: JSON.stringify(formValues)
    });
    if (!res.ok) return Swal.fire('Error', res.data.message || 'Could not update student.', 'error');
    showToast('Student details updated.', 'success');
    await this.loadStudents();
  },`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Replaced editStudent');
