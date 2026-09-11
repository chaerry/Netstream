import React, { useState } from 'react';
import { LeasedLineCircuit, LogSlaIncidentPayload } from '../../types/leasedLine';
import { leasedLineApi } from '../../api/leasedLineApi';
import { ShieldAlert, X, Plus, Clock, DollarSign } from 'lucide-react';

interface LogSlaIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuits: LeasedLineCircuit[];
  onSuccess: () => void;
}

export const LogSlaIncidentModal: React.FC<LogSlaIncidentModalProps> = ({
  isOpen,
  onClose,
  circuits,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [circuitId, setCircuitId] = useState(circuits[0]?.id || '');
  const [ticketNumber, setTicketNumber] = useState(
    'INC-NOC-' + Math.floor(1000 + Math.random() * 9000)
  );
  const [carrierTicketNumber, setCarrierTicketNumber] = useState('');
  const [incidentStart, setIncidentStart] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() - 5);
    return d.toISOString().slice(0, 16);
  });
  const [incidentEnd, setIncidentEnd] = useState(() => new Date().toISOString().slice(0, 16));
  const [durationMinutes, setDurationMinutes] = useState(300); // 5 hours
  const [targetMttrMinutes, setTargetMttrMinutes] = useState(240); // 4 hours
  const [outageType, setOutageType] = useState('FIBER_CUT');
  const [rootCause, setRootCause] = useState('Optical fiber cut by third-party civil roadworks');
  const [penaltyRebateAmount, setPenaltyRebateAmount] = useState(650);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: LogSlaIncidentPayload = {
        circuitId,
        ticketNumber,
        carrierTicketNumber: carrierTicketNumber || undefined,
        incidentStart: new Date(incidentStart).toISOString(),
        incidentEnd: incidentEnd ? new Date(incidentEnd).toISOString() : undefined,
        durationMinutes: Number(durationMinutes),
        targetMttrMinutes: Number(targetMttrMinutes),
        outageType,
        rootCause,
        currency: 'USD',
        penaltyRebateAmount: Number(penaltyRebateAmount),
      };

      await leasedLineApi.logSlaIncident(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to log SLA incident:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log SLA Outage & Claim Rebate</h3>
              <p className="text-xs text-slate-400">Calculates contractual MTTR penalties</p>
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
              Affected Leased Line Circuit*
            </label>
            <select
              value={circuitId}
              onChange={(e) => setCircuitId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {circuits.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.circuitId} — {c.circuitName} (${c.mrc.toLocaleString()}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Internal NOC Ticket #*
              </label>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Carrier Trouble Ticket #
              </label>
              <input
                type="text"
                placeholder="e.g. SINGTEL-TT-448102"
                value={carrierTicketNumber}
                onChange={(e) => setCarrierTicketNumber(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Incident Start Time*
              </label>
              <input
                type="datetime-local"
                value={incidentStart}
                onChange={(e) => setIncidentStart(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Incident Restored Time
              </label>
              <input
                type="datetime-local"
                value={incidentEnd}
                onChange={(e) => setIncidentEnd(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Outage Type
              </label>
              <select
                value={outageType}
                onChange={(e) => setOutageType(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="FIBER_CUT">Fiber Cut / Cable Severed</option>
                <option value="HARDWARE_FAILURE">Optical Transceiver / EDFA Fault</option>
                <option value="POWER_OUTAGE">Shelter Power / UPS Failure</option>
                <option value="BGP_ROUTING">BGP Flap / Transit Routing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Downtime (Minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Claimed Penalty Rebate ($ USD)
              </label>
              <input
                type="number"
                value={penaltyRebateAmount}
                onChange={(e) => setPenaltyRebateAmount(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 text-emerald-400 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Root Cause & Resolution Summary
            </label>
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
              required
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Record Incident & Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
