import apiClient from './apiClient';
import {
  NetworkDevice,
  DeviceTypeOption,
  VirtualNetworkElement,
  NetworkService,
  LocationNode,
  Rack,
  DevicePort,
  CapacityForecast,
  CostCalculationResult,
  PagedResponse,
  OpticalCable,
  CableStrand,
  CreateCableRequest,
  UpdateCableRequest,
  UpdateStrandRequest
} from '../types/inventory';
import {
  mockDevices,
  mockVnes,
  mockServices,
  mockLocations,
  mockRacks,
  mockForecasts,
  mockOpticalCables
} from './mockData';

// In-memory store for live UI updates when running in sandbox/fallback mode
let localDevices = [...mockDevices];
let localVnes = [...mockVnes];
let localServices = [...mockServices];
let localRacks = [...mockRacks];
let localLocations = [...mockLocations];
let localCables = [...mockOpticalCables];

const defaultDeviceTypes: DeviceTypeOption[] = [
  { code: 'ROUTER', label: 'Core / Edge Router' },
  { code: 'SWITCH', label: 'Data Center Switch' },
  { code: 'DWDM_CHASSIS', label: 'DWDM Optical Transport' },
  { code: 'OLT', label: 'GPON / XGS-PON OLT' },
  { code: 'METRO', label: 'Metro Ethernet / Aggregation Switch' },
  { code: 'FIREWALL', label: 'NextGen Firewall' },
  { code: 'SERVER', label: 'Hypervisor Server' },
  { code: 'ODF', label: 'Optical Distribution Frame (ODF)' },
  { code: 'DDF', label: 'Digital Distribution Frame (DDF)' },
  { code: 'DSLAM', label: 'DSLAM Access Node' },
  { code: 'PATCH_PANEL', label: 'Patch Panel' }
];

