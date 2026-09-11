import React, { useState } from 'react';
import { LeasedLineCarrier, LeasedLineContract } from '../../types/leasedLine';
import {
  FileText,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle,
  Search,
} from 'lucide-react';

interface LeasedLineContractsViewProps {
  carriers: LeasedLineCarrier[];
  contracts: LeasedLineContract[];
}

export const LeasedLineContractsView: React.FC<LeasedLineContractsViewProps> = ({
  carriers,
  contracts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'contracts' | 'carriers'>('contracts');

  const filteredContracts = contracts.filter(
    (c) =>
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.carrierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCarriers = carriers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOpexCommitment = contracts.reduce((sum, c) => sum + c.mrcTotal, 0);

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'contracts'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            Contracts & Service Orders ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab('carriers')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'carriers'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            Carriers & Telcos ({carriers.length})
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'contracts' ? 'Search contracts...' : 'Search carriers...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-purple-400 font-semibold">
                      {contract.contractType}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 font-mono">
                      {contract.contractNumber}
                    </h4>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-1">{contract.title}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {contract.carrierName}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    contract.status === 'EXPIRING_SOON'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {contract.status === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Active'}
                </span>
              </div>

              {/* Financial & Term Details */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-500 block">Monthly Total</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    ${contract.mrcTotal.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Term Duration</span>
                  <span className="font-semibold text-slate-300">{contract.termMonths} Months</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Notice Period</span>
                  <span className="font-semibold text-slate-300">{contract.noticePeriodDays} Days</span>
                </div>
              </div>

              {/* Expiration Bar */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Term: {contract.startDate} ➔ {contract.endDate}
                  </span>
                  <span className="font-mono text-purple-300 font-medium">
                    {contract.daysUntilExpiration} days left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Carriers Tab */}
      {activeTab === 'carriers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCarriers.map((carrier) => (
            <div
              key={carrier.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-purple-400">
                    {carrier.code}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{carrier.name}</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                  {carrier.supportTier}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Contact Person:</span>
                  <span className="text-slate-200 font-medium">{carrier.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contact Email:</span>
                  <span className="text-slate-200 font-mono">{carrier.contactEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>NOC Phone:</span>
                  <span className="text-slate-200 font-mono">{carrier.contactPhone}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Active Leased Tails:</span>
                  <span className="text-cyan-400 font-bold">{carrier.activeCircuitCount} Circuits</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Monthly Spend:</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    ${carrier.totalMonthlyOpexUsd.toLocaleString()}/mo USD
                  </span>
                </div>
              </div>

              {carrier.portalUrl && (
                <a
                  href={carrier.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full mt-2 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Carrier Self-Service Portal
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
