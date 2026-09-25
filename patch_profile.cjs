const fs = require('fs');
let content = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf8');

// 1. Remove onSwitchRole prop interface
content = content.replace(/interface StudentProfileProps \{[\s\S]*?\}/, 'interface StudentProfileProps {\n  user?: any;\n}');

// 2. Remove from function signature
content = content.replace(/export default function StudentProfile\(\{ user, onSwitchRole \}: StudentProfileProps\) \{/, 'export default function StudentProfile({ user }: StudentProfileProps) {');

// 3. Add useAuth and states
const imports = `import { useAuth } from '../../contexts/AuthContext';\nimport { ChevronRight } from 'lucide-react';`;
content = content.replace(/import \{.*?\} from 'lucide-react';/, (match) => match + '\n' + imports);

const states = `  const { loginManager, logout, role } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [editFormData, setEditFormData] = useState({
    full_name: user?.user_metadata?.full_name || user?.full_name || '',
    national_id: user?.national_id || '',
    father_name: user?.father_name || '',
    phone: user?.phone || '',
    eitaa_id: user?.eitaa_id || '',
    birth_date: user?.birth_date || '',
    job: user?.job || '',
    education_level: user?.education_level || ''
  });`;

content = content.replace('  const [showWallet, setShowWallet] = useState(false);', states + '\n  const [showWallet, setShowWallet] = useState(false);');

// 4. Remove the role switcher button
const roleSwitcherBtn = /{onSwitchRole && \([\s\S]*?<\/div>\s*\)}/g;
content = content.replace(roleSwitcherBtn, '');

// 5. Add custom Edit Form inside the modal
const formContent = `{activeModal === 'edit' && (
            <div className="space-y-4">
              <h3 className="font-black text-sm text-slate-800">ویرایش اطلاعات کاربری</h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1 py-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی</label>
                  <input type="text" value={editFormData.full_name} onChange={e => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی</label>
                  <input type="text" value={editFormData.national_id} onChange={e => setEditFormData({...editFormData, national_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام پدر</label>
                  <input type="text" value={editFormData.father_name} onChange={e => setEditFormData({...editFormData, father_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره تلفن همراه</label>
                  <input type="tel" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره مجازی ایتا</label>
                  <input type="text" value={editFormData.eitaa_id} onChange={e => setEditFormData({...editFormData, eitaa_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ تولد</label>
                  <input type="text" placeholder="مثال: ۱۳۷۵/۰۴/۱۲" value={editFormData.birth_date} onChange={e => setEditFormData({...editFormData, birth_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شغل</label>
                  <input type="text" value={editFormData.job} onChange={e => setEditFormData({...editFormData, job: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تحصیلات</label>
                  <input type="text" value={editFormData.education_level} onChange={e => setEditFormData({...editFormData, education_level: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                   // Mock save
                   const mockUser = JSON.parse(localStorage.getItem('test_user') || '{}');
                   localStorage.setItem('test_user', JSON.stringify({ ...mockUser, ...editFormData, user_metadata: { full_name: editFormData.full_name } }));
                   alert('اطلاعات با موفقیت ذخیره شد.');
                   setActiveModal(null);
                   window.location.reload();
                }} className="flex-1 bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl">ذخیره اطلاعات</button>
                <button onClick={() => setActiveModal(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl">انصراف</button>
              </div>
            </div>
          )}`;

content = content.replace(
  /<h3 className="font-black text-sm text-slate-800">[\s\S]*?متوجه شدم\s*<\/button>/,
  (match) => {
    return formContent + `\n          {activeModal !== 'edit' && (\n            <>\n              ` + match + `\n            </>\n          )}`;
  }
);

// Add Logout / Login buttons to bottom of profile
const authBtns = `
        <div className="pt-2 border-t border-slate-100 mt-4">
          {role === 'executive_manager' ? (
            <button onClick={logout} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition">
              خروج از حساب مدیریت
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="w-full bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition border border-slate-200">
              ورود با نام کاربری (ویژه مدیران)
            </button>
          )}
        </div>
`;

content = content.replace(/<\/div>\s*\{\/\* Generic Info Modal/, authBtns + '\n      </div>\n      {/* Generic Info Modal');

// Add Login Modal
const loginModal = `
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-lg text-slate-800 mb-2">ورود به حساب کاربری</h3>
            <p className="text-xs text-slate-500 mb-6">این بخش ویژه مدیران و اساتید سامانه می‌باشد.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام کاربری</label>
                <input type="text" dir="ltr" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رمز عبور</label>
                <input type="password" dir="ltr" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={async () => {
                try {
                  await loginManager(loginUsername, loginPassword);
                } catch (err: any) {
                  alert(err.message);
                }
              }} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg transition">ورود به سامانه</button>
              <button onClick={() => setShowLoginModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm py-3 rounded-xl transition">انصراف</button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/<\/div>\s*\);\s*\}\s*\/\/ کامپوننت داخلی/, loginModal + '\n    </div>\n  );\n}\n\n// کامپوننت داخلی');

fs.writeFileSync('src/pages/student/StudentProfile.tsx', content);
