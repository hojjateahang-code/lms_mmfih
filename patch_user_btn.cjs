const fs = require('fs');
let content = fs.readFileSync('src/pages/manager/ManagerUsersPage.tsx', 'utf8');
content = content.replace("<button className=", "<button onClick={() => alert('امکان افزودن کاربر دستی وجود ندارد. کاربران به صورت خودکار از طریق ورود با ایتا (OAuth) به سیستم اضافه می‌شوند.')} className=");
fs.writeFileSync('src/pages/manager/ManagerUsersPage.tsx', content);
