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
      "inline-flex items-center bg-card/60 backdrop-blur-sm rounded-full p-1 border border-border/50",
      className
    )}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelectionChange(option.id)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "relative overflow-hidden",
            selectedId === option.id
              ? "bg-primary text-primary-foreground shadow-sm scale-105"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.icon && <span className="text-xs">{option.icon}</span>}
          <span>{option.label}</span>
          
          {/* Ripple effect */}
          {selectedId === option.id && (
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};