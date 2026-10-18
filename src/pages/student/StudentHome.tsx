// src/pages/student/StudentHome.tsx
import React, { useEffect, useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  User, 
  Star, 
  BookOpen, 
  Clock, 
  Flame, 
  Award, 
  Loader2, 
  Heart,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { CourseData, getPublishedCourses } from '../../services/courseService';
import { getCourseCategories, getUserFavorites, toggleCourseFavorite } from '../../services/lmsService';
import { Course, Category } from '../../types';

interface StudentHomeProps {
  onSelectCourse?: (course: Course) => void;
  user?: any;
}

export default function StudentHome({ onSelectCourse, user }: StudentHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'favorites'>('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, [user?.id]);

  const loadHomeData = async () => {
    setLoading(true);
    const [coursesRes, catsRes, favsRes] = await Promise.all([
      getPublishedCourses(),
      getCourseCategories(),
      user?.id ? getUserFavorites(user.id) : Promise.resolve([])
    ]);

    if (coursesRes.success && coursesRes.data) {
      const mapped = coursesRes.data.map((c: CourseData) => ({
        id: c.id.toString(),
        title: c.title,
        instructor: c.instructor?.full_name || 'استاد محترم',
        category_id: 1,
        category_name: c.category || 'عمومی و معارف',
        price: c.price,
        original_price: c.price,
        is_new: true,
        rating: 5.0,
        students_count: c.students_count || 0,
        episodes_count: 0,
        duration: c.duration || '۱۲ ساعت',
        level: c.level || 'عمومی',
        description: c.description,
        banner_url: c.cover_url || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop',
        is_free: c.price === 0
      }));
      setCourses(mapped);

      // If backend returned categories, use them; otherwise extract from courses
      if (catsRes && catsRes.length > 0) {
        setCategories(catsRes);
      } else {
        const catMap: Record<string, number> = {};
        mapped.forEach((c: any) => {
          const cat = c.category_name;
          catMap[cat] = (catMap[cat] || 0) + 1;
        });

        const generatedCats: Category[] = Object.keys(catMap).map((name, idx) => ({
          id: idx + 1,
          title: name,
          icon: idx === 0 ? '🕌' : idx === 1 ? '💻' : idx === 2 ? '⚖️' : idx === 3 ? '📖' : '🌱',
          bgColor: idx === 0 ? 'bg-indigo-100 text-indigo-800' : idx === 1 ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800',
          courses_count: catMap[name]
        }));
        setCategories(generatedCats);
      }
    }

    setFavoriteIds(favsRes || []);
    setLoading(false);
  };

  const handleToggleFav = async (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    const isFav = favoriteIds.includes(courseId);
    if (isFav) {
      setFavoriteIds(favoriteIds.filter(id => id !== courseId));
    } else {
      setFavoriteIds([...favoriteIds, courseId]);
    }

    await toggleCourseFavorite(user.id, courseId);
  };

  // Filter courses by category, search query, and favorites tab
  const filteredCourses = courses.filter(c => {
    const cId = Number(c.id);
    if (activeFilterTab === 'favorites' && !favoriteIds.includes(cId)) {
      return false;
    }

    const matchesCategory = selectedCategoryTitle === null || c.category_name === selectedCategoryTitle;
    const matchesSearch = !searchQuery || 
      c.title.includes(searchQuery) || 
      c.instructor.includes(searchQuery) || 
      c.category_name.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans dir-rtl" dir="rtl">
      {/* Header & Search */}
      <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-xs mb-4 border-b border-slate-100 sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-200">
              ح
            </div>
            <div>
              <h1 className="font-black text-indigo-950 text-base leading-snug">مدرسه مجازی امام حسین (ع)</h1>
              <p className="text-[10px] text-slate-500 font-semibold">تحت اشراف مدرسه عالی فقه و اصول</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700">
              <span>{user.full_name || 'دانش‌پژوه'}</span>
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در دوره‌ها، اساتید و دروس..."
            className="w-full bg-slate-100 text-sm text-slate-800 placeholder-slate-400 rounded-2xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
          />
          <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter View Selector: All vs Favorites */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              activeFilterTab === 'all' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            همه دوره‌ها ({courses.length})
          </button>
          <button
            onClick={() => setActiveFilterTab('favorites')}
            className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeFilterTab === 'favorites' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart size={14} className={favoriteIds.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
            علاقه‌مندی‌های من ({favoriteIds.length})
          </button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Hero Banner */}
        {activeFilterTab === 'all' && (
          <div className="w-full h-44 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl shadow-xl shadow-indigo-100 text-white p-5 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute -right-10 -top-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-200 mb-2 border border-white/20">
                <Flame size={12} className="text-amber-300 animate-pulse" /> ثبت‌نام ترم جدید علوم حوزوی
              </div>
              <h2 className="font-black text-xl leading-snug drop-shadow-sm">دوره جامع علوم حوزوی و معارف اهل‌بیت (ع)</h2>
              <p className="text-xs text-indigo-100 font-medium mt-1">با اعطای مدرک معتبر از مدرسه عالی فقه و اصول</p>
            </div>

            <div className="relative z-10 flex justify-between items-center mt-2">
              <button
                onClick={() => {
                  const target = courses[0];
                  if (onSelectCourse && target) onSelectCourse(target);
                }}
                className="bg-white text-indigo-950 font-black text-xs px-4 py-2 rounded-2xl shadow-md hover:bg-amber-300 hover:text-indigo-950 transition-all flex items-center gap-1 active:scale-95"
              >
                مشاهده جزئیات <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] text-indigo-200 font-medium bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-xl">
                ثبت‌نام آسان با ایتا
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Connected Categories */}
        <section>
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span>دسته‌بندی‌های دوره‌ها</span>
            </h2>
            {selectedCategoryTitle !== null && (
              <button
                onClick={() => setSelectedCategoryTitle(null)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                نمایش همه ({courses.length})
              </button>
            )}
          </div>

          <div className="flex overflow-x-auto hide-scrollbar space-x-3 space-x-reverse pb-2 pt-1">
            <button
              onClick={() => setSelectedCategoryTitle(null)}
              className={`flex flex-col items-center flex-shrink-0 w-20 transition-transform active:scale-95 ${
                selectedCategoryTitle === null ? 'scale-105' : ''
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-1.5 transition-all ${
                selectedCategoryTitle === null
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}>
                🌐
              </div>
              <span className={`text-[11px] font-bold text-center ${selectedCategoryTitle === null ? 'text-indigo-600' : 'text-slate-600'}`}>
                همه ({courses.length})
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryTitle === cat.title;
              return (
                <button
                  key={cat.id || cat.title}
                  onClick={() => setSelectedCategoryTitle(isSelected ? null : cat.title)}
                  className={`flex flex-col items-center flex-shrink-0 w-24 transition-transform active:scale-95 ${
                    isSelected ? 'scale-105' : ''
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-1.5 transition-all ${cat.bgColor || 'bg-indigo-50 text-indigo-700'} ${
                    isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 font-bold shadow-md' : 'border border-slate-100'
                  }`}>
                    {cat.icon || '📚'}
                  </div>
                  <span className={`text-[11px] font-bold text-center truncate w-full ${isSelected ? 'text-indigo-600 font-black' : 'text-slate-600'}`}>
                    {cat.title}
                  </span>
                  {cat.courses_count !== undefined && (
                    <span className="text-[9px] text-slate-400 font-mono">
                      {cat.courses_count} دوره
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Courses Display */}
        <section>
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span>
                {activeFilterTab === 'favorites' ? 'دوره‌های مورد علاقه شما' : 
                 selectedCategoryTitle ? `دوره‌های بخش ${selectedCategoryTitle}` : 'تمام دوره‌های آموزشی'}
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              {filteredCourses.length} دوره
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-3xl border border-slate-100 p-6 space-y-3">
              <Heart size={36} className="mx-auto text-slate-300" />
              <h4 className="font-bold text-sm text-slate-700">
                {activeFilterTab === 'favorites' 
                  ? 'هنوز دوره‌ای به علاقه‌مندی‌ها اضافه نشده است.'
                  : 'دوره‌ای مطابق با این دسته‌بندی یافت نشد.'}
              </h4>
              <p className="text-xs text-slate-400">
                {activeFilterTab === 'favorites'
                  ? 'می‌توانید با کلیک بر روی آیکون قلب در گوشه هر دوره، آن را برای دسترسی سریع ذخیره نمایید.'
                  : 'لطفاً سایر دسته‌بندی‌ها را انتخاب فرمایید.'}
              </p>
              {activeFilterTab === 'favorites' && (
                <button
                  onClick={() => setActiveFilterTab('all')}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1 shadow-md"
                >
                  مشاهده همه دوره‌ها
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredCourses.map((course) => {
                const isFav = favoriteIds.includes(Number(course.id));

                return (
                  <div
                    key={course.id}
                    onClick={() => onSelectCourse?.(course)}
                    className="bg-white rounded-3xl p-3 shadow-xs hover:shadow-md border border-slate-100 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-32 bg-slate-200 rounded-2xl mb-2.5 relative overflow-hidden">
                        <img
                          src={course.banner_url || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Favorite Button on Card */}
                        <button
                          onClick={(e) => handleToggleFav(Number(course.id), e)}
                          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 active:scale-95 transition cursor-pointer"
                          title={isFav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                        >
                          <Heart
                            size={16}
                            className={isFav ? "fill-rose-500 text-rose-500" : "text-white"}
                          />
                        </button>

                        {course.is_free && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                            رایگان
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-indigo-600 font-bold mb-1">
                        {course.category_name}
                      </div>

                      <h3 className="font-bold text-slate-800 text-xs mb-2 line-clamp-2 leading-relaxed h-8">
                        {course.title}
                      </h3>

                      <div className="flex items-center text-[10px] text-slate-500 mb-2">
                        <User size={12} className="ml-1 text-indigo-500" />
                        <span className="truncate">{course.instructor}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-400 stroke-amber-400" />
                        <span>{course.rating}</span>
                      </div>
                      <div>
                        {course.is_free ? (
                          <span className="text-emerald-600 font-black text-xs">رایگان</span>
                        ) : (
                          <span className="text-indigo-600 font-black text-xs">
                            {course.price.toLocaleString('fa-IR')} <span className="text-[9px] font-normal text-slate-500">تومان</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
