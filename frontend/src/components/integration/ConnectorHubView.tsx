import React, { useState } from 'react';
import {
  Server,
  Activity,
  RefreshCw,
  Plus,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Search,
  SlidersHorizontal,
  Wifi,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Connector } from '../../types/integration';

interface ConnectorHubViewProps {
  connectors: Connector[];
  onTestConnector: (id: number) => Promise<void>;
  onTriggerDiscovery: (connectorId: number) => Promise<void>;
  onOpenCreateModal: () => void;
  isLoading: boolean;
}

export const ConnectorHubView: React.FC<ConnectorHubViewProps> = ({
  connectors,
  onTestConnector,
  onTriggerDiscovery,
  onOpenCreateModal,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [testingId, setTestingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const filtered = connectors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.endpointUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = vendorFilter === 'ALL' || c.vendor === vendorFilter;
    return matchesSearch && matchesVendor;
  });

  const handleTest = async (id: number) => {
    setTestingId(id);
    await onTestConnector(id);
    setTestingId(null);
  };

  const handleDiscovery = async (id: number) => {
    setSyncingId(id);
    await onTriggerDiscovery(id);
    setSyncingId(null);
  };

  const getVendorBadgeColor = (vendor: string) => {
    switch (vendor.toUpperCase()) {
      case 'HUAWEI':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'CISCO':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'NOKIA':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ZTE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Southbound Multi-Vendor EMS / NMS Connectors
          </h2>
          <p className="text-sm text-slate-400">
            Real-time mediation layer connecting live network management systems for continuous auto-discovery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Connector
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by connector name, endpoint, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Vendors</option>
            <option value="HUAWEI">Huawei</option>
            <option value="CISCO">Cisco</option>
            <option value="NOKIA">Nokia</option>
            <option value="ZTE">ZTE</option>
            <option value="GENERIC_SNMP">Generic SNMP</option>
          </select>
        </div>
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((conn) => (
          <div
            key={conn.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-lg flex flex-col justify-between group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${getVendorBadgeColor(conn.vendor)}`}>
                    {conn.vendor}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {conn.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      conn.status === 'ONLINE'
                        ? 'bg-emerald-400 animate-pulse'
                        : conn.status === 'DEGRADED'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-300 capitalize">{conn.status.toLowerCase()}</span>
                </div>
              </div>

              {/* Endpoint & Protocol */}
              <p className="text-xs text-slate-400 font-mono truncate mb-4 bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800/80">
                {conn.endpointUrl}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                  <span className="text-slate-400 block">Protocol</span>
                  <span className="font-semibold text-slate-200">{conn.protocol}</span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                  <span className="text-slate-400 block">Ping Latency</span>
                  <span className="font-semibold text-emerald-400">{conn.pingLatencyMs} ms</span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                  <span className="text-slate-400 block">Managed Elements</span>
                  <span className="font-semibold text-cyan-400">{conn.managedElementsCount} Nodes</span>
                </div>
                <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                  <span className="text-slate-400 block">Sync Interval</span>
                  <span className="font-semibold text-slate-200">Every {conn.syncIntervalMins}m</span>
                </div>
              </div>

              {/* Auto Reconcile Pill */}
              <div className="flex items-center justify-between text-xs text-slate-400 py-1 border-t border-slate-800/60 mb-4">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Auto-Reconcile:
                </span>
                <span className={`font-semibold ${conn.autoReconcileEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {conn.autoReconcileEnabled ? 'Active (Auto-Approve Minor)' : 'Manual Review'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleTest(conn.id)}
                disabled={testingId === conn.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                <Activity className={`w-3.5 h-3.5 ${testingId === conn.id ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                {testingId === conn.id ? 'Testing...' : 'Ping Test'}
              </button>
              <button
                onClick={() => handleDiscovery(conn.id)}
                disabled={syncingId === conn.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingId === conn.id ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                {syncingId === conn.id ? 'Scanning...' : 'Discovery Scan'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
