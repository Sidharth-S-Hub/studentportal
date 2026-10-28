const fs = require('fs');

let content = fs.readFileSync('backend/controllers/studentController.js', 'utf8');

// The exported function I added earlier:
const addedFunc = `exports.deleteMultipleStudents = async (req, res) => {`;
if (content.includes(addedFunc)) {
  content = content.replace('exports.deleteMultipleStudents = async (req, res) => {', 'async function deleteMultipleStudents(req, res) {');
}

// Add it to module.exports
if (!content.includes('deleteMultipleStudents,')) {
  content = content.replace('module.exports = {', 'module.exports = {\n  deleteMultipleStudents,');
}

fs.writeFileSync('backend/controllers/studentController.js', content, 'utf8');
