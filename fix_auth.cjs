const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const fakeUserCode = `
             setRole(localRole);
             setUser({
               id: 'mock-user-123',
               app_metadata: {},
               user_metadata: { full_name: 'کاربر آزمایشی' },
               aud: 'authenticated',
               created_at: new Date().toISOString()
             } as any);
`;

content = content.replace(`             setRole(localRole);\n          }\n        }\n      }\n    }).catch(err => {\n      console.error("Get session failed:", err);\n      setLoading(false);\n      setRole(localStorage.getItem('test_role') || 'student');`, 
`${fakeUserCode}          }\n        }\n      }\n    }).catch(err => {\n      console.error("Get session failed:", err);\n      setLoading(false);\n      const localRole = localStorage.getItem('test_role') || 'student';${fakeUserCode}`);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
