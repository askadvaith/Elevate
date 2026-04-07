import React from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { FocusScreen } from './screens/FocusScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PlanScreen } from './screens/PlanScreen';
import { TasksScreen } from './screens/TasksScreen';
import { NewTaskModal } from './components/NewTaskModal';
import { TaskCompleteModal } from './components/TaskCompleteModal';
import { TaskEditModal } from './components/TaskEditModal';
import { Task, Category, RepeatUnit } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { addDays, addMonths, addWeeks, format, isValid, parseISO, subDays } from 'date-fns';
import { ensureReminderPermission, syncTaskReminders } from './lib/localNotifications';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const INITIAL_TASKS: Task[] = [];

const DEFAULT_CATEGORIES: Category[] = [];

const STORAGE_KEYS = {
  tasks: 'todoapp.tasks.v1',
  categories: 'todoapp.categories.v1',
  preferences: 'todoapp.preferences.v1',
} as const;

interface AppPreferences {
  recurringPromptsEnabled: boolean;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  recurringPromptsEnabled: true,
};

type TaskUpdates = Partial<Pick<
  Task,
  'title' | 'description' | 'category' | 'dueDate' | 'time' | 'recurring' | 'repeatEvery' | 'repeatUnit' | 'reminderEnabled' | 'reminderOffsetMinutes'
>>;

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const normalizeStoredTasks = (input: unknown): Task[] => {
  if (!Array.isArray(input)) {
    return INITIAL_TASKS;
  }

  const normalized = input
    .filter((task) => typeof task === 'object' && task !== null)
    .map((task) => {
      const candidate = task as Partial<Task>;

      return {
        id: candidate.id ?? createId(),
        title: candidate.title ?? 'Untitled Task',
        description: candidate.description ?? '',
        category: candidate.category ?? 'General',
        dueDate: candidate.dueDate ?? format(new Date(), 'yyyy-MM-dd'),
        time: candidate.time ?? 'Anytime',
        completed: Boolean(candidate.completed),
        recurring: Boolean(candidate.recurring),
        repeatEvery: candidate.repeatEvery,
        repeatUnit: candidate.repeatUnit,
        reminderEnabled: candidate.reminderEnabled ?? true,
        reminderOffsetMinutes: candidate.reminderOffsetMinutes ?? 15,
        reminderSentAt: candidate.reminderSentAt,
        streak: candidate.streak,
        impact: candidate.impact,
      } satisfies Task;
    });

  if (!normalized.length) {
    return INITIAL_TASKS;
  }

  return normalized;
};

const createInitialData = () => {
  const storedTasks = normalizeStoredTasks(readStorage(STORAGE_KEYS.tasks, INITIAL_TASKS));
  const storedCategories = readStorage<Category[] | null>(STORAGE_KEYS.categories, null);
  const storedPreferences = readStorage<AppPreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES);

  const taskCategories = storedTasks.map((task) => task.category);
  const categorySource = Array.isArray(storedCategories) && storedCategories.length ? storedCategories : DEFAULT_CATEGORIES;

  return {
    tasks: storedTasks,
    categories: Array.from(new Set([...categorySource, ...taskCategories])),
    preferences: {
      recurringPromptsEnabled: storedPreferences.recurringPromptsEnabled ?? true,
    } satisfies AppPreferences,
  };
};

const createId = () => Math.random().toString(36).slice(2, 11);

