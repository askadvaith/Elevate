import React from 'react';
import { Calendar, Search, X } from 'lucide-react';

interface TopBarProps {
  title: string;
  onSearchToggle?: () => void;
  isSearchOpen?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  onSearchClose?: () => void;
  onCalendar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onSearchToggle,
  isSearchOpen,
  searchQuery,
  onSearchQueryChange,
  onSearchClose,
  onCalendar,
}) => {
  return (
    <header className="w-full sticky top-0 z-40 tonal-shift border-b border-surface-variant/30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button 
            onClick={onCalendar}
            className="p-1.5 hover:bg-surface-container-high transition-all duration-150 active:scale-95 rounded-full text-primary"
          >
            <Calendar size={20} />
          </button>
          <h1 className="text-lg font-bold text-primary tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {onSearchToggle && (
            <button 
              onClick={onSearchToggle}
              className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full active:scale-95"
              aria-label="Search tasks"
            >
              <Search size={20} />
            </button>
          )}
        </div>
      </div>

      {isSearchOpen && onSearchQueryChange && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest rounded-xl border border-surface-variant/40 px-3 py-2.5">
            <Search size={16} className="text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange?.(event.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm text-on-surface placeholder:text-outline focus:ring-0"
              placeholder="Search tasks, category, or date"
              type="text"
              autoFocus
            />
            <button
              onClick={onSearchClose}
              className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
