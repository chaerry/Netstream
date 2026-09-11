import React, { useState } from 'react';
import { LeasedLineInvoice } from '../../types/leasedLine';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface LeasedLineInvoiceAuditViewProps {
  invoices: LeasedLineInvoice[];
  onRefresh: () => void;
}

export const LeasedLineInvoiceAuditView: React.FC<LeasedLineInvoiceAuditViewProps> = ({
  invoices,
  onRefresh,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<LeasedLineInvoice | null>(
    invoices[0] || null
  );

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.billedAmount, 0);
  const totalContracted = invoices.reduce((sum, inv) => sum + inv.contractedAmount, 0);
  const totalDiscrepancies = invoices.reduce((sum, inv) => sum + inv.discrepancyAmount, 0);
  const totalSlaCredits = invoices.reduce((sum, inv) => sum + inv.slaPenaltyCredit, 0);

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'AUDITED_OK':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AUDITED (MATCHED)
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            DISCREPANCY DETECTED
          </span>
        );
      case 'APPROVED_FOR_PAYMENT':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" />
            APPROVED FOR PAYMENT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Billed by Carriers</span>
          <div className="text-xl font-bold font-mono text-slate-200">
            ${totalBilled.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-slate-500">Across {invoices.length} Monthly Invoices</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Contracted Baseline MRC</span>
          <div className="text-xl font-bold font-mono text-purple-400">
            ${totalContracted.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-slate-500">Authorized in Signed MSAs</span>
        </div>

        <div className="bg-slate-900/60 border border-rose-500/30 rounded-xl p-4 space-y-1 bg-rose-500/5">
          <span className="text-xs text-rose-300 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Overbilled Discrepancy
          </span>
          <div className="text-xl font-bold font-mono text-rose-400">
            ${totalDiscrepancies.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-rose-300/70">Flagged for Vendor Dispute</span>
        </div>

        <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-4 space-y-1 bg-emerald-500/5">
          <span className="text-xs text-emerald-300 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            SLA Outage Penalty Credits
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            -${totalSlaCredits.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-emerald-300/70">Deducted from Carrier Payables</span>
        </div>
      </div>

      {/* Main Audit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Invoices */}
        <div className="lg:col-span-4 bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            Monthly Carrier Invoices
          </h3>

          <div className="space-y-2">
            {invoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3.5 rounded-lg border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/30'
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {inv.invoiceNumber}
                    </span>
                    {getInvoiceStatusBadge(inv.status)}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">
                    {inv.carrierName}
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-800/60">
                    <span className="text-slate-500">
                      {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      ${inv.billedAmount.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Audit Details */}
        <div className="lg:col-span-8 space-y-5">
          {selectedInvoice ? (
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">
                      {selectedInvoice.invoiceNumber}
                    </h3>
                    {getInvoiceStatusBadge(selectedInvoice.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Carrier: <span className="text-slate-200 font-semibold">{selectedInvoice.carrierName}</span> | Period: {selectedInvoice.billingPeriodStart} to {selectedInvoice.billingPeriodEnd}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-emerald-400">
                    ${selectedInvoice.netPayableAmount.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-slate-400">Net Payable Amount</div>
                </div>
              </div>

              {/* Dispute Alert if Discrepancy */}
              {selectedInvoice.discrepancyAmount > 0 && (
                <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold text-rose-300">
                      Overbilling Detected: ${selectedInvoice.discrepancyAmount.toLocaleString()} USD
                    </h4>
                    <p className="text-rose-200/80">{selectedInvoice.disputeReason}</p>
                    <div className="pt-2">
                      <button className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold text-[11px] transition">
                        Generate Carrier Dispute Letter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-Way Reconciliation Math */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">1. Gross Billed</span>
                  <span className="text-base font-mono font-semibold text-slate-200">
                    ${selectedInvoice.billedAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">2. SLA Penalty Rebate</span>
                  <span className="text-base font-mono font-semibold text-emerald-400">
                    -${selectedInvoice.slaPenaltyCredit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">3. Net Verified</span>
                  <span className="text-base font-mono font-semibold text-purple-300">
                    ${selectedInvoice.netPayableAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Line Items Circuit Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Itemized Circuit Verification Breakdown
                </h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Circuit Reference</th>
                        <th className="px-3 py-2.5">Billed MRC</th>
                        <th className="px-3 py-2.5">Contracted MRC</th>
                        <th className="px-3 py-2.5">Discrepancy</th>
                        <th className="px-3 py-2.5">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2.5 font-mono font-medium text-slate-200">
                            {item.circuitReference}
                            {item.notes && (
                              <div className="text-[10px] text-slate-500">{item.notes}</div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-300">
                            ${item.billedMrc.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-300">
                            ${item.contractedMrc.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {item.discrepancy > 0 ? (
                              <span className="text-rose-400 font-bold">
                                +${item.discrepancy.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-400">$0.00</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            {item.status === 'VERIFIED' ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                                MATCHED
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                                {item.status}
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
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select an invoice to inspect reconciliation breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
