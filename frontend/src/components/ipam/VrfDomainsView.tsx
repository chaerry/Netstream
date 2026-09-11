import React, { useState, useMemo } from 'react';
import { VrfDomain, IpSubnet, IpAddress, CreateVrfRequest } from '../../types/ipam';
import { 
  Layers, 
  Search, 
  Plus, 
  Shield, 
  Network, 
  Boxes, 
  ArrowUpRight, 
  Trash2, 
  Activity, 
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Hash,
  Globe2,
  Server,
  Share2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useDialog } from '../common/DialogContext';

interface Props {
  vrfs: VrfDomain[];
  subnets: IpSubnet[];
  addresses: IpAddress[];
  onCreateVrf: (req: CreateVrfRequest) => Promise<VrfDomain>;
  onDeleteVrf: (id: string) => Promise<void>;
  onSelectVrfForSubnets?: (vrfName: string) => void;
  onSelectVrfForAddresses?: (vrfName: string) => void;
}

export const VrfDomainsView: React.FC<Props> = ({
  vrfs,
  subnets,
  addresses,
  onCreateVrf,
  onDeleteVrf,
  onSelectVrfForSubnets,
  onSelectVrfForAddresses
}) => {
  const [search, setSearch] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'matrix' | 'compact' | 'ledger'>('cards');

  // Form State
  const [name, setName] = useState<string>('');
  const [rd, setRd] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [routeTargetExport, setRouteTargetExport] = useState<string>('');
  const [routeTargetImport, setRouteTargetImport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { confirmDelete } = useDialog();

  // Metrics aggregation
  const vrfStats = useMemo(() => {
    return vrfs.map(v => {
      const boundSubnets = subnets.filter(s => s.vrfName === v.name);
      const totalCapacity = boundSubnets.reduce((acc, s) => acc + s.usableIps, 0);
      const allocatedHosts = boundSubnets.reduce((acc, s) => acc + s.allocatedCount, 0);
      const boundAddresses = addresses.filter(a => a.vrfName === v.name);
      const utilPct = totalCapacity > 0 ? Number(((allocatedHosts / totalCapacity) * 100).toFixed(1)) : 0;

      return {
        ...v,
        boundSubnets,
        totalCapacity,
        allocatedHosts,
        boundAddressesCount: boundAddresses.length,
        utilPct,
      };
    });
  }, [vrfs, subnets, addresses]);

  const filteredVrfs = vrfStats.filter(v => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.rd.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      (v.routeTargetExport && v.routeTargetExport.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rd.trim()) {
      setError('VRF Identifier Name and Route Distinguisher (RD) are required.');
      return;
    }

    const normalizedName = name.trim().toUpperCase().replace(/\s+/g, '_');
    if (vrfs.some(v => v.name.toUpperCase() === normalizedName)) {
      setError(`VRF Domain '${normalizedName}' already exists.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onCreateVrf({
        name: normalizedName,
        rd: rd.trim(),
        description: description.trim() || `Enterprise L3VPN Routing Domain for ${normalizedName}`,
        routeTargetExport: routeTargetExport.trim() || rd.trim(),
        routeTargetImport: routeTargetImport.trim() || rd.trim(),
      });
      setSuccess(`VRF Domain '${normalizedName}' registered.`);
      setName('');
      setRd('');
      setDescription('');
      setRouteTargetExport('');
      setRouteTargetImport('');
      setIsCreateOpen(false);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to register VRF domain.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (v: typeof vrfStats[0]) => {
    if (v.name === 'DEFAULT') return;

    const confirmed = await confirmDelete({
      title: 'Decommission VRF Routing Domain',
      subtitle: 'Multi-Tenant Virtual Routing Table Retirement',
      protocolCode: 'BGP_MPLS // PURGE_VRF_DOMAIN',
      itemBadge: 'VRF',
      itemCode: v.name,
      itemName: `Route Distinguisher: ${v.rd}`,
      impactMessage: v.boundSubnets.length > 0
        ? `CRITICAL: This domain contains ${v.boundSubnets.length} active subnet block(s) and ${v.boundAddressesCount} host address(es). Decommissioning this VRF will disrupt BGP route exchange.`
        : 'Permanently removes this VRF instance and associated route distinguishers from the routing configuration.',
      confirmText: 'Confirm Decommission',
    });

    if (confirmed) {
      await onDeleteVrf(v.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Metrics */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              RFC 4364 / BGP MPLS IP VPN
            </span>
            <span className="text-xs text-slate-500 font-mono">Routing Table Partitions</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Virtual Routing & Forwarding (VRF) Domains</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Multi-tenant Layer-3 routing domain isolation with dedicated Route Distinguishers (RD) and Route Targets (RT Export/Import).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateOpen(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreateOpen ? 'Close Form' : 'New VRF Domain'}</span>
          </button>
        </div>
      </div>

      {/* Creation Slide-Down Drawer */}
      {isCreateOpen && (
        <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-[#090d16]/95 relative overflow-hidden shadow-2xl animate-fade-in">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono">Register New Multi-Tenant VRF Domain</h3>
            </div>
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">VRF Identifier Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                placeholder="e.g. VRF_FINANCIAL_SECURE"
                className="glass-input w-full h-9 px-3 rounded-xl font-mono text-white text-xs uppercase"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">Instance routing table name</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Route Distinguisher (RD) *</label>
              <input
                type="text"
                value={rd}
                onChange={e => setRd(e.target.value)}
                placeholder="e.g. 65000:500 or 10.240.0.1:100"
                className="glass-input w-full h-9 px-3 rounded-xl font-mono text-cyan-300 text-xs"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">RFC 4364 format (ASN:NN or IP:NN)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">RT Export</label>
                <input
                  type="text"
                  value={routeTargetExport}
                  onChange={e => setRouteTargetExport(e.target.value)}
                  placeholder="Inherit RD"
                  className="glass-input w-full h-9 px-2.5 rounded-xl font-mono text-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">RT Import</label>
                <input
                  type="text"
                  value={routeTargetImport}
                  onChange={e => setRouteTargetImport(e.target.value)}
                  placeholder="Inherit RD"
                  className="glass-input w-full h-9 px-2.5 rounded-xl font-mono text-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Operational Description / Service Purpose</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Dedicated MPLS L3VPN interconnect for Banking customer peerings and FIX protocols"
                className="glass-input w-full h-9 px-3 rounded-xl text-slate-200 text-xs"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Registering...' : 'Register VRF Domain'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications */}
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and View Controls */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search VRF by name, Route Distinguisher (65000:X), description..."
              className="glass-input w-full pl-9 h-9 rounded-xl text-xs text-white"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Showing <strong className="text-cyan-300">{filteredVrfs.length}</strong> of {vrfs.length} Domains
          </span>
        </div>

        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'cards' 
                ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="3D Cyber Cards Grid"
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'matrix' 
                ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Standard Telecom Matrix Table"
          >
            Matrix Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('compact')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'compact' 
                ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="High-Density Compact NOC Table"
          >
            Compact NOC
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ledger')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'ledger' 
                ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Cyber Strip Ledger Rows"
          >
            Cyber Ledger
          </button>
        </div>
      </div>

      {/* VRF List Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVrfs.map(v => {
            const isDefault = v.name === 'DEFAULT';

            return (
              <div 
                key={v.id}
                className={`glass-panel p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isDefault 
                    ? 'border-blue-500/40 bg-gradient-to-br from-blue-950/20 to-slate-900/40 shadow-blue-500/5' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white font-mono tracking-tight">{v.name}</h3>
                        <span className="text-[10px] font-mono text-cyan-300 font-bold block">
                          RD: {v.rd}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isDefault ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          GLOBAL DEFAULT
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Decommission VRF Domain"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 font-sans line-clamp-2">
                    {v.description}
                  </p>

                  {/* Route Target Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 text-[10px] block">RT Export</span>
                      <strong className="text-slate-300 text-xs">{v.routeTargetExport || v.rd}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">RT Import</span>
                      <strong className="text-slate-300 text-xs">{v.routeTargetImport || v.rd}</strong>
                    </div>
                  </div>

                  {/* Associated Subnets Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Network className="w-3 h-3 text-cyan-400" />
                        Allocated Subnets: <strong className="text-white">{v.boundSubnets.length}</strong>
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Boxes className="w-3 h-3 text-amber-400" />
                        Hosts: <strong className="text-cyan-300">{v.allocatedHosts}</strong>
                      </span>
                    </div>

                    {v.boundSubnets.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {v.boundSubnets.slice(0, 3).map(s => (
                          <span 
                            key={s.id}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {s.cidr}
                          </span>
                        ))}
                        {v.boundSubnets.length > 3 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-500">
                            +{v.boundSubnets.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic block mt-1 font-mono">
                        No subnets allocated in this VRF domain yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Drilldown Navigation Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  {onSelectVrfForSubnets && (
                    <button
                      onClick={() => onSelectVrfForSubnets(v.name)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Subnets</span>
                      <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  )}
                  {onSelectVrfForAddresses && (
                    <button
                      onClick={() => onSelectVrfForAddresses(v.name)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Addresses</span>
                      <ArrowUpRight className="w-3 h-3 text-amber-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STYLE 1: Telecom Matrix Table (Standard Detailed) */}
      {viewMode === 'matrix' && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase">VRF Identifier</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Route Distinguisher (RD)</th>
                  <th className="px-4 py-3.5 font-bold uppercase">RT Export / Import</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Bound Subnets</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Allocated IPs</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Operational Description</th>
                  <th className="px-5 py-3.5 font-bold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVrfs.map(v => {
                  const isDefault = v.name === 'DEFAULT';

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Shield className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-white text-xs">{v.name}</span>
                          {isDefault && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-cyan-300">{v.rd}</td>
                      <td className="px-4 py-3 text-slate-300 text-[11px]">
                        {v.routeTargetExport || v.rd} / {v.routeTargetImport || v.rd}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                          {v.boundSubnets.length} CIDRs
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">
                        {v.allocatedHosts} Hosts
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-sans text-xs max-w-xs truncate">
                        {v.description}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onSelectVrfForSubnets && (
                            <button
                              onClick={() => onSelectVrfForSubnets(v.name)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] inline-flex items-center gap-1"
                            >
                              <span>Subnets</span>
                              <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                            </button>
                          )}
                          {!isDefault && (
                            <button
                              onClick={() => handleDelete(v)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete VRF Domain"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STYLE 2: Compact NOC Density Table (Ultra-dense 1-line view) */}
      {viewMode === 'compact' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2">VRF Domain</th>
                  <th className="px-3 py-2">RD</th>
                  <th className="px-3 py-2">RT Exp / Imp</th>
                  <th className="px-3 py-2">Subnets</th>
                  <th className="px-3 py-2">Allocated IPs</th>
                  <th className="px-3 py-2">Capacity</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredVrfs.map(v => {
                  const isDefault = v.name === 'DEFAULT';
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-1.5 font-bold text-white whitespace-nowrap">
                        {v.name} {isDefault && <span className="text-[9px] text-amber-400 font-bold ml-1">(DEF)</span>}
                      </td>
                      <td className="px-3 py-1.5 text-cyan-300 font-bold whitespace-nowrap">{v.rd}</td>
                      <td className="px-3 py-1.5 text-slate-400 whitespace-nowrap">
                        {v.routeTargetExport || v.rd} / {v.routeTargetImport || v.rd}
                      </td>
                      <td className="px-3 py-1.5 text-blue-300 font-bold">{v.boundSubnets.length} CIDRs</td>
                      <td className="px-3 py-1.5 text-emerald-400 font-bold">{v.allocatedHosts}</td>
                      <td className="px-3 py-1.5 text-slate-400">{v.totalCapacity.toLocaleString()} IPs</td>
                      <td className="px-3 py-1.5 text-slate-400 font-sans truncate max-w-[200px]">{v.description}</td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {onSelectVrfForSubnets && (
                            <button
                              onClick={() => onSelectVrfForSubnets(v.name)}
                              className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                            >
                              Subnets ↗
                            </button>
                          )}
                          {!isDefault && (
                            <button
                              onClick={() => handleDelete(v)}
                              className="text-slate-500 hover:text-rose-400 font-bold"
                              title="Delete VRF"
                            >
                              Del
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STYLE 3: Cyber Strip Ledger Table (Futuristic Holographic Row Strips) */}
      {viewMode === 'ledger' && (
        <div className="space-y-2.5">
          {filteredVrfs.map(v => {
            const isDefault = v.name === 'DEFAULT';
            return (
              <div
                key={v.id}
                className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-[260px]">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-white text-sm">{v.name}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        RD: {v.rd}
                      </span>
                      {isDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          GLOBAL
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-sans block mt-0.5 truncate max-w-sm">
                      {v.description}
                    </span>
                  </div>
                </div>

                {/* Subnet Blocks Preview Tag Strip */}
                <div className="flex items-center gap-1.5 flex-wrap flex-1 max-w-md">
                  {v.boundSubnets.length > 0 ? (
                    v.boundSubnets.map(s => (
                      <span 
                        key={s.id} 
                        className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800"
                      >
                        {s.cidr}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic font-mono">0 subnets</span>
                  )}
                </div>

                {/* Telemetry & Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Allocated Hosts</span>
                    <strong className="text-emerald-400 text-xs block">{v.allocatedHosts} Hosts</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onSelectVrfForSubnets && (
                      <button
                        onClick={() => onSelectVrfForSubnets(v.name)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-mono flex items-center gap-1 transition-all shadow-sm"
                      >
                        <span>Subnets</span>
                        <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    )}
                    {!isDefault && (
                      <button
                        onClick={() => handleDelete(v)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete VRF"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
