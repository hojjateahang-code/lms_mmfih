# مرحله اول: نصب وابستگی‌ها و بیلد کردن کدهای فرانت‌اند
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# دریافت متغیرهای محیطی Vite در زمان بیلد (Build Arguments)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# مرحله دوم: آماده‌سازی برای اجرای نهایی و کاهش حجم
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist

# تنظیم متغیرهای محیطی
ENV NODE_ENV=production
ENV PORT=3000

# پورت داخلی داکر
EXPOSE 3000

# اجرای برنامه
CMD ["npm", "start"]