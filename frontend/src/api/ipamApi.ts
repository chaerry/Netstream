import apiClient from './apiClient';
import { 
  IpSubnet, 
  IpAddress, 
  VrfDomain, 
  IpScanResult, 
  CreateSubnetRequest, 
  AllocateIpRequest,
  CreateVrfRequest 
} from '../types/ipam';

// Initial Mock Datasets
let localVrfs: VrfDomain[] = [
  { id: 'vrf-default', name: 'DEFAULT', rd: '65000:0', description: 'Global Routing Table & Core Backbone Infrastructure', subnetsCount: 4 },
  { id: 'vrf-financial', name: 'VRF_FINANCIAL_CORE', rd: '65000:100', description: 'Low-Latency Financial & Banking Interconnect VPN', subnetsCount: 2 },
  { id: 'vrf-lte-epc', name: 'VRF_LTE_EPC', rd: '65000:200', description: '4G/5G Packet Core & ENodeB / GNodeB S1-U Transport', subnetsCount: 2 },
  { id: 'vrf-cgnat', name: 'VRF_CGNAT_RESIDENTIAL', rd: '65000:300', description: 'Carrier-Grade NAT (RFC 6598) Pool for Broadband', subnetsCount: 1 },
  { id: 'vrf-dwdm-mgmt', name: 'VRF_DWDM_MGMT', rd: '65000:400', description: 'Out-of-band Optical Transport & NMS Telemetry', subnetsCount: 1 },
];

let localSubnets: IpSubnet[] = [
  {
    id: 'sub-01',
    cidr: '10.240.0.0/16',
    ipVersion: 'IPv4',
    vrfName: 'DEFAULT',
    name: 'Java Backbone Loopback & Interconnect Pool',
    description: 'Master allocation for Jakarta, Bandung, Surabaya Core P & PE Routers',
    networkAddress: '10.240.0.0',
    broadcastAddress: '10.240.255.255',
    subnetMask: '255.255.0.0',
    gatewayIp: '10.240.0.1',
    vlanId: 100,
    totalIps: 65536,
    usableIps: 65534,
    allocatedCount: 3,
    reservedCount: 1,
    utilizationPct: 0.0,
    status: 'ACTIVE',
    locationName: 'National Backbone',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'sub-02',
    cidr: '10.240.10.0/24',
    ipVersion: 'IPv4',
    vrfName: 'DEFAULT',
    name: 'Jakarta Central POP Loopback /32s',
    description: 'Router Loopback0 and Management interfaces in Jakarta POP CGK-01',
    networkAddress: '10.240.10.0',
    broadcastAddress: '10.240.10.255',
    subnetMask: '255.255.255.0',
    gatewayIp: '10.240.10.1',
    vlanId: 110,
    totalIps: 256,
    usableIps: 254,
    allocatedCount: 4,
    reservedCount: 1,
    utilizationPct: 1.6,
    status: 'ACTIVE',
    parentId: 'sub-01',
    locationName: 'Jakarta Central POP Room 101',
    createdAt: '2026-01-20T09:30:00Z',
  },
  {
    id: 'sub-03',
    cidr: '10.240.20.0/24',
    ipVersion: 'IPv4',
    vrfName: 'DEFAULT',
    name: 'Bandung Core Router Management Subnet',
    description: 'P & PE router management for BDG-R01 and BDG-R02',
    networkAddress: '10.240.20.0',
    broadcastAddress: '10.240.20.255',
    subnetMask: '255.255.255.0',
    gatewayIp: '10.240.20.1',
    vlanId: 120,
    totalIps: 256,
    usableIps: 254,
    allocatedCount: 9,
    reservedCount: 2,
    utilizationPct: 3.5,
    status: 'ACTIVE',
    parentId: 'sub-01',
    locationName: 'Bandung Core Server Room 102',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'sub-04',
    cidr: '172.16.100.0/24',
    ipVersion: 'IPv4',
    vrfName: 'VRF_FINANCIAL_CORE',
    name: 'SCBD Banking Low-Latency Transit',
    description: 'Bilateral BGP Peering and FIX protocol connectivity for financial clients',
    networkAddress: '172.16.100.0',
    broadcastAddress: '172.16.100.255',
    subnetMask: '255.255.255.0',
    gatewayIp: '172.16.100.1',
    vlanId: 500,
    totalIps: 256,
    usableIps: 254,
    allocatedCount: 3,
    reservedCount: 1,
    utilizationPct: 1.2,
    status: 'ACTIVE',
    locationName: 'SCBD Cabinet TLT-FL18',
    createdAt: '2026-02-10T11:20:00Z',
  },
  {
    id: 'sub-05',
    cidr: '100.64.0.0/18',
    ipVersion: 'IPv4',
    vrfName: 'VRF_CGNAT_RESIDENTIAL',
    name: 'Carrier-Grade NAT FTTH Broadband Pool',
    description: 'RFC 6598 Shared Address Space allocated to BNG/BRAS subscriber sessions',
    networkAddress: '100.64.0.0',
    broadcastAddress: '100.64.63.255',
    subnetMask: '255.255.192.0',
    gatewayIp: '100.64.0.1',
    vlanId: 800,
    totalIps: 16384,
    usableIps: 16382,
    allocatedCount: 2,
    reservedCount: 1,
    utilizationPct: 0.0,
    status: 'ACTIVE',
    locationName: 'Metro Jakarta Edge',
    createdAt: '2026-02-15T14:00:00Z',
  },
  {
    id: 'sub-06',
    cidr: '2001:df0:a12::/48',
    ipVersion: 'IPv6',
    vrfName: 'DEFAULT',
    name: 'Netstream Global IPv6 Transit /48',
    description: 'APNIC Allocated /48 IPv6 Provider Aggregatable block',
    networkAddress: '2001:df0:a12::',
    broadcastAddress: '2001:df0:a12:ffff:ffff:ffff:ffff:ffff',
    subnetMask: '/48',
    gatewayIp: '2001:df0:a12::1',
    vlanId: 900,
    totalIps: 65536,
    usableIps: 65536,
    allocatedCount: 1,
    reservedCount: 0,
    utilizationPct: 0.0,
    status: 'ACTIVE',
    locationName: 'National Backbone',
    createdAt: '2026-02-20T08:00:00Z',
  }
];

