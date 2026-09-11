export type CircuitDirection = 'INBOUND_RENTED' | 'OUTBOUND_CUSTOMER';

export type CircuitTechnology =
  | 'EPL'
  | 'EVPL'
  | 'DIA'
  | 'DARK_FIBER'
  | 'DWDM_LAMBDA'
  | 'SDH_VC4';

export type CircuitLifecycleStatus =
  | 'PLANNING'
  | 'PROVISIONING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DORMANT'
  | 'PENDING_DECOMMISSION'
  | 'TERMINATED';

export type SlaTier =
  | 'PLATINUM_99_999'
  | 'GOLD_99_99'
  | 'SILVER_99_95'
  | 'BRONZE_99_90';

export type InvoiceStatus =
  | 'RECEIVED'
  | 'AUDITED_OK'
  | 'DISCREPANCY_FLAGGED'
  | 'DISPUTED'
  | 'APPROVED_FOR_PAYMENT';

export interface LeasedLineCircuit {
  id: string;
  circuitId: string;
  carrierCircuitId?: string;
  circuitName: string;
  direction: CircuitDirection;
  technology: CircuitTechnology;
  status: CircuitLifecycleStatus;
  carrierId?: string;
  carrierName?: string;
  carrierCode?: string;
  contractId?: string;
  contractNumber?: string;
  bandwidthMbps: number;
  bandwidthDisplay: string;
  slaTier: SlaTier;
  uptimeTargetPercent: number;
  mttrTargetHours: number;
  committedLatencyMs: number;
  actualLatencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  aEndLocationId?: string;
  aEndLocationName?: string;
  aEndDeviceId?: string;
  aEndDeviceHostname?: string;
  aEndPortId?: string;
  aEndPortName?: string;
  zEndLocationId?: string;
  zEndLocationName?: string;
  zEndDeviceId?: string;
  zEndDeviceHostname?: string;
  zEndPortId?: string;
  zEndPortName?: string;
  opticalCableId?: string;
  opticalCableName?: string;
  strandNumber?: number;
  vneId?: string;
  vneName?: string;
  vlanId?: number;
  customerId?: string;
  customerName?: string;
  serviceId?: string;
  serviceName?: string;
  currency: string; // Default: 'USD'
  mrc: number;      // Monthly Recurring Charge (USD)
  nrc: number;      // Non-Recurring Charge (USD)
  utilizationPercent: number;
  isDormant: boolean;
  dormantSince?: string;
  potentialMonthlySavings: number;
  activationDate?: string;
  decommissionDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCircuitPayload {
  circuitId: string;
  carrierCircuitId?: string;
  circuitName: string;
  direction: CircuitDirection;
  technology: CircuitTechnology;
  status?: CircuitLifecycleStatus;
  carrierId?: string;
  contractId?: string;
  bandwidthMbps: number;
  bandwidthDisplay?: string;
  slaTier?: SlaTier;
  uptimeTargetPercent?: number;
  mttrTargetHours?: number;
  committedLatencyMs?: number;
  aEndLocationId?: string;
  aEndDeviceId?: string;
  aEndPortId?: string;
  zEndLocationId?: string;
  zEndDeviceId?: string;
  zEndPortId?: string;
  opticalCableId?: string;
  strandNumber?: number;
  vneId?: string;
  vlanId?: number;
  customerId?: string;
  customerName?: string;
  currency?: string;
  mrc: number;
  nrc?: number;
  actualLatencyMs?: number;
  utilizationPercent?: number;
  notes?: string;
}

export interface LeasedLineCarrier {
  id: string;
  name: string;
  code: string;
  carrierType: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  portalUrl?: string;
  supportTier: string;
  escalationMatrix?: string;
  activeCircuitCount: number;
  totalMonthlyOpexUsd: number;
  createdAt?: string;
}

export interface LeasedLineContract {
  id: string;
  carrierId?: string;
  carrierName?: string;
  contractNumber: string;
  title: string;
  contractType: string;
  startDate: string;
  endDate: string;
  termMonths: number;
  autoRenewal: boolean;
  noticePeriodDays: number;
  currency: string;
  mrcTotal: number;
  nrcTotal: number;
  status: string;
  documentUrl?: string;
  circuitCount: number;
  daysUntilExpiration: number;
}

export interface InvoiceItem {
  id: string;
  circuitId?: string;
  circuitReference: string;
  billedMrc: number;
  contractedMrc: number;
  discrepancy: number;
  status: string;
  notes?: string;
}

export interface LeasedLineInvoice {
  id: string;
  invoiceNumber: string;
  carrierId: string;
  carrierName: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  currency: string;
  billedAmount: number;
  contractedAmount: number;
  slaPenaltyCredit: number;
  netPayableAmount: number;
  discrepancyAmount: number;
  status: InvoiceStatus;
  disputeReason?: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
}

export interface DormantCircuit {
  id: string;
  circuitId: string;
  carrierCircuitId?: string;
  circuitName: string;
  carrierName: string;
  technology: string;
  bandwidthDisplay: string;
  mrcUsd: number;
  utilizationPercent: number;
  dormantSince: string;
  reason: string;
  recommendedAction: string;
  gaharuProcessStatus: string;
}

export interface CapacityAuditReport {
  totalCircuitsAudited: number;
  dormantCircuitCount: number;
  totalMonthlySavingsUsd: number;
  totalAnnualSavingsUsd: number;
  dormantCircuits: DormantCircuit[];
}

export interface SlaIncident {
  id: string;
  circuitId: string;
  circuitName: string;
  ticketNumber: string;
  carrierTicketNumber?: string;
  incidentStart: string;
  incidentEnd?: string;
  durationMinutes: number;
  targetMttrMinutes: number;
  isMttrBreached: boolean;
  outageType: string;
  rootCause?: string;
  currency: string;
  penaltyRebateAmount: number;
  claimStatus: string;
  createdAt?: string;
}

export interface LogSlaIncidentPayload {
  circuitId: string;
  ticketNumber: string;
  carrierTicketNumber?: string;
  incidentStart: string;
  incidentEnd?: string;
  durationMinutes?: number;
  targetMttrMinutes?: number;
  outageType?: string;
  rootCause?: string;
  currency?: string;
  penaltyRebateAmount?: number;
}

export interface InitiateDecomPayload {
  circuitId: string;
  initiatedBy: string;
  reason: string;
  targetDecomDate: string;
}

export interface DecomRequestResponse {
  id: string;
  circuitId: string;
  circuitName: string;
  gaharuProcessInstanceId: string;
  initiatedBy: string;
  reason: string;
  targetDecomDate: string;
  estimatedAnnualSavingsUsd: number;
  workflowState: string;
  gaharuResponsePayload: string;
  createdAt: string;
}

export interface CircuitHop {
  sequence: number;
  hopType: 'LOCATION' | 'DEVICE_PORT' | 'FIBER_STRAND' | 'VNE_OVERLAY';
  name: string;
  details: string;
  status: string;
}

export interface CircuitTopologyPath {
  circuitId: string;
  circuitName: string;
  technology: string;
  bandwidthDisplay: string;
  hops: CircuitHop[];
}
