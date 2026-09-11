import React, { useState, useEffect } from 'react';
import { CapacityForecast, CostCalculationResult } from '../../types/inventory';
import { inventoryApi } from '../../api/inventoryApi';
import { StatCard } from '../common/StatCard';
import {
  Calculator,
  Zap,
  TrendingDown,
  Clock,
  CheckCircle2,
  Server,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const PlanningCostView: React.FC = () => {
  const [strategy, setStrategy] = useState<string>('LOWEST_COST');
  const [bandwidth, setBandwidth] = useState<number>(10000);
  const [costResult, setCostResult] = useState<CostCalculationResult | null>(null);
  const [forecasts, setForecasts] = useState<CapacityForecast[]>([]);
  const [calculating, setCalculating] = useState<boolean>(false);

  const calculateCost = async (chosenStrategy: string) => {
    setCalculating(true);
    try {
      const res = await inventoryApi.calculatePathCost({
        routingStrategy: chosenStrategy,
        requiredBandwidthMbps: bandwidth,
      });
      setCostResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    calculateCost(strategy);
    inventoryApi.getCapacityForecast().then(setForecasts);
  }, []);

  const handleStrategyChange = (newStrategy: string) => {
    setStrategy(newStrategy);
    calculateCost(newStrategy);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Automated Rule Optimizer"
          value={strategy.replace('_', ' ')}
          subtitle="Real-time shortest path / hops engine"
          icon={<Calculator className="w-5 h-5" />}
          accentColor="cyan"
        />
        <StatCard
          title="Optimal Path Cost"
          value={costResult ? `$${costResult.totalEstimatedCostUsd.toFixed(2)}` : '—'}
          subtitle="Monthly Recurring Link Cost"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Latency Forecast"
          value={costResult ? `${costResult.totalLatencyMs} ms` : '—'}
          subtitle={`Across ${costResult?.totalHops || 1} Network Hops`}
          icon={<Clock className="w-5 h-5" />}
          accentColor="purple"
        />
      </div>

      {/* Interactive Path Cost Calculator */}
      <div className="glass-panel p-6 rounded-2xl space-y-6 border border-cyan-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>1.6 Automated Network Cost & Routing Rule Engine</span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate optimal provisioning routes between Jakarta & Surabaya
            </p>
          </div>

          {/* Strategy Tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleStrategyChange('LOWEST_COST')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                strategy === 'LOWEST_COST'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lowest Cost Rule ($570)
            </button>
            <button
              onClick={() => handleStrategyChange('FEWEST_HOPS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                strategy === 'FEWEST_HOPS'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fewest Hops (1 Direct DWDM)
            </button>
            <button
              onClick={() => handleStrategyChange('SHORTEST_PATH')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                strategy === 'SHORTEST_PATH'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lowest Latency (10ms Fiber)
            </button>
          </div>
        </div>

        {/* Calculated Path Segments */}
        {costResult && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Optimal Segment Topology Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {costResult.segments.map((seg) => (
                <div
                  key={seg.hop}
                  className="glass-card p-4 rounded-xl border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-bold">
                      Segment Hop #{seg.hop}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ${seg.segmentCostUsd.toFixed(2)}/mo
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span>{seg.fromLocation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{seg.toLocation}</span>
                  </div>

                  <p className="text-[11px] font-mono text-slate-400">
                    Hardware: <span className="text-slate-200">{seg.deviceHostname}</span> • Link: <span className="text-cyan-300">{seg.linkType}</span>
                  </p>
                  <p className="text-[10px] text-purple-400 font-mono">
                    Hop Latency: ~{seg.latencyMs} ms
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1.5 Capacity Forecast by Site */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>1.5 Capacity Management & Congestion Prediction (CM)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts.map((fc) => (
            <div key={fc.siteCode} className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{fc.siteName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{fc.siteCode}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                  {fc.totalRacks} Racks Active
                </span>
              </div>

              {/* Port Utilization */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Port Capacity ({fc.allocatedPorts}/{fc.totalPorts})</span>
                  <span className="text-cyan-400 font-mono font-bold">{fc.portUtilizationPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${fc.portUtilizationPct}%` }} />
                </div>
              </div>

              {/* Power Utilization */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Power Draw ({fc.consumedPowerWatt}W/{fc.totalPowerWatt}W)</span>
                  <span className="text-amber-400 font-mono font-bold">{fc.powerUtilizationPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${fc.powerUtilizationPct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
