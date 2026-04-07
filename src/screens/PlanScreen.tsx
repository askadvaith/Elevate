import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { cn } from '../lib/utils';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';

interface PlanScreenProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: Task) => void;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({ tasks, onToggleTask, onTaskClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = React.useState(startOfDay(new Date()));

  const pendingTasks = React.useMemo(() => tasks.filter((task) => !task.completed), [tasks]);

  const tasksByDate = React.useMemo(() => {
    return pendingTasks.reduce<Record<string, Task[]>>((groups, task) => {
      if (!groups[task.dueDate]) {
        groups[task.dueDate] = [];
      }

      groups[task.dueDate].push(task);
      return groups;
    }, {});
  }, [pendingTasks]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateTasks = tasksByDate[selectedDateKey] ?? [];

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-4 sm:pt-5 pb-32 space-y-4 sm:space-y-5">
      <section className="bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-on-surface">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth((previous) => subMonths(previous, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentMonth((previous) => addMonths(previous, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dayKey] ?? [];
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonthDay = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={dayKey}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'h-14 rounded-xl border text-left px-1.5 py-1.5 transition-colors relative',
                  isSelected
                    ? 'bg-primary-container border-primary-container text-on-primary-container'
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container-high',
                  !isCurrentMonthDay && !isSelected && 'opacity-45',
                  isToday && !isSelected && 'border-primary/40'
                )}
              >
                <span className="text-[11px] sm:text-xs font-semibold leading-none">{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <span className={cn(
                    'absolute left-1.5 bottom-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                    isSelected
                      ? 'bg-on-primary-container/10 text-on-primary-container'
                      : 'bg-secondary-container text-on-secondary-container'
                  )}>
                    {dayTasks.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-3 px-1">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            {format(selectedDate, 'EEEE, MMM d')}
          </h3>
          <span className="h-px bg-outline-variant/25 flex-grow" />
        </div>

        {selectedDateTasks.length > 0 ? (
          <div className="space-y-2">
            {selectedDateTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={onToggleTask} onClick={onTaskClick} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/30 p-4 text-sm text-on-surface-variant">
            No tasks due on this day.
          </div>
        )}
      </section>
    </main>
  );
};
