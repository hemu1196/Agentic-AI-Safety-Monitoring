import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    AlertTriangle, Camera, Sparkles, Upload,
    CheckCircle, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';

interface WorkerReport {
    reportId: string;
    workerId: string;
    workerName: string;
    username: string;
    project: string;
    zone: string;
    issueType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: {
        block: string;
        floor: string;
        zone: string;
    };
    description: string;
    image: string | null;
    aiAnalysis: string | null;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED';
    submittedAt: string;
    adminResponse: string;
}

export const ReportIssue: React.FC = () => {
    const { user } = useAuth();
    const [classification, setClassification] = useState('Unsafe Condition');
    const [details, setDetails] = useState('');

    // Camera simulator state
    const [cameraState, setCameraState] = useState<'idle' | 'streaming' | 'captured'>('idle');
    const [visionState, setVisionState] = useState<'idle' | 'analyzing' | 'complete'>('idle');
    const [visionResult, setVisionResult] = useState<any>(null);
    const [capturedImage, setCapturedImage] = useState<string>('');

    const workerId = (user as any)?.workerId || 'WRK-1001';
    const workerName = user?.name || 'Ramesh Kumar';
    const assignedProject = (user as any)?.assignedProject || 'Skyline Tower';
    const assignedZone = (user as any)?.assignedZone || 'Zone B';

    // Toggle Camera Simulator
    const startCamera = () => {
        setCameraState('streaming');
        setVisionState('idle');
        setVisionResult(null);
    };

    const capturePhoto = () => {
        // Generate a simulated mock photo/SVG data url
        const mockImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230f172a"/><circle cx="200" cy="150" r="60" stroke="%23f97316" stroke-width="4" fill="none" stroke-dasharray="10 5"/><rect x="180" y="110" width="40" height="20" fill="%23ef4444"/><text x="200" y="240" fill="white" font-size="14" font-weight="bold" text-anchor="middle">SIMULATED HAZARD STREAM</text></svg>`;
        setCapturedImage(mockImage);
        setCameraState('captured');

        // Auto-trigger Vision AI analysis
        analyzeWithVision();
    };

    const analyzeWithVision = () => {
        setVisionState('analyzing');
        setTimeout(() => {
            setVisionState('complete');
            // Mock Vision AI Result based on classification
            const isCritical = classification === 'Structural Hazard' || classification === 'Fire Hazard';
            setVisionResult({
                hazardDetected: true,
                confidenceScore: 92.4,
                detectedObjects: [classification, 'Improper Signage', 'Obstruction'],
                riskRating: isCritical ? 'CRITICAL' : 'MEDIUM'
            });
        }, 2000);
    };

    const resetCamera = () => {
        setCameraState('idle');
        setCapturedImage('');
        setVisionState('idle');
        setVisionResult(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!details.trim()) {
            alert("Please provide details for the issue.");
            return;
        }

        // Load active reports
        const existing = localStorage.getItem('siteSentinelWorkerReports');
        let reportsList: WorkerReport[] = [];
        if (existing) {
            try {
                reportsList = JSON.parse(existing);
            } catch (err) {
                reportsList = [];
            }
        }

        let blockVal = 'Block A';
        let floorVal = '3rd Floor';
        // Parse simple block/floor context from details text
        if (details.toLowerCase().includes('block b')) blockVal = 'Block B';
        if (details.toLowerCase().includes('block c')) blockVal = 'Block C';
        if (details.toLowerCase().includes('1st floor') || details.toLowerCase().includes('floor 1')) floorVal = '1st Floor';
        if (details.toLowerCase().includes('2nd floor') || details.toLowerCase().includes('floor 2')) floorVal = '2nd Floor';
        if (details.toLowerCase().includes('4th floor') || details.toLowerCase().includes('floor 4')) floorVal = '4th Floor';

        let severityVal: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
        if (visionResult?.riskRating) {
            severityVal = visionResult.riskRating;
        } else if (classification === 'Structural Hazard' || classification === 'Fire Hazard') {
            severityVal = 'CRITICAL';
        } else if (classification === 'PPE Compliance Failure') {
            severityVal = 'HIGH';
        }

        const newReport: WorkerReport = {
            reportId: `ISS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            workerId,
            workerName,
            username: user?.username || workerName.toLowerCase().replace(' ', ''),
            project: assignedProject,
            zone: assignedZone,
            issueType: classification,
            severity: severityVal,
            location: {
                block: blockVal,
                floor: floorVal,
                zone: assignedZone
            },
            description: details,
            image: capturedImage || null,
            aiAnalysis: visionResult ? `AI DETECTED: ${visionResult.detectedObjects.join(', ')}. Confidence: ${visionResult.confidenceScore}%.` : null,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            adminResponse: ''
        };

        reportsList.unshift(newReport);
        localStorage.setItem('siteSentinelWorkerReports', JSON.stringify(reportsList));

        // Dispatch storage status changed matching Sidebar badge listener
        window.dispatchEvent(new Event('worker_report_status_changed'));

        alert("Issue Report successfully submitted to Vision AI and Admin Triage!");
        // Reset Form
        setDetails('');
        resetCamera();
    };

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span>Report a Site Issue</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                    Use the camera simulation and Vision AI model to classify hazards or equipment failures.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side: Detail Specifications */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Issue Credentials</h3>

                    {/* Classification Selection */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</label>
                        <select
                            value={classification}
                            onChange={e => setClassification(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition cursor-pointer"
                        >
                            <option value="Unsafe Condition">Unsafe Condition (Generic)</option>
                            <option value="PPE Compliance Failure">PPE Compliance Failure</option>
                            <option value="Structural Hazard">Structural Hazard</option>
                            <option value="Fire Hazard">Fire Hazard</option>
                            <option value="Equipment Malfunction">Equipment Malfunction</option>
                            <option value="Minor Slip/Trip">Minor Slip / Trip Risk</option>
                        </select>
                    </div>

                    {/* Details Text */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Details & Context</label>
                        <textarea
                            required
                            rows={4}
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="e.g. Scaffolding joints on floor 3 exhibit slight movement. Weld integrity appears degraded. No immediate collapse but needs immediate retightening."
                            className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition resize-none leading-relaxed"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-orange-500 hover:bg-orange-655 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Report & Log Telemetry</span>
                    </button>
                </div>

                {/* Right Side: Camera Simulator and Vision AI output */}
                <div className="space-y-6">
                    {/* Camera Viewport Simulation */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-lg min-h-[300px] flex flex-col justify-between p-4">

                        {/* Viewport top HUD */}
                        <div className="flex justify-between items-center z-10">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-black/60 backdrop-blur-md text-red-500 border border-red-500/20 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                <span>Simulated Camera View</span>
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                                1080P FHD 60FPS
                            </span>
                        </div>

                        {/* Viewport Core Frame */}
                        <div className="flex-1 flex items-center justify-center min-h-[200px]">
                            {cameraState === 'idle' && (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-slate-850 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-700/30">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-slate-205 py-1 text-slate-400">Initialize Camera Simulator</h4>
                                        <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                                            Click initialize below to simulate taking a live photo of structural hazards or machinery failures on site.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="px-4 py-2 bg-orange-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-orange-600 transition"
                                    >
                                        Start Viewfinder
                                    </button>
                                </div>
                            )}

                            {cameraState === 'streaming' && (
                                <div className="relative w-full h-full flex flex-col items-center justify-center space-y-4">
                                    {/* Outer viewfinder corner ticks (CSS) */}
                                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
                                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

                                    {/* Mock live mesh/grid */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                                    <AlertTriangle className="w-14 h-14 text-orange-500/70 animate-pulse" />
                                    <span className="text-[10px] text-orange-400 font-bold bg-orange-950/40 px-3 py-1 rounded-full outline-2 outline-orange-500/20">
                                        AIME GAIN STABILIZED - CLICK CAPTURE
                                    </span>

                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="px-5 py-2.5 bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-red-700 transition"
                                    >
                                        Capture Hazard Photo
                                    </button>
                                </div>
                            )}

                            {cameraState === 'captured' && (
                                <div className="w-full h-full flex items-center justify-center p-2">
                                    <img
                                        src={capturedImage}
                                        alt="Captured screenshot"
                                        className="max-h-[220px] rounded-xl border border-slate-800 object-contain shadow-md"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Bottom Controls HUD */}
                        {cameraState === 'captured' && (
                            <div className="flex justify-between items-center border-t border-slate-800/80 pt-3 z-10">
                                <span className="text-[9px] font-bold text-slate-400 leading-none">
                                    Frame capture: completed
                                </span>
                                <button
                                    type="button"
                                    onClick={resetCamera}
                                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Retake</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Vision AI Analyzer Mock Diagnostic Panel */}
                    {visionState !== 'idle' && (
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <h4 className="text-xs font-black uppercase tracking-wider">Vision AI Realtime Diagnostic</h4>
                                </div>
                                {visionState === 'analyzing' ? (
                                    <span className="text-[10px] text-indigo-400 font-extrabold animate-pulse uppercase tracking-wider bg-indigo-950/50 px-2 py-0.5 rounded-md">
                                        Running Inference...
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Analysis Valid</span>
                                    </span>
                                )}
                            </div>

                            {visionState === 'analyzing' && (
                                <div className="space-y-2">
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full animate-[shimmer_2s_infinite] w-[70%]" style={{
                                            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                                        }} />
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-bold font-mono">
                                        LOG: loading weights... segmenting bounding boxes... predicting compliance scores...
                                    </div>
                                </div>
                            )}

                            {visionState === 'complete' && visionResult && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                    {/* Column 1 info */}
                                    <div className="space-y-2.5">
                                        <div>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Compliance Triage</div>
                                            <div className="text-slate-200 mt-0.5 font-bold flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                                <span>Hazard Confirmed</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Confidence Score</div>
                                            <div className="text-indigo-400 mt-0.5 font-bold">{visionResult.confidenceScore}% Acc</div>
                                        </div>
                                    </div>

                                    {/* Column 2 info */}
                                    <div className="space-y-2.5">
                                        <div>
                                            <div className="text-[9px] text-slate-505 text-slate-500 font-bold uppercase">Detected Entities</div>
                                            <div className="text-slate-350 mt-0.5 text-[10px] space-y-0.5 font-bold">
                                                {visionResult.detectedObjects.map((obj: string, i: number) => (
                                                    <div key={i}>· {obj}</div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[9px] text-slate-505 text-slate-500 font-bold uppercase">Recommended Risk Rating</div>
                                            <span className={`inline-block mt-1 font-sans text-[10px] font-black px-2 py-0.5 rounded-md ${visionResult.riskRating === 'CRITICAL'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                }`}>
                                                {visionResult.riskRating}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
