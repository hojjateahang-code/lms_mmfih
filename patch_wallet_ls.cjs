const fs = require('fs');
let content = fs.readFileSync('src/pages/student/WalletScreen.tsx', 'utf8');

content = content.replace("const [balance, setBalance] = useState(50000);", 
  "const [balance, setBalance] = useState(() => parseInt(localStorage.getItem('mock_wallet_balance') || '50000'));");

content = content.replace("setBalance(balance + num);", 
  "const newBalance = balance + num;\n        setBalance(newBalance);\n        localStorage.setItem('mock_wallet_balance', newBalance.toString());");

fs.writeFileSync('src/pages/student/WalletScreen.tsx', content);
