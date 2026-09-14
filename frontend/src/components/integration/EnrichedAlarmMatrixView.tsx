import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Server,
  Layers,
  MapPin,
  Cable,
  Building2,
  TrendingDown,
  ExternalLink,
  ShieldAlert,
  Send,
  Plus,
  Radio,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { EnrichedAlarm, AlarmSeverity } from '../../types/integration';

interface EnrichedAlarmMatrixViewProps {
  alarms: EnrichedAlarm[];
  onAlarmAction: (id: number, action: 'ACKNOWLEDGE' | 'CLEAR' | 'ESCALATE_GAHARU') => Promise<void>;
  onOpenSimulateModal: () => void;
  isLoading: boolean;
}

export const EnrichedAlarmMatrixView: React.FC<EnrichedAlarmMatrixViewProps> = ({
  alarms,
  onAlarmAction,
  onOpenSimulateModal,
  isLoading,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAlarm, setSelectedAlarm] = useState<EnrichedAlarm | null>(alarms[0] || null);
  const [actingId, setActingId] = useState<number | null>(null);

  const filtered = alarms.filter((a) => {
    const matchesSearch =
      a.alarmIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.alarmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.deviceName && a.deviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.leasedLineCircuitCode && a.leasedLineCircuitCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const handleAction = async (id: number, action: 'ACKNOWLEDGE' | 'CLEAR' | 'ESCALATE_GAHARU') => {
    setActingId(id);
    await onAlarmAction(id, action);
    setActingId(null);
  };

  const getSeverityBadge = (sev: AlarmSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
      case 'MAJOR':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MINOR':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'WARNING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            Telecom-Enriched Network Alarm Console
          </h2>
          <p className="text-sm text-slate-400">
            Real-time alarm feed enriched with Netstream physical topology, optical fiber strands, leased line circuits, and revenue impact.
          </p>
        </div>
        <button
          onClick={onOpenSimulateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-rose-500/20 active:scale-95"
        >
          <Radio className="w-4 h-4" />
          Inject Test Alarm
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by alarm name, device hostname, or circuit ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="MAJOR">Major Only</option>
            <option value="MINOR">Minor Only</option>
            <option value="WARNING">Warning Only</option>
          </select>
        </div>
      </div>

      {/* Main Split: Alarm List & Topology Enrichment Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alarm List (Left 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl divide-y divide-slate-800/60 max-h-[680px] overflow-y-auto">
          {filtered.map((alarm) => {
            const isSelected = selectedAlarm?.id === alarm.id;
            return (
              <div
                key={alarm.id}
                onClick={() => setSelectedAlarm(alarm)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/80 border-l-4 border-l-rose-500'
                    : 'hover:bg-slate-850/40 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-extrabold border ${getSeverityBadge(alarm.severity)}`}>
                      {alarm.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{alarm.alarmIdentifier}</span>
                    <span className="text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {alarm.sourceSystem}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(alarm.raisedAt).toLocaleTimeString()}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-100 mb-1">
                  {alarm.alarmName}
                </h4>

                <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap font-mono">
                  <span>Device: <strong className="text-cyan-400">{alarm.deviceName || 'N/A'}</strong></span>
                  {alarm.portName && (
                    <>
                      <span>•</span>
                      <span>Port: <strong className="text-slate-200">{alarm.portName}</strong></span>
                    </>
                  )}
                  {alarm.leasedLineCircuitCode && (
                    <>
                      <span>•</span>
                      <span>Circuit: <strong className="text-purple-400">{alarm.leasedLineCircuitCode}</strong></span>
                    </>
                  )}
                </div>

                {/* Micro Exposure Summary */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/50 text-xs">
                  <span className="text-slate-400">
                    Impact: <strong className="text-rose-400">{alarm.impactedServicesCount} Services</strong> ({alarm.impactedCustomersCount} Clients)
                  </span>
                  <span className="text-amber-400 font-semibold font-mono">
                    ${alarm.estimatedRevenueRiskUsd.toLocaleString()} Risk/Mo
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Topology Enrichment Drawer (Right 1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          {selectedAlarm ? (
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                  Telecom Topology Enrichment
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedAlarm.alarmName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedAlarm.alarmIdentifier} • Source IP: {selectedAlarm.sourceIp || '10.200.1.1'}
                </p>
              </div>

              {/* Physical & Optical Links */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <Server className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Physical Device & Port</span>
                    <strong className="text-slate-100 font-mono">{selectedAlarm.deviceName}</strong>
                    <div className="text-slate-400 font-mono">{selectedAlarm.portName || 'Chassis Level'}</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Datacenter Location & Rack</span>
                    <strong className="text-slate-100">{selectedAlarm.locationName || 'Main Hub'}</strong>
                    <div className="text-slate-400 font-mono">{selectedAlarm.rackCode || 'RACK-01'}</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <Cable className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Optical Cable & Core Strand</span>
                    <strong className="text-slate-100 font-mono">{selectedAlarm.opticalCableCode || 'N/A'}</strong>
                    {selectedAlarm.opticalStrandNo && (
                      <div className="text-slate-400">Strand #{selectedAlarm.opticalStrandNo}</div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-purple-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Carrier Leased Line Circuit</span>
                    <strong className="text-purple-300 font-mono">{selectedAlarm.leasedLineCircuitCode || 'On-Net Infrastructure'}</strong>
                    <div className="text-slate-400">{selectedAlarm.carrierName || 'Internal Network'} • {selectedAlarm.slaTier}</div>
                  </div>
                </div>
              </div>

              {/* Financial & SLA Exposure */}
              <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg text-xs space-y-1">
                <span className="text-rose-400 font-bold block flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  SLA Outage Exposure
                </span>
                <div className="flex justify-between text-slate-300">
                  <span>Impacted Corporate Services:</span>
                  <strong className="text-white">{selectedAlarm.impactedServicesCount}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Impacted Customers:</span>
                  <strong className="text-white">{selectedAlarm.impactedCustomersCount}</strong>
                </div>
                <div className="flex justify-between text-amber-300 font-semibold pt-1 border-t border-rose-500/20">
                  <span>Estimated Revenue at Risk:</span>
                  <span>${selectedAlarm.estimatedRevenueRiskUsd.toLocaleString()} USD</span>
                </div>
              </div>

              {/* Root Cause Tag */}
              {selectedAlarm.rootCauseTag && (
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[11px]">Suspected Root Cause:</span>
                  <strong className="text-cyan-300 font-mono">{selectedAlarm.rootCauseTag}</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select an alarm to view deep inventory topology enrichment.
            </div>
          )}

          {/* Action Buttons */}
          {selectedAlarm && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction(selectedAlarm.id, 'ACKNOWLEDGE')}
                  disabled={actingId === selectedAlarm.id || selectedAlarm.lifecycleStatus !== 'ACTIVE_UNACKNOWLEDGED'}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  {selectedAlarm.lifecycleStatus === 'ACTIVE_UNACKNOWLEDGED' ? 'Acknowledge' : 'Acknowledged'}
                </button>
                <button
                  onClick={() => handleAction(selectedAlarm.id, 'CLEAR')}
                  disabled={actingId === selectedAlarm.id || selectedAlarm.lifecycleStatus === 'RESOLVED'}
                  className="py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors"
                >
                  Clear Alarm
                </button>
              </div>

              <button
                onClick={() => handleAction(selectedAlarm.id, 'ESCALATE_GAHARU')}
                disabled={actingId === selectedAlarm.id || !!selectedAlarm.gaharuTicketId}
                className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {selectedAlarm.gaharuTicketId
                  ? `Dispatched (${selectedAlarm.gaharuTicketId})`
                  : 'Escalate to Gaharu_BPMN_NGIN Ticket'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
