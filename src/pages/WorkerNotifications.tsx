import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, MailOpen, Trash2, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface WorkerNotification {
    id: string;
    workerId: string;
    title: string;
    message: string;
    category: 'PERSONAL' | 'WEATHER' | 'LEAVE' | 'CRITICAL';
    timestamp: string;
    isRead: boolean;
}

const SEED_NOTIFS: WorkerNotification[] = [
    {
        id: "NTF-110",
        workerId: "WRK-1001",
        title: "PPE Verification Alert",
        message: "Your hard hat and safety vest were successfully validated at Gate #2. Stay safe today!",
        category: "PERSONAL",
        timestamp: "Today 09:05 AM",
        isRead: false
    },
    {
        id: "NTF-111",
        workerId: "WRK-1001",
        title: "Severe Weather Pre-caution",
        message: "Temperature forecast for Zone B indicates high humidity values. Supervisors are instructed to increase liquid break intervals.",
        category: "WEATHER",
        timestamp: "Today 08:30 AM",
        isRead: false
    },
    {
        id: "NTF-112",
        workerId: "WRK-1001",
        title: "Leave Status Updated",
        message: "Your leave application for Sep 4th (Medical Checkup) is received and pending coordinator review.",
        category: "LEAVE",
        timestamp: "Yesterday 05:00 PM",
        isRead: true
    },
    {
        id: "NTF-113",
        workerId: "WRK-1002",
        title: "PPE Exclusion Flagged",
        message: "Safety harness not detected during Gate entrance. Please update compliance status or visit Safety Office.",
        category: "CRITICAL",
        timestamp: "Today 09:12 AM",
        isRead: false
    }
];

export const WorkerNotifications: React.FC = () => {
    const { user } = useAuth();
    const [notifs, setNotifs] = useState<WorkerNotification[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    const workerId = (user as any)?.workerId || 'WRK-1001';

    useEffect(() => {
        const data = localStorage.getItem('siteSentinelNotifs');
        let loadedNotifs: WorkerNotification[] = [];
        if (!data) {
            localStorage.setItem('siteSentinelNotifs', JSON.stringify(SEED_NOTIFS));
            loadedNotifs = SEED_NOTIFS;
        } else {
            loadedNotifs = JSON.parse(data);
        }
        // Filter to current worker
        const workerNotifs = loadedNotifs.filter(n => n.workerId === workerId);
        setNotifs(workerNotifs);
    }, [workerId]);

    const saveNotifs = (updatedList: WorkerNotification[]) => {
        // Keep notifications for OTHER workers intact in localStorage
        const data = localStorage.getItem('siteSentinelNotifs');
        const allNotifs: WorkerNotification[] = data ? JSON.parse(data) : [];

        // Filter out this worker's current list then concatenate new ones
        const filteredOthers = allNotifs.filter(n => n.workerId !== workerId);
        const finalized = [...filteredOthers, ...updatedList];

        localStorage.setItem('siteSentinelNotifs', JSON.stringify(finalized));
        setNotifs(updatedList);
    };

    const markAllAsRead = () => {
        const updated = notifs.map(n => ({ ...n, isRead: true }));
        saveNotifs(updated);
    };

    const clearAll = () => {
        saveNotifs([]);
    };

    const toggleReadStatus = (id: string) => {
        const updated = notifs.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n);
        saveNotifs(updated);
    };

    const deleteNotif = (id: string) => {
        const updated = notifs.filter(n => n.id !== id);
        saveNotifs(updated);
    };

    const activeNotifs = filter === 'ALL' ? notifs : notifs.filter(n => !n.isRead);

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-500" />
                        <span>My Notifications</span>
                    </h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                        Stay updated with custom supervisor mandates, system notifications, and scheduling announcements.
                    </p>
                </div>

                {/* Global actions */}
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={markAllAsRead}
                        disabled={notifs.filter(n => !n.isRead).length === 0}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50 transition"
                    >
                        Mark all read
                    </button>
                    <button
                        onClick={clearAll}
                        disabled={notifs.length === 0}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50 transition flex items-center gap-1"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear list</span>
                    </button>
                </div>
            </div>

            {/* Filter Segment */}
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/85 w-fit">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${filter === 'ALL'
                            ? 'bg-orange-505 bg-orange-500 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                >
                    All Inbox ({notifs.length})
                </button>
                <button
                    onClick={() => setFilter('UNREAD')}
                    className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${filter === 'UNREAD'
                            ? 'bg-orange-505 bg-orange-500 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                >
                    Unread ({notifs.filter(n => !n.isRead).length})
                </button>
            </div>

            {/* Notifications listings */}
            <div className="space-y-4">
                {activeNotifs.map(n => (
                    <div
                        key={n.id}
                        className={`p-5 rounded-2xl border transition duration-150 flex gap-4 ${n.isRead
                                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500'
                                : 'bg-white dark:bg-slate-900 border-orange-500/30 dark:border-orange-550/30 ring-1 ring-orange-500/10'
                            }`}
                    >
                        {/* Left Category Icon */}
                        <div className={`p-2.5 rounded-xl border shrink-0 h-fit ${n.category === 'CRITICAL'
                                ? 'bg-red-50 border-red-100 text-red-500 dark:bg-red-950/20 dark:border-red-900/30'
                                : n.category === 'WEATHER'
                                    ? 'bg-amber-50 border-amber-100 text-amber-500 dark:bg-amber-950/20 dark:border-amber-900/30'
                                    : n.category === 'LEAVE'
                                        ? 'bg-indigo-50 border-indigo-150 text-indigo-500 dark:bg-indigo-950/20'
                                        : 'bg-orange-50 border-orange-100 text-orange-550 dark:bg-orange-950/20'
                            }`}>
                            {n.category === 'CRITICAL' ? (
                                <ShieldAlert className="w-5 h-5" />
                            ) : n.category === 'WEATHER' ? (
                                <Sparkles className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Bell className="w-5 h-5" />
                            )}
                        </div>

                        {/* Content Details */}
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className={`text-xs font-black uppercase tracking-wider ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-white'
                                    }`}>
                                    {n.title}
                                </h3>
                                <span className="font-mono text-[9px] text-slate-400 font-bold shrink-0">{n.timestamp}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">
                                {n.message}
                            </p>

                            {/* Individual toggler actions */}
                            <div className="flex gap-4 pt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                <button
                                    type="button"
                                    onClick={() => toggleReadStatus(n.id)}
                                    className="hover:text-orange-500 flex items-center gap-1 cursor-pointer transition"
                                >
                                    <MailOpen className="w-3.5 h-3.5" />
                                    <span>{n.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteNotif(n.id)}
                                    className="hover:text-red-500 flex items-center gap-1 cursor-pointer transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {activeNotifs.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-12 text-center rounded-2xl space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase">Inbox Clean</h4>
                        <p className="text-[11px] font-medium text-slate-400 max-w-xs mx-auto">
                            No pending notifications in this section. You are fully up to date!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default WorkerNotifications;
