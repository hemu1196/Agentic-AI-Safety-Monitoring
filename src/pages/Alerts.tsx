import React, { useState, useEffect } from 'react';
import { useProject } from '../hooks/useProject';
import { Bell, ShieldAlert, AlertTriangle, Info, CheckCircle, MailOpen, Trash2 } from 'lucide-react';

interface NotificationAlert {
  id: string;
  category: 'Critical' | 'Warning' | 'Information' | 'Resolved';
  message: string;
  timestamp: string;
  isRead: boolean;
  zone?: string;
}

export const Alerts: React.FC = () => {
  const { projectData } = useProject();
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Warning' | 'Information' | 'Resolved'>('All');

  // Load alerts, syncing with active project violations
  useEffect(() => {
    const projectAlerts: NotificationAlert[] = projectData.violations.map(v => ({
      id: v.id,
      category: v.severity === 'Critical' ? 'Critical' : v.severity === 'Warning' ? 'Warning' : 'Resolved',
      message: `${v.violation} detected ${v.status === 'Resolved' ? 'and resolved' : ''} in ${v.zone}.`,
      timestamp: `${v.detectedTime} today`,
      isRead: v.status === 'Resolved',
      zone: v.zone
    }));

    // Append some generic system updates to fulfill the mockup requirements
    const systemAlerts: NotificationAlert[] = [
      { id: 'SYS-101', category: 'Information', message: 'Site Sentinel AI prediction model updated to v1.2.', timestamp: '05:30 today', isRead: false },
      { id: 'SYS-102', category: 'Resolved', message: 'Scheduled lube maintenance completed for Forklift.', timestamp: 'Yesterday', isRead: true },
      { id: 'SYS-103', category: 'Warning', message: 'First floor column casting task is behind schedule by 3 days.', timestamp: '06:00 today', isRead: false },
    ];

    setAlerts([...projectAlerts, ...systemAlerts]);
  }, [projectData]);

  // Mark as read
  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isRead: true } : a)));
  };

  // Mark all as read
  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Delete Alert
  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Filter alerts list
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true;
    return alert.category === filter;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'Critical':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'Information':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'Resolved':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgClass = (alert: NotificationAlert) => {
    if (alert.isRead) return 'bg-white dark:bg-slate-800 opacity-60';
    switch (alert.category) {
      case 'Critical':
        return 'bg-red-50/40 border-l-4 border-red-500 dark:bg-red-950/10';
      case 'Warning':
        return 'bg-amber-50/40 border-l-4 border-amber-500 dark:bg-amber-950/10';
      case 'Information':
        return 'bg-blue-50/40 border-l-4 border-blue-500 dark:bg-blue-950/10';
      case 'Resolved':
        return 'bg-emerald-50/40 border-l-4 border-emerald-500 dark:bg-emerald-950/10';
      default:
        return 'bg-white dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Alerts & Notifications
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Real-time visual feeds violations and system logs.
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-colors cursor-pointer active:scale-95 duration-100"
        >
          <MailOpen className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
        {(['All', 'Critical', 'Warning', 'Information', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-4 transition-all ${getBgClass(
              alert
            )}`}
          >
            <div className="mt-0.5">{getIcon(alert.category)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {alert.category} Alert
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {alert.timestamp}
                </span>
                {!alert.isRead && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                {alert.message}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {!alert.isRead && (
                <button
                  onClick={() => markAsRead(alert.id)}
                  className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] font-bold text-orange-500 rounded-lg transition-colors cursor-pointer"
                >
                  Read
                </button>
              )}
              <button
                onClick={() => deleteAlert(alert.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                title="Delete Alert"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {filteredAlerts.length === 0 && (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm">No notifications found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
