import React, { useState, useEffect } from 'react';
import { TelephoneNumber, NumberBlock, NumberStatus, NumberCategory } from '../../types/telephony';
import { 
  Phone, 
  Search, 
  Plus, 
  Trash2, 
  Building2, 
  MapPin, 
  User, 
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface Props {
  numbers: TelephoneNumber[];
  blocks: NumberBlock[];
  selectedBlockFilter?: string;
  onOpenAllocate: () => void;
  onReleaseNumber: (id: string) => Promise<void>;
}

export const TelephoneCatalogView: React.FC<Props> = ({
  numbers,
  blocks,
  selectedBlockFilter = 'ALL',
  onOpenAllocate,
  onReleaseNumber
}) => {
  const [search, setSearch] = useState<string>('');
  const [blockFilter, setBlockFilter] = useState<string>(selectedBlockFilter);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    setBlockFilter(selectedBlockFilter);
  }, [selectedBlockFilter]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, blockFilter, statusFilter]);

  const filteredNumbers = numbers.filter(n => {
    const matchesSearch = 
      n.e164Format.toLowerCase().includes(search.toLowerCase()) ||
      n.nationalFormat.toLowerCase().includes(search.toLowerCase()) ||
      (n.customerName && n.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (n.customerAccount && n.customerAccount.toLowerCase().includes(search.toLowerCase())) ||
      (n.serviceCode && n.serviceCode.toLowerCase().includes(search.toLowerCase())) ||
      (n.assignedNode && n.assignedNode.toLowerCase().includes(search.toLowerCase()));

    const matchesBlock = blockFilter === 'ALL' || n.blockId === blockFilter;
    const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;

    return matchesSearch && matchesBlock && matchesStatus;
  });

  const totalElements = filteredNumbers.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedNumbers = filteredNumbers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(0);
  };

  const getStatusBadge = (status: NumberStatus) => {
    switch (status) {
      case 'ALLOCATED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'PORTED_IN':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'PORTED_OUT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'RESERVED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'QUARANTINE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'AVAILABLE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Block Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-500">Block:</span>
            <select
              value={blockFilter}
              onChange={e => setBlockFilter(e.target.value)}
              className="glass-input h-8 px-2.5 rounded-xl bg-slate-950 text-xs border-slate-700 text-slate-200 cursor-pointer max-w-[200px]"
            >
              <option value="ALL">All Number Blocks</option>
              {blocks.map(b => (
                <option key={b.id} value={b.id}>{b.prefix} ({b.regionName})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="glass-input h-8 px-2.5 rounded-xl bg-slate-950 text-xs border-slate-700 text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ALLOCATED">ALLOCATED</option>
              <option value="PORTED_IN">PORTED_IN</option>
              <option value="PORTED_OUT">PORTED_OUT</option>
              <option value="RESERVED">RESERVED</option>
              <option value="QUARANTINE">QUARANTINE</option>
              <option value="AVAILABLE">AVAILABLE</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone number, subscriber, service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input w-full h-8 pl-9 pr-3 text-xs rounded-xl text-slate-200"
            />
          </div>

          <button
            onClick={onOpenAllocate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Allocate Number</span>
          </button>
        </div>
      </div>

      {/* Numbers Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {filteredNumbers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Phone className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No Telephone Numbers Found</p>
            <p className="text-xs">Adjust filter criteria or click "Allocate Number" to provision one.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">E.164 Standard Number</th>
                    <th className="py-3 px-4">National Local Format</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subscriber & Account</th>
                    <th className="py-3 px-4">Service & SBC Node</th>
                    <th className="py-3 px-4">Status & Porting</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedNumbers.map(num => (
                    <tr key={num.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-mono text-sm block">{num.e164Format}</span>
                            <span className="text-[10px] text-slate-500 font-sans block">{num.locationName || 'National'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-white font-mono font-semibold block">{num.nationalFormat}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {num.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-xs text-slate-200 font-sans block">
                            {num.customerName || <span className="text-slate-600 font-normal">Unassigned</span>}
                          </span>
                          {num.customerAccount && (
                            <span className="text-[10px] text-slate-400 block font-mono">{num.customerAccount}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {num.serviceCode ? (
                            <span className="text-xs text-purple-300 font-bold block">{num.serviceCode}</span>
                          ) : (
                            <span className="text-slate-600 text-[11px] block">—</span>
                          )}
                          <span className="text-[10px] text-slate-400 block truncate max-w-[170px]">{num.assignedNode}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadge(num.status)}`}>
                            {num.status}
                          </span>
                          {num.portingDirection && (
                            <span className="text-[10px] text-cyan-400 block font-mono flex items-center gap-1">
                              <ArrowLeftRight className="w-3 h-3" />
                              {num.portingDirection === 'PORTED_IN' ? `From ${num.donorOperator}` : `To ${num.recipientOperator}`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {num.status === 'ALLOCATED' && (
                          <button
                            type="button"
                            onClick={() => onReleaseNumber(num.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Release into 60-day Quarantine"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-slate-900/90 border-t border-slate-800/80">
              <div className="flex items-center gap-4 text-xs text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="glass-input px-2.5 py-1 text-xs rounded-lg border-slate-700 bg-slate-950 text-slate-200 cursor-pointer"
                  >
                    <option value={5}>5 rows</option>
                    <option value={10}>10 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                  </select>
                </div>

                <div className="text-slate-400">
                  {totalElements > 0 ? (
                    <span>
                      Showing <strong className="text-white">{currentPage * pageSize + 1}</strong> to{' '}
                      <strong className="text-white">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </strong>{' '}
                      of <strong className="text-rose-400">{totalElements}</strong> total numbers
                    </span>
                  ) : (
                    <span>No numbers found</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  title="First Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  title="Previous Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      if (p === 0 || p === totalPages - 1) return true;
                      return Math.abs(p - currentPage) <= 1;
                    })
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev !== undefined && pageNum - prev > 1;

                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && (
                            <span className="px-1 text-slate-600 select-none">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all ${
                              currentPage === pageNum
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold border border-rose-400/30'
                                : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  title="Next Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  title="Last Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
