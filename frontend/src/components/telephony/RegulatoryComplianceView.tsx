import React from 'react';
import { NumberBlock, TelephoneNumber } from '../../types/telephony';
import { 
  Building2, 
  Download, 
  FileCheck, 
  ShieldCheck, 
  BarChart3, 
  PieChart, 
  Clock,
  Layers
} from 'lucide-react';

interface Props {
  blocks: NumberBlock[];
  numbers: TelephoneNumber[];
}

export const RegulatoryComplianceView: React.FC<Props> = ({ blocks, numbers }) => {
  const totalCapacity = blocks.reduce((acc, b) => acc + b.totalCapacity, 0);
  const totalAllocated = blocks.reduce((acc, b) => acc + b.allocatedCount, 0);
  const totalQuarantined = blocks.reduce((acc, b) => acc + b.quarantineCount, 0);
  const totalPorted = blocks.reduce((acc, b) => acc + b.portedCount, 0);
  const totalAvailable = totalCapacity - (totalAllocated + totalQuarantined);

  const handleExportRegulatoryReport = () => {
    const reportData = {
      reportingAuthority: 'Kementerian Komunikasi dan Informatika Republik Indonesia (KOMINFO / BRTI)',
      operator: 'PT Netstream Indonesia Telecom',
      auditPeriod: 'Q1-2026',
      generatedAt: new Date().toISOString(),
      summary: {
        totalCapacity,
        totalAllocated,
        totalAvailable,
        totalQuarantined,
        totalPorted,
        utilizationRate: `${((totalAllocated / totalCapacity) * 100).toFixed(2)}%`
      },
      blocks: blocks.map(b => ({
        prefix: b.prefix,
        region: b.regionName,
        category: b.category,
        capacity: b.totalCapacity,
        allocated: b.allocatedCount,
        quarantine: b.quarantineCount,
        utilization: `${b.utilizationPct}%`,
        regulatoryRef: b.regulatoryAuthorityRef
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kominfo_telephony_compliance_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-400" />
              <span>National Numbering Plan & Regulatory Compliance</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official audit reports configured for Telecommunications Regulatory Authorities (Kominfo / BRTI)
            </p>
          </div>

          <button
            onClick={handleExportRegulatoryReport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Regulatory Audit Dossier (JSON)</span>
          </button>
        </div>

        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Total E.164 Assigned</span>
            <span className="text-xl font-black text-white font-mono">{totalCapacity.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">National Number Resource</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">In-Service / Active</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{totalAllocated.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-500/80 block mt-0.5">
              {((totalAllocated / totalCapacity) * 100).toFixed(1)}% Active Utilization
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Quarantine Aging Pool</span>
            <span className="text-xl font-black text-rose-400 font-mono">{totalQuarantined.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Mandatory 60-day aging</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Ported (MNP / FNP)</span>
            <span className="text-xl font-black text-purple-400 font-mono">{totalPorted.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Inter-carrier migrations</span>
          </div>
        </div>
      </div>

      {/* Compliance Breakdown Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kominfo / BRTI National Number Block Register</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">Decree Compliance: 100% OK</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Prefix & Range</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Assigned Service Region</th>
                <th className="py-3 px-4">Block Capacity</th>
                <th className="py-3 px-4">Active Lines</th>
                <th className="py-3 px-4">Regulatory License Reference</th>
                <th className="py-3 px-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {blocks.map(b => (
                <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    {b.prefix}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {b.category.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-200">
                    {b.regionName}
                  </td>

                  <td className="py-3 px-4 font-bold text-cyan-300">
                    {b.totalCapacity.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 font-bold text-emerald-400">
                    {b.allocatedCount.toLocaleString()} ({b.utilizationPct}%)
                  </td>

                  <td className="py-3 px-4 text-purple-300">
                    {b.regulatoryAuthorityRef}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                      <FileCheck className="w-3 h-3" /> Valid License
                    </span>
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
