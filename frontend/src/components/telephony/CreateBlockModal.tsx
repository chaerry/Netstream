import React, { useState } from 'react';
import { CreateBlockRequest, NumberCategory, NumberBlock } from '../../types/telephony';
import { X, Phone, Building2, Globe, Hash } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: CreateBlockRequest) => Promise<NumberBlock>;
}

export const CreateBlockModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [prefix, setPrefix] = useState<string>('+62 21 5200');
  const [blockPattern, setBlockPattern] = useState<string>('+62 21 5200 xxxx');
  const [countryCode, setCountryCode] = useState<string>('+62');
  const [areaCode, setAreaCode] = useState<string>('21');
  const [regionName, setRegionName] = useState<string>('DKI Jakarta (Kuningan & Rasuna)');
  const [category, setCategory] = useState<NumberCategory>('GEOGRAPHIC');
  const [rangeStart, setRangeStart] = useState<string>('+622152000000');
  const [rangeEnd, setRangeEnd] = useState<string>('+622152009999');
  const [totalCapacity, setTotalCapacity] = useState<number>(10000);
  const [regulatoryAuthorityRef, setRegulatoryAuthorityRef] = useState<string>('KOMINFO/ALOK-NOMOR/2026/088');
  const [operatorOrNode, setOperatorOrNode] = useState<string>('Netstream Jakarta SBC-02');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix.trim() || !regionName.trim()) {
      setError('Prefix and Region Name are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        prefix: prefix.trim(),
        blockPattern: blockPattern.trim(),
        countryCode: countryCode.trim(),
        areaCode: areaCode.trim() || undefined,
        regionName: regionName.trim(),
        category,
        rangeStart: rangeStart.trim(),
        rangeEnd: rangeEnd.trim(),
        totalCapacity: Number(totalCapacity) || 10000,
        regulatoryAuthorityRef: regulatoryAuthorityRef.trim(),
        operatorOrNode: operatorOrNode.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create numbering block.');
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
              <h3 className="text-base font-bold text-white">Register Telephone Number Block</h3>
              <p className="text-xs text-slate-400">Allocate national E.164, Geographic, Mobile MSISDN or PBX block</p>
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
              <label className="block text-slate-400 font-semibold mb-1">Number Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as NumberCategory)}
                className="glass-input w-full h-9 px-2.5 rounded-lg bg-slate-950 border-slate-700 text-slate-200"
              >
                <option value="GEOGRAPHIC">GEOGRAPHIC (PSTN / Fixed)</option>
                <option value="MOBILE_MSISDN">MOBILE_MSISDN (Cellular 4G/5G)</option>
                <option value="TOLL_FREE_0800">TOLL_FREE_0800 (Freephone)</option>
                <option value="PREMIUM_0809">PREMIUM_0809 (Premium Rate)</option>
                <option value="SHORT_CODE_1500">SHORT_CODE_1500 (Call Center)</option>
                <option value="PBX_EXTENSION">PBX_EXTENSION (Private PBX)</option>
                <option value="NON_GEOGRAPHIC">NON_GEOGRAPHIC (VoIP Global)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Country Code</label>
              <input
                type="text"
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                placeholder="e.g. +62 or +1"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Prefix / Area Code</label>
              <input
                type="text"
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                placeholder="e.g. +62 21 5200"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Display Pattern</label>
              <input
                type="text"
                value={blockPattern}
                onChange={e => setBlockPattern(e.target.value)}
                placeholder="e.g. +62 21 5200 xxxx"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Geographic Region / City Service Area *</label>
            <input
              type="text"
              value={regionName}
              onChange={e => setRegionName(e.target.value)}
              placeholder="e.g. DKI Jakarta (Kuningan & Rasuna)"
              className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Range Start (E.164)</label>
              <input
                type="text"
                value={rangeStart}
                onChange={e => setRangeStart(e.target.value)}
                placeholder="e.g. +622152000000"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Range End (E.164)</label>
              <input
                type="text"
                value={rangeEnd}
                onChange={e => setRangeEnd(e.target.value)}
                placeholder="e.g. +622152009999"
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Total Number Capacity</label>
              <input
                type="number"
                value={totalCapacity}
                onChange={e => setTotalCapacity(Number(e.target.value))}
                className="glass-input w-full h-9 px-3 rounded-lg font-mono text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Host Softswitch / SBC Node</label>
              <input
                type="text"
                value={operatorOrNode}
                onChange={e => setOperatorOrNode(e.target.value)}
                placeholder="e.g. Netstream Jakarta SBC-02"
                className="glass-input w-full h-9 px-3 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Regulatory Authority Reference (Kominfo/BRTI)</label>
            <input
              type="text"
              value={regulatoryAuthorityRef}
              onChange={e => setRegulatoryAuthorityRef(e.target.value)}
              placeholder="e.g. KOMINFO/ALOK-NOMOR/2026/088"
              className="glass-input w-full h-9 px-3 rounded-lg font-mono text-cyan-300 text-xs"
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
              {loading ? 'Creating...' : 'Register Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
