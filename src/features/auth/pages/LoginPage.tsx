import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { Eye, EyeOff, Shield, RefreshCw } from 'lucide-react';

interface MockGoogleAccount {
  name: string;
  email: string;
  avatar: string;
  roleLabel: string;
}

const mockGoogleAccounts: MockGoogleAccount[] = [
  { name: 'Admin User', email: 'admin@sitesentinel.com', avatar: 'AD', roleLabel: 'ADMIN' },
  { name: 'Ramesh Kumar', email: 'ramesh@example.com', avatar: 'RK', roleLabel: 'WORKER' },
  { name: 'Arjun Singh', email: 'arjun@example.com', avatar: 'AS', roleLabel: 'WORKER' }
];

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'WORKER'>('ADMIN');

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Floating toast notification trigger
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const loggedOut = localStorage.getItem('site_sentinel_logged_out');
    if (loggedOut === 'true') {
      triggerToast('You have been logged out successfully.');
      localStorage.removeItem('site_sentinel_logged_out');
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation checks
    if (!usernameOrEmail.trim()) {
      setErrorMsg(activeTab === 'ADMIN' ? 'Username is required.' : 'Worker ID or Username is required.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(usernameOrEmail, password, rememberMe, activeTab);
      triggerToast(`Welcome back, ${loggedUser.name}!`);

      if (loggedUser.role === 'WORKER') {
        setTimeout(() => navigate('/worker-dashboard'), 800);
      } else {
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = async (account: MockGoogleAccount) => {
    setShowGoogleModal(false);
    setGoogleLoading(true);
    try {
      const loggedUser = await loginWithGoogle(account.email, account.name, activeTab);
      triggerToast('Successfully signed in with Google.');
      if (loggedUser.role === 'WORKER') {
        setTimeout(() => navigate('/worker-dashboard'), 800);
      } else {
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during Google sign-in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const fieldLabel = activeTab === 'ADMIN' ? 'Username' : 'Worker ID or Username';
  const fieldPlaceholder = activeTab === 'ADMIN' ? 'Enter your username' : 'Enter your Worker ID or username';
  const headingTitle = activeTab === 'ADMIN' ? 'Admin Login' : 'Worker Login';
  const headingSubtitle = activeTab === 'ADMIN' ? 'Sign in to manage the SITE SENTINEL platform.' : 'Sign in to access your SITE SENTINEL worker portal.';
  const submitButtonText = activeTab === 'ADMIN' ? 'Sign In as Admin' : 'Sign In as Worker';

  return (
    <AuthLayout>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg border border-slate-700/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">

        {/* Segmented Tab Design */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setUsernameOrEmail('');
              setPassword('');
              setErrorMsg('');
              setShowPassword(false);
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'ADMIN'
              ? 'bg-white text-slate-800 shadow-xs border border-transparent'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            ADMIN LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('WORKER');
              setUsernameOrEmail('');
              setPassword('');
              setErrorMsg('');
              setShowPassword(false);
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'WORKER'
              ? 'bg-white text-slate-800 shadow-xs border border-transparent'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            WORKER LOGIN
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{headingTitle}</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
            {headingSubtitle}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
          {/* Dynamic Field */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              {fieldLabel}
            </label>
            <input
              type="text"
              value={usernameOrEmail}
              disabled={loading || googleLoading}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder={fieldPlaceholder}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-orange-500 hover:text-orange-600"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={loading || googleLoading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
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

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 rounded"
            />
            <label htmlFor="remember_me" className="ml-2 block text-xs font-semibold text-slate-500 select-none">
              Remember me
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 duration-100 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>{submitButtonText}</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Section */}
        {activeTab === 'ADMIN' ? (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Demo Admin Credentials</span>
              <button
                type="button"
                onClick={() => {
                  setUsernameOrEmail('admin');
                  setPassword('Admin@123');
                }}
                className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Use Demo Credentials
              </button>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 flex gap-4">
              <span>Username: <strong className="text-slate-600">admin</strong></span>
              <span>Password: <strong className="text-slate-600">Admin@123</strong></span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Demo Worker Credentials</span>
              <button
                type="button"
                onClick={() => {
                  setUsernameOrEmail('ramesh');
                  setPassword('Worker@123');
                }}
                className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Use Demo Credentials
              </button>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
              <span>Worker ID: <strong className="text-slate-600">WRK-1001</strong></span>
              <span>Username: <strong className="text-slate-600">ramesh</strong></span>
              <span>Password: <strong className="text-slate-600">Worker@123</strong></span>
            </div>
          </div>
        )}

        {/* Google Authentication */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-2.5 text-slate-400 font-bold">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => setShowGoogleModal(true)}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm active:scale-95 duration-100 disabled:opacity-50"
        >
          {googleLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
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
            </>
          )}
        </button>

        {/* System Administration Notice */}
        <div className="mt-8 text-center text-xs font-semibold text-slate-400 max-w-xs mx-auto leading-relaxed border-t border-slate-100 pt-5 select-none">
          Contact your system administrator if you need help accessing your account.
        </div>
      </div>

      {/* Google-Style Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all animate-fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-col items-center select-none">
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
              <h3 className="text-sm font-bold text-slate-800">Choose an account</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                to continue to <span className="font-semibold text-slate-700">SITE SENTINEL</span>
              </p>
            </div>

            {/* Scrollable list containing ALL accounts */}
            <div className="py-2 divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {mockGoogleAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleGoogleSelect(account)}
                  className="w-full px-6 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200 shrink-0 select-none">
                    {account.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{account.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{account.email}</p>
                  </div>
                  {/* Disabled role badges in selection list as per spec */}
                </button>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
