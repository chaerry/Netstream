import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ipamApi } from '../api/ipamApi';
import { IpSubnet, IpAddress, VrfDomain, CreateSubnetRequest, AllocateIpRequest, IpScanResult, CreateVrfRequest } from '../types/ipam';
import { SubnetsHierarchyView } from '../components/ipam/SubnetsHierarchyView';
import { IpAddressRegisterView } from '../components/ipam/IpAddressRegisterView';
import { VrfDomainsView } from '../components/ipam/VrfDomainsView';
import { SubnetCalculatorView } from '../components/ipam/SubnetCalculatorView';
import { LiveIpDiscoveryView } from '../components/ipam/LiveIpDiscoveryView';
import { IpBulkloaderView } from '../components/ipam/IpBulkloaderView';
import { CreateSubnetModal } from '../components/ipam/CreateSubnetModal';
import { AllocateIpModal } from '../components/ipam/AllocateIpModal';
import { ManageVrfModal } from '../components/ipam/ManageVrfModal';
import { useDialog } from '../components/common/DialogContext';
import { 
  Network, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Calculator, 
  Radar, 
  FileSpreadsheet, 
  Plus, 
  Loader2,
  Server,
  Globe2,
  Lock,
  Boxes,
  ArrowUpRight
} from 'lucide-react';

