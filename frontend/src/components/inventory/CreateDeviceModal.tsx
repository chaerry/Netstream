import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { DeviceType, DeviceTypeOption, Rack } from '../../types/inventory';
import { Server, Save, Loader2, ShieldAlert } from 'lucide-react';

interface CreateDeviceModalProps {
  isOpen?: boolean;
  racks?: Rack[];
  initialUnit?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({
  isOpen = true,
  racks = [],
  initialUnit,
  onClose,
  onSuccess,
}) => {
  const [equipmentCategory, setEquipmentCategory] = useState<'ACTIVE' | 'PASSIVE'>('ACTIVE');
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultRack = racks && racks.length > 0 ? racks[0] : null;

  const [formData, setFormData] = useState({
    locationId: defaultRack?.locationId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    rackId: defaultRack ? defaultRack.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    hostname: '',
    serialNumber: `FOC${Math.floor(10000000 + Math.random() * 90000000)}`,
    assetTag: '',
    deviceType: 'ROUTER' as DeviceType,
    vendor: 'Cisco',
    model: 'ASR-9904',
    hardwareVersion: 'V02',
    firmwareVersion: 'IOS-XR 7.9.2',
    rackUnitStart: initialUnit || 10,
    rackUnitHeight: 2,
    managementIp: '10.240.10.15',
    totalPorts: 32,
    costUsd: 35000,
  });

  // Automatically synchronize rackId & locationId when racks prop updates
  useEffect(() => {
    if (racks && racks.length > 0) {
      setFormData(prev => {
        const found = racks.find(r => r.id === prev.rackId);
        if (found) {
          return { ...prev, locationId: found.locationId || prev.locationId };
        }
        return {
          ...prev,
          rackId: racks[0].id,
          locationId: racks[0].locationId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        };
      });
    }
  }, [racks]);

  const handleCategorySwitch = (cat: 'ACTIVE' | 'PASSIVE') => {
    setEquipmentCategory(cat);
    if (cat === 'PASSIVE') {
      setFormData(prev => ({
        ...prev,
        deviceType: 'ODF',
        vendor: 'CommScope',
        model: 'FL2000 144-Core High-Density ODF',
        hardwareVersion: '4U Chassis',
        firmwareVersion: '',
        managementIp: '',
        totalPorts: 144,
        costUsd: 4500,
        rackUnitHeight: 4
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        deviceType: 'ROUTER',
        vendor: 'Cisco',
        model: 'ASR-9904',
        hardwareVersion: 'V02',
        firmwareVersion: 'IOS-XR 7.9.2',
        managementIp: '10.240.10.15',
        totalPorts: 32,
        costUsd: 35000,
        rackUnitHeight: 2
      }));
    }
  };

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await inventoryApi.getDeviceTypes();
        setDeviceTypes(types);
      } catch (err) {
        console.error('Failed to load device types', err);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (initialUnit) {
      setFormData(prev => ({ ...prev, rackUnitStart: initialUnit }));
    }
  }, [initialUnit]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const effectiveSerial = formData.serialNumber.trim() || `FOC${Math.floor(10000000 + Math.random() * 90000000)}`;
      const matchedRack = racks.find(r => r.id === formData.rackId);
      const effectiveLocationId = matchedRack?.locationId || formData.locationId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      await inventoryApi.createDevice({
        ...formData,
        locationId: effectiveLocationId,
        serialNumber: effectiveSerial,
        managementIp: equipmentCategory === 'PASSIVE' ? undefined : formData.managementIp,
        rackUnitStart: equipmentCategory === 'PASSIVE' && !formData.rackUnitStart ? 0 : Number(formData.rackUnitStart),
        rackUnitHeight: Number(formData.rackUnitHeight),
        totalPorts: Number(formData.totalPorts),
        costUsd: Number(formData.costUsd),
      });
      onSuccess();
    } catch (err: any) {
      console.error('Device creation error:', err);
      const backendMsg = err.response?.data?.message || err.response?.data?.title || (typeof err.response?.data === 'string' ? err.response.data : null);
      setErrorMessage(backendMsg || err.message || 'Failed to register device. Check inputs or console logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={equipmentCategory === 'ACTIVE' ? "Mount Active Electronic Equipment" : "Register Passive Optical Infrastructure"}
      subtitle={equipmentCategory === 'ACTIVE' ? "Register Core Router, Switch, DWDM, or OLT in 42U Rack" : "Register ODF, ODC, ODP, or Splice Closure in ODN Network"}
      icon={<Server className="w-5 h-5 text-cyan-400" />}
      maxWidth="2xl"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Category Toggle Tabs */}
      <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => handleCategorySwitch('ACTIVE')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            equipmentCategory === 'ACTIVE'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>⚡ Active Network Equipment (ANE)</span>
        </button>
        <button
          type="button"
          onClick={() => handleCategorySwitch('PASSIVE')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            equipmentCategory === 'PASSIVE'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🍃 Passive Optical Infrastructure (PNE)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {equipmentCategory === 'ACTIVE' ? 'Device Hostname *' : 'Equipment Code / Designation *'}
            </label>
            <input
              type="text"
              required
              placeholder={equipmentCategory === 'ACTIVE' ? "e.g. ID-CGK-PE-RTR-02" : "e.g. ODC-CGK-CBD-02 or FOSC-CGK-MH05"}
              value={formData.hostname}
              onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-cyan-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Equipment Type *
            </label>
            <select
              value={formData.deviceType}
              onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as DeviceType })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            >
              {deviceTypes
                .filter(t => equipmentCategory === 'PASSIVE' 
                  ? ['ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'DDF', 'PATCH_PANEL'].includes(t.code)
                  : !['ODF', 'ODC', 'ODP', 'CLOSURE', 'SPLITTER_BOX', 'DDF', 'PATCH_PANEL'].includes(t.code))
                .map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.label}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Vendor *
            </label>
            <input
              type="text"
              required
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hardware Model *
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Serial Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. FOC9928102A"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Asset Tag
            </label>
            <input
              type="text"
              placeholder="e.g. AST-CGK-009"
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>

          {equipmentCategory === 'ACTIVE' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Management IP (IPv4) *
              </label>
              <input
                type="text"
                required
                placeholder="10.240.10.x"
                value={formData.managementIp}
                onChange={(e) => setFormData({ ...formData, managementIp: e.target.value })}
                className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-cyan-300"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Optical Power / Power Feed
              </label>
              <input
                type="text"
                disabled
                value="Non-Powered (Passive Optical Pass-Through)"
                className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-emerald-400 bg-emerald-950/20 border-emerald-500/30 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {equipmentCategory === 'ACTIVE' ? 'Total Port Count' : 'Total Fiber Cores / Port Capacity *'}
            </label>
            <input
              type="number"
              min={1}
              max={1024}
              required
              value={formData.totalPorts}
              onChange={(e) => setFormData({ ...formData, totalPorts: parseInt(e.target.value) || 0 })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {equipmentCategory === 'ACTIVE' ? 'Target 42U Starting Unit (U1 - U42) *' : 'Rack Starting Unit (0 if Outdoor/Manhole)'}
            </label>
            <input
              type="number"
              min={0}
              max={42}
              required
              value={formData.rackUnitStart}
              onChange={(e) => setFormData({ ...formData, rackUnitStart: parseInt(e.target.value) || 0 })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-bold text-cyan-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chassis / Enclosure Height (Units)
            </label>
            <input
              type="number"
              min={0}
              max={16}
              value={formData.rackUnitHeight}
              onChange={(e) => setFormData({ ...formData, rackUnitHeight: parseInt(e.target.value) || 0 })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Rack (or Outdoor Hub)
            </label>
            <select
              value={formData.rackId}
              onChange={(e) => {
                const targetRackId = e.target.value;
                const matchedRack = racks.find((r) => r.id === targetRackId);
                setFormData((prev) => ({
                  ...prev,
                  rackId: targetRackId,
                  locationId: matchedRack?.locationId || prev.locationId,
                }));
              }}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-cyan-300"
            >
              {racks.length > 0 ? (
                racks.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.rackNumber} (42U Standard)
                  </option>
                ))
              ) : (
                <option value="b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01">RACK-A01 (42U Standard)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Equipment Asset CAPEX (USD)
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
            className={`flex items-center gap-1.5 px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-60 ${
              equipmentCategory === 'PASSIVE'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{equipmentCategory === 'PASSIVE' ? 'Register Passive Infrastructure' : 'Mount to Rack'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
