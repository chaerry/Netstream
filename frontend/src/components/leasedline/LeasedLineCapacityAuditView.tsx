import React, { useState } from 'react';
import { CapacityAuditReport, DormantCircuit } from '../../types/leasedLine';
import {
  TrendingDown,
  DollarSign,
  AlertTriangle,
  PowerOff,
  CheckCircle2,
  Workflow,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LeasedLineCapacityAuditViewProps {
  auditReport: CapacityAuditReport;
  onOpenDecomModal: (circuit: { id: string; circuitId: string; circuitName: string; mrc: number }) => void;
}

export const LeasedLineCapacityAuditView: React.FC<LeasedLineCapacityAuditViewProps> = ({
  auditReport,
  onOpenDecomModal,
}) => {
  const {
    totalCircuitsAudited,
    dormantCircuitCount,
    totalMonthlySavingsUsd,
    totalAnnualSavingsUsd,
    dormantCircuits,
  } = auditReport;

  return (
    <div className="space-y-6">
      {/* OpEx Saver Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900/80 to-emerald-950/40 border border-purple-500/30 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              OpEx Cost Optimization Engine
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Eliminate Over-Capacity & Dormant Leased Lines
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Identified 3rd-party off-net circuits with zero active subscriber services or &lt;1% traffic utilization.
              Directly trigger automated cancellation flows through <span className="font-semibold text-purple-300">Gaharu_BPMN_NGIN</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-4 text-center sm:text-right min-w-[180px]">
              <span className="text-xs text-slate-400 block">Identified Monthly Waste</span>
              <div className="text-2xl font-extrabold font-mono text-rose-400 mt-0.5">
                ${totalMonthlySavingsUsd.toLocaleString()}
                <span className="text-xs font-normal text-slate-400"> /mo</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono block mt-1">
                +${totalAnnualSavingsUsd.toLocaleString()}/yr Projected Savings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400">Circuits Scanned</span>
          <div className="text-xl font-bold font-mono text-slate-200">
            {totalCircuitsAudited} Leased Lines
          </div>
          <span className="text-[11px] text-slate-500">Continuous 30-day telemetry analysis</span>
        </div>

        <div className="bg-slate-900/60 border border-rose-500/30 rounded-xl p-4 space-y-1 bg-rose-500/5">
          <span className="text-xs text-rose-300">Dormant / Orphaned Lines</span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {dormantCircuitCount} Off-Net Circuits
          </div>
          <span className="text-[11px] text-rose-300/70">Zero child services attached</span>
        </div>

        <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-4 space-y-1 bg-purple-500/5">
          <span className="text-xs text-purple-300">Workflow Automation</span>
          <div className="text-xl font-bold font-mono text-purple-300 flex items-center gap-1.5">
            <Workflow className="w-5 h-5 text-purple-400" />
            Gaharu BPMN Ngin
          </div>
          <span className="text-[11px] text-purple-300/70">1-Click Carrier Decommissioning</span>
        </div>
      </div>

      {/* Dormant Circuits Action List */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Recommended Decommissioning Candidates
          </h3>
          <span className="text-xs text-slate-400">
            Action: Initiate notice to 3rd-party carrier to terminate monthly billing
          </span>
        </div>

        <div className="space-y-3">
          {dormantCircuits.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              All leased circuits have healthy utilization. No dormant lines detected!
            </div>
          ) : (
            dormantCircuits.map((ckt) => (
              <div
                key={ckt.id}
                className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-rose-500/60 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400">
                      {ckt.circuitId}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {ckt.technology} ({ckt.bandwidthDisplay})
                    </span>
                    <span className="text-xs text-slate-400">
                      Carrier: <span className="text-slate-200 font-semibold">{ckt.carrierName}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200">{ckt.circuitName}</h4>
                  <p className="text-xs text-slate-400">{ckt.reason}</p>

                  <div className="flex items-center gap-4 text-xs pt-1">
                    <span className="text-rose-400 font-mono font-bold">
                      Cost: ${ckt.mrcUsd.toLocaleString()}/mo USD
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">
                      Utilization: <span className="text-rose-400 font-bold">{ckt.utilizationPercent}%</span>
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">
                      Dormant Since: {ckt.dormantSince}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-emerald-400">
                      +${(ckt.mrcUsd * 12).toLocaleString()} / yr
                    </div>
                    <div className="text-[10px] text-slate-500">Avoidable OpEx</div>
                  </div>

                  <button
                    onClick={() =>
                      onOpenDecomModal({
                        id: ckt.id,
                        circuitId: ckt.circuitId,
                        circuitName: ckt.circuitName,
                        mrc: ckt.mrcUsd,
                      })
                    }
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition shrink-0"
                  >
                    <PowerOff className="w-4 h-4" />
                    Trigger Gaharu Decommission
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
