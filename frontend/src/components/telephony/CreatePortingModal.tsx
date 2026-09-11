import React, { useState } from 'react';
import { CreatePortingRequest, PortingDirection, PortingRecord } from '../../types/telephony';
import { X, ArrowLeftRight, Phone, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: CreatePortingRequest) => Promise<PortingRecord>;
}

export const CreatePortingModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [telephoneNumber, setTelephoneNumber] = useState<string>('+628119003344');
  const [direction, setDirection] = useState<PortingDirection>('PORTED_IN');
  const [donorOperator, setDonorOperator] = useState<string>('PT Telkomsel');
  const [recipientOperator, setRecipientOperator] = useState<string>('Netstream Mobile');
  const [portingDueDate, setPortingDueDate] = useState<string>('2026-03-20');
  const [requesterName, setRequesterName] = useState<string>('Enterprise Account Manager');
  const [notes, setNotes] = useState<string>('MNP standard submission with biometric subscriber verification');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telephoneNumber.trim() || !requesterName.trim()) {
      setError('Telephone number and Requester Name are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        telephoneNumber: telephoneNumber.trim(),
        direction,
        donorOperator: donorOperator.trim(),
        recipientOperator: recipientOperator.trim(),
        portingDueDate,
        requesterName: requesterName.trim(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit porting request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Number Portability Request</h3>
              <p className="text-xs text-slate-400">Submit MNP (Mobile) / FNP (Fixed) porting order to clearinghouse</p>
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
              <label className="block text-slate-400 font-semibold mb-1">Porting Direction</label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'PORTED_IN', label: 'Port-In' },
                  { id: 'PORTED_OUT', label: 'Port-Out' }
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDirection(d.id as PortingDirection);
                      if (d.id === 'PORTED_IN') {
                        setDonorOperator('PT Telkomsel');
                        setRecipientOperator('Netstream Mobile');
                      } else {
                        setDonorOperator('Netstream Mobile');
                        setRecipientOperator('PT Indosat Ooredoo');
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      direction === d.id
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target Phone Number *</label>
              <input
                type="text"
                value={telephoneNumber}
                onChange={e => setTelephoneNumber(e.target.value)}
                placeholder="e.g. +628119003344"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Donor Operator</label>
              <input
                type="text"
                value={donorOperator}
                onChange={e => setDonorOperator(e.target.value)}
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Recipient Operator</label>
              <input
                type="text"
                value={recipientOperator}
                onChange={e => setRecipientOperator(e.target.value)}
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Scheduled Cutover Date</label>
              <input
                type="date"
                value={portingDueDate}
                onChange={e => setPortingDueDate(e.target.value)}
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Requester / Subscriber Legal Name</label>
              <input
                type="text"
                value={requesterName}
                onChange={e => setRequesterName(e.target.value)}
                placeholder="e.g. Budi Gunawan"
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Porting Authorization Notes & Clearinghouse ID</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Authorization code, biometric authentication confirmation..."
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Porting Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
