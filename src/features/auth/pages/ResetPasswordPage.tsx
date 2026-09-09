import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Eye, EyeOff, CheckCircle2, XCircle, Key } from 'lucide-react';
import { authService } from '../services/authService';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (pass: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) }
];

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  const [strengthPercentage, setStrengthPercentage] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Evaluate Password requirements & strength
  useEffect(() => {
    const passedCount = requirements.filter(req => req.test(password)).length;
    if (password.length === 0) {
      setStrength('Weak');
      setStrengthPercentage(0);
    } else if (passedCount <= 2) {
      setStrength('Weak');
      setStrengthPercentage(33);
    } else if (passedCount <= 4) {
      setStrength('Medium');
      setStrengthPercentage(66);
    } else {
      setStrength('Strong');
      setStrengthPercentage(100);
    }
  }, [password]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    const allPassed = requirements.every(req => req.test(password));
    if (!allPassed) {
      setErrorMsg('Password does not meet all the listed requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(password);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    if (strengthPercentage === 0) return 'bg-slate-200';
    if (strength === 'Weak') return 'bg-red-500';
    if (strength === 'Medium') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <AuthLayout>
      <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
        {!success ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Reset Password</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
                Create a new secure password for your Site Sentinel access account.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    disabled={loading}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    disabled={loading}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className={
                    strength === 'Weak' ? 'text-red-500' : strength === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }>{strength}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
                    style={{ width: `${strengthPercentage}%` }}
                  />
                </div>
              </div>

              {/* Live Requirements list */}
              <div className="py-2.5 space-y-2 border-t border-b border-slate-100 my-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live constraints check</p>
                {requirements.map((req) => {
                  const passed = req.test(password);
                  return (
                    <div key={req.id} className="flex items-center gap-2 text-xs font-semibold">
                      {passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-200 shrink-0" />
                      )}
                      <span className={passed ? 'text-slate-700' : 'text-slate-400'}>{req.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 duration-100 disabled:opacity-50"
              >
                Reset Password
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight font-sans">Password reset successfully.</h2>
              <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed max-w-xs mx-auto">
                Your credentials have been updated. You can now return to the sign in page.
              </p>
            </div>
            <div className="pt-4">
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
