import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { Cpu, Save, ShieldAlert } from 'lucide-react';

interface CreateVneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateVneModal: React.FC<CreateVneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    vneName: '',
    vnfType: 'vRouter-CSR1000v',
    vlanId: 2120,
    vrfName: 'VRF_FINANCIAL_CORE',
    allocatedVcpu: 8,
    allocatedRamGb: 16,
    allocatedDiskGb: 100,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await inventoryApi.createVne(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to deploy VNE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Virtual Network Element (VNE)"
      subtitle="Logical & Virtual Inventory — NFV / VNF Deployment"
      icon={<Cpu className="w-5 h-5 text-purple-400" />}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            VNE Instance Name *
          </label>
          <input
            required
            type="text"
            placeholder="e.g. vRouter-Branch-Bandung"
            value={formData.vneName}
            onChange={(e) => setFormData({ ...formData, vneName: e.target.value })}
            className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              VNF / Logical Circuit Flavor
            </label>
            <select
              value={formData.vnfType}
              onChange={(e) => setFormData({ ...formData, vnfType: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            >
              <option value="EoMPLS_PW_L2CIRCUIT">MPLS Pseudowire / L2Circuit (VCID)</option>
              <option value="EVPN_VPWS">EVPN-VPWS Virtual Private Wire</option>
              <option value="vRouter-CSR1000v">Cisco vRouter (CSR1000v)</option>
              <option value="vFortiGate-VM">Fortinet vFirewall (vFortiGate)</option>
              <option value="vBNG-Cisco-c8000v">Cisco vBNG (c8000v)</option>
              <option value="vEPC-Nokia">Nokia vEPC Core Node</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assigned VLAN ID
            </label>
            <input
              type="number"
              min={1}
              max={4094}
              value={formData.vlanId}
              onChange={(e) => setFormData({ ...formData, vlanId: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            VRF Routing Domain / VCID Identifier *
          </label>
          <input
            type="text"
            placeholder="e.g. VCID: 250025 or VRF_FINANCIAL_CORE"
            value={formData.vrfName}
            onChange={(e) => setFormData({ ...formData, vrfName: e.target.value })}
            className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
          />
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              vCPUs
            </label>
            <input
              type="number"
              min={1}
              max={64}
              value={formData.allocatedVcpu}
              onChange={(e) => setFormData({ ...formData, allocatedVcpu: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              RAM (GB)
            </label>
            <input
              type="number"
              min={2}
              max={256}
              value={formData.allocatedRamGb}
              onChange={(e) => setFormData({ ...formData, allocatedRamGb: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Storage (GB)
            </label>
            <input
              type="number"
              min={20}
              max={2000}
              value={formData.allocatedDiskGb}
              onChange={(e) => setFormData({ ...formData, allocatedDiskGb: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Deploying...' : 'Deploy VNE'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
