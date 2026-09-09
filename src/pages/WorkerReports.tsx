import React, { useState, useEffect } from 'react';
import {
    Search,
    SlidersHorizontal,
    CheckCircle2,
    AlertCircle,
    Clock,
    Inbox,
    ChevronRight,
    X,
    MessageSquare,
    Eye,
    RefreshCw,
    AlertTriangle
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

export const WorkerReports: React.FC = () => {
    const [reports, setReports] = useState<WorkerReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<WorkerReport | null>(null);

    // Detail Modal Edit States
    const [modalStatus, setModalStatus] = useState<WorkerReport['status']>('SUBMITTED');
    const [modalResponse, setModalResponse] = useState('');

    // Filters States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [severityFilter, setSeverityFilter] = useState<string>('ALL');
    const [projectFilter, setProjectFilter] = useState<string>('ALL');
    const [zoneFilter, setZoneFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [showFilters, setShowFilters] = useState(false);

    // Initialize and load from storage
    useEffect(() => {
        const raw = localStorage.getItem('siteSentinelWorkerReports');
        if (!raw) {
            localStorage.setItem('siteSentinelWorkerReports', JSON.stringify(baselineReports));
            setReports(baselineReports);
        } else {
            try {
                setReports(JSON.parse(raw));
            } catch (e) {
                setReports(baselineReports);
            }
        }
    }, []);

    const saveReportsToStorage = (updatedReports: WorkerReport[]) => {
        localStorage.setItem('siteSentinelWorkerReports', JSON.stringify(updatedReports));
        setReports(updatedReports);
        // Dispatch events to notify other components (e.g. Sidebar badge)
        window.dispatchEvent(new Event('worker_report_status_changed'));
    };

    // Stats Counters
    const totalCount = reports.length;
    const submittedCount = reports.filter(r => r.status === 'SUBMITTED').length;
    const underReviewCount = reports.filter(r => r.status === 'UNDER_REVIEW').length;
    const inProgressCount = reports.filter(r => r.status === 'IN_PROGRESS').length;
    const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;

    // Handles Detail Dialog View
    const handleOpenDetails = (report: WorkerReport) => {
        setSelectedReport(report);
        setModalStatus(report.status);
        setModalResponse(report.adminResponse || '');
    };

    const handleCloseDetails = () => {
        setSelectedReport(null);
    };

    // Save admin updates
    const handleSaveChangesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport) return;

        const updated = reports.map(r => {
            if (r.reportId === selectedReport.reportId) {
                return {
                    ...r,
                    status: modalStatus,
                    adminResponse: modalResponse
                };
            }
            return r;
        });

        saveReportsToStorage(updated);

        // Add a worker notification about report update
        try {
            const rawNotifications = localStorage.getItem('siteSentinelWorkerNotifications') || '[]';
            const notifications = JSON.parse(rawNotifications);
            notifications.unshift({
                id: `noti-${Date.now()}`,
                workerId: selectedReport.workerId,
                title: `Report Updated: ${selectedReport.reportId}`,
                message: `Your report for "${selectedReport.issueType}" has been updated to ${modalStatus.replace('_', ' ')}. Response: ${modalResponse || 'No comments provided.'}`,
                timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: false
            });
            localStorage.setItem('siteSentinelWorkerNotifications', JSON.stringify(notifications));
            window.dispatchEvent(new Event('worker_notification_added'));
        } catch (err) {
            console.error('Failed to create notification', err);
        }

        handleCloseDetails();
    };

    // Filtering
    const filtered = reports.filter(r => {
        const sTerm = searchTerm.toLowerCase();
        const searchMatch =
            r.workerName.toLowerCase().includes(sTerm) ||
            r.workerId.toLowerCase().includes(sTerm) ||
            r.reportId.toLowerCase().includes(sTerm) ||
            r.issueType.toLowerCase().includes(sTerm) ||
            r.description.toLowerCase().includes(sTerm);

        const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchSeverity = severityFilter === 'ALL' || r.severity === severityFilter;
        const matchProject = projectFilter === 'ALL' || r.project === projectFilter;
        const matchZone = zoneFilter === 'ALL' || r.zone === zoneFilter;
        const matchType = typeFilter === 'ALL' || r.issueType === typeFilter;

        return searchMatch && matchStatus && matchSeverity && matchProject && matchZone && matchType;
    });

    // CSS classes for Severity
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

    // CSS classes for Status
    const getStatusBadge = (status: WorkerReport['status']) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
            case 'IN_PROGRESS':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30';
            case 'UNDER_REVIEW':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
            case 'SUBMITTED':
                return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 animate-pulse';
        }
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    Worker Safety Reports
                </h1>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Review, analyze, and manage site hazard and incident reports submitted directly by workers.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total Reports */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
                        <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{totalCount}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 p-2 rounded-lg text-slate-500">
                        <Inbox className="w-4 h-4" />
                    </div>
                </div>

                {/* Submitted (New) */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New (Submitted)</p>
                        <p className="text-2xl font-extrabold text-rose-600 mt-1">{submittedCount}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-2 rounded-lg text-rose-500">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                </div>

                {/* Under Review */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Under Review</p>
                        <p className="text-2xl font-extrabold text-amber-500 mt-1">{underReviewCount}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-2 rounded-lg text-amber-500">
                        <Clock className="w-4 h-4 animate-spin-slow" />
                    </div>
                </div>

                {/* In Progress */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
                        <p className="text-2xl font-extrabold text-blue-500 mt-1">{inProgressCount}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-2 rounded-lg text-blue-555 text-blue-500">
                        <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    </div>
                </div>

                {/* Resolved */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
                        <p className="text-2xl font-extrabold text-emerald-500 mt-1">{resolvedCount}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-2 rounded-lg text-emerald-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Filter Options */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-10 border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by worker name, worker ID, report ID, severity, or issue..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                        />
                    </div>

                    {/* Toggle Advanced Filters */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 duration-100 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Advanced Filters Drawer */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700 animate-in fade-in duration-200">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>

                        {/* Severity Filter */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Severity</label>
                            <select
                                value={severityFilter}
                                onChange={e => setSeverityFilter(e.target.value)}
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="ALL">All Severities</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>

                        {/* Project Filter */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Project</label>
                            <select
                                value={projectFilter}
                                onChange={e => setProjectFilter(e.target.value)}
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="ALL">All Projects</option>
                                <option value="Skyline Tower">Skyline Tower</option>
                                <option value="Other Project">Other Project</option>
                            </select>
                        </div>

                        {/* Zone Filter */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Zone</label>
                            <select
                                value={zoneFilter}
                                onChange={e => setZoneFilter(e.target.value)}
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="ALL">All Zones</option>
                                <option value="Zone A">Zone A</option>
                                <option value="Zone B">Zone B</option>
                                <option value="Zone C">Zone C</option>
                            </select>
                        </div>

                        {/* Issue Type Filter */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issue Type</label>
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="ALL">All Incident Types</option>
                                <option value="PPE Hazard">PPE Hazard</option>
                                <option value="Wall Crack">Wall Crack</option>
                                <option value="Electrical Hazard">Electrical Hazard</option>
                                <option value="Scaffold Defect">Scaffold Defect</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Reports Table list */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Report ID</th>
                                <th className="py-3 px-4">Worker ID & Name</th>
                                <th className="py-3 px-4">Issue Type</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Severity</th>
                                <th className="py-3 px-4">Submitted Time</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-350">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-white dark:bg-slate-800">
                                        No matching worker safety reports found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((report) => (
                                    <tr key={report.reportId} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{report.reportId}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-850 dark:text-slate-100">{report.workerName}</div>
                                            <div className="text-[10px] text-slate-400 font-bold">{report.workerId}</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{report.issueType}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-700 dark:text-slate-300">
                                                {report.location.block && report.location.floor ? `${report.location.block} - ${report.location.floor}` : report.location.zone}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.project}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${getSeverityBadge(report.severity)}`}>
                                                {report.severity}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono">
                                            {new Date(report.submittedAt).toLocaleDateString()} {new Date(report.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(report.status)}`}>
                                                {report.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => handleOpenDetails(report)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 duration-100 shadow-xs cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Review</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform scale-100 transition-all duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={`w-5 h-5 ${selectedReport.severity === 'CRITICAL' || selectedReport.severity === 'HIGH' ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                        Safety incident Review ({selectedReport.reportId})
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        Submitted by {selectedReport.workerName} ({selectedReport.workerId})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseDetails}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSaveChangesSubmit}>
                            <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
                                {/* Meta details grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-semibold">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Project</span>
                                        <span className="text-slate-850 dark:text-slate-200">{selectedReport.project}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Zone</span>
                                        <span className="text-slate-850 dark:text-slate-200">{selectedReport.zone}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Specific Location</span>
                                        <span className="text-slate-850 dark:text-slate-200">
                                            {selectedReport.location.block} - {selectedReport.location.floor}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Submitted At</span>
                                        <span className="text-slate-850 dark:text-slate-200">
                                            {new Date(selectedReport.submittedAt).toLocaleDateString()} {new Date(selectedReport.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Incident Description */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</h4>
                                    <div className="bg-slate-50/50 dark:bg-slate-950/10 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-350 font-medium leading-relaxed">
                                        {selectedReport.description}
                                    </div>
                                </div>

                                {/* Evidence Image Block */}
                                {selectedReport.image ? (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Photo Evidence</h4>
                                        <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 bg-slate-950 flex items-center justify-center">
                                            <img
                                                src={selectedReport.image}
                                                alt="Incident Evidence"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mock Safety Image (Sentinel AI Scan)</h4>
                                        <div className="bg-slate-950 rounded-xl p-6 border border-slate-850 flex flex-col items-center justify-center text-center relative max-h-48">
                                            {/* Bounding box mock overlay over safety visual placeholder */}
                                            <div className="border border-orange-500 w-28 h-20 absolute top-5 animate-pulse flex items-start justify-start p-1 bg-orange-500/10 rounded">
                                                <span className="bg-orange-500 text-white font-bold text-[8px] px-1 rounded uppercase tracking-wider">
                                                    HAZARD: {selectedReport.issueType}
                                                </span>
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-500 mb-2 mt-16 scale-75">
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                            <p className="text-white text-xs font-bold uppercase tracking-wider">Visual Evidence Camera Offline</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5">Report submitted via mobile client text logs.</p>
                                        </div>
                                    </div>
                                )}

                                {/* AI Auto diagnostics */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">AI Copilot Analysis</h4>
                                    <div className="bg-slate-50 dark:bg-slate-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-3.5 rounded-xl text-xs space-y-2">
                                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                                            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.375 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <span>Sentinel Visual Core (Confidence Checklist)</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal font-medium pl-6">
                                            {selectedReport.aiAnalysis || 'No auto diagnostic payload linked to this text log.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Form Controls: Select Status & Admin Response */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Set Resolution status</label>
                                        <select
                                            value={modalStatus}
                                            onChange={e => setModalStatus(e.target.value as any)}
                                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        >
                                            <option value="SUBMITTED">Submitted</option>
                                            <option value="UNDER_REVIEW">Under Review</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Admin Response Note</label>
                                        <textarea
                                            value={modalResponse}
                                            onChange={e => setModalResponse(e.target.value)}
                                            placeholder="Add updates, feedback comments, or resolution details here..."
                                            rows={2}
                                            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseDetails}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 duration-100 cursor-pointer"
                                >
                                    Save Updates
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
