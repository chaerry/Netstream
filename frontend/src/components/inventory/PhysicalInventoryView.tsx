import React, { useState, useEffect, useCallback } from 'react';
import { NetworkDevice, DeviceTypeOption, Rack } from '../../types/inventory';
import { inventoryApi } from '../../api/inventoryApi';
import { useAuth } from '../../auth/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import { RackElevationViewer } from './RackElevationViewer';
import { CreateDeviceModal } from './CreateDeviceModal';
import { EditDeviceModal } from './EditDeviceModal';
import { PortInspectorModal } from './PortInspectorModal';
import { CreateRackModal } from './CreateRackModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  Server,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Grid,
  Layers,
  Network,
  Zap,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Database
} from 'lucide-react';

export const PhysicalInventoryView: React.FC = () => {
  const { hasRole, hasAnyRole } = useAuth();
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeOption[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [rackDevices, setRackDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingDevice, setDeletingDevice] = useState<NetworkDevice | null>(null);

  // Default to 42U Elevation View as requested
  const [viewMode, setViewMode] = useState<'rack' | 'grid'>('grid');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showAddRackModal, setShowAddRackModal] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);
  const [inspectingDevice, setInspectingDevice] = useState<NetworkDevice | null>(null);
  const [prefilledUnit, setPrefilledUnit] = useState<number | undefined>();

  useEffect(() => {
    inventoryApi.getDeviceTypes().then(setDeviceTypes).catch(console.error);
  }, []);

  // Sync full rack devices whenever selectedRack changes
  const fetchRackDevices = useCallback(async (rackId: string) => {
    try {
      const devs = await inventoryApi.getDevicesByRack(rackId);
      setRackDevices(devs);
    } catch (e) {
      console.error('Failed to load rack devices:', e);
    }
  }, []);

  useEffect(() => {
    if (selectedRack) {
      fetchRackDevices(selectedRack.id);
    }
  }, [selectedRack, fetchRackDevices]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const cleanSearch = searchTerm.trim().replace(/\s+/g, ' ');
      const [devRes, rackList] = await Promise.all([
        inventoryApi.getDevices({
          search: cleanSearch || undefined,
          type: selectedType || undefined,
          status: selectedStatus || undefined,
          page: currentPage,
          size: pageSize,
        }),
        inventoryApi.getRacks(),
      ]);
      setDevices(devRes.items);
      setTotalElements(devRes.totalElements);
      setTotalPages(devRes.totalPages);
      setRacks(rackList);

      if (rackList.length > 0) {
        setSelectedRack((prev) => {
          // If searching and matching devices were found, auto-switch to the first matching device's rack if not currently selected
          if (cleanSearch && devRes.items.length > 0) {
            const currentHasMatch = prev && devRes.items.some((d) => d.rackId === prev.id);
            if (!currentHasMatch) {
              const matchedRack = rackList.find((r) => r.id === devRes.items[0].rackId);
              if (matchedRack) return matchedRack;
            }
          }
          return prev ? rackList.find((r) => r.id === prev.id) || rackList[0] : rackList[0];
        });
      }
    } catch (err) {
      console.error('Failed to fetch physical inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedStatus, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when search/filters change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(0);
  };

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    setCurrentPage(0);
  };

  const handleStatusChangeFilter = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(0);
  };

  const handleAddAtUnit = (unit: number) => {
    setPrefilledUnit(unit);
    setShowCreateModal(true);
  };

  const totalActive = devices.filter(d => d.status === 'ACTIVE').length;
  const totalPorts = devices.reduce((sum, d) => sum + (d.totalPorts || 0), 0);
  const totalCapex = devices.reduce((sum, d) => sum + (d.costUsd || 0), 0);

  // Calculate display range
  const startRecord = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate pagination window
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Hardware Chassis"
          value={totalElements}
          subtitle={`${totalActive} Active on current page`}
          icon={<Server className="w-5 h-5" />}
          accentColor="cyan"
          trend={{ value: '100% Operational', isPositive: true }}
        />
        <StatCard
          title="Physical Fiber & Copper Ports"
          value={totalPorts}
          subtitle="100GE / 40GE / 10GE Optical"
          icon={<Network className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Server Rack Space"
          value="42U Elevation"
          subtitle="Core Room 301 Suite B"
          icon={<Layers className="w-5 h-5" />}
          accentColor="purple"
        />
        <StatCard
          title="Hardware Asset CAPEX"
          value={`$${(totalCapex / 1000).toFixed(0)}k`}
          subtitle="Telecom Asset Book Value"
          icon={<Zap className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Category Filter Tabs: All, Active (ANE), Passive (PNE) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedType('');
              setCurrentPage(0);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              !selectedType || (!['ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'DDF', 'PATCH_PANEL'].includes(selectedType) && !['ROUTER', 'SWITCH', 'DWDM_CHASSIS', 'OLT', 'METRO', 'FIREWALL', 'SERVER', 'DSLAM', 'ONT'].includes(selectedType))
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>All Physical Equipment</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] font-mono">{totalElements}</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('ROUTER');
              setCurrentPage(0);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              ['ROUTER', 'SWITCH', 'DWDM_CHASSIS', 'OLT', 'METRO', 'FIREWALL', 'SERVER', 'DSLAM', 'ONT'].includes(selectedType)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Electronic Equipment (ANE)</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('ODF');
              setCurrentPage(0);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              ['ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'DDF', 'PATCH_PANEL'].includes(selectedType)
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>Passive Optical Infrastructure (PNE)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">ODF / ODC / ODP / FOSC</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono pr-3 hidden md:inline">
          Hybrid Polymorphic Model • VC4 S2C Standard
        </span>
      </div>

      {/* Controls & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search hostname, serial, model, vendor..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="glass-input w-full pl-9 pr-4 py-2 text-xs rounded-xl"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="glass-input px-3 py-2 text-xs rounded-xl"
          >
            <option value="">All Device Types</option>
            <optgroup label="⚡ Active Electronic Equipment (ANE)">
              {deviceTypes.filter(t => !['ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'DDF', 'PATCH_PANEL'].includes(t.code)).map((type) => (
                <option key={type.code} value={type.code}>
                  {type.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="🍃 Passive Optical Infrastructure (PNE)">
              {deviceTypes.filter(t => ['ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'DDF', 'PATCH_PANEL'].includes(t.code)).map((type) => (
                <option key={type.code} value={type.code}>
                  {type.label}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChangeFilter(e.target.value)}
            className="glass-input px-3 py-2 text-xs rounded-xl"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PLANNED">Planned</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="FAULTY">Faulty</option>
          </select>
        </div>

        {/* Right Buttons: Refresh, View Toggle & Add Equipment */}
        <div className="flex items-center gap-3">
          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchData()}
            disabled={loading}
            title="Refresh from Database"
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('rack')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'rack'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              42U Elevation View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'grid'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>

          {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
            <button
              onClick={() => {
                setPrefilledUnit(undefined);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* Main View Mode Area */}
      {viewMode === 'rack' ? (
        selectedRack ? (
          <RackElevationViewer
            rack={selectedRack}
            allRacks={racks}
            onSelectRack={(r) => setSelectedRack(r)}
            devices={rackDevices.length > 0 ? rackDevices : devices}
            allFoundDevices={devices}
            searchTerm={searchTerm}
            onSelectDevice={(d) => setInspectingDevice(d)}
            onEditDevice={(d) => setEditingDevice(d)}
            onAddDeviceToUnit={handleAddAtUnit}
            onAddRack={() => setShowAddRackModal(true)}
          />
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
            <p>Loading 42U Rack Elevation Telemetry...</p>
          </div>
        )
      ) : (
        /* Data Grid View */
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 relative">
          {/* Top scanning progress bar */}
          {loading && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse z-20" />
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Device Hostname</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Vendor & Model</th>
                  <th className="py-3.5 px-4">Ports</th>
                  <th className="py-3.5 px-4">Serial / Asset Tag</th>
                  <th className="py-3.5 px-4">Management IP</th>
                  <th className="py-3.5 px-4">Rack Position</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                      Streaming physical inventory telemetry...
                    </td>
                  </tr>
                ) : devices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-500">
                      No network equipment records found matching query.
                    </td>
                  </tr>
                ) : (
                  devices.map((device) => {
                    const isPassive = ['ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'DDF', 'PATCH_PANEL'].includes(device.deviceType);
                    return (
                      <tr key={device.id} className={`transition-colors ${isPassive ? 'hover:bg-emerald-950/20 bg-emerald-950/5' : 'hover:bg-slate-800/40'}`}>
                        <td className="py-3.5 px-5 font-sans font-bold text-white flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isPassive ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                          <div className="flex flex-col">
                            <span>{device.hostname}</span>
                            {isPassive && (
                              <span className="text-[9px] text-emerald-400 font-mono">
                                Passive Optical Infrastructure (PNE)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            isPassive
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-cyan-300 border-slate-700'
                          }`}>
                            {device.deviceType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{device.vendor}</span>
                            <span className="text-slate-400 text-[11px] truncate max-w-[200px]" title={device.model}>{device.model}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {isPassive ? (
                            <span className="text-emerald-300 font-bold">
                              {device.totalPorts || device.ports?.length || 0} Cores/Ports
                            </span>
                          ) : (
                            <span className="text-cyan-300">
                              {device.ports?.length ?? 0} <span className="text-slate-500 font-normal">/ {device.totalPorts || device.ports?.length || 0}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {device.serialNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          {device.managementIp ? (
                            <span className="text-cyan-400 font-mono">{device.managementIp}</span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                              Non-Powered
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {device.rackUnitStart && device.rackUnitStart > 0 ? (
                            <span className="text-amber-400 font-mono">
                              U{device.rackUnitStart} ({device.rackUnitHeight || 1}U)
                            </span>
                          ) : isPassive ? (
                            <span className="text-emerald-400 font-mono text-[10px]">
                              Outdoor / Manhole / Pole FAT
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono">Unmounted</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <StatusBadge status={device.status} />
                        </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
                            <button
                              onClick={() => setEditingDevice(device)}
                              title="Modify Device Configuration (IP, Rack, Status)"
                              className="p-1.5 bg-slate-800 text-amber-400 hover:bg-amber-600 hover:text-white rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setInspectingDevice(device)}
                            title="Inspect Ports & Interfaces"
                            className="p-1.5 bg-slate-800 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {hasRole('inventory-admin') && (
                            <button
                              onClick={() => setDeletingDevice(device)}
                              title="Decommission Equipment"
                              className="p-1.5 bg-slate-800 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-slate-900/90 border-t border-slate-800/80">
            {/* Left: Records Per Page & Current Range */}
            <div className="flex items-center gap-4 text-xs text-slate-400 font-sans">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="glass-input px-2.5 py-1 text-xs rounded-lg border-slate-700 bg-slate-950 text-slate-200"
                >
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
                    of <strong className="text-cyan-400">{totalElements}</strong> total devices
                  </span>
                ) : (
                  <span>No devices found</span>
                )}
              </div>
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1.5 font-mono">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0 || loading}
                title="First Page"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                title="Previous Page"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dynamic Page Window */}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                title="Next Page"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1 || loading}
                title="Last Page"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateDeviceModal
          racks={racks}
          initialUnit={prefilledUnit}
          onClose={() => {
            setShowCreateModal(false);
            setPrefilledUnit(undefined);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setPrefilledUnit(undefined);
            fetchData();
          }}
        />
      )}

      {showAddRackModal && (
        <CreateRackModal
          isOpen={showAddRackModal}
          preselectedLocation={null}
          onClose={() => setShowAddRackModal(false)}
          onSuccess={() => {
            setShowAddRackModal(false);
            fetchData();
          }}
        />
      )}

      {editingDevice && (
        <EditDeviceModal
          device={editingDevice}
          racks={racks}
          onClose={() => setEditingDevice(null)}
          onSuccess={() => {
            setEditingDevice(null);
            fetchData();
          }}
        />
      )}

      {inspectingDevice && (
        <PortInspectorModal
          device={inspectingDevice}
          onClose={() => setInspectingDevice(null)}
          onPortAdded={() => fetchData()}
        />
      )}

      {deletingDevice && (
        <ConfirmDeleteModal
          isOpen={!!deletingDevice}
          itemType="DEVICE"
          itemId={deletingDevice.id}
          itemCode={deletingDevice.hostname}
          itemName={`${deletingDevice.vendor || ''} ${deletingDevice.model || ''}`}
          onClose={() => setDeletingDevice(null)}
          onConfirm={async () => {
            await inventoryApi.deleteDevice(deletingDevice.id);
            setDeletingDevice(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
