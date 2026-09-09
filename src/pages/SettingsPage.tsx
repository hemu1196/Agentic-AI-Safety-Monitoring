import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../features/auth/services/authService';
import { UserRole, UserRecord } from '../features/auth/types/auth.types';
import { Plus, Eye, Settings, ShieldAlert, Key, Edit, Trash2, X, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  // Tab States
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'users' | 'security' | 'preferences'>('general');

  // User Management State
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Form Fields for Add User
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('WORKER');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [newWorkerId, setNewWorkerId] = useState('');
  const [newAssignedProject, setNewAssignedProject] = useState('');
  const [newAssignedZone, setNewAssignedZone] = useState('');

  // Form Fields for Password Reset
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetConfirmPasswordVal, setResetConfirmPasswordVal] = useState('');

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = () => {
    const records = authService.getUsers();
    setUsersList(records);
  };

  useEffect(() => {
    loadUsers();
    // Default non-admin to general tab
    if (user?.role !== 'ADMIN') {
      setActiveSubTab('general');
    }
  }, [user]);

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newUsername.trim() || !newPassword.trim()) {
      triggerToast('Please fill in all required fields.', 'error');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      triggerToast('Passwords do not match.', 'error');
      return;
    }

    // Check duplicate username or email
    const duplicate = usersList.find(
      u => u.username.toLowerCase() === newUsername.toLowerCase() || u.email.toLowerCase() === newEmail.toLowerCase()
    );
    if (duplicate) {
      triggerToast('Username or Email already registered.', 'error');
      return;
    }

    const newUserRecord: UserRecord = {
      id: `USR-${Date.now()}`,
      name: newName,
      username: newUsername,
      email: newEmail,
      password: newPassword,
      role: newRole,
      status: newStatus,
      lastLogin: '--',
      workerId: newRole === 'WORKER' ? newWorkerId || `WRK-${Math.floor(1000 + Math.random() * 9000)}` : '',
      assignedProject: newRole === 'WORKER' ? newAssignedProject : undefined,
      assignedZone: newRole === 'WORKER' ? newAssignedZone : undefined
    };

    const updated = [...usersList, newUserRecord];
    authService.saveUsers(updated);
    setUsersList(updated);
    setAddUserModalOpen(false);

    // Reset Form Fields
    setNewName('');
    setNewEmail('');
    setNewUsername('');
    setNewPassword('');
    setNewConfirmPassword('');
    setNewRole('WORKER');
    setNewWorkerId('');
    setNewAssignedProject('');
    setNewAssignedZone('');

    triggerToast('User added successfully.');
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updated = usersList.map(u => u.id === selectedUser.id ? selectedUser : u);
    authService.saveUsers(updated);
    setUsersList(updated);
    setEditUserModalOpen(false);
    triggerToast('User details updated successfully.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!resetPasswordVal || resetPasswordVal !== resetConfirmPasswordVal) {
      triggerToast('Passwords do not match or are empty.', 'error');
      return;
    }

    const updated = usersList.map(u => u.id === selectedUser.id ? { ...u, password: resetPasswordVal } : u);
    authService.saveUsers(updated);
    setUsersList(updated);
    setResetPassModalOpen(false);
    setResetPasswordVal('');
    setResetConfirmPasswordVal('');
    triggerToast('User password reset successfully.');
  };

  const handleToggleStatus = (target: UserRecord) => {
    const nextStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = usersList.map(u => u.id === target.id ? { ...u, status: nextStatus as any } : u);
    authService.saveUsers(updated);
    setUsersList(updated);
    triggerToast(`User status set to ${nextStatus}.`);
  };

  const handleRemoveUser = (id: string) => {
    const updated = usersList.filter(u => u.id !== id);
    authService.saveUsers(updated);
    setUsersList(updated);
    triggerToast('User removed successfully.');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold ${toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">System Settings</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Configure general system preferences, security rules, and user role privileges.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeSubTab === 'general' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500'
            }`}
        >
          General Settings
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeSubTab === 'users' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500'
              }`}
          >
            User Management
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeSubTab === 'security' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500'
            }`}
        >
          Security
        </button>

        <button
          onClick={() => setActiveSubTab('preferences')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeSubTab === 'preferences' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500'
            }`}
        >
          System Preferences
        </button>
      </div>

      {/* ==========================================
          TAB A: GENERAL SETTINGS
          ========================================== */}
      {activeSubTab === 'general' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 max-w-lg">
          <h2 className="text-md font-bold text-slate-800 dark:text-white">Workspace Configuration</h2>
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Company Name</label>
              <input type="text" defaultValue="Infosys Construction Systems" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Safety Officer In-Charge Email</label>
              <input type="email" defaultValue="safety@sitesentinel.com" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Default Platform Timezone</label>
              <select className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                <option>UTC +05:30 (India Standard Time)</option>
                <option>UTC +00:00 (Greenwich Mean Time)</option>
                <option>UTC -05:00 (Eastern Standard Time)</option>
              </select>
            </div>
          </div>
          <button onClick={() => triggerToast('General settings saved successfully.')} className="px-4 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs">
            Save Changes
          </button>
        </div>
      )}

      {/* ==========================================
          TAB B: USER MANAGEMENT (ADMIN ONLY)
          ========================================== */}
      {activeSubTab === 'users' && user?.role === 'ADMIN' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-white">User Management</h2>
              <p className="text-xs text-slate-400">Manage all SITE SENTINEL users and their access.</p>
            </div>
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white">{u.name}</td>
                    <td className="py-2.5 px-4 font-mono">{u.email}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{u.username}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono">{u.lastLogin}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => { setSelectedUser(u); setViewUserModalOpen(true); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded" title="View Account Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedUser(u); setEditUserModalOpen(true); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded" title="Edit Profile Details"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedUser(u); setResetPassModalOpen(true); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded" title="Reset Password"><Key className="w-4 h-4" /></button>

                        {/* Toggle status */}
                        <button onClick={() => handleToggleStatus(u)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded" title="Toggle Active Status">
                          {u.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                        </button>

                        {/* Prevent removing oneself */}
                        {u.username !== user.username && (
                          <button onClick={() => handleRemoveUser(u.id)} className="p-1 hover:bg-red-50 text-red-500 rounded" title="Remove User"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB C: SECURITY SETTINGS
          ========================================== */}
      {activeSubTab === 'security' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 max-w-lg">
          <h2 className="text-md font-bold text-slate-800 dark:text-white">Security & Password</h2>
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/20" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/20" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/20" />
            </div>
          </div>
          <button onClick={() => triggerToast('Password credentials updated successfully.')} className="px-4 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs">
            Change Password
          </button>
        </div>
      )}

      {/* ==========================================
          TAB D: SYSTEM PREFERENCES
          ========================================== */}
      {activeSubTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5 max-w-lg">
          <h2 className="text-md font-bold text-slate-800 dark:text-white">Display Preferences</h2>
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-slate-700 dark:text-slate-200">System Theme mode</span>
                <span className="block text-[10px] text-slate-400">Toggles dark interface coordinates</span>
              </div>
              <button onClick={() => triggerToast('Theme preference updated.')} className="px-3 py-1.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl">
                Default Light
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="block text-slate-700 dark:text-slate-200">Sound Warnings notifications</span>
                <span className="block text-[10px] text-slate-400">Emits voice alerts on critical scanner denials</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS & FORM DIALOGS
          ========================================== */}

      {/* 1. Add User Modal */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Add New User</h2>
              <button onClick={() => setAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Full Name *</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Email *</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Username *</label>
                <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="username" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Password *</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Confirm Password *</label>
                  <input type="password" required value={newConfirmPassword} onChange={(e) => setNewConfirmPassword(e.target.value)} placeholder="Confirm" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">System Role *</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                    <option value="WORKER">WORKER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Status *</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {newRole === 'WORKER' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Worker ID (Optional)</label>
                      <input type="text" value={newWorkerId} onChange={(e) => setNewWorkerId(e.target.value)} placeholder="Auto-generated if blank" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Assigned Project</label>
                      <input type="text" value={newAssignedProject} onChange={(e) => setNewAssignedProject(e.target.value)} placeholder="Project Name" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Assigned Zone</label>
                    <input type="text" value={newAssignedZone} onChange={(e) => setNewAssignedZone(e.target.value)} placeholder="E.g. Zone B (Floor 3)" className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setAddUserModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Modal */}
      {editUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Edit User Profile</h2>
              <button onClick={() => setEditUserModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Full Name</label>
                <input type="text" required value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Email</label>
                <input type="email" required value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">System Role</label>
                <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })} className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <option value="WORKER">WORKER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setEditUserModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reset Password Modal */}
      {resetPassModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Reset Password for {selectedUser.name}</h2>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">New Password</label>
                <input type="password" required value={resetPasswordVal} onChange={(e) => setResetPasswordVal(e.target.value)} className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Confirm Password</label>
                <input type="password" required value={resetConfirmPasswordVal} onChange={(e) => setResetConfirmPasswordVal(e.target.value)} className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setResetPassModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. View User Modal */}
      {viewUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">User Account Card</h2>
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <p><span className="text-slate-400 uppercase text-[9px] block">Name</span><strong>{selectedUser.name}</strong></p>
              <p><span className="text-slate-400 uppercase text-[9px] block">Email</span><strong className="font-mono">{selectedUser.email}</strong></p>
              <p><span className="text-slate-400 uppercase text-[9px] block">Username</span><strong className="font-mono">{selectedUser.username}</strong></p>
              <p><span className="text-slate-400 uppercase text-[9px] block">Role Privilege</span><strong>{selectedUser.role}</strong></p>
              {selectedUser.workerId && <p><span className="text-slate-400 uppercase text-[9px] block">Worker ID Badge</span><strong className="font-mono">{selectedUser.workerId}</strong></p>}
              {selectedUser.assignedProject && <p><span className="text-slate-400 uppercase text-[9px] block">Assigned Project</span><strong>{selectedUser.assignedProject}</strong></p>}
              {selectedUser.assignedZone && <p><span className="text-slate-400 uppercase text-[9px] block">Assigned Zone</span><strong>{selectedUser.assignedZone}</strong></p>}
              <p><span className="text-slate-400 uppercase text-[9px] block">Status</span><strong>{selectedUser.status}</strong></p>
              <p><span className="text-slate-400 uppercase text-[9px] block">Last Logged In</span><strong className="font-mono">{selectedUser.lastLogin}</strong></p>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setViewUserModalOpen(false)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
