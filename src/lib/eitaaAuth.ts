// src/lib/eitaaAuth.ts

export const initAndAutoLogin = async (
  supabase: any,
  onSuccess: (user: any, role: string) => void
) => {
  if (typeof window === "undefined") return;
  const win = window as any;
  const eitaa = win.Eitaa?.WebApp || win.Telegram?.WebApp;

  if (eitaa) {
    if (typeof eitaa.ready === 'function') eitaa.ready();
    if (typeof eitaa.expand === 'function') eitaa.expand();
    if (typeof eitaa.setHeaderColor === 'function') eitaa.setHeaderColor("#ffffff");
    if (typeof eitaa.setBackgroundColor === 'function') eitaa.setBackgroundColor("#f8fafc");

    const eitaaUser = eitaa.initDataUnsafe?.user;
    
    if (eitaaUser) {
      // بررسی در دیتابیس (آیا کاربر از قبل وجود دارد؟)
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('eitaa_id', eitaaUser.id.toString())
        .single();

      if (existingUser) {
        // ورود موفق کاربر قدیمی
        onSuccess(existingUser, existingUser.role);
        return;
      } else {
        // ساخت خودکار کاربر جدید (بدون پرسش از کاربر)
        const newUser = {
          eitaa_id: eitaaUser.id.toString(),
          username: eitaaUser.username || `user_${eitaaUser.id}`,
          full_name: (eitaaUser.first_name || '') + (eitaaUser.last_name ? ` ${eitaaUser.last_name}` : ''),
          role: 'student', // پیشفرض دانشپژوه
          wallet_balance: 0,
        };
        
        const { data: createdUser } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
          
        onSuccess(createdUser, 'student');
        return;
      }
    }
  }

  // Fallback for regular browser environment testing if no Eitaa WebApp API present
  const { data: defaultUser } = await supabase
    .from('users')
    .select('*')
    .eq('eitaa_id', '1001')
    .single();

  if (defaultUser) {
    onSuccess(defaultUser, defaultUser.role || 'student');
  }
};
