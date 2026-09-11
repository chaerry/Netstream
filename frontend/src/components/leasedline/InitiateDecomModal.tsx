import React, { useState } from 'react';
import { PowerOff, Workflow, DollarSign, Calendar, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { leasedLineApi } from '../../api/leasedLineApi';

interface InitiateDecomModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: { id: string; circuitId: string; circuitName: string; mrc: number } | null;
  onSuccess: () => void;
}

export const InitiateDecomModal: React.FC<InitiateDecomModalProps> = ({
  isOpen,
  onClose,
  circuit,
  onSuccess,
}) => {
  if (!isOpen || !circuit) return null;

  const [reason, setReason] = useState('Customer branch closed / zero subscriber traffic for >60 days');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultPayload, setResultPayload] = useState<any | null>(null);

  const annualSavings = circuit.mrc * 12;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await leasedLineApi.triggerGaharuDecommission({
        circuitId: circuit.id,
        initiatedBy: 'telecom_planner',
        reason,
        targetDecomDate: targetDate,
      });
      setResultPayload(res);
      onSuccess();
    } catch (err) {
      console.error('Failed to trigger Gaharu BPMN decommissioning:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <PowerOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Initiate Decommissioning Workflow
              </h3>
              <p className="text-xs text-slate-400">
                Dispatches to <span className="text-purple-300 font-semibold">Gaharu_BPMN_NGIN</span>
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

        {/* Content */}
        {resultPayload ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                Gaharu BPMN Instance Started
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Process ID: {resultPayload.gaharuProcessInstanceId}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-left text-xs font-mono text-slate-300 space-y-1">
              <div className="text-purple-400">Workflow: leased_line_cancellation_flow</div>
              <div className="text-emerald-400">Annual OpEx Saved: ${resultPayload.estimatedAnnualSavingsUsd.toLocaleString()} USD</div>
              <div className="text-slate-400">Status: BPMN_SUBMITTED (Carrier Relations Queue)</div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Circuit Notice Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-300">
                  {circuit.circuitId}
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  ${circuit.mrc.toLocaleString()} /mo USD
                </span>
              </div>
              <p className="text-xs text-slate-300">{circuit.circuitName}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Projected 12-Month Savings:</span>
                <span className="font-mono font-bold text-emerald-400">
                  +${annualSavings.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Target Decommission Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Termination Date (Billing Cease)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {/* Cancellation Reason */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Justification / Reason for Termination
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            {/* BPMN Note */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
              <Workflow className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                Submitting will trigger the automated <strong>Gaharu_BPMN_NGIN</strong> carrier cancellation workflow to dispatch formal notification, port shutdown, and final invoice reconciliation.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
              >
                <PowerOff className="w-4 h-4" />
                {isSubmitting ? 'Dispatching BPMN...' : 'Confirm Decommissioning'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
