import React from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  ShieldCheck, ShieldAlert, Heart, HardHat,
  Activity, CheckCircle, AlertTriangle, ArrowRight, Shield
} from 'lucide-react';

export const WorkerSafetyStatus: React.FC = () => {
  const { user } = useAuth();

  const workerName = user?.name || 'Ramesh Kumar';
  const workerRole = user?.role || 'WORKER';
  const workerId = (user as any)?.workerId || 'WRK-1001';
  const assignedProject = (user as any)?.assignedProject || 'Skyline Tower';
  const assignedZone = (user as any)?.assignedZone || 'Zone B';

  // Ramesh is 100% compliant, Arjun or others are 80% compliant with warnings.
  const isRamesh = workerId === 'WRK-1001';
  const complianceScore = isRamesh ? 100 : 80;

  const items = [
    { name: 'Hard Hat / Safety Helmet', status: 'VERIFIED', verifiedAt: '09:05 AM', icon: HardHat, compliant: true },
    { name: 'Class 2 Safety Vest', status: 'VERIFIED', verifiedAt: '09:05 AM', icon: Shield, compliant: true },
    { name: 'Steel-toed Safety Boots', status: 'VERIFIED', verifiedAt: '09:05 AM', icon: ShieldCheck, compliant: true },
    {
      name: 'Safety Harness (Fall Protection)',
      status: isRamesh ? 'VERIFIED' : 'WARNING - NOT DETECTED',
      verifiedAt: isRamesh ? '09:05 AM' : 'N/A',
      icon: ShieldAlert,
      compliant: isRamesh
    },
    { name: 'Protective Safety Eyewear', status: 'VERIFIED', verifiedAt: '09:05 AM', icon: Activity, compliant: true }
  ];

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
        <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-500" />
          <span>My Safety & Compliance Status</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Review live PPE compliance metrics flagged during your entrance scan at the Vision Gate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Score & Core Badging */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
              Compliance Rating
            </h3>

            {/* Circular Gauge Ring */}
            <div className="relative flex items-center justify-center py-6">
              <div className="w-36 h-36 rounded-full border-8 border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-black tracking-tight ${complianceScore === 100 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                  {complianceScore}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">PPE MATCH</span>
              </div>
              {/* Overlay half ring if Warning */}
              <div className={`absolute inset-y-6 w-36 h-36 rounded-full border-8 border-transparent ${complianceScore === 100 ? 'border-t-emerald-500 border-r-emerald-500' : 'border-t-amber-500'
                } animate-[spin_1.5s_ease-out_1]`} />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase">
                {complianceScore === 100 ? 'EXCELLENT COMPLIANCE' : 'COMPLIANCE WARNING ACTIVE'}
              </h4>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-xs mx-auto">
                {complianceScore === 100
                  ? 'All core PPE items were successfully identified by Vision AI cameras. Scan validated.'
                  : 'Safety harness was not verified during zone entry. Please check attachment immediately.'}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-150 dark:border-slate-850 pt-4 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Last Scan: Today 09:05 AM</span>
            <span className="text-orange-500 uppercase text-[10px] tracking-wider font-extrabold">Gate #2</span>
          </div>
        </div>

        {/* Right Side: Checklist details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">PPE Checklist Verification</h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2 rounded-xl border ${item.compliant
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-990/30'
                          : 'bg-red-50 border-red-100 text-red-500 dark:bg-red-950/20 dark:border-red-990/30'
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-none">{item.name}</h4>
                        <span className="text-[10px] text-slate-450 font-medium block mt-1">Status: {item.status}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${item.compliant
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-red-50 text-red-600 border border-red-100 animate-pulse'
                      }`}>
                      {item.compliant ? 'VERIFIED' : 'HAZARD'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compliance recommendations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Health & Safety Reminders</h4>
            </div>
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed font-semibold">
              Current humidity index is 62%. Drink at least 350ml of water every hour to prevent dehydration and fatigue. Ensure safety hooks are secured when boarding scaffolding floor 4.
            </p>
            <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
              <span>Read Site Manual</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkerSafetyStatus;
