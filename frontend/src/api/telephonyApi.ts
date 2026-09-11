import apiClient from './apiClient';
import { 
  NumberBlock, 
  TelephoneNumber, 
  PortingRecord, 
  ImsDiscoveryResult, 
  CreateBlockRequest, 
  AllocateNumberRequest, 
  CreatePortingRequest 
} from '../types/telephony';

let localBlocks: NumberBlock[] = [
  {
    id: 'blk-01',
    prefix: '+62 21 5000',
    blockPattern: '+62 21 5000 xxxx',
    countryCode: '+62',
    areaCode: '21',
    regionName: 'DKI Jakarta (Sudirman & Kuningan)',
    category: 'GEOGRAPHIC',
    rangeStart: '+622150000000',
    rangeEnd: '+622150009999',
    totalCapacity: 10000,
    allocatedCount: 7850,
    reservedCount: 450,
    quarantineCount: 120,
    portedCount: 380,
    utilizationPct: 78.5,
    regulatoryAuthorityRef: 'KOMINFO/ALOK-NOMOR/2024/021',
    operatorOrNode: 'Netstream Jakarta Core SBC-01',
    status: 'ACTIVE',
    createdAt: '2025-06-10T08:00:00Z',
  },
  {
    id: 'blk-02',
    prefix: '+62 22 4200',
    blockPattern: '+62 22 4200 xxxx',
    countryCode: '+62',
    areaCode: '22',
    regionName: 'Jawa Barat (Bandung Raya)',
    category: 'GEOGRAPHIC',
    rangeStart: '+622242000000',
    rangeEnd: '+622242009999',
    totalCapacity: 10000,
    allocatedCount: 4200,
    reservedCount: 800,
    quarantineCount: 90,
    portedCount: 150,
    utilizationPct: 42.0,
    regulatoryAuthorityRef: 'KOMINFO/ALOK-NOMOR/2024/022',
    operatorOrNode: 'Netstream Bandung SBC-02',
    status: 'ACTIVE',
    createdAt: '2025-07-15T10:00:00Z',
  },
  {
    id: 'blk-03',
    prefix: '+62 811 900',
    blockPattern: '+62 811 900 xxxx',
    countryCode: '+62',
    regionName: 'National Mobile MSISDN Tier 1',
    category: 'MOBILE_MSISDN',
    rangeStart: '+628119000000',
    rangeEnd: '+628119009999',
    totalCapacity: 10000,
    allocatedCount: 9150,
    reservedCount: 300,
    quarantineCount: 350,
    portedCount: 1240,
    utilizationPct: 91.5,
    regulatoryAuthorityRef: 'KOMINFO/ALOK-SELULER/2023/188',
    operatorOrNode: 'Netstream LTE/5G EPC HSS-01',
    status: 'ACTIVE',
    createdAt: '2025-01-20T08:00:00Z',
  },
  {
    id: 'blk-04',
    prefix: '0800 1 800',
    blockPattern: '0800 1 800 xxx',
    countryCode: '+62',
    regionName: 'National Toll-Free (Freephone)',
    category: 'TOLL_FREE_0800',
    rangeStart: '08001800000',
    rangeEnd: '08001800999',
    totalCapacity: 1000,
    allocatedCount: 620,
    reservedCount: 80,
    quarantineCount: 10,
    portedCount: 45,
    utilizationPct: 62.0,
    regulatoryAuthorityRef: 'KOMINFO/FREEPHONE/2024/005',
    operatorOrNode: 'Netstream Toll-Free IN-SCP-01',
    status: 'ACTIVE',
    createdAt: '2025-08-01T09:00:00Z',
  },
  {
    id: 'blk-05',
    prefix: '+62 21 809 1',
    blockPattern: '+62 21 809 1xxx',
    countryCode: '+62',
    areaCode: '21',
    regionName: 'National Premium Rate (0809)',
    category: 'PREMIUM_0809',
    rangeStart: '+62218091000',
    rangeEnd: '+62218091999',
    totalCapacity: 1000,
    allocatedCount: 180,
    reservedCount: 120,
    quarantineCount: 15,
    portedCount: 0,
    utilizationPct: 18.0,
    regulatoryAuthorityRef: 'KOMINFO/PREM-RATE/2024/012',
    operatorOrNode: 'Netstream Value Added Platform',
    status: 'ACTIVE',
    createdAt: '2025-09-10T11:00:00Z',
  },
  {
    id: 'blk-06',
    prefix: 'EXT 4000',
    blockPattern: 'EXT 4xxx (SCBD PBX)',
    countryCode: '+62',
    areaCode: '21',
    regionName: 'SCBD Head Office Private PBX',
    category: 'PBX_EXTENSION',
    rangeStart: '4000',
    rangeEnd: '4999',
    totalCapacity: 1000,
    allocatedCount: 650,
    reservedCount: 50,
    quarantineCount: 0,
    portedCount: 0,
    utilizationPct: 65.0,
    regulatoryAuthorityRef: 'INTERNAL-ENTERPRISE-PBX',
    operatorOrNode: 'Cisco CUCM Enterprise Cluster',
    status: 'ACTIVE',
    createdAt: '2025-10-01T08:00:00Z',
  }
];

