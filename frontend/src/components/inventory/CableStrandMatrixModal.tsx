import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { CableStrand, OpticalCable, StrandStatus } from '../../types/inventory';
import { 
  Cable, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Loader2, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Radio,
  Sparkles
} from 'lucide-react';

interface CableStrandMatrixModalProps {
  isOpen: boolean;
  cable: OpticalCable | null;
  onClose: () => void;
  onStrandUpdated?: (updatedStrand: CableStrand) => void;
}

export const CableStrandMatrixModal: React.FC<CableStrandMatrixModalProps> = ({
  isOpen,
  cable,
  onClose,
  onStrandUpdated,
}) => {
  const [selectedStrand, setSelectedStrand] = useState<CableStrand | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'LIT_IN_USE' | 'DAMAGED_HIGH_LOSS'>('ALL');

  if (!cable) return null;

  const strands = cable.strands || [];
  const litCount = strands.filter(s => s.status === 'LIT_IN_USE').length;
  const darkCount = strands.filter(s => s.status === 'AVAILABLE').length;
  const damagedCount = strands.filter(s => s.status === 'DAMAGED_HIGH_LOSS').length;

  const filteredStrands = strands.filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  // Group strands by 12-core buffer tubes
  const tubesMap = filteredStrands.reduce((acc, strand) => {
    const tube = strand.tubeNumber || Math.floor((strand.coreNumber - 1) / 12) + 1;
    if (!acc[tube]) acc[tube] = [];
    acc[tube].push(strand);
    return acc;
  }, {} as Record<number, CableStrand[]>);

  const tubeKeys = Object.keys(tubesMap).map(Number).sort((a, b) => a - b);

  const handleToggleStatus = async (strand: CableStrand, newStatus: StrandStatus) => {
    setIsUpdating(true);
    try {
      const updated = await inventoryApi.updateStrand(strand.id, {
        status: newStatus,
        remarks: newStatus === 'AVAILABLE' ? 'Dark Fiber Core (Available)' : strand.remarks
      });
      setSelectedStrand(updated);
      if (onStrandUpdated) onStrandUpdated(updated);
    } catch (err) {
      console.error('Failed to update strand:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Strand Matrix: ${cable.cableCode}`}
      subtitle={`${cable.cableName} • ${cable.totalCores} Total Cores (${(cable.lengthMeters / 1000).toFixed(2)} km ${cable.fiberGrade})`}
      icon={<Cable className="w-5 h-5 text-cyan-400" />}
      maxWidth="full"
    >
      <div className="space-y-4">
        {/* Capacity & Health Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center font-mono">
          <div className="border-r border-slate-800/80 pr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">Total Capacity</span>
            <span className="text-sm font-extrabold text-white">{cable.totalCores} Cores</span>
          </div>

          <div className="border-r border-slate-800/80 pr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">Lit Cores (In Circuit)</span>
            <span className="text-sm font-extrabold text-cyan-400">{litCount} Lit ({cable.utilizationPct}%)</span>
          </div>

          <div className="border-r border-slate-800/80 pr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">Dark Fiber (Available)</span>
            <span className="text-sm font-extrabold text-emerald-400">{darkCount} Available</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">Faulty / Damaged</span>
            <span className={`text-sm font-extrabold ${damagedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {damagedCount} Cores
            </span>
          </div>
        </div>

        {/* Filter Pills & Matrix Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Cores ({cable.totalCores})
            </button>
            <button
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Dark Fiber ({darkCount})
            </button>
            <button
              onClick={() => setStatusFilter('LIT_IN_USE')}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                statusFilter === 'LIT_IN_USE'
                  ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Lit / In-Use ({litCount})
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Dark Fiber
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span> Lit Circuit
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Body: Core Grid on Left, Selected Strand Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Area: Visual 12-Core Buffer Tubes */}
          <div className="lg:col-span-8 space-y-4 max-h-[56vh] overflow-y-auto pr-1">
            {tubeKeys.map(tubeNum => {
              const tubeStrands = tubesMap[tubeNum] || [];
              return (
                <div key={tubeNum} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Buffer Tube #{tubeNum} (Cores {(tubeNum - 1) * 12 + 1} - {Math.min(cable.totalCores, tubeNum * 12)})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {tubeStrands.filter(s => s.status === 'LIT_IN_USE').length} Lit • {tubeStrands.filter(s => s.status === 'AVAILABLE').length} Dark
                    </span>
                  </div>

                  {/* 12-Core Strand Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {tubeStrands.map(strand => {
                      const isSelected = selectedStrand?.id === strand.id;
                      const isLit = strand.status === 'LIT_IN_USE';
                      const isFaulty = strand.status === 'DAMAGED_HIGH_LOSS';

                      return (
                        <button
                          key={strand.id}
                          type="button"
                          onClick={() => setSelectedStrand(strand)}
                          className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden group ${
                            isSelected
                              ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400/40 shadow-md shadow-cyan-500/20'
                              : isLit
                              ? 'bg-cyan-950/30 border-cyan-500/40 hover:border-cyan-400'
                              : isFaulty
                              ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Colored Fiber Strand Indicator */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold font-mono text-white">#{strand.coreNumber}</span>
                            <div className="flex items-center gap-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: strand.colorHex }}
                                title={`${strand.colorName} Core`}
                              />
                            </div>
                          </div>

                          <div className="text-[10px] font-mono truncate text-slate-300">
                            {strand.colorName}
                          </div>

                          <div className="mt-1">
                            {isLit ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold block truncate">
                                {strand.allocatedServiceCode || 'LIT'}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 block truncate">
                                DARK FIBER
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Area: Selected Strand Detail Inspector */}
          <div className="lg:col-span-4 space-y-3">
            {selectedStrand ? (
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/40 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: selectedStrand.colorHex }}
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-white font-mono">
                        Core #{selectedStrand.coreNumber} ({selectedStrand.colorName})
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Tube #{selectedStrand.tubeNumber} • {cable.cableCode}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    selectedStrand.status === 'LIT_IN_USE'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {selectedStrand.status}
                  </span>
                </div>

                {/* Circuit Allocation Card */}
                {selectedStrand.allocatedServiceCode ? (
                  <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 space-y-1.5">
                    <span className="text-[10px] text-cyan-400 uppercase font-mono font-semibold block">
                      Active Customer Circuit
                    </span>
                    <p className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{selectedStrand.allocatedServiceCode}</span>
                    </p>
                    {selectedStrand.allocatedCustomerName && (
                      <p className="text-[11px] text-slate-300">{selectedStrand.allocatedCustomerName}</p>
                    )}
                    <span className="text-[10px] text-cyan-300 font-mono block">
                      Assigned Hop Sequence: Hop #{selectedStrand.allocatedServiceHop || 1}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Dark Fiber Strand. Available for new circuit provisioning.</span>
                  </div>
                )}

                {/* Technical OTDR Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Measured Loss</span>
                    <span className="font-bold text-white">{selectedStrand.measuredLossDb || ((cable.attenuationDbPerKm || 0.35) * (cable.lengthMeters || 0) / 1000).toFixed(2)} dB</span>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Fiber Spec</span>
                    <span className="font-bold text-cyan-300">{cable.fiberGrade.replace('SINGLE_MODE_', '')}</span>
                  </div>
                </div>

                {/* Remarks & Notes */}
                <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Remarks / Label</span>
                  <span>{selectedStrand.remarks || 'Standard Optical Pass-Through'}</span>
                </div>

                {/* Quick Status Toggles */}
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  {selectedStrand.status === 'LIT_IN_USE' ? (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleToggleStatus(selectedStrand, 'AVAILABLE')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-all text-center"
                    >
                      Release to Dark Fiber
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleToggleStatus(selectedStrand, 'LIT_IN_USE')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-mono border border-cyan-500 transition-all text-center"
                    >
                      Mark as Lit
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-slate-400 space-y-2">
                <Radio className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs font-mono">Click any optical core chip on the left to inspect strand details & circuit mappings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
