const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

const logic = `
  toggleSelectAll(el) {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = el.checked);
    this.toggleStudentSelection();
  },

  toggleStudentSelection() {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const btn = document.getElementById('btn-delete-selected');
    if (checkboxes.length > 0) {
      btn.style.display = 'inline-block';
      btn.textContent = \`Delete Selected (\${checkboxes.length})\`;
    } else {
      btn.style.display = 'none';
      document.getElementById('selectAllStudents').checked = false;
    }
  },

  async deleteSelectedStudents() {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    if (!confirm(\`Are you sure you want to delete \${checkboxes.length} student(s)? This cannot be undone.\`)) return;

    const studentIds = Array.from(checkboxes).map(cb => cb.value);

    const res = await Auth.api('/api/students/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ studentIds })
    });

    if (res.ok) {
      showToast(res.data.message || 'Students deleted successfully', 'success');
      document.getElementById('selectAllStudents').checked = false;
      this.toggleStudentSelection();
      this.loadStudents();
      this.loadOverview();
    } else {
      Swal.fire('Error', res.data.message || 'Failed to delete students', 'error');
    }
  },
`;

if (!content.includes('deleteSelectedStudents')) {
  content = content.replace('async loadStudents() {', logic + '\n  async loadStudents() {');
  fs.writeFileSync('frontend/js/admin-dashboard.js', content, 'utf8');
}
