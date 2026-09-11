export type LocationType = 'COUNTRY' | 'REGION' | 'CITY' | 'SITE' | 'BUILDING' | 'FLOOR' | 'ROOM';

export type LocationStatus = 
  | 'ACTIVE' 
  | 'PLANNED' 
  | 'UNDER_CONSTRUCTION' 
  | 'MAINTENANCE' 
  | 'INACTIVE';

export type DeviceType = 
  | 'ROUTER' 
  | 'SWITCH' 
  | 'DWDM_CHASSIS' 
  | 'OLT' 
  | 'DSLAM' 
  | 'FIREWALL' 
  | 'SERVER' 
  | 'ODF' 
  | 'ODC'
  | 'ODP'
  | 'CLOSURE'
  | 'SPLITTER_BOX'
  | 'ONT'
  | 'DDF' 
  | 'PATCH_PANEL'
  | 'METRO';

export interface DeviceTypeOption {
  code: string;
  label: string;
  category?: 'ACTIVE' | 'PASSIVE' | string;
}

export type OperationalStatus = 
  | 'PLANNED' 
  | 'INSTALLED' 
  | 'ACTIVE' 
  | 'MAINTENANCE' 
  | 'FAULTY' 
  | 'DECOMMISSIONED';

export type PortMedium = 
  | 'COPPER_RJ45' 
  | 'FIBER_SINGLE_MODE' 
  | 'FIBER_MULTI_MODE' 
  | 'WIRELESS';

export type ServiceType = 
  | 'L2_VPN_MPLS' 
  | 'L3_VPN_MPLS' 
  | 'INTERNET_DIRECT' 
  | 'DARK_FIBER' 
  | 'WAVELENGTH_SERVICE' 
  | 'METRO_ETHERNET'
  | 'GPON_BROADBAND'
  | 'FTTH_ACCESS';

export type ServiceStatus = 
  | 'PLANNED' 
  | 'PROVISIONING' 
  | 'ACTIVE' 
  | 'SUSPENDED' 
  | 'TERMINATED';

export interface LocationNode {
  id: string;
  parentId?: string | null;
  code: string;
  name: string;
  type: LocationType;
  status?: LocationStatus;
  latitude?: number;
  longitude?: number;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  children?: LocationNode[];
}

export interface Rack {
  id: string;
  locationId: string;
  rackNumber: string;
  heightUnits: number;
  maxPowerWatt: number;
  currentPowerWatt: number;
  maxWeightKg: number;
  status: string;
  occupiedUnits: number;
  availableUnits: number;
}

export interface DevicePort {
  id: string;
  deviceId?: string;
  portName: string;
  portSpeedMbps: number;
  mediumType: PortMedium;
  connectorType: string;
  macAddress?: string;
  isOperational: boolean;
  isAllocated: boolean;
  connectedPortId?: string;
  allocatedServiceId?: string;
  allocatedServiceCode?: string;
  allocatedCustomerName?: string;
  allocatedResourceRole?: string;
  allocatedBandwidthMbps?: number;
}

