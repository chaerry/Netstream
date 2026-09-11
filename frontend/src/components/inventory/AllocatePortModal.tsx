import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { DevicePort, NetworkService, NetworkDevice, OpticalCable } from '../../types/inventory';
import { 
  Link2, 
  Network, 
  Loader2, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Cable, 
  Layers, 
  Split, 
  Cpu, 
  GitCommit 
} from 'lucide-react';

interface AllocatePortModalProps {
  isOpen: boolean;
  port: DevicePort | null;
  deviceHostname: string;
  onClose: () => void;
  onSuccess: (updatedPort: DevicePort) => void;
}

export const AllocatePortModal: React.FC<AllocatePortModalProps> = ({
  isOpen,
  port,
  deviceHostname,
  onClose,
  onSuccess,
}) => {
  const [services, setServices] = useState<NetworkService[]>([]);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [cables, setCables] = useState<OpticalCable[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [resourceRole, setResourceRole] = useState<string>('ACCESS_PORT');
  const [allocatedBandwidthMbps, setAllocatedBandwidthMbps] = useState<number>(10000);
  const [hopOrder, setHopOrder] = useState<number>(1);
  const [vlanId, setVlanId] = useState<number | undefined>();
  const [vcid, setVcid] = useState<string>('');
  
  // Optical Cable & Core Strand selection
  const [enableCableBinding, setEnableCableBinding] = useState<boolean>(false);
  const [selectedCableId, setSelectedCableId] = useState<string>('');
  const [selectedCoreNumber, setSelectedCoreNumber] = useState<number | undefined>();

  // Physical Peer Device & Port Cross-Connect
  const [enablePeerBinding, setEnablePeerBinding] = useState<boolean>(false);
  const [peerDeviceId, setPeerDeviceId] = useState<string>('');
  const [peerPortId, setPeerPortId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      setError(null);
      
      Promise.all([
        inventoryApi.getServices(),
        inventoryApi.getDevices({ size: 100 }),
        inventoryApi.getCables()
      ]).then(([svcs, devsRes, cablesRes]) => {
        setServices(svcs);
        setCables(cablesRes);
        const devsList: NetworkDevice[] = Array.isArray(devsRes) ? devsRes : (devsRes.items || []);
        setDevices(devsList.filter((d: NetworkDevice) => d.hostname !== deviceHostname)); // Exclude self
        
        if (svcs.length > 0 && !selectedServiceId) {
          setSelectedServiceId(svcs[0].id);
          const firstSvcHops = svcs[0].resourceMappings?.length || 0;
          setHopOrder(firstSvcHops + 1);
        }
        setLoadingData(false);
      }).catch((err) => {
        console.error('Failed to load initial data:', err);
        setLoadingData(false);
      });
    }
  }, [isOpen, deviceHostname]);

  useEffect(() => {
    if (port) {
      setAllocatedBandwidthMbps(port.portSpeedMbps || 10000);
      setResourceRole(port.allocatedResourceRole || 'ACCESS_PORT');
      if (port.allocatedServiceId) {
        setSelectedServiceId(port.allocatedServiceId);
      }
      if (port.connectedPortId) {
        setEnablePeerBinding(true);
        setPeerPortId(port.connectedPortId);
      }
    }
  }, [port]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const currentHops = selectedService?.resourceMappings || [];
  const nextHopDefault = currentHops.length + 1;

  // When service selection changes, update suggested hop order
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const svc = services.find(s => s.id === serviceId);
    const hops = svc?.resourceMappings?.length || 0;
    setHopOrder(hops + 1);
  };

  const selectedPeerDevice = devices.find(d => d.id === peerDeviceId);
  const peerAvailablePorts = selectedPeerDevice?.ports || [];

  const selectedCable = cables.find(c => c.id === selectedCableId);
  const availableStrands = selectedCable?.strands?.filter(s => s.status === 'AVAILABLE' || s.coreNumber === selectedCoreNumber) || [];
  const selectedStrand = selectedCable?.strands?.find(s => s.coreNumber === selectedCoreNumber);

  if (!isOpen || !port) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) {
      setError('Please select an active circuit / network service.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const portNameOverride = vlanId ? `${port.portName}.${vlanId} (VLAN ${vlanId} Dot1Q)` : undefined;
      const vneNameOverride = vcid ? (vcid.startsWith('PW-') ? vcid : `PW-EVPL-${vcid}`) : undefined;

      let effectiveRole = resourceRole;
      if (enableCableBinding && selectedCable && selectedCoreNumber) {
        effectiveRole = `${resourceRole} (${selectedCable.cableCode} • Core #${selectedCoreNumber} ${selectedStrand?.colorName || ''})`;
        if (selectedStrand) {
          inventoryApi.updateStrand(selectedStrand.id, {
            status: 'LIT_IN_USE',
            allocatedServiceId: selectedServiceId,
            allocatedServiceHop: Number(hopOrder) || 1,
            remarks: `In Circuit ${selectedService?.serviceCode} (Hop #${hopOrder})`
          }).catch(console.error);
        }
      }

      const updated = await inventoryApi.allocatePort(port.id, {
        serviceId: selectedServiceId,
        resourceRole: effectiveRole,
        allocatedBandwidthMbps: Number(allocatedBandwidthMbps) || port.portSpeedMbps,
        hopOrder: Number(hopOrder) || 1,
        connectedPortId: enablePeerBinding && peerPortId ? peerPortId : undefined,
        portNameOverride,
        vneNameOverride,
      });

      onSuccess(updated);
    } catch (err: any) {
      console.error('Failed to allocate port:', err);
      setError(err.response?.data?.message || err.message || 'Failed to allocate port to circuit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Allocate Port: ${port.portName}`}
      subtitle={`Device: ${deviceHostname} • Medium: ${port.mediumType} • Speed: ${port.portSpeedMbps >= 1000 ? `${port.portSpeedMbps / 1000}G` : `${port.portSpeedMbps}M`}`}
      maxWidth="full"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Port Header Card */}
        <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white font-mono">{port.portName}</span>
              <span className="text-[11px] text-slate-400 font-mono ml-2">
                {deviceHostname} • {port.connectorType || 'LC/UPC'}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
            {port.portSpeedMbps >= 1000 ? `${port.portSpeedMbps / 1000} Gbps` : `${port.portSpeedMbps} Mbps`}
          </span>
        </div>

        {/* 2-Column Responsive Form Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Column: Circuit Selection, Topology Flow & Peer Binding */}
          <div className="space-y-3">
            {/* 1. Target Circuit / Service Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Target Circuit / Customer Service *</span>
              </label>
              {loadingData ? (
                <div className="p-2.5 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-cyan-400" />
                  Loading provisioned circuits & topology...
                </div>
              ) : services.length === 0 ? (
                <div className="p-2.5 text-center text-xs text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  No active customer circuits found.
                </div>
              ) : (
                <select
                  required
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="glass-input w-full h-9 px-3 text-xs rounded-xl font-mono text-cyan-300"
                >
                  <option value="">-- Select Active Circuit --</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.serviceCode} — {svc.customerName} ({svc.serviceType} • {svc.bandwidthMbps >= 1000 ? `${svc.bandwidthMbps / 1000}G` : `${svc.bandwidthMbps}M`})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. Visual Circuit Path Stepper (Existing Hops Topology) */}
            {selectedService && (
              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Path Topology: <strong className="text-cyan-300 font-mono">{selectedService.serviceCode}</strong></span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                    {selectedService.status}
                  </span>
                </div>

                {/* Path Stepper Chips */}
                <div className="flex flex-wrap items-center gap-1.5 py-1">
                  <div className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] font-mono text-blue-300">
                    A-End Origin
                  </div>
                  <ArrowRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />

                  {currentHops.map((h, idx) => (
                    <React.Fragment key={h.id || idx}>
                      <div className={`px-2 py-0.5 rounded border text-[9px] font-mono flex items-center gap-1 ${
                        h.hopOrder === hopOrder
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}>
                        <span className="w-3 h-3 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">
                          {h.hopOrder}
                        </span>
                        <span className="truncate max-w-[90px]">{h.deviceHostname || 'Device'}</span>
                      </div>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                    </React.Fragment>
                  ))}

                  {/* Slot where this new port will sit */}
                  <div className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm shadow-cyan-500/20 animate-pulse">
                    <GitCommit className="w-3 h-3 text-cyan-400" />
                    <span>Hop #{hopOrder}: {deviceHostname} ({port.portName})</span>
                  </div>

                  <ArrowRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                  <div className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[9px] font-mono text-purple-300">
                    Z-End
                  </div>
                </div>
              </div>
            )}

            {/* Optional Optical Cable & Core Strand Conduit */}
            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCableBinding}
                    onChange={(e) => setEnableCableBinding(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                  />
                  <Cable className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bind Optical Fiber Cable & Core Strand</span>
                </label>
                <span className="text-[10px] text-slate-400">OSP/ISP Fiber</span>
              </div>

              {enableCableBinding && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Optical Cable Conduit</label>
                    <select
                      value={selectedCableId}
                      onChange={(e) => {
                        setSelectedCableId(e.target.value);
                        setSelectedCoreNumber(undefined);
                      }}
                      className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-cyan-300"
                    >
                      <option value="">-- Select Cable --</option>
                      {cables.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.cableCode} ({c.totalCores}C • {c.darkCores} Dark)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Target Core / Strand Number</label>
                    <select
                      disabled={!selectedCableId || availableStrands.length === 0}
                      value={selectedCoreNumber || ''}
                      onChange={(e) => setSelectedCoreNumber(Number(e.target.value) || undefined)}
                      className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200 disabled:opacity-50"
                    >
                      <option value="">-- Select Strand --</option>
                      {availableStrands.map((s) => (
                        <option key={s.id} value={s.coreNumber}>
                          Core #{s.coreNumber} ({s.colorName} • {s.status === 'AVAILABLE' ? 'Dark Fiber' : s.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCable && selectedCoreNumber && (
                    <div className="col-span-full p-2 bg-cyan-950/40 rounded-lg border border-cyan-500/20 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: selectedStrand?.colorHex || '#06b6d4' }}
                        />
                        <span>{selectedCable.cableCode} • Core #{selectedCoreNumber} ({selectedStrand?.colorName})</span>
                      </span>
                      <span className="text-slate-400">{(selectedCable.lengthMeters / 1000).toFixed(2)} km</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Physical Peer Interconnect */}
            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePeerBinding}
                    onChange={(e) => setEnablePeerBinding(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                  />
                  <Cable className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bind Neighbor Peer Port (Cross-Connect)</span>
                </label>
                <span className="text-[10px] text-slate-400">Optional</span>
              </div>

              {enablePeerBinding && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Peer Equipment</label>
                    <select
                      value={peerDeviceId}
                      onChange={(e) => {
                        setPeerDeviceId(e.target.value);
                        setPeerPortId('');
                      }}
                      className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200"
                    >
                      <option value="">-- Select Peer Device --</option>
                      {devices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.hostname} ({d.model})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Peer Port Interface</label>
                    <select
                      disabled={!peerDeviceId || peerAvailablePorts.length === 0}
                      value={peerPortId}
                      onChange={(e) => setPeerPortId(e.target.value)}
                      className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200 disabled:opacity-50"
                    >
                      <option value="">-- Select Peer Port --</option>
                      {peerAvailablePorts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.portName} ({p.isAllocated ? 'In Use' : 'Available'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hop Sequence, Role & Logical Encapsulation */}
          <div className="space-y-3">
            {/* Hop Order & Bandwidth Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>2. Hop Sequence in Path *</span>
                  <span className="text-[10px] text-slate-400 font-mono">Suggested: #{nextHopDefault}</span>
                </label>
                <div className="flex gap-1 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setHopOrder(1)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                      hopOrder === 1
                        ? 'bg-cyan-600 text-white border-cyan-500'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Hop 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setHopOrder(2)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                      hopOrder === 2
                        ? 'bg-cyan-600 text-white border-cyan-500'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Hop 2
                  </button>
                  <button
                    type="button"
                    onClick={() => setHopOrder(nextHopDefault)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                      hopOrder === nextHopDefault
                        ? 'bg-cyan-600 text-white border-cyan-500'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Hop {nextHopDefault} (Next)
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={hopOrder}
                  onChange={(e) => setHopOrder(Number(e.target.value) || 1)}
                  className="glass-input w-full h-8 px-3 text-xs rounded-lg font-mono text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Allocated Bandwidth CIR *
                </label>
                <input
                  type="number"
                  min={100}
                  max={port.portSpeedMbps || 100000}
                  step={100}
                  value={allocatedBandwidthMbps}
                  onChange={(e) => setAllocatedBandwidthMbps(Number(e.target.value) || 10000)}
                  className="glass-input w-full h-8 px-3 text-xs rounded-lg font-mono text-white font-bold mt-5"
                />
                <span className="text-[10px] text-slate-400 block font-mono mt-1">
                  CIR: {allocatedBandwidthMbps >= 1000 ? `${allocatedBandwidthMbps / 1000} Gbps` : `${allocatedBandwidthMbps} Mbps`}
                </span>
              </div>
            </div>

            {/* Interface Circuit Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                3. Interface Circuit Role *
              </label>
              <select
                value={resourceRole}
                onChange={(e) => setResourceRole(e.target.value)}
                className="glass-input w-full h-9 px-3 text-xs rounded-xl font-mono text-slate-200"
              >
                <option value="ACCESS_PORT">ACCESS_PORT (Customer Access Handoff)</option>
                <option value="METRO_ACCESS_A_END">METRO_ACCESS_A_END (Jakarta Demarcation UNI)</option>
                <option value="PE_ROUTER_ORIGIN_VCID">PE_ROUTER_ORIGIN_VCID (Origin PE Pseudowire / VCID)</option>
                <option value="DWDM_OPTICAL_TRANSPORT">DWDM_OPTICAL_TRANSPORT (DWDM Core Transport)</option>
                <option value="PE_ROUTER_TERMINATION_VCID">PE_ROUTER_TERMINATION_VCID (Dest PE VCID Termination)</option>
                <option value="METRO_ACCESS_Z_END">METRO_ACCESS_Z_END (Surabaya Demarcation UNI)</option>
                <option value="CORE_TRANSIT">CORE_TRANSIT (Backbone Core Transit)</option>
                <option value="UPLINK">UPLINK (Metro Trunk Uplink)</option>
              </select>
            </div>

            {/* 4. Logical Layer: VLAN Sub-Interface & VCID Configuration */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-cyan-500/30 space-y-2.5">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>4. Logical Encapsulation: VLAN & VCID Tunnel</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    802.1Q Dot1Q VLAN ID (1 - 4094)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4094}
                    placeholder="e.g. 250, 300, 100"
                    value={vlanId || ''}
                    onChange={(e) => setVlanId(e.target.value ? Number(e.target.value) : undefined)}
                    className="glass-input w-full h-8 px-2.5 text-xs rounded-lg font-mono text-cyan-300"
                  />
                  <span className="text-[9px] text-slate-400 block font-mono truncate">
                    Port: <strong className="text-white">{vlanId ? `${port.portName}.${vlanId}` : port.portName}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    VCID / Pseudowire Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 250025, 300100"
                    value={vcid || ''}
                    onChange={(e) => setVcid(e.target.value)}
                    className="glass-input w-full h-8 px-2.5 text-xs rounded-lg font-mono text-amber-300"
                  />
                  <span className="text-[9px] text-slate-400 block font-mono truncate">
                    VNE: <strong className="text-amber-300">{vcid ? `PW-EVPL-${vcid}` : 'None'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedServiceId}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Binding Port & Sequence...</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Allocate Port at Hop #{hopOrder}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