let localAddresses: IpAddress[] = [
  {
    id: 'ip-01',
    ipAddress: '10.240.10.1',
    ipVersion: 'IPv4',
    subnetId: 'sub-02',
    subnetCidr: '10.240.10.0/24',
    vrfName: 'DEFAULT',
    status: 'GATEWAY',
    hostname: 'ID-CGK-PE-RTR-01',
    deviceType: 'ROUTER',
    interfaceName: 'Loopback0',
    macAddress: '00:1B:17:00:01:01',
    dnsPtr: 'id-cgk-pe-rtr-01.netstream.net',
    customerName: 'Netstream Internal',
    serviceCode: 'INFRA-CORE-BGP',
    allocatedAt: '2026-01-20T09:30:00Z',
    assignedBy: 'boss-admin',
    notes: 'BGP Route Reflector Loopback ID',
  },
  {
    id: 'ip-02',
    ipAddress: '10.240.10.2',
    ipVersion: 'IPv4',
    subnetId: 'sub-02',
    subnetCidr: '10.240.10.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'ID-CGK-PE-RTR-02',
    deviceType: 'ROUTER',
    interfaceName: 'Loopback0',
    macAddress: '00:1B:17:00:01:02',
    dnsPtr: 'id-cgk-pe-rtr-02.netstream.net',
    customerName: 'Netstream Internal',
    serviceCode: 'INFRA-CORE-BGP',
    allocatedAt: '2026-01-20T09:35:00Z',
    assignedBy: 'boss-admin',
  },
  {
    id: 'ip-03',
    ipAddress: '10.240.10.15',
    ipVersion: 'IPv4',
    subnetId: 'sub-02',
    subnetCidr: '10.240.10.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'ID-CGK-DWDM-OPT-01',
    deviceType: 'DWDM_CHASSIS',
    interfaceName: 'Mgmt-Eth0',
    macAddress: '50:00:00:0A:00:01',
    dnsPtr: 'dwdm-opt-01.netstream.net',
    customerName: 'Netstream Transport',
    serviceCode: 'DWDM-OSP-TRUNK',
    allocatedAt: '2026-01-22T14:10:00Z',
    assignedBy: 'boss-admin',
    notes: 'In-band optical supervision channel OSC',
  },
  {
    id: 'ip-04',
    ipAddress: '10.240.10.50',
    ipVersion: 'IPv4',
    subnetId: 'sub-02',
    subnetCidr: '10.240.10.0/24',
    vrfName: 'DEFAULT',
    status: 'RESERVED',
    hostname: 'ID-CGK-PE-RTR-03 (Planned)',
    deviceType: 'ROUTER',
    interfaceName: 'Loopback0',
    customerName: 'Expansion Project Q3',
    serviceCode: 'INFRA-EXPANSION',
    allocatedAt: '2026-02-05T11:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'Reserved for incoming Cisco 8808 Core Router',
  },
  {
    id: 'ip-05',
    ipAddress: '172.16.100.10',
    ipVersion: 'IPv4',
    subnetId: 'sub-04',
    subnetCidr: '172.16.100.0/24',
    vrfName: 'VRF_FINANCIAL_CORE',
    status: 'ALLOCATED',
    hostname: 'ID-CGK-PE-RTR-01',
    deviceType: 'ROUTER',
    interfaceName: 'TenGigE0/1/0/1.500',
    macAddress: '00:1B:17:00:02:10',
    dnsPtr: 'bca-peering.scbd.netstream.net',
    customerName: 'PT Bank Central Asia Tbk',
    serviceCode: 'SVC-VPN-2026-0001',
    allocatedAt: '2026-02-12T16:20:00Z',
    assignedBy: 'boss-admin',
    notes: 'Direct Financial Extranet 10G MPLS Circuit',
  },
  {
    id: 'ip-06',
    ipAddress: '172.16.100.11',
    ipVersion: 'IPv4',
    subnetId: 'sub-04',
    subnetCidr: '172.16.100.0/24',
    vrfName: 'VRF_FINANCIAL_CORE',
    status: 'ALLOCATED',
    hostname: 'CE-BCA-SCBD-GW01',
    deviceType: 'ROUTER',
    interfaceName: 'GigabitEthernet0/0/1',
    macAddress: '00:50:56:A1:02:03',
    customerName: 'PT Bank Central Asia Tbk',
    serviceCode: 'SVC-VPN-2026-0001',
    allocatedAt: '2026-02-12T16:25:00Z',
    assignedBy: 'boss-admin',
    notes: 'Customer Premise Edge CE Router Gateway',
  },
  {
    id: 'ip-07',
    ipAddress: '172.16.100.99',
    ipVersion: 'IPv4',
    subnetId: 'sub-04',
    subnetCidr: '172.16.100.0/24',
    vrfName: 'VRF_FINANCIAL_CORE',
    status: 'QUARANTINE',
    macAddress: 'D8:B3:70:99:12:34',
    customerName: 'Audit Investigation',
    allocatedAt: '2026-03-01T08:15:00Z',
    assignedBy: 'boss-admin',
    notes: 'Quarantined due to anomalous ARP flood / IP collision',
  },
  {
    id: 'ip-08',
    ipAddress: '2001:df0:a12:100::1',
    ipVersion: 'IPv6',
    subnetId: 'sub-06',
    subnetCidr: '2001:df0:a12::/48',
    vrfName: 'DEFAULT',
    status: 'GATEWAY',
    hostname: 'ID-CGK-PE-RTR-01',
    deviceType: 'ROUTER',
    interfaceName: 'HundredGigE0/0/0/1',
    macAddress: '00:1B:17:00:01:01',
    dnsPtr: 'ipv6-gw.cgk.netstream.net',
    customerName: 'Telkom Transit BGP',
    serviceCode: 'SVC-IPV6-UPSTREAM',
    allocatedAt: '2026-02-20T08:10:00Z',
    assignedBy: 'boss-admin',
  },

  // --- SUB-03: Bandung Core Router Management Subnet (10.240.20.0/24) ---
  {
    id: 'ip-bdg-01',
    ipAddress: '10.240.20.1',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'GATEWAY',
    hostname: 'ID-BDG-PE-RTR-01-GW',
    deviceType: 'ROUTER',
    interfaceName: 'GigabitEthernet0/0/0',
    macAddress: '00:1B:17:00:20:01',
    dnsPtr: 'gw.bdg-r01.netstream.net',
    customerName: 'Netstream Internal',
    serviceCode: 'INFRA-BDG-CORE',
    allocatedAt: '2026-02-01T10:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'Bandung POP Core Default Gateway (VRRP Master)',
  },
  {
    id: 'ip-bdg-02',
    ipAddress: '10.240.20.2',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'BDG-R01-PE',
    deviceType: 'ROUTER',
    interfaceName: 'Loopback0',
    macAddress: '00:1B:17:00:20:02',
    dnsPtr: 'bdg-r01.netstream.net',
    customerName: 'Netstream Infrastructure',
    serviceCode: 'INFRA-BDG-MPLS',
    allocatedAt: '2026-02-01T10:15:00Z',
    assignedBy: 'boss-admin',
    notes: 'P/PE Core Router Loopback Management Interface',
  },
  {
    id: 'ip-bdg-03',
    ipAddress: '10.240.20.3',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'BDG-R02-PE',
    deviceType: 'ROUTER',
    interfaceName: 'Loopback0',
    macAddress: '00:1B:17:00:20:03',
    dnsPtr: 'bdg-r02.netstream.net',
    customerName: 'Netstream Infrastructure',
    serviceCode: 'INFRA-BDG-MPLS',
    allocatedAt: '2026-02-01T10:20:00Z',
    assignedBy: 'boss-admin',
    notes: 'Redundant PE Core Router Loopback',
  },
  {
    id: 'ip-bdg-04',
    ipAddress: '10.240.20.10',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'BDG-AGG-SW-01',
    deviceType: 'SWITCH',
    interfaceName: 'Vlan120',
    macAddress: '00:1B:17:00:20:10',
    dnsPtr: 'bdg-sw01.netstream.net',
    customerName: 'Netstream Metro-E',
    serviceCode: 'INFRA-BDG-AGG',
    allocatedAt: '2026-02-02T11:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'Primary 100G Distribution Aggregation Switch',
  },
  {
    id: 'ip-bdg-05',
    ipAddress: '10.240.20.11',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'BDG-AGG-SW-02',
    deviceType: 'SWITCH',
    interfaceName: 'Vlan120',
    macAddress: '00:1B:17:00:20:11',
    dnsPtr: 'bdg-sw02.netstream.net',
    customerName: 'Netstream Metro-E',
    serviceCode: 'INFRA-BDG-AGG',
    allocatedAt: '2026-02-02T11:10:00Z',
    assignedBy: 'boss-admin',
    notes: 'Secondary Aggregation Switch Stack',
  },
  {
    id: 'ip-bdg-06',
    ipAddress: '10.240.20.25',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'BDG-DWDM-OPT-01',
    deviceType: 'DWDM_CHASSIS',
    interfaceName: 'Mgmt-Eth0',
    macAddress: '50:00:00:0B:00:01',
    dnsPtr: 'bdg-dwdm01.netstream.net',
    customerName: 'Netstream Optical Transport',
    serviceCode: 'DWDM-OSP-TRUNK',
    allocatedAt: '2026-02-03T14:30:00Z',
    assignedBy: 'boss-admin',
    notes: 'Bandung-Jakarta Metro Optical Transponder Chassis',
  },
  {
    id: 'ip-bdg-07',
    ipAddress: '10.240.20.50',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'BDG-NMS-PROBE-01',
    deviceType: 'SERVER',
    interfaceName: 'eth0',
    macAddress: '02:42:0A:F0:14:32',
    dnsPtr: 'bdg-nms.netstream.net',
    customerName: 'NOC Telemetry',
    serviceCode: 'OSS-MONITORING',
    allocatedAt: '2026-02-04T09:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'Out-of-band SNMP & gNMI Telemetry Poller',
  },
  {
    id: 'ip-bdg-08',
    ipAddress: '10.240.20.100',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'DHCP_POOL',
    hostname: 'BDG-IPMI-POOL-START',
    deviceType: 'SERVER',
    interfaceName: 'ipmi-mgmt',
    customerName: 'Bandung Server Room 102',
    serviceCode: 'OOB-IPMI-POOL',
    allocatedAt: '2026-02-05T08:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'DHCP Dynamic Scope for In-Rack IPMI & ILO Controllers',
  },
  {
    id: 'ip-bdg-09',
    ipAddress: '10.240.20.254',
    ipVersion: 'IPv4',
    subnetId: 'sub-03',
    subnetCidr: '10.240.20.0/24',
    vrfName: 'DEFAULT',
    status: 'RESERVED',
    hostname: 'BDG-VRRP-VIRTUAL-IP',
    deviceType: 'ROUTER',
    interfaceName: 'vrrp-group-120',
    macAddress: '00:00:5E:00:01:78',
    dnsPtr: 'vrrp-vip.bdg.netstream.net',
    customerName: 'High Availability Cluster',
    serviceCode: 'HA-REDUNDANCY',
    allocatedAt: '2026-02-01T10:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'First Hop Redundancy Protocol (FHRP/VRRP) Floating VIP',
  },

  // --- SUB-01: Java Backbone Loopback & Interconnect Pool (10.240.0.0/16) ---
  {
    id: 'ip-bb-01',
    ipAddress: '10.240.0.1',
    ipVersion: 'IPv4',
    subnetId: 'sub-01',
    subnetCidr: '10.240.0.0/16',
    vrfName: 'DEFAULT',
    status: 'GATEWAY',
    hostname: 'JAVA-BB-ROUTE-REFLECTOR-01',
    deviceType: 'ROUTER',
    interfaceName: 'Loopback0',
    macAddress: '00:1B:17:00:00:01',
    dnsPtr: 'rr01.java-bb.netstream.net',
    customerName: 'Backbone Core',
    serviceCode: 'INFRA-BGP-RR',
    allocatedAt: '2026-01-15T08:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'Primary National Route Reflector Loopback Cluster',
  },
  {
    id: 'ip-bb-02',
    ipAddress: '10.240.0.2',
    ipVersion: 'IPv4',
    subnetId: 'sub-01',
    subnetCidr: '10.240.0.0/16',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'JAVA-BB-ROUTE-REFLECTOR-02',
    deviceType: 'ROUTER',
    interfaceName: 'Loopback0',
    macAddress: '00:1B:17:00:00:02',
    dnsPtr: 'rr02.java-bb.netstream.net',
    customerName: 'Backbone Core',
    serviceCode: 'INFRA-BGP-RR',
    allocatedAt: '2026-01-15T08:05:00Z',
    assignedBy: 'boss-admin',
    notes: 'Secondary Standby Route Reflector Loopback',
  },
  {
    id: 'ip-bb-03',
    ipAddress: '10.240.1.1',
    ipVersion: 'IPv4',
    subnetId: 'sub-01',
    subnetCidr: '10.240.0.0/16',
    vrfName: 'DEFAULT',
    status: 'ALLOCATED',
    hostname: 'CGK-P-RTR-01',
    deviceType: 'ROUTER',
    interfaceName: 'HundredGigE0/0/0/0',
    macAddress: '00:1B:17:00:00:11',
    dnsPtr: 'p01.cgk.netstream.net',
    customerName: 'Backbone Core MPLS',
    serviceCode: 'INFRA-CORE-TRANSIT',
    allocatedAt: '2026-01-16T10:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'Jakarta-Surabaya 400G Backbone Trunk Transit Interface',
  },

  // --- SUB-05: Carrier-Grade NAT FTTH Broadband Pool (100.64.0.0/18) ---
  {
    id: 'ip-cgnat-01',
    ipAddress: '100.64.0.1',
    ipVersion: 'IPv4',
    subnetId: 'sub-05',
    subnetCidr: '100.64.0.0/18',
    vrfName: 'VRF_CGNAT_RESIDENTIAL',
    status: 'GATEWAY',
    hostname: 'ID-CGK-BNG-BRAS-01',
    deviceType: 'ROUTER',
    interfaceName: 'Bundle-Ether1.800',
    macAddress: '00:1B:17:00:80:01',
    dnsPtr: 'bng01-cgnat.cgk.netstream.net',
    customerName: 'Broadband FTTH Core',
    serviceCode: 'FTTH-CGNAT-POOL',
    allocatedAt: '2026-02-15T14:00:00Z',
    assignedBy: 'boss-admin',
    notes: 'RFC 6598 CGNAT Subscriber Gateway Default Next-Hop',
  },
  {
    id: 'ip-cgnat-02',
    ipAddress: '100.64.1.50',
    ipVersion: 'IPv4',
    subnetId: 'sub-05',
    subnetCidr: '100.64.0.0/18',
    vrfName: 'VRF_CGNAT_RESIDENTIAL',
    status: 'DHCP_POOL',
    hostname: 'FTTH-DHCP-SCOPE-JAKSEL',
    deviceType: 'SERVER',
    interfaceName: 'dhcp-radius',
    customerName: 'South Jakarta FTTH OLTs',
    serviceCode: 'FTTH-DHCP-SERVICE',
    allocatedAt: '2026-02-15T14:15:00Z',
    assignedBy: 'boss-admin',
    notes: 'Radius-Assigned Subscriber Dynamic IP Block',
  }
];

