const fs = require('fs');
const fileHtml = 'frontend/admin/dashboard.html';
let contentHtml = fs.readFileSync(fileHtml, 'utf8');

const sidebarRegexHtml = /(<a href="#" onclick="AdminDashboard\.switchTab\('tab-logs'\)".*?<\/a>)/;
const sidebarReplacementHtml = `$1
        <a href="#" onclick="AdminDashboard.switchTab('tab-tickets')">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
          Support Tickets
        </a>`;
contentHtml = contentHtml.replace(sidebarRegexHtml, sidebarReplacementHtml);

const tabRegexHtml = /(<div id="tab-logs" class="tab-content">[\s\S]*?<\/div>\s*<\/div>\s*<!--)/;
const tabReplacementHtml = `$1
      <!-- Tickets Tab -->
      <div id="tab-tickets" class="tab-content">
        <div class="card">
          <h2 style="font-size: 20px; font-weight: 700; color: var(--slate-900); margin-bottom: 24px;">Support Tickets</h2>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-tickets-table-body">
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!--`;
contentHtml = contentHtml.replace(tabRegexHtml, tabReplacementHtml);
fs.writeFileSync(fileHtml, contentHtml, 'utf8');

const fileJs = 'frontend/js/admin-dashboard.js';
let contentJs = fs.readFileSync(fileJs, 'utf8');

const jsRegex = /(async loadEmailLogs\(\) \{[\s\S]*?\},)/;
const jsReplacement = `$1

  async loadTickets() {
    const res = await Auth.api('/api/tickets/admin');
    if (!res.ok) return;
    const tbody = document.getElementById('admin-tickets-table-body');
    const tickets = res.data.tickets || [];
    if (tickets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No tickets found.</td></tr>';
      return;
    }
    tbody.innerHTML = tickets.map(t => {
      let badgeClass = 'badge-inactive';
      if (t.status === 'In Progress') badgeClass = 'badge-info';
      if (t.status === 'Completed') badgeClass = 'badge-active';
      return \`
        <tr>
          <td><span style="font-family: monospace;">\${t.ticket_id}</span></td>
          <td>
            <div style="font-weight: 600;">\${t.student_name}</div>
            <div style="font-size: 11px;">\${t.personal_email}</div>
          </td>
          <td>\${t.subject}</td>
          <td>\${t.category}</td>
          <td>\${t.priority}</td>
          <td><span class="badge \${badgeClass}">\${t.status}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.updateTicket(\${t.id})">Update Status</button>
          </td>
        </tr>
      \`;
    }).join('');
  },

  async updateTicket(id) {
    const { value: formValues } = await Swal.fire({
      title: 'Update Ticket',
      html:
        '<select id="swal-ticket-status" class="swal2-input">' +
          '<option value="Pending">Pending</option>' +
          '<option value="In Progress">In Progress</option>' +
          '<option value="Completed">Completed</option>' +
        '</select>' +
        '<textarea id="swal-ticket-remarks" class="swal2-textarea" placeholder="Admin Remarks..."></textarea>',
      focusConfirm: false,
      preConfirm: () => {
        return {
          status: document.getElementById('swal-ticket-status').value,
          admin_remarks: document.getElementById('swal-ticket-remarks').value
        }
      }
    });

    if (!formValues) return;
    const res = await Auth.api(\`/api/tickets/admin/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(formValues)
    });
    if (!res.ok) return Swal.fire('Error', 'Failed to update ticket', 'error');
    showToast('Ticket updated successfully', 'success');
    await this.loadTickets();
  },
`;
contentJs = contentJs.replace(jsRegex, jsReplacement);

const initRegexJs = /(await this\.loadEmailLogs\(\);)/;
const initReplacementJs = `$1\n    await this.loadTickets();`;
contentJs = contentJs.replace(initRegexJs, initReplacementJs);

fs.writeFileSync(fileJs, contentJs, 'utf8');
console.log('Patched admin dashboard for tickets');
