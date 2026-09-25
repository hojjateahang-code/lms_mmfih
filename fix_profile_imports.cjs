const fs = require('fs');
let content = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf8');

content = content.replace("import { UserProfile } from '../../types';", "import { UserProfile } from '../../types';\nimport { useAuth } from '../../contexts/AuthContext';");
content = content.replace("export default function StudentProfile({ user, onSwitchRole, onSimulateNewUser }: StudentProfileProps) {", "export default function StudentProfile({ user }: StudentProfileProps) {");

fs.writeFileSync('src/pages/student/StudentProfile.tsx', content);
