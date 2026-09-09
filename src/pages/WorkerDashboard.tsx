import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  User, Clock, ShieldCheck, MapPin,
  Calendar, AlertTriangle, AlertOctagon, HelpCircle,
  ChevronRight, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Dynamic state hooks for reports and leave counts
  const [activeReportsCount, setActiveReportsCount] = useState(0);
  const [underReviewReportsCount, setUnderReviewReportsCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  // Retrieve basic info or default to Ramesh's standard data
  const workerName = user?.name || 'Ramesh Kumar';
  const workerId = (user as any)?.workerId || 'WRK-1001';
  const assignedProject = (user as any)?.assignedProject || 'Skyline Tower';
  const assignedZone = (user as any)?.assignedZone || 'Zone B';

  useEffect(() => {
    const handleSync = () => {
      // Load reports count
      const rRaw = localStorage.getItem('siteSentinelWorkerReports');
      if (rRaw) {
        try {
          const list = JSON.parse(rRaw);
          const myReports = list.filter((r: any) => r.workerId === workerId);
          const active = myReports.filter((r: any) => r.status !== 'RESOLVED');
          const underReview = myReports.filter((r: any) => r.status === 'UNDER_REVIEW');
          setActiveReportsCount(active.length);
          setUnderReviewReportsCount(underReview.length);
        } catch (e) { }
      } else {
        // Fallback standard count if storage not initialized
        setActiveReportsCount(2);
        setUnderReviewReportsCount(1);
      }

      // Load leave count
      const lRaw = localStorage.getItem('siteSentinelLeaves');
      if (lRaw) {
        try {
          const list = JSON.parse(lRaw);
          const myLeaves = list.filter((l: any) => l.workerId === workerId);
          const pending = myLeaves.filter((l: any) => l.status === 'PENDING');
          setPendingLeaveCount(pending.length);
        } catch (e) { }
      } else {
        setPendingLeaveCount(1);
      }
    };

    handleSync();
    window.addEventListener('worker_report_status_changed', handleSync);
    return () => {
      window.removeEventListener('worker_report_status_changed', handleSync);
    };
  }, [workerId]);

  const handleSendSos = () => {
    setSosLoading(true);
    setTimeout(() => {
      setSosLoading(false);
      setSosSent(true);
    }, 1500);
  };

  const handleResetSos = () => {
    setShowSosModal(false);
    setSosSent(false);
  };

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 rounded-3xl border border-slate-700/40 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/35 uppercase">
              <Sparkles className="w-3 h-3 text-orange-400 animate-pulse" />
              Worker Workspace Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good Morning, {workerName} 👷
            </h1>
            <p className="text-xs sm:text-sm text-slate-350 max-w-xl font-medium">
              Welcome back to your Site Sentinel workspace. Your safety checklist is verified, and you are currently marked as active on site.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-2.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Project</div>
              <div className="text-xs font-black text-slate-100 mt-0.5">{assignedProject}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-2.5 rounded-2xl">
              <div className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Assigned Zone</div>
              <div className="text-xs font-black text-orange-400 mt-0.5">{assignedZone}</div>
            </div>
          </div>
        </div>

        {/* Diagonal design accents */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-slate-500/10 rounded-full blur-2xl -z-0 pointer-events-none" />
      </div>

      {/* Identity Badging Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-base shadow-inner border border-orange-100/50 dark:border-orange-900/30">
            {workerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Structural ID Status</div>
            <h2 className="text-base font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">
              Badge: <span className="font-mono text-slate-900 dark:text-white">{workerId}</span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Role: Construction Worker · Gate Authorization Level: Phase II General
            </p>
          </div>
        </div>

        <div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-505 bg-emerald-500 animate-pulse" />
            <span>🟢 ON SITE STATUS</span>
          </span>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Attendance</span>
            <span className="text-lg font-black text-slate-800 dark:text-white block leading-tight">PRESENT</span>
            <span className="text-xs text-slate-500 font-semibold block mt-0.5">Entry Registered: 09:05 AM</span>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-2.5 rounded-xl text-orange-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Working Hours */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Working Hours</span>
            <span className="text-lg font-black text-slate-800 dark:text-white block leading-tight">6h 25m</span>
            <span className="text-xs text-emerald-600 font-bold block mt-0.5">Shift Duty: 8h Standard</span>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/20 p-2.5 rounded-xl text-indigo-500">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Reports */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-start justify-between">
          <div className="space-y-1.5 flex flex-col items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open Reports</span>
            <span className="text-lg font-black text-slate-800 dark:text-white block leading-tight">{activeReportsCount} Active</span>
            <span className="text-xs text-amber-600 font-bold block mt-0.5">{underReviewReportsCount} Under Admin Review</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl text-amber-505 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Leave requests */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-start justify-between">
          <div className="space-y-1.5 flex flex-col items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leave Request</span>
            <span className="text-lg font-black text-slate-800 dark:text-white block leading-tight">{pendingLeaveCount} Pending</span>
            <span className="text-xs text-slate-505 text-slate-500 font-semibold block mt-0.5">Applied recently</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl text-emerald-505 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid of Quick Actions & Emergency Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Navigation Quick Actions Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Portal Quick Actions</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: View Attendance */}
            <div
              onClick={() => navigate('/my-attendance')}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-orange-500/40 dark:hover:border-orange-500/45 cursor-pointer transition-all duration-200 flex flex-col justify-between h-40"
            >
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-2xl w-fit text-orange-600 dark:text-orange-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1 mt-4">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                  <span>View Attendance</span>
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  Browse through your historical access logging records, total hours, and monthly summaries.
                </p>
              </div>
            </div>

            {/* Action 2: Report an Issue */}
            <div
              onClick={() => navigate('/report-issue')}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-orange-500/40 dark:hover:border-orange-500/45 cursor-pointer transition-all duration-200 flex flex-col justify-between h-40"
            >
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-2xl w-fit text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 mt-4">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                  <span>Report an Issue</span>
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  Log unsafe conditions or equipment failures on site directly to Vision AI triage.
                </p>
              </div>
            </div>

            {/* Action 3: Apply for Leave */}
            <div
              onClick={() => navigate('/apply-leave')}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-orange-500/40 dark:hover:border-orange-500/45 cursor-pointer transition-all duration-200 flex flex-col justify-between h-40"
            >
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-2xl w-fit text-blue-600 dark:text-blue-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1 mt-4">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                  <span>Apply for Leave</span>
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  Submit time-off requests, calculate calendar spans, and view administrator review logs.
                </p>
              </div>
            </div>

            {/* Action 4: Track Submissions */}
            <div
              onClick={() => navigate('/my-reports')}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-orange-500/40 dark:hover:border-orange-500/45 cursor-pointer transition-all duration-200 flex flex-col justify-between h-40"
            >
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl w-fit text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1 mt-4">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                  <span>Track My Reports</span>
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  Monitor the assessment status, Vision AI logs, and notes left by the Admin on logged issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Safety Guidance & Emergency Button */}
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-550 bg-red-500 p-2.5 rounded-2xl text-white">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-red-700 dark:text-red-400">EMERGENCY PROTOCOL</h3>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Access Radio & Distress Channel</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-red-600/80 dark:text-red-400/80 leading-relaxed">
              If there is a structural collapse, fire, gas hazard or medical crisis, immediately trigger the Emergency SOS broadcast to warn all site administrators.
            </p>

            <button
              onClick={() => setShowSosModal(true)}
              className="w-full py-3 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Trigger Emergency SOS</span>
            </button>
          </div>

          {/* Vision Gate Inspection Note */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Vision Gate Compliance</h4>
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
              Make sure to look directly into the scanner cameras at the entrance gates. Any missing items like safety vests or helmet straps can result in an immediate zone exclusion log.
            </p>
            <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
              <span>View Requirements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal Simulation */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={handleResetSos} />

          {/* Panel */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl shadow-xl overflow-hidden p-6 text-center animate-in scale-in duration-200">
            {!sosSent ? (
              <div className="space-y-5">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 dark:border-red-900/30">
                  <AlertOctagon className="w-9 h-9 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Confirm Distress Broadcast</h3>
                  <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Are you sure you want to broadcast an emergency distress signal? All safety supervisors and managers on site will be alerted instantly.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl text-left text-[11px] font-bold space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-400 uppercase tracking-wider text-[9px] mb-1">Broadcasting Location & Details</div>
                  <div className="text-slate-700 dark:text-slate-205 flex justify-between">
                    <span>Sender:</span> <span className="text-slate-900 dark:text-white">{workerName}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-205 flex justify-between">
                    <span>Worker ID:</span> <span className="font-mono text-slate-900 dark:text-white">{workerId}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-205 flex justify-between">
                    <span>Location:</span> <span className="text-slate-900 dark:text-white">{assignedProject} - {assignedZone}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetSos}
                    disabled={sosLoading}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSos}
                    disabled={sosLoading}
                    className="flex-1 py-3 bg-red-655 hover:bg-red-700 bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-500/10 disabled:opacity-50"
                  >
                    {sosLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <span>SEND SOS SIGNAL</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 py-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-red-100 dark:bg-red-950/60 text-red-500 rounded-full border border-red-200 dark:border-red-900/30">
                  <span className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-ping" />
                  <ShieldAlert className="w-10 h-10 relative z-10" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-red-600 dark:text-red-400 uppercase tracking-wide">🚨 Emergency Alert Sent</h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-350 max-w-sm mx-auto leading-relaxed">
                    Distress telemetry successfully transmitted to site manager. Evacuate immediately if necessary and stand by.
                  </p>
                </div>

                <div className="bg-red-50/50 dark:bg-red-950/10 p-4 border border-red-100/55 dark:border-red-900/20 rounded-2xl text-[11px] font-bold text-left space-y-2 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-red-700/60 dark:text-red-400/60">Target:</span>
                    <span className="text-red-800 dark:text-red-300 font-black">ALL ADMIN RADIOS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700/60 dark:text-red-400/60">Sender Name:</span>
                    <span className="text-red-800 dark:text-red-300">{workerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700/60 dark:text-red-400/60">Distress ID:</span>
                    <span className="font-mono text-red-800 dark:text-red-300">{workerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700/60 dark:text-red-400/60">Coordinates:</span>
                    <span className="text-red-800 dark:text-red-300">{assignedProject} ({assignedZone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700/60 dark:text-red-400/60">Log Time:</span>
                    <span className="text-red-800 dark:text-red-300 font-mono">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSos}
                  className="px-6 py-2.5 bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-slate-900 dark:hover:bg-slate-700 transition"
                >
                  Close & Acknowledge
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
