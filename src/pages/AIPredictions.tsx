import React, { useState, useEffect } from 'react';
import { useProject } from '../hooks/useProject';
import { Sparkles, Calendar, ShieldAlert, Package, Wrench, ChevronRight, X, Play, ShieldAlert as AlertIcon, PlusCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface MitigationModal {
  isOpen: boolean;
  type: 'details' | 'mitigation';
  predictionId: string;
}

interface RankedRecommendation {
  id: string;
  rank: number;
  title: string;
  impact: string;
  benefit: string;
  actionText: string;
  state: 'IDLE' | 'LOADING' | 'APPLIED';
}

export const AIPredictions: React.FC = () => {
  const { projectData } = useProject();
  const [modal, setModal] = useState<MitigationModal>({ isOpen: false, type: 'details', predictionId: '' });

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RankedRecommendation[]>([
    {
      id: 'REC-01',
      rank: 1,
      title: 'Deploy concrete heat insulation blankets to Zone B structural layers',
      impact: 'CRITICAL',
      benefit: 'Reduces column framework curation crack risk by 84%',
      actionText: 'Dispatch Blankets',
      state: 'IDLE'
    },
    {
      id: 'REC-02',
      rank: 2,
      title: 'Pre-order structural steel rebar bundles from Secondary Depot yard',
      impact: 'HIGH',
      benefit: 'Obviates crane idle delays from logistics shortages',
      actionText: 'Authorize Stock Purchase',
      state: 'IDLE'
    },
    {
      id: 'REC-03',
      rank: 3,
      title: 'Broadcast heat mitigation fluid pause mandates to Zone B & F crew units',
      impact: 'MEDIUM',
      benefit: 'Preempts worker dehydration flags and entrance kiosk blocks',
      actionText: 'Schedule SMS Radio Broadcast',
      state: 'IDLE'
    }
  ]);

  // Forecast table progression data
  const weeklyForecast = [
    { week: 'Wk 35 (Upcoming)', delayApplied: '12%', delayUnmitigated: '72%', safetyApplied: '94%', safetyUnmitigated: '85%' },
    { week: 'Wk 36', delayApplied: '8%', delayUnmitigated: '75%', safetyApplied: '95%', safetyUnmitigated: '82%' },
    { week: 'Wk 37', delayApplied: '5%', delayUnmitigated: '78%', safetyApplied: '96%', safetyUnmitigated: '80%' },
    { week: 'Wk 38', delayApplied: '3%', delayUnmitigated: '84%', safetyApplied: '98%', safetyUnmitigated: '76%' }
  ];

  // Simulated trend data of prediction confidence over time
  const predictionTrend = [
    { week: 'Wk 31', delayProb: 45, incidentRisk: 10 },
    { week: 'Wk 32', delayProb: 50, incidentRisk: 12 },
    { week: 'Wk 33', delayProb: 65, incidentRisk: 15 },
    { week: 'Wk 34', delayProb: 72, incidentRisk: 18 },
  ];

  // Action applicator handler
  const handleApplyAction = (recId: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === recId ? { ...r, state: 'LOADING' } : r))
    );

    setTimeout(() => {
      setRecommendations(prev =>
        prev.map(r => (r.id === recId ? { ...r, state: 'APPLIED' } : r))
      );
    }, 1200);
  };

  // Helper to map predictions to icons
  const getIcon = (title: string) => {
    switch (title) {
      case 'PROJECT DELAY':
        return <Calendar className="w-5 h-5" />;
      case 'SAFETY INCIDENT RISK':
        return <ShieldAlert className="w-5 h-5 text-amber-505 text-amber-500" />;
      case 'MATERIAL SHORTAGE':
        return <Package className="w-5 h-5 text-red-500" />;
      case 'EQUIPMENT FAILURE':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const predictionsList = projectData?.predictions || [];
  const activePrediction = predictionsList.find(p => p.id === modal.predictionId);

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span>AI Predictive Modeling & Analytics</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Machine learning scheduler projections, resource supply risks, and actionable recommendations.
        </p>
      </div>

      {/* Predictions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {predictionsList.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 dark:bg-orange-955/20 p-2.5 rounded-xl text-orange-500 shrink-0">
                    {getIcon(p.title)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {p.title}
                    </h3>
                    <p className="text-lg font-black text-slate-800 dark:text-white mt-1.5 leading-none">
                      {p.metric}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${p.severity === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/10'
                  }`}>
                  {p.severity} Priority
                </span>
              </div>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed mt-2 font-semibold">
                {p.details}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 border-t border-slate-100 dark:border-slate-850 pt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-450 font-bold mr-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Model Confidence: {p.probability}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setModal({ isOpen: true, type: 'details', predictionId: p.id })}
                  className="flex-1 sm:flex-initial text-[10px] font-black uppercase tracking-wider text-slate-650 dark:text-slate-300 hover:text-slate-850 dark:hover:text-white px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition cursor-pointer select-none"
                >
                  Diagnostics
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ isOpen: true, type: 'mitigation', predictionId: p.id })}
                  className="flex-1 sm:flex-initial text-[10px] font-black uppercase tracking-wider bg-slate-950 dark:bg-orange-500 hover:bg-slate-900 dark:hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl transition cursor-pointer select-none"
                >
                  Mitigation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Split layout: Recommendations Left, Forecast Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Recommendations Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-855 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
              Ranked AI Recommendation Protocols
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Apply prescriptive automated mandates to optimize scheduling and safety bounds.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-850">
            {recommendations.map((rec) => (
              <div key={rec.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 sm:max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-extrabold text-orange-500">RANK #{rec.rank}</span>
                    <span className={`text-[8px] font-black px-1 py-0.5 rounded ${rec.impact === 'CRITICAL' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' :
                        rec.impact === 'HIGH' ? 'bg-amber-50 text-amber-600 dark:bg-amber-955/20 text-amber-500' :
                          'bg-indigo-50 text-indigo-700'
                      }`}>
                      {rec.impact}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                    {rec.title}
                  </h4>
                  <p className="text-[10px] text-slate-450 font-bold block mt-0.5">{rec.benefit}</p>
                </div>

                <div className="shrink-0">
                  {rec.state === 'LOADING' ? (
                    <button className="px-3.5 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5 select-none w-full sm:w-auto justify-center">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Configuring...</span>
                    </button>
                  ) : rec.state === 'APPLIED' ? (
                    <span className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Protocol Enforced</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyAction(rec.id)}
                      className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white dark:text-slate-250 font-black text-[9px] uppercase tracking-widest rounded-xl transition cursor-pointer select-none w-full sm:w-auto"
                    >
                      {rec.actionText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weekly Forecast Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
              Mitigation Forecasts
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Projected metrics outcome comparing applied steps.
            </p>
          </div>

          <div className="overflow-x-auto my-3">
            <table className="w-full text-left border-collapse text-[10px] font-bold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-450 uppercase">
                  <th className="py-2 px-1">Week Block</th>
                  <th className="py-2 px-1 text-emerald-500">Applied</th>
                  <th className="py-2 px-1 text-red-500">Unmitigated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-655 dark:text-slate-350">
                {weeklyForecast.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="py-2.5 px-1">{f.week}</td>
                    <td className="py-2.5 px-1 text-emerald-600 dark:text-emerald-450 font-mono">
                      D: {f.delayApplied} // S: {f.safetyApplied}
                    </td>
                    <td className="py-2.5 px-1 text-red-500 font-mono">
                      D: {f.delayUnmitigated} // S: {f.safetyUnmitigated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-205 dark:border-slate-850 text-[9px] font-semibold text-slate-400 leading-normal">
            *D: Projected Delay Probability. S: Projected mAP Safety Scanner Match value.
          </div>
        </div>

      </div>

      {/* Trend AreaChart block */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-855 dark:text-slate-100 uppercase tracking-widest">
            Model Threat Score Accuracy Forecast
          </h3>
          <p className="text-xs font-semibold text-slate-400">Rolling threat coefficient progression weights</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictionTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="delayColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incidentColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="delayProb" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#delayColor)" name="Schedule Delay Prob %" />
              <Area type="monotone" dataKey="incidentRisk" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#incidentColor)" name="Safety Risk Prob %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Details & Mitigation Modals */}
      {modal.isOpen && activePrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl border border-slate-205 dark:border-slate-800 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-955">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                  {modal.type === 'details' ? 'AI Model Diagnostics' : 'AI Mitigation Strategy'}
                </span>
              </div>
              <button
                onClick={() => setModal({ isOpen: false, type: 'details', predictionId: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prediction Subject</h4>
                <p className="text-md font-black text-slate-800 dark:text-white uppercase mt-0.5">{activePrediction.title}</p>
              </div>

              {modal.type === 'details' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-850 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
                    <h5 className="font-bold text-slate-850 dark:text-slate-200 mb-1.5">Anomaly Telemetry Data Feed:</h5>
                    {activePrediction.details}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-3.5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Probability Weight</span>
                      <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{activePrediction.probability}</span>
                    </div>
                    <div className="p-3.5 border border-slate-150 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Primary Trigger Driver</span>
                      <span className="text-lg font-black text-slate-850 dark:text-white mt-1 block truncate">{activePrediction.metric}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-orange-50/50 dark:bg-orange-955/15 border border-orange-100 dark:border-orange-900/30 rounded-2xl text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-350">
                    <h5 className="font-extrabold text-orange-600 dark:text-orange-400 mb-1.5 flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Recommended Mitigation Protocol:</span>
                    </h5>
                    {activePrediction.mitigation}
                  </div>
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Procedural Checkpoints</p>
                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs font-semibold bg-white dark:bg-slate-900">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer" />
                      <span className="text-slate-705 dark:text-slate-350">Deploy designated supervisor units to zone coordinate</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs font-semibold bg-white dark:bg-slate-900">
                      <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer" />
                      <span className="text-slate-705 dark:text-slate-350">Register compliance parameters in Gantt visual tracker</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-955 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal({ isOpen: false, type: 'details', predictionId: '' })}
                className="px-4 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer select-none"
              >
                Close
              </button>
              {modal.type === 'details' && (
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, type: 'mitigation' })}
                  className="px-4 py-2 bg-slate-950 dark:bg-orange-500 hover:bg-slate-900 dark:hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer select-none"
                >
                  Generate Mitigation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIPredictions;
