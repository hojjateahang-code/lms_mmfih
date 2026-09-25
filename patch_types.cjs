const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace('education_level?: string;', 'education_level?: string;\n  father_name?: string;\n  birth_date?: string;\n  job?: string;');

fs.writeFileSync('src/types.ts', content);
