import React, { useState } from 'react';
import { SlaIncident } from '../../types/leasedLine';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface LeasedLineSlaViewProps {
  incidents: SlaIncident[];
  onOpenLogIncidentModal: () => void;
}

export const LeasedLineSlaView: React.FC<LeasedLineSlaViewProps> = ({
  incidents,
  onOpenLogIncidentModal,
}) => {
  const totalIncidents = incidents.length;
  const mttrBreachedCount = incidents.filter((i) => i.isMttrBreached).length;
  const totalRebatesClaimed = incidents.reduce((sum, i) => sum + i.penaltyRebateAmount, 0);

  return (
    <div className="space-y-6">
      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400">Total Outage Incidents</span>
          <div className="text-xl font-bold font-mono text-slate-200">{totalIncidents} Recorded</div>
          <span className="text-[11px] text-slate-500">Across all leased spans</span>
        </div>

        <div className="bg-slate-900/60 border border-rose-500/30 rounded-xl p-4 space-y-1 bg-rose-500/5">
          <span className="text-xs text-rose-300">MTTR Breaches</span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {mttrBreachedCount} Violations
          </div>
          <span className="text-[11px] text-rose-300/70">Exceeded contractual repair hours</span>
        </div>

        <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-4 space-y-1 bg-emerald-500/5">
          <span className="text-xs text-emerald-300">Carrier Rebates Claimed</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ${totalRebatesClaimed.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-emerald-300/70">Automatic SLA credit deductions</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400">Compliance Rate</span>
          <div className="text-xl font-bold font-mono text-purple-400">99.985%</div>
          <span className="text-[11px] text-slate-500">Overall network availability</span>
        </div>
      </div>

      {/* SLA Incident Log Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SLA Outage Incident & Penalty Claim Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks fiber cuts, equipment outages, MTTR compliance, and contractual credits
            </p>
          </div>

          <button
            onClick={onOpenLogIncidentModal}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Log Outage Incident
          </button>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3 py-3">Ticket & Circuit</th>
                <th className="px-3 py-3">Outage Type & Root Cause</th>
                <th className="px-3 py-3">Incident Window</th>
                <th className="px-3 py-3">Downtime / MTTR Target</th>
                <th className="px-3 py-3">Penalty Rebate (USD)</th>
                <th className="px-3 py-3">Claim Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/30">
                  <td className="px-3 py-3">
                    <span className="font-mono font-bold text-purple-300 block">
                      {inc.ticketNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {inc.circuitName}
                    </span>
                    {inc.carrierTicketNumber && (
                      <span className="text-[10px] text-slate-500 block">
                        Carrier TT: {inc.carrierTicketNumber}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3 max-w-xs">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-300 inline-block mb-1">
                      {inc.outageType}
                    </span>
                    <p className="text-slate-400 line-clamp-2">{inc.rootCause}</p>
                  </td>

                  <td className="px-3 py-3 font-mono text-slate-400">
                    <div>{inc.incidentStart.replace('T', ' ').slice(0, 16)}</div>
                    {inc.incidentEnd && (
                      <div className="text-[10px] text-slate-500">
                        to {inc.incidentEnd.replace('T', ' ').slice(0, 16)}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <div className="font-mono font-semibold text-slate-200">
                      {Math.floor(inc.durationMinutes / 60)}h {inc.durationMinutes % 60}m
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Target MTTR: {inc.targetMttrMinutes / 60}h
                    </div>
                    {inc.isMttrBreached && (
                      <span className="text-[10px] text-rose-400 font-bold block">
                        ⚠️ BREACHED
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3 font-mono">
                    {inc.penaltyRebateAmount > 0 ? (
                      <span className="text-emerald-400 font-bold">
                        ${inc.penaltyRebateAmount.toLocaleString()} USD
                      </span>
                    ) : (
                      <span className="text-slate-500">$0.00</span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    {inc.claimStatus === 'CLAIM_SUBMITTED' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        CLAIM SUBMITTED
                      </span>
                    ) : inc.claimStatus === 'CREDITED_BY_CARRIER' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        CREDITED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-400">
                        {inc.claimStatus}
                      </span>
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
