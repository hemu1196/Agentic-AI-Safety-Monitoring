import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, ShieldAlert, Check } from 'lucide-react';

interface MockGoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

const mockAccounts: MockGoogleAccount[] = [
  { name: 'A. Rehman', email: 'a.rehman@example.com', avatar: 'AR' },
  { name: 'Sarah Al-Mutawa', email: 'sarah.a@example.com', avatar: 'SA' },
  { name: 'John Smith', email: 'john.smith@example.com', avatar: 'JS' }
];

export const Login: React.FC = () => {
  const { loginWithGoogle, loginAsDemo } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleAccountSelect = (account: MockGoogleAccount) => {
    loginWithGoogle(account.email, account.name, 'ADMIN');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center items-center">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20 text-white flex items-center justify-center">
            <Shield className="w-12 h-12" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
          SITE SENTINEL
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mt-1">
          AGENTIC AI SAFETY
        </p>

        <h2 className="mt-8 text-2xl font-bold text-slate-800">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          Sign in to access your construction intelligence dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 sm:rounded-2xl sm:px-10">
          <div className="space-y-4">
            {/* Google Authentication Button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all shadow-sm active:scale-95 duration-150"
            >
              {/* Google Custom SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.83-4.53z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">Or</span>
              </div>
            </div>

            {/* Continue as Demo User Button */}
            <button
              onClick={loginAsDemo}
              className="w-full flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95 duration-150"
            >
              Continue as Demo User
            </button>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">
          Protected by Site Sentinel Agentic Shield.
        </p>
      </div>

      {/* Google-Style Account Selector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-col items-center">
              <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.83-4.53z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <h3 className="text-lg font-semibold text-slate-800">
                Choose an account
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                to continue to <span className="font-medium text-slate-700">Site Sentinel</span>
              </p>
            </div>

            {/* Account List */}
            <div className="py-2 divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {mockAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleAccountSelect(account)}
                  className="w-full px-6 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
                    {account.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {account.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {account.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
