import React, { useState } from 'react';
import {
  CircuitDirection,
  CircuitTechnology,
  SlaTier,
  CreateCircuitPayload,
  LeasedLineCarrier,
} from '../../types/leasedLine';
import { leasedLineApi } from '../../api/leasedLineApi';
import { GitBranch, X, Plus, DollarSign, ShieldCheck, Radio } from 'lucide-react';

interface CreateLeasedLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  carriers: LeasedLineCarrier[];
  onSuccess: () => void;
}

export const CreateLeasedLineModal: React.FC<CreateLeasedLineModalProps> = ({
  isOpen,
  onClose,
  carriers,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [circuitId, setCircuitId] = useState('');
  const [carrierCircuitId, setCarrierCircuitId] = useState('');
  const [circuitName, setCircuitName] = useState('');
  const [direction, setDirection] = useState<CircuitDirection>('INBOUND_RENTED');
  const [technology, setTechnology] = useState<CircuitTechnology>('EPL');
  const [carrierId, setCarrierId] = useState(carriers[0]?.id || '');
  const [bandwidthMbps, setBandwidthMbps] = useState<number>(10000);
  const [slaTier, setSlaTier] = useState<SlaTier>('GOLD_99_99');
  const [committedLatencyMs, setCommittedLatencyMs] = useState<number>(5.0);
  const [mrc, setMrc] = useState<number>(4500);
  const [nrc, setNrc] = useState<number>(1000);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: CreateCircuitPayload = {
      circuitId,
      carrierCircuitId: carrierCircuitId || undefined,
      circuitName,
      direction,
      technology,
      carrierId: direction === 'INBOUND_RENTED' ? carrierId : undefined,
      customerName: direction === 'OUTBOUND_CUSTOMER' ? customerName : undefined,
      bandwidthMbps: Number(bandwidthMbps),
      slaTier,
      committedLatencyMs: Number(committedLatencyMs),
      currency: 'USD',
      mrc: Number(mrc),
      nrc: Number(nrc),
      notes: notes || undefined,
    };

    try {
      await leasedLineApi.createCircuit(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create circuit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Provision New Leased Line Circuit
              </h3>
              <p className="text-xs text-slate-400">
                VC4 S2C Model • Physical & Logical Telecom Interface
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Circuit ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Circuit ID (Internal / OSS)*
              </label>
              <input
                type="text"
                placeholder="e.g. LL-P2P-JKT-SUB-10G"
                value={circuitId}
                onChange={(e) => setCircuitId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Carrier Circuit Ref */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Carrier Circuit Reference ID
              </label>
              <input
                type="text"
                placeholder="e.g. TELKOM-EPL-9921"
                value={carrierCircuitId}
                onChange={(e) => setCarrierCircuitId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Circuit Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Circuit Description / Name*
            </label>
            <input
              type="text"
              placeholder="e.g. Jakarta Cyber 1 to Surabaya Rungkut Metro Transit Span"
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Direction */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Circuit Direction*
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as CircuitDirection)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="INBOUND_RENTED">Inbound (Off-Net / Rented)</option>
                <option value="OUTBOUND_CUSTOMER">Outbound (On-Net / Sold)</option>
              </select>
            </div>

            {/* Technology */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Technology Standard*
              </label>
              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value as CircuitTechnology)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="EPL">EPL (Ethernet Private Line)</option>
                <option value="EVPL">EVPL (VLAN Tagged)</option>
                <option value="DIA">DIA (Dedicated Internet)</option>
                <option value="DWDM_LAMBDA">DWDM Lambda (100G+)</option>
                <option value="DARK_FIBER">Dark Fiber (Pair)</option>
                <option value="SDH_VC4">SDH / VC4 Circuit</option>
              </select>
            </div>

            {/* Bandwidth Mbps */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bandwidth (Mbps)*
              </label>
              <input
                type="number"
                value={bandwidthMbps}
                onChange={(e) => setBandwidthMbps(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Conditional Carrier vs Customer */}
          {direction === 'INBOUND_RENTED' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Provider / 3rd-Party Carrier
              </label>
              <select
                value={carrierId}
                onChange={(e) => setCarrierId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {carriers.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} ({car.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Enterprise Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. PT Bank Central Asia Tbk"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* SLA Tier */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                SLA Guarantee Tier
              </label>
              <select
                value={slaTier}
                onChange={(e) => setSlaTier(e.target.value as SlaTier)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="PLATINUM_99_999">Platinum (99.999% • 2h MTTR)</option>
                <option value="GOLD_99_99">Gold (99.99% • 4h MTTR)</option>
                <option value="SILVER_99_95">Silver (99.95% • 6h MTTR)</option>
                <option value="BRONZE_99_90">Bronze (99.90% • 8h MTTR)</option>
              </select>
            </div>

            {/* Monthly Cost (USD) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monthly Charge (USD $)*
              </label>
              <input
                type="number"
                value={mrc}
                onChange={(e) => setMrc(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Non-Recurring Charge (USD) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                One-Time Setup / NRC ($)
              </label>
              <input
                type="number"
                value={nrc}
                onChange={(e) => setNrc(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Engineering Notes & Transceiver Specs
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. SFP+ 10G-LR hand-off on Rack 04. Single-mode G.652D fiber pair."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Provisioning...' : 'Provision Leased Line'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
