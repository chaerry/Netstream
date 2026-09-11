import React, { useState } from 'react';
import { PortingRecord, PortingStatus } from '../../types/telephony';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ShieldCheck,
  Building2
} from 'lucide-react';

interface Props {
  portingRecords: PortingRecord[];
  onOpenCreatePorting: () => void;
}

export const NumberPortingView: React.FC<Props> = ({ portingRecords, onOpenCreatePorting }) => {
  const [search, setSearch] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');

  const filtered = portingRecords.filter(p => {
    const matchesSearch = 
      p.telephoneNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.portingReference.toLowerCase().includes(search.toLowerCase()) ||
      p.donorOperator.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientOperator.toLowerCase().includes(search.toLowerCase()) ||
      p.requesterName.toLowerCase().includes(search.toLowerCase());

    const matchesDirection = directionFilter === 'ALL' || p.direction === directionFilter;

    return matchesSearch && matchesDirection;
  });

  const getStatusBadge = (status: PortingStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'APPROVED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Mobile & Fixed Number Portability (MNP / FNP) Central Registry
            </h3>
            <p className="text-xs text-slate-400">
              Inter-operator number porting transactions, donor authentication acknowledgements, and clearinghouse audit trails
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, number, operator..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input w-full h-8 pl-9 pr-3 text-xs rounded-xl text-slate-200"
            />
          </div>

          <button
            onClick={onOpenCreatePorting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Porting Order</span>
          </button>
        </div>
      </div>

      {/* Porting Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Porting Reference</th>
                <th className="py-3 px-4">Telephone Number</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Donor &rarr; Recipient Telco</th>
                <th className="py-3 px-4">Submission & Cutover Date</th>
                <th className="py-3 px-4">Clearinghouse Approval</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rec.portingReference}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    {rec.telephoneNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                      rec.direction === 'PORTED_IN' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {rec.direction === 'PORTED_IN' ? 'Port-In (Inward)' : 'Port-Out (Outward)'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 font-sans">
                      <div className="flex items-center gap-1 text-slate-300 text-xs">
                        <span className="font-semibold">{rec.donorOperator}</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="font-semibold text-white">{rec.recipientOperator}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">Req: {rec.requesterName}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 font-mono text-[11px]">
                      <span className="text-slate-400 block">Req: {new Date(rec.requestDate).toLocaleDateString()}</span>
                      <span className="text-emerald-400 block font-semibold">Cutover: {rec.portingDueDate}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[11px] text-cyan-300 font-mono block">
                      {rec.regulatoryClearanceCode || 'PENDING'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono border font-bold ${getStatusBadge(rec.status)}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
