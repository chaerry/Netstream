import apiClient from './apiClient';
import {
  Connector,
  DiscoveryJob,
  ReconciliationItem,
  ChangeLog,
  EnrichedAlarm,
  WebhookSubscription,
  WebhookLog,
  IntegrationStats,
  ReconciliationStatus,
  DiscrepancyType,
  AlarmSeverity,
} from '../types/integration';
import {
  mockConnectors,
  mockDiscoveryJobs,
  mockReconciliationItems,
  mockChangeLogs,
  mockEnrichedAlarms,
  mockWebhookSubscriptions,
  mockWebhookLogs,
  mockIntegrationStats,
} from './mockData';

export const integrationApi = {
  // Stats
  async getStats(): Promise<IntegrationStats> {
    try {
      const res = await apiClient.get<IntegrationStats>('/api/v1/integration/stats');
      return res.data;
    } catch {
      return mockIntegrationStats;
    }
  },

  // Connectors
  async getConnectors(): Promise<Connector[]> {
    try {
      const res = await apiClient.get<Connector[]>('/api/v1/integration/connectors');
      return res.data;
    } catch {
      return mockConnectors;
    }
  },

  async createConnector(payload: Partial<Connector>): Promise<Connector> {
    try {
      const res = await apiClient.post<Connector>('/api/v1/integration/connectors', payload);
      return res.data;
    } catch {
      const newConn: Connector = {
        id: Date.now(),
        name: payload.name || 'New-Connector',
        vendor: payload.vendor || 'HUAWEI',
        connectorType: payload.connectorType || 'EMS_NMS',
        protocol: payload.protocol || 'REST_API',
        endpointUrl: payload.endpointUrl || 'https://ems.corp',
        authType: payload.authType || 'TOKEN',
        status: 'ONLINE',
        pingLatencyMs: 15,
        syncIntervalMins: payload.syncIntervalMins || 60,
        autoReconcileEnabled: payload.autoReconcileEnabled ?? true,
        autoApproveMinorDiffs: payload.autoApproveMinorDiffs ?? true,
        managedElementsCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockConnectors.push(newConn);
      return newConn;
    }
  },

  async testConnector(id: number): Promise<Connector> {
    try {
      const res = await apiClient.post<Connector>(`/api/v1/integration/connectors/${id}/test`);
      return res.data;
    } catch {
      const conn = mockConnectors.find((c) => c.id === id);
      if (conn) {
        conn.status = 'ONLINE';
        conn.pingLatencyMs = Math.floor(Math.random() * 20) + 5;
        conn.lastSyncAt = new Date().toISOString();
        conn.lastSyncStatus = 'SUCCESS';
        return conn;
      }
      return mockConnectors[0];
    }
  },

  // Discovery Jobs
  async getDiscoveryJobs(connectorId?: number): Promise<DiscoveryJob[]> {
    try {
      const res = await apiClient.get<DiscoveryJob[]>('/api/v1/integration/discovery-jobs', {
        params: { connectorId },
      });
      return res.data;
    } catch {
      if (connectorId) {
        return mockDiscoveryJobs.filter((j) => j.connectorId === connectorId);
      }
      return mockDiscoveryJobs;
    }
  },

  async triggerDiscovery(connectorId: number, jobType: string = 'FULL_INVENTORY_SWEEP'): Promise<DiscoveryJob> {
    try {
      const res = await apiClient.post<DiscoveryJob>(`/api/v1/integration/connectors/${connectorId}/discovery`, {
        jobType,
        initiatedBy: 'MANUAL_UI',
      });
      return res.data;
    } catch {
      const conn = mockConnectors.find((c) => c.id === connectorId);
      const newJob: DiscoveryJob = {
        id: Date.now(),
        connectorId,
        connectorName: conn ? conn.name : 'EMS-Connector',
        jobType,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 15000).toISOString(),
        completedAt: new Date().toISOString(),
        elementsScanned: Math.floor(Math.random() * 100) + 120,
        discrepanciesFound: Math.floor(Math.random() * 2) + 1,
        initiatedBy: 'MANUAL_UI',
      };
      mockDiscoveryJobs.unshift(newJob);
      return newJob;
    }
  },

  // Reconciliation Items
  async getReconciliationItems(status?: ReconciliationStatus, type?: DiscrepancyType): Promise<ReconciliationItem[]> {
    try {
      const res = await apiClient.get<ReconciliationItem[]>('/api/v1/integration/reconciliation', {
        params: { status, type },
      });
      return res.data;
    } catch {
      let list = [...mockReconciliationItems];
      if (status) list = list.filter((item) => item.status === status);
      if (type) list = list.filter((item) => item.discrepancyType === type);
      return list;
    }
  },

  async resolveDiscrepancy(
    id: number,
    payload: { resolutionAction: string; resolutionNotes?: string; resolvedBy?: string }
  ): Promise<ReconciliationItem> {
    try {
      const res = await apiClient.post<ReconciliationItem>(`/api/v1/integration/reconciliation/${id}/resolve`, payload);
      return res.data;
    } catch {
      const item = mockReconciliationItems.find((r) => r.id === id);
      if (item) {
        item.resolutionAction = payload.resolutionAction;
        item.resolutionNotes = payload.resolutionNotes;
        item.resolvedBy = payload.resolvedBy || 'noc.engineer';
        item.resolvedAt = new Date().toISOString();
        if (payload.resolutionAction === 'APPLY_TO_INVENTORY') {
          item.status = 'MANUALLY_SYNCED';
        } else if (payload.resolutionAction === 'DISPATCH_WORK_ORDER') {
          item.status = 'ESCALATED_BPMN';
          item.gaharuProcessInstanceId = `GAHARU-REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        } else {
          item.status = 'REJECTED_ROGUE';
        }
        return item;
      }
      return mockReconciliationItems[0];
    }
  },

  // Change Logs (CDC)
  async getChangeLogs(limit: number = 50, domain?: string): Promise<ChangeLog[]> {
    try {
      const res = await apiClient.get<ChangeLog[]>('/api/v1/integration/audit-logs', {
        params: { limit, domain },
      });
      return res.data;
    } catch {
      if (domain) {
        return mockChangeLogs.filter((c) => c.entityDomain === domain);
      }
      return mockChangeLogs;
    }
  },

  // Enriched Alarms
  async getAlarms(severity?: AlarmSeverity, activeOnly: boolean = true): Promise<EnrichedAlarm[]> {
    try {
      const res = await apiClient.get<EnrichedAlarm[]>('/api/v1/integration/alarms', {
        params: { severity, activeOnly },
      });
      return res.data;
    } catch {
      let list = [...mockEnrichedAlarms];
      if (severity) list = list.filter((a) => a.severity === severity);
      if (activeOnly) list = list.filter((a) => a.lifecycleStatus !== 'RESOLVED');
      return list;
    }
  },

  async ingestAlarm(payload: Partial<EnrichedAlarm>): Promise<EnrichedAlarm> {
    try {
      const res = await apiClient.post<EnrichedAlarm>('/api/v1/integration/alarms/ingest', payload);
      return res.data;
    } catch {
      const newAlarm: EnrichedAlarm = {
        id: Date.now(),
        alarmIdentifier: payload.alarmIdentifier || `ALM-${Date.now()}`,
        sourceSystem: payload.sourceSystem || 'REST_INGEST',
        sourceIp: payload.sourceIp || '10.200.1.1',
        alarmName: payload.alarmName || 'LossOfSignal (LOS)',
        alarmType: payload.alarmType || 'COMMUNICATIONS_ALARM',
        severity: payload.severity || 'CRITICAL',
        lifecycleStatus: 'ACTIVE_UNACKNOWLEDGED',
        raisedAt: new Date().toISOString(),
        deviceName: payload.deviceName || 'JKT-CORE-PE-01',
        portName: payload.portName || 'HundredGigE0/1/0/1',
        locationName: 'JKT-DATACENTER-01',
        rackCode: 'RACK-DC-04',
        opticalCableCode: 'CBL-TRK-JKT-BDG-01',
        opticalStrandNo: 12,
        leasedLineCircuitCode: 'LL-TELKOM-EPL-10G-01',
        carrierName: 'Telkom Indonesia',
        slaTier: 'PLATINUM_99_999',
        impactedServicesCount: 4,
        impactedCustomersCount: 3,
        estimatedRevenueRiskUsd: 24500.0,
        rootCauseTag: 'FIBER_CUT_SP04',
      };
      mockEnrichedAlarms.unshift(newAlarm);
      return newAlarm;
    }
  },

  async alarmAction(id: number, action: 'ACKNOWLEDGE' | 'CLEAR' | 'ESCALATE_GAHARU'): Promise<EnrichedAlarm> {
    try {
      const res = await apiClient.post<EnrichedAlarm>(`/api/v1/integration/alarms/${id}/action`, { action });
      return res.data;
    } catch {
      const alarm = mockEnrichedAlarms.find((a) => a.id === id);
      if (alarm) {
        if (action === 'ACKNOWLEDGE') {
          alarm.lifecycleStatus = 'ACKNOWLEDGED';
          alarm.acknowledgedBy = 'noc.operator';
          alarm.acknowledgedAt = new Date().toISOString();
        } else if (action === 'CLEAR') {
          alarm.lifecycleStatus = 'RESOLVED';
          alarm.clearedAt = new Date().toISOString();
        } else if (action === 'ESCALATE_GAHARU') {
          alarm.lifecycleStatus = 'IN_INVESTIGATION';
          alarm.gaharuTicketId = `GAHARU-INC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        return alarm;
      }
      return mockEnrichedAlarms[0];
    }
  },

  // Webhooks
  async getWebhooks(): Promise<WebhookSubscription[]> {
    try {
      const res = await apiClient.get<WebhookSubscription[]>('/api/v1/integration/webhooks');
      return res.data;
    } catch {
      return mockWebhookSubscriptions;
    }
  },

  async createWebhook(payload: Partial<WebhookSubscription>): Promise<WebhookSubscription> {
    try {
      const res = await apiClient.post<WebhookSubscription>('/api/v1/integration/webhooks', payload);
      return res.data;
    } catch {
      const newHook: WebhookSubscription = {
        id: Date.now(),
        name: payload.name || 'New-Webhook',
        subscriberSystem: payload.subscriberSystem || 'SERVICENOW',
        targetUrl: payload.targetUrl || 'https://external.corp/webhook',
        eventTopics: payload.eventTopics || 'AlarmCritical,AlarmMajor',
        secretTokenMasked: 'sec_new_tok_******',
        isActive: true,
        retryCount: payload.retryCount || 3,
        timeoutMs: payload.timeoutMs || 5000,
        createdAt: new Date().toISOString(),
      };
      mockWebhookSubscriptions.push(newHook);
      return newHook;
    }
  },

  async getWebhookLogs(subId?: number): Promise<WebhookLog[]> {
    try {
      const res = await apiClient.get<WebhookLog[]>(`/api/v1/integration/webhooks/${subId || 1}/logs`);
      return res.data;
    } catch {
      return mockWebhookLogs;
    }
  },

  // Northbound TMF Sandbox Queries
  async getTmfServices(): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>('/api/v1/tmf/serviceInventory/v4/service');
      return res.data;
    } catch {
      return [
        {
          id: 'SRV-CORP-BCA-01',
          name: 'Jakarta-Bandung 10G Private EPL',
          serviceType: 'ETHERNET_PRIVATE_LINE',
          customerName: 'PT Bank Central Asia Tbk',
          state: 'active',
          bandwidthMbps: 10000,
        },
        {
          id: 'SRV-CORP-MDR-01',
          name: 'Surabaya Datacenter 1G DIA',
          serviceType: 'IP_TRANSIT_DIA',
          customerName: 'PT Bank Mandiri (Persero) Tbk',
          state: 'active',
          bandwidthMbps: 1000,
        },
      ];
    }
  },

  async getTmfResources(): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>('/api/v1/tmf/resourceInventory/v4/resource');
      return res.data;
    } catch {
      return [
        {
          id: 'dev-01',
          name: 'JKT-CORE-PE-01',
          category: 'ROUTER_CORE_PE',
          operationalState: 'OPERATIONAL',
          vendor: 'HUAWEI',
          model: 'NetEngine 8000 X8',
        },
        {
          id: 'dev-02',
          name: 'SBY-CORE-PE-01',
          category: 'ROUTER_CORE_PE',
          operationalState: 'OPERATIONAL',
          vendor: 'CISCO',
          model: 'ASR-9904',
        },
      ];
    }
  },
};
