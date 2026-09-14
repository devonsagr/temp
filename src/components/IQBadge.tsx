import React from 'react';

interface IQBadgeProps {
  score: number;
  variance?: number;
  size?: 'sm' | 'md' | 'lg';
  rank?: number;
}

export const IQBadge: React.FC<IQBadgeProps> = ({
  score,
  variance,
  size = 'md',
  rank,
}) => {
  const isApex = score >= 135;
  const isHigh = score >= 120;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 font-mono rounded-lg border transition-all duration-150 select-none ${sizeClasses[size]} ${
        isApex
          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/60 font-semibold shadow-sm'
          : isHigh
          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 font-medium shadow-sm'
          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
      }`}
    >
      {rank && (
        <span className="text-[10px] opacity-70 font-sans mr-0.5">#{rank}</span>
      )}
      <span className="tracking-tight font-bold">{score.toFixed(1)}</span>
      <span className="text-[10px] opacity-75 font-semibold">分</span>
      {variance != null && (
        <span className="text-[10px] opacity-60 font-normal">±{variance.toFixed(1)}</span>
      )}
    </div>
  );
};
