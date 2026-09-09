import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { workerService } from '../features/worker-entry/services/workerService';
import { EntryLog } from '../data/mockData';
import { Calendar, Search } from 'lucide-react';

export const WorkerEntryHistory: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EntryLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const allWorkers = workerService.getWorkers();
    const matched = allWorkers.find(
      w => w.name.toLowerCase() === user.name.toLowerCase() || 
           w.email === user.email ||
           w.workerId === (user as any).workerId
    );

    if (matched) {
      const allLogs = workerService.getLogs();
      setLogs(allLogs.filter(l => l.workerId === matched.workerId));
    }
  }, [user]);

  const filteredLogs = logs.filter(l => 
    l.zone.toLowerCase().includes(search.toLowerCase()) || 
    l.entryDate.includes(search)
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="w-5 h-5 text-orange-500" />
          <span>My Gate Access History</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Review all your gate verify checks and logs</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by zone name or date..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Entry Time</th>
              <th className="py-2.5 px-3">Exit Time</th>
              <th className="py-2.5 px-3">Zone Location</th>
              <th className="py-2.5 px-3">PPE Compliance</th>
              <th className="py-2.5 px-3">Result</th>
              <th className="py-2.5 px-3 text-right">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
            {filteredLogs.slice().reverse().map(l => (
              <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                <td className="py-2 px-3 font-mono">{l.entryDate}</td>
                <td className="py-2 px-3 font-mono">{l.entryTime}</td>
                <td className="py-2 px-3 font-mono">{l.exitTime || '--'}</td>
                <td className="py-2 px-3">{l.zone}</td>
                <td className="py-2 px-3 font-mono">{l.ppeScore}%</td>
                <td className="py-2 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    l.accessResult === 'ALLOWED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {l.accessResult}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-[10px] font-bold text-red-500">
                  {l.denialReason || '--'}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                  No matching entry logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
