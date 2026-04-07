import React from 'react';
import { Linkedin, Github } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsScreenProps {
  recurringPromptsEnabled: boolean;
  onRecurringPromptsChange: (enabled: boolean) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  recurringPromptsEnabled,
  onRecurringPromptsChange,
}) => {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-5 py-4 space-y-6 pb-32">
      <section className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold leading-tight">Developed by Advaith Sanil Kumar</span>
          <span className="text-xs text-on-surface-variant">Connect with me here!</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://www.linkedin.com/in/advaithsanil/" target="_blank" rel="noreferrer" className="p-2 bg-surface-container rounded-full hover:bg-surface-container-high transition-colors text-on-surface">
            <Linkedin size={18} />
          </a>
          <a href="https://github.com/askadvaith" target="_blank" rel="noreferrer" className="p-2 bg-surface-container rounded-full hover:bg-surface-container-high transition-colors text-on-surface">
            <Github size={18} />
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">Workflow</span>
        </div>
        <div className="bg-surface-container-low rounded-xl">
          <div className="px-4 py-3.5 flex items-center justify-between hover:bg-surface-container-high transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold leading-tight">Recurring Task Prompts</span>
              <span className="text-[10px] text-on-surface-variant">Ask before creating the next recurring instance</span>
            </div>
            <button
              onClick={() => onRecurringPromptsChange(!recurringPromptsEnabled)}
              className={cn(
                'w-12 h-6 rounded-full relative flex items-center px-1 transition-colors',
                recurringPromptsEnabled ? 'bg-primary' : 'bg-surface-variant'
              )}
              type="button"
              aria-label="Toggle recurring prompts"
            >
              <div className={cn(
                'w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                recurringPromptsEnabled ? 'translate-x-6' : 'translate-x-0'
              )} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
