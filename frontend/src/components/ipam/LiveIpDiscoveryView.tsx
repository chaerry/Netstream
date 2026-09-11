import React, { useState } from 'react';
import { IpSubnet, IpScanResult } from '../../types/ipam';
import { ipamApi } from '../../api/ipamApi';
import { 
  Radar, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Server, 
  Cpu, 
  Plus, 
  Radio, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface Props {
  subnets: IpSubnet[];
  onImportDiscovered: (result: IpScanResult) => Promise<void>;
}

export const LiveIpDiscoveryView: React.FC<Props> = ({ subnets, onImportDiscovered }) => {
  const [selectedSubnetCidr, setSelectedSubnetCidr] = useState<string>(subnets[1]?.cidr || '10.240.10.0/24');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<IpScanResult[]>([]);
  const [importedIps, setImportedIps] = useState<Set<string>>(new Set());
  const [importingIp, setImportingIp] = useState<string | null>(null);

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanResults([]);
    try {
      const results = await ipamApi.scanSubnetLive(selectedSubnetCidr);
      setScanResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImport = async (result: IpScanResult) => {
    setImportingIp(result.ipAddress);
    try {
      await onImportDiscovered(result);
      setImportedIps(prev => new Set(prev).add(result.ipAddress));
    } catch (err) {
      console.error(err);
    } finally {
      setImportingIp(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radar className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Live Network IP Auto-Discovery Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Simulate ping sweeps, ARP caches, and SNMP polling across active subnets to detect uncataloged equipment
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <select
              value={selectedSubnetCidr}
              onChange={e => setSelectedSubnetCidr(e.target.value)}
              className="glass-input h-9 px-3 rounded-xl bg-slate-950 text-xs border-slate-700 text-slate-200 cursor-pointer max-w-[280px] sm:max-w-[320px] truncate"
            >
              {subnets.map(s => (
                <option key={s.id} value={s.cidr}>{s.cidr} — {s.name}</option>
              ))}
            </select>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all shrink-0 active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Scanning Subnet...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Discovery Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Status Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isScanning ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block font-mono">
                {isScanning ? `Probing target prefix ${selectedSubnetCidr}...` : `Scanner Ready: ${selectedSubnetCidr}`}
              </span>
              <span className="text-[11px] text-slate-400 block font-sans">
                ICMP Echo + ARP Broadcast + SNMP sysDescr.0 probe
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block">Hosts Discovered:</span>
            <span className="text-cyan-400 font-bold text-sm">{scanResults.length}</span>
          </div>
        </div>
      </div>

      {/* Discovery Results Table */}
      {scanResults.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-fade-in">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Discovery Probe Telemetry ({scanResults.length} Hosts Responded)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Discovered IP</th>
                  <th className="py-3 px-4">MAC Address & Vendor OUI</th>
                  <th className="py-3 px-4">Hostname / Reverse DNS</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Open Ports</th>
                  <th className="py-3 px-4">Reconciliation Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scanResults.map(res => {
                  const isImported = importedIps.has(res.ipAddress);
                  const isUnregistered = res.status === 'ACTIVE_UNREGISTERED';

                  return (
                    <tr key={res.ipAddress} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {res.ipAddress}
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <span className="text-slate-200 block font-mono">{res.macAddress || '—'}</span>
                          <span className="text-[10px] text-slate-500 font-sans block">{res.vendorOui}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-cyan-300 font-bold block">{res.hostname || 'Unknown'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-bold">{res.responseTimeMs} ms</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {res.portsDetected?.map(port => (
                            <span key={port} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                              {port}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isImported ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                          </span>
                        ) : isUnregistered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Unregistered In Live Network
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Registered Match
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isUnregistered && !isImported ? (
                          <button
                            onClick={() => handleImport(res)}
                            disabled={importingIp === res.ipAddress}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg border border-cyan-500/40 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                          >
                            {importingIp === res.ipAddress ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            <span>Import to IPAM</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
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
