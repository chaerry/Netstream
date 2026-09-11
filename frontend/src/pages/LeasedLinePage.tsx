import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LeasedLineCircuit,
  LeasedLineCarrier,
  LeasedLineContract,
  LeasedLineInvoice,
  CapacityAuditReport,
  SlaIncident,
} from '../types/leasedLine';
import { leasedLineApi } from '../api/leasedLineApi';
import { LeasedLineRegisterView } from '../components/leasedline/LeasedLineRegisterView';
import { LeasedLineResourceMapView } from '../components/leasedline/LeasedLineResourceMapView';
import { LeasedLineContractsView } from '../components/leasedline/LeasedLineContractsView';
import { LeasedLineInvoiceAuditView } from '../components/leasedline/LeasedLineInvoiceAuditView';
import { LeasedLineCapacityAuditView } from '../components/leasedline/LeasedLineCapacityAuditView';
import { LeasedLineSlaView } from '../components/leasedline/LeasedLineSlaView';
import { CreateLeasedLineModal } from '../components/leasedline/CreateLeasedLineModal';
import { EditLeasedLineModal } from '../components/leasedline/EditLeasedLineModal';
import { InitiateDecomModal } from '../components/leasedline/InitiateDecomModal';
import { LogSlaIncidentModal } from '../components/leasedline/LogSlaIncidentModal';
import {
  GitBranch,
  Layers,
  FileText,
  FileSpreadsheet,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const LeasedLinePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'circuits';

  // Core Data States
  const [circuits, setCircuits] = useState<LeasedLineCircuit[]>([]);
  const [carriers, setCarriers] = useState<LeasedLineCarrier[]>([]);
  const [contracts, setContracts] = useState<LeasedLineContract[]>([]);
  const [invoices, setInvoices] = useState<LeasedLineInvoice[]>([]);
  const [capacityAudit, setCapacityAudit] = useState<CapacityAuditReport | null>(null);
  const [slaIncidents, setSlaIncidents] = useState<SlaIncident[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCircuitForTopology, setSelectedCircuitForTopology] = useState<LeasedLineCircuit | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCircuit, setEditingCircuit] = useState<LeasedLineCircuit | null>(null);
  const [isDecomModalOpen, setIsDecomModalOpen] = useState(false);
  const [decomCircuit, setDecomCircuit] = useState<{ id: string; circuitId: string; circuitName: string; mrc: number } | null>(null);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [cktData, carData, ctrData, invData, capData, slaData] = await Promise.all([
        leasedLineApi.getCircuits({ size: 100 }),
        leasedLineApi.getCarriers(),
        leasedLineApi.getContracts(),
        leasedLineApi.getInvoiceAudits(),
        leasedLineApi.getCapacityAudit(),
        leasedLineApi.getSlaIncidents(),
      ]);

      setCircuits(cktData.items);
      setCarriers(carData);
      setContracts(ctrData);
      setInvoices(invData);
      setCapacityAudit(capData);
      setSlaIncidents(slaData);

      if (!selectedCircuitForTopology && cktData.items.length > 0) {
        setSelectedCircuitForTopology(cktData.items[0]);
      }
    } catch (err) {
      console.error('Error loading Leased Line data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  const handleOpenEdit = (circuit: LeasedLineCircuit) => {
    setEditingCircuit(circuit);
    setIsEditModalOpen(true);
  };

  const handleOpenDecom = (circuit: { id: string; circuitId: string; circuitName: string; mrc: number }) => {
    setDecomCircuit(circuit);
    setIsDecomModalOpen(true);
  };

  const handleSelectTopology = (circuit: LeasedLineCircuit) => {
    setSelectedCircuitForTopology(circuit);
    handleTabChange('topology');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Leased Line Management
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  VC4 S2C MODEL • USD ($)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Carrier Contracts, Inbound/Outbound Circuits, Automated Invoice Auditing & OpEx Reduction Engine
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Provision Leased Line
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => handleTabChange('circuits')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            currentTab === 'circuits'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Circuit Register (360°)
        </button>

        <button
          onClick={() => handleTabChange('topology')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            currentTab === 'topology'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          Inventory Resource Mapping
        </button>

        <button
          onClick={() => handleTabChange('contracts')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            currentTab === 'contracts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <FileText className="w-4 h-4" />
          Carriers & Contracts
        </button>

        <button
          onClick={() => handleTabChange('invoices')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            currentTab === 'invoices'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Invoice Audit (3-Way)
        </button>

        <button
          onClick={() => handleTabChange('capacity')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            currentTab === 'capacity'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-rose-400" />
          Capacity Audit (OpEx Saver)
          {capacityAudit && capacityAudit.dormantCircuitCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('sla')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            currentTab === 'sla'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          SLA & Penalties
        </button>
      </div>

      {/* Tab Content Display */}
      {currentTab === 'circuits' && (
        <LeasedLineRegisterView
          circuits={circuits}
          isLoading={isLoading}
          onRefresh={loadAllData}
          onSelectCircuitForTopology={handleSelectTopology}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenEditModal={handleOpenEdit}
          onOpenDecomModal={handleOpenDecom}
        />
      )}

      {currentTab === 'topology' && (
        <LeasedLineResourceMapView
          circuits={circuits}
          selectedCircuit={selectedCircuitForTopology}
          onSelectCircuit={(c) => setSelectedCircuitForTopology(c)}
        />
      )}

      {currentTab === 'contracts' && (
        <LeasedLineContractsView carriers={carriers} contracts={contracts} />
      )}

      {currentTab === 'invoices' && (
        <LeasedLineInvoiceAuditView invoices={invoices} onRefresh={loadAllData} />
      )}

      {currentTab === 'capacity' && capacityAudit && (
        <LeasedLineCapacityAuditView
          auditReport={capacityAudit}
          onOpenDecomModal={handleOpenDecom}
        />
      )}

      {currentTab === 'sla' && (
        <LeasedLineSlaView
          incidents={slaIncidents}
          onOpenLogIncidentModal={() => setIsSlaModalOpen(true)}
        />
      )}

      {/* Modals */}
      <CreateLeasedLineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        carriers={carriers}
        onSuccess={loadAllData}
      />

      <EditLeasedLineModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        circuit={editingCircuit}
        onSuccess={loadAllData}
      />

      <InitiateDecomModal
        isOpen={isDecomModalOpen}
        onClose={() => setIsDecomModalOpen(false)}
        circuit={decomCircuit}
        onSuccess={loadAllData}
      />

      <LogSlaIncidentModal
        isOpen={isSlaModalOpen}
        onClose={() => setIsSlaModalOpen(false)}
        circuits={circuits}
        onSuccess={loadAllData}
      />
    </div>
  );
};
export default LeasedLinePage;