let localNumbers: TelephoneNumber[] = [
  {
    id: 'num-01',
    e164Format: '+622150001000',
    nationalFormat: '(021) 5000-1000',
    blockId: 'blk-01',
    category: 'GEOGRAPHIC',
    status: 'ALLOCATED',
    customerName: 'PT Bank Central Asia Tbk',
    customerAccount: 'CUST-BCA-001',
    serviceCode: 'SVC-VOIP-SIP-001',
    assignedNode: 'ID-CGK-IMS-SBC-01',
    locationName: 'SCBD Sudirman Financial Center',
    activationDate: '2025-08-01T10:00:00Z',
    notes: 'Primary SIP Trunk Pilot Hunting Number (120 Channels)',
  },
  {
    id: 'num-02',
    e164Format: '+622150001001',
    nationalFormat: '(021) 5000-1001',
    blockId: 'blk-01',
    category: 'GEOGRAPHIC',
    status: 'ALLOCATED',
    customerName: 'PT Bank Central Asia Tbk',
    customerAccount: 'CUST-BCA-001',
    serviceCode: 'SVC-VOIP-SIP-001',
    assignedNode: 'ID-CGK-IMS-SBC-01',
    locationName: 'SCBD Sudirman Financial Center',
    activationDate: '2025-08-01T10:00:00Z',
    notes: 'Direct Inward Dialing (DID) Treasury Floor',
  },
  {
    id: 'num-03',
    e164Format: '+622150002888',
    nationalFormat: '(021) 5000-2888',
    blockId: 'blk-01',
    category: 'GEOGRAPHIC',
    status: 'PORTED_IN',
    customerName: 'PT Telekomunikasi Selular (Mitra)',
    customerAccount: 'CUST-TSEL-PARTNER',
    serviceCode: 'SVC-VOIP-CORP-018',
    assignedNode: 'ID-CGK-IMS-SBC-01',
    locationName: 'Telkom Landmark Tower Floor 18',
    portingDirection: 'PORTED_IN',
    donorOperator: 'PT Telkom Indonesia Tbk',
    recipientOperator: 'Netstream Telco',
    routingPrefix: 'RN021001',
    activationDate: '2025-11-15T14:30:00Z',
    notes: 'Fixed Number Portability FNP from legacy PSTN',
  },
  {
    id: 'num-04',
    e164Format: '+622150009999',
    nationalFormat: '(021) 5000-9999',
    blockId: 'blk-01',
    category: 'GEOGRAPHIC',
    status: 'RESERVED',
    customerName: 'VIP Executive Pool',
    serviceCode: 'SVC-RESERVED-VIP',
    assignedNode: 'ID-CGK-IMS-SBC-01',
    notes: 'Golden number pattern reserved for corporate chairman suite',
  },
  {
    id: 'num-05',
    e164Format: '+622150005544',
    nationalFormat: '(021) 5000-5544',
    blockId: 'blk-01',
    category: 'GEOGRAPHIC',
    status: 'QUARANTINE',
    customerName: 'Former Tenant (Ex-PT Mandiri Sekuritas)',
    assignedNode: 'ID-CGK-IMS-SBC-01',
    notes: 'Regulatory 60-day aging quarantine prior to re-release',
  },
  {
    id: 'num-06',
    e164Format: '08001800888',
    nationalFormat: '0800-1-800-888',
    blockId: 'blk-04',
    category: 'TOLL_FREE_0800',
    status: 'ALLOCATED',
    customerName: 'PT Mitra Global Datacenter',
    customerAccount: 'CUST-MGD-772',
    serviceCode: 'SVC-TOLLFREE-24X7',
    assignedNode: 'Netstream Toll-Free IN-SCP-01',
    locationName: 'Bandung Core Server Room 102',
    activationDate: '2025-09-01T09:00:00Z',
    notes: 'Nationwide 24/7 NOC Hotline Freephone service',
  },
  {
    id: 'num-07',
    e164Format: '+628119001234',
    nationalFormat: '0811-900-1234',
    blockId: 'blk-03',
    category: 'MOBILE_MSISDN',
    status: 'ALLOCATED',
    customerName: 'Hendra Wijaya (Executive SIM)',
    customerAccount: 'MSISDN-POSTPAID-001',
    serviceCode: 'SVC-5G-ULTRA-POSTPAID',
    assignedNode: 'Netstream LTE/5G EPC HSS-01',
    activationDate: '2026-01-10T11:00:00Z',
    notes: 'Postpaid Priority Voice & VoLTE / VoNR enabled',
  },
  {
    id: 'num-08',
    e164Format: '+628119009876',
    nationalFormat: '0811-900-9876',
    blockId: 'blk-03',
    category: 'MOBILE_MSISDN',
    status: 'PORTED_OUT',
    customerName: 'Ex-Subscriber Account',
    donorOperator: 'Netstream Mobile',
    recipientOperator: 'PT Indosat Ooredoo Hutchison',
    portingDirection: 'PORTED_OUT',
    routingPrefix: 'RN0815001',
    activationDate: '2025-04-12T08:00:00Z',
    notes: 'Ported out to Indosat IM3 via MNP clearinghouse',
  }
];

