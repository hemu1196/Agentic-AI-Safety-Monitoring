import React, { useState, useEffect } from 'react';
import { useProject } from '../hooks/useProject';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import {
  ShieldCheck, ShieldAlert, AlertOctagon, Activity,
  Filter, Eye, Camera, Network, RefreshCw, X, Play, ShieldAlert as WarningIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ViolationLog {
  id: string;
  violation: string;
  zone: string;
  severity: 'Critical' | 'Warning' | 'Resolved';
  detectedTime: string;
  status: string;
}

const mockFeeds = [
  {
    id: 'cam-01',
    name: 'CAM_01 - Zone B Structural',
    camera: 'CCTV-01-B1',
    resolution: '1920x1080 @ 30FPS',
    analytics: 'YOLOv8x-Safety-Active',
    warnings: ['Missing Helmet [96%]', 'No Harness [92%]'],
    color: 'border-red-500',
    type: 'critical',
    gridLines: true
  },
  {
    id: 'cam-02',
    name: 'CAM_02 - Zone F restricted Substation',
    camera: 'CCTV-02-Frestricted',
    resolution: '1920x1080 @ 30FPS',
    analytics: 'YOLOv8x-ZoneCheck',
    warnings: ['Zone Intrusion [98%]'],
    color: 'border-purple-500',
    type: 'critical',
    gridLines: true
  },
  {
    id: 'cam-03',
    name: 'CAM_03 - Zone A Foundation Excavation',
    camera: 'CCTV-03-A2',
    resolution: '1920x1080 @ 30FPS',
    analytics: 'YOLOv8x-Safety-Active',
    warnings: [],
    color: 'border-emerald-500',
    type: 'ok',
    gridLines: false
  },
  {
    id: 'cam-04',
    name: 'CAM_04 - Zone E Worker Gate Scanner',
    camera: 'CCTV-04-EntranceScan',
    resolution: '1280x720 @ 60FPS',
    analytics: 'SiteSentinel-ComplianceScan',
    warnings: ['Scanner Standby'],
    color: 'border-slate-500',
    type: 'standby',
    gridLines: false
  }
];

export const SafetyMonitoring: React.FC = () => {
  const { projectData } = useProject();
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Warning' | 'Resolved'>('All');
  const [activeTab, setActiveTab] = useState<'FEEDS' | 'INCIDENTS'>('FEEDS');
  const [selectedFeed, setSelectedFeed] = useState<typeof mockFeeds[0] | null>(null);
  const [activeDetectionsCount, setActiveDetectionsCount] = useState(3);
  const [fpsVal, setFpsVal] = useState(29.8);

  // Trend data for the 7-day Safety Score
  const safetyTrendData = [
    { day: 'Mon', score: 88, compliance: 85 },
    { day: 'Tue', score: 89, compliance: 87 },
    { day: 'Wed', score: 90, compliance: 88 },
    { day: 'Thu', score: 90, compliance: 89 },
    { day: 'Fri', score: 91, compliance: 89 },
    { day: 'Sat', score: 93, compliance: 91 },
    { day: 'Sun', score: 91, compliance: 89 },
  ];

  // Frequency simulator for FPS and detections
  useEffect(() => {
    const timer = setInterval(() => {
      setFpsVal(parseFloat((29.5 + Math.random() * 0.8).toFixed(1)));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleDispatchOfficer = (camName: string) => {
    alert(`Alert Confirmed! Safety supervisor dispatched code-red to ${camName} via radio broadcast.`);
    setSelectedFeed(null);
  };

  // Safe checks for violations list
  const rawViolations = projectData?.violations || [];
  const filteredViolations = rawViolations.filter(violation => {
    if (filter === 'All') return true;
    return (violation.severity || '') === filter;
  });

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-500" />
            <span>AI Safety Monitoring & Scanners</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Real-time computer vision streams, telemetry incident tracking, and YOLOv8 analyzer status.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-850 w-fit">
          <button
            onClick={() => setActiveTab('FEEDS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${activeTab === 'FEEDS'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
          >
            Camera Feeds ({mockFeeds.length})
          </button>
          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${activeTab === 'INCIDENTS'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
          >
            Incident Feed & Trends
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Overall Safety Score"
          value={`${projectData?.safetyScore || 91}%`}
          changeText={projectData?.safetyChange || '+3 pts'}
          isPositive={(projectData?.safetyScore || 91) >= 90}
          subtext="PPE Scanners Active"
          icon={<ShieldCheck className="w-5 h-5 animate-pulse" />}
        />
        <MetricCard
          title="Active YOLO Feeds"
          value="4 Streams"
          changeText={`${fpsVal} FPS Average`}
          isPositive={true}
          subtext="Vision Engine Latency: 28ms"
          icon={<Network className="w-5 h-5 text-indigo-500" />}
        />
        <MetricCard
          title="Active Live Hazards"
          value={activeDetectionsCount}
          changeText="Immediate Dispatch"
          isPositive={activeDetectionsCount === 0}
          subtext="Scaffold Edge / Danger Entry"
          icon={<AlertOctagon className="w-5 h-5 text-red-500" />}
        />
        <MetricCard
          title="Historical Violations"
          value={rawViolations.length}
          subtext="Audit history tracker"
          icon={<Activity className="w-5 h-5 text-blue-500" />}
        />
      </div>

      {/* Tab 1: Live CCTV Feeds Grid */}
      {activeTab === 'FEEDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockFeeds.map(feed => (
            <div
              key={feed.id}
              className={`bg-white dark:bg-slate-900 border-2 ${feed.type === 'critical' ? 'border-red-500/40 dark:border-red-500/35' : 'border-slate-205 dark:border-slate-800'
                } rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col relative`}
            >
              {/* CCTV Feed Header */}
              <div className="p-3 bg-slate-950 text-white flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${feed.type === 'critical' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'} shrink-0`} />
                  <span>{feed.name}</span>
                </span>
                <span className="font-mono text-slate-400">{feed.camera}</span>
              </div>

              {/* CCTV Feed Screens Container */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* SVG Mocking Bounding Boxes Detections */}
                {feed.id === 'cam-01' && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225">
                    {/* Scanner Lines */}
                    <line x1="0" y1="112" x2="400" y2="112" stroke="#ea580c" strokeWidth="1" strokeDasharray="3 3" className="animate-pulse" />
                    {/* Worker 1 Detections */}
                    <rect x="80" y="50" width="60" height="140" fill="none" stroke="#ef4444" strokeWidth="2" />
                    <rect x="80" y="32" width="60" height="18" fill="#ef4444" />
                    <text x="83" y="44" fill="white" fontSize="9" fontWeight="bold">NO_HELMET 96%</text>
                    {/* Worker 2 Detections */}
                    <rect x="230" y="30" width="70" height="160" fill="none" stroke="#ef4444" strokeWidth="2" />
                    <rect x="230" y="12" width="70" height="18" fill="#ef4444" />
                    <text x="233" y="24" fill="white" fontSize="9" fontWeight="bold">NO_HARNESS 92%</text>
                  </svg>
                )}

                {feed.id === 'cam-02' && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225">
                    <rect x="150" y="40" width="110" height="150" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="2.5" />
                    <rect x="150" y="22" width="110" height="18" fill="#a855f7" />
                    <text x="153" y="34" fill="white" fontSize="9" fontWeight="bold">INTRUSION DETECTED 98%</text>
                  </svg>
                )}

                {feed.id === 'cam-03' && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225">
                    <rect x="180" y="60" width="60" height="130" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                    <rect x="180" y="45" width="60" height="15" fill="#22c55e" />
                    <text x="183" y="56" fill="white" fontSize="8" fontWeight="bold">PPE COMPLIANT 99%</text>
                  </svg>
                )}

                {feed.id === 'cam-04' && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-4">
                    <Network className="w-8 h-8 text-slate-500 mb-1.5 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Scanner Engine Idle</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">Awaiting scanner triggers from Gate #2</span>
                  </div>
                )}

                {/* Glitch Overlay Text */}
                {feed.type === 'critical' && (
                  <div className="absolute top-12 left-3 bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest animate-pulse flex items-center gap-1">
                    <WarningIcon className="w-3.5 h-3.5" />
                    <span>Hazard Alert Flagged</span>
                  </div>
                )}

                {/* Camera Details Box overlay */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs py-1 px-2 rounded text-[8px] font-mono text-slate-350 space-y-0.5">
                  <div>RES: {feed.resolution}</div>
                  <div>ENG: {feed.analytics}</div>
                </div>
              </div>

              {/* Feed Card Controls footer */}
              <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {feed.warnings.length > 0 ? (
                    <span className="text-red-500 font-black">{feed.warnings.join(' · ')}</span>
                  ) : feed.type === 'ok' ? (
                    <span className="text-emerald-500 font-black">All Targets Stable</span>
                  ) : (
                    <span>Scanner Loop Running</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFeed(feed)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-black text-[9px] uppercase tracking-widest rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Target</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Historic Trends & List Details table feedback */}
      {activeTab === 'INCIDENTS' && (
        <div className="space-y-6">
          {/* Trend chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider">
                7-Day Compliance & Incident Metrics
              </h3>
              <p className="text-xs font-semibold text-slate-400">Weekly compliance percentages based on automated camera analytics</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safetyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                  <YAxis stroke="#94a3b8" domain={[70, 100]} fontSize={11} fontWeight={600} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    name="Overall Safety Score"
                  />
                  <Area
                    type="monotone"
                    dataKey="compliance"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCompliance)"
                    name="Scanners PPE Compliance Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Violations list */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest">
                  Live Action Triage Incident Logs
                </h3>
              </div>

              {/* Filter controls tab segment */}
              <div className="flex bg-slate-100 dark:bg-slate-955 p-1 rounded-xl border border-slate-200 dark:border-slate-850 w-fit">
                {(['All', 'Critical', 'Warning', 'Resolved'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === tab
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Log Listing Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-405 text-slate-450 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Violation ID</th>
                    <th className="py-3 px-4">Violation Details</th>
                    <th className="py-3 px-4">Zone Location</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Detected Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-bold text-slate-650 dark:text-slate-350">
                  {filteredViolations.map((violation) => (
                    <tr key={violation.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{violation.id}</td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">{violation.violation}</td>
                      <td className="py-3.5 px-4 font-mono">{violation.zone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${violation.severity === 'Critical'
                            ? 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 ring-1 ring-red-500/20'
                            : violation.severity === 'Warning'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
                          }`}>
                          {violation.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{violation.detectedTime}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={violation.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Reviewing YOLOv8 telemetry frame verification for ID ${violation.id}`)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 font-extrabold text-[10px] uppercase rounded-lg transition ml-auto flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredViolations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-550 font-semibold italic">
                        No active violations registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CCTV Target Inspector Drawer Modal */}
      {selectedFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop screen */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setSelectedFeed(null)} />

          {/* Console Window */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl w-full rounded-3xl shadow-xl overflow-hidden p-6 animate-in scale-in duration-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <span className="font-mono text-xs text-orange-500 font-bold">{selectedFeed.camera}</span>
                <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase mt-0.5">
                  AI Computer Vision Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedFeed(null)}
                className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res CCTV Simulator */}
            <div className="relative aspect-video bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800">
              {/* Scan Overlay Lines */}
              {selectedFeed.gridLines && (
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100/30 to-black bg-[size:10px_10px]" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              )}

              {/* Feed specific SVG */}
              {selectedFeed.id === 'cam-01' ? (
                <svg className="w-full h-full" viewBox="0 0 400 225">
                  <rect x="80" y="50" width="60" height="140" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  <rect x="80" y="32" width="60" height="18" fill="#ef4444" />
                  <text x="83" y="44" fill="white" fontSize="9" fontWeight="bold">NO_HELMET 96%</text>

                  <rect x="230" y="30" width="70" height="160" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  <rect x="230" y="12" width="70" height="18" fill="#ef4444" />
                  <text x="233" y="24" fill="white" fontSize="9" fontWeight="bold">NO_HARNESS 92%</text>
                </svg>
              ) : selectedFeed.id === 'cam-02' ? (
                <svg className="w-full h-full" viewBox="0 0 400 225">
                  <rect x="150" y="40" width="110" height="150" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="2.5" />
                  <rect x="150" y="22" width="110" height="18" fill="#a855f7" />
                  <text x="153" y="34" fill="white" fontSize="9" fontWeight="bold">INTRUSION DETECTED 98%</text>
                </svg>
              ) : selectedFeed.id === 'cam-03' ? (
                <svg className="w-full h-full" viewBox="0 0 400 225">
                  <rect x="180" y="60" width="60" height="130" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                  <rect x="180" y="45" width="60" height="15" fill="#22c55e" />
                  <text x="183" y="56" fill="white" fontSize="9" fontWeight="bold">PPE COMPLIANT 99%</text>
                </svg>
              ) : (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-4">
                  <Network className="w-10 h-10 text-slate-500 mb-1.5 animate-pulse" />
                  <span className="text-[11px] uppercase font-black tracking-widest text-slate-400">Scanner Engine Idle</span>
                </div>
              )}

              {/* HUD labels */}
              <div className="absolute top-3 right-3 bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest">
                FPS: {fpsVal} // INF: 28ms
              </div>
            </div>

            {/* Details and Actions */}
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850/80 space-y-2 font-semibold text-xs text-slate-505 text-slate-500">
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-black text-[9px] tracking-wider">Feed Location</span>
                  <span className="text-slate-800 dark:text-white">{selectedFeed.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-black text-[9px] tracking-wider">Model Target</span>
                  <span className="text-slate-805 dark:text-slate-205 font-mono">{selectedFeed.analytics}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-black text-[9px] tracking-wider">Scanned Flags</span>
                  <span className="text-red-500 font-extrabold">
                    {selectedFeed.warnings.length > 0 ? selectedFeed.warnings.join(', ') : 'None Active'}
                  </span>
                </div>
              </div>

              {selectedFeed.type === 'critical' ? (
                <button
                  onClick={() => handleDispatchOfficer(selectedFeed.name)}
                  className="w-full py-3 bg-red-600 hover:bg-red-750 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-500/10"
                >
                  <WarningIcon className="w-4 h-4 animate-bounce" />
                  <span>Dispatch Safety Supervisor Now</span>
                </button>
              ) : (
                <button
                  onClick={() => setSelectedFeed(null)}
                  className="w-full py-3 bg-slate-850 hover:bg-slate-900 border border-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer"
                >
                  Confirm Feed Status Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
