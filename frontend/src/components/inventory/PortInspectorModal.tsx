import React, { useState } from 'react';
import { NetworkDevice, DevicePort } from '../../types/inventory';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { useAuth } from '../../auth/AuthContext';
import { AllocatePortModal } from './AllocatePortModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Activity, Plus, Network, Cpu, CheckCircle2, XCircle, Loader2, Link2, Unlink, ExternalLink, ShieldAlert } from 'lucide-react';

interface PortInspectorModalProps {
  device: NetworkDevice | null;
  onClose: () => void;
  onPortAdded?: () => void;
}

export const PortInspectorModal: React.FC<PortInspectorModalProps> = ({
  device,
  onClose,
  onPortAdded,
}) => {
  const { hasAnyRole } = useAuth();
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newPortName, setNewPortName] = useState<string>('');
  const [newPortSpeed, setNewPortSpeed] = useState<number>(100000);
  const [newMedium, setNewMedium] = useState<string>('FIBER_SINGLE_MODE');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ports, setPorts] = useState<DevicePort[]>(device?.ports || []);
  const [totalPorts, setTotalPorts] = useState<number>(device?.totalPorts || (device?.ports?.length || 0));

  // Port Allocation Modal State
  const [allocatingPort, setAllocatingPort] = useState<DevicePort | null>(null);
  const [releasingPort, setReleasingPort] = useState<DevicePort | null>(null);
  const [releasingPortId, setReleasingPortId] = useState<string | null>(null);
  const [addPortError, setAddPortError] = useState<string | null>(null);

  React.useEffect(() => {
    if (device) {
      setPorts(device.ports || []);
      setTotalPorts(device.totalPorts || (device.ports?.length || 0));
      inventoryApi.getDeviceById(device.id)
        .then(fresh => {
          if (fresh && fresh.ports) {
            setPorts(fresh.ports);
            setTotalPorts(fresh.totalPorts || fresh.ports.length);
          }
        })
        .catch(console.error);
    }
  }, [device]);

  if (!device) return null;

  const handleAddPort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortName.trim()) return;
    setIsSubmitting(true);
    setAddPortError(null);
    try {
      const addedPort = await inventoryApi.addPort(device.id, {
        portName: newPortName.trim(),
        portSpeedMbps: newPortSpeed,
        mediumType: newMedium,
        connectorType: 'LC/UPC',
      });
      setPorts(prev => [addedPort, ...prev]);
      setTotalPorts(prev => prev + 1);
      setShowAddForm(false);
      setNewPortName('');
      if (onPortAdded) onPortAdded();
    } catch (err: any) {
      setAddPortError(err.message || 'Failed to provision port');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReleasePortConfirmed = async (port: DevicePort) => {
    setReleasingPortId(port.id);
    try {
      const updated = await inventoryApi.releasePort(port.id);
      setPorts(prev => prev.map(p => p.id === port.id ? updated : p));
      setReleasingPort(null);
      if (onPortAdded) onPortAdded();
    } catch (err: any) {
      console.error('Failed to release port:', err);
    } finally {
      setReleasingPortId(null);
    }
  };

  const handleAllocateSuccess = (updatedPort: DevicePort) => {
    setPorts(prev => prev.map(p => p.id === updatedPort.id ? updatedPort : p));
    setAllocatingPort(null);
    if (onPortAdded) onPortAdded();
  };

  const chassisCapacity = device.totalPorts || ports.length || 0;
  const availableBays = Math.max(0, chassisCapacity - ports.length);
  const allocatedCount = ports.filter(p => p.isAllocated).length;

  return (
    <Modal
      isOpen={!!device}
      onClose={onClose}
      title={`Port Interfaces: ${device.hostname}`}
      subtitle={`${device.vendor} ${device.model} • SN: ${device.serialNumber} • ${ports.length} of ${chassisCapacity} Interfaces Provisioned (${availableBays} Available Bays)`}
      maxWidth="6xl"
    >
      <div className="space-y-5">
        {/* Hardware Capacity & Provisioning Breakdown Bar */}
        <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center font-mono">
          <div className="border-r border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">Configured</span>
            <span className="text-sm font-extrabold text-cyan-400">{ports.length}</span>
          </div>
          <div className="border-r border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">In Circuit</span>
            <span className="text-sm font-extrabold text-amber-400">{allocatedCount}</span>
          </div>
          <div className="border-r border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">Free Ports</span>
            <span className="text-sm font-extrabold text-emerald-400">{ports.length - allocatedCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">Empty Bays</span>
            <span className="text-sm font-extrabold text-white">{availableBays}</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Active Physical & Logical Port Matrix</span>
          </div>

          {hasAnyRole(['inventory-admin', 'inventory-operator']) && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-lg hover:bg-cyan-600 hover:text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Port Interface
            </button>
          )}
        </div>

        {/* Add Port Form */}
        {showAddForm && (
          <form onSubmit={handleAddPort} className="glass-panel p-4 rounded-xl border border-cyan-500/30 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Interface Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Port Name *</label>
                <input
                  type="text"
                  required
                  placeholder="HundredGigE0/0/0/2"
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  className="glass-input w-full px-3 py-1.5 text-xs rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Speed</label>
                <select
                  value={newPortSpeed}
                  onChange={(e) => setNewPortSpeed(Number(e.target.value))}
                  className="glass-input w-full px-3 py-1.5 text-xs rounded-lg"
                >
                  <option value={100000}>100 Gbps (100GE)</option>
                  <option value={40000}>40 Gbps (40GE)</option>
                  <option value={10000}>10 Gbps (10GE)</option>
                  <option value={1000}>1 Gbps (1GE)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Medium Type</label>
                <select
                  value={newMedium}
                  onChange={(e) => setNewMedium(e.target.value)}
                  className="glass-input w-full px-3 py-1.5 text-xs rounded-lg"
                >
                  <option value="FIBER_SINGLE_MODE">Fiber Single Mode (SMF)</option>
                  <option value="FIBER_MULTI_MODE">Fiber Multi Mode (MMF)</option>
                  <option value="COPPER_RJ45">Copper RJ45 (1G/10G)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-md shadow-cyan-600/30 disabled:opacity-60 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  'Save Port'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Port Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {ports.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-slate-500 text-xs">
              No port interfaces recorded for this device yet.
            </div>
          ) : (
            ports.map((port) => {
              const isAllocatingThis = releasingPortId === port.id;

              return (
                <div
                  key={port.id}
                  className={`glass-card p-3 rounded-xl border space-y-2.5 transition-all ${
                    port.isAllocated
                      ? 'border-amber-500/30 bg-slate-900/90 shadow-sm shadow-amber-500/5'
                      : 'border-slate-800/80 bg-slate-900/60'
                  }`}
                >
                  {/* Top Bar: Port Name, Speed & Operational Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{port.portName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono font-bold">
                        {port.portSpeedMbps >= 1000 ? `${port.portSpeedMbps / 1000}G` : `${port.portSpeedMbps}M`}
                      </span>
                    </div>

                    <div>
                      {port.isOperational ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> UP
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 font-mono">
                          <XCircle className="w-3 h-3" /> DOWN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Port Info & Allocation Status */}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{port.connectorType || 'LC/UPC'}</span>
                    <span className={port.isAllocated ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      ● {port.isAllocated ? 'Allocated to Circuit' : 'Free / Available'}
                    </span>
                  </div>

                  {/* Circuit Details Banner if Allocated */}
                  {port.isAllocated && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[10px] font-mono text-amber-300 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-200">{port.allocatedServiceCode || 'SVC-ACTIVE-CIRCUIT'}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          {port.allocatedResourceRole || 'ACCESS'}
                        </span>
                      </div>
                      {port.allocatedCustomerName && (
                        <p className="text-slate-300 truncate font-sans text-[11px] font-medium">
                          {port.allocatedCustomerName}
                        </p>
                      )}
                      {port.allocatedBandwidthMbps && (
                        <p className="text-[9px] text-amber-400/80">
                          Allocated BW: {port.allocatedBandwidthMbps >= 1000 ? `${port.allocatedBandwidthMbps / 1000} Gbps` : `${port.allocatedBandwidthMbps} Mbps`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Allocation Action Toolbar */}
                  {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      {port.isAllocated ? (
                        <>
                          <button
                            onClick={() => setReleasingPort(port)}
                            disabled={isAllocatingThis}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                            title="Release this port from the circuit"
                          >
                            {isAllocatingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Unlink className="w-3 h-3" />
                            )}
                            <span>Release</span>
                          </button>

                          <button
                            onClick={() => setAllocatingPort(port)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500 hover:text-slate-950 transition-all"
                            title="Modify circuit allocation"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>Modify</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setAllocatingPort(port)}
                          className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-cyan-300 bg-cyan-600/20 border border-cyan-500/40 rounded-lg hover:bg-cyan-600 hover:text-white transition-all shadow-sm shadow-cyan-600/20"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Allocate to Circuit</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Allocate Port to Circuit Modal */}
      {allocatingPort && (
        <AllocatePortModal
          isOpen={!!allocatingPort}
          port={allocatingPort}
          deviceHostname={device.hostname}
          onClose={() => setAllocatingPort(null)}
          onSuccess={handleAllocateSuccess}
        />
      )}

      {/* Confirm Release Port Modal */}
      {releasingPort && (
        <ConfirmDeleteModal
          isOpen={!!releasingPort}
          itemType="PORT"
          itemId={releasingPort.id}
          itemCode={releasingPort.portName}
          itemName={`Circuit: ${releasingPort.allocatedServiceCode || 'Active Service'}`}
          customWarningMessage="Releasing this port will unmap it from the circuit's optical/logical path and mark the interface as Available."
          onClose={() => setReleasingPort(null)}
          onConfirm={async () => {
            await handleReleasePortConfirmed(releasingPort);
          }}
        />
      )}
    </Modal>
  );
};

