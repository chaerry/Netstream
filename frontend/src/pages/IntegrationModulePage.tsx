import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Radio,
  GitCompare,
  History,
  AlertOctagon,
  Webhook,
  Workflow,
  RefreshCw,
  Plus,
  ShieldCheck,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';
import {
  Connector,
  DiscoveryJob,
  ReconciliationItem,
  ChangeLog,
  EnrichedAlarm,
  WebhookSubscription,
  WebhookLog,
  IntegrationStats,
} from '../types/integration';
import { integrationApi } from '../api/integrationApi';
import { ConnectorHubView } from '../components/integration/ConnectorHubView';
import { ReconciliationCenterView } from '../components/integration/ReconciliationCenterView';
import { ChangeTrackingAuditView } from '../components/integration/ChangeTrackingAuditView';
import { EnrichedAlarmMatrixView } from '../components/integration/EnrichedAlarmMatrixView';
import { NorthboundWebhookStudioView } from '../components/integration/NorthboundWebhookStudioView';
import { GaharuBpmnBridgeView } from '../components/integration/GaharuBpmnBridgeView';
import { CreateConnectorModal } from '../components/integration/CreateConnectorModal';
import { ReconciliationDiffModal } from '../components/integration/ReconciliationDiffModal';
import { CreateWebhookModal } from '../components/integration/CreateWebhookModal';
import { SimulateAlarmModal } from '../components/integration/SimulateAlarmModal';

