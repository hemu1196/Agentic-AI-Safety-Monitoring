import React from 'react';
import { Shield, BrainCircuit, ShieldAlert, Users, Calendar } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <div className="w-full grid lg:grid-cols-2">
        {/* Left Side: Professional Visual Banner Area (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden select-none">
          {/* Decorative graphic patterns */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          {/* Header Branding */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight leading-none">SITE SENTINEL</div>
              <div className="text-[10px] font-bold text-orange-500 tracking-wider uppercase mt-1">Agentic AI Safety</div>
            </div>
          </div>

          {/* Middle Body Graphic highlights */}
          <div className="relative z-10 max-w-md my-auto space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
              AI-Powered Construction Safety & Risk Intelligence Platform
            </h2>
            <p className="text-sm font-semibold text-slate-400 leading-relaxed">
              Site Sentinel monitors structural telemetry, safety helmet visor checklist parameters, and worker access compliance logs autonomously.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <BrainCircuit className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-slate-200">AI Risk Intelligence</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Real-Time Safety</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <Users className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Worker Entry Mgmt</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <Calendar className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Predictive Analytics</span>
              </div>
            </div>
          </div>

          {/* Footer details */}
          <div className="relative z-10 text-xs text-slate-500 font-semibold">
            © 2026 Site Sentinel Inc. Autonomous operations sandbox.
          </div>
        </div>

        {/* Right Side: Sign-in / Reset form Card */}
        <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {/* Logo on mobile only */}
            <div className="flex justify-center items-center lg:hidden mb-6">
              <div className="bg-orange-500 p-2 rounded-xl text-white flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <span className="text-lg font-bold text-slate-900 ml-2 tracking-tight">SITE SENTINEL</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