let localPorting: PortingRecord[] = [
  {
    id: 'port-01',
    portingReference: 'MNP-2026-0811-094',
    telephoneNumber: '+628119009876',
    direction: 'PORTED_OUT',
    donorOperator: 'Netstream Mobile',
    recipientOperator: 'PT Indosat Ooredoo Hutchison',
    requestDate: '2026-02-14T09:00:00Z',
    portingDueDate: '2026-02-16T17:00:00Z',
    completedDate: '2026-02-16T15:30:00Z',
    status: 'COMPLETED',
    regulatoryClearanceCode: 'BRTI-MNP-CLEAR-8812',
    requesterName: 'Budi Hartono',
    notes: 'MNP standard verification complete without dispute',
  },
  {
    id: 'port-02',
    portingReference: 'FNP-2026-021-0081',
    telephoneNumber: '+622150002888',
    direction: 'PORTED_IN',
    donorOperator: 'PT Telkom Indonesia Tbk',
    recipientOperator: 'Netstream Telco',
    requestDate: '2025-11-10T10:15:00Z',
    portingDueDate: '2025-11-15T12:00:00Z',
    completedDate: '2025-11-15T11:45:00Z',
    status: 'COMPLETED',
    regulatoryClearanceCode: 'KOMINFO-FNP-2025-991',
    requesterName: 'PT Telekomunikasi Selular Legal',
    notes: 'Corporate DID block migration into SCBD SIP Trunk',
  },
  {
    id: 'port-03',
    portingReference: 'MNP-2026-0811-120',
    telephoneNumber: '+628119005511',
    direction: 'PORTED_IN',
    donorOperator: 'PT XL Axiata Tbk',
    recipientOperator: 'Netstream Mobile',
    requestDate: '2026-03-05T14:20:00Z',
    portingDueDate: '2026-03-10T17:00:00Z',
    status: 'PENDING_APPROVAL',
    regulatoryClearanceCode: 'BRTI-PENDING-SUBMISSION',
    requesterName: 'Siti Rahmawati',
    notes: 'Awaiting donor operator authentication ACK',
  }
];

