import React, { useState, useEffect } from 'react';
import { LeasedLineCircuit, CircuitTopologyPath } from '../../types/leasedLine';
import { leasedLineApi } from '../../api/leasedLineApi';
import {
  GitBranch,
  Building,
  Server,
  Cable,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface LeasedLineResourceMapViewProps {
  circuits: LeasedLineCircuit[];
  selectedCircuit: LeasedLineCircuit | null;
  onSelectCircuit: (circuit: LeasedLineCircuit) => void;
}

export const LeasedLineResourceMapView: React.FC<LeasedLineResourceMapViewProps> = ({
  circuits,
  selectedCircuit,
  onSelectCircuit,
}) => {
  const activeCircuit = selectedCircuit || circuits[0];
  const [topology, setTopology] = useState<CircuitTopologyPath | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (activeCircuit) {
      setIsLoading(true);
      leasedLineApi
        .getCircuitTopology(activeCircuit.id)
        .then((data) => setTopology(data))
        .catch((err) => console.error('Failed to load topology:', err))
        .finally(() => setIsLoading(false));
    }
  }, [activeCircuit]);

  const getHopIcon = (type: string) => {
    switch (type) {
      case 'LOCATION':
        return <Building className="w-5 h-5 text-cyan-400" />;
      case 'DEVICE_PORT':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'FIBER_STRAND':
        return <Cable className="w-5 h-5 text-emerald-400" />;
      case 'VNE_OVERLAY':
        return <Cpu className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Circuit Selector Left Sidebar */}
      <div className="lg:col-span-4 bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            Select Leased Circuit
          </h3>
          <span className="text-xs text-slate-400">{circuits.length} Circuits</span>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {circuits.map((c) => {
            const isSelected = activeCircuit?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCircuit(c)}
                className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-900/20'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-purple-300">
                    {c.circuitId}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {c.technology}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium truncate mt-1">
                  {c.circuitName}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                  <span>{c.bandwidthDisplay}</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    ${c.mrc.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topology Path & Inventory Cross-Connect View */}
      <div className="lg:col-span-8 space-y-6">
        {activeCircuit ? (
          <>
            {/* Header Card */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
                      {activeCircuit.direction === 'INBOUND_RENTED' ? 'INBOUND (OFF-NET)' : 'OUTBOUND (ON-NET)'}
                    </span>
                    <h2 className="text-lg font-bold text-white font-mono">
                      {activeCircuit.circuitId}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{activeCircuit.circuitName}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    ${activeCircuit.mrc.toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal"> /mo USD</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    SLA: {activeCircuit.uptimeTargetPercent}% | Max MTTR: {activeCircuit.mttrTargetHours}h
                  </div>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500">Technology</span>
                  <div className="font-semibold text-slate-200 mt-0.5">{activeCircuit.technology}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500">Bandwidth</span>
                  <div className="font-semibold text-cyan-400 mt-0.5">{activeCircuit.bandwidthDisplay}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500">Live Latency</span>
                  <div className="font-semibold text-emerald-400 mt-0.5">
                    {activeCircuit.actualLatencyMs} ms (Benchmark)
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500">Carrier / Provider</span>
                  <div className="font-semibold text-purple-300 mt-0.5 truncate">
                    {activeCircuit.carrierName || activeCircuit.customerName || 'Netstream Retail'}
                  </div>
                </div>
              </div>
            </div>

            {/* End-to-End Hop Visualizer */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  End-to-End Resource Mapping & Circuit Path (A-End ➔ Z-End)
                </h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Resources Synchronized
                </span>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-slate-500 animate-pulse">
                  Loading circuit topology hops...
                </div>
              ) : topology && topology.hops.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
                  {topology.hops.map((hop) => (
                    <div key={hop.sequence} className="relative group">
                      {/* Node Bullet Icon */}
                      <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-purple-400 group-hover:scale-110 transition">
                        <span className="text-[10px] font-bold text-slate-300">
                          {hop.sequence}
                        </span>
                      </div>

                      {/* Hop Card */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 ml-3 flex items-start justify-between hover:border-slate-700 transition">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 mt-0.5">
                            {getHopIcon(hop.hopType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                {hop.hopType.replace('_', ' ')}
                              </span>
                              <h4 className="text-sm font-semibold text-slate-200 font-mono">
                                {hop.name}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{hop.details}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {hop.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  No topology hops mapped for this circuit.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-12 text-center text-slate-500">
            Select a circuit to view physical and logical resource mapping.
          </div>
        )}
      </div>
    </div>
  );
};
