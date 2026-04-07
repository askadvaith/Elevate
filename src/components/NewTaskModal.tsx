import React from 'react';
import { X, Calendar, Repeat, Bell, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Category, RepeatUnit } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateCategory: (name: string) => string;
  onCreate: (task: {
    title: string;
    date: string;
    time: string;
    category: Category;
    recurring: boolean;
    repeatEvery: number;
    repeatUnit: RepeatUnit;
    reminderEnabled: boolean;
    reminderOffsetMinutes: number;
  }) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onCreate,
}) => {
  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [category, setCategory] = React.useState<Category>(categories[0] ?? 'General');
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [repeatEvery, setRepeatEvery] = React.useState(1);
  const [repeatUnit, setRepeatUnit] = React.useState<RepeatUnit>('day');
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = React.useState(15);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  React.useEffect(() => {
    if (!categories.length) {
      return;
    }

    const selectedExists = categories.some((current) => current === category);
    if (!selectedExists) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (reminderEnabled && !time) {
      window.alert('Select a due time to schedule a reminder.');
      return;
    }

    onCreate({
      title,
      date,
      time,
      category,
      recurring: isRecurring,
      repeatEvery: Math.max(1, repeatEvery),
      repeatUnit,
      reminderEnabled,
      reminderOffsetMinutes,
    });

    setTitle('');
    setDate('');
    setTime('');
    setIsRecurring(false);
    setRepeatEvery(1);
    setRepeatUnit('day');
    setReminderEnabled(true);
    setReminderOffsetMinutes(15);
    setIsAddingCategory(false);
    setNewCategoryName('');
    onClose();
  };

  const handleAddCategory = () => {
    const created = onCreateCategory(newCategoryName);
    if (!created) {
      return;
    }

    setCategory(created);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.main
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative flex flex-col max-h-[100dvh] sm:max-h-[min(92dvh,820px)]"
          >
            <header className="flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-8 pb-4 sm:pb-6 shrink-0 border-b border-surface-variant/20">
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                <X size={20} />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-primary">New Task</h1>
              <div className="w-10" />
            </header>

            <form onSubmit={handleSubmit} className="px-4 sm:px-8 pt-4 sm:pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-10 space-y-5 sm:space-y-8 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70 ml-1">Task Name</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 sm:py-4 text-base sm:text-lg font-medium text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="What needs to be done?" 
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-surface-container-low rounded-2xl p-4 space-y-3 border border-transparent hover:border-outline-variant/20 transition-colors relative">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar size={18} />
                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">Due Date</span>
                  </div>
                  <input 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 text-on-surface cursor-pointer" 
                    type="date"
                  />
                </div>
                <div className="bg-surface-container-low rounded-2xl p-4 space-y-3 border border-transparent hover:border-outline-variant/20 transition-colors relative">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar size={18} />
                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">Due Time</span>
                  </div>
                  <input 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 text-on-surface cursor-pointer" 
                    type="time"
                  />
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-4 space-y-3 border border-transparent hover:border-outline-variant/20 transition-colors">
                <div className="flex items-center justify-between gap-3 text-tertiary">
                  <div className="flex items-center gap-2">
                    <Repeat size={18} />
                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">Repeat on Completion</span>
                  </div>
                  <button
                    onClick={() => setIsRecurring((previous) => !previous)}
                    className={cn(
                      'w-12 h-6 rounded-full relative flex items-center px-1 transition-colors',
                      isRecurring ? 'bg-primary' : 'bg-surface-variant'
                    )}
                    type="button"
                  >
                    <div className={cn(
                      'w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                      isRecurring ? 'translate-x-6' : 'translate-x-0'
                    )} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-on-surface-variant">Every</span>
                  <input
                    value={repeatEvery}
                    onChange={(event) => setRepeatEvery(Number(event.target.value))}
                    className="w-16 bg-surface-container-lowest border-none rounded-lg px-2 py-1 text-sm font-semibold text-center text-on-surface focus:ring-2 focus:ring-tertiary/20"
                    min="1"
                    type="number"
                    disabled={!isRecurring}
                  />
                  <div className="relative flex-1">
                    <select
                      value={repeatUnit}
                      onChange={(event) => setRepeatUnit(event.target.value as RepeatUnit)}
                      className="w-full bg-surface-container-lowest border-none rounded-lg py-1 pl-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-tertiary/20 text-on-surface cursor-pointer appearance-none"
                      disabled={!isRecurring}
                    >
                      <option value="day">Days</option>
                      <option value="week">Weeks</option>
                      <option value="month">Months</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70 ml-1">Assign to List</label>
                {isAddingCategory && (
                  <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      className="w-full bg-surface-container-lowest border border-surface-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
                      placeholder="Category name"
                      type="text"
                      autoFocus
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wide"
                      type="button"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wide"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button 
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all active:scale-95",
                        category === cat 
                          ? "bg-primary-container text-on-primary-container" 
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
                      )}
                    >
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        cat === 'Personal' ? "bg-primary" : cat === 'Work' ? "bg-tertiary" : "bg-secondary"
                      )} />
                      {cat}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsAddingCategory((previous) => !previous)}
                    className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
                    type="button"
                    aria-label="Add category"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Enable Reminders</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {reminderEnabled
                        ? reminderOffsetMinutes === 0
                          ? 'Notify at due time'
                          : `Notify ${reminderOffsetMinutes}m before`
                        : 'Reminder off'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReminderEnabled((previous) => !previous)}
                  className={cn(
                    'w-12 h-6 rounded-full relative flex items-center px-1 transition-colors',
                    reminderEnabled ? 'bg-primary' : 'bg-surface-variant'
                  )}
                  type="button"
                >
                  <div className={cn(
                    'w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                    reminderEnabled ? 'translate-x-6' : 'translate-x-0'
                  )} />
                </button>
              </div>

              {reminderEnabled && (
                <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-sm font-medium text-on-surface-variant">Remind me</span>
                  <select
                    value={reminderOffsetMinutes}
                    onChange={(event) => setReminderOffsetMinutes(Number(event.target.value))}
                    className="ml-auto bg-surface-container-lowest border border-surface-variant/30 rounded-lg px-2.5 py-1.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
                  >
                    <option value={0}>At due time</option>
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                  </select>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3.5 sm:py-4 rounded-full bg-primary text-on-primary font-bold text-base sm:text-lg shadow-[0_12px_24px_-8px_rgba(78,94,139,0.4)] transition-all hover:shadow-[0_16px_32px_-8px_rgba(78,94,139,0.5)] hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Create Task
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>

            <div className="hidden sm:block absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[80px] pointer-events-none" />
            <div className="hidden sm:block absolute -top-24 -right-24 w-64 h-64 bg-primary-container/20 rounded-full blur-[80px] pointer-events-none" />
          </motion.main>
        </div>
      )}
    </AnimatePresence>
  );
};
