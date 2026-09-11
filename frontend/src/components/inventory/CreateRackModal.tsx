import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { LocationNode } from '../../types/inventory';
import { Server, Save, Loader2, Link2 } from 'lucide-react';

interface CreateRackModalProps {
  isOpen: boolean;
  preselectedLocation?: LocationNode | null;
  allLocations?: LocationNode[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRackModal: React.FC<CreateRackModalProps> = ({
  isOpen,
  preselectedLocation,
  allLocations = [],
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    locationId: preselectedLocation?.id || '',
    rackNumber: '',
    heightUnits: 42,
    maxPowerWatt: 6000,
    maxWeightKg: 1000,
  });

  const [flattenedLocations, setFlattenedLocations] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Flatten location hierarchy tree into selectable options
  React.useEffect(() => {
    const flat: { id: string; label: string }[] = [];
    const traverse = (nodes: LocationNode[], prefix = '') => {
      nodes.forEach((n) => {
        const label = prefix ? `${prefix} ➔ ${n.name} (${n.code})` : `${n.name} (${n.code})`;
        flat.push({ id: n.id, label });
        if (n.children && n.children.length > 0) {
          traverse(n.children, `${prefix ? prefix + ' ➔ ' : ''}${n.name}`);
        }
      });
    };

    if (allLocations.length > 0) {
      traverse(allLocations);
      setFlattenedLocations(flat);
    } else {
      inventoryApi.getLocationTree().then((nodes) => {
        traverse(nodes);
        setFlattenedLocations(flat);
      }).catch(console.error);
    }
  }, [allLocations]);

  React.useEffect(() => {
    if (preselectedLocation) {
      setFormData((prev) => ({
        ...prev,
        locationId: preselectedLocation.id,
        rackNumber: prev.rackNumber || `RACK-${preselectedLocation.code.replace('ID-', '')}-01`,
      }));
    } else if (flattenedLocations.length > 0 && !formData.locationId) {
      setFormData((prev) => ({ ...prev, locationId: flattenedLocations[0].id }));
    }
  }, [preselectedLocation, flattenedLocations]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rackNumber.trim() || !formData.locationId) {
      setError('Please select a target location and enter a rack number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await inventoryApi.createRack({
        locationId: formData.locationId,
        rackNumber: formData.rackNumber.trim().toUpperCase(),
        heightUnits: formData.heightUnits,
        maxPowerWatt: formData.maxPowerWatt,
        maxWeightKg: formData.maxWeightKg,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to create rack:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create server rack.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commission & Bind Server Rack"
      subtitle="Provision a 42U equipment rack and bind it to a Digital Twin facility location"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Location Binding */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bind to Facility Location (Room / Building / Site) *</span>
            </label>
            <select
              required
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-cyan-300"
            >
              <option value="">-- Select Target Location --</option>
              {flattenedLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rack Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Rack Identifier / Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RACK-BDG-03 or RACK-A05"
              value={formData.rackNumber}
              onChange={(e) => setFormData({ ...formData, rackNumber: e.target.value.toUpperCase() })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono uppercase text-white font-bold"
            />
          </div>

          {/* Rack Height Units */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Total Height Capacity (Units / U) *
            </label>
            <select
              value={formData.heightUnits}
              onChange={(e) => setFormData({ ...formData, heightUnits: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-amber-400 font-bold"
            >
              <option value={42}>42U (Standard Telecom Rack)</option>
              <option value={45}>45U (Extended Data Center Rack)</option>
              <option value={48}>48U (High-Density Chassis Rack)</option>
              <option value={24}>24U (Half-Height Distribution Bay)</option>
              <option value={12}>12U (Wall-Mount Compact Cabinet)</option>
            </select>
          </div>

          {/* Max Power Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Max Power Load Capacity (Watts)
            </label>
            <input
              type="number"
              min={1000}
              max={50000}
              step={500}
              value={formData.maxPowerWatt}
              onChange={(e) => setFormData({ ...formData, maxPowerWatt: Number(e.target.value) || 6000 })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          {/* Max Weight Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Max Weight Load Capacity (Kilograms)
            </label>
            <input
              type="number"
              min={100}
              max={3000}
              step={50}
              value={formData.maxWeightKg}
              onChange={(e) => setFormData({ ...formData, maxWeightKg: Number(e.target.value) || 1000 })}
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
                <span>Commissioning Rack...</span>
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5" />
                <span>Commission & Bind Rack</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
