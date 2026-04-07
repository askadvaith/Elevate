import React from 'react';
import { X, Calendar, Clock3, Repeat, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isValid, parse } from 'date-fns';
import { cn } from '../lib/utils';
import { Category, RepeatUnit, Task } from '../types';

type EditableTaskFields = Pick<
  Task,
  'title' | 'description' | 'category' | 'dueDate' | 'time' | 'recurring' | 'repeatEvery' | 'repeatUnit' | 'reminderEnabled' | 'reminderOffsetMinutes'
>;

interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  categories: Category[];
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<EditableTaskFields>) => void;
}

const toTimeInputValue = (time: string) => {
  if (!time || time === 'Anytime' || time === 'Done') {
    return '';
  }

  const parsedTwentyFourHour = parse(time, 'HH:mm', new Date());
  if (isValid(parsedTwentyFourHour)) {
    return format(parsedTwentyFourHour, 'HH:mm');
  }

  const parsedTwelveHour = parse(time, 'h:mm a', new Date());
  if (isValid(parsedTwelveHour)) {
    return format(parsedTwelveHour, 'HH:mm');
  }

  return '';
};

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  task,
  categories,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [dueTime, setDueTime] = React.useState('');
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [repeatEvery, setRepeatEvery] = React.useState(1);
  const [repeatUnit, setRepeatUnit] = React.useState<RepeatUnit>('day');
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = React.useState(15);

  const categoryOptions = React.useMemo(() => {
    const options = Array.from(new Set(categories.filter(Boolean)));
    if (category && !options.includes(category)) {
      return [category, ...options];
    }

    return options;
  }, [categories, category]);

  React.useEffect(() => {
    if (!task || !isOpen) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description ?? '');
    setCategory(task.category ?? categories[0] ?? 'General');
    setDueDate(task.dueDate ?? '');
    setDueTime(toTimeInputValue(task.time));
    setIsRecurring(Boolean(task.recurring));
    setRepeatEvery(Math.max(1, task.repeatEvery ?? 1));
    setRepeatUnit(task.repeatUnit ?? 'day');
    setReminderEnabled(task.reminderEnabled ?? true);
    setReminderOffsetMinutes(task.reminderOffsetMinutes ?? 15);
  }, [task, isOpen, categories]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!task) {
      return;
    }

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      window.alert('Task title is required.');
      return;
    }

    const normalizedCategory = category.trim() || task.category;

    onSave(task.id, {
      title: normalizedTitle,
      description: description.trim(),
      category: normalizedCategory,
      dueDate: dueDate || task.dueDate,
      time: dueTime || 'Anytime',
      recurring: isRecurring,
      repeatEvery: Math.max(1, repeatEvery),
      repeatUnit,
      reminderEnabled,
      reminderOffsetMinutes,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
          />

          <motion.main
            initial={{ y: 70, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 70, opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_28px_56px_-12px_rgba(0,0,0,0.2)] max-h-[100dvh] sm:max-h-[90dvh] flex flex-col"
          >
            <header className="flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-7 pb-4 border-b border-surface-variant/20">
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                type="button"
                aria-label="Close task editor"
              >
                <X size={18} />
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-primary">Edit Task</h2>
              <div className="w-10" />
            </header>

            <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-5 sm:py-6 space-y-5 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-[0.05em] uppercase text-on-surface-variant">Task Name</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-[0.05em] uppercase text-on-surface-variant">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full resize-none bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
                  placeholder="Optional notes"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-[0.05em] uppercase text-on-surface-variant">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
                >
                  {categoryOptions.length === 0 ? (
                    <option value="General">General</option>
                  ) : categoryOptions.map((current) => (
                    <option key={current} value={current}>
                      {current}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar size={16} />
                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">Due Date</span>
                  </div>
                  <input
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="w-full bg-transparent border-none p-0 text-sm text-on-surface focus:ring-0"
                    type="date"
                  />
                </div>

                <div className="bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock3 size={16} />
                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">Due Time</span>
                  </div>
                  <input
                    value={dueTime}
                    onChange={(event) => setDueTime(event.target.value)}
                    className="w-full bg-transparent border-none p-0 text-sm text-on-surface focus:ring-0"
                    type="time"
                  />
                </div>
              </div>

              <div className="bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-tertiary">
                    <Repeat size={16} />
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
                    <div
                      className={cn(
                        'w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                        isRecurring ? 'translate-x-6' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-on-surface-variant">Every</span>
                  <input
                    value={repeatEvery}
                    onChange={(event) => setRepeatEvery(Number(event.target.value) || 1)}
                    min={1}
                    disabled={!isRecurring}
                    className="w-16 bg-surface-container-lowest border border-surface-variant/20 rounded-lg px-2 py-1 text-sm text-center text-on-surface disabled:opacity-50"
                    type="number"
                  />
                  <select
                    value={repeatUnit}
                    onChange={(event) => setRepeatUnit(event.target.value as RepeatUnit)}
                    disabled={!isRecurring}
                    className="ml-auto bg-surface-container-lowest border border-surface-variant/20 rounded-lg px-2.5 py-1.5 text-sm text-on-surface disabled:opacity-50"
                  >
                    <option value="day">Days</option>
                    <option value="week">Weeks</option>
                    <option value="month">Months</option>
                  </select>
                </div>
              </div>

              <div className="bg-surface-container-low border border-surface-variant/20 rounded-xl px-4 py-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Bell size={16} />
                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase">Enable Reminders</span>
                  </div>
                  <button
                    onClick={() => setReminderEnabled((previous) => !previous)}
                    className={cn(
                      'w-12 h-6 rounded-full relative flex items-center px-1 transition-colors',
                      reminderEnabled ? 'bg-primary' : 'bg-surface-variant'
                    )}
                    type="button"
                  >
                    <div
                      className={cn(
                        'w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                        reminderEnabled ? 'translate-x-6' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {reminderEnabled && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-on-surface-variant">Remind me</span>
                    <select
                      value={reminderOffsetMinutes}
                      onChange={(event) => setReminderOffsetMinutes(Number(event.target.value))}
                      className="ml-auto bg-surface-container-lowest border border-surface-variant/20 rounded-lg px-2.5 py-1.5 text-sm text-on-surface"
                    >
                      <option value={0}>At due time</option>
                      <option value={5}>5 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.main>
        </div>
      )}
    </AnimatePresence>
  );
};
