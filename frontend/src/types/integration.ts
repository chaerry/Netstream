export type ConnectorProtocol =
  | 'REST_API'
  | 'NETCONF_YANG'
  | 'RESTCONF'
  | 'SNMP_V2C'
  | 'SNMP_V3'
  | 'CLI_SSH'
  | 'TL1';

export type ConnectorStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'TESTING';

export type DiscrepancyType =
  | 'NEW_DISCOVERED'
  | 'MISSING_IN_LIVE'
  | 'ATTRIBUTE_MISMATCH'
  | 'STATE_DRIFT';

export type ReconciliationStatus =
  | 'PENDING_REVIEW'
  | 'AUTO_RESOLVED'
  | 'MANUALLY_SYNCED'
  | 'REJECTED_ROGUE'
  | 'ESCALATED_BPMN';

export type AlarmSeverity =
  | 'CRITICAL'
  | 'MAJOR'
  | 'MINOR'
  | 'WARNING'
  | 'INDETERMINATE'
  | 'CLEARED';

export type AlarmLifecycleStatus =
  | 'ACTIVE_UNACKNOWLEDGED'
  | 'ACKNOWLEDGED'
  | 'IN_INVESTIGATION'
  | 'RESOLVED'
  | 'AUTO_CLEARED';

export type ChangeAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATE_CHANGE'
  | 'RECONCILIATION_SYNC';

export interface Connector {
  id: number;
  name: string;
  vendor: string;
  connectorType: string;
  protocol: ConnectorProtocol;
  endpointUrl: string;
  authType: string;
  authCredentialMasked?: string;
  status: ConnectorStatus;
  pingLatencyMs: number;
  syncIntervalMins: number;
  autoReconcileEnabled: boolean;
  autoApproveMinorDiffs: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  managedElementsCount: number;
  createdAt: string;
}

export interface DiscoveryJob {
  id: number;
  connectorId: number;
  connectorName: string;
  jobType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  elementsScanned: number;
  discrepanciesFound: number;
  errorMessage?: string;
  initiatedBy: string;
}

export interface ReconciliationItem {
  id: number;
  discoveryJobId?: number;
  connectorId: number;
  connectorName: string;
  entityType: string;
  entityIdentifier: string;
  targetInventoryId?: number;
  discrepancyType: DiscrepancyType;
  attributeName?: string;
  inventoryValue?: string;
  liveDiscoveredValue?: string;
  severity: string;
  status: ReconciliationStatus;
  resolutionAction?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  gaharuProcessInstanceId?: string;
  createdAt: string;
}

export interface ChangeLog {
  id: number;
  timestamp: string;
  username: string;
  userRole: string;
  clientIp: string;
  entityDomain: string;
  entityType: string;
  entityId: string;
  action: ChangeAction;
  summary: string;
  beforeSnapshotJson?: string;
  afterSnapshotJson?: string;
  diffSummaryJson?: string;
}

export interface EnrichedAlarm {
  id: number;
  alarmIdentifier: string;
  sourceSystem: string;
  sourceIp?: string;
  alarmName: string;
  alarmType: string;
  severity: AlarmSeverity;
  lifecycleStatus: AlarmLifecycleStatus;
  raisedAt: string;
  clearedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  rawPayloadJson?: string;

  // Enriched Topology Linkages
  deviceId?: number;
  deviceName?: string;
  portId?: number;
  portName?: string;
  locationName?: string;
  rackCode?: string;
  opticalCableCode?: string;
  opticalStrandNo?: number;
  leasedLineCircuitCode?: string;
  carrierName?: string;
  slaTier?: string;
  impactedServicesCount: number;
  impactedCustomersCount: number;
  estimatedRevenueRiskUsd: number;
  gaharuTicketId?: string;
  rootCauseTag?: string;
}

export interface WebhookSubscription {
  id: number;
  name: string;
  subscriberSystem: string;
  targetUrl: string;
  eventTopics: string;
  secretTokenMasked?: string;
  isActive: boolean;
  retryCount: number;
  timeoutMs: number;
  createdAt: string;
}

export interface WebhookLog {
  id: number;
  subscriptionId: number;
  subscriptionName: string;
  eventTopic: string;
  payloadJson: string;
  dispatchedAt: string;
  responseCode: number;
  responseBody?: string;
  latencyMs: number;
  status: 'DELIVERED' | 'RETRYING' | 'FAILED';
}

export interface IntegrationStats {
  totalConnectors: number;
  onlineConnectors: number;
  pendingReconciliations: number;
  activeCriticalAlarms: number;
  activeMajorAlarms: number;
  totalChangeLogsToday: number;
  activeWebhooks: number;
  totalRevenueAtRiskUsd: number;
}
