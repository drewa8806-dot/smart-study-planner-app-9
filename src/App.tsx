import { useState, useEffect } from 'react';
import Timer from './components/Timer';
import StudySchedule from './components/StudySchedule';
import ExamManager from './components/ExamManager';
import { Exam, StudySession } from './types';

function App() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [activeTab, setActiveTab] = useState<'timer' | 'schedule' | 'exams'>('timer');

  useEffect(() => {
    // Load data from localStorage
    const savedExams = localStorage.getItem('exams');
    const savedSessions = localStorage.getItem('studySessions');
    
    if (savedExams) setExams(JSON.parse(savedExams));
    if (savedSessions) setStudySessions(JSON.parse(savedSessions));

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('studySessions', JSON.stringify(studySessions));
  }, [studySessions]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const addExam = (exam: Exam) => {
    const newExams = [...exams, { ...exam, id: Date.now().toString() }];
    setExams(newExams);
    generateStudySchedule(newExams);
  };

  const deleteExam = (id: string) => {
    const newExams = exams.filter(e => e.id !== id);
    setExams(newExams);
    generateStudySchedule(newExams);
  };

  const generateStudySchedule = (examsList: Exam[]) => {
    const sessions: StudySession[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    examsList.forEach(exam => {
      const examDate = new Date(exam.date);
      examDate.setHours(0, 0, 0, 0);
      const totalDaysUntilExam = Math.floor((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (totalDaysUntilExam > 0) {
        // حساب معامل الأولوية
        const priorityMultiplier = exam.priority === 'high' ? 1.5 : exam.priority === 'medium' ? 1.0 : 0.7;
        
        for (let day = 0; day < totalDaysUntilExam; day++) {
          const sessionDate = new Date(today);
          sessionDate.setDate(sessionDate.getDate() + day);
          
          // حساب كام يوم باقي للامتحان من اليوم ده
          const daysLeftToExam = totalDaysUntilExam - day;
          
          // نمط دوري ذكي كل 5 أيام
          const dayPattern = day % 5;
          const isWeekend = sessionDate.getDay() === 5 || sessionDate.getDay() === 6; // الجمعة والسبت
          
          let baseSessionsCount: number;
          let sessionIntensity: 'high' | 'medium' | 'light' | 'rest';
          let baseDuration: number;
          let baseBreak: number;
          
          // النظام الذكي حسب المدة المتبقية من اليوم الحالي
          if (daysLeftToExam <= 3) {
            // آخر 3 أيام - تركيز شديد جداً!
            if (dayPattern === 4) { // يوم راحة خفيف
              baseSessionsCount = exam.priority === 'high' ? 3 : 2;
              sessionIntensity = 'medium';
              baseDuration = 30;
              baseBreak = 10;
            } else {
              baseSessionsCount = exam.priority === 'high' ? 5 : exam.priority === 'medium' ? 4 : 3;
              sessionIntensity = 'high';
              baseDuration = exam.priority === 'high' ? 50 : 40;
              baseBreak = 15;
            }
          } else if (daysLeftToExam <= 7) {
            // آخر أسبوع - تركيز عالي
            if (dayPattern === 0 || dayPattern === 1) {
              baseSessionsCount = Math.round(4 * priorityMultiplier);
              sessionIntensity = 'high';
              baseDuration = exam.priority === 'high' ? 45 : 35;
              baseBreak = 12;
            } else if (dayPattern === 2 || dayPattern === 3) {
              baseSessionsCount = Math.round(3 * priorityMultiplier);
              sessionIntensity = 'medium';
              baseDuration = 30;
              baseBreak = 8;
            } else {
              baseSessionsCount = exam.priority === 'high' ? 2 : 1;
              sessionIntensity = 'light';
              baseDuration = 20;
              baseBreak = 5;
            }
          } else if (daysLeftToExam <= 14) {
            // أسبوعين - توازن ذكي
            if (isWeekend) {
              baseSessionsCount = Math.round(3 * priorityMultiplier);
              sessionIntensity = dayPattern <= 2 ? 'high' : 'medium';
              baseDuration = 35;
              baseBreak = 10;
            } else if (dayPattern === 0 || dayPattern === 2) {
              baseSessionsCount = Math.round(3 * priorityMultiplier);
              sessionIntensity = 'high';
              baseDuration = 40;
              baseBreak = 10;
            } else if (dayPattern === 1 || dayPattern === 3) {
              baseSessionsCount = Math.round(2 * priorityMultiplier);
              sessionIntensity = 'medium';
              baseDuration = 25;
              baseBreak = 7;
            } else {
              baseSessionsCount = exam.priority === 'low' ? 0 : 1;
              sessionIntensity = 'rest';
              baseDuration = 20;
              baseBreak = 5;
            }
          } else if (daysLeftToExam <= 30) {
            // شهر - وتيرة مريحة ومستدامة
            if (isWeekend) {
              baseSessionsCount = Math.round(2 * priorityMultiplier);
              sessionIntensity = 'medium';
              baseDuration = 30;
              baseBreak = 8;
            } else if (dayPattern === 0 || dayPattern === 2) {
              baseSessionsCount = Math.round(2 * priorityMultiplier);
              sessionIntensity = 'medium';
              baseDuration = 30;
              baseBreak = 7;
            } else if (dayPattern === 1) {
              baseSessionsCount = Math.round(1 * priorityMultiplier);
              sessionIntensity = 'light';
              baseDuration = 20;
              baseBreak = 5;
            } else {
              baseSessionsCount = 0; // راحة كاملة
              sessionIntensity = 'rest';
              baseDuration = 15;
              baseBreak = 5;
            }
          } else {
            // أكثر من شهر - وتيرة خفيفة جداً
            if (isWeekend) {
              baseSessionsCount = exam.priority === 'high' ? 2 : 1;
              sessionIntensity = 'light';
              baseDuration = 25;
              baseBreak = 7;
            } else if (dayPattern === 0 || dayPattern === 3) {
              baseSessionsCount = Math.round(1 * priorityMultiplier);
              sessionIntensity = 'light';
              baseDuration = 20;
              baseBreak = 5;
            } else {
              baseSessionsCount = 0; // راحة
              sessionIntensity = 'rest';
              baseDuration = 15;
              baseBreak = 5;
            }
          }
          
          // إنشاء الجلسات مع تنويع الأوقات
          for (let session = 0; session < baseSessionsCount; session++) {
            // تنويع المدة حسب رقم الجلسة
            let duration = baseDuration;
            let breakDuration = baseBreak;
            
            if (session === 0) {
              // الجلسة الأولى - طاقة عالية
              duration = Math.round(baseDuration * 1.1);
              breakDuration = Math.round(baseBreak * 1.2);
            } else if (session === baseSessionsCount - 1) {
              // الجلسة الأخيرة - راحة أطول
              duration = Math.round(baseDuration * 0.9);
              breakDuration = Math.round(baseBreak * 1.5);
            } else if (session % 2 === 0) {
              duration = baseDuration + 5;
              breakDuration = baseBreak;
            } else {
              duration = baseDuration - 5;
              breakDuration = baseBreak + 3;
            }

            // التأكد من الحدود المنطقية
            duration = Math.max(15, Math.min(60, duration));
            breakDuration = Math.max(3, Math.min(20, breakDuration));

            sessions.push({
              id: `${exam.id}-${day}-${session}`,
              examId: exam.id,
              subject: exam.subject,
              date: sessionDate.toISOString(),
              duration: duration,
              breakDuration: breakDuration,
              completed: false,
              intensity: sessionIntensity
            });
          }
        }
      }
    });

    setStudySessions(sessions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  };

  const toggleSessionComplete = (id: string) => {
    setStudySessions(sessions =>
      sessions.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🎓 الدحيح
          </h1>
          <p className="text-gray-600 text-xl font-semibold">تطبيق المذاكرة الذكي</p>
          <p className="text-gray-500 text-sm mt-1">نظم وقتك وحقق أهدافك الدراسية</p>
        </div>

        {/* Notification Permission Request */}
        {notificationPermission === 'default' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-yellow-800 mb-3">
              🔔 للحصول على تنبيهات عند انتهاء وقت المذاكرة، يرجى السماح بالإشعارات
            </p>
            <button
              onClick={requestNotificationPermission}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              تفعيل الإشعارات
            </button>
          </div>
        )}

        {notificationPermission === 'granted' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
            <p className="text-green-800">✅ الإشعارات مفعلة</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'timer'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ⏱️ المؤقت
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📅 الجدول
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📝 الامتحانات
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {activeTab === 'timer' && <Timer studySessions={studySessions} />}
          {activeTab === 'schedule' && (
            <StudySchedule
              sessions={studySessions}
              exams={exams}
              onToggleComplete={toggleSessionComplete}
            />
          )}
          {activeTab === 'exams' && (
            <ExamManager
              exams={exams}
              onAddExam={addExam}
              onDeleteExam={deleteExam}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            تم الإنشاء بواسطة{' '}
            <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Youssef Mahmoud
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
