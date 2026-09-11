import React, { useState } from 'react';
import { AllocateIpRequest, IpAddress, IpSubnet, IpAddressStatus } from '../../types/ipam';
import { X, Network, Server, User, Globe, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  subnets: IpSubnet[];
  onClose: () => void;
  onSubmit: (req: AllocateIpRequest) => Promise<IpAddress>;
}

export const AllocateIpModal: React.FC<Props> = ({ isOpen, subnets, onClose, onSubmit }) => {
  const [selectedSubnetId, setSelectedSubnetId] = useState<string>(subnets[0]?.id || '');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [status, setStatus] = useState<IpAddressStatus>('ALLOCATED');
  const [hostname, setHostname] = useState<string>('');
  const [interfaceName, setInterfaceName] = useState<string>('');
  const [macAddress, setMacAddress] = useState<string>('');
  const [dnsPtr, setDnsPtr] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [serviceCode, setServiceCode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSubnet = subnets.find(s => s.id === selectedSubnetId) || subnets[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim()) {
      setError('IP address is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        ipAddress: ipAddress.trim(),
        subnetId: currentSubnet?.id || 'sub-01',
        vrfName: currentSubnet?.vrfName || 'DEFAULT',
        status,
        hostname: hostname.trim() || undefined,
        interfaceName: interfaceName.trim() || undefined,
        macAddress: macAddress.trim() || undefined,
        dnsPtr: dnsPtr.trim() || undefined,
        customerName: customerName.trim() || undefined,
        serviceCode: serviceCode.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to allocate IP address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Allocate IP Address</h3>
              <p className="text-xs text-slate-400">Assign IP to network chassis port, customer service, or VIP</p>
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
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Target Subnet & VRF</label>
            <select
              value={selectedSubnetId}
              onChange={e => {
                setSelectedSubnetId(e.target.value);
                const sub = subnets.find(s => s.id === e.target.value);
                if (sub && !ipAddress) {
                  setIpAddress(`${sub.networkAddress.replace(/\.0$/, '')}.10`);
                }
              }}
              className="glass-input w-full h-9 px-3 rounded-lg bg-slate-950 border-slate-700 text-slate-200"
            >
              {subnets.map(s => (
                <option key={s.id} value={s.id}>
                  {s.cidr} — {s.name} ({s.vrfName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">IP Address *</label>
              <input
                type="text"
                value={ipAddress}
                onChange={e => setIpAddress(e.target.value)}
                placeholder="e.g. 10.240.10.16"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Status Classification</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as IpAddressStatus)}
                className="glass-input w-full h-9 px-2.5 rounded-lg bg-slate-950 border-slate-700 text-slate-200"
              >
                <option value="ALLOCATED">ALLOCATED (In-Use)</option>
                <option value="RESERVED">RESERVED (Projected)</option>
                <option value="DHCP_POOL">DHCP_POOL</option>
                <option value="GATEWAY">GATEWAY (VRRP/HSRP)</option>
                <option value="QUARANTINE">QUARANTINE</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Device & Port Binding (Optional)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Hostname</label>
                <input
                  type="text"
                  value={hostname}
                  onChange={e => setHostname(e.target.value)}
                  placeholder="e.g. ID-CGK-PE-RTR-02"
                  className="glass-input w-full h-8 px-2.5 rounded-lg font-mono text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Interface / Port</label>
                <input
                  type="text"
                  value={interfaceName}
                  onChange={e => setInterfaceName(e.target.value)}
                  placeholder="e.g. TenGigE0/0/0/2"
                  className="glass-input w-full h-8 px-2.5 rounded-lg font-mono text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Hardware MAC Address</label>
                <input
                  type="text"
                  value={macAddress}
                  onChange={e => setMacAddress(e.target.value)}
                  placeholder="e.g. 00:1B:17:AA:BB:CC"
                  className="glass-input w-full h-8 px-2.5 rounded-lg font-mono text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">DNS PTR / FQDN</label>
                <input
                  type="text"
                  value={dnsPtr}
                  onChange={e => setDnsPtr(e.target.value)}
                  placeholder="e.g. rtr-lo0.netstream.net"
                  className="glass-input w-full h-8 px-2.5 rounded-lg font-mono text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Assigned Customer / Account</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. PT Bank Mandiri Tbk"
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Linked Service Code</label>
              <input
                type="text"
                value={serviceCode}
                onChange={e => setServiceCode(e.target.value)}
                placeholder="e.g. SVC-VPN-2026-0099"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Operational Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Provisioning details, change ticket ID, allocation justification..."
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Allocating...' : 'Commit Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
