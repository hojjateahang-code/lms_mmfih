import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Supabase fallback client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // PostgreSQL Connection Pool
  const dbUrl = process.env.DATABASE_URL || "postgres://lms_user:lms_password_123@postgres:5432/lms_db";
  const pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 3000,
  });

  // Handle background pool errors cleanly without crashing process
  pool.on("error", (err) => {
    console.warn("PostgreSQL pool background notification:", err.message);
  });

  let isDbConnected = false;

  // Initialize DB asynchronously without blocking server start
  const initDb = async () => {
    let retries = 3;
    while (retries > 0) {
      try {
        const client = await pool.connect();
        console.log("Connected to PostgreSQL database successfully.");

        await client.query(`
          CREATE TABLE IF NOT EXISTS profiles (
            id VARCHAR(255) PRIMARY KEY,
            full_name TEXT NOT NULL,
            avatar_url TEXT,
            role TEXT DEFAULT 'student',
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
            lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
            is_completed BOOLEAN DEFAULT false,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, lesson_id)
          );
        `);

        // Check if initial courses exist
        const courseCheck = await client.query("SELECT COUNT(*) FROM courses");
        if (parseInt(courseCheck.rows[0].count, 10) === 0) {
          console.log("Seeding initial default courses...");
          await client.query(`
            INSERT INTO courses (title, description, category, price, cover_url, level, is_published, instructor_id)
            VALUES 
            ('دوره جامع هوش مصنوعی و پایتون', 'آموزش برنامه‌نویسی پایتون از صفر تا صد همراه با یادگیری ماشین و شبکه‌های عصبی عمیق.', 'هوش مصنوعی', 1850000, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80', 'پیشرفته', true, 'demo-inst-1'),
            ('طراحی وب اپلیکیشن با React و TypeScript', 'یادگیری کامل فرانت‌اند مدرن، ریکت، تایپ‌اسکریپت و ساخت پروژه‌های واقعی.', 'برنامه‌نویسی', 1400000, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80', 'متوسط', true, 'demo-inst-2'),
            ('مدیریت استراتژیک کسب‌وکار و بازاریابی دیجیتال', 'راهکارهای رشد سریع کسب‌وکار، تحلیل بازار و کمپین‌های دیجیتال مارکتینگ موفق.', 'مدیریت', 2100000, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80', 'مقدماتی', true, 'demo-inst-3');
          `);
        }

        client.release();
        isDbConnected = true;
        break;
      } catch (err: any) {
        retries--;
        if (retries === 0) {
          console.warn("PostgreSQL not available, running in preview/fallback mode.");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  };

  initDb();

  // API Health Route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", dbConnected: isDbConnected, timestamp: new Date().toISOString() });
  });

  // --- Auth APIs ---
  app.post("/api/auth/login", async (req, res) => {
    const { email, role } = req.body;
    try {
      const id = "usr_" + Buffer.from(email || "user").toString("hex").slice(0, 12);
      const name = (email || "کاربر").split("@")[0];
      const userRole = role || "student";

      if (isDbConnected) {
        await pool.query(
          `INSERT INTO profiles (id, full_name, avatar_url, role)
           VALUES ($1, $2, '', $3)
           ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role`,
          [id, name, userRole]
        );
      }

      return res.json({
        user: { id, email },
        profile: { id, full_name: name, avatar_url: "", role: userRole, created_at: new Date().toISOString() },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { email, fullName, role } = req.body;
    try {
      const id = "usr_" + Date.now();
      const userRole = role || "student";
      const name = fullName || email.split("@")[0];

      if (isDbConnected) {
        await pool.query(
          `INSERT INTO profiles (id, full_name, avatar_url, role) VALUES ($1, $2, '', $3)`,
          [id, name, userRole]
        );
      }

      return res.json({
        user: { id, email },
        profile: { id, full_name: name, avatar_url: "", role: userRole, created_at: new Date().toISOString() },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- Courses APIs ---
  app.get("/api/courses", async (req, res) => {
    try {
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });
      const result = await pool.query(`
        SELECT c.*, json_build_object('full_name', COALESCE(p.full_name, 'استاد محترم'), 'avatar_url', COALESCE(p.avatar_url, '')) as instructor
        FROM courses c
        LEFT JOIN profiles p ON c.instructor_id = p.id
        ORDER BY c.created_at DESC
      `);
      return res.json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });
      const result = await pool.query(
        `
        SELECT c.*, json_build_object('full_name', COALESCE(p.full_name, 'استاد محترم'), 'avatar_url', COALESCE(p.avatar_url, '')) as instructor
        FROM courses c
        LEFT JOIN profiles p ON c.instructor_id = p.id
        WHERE c.id = $1
      `,
        [id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });
      return res.json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const { title, description, category, price, cover_url, level, is_published, instructor_id } = req.body;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });
      const result = await pool.query(
        `
        INSERT INTO courses (title, description, category, price, cover_url, level, is_published, instructor_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
        [title, description, category || "عمومی", price || 0, cover_url || "", level || "متوسط", is_published ?? true, instructor_id || "demo-inst-1"]
      );
      return res.json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });
      await pool.query("DELETE FROM courses WHERE id = $1", [id]);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- Chapters & Lessons APIs ---
  app.get("/api/courses/:id/chapters", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });

      const chaptersRes = await pool.query(
        "SELECT * FROM chapters WHERE course_id = $1 ORDER BY order_num ASC, id ASC",
        [id]
      );
      const chapters = chaptersRes.rows;

      if (chapters.length === 0) return res.json([]);

      const chapterIds = chapters.map((c) => c.id);
      const lessonsRes = await pool.query(
        "SELECT * FROM lessons WHERE chapter_id = ANY($1) ORDER BY order_num ASC, id ASC",
        [chapterIds]
      );
      const lessons = lessonsRes.rows;

      const result = chapters.map((ch) => ({
        ...ch,
        items: lessons.filter((l) => Number(l.chapter_id) === Number(ch.id)),
      }));

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/chapters", async (req, res) => {
    try {
      const { course_id, title, order_num } = req.body;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });

      const result = await pool.query(
        "INSERT INTO chapters (course_id, title, order_num) VALUES ($1, $2, $3) RETURNING *",
        [course_id, title, order_num || 0]
      );
      return res.json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/chapters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });

      const result = await pool.query(
        "UPDATE chapters SET title = $1 WHERE id = $2 RETURNING *",
        [title, id]
      );
      return res.json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });

      await pool.query("DELETE FROM chapters WHERE id = $1", [id]);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      const { chapter_id, title, type, duration, is_free, video_url, file_url, content, order_num } = req.body;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });

      const result = await pool.query(
        `INSERT INTO lessons (chapter_id, title, type, duration, is_free, video_url, file_url, content, order_num)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [chapter_id, title, type || "video", duration || "", is_free || false, video_url || "", file_url || "", content || "", order_num || 0]
      );
      return res.json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/lessons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, type, duration, is_free, video_url, file_url, content } = req.body;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });

      const result = await pool.query(
        `UPDATE lessons SET title = $1, type = $2, duration = $3, is_free = $4, video_url = $5, file_url = $6, content = $7
         WHERE id = $8 RETURNING *`,
        [title, type, duration, is_free, video_url, file_url, content, id]
      );
      return res.json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/lessons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isDbConnected) return res.status(503).json({ error: "Database initializing" });

      await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- ZARINPAL PAYMENT API ---
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
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ merchant_id, amount, description: description || "افزایش موجودی کیف پول", callback_url })
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
