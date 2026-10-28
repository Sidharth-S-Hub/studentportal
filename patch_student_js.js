const fs = require('fs');
const file = 'frontend/js/student-dashboard.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /(async loadTracker\(\) \{[\s\S]*?\},)/;
const replacement = `$1

  async loadTickets() {
    const res = await Auth.api('/api/tickets/student');
    if (!res.ok) return;
    const tbody = document.getElementById('tickets-table-body');
    const tickets = res.data.tickets || [];
    if (tickets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No tickets raised yet.</td></tr>';
      return;
    }
    tbody.innerHTML = tickets.map(t => {
      let badgeClass = 'badge-inactive';
      if (t.status === 'In Progress') badgeClass = 'badge-info';
      if (t.status === 'Completed') badgeClass = 'badge-active';
      return \`
        <tr>
          <td><span style="font-family: monospace;">\${t.ticket_id}</span></td>
          <td style="font-weight: 500;">\${t.subject}</td>
          <td>\${t.category}</td>
          <td>\${t.priority}</td>
          <td><span class="badge \${badgeClass}">\${t.status}</span></td>
          <td>\${new Date(t.created_at).toLocaleDateString()}</td>
        </tr>
      \`;
    }).join('');
  },

  async submitTicket(e) {
    e.preventDefault();
    const body = {
      subject: document.getElementById('ticket-subject').value,
      category: document.getElementById('ticket-category').value,
      priority: document.getElementById('ticket-priority').value,
      description: document.getElementById('ticket-description').value
    };
    // attachment not fully implemented in frontend, just passing empty
    const res = await Auth.api('/api/tickets/student', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    if (!res.ok) return alert(res.data.message || 'Failed to submit ticket');
    
    document.getElementById('modal-raise-ticket').classList.remove('active');
    document.getElementById('form-raise-ticket').reset();
    showToast('Ticket submitted successfully.', 'success');
    await this.loadTickets();
  },
`;
content = content.replace(regex, replacement);

const initRegex = /(await this\.loadTracker\(\);)/;
const initReplacement = `$1\n    await this.loadTickets();`;
content = content.replace(initRegex, initReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched student-dashboard.js');
