import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { CloudSun, Thermometer, Droplets, Wind, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

export const WorkerWeather: React.FC = () => {
    const { user } = useAuth();

    const assignedProject = (user as any)?.assignedProject || 'Skyline Tower';
    const assignedZone = (user as any)?.assignedZone || 'Zone B';

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-orange-500" />
                    <span>Site Weather & Environmental Alerts</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                    Review live environmental feeds and mandated safety adjustments for your active zone.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Core Stats Details */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
                            Live Environmental Telemetry
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                            Station: {assignedProject} - Radar #1
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Stat: Temp */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center gap-4">
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-2.5 rounded-xl text-orange-500">
                                <Thermometer className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Temperature</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white block mt-0.5 leading-none">34°C</span>
                                <span className="text-[9px] text-amber-500 font-bold block mt-1">High Heat</span>
                            </div>
                        </div>

                        {/* Stat: Humidity */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center gap-4">
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-2.5 rounded-xl text-blue-500">
                                <Droplets className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Humidity</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white block mt-0.5 leading-none">62%</span>
                                <span className="text-[9px] text-slate-500 font-semibold block mt-1">Standard range</span>
                            </div>
                        </div>

                        {/* Stat: Wind */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-2.5 rounded-xl text-indigo-500">
                                <Wind className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Wind Speed</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white block mt-0.5 leading-none">12 km/h</span>
                                <span className="text-[9px] text-emerald-500 font-bold block mt-1">Light Breeze</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs font-semibold text-slate-500 flex gap-2.5 items-start">
                        <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            General weather parameters are updated every 15 minutes. In the event of a sudden severe lightning cell detection or heavy rain gust, the automated acoustic sirens on site will activate.
                        </div>
                    </div>
                </div>

                {/* Severe Forecast Alerts Box */}
                <div className="bg-red-50/30 dark:bg-red-950/15 border border-red-100/50 dark:border-red-950/30 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-red-500 p-2 rounded-xl text-white">
                            <AlertOctagon className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wider">
                                Heavy Weather Mandate
                            </h3>
                            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block">
                                Active in Zone: {assignedZone}
                            </span>
                        </div>
                    </div>

                    <p className="text-[11px] font-semibold text-red-655 text-red-600/80 dark:text-red-450/80 leading-relaxed">
                        HIGH TEMPERATURE HAZARD: Outdoor heavy-lift crane loading and scaffold boarding above floor level 3 are suspended between 13:00 and 15:30. Hydrate continuously. Report symptoms of fatigue or dizziness in the worker entry kiosk immediately.
                    </p>

                    <div className="border-t border-red-200/50 dark:border-red-900/30 pt-3 text-[10px] text-red-700/60 dark:text-red-400/60 space-y-1 font-bold">
                        <div>· Crane operation: SUSPENDED</div>
                        <div>· Scaffold floor level &gt; 3: SUSPENDED</div>
                        <div>· Mandatory Hydration Break: 15 min / hour</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default WorkerWeather;
