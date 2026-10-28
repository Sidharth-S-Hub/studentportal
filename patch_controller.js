const fs = require('fs');
let content = fs.readFileSync('backend/controllers/studentController.js', 'utf8');

const bulkFn = fs.readFileSync('bulk_import_fn.js', 'utf8');

// prepend xlsx require if not there
if (!content.includes('const xlsx = require(')) {
    content = 'const xlsx = require("xlsx");\n' + content;
}

// remove const xlsx = require('xlsx'); from bulkFn as it's added at the top
let bulkFnBody = bulkFn.replace("const xlsx = require('xlsx');", "");

content = content.replace('module.exports = {', bulkFnBody + '\nmodule.exports = {\n    bulkImport,');

fs.writeFileSync('backend/controllers/studentController.js', content);
