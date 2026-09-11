import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { OpticalCable, CableStrand, CableType } from '../../types/inventory';
import { RegisterCableModal } from './RegisterCableModal';
import { CableStrandMatrixModal } from './CableStrandMatrixModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { useAuth } from '../../auth/AuthContext';
import { 
  Cable, 
  Plus, 
  Search, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  MapPin, 
  Gauge, 
  Radio, 
  Zap, 
  Trash2,
  ExternalLink,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { EditCableModal } from './EditCableModal';

export const OpticalCablesView: React.FC = () => {
  const { hasAnyRole } = useAuth();
  const [cables, setCables] = useState<OpticalCable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [inspectingCable, setInspectingCable] = useState<OpticalCable | null>(null);
  const [editingCable, setEditingCable] = useState<OpticalCable | null>(null);
  const [deletingCable, setDeletingCable] = useState<OpticalCable | null>(null);

  const fetchCables = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getCables();
      setCables(data);
    } catch (err) {
      console.error('Failed to load optical cables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCables();
  }, []);

  const handleRegisterSuccess = (newCable: OpticalCable) => {
    setCables(prev => [newCable, ...prev.filter(c => c.id !== newCable.id)]);
    setIsRegisterOpen(false);
  };

  const handleStrandUpdated = (updatedStrand: CableStrand) => {
    if (inspectingCable && inspectingCable.strands) {
      const updatedStrands = inspectingCable.strands.map(s => s.id === updatedStrand.id ? updatedStrand : s);
      const lit = updatedStrands.filter(s => s.status === 'LIT_IN_USE').length;
      const updatedCable: OpticalCable = {
        ...inspectingCable,
        strands: updatedStrands,
        litCores: lit,
        darkCores: inspectingCable.totalCores - lit,
        utilizationPct: Number(((lit / inspectingCable.totalCores) * 100).toFixed(1))
      };
      setInspectingCable(updatedCable);
      setCables(prev => prev.map(c => c.id === updatedCable.id ? updatedCable : c));
    }
  };

  // KPIs
  const totalCables = cables.length;
  const totalKm = cables.reduce((acc, c) => acc + ((c.lengthMeters || 0) / 1000.0), 0);
  const totalCores = cables.reduce((acc, c) => acc + (c.totalCores || 0), 0);
  const totalLit = cables.reduce((acc, c) => acc + (c.litCores || 0), 0);
  const totalDark = totalCores - totalLit;
  const overallUtilPct = totalCores > 0 ? ((totalLit / totalCores) * 100).toFixed(1) : '0.0';

  const filteredCables = cables.filter(c => {
    const matchesSearch = 
      c.cableCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.originDeviceHostname && c.originDeviceHostname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.terminationDeviceHostname && c.terminationDeviceHostname.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || c.cableType === selectedType;
    return matchesSearch && matchesType;
  });

  // Reset page when filter or search query changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedType]);

  const totalElements = filteredCables.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedCables = filteredCables.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(0);
  };

  const getCableTypeBadge = (type: CableType) => {
    switch (type) {
      case 'BACKBONE_TRUNK':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'FEEDER_CABLE':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'DISTRIBUTION_CABLE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'DROP_CABLE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30">
              <Cable className="w-5 h-5" />
            </div>
            <span>Optical Cables & Core Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Outside Plant (OSP) & Inside Plant (ISP) fiber infrastructure, feeder trunks, distribution lines, and TIA-598 color strand matrix.
          </p>
        </div>

        {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Optical Cable</span>
          </button>
        )}
      </div>

      {/* 5-Metric Executive KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Cable className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Optical Cables
            </span>
            <span className="text-lg font-black text-white font-mono">{totalCables} Spans</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Total Route Distance
            </span>
            <span className="text-lg font-black text-cyan-300 font-mono">{totalKm.toFixed(1)} km</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Glass Cores Tracked
            </span>
            <span className="text-lg font-black text-purple-300 font-mono">{totalCores} Cores</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Dark Fiber Available
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">{totalDark} Cores</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Strand Utilization
            </span>
            <span className="text-lg font-black text-amber-300 font-mono">{overallUtilPct}% ({totalLit} Lit)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Cables' },
            { id: 'BACKBONE_TRUNK', label: 'Backbone Trunks' },
            { id: 'FEEDER_CABLE', label: 'Feeder Cables' },
            { id: 'DISTRIBUTION_CABLE', label: 'Distribution Lines' },
            { id: 'DROP_CABLE', label: 'FTTH Drops' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                selectedType === tab.id
                  ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500 font-bold shadow-sm shadow-cyan-600/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, endpoint, spec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full h-9 pl-9 pr-3 text-xs rounded-xl text-slate-200"
          />
        </div>
      </div>

      {/* Optical Cables Catalog Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Loading optical cable inventory & strand matrix...</span>
          </div>
        ) : filteredCables.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Cable className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No Optical Cables Found</p>
            <p className="text-xs">Try adjusting your filters or click "Register Optical Cable" to create one.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Cable Code & Name</th>
                  <th className="py-3 px-4">Classification & Spec</th>
                  <th className="py-3 px-4">A-End Origin &rarr; Z-End Destination</th>
                  <th className="py-3 px-4">Length</th>
                  <th className="py-3 px-4">Core Utilization</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedCables.map(cable => {
                  const km = ((cable.lengthMeters || 0) / 1000.0).toFixed(2);
                  return (
                    <tr key={cable.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:border-cyan-400 transition-colors">
                            <Cable className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs block font-mono">{cable.cableCode}</span>
                              {cable.status && (
                                <span className={`px-1.5 py-0.5 text-[9px] font-semibold tracking-wider rounded border ${
                                  cable.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                  cable.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                  cable.status === 'PLANNED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                  'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                }`}>
                                  {cable.status}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block font-sans truncate max-w-[220px]">
                              {cable.cableName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getCableTypeBadge(cable.cableType)}`}>
                            {cable.cableType.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {cable.fiberGrade.replace('SINGLE_MODE_', '')} • {cable.installationType}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <span className="text-blue-300 font-bold">{cable.originDeviceHostname || 'Origin'}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="text-purple-300 font-bold">{cable.terminationDeviceHostname || 'Termination'}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[240px]">
                            {cable.originLocationName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-white font-bold">{km} km</span>
                        <span className="text-[10px] text-slate-500 block">({cable.lengthMeters} m)</span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-cyan-300 font-bold">{cable.litCores} Lit / {cable.totalCores} Total</span>
                            <span className="text-slate-400 font-bold">{cable.utilizationPct}%</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(cable.utilizationPct, 4))}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-emerald-400 block">
                            {cable.darkCores} Dark Cores Available
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCable(cable)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 text-xs font-semibold transition-all shadow-sm"
                            title="Edit Cable Properties & Spatial Route"
                          >
                            <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectingCable(cable)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg border border-cyan-500/40 text-xs font-semibold transition-all shadow-sm"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Inspect Cores ({cable.totalCores}C)</span>
                          </button>

                          {hasAnyRole(['inventory-admin']) && (
                            <button
                              type="button"
                              onClick={() => setDeletingCable(cable)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Cable"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-slate-900/90 border-t border-slate-800/80">
            {/* Left: Records Per Page & Current Range */}
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
                    of <strong className="text-cyan-400">{totalElements}</strong> total cables
                  </span>
                ) : (
                  <span>No cables found</span>
                )}
              </div>
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1.5 font-mono">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0 || loading}
                title="First Page"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                title="Previous Page"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dynamic Page Window */}
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
                              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold border border-cyan-400/30'
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                title="Next Page"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1 || loading}
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

      {/* Register Cable Modal */}
      {isRegisterOpen && (
        <RegisterCableModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {/* Cable Strand Matrix Inspector Modal */}
      {inspectingCable && (
        <CableStrandMatrixModal
          isOpen={!!inspectingCable}
          cable={inspectingCable}
          onClose={() => setInspectingCable(null)}
          onStrandUpdated={handleStrandUpdated}
        />
      )}

      {/* Edit Cable Properties & Geometry Modal */}
      {editingCable && (
        <EditCableModal
          isOpen={!!editingCable}
          cable={editingCable}
          onClose={() => setEditingCable(null)}
          onSuccess={(updated) => {
            setCables(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
            setEditingCable(null);
          }}
        />
      )}

      {/* Confirm Delete Cable Modal */}
      {deletingCable && (
        <ConfirmDeleteModal
          isOpen={!!deletingCable}
          itemType="CABLE"
          itemId={deletingCable.id}
          itemCode={deletingCable.cableCode}
          itemName={deletingCable.cableName}
          onClose={() => setDeletingCable(null)}
          onConfirm={async () => {
            await inventoryApi.deleteCable(deletingCable.id);
            setDeletingCable(null);
            fetchCables();
          }}
        />
      )}
    </div>
  );
};
