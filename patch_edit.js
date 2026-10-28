const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend', 'js', 'admin-dashboard.js');
let content = fs.readFileSync(file, 'utf8');

const newEditStudent = sync editStudent(studentId) {
    try {
      const current = await Auth.api(\/api/students/\\);
      if (!current.ok) return Swal.fire('Error', current.data.message || 'Could not load student details.', 'error');
      const student = current.data.student;

      const { value: formValues } = await Swal.fire({
        title: 'Edit Student Details',
        html:
          '<div style=\"text-align: left;\">' +
          '<label>Name:</label><input id=\"swal-edit-name\" class=\"swal2-input\" value=\"' + (student.name||'') + '\">' +
          '<label>Personal Email:</label><input id=\"swal-edit-pemail\" class=\"swal2-input\" value=\"' + (student.personal_email||'') + '\">' +
          '<label>Phone:</label><input id=\"swal-edit-phone\" class=\"swal2-input\" value=\"' + (student.phone||'') + '\">' +
          '<label>Course:</label>' +
          '<select id=\"swal-edit-course\" class=\"swal2-input\">' +
            '<option value=\"Computer Science\"' + (student.course === 'Computer Science' ? ' selected' : '') + '>Computer Science</option>' +
            '<option value=\"Business\"' + (student.course === 'Business' ? ' selected' : '') + '>Business</option>' +
            '<option value=\"Engineering\"' + (student.course === 'Engineering' ? ' selected' : '') + '>Engineering</option>' +
            '<option value=\"Design\"' + (student.course === 'Design' ? ' selected' : '') + '>Design</option>' +
          '</select>' +
          '<label>Batch:</label><input id=\"swal-edit-batch\" class=\"swal2-input\" value=\"' + (student.batch||'') + '\">' +
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

      if (!formValues) return; // cancelled

      const res = await Auth.api(\/api/students/\\, {
        method: 'PUT',
        body: JSON.stringify(formValues)
      });

      if (!res.ok) return Swal.fire('Error', res.data.message || 'Could not update student.', 'error');
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'Student details updated.'
      });
      await this.loadStudents();
    } catch (e) {
      Swal.fire('Error', 'Failed to edit student', 'error');
    }
  },;

content = content.replace(/async editStudent\(studentId\) \{[\s\S]*?showToast\('Student details updated\.', 'success'\);\s+await this\.loadStudents\(\);\s+\},/, newEditStudent);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched editStudent');
