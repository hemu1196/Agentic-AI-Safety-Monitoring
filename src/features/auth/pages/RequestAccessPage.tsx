import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { CheckCircle, Shield, ArrowLeft } from 'lucide-react';

export const RequestAccessPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Construction Worker');
  const [project, setProject] = useState('Skyline Tower – Phase II');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !company.trim() || !reason.trim()) {
      setErrorMsg('Please fill in all the required fields (*).');
      return;
    }

    const requestData = {
      id: `req-${Date.now()}`,
      fullName,
      email,
      company,
      role,
      project,
      reason,
      submittedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    // Save in localStorage array
    const existing = localStorage.getItem('siteSentinelAccessRequests');
    const list = existing ? JSON.parse(existing) : [];
    list.push(requestData);
    localStorage.setItem('siteSentinelAccessRequests', JSON.stringify(list));

    setSubmitted(true);
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
            <span>Back to Sign In</span>
          </Link>
        </div>

        {!submitted ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">Request Platform Access</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
                Site Sentinel is restricted to authorized site credentials. Submit an access request below.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Work Email */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your corporate email"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Company */}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Role Title
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option>Construction Worker</option>
                    <option>Safety Officer</option>
                    <option>Project Manager</option>
                    <option>Supervisor</option>
                    <option>Engineer</option>
                  </select>
                </div>
              </div>

              {/* Project Scope */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Project Scope
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option>Skyline Tower – Phase II</option>
                  <option>Harbour Bridge Retrofit</option>
                  <option>Metro Line 4 – Depot</option>
                  <option>Riverside Logistics Park</option>
                </select>
              </div>

              {/* Reason for Access */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Reason for Access *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you need system credentials (e.g. daily safety auditing)"
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 duration-100"
              >
                Submit Access Request
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight font-sans">Request Submitted</h2>
              <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed max-w-xs mx-auto">
                Your access request has been submitted. An administrator will review your request and contact you via work email.
              </p>
            </div>
            <div className="pt-4">
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
