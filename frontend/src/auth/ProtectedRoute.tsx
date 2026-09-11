import React from 'react';
import { useAuth } from './AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { authenticated, isSandboxMode, hasAnyRole } = useAuth();

  if (!authenticated && !isSandboxMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-red-500/30">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-400 mb-6">
            You must be authenticated via Keycloak to access the Netstre@m Inventory system.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-amber-500/30">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Insufficient Privileges</h2>
          <p className="text-sm text-slate-400 mb-4">
            Your current role does not grant permission to view this section.
          </p>
          <p className="text-xs font-mono text-cyan-400">
            Required Roles: {requiredRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