export interface NetworkDevice {
  id: string;
  locationId: string;
  locationName?: string;
  rackId?: string;
  rackNumber?: string;
  hostname: string;
  serialNumber: string;
  assetTag?: string;
  deviceType: DeviceType;
  vendor: string;
  model: string;
  hardwareVersion?: string;
  firmwareVersion?: string;
  rackUnitStart?: number;
  rackUnitHeight?: number;
  status: OperationalStatus;
  managementIp?: string;
  totalPorts: number;
  costUsd: number;
  ports?: DevicePort[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface VirtualNetworkElement {
  id: string;
  hypervisorDeviceId?: string;
  hypervisorHostname?: string;
  vneName: string;
  vnfType: string;
  vlanId?: number;
  vrfName?: string;
  allocatedVcpu: number;
  allocatedRamGb: number;
  allocatedDiskGb: number;
  status: OperationalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResourceMapping {
  id: string;
  deviceId?: string;
  deviceHostname?: string;
  portId?: string;
  portName?: string;
  vneId?: string;
  vneName?: string;
  resourceRole: string;
  hopOrder: number;
  allocatedBandwidthMbps: number;
}

export interface NetworkService {
  id: string;
  serviceCode: string;
  customerName: string;
  serviceType: ServiceType;
  bandwidthMbps: number;
  slaTier: string;
  slaAvailabilityPct: number;
  monthlyRecurringCost: number;
  status: ServiceStatus;
  aEndLocationId: string;
  aEndLocationName?: string;
  zEndLocationId: string;
  zEndLocationName?: string;
  activationDate?: string;
  terminationDate?: string;
  resourceMappings?: ServiceResourceMapping[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PathSegment {
  hop: number;
  fromLocation: string;
  toLocation: string;
  deviceHostname: string;
  linkType: string;
  segmentCostUsd: number;
  latencyMs: number;
}

export interface CostCalculationResult {
  routingStrategy: string;
  totalEstimatedCostUsd: number;
  totalHops: number;
  totalLatencyMs: number;
  capacityAvailable: boolean;
  segments: PathSegment[];
}

export interface CapacityForecast {
  siteCode: string;
  siteName: string;
  totalRacks: number;
  totalDevices: number;
  totalPorts: number;
  allocatedPorts: number;
  portUtilizationPct: number;
  totalPowerWatt: number;
  consumedPowerWatt: number;
  powerUtilizationPct: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export type CableType = 
  | 'BACKBONE_TRUNK' 
  | 'FEEDER_CABLE' 
  | 'DISTRIBUTION_CABLE' 
  | 'DROP_CABLE' 
  | 'PATCH_CORD';

export type FiberGrade = 
  | 'SINGLE_MODE_G652D' 
  | 'SINGLE_MODE_G657A2' 
  | 'MULTI_MODE_OM4' 
  | 'MULTI_MODE_OM3';

export type StrandStatus = 
  | 'AVAILABLE' 
  | 'LIT_IN_USE' 
  | 'RESERVED' 
  | 'DAMAGED_HIGH_LOSS';

export interface CableStrand {
  id: string;
  cableId: string;
  coreNumber: number;
  tubeNumber: number;
  colorName: string;
  colorHex: string;
  status: StrandStatus;
  allocatedServiceId?: string;
  allocatedServiceCode?: string;
  allocatedCustomerName?: string;
  allocatedServiceHop?: number;
  measuredLossDb?: number;
  remarks?: string;
}

export interface OpticalCable {
  id: string;
  cableCode: string;
  cableName: string;
  cableType: CableType;
  fiberGrade: FiberGrade;
  totalCores: number;
  litCores: number;
  darkCores: number;
  utilizationPct: number;
  lengthMeters: number;
  originLocationId?: string;
  originLocationName?: string;
  originDeviceId?: string;
  originDeviceHostname?: string;
  terminationLocationId?: string;
  terminationLocationName?: string;
  terminationDeviceId?: string;
  terminationDeviceHostname?: string;
  installationType?: string;
  sheathType?: string;
  attenuationDbPerKm?: number;
  status: string;
  strands?: CableStrand[];
  createdAt: string;
  updatedAt: string;
  routeGeomGeoJson?: string;
}

export interface CreateCableRequest {
  cableCode: string;
  cableName: string;
  cableType: CableType;
  fiberGrade: FiberGrade;
  totalCores: number;
  lengthMeters?: number;
  originLocationId?: string;
  originDeviceId?: string;
  terminationLocationId?: string;
  terminationDeviceId?: string;
  installationType?: string;
  sheathType?: string;
  attenuationDbPerKm?: number;
}

export interface UpdateCableRequest {
  cableName?: string;
  cableType?: CableType;
  fiberGrade?: FiberGrade;
  status?: string;
  lengthMeters?: number;
  originLocationId?: string;
  originDeviceId?: string;
  terminationLocationId?: string;
  terminationDeviceId?: string;
  installationType?: string;
  sheathType?: string;
  attenuationDbPerKm?: number;
  routeGeomGeoJson?: string;
  routeGeomWkt?: string;
}

export interface UpdateStrandRequest {
  status?: StrandStatus;
  allocatedServiceId?: string;
  allocatedServiceHop?: number;
  measuredLossDb?: number;
  remarks?: string;
}
