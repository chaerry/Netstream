import React, { useState } from 'react';
import { IpSubnet, VrfDomain } from '../../types/ipam';
import { 
  Network, 
  Search, 
  Plus, 
  Layers, 
  Trash2, 
  ArrowUpRight, 
  Tag, 
  Globe2, 
  Server,
  AlertTriangle,
  SlidersHorizontal
} from 'lucide-react';

interface Props {
  subnets: IpSubnet[];
  vrfs: VrfDomain[];
  onOpenCreate: () => void;
  onDeleteSubnet: (id: string) => Promise<void>;
  onSelectSubnetForAddressView?: (subnetId: string) => void;
}

export const SubnetsHierarchyView: React.FC<Props> = ({
  subnets,
  vrfs,
  onOpenCreate,
  onDeleteSubnet,
  onSelectSubnetForAddressView
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedVrf, setSelectedVrf] = useState<string>('ALL');
  const [selectedVersion, setSelectedVersion] = useState<string>('ALL');

  const filteredSubnets = subnets.filter(s => {
    const matchesSearch = 
      s.cidr.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.locationName && s.locationName.toLowerCase().includes(search.toLowerCase())) ||
      (s.vlanId && s.vlanId.toString().includes(search));

    const matchesVrf = selectedVrf === 'ALL' || s.vrfName === selectedVrf;
    const matchesVersion = selectedVersion === 'ALL' || s.ipVersion === selectedVersion;

    return matchesSearch && matchesVrf && matchesVersion;
  });

  const getUtilColor = (pct: number) => {
    if (pct >= 85) return 'from-rose-500 to-amber-500';
    if (pct >= 65) return 'from-amber-500 to-cyan-500';
    return 'from-cyan-500 to-blue-500';
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* VRF Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-500">VRF:</span>
            <select
              value={selectedVrf}
              onChange={e => setSelectedVrf(e.target.value)}
              className="glass-input h-8 px-2.5 rounded-xl bg-slate-950 text-xs border-slate-700 text-slate-200 cursor-pointer"
            >
              <option value="ALL">All VRF Domains</option>
              {vrfs.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Protocol Filter */}
          <div className="flex items-center gap-1">
            {['ALL', 'IPv4', 'IPv6'].map(v => (
              <button
                key={v}
                onClick={() => setSelectedVersion(v)}
                className={`px-3 py-1 rounded-xl text-xs font-mono border transition-all ${
                  selectedVersion === v
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Add */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter CIDR, VLAN, name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input w-full h-8 pl-9 pr-3 text-xs rounded-xl text-slate-200"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subnet</span>
          </button>
        </div>
      </div>

      {/* Subnet Cards Grid */}
      {filteredSubnets.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-slate-800 space-y-2">
          <Network className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-bold text-slate-300">No Subnets Matching Criteria</p>
          <p className="text-xs">Adjust filters or register a new CIDR subnet block.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubnets.map(subnet => {
            const isHighUtil = subnet.utilizationPct >= 85;
            return (
              <div
                key={subnet.id}
                className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Bar */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:border-amber-400 transition-colors">
                        <Network className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-white text-sm block">
                          {subnet.cidr}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {subnet.ipVersion}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {subnet.vrfName}
                          </span>
                          {subnet.vlanId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              VLAN {subnet.vlanId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteSubnet(subnet.id)}
                      className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Subnet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mt-1">
                    {subnet.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 font-sans">
                    {subnet.description || 'No operational description provided.'}
                  </p>
                </div>

                {/* Metrics & Utilization Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      Allocated: <strong className="text-white">{subnet.allocatedCount.toLocaleString()}</strong> / {subnet.usableIps.toLocaleString()}
                    </span>
                    <span className={`font-bold ${isHighUtil ? 'text-rose-400 flex items-center gap-1' : 'text-slate-300'}`}>
                      {isHighUtil && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      {subnet.utilizationPct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getUtilColor(subnet.utilizationPct)} rounded-full transition-all`}
                      style={{ width: `${Math.min(100, Math.max(subnet.utilizationPct, 3))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>GW: {subnet.gatewayIp || 'N/A'}</span>
                    <span className="truncate max-w-[140px]">{subnet.locationName || 'Backbone'}</span>
                  </div>

                  {onSelectSubnetForAddressView && (
                    <button
                      onClick={() => onSelectSubnetForAddressView(subnet.id)}
                      className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Inspect Addresses</span>
                      <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
