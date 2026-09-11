import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { NetworkDevice, OperationalStatus, Rack } from '../../types/inventory';
import { useDialog } from '../common/DialogContext';
import { Server, Save, Loader2, Sliders } from 'lucide-react';

interface EditDeviceModalProps {
  device: NetworkDevice | null;
  racks?: Rack[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  device,
  racks = [],
  onClose,
  onSuccess,
}) => {
  const { confirmSave } = useDialog();
  const [formData, setFormData] = useState({
    rackId: '',
    rackUnitStart: 1,
    rackUnitHeight: 1,
    managementIp: '',
    status: 'ACTIVE' as OperationalStatus,
    assetTag: '',
    firmwareVersion: '',
    hardwareVersion: '',
    costUsd: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (device) {
      setFormData({
        rackId: device.rackId || (racks.length > 0 ? racks[0].id : ''),
        rackUnitStart: device.rackUnitStart || 1,
        rackUnitHeight: device.rackUnitHeight || 1,
        managementIp: device.managementIp || '',
        status: device.status || 'ACTIVE',
        assetTag: device.assetTag || '',
        firmwareVersion: device.firmwareVersion || '',
        hardwareVersion: device.hardwareVersion || '',
        costUsd: device.costUsd || 0,
      });
      setError(null);
    }
  }, [device, racks]);

  if (!device) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed = await confirmSave({
      title: 'Commit Device Configuration',
      subtitle: 'Production Hardware Modification Verification',
      protocolCode: 'SYS_COMMIT // HARDWARE_SPEC_V1',
      itemBadge: device.deviceType,
      itemCode: device.hostname,
      itemName: `${device.vendor || ''} ${device.model || ''}`,
      impactMessage: `Applying updates: IP [${formData.managementIp || 'None'}], Status [${formData.status}], Firmware [${formData.firmwareVersion || 'Unspecified'}], Height [${formData.rackUnitHeight}U at U${formData.rackUnitStart}].`,
      confirmText: 'Commit Changes'
    });

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      await inventoryApi.updateDevice(device.id, {
        rackId: formData.rackId || undefined,
        rackUnitStart: formData.rackUnitStart,
        rackUnitHeight: formData.rackUnitHeight,
        managementIp: formData.managementIp.trim() || undefined,
        status: formData.status,
        assetTag: formData.assetTag.trim() || undefined,
        firmwareVersion: formData.firmwareVersion.trim() || undefined,
        hardwareVersion: formData.hardwareVersion.trim() || undefined,
        costUsd: formData.costUsd,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Failed to update device:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update equipment configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!device}
      onClose={onClose}
      title={`Modify Device Configuration: ${device.hostname}`}
      subtitle={`${device.vendor} ${device.model} • SN: ${device.serialNumber} • Type: ${device.deviceType}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Management IP */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Management IP Address
            </label>
            <input
              type="text"
              placeholder="e.g. 10.240.10.15"
              value={formData.managementIp}
              onChange={(e) => setFormData({ ...formData, managementIp: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-cyan-300"
            />
          </div>

          {/* Operational Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Operational Lifecycle Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OperationalStatus })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-semibold text-emerald-400"
            >
              <option value="ACTIVE">ACTIVE (In Service)</option>
              <option value="PLANNED">PLANNED (Staging / Provisioning)</option>
              <option value="MAINTENANCE">MAINTENANCE (NOC Window)</option>
              <option value="FAULTY">FAULTY (Alarm / Defective)</option>
              <option value="DECOMMISSIONED">DECOMMISSIONED (Retired)</option>
            </select>
          </div>

          {/* Target Rack */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assigned Equipment Rack
            </label>
            <select
              value={formData.rackId}
              onChange={(e) => setFormData({ ...formData, rackId: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-cyan-300"
            >
              {racks.length > 0 ? (
                racks.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.rackNumber} ({r.heightUnits || 42}U)
                  </option>
                ))
              ) : (
                <option value={device.rackId || ''}>{device.rackNumber || 'RACK-A01'}</option>
              )}
            </select>
          </div>

          {/* Asset Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Asset Tracking Tag
            </label>
            <input
              type="text"
              placeholder="e.g. AST-CGK-088"
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          {/* 42U Starting Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              42U Starting Unit (U1 - U42) *
            </label>
            <input
              type="number"
              min={1}
              max={42}
              required
              value={formData.rackUnitStart}
              onChange={(e) => setFormData({ ...formData, rackUnitStart: parseInt(e.target.value) || 1 })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-bold text-amber-400 font-mono"
            />
          </div>

          {/* Rack Unit Height */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chassis Height (Units / U) *
            </label>
            <input
              type="number"
              min={1}
              max={16}
              required
              value={formData.rackUnitHeight}
              onChange={(e) => setFormData({ ...formData, rackUnitHeight: parseInt(e.target.value) || 1 })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          {/* Firmware Version */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Firmware / OS Version
            </label>
            <input
              type="text"
              placeholder="e.g. IOS-XR 7.9.2"
              value={formData.firmwareVersion}
              onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          {/* CAPEX Cost */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hardware Asset CAPEX (USD)
            </label>
            <input
              type="number"
              min={0}
              value={formData.costUsd}
              onChange={(e) => setFormData({ ...formData, costUsd: parseFloat(e.target.value) || 0 })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="pt-5 border-t border-slate-800 flex justify-end gap-3">
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
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating in DB...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
