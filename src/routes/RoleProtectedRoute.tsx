import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ('ADMIN' | 'WORKER')[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <span className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest mt-3 text-slate-400">Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role as any)) {
        if (user.role === 'WORKER') {
            return <Navigate to="/worker-dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};
