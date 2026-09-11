import React from 'react';
import { useAuth, UserRole } from '../../auth/AuthContext';
import { appConfig } from '../../config/appConfig';
import { useNetworkActivity } from '../../api/apiClient';
import { 
  ShieldCheck, 
  Database, 
  KeyRound, 
  LogOut, 
  Radio,
  Loader2,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarCollapsed = false
}) => {
  const { 
    authenticated, 
    username, 
    activeRole, 
    setActiveRole, 
    logout 
  } = useAuth();

  const { isLoading, activeCount } = useNetworkActivity();
  const apiHost = appConfig.api.baseUrl.replace(/^https?:\/\//, '');

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0a0e17]/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 relative overflow-hidden">
      {/* Top Ambient Activity Glow Line */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-purple-500 animate-pulse z-50 shadow-sm shadow-cyan-400" />
      )}

      {/* Left: Sidebar Toggle Button & System Telemetry */}
      <div className="flex items-center gap-3 md:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Navigation Sidebar"}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 hover:border-cyan-500/40 transition-all shadow-sm flex items-center justify-center"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono shadow-sm shadow-cyan-500/20 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>DB Query Active {activeCount > 1 ? `(${activeCount})` : ''}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Core Engine Online</span>
            <span className="sm:hidden">Online</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>API: {apiHost}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
          <KeyRound className="w-3.5 h-3.5 text-purple-400" />
          <span>Realm: {appConfig.keycloak.realm}</span>
        </div>
      </div>

      {/* Right: Role Sandbox Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Interactive Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <span className="text-[11px] font-semibold uppercase text-slate-500 pl-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            RBAC:
          </span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="bg-slate-800/90 text-xs font-semibold text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="inventory-admin">Admin (Full Control)</option>
            <option value="inventory-operator">Operator (Edit/Provision)</option>
            <option value="inventory-viewer">Viewer (Read-Only)</option>
          </select>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/20">
              {username ? username.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white tracking-wide">{username}</p>
              <p className="text-[10px] text-slate-400 font-mono">
                {authenticated ? 'Keycloak OIDC' : 'Interactive Sandbox'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout and return to Login Screen"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
