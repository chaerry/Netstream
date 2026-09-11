import React, { useState } from 'react';
import { NetworkService, ServiceResourceMapping } from '../../types/inventory';
import {
  Route,
  Server,
  Network,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Cable,
  Layers,
  Radio,
  Sparkles,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';

interface ServiceHopVisualizerProps {
  service: NetworkService;
}

export const ServiceHopVisualizer: React.FC<ServiceHopVisualizerProps> = ({ service }) => {
  const mappings = [...(service.resourceMappings || [])].sort((a, b) => (a.hopOrder || 0) - (b.hopOrder || 0));
  const [selectedHop, setSelectedHop] = useState<ServiceResourceMapping | null>(mappings.length > 0 ? mappings[0] : null);
  const [viewMode, setViewMode] = useState<'graphical' | 'table'>('graphical');

  const getDeviceCategory = (role: string, hostname?: string) => {
    const h = (hostname || '').toUpperCase();
    const r = (role || '').toUpperCase();
    if (r.includes('ODF') || h.includes('ODF')) {
      return { label: '144-Core ODF (CO)', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', type: 'ODF', isPassive: true };
    }
    if (r.includes('FOSC') || r.includes('CLOSURE') || h.includes('FOSC') || h.includes('CLOSURE')) {
      return { label: 'Splice Closure (Manhole)', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'CLOSURE', isPassive: true };
    }
    if (r.includes('ODC') || h.includes('ODC')) {
      return { label: 'ODC Street Cabinet (1:4 Splitter)', color: 'from-teal-500 to-cyan-600', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40', type: 'ODC', isPassive: true };
    }
    if (r.includes('ODP') || h.includes('ODP')) {
      return { label: 'ODP FAT (1:8 Splitter)', color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', type: 'ODP', isPassive: true };
    }
    if (r.includes('ONT') || h.includes('ONT')) {
      return { label: 'Customer Premise ONT', color: 'from-violet-500 to-purple-600', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40', type: 'ONT', isPassive: false };
    }
    if (r.includes('OLT') || h.includes('OLT')) {
      return { label: 'GPON Core OLT', color: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'OLT', isPassive: false };
    }
    if (r.includes('DWDM') || r.includes('OPTICAL') || h.includes('DWDM') || h.includes('OPT')) {
      return { label: 'DWDM Transport', color: 'from-purple-500 to-indigo-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', type: 'OPTICAL', isPassive: false };
    }
    if (r.includes('METRO') || h.includes('METRO') || h.includes('AGG') || h.includes('ACC')) {
      return { label: 'Metro Demarcation', color: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', type: 'METRO', isPassive: false };
    }
    return { label: 'Provider Edge (PE)', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', type: 'ROUTER', isPassive: false };
  };

  const getLinkType = (idx: number, current: ServiceResourceMapping, next?: ServiceResourceMapping) => {
    if (!next) return { label: '10G Fiber (SMF)', cableCode: 'PC-SM-SC-LC-01', coreInfo: 'Core #1', coreColor: '#38bdf8', type: 'fiber' };
    const rCurr = (current.resourceRole || '').toUpperCase();
    const rNext = (next.resourceRole || '').toUpperCase();

    if (rCurr.includes('PATCH CORD') || rNext.includes('PATCH CORD')) {
      return {
        label: 'Optical Patch Cord',
        cableCode: 'PC-SM-SC-LC-01',
        coreInfo: 'Core #1 (Yellow Duplex)',
        coreColor: '#eab308',
        distance: '1.5 m',
        type: 'patchcord',
        color: 'from-yellow-400 to-amber-500'
      };
    }
    if (rCurr.includes('FEEDER') || rNext.includes('FEEDER') || rCurr.includes('CBL-FDR') || rNext.includes('CBL-FDR')) {
      return {
        label: 'Feeder Trunk Cable',
        cableCode: 'CBL-FDR-CGK-48C',
        coreInfo: 'Core #12 (Aqua Core)',
        coreColor: '#06b6d4',
        distance: '1.8 km',
        type: 'feeder',
        color: 'from-cyan-400 via-teal-500 to-emerald-500'
      };
    }
    if (rCurr.includes('DIST') || rNext.includes('DIST') || rCurr.includes('CBL-DIST') || rNext.includes('CBL-DIST')) {
      return {
        label: 'Distribution Cable',
        cableCode: 'CBL-DIST-SCBD-24C',
        coreInfo: 'Core #3 (Green Core)',
        coreColor: '#22c55e',
        distance: '0.6 km',
        type: 'distribution',
        color: 'from-emerald-400 via-green-500 to-teal-500'
      };
    }
    if (rCurr.includes('DROP') || rNext.includes('DROP') || rCurr.includes('CBL-DROP') || rNext.includes('CBL-DROP')) {
      return {
        label: 'Customer Drop Cable',
        cableCode: 'CBL-DROP-TLT-02C',
        coreInfo: 'Core #1 (Blue Core)',
        coreColor: '#3b82f6',
        distance: '65 m',
        type: 'drop',
        color: 'from-blue-400 via-indigo-500 to-purple-500'
      };
    }
    if (rCurr.includes('DWDM') || rNext.includes('DWDM')) {
      return {
        label: '100G DWDM Lambda',
        cableCode: 'CBL-TRK-BACKBONE-96C',
        coreInfo: 'Core #1 (193.1 THz)',
        coreColor: '#a855f7',
        distance: '780 km',
        type: 'dwdm',
        color: 'from-purple-500 via-pink-500 to-purple-500'
      };
    }
    if (current.vneName || next.vneName) {
      return {
        label: 'MPLS Pseudowire',
        cableCode: 'PW-VCID-250025',
        coreInfo: 'VCID #250025',
        coreColor: '#f59e0b',
        distance: 'L2 Circuit',
        type: 'pseudowire',
        color: 'from-amber-500 via-yellow-400 to-amber-500'
      };
    }
    return {
      label: '10G 802.1Q Fiber Trunk',
      cableCode: 'CBL-METRO-01',
      coreInfo: 'Core #1 (Single-Mode)',
      coreColor: '#06b6d4',
      distance: '12 km',
      type: 'ethernet',
      color: 'from-cyan-500 via-teal-400 to-cyan-500'
    };
  };

  const isGpon = service.serviceType === 'GPON_BROADBAND' || service.serviceType === 'FTTH_ACCESS';

  return (
    <div className="glass-panel p-5 rounded-2xl space-y-5 border border-cyan-500/30 shadow-2xl shadow-cyan-950/30">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white tracking-wide font-mono">
                  {service.serviceCode}
                </h4>
                <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                  isGpon
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {service.serviceType}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {service.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer: <b className="text-white font-sans">{service.customerName}</b> • SLA Tier: <span className="text-amber-400 font-bold font-mono">{service.slaTier}</span> ({service.slaAvailabilityPct}%)
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('graphical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'graphical'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Graphical Schematic</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Resource Matrix</span>
            </button>
          </div>

          <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Provisioned Bandwidth</span>
            <span className="text-xs font-bold text-cyan-300 font-mono">
              {service.bandwidthMbps >= 1000 ? `${service.bandwidthMbps / 1000} Gbps Committed` : `${service.bandwidthMbps} Mbps Committed`}
            </span>
          </div>
        </div>
      </div>

      {/* GRAPHICAL SCHEMATIC VIEW */}
      {viewMode === 'graphical' && (
        <div className="space-y-4">
          {/* Circuit Demarcation Callout Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/40 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-400">{isGpon ? 'Headend Central Office:' : 'A-End UNI:'}</span>
              <span className="font-bold text-white font-mono">{service.aEndLocationName || 'Jakarta Central Office'}</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                {isGpon ? 'GPON 2.5G OLT Port' : 'VLAN 250 (Dot1Q)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isGpon ? (
                <span className="text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  🍃 Passive Optical Distribution Network (ODN • 1:32 Total Split Ratio)
                </span>
              ) : (
                <span className="text-amber-400 font-mono text-[11px] font-bold">
                  ⚡ EoMPLS Pseudowire Core (VCID: 250025)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                {isGpon ? 'Gigabit Ethernet ONT Demarc' : 'VLAN 250 (Dot1Q)'}
              </span>
              <span className="text-slate-400">{isGpon ? 'Customer Premise (FTTO):' : 'Z-End UNI:'}</span>
              <span className="font-bold text-white font-mono">{service.zEndLocationName || 'Telkom Landmark Tower'}</span>
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
          </div>

          {/* Interactive Graphical Port-to-Port Topology Canvas */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[1100px] gap-2 py-4">

              {/* A-End Demarcation Endpoint */}
              <div className="flex flex-col items-center shrink-0 w-32 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 mb-2 shadow-lg shadow-blue-950/50">
                  <span className="font-bold font-mono text-sm">{isGpon ? 'OLT-CO' : 'UNI-A'}</span>
                </div>
                <span className="text-xs font-bold text-white">{isGpon ? 'Jakarta Core' : 'Jakarta HQ'}</span>
                <span className="text-[10px] text-blue-400 font-mono mt-0.5 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                  {isGpon ? 'GPON 2.5G' : 'VLAN: 250'}
                </span>
                <span className="text-[9px] text-slate-500 mt-1">{isGpon ? 'Optical Line Terminal' : 'Customer Demarc'}</span>
              </div>

              {/* Laser Cable 0 */}
              <div className="flex flex-col items-center shrink-0 w-12">
                <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 relative overflow-hidden rounded-full shadow-glow-cyan">
                  <div className="absolute inset-0 bg-white/70 w-3 animate-laser" />
                </div>
                <span className="text-[8px] font-mono text-cyan-400 mt-1 uppercase font-bold">OPTICAL</span>
              </div>

              {/* Hop Device Chassis & Port Nodes */}
              {mappings.map((map, idx) => {
                const devCat = getDeviceCategory(map.resourceRole, map.deviceHostname);
                const isSelected = selectedHop?.id === map.id;
                const linkInfo = getLinkType(idx, map, mappings[idx + 1]);

                return (
                  <React.Fragment key={map.id}>
                    {/* Device Chassis Card */}
                    <div
                      onClick={() => setSelectedHop(map)}
                      className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-1 relative shrink-0 w-52 rounded-2xl p-3 border ${
                        isSelected
                          ? devCat.isPassive
                            ? 'bg-slate-900 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                            : 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Top Hop Badge & Category */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                          Hop #{map.hopOrder}
                        </span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border truncate max-w-[120px] ${devCat.badge}`}>
                          {devCat.label}
                        </span>
                      </div>

                      {/* Device Chassis Visual Header */}
                      <div className="py-2 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl bg-slate-950 border flex items-center justify-center shrink-0 ${
                          devCat.isPassive ? 'border-emerald-500/40 text-emerald-400' : 'border-slate-800 text-cyan-400'
                        }`}>
                          <Server className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-white font-mono truncate" title={map.deviceHostname}>
                            {map.deviceHostname || 'Device Node'}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-sans block truncate" title={map.resourceRole}>
                            {devCat.isPassive ? '🍃 Optical Passive Node' : map.resourceRole.split('(')[0].replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Port & Transceiver Graphic Container */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                        {/* Port Interface Demarcation */}
                        <div className="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${devCat.isPassive ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
                            <Cable className={`w-3.5 h-3.5 shrink-0 ${devCat.isPassive ? 'text-emerald-400' : 'text-cyan-400'}`} />
                            <span className={`text-[10px] font-mono font-semibold truncate ${devCat.isPassive ? 'text-emerald-300' : 'text-cyan-300'}`} title={map.portName}>
                              {map.portName || 'Port Interface'}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">
                            {map.allocatedBandwidthMbps >= 1000 ? `${map.allocatedBandwidthMbps / 1000}G` : `${map.allocatedBandwidthMbps}M`}
                          </span>
                        </div>

                        {/* Logical Circuit / VCID / Pseudowire Element (if present) */}
                        {map.vneName && (
                          <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-1 animate-in fade-in">
                            <div className="flex items-center gap-1 min-w-0">
                              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="text-[9px] font-mono text-amber-300 font-bold truncate" title={map.vneName}>
                                {map.vneName}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 font-bold">
                              VCID: 250025
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Animated Optical Fiber / Cable & Core Conduit between Hops */}
                    {idx < mappings.length - 1 && (
                      <div className="flex flex-col items-center shrink-0 w-32 px-1 text-center">
                        <div className={`w-full h-1 bg-gradient-to-r ${linkInfo.color} relative overflow-hidden rounded-full shadow-glow-cyan`}>
                          <div className="absolute inset-0 bg-white/90 w-5 animate-laser" />
                        </div>
                        
                        {/* Optical Cable Tag */}
                        <div className="mt-1 flex flex-col items-center">
                          <span className="text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 truncate max-w-full" title={linkInfo.cableCode}>
                            {linkInfo.cableCode}
                          </span>
                          {/* Core Strand Badge with TIA-598 Color Dot */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className="w-2 h-2 rounded-full border border-black/40 shadow-sm"
                              style={{ backgroundColor: linkInfo.coreColor }}
                            />
                            <span className="text-[8px] font-mono text-slate-300 font-semibold truncate">
                              {linkInfo.coreInfo}
                            </span>
                          </div>
                          {linkInfo.distance && (
                            <span className="text-[7px] font-mono text-slate-500">
                              {linkInfo.distance}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Laser Cable Final */}
              <div className="flex flex-col items-center shrink-0 w-12">
                <div className="w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 relative overflow-hidden rounded-full shadow-glow-purple">
                  <div className="absolute inset-0 bg-white/70 w-3 animate-laser" />
                </div>
                <span className="text-[8px] font-mono text-purple-400 mt-1 uppercase font-bold">UNI</span>
              </div>

              {/* Z-End Demarcation Endpoint */}
              <div className="flex flex-col items-center shrink-0 w-32 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border-2 border-purple-500/40 flex items-center justify-center text-purple-400 mb-2 shadow-lg shadow-purple-950/50">
                  <span className="font-bold font-mono text-sm">{isGpon ? 'ONT-CPE' : 'UNI-Z'}</span>
                </div>
                <span className="text-xs font-bold text-white">{isGpon ? 'Customer Premise' : 'Surabaya DR'}</span>
                <span className="text-[10px] text-purple-400 font-mono mt-0.5 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                  {isGpon ? 'Gigabit LAN' : 'VLAN: 250'}
                </span>
                <span className="text-[9px] text-slate-500 mt-1">{isGpon ? 'Enterprise FTTO' : 'Customer Demarc'}</span>
              </div>

            </div>
          </div>

          {/* Selected Hop Deep-Dive Inspector Panel */}
          {selectedHop && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{selectedHop.deviceHostname}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
                      Hop Order #{selectedHop.hopOrder}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Active Interface: <b className="text-cyan-300 font-mono">{selectedHop.portName}</b> • Role: <span className="text-white font-mono">{selectedHop.resourceRole}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                {selectedHop.vneName && (
                  <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30">
                    <span className="text-[10px] text-slate-400 block font-sans">Attached Virtual Circuit</span>
                    <span className="text-amber-300 font-bold">{selectedHop.vneName} (VCID: 250025)</span>
                  </div>
                )}
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Allocated Capacity</span>
                  <span className="text-emerald-400 font-bold">{selectedHop.allocatedBandwidthMbps} Mbps CIR</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESOURCE MATRIX TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300">
              Allocated Physical & Logical Resources ({mappings.length} Hops)
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Path: {service.aEndLocationName || 'Jakarta'} → {service.zEndLocationName || 'Surabaya'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-16">Hop #</th>
                  <th className="py-2.5 px-3">Network Device</th>
                  <th className="py-2.5 px-3">Port / Interface (VLAN)</th>
                  <th className="py-2.5 px-3">Logical Circuit / VCID</th>
                  <th className="py-2.5 px-3">Resource Role</th>
                  <th className="py-2.5 px-3 text-right">Bandwidth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                {mappings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">
                      Hop {m.hopOrder}
                    </td>
                    <td className="py-2.5 px-3 text-white font-semibold flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.deviceHostname || 'Core Router'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {m.portName ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {m.portName}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {m.vneName ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold">
                          {m.vneName}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[10px] uppercase">
                      {m.resourceRole}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {m.allocatedBandwidthMbps >= 1000 ? `${m.allocatedBandwidthMbps / 1000} Gbps` : `${m.allocatedBandwidthMbps} Mbps`}
                    </td>
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

