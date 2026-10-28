const fs = require('fs');

let content = fs.readFileSync('backend/controllers/studentController.js', 'utf8');

const newMethod = `
exports.deleteMultipleStudents = async (req, res) => {
	try {
		const { studentIds } = req.body;
		if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
			return res.status(400).json({ success: false, message: 'No students provided for deletion.' });
		}
		
		// Ensure array of integers to prevent SQL injection
		const ids = studentIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
		if (ids.length === 0) {
			return res.status(400).json({ success: false, message: 'Invalid student IDs.' });
		}
		
		const placeholders = ids.map((_, i) => '$' + (i + 1)).join(',');
		
		// Delete students. Note: Assuming cascading deletes are setup in DB for related tables
		// or we can just delete from students table if there's CASCADE. If not CASCADE, we might need to delete related data.
		// For now, let's just delete the students.
		await db.query(\`DELETE FROM students WHERE id IN (\${placeholders})\`, ids);
		
		res.json({ success: true, message: \`\${ids.length} student(s) deleted successfully.\` });
	} catch (error) {
		console.error('Error in deleteMultipleStudents:', error);
		res.status(500).json({ success: false, message: 'Internal server error while deleting students.' });
	}
};
`;

if (!content.includes('deleteMultipleStudents')) {
  content = content + '\n' + newMethod;
  fs.writeFileSync('backend/controllers/studentController.js', content, 'utf8');
}
