import React, { useState } from 'react';
import { telephonyApi } from '../../api/telephonyApi';
import { ImsDiscoveryResult } from '../../types/telephony';
import { 
  Radio, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Phone, 
  Cpu, 
  Plus 
} from 'lucide-react';

export const ImsDiscoveryView: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [results, setResults] = useState<ImsDiscoveryResult[]>([]);
  const [syncedIps, setSyncedIps] = useState<Set<string>>(new Set());

  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      const data = await telephonyApi.discoverImsNumbersLive();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSync = (res: ImsDiscoveryResult) => {
    setSyncedIps(prev => new Set(prev).add(res.phoneNumber));
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-400" />
              <span>Live Softswitch & IMS Core Number Auto-Discovery</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live SIP ENUM, Session Border Controller (SBC), and HSS subscriber registration discovery probe
            </p>
          </div>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all shrink-0 active:scale-95 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Interrogating IMS Nodes...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Poll Live Softswitch Core</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isScanning ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block font-mono">
                {isScanning ? 'Querying SBC-01, SBC-02 & HSS HLR Core Elements...' : 'Discovery Protocol: SIP REGISTER / OPTIONS Telemetry'}
              </span>
              <span className="text-[11px] text-slate-400 block font-sans">
                Correlates SIP Contact URIs with Central TNM Inventory
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block">Live Registrations:</span>
            <span className="text-rose-400 font-bold text-sm">{results.length}</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-fade-in">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Discovered IMS Session Registrations ({results.length} Active Lines)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Telephone Number</th>
                  <th className="py-3 px-4">SIP Contact URI</th>
                  <th className="py-3 px-4">IMS Core SBC Element</th>
                  <th className="py-3 px-4">Client User-Agent</th>
                  <th className="py-3 px-4">Source IP</th>
                  <th className="py-3 px-4">IMS State</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.map(res => {
                  const isSynced = syncedIps.has(res.phoneNumber);
                  const isRogue = res.registrationStatus === 'ROGUE_UNMAPPED';

                  return (
                    <tr key={res.phoneNumber} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {res.phoneNumber}
                      </td>

                      <td className="py-3.5 px-4 text-cyan-300">
                        {res.sipUri}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {res.imsNode}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {res.userAgent || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-amber-300 font-bold">
                        {res.ipAddress || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {isRogue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Rogue Line (Unmapped)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Registered Match
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isRogue && !isSynced ? (
                          <button
                            onClick={() => handleSync(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg border border-rose-500/40 text-xs font-semibold transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Catalog Number</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px] font-sans">Synchronized</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
