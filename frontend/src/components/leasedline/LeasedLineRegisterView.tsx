import React, { useState } from 'react';
import {
  LeasedLineCircuit,
  CircuitDirection,
  CircuitTechnology,
  CircuitLifecycleStatus,
} from '../../types/leasedLine';
import {
  GitBranch,
  Search,
  Filter,
  Plus,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Zap,
  Clock,
  ShieldCheck,
  Building,
  Radio,
  Eye,
  AlertTriangle,
  RefreshCw,
  PowerOff,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';

interface LeasedLineRegisterViewProps {
  circuits: LeasedLineCircuit[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectCircuitForTopology: (circuit: LeasedLineCircuit) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (circuit: LeasedLineCircuit) => void;
  onOpenDecomModal: (circuit: LeasedLineCircuit) => void;
}

export const LeasedLineRegisterView: React.FC<LeasedLineRegisterViewProps> = ({
  circuits,
  isLoading,
  onRefresh,
  onSelectCircuitForTopology,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDecomModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');
  const [technologyFilter, setTechnologyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter logic
  const filteredCircuits = circuits.filter((c) => {
    const matchesSearch =
      c.circuitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.circuitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.carrierCircuitId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDirection = directionFilter === 'ALL' || c.direction === directionFilter;
    const matchesTechnology = technologyFilter === 'ALL' || c.technology === technologyFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesDirection && matchesTechnology && matchesStatus;
  });

  // Calculate high-level financial & capacity KPIs
  const totalCircuits = circuits.length;
  const inboundCount = circuits.filter((c) => c.direction === 'INBOUND_RENTED').length;
  const outboundCount = circuits.filter((c) => c.direction === 'OUTBOUND_CUSTOMER').length;
  
  const totalMonthlyOpexUsd = circuits
    .filter((c) => c.direction === 'INBOUND_RENTED' && c.status === 'ACTIVE')
    .reduce((sum, c) => sum + c.mrc, 0);

  const totalMonthlyRevenueUsd = circuits
    .filter((c) => c.direction === 'OUTBOUND_CUSTOMER' && c.status === 'ACTIVE')
    .reduce((sum, c) => sum + c.mrc, 0);

  const dormantCount = circuits.filter((c) => c.isDormant || c.status === 'DORMANT').length;
  const potentialSavings = circuits
    .filter((c) => c.isDormant || c.status === 'DORMANT')
    .reduce((sum, c) => sum + c.mrc, 0);

  const getStatusBadge = (status: CircuitLifecycleStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'DORMANT':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            DORMANT (OPEX WASTE)
          </span>
        );
      case 'PENDING_DECOMMISSION':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-400" />
            BPMN DECOM
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 w-fit">
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 w-fit">
            {status}
          </span>
        );
    }
  };

  const getDirectionBadge = (dir: CircuitDirection) => {
    if (dir === 'INBOUND_RENTED') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 w-fit">
          <TrendingDown className="w-3 h-3 text-purple-400" />
          Inbound (Rented)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
        <Zap className="w-3 h-3 text-blue-400" />
        Outbound (Customer)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Inbound OpEx"
          value={`$${totalMonthlyOpexUsd.toLocaleString()}/mo`}
          subtitle={`${inboundCount} Carrier Off-Net Tails`}
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
        />
        <StatCard
          title="Active Outbound Revenue"
          value={`$${totalMonthlyRevenueUsd.toLocaleString()}/mo`}
          subtitle={`${outboundCount} Enterprise Symmetrical Circuits`}
          icon={<Zap className="w-5 h-5 text-blue-400" />}
        />
        <StatCard
          title="OpEx Waste (Dormant)"
          value={`$${potentialSavings.toLocaleString()}/mo`}
          subtitle={`${dormantCount} Circuits with 0 Traffic`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        />
        <StatCard
          title="Average Target SLA"
          value="99.99%"
          subtitle="Tier-1 Enterprise Guarantee"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Action Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Circuit ID, Name, Carrier, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Direction Filter */}
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Directions</option>
            <option value="INBOUND_RENTED">Inbound (Off-Net / Rented)</option>
            <option value="OUTBOUND_CUSTOMER">Outbound (On-Net / Sold)</option>
          </select>

          {/* Technology Filter */}
          <select
            value={technologyFilter}
            onChange={(e) => setTechnologyFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Technologies</option>
            <option value="EPL">EPL (Ethernet Private Line)</option>
            <option value="EVPL">EVPL (VLAN Tagged)</option>
            <option value="DIA">DIA (Dedicated Internet)</option>
            <option value="DWDM_LAMBDA">DWDM Lambda (100G+)</option>
            <option value="DARK_FIBER">Dark Fiber (Pair)</option>
            <option value="SDH_VC4">SDH / VC4</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DORMANT">Dormant (OpEx Flagged)</option>
            <option value="PENDING_DECOMMISSION">Pending Decommission</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Refresh circuits"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Provision Leased Circuit
          </button>
        </div>
      </div>

      {/* Circuit Register Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Circuit ID & Details</th>
                <th className="px-4 py-3.5">Direction & Tech</th>
                <th className="px-4 py-3.5">Bandwidth & SLA</th>
                <th className="px-4 py-3.5">A-End / Z-End Endpoints</th>
                <th className="px-4 py-3.5">Monthly Cost (USD)</th>
                <th className="px-4 py-3.5">Utilization & Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCircuits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No leased line circuits matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCircuits.map((circuit) => (
                  <tr
                    key={circuit.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectCircuitForTopology(circuit)}
                  >
                    {/* Circuit ID & Details */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-semibold text-purple-300 group-hover:text-purple-200 flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4 text-purple-400" />
                        {circuit.circuitId}
                      </div>
                      <div className="text-xs text-slate-300 font-medium truncate max-w-xs mt-0.5">
                        {circuit.circuitName}
                      </div>
                      {circuit.carrierCircuitId && (
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          Carrier Ref: {circuit.carrierCircuitId}
                        </div>
                      )}
                    </td>

                    {/* Direction & Tech */}
                    <td className="px-4 py-3.5 space-y-1">
                      {getDirectionBadge(circuit.direction)}
                      <div className="text-xs font-semibold text-slate-300">
                        {circuit.technology}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {circuit.carrierName || circuit.customerName || 'Netstream Core'}
                      </div>
                    </td>

                    {/* Bandwidth & SLA */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        {circuit.bandwidthDisplay}
                      </div>
                      <div className="text-xs text-emerald-400 mt-0.5">
                        {circuit.uptimeTargetPercent}% Uptime
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Latency: {circuit.actualLatencyMs}ms (Max: {circuit.committedLatencyMs}ms)
                      </div>
                    </td>

                    {/* Endpoints */}
                    <td className="px-4 py-3.5 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        {circuit.aEndLocationName || 'A-End Origin'}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-1 truncate max-w-[200px]">
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {circuit.zEndLocationName || 'Z-End Term'}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-emerald-300 font-mono">
                        ${circuit.mrc.toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-normal"> /mo</span>
                      </div>
                      {circuit.nrc > 0 && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          NRC: ${circuit.nrc.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Utilization & Status */}
                    <td className="px-4 py-3.5 space-y-1.5">
                      {getStatusBadge(circuit.status)}
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            circuit.utilizationPercent > 80
                              ? 'bg-amber-400'
                              : circuit.utilizationPercent < 5
                              ? 'bg-rose-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(circuit.utilizationPercent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Traffic: {circuit.utilizationPercent}%
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectCircuitForTopology(circuit)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
                          title="View Inventory Topology Path"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(circuit)}
                          className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded transition"
                          title="Edit Circuit"
                        >
                          <GitBranch className="w-4 h-4" />
                        </button>
                        {circuit.isDormant && (
                          <button
                            onClick={() => onOpenDecomModal(circuit)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded transition"
                            title="Decommission via Gaharu BPMN"
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
