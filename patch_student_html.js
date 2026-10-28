const fs = require('fs');
const file = 'frontend/student/dashboard.html';
let content = fs.readFileSync(file, 'utf8');

const sidebarRegex = /(<a href="#" onclick="StudentDashboard\.switchTab\('tab-contact'\)".*?<\/a>)/;
const sidebarReplacement = `$1
        <a href="#" onclick="StudentDashboard.switchTab('tab-tickets')">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
          Support Tickets
        </a>`;
content = content.replace(sidebarRegex, sidebarReplacement);

const tabRegex = /(<div id="tab-contact" class="tab-content">[\s\S]*?<\/div>\s*<\/div>\s*<!--)/;
const tabReplacement = `$1
      <!-- Support Tickets Tab -->
      <div id="tab-tickets" class="tab-content">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
              <h2 style="font-size: 20px; font-weight: 700; color: var(--slate-900);">Support Tickets</h2>
              <p style="color: var(--slate-500); font-size: 13.5px; margin-top: 4px;">Raise and track your support requests.</p>
            </div>
            <button class="btn btn-primary" onclick="document.getElementById('modal-raise-ticket').classList.add('active')">Raise Ticket</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody id="tickets-table-body">
                <!-- Populated via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!--`;
content = content.replace(tabRegex, tabReplacement);

// Add Modal
const modalRegex = /(<\/body>)/;
const modalReplacement = `
  <!-- Raise Ticket Modal -->
  <div id="modal-raise-ticket" class="modal-overlay">
    <div class="modal-box" style="max-width: 500px;">
      <div class="modal-header">
        <h3 style="font-size: 16px; font-weight: 600;">Raise Support Ticket</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
      </div>
      <form id="form-raise-ticket" onsubmit="StudentDashboard.submitTicket(event)">
        <div class="form-group">
          <label class="form-label">Subject</label>
          <input type="text" id="ticket-subject" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="ticket-category" class="form-control" required>
            <option value="IT Support">IT Support</option>
            <option value="Academic">Academic</option>
            <option value="Administration">Administration</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select id="ticket-priority" class="form-control" required>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="ticket-description" class="form-control" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Attachment (Optional)</label>
          <input type="file" id="ticket-attachment" class="form-control">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Ticket</button>
        </div>
      </form>
    </div>
  </div>
$1`;
content = content.replace(modalRegex, modalReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched dashboard.html');
