import React, { useState, useEffect } from 'react';
import { Check, Link as LinkIcon, CheckCircle2 } from 'lucide-react';     
import { cn } from '../lib/utils';
import { Task } from '../types';
import { format, isBefore, isValid, parse, parseISO, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onClick?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onClick }) => {
  const dueDate = parseISO(task.dueDate);
  const isOverdue = !task.completed && isBefore(dueDate, startOfDay(new Date()));
  const dueTimeLabel = React.useMemo(() => {
    if (!task.time || task.time === 'Anytime' || task.time === 'Done') {
      return null;
    }

    const parsedTwentyFourHour = parse(task.time, 'HH:mm', new Date());
    if (isValid(parsedTwentyFourHour)) {
      return format(parsedTwentyFourHour, 'h:mm a');
    }

    const parsedTwelveHour = parse(task.time, 'h:mm a', new Date());
    if (isValid(parsedTwelveHour)) {
      return format(parsedTwelveHour, 'h:mm a');
    }

    return task.time;
  }, [task.time]);
  const [isCompleting, setIsCompleting] = useState(false);
  const completionTimeoutRef = React.useRef<number | null>(null);

  // If task status changes from outside (e.g. undone via tasks screen), reset completing state
  useEffect(() => {
    if (!task.completed) {
      setIsCompleting(false);
    }
  }, [task.completed]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const displayCompleted = task.completed || isCompleting;

  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (task.completed || isCompleting) {
      onToggle(task.id);
    } else {
      setIsCompleting(true);

      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }

      completionTimeoutRef.current = window.setTimeout(() => {
        onToggle(task.id);
      }, 380);
    }
  };

  return (
    <motion.div
      layout="position"
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => {
        onClick?.(task);
      }}
      className={cn(
        "group flex items-center gap-3 p-3.5 rounded-xl transition-colors duration-200 cursor-pointer border hover:border-outline-variant/10",
        displayCompleted ? "bg-green-500/10 border-green-500/20" : "bg-surface-container-lowest hover:bg-surface-container-high border-transparent"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggle(e);
        }}
        type="button"
        aria-label={displayCompleted ? 'Mark task as not done' : 'Mark task as completed'}
        className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors duration-200",
          displayCompleted
            ? "bg-green-500 border-green-500"
            : "border-outline/30 group-hover:border-primary"
        )}
      >
        <AnimatePresence initial={false}>
          {displayCompleted ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.65, opacity: 0 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <Check size={14} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="w-3 h-3 rounded-sm bg-primary scale-0 group-hover:scale-100 transition-transform"
            />
          )}
        </AnimatePresence>
      </button>

      <div className="flex-grow overflow-hidden">
        <div className="relative inline-block w-full">
          <motion.h4
            animate={{
              color: displayCompleted ? '#22c55e' : 'var(--md-sys-color-on-surface)',
              opacity: displayCompleted ? 0.6 : 1
            }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="text-sm font-semibold leading-tight truncate"      
          >
            {task.title}
          </motion.h4>
          {displayCompleted && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ originX: 0 }}
              className="absolute left-0 top-1/2 h-[2px] bg-green-500 -translate-y-1/2 rounded-full"
            />
          )}
        </div>
        {task.description && (
          <motion.p
            animate={{ opacity: displayCompleted ? 0.4 : 1 }}
            className="text-[11px] text-on-surface-variant leading-tight mt-0.5 truncate"
          >
            {task.description}
          </motion.p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <motion.span
            animate={{ opacity: displayCompleted ? 0.4 : 1 }}
            className={cn(
              "text-[10px] font-semibold",
              isOverdue ? "text-error" : "text-on-surface-variant"        
            )}
          >
            Due {format(dueDate, 'MMM d, yyyy')}{dueTimeLabel ? ` at ${dueTimeLabel}` : ''}
          </motion.span>
          <motion.span
            animate={{
              opacity: displayCompleted ? 0.4 : 1,
              backgroundColor: displayCompleted ? 'var(--md-sys-color-surface-container)' : 'var(--md-sys-color-secondary-container)',
              color: displayCompleted ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-secondary-container)'
            }}
            className="text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
          >
            {task.category}
          </motion.span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {task.recurring && !displayCompleted && (
          <LinkIcon size={14} className="text-tertiary" />
        )}
        {displayCompleted ? (
          <CheckCircle2 size={16} className="text-green-500/60 fill-current" />
        ) : null}
      </div>
    </motion.div>
  );
};
