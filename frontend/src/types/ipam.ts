export type IpVersion = 'IPv4' | 'IPv6';

export type IpSubnetStatus = 'ACTIVE' | 'RESERVED' | 'DEPLETED' | 'PLANNED';

export type IpAddressStatus = 
  | 'ALLOCATED' 
  | 'RESERVED' 
  | 'AVAILABLE' 
  | 'DHCP_POOL' 
  | 'GATEWAY' 
  | 'QUARANTINE';

export interface VrfDomain {
  id: string;
  name: string;
  rd: string; // Route Distinguisher e.g. "65000:100"
  description: string;
  routeTargetExport?: string;
  routeTargetImport?: string;
  subnetsCount: number;
}

export interface IpSubnet {
  id: string;
  cidr: string; // e.g. "10.240.10.0/24"
  ipVersion: IpVersion;
  vrfName: string;
  name: string;
  description: string;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  gatewayIp?: string;
  vlanId?: number;
  totalIps: number;
  usableIps: number;
  allocatedCount: number;
  reservedCount: number;
  utilizationPct: number;
  status: IpSubnetStatus;
  parentId?: string; // For hierarchical subnets within subnets
  locationName?: string;
  createdAt: string;
}

export interface IpAddress {
  id: string;
  ipAddress: string; // e.g. "10.240.10.15"
  ipVersion: IpVersion;
  subnetId: string;
  subnetCidr: string;
  vrfName: string;
  status: IpAddressStatus;
  hostname?: string;
  deviceType?: string;
  interfaceName?: string; // e.g. "HundredGigE0/0/0/1"
  macAddress?: string; // e.g. "50:00:00:01:00:01"
  dnsPtr?: string; // FQDN e.g. "pe-01-lo0.netstream.net"
  customerName?: string;
  serviceCode?: string; // e.g. "SVC-VPN-2026-0001"
  allocatedAt?: string;
  assignedBy?: string;
  notes?: string;
}

export interface IpScanResult {
  ipAddress: string;
  macAddress?: string;
  vendorOui?: string;
  hostname?: string;
  responseTimeMs: number;
  status: 'ACTIVE_UNREGISTERED' | 'MATCHED' | 'CONFLICT';
  lastSeen: string;
  portsDetected?: number[];
}

export interface CreateSubnetRequest {
  cidr: string;
  ipVersion: IpVersion;
  vrfName: string;
  name: string;
  description?: string;
  gatewayIp?: string;
  vlanId?: number;
  parentId?: string;
  locationName?: string;
}

export interface AllocateIpRequest {
  ipAddress: string;
  subnetId: string;
  vrfName: string;
  status: IpAddressStatus;
  hostname?: string;
  interfaceName?: string;
  macAddress?: string;
  dnsPtr?: string;
  customerName?: string;
  serviceCode?: string;
  notes?: string;
}

export interface CreateVrfRequest {
  name: string;
  rd: string; // e.g. "65000:500"
  description: string;
  routeTargetExport?: string;
  routeTargetImport?: string;
}
