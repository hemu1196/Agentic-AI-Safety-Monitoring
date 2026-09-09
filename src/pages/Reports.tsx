import React, { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { FileText, Eye, Download, X, Sparkles } from 'lucide-react';

interface ReportItem {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
  description: string;
  content: string;
}

export const Reports: React.FC = () => {
  const { projectData } = useProject();
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  const reportsList: ReportItem[] = [
    {
      id: 'REP-01',
      name: 'Daily Safety Report',
      category: 'Safety',
      date: '28 Aug 2026',
      size: '12 KB',
      description: 'Contains entry safety PPE audits, registered active violations, and resolution timeline parameters.',
      content: `SITE SENTINEL - DAILY SAFETY REPORT\n==================================\nProject: ${projectData.name}\nDate: August 28, 2026\n\n1. SAFETY SCORE: ${projectData.safetyScore}%\n2. OPEN VIOLATIONS: ${projectData.violations.filter(v => v.status === 'Active').length}\n3. CRITICAL ALERTS: ${projectData.criticalViolations}\n\nVIOLATIONS REGISTERED TODAY:\n--------------------------\n${projectData.violations.map(v => `- [${v.id}] ${v.violation} in ${v.zone} at ${v.detectedTime} (${v.severity} / ${v.status})`).join('\n')}\n\nCONCLUSION:\nSite safety metrics are currently PPE compliance driven. Standard recommendations: verify rebar visor guidelines at Zone B entry and check crane cables.`
    },
    {
      id: 'REP-02',
      name: 'Weekly Project Progress',
      category: 'Timeline',
      date: '26 Aug 2026',
      size: '24 KB',
      description: 'Summary of task timelines, Gantt critical paths, delays, and completion percentage updates.',
      content: `SITE SENTINEL - WEEKLY PROGRESS REPORT\n======================================\nProject: ${projectData.name}\nReported On: August 26, 2026\n\n1. TOTAL PROJECT COMPLETION: ${projectData.progress}%\n2. TARGET: ${projectData.progressTarget}\n3. CURRENT DELAY FORECAST: ${projectData.predictedDelay} Days (Probability: ${projectData.predictedDelayProb}%)\n\nACTIVE MILESTONES:\n-----------------\n${projectData.tasks.map(t => `- ${t.name} (${t.zone}): ${t.progress}% complete - Status: ${t.status}`).join('\n')}\n\nAI RECOMMENDATIONS:\nSchedule risk is high for structural casting. Please reference AI Predictions dashboard for mitigation offsets.`
    },
    {
      id: 'REP-03',
      name: 'Risk Assessment Report',
      category: 'Risk',
      date: '28 Aug 2026',
      size: '18 KB',
      description: 'AI-generated threat index across zones, weather patterns, material availability, and sensor anomalies.',
      content: `SITE SENTINEL - RISK ASSESSMENT REPORT\n======================================\nProject: ${projectData.name}\nAnalyzed on: August 28, 2026\n\n1. OVERALL RISK COEFFICIENT: ${projectData.riskScore}/100 (${projectData.riskLevel})\n2. RISK DRIVER RATINGS:\n   - Schedule: High\n   - Weather: ${projectData.weather.impacts.rain === 'High' ? 'High' : 'Low'}\n   - Safety: Medium\n\nZONE HEATMAP STATUS:\n------------------\n${projectData.zones.map(z => `- ${z.name}: Risk score ${z.riskScore}/100 (Workers: ${z.activeWorkers})`).join('\n')}\n\nSUMMARY:\nSchedule and material issues are key risk drivers. Monitor shipping channels for steel rebar replenishment.`
    },
    {
      id: 'REP-04',
      name: 'Equipment Utilization Report',
      category: 'Resources',
      date: '27 Aug 2026',
      size: '15 KB',
      description: 'Details machinery hours, load parameters, active vs idle assets, and maintenance alarms.',
      content: `SITE SENTINEL - EQUIPMENT UTILIZATION\n=====================================\nProject: ${projectData.name}\nReport Date: August 27, 2026\n\n1. ACTIVE MACHINERY ASSETS: ${projectData.activeEquipment}\n2. IDLE ASSETS: ${projectData.idleEquipment}\n\nASSET METRICS LOG:\n-----------------\n${projectData.equipment.map(e => `- ${e.name} (${e.location}): Status: ${e.status} | Utilization: ${e.utilization}% | Next check: ${e.nextMaintenance}`).join('\n')}\n\nMAINTENANCE RECOMMENDATIONS:\nSchedule immediate lube service for high load assets.`
    },
    {
      id: 'REP-05',
      name: 'Quality Inspection Report',
      category: 'Quality',
      date: '28 Aug 2026',
      size: '14 KB',
      description: 'Audit logs for compressive concrete strength, rebar welds, fitting compliance, and defect fixes.',
      content: `SITE SENTINEL - QUALITY AUDIT REPORT\n====================================\nProject: ${projectData.name}\nGenerated on: August 28, 2026\n\n1. QUALITY SCORE: 94.2%\n2. OPEN DEFECTS COUNT: ${projectData.defects.reduce((acc, curr) => acc + curr.value, 0)}\n\nAUDIT STATUS LOG:\n----------------\n${projectData.inspections.map(i => `- ${i.area}: Inspector ${i.inspector} | Result: ${i.result} (${i.status})`).join('\n')}\n\nCONCRETE CAST TELEMETRY:\n- Node Temp: 32.4 C\n- Node Moisture: 82.1% RH\n- Est strength: 22.8 MPa`
    }
  ];

  // Client-side file downloader
  const downloadReport = (report: ReportItem) => {
    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.toLowerCase().replace(/ /g, '_')}_${report.date.replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Reports
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Generated executive logs, safety records, and progress audits.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-2.5 rounded-xl text-orange-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                      {report.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {report.category} • {report.date}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">
                  {report.size}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-2">
                {report.description}
              </p>
            </div>

            <div className="mt-6 flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
              <button
                onClick={() => setPreviewReport(report)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => downloadReport(report)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Report Document Preview
                </span>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 h-64 overflow-y-auto whitespace-pre-wrap select-all">
                {previewReport.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  downloadReport(previewReport);
                  setPreviewReport(null);
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
