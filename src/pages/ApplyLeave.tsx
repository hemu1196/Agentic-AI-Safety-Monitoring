import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, AlertTriangle, FileText, Send } from 'lucide-react';

interface LeaveRequest {
    id: string;
    workerId: string;
    workerName: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    reason: string;
    details: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminComments?: string;
    appliedDate: string;
}

const SEED_LEAVES: LeaveRequest[] = [
    {
        id: "LV-1002",
        workerId: "WRK-1001",
        workerName: "Ramesh Kumar",
        startDate: "2026-09-04",
        endDate: "2026-09-04",
        durationDays: 1,
        reason: "Medical Checkup",
        details: "Routine annual checkup at civil hospital.",
        status: "PENDING",
        appliedDate: "2026-08-28"
    },
    {
        id: "LV-0992",
        workerId: "WRK-1001",
        workerName: "Ramesh Kumar",
        startDate: "2026-08-12",
        endDate: "2026-08-13",
        durationDays: 2,
        reason: "Family Event",
        details: "Attending elder brother's wedding ceremony in home town.",
        status: "APPROVED",
        adminComments: "Approved. Backup worker assigned to Zone B shift. Enjoy the ceremony!",
        appliedDate: "2026-08-01"
    },
    {
        id: "LV-1025",
        workerId: "WRK-1002",
        workerName: "Arjun Singh",
        startDate: "2026-09-10",
        endDate: "2026-09-12",
        durationDays: 3,
        reason: "Personal Leave",
        details: "Urgent property registration work required in village.",
        status: "APPROVED",
        adminComments: "Handover completed. Approved.",
        appliedDate: "2026-08-25"
    }
];

export const ApplyLeave: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'FORM' | 'HISTORY'>('FORM');
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

    // Form states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('Medical Leave');
    const [details, setDetails] = useState('');
    const [computedSpan, setComputedSpan] = useState<number>(0);

    const workerId = (user as any)?.workerId || 'WRK-1001';
    const workerName = user?.name || 'Ramesh Kumar';

    useEffect(() => {
        const data = localStorage.getItem('siteSentinelLeaves');
        let loadedLeaves: LeaveRequest[] = [];
        if (!data) {
            localStorage.setItem('siteSentinelLeaves', JSON.stringify(SEED_LEAVES));
            loadedLeaves = SEED_LEAVES;
        } else {
            loadedLeaves = JSON.parse(data);
        }
        // Filter to current worker
        const workerLeaves = loadedLeaves.filter(l => l.workerId === workerId);
        setLeaves(workerLeaves);
    }, [workerId, activeTab]);

    // Calculate day span automatically when dates change
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end >= start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
                setComputedSpan(diffDays);
            } else {
                setComputedSpan(0);
            }
        } else {
            setComputedSpan(0);
        }
    }, [startDate, endDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (computedSpan <= 0) {
            alert("Error: End Date must be after or equal to Start Date.");
            return;
        }

        const existing = localStorage.getItem('siteSentinelLeaves');
        const leavesList: LeaveRequest[] = existing ? JSON.parse(existing) : [];

        const newRequest: LeaveRequest = {
            id: `LV-${Math.floor(1000 + Math.random() * 9000)}`,
            workerId,
            workerName,
            startDate,
            endDate,
            durationDays: computedSpan,
            reason,
            details,
            status: 'PENDING',
            appliedDate: new Date().toISOString().split('T')[0]
        };

        leavesList.push(newRequest);
        localStorage.setItem('siteSentinelLeaves', JSON.stringify(leavesList));

        alert("Leave Request successfully submitted!");

        // Clear form and go to history tab
        setStartDate('');
        setEndDate('');
        setDetails('');
        setReason('Medical Leave');
        setActiveTab('HISTORY');
    };

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-orange-500" />
                    <span>Apply for Time-Off / Leave</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                    Submit absence requests, calculate calendar spans, and view administrator approvals.
                </p>
            </div>

            {/* Navigation Sub-Tabs Segment */}
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/85 w-fit">
                <button
                    onClick={() => setActiveTab('FORM')}
                    className={`px-6 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'FORM'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                >
                    Submit Request
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`px-6 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'HISTORY'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                >
                    Leave History ({leaves.length})
                </button>
            </div>

            {/* Tabs Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {activeTab === 'FORM' ? (
                    <>
                        {/* Left Column: Form submissions */}
                        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-4">
                            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                                Leave Request Specifications
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition cursor-pointer"
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                                {/* Reason Category dropdown */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason Category</label>
                                    <select
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition cursor-pointer"
                                    >
                                        <option value="Medical Leave">Medical Leave</option>
                                        <option value="Casual Leave">Casual Leave</option>
                                        <option value="Personal Leave">Personal Leave</option>
                                        <option value="Quarterly Safety Vacation">Quarterly Safety Vacation</option>
                                    </select>
                                </div>

                                {/* Computed Calendar Days Span */}
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-400 uppercase text-[9px] tracking-wider">Computed Duration:</span>
                                    <span className={`text-[13px] font-black ${computedSpan > 0 ? 'text-orange-500' : 'text-slate-500'}`}>
                                        {computedSpan} {computedSpan === 1 ? 'Day' : 'Days'}
                                    </span>
                                </div>
                            </div>

                            {/* Details text area */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Context / Reason Details</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                    placeholder="Explain why you need time off. This description is sent directly to safety supervisors."
                                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition resize-none leading-relaxed"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                <span>Submit Leave Application</span>
                            </button>
                        </form>

                        {/* Right Column: Information card */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-3xl space-y-4">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Leave Policies</h4>
                                <p className="text-[11px] font-medium text-slate-400 leading-relaxed font-semibold">
                                    Workers are allowed up to 12 days of paid casual/medical leave per year. Any safety exclusions issued automatically block paid time-off validation.
                                </p>
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px] text-slate-405 text-slate-400 space-y-1">
                                    <div>· Medical certifications required for &gt; 3 days.</div>
                                    <div>· Request must be submitted 3 working days in advance.</div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
                            My Leave Request History
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 font-bold uppercase">
                                        <td className="py-3 px-4">Request ID</td>
                                        <td className="py-3 px-4">Applied Date</td>
                                        <td className="py-3 px-4">Category</td>
                                        <td className="py-3 px-4">Date Span</td>
                                        <td className="py-3 px-4">Total Days</td>
                                        <td className="py-3 px-4">Reason Details</td>
                                        <td className="py-3 px-4 text-center">Status</td>
                                        <td className="py-3 px-4 text-right">Admin Comments</td>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-350 font-bold">
                                    {leaves.map(l => (
                                        <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition duration-150">
                                            <td className="py-4 px-4 font-mono text-slate-900 dark:text-white">{l.id}</td>
                                            <td className="py-4 px-4 font-mono font-semibold">{l.appliedDate}</td>
                                            <td className="py-4 px-4">{l.reason}</td>
                                            <td className="py-4 px-4 font-mono text-slate-500">
                                                {l.startDate} to {l.endDate}
                                            </td>
                                            <td className="py-4 px-4 font-mono text-slate-800 dark:text-slate-200">{l.durationDays} Days</td>
                                            <td className="py-4 px-4 max-w-[200px] truncate font-medium">{l.details}</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${l.status === 'APPROVED'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : l.status === 'REJECTED'
                                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right max-w-[250px] truncate text-slate-500 font-semibold italic">
                                                {l.adminComments || <span className="text-slate-400">No response yet</span>}
                                            </td>
                                        </tr>
                                    ))}

                                    {leaves.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold italic">
                                                No leave history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
