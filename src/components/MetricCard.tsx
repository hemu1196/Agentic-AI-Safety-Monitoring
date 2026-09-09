import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  changeText?: string;
  isPositive?: boolean;
  icon: ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  changeText,
  isPositive,
  icon,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-150 ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-50 leading-tight">
            {value}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 p-2.5 rounded-xl text-orange-500 dark:text-orange-400">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-4">
        {changeText && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
            }`}
          >
            {changeText}
          </span>
        )}
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {subtext}
        </span>
      </div>
    </div>
  );
};
