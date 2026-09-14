import React, { useState, useMemo } from 'react';
import {
  Server,
  Activity,
  RefreshCw,
  Plus,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Search,
  SlidersHorizontal,
  Wifi,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Table,
  Rows3,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  Network,
  Cpu,
} from 'lucide-react';
import { Connector } from '../../types/integration';

interface ConnectorHubViewProps {
  connectors: Connector[];
  onTestConnector: (id: number) => Promise<void>;
  onTriggerDiscovery: (connectorId: number) => Promise<void>;
  onOpenCreateModal: () => void;
  isLoading: boolean;
}

type ViewMode = 'grid' | 'table' | 'dense';
type SortField = 'name' | 'vendor' | 'status' | 'pingLatencyMs' | 'managedElementsCount' | 'syncIntervalMins';
type SortDirection = 'asc' | 'desc';

export const ConnectorHubView: React.FC<ConnectorHubViewProps> = ({
  connectors,
  onTestConnector,
  onTriggerDiscovery,
  onOpenCreateModal,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [testingId, setTestingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // KPI Calculations
  const totalConnectors = connectors.length;
  const onlineConnectors = connectors.filter((c) => c.status === 'ONLINE').length;
  const degradedConnectors = connectors.filter((c) => c.status === 'DEGRADED').length;
  const totalNodes = connectors.reduce((acc, c) => acc + (c.managedElementsCount || 0), 0);
  const avgLatency =
    totalConnectors > 0
      ? Math.round(connectors.reduce((acc, c) => acc + (c.pingLatencyMs || 0), 0) / totalConnectors)
      : 0;

  // Filter and Sort
  const filteredAndSorted = useMemo(() => {
    return connectors
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.endpointUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.protocol.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVendor = vendorFilter === 'ALL' || c.vendor === vendorFilter;
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        return matchesSearch && matchesVendor && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [connectors, searchTerm, vendorFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    await onTestConnector(id);
    setTestingId(null);
  };

  const handleDiscovery = async (id: number) => {
    setSyncingId(id);
    await onTriggerDiscovery(id);
    setSyncingId(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAndSorted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSorted.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchPing = async () => {
    for (const id of selectedIds) {
      await handleTest(id);
    }
  };

  const handleBatchDiscovery = async () => {
    for (const id of selectedIds) {
      await handleDiscovery(id);
    }
  };

  const getVendorBadgeColor = (vendor: string) => {
    switch (vendor.toUpperCase()) {
      case 'HUAWEI':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'CISCO':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'NOKIA':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ZTE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency <= 15) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (latency <= 40) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 inline ml-1 opacity-60" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-cyan-400 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-cyan-400 inline ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Southbound Multi-Vendor EMS / NMS Connectors
          </h2>
          <p className="text-sm text-slate-400">
            Real-time mediation layer connecting live network management systems for continuous auto-discovery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Connector
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Total Connectors</span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            {totalConnectors}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Online & Synced</span>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {onlineConnectors}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Degraded / Alert</span>
          <div className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            {degradedConnectors}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Managed Nodes</span>
          <div className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            {totalNodes.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 block mb-1">Average Latency</span>
          <div className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            {avgLatency} ms
          </div>
        </div>
      </div>

      {/* Filter, Search & Layout Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by connector name, endpoint, vendor, or protocol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Vendor Filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Vendors</option>
              <option value="HUAWEI">Huawei</option>
              <option value="CISCO">Cisco</option>
              <option value="NOKIA">Nokia</option>
              <option value="ZTE">ZTE</option>
              <option value="GENERIC_SNMP">Generic SNMP</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ONLINE">Online</option>
            <option value="DEGRADED">Degraded</option>
            <option value="OFFLINE">Offline</option>
          </select>

          {/* Layout View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('dense')}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'dense'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dense NOC View"
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar (if items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-lg text-xs text-cyan-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-300">{selectedIds.length} connector(s) selected</span>
            <span className="text-slate-400">|</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white underline transition"
            >
              Clear Selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchPing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium border border-slate-700 transition"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Batch Ping Test
            </button>
            <button
              onClick={handleBatchDiscovery}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 rounded font-medium border border-cyan-500/40 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-300" />
              Batch Discovery Scan
            </button>
          </div>
        </div>
      )}

      {/* LAYOUT 1: FULL DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredAndSorted.length > 0 && selectedIds.length === filteredAndSorted.length}
                      onChange={handleSelectAll}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-200 transition select-none"
                  >
                    Connector Name & Vendor {renderSortIndicator('name')}
                  </th>
                  <th className="px-4 py-3.5">Endpoint & Protocol</th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-200 transition select-none"
                  >
                    Health Status {renderSortIndicator('status')}
                  </th>
                  <th
                    onClick={() => handleSort('pingLatencyMs')}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-200 transition select-none"
                  >
                    Ping Latency {renderSortIndicator('pingLatencyMs')}
                  </th>
                  <th
                    onClick={() => handleSort('managedElementsCount')}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-200 transition select-none"
                  >
                    Managed Nodes {renderSortIndicator('managedElementsCount')}
                  </th>
                  <th
                    onClick={() => handleSort('syncIntervalMins')}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-200 transition select-none"
                  >
                    Cadence {renderSortIndicator('syncIntervalMins')}
                  </th>
                  <th className="px-4 py-3.5">Auto-Reconcile</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500">
                      No connectors match the current query or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((conn) => {
                    const isSelected = selectedIds.includes(conn.id);
                    return (
                      <tr
                        key={conn.id}
                        className={`transition-colors hover:bg-slate-800/40 ${
                          isSelected ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(conn.id)}
                            className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                          />
                        </td>

                        {/* Connector & Vendor */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getVendorBadgeColor(
                                conn.vendor
                              )}`}
                            >
                              {conn.vendor}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-100 hover:text-cyan-300 transition-colors">
                                {conn.name}
                              </div>
                              <span className="text-xs text-slate-500 font-mono">
                                ID: #{conn.id} &bull; {conn.connectorType}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Endpoint & Protocol */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <span className="text-xs font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/90 inline-block max-w-[280px] truncate" title={conn.endpointUrl}>
                              {conn.endpointUrl}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-medium">
                                {conn.protocol}
                              </span>
                              <span className="text-slate-500">&bull;</span>
                              <span>{conn.authType}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                conn.status === 'ONLINE'
                                  ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50'
                                  : conn.status === 'DEGRADED'
                                  ? 'bg-amber-400'
                                  : 'bg-rose-400'
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold capitalize ${
                                conn.status === 'ONLINE'
                                  ? 'text-emerald-400'
                                  : conn.status === 'DEGRADED'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {conn.status.toLowerCase()}
                            </span>
                          </div>
                        </td>

                        {/* Ping Latency */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${getLatencyColor(
                              conn.pingLatencyMs
                            )}`}
                          >
                            <Zap className="w-3 h-3" />
                            {conn.pingLatencyMs} ms
                          </span>
                        </td>

                        {/* Managed Nodes */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-300">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{conn.managedElementsCount} Nodes</span>
                          </div>
                        </td>

                        {/* Cadence */}
                        <td className="px-4 py-4">
                          <div className="text-xs text-slate-300">
                            <div className="flex items-center gap-1 text-slate-300">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Every {conn.syncIntervalMins}m</span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {conn.lastSyncAt ? `Last: ${conn.lastSyncAt.split('T')[1]?.substring(0, 5) || 'Recent'}` : 'Scheduled'}
                            </span>
                          </div>
                        </td>

                        {/* Auto-Reconcile Policy */}
                        <td className="px-4 py-4">
                          {conn.autoReconcileEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="w-3 h-3" />
                              Auto-Approve Minor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              Manual Review
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTest(conn.id)}
                              disabled={testingId === conn.id}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors flex items-center gap-1 border border-slate-700/60"
                              title="Execute real-time Ping/Handshake test"
                            >
                              <Activity
                                className={`w-3.5 h-3.5 ${
                                  testingId === conn.id ? 'animate-spin text-cyan-400' : 'text-slate-400'
                                }`}
                              />
                              <span className="hidden lg:inline">
                                {testingId === conn.id ? 'Pinging...' : 'Ping'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDiscovery(conn.id)}
                              disabled={syncingId === conn.id}
                              className="px-2.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              title="Trigger immediate discovery scan"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                  syncingId === conn.id ? 'animate-spin text-cyan-400' : 'text-cyan-400'
                                }`}
                              />
                              <span className="hidden lg:inline">
                                {syncingId === conn.id ? 'Scanning...' : 'Scan'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Table Footer */}
          <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Showing <strong className="text-slate-200">{filteredAndSorted.length}</strong> of{' '}
              <strong className="text-slate-200">{connectors.length}</strong> registered connectors
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online: {onlineConnectors}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Degraded: {degradedConnectors}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT 2: COMPACT / DENSE TABLE VIEW */}
      {viewMode === 'dense' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={filteredAndSorted.length > 0 && selectedIds.length === filteredAndSorted.length}
                      onChange={handleSelectAll}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className="px-3 py-2 cursor-pointer hover:text-slate-200">
                    Connector {renderSortIndicator('name')}
                  </th>
                  <th onClick={() => handleSort('vendor')} className="px-3 py-2 cursor-pointer hover:text-slate-200">
                    Vendor {renderSortIndicator('vendor')}
                  </th>
                  <th className="px-3 py-2">Endpoint</th>
                  <th className="px-3 py-2">Proto</th>
                  <th onClick={() => handleSort('status')} className="px-3 py-2 cursor-pointer hover:text-slate-200">
                    Status {renderSortIndicator('status')}
                  </th>
                  <th onClick={() => handleSort('pingLatencyMs')} className="px-3 py-2 cursor-pointer hover:text-slate-200">
                    Latency {renderSortIndicator('pingLatencyMs')}
                  </th>
                  <th onClick={() => handleSort('managedElementsCount')} className="px-3 py-2 cursor-pointer hover:text-slate-200">
                    Nodes {renderSortIndicator('managedElementsCount')}
                  </th>
                  <th onClick={() => handleSort('syncIntervalMins')} className="px-3 py-2 cursor-pointer hover:text-slate-200">
                    Cadence {renderSortIndicator('syncIntervalMins')}
                  </th>
                  <th className="px-3 py-2 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {filteredAndSorted.map((conn) => {
                  const isSelected = selectedIds.includes(conn.id);
                  return (
                    <tr
                      key={conn.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(conn.id)}
                          className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                        />
                      </td>
                      <td className="px-3 py-2 font-sans font-semibold text-slate-100">
                        {conn.name}
                      </td>
                      <td className="px-3 py-2 font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getVendorBadgeColor(conn.vendor)}`}>
                          {conn.vendor}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-400 truncate max-w-[200px]" title={conn.endpointUrl}>
                        {conn.endpointUrl}
                      </td>
                      <td className="px-3 py-2 text-slate-300 font-sans">{conn.protocol}</td>
                      <td className="px-3 py-2 font-sans">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              conn.status === 'ONLINE'
                                ? 'bg-emerald-400 animate-pulse'
                                : conn.status === 'DEGRADED'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="capitalize">{conn.status.toLowerCase()}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={conn.pingLatencyMs <= 20 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {conn.pingLatencyMs}ms
                        </span>
                      </td>
                      <td className="px-3 py-2 text-cyan-300 font-sans">{conn.managedElementsCount}</td>
                      <td className="px-3 py-2 text-slate-400 font-sans">{conn.syncIntervalMins}m</td>
                      <td className="px-3 py-2 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTest(conn.id)}
                            disabled={testingId === conn.id}
                            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
                            title="Ping Test"
                          >
                            <Activity className={`w-3.5 h-3.5 ${testingId === conn.id ? 'animate-spin text-cyan-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDiscovery(conn.id)}
                            disabled={syncingId === conn.id}
                            className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 rounded transition"
                            title="Discovery Scan"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingId === conn.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LAYOUT 3: CARD GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSorted.map((conn) => (
            <div
              key={conn.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${getVendorBadgeColor(
                        conn.vendor
                      )}`}
                    >
                      {conn.vendor}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {conn.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        conn.status === 'ONLINE'
                          ? 'bg-emerald-400 animate-pulse'
                          : conn.status === 'DEGRADED'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="text-xs font-medium text-slate-300 capitalize">
                      {conn.status.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Endpoint & Protocol */}
                <p className="text-xs text-slate-400 font-mono truncate mb-4 bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800/80">
                  {conn.endpointUrl}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                    <span className="text-slate-400 block">Protocol</span>
                    <span className="font-semibold text-slate-200">{conn.protocol}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                    <span className="text-slate-400 block">Ping Latency</span>
                    <span className="font-semibold text-emerald-400">{conn.pingLatencyMs} ms</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                    <span className="text-slate-400 block">Managed Elements</span>
                    <span className="font-semibold text-cyan-400">{conn.managedElementsCount} Nodes</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded border border-slate-800/50">
                    <span className="text-slate-400 block">Sync Interval</span>
                    <span className="font-semibold text-slate-200">Every {conn.syncIntervalMins}m</span>
                  </div>
                </div>

                {/* Auto Reconcile Pill */}
                <div className="flex items-center justify-between text-xs text-slate-400 py-1 border-t border-slate-800/60 mb-4">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Auto-Reconcile:
                  </span>
                  <span className={`font-semibold ${conn.autoReconcileEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {conn.autoReconcileEnabled ? 'Active (Auto-Approve Minor)' : 'Manual Review'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleTest(conn.id)}
                  disabled={testingId === conn.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <Activity
                    className={`w-3.5 h-3.5 ${
                      testingId === conn.id ? 'animate-spin text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  {testingId === conn.id ? 'Testing...' : 'Ping Test'}
                </button>
                <button
                  onClick={() => handleDiscovery(conn.id)}
                  disabled={syncingId === conn.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      syncingId === conn.id ? 'animate-spin text-cyan-400' : 'text-cyan-400'
                    }`}
                  />
                  {syncingId === conn.id ? 'Scanning...' : 'Discovery Scan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

