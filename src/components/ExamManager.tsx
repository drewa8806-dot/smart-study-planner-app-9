import { useState } from 'react';
import { Exam } from '../types';

interface ExamManagerProps {
  exams: Exam[];
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
}

function ExamManager({ exams, onAddExam, onDeleteExam }: ExamManagerProps) {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && date) {
      onAddExam({
        id: '',
        subject,
        date,
        priority
      });
      setSubject('');
      setDate('');
      setPriority('medium');
      setShowForm(false);
    }
  };

  const getDaysUntil = (examDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diff = Math.floor((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityBg = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const sortedExams = [...exams].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcomingExams = sortedExams.filter(e => getDaysUntil(e.date) >= 0);
  const pastExams = sortedExams.filter(e => getDaysUntil(e.date) < 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">📝 إدارة الامتحانات</h2>
        <p className="text-gray-600">أضف امتحاناتك وسيتم إنشاء جدول مذاكرة تلقائي</p>
      </div>

      {/* Add Exam Button */}
      <div className="text-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          {showForm ? '✖️ إلغاء' : '➕ إضافة امتحان جديد'}
        </button>
      </div>

      {/* Add Exam Form */}
      {showForm && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📚 اسم المادة
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: الرياضيات"
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📅 تاريخ الامتحان
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🎯 الأولوية
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    priority === 'high'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  🔴 عالي
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    priority === 'medium'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  🟡 متوسط
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    priority === 'low'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  🟢 منخفض
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              ✅ إضافة الامتحان
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">📌 الامتحانات القادمة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map(exam => {
              const daysUntil = getDaysUntil(exam.date);
              return (
                <div
                  key={exam.id}
                  className={`rounded-xl p-6 border-2 ${getPriorityBg(exam.priority)} transition-all hover:shadow-lg`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-1">{exam.subject}</h4>
                      <div className="text-sm text-gray-600">
                        📅 {new Date(exam.date).toLocaleDateString('ar-EG', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getPriorityColor(exam.priority)} text-white font-bold text-sm`}>
                      {exam.priority === 'high' ? '🔴 عالي' : exam.priority === 'medium' ? '🟡 متوسط' : '🟢 منخفض'}
                    </div>
                    <div className="text-right">
                      {daysUntil === 0 ? (
                        <div className="text-2xl font-bold text-red-600">اليوم! 🚨</div>
                      ) : daysUntil === 1 ? (
                        <div className="text-2xl font-bold text-orange-600">غداً 📍</div>
                      ) : (
                        <div>
                          <div className="text-3xl font-bold text-gray-800">{daysUntil}</div>
                          <div className="text-sm text-gray-600">يوم متبقي</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Exams */}
      {pastExams.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-500">✅ امتحانات سابقة</h3>
          <div className="space-y-2">
            {pastExams.map(exam => (
              <div
                key={exam.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-60"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold">{exam.subject}</span>
                    <span className="text-sm text-gray-500 mr-3">
                      {new Date(exam.date).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteExam(exam.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {exams.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد امتحانات حتى الآن</h3>
          <p className="text-gray-500">أضف امتحاناتك لتبدأ في إنشاء جدول مذاكرة منظم</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold mb-3 text-blue-900">🧠 النظام الذكي التلقائي</h3>
        <div className="space-y-3 text-gray-700 text-sm">
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-200">
            <div className="font-bold mb-2 text-red-900">🚨 آخر 3 أيام - تركيز شديد!</div>
            <ul className="space-y-1 mr-4">
              <li>• 🔴 أولوية عالية: 4-5 جلسات (50 دقيقة)</li>
              <li>• 🟡 أولوية متوسطة: 3-4 جلسات (40 دقيقة)</li>
              <li>• 🟢 أولوية منخفضة: 3 جلسات (35 دقيقة)</li>
              <li>• راحة 15 دقيقة بين الجلسات</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-orange-200">
            <div className="font-bold mb-2 text-orange-900">🔥 آخر أسبوع - مكثف</div>
            <ul className="space-y-1 mr-4">
              <li>• 3-4 جلسات يومياً (35-45 دقيقة)</li>
              <li>• تنويع بين الأيام المكثفة والخفيفة</li>
              <li>• راحة 8-12 دقيقة</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="font-bold mb-2 text-blue-900">⚡ 1-2 أسبوع - توازن</div>
            <ul className="space-y-1 mr-4">
              <li>• 2-3 جلسات يومياً (25-40 دقيقة)</li>
              <li>• أيام راحة منتظمة</li>
              <li>• مكثف في نهاية الأسبوع</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
            <div className="font-bold mb-2 text-green-900">🌱 2-4 أسابيع - مريح</div>
            <ul className="space-y-1 mr-4">
              <li>• 1-2 جلسة يومياً (20-30 دقيقة)</li>
              <li>• 3 أيام راحة في الأسبوع</li>
              <li>• تركيز أكثر حسب الأولوية</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border-2 border-teal-200">
            <div className="font-bold mb-2 text-teal-900">😌 أكثر من شهر - خفيف جداً</div>
            <ul className="space-y-1 mr-4">
              <li>• جلسة واحدة كل يومين (15-25 دقيقة)</li>
              <li>• راحة كاملة معظم الأيام</li>
              <li>• بناء عادة دراسية بدون ضغط</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mt-4 border-2 border-purple-300">
            <div className="font-bold text-purple-900 mb-2">💡 نظام ذكي 100%</div>
            <ul className="space-y-1">
              <li>✓ الجدول يُنشأ تلقائياً حسب تاريخ الامتحان</li>
              <li>✓ الأولوية تؤثر على عدد ومدة الجلسات</li>
              <li>✓ راحة في الجمعة والسبت</li>
              <li>✓ تنويع تلقائي في الأوقات</li>
              <li>✓ لا حاجة لأي إعدادات يدوية!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamManager;
