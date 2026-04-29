import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, MapPin, GraduationCap, Clock, CheckCircle2, AlertCircle, Trash2, Bell, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type TrainingSession } from './db';
import { toHijri, getDayName, formatHijriDisplay, formatGregorianDisplay } from './utils/dateUtils';
import { useNotifications } from './hooks/useNotifications';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'full_schedule'>('list');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  
  // Update sessions when database changes
  const liveSessions = useLiveQuery(() => db.sessions.toArray()) || [];
  const { sendImmediateNotification } = useNotifications();

  React.useEffect(() => {
    const seedDB = async () => {
      const isSeeded = localStorage.getItem('seeded_v5');
      if (!isSeeded) {
        // Clear old sessions first to ensure clean state
        await db.sessions.clear();

        const defaultData = [
          { gregorianDate: '2026-04-04', schoolName: 'مؤسسة قطر الندى', courseTitle: 'دورة الذكاء الاصطناعي للمعلم', status: 'executed' },
          { gregorianDate: '2026-04-11', schoolName: 'المعهد الوطني', courseTitle: 'دورة الذكاء الاصطناعي للمعلم', status: 'executed' },
          { gregorianDate: '2026-04-21', schoolName: 'عبر قوقل ميت', courseTitle: 'دورة الذكاء الاصطناعي للمعلم', status: 'executed' },
          { gregorianDate: '2026-04-25', schoolName: 'الرائد النموذجية', courseTitle: 'دورة الذكاء الاصطناعي للإداريين', status: 'executed' },
          { gregorianDate: '2026-05-27', schoolName: 'مدارس مجد اليمن', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-28', schoolName: 'مدارس مجد اليمن', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-29', schoolName: 'مدارس مجد اليمن', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-02', schoolName: 'مدارس جيل الرسالة', courseTitle: 'عرض برنامج رفيقك', status: 'not_executed' },
          { gregorianDate: '2026-05-03', schoolName: 'مدارس مجد اليمن', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-04', schoolName: 'مدارس مجد اليمن', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-05', schoolName: 'مدارس مجد اليمن', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-09', schoolName: 'مدارس نماء', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-10', schoolName: 'مدارس نماء', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-11', schoolName: 'مدارس نماء', courseTitle: 'دورة الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-05-12', schoolName: 'مدارس الأقصى', courseTitle: 'دورة الذكاء الاصطناعي للبراعم', status: 'not_executed' },
          { gregorianDate: '2026-05-18', schoolName: 'مدارس الأقصى', courseTitle: 'دورة لمعلمي اللغة العربية', status: 'not_executed' },
          { gregorianDate: '2026-06-07', schoolName: 'المتميزين', courseTitle: 'الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-06-08', schoolName: 'المتميزين', courseTitle: 'الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-06-13', schoolName: 'علا المجد', courseTitle: 'الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-06-14', schoolName: 'علا المجد', courseTitle: 'الذكاء الاصطناعي', status: 'not_executed' },
          { gregorianDate: '2026-06-15', schoolName: 'علا المجد', courseTitle: 'الذكاء الاصطناعي', status: 'not_executed' },
        ];

        for (const item of defaultData) {
           await db.sessions.add({
             ...item,
             status: item.status as 'executed' | 'in_progress' | 'not_executed',
             hijriDate: toHijri(item.gregorianDate),
             dayOfWeek: getDayName(item.gregorianDate),
             reminderTime: new Date(new Date(item.gregorianDate).getTime() - 24 * 60 * 60 * 1000).toISOString()
           });
        }
        localStorage.setItem('seeded_v5', 'true');
      }
    };
    seedDB();
  }, []);

  const sortedSessions = [...liveSessions].sort((a, b) => 
    new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime()
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-sans flex text-slate-800 rtl" dir="rtl">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white z-40 px-4 py-3 border-b border-slate-200 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-bold border-r-4 border-blue-500 pr-3 leading-none h-5 flex items-center text-slate-900">
          منصة المدرب الذكي
        </h1>
        <button 
          onClick={() => sendImmediateNotification('اختبار التنبيهات', 'تم تفعيل نظام التنبيهات بنجاح')}
          className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-500 rounded-lg transition-all"
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <aside className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white z-50 lg:hidden flex shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-slate-800 pb-safe">
        <nav className="flex justify-around items-center w-full p-2">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
               "flex flex-col items-center gap-1.5 p-2 rounded-lg flex-1 transition-colors",
               activeTab === 'list' ? "text-blue-400 bg-slate-800/50" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-bold">سجل الدورات</span>
          </button>
          <button 
            onClick={() => setActiveTab('full_schedule')}
            className={cn(
               "flex flex-col items-center gap-1.5 p-2 rounded-lg flex-1 transition-colors",
               activeTab === 'full_schedule' ? "text-blue-400 bg-slate-800/50" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold">الجدول الشامل</span>
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={cn(
               "flex flex-col items-center gap-1.5 p-2 rounded-lg flex-1 transition-colors",
               activeTab === 'add' ? "text-blue-400 bg-slate-800/50" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-bold">جدولة دورة</span>
          </button>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 right-0 w-72 h-full bg-slate-900 text-white p-6 flex-col z-50 shadow-xl border-l border-slate-800 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <h1 className="text-xl font-bold border-r-4 border-blue-500 pr-3 leading-none h-6 flex items-center overflow-hidden whitespace-nowrap">
            منصة المدرب الذكي
          </h1>
        </div>
        
        <nav className="flex flex-col gap-3 flex-none">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border whitespace-nowrap",
              activeTab === 'list' 
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30" 
                : "text-slate-400 border-transparent hover:bg-slate-800"
            )}
          >
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">الجدول التدريبي</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('full_schedule')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border whitespace-nowrap",
              activeTab === 'full_schedule' 
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30" 
                : "text-slate-400 border-transparent hover:bg-slate-800"
            )}
          >
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">الجدول الشامل</span>
          </button>

          <button 
            onClick={() => setActiveTab('add')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border whitespace-nowrap",
              activeTab === 'add' 
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30" 
                : "text-slate-400 border-transparent hover:bg-slate-800"
            )}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">جدولة دورة</span>
          </button>
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="bg-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase text-slate-500 font-bold">حالة النظام</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> أوفلاين
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">جميع البيانات محفوظة محلياً لضمان السرعة والخصوصية.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-grow lg:mr-72 p-4 lg:p-10 transition-all min-h-[100dvh] flex flex-col pt-24 lg:pt-10 pb-24 lg:pb-10 w-full overflow-x-hidden min-w-0"
      )}>
        <header className="hidden lg:flex justify-between items-end mb-10 w-full">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">
              {activeTab === 'list' ? 'سجل الدورات' : activeTab === 'full_schedule' ? 'الجدول الزمني الشامل' : 'جدولة دورة جديدة'}
            </h2>
            <p className="text-slate-500 text-sm">
              {activeTab === 'list' 
                ? `لديك ${liveSessions.length} دورة تدريبية مجدولة حالياً` 
                : activeTab === 'full_schedule' 
                ? 'عرض تفصيلي لجميع الأيام مع تلوين الجمع والعطلات'
                : 'أدخل البيانات وسيتم تحويل التاريخ وتدقيق التوافر تلقائياً'}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-left hidden md:block">
                <p className="text-[10px] text-slate-400 uppercase font-bold">تاريخ اليوم</p>
                <p className="font-mono font-bold text-slate-700">{formatGregorianDisplay(new Date())} م | {toHijri(new Date().toISOString().split('T')[0])}هـ</p>
             </div>
             <button 
               onClick={() => sendImmediateNotification('اختبار التنبيهات', 'تم تفعيل نظام التنبيهات بنجاح')}
               className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 rounded-xl transition-all shadow-sm"
             >
               <Bell className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Announcement Ticker Section (Moved below header area) */}
        <UpcomingTicker sessions={liveSessions} />

        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow w-full"
            >
              {sortedSessions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Calendar className="text-slate-300 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد دورات مبرمجة</h3>
                  <p className="text-slate-500 max-w-sm mb-8">ابدأ بتنظيم جدولك التدريبي عبر إضافة أول دورة لك الآن.</p>
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    إضافة دورتك الأولى
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
                  {sortedSessions.map((session, index) => (
                    <SessionCard key={session.id || index} session={session} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'full_schedule' ? (
             <motion.div
              key="full_schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow w-full"
            >
               <FullScheduleTable sessions={liveSessions} />
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto w-full"
            >
              <AddSessionForm onComplete={() => setActiveTab('list')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Floating Scroll Action Buttons */}
        <div className="fixed bottom-24 lg:bottom-10 left-4 lg:left-10 flex flex-col gap-3 z-50">
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              document.getElementById('table-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-12 h-12 bg-white text-blue-600 border border-blue-100 shadow-[0_4px_20px_rgba(37,99,235,0.15)] rounded-full flex items-center justify-center hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all text-xl"
            title="الانتقال للأعلى"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <button 
            onClick={() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              const tableContainer = document.getElementById('table-scroll-container');
              if (tableContainer) tableContainer.scrollTo({ top: tableContainer.scrollHeight, behavior: 'smooth' });
            }}
            className="w-12 h-12 bg-white text-blue-600 border border-blue-100 shadow-[0_4px_20px_rgba(37,99,235,0.15)] rounded-full flex items-center justify-center hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all text-xl"
            title="الانتقال للأسفل"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>
      </main>
    </div>
  );
}

const SessionCard: React.FC<{ session: TrainingSession }> = ({ session }) => {
  const handleDelete = async () => {
    if (confirm('هل أنت متأكد من حذف هذه الدورة من السجل؟')) {
      await db.sessions.delete(session.id!);
    }
  };

  const updateStatus = async (status: TrainingSession['status']) => {
    await db.sessions.update(session.id!, { status });
  };

  const statusMap = {
    executed: { label: 'تم التنفيذ', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    in_progress: { label: 'قيد التنفيذ', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    not_executed: { label: 'لم تنفذ بعد', color: 'bg-slate-100 text-slate-600 border-slate-200' }
  };

  return (
    <motion.div 
      layout
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold border", statusMap[session.status].color)}>
          {statusMap[session.status].label}
        </span>
        <button onClick={handleDelete} className="text-slate-300 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight break-words">{session.courseTitle}</h3>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium break-words min-w-0">{session.schoolName}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold break-words">{formatGregorianDisplay(session.gregorianDate)} م ({session.dayOfWeek})</span>
              <span className="text-[10px] text-slate-400 font-bold">{session.hijriDate}هـ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-100">
        <button
          onClick={() => updateStatus('executed')}
          className={cn(
            "py-2 rounded-lg text-[10px] font-bold transition-all border",
            session.status === 'executed' ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
          )}
        >
          منفذة
        </button>
        <button
          onClick={() => updateStatus('in_progress')}
          className={cn(
            "py-2 rounded-lg text-[10px] font-bold transition-all border",
            session.status === 'in_progress' ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
          )}
        >
          جارية
        </button>
        <button
          onClick={() => updateStatus('not_executed')}
          className={cn(
            "py-2 rounded-lg text-[10px] font-bold transition-all border",
            session.status === 'not_executed' ? "bg-slate-600 border-slate-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
          )}
        >
          مؤجلة
        </button>
      </div>
    </motion.div>
  );
};

function UpcomingTicker({ sessions }: { sessions: TrainingSession[] }) {
  const now = new Date();
  
  const upcoming = sessions.filter(s => {
    const diff = new Date(s.gregorianDate).getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= -1 && days <= 2; // Today, tomorrow, or day after
  });

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-8 w-full bg-blue-600 text-white h-11 flex items-center overflow-hidden border-b border-blue-400 shadow-md rounded-2xl">
      <div className="bg-blue-700 px-4 h-full flex items-center z-10 shadow-lg border-l border-blue-500 font-bold text-[10px] whitespace-nowrap">
        تنبيهات مجدولة
      </div>
      <div className="whitespace-nowrap animate-marquee flex items-center gap-16 leading-none text-sm font-bold">
        {upcoming.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-200" />
            <span>دورة قادمة: {s.courseTitle} في {s.schoolName} - يوم {s.dayOfWeek} بتاريخ {formatGregorianDisplay(s.gregorianDate)} م</span>
          </div>
        ))}
        {/* Duplicate for seamless marquee if few items */}
        {upcoming.length < 3 && upcoming.map((s, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-200" />
            <span>دورة قادمة: {s.courseTitle} في {s.schoolName} - يوم {s.dayOfWeek} بتاريخ {formatGregorianDisplay(s.gregorianDate)} م</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

function FullScheduleTable({ sessions }: { sessions: TrainingSession[] }) {
  const [search, setSearch] = useState('');
  
  const generateDates = () => {
    const dates = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 12, 1);
    
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const allDates = generateDates();
  const sessionMap = new Map(sessions.map(s => [s.gregorianDate, s]));

  const filteredDates = allDates.filter(date => {
    const gStr = date.toISOString().split('T')[0];
    const session = sessionMap.get(gStr);
    const hDate = toHijri(gStr);
    const day = getDayName(gStr);
    
    const searchLower = search.toLowerCase();
    if (!searchLower) return true;

    const statusMapAr: Record<string, string> = {
      'executed': 'منفذة',
      'in_progress': 'جارية',
      'not_executed': 'مؤجلة'
    };

    const statusAr = session ? statusMapAr[session.status] || '' : '';

    return (
      gStr.includes(searchLower) ||
      hDate.includes(searchLower) ||
      day.includes(searchLower) ||
      (session && (
        session.courseTitle.toLowerCase().includes(searchLower) ||
        session.schoolName.toLowerCase().includes(searchLower) ||
        statusAr.includes(searchLower)
      ))
    );
  });

  return (
    <div className="flex flex-col flex-grow bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[50vh] sm:min-h-[600px] w-full">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="ابحث عن مدرسة، دورة، تاريخ، أو حالة..."
            className="w-full p-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const el = document.getElementById(`row-${today}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="text-[10px] font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            الانتقال لليوم
          </button>
          <p className="text-[10px] text-slate-500 font-bold bg-white px-3 py-2 rounded-lg border border-slate-200 whitespace-nowrap">
            النتائج: {filteredDates.length}
          </p>
        </div>
      </div>

      <div id="table-scroll-container" className="overflow-auto w-full no-scrollbar flex-grow bg-slate-50/20">
        <table className="w-full text-right border-collapse table-auto">
          <thead className="sticky top-0 bg-slate-900 text-white z-10 shadow-sm text-[10px] sm:text-xs">
            <tr>
              <th className="py-3 px-4 sm:py-4 sm:px-6 font-bold uppercase border-l border-slate-700 whitespace-nowrap w-24">اليوم والتاريخ</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 font-bold uppercase border-l border-slate-700 min-w-[120px]">المدرسة</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 font-bold uppercase border-l border-slate-700 min-w-[150px]">الدورة التدريبية</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 font-bold uppercase w-20 sm:w-28">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDates.map((date) => {
              const gStr = date.toISOString().split('T')[0];
              const session = sessionMap.get(gStr);
              const isFriday = date.getDay() === 5;
              const isLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() === date.getDate();
              
              const rowClass = cn(
                "transition-colors group",
                isFriday ? "bg-yellow-50/80" : "",
                isLastDay && !isFriday ? "bg-orange-50/80" : "",
                !isFriday && !isLastDay ? "bg-white hover:bg-slate-50" : "hover:brightness-95"
              );

              const hijriDate = toHijri(gStr);

              return (
                <tr key={gStr} id={`row-${gStr}`} className={rowClass}>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 border-l border-slate-100 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded w-fit",
                        isFriday ? "bg-yellow-200 text-amber-900 shadow-sm" : "text-slate-500 bg-slate-100"
                      )}>
                        {getDayName(gStr)}
                      </span>
                      <div className="text-xs font-black text-slate-800 mt-0.5">{hijriDate}هـ</div>
                      <div className="text-[9px] text-slate-400 font-bold tracking-tight">{formatGregorianDisplay(date)} م</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 border-l border-slate-100">
                    <div className="text-xs sm:text-sm font-medium text-slate-600 line-clamp-2">
                      {session ? session.schoolName : <span className="text-slate-200">---</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6 border-l border-slate-100">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2">
                      {session ? session.courseTitle : <span className="text-slate-200 font-normal italic opacity-50">---</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 sm:py-4 sm:px-6">
                    {session && (
                       <button 
                         onClick={async (e) => {
                           e.stopPropagation();
                           const nextStatus: Record<TrainingSession['status'], TrainingSession['status']> = {
                             'not_executed': 'in_progress',
                             'in_progress': 'executed',
                             'executed': 'not_executed'
                           };
                           await db.sessions.update(session.id!, { status: nextStatus[session.status] });
                         }}
                         className={cn(
                           "text-[9px] sm:text-[10px] font-extrabold px-1.5 py-1 sm:py-1.5 rounded-lg border block text-center w-full cursor-pointer hover:scale-105 transition-all shadow-sm",
                           session.status === 'executed' ? "bg-emerald-600 text-white border-emerald-500" :
                           session.status === 'in_progress' ? "bg-amber-500 text-white border-amber-400" :
                           "bg-slate-600 text-white border-slate-500"
                         )}
                         title="اضغط لتغيير الحالة"
                       >
                          {session.status === 'executed' ? 'منفذة' : session.status === 'in_progress' ? 'جارية' : 'مؤجلة'}
                       </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddSessionForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    schoolName: '',
    courseTitle: '',
    gregorianDate: '',
    hijriDate: '',
    dayOfWeek: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gDate = e.target.value;
    if (!gDate) return;

    const hDate = toHijri(gDate);
    const day = getDayName(gDate);

    setFormData({
      ...formData,
      gregorianDate: gDate,
      hijriDate: hDate,
      dayOfWeek: day
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.schoolName || !formData.courseTitle || !formData.gregorianDate) {
      setError('يرجى التأكد من تعبئة كافة الحقول الأساسية');
      return;
    }

    const existing = await db.sessions.where('gregorianDate').equals(formData.gregorianDate).first();
    if (existing) {
      setError('خطأ: هذا اليوم محجوز مسبقاً لدورة أخرى. يرجى اختيار تاريخ مختلف.');
      return;
    }

    try {
      await db.sessions.add({
        ...formData,
        status: 'not_executed',
        reminderTime: new Date(new Date(formData.gregorianDate).getTime() - 24 * 60 * 60 * 1000).toISOString()
      });
      onComplete();
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء الحفظ. يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 pr-1">التاريخ الميلادي</label>
            <input 
              type="date"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
              value={formData.gregorianDate}
              onChange={handleDateChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 pr-1">التاريخ الهجري (تلقائي)</label>
            <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 font-bold text-sm h-[46px] flex items-center">
              {formData.hijriDate ? `${formatHijriDisplay(formData.hijriDate)}هـ` : '---'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 pr-1">اليوم</label>
            <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 font-bold text-sm h-[46px] flex items-center">
              {formData.dayOfWeek || '---'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 pr-1">اسم المدرسة</label>
            <input 
              type="text"
              required
              placeholder="مثال: مدارس الرياض الأهلية"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 pr-1">عنوان الدورة التدريبية</label>
            <input 
              type="text"
              required
              placeholder="مثال: استراتيجيات الإدارة المدرسية"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              value={formData.courseTitle}
              onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-bold">{error}</span>
          </motion.div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            type="submit"
            className="flex-grow bg-slate-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>إضافة إلى الجدولة</span>
          </button>
          <button 
            type="button"
            onClick={onComplete}
            className="px-8 bg-slate-100 text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
          >
            رجوع
          </button>
        </div>
      </form>
    </div>
  );
}

