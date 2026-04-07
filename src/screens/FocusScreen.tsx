import React from 'react';
import { Plus } from 'lucide-react';
import { TaskItem } from '../components/TaskItem';
import { Task } from '../types';
import { format, isBefore, isToday, parseISO, startOfDay } from 'date-fns';

interface FocusScreenProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export const FocusScreen: React.FC<FocusScreenProps> = ({ tasks, onToggleTask, onTaskClick, onAddTask }) => {
  const pendingTasks = React.useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const today = startOfDay(new Date());

  const overdueTasks = pendingTasks
    .filter((task) => isBefore(parseISO(task.dueDate), today))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

  const upcomingTasks = pendingTasks
    .filter((task) => !isBefore(parseISO(task.dueDate), today))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

  const tasksByDate = upcomingTasks.reduce<Record<string, Task[]>>((groups, task) => {
    if (!groups[task.dueDate]) {
      groups[task.dueDate] = [];
    }

    groups[task.dueDate].push(task);
    return groups;
  }, {});

  const sortedDates = Object.keys(tasksByDate).sort();

  const toSectionTitle = (dateKey: string) => {
    const parsedDate = parseISO(dateKey);

    if (isToday(parsedDate)) {
      return `Today • ${format(parsedDate, 'MMM d')}`;
    }

    return format(parsedDate, 'EEEE, MMM d');
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5 pb-32">
      <section className="mb-5 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter mb-1">Welcome to Elevate!</h2>
        <p className="text-sm text-on-surface-variant font-medium">
          {pendingTasks.length} tasks to complete.
        </p>
      </section>

      <section className="space-y-6">
        {overdueTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-error">Overdue</h3>
              <span className="h-px bg-error/20 flex-grow" />
            </div>
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={onToggleTask} onClick={onTaskClick} />
              ))}
            </div>
          </div>
        )}

        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="space-y-2">
            <div className="flex items-center gap-3 px-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">{toSectionTitle(dateKey)}</h3>
              <span className="h-px bg-outline-variant/25 flex-grow" />
            </div>
            <div className="space-y-2">
              {tasksByDate[dateKey].map((task) => (
                <TaskItem key={task.id} task={task} onToggle={onToggleTask} onClick={onTaskClick} />
              ))}
            </div>
          </div>
        ))}

        {pendingTasks.length === 0 && (
          <div className="text-center py-8 text-on-surface-variant text-sm font-medium">
            No pending tasks.
          </div>
        )}
      </section>

      <button 
        onClick={onAddTask}
        className="fixed bottom-24 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:opacity-90 active:scale-90 transition-all duration-200"
      >
        <Plus size={24} />
      </button>
    </main>
  );
};
