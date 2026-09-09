import React, { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Calendar, Filter, Users, MapPin, CheckCircle2, Clock, Award, AlertCircle, ArrowUpRight, Info } from 'lucide-react';

export const ProjectMonitoring: React.FC = () => {
  const { projectData } = useProject();
  const [activeTab, setActiveTab] = useState<'All' | 'On Track' | 'At Risk' | 'Delayed' | 'Completed'>('All');

  // Gantt Chart tasks structure (Visual Timeline Jan -> Dec 2026)
  const ganttTasks = [
    { name: 'Foundation Pouring', start: 'Jan', end: 'Mar', progress: 100, status: 'COMPLETED', color: 'bg-emerald-500' },
    { name: 'Structural Framework', start: 'Mar', end: 'Jul', progress: 100, status: 'COMPLETED', color: 'bg-emerald-500' },
    { name: 'Ground Floor Slab', start: 'Jun', end: 'Aug', progress: 95, status: 'IN PROGRESS', color: 'bg-orange-500' },
    { name: 'First Floor Pillars', start: 'Jul', end: 'Sep', progress: 45, status: 'DELAYED', color: 'bg-red-500' },
    { name: 'Electrical Grid Layout', start: 'Sep', end: 'Nov', progress: 10, status: 'PENDING', color: 'bg-slate-450' },
    { name: 'Final Safety Inspection', start: 'Nov', end: 'Dec', progress: 0, status: 'PENDING', color: 'bg-slate-400' },
  ];

  // Critical Project Milestones
  const projectMilestones = [
    { id: 'MS-1', name: 'Excavation & Base Curing', date: 'March 15, 2026', status: 'ACHIEVED', driver: 'Ahead' },
    { id: 'MS-2', name: 'Structural Core framework topped', date: 'July 10, 2026', status: 'ACHIEVED', driver: 'On Time' },
    { id: 'MS-3', name: 'Slab Casting & Level 1 structure', date: 'Sept 5, 2026', status: 'ON TRACK', driver: 'Expected Curing' },
    { id: 'MS-4', name: 'Internal HVAC fit-out loop', date: 'Nov 20, 2026', status: 'AT RISK', driver: 'Material Lead Time' }
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Helper to map month to grid column index
  const getColSpan = (start: string, end: string) => {
    const startIndex = months.indexOf(start);
    const endIndex = months.indexOf(end);
    return {
      gridColumnStart: startIndex + 2, // 1st column is label
      gridColumnEnd: endIndex + 3
    };
  };

  // Safe check tasks list
  const rawTasks = projectData?.tasks || [];
  const filteredTasks = rawTasks.filter(task => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Completed') return task.status === 'COMPLETED';
    if (activeTab === 'Delayed') return task.status === 'DELAYED';
    if (activeTab === 'On Track') return task.status === 'IN PROGRESS';
    if (activeTab === 'At Risk') return task.status === 'PENDING';
    return true;
  });

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          <span>Project Deliverables & Gantt Timelines</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Predictive schedule tracking, critical path milestones, and active work orders.
        </p>
      </div>

      {/* Summary KPI metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Project Progress"
          value={`${projectData?.progress || 68}%`}
          changeText={projectData?.progressChange || 'On Track'}
          isPositive={true}
          subtext="Updated 5 mins ago"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="Predicted Delay Risk"
          value={projectData?.predictedDelay > 0 ? `${projectData.predictedDelay} Days` : 'None'}
          changeText={`${projectData?.predictedDelayProb || 72}% probability`}
          isPositive={(projectData?.predictedDelay || 0) <= 2}
          subtext="Driver: Concrete Curing"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <MetricCard
          title="Active Workforce"
          value={`${projectData?.activeWorkers || 124} Men`}
          changeText={`${projectData?.workersOnBreak || 8} on break`}
          isPositive={true}
          subtext="Distributed in 6 zones"
          icon={<Users className="w-5 h-5 text-indigo-500" />}
        />
        <MetricCard
          title="Target Handover"
          value="Dec 2026"
          changeText="Milestone 4 Pending"
          isPositive={true}
          subtext="Standard buffer active"
          icon={<Award className="w-5 h-5 text-blue-500" />}
        />
      </div>

      {/* Gantt Timeline Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-855 dark:text-slate-100 uppercase tracking-widest">
              Live Gantt Visual Timeline
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Jan → Dec 2026</p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span>Active Phase</span>
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="min-w-[768px] grid gap-y-4 items-center" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
          {/* Header Row */}
          <div className="col-span-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pb-2">Task Area</div>
          {months.map((m) => (
            <div key={m} className="text-center font-mono text-[10px] font-bold text-slate-400 pb-2 border-l border-slate-100 dark:border-slate-850">
              {m}
            </div>
          ))}

          {/* Task Rows */}
          {ganttTasks.map((task) => (
            <React.Fragment key={task.name}>
              {/* Row label */}
              <div className="col-span-1 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 pr-2 truncate">
                {task.name}
              </div>
              {/* Gantt Bar */}
              <div
                className="h-7 rounded-xl flex items-center px-3 relative overflow-hidden shadow-xs hover:shadow-xs transition-all border border-slate-100 dark:border-slate-850"
                style={getColSpan(task.start, task.end)}
              >
                {/* Background opacity bar */}
                <div className={`absolute inset-0 opacity-10 ${task.color}`} />
                {/* Progress bar fill */}
                <div
                  className={`absolute left-0 top-0 bottom-0 opacity-20 ${task.color}`}
                  style={{ width: `${task.progress}%` }}
                />

                {/* Text overlay */}
                <div className="relative flex justify-between items-center w-full text-[9px] font-mono font-bold z-10">
                  <span className="text-slate-705 dark:text-slate-205 uppercase">{task.status}</span>
                  <span className="text-slate-600 dark:text-slate-350">{task.progress}%</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Milestones & Deliverables splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Milestones List */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
              Key Project Milestones
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">Audit milestones mapping handover metrics.</p>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 mt-4">
              {projectMilestones.map((ms) => (
                <div key={ms.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-400">{ms.id}</span>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-250 leading-tight">{ms.name}</h4>
                    <span className="text-[9px] text-slate-450 font-bold block mt-0.5">{ms.date}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-flex items-center text-[8px] font-black px-1.5 py-0.5 rounded ${ms.status === 'ACHIEVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                      ms.status === 'ON TRACK' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                        'bg-red-50 text-red-650 dark:bg-red-955/20 text-red-500 animate-pulse'
                      }`}>
                      {ms.status}
                    </span>
                    <span className="block text-[8px] font-semibold text-slate-400 font-sans tracking-wide">{ms.driver}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-200 dark:border-slate-850 flex gap-2 items-start text-[10px] font-semibold text-slate-400">
            <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <span>Delays on structural frameworks cascade into subsequent HVAC components. Priority dispatch enabled.</span>
          </div>
        </div>

        {/* Right: Tasks & Deadlines table feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-widest">
                Deliverables Tracker
              </h3>
            </div>

            {/* Filters tab */}
            <div className="flex bg-slate-100 dark:bg-slate-955 p-1 rounded-xl border border-slate-200 dark:border-slate-850 w-fit">
              {(['All', 'On Track', 'At Risk', 'Delayed', 'Completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === tab
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-450 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Deliverable Task</th>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">Crew Assigned</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-bold text-slate-655 dark:text-slate-350">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">{task.name}</td>
                    <td className="py-3 px-3 font-mono">{task.zone}</td>
                    <td className="py-3 px-3 font-mono text-indigo-500 dark:text-indigo-400">{task.owner}</td>
                    <td className="py-3 px-3 font-mono">{task.dueDate}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="font-mono">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-550 font-semibold italic">
                      No matching deliverables for this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
