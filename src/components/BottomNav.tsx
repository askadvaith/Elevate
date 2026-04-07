import React from 'react';
import { Circle, LayoutGrid, Settings, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: 'focus' | 'schedule' | 'tasks' | 'settings';
  onTabChange: (tab: 'focus' | 'schedule' | 'tasks' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'focus', label: 'Focus', icon: Circle },
    { id: 'schedule', label: 'Plan', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: LayoutGrid },
    { id: 'settings', label: 'Set', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 sm:px-4 pb-4 sm:pb-5 pt-2 bg-white/80 backdrop-blur-xl rounded-t-[1.5rem] shadow-[0_-8px_32px_rgba(47,51,52,0.06)] border-t border-surface-variant/20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl px-3 sm:px-4 py-1.5 transition-all duration-300 ease-out",
              isActive 
                ? "bg-primary-fixed text-primary" 
                : "text-on-surface-variant hover:text-primary"
            )}
          >
            <Icon 
              size={20} 
              className={cn("mb-0.5", isActive && "fill-current")} 
            />
            <span className="text-[10px] font-bold tracking-wider uppercase">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
