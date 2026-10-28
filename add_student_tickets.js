const fs = require('fs');

let content = fs.readFileSync('frontend/js/student-dashboard.js', 'utf8');

const newMethods = `
  async submitTicket(e) {
    e.preventDefault();
    const subject = document.getElementById('ticket-subject').value;
    const category = document.getElementById('ticket-category').value;
    const priority = document.getElementById('ticket-priority').value;
    const description = document.getElementById('ticket-description').value;

    const res = await Auth.api('/api/tickets/student', {
      method: 'POST',
      body: JSON.stringify({ subject, category, priority, description })
    });

    if (res.ok) {
      showToast('Support ticket raised successfully!', 'success');
      e.target.closest('.modal-overlay').classList.remove('active');
      e.target.reset();
      this.loadTickets();
    } else {
      Swal.fire('Error', res.data.message || 'Failed to raise ticket.', 'error');
    }
  },

  async loadTickets() {
    const res = await Auth.api('/api/tickets/student');
    if (!res.ok) return;

    const tbody = document.getElementById('student-tickets-table-body');
    const tickets = res.data.tickets || [];

    if (tickets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No tickets found.</td></tr>';
      return;
    }

    tbody.innerHTML = tickets.map(t => {
      let badgeClass = 'badge-inactive';
      if (t.status === 'In Progress') badgeClass = 'badge-info';
      if (t.status === 'Completed') badgeClass = 'badge-active';
      return \`
        <tr>
          <td><span style="font-family: monospace;">\${t.ticket_id}</span></td>
          <td>\${t.subject}</td>
          <td>\${t.category}</td>
          <td>\${t.priority}</td>
          <td><span class="badge \${badgeClass}">\${t.status}</span></td>
        </tr>
      \`;
    }).join('');
  },
`;

if (!content.includes('submitTicket(e)')) {
  content = content.replace('async loadHomeData() {', newMethods + '\n  async loadHomeData() {');
  fs.writeFileSync('frontend/js/student-dashboard.js', content, 'utf8');
}
