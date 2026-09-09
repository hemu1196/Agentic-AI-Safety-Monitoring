import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    FileText, ArrowRight, X, Clock,
    CheckCircle2, AlertTriangle, AlertCircle, Bot
} from 'lucide-react';

interface ReportLocation {
    block: string;
    floor: string;
    zone: string;
}

interface WorkerReport {
    reportId: string;
    workerId: string;
    workerName: string;
    username: string;
    project: string;
    zone: string;
    issueType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: ReportLocation;
    description: string;
    image: string | null;
    aiAnalysis: string | null;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED';
    submittedAt: string;
    adminResponse: string;
}

const baselineReports: WorkerReport[] = [
    {
        reportId: 'ISS-2026-1041',
        workerId: 'WRK-1001',
        workerName: 'Ramesh Kumar',
        username: 'ramesh',
        project: 'Skyline Tower',
        zone: 'Zone B',
        issueType: 'PPE Hazard',
        severity: 'HIGH',
        location: { block: 'Block B', floor: '4th Floor', zone: 'Zone B' },
        description: 'Three workers spotted working near scaffold edge without high-visibility vests.',
        image: null,
        aiAnalysis: 'AI DETECTED: Missing safety vest. PPE Compliance failure. Confidence: 94%.',
        status: 'SUBMITTED',
        submittedAt: '2026-08-31T09:20:00Z',
        adminResponse: ''
    },
    {
        reportId: 'ISS-2026-1042',
        workerId: 'WRK-1002',
        workerName: 'Arjun Singh',
        username: 'arjun',
        project: 'Skyline Tower',
        zone: 'Zone C',
        issueType: 'Wall Crack',
        severity: 'MEDIUM',
        location: { block: 'Block A', floor: '2nd Floor', zone: 'Zone C' },
        description: 'Minor cracking found near the junction column on the northeast corner of Block A.',
        image: null,
        aiAnalysis: 'AI DETECTED: Superficial dry concrete cracking. Non-critical. Confidence: 89%.',
        status: 'RESOLVED',
        submittedAt: '2026-08-30T14:15:00Z',
        adminResponse: 'Inspector verified it as a surface defect. Sealant was applied. Resolved.'
    },
    {
        reportId: 'ISS-2026-1043',
        workerId: 'WRK-1001',
        workerName: 'Ramesh Kumar',
        username: 'ramesh',
        project: 'Skyline Tower',
        zone: 'Zone B',
        issueType: 'Electrical Hazard',
        severity: 'CRITICAL',
        location: { block: 'Block C', floor: '1st Floor', zone: 'Zone B' },
        description: 'Exposed live cables in puddle of standing water near power hub.',
        image: null,
        aiAnalysis: 'AI DETECTED: Standing water hazard + Exposed wiring. Highly critical. Confidence: 99%.',
        status: 'UNDER_REVIEW',
        submittedAt: '2026-08-31T11:05:00Z',
        adminResponse: ''
    }
];

