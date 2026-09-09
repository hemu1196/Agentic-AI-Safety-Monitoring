import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../hooks/useProject';
import { Worker, EntryLog } from '../data/mockData';
import { workerService, AccessRules } from '../features/worker-entry/services/workerService';
import { StatusBadge } from '../components/StatusBadge';
import {
  LogIn,
  Users,
  ShieldAlert,
  AlertOctagon,
  ShieldCheck,
  Camera,
  StopCircle,
  RefreshCw,
  Search,
  Plus,
  FileSpreadsheet,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Settings,
  Download,
  Printer,
  Eye,
  Sliders,
  ChevronDown,
  Mail,
  User,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const WorkerEntrySafety: React.FC = () => {
  const { projectData } = useProject();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'live-entry' | 'directory' | 'logs' | 'access' | 'reports'>('live-entry');

  // Database States (loaded from workerService)
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [logs, setLogs] = useState<EntryLog[]>([]);
  const [rules, setRules] = useState<AccessRules>({
    requireWorkerId: true,
    requireActiveStatus: true,
    requirePpeVerification: true,
    blockPpeBelow75: true,
    autoDenyExpired: true,
    supervisorOverride: false
  });
  const [summaryStats, setSummaryStats] = useState({
    todayEntries: 124,
    currentlyOnSite: 98,
    pendingCheck: 6,
    accessDeniedToday: 4,
    ppeCompliance: 91
  });

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync databases on mount and actions
  const reloadData = () => {
    const w = workerService.getWorkers();
    const l = workerService.getLogs();
    const r = workerService.getAccessRules();
    const s = workerService.getSummaryStats();
    setWorkers(w);
    setLogs(l);
    setRules(r);
    setSummaryStats(s);
  };

  useEffect(() => {
    reloadData();
  }, [projectData]);

  // ==========================================
  // TAB 1: LIVE ENTRY SCANNER STATES & ACTIONS
  // ==========================================
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Worker | null>(null);
  const [scannedLogs, setScannedLogs] = useState<Omit<EntryLog, 'id'> | null>(null);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [denialReason, setDenialReason] = useState('PPE not compliant');

  // Clean up camera stream when active tab changes or on component unmount
  useEffect(() => {
    if (activeTab !== 'live-entry') {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setCameraActive(false);
      setScanning(false);
      setScanResult(null);
      setScannedLogs(null);
    }
  }, [activeTab, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(false);
    setScanResult(null);
    setScannedLogs(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      setScanning(true);
    } catch (err) {
      console.warn('Camera blocked, mock scan simulation active.');
      setCameraError(true);
      setCameraActive(true);
      setScanning(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
    setScanning(false);
    setScanResult(null);
    setScannedLogs(null);
  };

  const handleScanWorker = () => {
    if (!cameraActive) {
      startCamera();
    }
    setScanning(true);
    setScanResult(null);
    setScannedLogs(null);

    // Simulate scanning delay
    setTimeout(() => {
      // Find a random worker who is not archived
      const activeWorkers = workers.filter(w => !w.isArchived);
      if (activeWorkers.length === 0) return;
      const randWorker = activeWorkers[Math.floor(Math.random() * activeWorkers.length)];

      // Calculate mock PPE score
      const ppeKeys = Object.keys(randWorker.ppeRequirements) as (keyof typeof randWorker.ppeRequirements)[];
      const reqCount = ppeKeys.filter(k => randWorker.ppeRequirements[k]).length;

      // Simulate helmet/gloves checked or unchecked randomly
      const mockPpe = {
        helmet: randWorker.ppeRequirements.helmet ? Math.random() > 0.05 : false,
        vest: randWorker.ppeRequirements.vest ? Math.random() > 0.05 : false,
        shoes: randWorker.ppeRequirements.shoes ? Math.random() > 0.1 : false,
        gloves: randWorker.ppeRequirements.gloves ? Math.random() > 0.2 : false,
        badge: randWorker.ppeRequirements.badge ? Math.random() > 0.02 : false
      };

      const detectedCount = (mockPpe.helmet ? 1 : 0) + (mockPpe.vest ? 1 : 0) + (mockPpe.shoes ? 1 : 0) + (mockPpe.gloves ? 1 : 0) + (mockPpe.badge ? 1 : 0);
      const ppeScore = reqCount > 0 ? Math.round((detectedCount / reqCount) * 100) : 100;

      // Determine default authorization based on rules
      let accessResult: 'ALLOWED' | 'DENIED' = 'ALLOWED';
      let denialReason: string | null = null;

      if (rules.requireActiveStatus && randWorker.status === 'INACTIVE') {
        accessResult = 'DENIED';
        denialReason = 'Worker inactive';
      } else if (rules.requireWorkerId && !randWorker.workerId) {
        accessResult = 'DENIED';
        denialReason = 'Manual denial';
      } else if (rules.blockPpeBelow75 && ppeScore < 75) {
        accessResult = 'DENIED';
        denialReason = 'PPE not compliant';
      } else if (rules.autoDenyExpired && new Date(randWorker.accessExpiryDate) < new Date()) {
        accessResult = 'DENIED';
        denialReason = 'Access expired';
      } else if (randWorker.accessStatus === 'REVOKED') {
        accessResult = 'DENIED';
        denialReason = 'Access Revoked';
      }

      setScanResult(randWorker);
      setScannedLogs({
        workerId: randWorker.workerId,
        workerName: randWorker.name,
        entryDate: new Date().toISOString().split('T')[0],
        entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        exitDate: null,
        exitTime: null,
        zone: randWorker.assignedZone,
        ppeScore,
        accessResult,
        status: accessResult === 'ALLOWED' ? 'ON SITE' : 'ACCESS DENIED',
        denialReason
      });
      setScanning(false);
    }, 1200);
  };

  const handleAllowEntry = () => {
    if (!scannedLogs) return;
    const finalLog = { ...scannedLogs, accessResult: 'ALLOWED' as const, status: 'ON SITE' as const, denialReason: null };
    workerService.addEntryLog(finalLog);
    triggerToast(`Entry allowed for ${finalLog.workerName}.`);
    stopCamera();
    reloadData();
  };

  const handleDenyEntryConfirm = () => {
    if (!scannedLogs) return;
    const finalLog = { ...scannedLogs, accessResult: 'DENIED' as const, status: 'ACCESS DENIED' as const, denialReason };
    workerService.addEntryLog(finalLog);
    setDenyModalOpen(false);
    triggerToast(`Worker access denied: ${denialReason}`, 'error');
    stopCamera();
    reloadData();
  };

  // Activity Feed simulator
  const handleSimulateNewEntry = () => {
    const activeWorkers = workers.filter(w => !w.isArchived);
    if (activeWorkers.length === 0) return;
    const randWorker = activeWorkers[Math.floor(Math.random() * activeWorkers.length)];

    const randomAllowed = Math.random() > 0.2;
    const mockLog: Omit<EntryLog, 'id'> = {
      workerId: randWorker.workerId,
      workerName: randWorker.name,
      entryDate: new Date().toISOString().split('T')[0],
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exitDate: null,
      exitTime: null,
      zone: randWorker.assignedZone,
      ppeScore: randomAllowed ? 90 + Math.floor(Math.random() * 11) : 50 + Math.floor(Math.random() * 20),
      accessResult: randomAllowed ? 'ALLOWED' : 'DENIED',
      status: randomAllowed ? 'ON SITE' : 'ACCESS DENIED',
      denialReason: randomAllowed ? null : 'PPE not compliant'
    };

    workerService.addEntryLog(mockLog);
    triggerToast(
      randomAllowed ? `Simulated allowed entry: ${randWorker.name}` : `Simulated denied entry: ${randWorker.name}`,
      randomAllowed ? 'success' : 'warning'
    );
    reloadData();
  };

  // ==========================================
  // TAB 2: WORKER DIRECTORY MODALS & SEARCH
  // ==========================================
  const [directorySearch, setDirectorySearch] = useState('');
  const [debouncedDirectorySearch, setDebouncedDirectorySearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDirectorySearch(directorySearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [directorySearch]);

  const [directoryFilter, setDirectoryFilter] = useState<'All' | 'Active' | 'Inactive' | 'On Site' | 'Off Site' | 'Access Revoked' | 'Archived'>('All');
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  // Form Registration Fields
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regRole, setRegRole] = useState('Construction Worker');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regProject, setRegProject] = useState('Skyline Tower – Phase II');
  const [regZone, setRegZone] = useState('Zone B');
  const [regLevel, setRegLevel] = useState<'General Access' | 'Zone Specific' | 'Restricted Access'>('General Access');
  const [regStart, setRegStart] = useState('2026-08-28');
  const [regExpiry, setRegExpiry] = useState('2026-12-31');
  const [regNotes, setRegNotes] = useState('');
  const [regEmergencyName, setRegEmergencyName] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regPpe, setRegPpe] = useState({ helmet: true, vest: true, shoes: true, gloves: true, badge: true });

  const generateWorkerId = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setRegId(`WRK-${rand}`);
  };

  const handleRegisterWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regId.trim() || !regPhone.trim()) {
      triggerToast('Please complete all required fields.', 'error');
      return;
    }

    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      workerId: regId,
      name: regName,
      role: regRole,
      phone: regPhone,
      email: regEmail,
      assignedProject: regProject,
      assignedZone: regZone,
      status: 'ACTIVE',
      accessStatus: 'AUTHORIZED',
      accessLevel: regLevel,
      accessStartDate: regStart,
      accessExpiryDate: regExpiry,
      registrationDate: new Date().toISOString().split('T')[0],
      photo: null,
      ppeRequirements: regPpe,
      isArchived: false,
      safetyNotes: regNotes,
      emergencyContactName: regEmergencyName,
      emergencyContactNumber: regEmergencyPhone
    };

    workerService.saveWorker(newWorker);
    setRegisterModalOpen(false);
    triggerToast('Worker registered successfully.');
    // Reset fields
    setRegName('');
    setRegId('');
    setRegPhone('');
    setRegEmail('');
    setRegEmergencyName('');
    setRegEmergencyPhone('');
    setRegNotes('');
    reloadData();
  };

  const handleEditWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    workerService.saveWorker(selectedWorker);
    setEditModalOpen(false);
    triggerToast('Worker details updated successfully.');
    reloadData();
  };

  const handleArchiveWorker = () => {
    if (!selectedWorker) return;
    workerService.archiveWorker(selectedWorker.id);
    setArchiveModalOpen(false);
    triggerToast('Worker archived successfully.', 'warning');
    reloadData();
  };

  const handleRestoreWorker = (id: string) => {
    workerService.restoreWorker(id);
    triggerToast('Worker restored successfully.');
    reloadData();
  };

  // Filter Worker Directory
  const filteredWorkers = workers.filter(w => {
    // Check search
    const matchSearch =
      w.name.toLowerCase().includes(debouncedDirectorySearch.toLowerCase()) ||
      w.workerId.toLowerCase().includes(debouncedDirectorySearch.toLowerCase());

    // Check zones filter
    const matchZone = zoneFilter === 'All Zones' || w.assignedZone === zoneFilter;

    // Check status filter
    let matchStatus = true;
    if (directoryFilter === 'Archived') {
      matchStatus = w.isArchived;
    } else {
      if (w.isArchived) return false; // hide archived unless chosen explicitly
      if (directoryFilter === 'Active') matchStatus = w.status === 'ACTIVE' || w.status === 'ON SITE';
      if (directoryFilter === 'Inactive') matchStatus = w.status === 'INACTIVE';
      if (directoryFilter === 'On Site') matchStatus = w.status === 'ON SITE';
      if (directoryFilter === 'Off Site') matchStatus = w.status === 'ACTIVE' || w.status === 'OFF SITE';
      if (directoryFilter === 'Access Revoked') matchStatus = w.accessStatus === 'REVOKED';
    }

    return matchSearch && matchZone && matchStatus;
  });

  // ==========================================
  // TAB 3: ENTRY & EXIT LOGS STATS & ACTIONS
  // ==========================================
  const [logsSearch, setLogsSearch] = useState('');
  const [debouncedLogsSearch, setDebouncedLogsSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLogsSearch(logsSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [logsSearch]);

  const [dateRange, setDateRange] = useState<'Today' | 'Yesterday' | '7Days' | '30Days'>('Today');
  const [logsFilterZone, setLogsFilterZone] = useState('All Zones');
  const [logsFilterStatus, setLogsFilterStatus] = useState('All');
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitLog, setExitLog] = useState<EntryLog | null>(null);

  const handleMarkExitConfirm = () => {
    if (!exitLog) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    workerService.markExit(exitLog.id, todayStr, timeStr);
    setExitModalOpen(false);
    triggerToast(`Worker exit recorded for ${exitLog.workerName}.`);
    reloadData();
  };

  const filteredLogs = logs.filter(log => {
    // Search filter
    const matchSearch =
      log.workerName.toLowerCase().includes(debouncedLogsSearch.toLowerCase()) ||
      log.workerId.toLowerCase().includes(debouncedLogsSearch.toLowerCase());

    // Zone filter
    const matchZone = logsFilterZone === 'All Zones' || log.zone === logsFilterZone;

    // Status filter
    const matchStatus = logsFilterStatus === 'All' || log.status === logsFilterStatus;

    // Date Range filters
    let matchDate = true;
    const targetDate = '2026-08-28'; // Today's date setting
    if (dateRange === 'Today') {
      matchDate = log.entryDate === targetDate;
    } else if (dateRange === 'Yesterday') {
      matchDate = log.entryDate === '2026-08-27';
    } else if (dateRange === '7Days') {
      matchDate = log.entryDate >= '2026-08-22';
    }

    return matchSearch && matchZone && matchStatus && matchDate;
  });

  // ==========================================
  // TAB 4: ACCESS POLICIES SETTINGS
  // ==========================================
  const [grantAccessModal, setGrantAccessModal] = useState(false);
  const [revokeAccessModal, setRevokeAccessModal] = useState(false);
  const [selectedAccessWorker, setSelectedAccessWorker] = useState<Worker | null>(null);

  // Access Level inputs
  const [grantLevel, setGrantLevel] = useState<'General Access' | 'Zone Specific' | 'Restricted Access'>('General Access');
  const [grantZone, setGrantZone] = useState('Zone B');
  const [grantExpiry, setGrantExpiry] = useState('2026-12-31');
  const [revokeReason, setRevokeReason] = useState('Safety Violation');

  const handleGrantAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccessWorker) return;

    const updated = {
      ...selectedAccessWorker,
      accessStatus: 'AUTHORIZED' as const,
      accessLevel: grantLevel,
      assignedZone: grantLevel === 'Zone Specific' ? grantZone : selectedAccessWorker.assignedZone,
      accessExpiryDate: grantExpiry,
      status: 'ACTIVE' as const
    };
    workerService.saveWorker(updated);
    setGrantAccessModal(false);
    triggerToast(`Access granted successfully for ${selectedAccessWorker.name}.`);
    reloadData();
  };

  const handleRevokeAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccessWorker) return;

    const updated = {
      ...selectedAccessWorker,
      accessStatus: 'REVOKED' as const,
      status: 'INACTIVE' as const,
      safetyNotes: `Access revoked on 2026-08-28. Reason: ${revokeReason}`
    };
    workerService.saveWorker(updated);
    setRevokeAccessModal(false);
    triggerToast(`Access revoked successfully for ${selectedAccessWorker.name}.`, 'error');
    reloadData();
  };

  const handleRuleToggle = (key: keyof AccessRules) => {
    const updated = { ...rules, [key]: !rules[key] };
    workerService.saveAccessRules(updated);
    setRules(updated);
    triggerToast('Access control rules updated.');
  };

  // ==========================================
  // TAB 5: REPORTS & ATTENDANCE GRAPH CHARTS
  // ==========================================
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);

  // Hourly Entry Data Recharts
  const hourlyData = [
    { hour: '07:00', entries: 15 },
    { hour: '08:00', entries: 42 },
    { hour: '09:00', entries: 35 },
    { hour: '10:00', entries: 12 },
    { hour: '11:00', entries: 8 },
    { hour: '12:00', entries: 12 },
  ];

  // Entry vs Exit Recharts
  const entryExitData = [
    { name: 'Mon', entries: 110, exits: 95 },
    { name: 'Tue', entries: 115, exits: 102 },
    { name: 'Wed', entries: 124, exits: 110 },
    { name: 'Thu', entries: 120, exits: 115 },
    { name: 'Fri', entries: 124, exits: 98 },
  ];

  // Access result Recharts
  const accessResultPie = [
    { name: 'Allowed Entries', value: 124, color: '#10b981' },
    { name: 'Access Denied', value: 4, color: '#ef4444' }
  ];

  // PPE trend Recharts
  const ppeTrendData = [
    { day: 'Mon', score: 89 },
    { day: 'Tue', score: 90 },
    { day: 'Wed', score: 88 },
    { day: 'Thu', score: 92 },
    { day: 'Fri', score: 91 },
  ];

  // CSV Generator
  const handleExportCSV = () => {
    let csvContent = 'Date,Worker ID,Name,Entry Time,Exit Time,Zone,PPE Score,Result,Status,Denial Reason\r\n';
    filteredLogs.forEach(l => {
      csvContent += `"${l.entryDate}","${l.workerId}","${l.workerName}","${l.entryTime}","${l.exitTime || '--'}","${l.zone}","${l.ppeScore}%","${l.accessResult}","${l.status}","${l.denialReason || '--'}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `worker_entry_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('CSV report exported successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    triggerToast('Mock PDF Generated. Downloading file...');
    const blob = new Blob([`SITE SENTINEL WORKER ENTRY SAFETY REPORT\n======================================\nGenerated: August 28, 2026 20:53\nProject: Skyline Tower\n\nTotal Entries: ${summaryStats.todayEntries}\nCurrently On Site: ${summaryStats.currentlyOnSite}\nAccess Denials: ${summaryStats.accessDeniedToday}\nAvg PPE Compliance: ${summaryStats.ppeCompliance}%`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Worker_Entry_Safety_Report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 ${toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
          <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 animate-ping' : toast.type === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-ping'}`} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Worker Entry Safety
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Manage worker registration, site entry, access permissions, PPE safety verification, and attendance records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-100"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Worker</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-100"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Top 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Entries */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Entries</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{summaryStats.todayEntries}</p>
            <span className="text-[9px] font-bold text-emerald-600 mt-2 block">+12% vs yesterday</span>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg text-orange-500">
            <LogIn className="w-4 h-4" />
          </div>
        </div>

        {/* Currently On Site */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currently On Site</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{summaryStats.currentlyOnSite}</p>
            <span className="text-[9px] font-semibold text-slate-400 mt-2 block">26 workers exited</span>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg text-orange-500">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Pending Safety Check */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Check</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{summaryStats.pendingCheck}</p>
            <span className="text-[9px] font-semibold text-amber-500 mt-2 block">Requires verification</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg text-amber-500">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Access Denied Today */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Denied</p>
            <p className="text-2xl font-extrabold text-red-500 mt-1">{summaryStats.accessDeniedToday}</p>
            <span className="text-[9px] font-semibold text-red-400 mt-2 block">Unauthorized attempts</span>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded-lg text-red-500">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        {/* PPE Compliance Average */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PPE Compliance</p>
            <p className="text-2xl font-extrabold text-emerald-500 mt-1">{summaryStats.ppeCompliance}%</p>
            <span className="text-[9px] font-semibold text-emerald-600 mt-2 block">Today's avg compliance</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg text-emerald-500">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {(['live-entry', 'directory', 'logs', 'access', 'reports'] as const).map((tab) => {
          let label = '';
          if (tab === 'live-entry') label = 'Live Entry';
          else if (tab === 'directory') label = 'Worker Management';
          else if (tab === 'logs') label = 'Entry & Exit Logs';
          else if (tab === 'access') label = 'Access Management';
          else if (tab === 'reports') label = 'Reports';

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === tab
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          TAB 1: LIVE ENTRY CONTENT
          ========================================== */}
      {activeTab === 'live-entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Camera Scanner */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gate Access Terminal</h3>
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Scanner Camera Telemetry</h2>
            </div>

            {/* Video preview / Simulated feed */}
            <div className="relative w-full h-[320px] md:h-[380px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 my-4">
              {cameraActive ? (
                <>
                  {!cameraError && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950">
                      {/* Bounding box graphics */}
                      <div className="border border-emerald-500 w-36 h-56 absolute top-12 left-1/3 animate-pulse">
                        <span className="absolute -top-5 left-0 bg-emerald-500 text-[8px] font-bold text-white px-1 py-0.2 rounded">
                          Worker Verified
                        </span>
                      </div>
                      <Camera className="w-12 h-12 text-slate-600 mb-2" />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Gate Vision Simulator Active</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Running local camera loop fallback.</p>
                    </div>
                  )}

                  {scanning && (
                    <div className="absolute left-0 right-0 h-0.5 bg-orange-500 animate-[bounce_2s_infinite] shadow-[0_0_8px_#f97316]" />
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-950/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-white text-[10px] z-10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Vision Frame Active
                    </span>
                    <span>30 FPS · Latency 14ms</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 select-none">
                  <Camera className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Scanner Ready</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                    Start camera or scan a worker badge barcode to run safety checks.
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Scanner</span>
                </button>
              )}
              <button
                onClick={handleScanWorker}
                disabled={!cameraActive}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                <span>Scan Worker ID</span>
              </button>
            </div>

            {/* Simulated actions if worker verification displays */}
            {scanResult && scannedLogs && (
              <div className="mt-4 p-4 border border-orange-200 bg-orange-50/20 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Worker ID Badge Scanned</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{scannedLogs.workerName} ({scannedLogs.workerId})</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scannedLogs.accessResult === 'ALLOWED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {scannedLogs.accessResult === 'ALLOWED' ? 'Access Authorized' : 'Access Suspended'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAllowEntry}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Allow Entry
                  </button>
                  <button
                    onClick={() => setDenyModalOpen(true)}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Deny Entry
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Worker details and Live Activity Feed */}
          <div className="space-y-6">
            {/* Worker Safety Verification Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Check</h3>

              {scanResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {scanResult.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{scanResult.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{scanResult.workerId} · {scanResult.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400">Assigned Zone:</span>
                      <span className="text-slate-700 dark:text-slate-300 block font-bold">{scanResult.assignedZone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Access Expiry:</span>
                      <span className="text-slate-700 dark:text-slate-300 block font-bold">{scanResult.accessExpiryDate}</span>
                    </div>
                  </div>

                  {/* PPE Checklist */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PPE Checklist</span>
                    <div className="space-y-1 text-xs">
                      {Object.keys(scanResult.ppeRequirements).map((ppeKey) => {
                        const required = scanResult.ppeRequirements[ppeKey as keyof typeof scanResult.ppeRequirements];
                        const detected = scannedLogs ? (scannedLogs.ppeScore >= 80) : required;
                        return (
                          <div key={ppeKey} className="flex justify-between items-center py-1">
                            <span className="capitalize text-slate-600 dark:text-slate-300 font-medium">{ppeKey}</span>
                            <span className={`text-[9px] font-bold ${detected ? 'text-emerald-500' : 'text-red-500'}`}>
                              {detected ? '✓ DETECTED' : '✕ MISSING'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety Risk index */}
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-400">Safety Risk Score:</span>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-slate-800 dark:text-white">
                        {scannedLogs ? (100 - scannedLogs.ppeScore) : 12}
                      </span>
                      <span className="text-[10px] text-slate-400"> / 100</span>
                      <span className="text-[9px] font-bold text-emerald-500 block uppercase">Low Risk</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 italic text-xs font-medium">
                  Scan a worker ID card to run checklists.
                </div>
              )}
            </div>

            {/* Live activity feed */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-[300px]">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Gate Events</h3>
                  <button
                    onClick={handleSimulateNewEntry}
                    className="flex items-center gap-1 text-[10px] font-bold text-orange-500 hover:text-orange-600 tracking-wider"
                  >
                    <span>Simulate Entry</span>
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[190px] pr-1">
                  {logs.slice(-5).reverse().map((log) => (
                    <div key={log.id} className="text-xs flex justify-between items-start gap-2 border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 block">{log.entryTime}</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {log.workerName} {log.accessResult === 'ALLOWED' ? 'entered' : 'denied entry to'} {log.zone}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold shrink-0 ${log.accessResult === 'ALLOWED' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {log.accessResult === 'ALLOWED' ? '✓ Allowed' : '✕ Denied'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: WORKER DIRECTORY CONTENT
          ========================================== */}
      {activeTab === 'directory' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Active Worker Management</h2>
              <p className="text-xs font-semibold text-slate-400">Total registered database: {workers.length} records</p>
            </div>
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Worker</span>
            </button>
          </div>

          {/* Directory Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            {/* Search Input */}
            <div className="relative col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search by worker name or Worker ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Status Selector */}
            <select
              value={directoryFilter}
              onChange={(e) => setDirectoryFilter(e.target.value as any)}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Workers</option>
              <option value="Active">Active Directory</option>
              <option value="Inactive">Inactive</option>
              <option value="On Site">On Site Only</option>
              <option value="Off Site">Off Site Only</option>
              <option value="Access Revoked">Access Revoked</option>
              <option value="Archived">Archived Workers</option>
            </select>

            {/* Zone Selector */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All Zones">All Zones</option>
              <option value="Zone A">Zone A – Foundation</option>
              <option value="Zone B">Zone B – Structural</option>
              <option value="Zone C">Zone C – Material Storage</option>
              <option value="Zone D">Zone D – Equipment Area</option>
              <option value="Zone E">Zone E – Worker Entry</option>
              <option value="Zone F">Zone F – Restricted Area</option>
            </select>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Worker ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                {filteredWorkers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center font-bold text-xs">
                        {w.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400">{w.workerId}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white">{w.name}</td>
                    <td className="py-2.5 px-4">{w.role}</td>
                    <td className="py-2.5 px-4">{w.assignedZone}</td>
                    <td className="py-2.5 px-4 font-mono">{w.phone}</td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${w.accessStatus === 'AUTHORIZED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {w.accessStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedWorker(w); setDetailsModalOpen(true); }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedWorker(w); setEditModalOpen(true); }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded"
                          title="Edit Profile"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        {w.accessStatus === 'AUTHORIZED' ? (
                          <button
                            onClick={() => { setSelectedAccessWorker(w); setRevokeAccessModal(true); }}
                            className="p-1 hover:bg-red-50 text-red-500 rounded"
                            title="Revoke Site Access"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedAccessWorker(w); setGrantAccessModal(true); }}
                            className="p-1 hover:bg-emerald-50 text-emerald-500 rounded"
                            title="Restore Access"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                        {w.isArchived ? (
                          <button
                            onClick={() => handleRestoreWorker(w.id)}
                            className="p-1 hover:bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold"
                            title="Restore Archived Worker"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedWorker(w); setArchiveModalOpen(true); }}
                            className="p-1 hover:bg-red-50 text-red-500 rounded"
                            title="Archive Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                      No matching worker profiles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: ENTRY & EXIT LOGS CONTENT
          ========================================== */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Attendance Entry & Exit Logs</h2>
            <p className="text-xs font-semibold text-slate-400">Total logs: {filteredLogs.length} items matched</p>
          </div>

          {/* Logs Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                placeholder="Search worker name or Worker ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="Today">Today (28 Aug 2026)</option>
              <option value="Yesterday">Yesterday</option>
              <option value="7Days">Last 7 Days</option>
            </select>

            {/* Zone Selector */}
            <select
              value={logsFilterZone}
              onChange={(e) => setLogsFilterZone(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All Zones">All Zones</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
              <option value="Zone D">Zone D</option>
              <option value="Zone E">Zone E</option>
              <option value="Zone F">Zone F</option>
            </select>

            {/* Result Status Selector */}
            <select
              value={logsFilterStatus}
              onChange={(e) => setLogsFilterStatus(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Results</option>
              <option value="ON SITE">On Site</option>
              <option value="EXITED">Exited</option>
              <option value="ACCESS DENIED">Denied Entry</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Worker ID</th>
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Entry Time</th>
                  <th className="py-3 px-4">Exit Time</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">PPE Score</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                {filteredLogs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 px-4 font-mono">{log.entryDate}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{log.workerId}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white">{log.workerName}</td>
                    <td className="py-2.5 px-4 font-mono">{log.entryTime}</td>
                    <td className="py-2.5 px-4 font-mono">{log.exitTime || '--'}</td>
                    <td className="py-2.5 px-4">{log.zone}</td>
                    <td className="py-2.5 px-4 font-mono font-bold">{log.ppeScore}%</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${log.accessResult === 'ALLOWED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {log.accessResult}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {log.status === 'ON SITE' && (
                        <button
                          onClick={() => { setExitLog(log); setExitModalOpen(true); }}
                          className="px-2 py-1 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Mark Exit
                        </button>
                      )}
                      {log.status === 'ACCESS DENIED' && log.denialReason && (
                        <span className="text-[10px] text-red-500 font-bold italic" title={log.denialReason}>
                          {log.denialReason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                      No entry/exit logs found matching the filter constraints.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: ACCESS CONTROL MANAGEMENT
          ========================================== */}
      {activeTab === 'access' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules and settings toggles */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Settings</h3>
              </div>
              <h2 className="text-md font-bold text-slate-800 dark:text-white mt-1">Access Control Rules Policy</h2>
            </div>

            {/* Checkbox Switches */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Require valid Worker ID</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Checks digit format in directories</span>
                </div>
                <input
                  type="checkbox"
                  checked={rules.requireWorkerId}
                  onChange={() => handleRuleToggle('requireWorkerId')}
                  className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Require active employment status</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Blocks inactive worker profile access</span>
                </div>
                <input
                  type="checkbox"
                  checked={rules.requireActiveStatus}
                  onChange={() => handleRuleToggle('requireActiveStatus')}
                  className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Require PPE verification</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Enforces vision model camera checks</span>
                </div>
                <input
                  type="checkbox"
                  checked={rules.requirePpeVerification}
                  onChange={() => handleRuleToggle('requirePpeVerification')}
                  className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Block access under 75% PPE</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Automatically denies gate passage</span>
                </div>
                <input
                  type="checkbox"
                  checked={rules.blockPpeBelow75}
                  onChange={() => handleRuleToggle('blockPpeBelow75')}
                  className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Automatically deny expired access</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Checks profile validity dates</span>
                </div>
                <input
                  type="checkbox"
                  checked={rules.autoDenyExpired}
                  onChange={() => handleRuleToggle('autoDenyExpired')}
                  className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Allow supervisor manual override</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Enables override checkmark button logs</span>
                </div>
                <input
                  type="checkbox"
                  checked={rules.supervisorOverride}
                  onChange={() => handleRuleToggle('supervisorOverride')}
                  className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
              </div>
            </div>
          </div>

          {/* Access Table lists */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logs</h3>
              <h2 className="text-md font-bold text-slate-800 dark:text-white mt-1">Zoning Authorization Directory</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Worker</th>
                    <th className="py-2.5 px-4">Access Level</th>
                    <th className="py-2.5 px-4">Allowed Zones</th>
                    <th className="py-2.5 px-4">Expiry Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                  {workers.filter(w => !w.isArchived).slice(0, 8).map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white">{w.name}</td>
                      <td className="py-2.5 px-4">{w.accessLevel}</td>
                      <td className="py-2.5 px-4 font-mono">{w.assignedZone}</td>
                      <td className="py-2.5 px-4 font-mono">{w.accessExpiryDate}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] font-bold ${w.accessStatus === 'AUTHORIZED' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {w.accessStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: REPORTS & ATTENDANCE TRENDS CHARTS
          ========================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Action buttons */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Export Gate Attendance Records</h2>
              <p className="text-xs font-semibold text-slate-400">Download formatted files locally</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReportPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Report</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Aggregate charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hourly Entry Bar Chart */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Hourly Entry Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="entries" fill="#f97316" radius={[4, 4, 0, 0]} name="Workers Entered" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Entry vs Exit Double Bar Chart */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Entry vs Exit Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={entryExitData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                    <Bar dataKey="entries" fill="#f97316" radius={[4, 4, 0, 0]} name="Entries" />
                    <Bar dataKey="exits" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Exits" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Aggregate charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Access results Donut Pie Chart */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Access Authorizations Result</h3>
              <div className="h-60 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accessResultPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {accessResultPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PPE compliance trend Line Chart */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">PPE Compliance Score Progression</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ppeTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                    <YAxis stroke="#94a3b8" domain={[50, 100]} fontSize={11} fontWeight={600} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="PPE Average %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS & OVERLAY POPUPS
          ========================================== */}

      {/* 1. Register New Worker Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Register New Worker</h2>
              <button onClick={() => setRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterWorker} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="E.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Worker ID *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      placeholder="WRK-XXXX"
                      className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={generateWorkerId}
                      className="px-2.5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role Title *</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  >
                    <option>Construction Worker</option>
                    <option>Safety Officer</option>
                    <option>Engineer</option>
                    <option>Electrician</option>
                    <option>Machine Operator</option>
                    <option>Supervisor</option>
                    <option>Visitor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 99999 99999"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Work Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="worker@example.com"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Zone *</label>
                  <select
                    value={regZone}
                    onChange={(e) => setRegZone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  >
                    <option>Zone A</option>
                    <option>Zone B</option>
                    <option>Zone C</option>
                    <option>Zone D</option>
                    <option>Zone E</option>
                    <option>Zone F</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Access Level *</label>
                  <select
                    value={regLevel}
                    onChange={(e) => setRegLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  >
                    <option value="General Access">General Access</option>
                    <option value="Zone Specific">Zone Specific</option>
                    <option value="Restricted Access">Restricted Access</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Access Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={regExpiry}
                    onChange={(e) => setRegExpiry(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={regEmergencyName}
                    onChange={(e) => setRegEmergencyName(e.target.value)}
                    placeholder="Contact name"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={regEmergencyPhone}
                    onChange={(e) => setRegEmergencyPhone(e.target.value)}
                    placeholder="Emergency number"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              {/* PPE Requirements checkboxes */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-700 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Required Safety Gear Checklist</span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={regPpe.helmet} onChange={(e) => setRegPpe({ ...regPpe, helmet: e.target.checked })} className="rounded" />
                    <span>Helmet</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={regPpe.vest} onChange={(e) => setRegPpe({ ...regPpe, vest: e.target.checked })} className="rounded" />
                    <span>Safety Vest</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={regPpe.shoes} onChange={(e) => setRegPpe({ ...regPpe, shoes: e.target.checked })} className="rounded" />
                    <span>Safety Shoes</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={regPpe.gloves} onChange={(e) => setRegPpe({ ...regPpe, gloves: e.target.checked })} className="rounded" />
                    <span>Safety Gloves</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={regPpe.badge} onChange={(e) => setRegPpe({ ...regPpe, badge: e.target.checked })} className="rounded" />
                    <span>ID Badge</span>
                  </label>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Worker Details Modal */}
      {detailsModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Worker Profile Card</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile body */}
            <div className="p-6 space-y-6 text-xs font-semibold">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b border-slate-100 dark:border-slate-700 pb-5">
                <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedWorker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="text-center sm:text-left flex-1 space-y-1">
                  <h3 className="text-md font-bold text-slate-800 dark:text-white">{selectedWorker.name}</h3>
                  <p className="text-slate-400 font-semibold">{selectedWorker.workerId} · {selectedWorker.role}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-1">
                    <StatusBadge status={selectedWorker.status} />
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold uppercase">
                      {selectedWorker.accessLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase leading-none">Phone</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">{selectedWorker.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase leading-none">Email</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">{selectedWorker.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase leading-none">Project Scope</span>
                      <span className="text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedWorker.assignedProject}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase leading-none">Assigned Zone</span>
                      <span className="text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedWorker.assignedZone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase leading-none">Access Expiry</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">{selectedWorker.accessExpiryDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase leading-none">Emergency Contact</span>
                      <span className="text-slate-700 dark:text-slate-300 mt-0.5 block">
                        {selectedWorker.emergencyContactName ? `${selectedWorker.emergencyContactName} (${selectedWorker.emergencyContactNumber})` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* entry history */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Entry Logs History</span>
                </span>
                <div className="overflow-x-auto max-h-44">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                        <th className="py-2">Date</th>
                        <th className="py-2">Entry</th>
                        <th className="py-2">Exit</th>
                        <th className="py-2">Zone</th>
                        <th className="py-2">PPE Score</th>
                        <th className="py-2 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                      {logs.filter(l => l.workerId === selectedWorker.workerId).slice(-4).map(l => (
                        <tr key={l.id}>
                          <td className="py-2 font-mono">{l.entryDate}</td>
                          <td className="py-2 font-mono">{l.entryTime}</td>
                          <td className="py-2 font-mono">{l.exitTime || '--'}</td>
                          <td className="py-2">{l.zone}</td>
                          <td className="py-2 font-mono">{l.ppeScore}%</td>
                          <td className="py-2 text-right font-bold">{l.accessResult}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit Worker Modal */}
      {editModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Edit Worker Details</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditWorkerSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={selectedWorker.name}
                    onChange={(e) => setSelectedWorker({ ...selectedWorker, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={selectedWorker.role}
                    onChange={(e) => setSelectedWorker({ ...selectedWorker, role: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={selectedWorker.phone}
                    onChange={(e) => setSelectedWorker({ ...selectedWorker, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Work Email</label>
                  <input
                    type="email"
                    value={selectedWorker.email || ''}
                    onChange={(e) => setSelectedWorker({ ...selectedWorker, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Zone</label>
                  <select
                    value={selectedWorker.assignedZone}
                    onChange={(e) => setSelectedWorker({ ...selectedWorker, assignedZone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50"
                  >
                    <option>Zone A</option>
                    <option>Zone B</option>
                    <option>Zone C</option>
                    <option>Zone D</option>
                    <option>Zone E</option>
                    <option>Zone F</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Access Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={selectedWorker.accessExpiryDate}
                    onChange={(e) => setSelectedWorker({ ...selectedWorker, accessExpiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Archive Confirmation Modal */}
      {archiveModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs font-semibold transform scale-100 transition-all duration-300">
            <div className="flex items-center gap-2.5 text-red-500">
              <Trash2 className="w-5 h-5 animate-bounce" />
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Remove Worker?</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-normal font-medium">
              Are you sure you want to remove <strong className="text-slate-700 dark:text-white">{selectedWorker.name}</strong> from the active directory? This moves their record to inactive archives.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setArchiveModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveWorker}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl"
              >
                Archive Worker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Deny Access Reason Modal */}
      {denyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs font-semibold transform scale-100 transition-all duration-300">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Select Access Denial Reason</h2>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Reason</label>
              <select
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 focus:outline-none"
              >
                <option>PPE not compliant</option>
                <option>Access expired</option>
                <option>Worker inactive</option>
                <option>Restricted zone</option>
                <option>Manual denial</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setDenyModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDenyEntryConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl"
              >
                Deny Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Mark Exit Modal */}
      {exitModalOpen && exitLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs font-semibold transform scale-100 transition-all duration-300">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Record Worker Exit</h2>
            <div className="space-y-2 leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              <p>Record manual exit for <strong className="text-slate-800 dark:text-white">{exitLog.workerName}</strong>?</p>
              <p>Entry registered: <span className="font-mono text-slate-800 dark:text-white">{exitLog.entryTime}</span> today</p>
              <p>The exit timestamp will automatically record as the current local time.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setExitModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkExitConfirm}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Grant Access Modal */}
      {grantAccessModal && selectedAccessWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs font-semibold transform scale-100 transition-all duration-300">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Grant Site Access Permissions</h2>
            <form onSubmit={handleGrantAccessSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Worker name</span>
                <span className="text-sm font-bold text-slate-700 dark:text-white block">{selectedAccessWorker.name} ({selectedAccessWorker.workerId})</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Access Level</label>
                <select
                  value={grantLevel}
                  onChange={(e) => setGrantLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 focus:outline-none"
                >
                  <option value="General Access">General Access</option>
                  <option value="Zone Specific">Zone Specific</option>
                  <option value="Restricted Access">Restricted Access</option>
                </select>
              </div>

              {grantLevel === 'Zone Specific' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Allowed Zone</label>
                  <select
                    value={grantZone}
                    onChange={(e) => setGrantZone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 focus:outline-none"
                  >
                    <option>Zone A</option>
                    <option>Zone B</option>
                    <option>Zone C</option>
                    <option>Zone D</option>
                    <option>Zone E</option>
                    <option>Zone F</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={grantExpiry}
                  onChange={(e) => setGrantExpiry(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setGrantAccessModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Revoke Access Modal */}
      {revokeAccessModal && selectedAccessWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs font-semibold transform scale-100 transition-all duration-300">
            <h2 className="text-md font-bold text-red-500">Revoke Site Access</h2>
            <form onSubmit={handleRevokeAccessSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Worker name</span>
                <span className="text-sm font-bold text-slate-700 dark:text-white block">{selectedAccessWorker.name} ({selectedAccessWorker.workerId})</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reason for Revocation</label>
                <select
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 focus:outline-none"
                >
                  <option>Safety Violation</option>
                  <option>Access Expired</option>
                  <option>Worker Inactive</option>
                  <option>Project Completed</option>
                  <option>Manual Restriction</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setRevokeAccessModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  Revoke Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Report Preview Modal */}
      {reportPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Worker Entry Safety Report Preview</h2>
              <button onClick={() => setReportPreviewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document body */}
            <div className="p-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 font-mono text-[10px] leading-relaxed text-slate-700 dark:text-slate-300 h-64 overflow-y-auto whitespace-pre-wrap select-all">
                {`SITE SENTINEL - WORKER ENTRY SAFETY REPORT\n============================================\nProject: Skyline Tower - Phase II\nDate: August 28, 2026\nGenerated on: 2026-08-28 20:53 PM\n\nSUMMARY REGISTER STATS:\n---------------------\n- Total Registered: ${workers.length}\n- Today's Gate Entries: ${summaryStats.todayEntries}\n- Today's Exits: ${summaryStats.todayEntries - summaryStats.currentlyOnSite}\n- Currently On Site: ${summaryStats.currentlyOnSite}\n- Access Denials today: ${summaryStats.accessDeniedToday}\n- Avg PPE Compliance: ${summaryStats.ppeCompliance}%\n\nZONE DENSITY MATRIX:\n------------------\n${projectData.zones.map(z => `- ${z.name}: Risk score ${z.riskScore}/100 | Active Workers: ${z.activeWorkers}`).join('\n')}\n\nACCESS CONTROL SETTINGS:\n----------------------\n- Valid ID Required: ${rules.requireWorkerId ? 'YES' : 'NO'}\n- Active Status Check: ${rules.requireActiveStatus ? 'YES' : 'NO'}\n- PPE Verification Check: ${rules.requirePpeVerification ? 'YES' : 'NO'}\n- Block Under 75% PPE: ${rules.blockPpeBelow75 ? 'YES' : 'NO'}`}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button
                onClick={() => setReportPreviewOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl"
              >
                Download PDF File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
