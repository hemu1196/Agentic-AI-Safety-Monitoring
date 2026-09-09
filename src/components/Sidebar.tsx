import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Shield,
  LayoutDashboard,
  ShieldAlert,
  Camera,
  LineChart,
  Milestone,
  ClipboardCheck,
  Briefcase,
  Sparkles,
  Bot,
  FileText,
  Bell,
  Map,
  CloudSun,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadReportsCount, setUnreadReportsCount] = useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      try {
        const raw = localStorage.getItem('siteSentinelWorkerReports');
        if (raw) {
          const reports = JSON.parse(raw);
          const count = reports.filter((r: any) => r.status === 'SUBMITTED').length;
          setUnreadReportsCount(count);
        } else {
          setUnreadReportsCount(0);
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 1500);

    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const managerNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { name: 'Safety Monitoring', path: '/safety', icon: ShieldAlert, roles: ['ADMIN'] },
    { name: 'Worker Entry Safety', path: '/worker-safety', icon: Camera, roles: ['ADMIN'] },
    { name: 'Worker Reports', path: '/worker-reports', icon: ClipboardCheck, roles: ['ADMIN'] },
    { name: 'Risk Analytics', path: '/risk', icon: LineChart, roles: ['ADMIN'] },
    { name: 'Project Monitoring', path: '/project-monitoring', icon: Milestone, roles: ['ADMIN'] },
    { name: 'Resource Management', path: '/resources', icon: Briefcase, roles: ['ADMIN'] },
    { name: 'AI Predictions', path: '/predictions', icon: Sparkles, roles: ['ADMIN'] },
    { name: 'Agentic AI', path: '/agentic-ai', icon: Bot, roles: ['ADMIN'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['ADMIN'] },
    { name: 'Alerts & Notifications', path: '/alerts', icon: Bell, roles: ['ADMIN'] },
    { name: 'Site Map', path: '/map', icon: Map, roles: ['ADMIN'] },
    { name: 'Weather', path: '/weather', icon: CloudSun, roles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const workerNavItems = [
    { name: 'Dashboard', path: '/worker-dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/my-attendance', icon: ClipboardCheck },
    { name: 'My Entry & Exit', path: '/my-entry-history', icon: Calendar },
    { name: 'My Safety Status', path: '/my-safety-status', icon: ShieldCheck },
    { name: 'Report an Issue', path: '/report-issue', icon: ShieldAlert },
    { name: 'My Reports', path: '/my-reports', icon: FileText },
    { name: 'Apply for Leave', path: '/apply-leave', icon: Calendar },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Weather', path: '/weather', icon: CloudSun },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (!user) return null;

  const allowedNavItems = user.role === 'WORKER'
    ? workerNavItems
    : managerNavItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Logo */}
        <div className="flex h-16 items-center px-6 border-b border-slate-200 gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
            <Shield className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-800 tracking-tight leading-none">SITE SENTINEL</div>
            <div className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">AGENTIC AI SAFETY</div>
          </div>
          {/* Close button for mobile */}
          <button onClick={() => setIsOpen(false)} className="ml-auto p-1 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 border-l-2 ${isActive
                  ? 'bg-orange-50 border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.path === '/worker-reports' && unreadReportsCount > 0 && (
                      <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                        🔴 {unreadReportsCount}
                      </span>
                    )}
                  </div>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Profile */}
        <div className="relative border-t border-slate-200 p-4 bg-slate-50/50">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-200/50 cursor-pointer transition-all duration-150"
          >
            <div className={`w-10 h-10 rounded-xl ${user.avatarColor || 'bg-orange-500'} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{user.name}</p>
              <p className="text-[11px] font-medium text-slate-500 truncate">{user.role}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white" />
              <span className="text-[8px] font-bold text-emerald-600 tracking-wider">ONLINE</span>
            </div>
          </div>

          {/* Profile Popover Menu */}
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute bottom-16 left-4 right-4 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 text-sm animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    alert("Profile Settings: A. Rehman (Site Manager)");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-xs">Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    alert("System configuration options");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-xs">Settings</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-xs">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
