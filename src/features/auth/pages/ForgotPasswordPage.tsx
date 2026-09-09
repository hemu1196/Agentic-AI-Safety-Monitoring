import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Mail, ArrowLeft, Sparkles, User } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inputVal.trim()) {
      setErrorMsg('Email Address or Username is required.');
      return;
    }

    setLoading(true);
    try {
      const ok = await authService.forgotPassword(inputVal);
      if (ok) {
        setSuccess(true);
      } else {
        setErrorMsg('Something went wrong. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">

        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </Link>
        </div>

        {!success ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Forgot your password?</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
                Enter your username, email, or Worker ID and we'll send you instructions to reset your password.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSendLink}>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Username, Email, or Worker ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputVal}
                    disabled={loading}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Enter username, email, or Worker ID"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 duration-100 disabled:opacity-50 font-sans cursor-pointer"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Instructions Sent</h2>
              <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed max-w-xs mx-auto">
                Password reset instructions have been sent.
              </p>
            </div>

            <div className="pt-4 space-y-3 flex flex-col items-center">
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
              >
                Back to Login
              </Link>

              {/* Demo Helper Link */}
              <button
                onClick={() => navigate('/reset-password')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:underline tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Continue to Reset Password (Demo mode)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
