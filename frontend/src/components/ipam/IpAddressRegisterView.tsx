import React, { useState, useEffect } from 'react';
import { IpAddress, IpSubnet, VrfDomain, IpAddressStatus } from '../../types/ipam';
import { 
  Network, 
  Search, 
  Plus, 
  Trash2, 
  Server, 
  Globe, 
  User, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';

interface Props {
  addresses: IpAddress[];
  subnets: IpSubnet[];
  vrfs: VrfDomain[];
  selectedSubnetFilter?: string;
  onOpenAllocate: () => void;
  onReleaseAddress: (id: string) => Promise<void>;
}

export const IpAddressRegisterView: React.FC<Props> = ({
  addresses,
  subnets,
  vrfs,
  selectedSubnetFilter = 'ALL',
  onOpenAllocate,
  onReleaseAddress
}) => {
  const [search, setSearch] = useState<string>('');
  const [subnetFilter, setSubnetFilter] = useState<string>(selectedSubnetFilter);
  const [vrfFilter, setVrfFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    setSubnetFilter(selectedSubnetFilter);
  }, [selectedSubnetFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [search, subnetFilter, vrfFilter, statusFilter]);

  const filteredAddresses = addresses.filter(a => {
    const matchesSearch = 
      a.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
      (a.hostname && a.hostname.toLowerCase().includes(search.toLowerCase())) ||
      (a.macAddress && a.macAddress.toLowerCase().includes(search.toLowerCase())) ||
      (a.customerName && a.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (a.serviceCode && a.serviceCode.toLowerCase().includes(search.toLowerCase())) ||
      (a.dnsPtr && a.dnsPtr.toLowerCase().includes(search.toLowerCase()));

    const matchesSubnet = subnetFilter === 'ALL' || a.subnetId === subnetFilter;
    const matchesVrf = vrfFilter === 'ALL' || a.vrfName === vrfFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesSubnet && matchesVrf && matchesStatus;
  });

  const activeSubnetObj = subnets.find(s => s.id === subnetFilter);

  const totalElements = filteredAddresses.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedAddresses = filteredAddresses.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(0);
  };

  const getStatusBadge = (status: IpAddressStatus) => {
    switch (status) {
      case 'ALLOCATED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'GATEWAY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'RESERVED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DHCP_POOL':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'AVAILABLE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'QUARANTINE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Subnet Scope Banner (when filtered by subnet) */}
      {activeSubnetObj && (
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm shadow-amber-500/5 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300 text-sm">{activeSubnetObj.cidr}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  VRF: {activeSubnetObj.vrfName}
                </span>
                {activeSubnetObj.vlanId && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    VLAN {activeSubnetObj.vlanId}
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeSubnetObj.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                {activeSubnetObj.name} • Gateway: <span className="font-mono text-slate-300">{activeSubnetObj.gatewayIp || 'N/A'}</span> • {activeSubnetObj.locationName || 'Backbone POP'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block">Subnet Scope</span>
              <span className="font-mono font-bold text-cyan-300 text-xs">{filteredAddresses.length} Registered Host IPs</span>
            </div>
            <button
              type="button"
              onClick={() => setSubnetFilter('ALL')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
            >
              Reset Scope
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subnet Select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-500">Subnet:</span>
            <select
              value={subnetFilter}
              onChange={e => setSubnetFilter(e.target.value)}
              className="glass-input h-8 px-2.5 rounded-xl bg-slate-950 text-xs border-slate-700 text-slate-200 cursor-pointer max-w-[190px]"
            >
              <option value="ALL">All Subnets</option>
              {subnets.map(s => (
                <option key={s.id} value={s.id}>{s.cidr} ({s.vrfName})</option>
              ))}
            </select>
          </div>

          {/* VRF Select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-500">VRF:</span>
            <select
              value={vrfFilter}
              onChange={e => setVrfFilter(e.target.value)}
              className="glass-input h-8 px-2.5 rounded-xl bg-slate-950 text-xs border-slate-700 text-slate-200 cursor-pointer"
            >
              <option value="ALL">All VRFs</option>
              {vrfs.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="glass-input h-8 px-2.5 rounded-xl bg-slate-950 text-xs border-slate-700 text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ALLOCATED">ALLOCATED</option>
              <option value="GATEWAY">GATEWAY</option>
              <option value="RESERVED">RESERVED</option>
              <option value="DHCP_POOL">DHCP_POOL</option>
              <option value="QUARANTINE">QUARANTINE</option>
            </select>
          </div>
        </div>

        {/* Search & Allocate Button */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search IP, host, MAC, customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input w-full h-8 pl-9 pr-3 text-xs rounded-xl text-slate-200"
            />
          </div>

          <button
            onClick={onOpenAllocate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Allocate IP</span>
          </button>
        </div>
      </div>

      {/* IP Address Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {filteredAddresses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Network className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No IP Addresses Found</p>
            <p className="text-xs">Adjust filter criteria or click "Allocate IP" to register an assignment.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">IP Address & Protocol</th>
                    <th className="py-3 px-4">VRF Domain & Subnet</th>
                    <th className="py-3 px-4">Device Hostname & Interface</th>
                    <th className="py-3 px-4">MAC / DNS PTR</th>
                    <th className="py-3 px-4">Customer & Service</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedAddresses.map(addr => (
                    <tr key={addr.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Network className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-mono text-sm block">{addr.ipAddress}</span>
                            <span className="text-[10px] text-slate-500 font-sans block">{addr.ipVersion}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-xs text-cyan-300 font-semibold block">{addr.vrfName}</span>
                          <span className="text-[10px] text-slate-500 block">{addr.subnetCidr}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-bold block">
                            {addr.hostname || <span className="text-slate-600 font-normal">Unassigned</span>}
                          </span>
                          {addr.interfaceName && (
                            <span className="text-[10px] text-slate-400 block font-mono">{addr.interfaceName}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-300 block font-mono">
                            {addr.macAddress || <span className="text-slate-600">—</span>}
                          </span>
                          {addr.dnsPtr && (
                            <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                              {addr.dnsPtr}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-xs text-slate-200 font-sans block">
                            {addr.customerName || <span className="text-slate-600">—</span>}
                          </span>
                          {addr.serviceCode && (
                            <span className="text-[10px] text-purple-300 font-mono block">{addr.serviceCode}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadge(addr.status)}`}>
                          {addr.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onReleaseAddress(addr.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Release / Delete IP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-slate-900/90 border-t border-slate-800/80">
              {/* Left: Rows Per Page */}
              <div className="flex items-center gap-4 text-xs text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="glass-input px-2.5 py-1 text-xs rounded-lg border-slate-700 bg-slate-950 text-slate-200 cursor-pointer"
                  >
                    <option value={5}>5 rows</option>
                    <option value={10}>10 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                  </select>
                </div>

                <div className="text-slate-400">
                  {totalElements > 0 ? (
                    <span>
                      Showing <strong className="text-white">{currentPage * pageSize + 1}</strong> to{' '}
                      <strong className="text-white">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </strong>{' '}
                      of <strong className="text-cyan-400">{totalElements}</strong> total IP addresses
                    </span>
                  ) : (
                    <span>No IP addresses found</span>
                  )}
                </div>
              </div>

              {/* Right: Navigation Buttons */}
              <div className="flex items-center gap-1.5 font-mono">
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  title="First Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  title="Previous Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Dynamic Page Buttons */}
                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      if (p === 0 || p === totalPages - 1) return true;
                      return Math.abs(p - currentPage) <= 1;
                    })
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev !== undefined && pageNum - prev > 1;

                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && (
                            <span className="px-1 text-slate-600 select-none">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all ${
                              currentPage === pageNum
                                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold border border-cyan-400/30'
                                : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  title="Next Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  title="Last Page"
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
