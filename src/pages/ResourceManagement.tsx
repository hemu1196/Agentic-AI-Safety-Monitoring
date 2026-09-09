import React from 'react';
import { useProject } from '../hooks/useProject';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { Users, Truck, Package, Activity, ArrowRightLeft } from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  const { projectData } = useProject();

  // Helper to color raw material progress bars
  const getMaterialBarColor = (utilization: number, status: string) => {
    if (status === 'Shortage Risk') return 'bg-red-500';
    if (utilization > 90) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Resource Management
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Workforce allocation, equipment utilization, and inventory control.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Active Workforce"
          value={projectData.activeWorkers}
          changeText={`${projectData.workersOnBreak} on break`}
          isPositive={true}
          subtext="Induction clearance active"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Equipment Active"
          value={`${projectData.equipment.filter(e => e.status === 'Active').length} / ${projectData.equipment.length}`}
          subtext={`${projectData.equipment.filter(e => e.status === 'Idle').length} idling machines`}
          icon={<Truck className="w-5 h-5 text-orange-500" />}
        />
        <MetricCard
          title="Material Stock Rate"
          value={`${projectData.materialUtilization}%`}
          changeText={projectData.materialTrend.includes('short') ? 'Shortage Warning' : 'Normal'}
          isPositive={!projectData.materialTrend.includes('short')}
          subtext={projectData.materialTrend}
          icon={<Package className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="Attendance Rate"
          value="98.2%"
          changeText="+0.5% vs avg"
          isPositive={true}
          subtext="Digital induction linked"
          icon={<Activity className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Equipment Table */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Heavy Machinery & Equipment Log</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Asset coordinates and utilization parameters</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location Zone</th>
                  <th className="py-3 px-4">Utilization</th>
                  <th className="py-3 px-4">Next Maintenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                {projectData.equipment.map((eq) => (
                  <tr key={eq.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{eq.name}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={eq.status} />
                    </td>
                    <td className="py-3.5 px-4">{eq.location}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${eq.utilization}%` }}
                          />
                        </div>
                        <span>{eq.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{eq.nextMaintenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Materials Utilization Bars */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Materials Inventory</h3>
            <p className="text-xs font-semibold text-slate-400 mb-5">Current material usage levels and risk factors</p>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {projectData.materials.map((mat) => (
              <div key={mat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{mat.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">Used:</span>
                    <span className="text-slate-800 dark:text-white font-bold">{mat.utilization}%</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      mat.status === 'Shortage Risk'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                    }`}>
                      {mat.status}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getMaterialBarColor(mat.utilization, mat.status)}`}
                    style={{ width: `${mat.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
