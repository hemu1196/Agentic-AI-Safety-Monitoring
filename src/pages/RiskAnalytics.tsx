import React, { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { MetricCard } from '../components/MetricCard';
import {
  ShieldAlert, CloudRain, Calendar, Wrench, AlertTriangle,
  ArrowUpRight, ArrowDownRight, TrendingUp, Info, Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const RiskAnalytics: React.FC = () => {
  const { projectData } = useProject();
  const [selectedZoneDetail, setSelectedZoneDetail] = useState<string | null>(null);

  // Pie chart categories of risk
  const riskCategories = [
    { name: 'Schedule Risk', value: 45, color: '#f97316' },
    { name: 'Weather Impact', value: 20, color: '#3b82f6' },
    { name: 'Safety Violations', value: 25, color: '#ef4444' },
    { name: 'Material Shortage', value: 10, color: '#10b981' }
  ];

  // Zone bar data
  const zoneRiskData = (projectData?.zones || []).map(z => ({
    name: z.id,
    score: z.riskScore,
    workers: z.activeWorkers
  }));

  // Trend data
  const riskTrendData = [
    { day: 'Mon', risk: 20 },
    { day: 'Tue', risk: 22 },
    { day: 'Wed', risk: 25 },
    { day: 'Thu', risk: 24 },
    { day: 'Fri', risk: 24 },
    { day: 'Sat', risk: 21 },
    { day: 'Sun', risk: 23 },
  ];

  // Helper to color codes
  const getZoneRiskClass = (score: number) => {
    if (score < 20) return 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-450';
    if (score < 40) return 'bg-blue-50 border-blue-100 hover:border-blue-300 dark:bg-blue-950/20 dark:border-blue-900/30 text-blue-700 dark:text-blue-400';
    if (score < 75) return 'bg-amber-50 border-amber-100 hover:border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-red-50 border-red-150 hover:border-red-300 dark:bg-red-950/20 dark:border-red-900/30 text-red-700 dark:text-red-400';
  };

  const getRiskLabel = (score: number) => {
    if (score < 20) return 'Low';
    if (score < 40) return 'Medium';
    if (score < 75) return 'High';
    return 'Critical';
  };

  // Safe checks for project data values
  const currentRiskScore = projectData?.riskScore || 24;
  const currentRiskLevel = projectData?.riskLevel || 'Low-Moderate';
  const openViolationsCount = projectData?.violations?.filter(v => v.status === 'Active')?.length || 0;
  const criticalViolationsCount = projectData?.criticalViolations || 0;
  const predictedDelayValue = projectData?.predictedDelay || 0;

  // Circular gauge score calculation variables
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentRiskScore / 100) * circumference;

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-orange-500" />
          <span>Real-time Risk Coefficient & Analytics</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Predictive hazard assessments, coordinate density checks, and rolling weekly structural threats indexes.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Card 1: Upgraded Circular Gauge Card */}
        <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between border border-slate-850 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition duration-300">
            <Zap className="w-24 h-24 text-orange-500" />
          </div>

          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Threat Index</span>
            <span className="text-xs text-orange-500 font-extrabold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>AI Live</span>
            </span>
          </div>

          <div className="my-4 flex items-center gap-4">
            {/* SVG Circular Gauge */}
            <div className="relative w-18 h-18 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r={radius - 18}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="5"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={radius - 18}
                  fill="transparent"
                  stroke={currentRiskScore > 75 ? '#ef4444' : currentRiskScore > 40 ? '#f97316' : '#10b981'}
                  strokeWidth="5.5"
                  strokeDasharray={2 * Math.PI * (radius - 18)}
                  strokeDashoffset={2 * Math.PI * (radius - 18) - (currentRiskScore / 100) * 2 * Math.PI * (radius - 18)}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-white">
                {currentRiskScore}
              </div>
            </div>

            <div>
              <p className="text-lg font-black leading-tight text-white uppercase">{currentRiskLevel}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Overall Rating</p>
            </div>
          </div>

          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            -4% trend vs last week
          </span>
        </div>

        <MetricCard
          title="Weather Risk"
          value="Low"
          changeText="No Alert"
          isPositive={true}
          subtext="Partly cloudy status"
          icon={<CloudRain className="w-5 h-5" />}
        />
        <MetricCard
          title="Safety Risk"
          value={criticalViolationsCount > 1 ? 'High' : 'Medium'}
          changeText={`${openViolationsCount} open`}
          isPositive={criticalViolationsCount === 0}
          subtext="PPE exclusions active"
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <MetricCard
          title="Schedule Risk"
          value={predictedDelayValue > 2 ? 'High' : 'Low'}
          changeText={`${predictedDelayValue} days delay`}
          isPositive={predictedDelayValue <= 1}
          subtext="Column curing loops"
          icon={<Calendar className="w-5 h-5" />}
        />
        <MetricCard
          title="Equipment Risk"
          value="Medium"
          changeText="Active checks"
          isPositive={false}
          subtext="Tower Crane lubricant"
          icon={<Wrench className="w-5 h-5" />}
        />
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-100 uppercase tracking-wider">
              Zone Risk Coordinate Map
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Select any zone below to preview granular worker density and mechanical risks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-5">
          {(projectData?.zones || []).map((zone) => (
            <div
              key={zone.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between h-28 hover:shadow-xs transition duration-150 cursor-pointer ${getZoneRiskClass(
                zone.riskScore
              )}`}
              onClick={() => setSelectedZoneDetail(zone.id)}
            >
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wide block opacity-75">{zone.id}</span>
                <span className="text-xs font-extrabold truncate block mt-0.5">{zone.name.split(' – ')[1] || zone.name}</span>
              </div>
              <div className="flex justify-between items-baseline mt-4">
                <span className="text-2xl font-black leading-none">{zone.riskScore}</span>
                <span className="text-[8px] font-black uppercase tracking-wider bg-white/50 dark:bg-black/30 px-1.5 py-0.5 rounded-sm">
                  {getRiskLabel(zone.riskScore)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Zone Detail Panel */}
        {selectedZoneDetail && (
          <div className="mt-6 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl text-xs font-semibold text-slate-500 animate-in fade-in duration-200 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">
                Zone Live Telemetry
              </span>
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none">
                {(projectData?.zones || []).find(z => z.id === selectedZoneDetail)?.name}
              </h4>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
                Description: {(projectData?.zones || []).find(z => z.id === selectedZoneDetail)?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-bold text-[11px] w-full sm:w-auto text-slate-600 dark:text-slate-400">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Active Workers</span>
                <span className="text-sm font-black text-slate-800 dark:text-white mt-1 block">
                  {(projectData?.zones || []).find(z => z.id === selectedZoneDetail)?.activeWorkers} Men
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Equipment Allocated</span>
                <span className="text-sm font-black text-indigo-650 dark:text-indigo-400 mt-1 block">
                  {((projectData?.zones || []).find(z => z.id === selectedZoneDetail)?.equipment || []).join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-405 text-slate-400 uppercase tracking-wider">Open Alerts</span>
                <span className="text-sm font-black text-red-500 mt-1 block">
                  {(projectData?.zones || []).find(z => z.id === selectedZoneDetail)?.openAlerts} Incidents
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Risk Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider">
              7-Day Risk Coefficient Forecast
            </h3>
            <p className="text-xs font-semibold text-slate-400">Rolling AI safety factor indicator</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800 animate-pulse" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#94a3b8" domain={[0, 50]} fontSize={11} fontWeight={600} tickLine={false} />
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
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#ef4444"
                  strokeWidth={3.5}
                  dot={{ r: 5 }}
                  name="Risk Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Category Donut */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider">
              Risk Weight Factors
            </h3>
            <p className="text-xs font-semibold text-slate-400">Core contributing factors</p>
          </div>
          <div className="h-44 flex justify-center py-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4 text-[11px] font-bold">
            {riskCategories.map((cat) => (
              <div key={cat.name} className="flex justify-between items-center text-slate-550">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <span className="text-slate-800 dark:text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Risk by Zone Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-855 dark:text-slate-100 uppercase tracking-wider">
            Risk Indices vs Worker Concentration
          </h3>
          <p className="text-xs font-semibold text-slate-400">Comparing risk thresholds against real-time worker count by zone</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneRiskData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              <Bar dataKey="score" fill="#f97316" radius={[4, 4, 0, 0]} name="Risk Index" />
              <Bar dataKey="workers" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Workers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