export default function App() {
  const initialData = React.useMemo(() => createInitialData(), []);

  const [activeTab, setActiveTab] = React.useState<'focus' | 'schedule' | 'tasks' | 'settings'>('focus');
  const [tasks, setTasks] = React.useState<Task[]>(initialData.tasks);
  const [categories, setCategories] = React.useState<Category[]>(initialData.categories);
  const [preferences, setPreferences] = React.useState<AppPreferences>(initialData.preferences);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = React.useState(false);
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [completedTask, setCompletedTask] = React.useState<Task | null>(null);
  const [showBackExitHint, setShowBackExitHint] = React.useState(false);
  const lastBackPressRef = React.useRef(0);
  const lastHandledBackEventRef = React.useRef(0);
  const backHintTimeoutRef = React.useRef<number | null>(null);
  const canUseSearch = activeTab === 'focus' || activeTab === 'tasks';

  const editingTask = React.useMemo(
    () => (editingTaskId ? tasks.find((task) => task.id === editingTaskId) ?? null : null),
    [tasks, editingTaskId]
  );

  React.useEffect(() => {
    writeStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  React.useEffect(() => {
    writeStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

  React.useEffect(() => {
    writeStorage(STORAGE_KEYS.preferences, preferences);
  }, [preferences]);

  React.useEffect(() => {
    void ensureReminderPermission();
  }, []);

  React.useEffect(() => {
    void syncTaskReminders(tasks);
  }, [tasks]);

  React.useEffect(() => {
    if (!canUseSearch && isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [canUseSearch, isSearchOpen]);

  React.useEffect(() => {
    return () => {
      if (backHintTimeoutRef.current !== null) {
        window.clearTimeout(backHintTimeoutRef.current);
      }
    };
  }, []);

  const showExitHint = React.useCallback(() => {
    setShowBackExitHint(true);
    if (backHintTimeoutRef.current !== null) {
      window.clearTimeout(backHintTimeoutRef.current);
    }

    backHintTimeoutRef.current = window.setTimeout(() => {
      setShowBackExitHint(false);
    }, 1400);
  }, []);

  const handleBackNavigation = React.useCallback(() => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }

    if (isNewTaskModalOpen) {
      setIsNewTaskModalOpen(false);
      return;
    }

    if (editingTaskId) {
      setEditingTaskId(null);
      return;
    }

    if (completedTask) {
      setCompletedTask(null);
      return;
    }

    if (activeTab !== 'focus') {
      setActiveTab('focus');
      return;
    }

    const now = Date.now();
    const isSecondBackPress = now - lastBackPressRef.current < 1400;
    if (isSecondBackPress) {
      if (Capacitor.isNativePlatform()) {
        void CapacitorApp.exitApp();
      }
      return;
    }

    lastBackPressRef.current = now;
    showExitHint();
  }, [activeTab, completedTask, editingTaskId, isNewTaskModalOpen, isSearchOpen, showExitHint]);

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isDisposed = false;
    let appBackHandle: { remove: () => Promise<void> } | null = null;

    const register = async () => {
      appBackHandle = await CapacitorApp.addListener('backButton', () => {
        const now = Date.now();
        if (now - lastHandledBackEventRef.current < 250) {
          return;
        }

        lastHandledBackEventRef.current = now;
        handleBackNavigation();
      });

      if (isDisposed && appBackHandle) {
        void appBackHandle.remove();
      }
    };

    void register();

    return () => {
      isDisposed = true;

      if (appBackHandle) {
        void appBackHandle.remove();
      }
    };
  }, [handleBackNavigation]);

  const handleCreateCategory = React.useCallback((name: string) => {
    const normalized = name.trim().replace(/\s+/g, ' ');
    if (!normalized) {
      return '';
    }

    const existing = categories.find((category) => category.toLowerCase() === normalized.toLowerCase());
    if (existing) {
      return existing;
    }

    setCategories((previous) => [...previous, normalized]);
    return normalized;
  }, [categories]);

  const handleRenameCategory = React.useCallback((previousName: Category, nextName: string) => {
    const normalized = nextName.trim().replace(/\s+/g, ' ');
    if (!normalized) {
      return previousName;
    }

    const existing = categories.find((category) => category.toLowerCase() === normalized.toLowerCase());
    const replacement = existing ?? normalized;

    setCategories((previous) => {
      const mapped = previous.map((category) => (category === previousName ? replacement : category));
      return Array.from(new Set(mapped));
    });

    setTasks((previous) => previous.map((task) => (
      task.category === previousName ? { ...task, category: replacement } : task
    )));

    return replacement;
  }, [categories]);

  const handleUpdateTask = React.useCallback((
    taskId: string,
    updates: TaskUpdates
  ) => {
    const normalizedUpdates: TaskUpdates = { ...updates };

    if (typeof normalizedUpdates.category === 'string') {
      const ensuredCategory = handleCreateCategory(normalizedUpdates.category);
      if (ensuredCategory) {
        normalizedUpdates.category = ensuredCategory;
      }
    }

    if (typeof normalizedUpdates.time === 'string' && !normalizedUpdates.time) {
      normalizedUpdates.time = 'Anytime';
    }

    if (typeof normalizedUpdates.repeatEvery === 'number') {
      normalizedUpdates.repeatEvery = Math.max(1, normalizedUpdates.repeatEvery);
    }

    const shouldResetReminderSentAt = (
      normalizedUpdates.dueDate !== undefined ||
      normalizedUpdates.time !== undefined ||
      normalizedUpdates.reminderEnabled !== undefined ||
      normalizedUpdates.reminderOffsetMinutes !== undefined
    );

    setTasks((previous) => previous.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      return {
        ...task,
        ...normalizedUpdates,
        ...(shouldResetReminderSentAt ? { reminderSentAt: undefined } : {}),
      };
    }));
  }, [handleCreateCategory]);

  const getNextRecurringTask = React.useCallback((task: Task): Task | null => {
    if (!task.recurring) {
      return null;
    }

    const every = Math.max(1, task.repeatEvery ?? 1);
    const unit = task.repeatUnit ?? 'day';
    const baseDate = parseISO(task.dueDate);

    if (!isValid(baseDate)) {
      return null;
    }

    let nextDate = addDays(baseDate, every);
    if (unit === 'week') {
      nextDate = addWeeks(baseDate, every);
    }
    if (unit === 'month') {
      nextDate = addMonths(baseDate, every);
    }

    return {
      ...task,
      id: createId(),
      completed: false,
      dueDate: format(nextDate, 'yyyy-MM-dd'),
      reminderSentAt: undefined,
    };
  }, []);

  const visibleTasks = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => {
      const dueDateLabel = format(parseISO(task.dueDate), 'MMMM d, yyyy');
      const searchable = [task.title, task.description, task.category, task.time, task.dueDate, dueDateLabel]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [tasks, searchQuery]);

  const handleDeleteTask = (id: string) => {
    setEditingTaskId((previous) => (previous === id ? null : previous));
    setTasks((previous) => previous.filter((task) => task.id !== id));
  };

  const handleToggleTask = (id: string) => {
    if (editingTaskId === id) {
      setEditingTaskId(null);
    }

    setTasks((previous) => {
      const currentTask = previous.find((task) => task.id === id);
      if (!currentTask) {
        return previous;
      }

      const newCompleted = !currentTask.completed;
      const updatedTasks = previous.map((task) => (
        task.id === id ? { ...task, completed: newCompleted } : task
      ));

      if (!newCompleted || !currentTask.recurring) {
        return updatedTasks;
      }

      if (preferences.recurringPromptsEnabled) {
        setCompletedTask(currentTask);
        return updatedTasks;
      }

      const nextTask = getNextRecurringTask(currentTask);
      if (!nextTask) {
        return updatedTasks;
      }

      return [nextTask, ...updatedTasks];
    });
  };

  const handleAddTask = (newTask: {
    title: string;
    date: string;
    time: string;
    category: Category;
    recurring: boolean;
    repeatEvery: number;
    repeatUnit: RepeatUnit;
    reminderEnabled: boolean;
    reminderOffsetMinutes: number;
  }) => {
    const ensuredCategory = handleCreateCategory(newTask.category) || newTask.category;

    const task: Task = {
      id: createId(),
      title: newTask.title,
      description: '',
      category: ensuredCategory,
      dueDate: newTask.date || format(new Date(), 'yyyy-MM-dd'),
      time: newTask.time || 'Anytime',
      completed: false,
      recurring: newTask.recurring,
      repeatEvery: newTask.repeatEvery,
      repeatUnit: newTask.repeatUnit,
      reminderEnabled: newTask.reminderEnabled,
      reminderOffsetMinutes: newTask.reminderOffsetMinutes,
      reminderSentAt: undefined,
      streak: 0,
      impact: 10,
    };
    setTasks(prev => [task, ...prev]);
  };

  const handleRepeatTask = (id: string) => {
    setTasks((previous) => {
      const currentTask = previous.find((task) => task.id === id);
      if (!currentTask) {
        return previous;
      }

      const nextTask = getNextRecurringTask(currentTask);
      if (!nextTask) {
        return previous;
      }

      return [nextTask, ...previous];
    });

    setCompletedTask(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar 
        title={activeTab === 'focus' ? 'Today' : activeTab === 'schedule' ? 'Plan' : activeTab === 'tasks' ? 'Tasks' : 'Settings'} 
        onSearchToggle={canUseSearch ? () => {
          setIsSearchOpen((previous) => {
            const next = !previous;

            if (!next) {
              setSearchQuery('');
            }

            return next;
          });
        } : undefined}
        isSearchOpen={canUseSearch && isSearchOpen}
        searchQuery={canUseSearch ? searchQuery : ''}
        onSearchQueryChange={canUseSearch ? setSearchQuery : undefined}
        onSearchClose={canUseSearch ? () => {
          setIsSearchOpen(false);
          setSearchQuery('');
        } : undefined}
      />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'focus' && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <FocusScreen 
                tasks={visibleTasks} 
                onToggleTask={handleToggleTask}
                onTaskClick={(task) => setEditingTaskId(task.id)}
                onAddTask={() => setIsNewTaskModalOpen(true)}
              />
            </motion.div>
          )}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <TasksScreen
                tasks={tasks}
                categories={categories}
                onCreateCategory={handleCreateCategory}
                onRenameCategory={handleRenameCategory}
                onUpdateTask={handleUpdateTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <SettingsScreen
                recurringPromptsEnabled={preferences.recurringPromptsEnabled}
                onRecurringPromptsChange={(value) => {
                  setPreferences((previous) => ({
                    ...previous,
                    recurringPromptsEnabled: value,
                  }));
                }}
              />
            </motion.div>
          )}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <PlanScreen
                tasks={visibleTasks}
                onToggleTask={handleToggleTask}
                onTaskClick={(task) => console.log('Task clicked', task)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <NewTaskModal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onCreate={handleAddTask}
      />

      <TaskEditModal
        isOpen={Boolean(editingTask)}
        task={editingTask}
        categories={categories}
        onClose={() => setEditingTaskId(null)}
        onSave={handleUpdateTask}
      />

      <TaskCompleteModal 
        task={completedTask}
        onClose={() => setCompletedTask(null)}
        onRepeat={handleRepeatTask}
      />

      <AnimatePresence>
        {showBackExitHint && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] rounded-full bg-black/75 text-white text-xs font-semibold px-4 py-2"
          >
            Press back again to exit
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

