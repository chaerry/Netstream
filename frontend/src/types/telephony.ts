export type NumberCategory = 
  | 'GEOGRAPHIC' 
  | 'NON_GEOGRAPHIC' 
  | 'MOBILE_MSISDN' 
  | 'TOLL_FREE_0800' 
  | 'PREMIUM_0809' 
  | 'SHORT_CODE_1500' 
  | 'PBX_EXTENSION';

export type NumberStatus = 
  | 'AVAILABLE' 
  | 'ALLOCATED' 
  | 'RESERVED' 
  | 'PORTED_IN' 
  | 'PORTED_OUT' 
  | 'QUARANTINE' 
  | 'BLOCKED';

export type PortingDirection = 'PORTED_IN' | 'PORTED_OUT';

export type PortingStatus = 
  | 'PENDING_APPROVAL' 
  | 'IN_PROGRESS' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface NumberBlock {
  id: string;
  prefix: string; // e.g. "+62 21 5000"
  blockPattern: string; // e.g. "+62 21 5000 xxxx"
  countryCode: string; // e.g. "+62"
  areaCode?: string; // e.g. "21" (Jakarta)
  regionName: string; // e.g. "DKI Jakarta (Jabodetabek)"
  category: NumberCategory;
  rangeStart: string; // e.g. "+622150000000"
  rangeEnd: string; // e.g. "+622150009999"
  totalCapacity: number; // 10000
  allocatedCount: number;
  reservedCount: number;
  quarantineCount: number;
  portedCount: number;
  utilizationPct: number;
  regulatoryAuthorityRef: string; // e.g. "KOMINFO/KEP-TEL/2024/091"
  operatorOrNode: string; // e.g. "Netstream Core IMS / SBC-01"
  status: 'ACTIVE' | 'EXHAUSTED' | 'RESERVED' | 'PLANNED';
  createdAt: string;
}

export interface TelephoneNumber {
  id: string;
  e164Format: string; // e.g. "+622150001001"
  nationalFormat: string; // e.g. "(021) 5000-1001"
  blockId: string;
  category: NumberCategory;
  status: NumberStatus;
  customerName?: string;
  customerAccount?: string;
  serviceCode?: string; // e.g. "SVC-VOIP-SIP-001"
  assignedNode?: string; // e.g. "ID-CGK-IMS-SBC-01"
  locationName?: string; // e.g. "SCBD Sudirman Financial Center"
  portingDirection?: PortingDirection;
  donorOperator?: string;
  recipientOperator?: string;
  routingPrefix?: string; // e.g. "RN001" (Routing Number for LRN)
  activationDate?: string;
  notes?: string;
}

export interface PortingRecord {
  id: string;
  portingReference: string; // e.g. "MNP-2026-0811-094"
  telephoneNumber: string;
  direction: PortingDirection;
  donorOperator: string; // e.g. "Telkomsel"
  recipientOperator: string; // e.g. "Netstream Mobile"
  requestDate: string;
  portingDueDate: string;
  completedDate?: string;
  status: PortingStatus;
  regulatoryClearanceCode?: string; // e.g. "BRTI-NP-CLEARED-9921"
  rejectionReason?: string;
  requesterName: string;
  notes?: string;
}

export interface ImsDiscoveryResult {
  phoneNumber: string;
  sipUri: string; // e.g. "sip:+622150001001@ims.netstream.id"
  imsNode: string; // e.g. "ID-CGK-IMS-CORE-01"
  userAgent?: string; // e.g. "Cisco-CP8865/14.0.1"
  ipAddress?: string; // e.g. "10.240.10.45"
  registrationStatus: 'REGISTERED' | 'UNREGISTERED' | 'EXPIRED' | 'ROGUE_UNMAPPED';
  lastRegisterTime: string;
}

export interface CreateBlockRequest {
  prefix: string;
  blockPattern: string;
  countryCode: string;
  areaCode?: string;
  regionName: string;
  category: NumberCategory;
  rangeStart: string;
  rangeEnd: string;
  totalCapacity: number;
  regulatoryAuthorityRef: string;
  operatorOrNode: string;
}

export interface AllocateNumberRequest {
  e164Format: string;
  nationalFormat: string;
  blockId: string;
  category: NumberCategory;
  status: NumberStatus;
  customerName?: string;
  customerAccount?: string;
  serviceCode?: string;
  assignedNode?: string;
  locationName?: string;
  notes?: string;
}

export interface CreatePortingRequest {
  telephoneNumber: string;
  direction: PortingDirection;
  donorOperator: string;
  recipientOperator: string;
  portingDueDate: string;
  requesterName: string;
  notes?: string;
}
