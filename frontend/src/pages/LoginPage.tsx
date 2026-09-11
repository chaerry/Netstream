import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { SnailLogo } from '../components/common/SnailLogo';
import { appConfig } from '../config/appConfig';
import { KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, enterOfflineDemo } = useAuth();
  const [username, setUsername] = useState<string>('boss-admin');
  const [password, setPassword] = useState<string>('itsm123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showQuickSelect, setShowQuickSelect] = useState<boolean>(false);

  const handleKeycloakAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    try {
      await loginWithCredentials(username.trim(), password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuickUser = (user: string) => {
    setUsername(user);
    setShowQuickSelect(false);
  };

  const handleEnterDemo = () => {
    enterOfflineDemo(username || 'boss-admin');
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden bg-cyber-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#0f172a]/90 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80">
        {/* Mascot Logo */}
        <div className="flex justify-center mb-4">
          <SnailLogo size={90} className="transform hover:scale-105 transition-transform duration-200" />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-7">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Netstream Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide mt-1.5">
            Telco Asset Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleKeycloakAuth} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Keycloak Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. che or task-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setShowQuickSelect(true)}
                className="w-full pl-4 pr-11 py-3 bg-[#162032] border border-blue-500/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-[0_0_15px_-2px_rgba(59,130,246,0.35)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowQuickSelect(!showQuickSelect)}
                className="absolute right-3 top-3 p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                title="Quick select Keycloak credentials"
              >
                <div className="flex items-center gap-0.5 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 text-[10px] text-slate-300">
                  <KeyRound className="w-3 h-3 text-cyan-400" />
                  <span>▾</span>
                </div>
              </button>

              {/* Quick Select Autocomplete Popup */}
              {showQuickSelect && (
                <div className="absolute left-0 right-0 top-12 z-20 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 space-y-1">
                  <div
                    onClick={() => handleSelectQuickUser('boss-admin')}
                    className="flex items-center gap-2 p-2 rounded-lg bg-blue-600/90 text-white text-xs font-medium cursor-pointer hover:bg-blue-500 transition-all"
                  >
                    <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-amber-400 text-xs font-bold">
                      🔑
                    </div>
                    <div>
                      <p className="font-bold">boss-admin</p>
                      <p className="text-[10px] text-blue-200">gaharu.aitiserve.co.id:8483</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleSelectQuickUser('che')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-cyan-400 text-xs">
                      👤
                    </div>
                    <div>
                      <p className="font-bold">che</p>
                      <p className="text-[10px] text-slate-400">aitiserve realm developer</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleSelectQuickUser('task-user')}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-purple-400 text-xs">
                      ⚙️
                    </div>
                    <div>
                      <p className="font-bold">task-user</p>
                      <p className="text-[10px] text-slate-400">ITSM operator access</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Keycloak password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-[#162032] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Keycloak...</span>
                </>
              ) : (
                <span>Authenticate via Keycloak</span>
              )}
            </button>
          </div>
        </form>

        {/* Separator / Divider */}
        <div className="my-6 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Or run in sandboxed local environment:
          </p>
        </div>

        {/* Offline Interactive Demo Button */}
        <div>
          <button
            type="button"
            onClick={handleEnterDemo}
            className="w-full py-3 px-4 rounded-xl bg-[#1e293b]/90 hover:bg-[#334155] border border-slate-700/70 text-slate-200 font-medium text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2 hover:border-slate-600 active:scale-[0.99]"
          >
            <span>Enter Interactive Demo (Offline)</span>
          </button>
        </div>

        {/* Footer Info referencing dynamic appConfig */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Realm: <b>{appConfig.keycloak.realm}</b> • Client: <b>{appConfig.keycloak.clientId}</b></span>
        </div>
      </div>
    </div>
  );
};
