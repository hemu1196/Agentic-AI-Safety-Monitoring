import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normStatus = status.toUpperCase();

  const getStyle = () => {
    switch (normStatus) {
      case 'COMPLETED':
      case 'RESOLVED':
      case 'PASS':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
      case 'IN PROGRESS':
      case 'ON TRACK':
      case 'NORMAL':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30';
      case 'DELAYED':
      case 'CRITICAL':
      case 'FAIL':
      case 'SHORTAGE RISK':
        return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30';
      case 'PENDING':
      case 'WARNING':
      case 'IDLE':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      case 'MAINTENANCE':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStyle()}`}>
      {status}
    </span>
  );
};
