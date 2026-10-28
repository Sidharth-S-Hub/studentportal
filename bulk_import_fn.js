const xlsx = require('xlsx');

async function bulkImport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded file is empty or invalid.' });
    }

    let successCount = 0;
    let errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = row['Name'] || row['name'];
        const personal_email = row['Personal Email'] || row['email'] || row['personal_email'];
        const phone = row['Phone Number'] || row['phone'] || row['Phone'];
        const course = row['Course'] || row['course'] || row['Department'] || row['department'];
        const batch = row['Batch'] || row['batch'] || row['Academic Year'];
        const username = row['Username'] || row['username'];
        const joining_date = row['Joining Date'] || row['joining_date'] || new Date().toISOString().split('T')[0];

        if (!name || !personal_email || !phone || !course || !batch || !username) {
            errors.push(`Row ${i + 1}: Missing required fields.`);
            continue;
        }

        const year = new Date(joining_date).getFullYear();
        if (isNaN(year)) {
          errors.push(`Row ${i + 1}: Invalid joining date format.`);
          continue;
        }
        const prefix = `STUD${year}`;
        const studentsWithPrefix = await db.query('SELECT student_id FROM students WHERE student_id LIKE ?', [`${prefix}%`]);
        
        let maxNum = 0;
        for (const st of studentsWithPrefix) {
          const numStr = st.student_id.substring(prefix.length);
          const num = parseInt(numStr, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
        const student_id = `${prefix}${String(maxNum + 1).padStart(3, '0')}`;

        // Check duplicate email
        const existingEmail = await db.getOne('SELECT id FROM students WHERE personal_email = ?', [personal_email.trim()]);
        if (existingEmail) {
          errors.push(`Row ${i + 1}: Email "${personal_email}" is already in use.`);
          continue;
        }

        // Check duplicate username
        const existingUser = await db.getOne('SELECT id FROM students WHERE username = ?', [username.trim()]);
        if (existingUser) {
          errors.push(`Row ${i + 1}: Username "${username}" is already taken.`);
          continue;
        }

        const portalEmail = `${student_id.trim().toLowerCase()}@codespace.edu`;
        const existingPortalEmail = await db.getOne('SELECT id FROM students WHERE portal_email = ?', [portalEmail]);
        if (existingPortalEmail) {
          errors.push(`Row ${i + 1}: Portal email "${portalEmail}" is already in use.`);
          continue;
        }

        const rawPassword = generateTemporaryPassword();
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        const studentStatus = 'Pending';

        const result = await db.query(
          `INSERT INTO students (student_id, name, personal_email, portal_email, phone, course, batch, username, password_hash, status, joining_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [student_id, name.trim(), personal_email.trim(), portalEmail, phone.toString().trim(), course.trim(), batch.toString().trim(), username.trim(), passwordHash, studentStatus, joining_date]
        );

        const newStudentId = result.insertId;

        const activation = createActivationToken();
        await db.query(
          `INSERT INTO student_activation_tokens (student_id, token_hash, expires_at)
           VALUES (?, ?, ?)`,
          [newStudentId, activation.tokenHash, activation.expiresAt]
        );

        const hostHeader = req.get('host');
        const protocol = req.protocol;
        const activationUrl = `${protocol}://${hostHeader}/student/activate.html?token=${activation.token}`;

        sendStudentActivationEmail({
          name: name.trim(),
          email: personal_email.trim(),
          activationUrl,
          studentId: student_id,
          portalEmail: portalEmail
        }).catch(e => console.error('Failed to send async activation email:', e));

        successCount++;
      } catch (err) {
        errors.push(`Row ${i + 1}: Internal error - ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${successCount} students.`,
      errors: errors
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ success: false, message: 'Failed to process the uploaded file.' });
  }
}