export const inventoryApi = {
  // --------------------------------------------------------------------------
  // 1.1 Physical Inventory (Devices & Ports)
  // --------------------------------------------------------------------------
  getDeviceTypes: async (): Promise<DeviceTypeOption[]> => {
    try {
      const response = await apiClient.get('/api/v1/inventory/devices/types');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return defaultDeviceTypes;
    } catch {
      return defaultDeviceTypes;
    }
  },

  getDevices: async (params?: { search?: string; type?: string; status?: string; page?: number; size?: number }): Promise<PagedResponse<NetworkDevice>> => {
    const cleanSearch = params?.search ? params.search.trim().replace(/\s+/g, ' ') : undefined;
    const cleanParams = params ? { ...params, search: cleanSearch || undefined } : undefined;

    try {
      const response = await apiClient.get('/api/v1/inventory/devices', { params: cleanParams });
      return response.data;
    } catch (err) {
      console.info('[inventoryApi] Backend unreachable, serving local sandbox dataset');
      let filtered = [...localDevices];
      if (cleanSearch) {
        const q = cleanSearch.toLowerCase();
        filtered = filtered.filter(d => 
          d.hostname.toLowerCase().includes(q) || 
          d.serialNumber.toLowerCase().includes(q) ||
          d.model.toLowerCase().includes(q) ||
          d.vendor.toLowerCase().includes(q) ||
          (d.managementIp && d.managementIp.toLowerCase().includes(q)) ||
          (d.assetTag && d.assetTag.toLowerCase().includes(q))
        );
      }
      if (params?.type) {
        filtered = filtered.filter(d => d.deviceType === params.type);
      }
      if (params?.status) {
        filtered = filtered.filter(d => d.status === params.status);
      }
      const page = params?.page !== undefined ? params.page : 0;
      const size = params?.size !== undefined ? params.size : 10;
      const start = page * size;
      const pageItems = filtered.slice(start, start + size);

      return {
        items: pageItems,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
        currentPage: page,
        pageSize: size,
      };
    }
  },

  getDeviceById: async (id: string): Promise<NetworkDevice> => {
    try {
      const response = await apiClient.get(`/api/v1/inventory/devices/${id}`);
      return response.data;
    } catch {
      const found = localDevices.find(d => d.id === id);
      if (!found) throw new Error('Device not found');
      return found;
    }
  },

  getDevicesByRack: async (rackId: string): Promise<NetworkDevice[]> => {
    try {
      const response = await apiClient.get(`/api/v1/inventory/devices/rack/${rackId}`);
      return response.data;
    } catch {
      return localDevices.filter(d => d.rackId === rackId);
    }
  },

  createDevice: async (data: Partial<NetworkDevice>): Promise<NetworkDevice> => {
    try {
      const response = await apiClient.post('/api/v1/inventory/devices', data);
      return response.data;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.info('[inventoryApi] Backend unreachable, creating in local sandbox dataset');
      const newDev: NetworkDevice = {
        id: `dev-${Date.now()}`,
        locationId: data.locationId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        locationName: 'Jakarta Mega PoP Hub',
        rackId: data.rackId || 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        rackNumber: 'RACK-A01',
        hostname: data.hostname || `DEV-${Date.now()}`,
        serialNumber: data.serialNumber || `SN-${Date.now()}`,
        assetTag: data.assetTag || `AST-${Date.now()}`,
        deviceType: data.deviceType || 'ROUTER',
        vendor: data.vendor || 'Cisco',
        model: data.model || 'ASR-9000',
        hardwareVersion: data.hardwareVersion || 'V1.0',
        firmwareVersion: data.firmwareVersion || 'v12.0',
        rackUnitStart: data.rackUnitStart || 10,
        rackUnitHeight: data.rackUnitHeight || 2,
        status: data.status || 'PLANNED',
        managementIp: data.managementIp || '10.0.0.1',
        totalPorts: 16,
        costUsd: data.costUsd || 15000,
        ports: [
          { id: `p-${Date.now()}-1`, portName: 'HundredGigE0/0/0/0', portSpeedMbps: 100000, mediumType: 'FIBER_SINGLE_MODE', connectorType: 'LC/UPC', isOperational: true, isAllocated: false },
          { id: `p-${Date.now()}-2`, portName: 'TenGigE0/0/1/0', portSpeedMbps: 10000, mediumType: 'FIBER_SINGLE_MODE', connectorType: 'LC/UPC', isOperational: true, isAllocated: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'NOC_Operator',
        updatedBy: 'NOC_Operator',
      };
      localDevices = [newDev, ...localDevices];
      return newDev;
    }
  },

  updateDevice: async (id: string, updateData: Partial<NetworkDevice>): Promise<NetworkDevice> => {
    try {
      const response = await apiClient.put(`/api/v1/inventory/devices/${id}`, updateData);
      return response.data;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      localDevices = localDevices.map(d => d.id === id ? { ...d, ...updateData, updatedAt: new Date().toISOString() } : d);
      const updated = localDevices.find(d => d.id === id);
      return updated!;
    }
  },

  updateDeviceStatus: async (id: string, status: string, reason?: string): Promise<NetworkDevice> => {
    try {
      const response = await apiClient.patch(`/api/v1/inventory/devices/${id}/status`, { status, reason });
      return response.data;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      localDevices = localDevices.map(d => d.id === id ? { ...d, status: status as any, updatedAt: new Date().toISOString() } : d);
      const updated = localDevices.find(d => d.id === id);
      return updated!;
    }
  },

  deleteDevice: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/inventory/devices/${id}`);
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      localDevices = localDevices.filter(d => d.id !== id);
    }
  },

  addPort: async (deviceId: string, portData: any): Promise<DevicePort> => {
    try {
      const response = await apiClient.post(`/api/v1/inventory/devices/${deviceId}/ports`, portData);
      return response.data;
    } catch {
      const newPort: DevicePort = {
        id: `port-${Date.now()}`,
        deviceId,
        portName: portData.portName,
        portSpeedMbps: portData.portSpeedMbps || 10000,
        mediumType: portData.mediumType || 'FIBER_SINGLE_MODE',
        connectorType: portData.connectorType || 'LC/UPC',
        isOperational: true,
        isAllocated: false,
      };
      localDevices = localDevices.map(d => {
        if (d.id === deviceId) {
          return {
            ...d,
            ports: [...(d.ports || []), newPort],
            totalPorts: (d.totalPorts || 0) + 1
          };
        }
        return d;
      });
      return newPort;
    }
  },

  allocatePort: async (portId: string, data: {
    serviceId: string;
    resourceRole?: string;
    allocatedBandwidthMbps?: number;
    hopOrder?: number;
    connectedPortId?: string;
    portNameOverride?: string;
    vneNameOverride?: string;
  }): Promise<DevicePort> => {
    try {
      const response = await apiClient.post(`/api/v1/inventory/devices/ports/${portId}/allocate`, data);
      return response.data;
    } catch {
      // Local fallback
      let updatedPort: DevicePort | null = null;
      localDevices = localDevices.map(d => {
        const pList = (d.ports || []).map(p => {
          if (p.id === portId) {
            const svc = localServices.find(s => s.id === data.serviceId);
            const effPortName = data.portNameOverride || p.portName;
            updatedPort = {
              ...p,
              portName: effPortName,
              isAllocated: true,
              connectedPortId: data.connectedPortId || p.connectedPortId,
              allocatedServiceId: data.serviceId,
              allocatedServiceCode: svc ? svc.serviceCode : 'SVC-CIRCUIT-01',
              allocatedCustomerName: svc ? svc.customerName : 'Enterprise Customer',
              allocatedResourceRole: data.resourceRole || 'ACCESS_PORT',
              allocatedBandwidthMbps: data.allocatedBandwidthMbps || p.portSpeedMbps,
            };

            if (svc) {
              const newHop = {
                id: `map-${Date.now()}`,
                deviceId: d.id,
                deviceHostname: d.hostname,
                portId: p.id,
                portName: effPortName,
                vneName: data.vneNameOverride,
                resourceRole: data.resourceRole || 'ACCESS_PORT',
                hopOrder: data.hopOrder || ((svc.resourceMappings?.length || 0) + 1),
                allocatedBandwidthMbps: data.allocatedBandwidthMbps || p.portSpeedMbps
              };
              const existingMaps = (svc.resourceMappings || []).filter(m => m.portId !== portId && m.hopOrder !== data.hopOrder);
              svc.resourceMappings = [...existingMaps, newHop].sort((a, b) => a.hopOrder - b.hopOrder);
            }

            return updatedPort;
          }
          if (data.connectedPortId && p.id === data.connectedPortId) {
            return {
              ...p,
              connectedPortId: portId,
            };
          }
          return p;
        });
        return { ...d, ports: pList };
      });
      return updatedPort || {
        id: portId,
        portName: 'Port',
        portSpeedMbps: 10000,
        mediumType: 'FIBER_SINGLE_MODE',
        connectorType: 'LC/UPC',
        isOperational: true,
        isAllocated: true,
        connectedPortId: data.connectedPortId,
        allocatedServiceId: data.serviceId,
        allocatedServiceCode: 'SVC-CIRCUIT-01',
        allocatedCustomerName: 'Enterprise Customer',
      };
    }
  },

  releasePort: async (portId: string): Promise<DevicePort> => {
    try {
      const response = await apiClient.post(`/api/v1/inventory/devices/ports/${portId}/release`);
      return response.data;
    } catch {
      // Local fallback
      let updatedPort: DevicePort | null = null;
      localDevices = localDevices.map(d => {
        const pList = (d.ports || []).map(p => {
          if (p.id === portId) {
            updatedPort = {
              ...p,
              isAllocated: false,
              allocatedServiceId: undefined,
              allocatedServiceCode: undefined,
              allocatedCustomerName: undefined,
              allocatedResourceRole: undefined,
              allocatedBandwidthMbps: undefined,
            };
            return updatedPort;
          }
          return p;
        });
        return { ...d, ports: pList };
      });
      return updatedPort || {
        id: portId,
        portName: 'Port',
        portSpeedMbps: 10000,
        mediumType: 'FIBER_SINGLE_MODE',
        connectorType: 'LC/UPC',
        isOperational: true,
        isAllocated: false,
      };
    }
  },

  // --------------------------------------------------------------------------
  // 1.2 Logical & Virtual Inventory (VNE/VNF)
  // --------------------------------------------------------------------------
  getVnes: async (): Promise<VirtualNetworkElement[]> => {
    try {
      const response = await apiClient.get('/api/v1/inventory/virtual');
      return response.data;
    } catch {
      return localVnes;
    }
  },

  createVne: async (data: Partial<VirtualNetworkElement>): Promise<VirtualNetworkElement> => {
    try {
      const response = await apiClient.post('/api/v1/inventory/virtual', data);
      return response.data;
    } catch {
      const newVne: VirtualNetworkElement = {
        id: `vne-${Date.now()}`,
        hypervisorDeviceId: data.hypervisorDeviceId || 'dev-001',
        hypervisorHostname: 'ID-CGK-PE-RTR-01',
        vneName: data.vneName || `vRouter-${Date.now()}`,
        vnfType: data.vnfType || 'vRouter-CSR1000v',
        vlanId: data.vlanId || 2020,
        vrfName: data.vrfName || 'VRF_CUSTOMER_VPN',
        allocatedVcpu: data.allocatedVcpu || 4,
        allocatedRamGb: data.allocatedRamGb || 8,
        allocatedDiskGb: data.allocatedDiskGb || 80,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localVnes = [newVne, ...localVnes];
      return newVne;
    }
  },

  deleteVne: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/inventory/virtual/${id}`);
    } catch {
      localVnes = localVnes.filter(v => v.id !== id);
    }
  },

  // --------------------------------------------------------------------------
  // 1.3 Service Inventory
  // --------------------------------------------------------------------------
  getServices: async (params?: { search?: string; type?: string; status?: string }): Promise<NetworkService[]> => {
    try {
      const response = await apiClient.get('/api/v1/inventory/services', { params });
      return response.data;
    } catch {
      return localServices;
    }
  },

  createService: async (data: Partial<NetworkService>): Promise<NetworkService> => {
    try {
      const response = await apiClient.post('/api/v1/inventory/services', data);
      return response.data;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      console.info('[inventoryApi] Backend unreachable, creating service in local sandbox dataset');
      const newSvc: NetworkService = {
        id: `svc-${Date.now()}`,
        serviceCode: data.serviceCode || `SVC-VPN-${Date.now()}`,
        customerName: data.customerName || 'Enterprise Customer',
        serviceType: data.serviceType || 'L3_VPN_MPLS',
        bandwidthMbps: data.bandwidthMbps || 5000,
        slaTier: data.slaTier || 'GOLD',
        slaAvailabilityPct: data.slaAvailabilityPct || 99.95,
        monthlyRecurringCost: data.monthlyRecurringCost || 8500,
        status: 'PROVISIONING',
        aEndLocationId: 'loc-cgk-site',
        aEndLocationName: 'Jakarta Mega PoP Hub',
        zEndLocationId: 'loc-sub-site',
        zEndLocationName: 'Surabaya Metro Gateway',
        activationDate: new Date().toISOString(),
        resourceMappings: [
          { id: `m-${Date.now()}-1`, deviceId: 'dev-001', deviceHostname: 'ID-CGK-PE-RTR-01', portId: 'p-101', portName: 'HundredGigE0/0/0/0', resourceRole: 'PE_ORIGIN', hopOrder: 1, allocatedBandwidthMbps: data.bandwidthMbps || 5000 },
          { id: `m-${Date.now()}-2`, deviceId: 'dev-003', deviceHostname: 'ID-CGK-DWDM-OPT-01', portId: 'p-301', portName: '100G-OTU4-Slot1', resourceRole: 'DWDM_OPTICAL', hopOrder: 2, allocatedBandwidthMbps: data.bandwidthMbps || 5000 },
          { id: `m-${Date.now()}-3`, deviceId: 'dev-004', deviceHostname: 'ID-SUB-PE-RTR-01', portId: 'p-401', portName: 'HundredGigE0/0/0/0', resourceRole: 'PE_TERMINATION', hopOrder: 3, allocatedBandwidthMbps: data.bandwidthMbps || 5000 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'NOC_Operator',
        updatedBy: 'NOC_Operator',
      };
      localServices = [newSvc, ...localServices];
      return newSvc;
    }
  },

  updateServiceStatus: async (id: string, status: string): Promise<NetworkService> => {
    try {
      const response = await apiClient.patch(`/api/v1/inventory/services/${id}/status?status=${status}`);
      return response.data;
    } catch {
      localServices = localServices.map(s => s.id === id ? { ...s, status: status as any, updatedAt: new Date().toISOString() } : s);
      return localServices.find(s => s.id === id)!;
    }
  },

  deleteService: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/inventory/services/${id}`);
    } catch (err: any) {
      if (err.response) {
        throw err;
      }
      localServices = localServices.filter(s => s.id !== id);
    }
  },

  // --------------------------------------------------------------------------
  // 1.7 Location & Rack Hierarchy
  // --------------------------------------------------------------------------
  getLocationTree: async (): Promise<LocationNode[]> => {
    try {
      const response = await apiClient.get('/api/v1/inventory/locations/tree');
      return response.data;
    } catch {
      return localLocations;
    }
  },

  getRacks: async (): Promise<Rack[]> => {
    try {
      const response = await apiClient.get('/api/v1/inventory/locations/racks');
      if (response.data && response.data.length > 0) return response.data;
      return localRacks;
    } catch {
      return localRacks;
    }
  },

  getRacksByLocation: async (locationId?: string): Promise<Rack[]> => {
    try {
      if (!locationId || locationId.startsWith('loc-')) {
        const response = await apiClient.get('/api/v1/inventory/locations/racks');
        if (response.data && response.data.length > 0) return response.data;
        return localRacks;
      }
      const response = await apiClient.get(`/api/v1/inventory/locations/${locationId}/racks`);
      if (response.data && response.data.length > 0) return response.data;
      return localRacks;
    } catch {
      return localRacks;
    }
  },

  createLocation: async (data: {
    parentId?: string | null;
    code: string;
    name: string;
    type: string;
    status?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    contactPerson?: string;
    contactPhone?: string;
  }): Promise<LocationNode> => {
    try {
      const response = await apiClient.post('/api/v1/inventory/locations', data);
      return response.data;
    } catch {
      const newLoc: LocationNode = {
        id: `loc-${Date.now()}`,
        parentId: data.parentId || null,
        code: data.code,
        name: data.name,
        type: data.type as any,
        status: (data.status as any) || 'ACTIVE',
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localLocations.push(newLoc);
      return newLoc;
    }
  },

  updateLocation: async (id: string, data: {
    parentId?: string | null;
    code: string;
    name: string;
    type: string;
    status?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    contactPerson?: string;
    contactPhone?: string;
  }): Promise<LocationNode> => {
    try {
      const response = await apiClient.put(`/api/v1/inventory/locations/${id}`, data);
      return response.data;
    } catch {
      const updateTree = (nodes: LocationNode[]): LocationNode[] => {
        return nodes.map(node => {
          if (node.id === id) {
            return {
              ...node,
              ...data,
              parentId: data.parentId !== undefined ? data.parentId : node.parentId,
              type: data.type as any,
              status: (data.status as any) || node.status || 'ACTIVE',
              updatedAt: new Date().toISOString(),
            };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: updateTree(node.children) };
          }
          return node;
        });
      };
      localLocations = updateTree(localLocations);
      const found: LocationNode = {
        id,
        parentId: data.parentId || null,
        code: data.code,
        name: data.name,
        type: data.type as any,
        status: (data.status as any) || 'ACTIVE',
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return found;
    }
  },

  createRack: async (data: {
    locationId: string;
    rackNumber: string;
    heightUnits?: number;
    maxPowerWatt?: number;
    maxWeightKg?: number;
  }): Promise<Rack> => {
    try {
      const response = await apiClient.post('/api/v1/inventory/locations/racks', data);
      return response.data;
    } catch {
      const newRack: Rack = {
        id: `rack-${Date.now()}`,
        locationId: data.locationId,
        rackNumber: data.rackNumber,
        heightUnits: data.heightUnits || 42,
        maxPowerWatt: data.maxPowerWatt || 5000,
        currentPowerWatt: 0,
        maxWeightKg: data.maxWeightKg || 800,
        status: 'ACTIVE',
        occupiedUnits: 0,
        availableUnits: data.heightUnits || 42,
      };
      localRacks.push(newRack);
      return newRack;
    }
  },

  // --------------------------------------------------------------------------
  // 1.4 - 1.6 Planning & Cost Engine
  // --------------------------------------------------------------------------
  calculatePathCost: async (req: { aEndLocationId?: string; zEndLocationId?: string; requiredBandwidthMbps?: number; routingStrategy?: string }): Promise<CostCalculationResult> => {
    try {
      const response = await apiClient.post('/api/v1/inventory/planning/calculate-cost', req);
      return response.data;
    } catch {
      const strategy = req.routingStrategy || 'LOWEST_COST';
      if (strategy === 'FEWEST_HOPS') {
        return {
          routingStrategy: 'FEWEST_HOPS',
          totalEstimatedCostUsd: 1200.00,
          totalHops: 1,
          totalLatencyMs: 12,
          capacityAvailable: true,
          segments: [
            { hop: 1, fromLocation: 'Jakarta Mega PoP Hub', toLocation: 'Surabaya Metro Gateway', deviceHostname: 'ID-CGK-DWDM-OPT-01', linkType: '100G DWDM Optical Direct Pass', segmentCostUsd: 1200, latencyMs: 12 }
          ]
        };
      } else if (strategy === 'SHORTEST_PATH') {
        return {
          routingStrategy: 'SHORTEST_PATH',
          totalEstimatedCostUsd: 1100.00,
          totalHops: 2,
          totalLatencyMs: 10,
          capacityAvailable: true,
          segments: [
            { hop: 1, fromLocation: 'Jakarta Core Hub', toLocation: 'Bandung Transit Hub', deviceHostname: 'ID-CGK-PE-RTR-01', linkType: '10G Metro Fiber Direct', segmentCostUsd: 450, latencyMs: 4 },
            { hop: 2, fromLocation: 'Bandung Transit Hub', toLocation: 'Surabaya Gateway', deviceHostname: 'ID-BDG-CORE-RTR-01', linkType: '10G Metro Fiber Direct', segmentCostUsd: 650, latencyMs: 6 }
          ]
        };
      } else {
        return {
          routingStrategy: 'LOWEST_COST',
          totalEstimatedCostUsd: 570.00,
          totalHops: 2,
          totalLatencyMs: 17,
          capacityAvailable: true,
          segments: [
            { hop: 1, fromLocation: 'Jakarta Mega PoP Hub', toLocation: 'Semarang Regional Hub', deviceHostname: 'ID-CGK-CORE-SW-01', linkType: 'Shared 100G MPLS Core Backbone', segmentCostUsd: 250, latencyMs: 9 },
            { hop: 2, fromLocation: 'Semarang Regional Hub', toLocation: 'Surabaya Metro Gateway', deviceHostname: 'ID-SMG-PE-RTR-01', linkType: 'Shared 100G MPLS Core Backbone', segmentCostUsd: 320, latencyMs: 8 }
          ]
        };
      }
    }
  },

  getCapacityForecast: async (): Promise<CapacityForecast[]> => {
    try {
      const response = await apiClient.get('/api/v1/inventory/planning/capacity-forecast');
      return response.data;
    } catch {
      return mockForecasts;
    }
  },

  // --------------------------------------------------------------------------
  // 1.7 Optical Cables & Cores (OSP / ISP Fiber Management)
  // --------------------------------------------------------------------------
  getCables: async (): Promise<OpticalCable[]> => {
    try {
      const response = await apiClient.get('/api/v1/inventory/cables');
      if (Array.isArray(response.data)) {
        localCables = response.data;
        return response.data;
      }
      return localCables;
    } catch {
      return localCables;
    }
  },

  getCableById: async (id: string): Promise<OpticalCable> => {
    try {
      const response = await apiClient.get(`/api/v1/inventory/cables/${id}`);
      return response.data;
    } catch {
      const found = localCables.find(c => c.id === id);
      if (!found) throw new Error('Optical cable not found: ' + id);
      return found;
    }
  },

  createCable: async (req: CreateCableRequest): Promise<OpticalCable> => {
    try {
      const response = await apiClient.post('/api/v1/inventory/cables', req);
      const created = response.data;
      localCables = [created, ...localCables.filter(c => c.id !== created.id)];
      return created;
    } catch {
      const TIA_COLORS = [
        ['Blue', '#3b82f6'],
        ['Orange', '#f97316'],
        ['Green', '#22c55e'],
        ['Brown', '#92400e'],
        ['Slate', '#64748b'],
        ['White', '#f8fafc'],
        ['Red', '#ef4444'],
        ['Black', '#1e293b'],
        ['Yellow', '#eab308'],
        ['Violet', '#a855f7'],
        ['Rose', '#ec4899'],
        ['Aqua', '#06b6d4'],
      ];

      const newId = `c1000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`;
      const totalCores = req.totalCores || 24;
      const attDbPerKm = req.attenuationDbPerKm || 0.35;
      const lengthM = req.lengthMeters || 1000;
      const estLoss = Number((attDbPerKm * (lengthM / 1000.0)).toFixed(2));

      const origLoc = localLocations.find(l => l.id === req.originLocationId);
      const origDev = localDevices.find(d => d.id === req.originDeviceId);
      const termLoc = localLocations.find(l => l.id === req.terminationLocationId);
      const termDev = localDevices.find(d => d.id === req.terminationDeviceId);

      const strands: CableStrand[] = [];
      for (let c = 1; c <= totalCores; c++) {
        const colorIdx = (c - 1) % 12;
        const tubeNum = Math.floor((c - 1) / 12) + 1;
        const [cname, chex] = TIA_COLORS[colorIdx];
        strands.push({
          id: `${newId}-s${c}`,
          cableId: newId,
          coreNumber: c,
          tubeNumber: tubeNum,
          colorName: cname,
          colorHex: chex,
          status: 'AVAILABLE',
          measuredLossDb: estLoss,
          remarks: 'Dark Fiber Core (Available)'
        });
      }

      const newCable: OpticalCable = {
        id: newId,
        cableCode: req.cableCode.toUpperCase(),
        cableName: req.cableName,
        cableType: req.cableType,
        fiberGrade: req.fiberGrade,
        totalCores,
        litCores: 0,
        darkCores: totalCores,
        utilizationPct: 0.0,
        lengthMeters: lengthM,
        originLocationId: req.originLocationId,
        originLocationName: origLoc?.name,
        originDeviceId: req.originDeviceId,
        originDeviceHostname: origDev?.hostname,
        terminationLocationId: req.terminationLocationId,
        terminationLocationName: termLoc?.name,
        terminationDeviceId: req.terminationDeviceId,
        terminationDeviceHostname: termDev?.hostname,
        installationType: req.installationType || 'UNDERGROUND_DUCT',
        sheathType: req.sheathType || 'ARMORED_HDPE',
        attenuationDbPerKm: attDbPerKm,
        status: 'ACTIVE',
        strands,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      localCables = [newCable, ...localCables];
      return newCable;
    }
  },

  updateCable: async (id: string, req: UpdateCableRequest): Promise<OpticalCable> => {
    try {
      const response = await apiClient.put(`/api/v1/inventory/cables/${id}`, req);
      const updated = response.data;
      localCables = localCables.map(c => c.id === id ? { ...c, ...updated } : c);
      return updated;
    } catch {
      const existing = localCables.find(c => c.id === id);
      if (!existing) throw new Error('Optical cable not found: ' + id);
      const origLoc = req.originLocationId ? localLocations.find(l => l.id === req.originLocationId) : undefined;
      const termLoc = req.terminationLocationId ? localLocations.find(l => l.id === req.terminationLocationId) : undefined;
      const origDev = req.originDeviceId ? localDevices.find(d => d.id === req.originDeviceId) : undefined;
      const termDev = req.terminationDeviceId ? localDevices.find(d => d.id === req.terminationDeviceId) : undefined;

      const updated: OpticalCable = {
        ...existing,
        cableName: req.cableName ?? existing.cableName,
        cableType: req.cableType ?? existing.cableType,
        fiberGrade: req.fiberGrade ?? existing.fiberGrade,
        status: req.status ?? existing.status,
        lengthMeters: req.lengthMeters ?? existing.lengthMeters,
        installationType: req.installationType ?? existing.installationType,
        sheathType: req.sheathType ?? existing.sheathType,
        attenuationDbPerKm: req.attenuationDbPerKm ?? existing.attenuationDbPerKm,
        originLocationId: req.originLocationId !== undefined ? req.originLocationId : existing.originLocationId,
        originLocationName: origLoc ? origLoc.name : existing.originLocationName,
        originDeviceId: req.originDeviceId !== undefined ? req.originDeviceId : existing.originDeviceId,
        originDeviceHostname: origDev ? origDev.hostname : existing.originDeviceHostname,
        terminationLocationId: req.terminationLocationId !== undefined ? req.terminationLocationId : existing.terminationLocationId,
        terminationLocationName: termLoc ? termLoc.name : existing.terminationLocationName,
        terminationDeviceId: req.terminationDeviceId !== undefined ? req.terminationDeviceId : existing.terminationDeviceId,
        terminationDeviceHostname: termDev ? termDev.hostname : existing.terminationDeviceHostname,
        routeGeomGeoJson: req.routeGeomGeoJson ?? existing.routeGeomGeoJson,
        updatedAt: new Date().toISOString()
      };

      localCables = localCables.map(c => c.id === id ? updated : c);
      return updated;
    }
  },

  updateStrand: async (strandId: string, req: UpdateStrandRequest): Promise<CableStrand> => {
    try {
      const response = await apiClient.put(`/api/v1/inventory/cables/strands/${strandId}`, req);
      return response.data;
    } catch {
      for (const cable of localCables) {
        if (cable.strands) {
          const sIndex = cable.strands.findIndex((s: CableStrand) => s.id === strandId);
          if (sIndex !== -1) {
            const updated = { ...cable.strands[sIndex], ...req };
            cable.strands[sIndex] = updated as CableStrand;
            cable.litCores = cable.strands.filter((s: CableStrand) => s.status === 'LIT_IN_USE').length;
            cable.darkCores = cable.totalCores - cable.litCores;
            cable.utilizationPct = Number(((cable.litCores / cable.totalCores) * 100).toFixed(1));
            return updated as CableStrand;
          }
        }
      }
      throw new Error('Strand not found: ' + strandId);
    }
  },

  deleteCable: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/inventory/cables/${id}`);
    } finally {
      localCables = localCables.filter(c => c.id !== id);
    }
  }
};
