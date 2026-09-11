import React, { useState } from 'react';
import { Rack, NetworkDevice } from '../../types/inventory';
import { 
  Server, 
  Zap, 
  Weight, 
  Eye, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  Layers, 
  Plus, 
  Sliders, 
  Activity,
  ThermometerSnowflake,
  Edit3,
  Search,
  ArrowRight
} from 'lucide-react';

interface RackElevationViewerProps {
  rack: Rack;
  allRacks?: Rack[];
  onSelectRack?: (rack: Rack) => void;
  devices: NetworkDevice[];
  allFoundDevices?: NetworkDevice[];
  searchTerm?: string;
  onSelectDevice?: (device: NetworkDevice) => void;
  onEditDevice?: (device: NetworkDevice) => void;
  onAddDeviceToUnit?: (unit: number) => void;
  onAddRack?: () => void;
}

export const RackElevationViewer: React.FC<RackElevationViewerProps> = ({
  rack,
  allRacks = [],
  onSelectRack,
  devices,
  allFoundDevices = [],
  searchTerm = '',
  onSelectDevice,
  onEditDevice,
  onAddDeviceToUnit,
  onAddRack,
}) => {
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null);

  // Total 42 Units array in descending order (U42 at top down to U1)
  const totalUnits = rack.heightUnits || 42;
  const units = Array.from({ length: totalUnits }, (_, i) => totalUnits - i);

  // Devices mounted in this specific rack
  const rackDevices = devices.filter(d => !d.rackId || d.rackId === rack.id);

  // Calculate occupied U units
  const occupiedUnits = rackDevices.reduce((sum, d) => sum + (d.rackUnitHeight || 1), 0);
  const occupancyPct = Math.round((occupiedUnits / totalUnits) * 100);

  // Helper to find device occupying a specific U unit
  const getDeviceAtUnit = (unit: number): NetworkDevice | undefined => {
    return rackDevices.find(d => {
      if (!d.rackUnitStart) return false;
      const height = d.rackUnitHeight || 1;
      return unit >= d.rackUnitStart && unit < d.rackUnitStart + height;
    });
  };

  const powerPct = Math.min(100, Math.round(((rack.currentPowerWatt || 3200) / (rack.maxPowerWatt || 6000)) * 100));

  // Helper to get match count for a rack when searching
  const getMatchCountForRack = (rackId: string) => {
    if (!searchTerm.trim() || !allFoundDevices) return 0;
    return allFoundDevices.filter(d => d.rackId === rackId).length;
  };

  const hasSearch = !!searchTerm.trim();

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800 shadow-2xl">
      {/* Top Rack Switcher & Location Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 text-cyan-400 rounded-2xl border border-cyan-500/40 shadow-glow-cyan">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {rack.rackNumber}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                42U Standard Telecom Rack
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Jakarta Mega PoP (ID-CGK) • Building A • Room 301 Suite B
            </p>
          </div>
        </div>

        {/* Multi-Rack Quick Selector */}
        {allRacks.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-500 pl-2 pr-1">Racks:</span>
            {allRacks.map((r) => {
              const matchCount = getMatchCountForRack(r.id);
              const isMatch = matchCount > 0;
              const isCurrent = r.id === rack.id;

              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRack && onSelectRack(r)}
                  className={`relative px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/40 border border-cyan-400/40'
                      : isMatch
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900 animate-pulse'
                      : hasSearch
                      ? 'text-slate-500 opacity-40 hover:opacity-100 hover:text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{r.rackNumber}</span>
                  {isMatch && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                        isCurrent
                          ? 'bg-white text-cyan-900'
                          : 'bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {matchCount}
                    </span>
                  )}
                </button>
              );
            })}

            {onAddRack && (
              <button
                onClick={onAddRack}
                title="Commission New 42U Rack"
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold rounded-xl hover:bg-cyan-600 hover:text-white transition-all ml-1"
              >
                <Plus className="w-3 h-3" />
                <span>Rack</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Jump Search Matches Banner */}
      {hasSearch && allFoundDevices.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Found <strong>{allFoundDevices.length}</strong> equipment record{allFoundDevices.length > 1 ? 's' : ''} matching "{searchTerm}":
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allFoundDevices.map((d) => {
              const targetRack = allRacks.find((r) => r.id === d.rackId);
              const isCurrentRack = targetRack?.id === rack.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    if (targetRack && onSelectRack) onSelectRack(targetRack);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
                    isCurrentRack
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-cyan-500/30 border border-cyan-300 ring-2 ring-cyan-400/40'
                      : 'bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 hover:text-white'
                  }`}
                >
                  <span>{d.hostname}</span>
                  <span className={`text-[10px] font-semibold ${isCurrentRack ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    ➔ {targetRack?.rackNumber || d.rackNumber || 'Rack'} (U{d.rackUnitStart})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Telemetry & Spec Summary Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Space Occupancy */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Occupancy
            </span>
            <span className="font-mono font-bold text-white">{occupancyPct}%</span>
          </div>
          <p className="text-sm font-extrabold text-white font-mono">
            {occupiedUnits}U <span className="text-slate-500 font-normal text-xs">/ {totalUnits}U Space</span>
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${occupancyPct}%` }} />
          </div>
        </div>

        {/* Power Draw */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Power Load
            </span>
            <span className="font-mono font-bold text-amber-400">{powerPct}%</span>
          </div>
          <p className="text-sm font-extrabold text-white font-mono">
            {rack.currentPowerWatt || 3200}W <span className="text-slate-500 font-normal text-xs">/ {rack.maxPowerWatt || 6000}W</span>
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                powerPct > 80 ? 'bg-rose-500' : powerPct > 60 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${powerPct}%` }}
            />
          </div>
        </div>

        {/* Weight Capacity */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5 text-purple-400" />
              Weight Load
            </span>
            <span className="font-mono font-bold text-purple-300">34%</span>
          </div>
          <p className="text-sm font-extrabold text-white font-mono">
            340kg <span className="text-slate-500 font-normal text-xs">/ {rack.maxWeightKg || 1000}kg</span>
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '34%' }} />
          </div>
        </div>

        {/* Thermal / Intake */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-400" />
              Thermal Air
            </span>
            <span className="font-mono font-bold text-emerald-400">Normal</span>
          </div>
          <p className="text-sm font-extrabold text-white font-mono">
            21.4°C <span className="text-slate-500 font-normal text-xs">Intake</span>
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '45%' }} />
          </div>
        </div>
      </div>

      {/* 42U Graphical Elevation Bay */}
      <div className="bg-[#050811] p-5 rounded-2xl border border-slate-800/90 shadow-2xl max-w-3xl mx-auto">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 pb-3 px-3 border-b border-slate-800 mb-3">
          <span className="w-14">SLOT</span>
          <span className="flex-1 px-4">MOUNTED TELECOM HARDWARE / CHASSIS EQUIPMENT</span>
          <span className="w-28 text-right">PORTS & STATE</span>
        </div>

        <div className="space-y-1.5">
          {units.map((unit) => {
            const dev = getDeviceAtUnit(unit);
            const isDeviceStart = dev && dev.rackUnitStart === unit;

            // Multi-U equipment handled at top start unit
            if (dev && !isDeviceStart) {
              return null;
            }

            if (dev && isDeviceStart) {
              const height = dev.rackUnitHeight || 1;
              const isRouter = dev.deviceType === 'ROUTER';
              const isDWDM = dev.deviceType === 'DWDM_CHASSIS';
              const isSwitch = dev.deviceType === 'SWITCH';
              const isOLT = dev.deviceType === 'OLT';
              const isMetro = dev.deviceType === 'METRO';

              const isDeviceMatch = hasSearch && (
                dev.hostname.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                dev.serialNumber.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                (dev.managementIp && dev.managementIp.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
                dev.model.toLowerCase().includes(searchTerm.toLowerCase().trim())
              );

              return (
                <div
                  key={unit}
                  onClick={() => onSelectDevice && onSelectDevice(dev)}
                  onMouseEnter={() => setHoveredUnit(unit)}
                  onMouseLeave={() => setHoveredUnit(null)}
                  className={`group relative rounded-xl border p-3 flex items-center justify-between cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                    isDeviceMatch
                      ? 'ring-2 ring-cyan-400 border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.8)]'
                      : ''
                  } ${
                    isDWDM
                      ? 'bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900/90 border-purple-500/60 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)] hover:border-purple-400'
                      : isRouter
                      ? 'bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900/90 border-cyan-500/60 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] hover:border-cyan-400'
                      : isSwitch
                      ? 'bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900/90 border-blue-500/60 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] hover:border-blue-400'
                      : isOLT
                      ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900/90 border-amber-500/60 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] hover:border-amber-400'
                      : isMetro
                      ? 'bg-gradient-to-r from-teal-950/70 via-slate-900 to-slate-900/90 border-teal-500/60 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] hover:border-teal-400'
                      : 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900/90 border-emerald-500/60'
                  }`}
                  style={{ minHeight: `${Math.max(48, height * 44)}px` }}
                >
                  {/* U Slot Badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 text-center font-mono text-xs font-extrabold text-cyan-300 bg-slate-950/90 py-1.5 rounded-lg border border-slate-700/80 shadow-inner">
                      U{unit + height - 1}{height > 1 ? `-U${unit}` : ''}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {dev.hostname}
                        </span>
                        {isDeviceMatch && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-extrabold tracking-wider animate-pulse shadow-sm shadow-cyan-400/50">
                            ★ MATCHED
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 font-mono border border-slate-700">
                          {dev.vendor} {dev.model}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                        <span className="text-cyan-400/90">IP: {dev.managementIp || '10.240.10.x'}</span>
                        <span>•</span>
                        <span>SN: {dev.serialNumber}</span>
                        <span>•</span>
                        <span className="text-slate-400">{dev.hardwareVersion || 'V02'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Ports & Action Button */}
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <span className="text-xs font-extrabold text-cyan-400 font-mono">
                        {dev.ports?.length ?? 0} / {dev.totalPorts || dev.ports?.length || 0} Ports
                      </span>
                      <p className={`text-[10px] font-semibold ${
                        dev.status === 'ACTIVE' ? 'text-emerald-400' :
                        dev.status === 'FAULTY' ? 'text-rose-400' :
                        dev.status === 'MAINTENANCE' ? 'text-amber-400' :
                        dev.status === 'PLANNED' ? 'text-blue-400' : 'text-slate-400'
                      }`}>
                        ● {dev.status || 'ACTIVE'}
                      </p>
                    </div>

                    {onEditDevice && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDevice(dev);
                        }}
                        title="Modify Device Configuration (IP, Rack, Status)"
                        className="p-2 bg-slate-800/90 text-slate-400 hover:text-amber-300 hover:bg-amber-950/60 rounded-xl border border-slate-700 hover:border-amber-500/40 transition-all shadow-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDevice && onSelectDevice(dev);
                      }}
                      title="Inspect Ports & Interfaces"
                      className="p-2 bg-slate-800/90 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/60 rounded-xl border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            // Available Empty U-Slot
            return (
              <div
                key={unit}
                onClick={() => onAddDeviceToUnit && onAddDeviceToUnit(unit)}
                onMouseEnter={() => setHoveredUnit(unit)}
                onMouseLeave={() => setHoveredUnit(null)}
                className="h-8 border border-dashed border-slate-800/70 rounded-lg flex items-center justify-between px-3 text-[11px] font-mono text-slate-600 hover:border-cyan-500/40 hover:bg-cyan-950/10 hover:text-cyan-300 cursor-pointer transition-all"
              >
                <span className="w-14 text-slate-500 font-bold">U{unit}</span>
                <span className="text-[10px] italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  Available 1U Chassis Bay
                </span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <Plus className="w-3 h-3 text-cyan-400" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
