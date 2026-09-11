import React, { useState } from 'react';
import { AllocateNumberRequest, NumberBlock, TelephoneNumber, NumberStatus, NumberCategory } from '../../types/telephony';
import { X, Phone, User, MapPin, Building, Server } from 'lucide-react';

interface Props {
  isOpen: boolean;
  blocks: NumberBlock[];
  onClose: () => void;
  onSubmit: (req: AllocateNumberRequest) => Promise<TelephoneNumber>;
}

export const AllocateNumberModal: React.FC<Props> = ({ isOpen, blocks, onClose, onSubmit }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || '');
  const [e164Format, setE164Format] = useState<string>('+622150003001');
  const [nationalFormat, setNationalFormat] = useState<string>('(021) 5000-3001');
  const [status, setStatus] = useState<NumberStatus>('ALLOCATED');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAccount, setCustomerAccount] = useState<string>('');
  const [serviceCode, setServiceCode] = useState<string>('SVC-VOIP-SIP-002');
  const [assignedNode, setAssignedNode] = useState<string>('ID-CGK-IMS-SBC-01');
  const [locationName, setLocationName] = useState<string>('SCBD Financial Center');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!e164Format.trim() || !customerName.trim()) {
      setError('E.164 Number and Customer Name are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        e164Format: e164Format.trim(),
        nationalFormat: nationalFormat.trim(),
        blockId: currentBlock?.id || 'blk-01',
        category: currentBlock?.category || 'GEOGRAPHIC',
        status,
        customerName: customerName.trim(),
        customerAccount: customerAccount.trim() || undefined,
        serviceCode: serviceCode.trim() || undefined,
        assignedNode: assignedNode.trim() || undefined,
        locationName: locationName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to allocate number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Allocate Telephone Number</h3>
              <p className="text-xs text-slate-400">Assign phone number to subscriber account or enterprise SIP trunk</p>
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
            <label className="block text-slate-400 font-semibold mb-1">Assigned Number Block</label>
            <select
              value={selectedBlockId}
              onChange={e => setSelectedBlockId(e.target.value)}
              className="glass-input w-full h-9 px-3 rounded-lg bg-slate-950 border-slate-700 text-slate-200"
            >
              {blocks.map(b => (
                <option key={b.id} value={b.id}>
                  {b.prefix} ({b.regionName}) — {b.category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">E.164 Standard Format *</label>
              <input
                type="text"
                value={e164Format}
                onChange={e => setE164Format(e.target.value)}
                placeholder="e.g. +622150003001"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">National Local Display</label>
              <input
                type="text"
                value={nationalFormat}
                onChange={e => setNationalFormat(e.target.value)}
                placeholder="e.g. (021) 5000-3001"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Subscriber / Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. PT Astra International Tbk"
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Customer Account / Billing ID</label>
              <input
                type="text"
                value={customerAccount}
                onChange={e => setCustomerAccount(e.target.value)}
                placeholder="e.g. CUST-ASTRA-092"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Linked Service Code</label>
              <input
                type="text"
                value={serviceCode}
                onChange={e => setServiceCode(e.target.value)}
                placeholder="e.g. SVC-VOIP-SIP-002"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Host IMS / SBC Node</label>
              <input
                type="text"
                value={assignedNode}
                onChange={e => setAssignedNode(e.target.value)}
                placeholder="e.g. ID-CGK-IMS-SBC-01"
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Physical Installation Site / Location</label>
            <input
              type="text"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              placeholder="e.g. SCBD Sudirman Financial Center"
              className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Allocation Justification / SLA Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Pilot number, direct inward dialing range, DID hunt group..."
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Allocating...' : 'Commit Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
