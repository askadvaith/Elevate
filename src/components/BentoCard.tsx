import React from 'react';
import { cn } from '../lib/utils';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({ children, className }) => {
  return (
    <div className={cn("rounded-xl p-4", className)}>
      {children}
    </div>
  );
};
