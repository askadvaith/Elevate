import React from 'react';
import { Plus, Pencil, Check, X, FolderKanban, Trash2, RotateCcw, Calendar, Clock3 } from 'lucide-react';
import { Category, Task } from '../types';
import { cn } from '../lib/utils';
import { format, isValid, parse, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface TasksScreenProps {
  tasks: Task[];
  categories: Category[];
  onCreateCategory: (name: string) => string;
  onRenameCategory: (previousName: Category, nextName: string) => string;
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'category' | 'dueDate' | 'time'>>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  categories,
  onCreateCategory,
  onRenameCategory,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(categories[0] ?? null);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [isRenamingCategory, setIsRenamingCategory] = React.useState(false);
  const [renameCategoryName, setRenameCategoryName] = React.useState('');
  const [taskTitleDrafts, setTaskTitleDrafts] = React.useState<Record<string, string>>({});
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!categories.length) {
      setSelectedCategory(null);
      return;
    }

    if (!selectedCategory || !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  React.useEffect(() => {
    if (selectedCategory) {
      setRenameCategoryName(selectedCategory);
    }
  }, [selectedCategory]);

  const pendingTasksCount = (category: Category) =>
    tasks.filter((task) => task.category === category && !task.completed).length;

  const selectedCategoryTasks = React.useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return tasks
      .filter((task) => task.category === selectedCategory)
      .sort((left, right) => {
        if (left.completed !== right.completed) {
          return Number(left.completed) - Number(right.completed);
        }

        return left.dueDate.localeCompare(right.dueDate);
      });
  }, [selectedCategory, tasks]);

  const handleCreateCategory = () => {
    const created = onCreateCategory(newCategoryName);
    if (!created) {
      return;
    }

    setSelectedCategory(created);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleRenameCategory = () => {
    if (!selectedCategory) {
      return;
    }

    const renamed = onRenameCategory(selectedCategory, renameCategoryName);
    if (!renamed) {
      return;
    }

    setSelectedCategory(renamed);
    setIsRenamingCategory(false);
  };

  const getDraftTitle = (task: Task) => taskTitleDrafts[task.id] ?? task.title;

  const saveTaskTitle = (task: Task) => {
    const nextTitle = getDraftTitle(task).trim();
    if (!nextTitle || nextTitle === task.title) {
      setTaskTitleDrafts((previous) => ({
        ...previous,
        [task.id]: task.title,
      }));
      return;
    }

    onUpdateTask(task.id, { title: nextTitle });
  };

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

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-5 py-4 space-y-6 pb-32">
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">Categories</span>
          <button
            onClick={() => setIsAddingCategory((previous) => !previous)}
            className="text-[10px] font-bold text-primary flex items-center gap-0.5 hover:opacity-70"
            type="button"
          >
            <Plus size={14} />
            NEW
          </button>
        </div>

        {isAddingCategory && (
          <div className="bg-surface-container-low rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
              placeholder="Category name"
              type="text"
              autoFocus
            />
            <button
              onClick={handleCreateCategory}
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

        <div className="bg-surface-container-low rounded-xl p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'shrink-0 px-3 py-2 rounded-xl text-left border transition-colors',
                    isSelected
                      ? 'bg-primary-container border-primary/40 text-on-primary-container'
                      : 'bg-surface-container-lowest border-transparent text-on-surface-variant hover:border-surface-variant/30'
                  )}
                  type="button"
                >
                  <p className="text-xs font-semibold leading-tight">{category}</p>
                  <p className="text-[10px] mt-0.5 opacity-80">{pendingTasksCount(category)} active</p>
                </button>
              );
            })}
          </div>
        </div>

        {selectedCategory && (
          <div className="bg-surface-container-low rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                Rename Category
              </span>
              {!isRenamingCategory ? (
                <button
                  onClick={() => setIsRenamingCategory(true)}
                  className="text-primary text-xs font-semibold flex items-center gap-1"
                  type="button"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              ) : null}
            </div>

            {isRenamingCategory ? (
              <div className="flex items-center gap-2">
                <input
                  value={renameCategoryName}
                  onChange={(event) => setRenameCategoryName(event.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
                  type="text"
                />
                <button
                  onClick={handleRenameCategory}
                  className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center"
                  type="button"
                  aria-label="Save category name"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsRenamingCategory(false);
                    setRenameCategoryName(selectedCategory);
                  }}
                  className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center"
                  type="button"
                  aria-label="Cancel category rename"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium text-on-surface">{selectedCategory}</p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
            {selectedCategory ? `${selectedCategory} Tasks` : 'Tasks'}
          </span>
          <span className="text-[10px] font-semibold text-on-surface-variant">
            {selectedCategoryTasks.length} total
          </span>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3 space-y-2">
          {selectedCategoryTasks.length > 0 ? (
            selectedCategoryTasks.map((task) => (
              <div key={task.id} className="bg-surface-container-lowest rounded-xl border border-surface-variant/20 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={cn(
                        "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                        task.completed ? "bg-green-500 border-green-500" : "border-outline/50 hover:border-primary"
                      )}
                    >
                      {task.completed && <Check size={10} className="text-white" />}
                    </button>
                    <input
                      value={getDraftTitle(task)}
                      disabled={task.completed}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setTaskTitleDrafts((previous) => ({
                          ...previous,
                          [task.id]: nextValue,
                        }));
                      }}
                      onBlur={() => saveTaskTitle(task)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.currentTarget.blur();
                        }
                      }}
                      className={cn(
                        'w-full bg-transparent border-none p-0 text-sm font-semibold text-on-surface focus:ring-0',
                        task.completed && 'line-through opacity-50 cursor-not-allowed'
                      )}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-on-surface-variant shrink-0 mt-0.5">
                    {format(parseISO(task.dueDate), 'MMM d')}
                  </span>
                </div>

                <div className="space-y-2 border-t border-surface-variant/10 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 w-full">
                      <FolderKanban size={14} className="text-on-surface-variant shrink-0" />
                      <select
                        value={task.category}
                        disabled={task.completed}
                        onChange={(event) => {
                          onUpdateTask(task.id, { category: event.target.value });
                        }}
                        className={cn(
                          "w-full bg-surface-container-low border border-surface-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/20",
                          task.completed && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    {task.completed && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="p-1.5 text-on-surface-variant hover:text-primary bg-surface-container-low rounded-md transition-colors"
                          title="Mark as not done"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task.id)}
                          className="p-1.5 text-error hover:bg-error/10 bg-error/5 rounded-md transition-colors"
                          title="Delete task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-on-surface-variant shrink-0" />
                      <input
                        value={task.dueDate}
                        type="date"
                        disabled={task.completed}
                        onChange={(event) => {
                          if (!event.target.value) {
                            return;
                          }

                          onUpdateTask(task.id, { dueDate: event.target.value });
                        }}
                        className={cn(
                          'w-full bg-surface-container-low border border-surface-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/20',
                          task.completed && 'opacity-50 cursor-not-allowed'
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={14} className="text-on-surface-variant shrink-0" />
                      <input
                        value={toTimeInputValue(task.time)}
                        type="time"
                        disabled={task.completed}
                        onChange={(event) => {
                          onUpdateTask(task.id, { time: event.target.value || 'Anytime' });
                        }}
                        className={cn(
                          'w-full bg-surface-container-low border border-surface-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/20',
                          task.completed && 'opacity-50 cursor-not-allowed'
                        )}
                        title="Leave empty for anytime"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant px-2 py-1">
              No tasks in this category yet.
            </p>
          )}
        </div>
      </section>

      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setTaskToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-xl max-w-sm w-full border border-surface-variant/20"
            >
              <h3 className="text-lg font-bold text-on-surface mb-2">Delete Task</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Are you sure you want to permanently delete this task? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteTask(taskToDelete);
                    setTaskToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-error text-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
