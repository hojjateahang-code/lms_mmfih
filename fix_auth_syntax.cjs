const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
content = content.replace(/          \}\n          \}\n        \}\n      \}\n    \}\)\.catch/g, '          }\n        }\n      }\n    }).catch');
fs.writeFileSync('src/contexts/AuthContext.tsx', content);
