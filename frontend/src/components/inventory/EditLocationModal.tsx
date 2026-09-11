import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { LocationNode, LocationType, LocationStatus } from '../../types/inventory';
import { Building2, Save, Loader2, Link2, Activity, Info } from 'lucide-react';

interface EditLocationModalProps {
  location: LocationNode | null;
  allLocations?: LocationNode[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EditLocationModal: React.FC<EditLocationModalProps> = ({
  location,
  allLocations = [],
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    parentId: location?.parentId || '',
    code: location?.code || '',
    name: location?.name || '',
    type: (location?.type || 'ROOM') as LocationType,
    status: (location?.status || 'ACTIVE') as LocationStatus,
    address: location?.address || '',
    contactPerson: location?.contactPerson || '',
    contactPhone: location?.contactPhone || '',
    latitude: location?.latitude?.toString() || '',
    longitude: location?.longitude?.toString() || '',
  });

  const [flattenedParents, setFlattenedParents] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      setFormData({
        parentId: location.parentId || '',
        code: location.code || '',
        name: location.name || '',
        type: location.type || 'ROOM',
        status: location.status || 'ACTIVE',
        address: location.address || '',
        contactPerson: location.contactPerson || '',
        contactPhone: location.contactPhone || '',
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
      });
    }
  }, [location]);

  // Flatten parent candidates, excluding current node and its subtree to prevent cycles
  useEffect(() => {
    const flat: { id: string; label: string }[] = [];
    const traverse = (nodes: LocationNode[], prefix = '') => {
      nodes.forEach((n) => {
        if (location && n.id === location.id) return; // skip self
        const label = prefix ? `${prefix} ➔ ${n.name} (${n.code})` : `${n.name} (${n.code})`;
        flat.push({ id: n.id, label });
        if (n.children && n.children.length > 0) {
          traverse(n.children, `${prefix ? prefix + ' ➔ ' : ''}${n.name}`);
        }
      });
    };

    if (allLocations.length > 0) {
      traverse(allLocations);
      setFlattenedParents(flat);
    }
  }, [allLocations, location]);

  if (!location) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await inventoryApi.updateLocation(location.id, {
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
      console.error('Failed to update location:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update location node.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!location}
      onClose={onClose}
      title={`Modify Location: ${location.name}`}
      subtitle={`Configure facility attributes, operational lifecycle status, and parent hierarchy (${location.code})`}
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
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono uppercase text-cyan-300 font-bold"
            />
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Facility / Location Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl text-white font-bold"
            />
          </div>

          {/* Operational Status with Recommendations */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operational Lifecycle Status *</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LocationStatus })}
              className={`glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono font-bold ${formData.status === 'ACTIVE' ? 'text-emerald-400' :
                  formData.status === 'PLANNED' ? 'text-blue-400' :
                    formData.status === 'UNDER_CONSTRUCTION' ? 'text-amber-400' :
                      formData.status === 'MAINTENANCE' ? 'text-purple-400' : 'text-rose-400'
                }`}
            >
              <option value="ACTIVE">ACTIVE (Fully Live & Operational)</option>
              <option value="PLANNED">PLANNED (Future PoP / Feasibility Study)</option>
              <option value="UNDER_CONSTRUCTION">UNDER_CONSTRUCTION (Civil & Staging)</option>
              <option value="MAINTENANCE">MAINTENANCE (Maintenance / Power Upgrade)</option>
              <option value="INACTIVE">INACTIVE (Decommissioned / Off-line)</option>
            </select>
          </div>

          {/* Node Type */}
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

          {/* Parent Location Binding */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Parent Location Binding (Hierarchy Placement)</span>
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono text-slate-200"
            >
              <option value="">-- [Root Node / Top-Level Site] --</option>
              {flattenedParents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Facility / NOC Manager */}
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

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Emergency Contact Phone
            </label>
            <input
              type="text"
              placeholder="e.g. +62812345670"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          {/* Street Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Physical Street Address
            </label>
            <input
              type="text"
              placeholder="e.g. Jl. Asia Afrika No. 65, Bandung, Floor 2"
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

        {/* Status Lifecycle Guide Note */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Telecom Location Lifecycle Status Guide:</span>
            <p>
              <strong className="text-emerald-400">ACTIVE:</strong> Live facility hosting active racks & equipment routing traffic.
            </p>
            <p>
              <strong className="text-blue-400">PLANNED:</strong> Site in pipeline/planning stage; equipment cannot be routed until commissioned.
            </p>
            <p>
              <strong className="text-amber-400">UNDER_CONSTRUCTION:</strong> Civil engineering, HVAC, generator, or rack installation in progress.
            </p>
            <p>
              <strong className="text-purple-400">MAINTENANCE:</strong> Under scheduled facility maintenance or power upgrade.
            </p>
            <p>
              <strong className="text-rose-400">INACTIVE:</strong> Decommissioned facility; decommissioned racks are archived.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
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
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold rounded-xl hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/30 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
