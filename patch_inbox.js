const fs = require('fs');
const file = 'frontend/js/student-dashboard.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /async loadInbox\(\) \{[\s\S]*?\}\,\s*async submitTicket/m;
const replacement = `async loadInbox() {
    const inbox = document.getElementById('student-inbox-list');
    if (!inbox) return;
    const res = await Auth.api('/api/messages/inbox');
    if (!res.ok) return;
    const mails = res.data.mails || [];
    if (mails.length === 0) {
      inbox.innerHTML = '<div style="padding:24px; text-align:center; color:var(--slate-400);">Your portal inbox is empty.</div>';
      return;
    }
    inbox.innerHTML = mails.map(mail => \`
      <article style="padding:18px 20px; border-bottom:1px solid var(--slate-100); \${mail.is_read ? '' : 'background-color: #f8fafc; border-left: 3px solid var(--indigo-500);'}">
        <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <strong>\${mail.is_read ? '' : '<span class="badge badge-active" style="padding:2px 6px; font-size:10px;">New</span> '}\${mail.subject}</strong>
          <span style="font-size:12px; color:var(--slate-400);">\${new Date(mail.sent_at).toLocaleString()}</span>
        </div>
        <div style="font-size:12px; color:var(--slate-500); margin:5px 0 10px;">From \${mail.sender_name || 'System'}</div>
        <p style="margin:0; white-space:pre-wrap; color:var(--slate-700);">\${mail.body}</p>
        \${mail.is_read ? '' : \`<button class="btn btn-secondary btn-sm" style="margin-top: 10px;" onclick="StudentDashboard.markInboxRead(\${mail.id})">Mark as read</button>\`}
      </article>
    \`).join('');
  },

  async markInboxRead(id) {
    await Auth.api(\`/api/messages/inbox/\${id}/read\`, { method: 'PUT' });
    await this.loadInbox();
    await this.loadHomeData(); // Update badge
  },

  async submitTicket`;

content = content.replace(regex, replacement);

const badgeRegex = /document\.getElementById\('home-stat-logins'\)\.textContent = tracker\.logins;/;
const badgeReplacement = `document.getElementById('home-stat-logins').textContent = tracker.logins;
        
        const navInbox = document.getElementById('nav-student-inbox');
        if (tracker.unreadInbox > 0) {
          navInbox.innerHTML = \`<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Inbox <span class="badge badge-active" style="margin-left:auto; padding:2px 6px; font-size:10px;">\${tracker.unreadInbox}</span>\`;
        } else {
          navInbox.innerHTML = \`<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Inbox\`;
        }`;
content = content.replace(badgeRegex, badgeReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched student JS for inbox');