export const IpManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [subnets, setSubnets] = useState<IpSubnet[]>([]);
  const [addresses, setAddresses] = useState<IpAddress[]>([]);
  const [vrfs, setVrfs] = useState<VrfDomain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'subnets' | 'addresses' | 'vrfs' | 'calculator' | 'discovery' | 'bulkloader'>(
    (tabParam as any) || 'subnets'
  );
  const [selectedSubnetFilter, setSelectedSubnetFilter] = useState<string>('ALL');

  useEffect(() => {
    if (tabParam && ['subnets', 'addresses', 'vrfs', 'calculator', 'discovery', 'bulkloader'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: 'subnets' | 'addresses' | 'vrfs' | 'calculator' | 'discovery' | 'bulkloader') => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Modals
  const [isCreateSubnetOpen, setIsCreateSubnetOpen] = useState<boolean>(false);
  const [isAllocateIpOpen, setIsAllocateIpOpen] = useState<boolean>(false);
  const [isManageVrfOpen, setIsManageVrfOpen] = useState<boolean>(false);

  const { confirmDelete, confirmSave, showAlert } = useDialog();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subs, addrs, vrfList] = await Promise.all([
        ipamApi.getSubnets(),
        ipamApi.getIpAddresses(),
        ipamApi.getVrfDomains()
      ]);
      setSubnets(subs);
      setAddresses(addrs);
      setVrfs(vrfList);
    } catch (err) {
      console.error('Failed to load IPAM datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubnet = async (req: CreateSubnetRequest) => {
    const created = await ipamApi.createSubnet(req);
    setSubnets(prev => [created, ...prev]);
    return created;
  };

  const handleCreateVrf = async (req: CreateVrfRequest) => {
    const created = await ipamApi.createVrfDomain(req);
    setVrfs(prev => [...prev, created]);
    return created;
  };

  const handleDeleteVrf = async (id: string) => {
    await ipamApi.deleteVrfDomain(id);
    setVrfs(prev => prev.filter(v => v.id !== id));
  };

  const handleDeleteSubnet = async (id: string) => {
    const target = subnets.find(s => s.id === id);
    const confirmed = await confirmDelete({
      title: 'Decommission IP Subnet Range',
      subtitle: 'Hierarchical Routing Block Retirement',
      protocolCode: 'IPAM // PURGE_CIDR_BLOCK',
      itemBadge: target?.ipVersion || 'IPv4',
      itemCode: target?.cidr || id,
      itemName: target?.name,
      impactMessage: 'Permanently removes this CIDR allocation from the routing table and releases all mapped host IPs back into the unassigned address pool.',
      confirmText: 'Confirm Decommission',
    });

    if (confirmed) {
      try {
        await ipamApi.deleteSubnet(id);
        setSubnets(prev => prev.filter(s => s.id !== id));
        setAddresses(prev => prev.filter(a => a.subnetId !== id));
      } catch (err: any) {
        await showAlert({
          type: 'danger',
          title: 'Subnet Decommission Failed',
          message: err.message || 'System was unable to decommission subnet due to database integrity constraints.'
        });
      }
    }
  };

  const handleAllocateIp = async (req: AllocateIpRequest) => {
    const created = await ipamApi.allocateIpAddress(req);
    setAddresses(prev => [created, ...prev]);
    // Refresh subnets to reflect updated utilization
    const updatedSubs = await ipamApi.getSubnets();
    setSubnets(updatedSubs);
    return created;
  };

  const handleReleaseAddress = async (id: string) => {
    const target = addresses.find(a => a.id === id);
    const confirmed = await confirmDelete({
      title: 'Decommission Host IP Assignment',
      subtitle: 'Static Address Pool Release',
      protocolCode: 'IPAM // RELEASE_HOST_ASSIGNMENT',
      itemBadge: target?.status || 'ALLOCATED',
      itemCode: target?.ipAddress || id,
      itemName: target?.hostname || target?.notes || 'Allocated Host Interface',
      impactMessage: 'Releases static IP allocation, removes DHCP binding, and unregisters hostname from internal DNS routing.',
      confirmText: 'Release IP Address',
    });

    if (confirmed) {
      try {
        await ipamApi.releaseIpAddress(id);
        setAddresses(prev => prev.filter(a => a.id !== id));
        const updatedSubs = await ipamApi.getSubnets();
        setSubnets(updatedSubs);
      } catch (err: any) {
        await showAlert({
          type: 'danger',
          title: 'Address Release Failed',
          message: err.message || 'Unable to release host address due to active system lock.'
        });
      }
    }
  };

  const handleImportDiscovered = async (result: IpScanResult) => {
    const sub = subnets.find(s => s.cidr.startsWith(result.ipAddress.split('.').slice(0, 3).join('.'))) || subnets[0];
    await handleAllocateIp({
      ipAddress: result.ipAddress,
      subnetId: sub?.id || 'sub-01',
      vrfName: sub?.vrfName || 'DEFAULT',
      status: 'ALLOCATED',
      hostname: result.hostname || 'Discovered-Host',
      macAddress: result.macAddress,
      notes: `Auto-reconciled from live ping sweep (Latency: ${result.responseTimeMs}ms, OUI: ${result.vendorOui || 'Generic'})`,
    });
  };

  // Dynamically calculate allocatedCount and utilizationPct from actual registered IP addresses
  const computedSubnets = useMemo(() => {
    return subnets.map(s => {
      const matchingAddrs = addresses.filter(a => a.subnetId === s.id);
      const allocatedCount = matchingAddrs.length;
      const reservedCount = matchingAddrs.filter(a => a.status === 'RESERVED' || a.status === 'DHCP_POOL').length;
      const utilizationPct = s.usableIps > 0
        ? Number(((allocatedCount / s.usableIps) * 100).toFixed(1))
        : 0;
      return {
        ...s,
        allocatedCount,
        reservedCount: reservedCount > 0 ? reservedCount : s.reservedCount,
        utilizationPct,
      };
    });
  }, [subnets, addresses]);

  // KPIs dynamically driven by actual address records
  const totalSubnets = computedSubnets.length;
  const totalTrackedIps = computedSubnets.reduce((acc, s) => acc + s.usableIps, 0);
  const totalAllocatedIps = computedSubnets.reduce((acc, s) => acc + s.allocatedCount, 0);
  const totalReservedIps = computedSubnets.reduce((acc, s) => acc + s.reservedCount, 0);
  const overallUtilPct = totalTrackedIps > 0 ? ((totalAllocatedIps / totalTrackedIps) * 100).toFixed(1) : '0.0';

  const tabs = [
    { id: 'subnets', label: 'Subnets & CIDR Hierarchy', icon: <Network className="w-4 h-4" /> },
    { id: 'addresses', label: 'IP Address Register', icon: <Boxes className="w-4 h-4" /> },
    { id: 'vrfs', label: 'VRF Routing Domains', icon: <Layers className="w-4 h-4" /> },
    { id: 'calculator', label: 'Subnet Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'discovery', label: 'Live Network Discovery', icon: <Radar className="w-4 h-4" /> },
    { id: 'bulkloader', label: 'Bulkloader Spreadsheet', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                PROD MODULE
              </span>
              <span className="text-xs text-slate-400 font-mono">RFC 4632 / RFC 791 / RFC 8200</span>
              <span className="text-xs text-cyan-400 font-mono">VC4 S2C Model</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>IP Address Management (IPAM)</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Hierarchical IPv4 / IPv6 subnet allocation, multi-VRF domain isolation, live ICMP/ARP auto-discovery, and automated subnet calculations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('vrfs')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 border ${
                activeTab === 'vrfs'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>VRF Domains</span>
            </button>
            <button
              onClick={() => setIsAllocateIpOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Allocate IP</span>
            </button>
            <button
              onClick={() => setIsCreateSubnetOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Subnet Block</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30 font-extrabold'
                  : 'glass-card text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Executive KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Subnet Blocks
            </span>
            <span className="text-lg font-black text-white font-mono">{totalSubnets} CIDRs</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Managed Capacity
            </span>
            <span className="text-lg font-black text-cyan-300 font-mono">
              {totalTrackedIps > 1000 ? `${(totalTrackedIps / 1000).toFixed(1)}k` : totalTrackedIps} IPs
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Address Utilization
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">{overallUtilPct}%</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
              Reserved / VIP
            </span>
            <span className="text-lg font-black text-purple-300 font-mono">{totalReservedIps} Pools</span>
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('vrfs')}
          className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 col-span-2 sm:col-span-1 group ${
            activeTab === 'vrfs'
              ? 'border-blue-500/60 bg-blue-950/20 shadow-lg shadow-blue-500/10'
              : 'border-slate-800 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10'
          }`}
          title="Click to view all VRF routing domains"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block font-sans">
                VRF Domains
              </span>
              <span className="text-lg font-black text-blue-300 font-mono">{vrfs.length} Active</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
        </div>
      </div>

      {/* Main View Body */}
      {loading ? (
        <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-mono">Loading IPAM subnets, address registry & routing domains...</span>
        </div>
      ) : (
        <>
          {activeTab === 'subnets' && (
            <SubnetsHierarchyView
              subnets={computedSubnets}
              vrfs={vrfs}
              onOpenCreate={() => setIsCreateSubnetOpen(true)}
              onDeleteSubnet={handleDeleteSubnet}
              onSelectSubnetForAddressView={(subId) => {
                setSelectedSubnetFilter(subId);
                setActiveTab('addresses');
              }}
            />
          )}

          {activeTab === 'addresses' && (
            <IpAddressRegisterView
              addresses={addresses}
              subnets={computedSubnets}
              vrfs={vrfs}
              selectedSubnetFilter={selectedSubnetFilter}
              onOpenAllocate={() => setIsAllocateIpOpen(true)}
              onReleaseAddress={handleReleaseAddress}
            />
          )}

          {activeTab === 'vrfs' && (
            <VrfDomainsView
              vrfs={vrfs}
              subnets={computedSubnets}
              addresses={addresses}
              onCreateVrf={handleCreateVrf}
              onDeleteVrf={handleDeleteVrf}
              onSelectVrfForSubnets={(vrfName) => {
                handleTabChange('subnets');
              }}
              onSelectVrfForAddresses={(vrfName) => {
                handleTabChange('addresses');
              }}
            />
          )}

          {activeTab === 'calculator' && (
            <SubnetCalculatorView />
          )}

          {activeTab === 'discovery' && (
            <LiveIpDiscoveryView
              subnets={computedSubnets}
              onImportDiscovered={handleImportDiscovered}
            />
          )}

          {activeTab === 'bulkloader' && (
            <IpBulkloaderView
              onSuccessImport={fetchData}
            />
          )}
        </>
      )}

      {/* Modals */}
      <CreateSubnetModal
        isOpen={isCreateSubnetOpen}
        vrfs={vrfs}
        onClose={() => setIsCreateSubnetOpen(false)}
        onSubmit={handleCreateSubnet}
        onOpenManageVrf={() => setIsManageVrfOpen(true)}
      />

      <AllocateIpModal
        isOpen={isAllocateIpOpen}
        subnets={computedSubnets}
        onClose={() => setIsAllocateIpOpen(false)}
        onSubmit={handleAllocateIp}
      />

      <ManageVrfModal
        isOpen={isManageVrfOpen}
        vrfs={vrfs}
        subnets={computedSubnets}
        onClose={() => setIsManageVrfOpen(false)}
        onCreateVrf={handleCreateVrf}
        onDeleteVrf={handleDeleteVrf}
      />
    </div>
  );
};
