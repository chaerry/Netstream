import React, { useState } from 'react';
import { VrfDomain, CreateVrfRequest, IpSubnet } from '../../types/ipam';
import { Layers, X, Plus, Trash2, Shield, Network, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDialog } from '../common/DialogContext';

interface Props {
  isOpen: boolean;
  vrfs: VrfDomain[];
  subnets: IpSubnet[];
  onClose: () => void;
  onCreateVrf: (req: CreateVrfRequest) => Promise<VrfDomain>;
  onDeleteVrf: (id: string) => Promise<void>;
}

export const ManageVrfModal: React.FC<Props> = ({
  isOpen,
  vrfs,
  subnets,
  onClose,
  onCreateVrf,
  onDeleteVrf
}) => {
  const [name, setName] = useState<string>('');
  const [rd, setRd] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [routeTargetExport, setRouteTargetExport] = useState<string>('');
  const [routeTargetImport, setRouteTargetImport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { confirmDelete } = useDialog();

  if (!isOpen) return null;

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
        description: description.trim() || `MPLS VPN Routing Domain for ${normalizedName}`,
        routeTargetExport: routeTargetExport.trim() || rd.trim(),
        routeTargetImport: routeTargetImport.trim() || rd.trim(),
      });
      setSuccess(`VRF Domain '${normalizedName}' successfully registered.`);
      setName('');
      setRd('');
      setDescription('');
      setRouteTargetExport('');
      setRouteTargetImport('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to register VRF domain.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vrf: VrfDomain) => {
    if (vrf.name === 'DEFAULT') return;

    const assignedSubnets = subnets.filter(s => s.vrfName === vrf.name);
    const confirmed = await confirmDelete({
      title: 'Decommission VRF Routing Domain',
      subtitle: 'Multi-Tenant Virtual Routing Table Retirement',
      protocolCode: 'BGP_MPLS // PURGE_VRF_DOMAIN',
      itemBadge: 'VRF',
      itemCode: vrf.name,
      itemName: `Route Distinguisher: ${vrf.rd}`,
      impactMessage: assignedSubnets.length > 0
        ? `WARNING: There are ${assignedSubnets.length} active subnet(s) bound to this VRF domain. Removing this VRF will disrupt route exchange.`
        : 'Permanently removes this VRF instance and associated route distinguishers from the BGP peering table.',
      confirmText: 'Confirm Decommission',
    });

    if (confirmed) {
      await onDeleteVrf(vrf.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Top Tech Laser Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-glow-blue">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  RFC 4364 / BGP MPLS IP VPN
                </span>
                <span className="text-xs text-slate-500 font-mono">Routing Isolation Engine</span>
              </div>
              <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>VRF Routing Domains Manager</span>
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Registered VRF Domains List (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  Active VRF Routing Tables ({vrfs.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Multi-tenant Segregation</span>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {vrfs.map(v => {
                  const assignedSubnets = subnets.filter(s => s.vrfName === v.name);
                  const isDefault = v.name === 'DEFAULT';

                  return (
                    <div 
                      key={v.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDefault 
                          ? 'bg-blue-950/20 border-blue-500/30 hover:border-blue-500/50' 
                          : 'glass-card border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm text-white">{v.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                              RD: {v.rd}
                            </span>
                            {isDefault && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                GLOBAL DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-sans">
                            {v.description}
                          </p>
                        </div>

                        {!isDefault && (
                          <button
                            onClick={() => handleDelete(v)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Decommission VRF Domain"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-3">
                          <span>RT Exp: <strong className="text-slate-300">{v.routeTargetExport || v.rd}</strong></span>
                          <span>RT Imp: <strong className="text-slate-300">{v.routeTargetImport || v.rd}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400 font-bold">
                          <Network className="w-3.5 h-3.5" />
                          <span>{assignedSubnets.length} Subnet{assignedSubnets.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Register New VRF Domain Form (5 cols) */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Plus className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Register New VRF Domain
                  </h4>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      VRF Identifier Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value.toUpperCase())}
                      placeholder="e.g. VRF_ENTERPRISE_VPN"
                      className="glass-input w-full h-9 px-3 rounded-xl font-mono text-white text-xs uppercase"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                      Routing table instance label
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Route Distinguisher (RD) *
                    </label>
                    <input
                      type="text"
                      value={rd}
                      onChange={e => setRd(e.target.value)}
                      placeholder="e.g. 65000:500 or 10.240.0.1:100"
                      className="glass-input w-full h-9 px-3 rounded-xl font-mono text-cyan-300 text-xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                      RFC 4364 format (ASN:NN or IP:NN)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        RT Export
                      </label>
                      <input
                        type="text"
                        value={routeTargetExport}
                        onChange={e => setRouteTargetExport(e.target.value)}
                        placeholder="Inherit RD"
                        className="glass-input w-full h-8 px-2.5 rounded-lg font-mono text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        RT Import
                      </label>
                      <input
                        type="text"
                        value={routeTargetImport}
                        onChange={e => setRouteTargetImport(e.target.value)}
                        placeholder="Inherit RD"
                        className="glass-input w-full h-8 px-2.5 rounded-lg font-mono text-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Description / Operational Purpose
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Dedicated MPLS L3VPN interconnect for Enterprise Banking and ATM networks"
                      rows={3}
                      className="glass-input w-full p-2.5 rounded-xl text-slate-200 text-xs h-auto min-h-[70px] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'Registering VRF...' : 'Register VRF Domain'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Netstream IPAM Engine // Virtual Routing and Forwarding</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
