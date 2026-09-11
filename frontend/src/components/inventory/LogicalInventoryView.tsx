import React, { useState, useEffect } from 'react';
import { VirtualNetworkElement } from '../../types/inventory';
import { inventoryApi } from '../../api/inventoryApi';
import { useAuth } from '../../auth/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import { CreateVneModal } from './CreateVneModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Cpu, HardDrive, Plus, Trash2, Layers, Network, ShieldCheck, Activity } from 'lucide-react';

export const LogicalInventoryView: React.FC = () => {
  const { hasRole, hasAnyRole } = useAuth();
  const [vnes, setVnes] = useState<VirtualNetworkElement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [deletingVne, setDeletingVne] = useState<VirtualNetworkElement | null>(null);

  const fetchVnes = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getVnes();
      setVnes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVnes();
  }, []);

  const totalVcpu = vnes.reduce((sum, v) => sum + v.allocatedVcpu, 0);
  const totalRam = vnes.reduce((sum, v) => sum + v.allocatedRamGb, 0);
  const totalDisk = vnes.reduce((sum, v) => sum + v.allocatedDiskGb, 0);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Virtual Network Elements (VNE)"
          value={vnes.length}
          subtitle="vRouters, vFirewalls, vEPC NFVs"
          icon={<Cpu className="w-5 h-5" />}
          accentColor="purple"
          trend={{ value: `${totalVcpu} Cores Active`, isPositive: true }}
        />
        <StatCard
          title="Allocated Virtual RAM"
          value={`${totalRam} GB`}
          subtitle="Hypervisor Memory Pool"
          icon={<Activity className="w-5 h-5" />}
          accentColor="cyan"
        />
        <StatCard
          title="Storage Allocated"
          value={`${totalDisk} GB`}
          subtitle="NVMe High-Speed Virtual Disks"
          icon={<HardDrive className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* Header & Add Button */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Virtual Network Function (VNF) Instances & VLAN Map</span>
          </h3>
          <p className="text-xs text-slate-400">Logical & Virtual Layer Inventory Topology</p>
        </div>

        {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold rounded-xl hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Deploy VNE
          </button>
        )}
      </div>

      {/* VNE Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vnes.map((vne) => (
          <div
            key={vne.id}
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {vne.vnfType}
                </span>
                <h4 className="text-sm font-bold text-white mt-2 tracking-wide font-sans">{vne.vneName}</h4>
              </div>
              <StatusBadge status={vne.status} />
            </div>

            {/* Resource allocation metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-center font-mono text-xs">
              <div>
                <p className="text-[10px] text-slate-500 font-sans uppercase">vCPU</p>
                <p className="font-bold text-cyan-400">{vne.allocatedVcpu} Cores</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-sans uppercase">RAM</p>
                <p className="font-bold text-purple-400">{vne.allocatedRamGb} GB</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-sans uppercase">Disk</p>
                <p className="font-bold text-emerald-400">{vne.allocatedDiskGb} GB</p>
              </div>
            </div>

            {/* Logical Network Metadata */}
            <div className="text-xs text-slate-400 font-mono space-y-1 pt-1 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">VLAN ID:</span>
                <span className="text-amber-400 font-bold">{vne.vlanId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VRF Domain:</span>
                <span className="text-cyan-300 font-semibold">{vne.vrfName || 'DEFAULT_VRF'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hypervisor Host:</span>
                <span className="text-slate-300">{vne.hypervisorHostname || 'ID-CGK-CORE-SW-01'}</span>
              </div>
            </div>

            {/* Actions */}
            {hasRole('inventory-admin') && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setDeletingVne(vne)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Terminate Instance</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <CreateVneModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchVnes}
      />

      {deletingVne && (
        <ConfirmDeleteModal
          isOpen={!!deletingVne}
          itemType="VNE"
          itemId={deletingVne.id}
          itemCode={deletingVne.vneName}
          itemName={`VNE Type: ${deletingVne.vnfType} (${deletingVne.allocatedVcpu} vCPU, ${deletingVne.allocatedRamGb} GB RAM)`}
          onClose={() => setDeletingVne(null)}
          onConfirm={async () => {
            await inventoryApi.deleteVne(deletingVne.id);
            setDeletingVne(null);
            fetchVnes();
          }}
        />
      )}
    </div>
  );
};
