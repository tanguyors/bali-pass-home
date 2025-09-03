import React from 'react';
import { cn } from '@/lib/utils';

interface SegmentOption {
  id: string;
  label: string;
  icon?: string;
}

interface FilterSegmentControlProps {
  options: SegmentOption[];
  selectedId: string;
  onSelectionChange: (id: string) => void;
  className?: string;
}

export const FilterSegmentControl: React.FC<FilterSegmentControlProps> = ({
  options,
  selectedId,
  onSelectionChange,
  className
}) => {
  return (
    <div className={cn(
      "inline-flex items-center bg-card/60 backdrop-blur-sm rounded-full p-0.5 border border-border/50 w-full max-w-full overflow-hidden",
      className
    )}>
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => onSelectionChange(option.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-1 justify-center",
            "relative overflow-hidden min-w-0",
            selectedId === option.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.icon && <span className="text-xs flex-shrink-0">{option.icon}</span>}
          <span className="truncate">{option.label}</span>
          
          {/* Ripple effect */}
          {selectedId === option.id && (
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};