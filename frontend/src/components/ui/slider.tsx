import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
}

export function Slider({
  className,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  onValueCommit,
  ...props
}: SliderProps) {
  const pct =
    ((value - Number(min)) / (Number(max) - Number(min))) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange?.(Number(e.target.value))}
      onPointerUp={(e) =>
        onValueCommit?.(Number((e.target as HTMLInputElement).value))
      }
      onKeyUp={(e) =>
        onValueCommit?.(Number((e.target as HTMLInputElement).value))
      }
      style={{
        background: `linear-gradient(to right, var(--primary) ${pct}%, var(--muted) ${pct}%)`,
      }}
      className={cn(
        'h-2 w-full cursor-pointer appearance-none rounded-full outline-none',
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
        '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary',
        className,
      )}
      {...props}
    />
  );
}