export const telephonyApi = {
  // Blocks
  getNumberBlocks: async (): Promise<NumberBlock[]> => {
    try {
      const res = await apiClient.get('/api/v1/telephony/blocks');
      if (Array.isArray(res.data)) {
        localBlocks = res.data;
        return res.data;
      }
    } catch {
      // fallback
    }
    return localBlocks;
  },

  createNumberBlock: async (req: CreateBlockRequest): Promise<NumberBlock> => {
    try {
      const res = await apiClient.post('/api/v1/telephony/blocks', req);
      if (res.data) {
        localBlocks.unshift(res.data);
        return res.data;
      }
    } catch {
      // fallback
    }

    const newBlock: NumberBlock = {
      id: `blk-${Date.now()}`,
      prefix: req.prefix,
      blockPattern: req.blockPattern,
      countryCode: req.countryCode || '+62',
      areaCode: req.areaCode,
      regionName: req.regionName,
      category: req.category,
      rangeStart: req.rangeStart,
      rangeEnd: req.rangeEnd,
      totalCapacity: req.totalCapacity,
      allocatedCount: 0,
      reservedCount: 0,
      quarantineCount: 0,
      portedCount: 0,
      utilizationPct: 0.0,
      regulatoryAuthorityRef: req.regulatoryAuthorityRef,
      operatorOrNode: req.operatorOrNode,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    localBlocks.unshift(newBlock);
    return newBlock;
  },

  // Telephone Numbers
  getNumbers: async (): Promise<TelephoneNumber[]> => {
    try {
      const res = await apiClient.get('/api/v1/telephony/numbers');
      if (Array.isArray(res.data)) {
        localNumbers = res.data;
        return res.data;
      }
    } catch {
      // fallback
    }
    return localNumbers;
  },

  allocateNumber: async (req: AllocateNumberRequest): Promise<TelephoneNumber> => {
    try {
      const res = await apiClient.post('/api/v1/telephony/numbers', req);
      if (res.data) {
        localNumbers.unshift(res.data);
        return res.data;
      }
    } catch {
      // fallback
    }

    const newNum: TelephoneNumber = {
      id: `num-${Date.now()}`,
      e164Format: req.e164Format,
      nationalFormat: req.nationalFormat,
      blockId: req.blockId,
      category: req.category,
      status: req.status || 'ALLOCATED',
      customerName: req.customerName,
      customerAccount: req.customerAccount,
      serviceCode: req.serviceCode,
      assignedNode: req.assignedNode,
      locationName: req.locationName,
      activationDate: new Date().toISOString(),
      notes: req.notes,
    };

    // Update block counter
    const matchedBlock = localBlocks.find(b => b.id === req.blockId);
    if (matchedBlock) {
      matchedBlock.allocatedCount += 1;
      matchedBlock.utilizationPct = Number(((matchedBlock.allocatedCount / matchedBlock.totalCapacity) * 100).toFixed(1));
    }

    localNumbers.unshift(newNum);
    return newNum;
  },

  updateNumber: async (id: string, updates: Partial<TelephoneNumber>): Promise<TelephoneNumber> => {
    try {
      const res = await apiClient.put(`/api/v1/telephony/numbers/${id}`, updates);
      if (res.data) return res.data;
    } catch {
      // fallback
    }

    const idx = localNumbers.findIndex(n => n.id === id);
    if (idx !== -1) {
      localNumbers[idx] = { ...localNumbers[idx], ...updates };
      return localNumbers[idx];
    }
    throw new Error('Telephone number record not found');
  },

  releaseNumber: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/v1/telephony/numbers/${id}`);
    } catch {
      // fallback
    }

    const target = localNumbers.find(n => n.id === id);
    if (target) {
      const blk = localBlocks.find(b => b.id === target.blockId);
      if (blk && blk.allocatedCount > 0) {
        blk.allocatedCount -= 1;
        blk.quarantineCount += 1; // Put into quarantine
        blk.utilizationPct = Number(((blk.allocatedCount / blk.totalCapacity) * 100).toFixed(1));
      }
      target.status = 'QUARANTINE';
      target.customerName = undefined;
      target.notes = 'Released into 60-day regulatory quarantine';
    }
    return true;
  },

  // Porting (MNP / FNP)
  getPortingRecords: async (): Promise<PortingRecord[]> => {
    try {
      const res = await apiClient.get('/api/v1/telephony/porting');
      if (Array.isArray(res.data)) {
        localPorting = res.data;
        return res.data;
      }
    } catch {
      // fallback
    }
    return localPorting;
  },

  createPortingRequest: async (req: CreatePortingRequest): Promise<PortingRecord> => {
    try {
      const res = await apiClient.post('/api/v1/telephony/porting', req);
      if (res.data) {
        localPorting.unshift(res.data);
        return res.data;
      }
    } catch {
      // fallback
    }

    const newRecord: PortingRecord = {
      id: `port-${Date.now()}`,
      portingReference: `NP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      telephoneNumber: req.telephoneNumber,
      direction: req.direction,
      donorOperator: req.donorOperator,
      recipientOperator: req.recipientOperator,
      requestDate: new Date().toISOString(),
      portingDueDate: req.portingDueDate,
      status: 'PENDING_APPROVAL',
      regulatoryClearanceCode: `REG-CLEAR-${Math.floor(10000 + Math.random() * 90000)}`,
      requesterName: req.requesterName,
      notes: req.notes,
    };

    localPorting.unshift(newRecord);
    return newRecord;
  },

  // Softswitch & IMS Auto-Discovery Simulation
  discoverImsNumbersLive: async (): Promise<ImsDiscoveryResult[]> => {
    await new Promise(r => setTimeout(r, 1300));

    return [
      {
        phoneNumber: '+622150001000',
        sipUri: 'sip:+622150001000@ims.netstream.id',
        imsNode: 'ID-CGK-IMS-SBC-01',
        userAgent: 'Audiocodes-Mediant/7.40',
        ipAddress: '10.240.10.15',
        registrationStatus: 'REGISTERED',
        lastRegisterTime: new Date().toISOString(),
      },
      {
        phoneNumber: '+622150001001',
        sipUri: 'sip:+622150001001@ims.netstream.id',
        imsNode: 'ID-CGK-IMS-SBC-01',
        userAgent: 'Cisco-CP8865/14.0.1',
        ipAddress: '10.240.10.45',
        registrationStatus: 'REGISTERED',
        lastRegisterTime: new Date().toISOString(),
      },
      {
        phoneNumber: '+622150007788',
        sipUri: 'sip:+622150007788@ims.netstream.id',
        imsNode: 'ID-CGK-IMS-SBC-01',
        userAgent: 'Grandstream-GXP2170',
        ipAddress: '172.16.100.88',
        registrationStatus: 'ROGUE_UNMAPPED',
        lastRegisterTime: new Date().toISOString(),
      },
      {
        phoneNumber: '+628119001234',
        sipUri: 'tel:+628119001234',
        imsNode: 'Netstream LTE/5G EPC HSS-01',
        userAgent: 'VoLTE-Apple-iPhone15/17.4',
        ipAddress: '100.64.12.89',
        registrationStatus: 'REGISTERED',
        lastRegisterTime: new Date().toISOString(),
      }
    ];
  }
};
