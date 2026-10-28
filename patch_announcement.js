const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', '..', 'backend', 'controllers', 'announcementController.js');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('sendAnnouncementEmail')) {
    content = content.replace(
        const db = require('../config/db');,
        const db = require('../config/db');\nconst { sendAnnouncementEmail } = require('../services/emailService');
    );
}

const newCreate = sync function createAnnouncement(req, res) {
  try {
    const { title, content, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const result = await db.query(
      'INSERT INTO announcements (title, content, created_by, status) VALUES (?, ?, ?, ?)',
      [title.trim(), content.trim(), req.user.id, status || 'Published']
    );

    // If published, email all students
    let emailStatus = '';
    if (!status || status === 'Published') {
      try {
        const students = await db.query(\"SELECT username as name, email as personalEmail, portal_email as portalEmail FROM students WHERE status = 'active'\");
        let sentCount = 0;
        for (const student of students) {
          if (student.portalEmail && student.personalEmail) {
            await sendAnnouncementEmail({
              title: title.trim(),
              content: content.trim(),
              studentName: student.name,
              studentPersonalEmail: student.personalEmail,
              studentPortalEmail: student.portalEmail
            });
            sentCount++;
          }
        }
        emailStatus = \ (Emailed \ active students)\;
      } catch (err) {
        console.error('Failed to send announcement emails:', err);
        emailStatus = ' (Email sending failed)';
      }
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully!' + emailStatus,
      id: result.insertId || (result[0] && result[0].insertId)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create announcement: ' + err.message });
  }
};

// Replace the old createAnnouncement
content = content.replace(/async function createAnnouncement[\s\S]*?res\.status\(500\)\.json\(\{ success: false, message: 'Failed to create announcement: ' \+ err\.message \}\);\n  \}/, newCreate);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched announcementController.js');
