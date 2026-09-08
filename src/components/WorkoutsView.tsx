import { useState, FormEvent } from 'react';
import { Dumbbell, Plus, Clock, Target, Flame, CheckCircle, Play, Pause, RotateCcw, Trash2, Edit3, ChevronDown, Award } from 'lucide-react';
import { Exercise, ExerciseCategory, ExerciseIntensity, UserSession } from '../types';
import { StorageService } from '../utils/storage';

interface WorkoutsViewProps {
  session: UserSession;
  exercises: Exercise[];
  onExercisesUpdated: () => void;
}

export function WorkoutsView({ session, exercises, onExercisesUpdated }: WorkoutsViewProps) {
  const isCaptain = session.role === 'captain';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [activeTimerExercise, setActiveTimerExercise] = useState<Exercise | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // New Exercise Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ExerciseCategory>('tactical');
  const [newIntensity, setNewIntensity] = useState<ExerciseIntensity>('متوسط');
  const [newDuration, setNewDuration] = useState(30);
  const [newFocus, setNewFocus] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    if (selectedCategory === 'all') return true;
    return ex.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'جميع التمارين' },
    { id: 'tactical', label: 'تكتيك وخطط' },
    { id: 'physical', label: 'لياقة وقوة' },
    { id: 'skills', label: 'مهارات وتحكم' },
    { id: 'goalkeeping', label: 'حراسة المرمى' },
  ];

  const openAddModal = () => {
    setEditingExercise(null);
    setNewTitle('');
    setNewCategory('tactical');
    setNewIntensity('متوسط');
    setNewDuration(30);
    setNewFocus('');
    setNewDescription('');
    setNewInstructions('');
    setShowAddModal(true);
  };

  const openEditModal = (ex: Exercise) => {
    setEditingExercise(ex);
    setNewTitle(ex.title);
    setNewCategory(ex.category);
    setNewIntensity(ex.intensity);
    setNewDuration(ex.durationMinutes);
    setNewFocus(ex.targetFocus);
    setNewDescription(ex.description);
    setNewInstructions((ex.instructions || []).join('\n'));
    setShowAddModal(true);
  };

  const handleAddExercise = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const instructionsList = newInstructions
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const exercise: Exercise = {
      id: editingExercise ? editingExercise.id : 'ex-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      intensity: newIntensity,
      durationMinutes: Number(newDuration) || 30,
      targetFocus: newFocus.trim() || 'رفع الجاهزية الفنية',
      description: newDescription.trim() || 'تمرين معتمد من الكابتن زيد للأكاديمية.',
      instructions: instructionsList.length > 0 ? instructionsList : ['اتباع تعليمات الكابتن في الملعب'],
      addedBy: editingExercise ? editingExercise.addedBy : session.name,
      date: editingExercise ? editingExercise.date : new Date().toISOString().split('T')[0],
    };

    StorageService.saveExercise(exercise);
    onExercisesUpdated();
    setShowAddModal(false);

    // Reset Form
    setNewTitle('');
    setNewFocus('');
    setNewDescription('');
    setNewInstructions('');
    setEditingExercise(null);
  };

  const handleDeleteExercise = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التمرين من جدول الأكاديمية؟')) {
      StorageService.deleteExercise(id);
      onExercisesUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Captain Action */}
      <div className="bg-gradient-to-r from-[#111A14] via-[#15231B] to-[#0D1510] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1B271F] to-[#0E1611] border-2 border-amber-400/50 p-0.5 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
              <img
                src="/logo.png"
                alt="شعار أكاديمية بايبوخت"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Dumbbell className="w-4 h-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">جدول التمارين والوحدات التدريبية</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                المناهج التدريبية والتكتيكية المقررة من الكابتن <span className="text-amber-300 font-bold">زيد محمد خرشيد</span> لتطوير مهارات لاعبي بايبوخت (B.A.T)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCaptain && (
              <button
                onClick={openAddModal}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة تمرين تدريبي جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                  : 'bg-[#0B100C] text-gray-300 border-white/5 hover:border-amber-500/30 hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExercises.map((exercise) => {
          const intensityColor =
            exercise.intensity === 'احترافي'
              ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
              : exercise.intensity === 'شديد'
              ? 'bg-red-950/60 text-red-300 border-red-500/40'
              : exercise.intensity === 'متوسط'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';

          return (
            <div
              key={exercise.id}
              className="bg-[#0F1612] border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between group"
            >
              <div>
                {/* Card Header Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${intensityColor}`}>
                      {exercise.intensity}
                    </span>
                    <span className="text-[11px] text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{exercise.durationMinutes} دقيقة</span>
                    </span>
                  </div>

                  {isCaptain && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(exercise)}
                        className="text-gray-400 hover:text-amber-300 p-1 transition-colors"
                        title="تعديل بيانات التمرين"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        title="حذف التمرين"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-amber-200 group-hover:text-amber-300 transition-colors mb-2 leading-snug">
                  {exercise.title}
                </h3>

                {/* Focus / Objective */}
                <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20 mb-3">
                  <Target className="w-4 h-4 shrink-0 mt-0.5 text-emerald-300" />
                  <div>
                    <span className="font-bold text-emerald-300">الهدف التدريبي: </span>
                    <span>{exercise.targetFocus}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                  {exercise.description}
                </p>

                {/* Instructions */}
                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[11px] font-bold text-gray-400 mb-1">خطوات التطبيق العملي:</div>
                    {exercise.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer / Instructor info */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 mt-2">
                <span className="text-[11px] text-gray-400">
                  بإشراف: <span className="text-amber-300 font-semibold">{exercise.addedBy}</span>
                </span>

                <button
                  onClick={() => {
                    setActiveTimerExercise(exercise);
                    setTimerSeconds(exercise.durationMinutes * 60);
                    setIsTimerRunning(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>بدء توقيت التمرين</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Workout Timer Modal */}
      {activeTimerExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121A15] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-amber-300 mb-1">{activeTimerExercise.title}</h3>
            <p className="text-xs text-gray-400 mb-6">عداد التمرين والوحدة التدريبية في الملعب</p>

            {/* Big Timer Display */}
            <div className="text-5xl font-mono font-black text-white bg-black/50 py-5 rounded-2xl border border-white/10 mb-6 tracking-wider">
              {Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, '0')}
              :{(timerSeconds % 60).toString().padStart(2, '0')}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-2 transition-all"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'إيقاف مؤقت' : 'استئناف'}</span>
              </button>
              <button
                onClick={() => setTimerSeconds(activeTimerExercise.durationMinutes * 60)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTimerExercise(null)}
                className="px-4 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-bold"
              >
                إنهاء التمرين
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal (For Captain) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#101713] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-amber-300">
                {editingExercise ? 'تعديل التمرين التدريبي' : 'إضافة تمرين تدريبي جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingExercise(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">عنوان التمرين *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: التمرير السريع والتحرك في مساحات ضيقة"
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">القسم / التصنيف</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExerciseCategory)}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="tactical">تكتيك وخطط</option>
                    <option value="physical">لياقة وقوة بدنية</option>
                    <option value="skills">مهارات وتحكم</option>
                    <option value="goalkeeping">حراسة المرمى</option>
                    <option value="recovery">استشفاء</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">مستوى الشدة</label>
                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(e.target.value as ExerciseIntensity)}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="خفيف">خفيف</option>
                    <option value="متوسط">متوسط</option>
                    <option value="شديد">شديد</option>
                    <option value="احترافي">احترافي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">المدة (بالدقائق)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الهدف التدريبي</label>
                  <input
                    type="text"
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    placeholder="مثال: سرعة نقل الكرة"
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">شرح التمرين</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="وصف مختصر لمجريات التمرين..."
                  className="w-full px-3.5 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  خطوات التطبيق (خطوة في كل سطر)
                </label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="1. الجري الخفيف لمدة دقيقتين&#10;2. التمرير بالقدم العكسية&#10;3. الضغط الفوري على حامل الكرة"
                  className="w-full px-3.5 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExercise(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs shadow-md"
                >
                  {editingExercise ? 'حفظ التعديلات' : 'حفظ التمرين ونشره'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
