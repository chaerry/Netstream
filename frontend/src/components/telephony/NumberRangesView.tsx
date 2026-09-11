import React, { useState } from 'react';
import { NumberBlock, NumberCategory } from '../../types/telephony';
import { 
  Phone, 
  Search, 
  Plus, 
  Layers, 
  MapPin, 
  Radio, 
  ShieldCheck, 
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';

interface Props {
  blocks: NumberBlock[];
  onOpenCreate: () => void;
  onSelectBlockForCatalog?: (blockId: string) => void;
}

export const NumberRangesView: React.FC<Props> = ({
  blocks,
  onOpenCreate,
  onSelectBlockForCatalog
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix' | 'compact' | 'ledger'>('cards');

  const filteredBlocks = blocks.filter(b => {
    const matchesSearch = 
      b.prefix.toLowerCase().includes(search.toLowerCase()) ||
      b.regionName.toLowerCase().includes(search.toLowerCase()) ||
      b.regulatoryAuthorityRef.toLowerCase().includes(search.toLowerCase()) ||
      b.operatorOrNode.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (cat: NumberCategory) => {
    switch (cat) {
      case 'GEOGRAPHIC':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'MOBILE_MSISDN':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'TOLL_FREE_0800':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PREMIUM_0809':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'PBX_EXTENSION':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Ranges' },
            { id: 'GEOGRAPHIC', label: 'Geographic PSTN' },
            { id: 'MOBILE_MSISDN', label: 'Mobile MSISDN' },
            { id: 'TOLL_FREE_0800', label: 'Toll-Free 0800' },
            { id: 'PREMIUM_0809', label: 'Premium 0809' },
            { id: 'PBX_EXTENSION', label: 'PBX Extensions' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                selectedCategory === tab.id
                  ? 'bg-rose-600/30 text-rose-300 border-rose-500 font-bold shadow-sm shadow-rose-600/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-Style View Mode Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="3D Cyber Cards Grid"
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'matrix'
                  ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Standard Telecom Matrix Table"
            >
              Matrix Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'compact'
                  ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="High-Density Compact NOC Table"
            >
              Compact NOC
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ledger')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'ledger'
                  ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cyber Strip Ledger Rows"
            >
              Cyber Ledger
            </button>
          </div>

          <div className="relative w-full md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prefix, region..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass-input w-full h-8 pl-9 pr-3 text-xs rounded-xl text-slate-200"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Block</span>
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredBlocks.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-slate-800 space-y-2">
          <Phone className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-bold text-slate-300">No Number Ranges Found</p>
          <p className="text-xs">Try adjusting your filters or register a new numbering block.</p>
        </div>
      ) : viewMode === 'matrix' ? (
        /* STYLE 1: Telecom Matrix Table (Standard Detailed) */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase">Number Prefix</th>
                  <th className="px-4 py-3 font-bold uppercase">Category</th>
                  <th className="px-4 py-3 font-bold uppercase">Region / City</th>
                  <th className="px-4 py-3 font-bold uppercase">Pattern / Format</th>
                  <th className="px-4 py-3 font-bold uppercase">Capacity Allocation</th>
                  <th className="px-4 py-3 font-bold uppercase">Utilization</th>
                  <th className="px-4 py-3 font-bold uppercase">Host SBC / IMS Node</th>
                  <th className="px-4 py-3 font-bold uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBlocks.map(block => {
                  const isHighUtil = block.utilizationPct >= 85;
                  return (
                    <tr key={block.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <Phone className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-white text-sm">{block.prefix}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getCategoryBadge(block.category)}`}>
                          {block.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans text-xs">
                        {block.regionName}
                      </td>
                      <td className="px-4 py-3 text-cyan-300 font-bold">{block.blockPattern}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <strong className="text-white">{block.allocatedCount.toLocaleString()}</strong> / {block.totalCapacity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className={isHighUtil ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {block.utilizationPct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${isHighUtil ? 'from-rose-500 to-amber-500' : 'from-rose-500 to-pink-500'} rounded-full`}
                              style={{ width: `${Math.min(100, Math.max(block.utilizationPct, 3))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] truncate max-w-xs">
                        {block.operatorOrNode}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {onSelectBlockForCatalog && (
                          <button
                            onClick={() => onSelectBlockForCatalog(block.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] inline-flex items-center gap-1"
                          >
                            <span>Explore</span>
                            <ArrowUpRight className="w-3 h-3 text-rose-400" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'compact' ? (
        /* STYLE 2: Compact NOC Density Table (Ultra-dense 1-line view) */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2">Prefix</th>
                  <th className="px-3 py-2">Cat</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Pattern</th>
                  <th className="px-3 py-2">Allocated / Total</th>
                  <th className="px-3 py-2">Util %</th>
                  <th className="px-3 py-2">Quar / Port</th>
                  <th className="px-3 py-2">Node</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredBlocks.map(block => {
                  const isHighUtil = block.utilizationPct >= 85;
                  return (
                    <tr key={block.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-1.5 font-bold text-white whitespace-nowrap">{block.prefix}</td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] border ${getCategoryBadge(block.category)}`}>
                          {block.category.replace('_', ' ').slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-slate-300 truncate max-w-[150px]">{block.regionName}</td>
                      <td className="px-3 py-1.5 text-cyan-300 font-bold">{block.blockPattern}</td>
                      <td className="px-3 py-1.5 text-slate-300">
                        {block.allocatedCount.toLocaleString()} / {block.totalCapacity.toLocaleString()}
                      </td>
                      <td className="px-3 py-1.5 font-bold">
                        <span className={isHighUtil ? 'text-rose-400' : 'text-slate-300'}>
                          {block.utilizationPct}%
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-slate-400">
                        Q:{block.quarantineCount} | P:{block.portedCount}
                      </td>
                      <td className="px-3 py-1.5 text-slate-400 truncate max-w-[130px]">{block.operatorOrNode}</td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        {onSelectBlockForCatalog && (
                          <button
                            onClick={() => onSelectBlockForCatalog(block.id)}
                            className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
                          >
                            Explore ↗
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'ledger' ? (
        /* STYLE 3: Cyber Strip Ledger Table (Futuristic Holographic Row Strips) */
        <div className="space-y-2.5">
          {filteredBlocks.map(block => {
            const isHighUtil = block.utilizationPct >= 85;
            return (
              <div
                key={block.id}
                className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-[240px]">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 group-hover:bg-rose-500/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-base">{block.prefix}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono border ${getCategoryBadge(block.category)}`}>
                        {block.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-sans block mt-0.5">
                      {block.regionName} • <span className="font-mono text-cyan-300">{block.blockPattern}</span>
                    </span>
                  </div>
                </div>

                {/* Progress & Utilization Strip */}
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">
                        Allocated: <strong className="text-white">{block.allocatedCount.toLocaleString()}</strong> / {block.totalCapacity.toLocaleString()}
                      </span>
                      <span className={`font-bold ${isHighUtil ? 'text-rose-400' : 'text-slate-300'}`}>
                        {block.utilizationPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${isHighUtil ? 'from-rose-500 to-amber-500' : 'from-rose-500 to-pink-500'} rounded-full`}
                        style={{ width: `${Math.min(100, Math.max(block.utilizationPct, 3))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Telemetry & Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 text-xs font-mono">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 block">Host Node</span>
                    <span className="text-slate-300 truncate max-w-[130px] block">{block.operatorOrNode}</span>
                  </div>

                  {onSelectBlockForCatalog && (
                    <button
                      onClick={() => onSelectBlockForCatalog(block.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STYLE 0: Grid Cards View (Original Default) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlocks.map(block => {
            const isHighUtil = block.utilizationPct >= 85;
            return (
              <div
                key={block.id}
                className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:border-rose-400 transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-white text-base block">
                          {block.prefix}
                        </span>
                        <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-mono border mt-0.5 ${getCategoryBadge(block.category)}`}>
                          {block.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {block.countryCode} {block.areaCode ? `(${block.areaCode})` : ''}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{block.regionName}</span>
                  </h4>

                  <div className="mt-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Pattern:</span>
                      <span className="text-cyan-300 font-bold">{block.blockPattern}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Host Node:</span>
                      <span className="text-slate-300 truncate max-w-[140px]">{block.operatorOrNode}</span>
                    </div>
                  </div>
                </div>

                {/* Utilization & Capacity */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      Capacity: <strong className="text-white">{block.allocatedCount.toLocaleString()}</strong> / {block.totalCapacity.toLocaleString()}
                    </span>
                    <span className={`font-bold ${isHighUtil ? 'text-rose-400 flex items-center gap-1' : 'text-slate-300'}`}>
                      {isHighUtil && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      {block.utilizationPct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${isHighUtil ? 'from-rose-500 to-amber-500' : 'from-rose-500 to-pink-500'} rounded-full transition-all`}
                      style={{ width: `${Math.min(100, Math.max(block.utilizationPct, 3))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Quarantine: {block.quarantineCount}</span>
                    <span>Ported: {block.portedCount}</span>
                  </div>

                  {onSelectBlockForCatalog && (
                    <button
                      onClick={() => onSelectBlockForCatalog(block.id)}
                      className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Explore Numbers</span>
                      <ArrowUpRight className="w-3 h-3 text-rose-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
