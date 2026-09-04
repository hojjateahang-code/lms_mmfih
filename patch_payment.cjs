const fs = require('fs');

let content = fs.readFileSync('src/pages/student/CourseDetailPage.tsx', 'utf8');

const modalState = `  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);`;

content = content.replace("const [progress, setProgress] = useState<Record<number, boolean>>({}); // lesson_id -> is_completed", 
  "const [progress, setProgress] = useState<Record<number, boolean>>({}); // lesson_id -> is_completed\n" + modalState);

const handleEnrollLogic = `  const handleEnrollClick = async () => {
    if (!user) return alert('لطفا ابتدا وارد سیستم شوید');
    
    if (course.is_free || course.price === 0) {
      const res = await enrollCourse(user.id, parseInt(course.id));
      if (res.success) {
        setEnrolled(true);
        onEnroll(course);
        alert('ثبت‌نام با موفقیت انجام شد!');
      } else {
        alert('خطا در ثبت‌نام: ' + res.error);
      }
    } else {
      setShowPaymentModal(true);
    }
  };

  const processPayment = async () => {
    if (!user) return;
    setPaymentLoading(true);
    
    // Mock processing delay
    setTimeout(async () => {
      // Assuming wallet has enough balance in this mock (since we didn't hook up a full wallet backend yet)
      const res = await enrollCourse(user.id, parseInt(course.id));
      if (res.success) {
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

content = content.replace(/const handleEnrollClick = async \(\) => \{[\s\S]*?\};/g, handleEnrollLogic);

const paymentModal = `      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 text-sm">تایید پرداخت</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"><X size={18} /></button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>مبلغ قابل پرداخت:</span>
                <span className="font-black text-indigo-700">{course.price.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>موجودی کیف پول شما:</span>
                <span className="font-black text-emerald-600">۵۰,۰۰۰ تومان</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed text-center">
              با تایید پرداخت، مبلغ فوق از کیف پول شما کسر شده و بلافاصله به محتوای دوره دسترسی خواهید داشت.
            </p>
            
            <div className="flex gap-2">
              <button
                disabled={paymentLoading}
                onClick={processPayment}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs py-3 rounded-2xl shadow-md flex justify-center items-center gap-2 transition"
              >
                {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {paymentLoading ? 'در حال پردازش...' : 'تایید و پرداخت'}
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace("    </div>\n  );\n}", paymentModal + "\n    </div>\n  );\n}");

// fix the "ثبت‌نام مستقیم با کیف‌پول ایتا" text if it's free
content = content.replace(
  "ثبت‌نام مستقیم با کیف‌پول ایتا",
  "{course.is_free || course.price === 0 ? 'ثبت‌نام رایگان در دوره' : 'ثبت‌نام و پرداخت با کیف پول'}"
);

fs.writeFileSync('src/pages/student/CourseDetailPage.tsx', content);
