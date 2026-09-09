import React, { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { ZoneDetail } from '../data/mockData';
import { X, Users, Wrench, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export const SiteMap: React.FC = () => {
  const { projectData } = useProject();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const selectedZone = projectData.zones.find(z => z.id === selectedZoneId);

  // Risk Color Mapping
  const getRiskColor = (score: number) => {
    if (score < 20) return { bg: 'bg-emerald-500/10 dark:bg-emerald-500/5', border: 'border-emerald-500', fill: '#10b981', label: 'Low Risk', text: 'text-emerald-600 dark:text-emerald-400' };
    if (score < 40) return { bg: 'bg-blue-500/10 dark:bg-blue-500/5', border: 'border-blue-500', fill: '#3b82f6', label: 'Medium Risk', text: 'text-blue-600 dark:text-blue-400' };
    if (score < 75) return { bg: 'bg-amber-500/10 dark:bg-amber-500/5', border: 'border-amber-500', fill: '#f59e0b', label: 'High Risk', text: 'text-amber-600 dark:text-amber-400' };
    return { bg: 'bg-red-500/10 dark:bg-red-500/5', border: 'border-red-500', fill: '#ef4444', label: 'Critical Risk', text: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Site Map
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Interactive coordinate map and active safety zoning diagnostics.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Interactive SVG Site Map Grid */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex-1 flex flex-col justify-between min-h-[450px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Interactive Site Coordinates Blueprint</h3>
            <p className="text-xs font-semibold text-slate-400 mb-6">Select a grid sector to view active sensor feeds and worker counts</p>
          </div>

          {/* SVG Grid Map */}
          <div className="flex-1 flex items-center justify-center p-4">
            <svg
              viewBox="0 0 600 400"
              className="w-full max-w-2xl border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 shadow-inner overflow-hidden"
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Zone A: Top Left */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedZoneId('Zone A')}
              >
                <rect
                  x="20"
                  y="20"
                  width="160"
                  height="160"
                  rx="12"
                  fill={getRiskColor(projectData.zones[0].riskScore).fill}
                  fillOpacity={selectedZoneId === 'Zone A' ? 0.25 : 0.12}
                  stroke={getRiskColor(projectData.zones[0].riskScore).fill}
                  strokeWidth={selectedZoneId === 'Zone A' ? 3 : 1.5}
                  className="transition-all group-hover:fill-opacity-25"
                />
                <text x="35" y="45" className="text-xs font-bold fill-slate-700 dark:fill-slate-300">Zone A</text>
                <text x="35" y="65" className="text-[10px] font-semibold fill-slate-400">Foundation</text>
              </g>

              {/* Zone B: Top Center */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedZoneId('Zone B')}
              >
                <rect
                  x="200"
                  y="20"
                  width="200"
                  height="160"
                  rx="12"
                  fill={getRiskColor(projectData.zones[1].riskScore).fill}
                  fillOpacity={selectedZoneId === 'Zone B' ? 0.25 : 0.12}
                  stroke={getRiskColor(projectData.zones[1].riskScore).fill}
                  strokeWidth={selectedZoneId === 'Zone B' ? 3 : 1.5}
                  className="transition-all group-hover:fill-opacity-25"
                />
                <text x="215" y="45" className="text-xs font-bold fill-slate-700 dark:fill-slate-300">Zone B</text>
                <text x="215" y="65" className="text-[10px] font-semibold fill-slate-400">Structural Frame</text>
              </g>

              {/* Zone C: Top Right */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedZoneId('Zone C')}
              >
                <rect
                  x="420"
                  y="20"
                  width="160"
                  height="160"
                  rx="12"
                  fill={getRiskColor(projectData.zones[2].riskScore).fill}
                  fillOpacity={selectedZoneId === 'Zone C' ? 0.25 : 0.12}
                  stroke={getRiskColor(projectData.zones[2].riskScore).fill}
                  strokeWidth={selectedZoneId === 'Zone C' ? 3 : 1.5}
                  className="transition-all group-hover:fill-opacity-25"
                />
                <text x="435" y="45" className="text-xs font-bold fill-slate-700 dark:fill-slate-300">Zone C</text>
                <text x="435" y="65" className="text-[10px] font-semibold fill-slate-400">Material Storage</text>
              </g>

              {/* Zone D: Bottom Left */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedZoneId('Zone D')}
              >
                <rect
                  x="20"
                  y="200"
                  width="160"
                  height="180"
                  rx="12"
                  fill={getRiskColor(projectData.zones[3].riskScore).fill}
                  fillOpacity={selectedZoneId === 'Zone D' ? 0.25 : 0.12}
                  stroke={getRiskColor(projectData.zones[3].riskScore).fill}
                  strokeWidth={selectedZoneId === 'Zone D' ? 3 : 1.5}
                  className="transition-all group-hover:fill-opacity-25"
                />
                <text x="35" y="225" className="text-xs font-bold fill-slate-700 dark:fill-slate-300">Zone D</text>
                <text x="35" y="245" className="text-[10px] font-semibold fill-slate-400">Equipment</text>
              </g>

              {/* Zone E: Bottom Center */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedZoneId('Zone E')}
              >
                <rect
                  x="200"
                  y="200"
                  width="200"
                  height="180"
                  rx="12"
                  fill={getRiskColor(projectData.zones[4].riskScore).fill}
                  fillOpacity={selectedZoneId === 'Zone E' ? 0.25 : 0.12}
                  stroke={getRiskColor(projectData.zones[4].riskScore).fill}
                  strokeWidth={selectedZoneId === 'Zone E' ? 3 : 1.5}
                  className="transition-all group-hover:fill-opacity-25"
                />
                <text x="215" y="225" className="text-xs font-bold fill-slate-700 dark:fill-slate-300">Zone E</text>
                <text x="215" y="245" className="text-[10px] font-semibold fill-slate-400">Worker Entry Portal</text>
              </g>

              {/* Zone F: Bottom Right */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedZoneId('Zone F')}
              >
                <rect
                  x="420"
                  y="200"
                  width="160"
                  height="180"
                  rx="12"
                  fill={getRiskColor(projectData.zones[5].riskScore).fill}
                  fillOpacity={selectedZoneId === 'Zone F' ? 0.25 : 0.12}
                  stroke={getRiskColor(projectData.zones[5].riskScore).fill}
                  strokeWidth={selectedZoneId === 'Zone F' ? 3 : 1.5}
                  className="transition-all group-hover:fill-opacity-25"
                />
                <text x="435" y="225" className="text-xs font-bold fill-slate-700 dark:fill-slate-300">Zone F</text>
                <text x="435" y="245" className="text-[10px] font-semibold fill-slate-400">Restricted Sector</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Side Details Drawer */}
        <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          {selectedZone ? (
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedZone.id}</h3>
                  <h2 className="text-md font-bold text-slate-800 dark:text-white mt-0.5">{selectedZone.name.split(' – ')[1]}</h2>
                </div>
                <button
                  onClick={() => setSelectedZoneId(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sector Focus</h4>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedZone.description}
                </p>
              </div>

              {/* Risk rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Risk Level</span>
                  <span className={`text-sm font-bold block mt-1 ${getRiskColor(selectedZone.riskScore).text}`}>
                    {getRiskColor(selectedZone.riskScore).label}
                  </span>
                </div>
                <div className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Risk Score</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white block mt-1">
                    {selectedZone.riskScore}/100
                  </span>
                </div>
              </div>

              {/* Stats lists */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Active Workers</span>
                  </span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedZone.activeWorkers}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Assets Deployed</span>
                  </span>
                  {selectedZone.equipment.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedZone.equipment.map(eq => (
                        <span key={eq} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {eq}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No heavy assets in this sector</p>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                    <span>Active Alerts</span>
                  </span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    selectedZone.openAlerts > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {selectedZone.openAlerts}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 flex-1">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Zone Selected</p>
              <p className="text-[10px] text-slate-400 max-w-[180px] mt-1">
                Click a grid coordinate sector on the map layout to inspect its active sensors.
              </p>
            </div>
          )}

          {/* Site status summary indicator */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 text-center mt-6">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Structural Nodes Operating
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
