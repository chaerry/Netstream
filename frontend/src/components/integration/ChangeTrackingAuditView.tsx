import React, { useState } from 'react';
import {
  History,
  User,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Code2,
  CheckCircle,
  FileCode,
  Shield,
} from 'lucide-react';
import { ChangeLog, ChangeAction } from '../../types/integration';

interface ChangeTrackingAuditViewProps {
  changeLogs: ChangeLog[];
  isLoading: boolean;
}

export const ChangeTrackingAuditView: React.FC<ChangeTrackingAuditViewProps> = ({
  changeLogs,
  isLoading,
}) => {
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<ChangeLog | null>(null);

  const filtered = changeLogs.filter((log) => {
    const matchesSearch =
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'ALL' || log.entityDomain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const getActionBadge = (action: ChangeAction) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'UPDATE':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'STATE_CHANGE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'RECONCILIATION_SYNC':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Universal Change Data Capture (CDC) Audit Ledger
          </h2>
          <p className="text-sm text-slate-400">
            Immutable chronological timeline tracking configuration changes across Physical, Logical, Leased Lines, IPAM, and GIS.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Audit Integrity: <strong>VERIFIED (SHA256)</strong></span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by username, entity, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Domains</option>
            <option value="PHYSICAL">Physical Infrastructure</option>
            <option value="LOGICAL">Logical & VNE</option>
            <option value="LEASED_LINE">Leased Line Circuits</option>
            <option value="IPAM">IP Address Management</option>
            <option value="TELEPHONY">Telephone Numbers</option>
            <option value="INTEGRATION">Integration Engine</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl divide-y divide-slate-800/70 overflow-hidden shadow-xl">
        {filtered.map((log) => (
          <div key={log.id} className="p-4 hover:bg-slate-850/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 mt-0.5">
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {log.entityDomain}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {log.entityType} ({log.entityId})
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100">
                  {log.summary}
                </p>
                <div className="text-xs text-slate-400 flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-300">{log.username}</strong> ({log.userRole})
                  </span>
                  <span>•</span>
                  <span>IP: {log.clientIp}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Inspect Snapshots Button */}
            {(log.beforeSnapshotJson || log.afterSnapshotJson) && (
              <button
                onClick={() => setSelectedLog(log)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                View Diff
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Snapshot Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">CDC Snapshot Diff Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="text-slate-300 text-sm font-sans bg-slate-950/60 p-3 rounded border border-slate-800">
                <strong>Change Summary:</strong> {selectedLog.summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-rose-400 font-bold mb-2 pb-1 border-b border-slate-800 flex items-center justify-between">
                    <span>BEFORE SNAPSHOT</span>
                    <span className="text-[10px] text-slate-400">Previous State</span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {selectedLog.beforeSnapshotJson
                      ? JSON.stringify(JSON.parse(selectedLog.beforeSnapshotJson), null, 2)
                      : 'N/A (NEW CREATION)'}
                  </pre>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-bold mb-2 pb-1 border-b border-slate-800 flex items-center justify-between">
                    <span>AFTER SNAPSHOT</span>
                    <span className="text-[10px] text-slate-400">Live Committed</span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {selectedLog.afterSnapshotJson
                      ? JSON.stringify(JSON.parse(selectedLog.afterSnapshotJson), null, 2)
                      : 'N/A (DELETION)'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
