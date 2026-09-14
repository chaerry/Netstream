import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  ShieldAlert,
  Send,
  Sparkles,
  Layers,
  Eye,
} from 'lucide-react';
import { ReconciliationItem, ReconciliationStatus, DiscrepancyType } from '../../types/integration';

interface ReconciliationCenterViewProps {
  items: ReconciliationItem[];
  onResolve: (id: number, action: string, notes?: string) => Promise<void>;
  onInspectDiff: (item: ReconciliationItem) => void;
  isLoading: boolean;
}

export const ReconciliationCenterView: React.FC<ReconciliationCenterViewProps> = ({
  items,
  onResolve,
  onInspectDiff,
  isLoading,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actingId, setActingId] = useState<number | null>(null);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.entityIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.connectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.attributeName && item.attributeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.discrepancyType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAction = async (id: number, action: string, notes?: string) => {
    setActingId(id);
    await onResolve(id, action, notes);
    setActingId(null);
  };

  const getDiscrepancyBadge = (type: DiscrepancyType) => {
    switch (type) {
      case 'NEW_DISCOVERED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'MISSING_IN_LIVE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'STATE_DRIFT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ATTRIBUTE_MISMATCH':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'AUTO_RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MANUALLY_SYNCED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'REJECTED_ROGUE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'ESCALATED_BPMN':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            Automated Inventory Reconciliation Center
          </h2>
          <p className="text-sm text-slate-400">
            Automated 3-Way diff detection comparing Live Discovered Network State against Netstream SSoT Inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold">
            {items.filter((i) => i.status === 'PENDING_REVIEW').length} Pending Review
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
            {items.filter((i) => i.status === 'AUTO_RESOLVED' || i.status === 'MANUALLY_SYNCED').length} Synced
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by entity identifier, attribute, or connector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="AUTO_RESOLVED">Auto-Resolved</option>
            <option value="MANUALLY_SYNCED">Manually Synced</option>
            <option value="REJECTED_ROGUE">Rejected Rogue</option>
            <option value="ESCALATED_BPMN">Escalated to BPMN</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Discrepancy Types</option>
            <option value="NEW_DISCOVERED">New Discovered</option>
            <option value="ATTRIBUTE_MISMATCH">Attribute Mismatch</option>
            <option value="STATE_DRIFT">State Drift</option>
            <option value="MISSING_IN_LIVE">Missing in Live</option>
          </select>
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Entity Identifier</th>
                <th className="py-3 px-3">Discrepancy Type</th>
                <th className="py-3 px-4">Current Inventory (SSoT)</th>
                <th className="py-3 px-4">Discovered Live State</th>
                <th className="py-3 px-3">Severity / Status</th>
                <th className="py-3 px-4 text-right">Resolution Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/40 transition-colors group">
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {item.entityIdentifier}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-slate-400">{item.entityType}</span>
                      <span>•</span>
                      <span className="text-slate-400">{item.connectorName}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDiscrepancyBadge(item.discrepancyType)}`}>
                      {item.discrepancyType.replace('_', ' ')}
                    </span>
                    {item.attributeName && (
                      <div className="text-xs text-slate-400 mt-1 font-mono">{item.attributeName}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs px-2.5 py-1.5 rounded font-mono truncate">
                      {item.inventoryValue || 'EMPTY / UNRECORDED'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-[220px]">
                    <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1.5 rounded font-mono truncate">
                      {item.liveDiscoveredValue || 'NOT_FOUND'}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        item.severity === 'MAJOR' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.severity}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'PENDING_REVIEW' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspectDiff(item)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                          title="Inspect JSON Diff"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'APPLY_TO_INVENTORY', '1-click sync applied by NOC engineer')}
                          disabled={actingId === item.id}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                        >
                          Accept & Sync
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'DISPATCH_WORK_ORDER', 'Field physical check dispatched')}
                          disabled={actingId === item.id}
                          className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded text-xs font-medium transition-colors"
                          title="Dispatch to Gaharu_BPMN_NGIN"
                        >
                          BPMN Flow
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.resolvedBy || 'Resolved'}</span>
                        {item.gaharuProcessInstanceId && (
                          <span className="text-purple-400 font-mono text-[11px] block ml-1">
                            ({item.gaharuProcessInstanceId})
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