export const MyReports: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<WorkerReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<WorkerReport | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const workerId = (user as any)?.workerId || 'WRK-1001';

    // Load from local storage, write baseline if empty
    const loadReports = () => {
        const raw = localStorage.getItem('siteSentinelWorkerReports');
        let allReports: WorkerReport[] = [];
        if (!raw) {
            localStorage.setItem('siteSentinelWorkerReports', JSON.stringify(baselineReports));
            allReports = baselineReports;
        } else {
            try {
                allReports = JSON.parse(raw);
            } catch (e) {
                allReports = baselineReports;
            }
        }
        // Filter to current worker
        const workerReports = allReports.filter(r => r.workerId === workerId);
        setReports(workerReports);

        // Sync selected report if open to show real-time changes
        if (selectedReport) {
            const updated = allReports.find(r => r.reportId === selectedReport.reportId);
            if (updated) setSelectedReport(updated);
        }
    };

    useEffect(() => {
        loadReports();

        // Listen for events when custom event fires
        const handleStatusChange = () => {
            loadReports();
        };
        window.addEventListener('worker_report_status_changed', handleStatusChange);
        return () => {
            window.removeEventListener('worker_report_status_changed', handleStatusChange);
        };
    }, [workerId, selectedReport?.reportId]);

    // Counts based on current worker's reports
    const countSubmitted = reports.filter(r => r.status === 'SUBMITTED').length;
    const countUnderReview = reports.filter(r => r.status === 'UNDER_REVIEW').length;
    const countInProgress = reports.filter(r => r.status === 'IN_PROGRESS').length;
    const countResolved = reports.filter(r => r.status === 'RESOLVED').length;

    const filteredReports = statusFilter === 'ALL'
        ? reports
        : reports.filter(r => r.status === statusFilter);

    // Formatting timestamp
    const formatTime = (isoString: string) => {
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return isoString;
        }
    };

    const getSeverityBadge = (sev: WorkerReport['severity']) => {
        switch (sev) {
            case 'CRITICAL':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30';
            case 'HIGH':
                return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30';
            case 'MEDIUM':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
            case 'LOW':
                return 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border border-slate-100 dark:border-slate-800';
        }
    };

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300 relative">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <span>My Registered Reports</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                    Monitor your logged site safety concerns, view Vision AI classification, and check responses from dispatchers.
                </p>
            </div>

            {/* KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Count: Submitted */}
                <div
                    onClick={() => setStatusFilter(statusFilter === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${statusFilter === 'SUBMITTED'
                        ? 'bg-slate-100 border-slate-400 dark:bg-slate-800 dark:border-slate-700'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                        }`}
                >
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Submitted</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block leading-none">{countSubmitted}</span>
                </div>

                {/* Count: Under Review */}
                <div
                    onClick={() => setStatusFilter(statusFilter === 'UNDER_REVIEW' ? 'ALL' : 'UNDER_REVIEW')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${statusFilter === 'UNDER_REVIEW'
                        ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                        }`}
                >
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider block">Under Review</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block leading-none">{countUnderReview}</span>
                </div>

                {/* Count: In Progress */}
                <div
                    onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${statusFilter === 'IN_PROGRESS'
                        ? 'bg-blue-50 border-blue-350 bg-blue-500/10 border-blue-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                        }`}
                >
                    <span className="text-[9px] font-bold text-blue-650 dark:text-blue-555 text-blue-500 uppercase tracking-wider block">In Progress</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block leading-none">{countInProgress}</span>
                </div>

                {/* Count: Resolved */}
                <div
                    onClick={() => setStatusFilter(statusFilter === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${statusFilter === 'RESOLVED'
                        ? 'bg-emerald-50 border-emerald-350 bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                        }`}
                >
                    <span className="text-[9px] font-bold text-emerald-650 dark:text-emerald-500 uppercase tracking-wider block">Resolved</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block leading-none">{countResolved}</span>
                </div>
            </div>

            {/* Reports Listing Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
                        {statusFilter === 'ALL' ? 'All Logs' : `${statusFilter.replace('_', ' ')} Logs`} ({filteredReports.length})
                    </h3>
                    {statusFilter !== 'ALL' && (
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className="text-[10px] font-bold text-orange-500 uppercase hover:underline"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 font-bold uppercase">
                                <th className="py-3 px-4">Report ID</th>
                                <th className="py-3 px-4">Date Logged</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Details</th>
                                <th className="py-3 px-4">Severity</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-350 font-bold">
                            {filteredReports.map(r => (
                                <tr key={r.reportId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition duration-150">
                                    <td className="py-3.5 px-4 font-mono text-slate-900 dark:text-white">{r.reportId}</td>
                                    <td className="py-3.5 px-4 font-mono font-semibold">{formatTime(r.submittedAt)}</td>
                                    <td className="py-3.5 px-4">{r.issueType}</td>
                                    <td className="py-3.5 px-4 max-w-[200px] truncate font-medium">{r.description}</td>
                                    <td className="py-3.5 px-4">
                                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${getSeverityBadge(r.severity)}`}>
                                            {r.severity}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${r.status === 'RESOLVED'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : r.status === 'IN_PROGRESS'
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    : r.status === 'UNDER_REVIEW'
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                        : 'bg-slate-50 text-slate-500 border border-slate-200/50 animate-pulse'
                                            }`}>
                                            {r.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => setSelectedReport(r)}
                                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1 ml-auto"
                                        >
                                            <span>Details</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold italic">
                                        No active reports listed.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Drawer Popup */}
            {selectedReport && (
                <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-250">
                    <div className="space-y-6 overflow-y-auto pr-1">
                        {/* Drawer Header */}
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                            <div>
                                <span className="font-mono text-xs font-semibold text-slate-400">{selectedReport.reportId}</span>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase mt-0.5">
                                    Report Specification
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Core Info */}
                        <div className="space-y-3">
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850/80 space-y-3 font-semibold text-xs">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Classification</div>
                                    <div className="text-slate-805 dark:text-slate-200 font-black mt-0.5">{selectedReport.issueType}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timestamp</div>
                                    <div className="text-slate-700 dark:text-slate-300 font-mono mt-0.5">{formatTime(selectedReport.submittedAt)}</div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location context</div>
                                    <div className="text-slate-700 dark:text-slate-350 font-bold mt-0.5">
                                        {selectedReport.location.block && selectedReport.location.floor
                                            ? `${selectedReport.location.block} - ${selectedReport.location.floor} (${selectedReport.location.zone})`
                                            : selectedReport.location.zone
                                        }
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Context Details</div>
                                    <p className="text-slate-655 dark:text-slate-400 leading-relaxed font-semibold mt-1">
                                        {selectedReport.description}
                                    </p>
                                </div>
                            </div>

                            {/* Vision AI Section */}
                            {selectedReport.aiAnalysis && (
                                <div className="border border-indigo-150/40 bg-indigo-50/15 dark:bg-indigo-950/10 p-4 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400">
                                        <Bot className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">
                                            Vision AI Core Diagnostics
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-450 text-[11px] font-mono leading-normal">
                                        {selectedReport.aiAnalysis}
                                    </p>
                                </div>
                            )}

                            {/* Admin Updates Box */}
                            <div className="bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/20 p-4 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                        Admin Updates
                                    </span>
                                </div>

                                <div className="text-xs font-semibold text-slate-750 dark:text-slate-300 leading-relaxed">
                                    {selectedReport.adminResponse || "Awaiting administrator review. A safety supervisor will assess details shortly."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedReport(null)}
                        className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer"
                    >
                        Acknowledge & Close
                    </button>
                </div>
            )}
        </div>
    );
};
