const fs = require('fs');
let content = fs.readFileSync('src/pages/student/WalletScreen.tsx', 'utf8');

const mockCharge = `  const handleAddFunds = async () => {
    const num = parseInt(chargeAmount);
    if (!isNaN(num) && num > 0) {
      setIsCharging(true);
      // Simulate API call
      setTimeout(() => {
        setBalance(balance + num);
        setIsCharging(false);
        setShowChargeModal(false);
        setChargeAmount('');
        triggerNotice(\`کیف پول شما با موفقیت \${num.toLocaleString('fa-IR')} تومان شارژ شد.\`);
      }, 1500);
    }
  };`;

content = content.replace(/const handleAddFunds = async \(\) => \{[\s\S]*?\};/g, mockCharge);

fs.writeFileSync('src/pages/student/WalletScreen.tsx', content);
