const fs = require('fs');
let content = fs.readFileSync('backend/routes/studentRoutes.js', 'utf8');

const newRoute = "const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });\nrouter.post('/bulk-import', verifyAdmin, memoryUpload.single('file'), studentController.bulkImport);\nrouter.delete('/bulk', verifyAdmin, studentController.deleteMultipleStudents);";

content = content.replace("router.delete('/bulk', verifyAdmin, studentController.deleteMultipleStudents);", newRoute);

fs.writeFileSync('backend/routes/studentRoutes.js', content);