// Helper to keep subnet allocatedCount and utilization strictly synced with actual registered addresses
const syncSubnetMetrics = () => {
  localSubnets.forEach(sub => {
    const matching = localAddresses.filter(a => a.subnetId === sub.id);
    sub.allocatedCount = matching.length;
    sub.utilizationPct = sub.usableIps > 0 
      ? Number(((matching.length / sub.usableIps) * 100).toFixed(1)) 
      : 0;
  });
};

export const ipamApi = {
  // VRF Domains
  getVrfDomains: async (): Promise<VrfDomain[]> => {
    try {
      const res = await apiClient.get('/api/v1/ipam/vrfs');
      if (Array.isArray(res.data)) return res.data;
    } catch {
      // fallback
    }
    // Update subnetsCount dynamically
    localVrfs.forEach(v => {
      v.subnetsCount = localSubnets.filter(s => s.vrfName === v.name).length;
    });
    return localVrfs;
  },

  createVrfDomain: async (req: CreateVrfRequest): Promise<VrfDomain> => {
    try {
      const res = await apiClient.post('/api/v1/ipam/vrfs', req);
      if (res.data) {
        localVrfs.push(res.data);
        return res.data;
      }
    } catch {
      // fallback
    }

    const newVrf: VrfDomain = {
      id: `vrf-${Date.now()}`,
      name: req.name.trim().toUpperCase(),
      rd: req.rd.trim(),
      description: req.description.trim(),
      routeTargetExport: req.routeTargetExport?.trim() || req.rd.trim(),
      routeTargetImport: req.routeTargetImport?.trim() || req.rd.trim(),
      subnetsCount: 0,
    };

    localVrfs.push(newVrf);
    return newVrf;
  },

  deleteVrfDomain: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/v1/ipam/vrfs/${id}`);
    } catch {
      // fallback
    }
    localVrfs = localVrfs.filter(v => v.id !== id);
    return true;
  },

  // Subnets
  getSubnets: async (): Promise<IpSubnet[]> => {
    try {
      const res = await apiClient.get('/api/v1/ipam/subnets');
      if (Array.isArray(res.data)) {
        localSubnets = res.data;
        syncSubnetMetrics();
        return res.data;
      }
    } catch {
      // fallback
    }
    syncSubnetMetrics();
    return localSubnets;
  },

  createSubnet: async (req: CreateSubnetRequest): Promise<IpSubnet> => {
    try {
      const res = await apiClient.post('/api/v1/ipam/subnets', req);
      if (res.data) {
        localSubnets.unshift(res.data);
        return res.data;
      }
    } catch {
      // fallback
    }

    // Auto-calculate properties if created locally
    const cidrParts = req.cidr.split('/');
    const prefixLen = cidrParts[1] ? parseInt(cidrParts[1], 10) : 24;
    const totalIps = Math.pow(2, 32 - prefixLen);

    const newSubnet: IpSubnet = {
      id: `sub-${Date.now()}`,
      cidr: req.cidr,
      ipVersion: req.ipVersion,
      vrfName: req.vrfName || 'DEFAULT',
      name: req.name,
      description: req.description || '',
      networkAddress: cidrParts[0] || '10.0.0.0',
      broadcastAddress: `${cidrParts[0].replace(/\.\d+$/, '.255')}`,
      subnetMask: prefixLen === 24 ? '255.255.255.0' : `/${prefixLen}`,
      gatewayIp: req.gatewayIp || `${cidrParts[0].replace(/\.\d+$/, '.1')}`,
      vlanId: req.vlanId,
      totalIps: req.ipVersion === 'IPv6' ? 65536 : totalIps,
      usableIps: req.ipVersion === 'IPv6' ? 65536 : Math.max(0, totalIps - 2),
      allocatedCount: 0,
      reservedCount: 1,
      utilizationPct: 0.5,
      status: 'ACTIVE',
      parentId: req.parentId,
      locationName: req.locationName || 'General POP Infrastructure',
      createdAt: new Date().toISOString(),
    };

    localSubnets.unshift(newSubnet);
    return newSubnet;
  },

  deleteSubnet: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/v1/ipam/subnets/${id}`);
    } catch {
      // fallback
    }
    localSubnets = localSubnets.filter(s => s.id !== id);
    localAddresses = localAddresses.filter(a => a.subnetId !== id);
    return true;
  },

  // IP Addresses
  getIpAddresses: async (): Promise<IpAddress[]> => {
    try {
      const res = await apiClient.get('/api/v1/ipam/addresses');
      if (Array.isArray(res.data)) {
        localAddresses = res.data;
        return res.data;
      }
    } catch {
      // fallback
    }
    return localAddresses;
  },

  allocateIpAddress: async (req: AllocateIpRequest): Promise<IpAddress> => {
    try {
      const res = await apiClient.post('/api/v1/ipam/addresses', req);
      if (res.data) {
        localAddresses.unshift(res.data);
        return res.data;
      }
    } catch {
      // fallback
    }

    const matchedSubnet = localSubnets.find(s => s.id === req.subnetId) || localSubnets[0];
    const isV6 = req.ipAddress.includes(':');

    const newAddress: IpAddress = {
      id: `ip-${Date.now()}`,
      ipAddress: req.ipAddress,
      ipVersion: isV6 ? 'IPv6' : 'IPv4',
      subnetId: matchedSubnet.id,
      subnetCidr: matchedSubnet.cidr,
      vrfName: req.vrfName || matchedSubnet.vrfName,
      status: req.status || 'ALLOCATED',
      hostname: req.hostname,
      interfaceName: req.interfaceName,
      macAddress: req.macAddress,
      dnsPtr: req.dnsPtr,
      customerName: req.customerName,
      serviceCode: req.serviceCode,
      allocatedAt: new Date().toISOString(),
      assignedBy: 'boss-admin',
      notes: req.notes,
    };

    localAddresses.unshift(newAddress);
    syncSubnetMetrics();
    return newAddress;
  },

  updateIpAddress: async (id: string, updates: Partial<IpAddress>): Promise<IpAddress> => {
    try {
      const res = await apiClient.put(`/api/v1/ipam/addresses/${id}`, updates);
      if (res.data) return res.data;
    } catch {
      // fallback
    }
    const idx = localAddresses.findIndex(a => a.id === id);
    if (idx !== -1) {
      localAddresses[idx] = { ...localAddresses[idx], ...updates };
      return localAddresses[idx];
    }
    throw new Error('IP address record not found');
  },

  releaseIpAddress: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/v1/ipam/addresses/${id}`);
    } catch {
      // fallback
    }
    localAddresses = localAddresses.filter(a => a.id !== id);
    syncSubnetMetrics();
    return true;
  },

  // Bulk Import
  bulkImportIps: async (records: Partial<IpAddress>[]): Promise<{ imported: number; failed: number; errors: string[] }> => {
    let imported = 0;
    const errors: string[] = [];

    records.forEach((rec, i) => {
      if (!rec.ipAddress) {
        errors.push(`Row ${i + 1}: Missing IP address`);
        return;
      }
      // Check collision in same VRF
      const exists = localAddresses.find(a => a.ipAddress === rec.ipAddress && a.vrfName === (rec.vrfName || 'DEFAULT'));
      if (exists) {
        errors.push(`Row ${i + 1}: IP ${rec.ipAddress} collision in VRF ${rec.vrfName || 'DEFAULT'}`);
        return;
      }

      const isV6 = rec.ipAddress.includes(':');
      const matchingSubnet = localSubnets.find(s => s.vrfName === (rec.vrfName || 'DEFAULT')) || localSubnets[0];

      localAddresses.unshift({
        id: `ip-bulk-${Date.now()}-${i}`,
        ipAddress: rec.ipAddress,
        ipVersion: isV6 ? 'IPv6' : 'IPv4',
        subnetId: matchingSubnet.id,
        subnetCidr: matchingSubnet.cidr,
        vrfName: rec.vrfName || 'DEFAULT',
        status: (rec.status as any) || 'ALLOCATED',
        hostname: rec.hostname,
        interfaceName: rec.interfaceName,
        macAddress: rec.macAddress,
        dnsPtr: rec.dnsPtr,
        customerName: rec.customerName,
        serviceCode: rec.serviceCode,
        allocatedAt: new Date().toISOString(),
        assignedBy: 'bulkloader',
        notes: rec.notes || 'Imported via GUI Bulkloader',
      });
      imported++;
    });

    syncSubnetMetrics();
    return { imported, failed: records.length - imported, errors };
  },

  // Live Network Scanner Simulation
  scanSubnetLive: async (cidr: string): Promise<IpScanResult[]> => {
    // Artificial latency for authentic discovery scan feeling
    await new Promise(r => setTimeout(r, 1200));

    const baseParts = cidr.split('/')[0].split('.');
    const prefix = baseParts.slice(0, 3).join('.');

    // Generate realistic scan responses
    const mockResults: IpScanResult[] = [
      {
        ipAddress: `${prefix}.1`,
        macAddress: '00:1B:17:AA:BB:01',
        vendorOui: 'Cisco Systems (Catalyst / ASR)',
        hostname: 'gw-core-01.netstream.net',
        responseTimeMs: 0.8,
        status: 'MATCHED',
        lastSeen: new Date().toISOString(),
        portsDetected: [22, 161, 179]
      },
      {
        ipAddress: `${prefix}.2`,
        macAddress: '00:1B:17:AA:BB:02',
        vendorOui: 'Cisco Systems (Core Peer)',
        hostname: 'gw-core-02.netstream.net',
        responseTimeMs: 0.9,
        status: 'MATCHED',
        lastSeen: new Date().toISOString(),
        portsDetected: [22, 161, 179]
      },
      {
        ipAddress: `${prefix}.15`,
        macAddress: '50:00:00:0A:00:01',
        vendorOui: 'Nokia Optical Networks',
        hostname: 'dwdm-osc-transponder',
        responseTimeMs: 2.1,
        status: 'MATCHED',
        lastSeen: new Date().toISOString(),
        portsDetected: [80, 443, 830]
      },
      {
        ipAddress: `${prefix}.77`,
        macAddress: '70:B3:D5:19:33:44',
        vendorOui: 'Juniper Networks (MX480 Edge)',
        hostname: 'unregistered-bng-host.netstream.net',
        responseTimeMs: 3.4,
        status: 'ACTIVE_UNREGISTERED',
        lastSeen: new Date().toISOString(),
        portsDetected: [22, 80, 161]
      },
      {
        ipAddress: `${prefix}.88`,
        macAddress: 'BC:24:11:80:91:20',
        vendorOui: 'Huawei Technologies (NE40E Router)',
        hostname: 'peering-transit-node',
        responseTimeMs: 1.5,
        status: 'ACTIVE_UNREGISTERED',
        lastSeen: new Date().toISOString(),
        portsDetected: [22, 179]
      }
    ];

    return mockResults;
  }
};
