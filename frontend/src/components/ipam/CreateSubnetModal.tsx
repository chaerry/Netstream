import React, { useState } from 'react';
import { CreateSubnetRequest, IpSubnet, VrfDomain } from '../../types/ipam';
import { X, Network, Globe2, Layers, MapPin, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  vrfs: VrfDomain[];
  onClose: () => void;
  onSubmit: (req: CreateSubnetRequest) => Promise<IpSubnet>;
  onOpenManageVrf?: () => void;
}

export const CreateSubnetModal: React.FC<Props> = ({ isOpen, vrfs, onClose, onSubmit, onOpenManageVrf }) => {
  const [cidr, setCidr] = useState<string>('10.240.30.0/24');
  const [ipVersion, setIpVersion] = useState<'IPv4' | 'IPv6'>('IPv4');
  const [vrfName, setVrfName] = useState<string>('DEFAULT');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [gatewayIp, setGatewayIp] = useState<string>('');
  const [vlanId, setVlanId] = useState<number | undefined>(undefined);
  const [locationName, setLocationName] = useState<string>('Jakarta Central POP');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidr.trim() || !name.trim()) {
      setError('CIDR block and Subnet name are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        cidr: cidr.trim(),
        ipVersion,
        vrfName,
        name: name.trim(),
        description: description.trim(),
        gatewayIp: gatewayIp.trim() || undefined,
        vlanId: vlanId ? Number(vlanId) : undefined,
        locationName: locationName.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create subnet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create IP Subnet / Range</h3>
              <p className="text-xs text-slate-400">Allocate hierarchical CIDR block into routing domain</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">IP Protocol Version</label>
              <div className="flex items-center gap-2">
                {(['IPv4', 'IPv6'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setIpVersion(v);
                      if (v === 'IPv6' && cidr.startsWith('10.')) setCidr('2001:df0:a12:200::/64');
                      if (v === 'IPv4' && cidr.includes(':')) setCidr('10.240.30.0/24');
                    }}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      ipVersion === v 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-400 font-semibold">VRF Domain</label>
                {onOpenManageVrf && (
                  <button
                    type="button"
                    onClick={onOpenManageVrf}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5"
                    title="Open VRF Domains Manager"
                  >
                    + New VRF
                  </button>
                )}
              </div>
              <select
                value={vrfName}
                onChange={e => setVrfName(e.target.value)}
                className="glass-input w-full h-8 px-2.5 rounded-lg bg-slate-950 border-slate-700 text-slate-200"
              >
                {vrfs.map(v => (
                  <option key={v.id} value={v.name}>{v.name} ({v.rd})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">CIDR Block *</label>
            <input
              type="text"
              value={cidr}
              onChange={e => setCidr(e.target.value)}
              placeholder="e.g. 10.240.30.0/24 or 2001:df0:a12::/48"
              className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Subnet Name / Identifier *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Surabaya Edge BNG Aggregation Pool"
              className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Default Gateway IP</label>
              <input
                type="text"
                value={gatewayIp}
                onChange={e => setGatewayIp(e.target.value)}
                placeholder="e.g. 10.240.30.1"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">VLAN 802.1Q Tag (1-4094)</label>
              <input
                type="number"
                min={1}
                max={4094}
                value={vlanId || ''}
                onChange={e => setVlanId(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 130"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Location Site</label>
            <input
              type="text"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              placeholder="e.g. SCBD Financial Center"
              className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Operational Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Operational context, routing scope, RFC assignment notes..."
              className="glass-input w-full p-2.5 rounded-lg text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Register Subnet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
