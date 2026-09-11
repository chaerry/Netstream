import React, { useState, useEffect } from 'react';
import { telephonyApi } from '../api/telephonyApi';
import { NumberBlock, TelephoneNumber, PortingRecord, CreateBlockRequest, AllocateNumberRequest, CreatePortingRequest } from '../types/telephony';
import { NumberRangesView } from '../components/telephony/NumberRangesView';
import { TelephoneCatalogView } from '../components/telephony/TelephoneCatalogView';
import { NumberPortingView } from '../components/telephony/NumberPortingView';
import { ImsDiscoveryView } from '../components/telephony/ImsDiscoveryView';
import { RegulatoryComplianceView } from '../components/telephony/RegulatoryComplianceView';
import { CreateBlockModal } from '../components/telephony/CreateBlockModal';
import { AllocateNumberModal } from '../components/telephony/AllocateNumberModal';
import { CreatePortingModal } from '../components/telephony/CreatePortingModal';
import { useDialog } from '../components/common/DialogContext';
import { 
  Phone, 
  Layers, 
  Activity, 
  ArrowLeftRight, 
  Radio, 
  Building2, 
  Plus, 
  Loader2,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export const TelephoneNumberPage: React.FC = () => {
  const [blocks, setBlocks] = useState<NumberBlock[]>([]);
  const [numbers, setNumbers] = useState<TelephoneNumber[]>([]);
  const [portingRecords, setPortingRecords] = useState<PortingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ranges' | 'catalog' | 'porting' | 'discovery' | 'compliance'>('ranges');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('ALL');

  // Modals
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState<boolean>(false);
  const [isAllocateNumberOpen, setIsAllocateNumberOpen] = useState<boolean>(false);
  const [isCreatePortingOpen, setIsCreatePortingOpen] = useState<boolean>(false);

  const { confirmDelete, showAlert } = useDialog();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [b, n, p] = await Promise.all([
        telephonyApi.getNumberBlocks(),
        telephonyApi.getNumbers(),
        telephonyApi.getPortingRecords(),
      ]);
      setBlocks(b);
      setNumbers(n);
      setPortingRecords(p);
    } catch (err) {
      console.error('Failed to load telephone datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBlock = async (req: CreateBlockRequest) => {
    const created = await telephonyApi.createNumberBlock(req);
    setBlocks(prev => [created, ...prev]);
    return created;
  };

  const handleAllocateNumber = async (req: AllocateNumberRequest) => {
    const created = await telephonyApi.allocateNumber(req);
    setNumbers(prev => [created, ...prev]);
    const updatedBlocks = await telephonyApi.getNumberBlocks();
    setBlocks(updatedBlocks);
    return created;
  };

  const handleReleaseNumber = async (id: string) => {
    const target = numbers.find(n => n.id === id);
    const confirmed = await confirmDelete({
      title: 'Regulatory Quarantine Release',
      subtitle: 'E.164 Number Decommissioning',
      protocolCode: 'TEL // REGULATORY_QUARANTINE_L2',
      itemBadge: target?.category || 'E.164_DID',
      itemCode: target?.e164Format || id,
      itemName: target?.customerName || 'Direct Inward Dial Line',
      impactMessage: 'Detaches line from customer routing and places number into mandatory 60-day regulatory cooling-off quarantine before reallocation.',
      confirmText: 'Execute Quarantine Release',
    });

    if (confirmed) {
      try {
        await telephonyApi.releaseNumber(id);
        const updatedNumbers = await telephonyApi.getNumbers();
        setNumbers(updatedNumbers);
        const updatedBlocks = await telephonyApi.getNumberBlocks();
        setBlocks(updatedBlocks);
      } catch (err: any) {
        await showAlert({
          type: 'danger',
          title: 'Quarantine Release Failed',
          message: err.message || 'Unable to release telephone number due to carrier porting lock.'
        });
      }
    }
  };

  const handleCreatePorting = async (req: CreatePortingRequest) => {
    const created = await telephonyApi.createPortingRequest(req);
    setPortingRecords(prev => [created, ...prev]);
    return created;
  };

  // KPIs
  const totalBlocks = blocks.length;
  const totalCapacity = blocks.reduce((acc, b) => acc + b.totalCapacity, 0);
  const totalAllocated = blocks.reduce((acc, b) => acc + b.allocatedCount, 0);
  const totalPorted = blocks.reduce((acc, b) => acc + b.portedCount, 0);
  const totalQuarantine = blocks.reduce((acc, b) => acc + b.quarantineCount, 0);
  const overallUtilPct = totalCapacity > 0 ? ((totalAllocated / totalCapacity) * 100).toFixed(1) : '0.0';

  const tabs = [
    { id: 'ranges', label: 'Number Ranges & Blocks', icon: <Layers className="w-4 h-4" /> },
    { id: 'catalog', label: 'Telephone Numbers Catalog', icon: <Phone className="w-4 h-4" /> },
    { id: 'porting', label: 'MNP / FNP Number Porting', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'discovery', label: 'Softswitch & IMS Discovery', icon: <Radio className="w-4 h-4" /> },
    { id: 'compliance', label: 'Regulatory & Compliance (Kominfo)', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                PROD MODULE
              </span>
              <span className="text-xs text-slate-400 font-mono">ITU-T E.164 Standard</span>
              <span className="text-xs text-cyan-400 font-mono">VC4 S2C Model</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Telephone Number Management</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              National telephone number plan inventory, Mobile & Fixed Number Portability (MNP/FNP), live IMS/SBC SIP discovery, and Kominfo/BRTI compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAllocateNumberOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Allocate Number</span>
            </button>
            <button
              onClick={() => setIsCreateBlockOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Number Block</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-600/30 font-extrabold'
                  : 'glass-card text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5-Metric Executive KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Number Blocks
            </span>
            <span className="text-lg font-black text-white font-mono">{totalBlocks} Ranges</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Total E.164 Capacity
            </span>
            <span className="text-lg font-black text-cyan-300 font-mono">
              {totalCapacity > 1000 ? `${(totalCapacity / 1000).toFixed(0)}k` : totalCapacity} Lines
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Active Utilization
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">{overallUtilPct}%</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Ported (MNP/FNP)
            </span>
            <span className="text-lg font-black text-purple-300 font-mono">{totalPorted} Lines</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Quarantine Pool
            </span>
            <span className="text-lg font-black text-amber-300 font-mono">{totalQuarantine} Aging</span>
          </div>
        </div>
      </div>

      {/* Main View Tab Body */}
      {loading ? (
        <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          <span className="text-xs font-mono">Loading National Telephone Number Plan, MNP registries & SBC nodes...</span>
        </div>
      ) : (
        <>
          {activeTab === 'ranges' && (
            <NumberRangesView
              blocks={blocks}
              onOpenCreate={() => setIsCreateBlockOpen(true)}
              onSelectBlockForCatalog={(blkId) => {
                setSelectedBlockFilter(blkId);
                setActiveTab('catalog');
              }}
            />
          )}

          {activeTab === 'catalog' && (
            <TelephoneCatalogView
              numbers={numbers}
              blocks={blocks}
              selectedBlockFilter={selectedBlockFilter}
              onOpenAllocate={() => setIsAllocateNumberOpen(true)}
              onReleaseNumber={handleReleaseNumber}
            />
          )}

          {activeTab === 'porting' && (
            <NumberPortingView
              portingRecords={portingRecords}
              onOpenCreatePorting={() => setIsCreatePortingOpen(true)}
            />
          )}

          {activeTab === 'discovery' && (
            <ImsDiscoveryView />
          )}

          {activeTab === 'compliance' && (
            <RegulatoryComplianceView
              blocks={blocks}
              numbers={numbers}
            />
          )}
        </>
      )}

      {/* Modals */}
      <CreateBlockModal
        isOpen={isCreateBlockOpen}
        onClose={() => setIsCreateBlockOpen(false)}
        onSubmit={handleCreateBlock}
      />

      <AllocateNumberModal
        isOpen={isAllocateNumberOpen}
        blocks={blocks}
        onClose={() => setIsAllocateNumberOpen(false)}
        onSubmit={handleAllocateNumber}
      />

      <CreatePortingModal
        isOpen={isCreatePortingOpen}
        onClose={() => setIsCreatePortingOpen(false)}
        onSubmit={handleCreatePorting}
      />
    </div>
  );
};
