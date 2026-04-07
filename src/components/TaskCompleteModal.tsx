import React from 'react';
import { CheckCircle2, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';

interface TaskCompleteModalProps {
  task: Task | null;
  onClose: () => void;
  onRepeat: (id: string) => void;
}

export const TaskCompleteModal: React.FC<TaskCompleteModalProps> = ({ task, onClose, onRepeat }) => {
  if (!task) return null;

  const repeatLabel = task.repeatEvery && task.repeatUnit
    ? `Every ${task.repeatEvery} ${task.repeatUnit}${task.repeatEvery > 1 ? 's' : ''}`
    : 'Every day';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        <motion.main
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-surface-container-lowest rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-8 flex flex-col items-center relative max-h-[95dvh] overflow-y-auto"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-tertiary-container blur-2xl opacity-20 rounded-full scale-75" />
            <div className="relative w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm border border-surface-variant/20">
              <CheckCircle2 size={32} className="text-tertiary fill-current" />
            </div>
          </div>

          <div className="space-y-1 mb-6 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-on-background">Task Complete</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed px-4">
              Finished <span className="font-semibold text-primary">{task.title}</span>.
            </p>
          </div>

          <div className="w-full bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-white/40 mb-5 sm:mb-6">
            <div className="mb-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.15em] text-on-tertiary-fixed-variant uppercase mb-2">Recurrence</p>
              <h3 className="text-lg font-bold text-on-surface">
                {task.recurring ? 'Repeat this task?' : 'Task completed successfully'}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {task.recurring && (
                <button 
                  onClick={() => onRepeat(task.id)}
                  className="group w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-primary text-on-primary flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-sm">Yes, next instance</span>
                    <span className="text-[10px] opacity-80 font-medium">{repeatLabel}</span>
                  </div>
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-secondary-container text-on-secondary-container font-semibold text-sm transition-all active:scale-[0.98]"
              >
                {task.recurring ? 'Not this time' : 'Done'}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2 text-on-surface-variant text-[11px] font-bold tracking-wider uppercase hover:text-primary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.main>
      </div>
    </AnimatePresence>
  );
};
