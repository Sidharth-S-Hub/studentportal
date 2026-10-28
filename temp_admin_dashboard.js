/**
 * Admin Dashboard Controller
 * Implements PRD specifications for Student Management, Content, Announcements, Messaging, & Tracking
 */

const AdminDashboard = {
  currentTab: 'tab-overview',
  activeChatStudentId: null,
  studentsList: [],
  allCategories: [],

  async init() {
    if (!Auth.requireAuth('admin')) return;

    // Set admin user profile in sidebar
    const user = Auth.getUser();
    if (user) {
      document.getElementById('admin-display-name').textContent = user.name || 'Administrator';
      document.getElementById('admin-avatar').textContent = (user.name || 'A').charAt(0).toUpperCase();
    }

    this.bindEvents();
    await this.loadOverview();
    await this.loadStudents();
    await this.loadAnnouncements();
    await this.loadEContent();
    await this.loadConversations();
  },

  bindEvents() {
    // Navigation tab switching
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = link.getAttribute('data-tab');
        if (targetTab) this.switchTab(targetTab);
      });
    });

    // Logout
    document.getElementById('btn-admin-logout').addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of the Admin Portal?')) {
        Auth.logout();
      }
    });

    // Quick add student button
    document.getElementById('btn-quick-add-student').addEventListener('click', () => {
      this.openAddStudentModal();
    });
    document.getElementById('btn-open-add-student-modal').addEventListener('click', () => {
      this.openAddStudentModal();
    });
    document.getElementById('btn-admin-authenticator').addEventListener('click', () => this.setupAuthenticator());

    // Add student form submit
    document.getElementById('form-add-student').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleAddStudent();
    });

    // Student filters & search
    document.getElementById('students-search-input').addEventListener('input', () => {
      this.filterStudents();
    });
    document.getElementById('students-course-filter').addEventListener('change', () => {
      this.filterStudents();
    });
    document.getElementById('students-status-filter').addEventListener('change', () => {
      this.filterStudents();
    });

    // Tracker student selector
    document.getElementById('tracker-student-selector').addEventListener('change', (e) => {
      const studentId = e.target.value;
      if (studentId) {
        this.loadStudentTracker(studentId);
      } else {
        document.getElementById('tracker-display-container').style.display = 'none';
        document.getElementById('tracker-placeholder').style.display = 'block';
      }
    });

    // Announcements create modal
    document.getElementById('btn-open-create-announcement').addEventListener('click', () => {
      this.openAnnouncementModal();
    });
    document.getElementById('form-announcement').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSaveAnnouncement();
    });

    // E-Content upload modal
    document.getElementById('btn-open-upload-content').addEventListener('click', () => {
      document.getElementById('modal-content').classList.add('active');
    });
    document.getElementById('form-content').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleUploadContent();
    });
    document.getElementById('content-category-filter').addEventListener('change', (e) => {
      this.loadEContent(e.target.value);
    });

    // Admin chat reply form
    document.getElementById('admin-chat-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSendReply();
    });
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active nav link
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tabId);
    });

    // Update tab visibility
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.style.display = pane.id === tabId ? 'block' : 'none';
    });

    // Update Topbar Title
    const titleMap = {
      'tab-overview': { heading: 'Executive Dashboard Overview', sub: 'Monitoring academic records, updates, and interactions' },
      'tab-students': { heading: 'Student Management Directory', sub: 'Register, edit, monitor, and dispatch onboarding credentials' },
      'tab-tracker': { heading: 'Individual Student Activity Tracker', sub: 'Comprehensive audit trail, content downloads, and engagement metrics' },
      'tab-announcements': { heading: 'Announcements & Campus Broadcasts', sub: 'Publish campus news, exam schedules, and academic bulletins' },
      'tab-content': { heading: 'E-Learning Material & Document Vault', sub: 'Distribute lecture notes, reference PDFs, and digital guides' },
      'tab-messages': { heading: 'Student Inquiries & Communication Center', sub: 'Direct 2-way academic dialogue and student support' },
      'tab-emails': { heading: 'Outgoing Email Dispatch Center', sub: 'Review sent welcome emails and generated onboarding credentials' }
    };

    if (titleMap[tabId]) {
      document.getElementById('topbar-heading').textContent = titleMap[tabId].heading;
      document.getElementById('topbar-subheading').textContent = titleMap[tabId].sub;
    }

    // Tab-specific lazy refreshes
    if (tabId === 'tab-overview') this.loadOverview();
    if (tabId === 'tab-students') this.loadStudents();
    if (tabId === 'tab-emails') this.loadEmailLogs();
    if (tabId === 'tab-messages') this.loadConversations();
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
  },

  // ================= 1. DASHBOARD OVERVIEW =================
  async loadOverview() {
    const res = await Auth.api('/api/tracker/dashboard-stats');
    if (!res.ok) return;

    const { stats, recentActivities, recentAnnouncements } = res.data;

    document.getElementById('stat-total-students').textContent = stats.totalStudents;
    document.getElementById('stat-active-students').textContent = stats.activeStudents;
    document.getElementById('stat-total-announcements').textContent = stats.totalAnnouncements;
    document.getElementById('stat-total-content').textContent = stats.totalContent;
    document.getElementById('stat-unread-messages').textContent = stats.unreadMessages;

    const unreadBadge = document.getElementById('sidebar-unread-badge');
    if (stats.unreadMessages > 0) {
      unreadBadge.textContent = stats.unreadMessages;
      unreadBadge.style.display = 'inline-block';
    } else {
      unreadBadge.style.display = 'none';
    }

    // Render Recent Activities Timeline
    const streamContainer = document.getElementById('overview-activity-stream');
    if (!recentActivities || recentActivities.length === 0) {
      streamContainer.innerHTML = '<p style="color: var(--slate-400); font-size: 13px;">No recorded student activity yet.</p>';
    } else {
      streamContainer.innerHTML = recentActivities.map(act => {
        let markerColor = 'blue';
        if (act.activity_type === 'login') markerColor = 'green';
        if (act.activity_type === 'content_access') markerColor = 'amber';

        const timeAgo = new Date(act.activity_time).toLocaleString();
        return `
          <div class="timeline-item">
            <div class="timeline-marker ${markerColor}"></div>
            <div class="timeline-content">
              <div class="timeline-title">${act.student_name} (${act.student_code}): ${act.activity_reference || act.activity_type}</div>
              <div class="timeline-time">${timeAgo}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Recent Announcements
    const announcementsContainer = document.getElementById('overview-announcements-list');
    if (!recentAnnouncements || recentAnnouncements.length === 0) {
      announcementsContainer.innerHTML = '<p style="color: var(--slate-400); font-size: 13px;">No announcements published yet.</p>';
    } else {
      announcementsContainer.innerHTML = recentAnnouncements.map(a => `
        <div style="padding: 12px 0; border-bottom: 1px solid var(--slate-100); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; font-size: 14px; color: var(--slate-800);">${a.title}</div>
            <div style="font-size: 12px; color: var(--slate-400); margin-top: 2px;">Published: ${new Date(a.published_at).toLocaleDateString()}</div>
          </div>
          <span class="badge ${a.status === 'Published' ? 'badge-published' : 'badge-draft'}">${a.status}</span>
        </div>
      `).join('');
    }
  },

  // ================= 2. STUDENTS DIRECTORY =================
  async loadStudents() {
    const res = await Auth.api('/api/students');
    if (!res.ok) return;

    this.studentsList = res.data.students || [];

    // Populate Courses filter & Tracker selector
    const courses = [...new Set(this.studentsList.map(s => s.course).filter(Boolean))];
    const courseSelect = document.getElementById('students-course-filter');
    courseSelect.innerHTML = '<option value="">All Courses</option>' + courses.map(c => `<option value="${c}">${c}</option>`).join('');

    const trackerSelect = document.getElementById('tracker-student-selector');
    trackerSelect.innerHTML = '<option value="">Select a student...</option>' + 
      this.studentsList.map(s => `<option value="${s.id}">${s.name} (${s.student_id}) - ${s.course}</option>`).join('');

    this.renderStudentsTable(this.studentsList);
  },

  renderStudentsTable(students) {
    const tbody = document.getElementById('students-table-body');
    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--slate-400); padding: 30px;">No students match the criteria.</td></tr>';
      return;
    }

    tbody.innerHTML = students.map(s => {
      const statusBadgeClass = s.status === 'Active' ? 'badge-active' : 'badge-inactive';
      const lastLoginStr = s.last_login ? new Date(s.last_login).toLocaleDateString() : 'Never';

      return `
        <tr>
          <td>
            <label for="profile-photo-${s.id}" class="avatar" style="width: 38px; height: 38px; font-size: 14px; cursor: pointer; ${s.profile_photo ? `background-image: url('${s.profile_photo}'); background-size: cover; background-position: center; color: transparent;` : ''}" title="Upload profile photo">
              ${s.profile_photo ? '' : (s.name || 'S').charAt(0).toUpperCase()}
            </label>
            <input type="file" id="profile-photo-${s.id}" accept="image/*" style="display: none;" onchange="AdminDashboard.uploadProfilePhoto(${s.id}, this)">
          </td>
          <td><span style="font-family: monospace; font-weight: 600; background: var(--slate-100); padding: 2px 6px; border-radius: 4px;">${s.student_id}</span></td>
          <td>
            <div style="font-weight: 600; color: var(--slate-900);">${s.name}</div>
            <div style="font-size: 12px; color: var(--slate-500);">${s.phone}</div>
          </td>
          <td>
            <a href="mailto:${s.personal_email}">${s.personal_email}</a>
            <div style="font-size: 11px; color: var(--slate-500);">${s.portal_email || 'Portal email pending'}</div>
          </td>
          <td>
            <div>${s.course}</div>
            <div style="font-size: 11px; color: var(--slate-400);">${s.batch}</div>
          </td>
          <td><span style="font-family: monospace; font-size: 12.5px;">${s.username}</span></td>
          <td>
            <button onclick="AdminDashboard.toggleStudentStatus(${s.id}, '${s.status}')" class="badge ${statusBadgeClass}" style="cursor: pointer; border: none;" title="Click to toggle status">
              ${s.status}
            </button>
          </td>
          <td style="font-size: 12.5px; color: var(--slate-600);">${lastLoginStr}</td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.viewStudentTrackerDirectly(${s.id})" title="View Tracker">
                Tracker
              </button>
              <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.editStudent(${s.id})" title="Edit student details">
                Edit
              </button>
              <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.resendCredentials(${s.id}, '${s.name}')" title="Resend Welcome Email">
                Resend Email
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async uploadProfilePhoto(studentId, input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    const res = await Auth.api(`/api/students/${studentId}/profile-photo`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      showToast(res.data.message || 'Unable to upload profile photo.', 'danger');
      input.value = '';
      return;
    }

    showToast('Student profile photo updated.', 'success');
    await this.loadStudents();
  },

  async editStudent(studentId) {
    const current = await Auth.api(`/api/students/${studentId}`);
    if (!current.ok) return alert(current.data.message || 'Could not load student details.');
    const student = current.data.student;
    const name = prompt('Student name:', student.name);
    if (name === null) return;
    const personal_email = prompt('Personal email:', student.personal_email);
    if (personal_email === null) return;
    const phone = prompt('Phone number:', student.phone);
    if (phone === null) return;
    const course = prompt('Course:', student.course);
    if (course === null) return;
    const batch = prompt('Batch:', student.batch);
    if (batch === null) return;
    const res = await Auth.api(`/api/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, personal_email, phone, course, batch })
    });
    if (!res.ok) return alert(res.data.message || 'Could not update student.');
    showToast('Student details updated.', 'success');
    await this.loadStudents();
  },

  async setupAuthenticator() {
    const res = await Auth.api('/api/auth/authenticator/setup', { method: 'POST' });
    if (!res.ok) return alert(res.data.message || 'Could not start authenticator setup.');
    alert(`Add this URI to your authenticator app:\n\n${res.data.otpauthUrl}`);
    const code = prompt('Enter the six-digit authenticator code to enable it:');
    if (!code) return;
    const enabled = await Auth.api('/api/auth/authenticator/enable', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    alert(enabled.data.message || 'Authenticator setup finished.');
  },

  filterStudents() {
    const term = document.getElementById('students-search-input').value.toLowerCase().trim();
    const course = document.getElementById('students-course-filter').value;
    const status = document.getElementById('students-status-filter').value;

    const filtered = this.studentsList.filter(s => {
      const matchSearch = !term || 
        s.name.toLowerCase().includes(term) || 
        s.student_id.toLowerCase().includes(term) || 
        s.username.toLowerCase().includes(term) || 
        s.personal_email.toLowerCase().includes(term);

      const matchCourse = !course || s.course === course;
      const matchStatus = !status || s.status === status;

      return matchSearch && matchCourse && matchStatus;
    });

    this.renderStudentsTable(filtered);
  },

  openAddStudentModal() {
    document.getElementById('form-add-student').reset();
    document.getElementById('modal-add-student').classList.add('active');
  },

  async handleAddStudent() {
    const btn = document.getElementById('btn-submit-add-student');
    btn.disabled = true;
    btn.textContent = 'Creating Account & Sending Activation...';

    const formData = new FormData();
    const payload = {
      name: document.getElementById('add-student-name').value.trim(),
      joining_date: document.getElementById('add-student-joining-date').value,
      personal_email: document.getElementById('add-student-email').value.trim(),
      phone: document.getElementById('add-student-phone').value.trim(),
      course: document.getElementById('add-student-course').value,
      batch: document.getElementById('add-student-batch').value.trim(),
      username: document.getElementById('add-student-username').value.trim(),
      status: 'Pending'
    };

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const photoInput = document.getElementById('add-student-photo');
    if (photoInput && photoInput.files && photoInput.files[0]) {
      formData.append('photo', photoInput.files[0]);
    }

    const res = await Auth.api('/api/students', {
      method: 'POST',
      body: formData
    });

    btn.disabled = false;
    btn.textContent = 'Create & Send Activation';

    if (res.ok && res.data.success) {
      this.closeModals();
      const emailNotification = res.data.emailNotification || {};
      const emailStatus = emailNotification.status === 'sent'
        ? 'Activation email sent through SMTP.'
        : emailNotification.status === 'failed'
          ? `Activation email failed: ${emailNotification.error || 'SMTP delivery failed.'}`
          : 'Activation email was only logged. Configure SMTP to deliver it.';
      showToast(`Student ${payload.name} created. ${emailStatus}`, emailNotification.status === 'sent' ? 'success' : 'warning');
      
      alert(`âœ… Student Created Successfully!\n\nStudent ID: ${res.data.student.student_id}\nUsername: ${res.data.student.username}\nStatus: Pending activation\nEmail Status: ${emailNotification.status.toUpperCase()}\n\n${emailStatus}\nThe student must activate the account from their personal email.`);
      
      await this.loadStudents();
      await this.loadOverview();
    } else {
      alert('Error creating student: ' + (res.data.message || 'Unknown error'));
    }
  },

  async toggleStudentStatus(studentId, currentStatus) {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (!confirm(`Change student status to ${newStatus}?`)) return;

    const res = await Auth.api(`/api/students/${studentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      showToast(`Status updated to ${newStatus}`, 'success');
      await this.loadStudents();
      await this.loadOverview();
    } else {
      alert(res.data.message || 'Failed to update status.');
    }
  },

  async resendCredentials(studentId, studentName) {
    if (!confirm(`Send a new 24-hour activation link to ${studentName}?`)) return;

    const res = await Auth.api(`/api/students/${studentId}/resend-email`, {
      method: 'POST'
    });

    if (res.ok && res.data.success) {
      const emailResult = res.data.emailResult || {};
      const emailStatus = emailResult.status === 'sent'
        ? 'Activation email sent through SMTP.'
        : emailResult.status === 'failed'
          ? `Activation email failed: ${emailResult.error || 'SMTP delivery failed.'}`
          : 'Activation email was only logged. Configure SMTP to deliver it.';
      alert(`Activation link regenerated for ${studentName}.\n\nEmail Status: ${(emailResult.status || 'unknown').toUpperCase()}\n\n${emailStatus}`);
      showToast(emailStatus, emailResult.status === 'sent' ? 'success' : 'warning');
    } else {
      alert(res.data.message || 'Failed to resend credentials.');
    }
  },

  // ================= 3. STUDENT TRACKER =================
  viewStudentTrackerDirectly(studentId) {
    this.switchTab('tab-tracker');
    document.getElementById('tracker-student-selector').value = studentId;
    this.loadStudentTracker(studentId);
  },

  async loadStudentTracker(studentId) {
    const res = await Auth.api(`/api/tracker/student/${studentId}`);
    if (!res.ok) {
      alert('Failed to load student tracker.');
      return;
    }

    const { student, tracker, activities } = res.data;

    document.getElementById('tracker-placeholder').style.display = 'none';
    document.getElementById('tracker-display-container').style.display = 'block';

    // Banner Details
    document.getElementById('tracker-student-name').textContent = student.name;
    document.getElementById('tracker-student-avatar').textContent = student.name.charAt(0).toUpperCase();
    document.getElementById('tracker-student-meta').textContent = `${student.student_id} â€¢ ${student.course} â€¢ Batch ${student.batch} â€¢ ${student.personal_email}`;
    
    const badge = document.getElementById('tracker-student-status-badge');
    badge.textContent = student.status;
    badge.className = `badge ${student.status === 'Active' ? 'badge-active' : 'badge-inactive'}`;
    
    document.getElementById('tracker-student-last-login').textContent = student.last_login 
      ? `Last Login: ${new Date(student.last_login).toLocaleString()}` 
      : 'Last Login: Never';

    // Metrics Tiles
    document.getElementById('track-stat-logins').textContent = tracker.logins;
    document.getElementById('track-stat-announcements').textContent = tracker.announcementsViewed;
    document.getElementById('track-stat-content').textContent = tracker.contentAccessed;
    document.getElementById('track-stat-messages-sent').textContent = tracker.messagesSent;
    document.getElementById('track-stat-messages-rec').textContent = tracker.messagesReceived;

    // Timeline
    const timelineEl = document.getElementById('tracker-activities-timeline');
    if (!activities || activities.length === 0) {
      timelineEl.innerHTML = '<p style="color: var(--slate-400); font-size: 13px;">No activities recorded for this student yet.</p>';
    } else {
      timelineEl.innerHTML = activities.map(act => {
        let markerColor = 'blue';
        if (act.activity_type === 'login') markerColor = 'green';
        if (act.activity_type === 'content_access') markerColor = 'amber';

        return `
          <div class="timeline-item">
            <div class="timeline-marker ${markerColor}"></div>
            <div class="timeline-content">
              <div class="timeline-title">${act.activity_reference || act.activity_type}</div>
              <div class="timeline-time">${new Date(act.activity_time).toLocaleString()}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  // ================= 4. ANNOUNCEMENTS =================
  async loadAnnouncements() {
    const res = await Auth.api('/api/announcements');
    if (!res.ok) return;

    const listContainer = document.getElementById('announcements-list-container');
    const announcements = res.data.announcements || [];

    if (announcements.length === 0) {
      listContainer.innerHTML = '<div class="card" style="text-align: center; color: var(--slate-400);">No announcements published. Click "Create Announcement" to post your first notice.</div>';
      return;
    }

    listContainer.innerHTML = announcements.map(a => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <h4 style="font-size: 17px; color: var(--slate-900);">${a.title}</h4>
              <span class="badge ${a.status === 'Published' ? 'badge-published' : 'badge-draft'}">${a.status}</span>
              <span class="badge badge-info">${a.read_count || 0} student(s) read</span>
            </div>
            <p style="font-size: 14px; color: var(--slate-700); line-height: 1.6; white-space: pre-wrap; margin-bottom: 12px;">${a.content}</p>
            <div style="font-size: 12px; color: var(--slate-400);">
              Published: ${new Date(a.published_at).toLocaleString()} by ${a.author_name || 'Admin'}
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-shrink: 0;">
            <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.editAnnouncement(${JSON.stringify(a).replace(/"/g, '&quot;')})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="AdminDashboard.deleteAnnouncement(${a.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  openAnnouncementModal(announcement = null) {
    const form = document.getElementById('form-announcement');
    form.reset();

    if (announcement) {
      document.getElementById('announcement-modal-title').textContent = 'Edit Announcement';
      document.getElementById('announcement-id').value = announcement.id;
      document.getElementById('announcement-title').value = announcement.title;
      document.getElementById('announcement-content').value = announcement.content;
      document.getElementById('announcement-status').value = announcement.status;
    } else {
      document.getElementById('announcement-modal-title').textContent = 'Publish New Announcement';
      document.getElementById('announcement-id').value = '';
    }

    document.getElementById('modal-announcement').classList.add('active');
  },

  editAnnouncement(announcement) {
    this.openAnnouncementModal(announcement);
  },

  async handleSaveAnnouncement() {
    const id = document.getElementById('announcement-id').value;
    const payload = {
      title: document.getElementById('announcement-title').value.trim(),
      content: document.getElementById('announcement-content').value.trim(),
      status: document.getElementById('announcement-status').value
    };

    const url = id ? `/api/announcements/${id}` : '/api/announcements';
    const method = id ? 'PUT' : 'POST';

    const res = await Auth.api(url, {
      method,
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      this.closeModals();
      showToast(id ? 'Announcement updated!' : 'Announcement published!', 'success');
      await this.loadAnnouncements();
      await this.loadOverview();
    } else {
      alert(res.data.message || 'Failed to save announcement.');
    }
  },

  async deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to permanently delete this announcement?')) return;

    const res = await Auth.api(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Announcement removed', 'success');
      await this.loadAnnouncements();
      await this.loadOverview();
    } else {
      alert(res.data.message || 'Failed to delete announcement.');
    }
  },

  // ================= 5. E-CONTENT VAULT =================
  toggleContentType(type) {
    document.getElementById('content-file-input-group').style.display = type === 'file' ? 'block' : 'none';
    document.getElementById('content-link-input-group').style.display = type === 'link' ? 'block' : 'none';
  },

  async loadEContent(selectedCategory = 'all') {
    const url = selectedCategory && selectedCategory !== 'all' 
      ? `/api/content?category=${encodeURIComponent(selectedCategory)}` 
      : '/api/content';

    const res = await Auth.api(url);
    if (!res.ok) return;

    const { content, categories } = res.data;

    // Update categories filter dropdown if not populated
    const catSelect = document.getElementById('content-category-filter');
    if (categories && catSelect.children.length <= 1) {
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
      });
    }

    const grid = document.getElementById('econtent-grid');
    if (!content || content.length === 0) {
      grid.innerHTML = '<div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--slate-400);">No e-content materials uploaded. Click "Upload New Material" to add documents or reference links.</div>';
      return;
    }

    grid.innerHTML = content.map(item => {
      const isLink = item.file_type === 'link';
      return `
        <div class="card" style="display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span class="badge badge-primary">${item.category}</span>
            <span class="badge badge-info">${item.download_count || 0} accesses</span>
          </div>

          <h4 style="font-size: 16px; margin-bottom: 8px;">${item.title}</h4>
          <p style="color: var(--slate-600); font-size: 13px; line-height: 1.5; margin-bottom: 16px; flex-grow: 1;">
            ${item.description || 'No description provided.'}
          </p>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--slate-100); padding-top: 12px; margin-top: auto;">
            <span style="font-size: 11.5px; color: var(--slate-400); text-transform: uppercase; font-weight: 700;">
              ${item.file_type}
            </span>
            <div style="display: flex; gap: 8px;">
              <a href="/api/content/${item.id}/download" target="_blank" class="btn btn-secondary btn-sm">
                ${isLink ? 'Open Link â†—' : 'Download'}
              </a>
              <button class="btn btn-danger btn-sm" onclick="AdminDashboard.deleteEContent(${item.id})">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async handleUploadContent() {
    const form = document.getElementById('form-content');
    const formData = new FormData();

    formData.append('title', document.getElementById('content-title').value.trim());
    formData.append('category', document.getElementById('content-category').value.trim());
    formData.append('description', document.getElementById('content-description').value.trim());

    const isLink = document.querySelector('input[name="content-type"]:checked').value === 'link';
    if (isLink) {
      formData.append('linkUrl', document.getElementById('content-link').value.trim());
      formData.append('contentType', 'link');
    } else {
      const fileInput = document.getElementById('content-file');
      if (!fileInput.files || !fileInput.files[0]) {
        alert('Please select a file to upload.');
        return;
      }
      formData.append('file', fileInput.files[0]);
    }

    const res = await Auth.api('/api/content', {
      method: 'POST',
      body: formData
    });

    if (res.ok && res.data.success) {
      this.closeModals();
      form.reset();
      showToast('E-learning material uploaded successfully!', 'success');
      await this.loadEContent();
      await this.loadOverview();
    } else {
      alert(res.data.message || 'Upload failed.');
    }
  },

  async deleteEContent(id) {
    if (!confirm('Are you sure you want to delete this learning material?')) return;

    const res = await Auth.api(`/api/content/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Material deleted', 'success');
      await this.loadEContent();
      await this.loadOverview();
    } else {
      alert(res.data.message || 'Failed to delete content.');
    }
  },

  // ================= 6. MESSAGING =================
  async loadConversations() {
    const res = await Auth.api('/api/messages');
    if (!res.ok) return;

    const list = document.getElementById('admin-conversations-list');
    const conversations = res.data.conversations || [];

    if (conversations.length === 0) {
      list.innerHTML = '<li style="padding: 24px 16px; text-align: center; color: var(--slate-400); font-size: 13px;">No student messages yet.</li>';
      return;
    }

    list.innerHTML = conversations.map(c => {
      const isActive = this.activeChatStudentId === c.student_id_pk;
      const unreadBadge = c.unread_count > 0 ? `<span class="badge badge-active" style="font-size: 10px;">${c.unread_count} new</span>` : '';
      
      return `
        <li class="conversation-item ${isActive ? 'active' : ''}" onclick="AdminDashboard.openConversation(${c.student_id_pk})">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 13.5px; color: var(--slate-800);">${c.student_name}</strong>
            ${unreadBadge}
          </div>
          <div style="font-size: 12px; color: var(--slate-500); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px;">
            ${c.last_message || 'No messages'}
          </div>
        </li>
      `;
    }).join('');
  },

  async openConversation(studentPkId) {
    this.activeChatStudentId = studentPkId;
    this.loadConversations(); // highlight active

    const res = await Auth.api(`/api/messages?studentId=${studentPkId}`);
    if (!res.ok) return;

    const { student, messages } = res.data;

    document.getElementById('chat-active-student-name').textContent = student.name;
    document.getElementById('chat-active-student-meta').textContent = `${student.student_id} â€¢ ${student.course} â€¢ ${student.personal_email}`;
    document.getElementById('admin-chat-form').style.display = 'flex';

    const historyEl = document.getElementById('admin-chat-history');
    if (!messages || messages.length === 0) {
      historyEl.innerHTML = '<div style="text-align: center; color: var(--slate-400); margin: auto;">No messages in this conversation yet.</div>';
    } else {
      historyEl.innerHTML = messages.map(m => {
        const isMine = m.sender_role === 'admin';
        const timeStr = new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
          <div class="chat-bubble ${isMine ? 'mine' : 'theirs'}">
            <div>${m.message}</div>
            <div class="chat-time">${timeStr}</div>
          </div>
        `;
      }).join('');
      historyEl.scrollTop = historyEl.scrollHeight;
    }
  },

  async handleSendReply() {
    if (!this.activeChatStudentId) return;

    const input = document.getElementById('admin-chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    const res = await Auth.api('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        studentId: this.activeChatStudentId,
        message: msg
      })
    });

    if (res.ok) {
      await this.openConversation(this.activeChatStudentId);
      await this.loadOverview();
    } else {
      alert('Failed to send reply: ' + (res.data.message || 'Error'));
    }
  },

  // ================= 7. EMAIL DISPATCH AUDIT =================
  async loadEmailLogs() {
    const res = await Auth.api('/api/students/emails/logs');
    if (!res.ok) return;

    const tbody = document.getElementById('email-logs-table-body');
    const logs = res.data.logs || [];

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--slate-400); padding: 30px;">No outgoing credential emails recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const statusBadge = l.status === 'sent' 
        ? '<span class="badge badge-active">Dispatched (SMTP)</span>' 
        : '<span class="badge badge-info">Logged & Simulated</span>';

      return `
        <tr>
          <td style="font-size: 12px; color: var(--slate-500);">${new Date(l.sent_at).toLocaleString()}</td>
          <td style="font-weight: 600;">${l.recipient_name}</td>
          <td><code>${l.recipient_email}</code></td>
          <td style="font-size: 13px;">${l.subject}</td>
          <td>${statusBadge}</td>
          <td><span class="badge badge-info">Activation link</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.previewEmail(${JSON.stringify(l).replace(/"/g, '&quot;')})">
              View Email
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  previewEmail(log) {
    document.getElementById('email-preview-subject').textContent = log.subject;
    document.getElementById('email-preview-body').innerHTML = log.body;
    document.getElementById('modal-email-preview').classList.add('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminDashboard.init();
});
