import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { LocationNode, LocationType } from '../../types/inventory';
import { Building2, Plus, Loader2 } from 'lucide-react';

interface CreateLocationModalProps {
  isOpen: boolean;
  parentNode?: LocationNode | null;
  allLocations?: LocationNode[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateLocationModal: React.FC<CreateLocationModalProps> = ({
  isOpen,
  parentNode,
  allLocations = [],
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    parentId: parentNode?.id || '',
    code: '',
    name: '',
    type: 'ROOM' as LocationType,
    status: 'ACTIVE' as any,
    address: '',
    contactPerson: '',
    contactPhone: '',
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (parentNode) {
      setFormData(prev => ({
        ...prev,
        parentId: parentNode.id,
        type: parentNode.type === 'SITE' ? 'BUILDING' : parentNode.type === 'BUILDING' ? 'ROOM' : 'ROOM',
        status: 'ACTIVE',
      }));
    }
  }, [parentNode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await inventoryApi.createLocation({
        parentId: formData.parentId || null,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        type: formData.type,
        status: formData.status,
        address: formData.address.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to create location:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create location node.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Digital Twin Location Node"
      subtitle={parentNode ? `Adding child location under "${parentNode.name}" (${parentNode.code})` : 'Create top-level site or facility'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Location Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ID-BDG-R02"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono uppercase text-cyan-300"
            />
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Location / Facility Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bandung Core Server Room 102"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>

          {/* Hierarchy Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Digital Twin Node Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-cyan-300"
            >
              <option value="SITE">SITE (PoP / Telehouse Facility)</option>
              <option value="BUILDING">BUILDING (Data Center Block)</option>
              <option value="FLOOR">FLOOR (Level / Floor Zone)</option>
              <option value="ROOM">ROOM (Server Room / Meet-Me Room)</option>
              <option value="CITY">CITY (Metropolitan Area)</option>
              <option value="REGION">REGION (State / Province)</option>
              <option value="COUNTRY">COUNTRY (National Boundary)</option>
            </select>
          </div>

          {/* Operational Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Facility Operational Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className={`glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono font-bold ${
                formData.status === 'ACTIVE' ? 'text-emerald-400' :
                formData.status === 'PLANNED' ? 'text-blue-400' :
                formData.status === 'UNDER_CONSTRUCTION' ? 'text-amber-400' :
                formData.status === 'MAINTENANCE' ? 'text-purple-400' : 'text-rose-400'
              }`}
            >
              <option value="ACTIVE">ACTIVE (Operational & Live)</option>
              <option value="PLANNED">PLANNED (Under Design / Feasibility)</option>
              <option value="UNDER_CONSTRUCTION">UNDER_CONSTRUCTION (Fit-out & Staging)</option>
              <option value="MAINTENANCE">MAINTENANCE (Maintenance / Upgrade)</option>
              <option value="INACTIVE">INACTIVE (Decommissioned / Off-line)</option>
            </select>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Facility / NOC Manager
            </label>
            <input
              type="text"
              placeholder="e.g. Hendra Wijaya"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>

          {/* Physical Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Street / Physical Address
            </label>
            <input
              type="text"
              placeholder="e.g. Jl. Asia Afrika No. 65, Bandung, Floor 3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Latitude Coordinates
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. -6.9175"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Longitude Coordinates
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 107.6191"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
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
                <span>Creating Location...</span>
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span>Create Location Node</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
