import React from 'react';
import {
  GitFork,
  CheckCircle2,
  Clock,
  ExternalLink,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Server,
  Workflow,
} from 'lucide-react';

interface GaharuBpmnBridgeViewProps {
  isLoading: boolean;
}

export const GaharuBpmnBridgeView: React.FC<GaharuBpmnBridgeViewProps> = ({ isLoading }) => {
  const bpmnInstances = [
    {
      id: 'GAHARU-REC-202609-00891',
      processDef: 'network_reconciliation_audit_flow',
      title: 'Optical Attenuation Breach Field Inspection',
      entity: 'CBL-TRK-JKT-BDG-01/Strand-18',
      status: 'WAITING_FIELD_OTDR',
      currentStep: 'Field Technician OTDR Trace & Fusion Splice',
      assignee: 'field.engineer.bdg',
      startedAt: '2026-09-14T09:35:00Z',
    },
    {
      id: 'GAHARU-INC-202609-0014',
      processDef: 'incident_trouble_ticket_flow',
      title: 'LossOfSignal (LOS) Core Fiber Cut Escalation',
      entity: 'JKT-CORE-PE-01 : HundredGigE0/1/0/1',
      status: 'IN_PROGRESS',
      currentStep: 'NOC Tier-2 Root Cause Verification & Carrier Escalation',
      assignee: 'noc.tier2.jakarta',
      startedAt: '2026-09-14T10:01:00Z',
    },
    {
      id: 'GAHARU-DECOM-202609-0003',
      processDef: 'leased_line_cancellation_flow',
      title: 'Surabaya Dormant 1G Leased Line Carrier Notice',
      entity: 'LL-DORMANT-SBY-MLG-1G',
      status: 'PENDING_CARRIER_CONFIRMATION',
      currentStep: 'Awaiting Indosat Ooredoo Commercial Cancellation Acceptance',
      assignee: 'procurement.telecom',
      startedAt: '2026-09-12T11:20:00Z',
    },
    {
      id: 'GAHARU-PROV-202609-0042',
      processDef: 'service_auto_provisioning_flow',
      title: 'BCA Enterprise 10G Metro-E Expansion',
      entity: 'SRV-CORP-BCA-01',
      status: 'COMPLETED',
      currentStep: 'Automated Port Activation & Configuration Verified',
      assignee: 'SYSTEM_AUTOMATION',
      startedAt: '2026-09-13T14:10:00Z',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-purple-400" />
            Gaharu_BPMN_NGIN Process Orchestration Bridge
          </h2>
          <p className="text-sm text-slate-400">
            Bidirectional workflow integration connecting Netstream telemetry to the organization's Camunda/BPMN execution engine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            BPMN Engine: <strong>CONNECTED</strong>
          </span>
        </div>
      </div>

      {/* Process Instances List */}
      <div className="space-y-4">
        {bpmnInstances.map((inst) => (
          <div
            key={inst.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition-all shadow-xl space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {inst.id}
                </span>
                <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {inst.processDef}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                inst.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {inst.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100">{inst.title}</h3>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>Target Asset:</span>
                <strong className="text-cyan-400 font-mono">{inst.entity}</strong>
              </div>
            </div>

            {/* Current BPMN Step Banner */}
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Current Active Step: <strong className="text-white">{inst.currentStep}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                <span>Assignee: <strong className="text-slate-300">{inst.assignee}</strong></span>
                <span>•</span>
                <span>{new Date(inst.startedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
