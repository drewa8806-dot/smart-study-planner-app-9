import { StudySession, Exam } from '../types';

interface StudyScheduleProps {
  sessions: StudySession[];
  exams: Exam[];
  onToggleComplete: (id: string) => void;
}

function StudySchedule({ sessions, exams, onToggleComplete }: StudyScheduleProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: StudySession[] } = {};
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const dateKey = sessionDate.toLocaleDateString('ar-EG');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    return grouped;
  };

  const groupedSessions = groupSessionsByDate();
  const dates = Object.keys(groupedSessions).sort((a, b) => {
    const dateA = new Date(groupedSessions[a][0].date);
    const dateB = new Date(groupedSessions[b][0].date);
    return dateA.getTime() - dateB.getTime();
  });

  const getExamForSession = (examId: string) => {
    return exams.find(e => e.id === examId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getDateLabel = (dateStr: string) => {
    const sessionDate = new Date(groupedSessions[dateStr][0].date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '📍 اليوم';
    if (diffDays === 1) return '📅 غداً';
    if (diffDays === -1) return '🕐 أمس';
    
    return sessionDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getDayIntensity = (sessions: StudySession[]) => {
    if (!sessions.length) return null;
    const firstSession = sessions[0];
    return firstSession.intensity || 'medium';
  };

  const getIntensityInfo = (intensity: string) => {
    switch (intensity) {
      case 'high':
        return { emoji: '🔥', label: 'يوم مكثف', color: 'from-red-500 to-orange-500', bgColor: 'from-red-50 to-orange-50' };
      case 'medium':
        return { emoji: '⚡', label: 'يوم عادي', color: 'from-blue-500 to-purple-500', bgColor: 'from-blue-50 to-purple-50' };
      case 'light':
        return { emoji: '🌱', label: 'يوم خفيف', color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50' };
      case 'rest':
        return { emoji: '😌', label: 'يوم راحة', color: 'from-teal-500 to-cyan-500', bgColor: 'from-teal-50 to-cyan-50' };
      default:
        return { emoji: '📚', label: 'يوم عادي', color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' };
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">لا يوجد جدول مذاكرة حتى الآن</h3>
        <p className="text-gray-500">أضف امتحاناتك من قسم "الامتحانات" لإنشاء جدول تلقائي</p>
      </div>
    );
  }

  const completedSessions = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;
  const completionPercentage = Math.round((completedSessions / totalSessions) * 100);
  
  // إحصائيات إضافية
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const completedStudyMinutes = sessions.filter(s => s.completed).reduce((acc, s) => acc + s.duration, 0);
  const totalStudyHours = Math.floor(totalStudyMinutes / 60);
  const highIntensitySessions = sessions.filter(s => s.intensity === 'high').length;
  const restDays = sessions.filter(s => s.intensity === 'rest').length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">📅 جدول المذاكرة الذكي</h2>
        
        {/* Main Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-4 border-2 border-purple-200">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-5xl font-bold text-purple-600">{completedSessions}</div>
            <div className="text-2xl text-gray-400">/</div>
            <div className="text-5xl font-bold text-gray-600">{totalSessions}</div>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-3">جلسة مكتملة 🎯</div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">{completionPercentage}% مكتمل</div>
        </div>

        {/* Smart Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-200">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-2xl font-bold text-orange-700">{totalStudyHours}</div>
            <div className="text-xs text-gray-600">ساعة مذاكرة</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-200">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-red-700">{highIntensitySessions}</div>
            <div className="text-xs text-gray-600">يوم مكثف</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-2xl mb-1">😌</div>
            <div className="text-2xl font-bold text-green-700">{restDays}</div>
            <div className="text-xs text-gray-600">يوم راحة</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-blue-700">{Math.round(completedStudyMinutes / 60)}</div>
            <div className="text-xs text-gray-600">ساعة منجزة</div>
          </div>
        </div>
      </div>

      {/* Sessions by Date */}
      <div className="space-y-6">
        {dates.map(dateKey => {
          const daySessions = groupedSessions[dateKey];
          const intensity = getDayIntensity(daySessions) || 'medium';
          const intensityInfo = getIntensityInfo(intensity);
          
          return (
          <div key={dateKey} className={`bg-gradient-to-r ${intensityInfo.bgColor} rounded-xl p-6 border-2 border-opacity-30`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {getDateLabel(dateKey)}
              </h3>
              <div className={`px-4 py-2 bg-gradient-to-r ${intensityInfo.color} text-white rounded-full font-bold text-sm shadow-lg`}>
                {intensityInfo.emoji} {intensityInfo.label}
              </div>
            </div>
            <div className="space-y-3">
              {daySessions.map(session => {
                const exam = getExamForSession(session.examId);
                return (
                  <div
                    key={session.id}
                    className={`bg-white rounded-lg p-4 border-2 transition-all ${
                      session.completed
                        ? 'border-green-300 bg-green-50'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => onToggleComplete(session.id)}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all ${
                            session.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-purple-500'
                          }`}
                        >
                          {session.completed && (
                            <svg className="w-full h-full text-white p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{session.subject}</span>
                            {exam && (
                              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(exam.priority)}`}>
                                {getPriorityEmoji(exam.priority)} {exam.priority === 'high' ? 'عالي' : exam.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            ⏱️ {session.duration} دقيقة مذاكرة + {session.breakDuration} دقائق راحة
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>

      {/* Study Tips */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold mb-4 text-blue-900 text-center">💡 أسرار النجاح في الامتحانات</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 text-gray-700 text-sm">
              <div className="flex items-start gap-2 bg-white p-3 rounded-lg">
                <span className="text-xl">🎯</span>
                <div>
                  <div className="font-bold text-blue-900">هدف واضح</div>
                  <div>حدد ماذا تريد إنجازه في كل جلسة قبل البدء</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-lg">
                <span className="text-xl">🔄</span>
                <div>
                  <div className="font-bold text-blue-900">المراجعة المتباعدة</div>
                  <div>راجع المعلومات بعد 24 ساعة، ثم أسبوع، ثم شهر</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-lg">
                <span className="text-xl">✍️</span>
                <div>
                  <div className="font-bold text-blue-900">الكتابة اليدوية</div>
                  <div>تثبت المعلومات أفضل بـ 3 مرات من الطباعة</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-gray-700 text-sm">
              <div className="flex items-start gap-2 bg-white p-3 rounded-lg">
                <span className="text-xl">🧩</span>
                <div>
                  <div className="font-bold text-blue-900">التقسيم</div>
                  <div>قسم المادة لأجزاء صغيرة سهلة الفهم</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-lg">
                <span className="text-xl">🎨</span>
                <div>
                  <div className="font-bold text-blue-900">الخرائط الذهنية</div>
                  <div>ارسم علاقات بين المعلومات بالألوان</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-lg">
                <span className="text-xl">👥</span>
                <div>
                  <div className="font-bold text-blue-900">المذاكرة الجماعية</div>
                  <div>اشرح للآخرين لتكتشف نقاط ضعفك</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-lg font-bold mb-4 text-purple-900 text-center">⚡ تقنيات سريعة للتركيز</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <div className="text-3xl mb-2">🧘</div>
              <div className="font-bold text-purple-900 mb-1">تنفس عميق</div>
              <div className="text-xs text-gray-600">5 أنفاس عميقة قبل البدء تزيد التركيز</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <div className="text-3xl mb-2">🎵</div>
              <div className="font-bold text-purple-900 mb-1">موسيقى كلاسيكية</div>
              <div className="text-xs text-gray-600">تحسن الأداء الذهني بنسبة 15٪</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <div className="text-3xl mb-2">💧</div>
              <div className="font-bold text-purple-900 mb-1">ترطيب مستمر</div>
              <div className="text-xs text-gray-600">الجفاف يقلل التركيز بنسبة 20٪</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold mb-3 text-green-900 text-center">🌟 حقائق علمية مذهلة</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-white p-3 rounded-lg flex items-start gap-3">
              <span className="text-2xl">🕐</span>
              <div>
                <div className="font-bold text-green-900">أفضل وقت للمذاكرة</div>
                <div className="text-gray-700">من 10 صباحاً - 2 ظهراً ومن 4 - 10 مساءً حسب الساعة البيولوجية</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg flex items-start gap-3">
              <span className="text-2xl">🍫</span>
              <div>
                <div className="font-bold text-green-900">الشوكولاتة الداكنة</div>
                <div className="text-gray-700">تحتوي على مواد تحسن التركيز والذاكرة قصيرة المدى</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg flex items-start gap-3">
              <span className="text-2xl">🚶</span>
              <div>
                <div className="font-bold text-green-900">المشي 10 دقائق</div>
                <div className="text-gray-700">بعد المذاكرة يزيد تثبيت المعلومات في الذاكرة طويلة المدى</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200 text-center">
          <div className="text-3xl mb-2">🚫</div>
          <div className="font-bold text-red-900 mb-2 text-lg">تجنب هذه الأخطاء!</div>
          <div className="grid md:grid-cols-2 gap-2 text-sm mt-3">
            <div className="bg-white p-2 rounded">❌ المذاكرة على السرير (تسبب النعاس)</div>
            <div className="bg-white p-2 rounded">❌ تعدد المهام (يقلل الإنتاجية 40٪)</div>
            <div className="bg-white p-2 rounded">❌ السهر الطويل (يضر بالذاكرة)</div>
            <div className="bg-white p-2 rounded">❌ المذاكرة بدون خطة (مضيعة للوقت)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudySchedule;
