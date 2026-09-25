const fs = require('fs');

let content = fs.readFileSync('src/pages/student/CourseDetailPage.tsx', 'utf8');

const processPayment = `  const processPayment = async () => {
    if (!user) return;
    const currentBalance = parseInt(localStorage.getItem('mock_wallet_balance') || '50000');
    if (currentBalance < course.price) {
      alert('موجودی کیف پول شما کافی نیست. لطفا ابتدا کیف پول خود را شارژ کنید.');
      return;
    }
    
    setPaymentLoading(true);
    setTimeout(async () => {
      const res = await enrollCourse(user.id, parseInt(course.id));
      if (res.success) {
        localStorage.setItem('mock_wallet_balance', (currentBalance - course.price).toString());
        setEnrolled(true);
        onEnroll(course);
        setShowPaymentModal(false);
        alert('پرداخت موفقیت‌آمیز بود. شما به دوره اضافه شدید.');
      } else {
        alert('خطا در ثبت‌نام: ' + res.error);
      }
      setPaymentLoading(false);
    }, 1500);
  };`;

content = content.replace(/const processPayment = async \(\) => \{[\s\S]*?\};/g, processPayment);

// replace hardcoded 50,000 in payment modal
content = content.replace(
  '<span className="font-black text-emerald-600">۵۰,۰۰۰ تومان</span>',
  '<span className="font-black text-emerald-600">{(parseInt(localStorage.getItem(\'mock_wallet_balance\') || \'50000\')).toLocaleString(\'fa-IR\')} تومان</span>'
);

fs.writeFileSync('src/pages/student/CourseDetailPage.tsx', content);
