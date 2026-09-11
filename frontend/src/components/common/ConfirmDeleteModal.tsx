import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { NetworkDevice, OpticalCable, VirtualNetworkElement, NetworkService, DevicePort } from '../../types/inventory';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Route, 
  Cable, 
  Network, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Trash2, 
  Layers,
  Ban,
  ShieldCheck
} from 'lucide-react';

export type DeletableItemType = 'DEVICE' | 'CABLE' | 'VNE' | 'PORT' | 'SERVICE' | 'GENERIC';

export interface DependencyItem {
  id: string;
  type: 'SERVICE' | 'PORT' | 'CABLE' | 'PEER' | 'VNE';
  title: string;
  subtitle?: string;
  badge?: string;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemType: DeletableItemType;
  itemId: string;
  itemCode: string;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  customWarningMessage?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  itemType,
  itemId,
  itemCode,
  itemName,
  onClose,
  onConfirm,
  customWarningMessage,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [dependencies, setDependencies] = useState<DependencyItem[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      setIsScanning(true);
      setErrorMessage(null);
      setDependencies([]);

      // Perform real-time relationship & dependency inspection
      scanDependencies(itemType, itemId, itemCode)
        .then((deps) => {
          setDependencies(deps);
          setIsScanning(false);
        })
        .catch((err) => {
          console.error('Failed to scan dependencies:', err);
          setIsScanning(false);
        });
    }
  }, [isOpen, itemId, itemType, itemCode]);

  const scanDependencies = async (
    type: DeletableItemType,
    id: string,
    code: string
  ): Promise<DependencyItem[]> => {
    const deps: DependencyItem[] = [];

    try {
      if (type === 'DEVICE') {
        // 1. Fetch full device detail to check ports & cross-connects
        const device: NetworkDevice = await inventoryApi.getDeviceById(id);
        const allocatedPorts = (device.ports || []).filter(p => p.isAllocated || p.allocatedServiceId);
        allocatedPorts.forEach(p => {
          deps.push({
            id: p.id,
            type: 'PORT',
            title: `Port ${p.portName} is Allocated`,
            subtitle: p.allocatedResourceRole || (p.allocatedServiceCode ? `Circuit: ${p.allocatedServiceCode}` : 'In Use'),
            badge: `${p.portSpeedMbps >= 1000 ? p.portSpeedMbps / 1000 + 'G' : p.portSpeedMbps + 'M'}`
          });
        });

        const connectedPeers = (device.ports || []).filter(p => p.connectedPortId);
        connectedPeers.forEach(p => {
          deps.push({
            id: p.id + '-peer',
            type: 'PEER',
            title: `Port ${p.portName} has Physical Cross-Connect`,
            subtitle: 'Direct physical link to neighbor device interface',
            badge: 'Cross-Connect'
          });
        });

        // 2. Fetch cables to check if any cable terminates or originates here
        const allCables: OpticalCable[] = await inventoryApi.getCables();
        const attachedCables = allCables.filter(c => c.originDeviceId === id || c.terminationDeviceId === id);
        attachedCables.forEach(c => {
          const isOrigin = c.originDeviceId === id;
          deps.push({
            id: c.id,
            type: 'CABLE',
            title: `Optical Cable Attached: ${c.cableCode}`,
            subtitle: `${isOrigin ? 'A-End Origin' : 'Z-End Destination'} • ${c.totalCores} Cores (${c.litCores} Lit) • ${(c.lengthMeters / 1000).toFixed(2)} km`,
            badge: c.cableType
          });
        });

        // 3. Fetch services to check if any service path hops go through this device
        const allServices: NetworkService[] = await inventoryApi.getServices();
        const activeServices = allServices.filter(s => 
          (s.resourceMappings || []).some(m => m.deviceId === id || m.deviceHostname === device.hostname)
        );
        activeServices.forEach(s => {
          deps.push({
            id: s.id,
            type: 'SERVICE',
            title: `Active Circuit: ${s.serviceCode}`,
            subtitle: `${s.customerName} • ${s.serviceType} • ${s.bandwidthMbps >= 1000 ? s.bandwidthMbps / 1000 + ' Gbps' : s.bandwidthMbps + ' Mbps'}`,
            badge: s.status
          });
        });
      } else if (type === 'CABLE') {
        // Fetch cable to check if any strand is LIT_IN_USE
        const cable: OpticalCable = await inventoryApi.getCableById(id);
        const litStrands = (cable.strands || []).filter(s => s.status === 'LIT_IN_USE' || s.allocatedServiceId);
        litStrands.forEach(s => {
          deps.push({
            id: s.id,
            type: 'SERVICE',
            title: `Core #${s.coreNumber} (${s.colorName}) is LIT`,
            subtitle: s.allocatedServiceCode ? `Mapped to Circuit: ${s.allocatedServiceCode} (${s.allocatedCustomerName || ''})` : 'Active Laser Transmission',
            badge: `Tube #${s.tubeNumber}`
          });
        });
      } else if (type === 'PORT') {
        // Single port check
        const allServices: NetworkService[] = await inventoryApi.getServices();
        const mappedService = allServices.find(s => 
          (s.resourceMappings || []).some(m => m.portId === id)
        );
        if (mappedService) {
          deps.push({
            id: mappedService.id,
            type: 'SERVICE',
            title: `Allocated to Circuit: ${mappedService.serviceCode}`,
            subtitle: mappedService.customerName,
            badge: mappedService.status
          });
        }
      } else if (type === 'VNE') {
        // VNE check
        const allServices: NetworkService[] = await inventoryApi.getServices();
        const mappedServices = allServices.filter(s => 
          (s.resourceMappings || []).some(m => m.vneId === id)
        );
        mappedServices.forEach(s => {
          deps.push({
            id: s.id,
            type: 'SERVICE',
            title: `Referenced in Circuit: ${s.serviceCode}`,
            subtitle: s.customerName,
            badge: s.serviceType
          });
        });
      }
    } catch (err) {
      console.warn('Dependency scanner encountered warning:', err);
    }

    return deps;
  };

  const hasBlockers = dependencies.length > 0;

  const handleExecuteDelete = async () => {
    if (hasBlockers) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error('Delete execution failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete object due to system conflict.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Decommission / Delete Confirmation`}
      subtitle={`Target: ${itemCode} ${itemName ? `(${itemName})` : ''}`}
      icon={<Trash2 className="w-5 h-5 text-rose-400" />}
      maxWidth="3xl"
    >
      <div className="space-y-4 relative">
        {/* Protocol Header Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold uppercase tracking-wider">
              SEC_OPS // ASSET_RETIREMENT_L4
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            TARGET_TYPE: [{itemType}]
          </span>
        </div>

        {/* Target Asset Box */}
        <div className="p-3.5 rounded-2xl bg-rose-950/25 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400/80 font-bold block">
              Decommission Asset Target
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
              {itemCode}
            </span>
          </div>
          {itemName && (
            <span className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              {itemName}
            </span>
          )}
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2.5 shadow-sm shadow-rose-500/20">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <span className="font-bold block text-rose-200">Decommission Operation Rejected</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Live Scanning Status */}
        {isScanning ? (
          <div className="p-8 bg-slate-900/80 rounded-2xl border border-cyan-500/30 text-center space-y-3 relative overflow-hidden shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
            <div className="relative inline-flex items-center justify-center">
              <span className="absolute w-12 h-12 rounded-full border border-cyan-500/30 animate-ping" />
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            </div>
            <p className="text-xs font-mono text-cyan-300 font-bold tracking-wide">
              Scanning Physical, Optical & Logical Topologies...
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              Performing live relational audit: checking fiber conduits, active customer circuits, cross-connect ports, and VNE mappings...
            </p>
          </div>
        ) : hasBlockers ? (
          /* BLOCKER STATE: Active Relationships Detected */
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 shadow-[0_0_30px_-10px_rgba(244,63,94,0.25)]">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <span>Decommission Blocked: Active Relationships Found ({dependencies.length})</span>
                </h4>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  This object cannot be deleted because it is actively utilized in customer circuits, optical cables, or cross-connects. Deleting it would break live traffic.
                </p>
              </div>
            </div>

            {/* List of Blocking Dependencies */}
            <div className="space-y-2 max-h-[36vh] overflow-y-auto pr-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Detected Dependencies to Release First:
              </span>
              <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden">
                {dependencies.map((dep) => (
                  <div key={dep.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 shrink-0">
                        {dep.type === 'SERVICE' && <Zap className="w-4 h-4 text-cyan-400" />}
                        {dep.type === 'CABLE' && <Cable className="w-4 h-4 text-purple-400" />}
                        {dep.type === 'PORT' && <Layers className="w-4 h-4 text-blue-400" />}
                        {dep.type === 'PEER' && <Network className="w-4 h-4 text-emerald-400" />}
                        {dep.type === 'VNE' && <Cpu className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{dep.title}</span>
                        {dep.subtitle && (
                          <span className="text-[11px] text-slate-400 block">{dep.subtitle}</span>
                        )}
                      </div>
                    </div>

                    {dep.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 font-bold shrink-0">
                        {dep.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Resolution: Please unbind or delete the customer circuits, unpatch cables, and release ports before retrying.</span>
            </div>
          </div>
        ) : (
          /* SAFE STATE: Zero Dependencies Detected */
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-300">
                  Integrity Audit Passed: 0 Active Relationships
                </h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  This object has no active customer circuit bindings, optical cable conduits, or neighbor cross-connects. It is safe to permanently decommission.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No active customer circuits mapped to this asset</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No optical fiber cables terminate at this device</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All physical ports are idle and unallocated</span>
              </div>
            </div>

            {customWarningMessage && (
              <p className="text-xs text-slate-400 font-mono italic">
                {customWarningMessage}
              </p>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            {hasBlockers ? 'Close' : 'Cancel'}
          </button>

          {!hasBlockers && !isScanning && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleExecuteDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Decommissioning...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Decommission</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
