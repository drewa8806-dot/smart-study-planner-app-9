import { useState, useEffect } from 'react';
import { StudySession } from '../types';

interface TimerSettings {
  studyMinutes: number;
  breakMinutes: number;
}

interface TimerProps {
  studySessions: StudySession[];
}

function Timer({ studySessions }: TimerProps) {
  const [settings, setSettings] = useState<TimerSettings>({
    studyMinutes: 25,
    breakMinutes: 5
  });
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  // الحصول على الجلسة القادمة
  const getNextSession = () => {
    const today = new Date();
    const upcoming = studySessions
      .filter(s => !s.completed && new Date(s.date) >= new Date(today.toDateString()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] || null;
  };

  // تحميل حالة المؤقت من localStorage عند البداية
  useEffect(() => {
    const savedTimerState = localStorage.getItem('timerState');
    const savedSessions = localStorage.getItem('sessionsCompleted');
    
    if (savedSessions) {
      setSessionsCompleted(parseInt(savedSessions));
    }

    if (savedTimerState) {
      const state = JSON.parse(savedTimerState);
      const now = Date.now();
      const elapsed = Math.floor((now - state.lastUpdate) / 1000); // الوقت بالثواني منذ آخر تحديث
      const currentTotalSeconds = state.minutes * 60 + state.seconds;
      const remainingSeconds = currentTotalSeconds - elapsed;

      if (remainingSeconds > 0 && state.isActive) {
        // المؤقت لا يزال يعمل
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        setMinutes(mins);
        setSeconds(secs);
        setIsActive(true);
        setIsBreak(state.isBreak);
        setSettings(state.settings);
        if (state.currentSession) {
          setCurrentSession(state.currentSession);
        }
      } else if (state.isActive) {
        // المؤقت انتهى أثناء الغياب
        setIsActive(false);
        setIsBreak(false);
        const saved = localStorage.getItem('timerSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          setMinutes(parsed.studyMinutes);
        }
        localStorage.removeItem('timerState');
      }
    } else {
      // تحميل الجلسة القادمة إذا لم يكن المؤقت يعمل
      const nextSession = getNextSession();
      
      if (nextSession) {
        setCurrentSession(nextSession);
        setSettings({
          studyMinutes: nextSession.duration,
          breakMinutes: nextSession.breakDuration
        });
        setMinutes(nextSession.duration);
        setSeconds(0);
      } else {
        const saved = localStorage.getItem('timerSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          setMinutes(parsed.studyMinutes);
        }
      }
    }
  }, []);

  // تحديث الجلسة القادمة عند تغيير الجلسات (فقط إذا لم يكن المؤقت يعمل)
  useEffect(() => {
    if (!isActive) {
      const nextSession = getNextSession();
      if (nextSession) {
        setCurrentSession(nextSession);
      }
    }
  }, [studySessions, isActive]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // حفظ حالة المؤقت في localStorage عند كل تغيير
  useEffect(() => {
    if (isActive) {
      const timerState = {
        lastUpdate: Date.now(), // وقت آخر تحديث
        minutes: minutes, // الدقائق المتبقية
        seconds: seconds, // الثواني المتبقية
        isActive: true,
        isBreak: isBreak,
        settings: settings,
        currentSession: currentSession
      };
      localStorage.setItem('timerState', JSON.stringify(timerState));
    } else {
      localStorage.removeItem('timerState');
    }
  }, [isActive, minutes, seconds, isBreak, settings, currentSession]);

  const handleTimerComplete = () => {
    setIsActive(false);
    playNotificationSound();
    localStorage.removeItem('timerState');
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        isBreak ? 'انتهت فترة الراحة! 💪' : 'رائع! انتهى وقت المذاكرة 🎉',
        {
          body: isBreak ? 'حان وقت العودة للمذاكرة' : 'خذ استراحة قصيرة',
          icon: '/icon.png'
        }
      );
    }

    if (isBreak) {
      // Break ended, start new study session
      setIsBreak(false);
      setMinutes(settings.studyMinutes);
      setSeconds(0);
    } else {
      // Study session ended, start break
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      localStorage.setItem('sessionsCompleted', newCount.toString());
      setIsBreak(true);
      setMinutes(settings.breakMinutes);
      setSeconds(0);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTA0PWKzn77BdGAg+ltryxnMpBSuAy/DaizsIGGS37Oijog==');
      audio.play().catch(() => {});
    } catch (e) {
      // Ignore audio errors
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(settings.studyMinutes);
    setSeconds(0);
    localStorage.removeItem('timerState');
  };

  const updateSettings = (study: number, breakTime: number) => {
    const newSettings = { studyMinutes: study, breakMinutes: breakTime };
    setSettings(newSettings);
    localStorage.setItem('timerSettings', JSON.stringify(newSettings));
    
    if (!isActive) {
      setMinutes(study);
      setSeconds(0);
    }
  };

  const progress = isBreak
    ? ((settings.breakMinutes * 60 - (minutes * 60 + seconds)) / (settings.breakMinutes * 60)) * 100
    : ((settings.studyMinutes * 60 - (minutes * 60 + seconds)) / (settings.studyMinutes * 60)) * 100;

  const nextSession = getNextSession();

  return (
    <div className="space-y-8">
      {/* معلومات الجلسة القادمة */}
      {currentSession && !isActive && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-5 text-center">
          <div className="text-sm font-semibold text-purple-900 mb-2">📌 الجلسة القادمة</div>
          <div className="text-2xl font-bold text-purple-700 mb-1">{currentSession.subject}</div>
          <div className="text-sm text-purple-600">
            {new Date(currentSession.date).toLocaleDateString('ar-EG', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-600">المذاكرة</div>
              <div className="text-lg font-bold text-purple-700">{currentSession.duration} دقيقة</div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-600">الراحة</div>
              <div className="text-lg font-bold text-green-700">{currentSession.breakDuration} دقائق</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-purple-600">
            ✨ تم ضبط المؤقت تلقائياً على هذه الجلسة
          </div>
        </div>
      )}

      {!currentSession && !isActive && nextSession && (
        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-xl p-5 text-center">
          <div className="text-sm font-semibold text-blue-900 mb-2">📅 جلسة قادمة</div>
          <div className="text-xl font-bold text-blue-700">{nextSession.subject}</div>
          <div className="text-sm text-blue-600 mt-1">
            {new Date(nextSession.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      )}

      {!nextSession && studySessions.length > 0 && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-5 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-lg font-bold text-green-700">أحسنت! أكملت كل الجلسات المجدولة</div>
          <div className="text-sm text-green-600 mt-1">يمكنك استخدام المؤقت بحرية</div>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          {isBreak ? '🌟 وقت الراحة' : '📖 وقت المذاكرة'}
        </h2>
        <p className="text-gray-600 mb-2">الجلسات المكتملة: {sessionsCompleted} 🎯</p>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center">
        <div className="relative w-80 h-80">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="#e5e7eb"
              strokeWidth="20"
              fill="none"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke={isBreak ? '#10b981' : '#8b5cf6'}
              strokeWidth="20"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 140}`}
              strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl font-bold text-gray-800 font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="text-xl text-gray-500 mt-2">
                {isBreak ? 'راحة' : 'مذاكرة'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
          }`}
        >
          {isActive ? '⏸️ إيقاف مؤقت' : '▶️ ابدأ'}
        </button>
        <button
          onClick={resetTimer}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-lg transition-all shadow-lg"
        >
          🔄 إعادة ضبط
        </button>
      </div>

      {/* Settings */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-center">⚙️ الإعدادات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وقت المذاكرة (دقيقة)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.studyMinutes}
              onChange={(e) => updateSettings(Number(e.target.value), settings.breakMinutes)}
              className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-center text-xl font-bold"
              disabled={isActive}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وقت الراحة (دقيقة)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.breakMinutes}
              onChange={(e) => updateSettings(settings.studyMinutes, Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border-2 border-pink-300 focus:border-pink-500 focus:outline-none text-center text-xl font-bold"
              disabled={isActive}
            />
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          💡 نصيحة: تقنية بومودورو التقليدية هي 25 دقيقة مذاكرة و 5 دقائق راحة
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => updateSettings(25, 5)}
          disabled={isActive}
          className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          بومودورو تقليدي (25/5)
        </button>
        <button
          onClick={() => updateSettings(50, 10)}
          disabled={isActive}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          مكثف (50/10)
        </button>
        <button
          onClick={() => updateSettings(15, 3)}
          disabled={isActive}
          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          سريع (15/3)
        </button>
      </div>

      {/* نصائح ذهبية */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200">
        <h3 className="text-xl font-bold mb-4 text-amber-900 text-center">✨ نصائح ذهبية للمذاكرة الفعالة</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="text-3xl mb-2">🧠</div>
            <div className="font-bold text-amber-900 mb-1">قبل المذاكرة</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• اختر مكاناً هادئاً ومنظماً</li>
              <li>• أبعد هاتفك عنك</li>
              <li>• حضر كل ما تحتاجه مسبقاً</li>
              <li>• اشرب ماء كافي</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="text-3xl mb-2">📚</div>
            <div className="font-bold text-amber-900 mb-1">أثناء المذاكرة</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• ابدأ بالأصعب أولاً</li>
              <li>• لخص ما تتعلمه بكلماتك</li>
              <li>• اكتب ملاحظات يدوياً</li>
              <li>• علم ما تتعلمه لشخص آخر</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="text-3xl mb-2">🌟</div>
            <div className="font-bold text-amber-900 mb-1">في وقت الراحة</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• قم وتحرك قليلاً</li>
              <li>• مارس تمارين التنفس</li>
              <li>• اشرب ماء أو وجبة خفيفة</li>
              <li>• لا تفتح السوشيال ميديا!</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="text-3xl mb-2">💪</div>
            <div className="font-bold text-amber-900 mb-1">للتركيز الأفضل</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• نم 7-8 ساعات يومياً</li>
              <li>• تناول طعام صحي</li>
              <li>• مارس الرياضة بانتظام</li>
              <li>• لا تذاكر والمعدة ممتلئة</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-300">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-bold text-purple-900 mb-2">قاعدة 20-20-20 للعينين</div>
            <div className="text-sm text-purple-700">
              كل 20 دقيقة، انظر لشيء على بعد 20 قدم لمدة 20 ثانية لراحة عينيك
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
          <div className="text-center">
            <div className="text-2xl mb-2">🌙</div>
            <div className="font-bold text-green-900 mb-2">النوم أهم من السهر</div>
            <div className="text-sm text-green-700">
              دراسات أثبتت أن النوم الجيد يحسن الذاكرة بنسبة 40٪ أكثر من السهر للمذاكرة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer;
