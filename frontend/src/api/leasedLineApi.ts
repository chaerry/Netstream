import apiClient from './apiClient';
import {
  LeasedLineCircuit,
  CreateCircuitPayload,
  LeasedLineCarrier,
  LeasedLineContract,
  LeasedLineInvoice,
  CapacityAuditReport,
  SlaIncident,
  LogSlaIncidentPayload,
  InitiateDecomPayload,
  DecomRequestResponse,
  CircuitTopologyPath,
} from '../types/leasedLine';
import {
  mockLeasedLineCircuits,
  mockLeasedLineCarriers,
  mockLeasedLineContracts,
  mockLeasedLineInvoices,
  mockCapacityAuditReport,
  mockSlaIncidents,
  mockCircuitTopologyPaths,
} from './mockData';

export interface PagedResponse<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const leasedLineApi = {
  // Circuits
  async getCircuits(params?: {
    query?: string;
    direction?: string;
    technology?: string;
    status?: string;
    carrierId?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<LeasedLineCircuit>> {
    try {
      const res = await apiClient.get<PagedResponse<LeasedLineCircuit>>('/api/v1/leased-lines/circuits', { params });
      return res.data;
    } catch {
      // Mock Fallback
      let list = [...mockLeasedLineCircuits];
      if (params?.direction) {
        list = list.filter((c) => c.direction === params.direction);
      }
      if (params?.technology) {
        list = list.filter((c) => c.technology === params.technology);
      }
      if (params?.status) {
        list = list.filter((c) => c.status === params.status);
      }
      if (params?.carrierId) {
        list = list.filter((c) => c.carrierId === params.carrierId);
      }
      if (params?.query) {
        const q = params.query.toLowerCase();
        list = list.filter(
          (c) =>
            c.circuitId.toLowerCase().includes(q) ||
            c.circuitName.toLowerCase().includes(q) ||
            c.customerName?.toLowerCase().includes(q) ||
            c.carrierCircuitId?.toLowerCase().includes(q)
        );
      }
      return {
        items: list,
        totalElements: list.length,
        totalPages: 1,
        currentPage: 0,
        pageSize: params?.size || 20,
      };
    }
  },

  async getCircuitById(id: string): Promise<LeasedLineCircuit> {
    try {
      const res = await apiClient.get<LeasedLineCircuit>(`/api/v1/leased-lines/circuits/${id}`);
      return res.data;
    } catch {
      const found = mockLeasedLineCircuits.find((c) => c.id === id || c.circuitId === id);
      if (!found) throw new Error(`Circuit ${id} not found`);
      return found;
    }
  },

  async createCircuit(payload: CreateCircuitPayload): Promise<LeasedLineCircuit> {
    try {
      const res = await apiClient.post<LeasedLineCircuit>('/api/v1/leased-lines/circuits', payload);
      return res.data;
    } catch {
      const newCircuit: LeasedLineCircuit = {
        id: 'CKT-' + Date.now().toString().slice(-6),
        ...payload,
        status: payload.status || 'ACTIVE',
        bandwidthDisplay: payload.bandwidthDisplay || (payload.bandwidthMbps >= 1000 ? `${payload.bandwidthMbps / 1000} Gbps` : `${payload.bandwidthMbps} Mbps`),
        slaTier: payload.slaTier || 'GOLD_99_99',
        uptimeTargetPercent: payload.uptimeTargetPercent || 99.99,
        mttrTargetHours: payload.mttrTargetHours || 4.0,
        committedLatencyMs: payload.committedLatencyMs || 15.0,
        actualLatencyMs: payload.committedLatencyMs ? payload.committedLatencyMs * 0.85 : 12.0,
        jitterMs: 1.2,
        packetLossPercent: 0.001,
        currency: payload.currency || 'USD',
        nrc: payload.nrc || 0,
        utilizationPercent: 45.0,
        isDormant: false,
        potentialMonthlySavings: 0,
        activationDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      mockLeasedLineCircuits.unshift(newCircuit);
      return newCircuit;
    }
  },

  async updateCircuit(id: string, payload: Partial<CreateCircuitPayload>): Promise<LeasedLineCircuit> {
    try {
      const res = await apiClient.put<LeasedLineCircuit>(`/api/v1/leased-lines/circuits/${id}`, payload);
      return res.data;
    } catch {
      const index = mockLeasedLineCircuits.findIndex((c) => c.id === id || c.circuitId === id);
      if (index === -1) throw new Error('Circuit not found');
      mockLeasedLineCircuits[index] = {
        ...mockLeasedLineCircuits[index],
        ...payload,
      };
      return mockLeasedLineCircuits[index];
    }
  },

  async getCircuitTopology(id: string): Promise<CircuitTopologyPath> {
    try {
      const res = await apiClient.get<CircuitTopologyPath>(`/api/v1/leased-lines/circuits/${id}/topology`);
      return res.data;
    } catch {
      return (
        mockCircuitTopologyPaths[id] || {
          circuitId: id,
          circuitName: 'Point-to-Point Circuit Span',
          technology: 'EPL',
          bandwidthDisplay: '10 Gbps',
          hops: [
            { sequence: 1, hopType: 'LOCATION', name: 'Origin Datacenter', details: 'Site Meet-Me-Room', status: 'ACTIVE' },
            { sequence: 2, hopType: 'DEVICE_PORT', name: 'PE-Router-01 : Xe-0/0/1', details: 'SFP+ 10G-LR Transceiver', status: 'ACTIVE' },
            { sequence: 3, hopType: 'FIBER_STRAND', name: 'Backbone Fiber Span', details: 'Strand #1 (Single-Mode G.652D)', status: 'ACTIVE' },
            { sequence: 4, hopType: 'VNE_OVERLAY', name: 'VLAN 100 / EVPN-VPWS', details: 'Circuit Cross-Connect ID 99401', status: 'ACTIVE' },
            { sequence: 5, hopType: 'DEVICE_PORT', name: 'PE-Router-02 : Xe-0/0/2', details: 'SFP+ 10G-LR Transceiver', status: 'ACTIVE' },
            { sequence: 6, hopType: 'LOCATION', name: 'Destination Datacenter', details: 'Remote Exchange Facility', status: 'ACTIVE' },
          ],
        }
      );
    }
  },

  // Capacity Audit (OpEx Optimization Engine)
  async getCapacityAudit(): Promise<CapacityAuditReport> {
    try {
      const res = await apiClient.get<CapacityAuditReport>('/api/v1/leased-lines/capacity/audit');
      return res.data;
    } catch {
      return mockCapacityAuditReport;
    }
  },

  // Gaharu BPMN Integration
  async triggerGaharuDecommission(payload: InitiateDecomPayload): Promise<DecomRequestResponse> {
    try {
      const res = await apiClient.post<DecomRequestResponse>(
        '/api/v1/leased-lines/capacity/decommission/gaharu-trigger',
        payload
      );
      return res.data;
    } catch {
      const circuit = mockLeasedLineCircuits.find((c) => c.id === payload.circuitId || c.circuitId === payload.circuitId);
      if (circuit) {
        circuit.status = 'PENDING_DECOMMISSION';
        circuit.decommissionDate = payload.targetDecomDate;
      }
      return {
        id: 'DCM-' + Date.now().toString().slice(-6),
        circuitId: payload.circuitId,
        circuitName: circuit ? circuit.circuitName : 'Leased Circuit',
        gaharuProcessInstanceId: `gaharu_bpmn_inst_${Date.now()}_leased_line_cancellation`,
        initiatedBy: payload.initiatedBy,
        reason: payload.reason,
        targetDecomDate: payload.targetDecomDate,
        estimatedAnnualSavingsUsd: circuit ? circuit.mrc * 12 : 33600,
        workflowState: 'BPMN_SUBMITTED',
        gaharuResponsePayload: JSON.stringify({
          status: 'RUNNING',
          processDefinitionKey: 'leased_line_decom_v1',
          assignedToGroup: 'CARRIER_RELATIONS',
          milestones: ['LEGAL_NOTICE_SENT', 'PHYSICAL_PORT_SHUTDOWN', 'FINAL_BILL_RECONCILIATION'],
        }),
        createdAt: new Date().toISOString(),
      };
    }
  },

  // Invoices
  async getInvoiceAudits(carrierId?: string): Promise<LeasedLineInvoice[]> {
    try {
      const res = await apiClient.get<LeasedLineInvoice[]>('/api/v1/leased-lines/invoices/audit', {
        params: { carrierId },
      });
      return res.data;
    } catch {
      if (carrierId) {
        return mockLeasedLineInvoices.filter((inv) => inv.carrierId === carrierId);
      }
      return mockLeasedLineInvoices;
    }
  },

  // SLA Incidents
  async getSlaIncidents(circuitId?: string): Promise<SlaIncident[]> {
    try {
      const res = await apiClient.get<SlaIncident[]>('/api/v1/leased-lines/sla/incidents', {
        params: { circuitId },
      });
      return res.data;
    } catch {
      if (circuitId) {
        return mockSlaIncidents.filter((inc) => inc.circuitId === circuitId);
      }
      return mockSlaIncidents;
    }
  },

  async logSlaIncident(payload: LogSlaIncidentPayload): Promise<SlaIncident> {
    try {
      const res = await apiClient.post<SlaIncident>('/api/v1/leased-lines/sla/incidents', payload);
      return res.data;
    } catch {
      const newInc: SlaIncident = {
        id: 'INC-' + Date.now().toString().slice(-6),
        circuitId: payload.circuitId,
        circuitName: 'Leased Circuit Incident',
        ticketNumber: payload.ticketNumber,
        carrierTicketNumber: payload.carrierTicketNumber,
        incidentStart: payload.incidentStart,
        incidentEnd: payload.incidentEnd,
        durationMinutes: payload.durationMinutes || 180,
        targetMttrMinutes: payload.targetMttrMinutes || 240,
        isMttrBreached: (payload.durationMinutes || 180) > (payload.targetMttrMinutes || 240),
        outageType: payload.outageType || 'FIBER_CUT',
        rootCause: payload.rootCause,
        currency: payload.currency || 'USD',
        penaltyRebateAmount: payload.penaltyRebateAmount || 0,
        claimStatus: (payload.penaltyRebateAmount || 0) > 0 ? 'PENDING_CLAIM' : 'NO_PENALTY',
        createdAt: new Date().toISOString(),
      };
      mockSlaIncidents.unshift(newInc);
      return newInc;
    }
  },

  // Carriers & Contracts
  async getCarriers(): Promise<LeasedLineCarrier[]> {
    try {
      const res = await apiClient.get<LeasedLineCarrier[]>('/api/v1/leased-lines/carriers');
      return res.data;
    } catch {
      return mockLeasedLineCarriers;
    }
  },

  async getContracts(): Promise<LeasedLineContract[]> {
    try {
      const res = await apiClient.get<LeasedLineContract[]>('/api/v1/leased-lines/contracts');
      return res.data;
    } catch {
      return mockLeasedLineContracts;
    }
  },
};
