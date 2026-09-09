import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import { MetricCard } from '../components/MetricCard';
import {
  TrendingUp,
  Shield,
  Users,
  Wrench,
  AlertOctagon,
  Activity,
  Package,
  Calendar,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projectData, refreshData, isRefreshing } = useProject();
  const [chartTab, setChartTab] = useState<'all' | 'actual' | 'predicted'>('all');

  // Chart data for Planned vs Actual vs Predicted Progress
  const rawProgressData = [
    { name: 'Mon', planned: 60, actual: 61, predicted: 61 },
    { name: 'Tue', planned: 62, actual: 63, predicted: 63 },
    { name: 'Wed', planned: 64, actual: 65, predicted: 66 },
    { name: 'Thu', planned: 66, actual: 68, predicted: 69 },
    { name: 'Fri', planned: 68, actual: null, predicted: 71 },
    { name: 'Sat', planned: 70, actual: null, predicted: 72 },
    { name: 'Sun', planned: 72, actual: null, predicted: 74 },
  ];

  // Adjust chart line colors depending on active project factor
  const plannedColor = '#94a3b8'; // Slate
  const actualColor = '#f97316'; // Orange Accent
  const predictedColor = '#3b82f6'; // Blue

  // Circular gauge color
  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-emerald-500 stroke-emerald-500';
    if (score < 40) return 'text-amber-500 stroke-amber-500';
    if (score < 70) return 'text-orange-500 stroke-orange-500';
    return 'text-red-500 stroke-red-500';
  };

  // SVG Gauge calculations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (projectData.riskScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Good morning, Site Manager
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            AI-powered overview of your construction site.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/agentic-ai')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-150"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Agentic AI</span>
          </button>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-150 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh feed'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Project Progress"
          value={`${projectData.progress}%`}
          changeText={projectData.progressChange}
          isPositive={true}
          subtext={projectData.progressTarget}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Safety Score"
          value={`${projectData.safetyScore}%`}
          changeText={projectData.safetyChange}
          isPositive={projectData.safetyScore >= 90}
          subtext="PPE compliance driven"
          icon={<Shield className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Workers"
          value={projectData.activeWorkers}
          subtext={`Across ${projectData.zones.length} zones`}
          changeText={`${projectData.workersOnBreak} on break`}
          isPositive={true}
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Equipment"
          value={projectData.activeEquipment}
          subtext={`${projectData.idleEquipment} idle · 76% avg utilization`}
          isPositive={true}
          icon={<Wrench className="w-5 h-5" />}
        />
        <MetricCard
          title="Open Safety Violations"
          value={projectData.openViolations}
          changeText={`${projectData.criticalViolations} critical`}
          isPositive={projectData.criticalViolations === 0}
          subtext="Since 06:00 today"
          icon={<AlertOctagon className="w-5 h-5 text-red-500" />}
          onClick={() => navigate('/safety')}
        />
        <MetricCard
          title="Risk Score"
          value={`${projectData.riskScore}/100`}
          changeText={projectData.riskLevel}
          isPositive={projectData.riskScore < 30}
          subtext="Schedule is top driver"
          icon={<Activity className="w-5 h-5" />}
          onClick={() => navigate('/risk')}
        />
        <MetricCard
          title="Material Utilization"
          value={`${projectData.materialUtilization}%`}
          changeText="+1.8% w/w"
          isPositive={true}
          subtext={projectData.materialTrend}
          icon={<Package className="w-5 h-5" />}
          onClick={() => navigate('/resources')}
        />
        <MetricCard
          title="Predicted Delay"
          value={`${projectData.predictedDelay} Days`}
          changeText={`${projectData.predictedDelayProb}% probability`}
          isPositive={projectData.predictedDelay === 0}
          subtext={projectData.predictedDelayDriver}
          icon={<Calendar className="w-5 h-5" />}
          onClick={() => navigate('/predictions')}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Progress Chart */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Project Progress Trend</h3>
              <p className="text-xs font-semibold text-slate-400">Weekly planned vs actual and predicted timelines</p>
            </div>
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              {(['all', 'actual', 'predicted'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    chartTab === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#94a3b8" domain={[55, 80]} fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                
                {/* Planned */}
                {(chartTab === 'all' || chartTab === 'actual') && (
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke={plannedColor}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Planned"
                  />
                )}
                {/* Actual */}
                {(chartTab === 'all' || chartTab === 'actual') && (
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke={actualColor}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Actual"
                    connectNulls
                  />
                )}
                {/* Predicted */}
                {(chartTab === 'all' || chartTab === 'predicted') && (
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke={predictedColor}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="AI Predicted"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Overview Circular Gauge */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Risk Overview</h3>
            <p className="text-xs font-semibold text-slate-400 mb-6">Real-time risk scoring matrix</p>
          </div>

          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative flex items-center justify-center w-36 h-36">
              {/* SVG Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-700 fill-transparent"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className={`fill-transparent transition-all duration-500 ease-out ${getRiskColor(
                    projectData.riskScore
                  )}`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
                  {projectData.riskScore}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  RISK SCORE
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${
                  projectData.riskScore < 30 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' : 'text-amber-600 bg-amber-50 dark:bg-amber-950/20'
                }`}>
                  {projectData.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          <div className="space-y-2 mt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contributing Factors</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Schedule: High</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Safety: Low</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Weather: Clear</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Material: Tight</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* AI Insights and Feed Column */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent AI Insights</h3>
          </div>
          <button
            onClick={() => navigate('/agentic-ai')}
            className="flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <span>Control Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Insight 1 */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 flex flex-col justify-between">
            <div className="flex gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 h-10 w-10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Safety improvement detected</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  HardHat compliance at entry gates increased by 8% after automated visual safety briefings.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-emerald-100/30">
              <span className="text-[10px] font-bold text-emerald-600">PPE ADHERENCE UP</span>
              <span className="text-[10px] text-slate-400 font-semibold">10m ago</span>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/30 flex flex-col justify-between">
            <div className="flex gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-xl text-orange-600 dark:text-orange-400 h-10 w-10 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Schedule risk detected</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Structural Column casting in Zone B is 2 days behind schedule due to concrete curing humidity levels.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-orange-100/30">
              <span className="text-[10px] font-bold text-orange-600">3D DELAY ACTION REQ</span>
              <span className="text-[10px] text-slate-400 font-semibold">1h ago</span>
            </div>
          </div>

          {/* Insight 3 */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 flex flex-col justify-between">
            <div className="flex gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400 h-10 w-10 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Equipment utilization alert</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Tower Crane 01 utilization exceeded 80% this morning. Scheduled bearing maintenance recommended tonight.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-100/30">
              <span className="text-[10px] font-bold text-blue-600">MAINTENANCE SCHED</span>
              <span className="text-[10px] text-slate-400 font-semibold">2h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
