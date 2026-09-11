import React, { useState } from 'react';
import { LeasedLineCircuit, CircuitLifecycleStatus, SlaTier } from '../../types/leasedLine';
import { leasedLineApi } from '../../api/leasedLineApi';
import { GitBranch, X, Save } from 'lucide-react';

interface EditLeasedLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: LeasedLineCircuit | null;
  onSuccess: () => void;
}

export const EditLeasedLineModal: React.FC<EditLeasedLineModalProps> = ({
  isOpen,
  onClose,
  circuit,
  onSuccess,
}) => {
  if (!isOpen || !circuit) return null;

  const [circuitName, setCircuitName] = useState(circuit.circuitName);
  const [carrierCircuitId, setCarrierCircuitId] = useState(circuit.carrierCircuitId || '');
  const [status, setStatus] = useState<CircuitLifecycleStatus>(circuit.status);
  const [slaTier, setSlaTier] = useState<SlaTier>(circuit.slaTier);
  const [mrc, setMrc] = useState<number>(circuit.mrc);
  const [actualLatencyMs, setActualLatencyMs] = useState<number>(circuit.actualLatencyMs);
  const [utilizationPercent, setUtilizationPercent] = useState<number>(circuit.utilizationPercent);
  const [notes, setNotes] = useState(circuit.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await leasedLineApi.updateCircuit(circuit.id, {
        circuitName,
        carrierCircuitId: carrierCircuitId || undefined,
        status,
        slaTier,
        mrc: Number(mrc),
        actualLatencyMs: Number(actualLatencyMs),
        utilizationPercent: Number(utilizationPercent),
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update circuit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Leased Circuit Parameters</h3>
              <p className="text-xs font-mono text-purple-300">{circuit.circuitId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Circuit Description / Name
            </label>
            <input
              type="text"
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Carrier Circuit Ref ID
              </label>
              <input
                type="text"
                value={carrierCircuitId}
                onChange={(e) => setCarrierCircuitId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Operational Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CircuitLifecycleStatus)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DORMANT">DORMANT (OpEx Waste)</option>
                <option value="PENDING_DECOMMISSION">PENDING_DECOMMISSION</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monthly Charge (USD $)
              </label>
              <input
                type="number"
                value={mrc}
                onChange={(e) => setMrc(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Actual Latency (ms)
              </label>
              <input
                type="number"
                step="0.01"
                value={actualLatencyMs}
                onChange={(e) => setActualLatencyMs(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Traffic Utilization (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={utilizationPercent}
                onChange={(e) => setUtilizationPercent(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Engineering / Maintenance Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

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
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
