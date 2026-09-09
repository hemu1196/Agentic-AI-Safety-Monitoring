import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { projectsList } from '../data/mockData';
import { Bell, Search, Sun, Moon, Menu, ChevronDown, CheckCircle, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const {
    currentProjectName,
    changeProject,
    searchQuery,
    setSearchQuery,
    darkMode,
    toggleDarkMode,
    projectData
  } = useProject();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Get active alerts for notification badge
  const activeAlerts = projectData.violations.slice(0, 5);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors duration-150">
      
      {/* Left side: Project Selection & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Hamburger menu for mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="truncate max-w-[140px] md:max-w-[200px]">{currentProjectName}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {showProjectDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProjectDropdown(false)} />
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in duration-100">
                {projectsList.map((project) => (
                  <button
                    key={project}
                    onClick={() => {
                      changeProject(project);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      currentProjectName === project
                        ? 'text-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {project}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search zones, workers, equipment..."
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Right side: Settings, Alerts, Mode, Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Date Display */}
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
          Fri, 28 Aug 2026
        </span>

        {/* AI System Status */}
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          AI System Online
        </span>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full">
              5
            </span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in duration-100">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Recent Alerts & Events</span>
                  <span className="text-[10px] font-bold text-orange-500">5 Active</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 flex items-start gap-2.5 transition-colors">
                      <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                          {alert.violation}
                        </p>
                        <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                          {alert.zone} • {alert.detectedTime}
                        </p>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        alert.severity === 'Critical' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-center">
                  <a href="/alerts" className="text-[10px] font-bold text-orange-500 hover:underline">
                    View all notifications
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user.initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
            <p className="text-[9px] font-medium text-slate-400">Site Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