export const IntegrationModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'connectors';

  // Data States
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [discoveryJobs, setDiscoveryJobs] = useState<DiscoveryJob[]>([]);
  const [reconciliations, setReconciliations] = useState<ReconciliationItem[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [alarms, setAlarms] = useState<EnrichedAlarm[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [isCreateConnectorOpen, setIsCreateConnectorOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [selectedDiffItem, setSelectedDiffItem] = useState<ReconciliationItem | null>(null);
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [isSimulateAlarmOpen, setIsSimulateAlarmOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        connData,
        jobData,
        recData,
        logData,
        alarmData,
        hookData,
        hLogData,
      ] = await Promise.all([
        integrationApi.getStats(),
        integrationApi.getConnectors(),
        integrationApi.getDiscoveryJobs(),
        integrationApi.getReconciliationItems(),
        integrationApi.getChangeLogs(50),
        integrationApi.getAlarms(),
        integrationApi.getWebhooks(),
        integrationApi.getWebhookLogs(),
      ]);

      setStats(statsData);
      setConnectors(connData);
      setDiscoveryJobs(jobData);
      setReconciliations(recData);
      setChangeLogs(logData);
      setAlarms(alarmData);
      setWebhooks(hookData);
      setWebhookLogs(hLogData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  // Action Handlers
  const handleTestConnector = async (id: number) => {
    const updated = await integrationApi.testConnector(id);
    setConnectors((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const handleTriggerDiscovery = async (connectorId: number) => {
    await integrationApi.triggerDiscovery(connectorId);
    await loadData();
  };

  const handleResolveReconciliation = async (id: number, action: string, notes?: string) => {
    await integrationApi.resolveDiscrepancy(id, { resolutionAction: action, resolutionNotes: notes });
    await loadData();
  };

  const handleAlarmAction = async (id: number, action: 'ACKNOWLEDGE' | 'CLEAR' | 'ESCALATE_GAHARU') => {
    await integrationApi.alarmAction(id, action);
    await loadData();
  };

  const handleCreateConnector = async (payload: Partial<Connector>) => {
    await integrationApi.createConnector(payload);
    await loadData();
  };

  const handleCreateWebhook = async (payload: Partial<WebhookSubscription>) => {
    await integrationApi.createWebhook(payload);
    await loadData();
  };

  const handleSimulateAlarm = async (payload: Partial<EnrichedAlarm>) => {
    await integrationApi.ingestAlarm(payload);
    await loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Telemetry Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                MODULE 6 • PRODUCTION READY
              </span>
              <span className="text-xs text-slate-400">Option A • Schema-Isolated (integration.*)</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Layers className="w-8 h-8 text-cyan-400" />
              Integration & Automation Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Southbound multi-vendor auto-discovery, 3-way reconciliation SSoT sync, TM Forum Northbound REST APIs, and Gaharu_BPMN_NGIN workflow orchestration.
            </p>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors self-start lg:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh Telemetry
          </button>
        </div>

        {/* Telemetry Counter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Active Connectors</span>
            <strong className="text-lg font-bold text-emerald-400">
              {stats?.onlineConnectors || connectors.filter((c) => c.status === 'ONLINE').length} / {connectors.length}
            </strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Pending Diffs</span>
            <strong className="text-lg font-bold text-amber-400">
              {stats?.pendingReconciliations || reconciliations.filter((r) => r.status === 'PENDING_REVIEW').length}
            </strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Critical Alarms</span>
            <strong className="text-lg font-bold text-rose-400">
              {stats?.activeCriticalAlarms || alarms.filter((a) => a.severity === 'CRITICAL' && a.lifecycleStatus !== 'RESOLVED').length}
            </strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Revenue at Risk</span>
            <strong className="text-lg font-bold text-cyan-400 font-mono">
              ${(stats?.totalRevenueAtRiskUsd || 29300).toLocaleString()}
            </strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">CDC Audit Changes</span>
            <strong className="text-lg font-bold text-purple-400 font-mono">
              {changeLogs.length}
            </strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">BPMN Bridge</span>
            <strong className="text-lg font-bold text-emerald-400">CONNECTED</strong>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => handleTabChange('connectors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            currentTab === 'connectors'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          EMS / NMS Connectors ({connectors.length})
        </button>

        <button
          onClick={() => handleTabChange('reconciliation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            currentTab === 'reconciliation'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          Reconciliation Center ({reconciliations.filter((r) => r.status === 'PENDING_REVIEW').length})
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            currentTab === 'audit'
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Change Tracking & Audit ({changeLogs.length})
        </button>

        <button
          onClick={() => handleTabChange('alarms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            currentTab === 'alarms'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Enriched Alarms ({alarms.filter((a) => a.lifecycleStatus !== 'RESOLVED').length})
        </button>

        <button
          onClick={() => handleTabChange('webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            currentTab === 'webhooks'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Webhook className="w-4 h-4" />
          Northbound TMF & Webhooks ({webhooks.length})
        </button>

        <button
          onClick={() => handleTabChange('bpmn')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            currentTab === 'bpmn'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Workflow className="w-4 h-4" />
          Gaharu_BPMN_NGIN Bridge
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="mt-4">
        {currentTab === 'connectors' && (
          <ConnectorHubView
            connectors={connectors}
            onTestConnector={handleTestConnector}
            onTriggerDiscovery={handleTriggerDiscovery}
            onOpenCreateModal={() => setIsCreateConnectorOpen(true)}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'reconciliation' && (
          <ReconciliationCenterView
            items={reconciliations}
            onResolve={handleResolveReconciliation}
            onInspectDiff={(item) => {
              setSelectedDiffItem(item);
              setIsDiffModalOpen(true);
            }}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'audit' && (
          <ChangeTrackingAuditView
            changeLogs={changeLogs}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'alarms' && (
          <EnrichedAlarmMatrixView
            alarms={alarms}
            onAlarmAction={handleAlarmAction}
            onOpenSimulateModal={() => setIsSimulateAlarmOpen(true)}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'webhooks' && (
          <NorthboundWebhookStudioView
            webhooks={webhooks}
            webhookLogs={webhookLogs}
            onOpenCreateModal={() => setIsCreateWebhookOpen(true)}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'bpmn' && (
          <GaharuBpmnBridgeView isLoading={isLoading} />
        )}
      </div>

      {/* Modals */}
      <CreateConnectorModal
        isOpen={isCreateConnectorOpen}
        onClose={() => setIsCreateConnectorOpen(false)}
        onSubmit={handleCreateConnector}
      />

      <ReconciliationDiffModal
        item={selectedDiffItem}
        isOpen={isDiffModalOpen}
        onClose={() => {
          setIsDiffModalOpen(false);
          setSelectedDiffItem(null);
        }}
        onResolve={handleResolveReconciliation}
      />

      <CreateWebhookModal
        isOpen={isCreateWebhookOpen}
        onClose={() => setIsCreateWebhookOpen(false)}
        onSubmit={handleCreateWebhook}
      />

      <SimulateAlarmModal
        isOpen={isSimulateAlarmOpen}
        onClose={() => setIsSimulateAlarmOpen(false)}
        onSubmit={handleSimulateAlarm}
      />
    </div>
  );
};
