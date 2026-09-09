import React, { useState, useEffect } from 'react';
import { useProject } from '../hooks/useProject';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Award, ShieldAlert, CheckCircle, FileSpreadsheet,
  UploadCloud, Play, CheckCircle2, ChevronRight, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

interface InspectionLog {
  id: string;
  area: string;
  inspector: string;
  date: string;
  result: 'Pass' | 'Fail';
  status: string;
}

export const QualityControl: React.FC = () => {
  const { projectData } = useProject();

  // Defect colors chart mapping
  const defectColors = ['#f97316', '#3b82f6', '#10b981', '#a855f7'];

  // Inspection local state to permit dynamic addition
  const [inspections, setInspections] = useState<InspectionLog[]>([
    { id: 'AUD-3021', area: 'Main Foundation Block A', inspector: 'S. Sharma', date: '2026-08-28', result: 'Pass', status: 'COMPLETED' },
    { id: 'AUD-3022', area: 'Column C3 Shear Wall', inspector: 'M. Nair', date: '2026-08-29', result: 'Fail', status: 'COMPLETED' },
    { id: 'AUD-3023', area: 'Second Floor Slab Concrete', inspector: 'S. Sharma', date: '2026-08-30', result: 'Pass', status: 'COMPLETED' },
    { id: 'AUD-3024', area: 'Basement Drainage Plumbing', inspector: 'K. Patel', date: '2026-08-31', result: 'Pass', status: 'IN PROGRESS' }
  ]);

  // AI Scanner simulation state
  const [scanState, setScanState] = useState<'IDLE' | 'LOADING' | 'ANALYZING' | 'RESULT'>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [simulatedFile, setSimulatedFile] = useState<string | null>(null);

  // Stats calculation
  const passedCount = inspections.filter(i => i.result === 'Pass').length;
  const failCount = inspections.filter(i => i.result === 'Fail').length;

  // Handle simulating scan action
  const triggerSimulation = () => {
    setSimulatedFile("concrete_shear_wall_raw.jpg");
    setScanState('LOADING');
    setScanProgress(0);
  };

  useEffect(() => {
    let timer: any;
    if (scanState === 'LOADING') {
      timer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setScanState('ANALYZING');
            return 100;
          }
          return prev + 15;
        });
      }, 200);
    } else if (scanState === 'ANALYZING') {
      timer = setTimeout(() => {
        setScanState('RESULT');
      }, 1500);
    }
    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [scanState]);

  const handleRegisterDefect = () => {
    // Add to inspections log list
    const newAudit: InspectionLog = {
      id: `AUD-${Math.floor(3025 + Math.random() * 500)}`,
      area: 'Zone B Pillar Wall C4',
      inspector: 'AutoAI Classifier V2',
      date: new Date().toISOString().split('T')[0],
      result: 'Fail',
      status: 'COMPLETED'
    };
    setInspections([newAudit, ...inspections]);
    setScanState('IDLE');
    setSimulatedFile(null);
    alert("Defect logged! Work-order dispatch alert logged for Zone B Pillar Wall C4.");
  };

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-500" />
          <span>AI Quality Engineering & Inspections</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Defect logs, circular compliance reviews, and automated neural photo crack inspectors.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Quality Performance Score"
          value="94.2%"
          changeText="+0.8% vs last week"
          isPositive={true}
          subtext="Defect rate lower than plan"
          icon={<Award className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="Open Defects"
          value={projectData?.defects?.reduce((acc, curr) => acc + curr.value, 0) || 12}
          subtext="Pending remediation review"
          icon={<ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />}
        />
        <MetricCard
          title="Inspections Run"
          value={inspections.length}
          changeText="Active auditing"
          isPositive={true}
          subtext="All schedules current"
          icon={<FileSpreadsheet className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="System Pass Rate"
          value={`${passedCount} / ${inspections.length}`}
          changeText={`${Math.round((passedCount / inspections.length) * 100)}% Pass`}
          isPositive={passedCount > failCount}
          subtext="Structural checks validated"
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column blocks: Chart and AI Scan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quality Defect categories chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-855 dark:text-slate-100 uppercase tracking-widest">
                Defect Category Breakdown
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">Recorded structural non-conformances</p>
            </div>
            <div className="h-60 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData?.defects || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]}>
                    {(projectData?.defects || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={defectColors[index % defectColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive AI Crack Analysis Simulator */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block">
                Vision AI Assistant
              </span>
              <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mt-0.5">
                Neural Scan Inspector (Photo Classifier)
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Upload raw concrete photos to segment hairline cracks and predict structural compaction.
              </p>
            </div>

            {/* Visual Simulator Screen container */}
            <div className="relative border-2 border-dashed border-slate-205 dark:border-slate-800 rounded-2xl aspect-video bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
              {scanState === 'IDLE' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-full text-slate-400 w-fit mx-auto border border-slate-800">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200">Drag & Drop Image Here</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPEG up to 6MB</p>
                  </div>
                  <button
                    onClick={triggerSimulation}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-655 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 mx-auto shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Simulated Scan</span>
                  </button>
                </div>
              )}

              {scanState === 'LOADING' && (
                <div className="space-y-3 w-64 text-center">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Uploading image: {simulatedFile}
                  </span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-200" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              )}

              {scanState === 'ANALYZING' && (
                <div className="space-y-2 text-center animate-pulse">
                  <AlertCircle className="w-8 h-8 text-indigo-505 text-indigo-500 mx-auto mb-2 animate-bounce" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest block">
                    PROCESSING: SEGMENTING DEFECT BOUNDS
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold block">Model: RES-NET-101-CLASSIFIER-V2</span>
                </div>
              )}

              {scanState === 'RESULT' && (
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  {/* Visual overlay image simulator */}
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    {/* Simulated wall sketch */}
                    <div className="w-full h-full bg-slate-800 opacity-60 flex items-center justify-center relative">
                      <span className="text-[10px] font-mono text-slate-500">RAW FILE: {simulatedFile}</span>

                      {/* SVG highlighted crack defect overlay */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225">
                        <path d="M 120 180 Q 150 140 140 100 T 260 40" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="3 3" className="animate-pulse" />
                        <rect x="230" y="25" width="105" height="15" fill="#ef4444" />
                        <text x="233" y="35" fill="white" fontSize="8" fontWeight="bold">CONCRETE_CRACK_SEGM 94.6%</text>
                      </svg>
                    </div>
                  </div>

                  {/* Header alert */}
                  <div className="relative z-10 bg-red-600/90 text-white font-extrabold text-[8px] uppercase tracking-widest w-fit rounded p-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SHEAR CRACK SEGMENTED: WIDTH 2.4MM</span>
                  </div>

                  {/* Action row at bottom */}
                  <div className="relative z-10 bg-black/70 backdrop-blur-xs p-3 rounded-xl flex items-center justify-between border border-slate-800 w-full">
                    <span className="text-[9px] font-mono text-red-500 font-extrabold">
                      CRITICAL DEV EXCEEDED ZONE SPEC BOUNDS
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRegisterDefect}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-750 text-white font-extrabold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition select-none flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Log Defect Ticket</span>
                      </button>
                      <button
                        onClick={() => { setScanState('IDLE'); setSimulatedFile(null); }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition select-none"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column block: Concrete Curing telemetry details */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
              Structural Telemetry Sensors
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">Concrete casting humidity alerts</p>
          </div>

          <div className="space-y-4 my-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>Curing Temperature</span>
                <span className="text-orange-500 font-mono">32.4°C</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>Sensor Moisture Level</span>
                <span className="text-blue-500 font-mono">82.1% RH</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '82%' }} />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>Compressive Strength Est.</span>
                <span className="text-emerald-500 font-mono">22.8 MPa</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '74%' }} />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-2 tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cast Sensor Node B-24 Online</span>
          </div>
        </div>
      </div>

      {/* Inspections Logs list table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest mb-4">
          Inspection Audit History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-450 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">Inspection Area</th>
                <th className="py-2.5 px-3">Inspector Auditor</th>
                <th className="py-2.5 px-3">Date Scanned</th>
                <th className="py-2.5 px-3">Result status</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-bold text-slate-655 dark:text-slate-350">
              {inspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400">{ins.id}</td>
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-250">{ins.area}</td>
                  <td className="py-3 px-3">{ins.inspector}</td>
                  <td className="py-3 px-3 font-mono">{ins.date}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded ${ins.result === 'Pass'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-red-50 text-red-650 dark:bg-red-955/20 text-red-500'
                      }`}>
                      {ins.result}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={ins.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default QualityControl;
