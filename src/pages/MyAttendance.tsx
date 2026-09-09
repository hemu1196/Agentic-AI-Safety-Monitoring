import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { initialEntryLogs, EntryLog } from '../data/mockData';
import {
    ClipboardCheck, Clock, Calendar, CheckCircle2,
    Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

export const MyAttendance: React.FC = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<EntryLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const workerId = (user as any)?.workerId || 'WRK-1001';

    useEffect(() => {
        const data = localStorage.getItem('siteSentinelEntryLogs');
        let loadedLogs: EntryLog[] = [];
        if (!data) {
            localStorage.setItem('siteSentinelEntryLogs', JSON.stringify(initialEntryLogs));
            loadedLogs = initialEntryLogs;
        } else {
            loadedLogs = JSON.parse(data);
        }
        // Filter to current worker
        const workerLogs = loadedLogs.filter(l => l.workerId === workerId);
        setLogs(workerLogs);
    }, [workerId]);

    // Calculations
    const presentDays = logs.filter(l => l.accessResult === 'ALLOWED').length;
    const leaveDays = 2; // Seeded value
    const absenceDays = 1; // Seeded value
    const totalHours = logs.filter(l => l.accessResult === 'ALLOWED').reduce((acc, current) => {
        // Generate simulated working hours (normally around 8 hours, or 6.5 hours for partial today)
        if (current.exitTime) {
            return acc + 8;
        }
        return acc + 6.5; // Today's unfinished shift
    }, 0);

    // Apply filters
    const filteredLogs = logs.filter(l => {
        // Search filter
        const matchesSearch = l.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.entryDate.toLowerCase().includes(searchTerm.toLowerCase());

        // Month filter
        let matchesMonth = true;
        if (selectedMonth !== 'All') {
            const monthPart = l.entryDate.split('-')[1]; // YYYY-MM-DD
            const monthMap: Record<string, string> = {
                '01': 'January', '02': 'February', '03': 'March', '04': 'April',
                '05': 'May', '06': 'June', '07': 'July', '08': 'August',
                '09': 'September', '10': 'October', '11': 'November', '12': 'December'
            };
            matchesMonth = monthMap[monthPart] === selectedMonth;
        }

        // Date range filter
        let matchesDateRange = true;
        if (startDate) {
            matchesDateRange = matchesDateRange && l.entryDate >= startDate;
        }
        if (endDate) {
            matchesDateRange = matchesDateRange && l.entryDate <= endDate;
        }

        return matchesSearch && matchesMonth && matchesDateRange;
    });

    // Sort logs by date descending
    const sortedLogs = [...filteredLogs].sort((a, b) => b.entryDate.localeCompare(a.entryDate) || b.entryTime.localeCompare(a.entryTime));

    // Pagination
    const totalPages = Math.ceil(sortedLogs.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedLogs.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-orange-500" />
                    <span>My Attendance Summary</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                    Review your registered entrance scans, standard shifts, and safety scores.
                </p>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI: Present Days */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Present Days</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white block mt-0.5 leading-none">{presentDays}</span>
                        <span className="text-[10px] text-emerald-500 font-bold block mt-1">Active site logs</span>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                {/* KPI: Absences */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Total Absences</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white block mt-0.5 leading-none">{absenceDays}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Unexcused</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-850 p-3 rounded-xl text-slate-500">
                        <Filter className="w-5 h-5" />
                    </div>
                </div>

                {/* KPI: Leave Days */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Approved Leaves</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white block mt-0.5 leading-none">{leaveDays}</span>
                        <span className="text-[10px] text-indigo-500 font-bold block mt-1">Paid time-off</span>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>

                {/* KPI: Working Hours */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans font-semibold">Total Hours</span>
                        <span className="text-2xl font-black text-slate-800 dark:text-white block mt-0.5 leading-none">{totalHours.toFixed(1)}h</span>
                        <span className="text-[10px] text-amber-500 font-bold block mt-1">This month</span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    {/* Search bar */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Zone/Date</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                placeholder="Search..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition"
                            />
                        </div>
                    </div>

                    {/* Month selector dropdown */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition cursor-pointer"
                        >
                            <option value="All">All Months</option>
                            <option value="August">August</option>
                            <option value="July">July</option>
                            <option value="June">June</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition cursor-pointer"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition cursor-pointer"
                        />
                    </div>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-405 text-slate-450 font-bold uppercase">
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Zone Location</th>
                                <th className="py-3 px-4">Entry Scan</th>
                                <th className="py-3 px-4">Exit Scan</th>
                                <th className="py-3 px-4">PPE Score</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-350 font-bold">
                            {currentItems.map(l => (
                                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition duration-150">
                                    <td className="py-3.5 px-4 font-mono font-semibold">{l.entryDate}</td>
                                    <td className="py-3.5 px-4">{l.zone}</td>
                                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{l.entryTime}</td>
                                    <td className="py-3.5 px-4 font-mono text-slate-400">
                                        {l.exitTime ? l.exitTime : <span className="italic text-slate-400">Ongoing</span>}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className={`font-mono text-xs font-black ${l.ppeScore === 100 ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                            {l.ppeScore}%
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${l.status === 'ON SITE'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : l.status === 'ACCESS DENIED'
                                                    ? 'bg-red-50 text-red-650'
                                                    : 'bg-slate-50 text-slate-500 border border-slate-200/50'
                                            }`}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-black">
                                        <span className={l.accessResult === 'ALLOWED' ? 'text-emerald-500' : 'text-red-500'}>
                                            {l.accessResult}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold italic">
                                        No matching attendance logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-bold text-slate-500">
                    <span>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} records
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center justify-center px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-semibold">
                            Page {currentPage} of {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
