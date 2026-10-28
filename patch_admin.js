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
        '<div style=\"text-align: left;\">' +
        '<label>Name:</label><input id=\"swal-edit-name\" class=\"swal2-input\" value=\"' + (student.name || '') + '\">' +
        '<label>Personal Email:</label><input id=\"swal-edit-pemail\" class=\"swal2-input\" value=\"' + (student.personal_email || '') + '\">' +
        '<label>Phone:</label><input id=\"swal-edit-phone\" class=\"swal2-input\" value=\"' + (student.phone || '') + '\">' +
        '<label>Course:</label>' +
        '<select id=\"swal-edit-course\" class=\"swal2-input\">' +
          '<option value=\"Computer Science\"' + (student.course === 'Computer Science' ? ' selected' : '') + '>Computer Science</option>' +
          '<option value=\"Business\"' + (student.course === 'Business' ? ' selected' : '') + '>Business</option>' +
          '<option value=\"Engineering\"' + (student.course === 'Engineering' ? ' selected' : '') + '>Engineering</option>' +
          '<option value=\"Design\"' + (student.course === 'Design' ? ' selected' : '') + '>Design</option>' +
        '</select>' +
        '<label>Batch:</label><input id=\"swal-edit-batch\" class=\"swal2-input\" value=\"' + (student.batch || '') + '\">' +
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

const authRegex = /const code = prompt\('Enter the six-digit authenticator code to enable it:'\);/;
const authReplacement = `const { value: code } = await Swal.fire({
      title: 'Enter Authenticator Code',
      input: 'text',
      inputPlaceholder: '6-digit code',
      showCancelButton: true
    });`;
content = content.replace(authRegex, authReplacement);

const confirmRegex1 = /if \(!confirm\(\`Change student status to \$\{newStatus\}\?\`\)\) return;/g;
const confirmRep1 = `const result = await Swal.fire({title: 'Confirm', text: \`Change student status to \${newStatus}?\`, icon: 'warning', showCancelButton: true});\n    if (!result.isConfirmed) return;`;
content = content.replace(confirmRegex1, confirmRep1);

const confirmRegex2 = /if \(!confirm\(\`Send a new 24-hour activation link to \$\{studentName\}\?\`\)\) return;/g;
const confirmRep2 = `const result = await Swal.fire({title: 'Confirm', text: \`Send a new 24-hour activation link to \${studentName}?\`, icon: 'warning', showCancelButton: true});\n    if (!result.isConfirmed) return;`;
content = content.replace(confirmRegex2, confirmRep2);

const confirmRegex3 = /if \(!confirm\('Are you sure you want to permanently delete this announcement\?'\)\) return;/g;
const confirmRep3 = `const result = await Swal.fire({title: 'Confirm', text: 'Are you sure you want to permanently delete this announcement?', icon: 'warning', showCancelButton: true});\n    if (!result.isConfirmed) return;`;
content = content.replace(confirmRegex3, confirmRep3);

const confirmRegex4 = /if \(!confirm\('Are you sure you want to delete this learning material\?'\)\) return;/g;
const confirmRep4 = `const result = await Swal.fire({title: 'Confirm', text: 'Are you sure you want to delete this learning material?', icon: 'warning', showCancelButton: true});\n    if (!result.isConfirmed) return;`;
content = content.replace(confirmRegex4, confirmRep4);

const confirmRegex5 = /if \(!confirm\('Are you sure you want to delete this message\?'\)\) return;/g;
const confirmRep5 = `const result = await Swal.fire({title: 'Confirm', text: 'Are you sure you want to delete this message?', icon: 'warning', showCancelButton: true});\n    if (!result.isConfirmed) return;`;
content = content.replace(confirmRegex5, confirmRep5);

fs.writeFileSync(file, content, 'utf8');
console.log('Done admin-dashboard.js');
