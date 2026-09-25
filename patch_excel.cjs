const fs = require('fs');

let content = fs.readFileSync('src/pages/manager/ManagerFinance.tsx', 'utf8');

const downloadFunc = `  const handleDownloadExcel = () => {
    const csvContent = "ردیف,عنوان تراکنش,نویسنده,مبلغ,نوع\\n" + entries.map((e, i) => \`\${i + 1},\${e.title},\${e.author},\${e.amount},\${e.type}\`).join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "finance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotice('فایل گزارش با موفقیت دانلود شد.');
  };`;

content = content.replace("  const triggerNotice = (msg: string) => {", downloadFunc + "\n\n  const triggerNotice = (msg: string) => {");

content = content.replace("onClick={() => triggerNotice('گزارش اکسل دانلود شد.')}", "onClick={handleDownloadExcel}");

fs.writeFileSync('src/pages/manager/ManagerFinance.tsx', content);
