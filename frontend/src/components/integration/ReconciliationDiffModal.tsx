import React, { useState } from 'react';
import { GitCompare, CheckCircle2, XCircle, Send, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ReconciliationItem } from '../../types/integration';

interface ReconciliationDiffModalProps {
  item: ReconciliationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (id: number, action: string, notes?: string) => Promise<void>;
}

export const ReconciliationDiffModal: React.FC<ReconciliationDiffModalProps> = ({
  item,
  isOpen,
  onClose,
  onResolve,
}) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !item) return null;

  const handleAction = async (action: string) => {
    setIsProcessing(true);
    try {
      await onResolve(item.id, action, notes);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Reconciliation Diff Inspector</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-wrap justify-between gap-2 font-sans">
            <div>
              <span className="text-slate-400 text-xs block">Target Entity</span>
              <strong className="text-slate-100 font-mono text-sm">{item.entityIdentifier}</strong>
              <div className="text-xs text-slate-400 mt-0.5">{item.entityType} • {item.connectorName}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-xs block">Discrepancy</span>
              <strong className="text-amber-400">{item.discrepancyType.replace('_', ' ')}</strong>
              <div className="text-xs text-slate-400 mt-0.5">{item.attributeName}</div>
            </div>
          </div>

          {/* Side by Side Diff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-rose-500/20">
              <div className="text-rose-400 font-bold pb-2 border-b border-slate-800 flex items-center justify-between font-sans">
                <span>INVENTORY RECORD (SSoT)</span>
                <span className="text-[10px] text-slate-500">Current DB</span>
              </div>
              <div className="mt-2 text-rose-300 whitespace-pre-wrap">
                {item.inventoryValue || 'EMPTY / NOT RECORDED'}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-500/20">
              <div className="text-emerald-400 font-bold pb-2 border-b border-slate-800 flex items-center justify-between font-sans">
                <span>DISCOVERED LIVE STATE</span>
                <span className="text-[10px] text-slate-500">Live Network</span>
              </div>
              <div className="mt-2 text-emerald-300 whitespace-pre-wrap">
                {item.liveDiscoveredValue || 'NOT FOUND'}
              </div>
            </div>
          </div>

          {/* Notes input */}
          <div className="font-sans">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resolution Audit Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Verified via scheduled optical fiber maintenance ticket..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Resolution Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-end gap-2 font-sans">
            <button
              onClick={() => handleAction('IGNORE_MARK_ROGUE')}
              disabled={isProcessing}
              className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
            >
              Flag as Rogue / Unauthorized
            </button>
            <button
              onClick={() => handleAction('DISPATCH_WORK_ORDER')}
              disabled={isProcessing}
              className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              Dispatch to Gaharu_BPMN_NGIN
            </button>
            <button
              onClick={() => handleAction('APPLY_TO_INVENTORY')}
              disabled={isProcessing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accept & Sync SSoT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
