# سامانه مدیریت یادگیری LMS MFIH

سامانه جامع مدیریت آموزش و یادگیری (LMS) شامل مدیریت دوره‌ها، اساتید، دانشجویان، ویدیوها، آزمون‌ها و مالی.

## 🚀 راهنمای سریع اجرا با داکر (Docker Deployment)

برای اجرا روی سرور لینوکس:

```bash
cd /home/mfih/mfih_LMS
git pull origin main
docker compose up -d --build
```

یا استفاده از اسکریپت آپدیت خودکار:

```bash
./update.sh
```

## 🛠 تکنولوژی‌ها
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend & DB**: Node.js, Express, PostgreSQL
- **CI/CD**: GitHub Actions (Automatic SSH Deployment)
