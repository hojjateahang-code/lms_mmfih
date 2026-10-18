import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const { Pool } = pg;

interface UnifiedDatabase {
  profiles: any[];
  courses: any[];
  chapters: any[];
  lessons: any[];
  enrollments: any[];
  user_progress: any[];
  academic_records: any[];
  attendance_records: any[];
  exams: any[];
  exam_submissions: any[];
  certificates: any[];
  live_sessions: any[];
  transactions: any[];
  question_bank: any[];
  support_tickets: any[];
  favorites: any[];
}

const DEFAULT_DB_DATA: UnifiedDatabase = {
  profiles: [
    {
      id: "usr_current",
      eitaa_id: "H_ahang_ir",
      username: "H_ahang",
      full_name: "حجت‌الله آهنگ",
      phone: "09360354837",
      national_id: "0012345678",
      father_name: "محمد",
      birth_date: "1374/05/12",
      job: "پژوهشگر و دانش‌پژوه",
      education_level: "سطح ۳ حوزه علمیه",
      role: "student",
      wallet_balance: 650000,
      avatar_url: "",
      created_at: new Date().toISOString(),
    },
    {
      id: "admin-999",
      eitaa_id: "admin_eitaa",
      username: "admin",
      full_name: "مدیر کل سامانه",
      phone: "09120000000",
      national_id: "0010000000",
      father_name: "مدیریت",
      birth_date: "1360/01/01",
      job: "مدیریت اجرایی مدرسه",
      education_level: "دکتری / اجتهاد",
      role: "executive_manager",
      wallet_balance: 15000000,
      avatar_url: "",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-inst-1",
      eitaa_id: "ahmadi_prof",
      username: "dr_ahmadi",
      full_name: "دکتر احمدی",
      phone: "09121112233",
      national_id: "0022334455",
      father_name: "رضا",
      birth_date: "1358/03/15",
      job: "استاد دانشگاه و حوزه",
      education_level: "دکتری هوش مصنوعی",
      role: "teacher",
      wallet_balance: 3200000,
      avatar_url: "",
      created_at: new Date().toISOString(),
    },
    {
      id: "usr_2",
      eitaa_id: "shams_qom",
      username: "m_shams",
      full_name: "محمدامین شمس",
      phone: "09129876543",
      national_id: "0381234567",
      father_name: "علی",
      birth_date: "1378/07/20",
      job: "دانشجو",
      education_level: "کارشناسی ارشد",
      role: "student",
      wallet_balance: 120000,
      avatar_url: "",
      created_at: new Date().toISOString(),
    },
    {
      id: "usr_3",
      eitaa_id: "hoseini_edu",
      username: "ali_hoseini",
      full_name: "سید علی حسینی",
      phone: "09351234567",
      national_id: "0457654321",
      father_name: "حسین",
      birth_date: "1376/11/05",
      job: "مدرس",
      education_level: "سطح ۲ حوزه علمیه",
      role: "student",
      wallet_balance: 450000,
      avatar_url: "",
      created_at: new Date().toISOString(),
    },
  ],
  courses: [
    {
      id: 1,
      title: "دوره جامع هوش مصنوعی و پایتون",
      description: "آموزش برنامه‌نویسی پایتون از صفر تا صد همراه با یادگیری ماشین و شبکه‌های عصبی عمیق تحت وب.",
      category: "هوش مصنوعی",
      price: 1850000,
      cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      level: "پیشرفته",
      is_published: true,
      instructor_id: "demo-inst-1",
      instructor_name: "دکتر احمدی",
      rating: 4.9,
      students_count: 142,
      duration: "۲۴ ساعت",
      episodes_count: 12,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "طراحی وب اپلیکیشن با React و TypeScript",
      description: "یادگیری کامل فرانت‌اند مدرن، ریکت، تایپ‌اسکریپت و ساخت پروژه‌های واقعی با استاندارد بالا.",
      category: "برنامه‌نویسی",
      price: 1400000,
      cover_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
      level: "متوسط",
      is_published: true,
      instructor_id: "demo-inst-1",
      instructor_name: "دکتر احمدی",
      rating: 4.8,
      students_count: 98,
      duration: "۱۸ ساعت",
      episodes_count: 9,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "فقه المعاملات و اقتصاد اسلامی نوین",
      description: "بررسی جامع احکام قراردادها، ابزارهای مالی نوین و رمزارزها از منظر فقه پویای اسلامی.",
      category: "فقه و معارف",
      price: 0,
      cover_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80",
      level: "مقدماتی",
      is_published: true,
      instructor_id: "admin-999",
      instructor_name: "استاد موسوی",
      rating: 5.0,
      students_count: 310,
      duration: "۱۵ ساعت",
      episodes_count: 8,
      created_at: new Date().toISOString(),
    },
  ],
  chapters: [
    { id: 101, course_id: 1, title: "فصل اول: مقدمات پایتون و منطق الگوریتم", order_num: 1, created_at: new Date().toISOString() },
    { id: 102, course_id: 1, title: "فصل دوم: کتابخانه‌های NumPy و Pandas", order_num: 2, created_at: new Date().toISOString() },
    { id: 201, course_id: 2, title: "فصل اول: معماری کامپوننت‌ها و هوک‌ها", order_num: 1, created_at: new Date().toISOString() },
    { id: 301, course_id: 3, title: "فصل اول: مبانی عقود و شروط صحت معامله", order_num: 1, created_at: new Date().toISOString() },
  ],
  lessons: [
    {
      id: 1001,
      chapter_id: 101,
      title: "درس ۱: راه‌اندازی محیط و سینتکس پایه",
      type: "video",
      duration: "۱۵:۳۰",
      is_free: true,
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      file_url: "",
      content: "در این جلسه با نصب پایتون و مفسر مربوطه آشنا می‌شویم.",
      order_num: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 1002,
      chapter_id: 101,
      title: "درس ۲: ساختارهای داده و حلقه‌ها",
      type: "video",
      duration: "۲۲:۱۰",
      is_free: false,
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      file_url: "",
      content: "بررسی لیست‌ها، دیکشنری‌ها و کنترل جریان در پایتون.",
      order_num: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 2001,
      chapter_id: 201,
      title: "درس ۱: آشنایی با اکوسیستم React",
      type: "video",
      duration: "۱۸:۴۵",
      is_free: true,
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      file_url: "",
      content: "بررسی JSX، Virtual DOM و مزایای ری‌اکت.",
      order_num: 1,
      created_at: new Date().toISOString(),
    },
  ],
  enrollments: [
    {
      id: 1,
      user_id: "usr_current",
      course_id: 1,
      enrolled_at: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      user_id: "usr_current",
      course_id: 3,
      enrolled_at: new Date().toISOString(),
      status: "active",
    },
  ],
  user_progress: [
    { id: 1, user_id: "usr_current", course_id: 1, lesson_id: 1001, is_completed: true, completed_at: new Date().toISOString() },
  ],
  academic_records: [
    {
      id: 1,
      user_id: "usr_current",
      course_title: "دوره جامع هوش مصنوعی و پایتون",
      term: "پاییز ۱۴۰۴",
      instructor: "دکتر احمدی",
      grade: 19.5,
      max_grade: 20,
      status: "passed",
      certificate_id: "cert_ai_101",
      certificate_code: "CERT-AI-1404-098",
      absence_count: 0,
      max_allowed_absences: 3,
      year: "۱۴۰۴",
      created_at: new Date().toISOString(),
    },
  ],
  attendance_records: [
    {
      id: 1,
      course_id: 1,
      user_id: "usr_current",
      user_name: "حجت‌الله آهنگ",
      session_title: "جلسه اول: آشنایی با مبانی",
      session_date: "۱۴۰۴/۰۷/۱۰",
      status: "present",
      is_auto: true,
      duration_minutes: 90,
      created_at: new Date().toISOString(),
    },
  ],
  exams: [
    {
      id: "exam_c1_midterm",
      course_id: 1,
      title: "آزمون جامع پایان فصل اول هوش مصنوعی",
      description: "این آزمون ترکیبی از سوالات چهارگزینه‌ای مفهومی و سوالات تشریحی تحلیلی می‌باشد.",
      duration_minutes: 25,
      passing_score: 12,
      total_score: 20,
      max_attempts: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "کدام کتابخانه پایتون اساساً برای پردازش آرایه‌های چندبعدی و جبر خطی کاربرد دارد؟",
          options: ["NumPy", "Pandas", "Matplotlib", "Flask"],
          correct_index: 0,
          score: 5,
        },
        {
          id: "q2",
          type: "multiple_choice",
          question: "پدیده بیش‌برازش (Overfitting) چه زمانی در مدل‌های یادگیری ماشین رخ می‌دهد؟",
          options: [
            "زمانی که مدل داده‌های آموزشی را حفظ کند و روی داده‌های تست تعمیم‌پذیری پایینی داشته باشد",
            "زمانی که تعداد داده‌های آموزشی بسیار کم باشد",
            "وقتی نرخ یادگیری بیش از اندازه بالا تنظیم شود",
            "زمانی که دقت مدل در هر دو مرحله تست و آموزش صفر باشد",
          ],
          correct_index: 0,
          score: 5,
        },
        {
          id: "q3",
          type: "descriptive",
          question: "تفاوت یادگیری نظارت‌شده (Supervised Learning) و بدون نظارت (Unsupervised Learning) را با دو مثال کاربردی شرح دهید.",
          sample_answer: "در یادگیری نظارت‌شده داده‌ها همراه با برچسب (Label) هستند مانند تشخیص تصویر گربه از سگ، ولی در بدون نظارت داده‌ها بدون برچسب بوده و مدل الگوها را خوشه‌بندی می‌کند مانند تقسیم‌بندی مشتریان بانک.",
          score: 10,
        },
      ],
    },
  ],
  exam_submissions: [],
  certificates: [
    {
      id: "cert_ai_101",
      user_id: "usr_current",
      course_id: 1,
      student_name: "حجت‌الله آهنگ",
      national_id: "0012345678",
      course_title: "دوره جامع هوش مصنوعی و پایتون",
      instructor_name: "دکتر احمدی",
      final_score: 19.5,
      max_score: 20,
      grade_text: "عالی (A+)",
      issue_date: "۱۴۰۴/۰۷/۱۵",
      verification_code: "CERT-AI-1404-098",
      qr_data: "https://lms.mfih.ir/verify/CERT-AI-1404-098",
      created_at: new Date().toISOString(),
    },
  ],
  live_sessions: [
    {
      id: 1,
      course_id: 1,
      title: "کلاس آنلاین پرسش و پاسخ یادگیری عمیق",
      scheduled_time: "چهارشنبه‌ها ساعت ۱۸:۰۰",
      status: "upcoming",
      room_url: "https://meet.jit.si/LMS_MFIH_Course_1_Room",
      room_type: "internal",
      instructor_name: "دکتر احمدی",
      created_at: new Date().toISOString(),
    },
  ],
  transactions: [
    {
      id: "tx_101",
      title: "شارژ آنلاین کیف پول",
      author: "حجت‌الله آهنگ",
      amount: 500000,
      type: "income",
      category: "شارژ کیف پول",
      status: "completed",
      user_id: "usr_current",
      date: "۱۴۰۴/۰۷/۰۱",
      created_at: new Date().toISOString(),
    },
    {
      id: "tx_102",
      title: "ثبت‌نام دوره جامع هوش مصنوعی",
      author: "حجت‌الله آهنگ",
      amount: 1850000,
      type: "expense",
      category: "خرید دوره",
      status: "completed",
      user_id: "usr_current",
      course_id: 1,
      date: "۱۴۰۴/۰۷/۰۲",
      created_at: new Date().toISOString(),
    },
  ],
  question_bank: [
    {
      id: "qb_1",
      course_id: 1,
      course_title: "دوره جامع هوش مصنوعی و پایتون",
      type: "multiple_choice",
      question: "کدام کتابخانه پایتون اساساً برای پردازش آرایه‌های عددی چندبعدی و جبر خطی کاربرد دارد؟",
      options: ["NumPy", "Pandas", "Matplotlib", "Flask"],
      correct_index: 0,
      difficulty: "easy",
      tag: "پایتون مقدماتی",
      score: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: "qb_2",
      course_id: 1,
      course_title: "دوره جامع هوش مصنوعی و پایتون",
      type: "multiple_choice",
      question: "پدیده بیش‌برازش (Overfitting) چه زمانی در مدل‌های یادگیری ماشین رخ می‌دهد؟",
      options: [
        "زمانی که مدل داده‌های آموزشی را حفظ کند و روی داده‌های تست تعمیم‌پذیری پایینی داشته باشد",
        "زمانی که تعداد داده‌های آموزشی بسیار کم باشد",
        "وقتی نرخ یادگیری بیش از اندازه بالا تنظیم شود",
        "زمانی که دقت مدل در هر دو مرحله تست و آموزش صفر باشد",
      ],
      correct_index: 0,
      difficulty: "medium",
      tag: "مفاهیم یادگیری ماشین",
      score: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: "qb_3",
      course_id: 1,
      course_title: "دوره جامع هوش مصنوعی و پایتون",
      type: "multiple_choice",
      question: "در شبکه عصبی کانولوشنی (CNN)، وظیفه لایه Pooling چیست؟",
      options: [
        "کاهش ابعاد فضایی نقشه ویژگی‌ها و کنترل بیش‌برازش",
        "افزایش تعداد کانال‌های تصویر ورودی",
        "محاسبه مشتق معکوس وزن‌ها",
        "تولید تصاویر تصادفی جهت تقویت داده‌ها",
      ],
      correct_index: 0,
      difficulty: "hard",
      tag: "یادگیری عمیق",
      score: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: "qb_4",
      course_id: 1,
      course_title: "دوره جامع هوش مصنوعی و پایتون",
      type: "descriptive",
      question: "تفاوت یادگیری نظارت‌شده (Supervised Learning) و بدون نظارت (Unsupervised Learning) را با دو مثال کاربردی شرح دهید.",
      sample_answer: "در یادگیری نظارت‌شده داده‌ها برچسب‌دار هستند مانند طبقه‌بندی ایمیل، در حالی که در بدون نظارت داده‌ها بدون برچسب بوده و سیستم خوشه‌بندی انجام می‌دهد.",
      difficulty: "easy",
      tag: "مفاهیم پایه",
      score: 10,
      created_at: new Date().toISOString(),
    },
    {
      id: "qb_5",
      course_id: 1,
      course_title: "دوره جامع هوش مصنوعی و پایتون",
      type: "descriptive",
      question: "نقش تابع فعال‌ساز (Activation Function) غیرخطی نظیر ReLU در لایه‌های پنهان شبکه‌های عصبی عمیق را تحلیل نمایید.",
      sample_answer: "توابع فعال‌ساز غیرخطی امکان مدل‌سازی روابط پیچیده را فراهم کرده و از خطی شدن کل شبکه عصبی جلوگیری می‌کنند.",
      difficulty: "hard",
      tag: "معماری شبکه‌ها",
      score: 10,
      created_at: new Date().toISOString(),
    },
    {
      id: "qb_6",
      course_id: 3,
      course_title: "فقه المعاملات و اقتصاد اسلامی نوین",
      type: "multiple_choice",
      question: "شرط صحت معامله در بیع کالی به کالی از نظر اکثر فقهای امامیه چیست؟",
      options: [
        "باطل است و بیع دین به دین محسوب می‌شود",
        "صحیح است به شرط قبض در مجلس",
        "مکروه است ولی عقد لازم‌الوفا است",
        "منوط به اذن حاکم شرع است",
      ],
      correct_index: 0,
      difficulty: "medium",
      tag: "احکام بیع",
      score: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: "qb_7",
      course_id: 3,
      course_title: "فقه المعاملات و اقتصاد اسلامی نوین",
      type: "descriptive",
      question: "ماهیت فقهی عقود نوین مضاربه و جعاله در خدمات بانکی را تبیین کرده و نقطه افتراق آنها از ربا را شرح دهید.",
      sample_answer: "در عقود اسلامی مانند مضاربه، سود قطعی تضمین نمی‌شود و هر دو طرف در سود و زیان واقعی مشارکت دارند.",
      difficulty: "hard",
      tag: "اقتصاد اسلامی",
      score: 10,
      created_at: new Date().toISOString(),
    },
  ],
  support_tickets: [
    {
      id: "tkt_1",
      user_id: "usr_current",
      user_name: "حجت‌الله آهنگ",
      subject: "درخواست استعلام گواهی دوره هوش مصنوعی",
      category: "آموزش و مدارک",
      status: "answered",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: "msg_1",
          sender_id: "usr_current",
          sender_name: "حجت‌الله آهنگ",
          text: "با سلام و احترام، آزمون دوره را با موفقیت گذراندم. آیا مدرک من ثبت نهایی شده است؟",
          is_admin: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "msg_2",
          sender_id: "admin-999",
          sender_name: "پشتیبانی آموزش",
          text: "سلام دانش‌پژوه گرامی. بله، کارنامه و گواهی الکترونیک شما با کد رهگیری اختصاصی صادر شده و در تب کارنامه‌های پروفایل قابل دانلود است.",
          is_admin: true,
          created_at: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
    },
  ],
  favorites: [
    { user_id: "usr_current", course_id: 1, created_at: new Date().toISOString() },
    { user_id: "usr_current", course_id: 3, created_at: new Date().toISOString() },
  ],
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Setup Storage Path
  const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), "storage");
  try {
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  } catch (e: any) {
    console.warn("Storage directory error:", e.message);
  }

  const dbFilePath = path.join(storagePath, "unified_lms_db.json");

  // Load or Initialize unified persistent store
  let unifiedDb: UnifiedDatabase = JSON.parse(JSON.stringify(DEFAULT_DB_DATA));
  try {
    if (fs.existsSync(dbFilePath)) {
      const fileRaw = fs.readFileSync(dbFilePath, "utf-8");
      const parsed = JSON.parse(fileRaw);
      unifiedDb = {
        profiles: parsed.profiles?.length ? parsed.profiles : DEFAULT_DB_DATA.profiles,
        courses: parsed.courses?.length ? parsed.courses : DEFAULT_DB_DATA.courses,
        chapters: parsed.chapters?.length ? parsed.chapters : DEFAULT_DB_DATA.chapters,
        lessons: parsed.lessons?.length ? parsed.lessons : DEFAULT_DB_DATA.lessons,
        enrollments: parsed.enrollments ?? DEFAULT_DB_DATA.enrollments,
        user_progress: parsed.user_progress ?? DEFAULT_DB_DATA.user_progress,
        academic_records: parsed.academic_records ?? DEFAULT_DB_DATA.academic_records,
        attendance_records: parsed.attendance_records ?? DEFAULT_DB_DATA.attendance_records,
        exams: parsed.exams?.length ? parsed.exams : DEFAULT_DB_DATA.exams,
        exam_submissions: parsed.exam_submissions ?? DEFAULT_DB_DATA.exam_submissions,
        certificates: parsed.certificates ?? DEFAULT_DB_DATA.certificates,
        live_sessions: parsed.live_sessions ?? DEFAULT_DB_DATA.live_sessions,
        transactions: parsed.transactions ?? DEFAULT_DB_DATA.transactions,
        question_bank: parsed.question_bank?.length ? parsed.question_bank : DEFAULT_DB_DATA.question_bank,
        support_tickets: parsed.support_tickets?.length ? parsed.support_tickets : DEFAULT_DB_DATA.support_tickets,
        favorites: parsed.favorites ?? DEFAULT_DB_DATA.favorites,
      };
    } else {
      fs.writeFileSync(dbFilePath, JSON.stringify(unifiedDb, null, 2), "utf-8");
    }
  } catch (err: any) {
    console.warn("Could not read unified_lms_db.json, using default seed:", err.message);
  }

  const saveDb = () => {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(unifiedDb, null, 2), "utf-8");
    } catch (e: any) {
      console.error("Failed to write to unified database file:", e.message);
    }
  };

  // Serve persistent storage files
  app.use("/storage", express.static(storagePath));

  // PostgreSQL Connection Pool
  const dbUrl = process.env.DATABASE_URL || "postgres://lms_user:lms_password_123@postgres:5432/lms_db";
  const pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 2000,
  });

  pool.on("error", (err) => {
    console.warn("PostgreSQL pool background notice:", err.message);
  });

  let isDbConnected = false;

  // Background PG check and schema synchronization
  const initDb = async () => {
    try {
      const client = await pool.connect();
      console.log("Connected to PostgreSQL database successfully.");
      isDbConnected = true;

      await client.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id VARCHAR(255) PRIMARY KEY,
          full_name TEXT NOT NULL,
          username TEXT,
          eitaa_id TEXT,
          phone TEXT,
          national_id TEXT,
          father_name TEXT,
          birth_date TEXT,
          job TEXT,
          education_level TEXT,
          role TEXT DEFAULT 'student',
          wallet_balance NUMERIC DEFAULT 0,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS courses (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          cover_url TEXT,
          price NUMERIC DEFAULT 0,
          category TEXT DEFAULT 'عمومی',
          level TEXT DEFAULT 'متوسط',
          is_published BOOLEAN DEFAULT true,
          instructor_id VARCHAR(255),
          instructor_name TEXT,
          rating NUMERIC DEFAULT 5.0,
          students_count INT DEFAULT 0,
          duration TEXT DEFAULT '۱۰ ساعت',
          episodes_count INT DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS chapters (
          id BIGSERIAL PRIMARY KEY,
          course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          order_num INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS lessons (
          id BIGSERIAL PRIMARY KEY,
          chapter_id BIGINT REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          type TEXT DEFAULT 'video',
          duration TEXT,
          is_free BOOLEAN DEFAULT false,
          video_url TEXT,
          file_url TEXT,
          content TEXT,
          order_num INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS enrollments (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
          enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, course_id)
        );

        CREATE TABLE IF NOT EXISTS user_progress (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
          lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
          is_completed BOOLEAN DEFAULT false,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, lesson_id)
        );

        CREATE TABLE IF NOT EXISTS exams (
          id VARCHAR(255) PRIMARY KEY,
          course_id BIGINT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          duration_minutes INT DEFAULT 20,
          passing_score NUMERIC DEFAULT 12,
          total_score NUMERIC DEFAULT 20,
          max_attempts INT DEFAULT 3,
          questions JSONB DEFAULT '[]'::jsonb,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS exam_submissions (
          id BIGSERIAL PRIMARY KEY,
          exam_id VARCHAR(255) NOT NULL,
          course_id BIGINT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          user_name TEXT,
          answers JSONB DEFAULT '{}'::jsonb,
          score NUMERIC NOT NULL,
          total_score NUMERIC NOT NULL,
          percentage INT NOT NULL,
          status TEXT NOT NULL,
          attempt_number INT DEFAULT 1,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS academic_records (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          course_title TEXT NOT NULL,
          term TEXT NOT NULL,
          instructor TEXT,
          grade NUMERIC NOT NULL,
          max_grade NUMERIC DEFAULT 20,
          status TEXT DEFAULT 'passed',
          certificate_id TEXT,
          certificate_code TEXT,
          absence_count INT DEFAULT 0,
          max_allowed_absences INT DEFAULT 3,
          year TEXT DEFAULT '۱۴۰۴',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS certificates (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          course_id BIGINT NOT NULL,
          student_name TEXT NOT NULL,
          national_id TEXT,
          course_title TEXT NOT NULL,
          instructor_name TEXT,
          final_score NUMERIC NOT NULL,
          max_score NUMERIC DEFAULT 20,
          grade_text TEXT,
          issue_date TEXT NOT NULL,
          verification_code VARCHAR(255) UNIQUE NOT NULL,
          qr_data TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS attendance_records (
          id BIGSERIAL PRIMARY KEY,
          course_id BIGINT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          user_name TEXT,
          session_title TEXT NOT NULL,
          session_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'present',
          is_auto BOOLEAN DEFAULT false,
          duration_minutes INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS live_sessions (
          id BIGSERIAL PRIMARY KEY,
          course_id BIGINT NOT NULL,
          title TEXT NOT NULL,
          scheduled_time TEXT NOT NULL,
          status TEXT DEFAULT 'upcoming',
          room_url TEXT NOT NULL,
          room_type TEXT DEFAULT 'internal',
          instructor_name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(255) PRIMARY KEY,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          amount NUMERIC NOT NULL,
          type TEXT NOT NULL,
          category TEXT,
          status TEXT DEFAULT 'completed',
          user_id VARCHAR(255),
          course_id BIGINT,
          date TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      client.release();
    } catch (e: any) {
      console.warn("PostgreSQL not immediately active, using Unified Persistent Server DB.");
      isDbConnected = false;
    }
  };

  initDb();

  // API Health Route
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      dbConnected: isDbConnected,
      storageActive: true,
      usersCount: unifiedDb.profiles.length,
      coursesCount: unifiedDb.courses.length,
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // AUTHENTICATION & EITAA SDK INTEGRATION
  // ==========================================

  // Eitaa Mini-App Handshake & Real Auto-Login
  app.post("/api/auth/eitaa", async (req, res) => {
    try {
      const { initData, initDataUnsafe, user: clientUser, platform } = req.body;
      const eitaaUser = clientUser || initDataUnsafe?.user;

      if (!eitaaUser || !eitaaUser.id) {
        return res.status(400).json({
          success: false,
          error: "داده‌های کاربر ایتا یافت نشد. این برنامه باید در مینی‌اپ ایتا باز شود.",
        });
      }

      const eitaaIdStr = String(eitaaUser.id);
      const username = eitaaUser.username || `eitaa_${eitaaIdStr}`;
      const fullName = (
        (eitaaUser.first_name || "") + (eitaaUser.last_name ? ` ${eitaaUser.last_name}` : "")
      ).trim() || `کاربر ایتا (${eitaaIdStr})`;

      // Check if user exists in unified database
      let profile = unifiedDb.profiles.find(
        (p) => String(p.eitaa_id) === eitaaIdStr || p.id === `eitaa_${eitaaIdStr}`
      );

      // Check for admin/manager Eitaa ID match
      const isAdmin =
        eitaaIdStr === "admin_eitaa" ||
        username.toLowerCase().includes("admin") ||
        eitaaUser.is_admin;

      if (!profile) {
        // Create new real user profile in database
        profile = {
          id: `eitaa_${eitaaIdStr}`,
          eitaa_id: eitaaIdStr,
          username,
          full_name: fullName,
          role: isAdmin ? "executive_manager" : "student",
          wallet_balance: 500000, // Initial welcome balance
          phone: eitaaUser.phone_number || "",
          national_id: "",
          father_name: "",
          birth_date: "",
          job: "",
          education_level: "",
          avatar_url: eitaaUser.photo_url || "",
          created_at: new Date().toISOString(),
        };
        unifiedDb.profiles.push(profile);
        saveDb();
      } else {
        // Update user's name/username if updated in Eitaa
        if (fullName && fullName !== profile.full_name) {
          profile.full_name = fullName;
        }
        if (username && username !== profile.username) {
          profile.username = username;
        }
        saveDb();
      }

      const token = `eitaa_jwt_${profile.id}_${Date.now()}`;
      return res.json({
        success: true,
        user: profile,
        profile,
        role: profile.role,
        token,
        platform: platform || "eitaa",
      });
    } catch (err: any) {
      console.error("Eitaa auth error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Standard Login (for manager / switch accounts / browser testing)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      const queryName = username || email || "";

      // Special check for executive manager
      if (queryName === "admin" && password === "admin123") {
        let adminUser = unifiedDb.profiles.find((p) => p.role === "executive_manager");
        if (!adminUser) {
          adminUser = DEFAULT_DB_DATA.profiles[1];
          unifiedDb.profiles.push(adminUser);
          saveDb();
        }
        return res.json({
          success: true,
          user: adminUser,
          profile: adminUser,
          role: adminUser.role,
          token: `token_${adminUser.id}`,
        });
      }

      let profile = unifiedDb.profiles.find(
        (p) =>
          p.username?.toLowerCase() === queryName.toLowerCase() ||
          p.eitaa_id === queryName ||
          p.id === queryName
      );

      if (!profile) {
        // If not found, find by role or create
        if (role) {
          profile = unifiedDb.profiles.find((p) => p.role === role);
        }
        if (!profile) {
          profile = {
            id: "usr_" + Date.now(),
            eitaa_id: `user_${Date.now()}`,
            username: queryName || `user_${Date.now()}`,
            full_name: queryName || "کاربر جدید",
            role: role || "student",
            wallet_balance: 500000,
            avatar_url: "",
            created_at: new Date().toISOString(),
          };
          unifiedDb.profiles.push(profile);
          saveDb();
        }
      }

      return res.json({
        success: true,
        user: profile,
        profile,
        role: profile.role,
        token: `token_${profile.id}`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Current session/user check
  app.get("/api/auth/me", (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    const profile = unifiedDb.profiles.find((p) => p.id === userId || p.eitaa_id === userId);
    if (!profile) return res.status(404).json({ error: "User not found" });
    return res.json({ user: profile, profile, role: profile.role });
  });

  // ==========================================
  // USERS MANAGEMENT APIs
  // ==========================================
  app.get("/api/users", (req, res) => {
    return res.json(unifiedDb.profiles);
  });

  app.get("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const user = unifiedDb.profiles.find((p) => p.id === id || p.eitaa_id === id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const index = unifiedDb.profiles.findIndex((p) => p.id === id || p.eitaa_id === id);
    if (index === -1) return res.status(404).json({ error: "User not found" });

    unifiedDb.profiles[index] = {
      ...unifiedDb.profiles[index],
      ...req.body,
    };
    saveDb();
    return res.json(unifiedDb.profiles[index]);
  });

  app.put("/api/users/:id/role", (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const index = unifiedDb.profiles.findIndex((p) => p.id === id || p.eitaa_id === id);
    if (index === -1) return res.status(404).json({ error: "User not found" });

    unifiedDb.profiles[index].role = role;
    saveDb();
    return res.json({ success: true, user: unifiedDb.profiles[index] });
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const initialCount = unifiedDb.profiles.length;
    unifiedDb.profiles = unifiedDb.profiles.filter((p) => p.id !== id && p.eitaa_id !== id);
    
    if (unifiedDb.profiles.length === initialCount) {
      return res.status(404).json({ error: "کاربر یافت نشد" });
    }

    // Cascade delete enrollments, attendance, exam submissions, progress
    unifiedDb.enrollments = unifiedDb.enrollments.filter((e) => e.user_id !== id);
    unifiedDb.attendance_records = unifiedDb.attendance_records.filter((a) => a.user_id !== id);
    unifiedDb.exam_submissions = unifiedDb.exam_submissions.filter((s) => s.user_id !== id);
    unifiedDb.user_progress = unifiedDb.user_progress.filter((p) => p.user_id !== id);
    unifiedDb.academic_records = unifiedDb.academic_records.filter((r) => r.user_id !== id);
    unifiedDb.certificates = unifiedDb.certificates.filter((c) => c.user_id !== id);
    unifiedDb.favorites = unifiedDb.favorites.filter((f) => f.user_id !== id);

    saveDb();
    return res.json({ success: true, message: "کاربر با تمام سوابق با موفقیت حذف گردید." });
  });

  // ==========================================
  // COURSES APIs
  // ==========================================
  app.get("/api/courses", (req, res) => {
    const coursesWithInstructor = unifiedDb.courses.map((c) => {
      const instructorProfile = unifiedDb.profiles.find((p) => p.id === c.instructor_id);
      return {
        ...c,
        instructor: {
          full_name: instructorProfile?.full_name || c.instructor_name || "استاد محترم",
          avatar_url: instructorProfile?.avatar_url || "",
        },
      };
    });
    return res.json(coursesWithInstructor);
  });

  app.get("/api/courses/categories", (req, res) => {
    const catMap: Record<string, number> = {};
    unifiedDb.courses.forEach((c) => {
      const cat = (c.category || "عمومی و معارف").trim();
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const categoryIcons: Record<string, { icon: string; bgColor: string }> = {
      "هوش مصنوعی": { icon: "💻", bgColor: "bg-indigo-100 text-indigo-800" },
      "برنامه‌نویسی": { icon: "⚡", bgColor: "bg-blue-100 text-blue-800" },
      "فقه و معارف": { icon: "⚖️", bgColor: "bg-teal-100 text-teal-800" },
      "علوم حوزوی": { icon: "🕌", bgColor: "bg-emerald-100 text-emerald-800" },
      "انس با قرآن": { icon: "📖", bgColor: "bg-amber-100 text-amber-800" },
      "نهج‌البلاغه": { icon: "📜", bgColor: "bg-blue-100 text-blue-800" },
      "سبک زندگی": { icon: "🌱", bgColor: "bg-rose-100 text-rose-800" },
      "اعتقادی": { icon: "✨", bgColor: "bg-purple-100 text-purple-800" },
    };

    const categories = Object.keys(catMap).map((catName, idx) => {
      const meta = categoryIcons[catName] || { icon: "📚", bgColor: "bg-purple-100 text-purple-800" };
      return {
        id: idx + 1,
        title: catName,
        icon: meta.icon,
        bgColor: meta.bgColor,
        courses_count: catMap[catName],
      };
    });

    return res.json(categories);
  });

  app.get("/api/courses/:id", (req, res) => {
    const id = Number(req.params.id) || req.params.id;
    const course = unifiedDb.courses.find((c) => Number(c.id) === Number(id));
    if (!course) return res.status(404).json({ error: "Course not found" });

    const instructorProfile = unifiedDb.profiles.find((p) => p.id === course.instructor_id);
    return res.json({
      ...course,
      instructor: {
        full_name: instructorProfile?.full_name || course.instructor_name || "استاد محترم",
        avatar_url: instructorProfile?.avatar_url || "",
      },
    });
  });

  app.post("/api/courses", (req, res) => {
    const { title, description, category, price, cover_url, level, is_published, instructor_id, duration } = req.body;
    const newCourse = {
      id: unifiedDb.courses.length > 0 ? Math.max(...unifiedDb.courses.map((c) => Number(c.id) || 0)) + 1 : 1,
      title,
      description: description || "",
      category: category || "عمومی",
      price: Number(price) || 0,
      cover_url: cover_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
      level: level || "متوسط",
      is_published: is_published ?? true,
      instructor_id: instructor_id || "demo-inst-1",
      instructor_name: "مدرس دوره",
      rating: 5.0,
      students_count: 0,
      duration: duration || "۱۰ ساعت",
      episodes_count: 0,
      created_at: new Date().toISOString(),
    };
    unifiedDb.courses.unshift(newCourse);
    saveDb();
    return res.json(newCourse);
  });

  app.put("/api/courses/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = unifiedDb.courses.findIndex((c) => Number(c.id) === id);
    if (index === -1) return res.status(404).json({ error: "Course not found" });

    unifiedDb.courses[index] = { ...unifiedDb.courses[index], ...req.body };
    saveDb();
    return res.json(unifiedDb.courses[index]);
  });

  app.delete("/api/courses/:id", (req, res) => {
    const id = Number(req.params.id);
    unifiedDb.courses = unifiedDb.courses.filter((c) => Number(c.id) !== id);
    unifiedDb.chapters = unifiedDb.chapters.filter((ch) => Number(ch.course_id) !== id);
    unifiedDb.enrollments = unifiedDb.enrollments.filter((e) => Number(e.course_id) !== id);
    saveDb();
    return res.json({ success: true });
  });

  // ==========================================
  // CHAPTERS & LESSONS APIs
  // ==========================================
  app.get("/api/courses/:id/chapters", (req, res) => {
    const courseId = Number(req.params.id);
    const chapters = unifiedDb.chapters
      .filter((ch) => Number(ch.course_id) === courseId)
      .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));

    const result = chapters.map((ch) => {
      const lessons = unifiedDb.lessons
        .filter((l) => Number(l.chapter_id) === Number(ch.id))
        .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
      return {
        ...ch,
        items: lessons,
      };
    });

    return res.json(result);
  });

  app.post("/api/chapters", (req, res) => {
    const { course_id, title, order_num } = req.body;
    const newChapter = {
      id: Date.now(),
      course_id: Number(course_id),
      title,
      order_num: order_num || unifiedDb.chapters.filter((c) => Number(c.course_id) === Number(course_id)).length + 1,
      created_at: new Date().toISOString(),
    };
    unifiedDb.chapters.push(newChapter);
    saveDb();
    return res.json(newChapter);
  });

  app.put("/api/chapters/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = unifiedDb.chapters.findIndex((c) => Number(c.id) === id);
    if (index === -1) return res.status(404).json({ error: "Chapter not found" });

    unifiedDb.chapters[index] = { ...unifiedDb.chapters[index], ...req.body };
    saveDb();
    return res.json(unifiedDb.chapters[index]);
  });

  app.delete("/api/chapters/:id", (req, res) => {
    const id = Number(req.params.id);
    unifiedDb.chapters = unifiedDb.chapters.filter((c) => Number(c.id) !== id);
    unifiedDb.lessons = unifiedDb.lessons.filter((l) => Number(l.chapter_id) !== id);
    saveDb();
    return res.json({ success: true });
  });

  app.post("/api/lessons", (req, res) => {
    const { chapter_id, title, type, duration, is_free, video_url, file_url, content, order_num } = req.body;
    const newLesson = {
      id: Date.now(),
      chapter_id: Number(chapter_id),
      title,
      type: type || "video",
      duration: duration || "۱۰:۰۰",
      is_free: Boolean(is_free),
      video_url: video_url || "",
      file_url: file_url || "",
      content: content || "",
      order_num: order_num || unifiedDb.lessons.filter((l) => Number(l.chapter_id) === Number(chapter_id)).length + 1,
      created_at: new Date().toISOString(),
    };
    unifiedDb.lessons.push(newLesson);
    saveDb();
    return res.json(newLesson);
  });

  app.put("/api/lessons/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = unifiedDb.lessons.findIndex((l) => Number(l.id) === id);
    if (index === -1) return res.status(404).json({ error: "Lesson not found" });

    unifiedDb.lessons[index] = { ...unifiedDb.lessons[index], ...req.body };
    saveDb();
    return res.json(unifiedDb.lessons[index]);
  });

  app.delete("/api/lessons/:id", (req, res) => {
    const id = Number(req.params.id);
    unifiedDb.lessons = unifiedDb.lessons.filter((l) => Number(l.id) !== id);
    saveDb();
    return res.json({ success: true });
  });

  // ==========================================
  // ENROLLMENTS & PROGRESS APIs
  // ==========================================
  app.get("/api/enrollments/user/:userId", (req, res) => {
    const { userId } = req.params;
    const userEnrollments = unifiedDb.enrollments.filter(
      (e) => String(e.user_id) === String(userId)
    );

    const enriched = userEnrollments.map((enrol) => {
      const course = unifiedDb.courses.find((c) => Number(c.id) === Number(enrol.course_id));
      const chapters = unifiedDb.chapters.filter((ch) => Number(ch.course_id) === Number(enrol.course_id));
      const chapterIds = chapters.map((ch) => Number(ch.id));
      const lessons = unifiedDb.lessons.filter((l) => chapterIds.includes(Number(l.chapter_id)));
      const completedCount = unifiedDb.user_progress.filter(
        (p) => String(p.user_id) === String(userId) && Number(p.course_id) === Number(enrol.course_id) && p.is_completed
      ).length;

      const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

      return {
        ...enrol,
        course_id: String(enrol.course_id),
        course: course || {
          id: String(enrol.course_id),
          title: "دوره آموزشی",
          instructor: "مدرس دوره",
          cover_url: "",
          price: 0,
        },
        progress_percentage: progressPercent,
        total_episodes: lessons.length,
        completed_episodes: completedCount,
      };
    });

    return res.json(enriched);
  });

  app.get("/api/enrollments/check", (req, res) => {
    const { userId, courseId } = req.query;
    if (!userId || !courseId) return res.json({ isEnrolled: false });

    const exists = unifiedDb.enrollments.some(
      (e) => String(e.user_id) === String(userId) && Number(e.course_id) === Number(courseId)
    );
    return res.json({ isEnrolled: exists });
  });

  app.post("/api/courses/:id/enroll", (req, res) => {
    const courseId = Number(req.params.id);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "شناسه کاربر الزامی است" });
    }

    const course = unifiedDb.courses.find((c) => Number(c.id) === courseId);
    if (!course) {
      return res.status(404).json({ error: "دوره پیدا نشد" });
    }

    // Check if already enrolled
    const already = unifiedDb.enrollments.find(
      (e) => String(e.user_id) === String(userId) && Number(e.course_id) === courseId
    );
    if (already) {
      return res.json({ success: true, message: "قبلاً ثبت‌نام شده‌اید", enrollment: already });
    }

    // Check price and wallet
    const userIndex = unifiedDb.profiles.findIndex((p) => p.id === userId || p.eitaa_id === userId);
    const userProfile = userIndex !== -1 ? unifiedDb.profiles[userIndex] : null;

    if (course.price > 0 && userProfile) {
      if ((userProfile.wallet_balance || 0) < course.price) {
        return res.status(400).json({
          error: "موجودی کیف پول شما کافی نیست. لطفا ابتدا کیف پول خود را شارژ فرمایید.",
          required: course.price,
          balance: userProfile.wallet_balance || 0,
        });
      }
      userProfile.wallet_balance = (userProfile.wallet_balance || 0) - course.price;
      unifiedDb.profiles[userIndex] = userProfile;

      // Add expense transaction
      unifiedDb.transactions.push({
        id: `tx_${Date.now()}`,
        title: `ثبت‌نام در ${course.title}`,
        author: userProfile.full_name,
        amount: course.price,
        type: "expense",
        category: "خرید دوره",
        status: "completed",
        user_id: userProfile.id,
        course_id: courseId,
        date: new Date().toLocaleDateString("fa-IR"),
        created_at: new Date().toISOString(),
      });
    }

    const newEnrollment = {
      id: Date.now(),
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      status: "active",
    };
    unifiedDb.enrollments.push(newEnrollment);

    // Increase course students_count
    course.students_count = (course.students_count || 0) + 1;

    saveDb();
    return res.json({
      success: true,
      message: "ثبت‌نام در دوره با موفقیت انجام شد",
      enrollment: newEnrollment,
      newBalance: userProfile?.wallet_balance ?? 0,
    });
  });

  app.get("/api/courses/:id/progress", (req, res) => {
    const courseId = Number(req.params.id);
    const { userId } = req.query;
    if (!userId) return res.json([]);

    const prog = unifiedDb.user_progress.filter(
      (p) => String(p.user_id) === String(userId) && Number(p.course_id) === courseId
    );
    return res.json(prog);
  });

  app.post("/api/courses/:id/progress", (req, res) => {
    const courseId = Number(req.params.id);
    const { userId, lessonId, isCompleted } = req.body;

    const existingIndex = unifiedDb.user_progress.findIndex(
      (p) => String(p.user_id) === String(userId) && Number(p.lesson_id) === Number(lessonId)
    );

    if (existingIndex !== -1) {
      unifiedDb.user_progress[existingIndex].is_completed = Boolean(isCompleted);
      unifiedDb.user_progress[existingIndex].completed_at = new Date().toISOString();
    } else {
      unifiedDb.user_progress.push({
        id: Date.now(),
        user_id: userId,
        course_id: courseId,
        lesson_id: Number(lessonId),
        is_completed: Boolean(isCompleted),
        completed_at: new Date().toISOString(),
      });
    }

    saveDb();
    return res.json({ success: true });
  });

  // ==========================================
  // EXAMS & SUBMISSIONS APIs
  // ==========================================
  app.get("/api/courses/:id/exams", (req, res) => {
    const courseId = Number(req.params.id);
    const exams = unifiedDb.exams.filter((e) => Number(e.course_id) === courseId);
    return res.json(exams);
  });

  app.post("/api/exams", (req, res) => {
    const { id, course_id, title, description, duration_minutes, passing_score, total_score, max_attempts, questions, is_active, save_to_question_bank } = req.body;
    const examId = id || `exam_${course_id}_${Date.now()}`;

    const existingIndex = unifiedDb.exams.findIndex((e) => e.id === examId);
    const newExam = {
      id: examId,
      course_id: Number(course_id),
      title: title || "آزمون دوره",
      description: description || "",
      duration_minutes: Number(duration_minutes) || 20,
      passing_score: Number(passing_score) || 12,
      total_score: Number(total_score) || 20,
      max_attempts: max_attempts !== undefined ? Number(max_attempts) : 3,
      questions: Array.isArray(questions) ? questions : [],
      is_active: is_active ?? true,
      created_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      unifiedDb.exams[existingIndex] = newExam;
    } else {
      unifiedDb.exams.unshift(newExam);
    }

    // Save questions into question bank if requested or if questions carry difficulty tags
    if (Array.isArray(questions) && (save_to_question_bank || true)) {
      questions.forEach((q: any) => {
        if (q.question && q.question.trim()) {
          const exists = unifiedDb.question_bank.some(
            (item: any) => item.question.trim().toLowerCase() === q.question.trim().toLowerCase()
          );
          if (!exists) {
            unifiedDb.question_bank.push({
              id: `qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              course_id: Number(course_id),
              course_title: title || "دوره آموزشی",
              type: q.type || "multiple_choice",
              question: q.question.trim(),
              options: q.options || ["", "", "", ""],
              correct_index: Number(q.correct_index) || 0,
              sample_answer: q.sample_answer || "",
              difficulty: q.difficulty || "medium",
              tag: q.tag || "طراحی دستی",
              score: Number(q.score) || 5,
              created_at: new Date().toISOString(),
            });
          }
        }
      });
    }

    saveDb();
    return res.json(newExam);
  });

  app.put("/api/exams/:id", (req, res) => {
    const { id } = req.params;
    const index = unifiedDb.exams.findIndex((e) => e.id === id);
    if (index === -1) return res.status(404).json({ error: "آزمون یافت نشد" });

    unifiedDb.exams[index] = {
      ...unifiedDb.exams[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    // If questions updated, also update/save into question bank
    if (Array.isArray(req.body.questions)) {
      req.body.questions.forEach((q: any) => {
        if (q.question && q.question.trim()) {
          const exists = unifiedDb.question_bank.some(
            (item: any) => item.question.trim().toLowerCase() === q.question.trim().toLowerCase()
          );
          if (!exists) {
            unifiedDb.question_bank.push({
              id: `qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              course_id: Number(unifiedDb.exams[index].course_id),
              course_title: unifiedDb.exams[index].title,
              type: q.type || "multiple_choice",
              question: q.question.trim(),
              options: q.options || ["", "", "", ""],
              correct_index: Number(q.correct_index) || 0,
              sample_answer: q.sample_answer || "",
              difficulty: q.difficulty || "medium",
              tag: q.tag || "طراحی دستی",
              score: Number(q.score) || 5,
              created_at: new Date().toISOString(),
            });
          }
        }
      });
    }

    saveDb();
    return res.json(unifiedDb.exams[index]);
  });

  app.post("/api/exams/:id/duplicate", (req, res) => {
    const { id } = req.params;
    const exam = unifiedDb.exams.find((e) => e.id === id);
    if (!exam) return res.status(404).json({ error: "آزمون یافت نشد" });

    const cloned = {
      ...JSON.parse(JSON.stringify(exam)),
      id: `exam_${exam.course_id}_dup_${Date.now()}`,
      title: `رونوشت از ${exam.title}`,
      created_at: new Date().toISOString(),
    };

    unifiedDb.exams.unshift(cloned);
    saveDb();
    return res.json(cloned);
  });

  app.delete("/api/exams/:id", (req, res) => {
    const { id } = req.params;
    unifiedDb.exams = unifiedDb.exams.filter((e) => e.id !== id);
    saveDb();
    return res.json({ success: true });
  });

  // ==========================================
  // QUESTION BANK APIs
  // ==========================================
  app.get("/api/question-bank", (req, res) => {
    const { course_id, difficulty, type, search } = req.query;
    let list = unifiedDb.question_bank || [];

    if (course_id) {
      list = list.filter((q) => Number(q.course_id) === Number(course_id));
    }
    if (difficulty && difficulty !== "all") {
      list = list.filter((q) => q.difficulty === difficulty);
    }
    if (type && type !== "all") {
      list = list.filter((q) => q.type === type);
    }
    if (search) {
      const s = String(search).toLowerCase();
      list = list.filter(
        (q) => q.question?.toLowerCase().includes(s) || q.tag?.toLowerCase().includes(s)
      );
    }

    return res.json(list);
  });

  app.post("/api/question-bank", (req, res) => {
    const { course_id, course_title, type, question, options, correct_index, sample_answer, difficulty, tag, score } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "متن سوال الزامی است" });
    }

    const newQuestion = {
      id: `qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      course_id: Number(course_id) || 1,
      course_title: course_title || "عمومی",
      type: type || "multiple_choice",
      question: question.trim(),
      options: Array.isArray(options) ? options : ["", "", "", ""],
      correct_index: Number(correct_index) || 0,
      sample_answer: sample_answer || "",
      difficulty: difficulty || "medium",
      tag: tag || "تگ اختصاصی",
      score: Number(score) || 5,
      created_at: new Date().toISOString(),
    };

    unifiedDb.question_bank.unshift(newQuestion);
    saveDb();
    return res.json(newQuestion);
  });

  app.delete("/api/question-bank/:id", (req, res) => {
    const { id } = req.params;
    unifiedDb.question_bank = unifiedDb.question_bank.filter((q) => q.id !== id);
    saveDb();
    return res.json({ success: true });
  });

  app.post("/api/question-bank/auto-generate", (req, res) => {
    const {
      course_id,
      title,
      description,
      duration_minutes,
      passing_score,
      easy_count = 0,
      medium_count = 0,
      hard_count = 0,
      mc_count,
      desc_count,
      random_per_student = false,
    } = req.body;

    const cId = Number(course_id);
    let pool = unifiedDb.question_bank.filter((q) => !cId || Number(q.course_id) === cId);
    if (pool.length === 0) pool = unifiedDb.question_bank; // fallback

    const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

    const easyPool = pool.filter((q) => q.difficulty === "easy");
    const medPool = pool.filter((q) => q.difficulty === "medium");
    const hardPool = pool.filter((q) => q.difficulty === "hard");

    let selectedQuestions: any[] = [
      ...shuffle(easyPool).slice(0, Number(easy_count) || 0),
      ...shuffle(medPool).slice(0, Number(medium_count) || 0),
      ...shuffle(hardPool).slice(0, Number(hard_count) || 0),
    ];

    if (selectedQuestions.length === 0 && (mc_count || desc_count)) {
      const mcPool = pool.filter((q) => q.type === "multiple_choice");
      const descPool = pool.filter((q) => q.type === "descriptive");
      selectedQuestions = [
        ...shuffle(mcPool).slice(0, Number(mc_count) || 0),
        ...shuffle(descPool).slice(0, Number(desc_count) || 0),
      ];
    }

    if (selectedQuestions.length === 0) {
      // Fallback: grab any available from pool up to 4
      selectedQuestions = shuffle(pool).slice(0, 4);
    }

    if (selectedQuestions.length === 0) {
      return res.status(400).json({ error: "بانک سوالات برای این دوره خالی است. ابتدا سوالی تعریف کنید." });
    }

    const totalScore = selectedQuestions.reduce((sum, q) => sum + (Number(q.score) || 5), 0);

    const newExam = {
      id: `exam_${cId}_auto_${Date.now()}`,
      course_id: cId,
      title: title || `آزمون هوشمند استخراجی از بانک سوالات (${new Date().toLocaleDateString("fa-IR")})`,
      description: description || "آزمون طراحی شده به صورت خودکار از بانک سوالات با توازن سطح دشواری.",
      duration_minutes: Number(duration_minutes) || 25,
      passing_score: Number(passing_score) || Math.round(totalScore * 0.6),
      total_score: totalScore,
      max_attempts: 2,
      questions: selectedQuestions,
      is_active: true,
      randomize_options: true,
      random_from_pool: Boolean(random_per_student),
      created_at: new Date().toISOString(),
    };

    unifiedDb.exams.unshift(newExam);
    saveDb();
    return res.json(newExam);
  });

  // Exam Submission & Auto-Grading (MC + Descriptive)
  app.post("/api/exams/:id/submit", (req, res) => {
    const examId = req.params.id;
    const { userId, userName, answers, courseId } = req.body;

    const exam = unifiedDb.exams.find((e) => e.id === examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    // Check attempts
    const userSubmissions = unifiedDb.exam_submissions.filter(
      (s) => s.exam_id === examId && String(s.user_id) === String(userId)
    );
    const maxAllowed = exam.max_attempts || 0;
    if (maxAllowed > 0 && userSubmissions.length >= maxAllowed) {
      return res.status(400).json({
        error: `شما به حداکثر دفعات مجاز شرکت در آزمون (${maxAllowed} بار) رسیده‌اید.`,
      });
    }

    // Auto calculate score
    let score = 0;
    let hasDescriptive = false;

    if (Array.isArray(exam.questions)) {
      exam.questions.forEach((q: any) => {
        const studentAns = answers?.[q.id];
        if (q.type === "descriptive") {
          hasDescriptive = true;
          // Descriptive default partial credit for non-empty answers until teacher review
          if (typeof studentAns === "string" && studentAns.trim().length > 10) {
            score += Number(q.score) * 0.85; // 85% tentative passing credit
          }
        } else {
          // Multiple choice
          if (Number(studentAns) === Number(q.correct_index)) {
            score += Number(q.score);
          }
        }
      });
    }

    const totalScore = exam.total_score || 20;
    const percentage = Math.round((score / totalScore) * 100);
    const isPassed = score >= (exam.passing_score || 12);

    const submission = {
      id: `sub_${Date.now()}`,
      exam_id: examId,
      course_id: Number(courseId || exam.course_id),
      user_id: userId,
      user_name: userName || "دانشجو",
      answers: answers || {},
      score: Math.round(score * 10) / 10,
      total_score: totalScore,
      percentage,
      status: isPassed ? "passed" : "failed",
      attempt_number: userSubmissions.length + 1,
      submitted_at: new Date().toISOString(),
    };

    unifiedDb.exam_submissions.push(submission);

    // If passed, create or update certificate and academic record in unified DB
    if (isPassed) {
      const course = unifiedDb.courses.find((c) => Number(c.id) === Number(submission.course_id));
      const certCode = `CERT-${submission.course_id}-${Date.now().toString().slice(-6)}`;
      
      const newCert = {
        id: `cert_${Date.now()}`,
        user_id: userId,
        course_id: Number(submission.course_id),
        student_name: userName || "دانشجو",
        course_title: course?.title || exam.title,
        instructor_name: course?.instructor_name || "استاد دوره",
        final_score: submission.score,
        max_score: totalScore,
        grade_text: percentage >= 90 ? "عالی (A+)" : percentage >= 75 ? "خیلی خوب (A)" : "قبول (B)",
        issue_date: new Date().toLocaleDateString("fa-IR"),
        verification_code: certCode,
        qr_data: `https://lms.mfih.ir/verify/${certCode}`,
        created_at: new Date().toISOString(),
      };
      unifiedDb.certificates.push(newCert);

      // Also record in academic_records
      unifiedDb.academic_records.push({
        id: Date.now(),
        user_id: userId,
        course_title: course?.title || exam.title,
        term: "پاییز ۱۴۰۴",
        instructor: course?.instructor_name || "استاد دوره",
        grade: submission.score,
        max_grade: totalScore,
        status: "passed",
        certificate_id: newCert.id,
        certificate_code: certCode,
        absence_count: 0,
        max_allowed_absences: 3,
        year: "۱۴۰۴",
        created_at: new Date().toISOString(),
      });
    }

    saveDb();
    return res.json({ success: true, submission, isPassed });
  });

  app.get("/api/submissions/user/:userId", (req, res) => {
    const { userId } = req.params;
    const subs = unifiedDb.exam_submissions.filter((s) => String(s.user_id) === String(userId));
    return res.json(subs);
  });

  app.get("/api/courses/:id/submissions", (req, res) => {
    const courseId = Number(req.params.id);
    const subs = unifiedDb.exam_submissions.filter((s) => Number(s.course_id) === courseId);
    return res.json(subs);
  });

  // ==========================================
  // ACADEMIC RECORDS & CERTIFICATES APIs
  // ==========================================
  app.get("/api/academic-records/user/:userId", (req, res) => {
    const { userId } = req.params;
    const records = unifiedDb.academic_records.filter(
      (r) => String(r.user_id) === String(userId)
    );
    return res.json(records);
  });

  app.post("/api/academic-records", (req, res) => {
    const newRecord = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...req.body,
    };
    unifiedDb.academic_records.push(newRecord);
    saveDb();
    return res.json(newRecord);
  });

  app.get("/api/certificates/user/:userId", (req, res) => {
    const { userId } = req.params;
    const certs = unifiedDb.certificates.filter(
      (c) => String(c.user_id) === String(userId)
    );
    return res.json(certs);
  });

  app.get("/api/certificates/verify/:code", (req, res) => {
    const { code } = req.params;
    const cert = unifiedDb.certificates.find((c) => c.verification_code === code);
    if (!cert) return res.status(404).json({ error: "Certificate not found" });
    return res.json(cert);
  });

  // ==========================================
  // ATTENDANCE APIs (Connected to Real Sessions and Real Enrollments)
  // ==========================================
  app.get("/api/courses/:id/attendance", (req, res) => {
    const courseId = Number(req.params.id);
    const { userId } = req.query;

    let records = unifiedDb.attendance_records.filter((a) => Number(a.course_id) === courseId);
    if (userId) {
      records = records.filter((a) => String(a.user_id) === String(userId));
    }

    // Real enrolled students in this course
    const enrollments = unifiedDb.enrollments.filter((e) => Number(e.course_id) === courseId);
    const enrolledStudents = enrollments.map((e) => {
      const prof = unifiedDb.profiles.find((p) => p.id === e.user_id || p.eitaa_id === e.user_id);
      return {
        userId: e.user_id,
        userName: prof?.full_name || "دانش‌پژوه",
        avatarUrl: prof?.avatar_url || "",
        enrolledAt: e.enrolled_at,
      };
    });

    // Real live/scheduled sessions for this course
    const sessions = unifiedDb.live_sessions.filter((l) => Number(l.course_id) === courseId);

    // Compute real attendance summary per enrolled student
    const summary = enrolledStudents.map((student) => {
      const studentRecords = records.filter((r) => String(r.user_id) === String(student.userId));
      const presentCount = studentRecords.filter((r) => r.status === "present").length;
      const justifiedCount = studentRecords.filter((r) => r.status === "justified").length;
      const tardyCount = studentRecords.filter((r) => r.status === "tardy").length;
      const absentCount = studentRecords.filter((r) => r.status === "absent").length;

      const totalSessionsCount = Math.max(sessions.length, studentRecords.length);
      const isDropped = absentCount > 3;

      return {
        user_id: student.userId,
        user_name: student.userName,
        course_id: courseId,
        total_sessions: totalSessionsCount,
        present_count: presentCount,
        absent_count: absentCount,
        justified_count: justifiedCount,
        tardy_count: tardyCount,
        max_allowed_absences: 3,
        status: isDropped ? "dropped_absence" : absentCount === 3 ? "warning" : "active",
        is_dropped: isDropped,
      };
    });

    return res.json({
      records,
      sessions,
      enrolledStudents,
      summary,
    });
  });

  app.post("/api/courses/:id/attendance", (req, res) => {
    const courseId = Number(req.params.id);
    const { userId, userName, sessionTitle, sessionDate, status, isAuto, durationMinutes, sessionId } = req.body;

    const existingIndex = unifiedDb.attendance_records.findIndex(
      (a) => Number(a.course_id) === courseId && String(a.user_id) === String(userId) && (sessionId ? a.session_id === sessionId : a.session_title === sessionTitle)
    );

    const record = {
      id: existingIndex !== -1 ? unifiedDb.attendance_records[existingIndex].id : Date.now(),
      course_id: courseId,
      session_id: sessionId || null,
      user_id: userId,
      user_name: userName || "دانشجو",
      session_title: sessionTitle || `جلسه ${new Date().toLocaleDateString("fa-IR")}`,
      session_date: sessionDate || new Date().toLocaleDateString("fa-IR"),
      status: status || "present",
      is_auto: Boolean(isAuto),
      duration_minutes: Number(durationMinutes) || 0,
      created_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      unifiedDb.attendance_records[existingIndex] = record;
    } else {
      unifiedDb.attendance_records.push(record);
    }

    saveDb();
    return res.json({ success: true, record });
  });

  // ==========================================
  // WALLET & TRANSACTIONS APIs
  // ==========================================
  app.get("/api/transactions", (req, res) => {
    return res.json(unifiedDb.transactions);
  });

  app.post("/api/wallet/charge", (req, res) => {
    const { userId, amount, title } = req.body;
    const numAmount = Number(amount);

    if (!userId || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "مبلغ یا شناسه کاربر نامعتبر است" });
    }

    const userIndex = unifiedDb.profiles.findIndex((p) => p.id === userId || p.eitaa_id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "کاربر یافت نشد" });
    }

    unifiedDb.profiles[userIndex].wallet_balance = (unifiedDb.profiles[userIndex].wallet_balance || 0) + numAmount;

    const newTx = {
      id: `tx_${Date.now()}`,
      title: title || "افزایش اعتبار کیف پول",
      author: unifiedDb.profiles[userIndex].full_name,
      amount: numAmount,
      type: "income",
      category: "شارژ آنلاین",
      status: "completed",
      user_id: userId,
      date: new Date().toLocaleDateString("fa-IR"),
      created_at: new Date().toISOString(),
    };
    unifiedDb.transactions.push(newTx);
    saveDb();

    return res.json({
      success: true,
      balance: unifiedDb.profiles[userIndex].wallet_balance,
      transaction: newTx,
    });
  });

  app.get("/api/finance/stats", (req, res) => {
    const totalIncome = unifiedDb.transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpense = unifiedDb.transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const activeStudents = unifiedDb.profiles.filter((p) => p.role === "student").length;
    const coursesCount = unifiedDb.courses.length;
    const enrollmentsCount = unifiedDb.enrollments.length;

    return res.json({
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      active_students: activeStudents,
      courses_count: coursesCount,
      enrollments_count: enrollmentsCount,
    });
  });

  // ==========================================
  // ZARINPAL PAYMENT REQUEST API
  // ==========================================
  app.post("/api/payment/request", async (req, res) => {
    try {
      const { amount, description, user_id } = req.body;
      const merchant_id = process.env.ZARINPAL_MERCHANT_ID;

      if (!amount || !user_id) {
        return res.status(400).json({ error: "Amount and user_id are required" });
      }

      const callback_url = `${process.env.APP_URL || "http://localhost:3000"}/payment/verify?user_id=${user_id}&amount=${amount}`;

      if (!merchant_id || merchant_id === "") {
        const mockAuthority = `MOCK_AUTH_${Date.now()}`;
        const redirectUrl = `${callback_url}&Authority=${mockAuthority}&Status=OK`;
        return res.json({ url: redirectUrl, authority: mockAuthority });
      }

      const isSandbox = merchant_id.length < 36;
      const baseUrl = isSandbox
        ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
        : "https://api.zarinpal.com/pg/v4/payment/request.json";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ merchant_id, amount, description: description || "افزایش موجودی کیف پول", callback_url }),
      });

      const data = await response.json();
      if (data.data && data.data.code === 100) {
        const url = isSandbox
          ? `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}`
          : `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`;
        return res.json({ url, authority: data.data.authority });
      } else {
        return res.status(400).json({ error: "Zarinpal request failed", details: data.errors });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==========================================
  // FILE STORAGE & UPLOAD API
  // ==========================================
  const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storagePath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      cb(null, safeName);
    },
  });

  const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "فایلی ارسال نشد" });
    }
    const fileUrl = `/storage/${req.file.filename}`;
    return res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });

  // ==========================================
  // LIVE SESSIONS APIs
  // ==========================================
  app.get("/api/courses/:id/live_sessions", (req, res) => {
    const courseId = Number(req.params.id);
    const sessions = unifiedDb.live_sessions.filter((l) => Number(l.course_id) === courseId);
    return res.json(sessions);
  });

  app.post("/api/courses/:id/live_sessions", (req, res) => {
    const courseId = Number(req.params.id);
    const { title, scheduled_time, status, room_url, room_type, instructor_name } = req.body;

    const roomUrl = room_url || `https://meet.jit.si/LMS_MFIH_Course_${courseId}_${Date.now()}`;
    const newSession = {
      id: Date.now(),
      course_id: courseId,
      title: title || "کلاس آنلاین",
      scheduled_time: scheduled_time || "به زودی",
      status: status || "upcoming",
      room_url: roomUrl,
      room_type: room_type || "internal",
      instructor_name: instructor_name || "مدرس دوره",
      created_at: new Date().toISOString(),
    };

    unifiedDb.live_sessions.push(newSession);
    saveDb();
    return res.json(newSession);
  });

  app.delete("/api/live_sessions/:id", (req, res) => {
    const id = Number(req.params.id);
    unifiedDb.live_sessions = unifiedDb.live_sessions.filter((l) => Number(l.id) !== id);
    saveDb();
    return res.json({ success: true });
  });

  // Start Live Session (by Teacher/Manager)
  app.post("/api/live_sessions/:id/start", (req, res) => {
    const id = Number(req.params.id);
    const session = unifiedDb.live_sessions.find((l) => Number(l.id) === id);
    if (!session) return res.status(404).json({ error: "جلسه یافت نشد" });

    session.status = "live";
    session.started_at = new Date().toISOString();
    saveDb();
    return res.json({ success: true, session });
  });

  // End Live Session
  app.post("/api/live_sessions/:id/end", (req, res) => {
    const id = Number(req.params.id);
    const session = unifiedDb.live_sessions.find((l) => Number(l.id) === id);
    if (!session) return res.status(404).json({ error: "جلسه یافت نشد" });

    session.status = "ended";
    session.ended_at = new Date().toISOString();
    saveDb();
    return res.json({ success: true, session });
  });

  // Student joins live class and automatically records attendance
  app.post("/api/live_sessions/:id/join", (req, res) => {
    const sessionId = Number(req.params.id);
    const { userId, userName } = req.body;

    const session = unifiedDb.live_sessions.find((l) => Number(l.id) === sessionId);
    if (!session) return res.status(404).json({ error: "جلسه یافت نشد" });

    // Check if attendance already recorded for this session and user
    const existing = unifiedDb.attendance_records.find(
      (a) => a.session_id === sessionId && String(a.user_id) === String(userId)
    );

    let attRecord = existing;
    if (!existing && userId) {
      attRecord = {
        id: Date.now(),
        course_id: Number(session.course_id),
        session_id: sessionId,
        user_id: userId,
        user_name: userName || "دانش‌پژوه",
        session_title: session.title,
        session_date: new Date().toLocaleDateString("fa-IR"),
        status: "present",
        is_auto: true,
        duration_minutes: 60,
        created_at: new Date().toISOString(),
      };
      unifiedDb.attendance_records.push(attRecord);
      saveDb();
    }

    return res.json({
      success: true,
      room_url: session.room_url,
      attendanceRecord: attRecord,
    });
  });

  // ==========================================
  // SUPPORT TICKETS APIs
  // ==========================================
  app.get("/api/support/tickets", (req, res) => {
    const { userId } = req.query;
    let list = unifiedDb.support_tickets || [];
    if (userId) {
      list = list.filter((t) => String(t.user_id) === String(userId));
    }
    return res.json(list);
  });

  app.post("/api/support/tickets", (req, res) => {
    const { user_id, user_name, subject, category, message } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "موضوع و متن پیام الزامی است" });
    }

    const ticketId = `tkt_${Date.now()}`;
    const newTicket = {
      id: ticketId,
      user_id: user_id || "usr_current",
      user_name: user_name || "دانش‌پژوه",
      subject: subject.trim(),
      category: category || "عمومی",
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender_id: user_id || "usr_current",
          sender_name: user_name || "دانش‌پژوه",
          text: message.trim(),
          is_admin: false,
          created_at: new Date().toISOString(),
        },
      ],
    };

    unifiedDb.support_tickets.unshift(newTicket);
    saveDb();
    return res.json(newTicket);
  });

  app.post("/api/support/tickets/:id/messages", (req, res) => {
    const { id } = req.params;
    const { sender_id, sender_name, text, is_admin } = req.body;

    const ticket = unifiedDb.support_tickets.find((t) => t.id === id);
    if (!ticket) return res.status(404).json({ error: "تیکت یافت نشد" });

    if (!text?.trim()) return res.status(400).json({ error: "متن پیام الزامی است" });

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender_id: sender_id || (is_admin ? "admin-999" : "usr_current"),
      sender_name: sender_name || (is_admin ? "پشتیبانی پلتفرم" : "کاربر"),
      text: text.trim(),
      is_admin: Boolean(is_admin),
      created_at: new Date().toISOString(),
    };

    ticket.messages.push(newMsg);
    ticket.updated_at = new Date().toISOString();
    ticket.status = is_admin ? "answered" : "open";

    saveDb();
    return res.json({ success: true, message: newMsg, ticket });
  });

  app.put("/api/support/tickets/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = unifiedDb.support_tickets.find((t) => t.id === id);
    if (!ticket) return res.status(404).json({ error: "تیکت یافت نشد" });

    ticket.status = status || "closed";
    ticket.updated_at = new Date().toISOString();
    saveDb();
    return res.json({ success: true, ticket });
  });

  // ==========================================
  // FAVORITES APIs
  // ==========================================
  app.get("/api/users/:userId/favorites", (req, res) => {
    const { userId } = req.params;
    const favs = (unifiedDb.favorites || []).filter((f) => String(f.user_id) === String(userId));
    const courseIds = favs.map((f) => Number(f.course_id));
    return res.json(courseIds);
  });

  app.post("/api/users/:userId/favorites/:courseId", (req, res) => {
    const { userId, courseId } = req.params;
    const cId = Number(courseId);

    const index = (unifiedDb.favorites || []).findIndex(
      (f) => String(f.user_id) === String(userId) && Number(f.course_id) === cId
    );

    let isFavorite = false;
    if (index !== -1) {
      unifiedDb.favorites.splice(index, 1);
      isFavorite = false;
    } else {
      unifiedDb.favorites.push({
        user_id: userId,
        course_id: cId,
        created_at: new Date().toISOString(),
      });
      isFavorite = true;
    }

    saveDb();
    return res.json({ success: true, isFavorite });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Unified LMS Server running on http://localhost:${PORT}`);
  });
}

startServer();
