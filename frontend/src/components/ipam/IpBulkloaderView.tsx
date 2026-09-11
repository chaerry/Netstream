import React, { useState } from 'react';
import { ipamApi } from '../../api/ipamApi';
import { IpAddress } from '../../types/ipam';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText,
  Copy
} from 'lucide-react';

interface Props {
  onSuccessImport: () => void;
}

const SAMPLE_CSV = `IP Address,VRF,Status,Hostname,Interface,MAC Address,Customer Name,Service Code,Notes
10.240.10.101,DEFAULT,ALLOCATED,ID-CGK-PE-RTR-01,GigabitEthernet0/0/1,00:1B:17:88:01:01,PT Telkom Akses,SVC-VPN-2026-0044,Metro backhaul link
10.240.10.102,DEFAULT,ALLOCATED,ID-CGK-PE-RTR-02,GigabitEthernet0/0/1,00:1B:17:88:01:02,PT Telkom Akses,SVC-VPN-2026-0044,Redundant backhaul
10.240.20.55,DEFAULT,RESERVED,ID-BDG-SW-03,Mgmt0,,Bandung Internal,INFRA-MGMT,Reserved for rack switch
172.16.100.25,VRF_FINANCIAL_CORE,ALLOCATED,CE-MANDIRI-SCBD,TenGigE0/1/0/2,00:50:56:B2:99:11,PT Bank Mandiri Tbk,SVC-VPN-2026-0012,Trading floor direct cross connect`;

export const IpBulkloaderView: React.FC<Props> = ({ onSuccessImport }) => {
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV);
  const [parsedRows, setParsedRows] = useState<Partial<IpAddress>[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  const handleParse = () => {
    const lines = csvContent.trim().split('\n');
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const rows: Partial<IpAddress>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim());
      if (cols[0]) {
        rows.push({
          ipAddress: cols[0],
          vrfName: cols[1] || 'DEFAULT',
          status: (cols[2] as any) || 'ALLOCATED',
          hostname: cols[3],
          interfaceName: cols[4],
          macAddress: cols[5],
          customerName: cols[6],
          serviceCode: cols[7],
          notes: cols[8],
        });
      }
    }
    setParsedRows(rows);
    setResultMessage(null);
  };

  const handleCommit = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await ipamApi.bulkImportIps(parsedRows);
      setResultMessage(res);
      if (res.imported > 0) {
        onSuccessImport();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'netstream_ipam_bulkloader_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Guidelines */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Bulkloader Spreadsheet & CSV Import Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bulk ingestion of IP addresses, interface bindings, and customer allocations across all routing domains
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>

        {/* Text Area Input */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Paste CSV Data or Edit Below:</span>
            <button
              onClick={() => setCsvContent(SAMPLE_CSV)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Reset to Sample Data
            </button>
          </div>

          <textarea
            rows={10}
            value={csvContent}
            onChange={e => setCsvContent(e.target.value)}
            className="glass-input w-full p-3.5 font-mono text-xs text-cyan-300 rounded-xl bg-slate-950/80 border-slate-800 min-h-[220px] resize-y leading-relaxed"
            placeholder="Paste comma-separated values..."
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleParse}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              Validate & Preview Rows
            </button>

            {parsedRows.length > 0 && (
              <button
                onClick={handleCommit}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Committing Records...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Commit {parsedRows.length} IP Allocations</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Result Message */}
        {resultMessage && (
          <div className={`mt-4 p-4 rounded-2xl border text-xs font-mono ${
            resultMessage.failed === 0 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Import Summary: {resultMessage.imported} records created successfully.</span>
            </div>
            {resultMessage.errors.length > 0 && (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-rose-400">
                {resultMessage.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Parsed CSV Preview ({parsedRows.length} Rows Ready for Injection)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">VRF Domain</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Hostname & Interface</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-4 text-slate-500">{i + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-cyan-300">{r.ipAddress}</td>
                    <td className="py-2.5 px-4 text-slate-300">{r.vrfName}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-white">
                      {r.hostname} {r.interfaceName && `(${r.interfaceName})`}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{r.customerName || '—'}</td>
                    <td className="py-2.5 px-4 text-purple-300">{r.serviceCode || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
