import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  icon?: string;
  isSelected?: boolean;
  isRemovable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  isSelected = false,
  isRemovable = false,
  onClick,
  onRemove,
  variant = 'default',
  className
}) => {
  if (isRemovable) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
        "bg-primary/10 text-primary border border-primary/20",
        "animate-fade-in",
        className
      )}>
        {icon && <span className="text-xs">{icon}</span>}
        <span className="truncate">{label}</span>
        <Button
          variant="ghost"
          size="icon"
          className="w-3 h-3 p-0 hover:bg-primary/20 rounded-full flex-shrink-0"
          onClick={onRemove}
        >
          <X className="w-2 h-2" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 hover:scale-105 flex-shrink-0",
        variant === 'compact' ? 'px-2.5 py-1 text-xs h-7' : 'px-3 py-1.5 text-sm h-8',
        isSelected 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "bg-card/60 text-foreground hover:bg-card border border-border/50",
        "active:scale-95",
        className
      )}
    >
      {icon && <span className="text-xs flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </Button>
  );
};