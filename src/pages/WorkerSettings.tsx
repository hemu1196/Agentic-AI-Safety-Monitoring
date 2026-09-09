import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Settings, User, Bell, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

export const WorkerSettings: React.FC = () => {
    const { user } = useAuth();
    const [emailNotify, setEmailNotify] = useState(true);
    const [smsNotify, setSmsNotify] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const workerName = user?.name || 'Ramesh Kumar';
    const workerRole = user?.role || 'WORKER';
    const workerId = (user as any)?.workerId || 'WRK-1001';
    const assignedProject = (user as any)?.assignedProject || 'Skyline Tower';
    const assignedZone = (user as any)?.assignedZone || 'Zone B';

    const handlePasswordChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Error: All fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Error: New Password and Confirm Password do not match.");
            return;
        }

        // Trigger mock success
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
            setPasswordSuccess(false);
        }, 4000);
    };

    const handleSimulatePhotoUpload = () => {
        // Generate a quick mock placeholder avatar color or SVG
        setSelectedPhoto('bg-orange-650');
        alert("Profile photo simulation updated successfully!");
    };

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-500" />
                    <span>My Portal Settings</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                    Adjust your personal alert preferences, view identity keys, and maintain security credentials.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: General Profile Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-6">
                    <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
                        Identity Card
                    </h3>

                    <div className="text-center space-y-3">
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center font-black text-xl text-white shadow-md ${selectedPhoto || user?.avatarColor || 'bg-orange-500'
                            }`}>
                            {workerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{workerName}</h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{workerRole}</span>
                        </div>

                        <button
                            onClick={handleSimulatePhotoUpload}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[10px] font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition"
                        >
                            Upload Photo
                        </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-3 font-semibold text-xs text-slate-500">
                        <div className="flex justify-between">
                            <span className="text-slate-450 text-[10px] uppercase font-bold">Worker ID</span>
                            <span className="font-mono text-slate-800 dark:text-white">{workerId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-450 text-[10px] uppercase font-bold">Assigned Project</span>
                            <span className="text-slate-850 text-slate-800 dark:text-white">{assignedProject}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-450 text-[10px] uppercase font-bold">Zone Allocation</span>
                            <span className="text-slate-850 text-slate-800 dark:text-white">{assignedZone}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side Settings Forms split */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Preferences */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                            <Bell className="w-4 h-4 text-orange-500" />
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                Notification Rules
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {/* Check 1 */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Safety Bulletins</h4>
                                    <p className="text-[10px] text-slate-450 mt-0.5">Receive shift warnings and policy updates directly via registered email.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={emailNotify}
                                    onChange={e => setEmailNotify(e.target.checked)}
                                    className="w-4.5 h-4.5 text-orange-500 border-slate-300 rounded-sm focus:ring-orange-500 transition cursor-pointer"
                                />
                            </div>

                            {/* Check 2 */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">SMS Safety Broadcast Alerts</h4>
                                    <p className="text-[10px] text-slate-450 mt-0.5">Receive real-time text alerts for severe weather and zone exclusion orders.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={smsNotify}
                                    onChange={e => setSmsNotify(e.target.checked)}
                                    className="w-4.5 h-4.5 text-orange-500 border-slate-300 rounded-sm focus:ring-orange-500 transition cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Credentials change password */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                            <Lock className="w-4 h-4 text-orange-500" />
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                Change Identity Sign-in Password
                            </h3>
                        </div>

                        {passwordSuccess && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Sign-in password updated successfully! (Simulation only)</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Current pass input */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition"
                                    />
                                </div>

                                {/* New pass input */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition"
                                    />
                                </div>

                                {/* Confirm pass input */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-orange-500 transition"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 dark:bg-orange-500 dark:hover:bg-orange-655 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Update Credential</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default WorkerSettings;
