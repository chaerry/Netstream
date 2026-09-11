import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RegionalCorridor, DEFAULT_REGIONAL_CORRIDORS } from '../../types/gis';
import {
  Globe,
  Plus,
  Trash2,
  Edit2,
  Compass,
  CheckCircle2,
  RotateCcw,
  Camera,
  MapPin,
  Search,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ManageCorridorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  corridors: RegionalCorridor[];
  onSaveCorridors: (corridors: RegionalCorridor[]) => void;
  currentMapCenter?: [number, number];
  currentMapZoom?: number;
  onSelectCorridor?: (corridor: RegionalCorridor) => void;
}

export const ManageCorridorsModal: React.FC<ManageCorridorsModalProps> = ({
  isOpen,
  onClose,
  corridors,
  onSaveCorridors,
  currentMapCenter,
  currentMapZoom,
  onSelectCorridor
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [centerLat, setCenterLat] = useState<number>(0);
  const [centerLon, setCenterLon] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(10);
  const [badge, setBadge] = useState('Metro Corridor');
  const [description, setDescription] = useState('');

  // Extract unique countries
  const countries = Array.from(new Set(corridors.map(c => c.country))).filter(Boolean);

  const resetForm = () => {
    setName('');
    setCountry('');
    setCountryCode('');
    setCenterLat(currentMapCenter ? Number(currentMapCenter[0].toFixed(4)) : 0);
    setCenterLon(currentMapCenter ? Number(currentMapCenter[1].toFixed(4)) : 0);
    setZoom(currentMapZoom || 10);
    setBadge('Metro Corridor');
    setDescription('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleCaptureCurrentView = () => {
    if (currentMapCenter) {
      setCenterLat(Number(currentMapCenter[0].toFixed(4)));
      setCenterLon(Number(currentMapCenter[1].toFixed(4)));
    }
    if (currentMapZoom) {
      setZoom(currentMapZoom);
    }
  };

  const handleStartEdit = (c: RegionalCorridor) => {
    setEditingId(c.id);
    setName(c.name);
    setCountry(c.country);
    setCountryCode(c.countryCode);
    setCenterLat(c.center[0]);
    setCenterLon(c.center[1]);
    setZoom(c.zoom);
    setBadge(c.badge || 'Custom');
    setDescription(c.description || '');
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    const updated = corridors.filter(c => c.id !== id);
    onSaveCorridors(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all regional corridors to default international presets? Any custom corridors will be cleared.')) {
      onSaveCorridors(DEFAULT_REGIONAL_CORRIDORS);
      resetForm();
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country.trim()) return;

    const newCorridor: RegionalCorridor = {
      id: editingId || `custom-${Date.now()}`,
      name: name.trim(),
      country: country.trim(),
      countryCode: countryCode.trim().toUpperCase() || 'GLOBAL',
      center: [Number(centerLat), Number(centerLon)],
      zoom: Number(zoom) || 10,
      badge: badge.trim() || 'Custom',
      description: description.trim(),
      isCustom: true
    };

    let updated: RegionalCorridor[];
    if (editingId) {
      updated = corridors.map(c => (c.id === editingId ? newCorridor : c));
    } else {
      updated = [newCorridor, ...corridors];
    }

    onSaveCorridors(updated);
    resetForm();
  };

  const filteredCorridors = corridors.filter(c => {
    const matchCountry = selectedCountry === 'ALL' || c.country === selectedCountry;
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.badge && c.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCountry && matchSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Regional Corridors & Viewports"
      subtitle="Configure, add, or customize international telecom network corridors and camera presets"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Top Controls: Search, Country Filter, and Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search corridors, countries, or tiers..."
                className="w-full glass-input pl-8 pr-3 py-1.5 bg-slate-950 border-slate-800 rounded-lg text-xs text-slate-200"
              />
            </div>

            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="glass-input px-3 py-1.5 bg-slate-950 border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <option value="ALL">All Countries ({corridors.length})</option>
              {countries.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-all"
              title="Reset to default international presets"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Corridor</span>
            </button>
          </div>
        </div>

        {/* Add / Edit Form Drawer */}
        {isAdding && (
          <form
            onSubmit={handleSubmitForm}
            className="p-4 bg-slate-900/95 border border-cyan-500/30 rounded-xl space-y-3.5 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{editingId ? 'Edit Regional Corridor' : 'Define New Regional Corridor'}</span>
              </span>

              {currentMapCenter && (
                <button
                  type="button"
                  onClick={handleCaptureCurrentView}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 rounded-lg text-[11px] font-mono hover:bg-cyan-900/60"
                  title="Auto-fill center and zoom from active Leaflet camera"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture Current Map View</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Corridor / Region Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Trans-Sumatera Backbone"
                  className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Country Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="e.g. Indonesia, USA, Singapore..."
                  className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Country Code (ISO)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  placeholder="e.g. ID, US, SG"
                  className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100 font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Center Latitude <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={centerLat}
                  onChange={e => setCenterLat(Number(e.target.value))}
                  placeholder="-6.2088"
                  className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Center Longitude <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={centerLon}
                  onChange={e => setCenterLon(Number(e.target.value))}
                  placeholder="106.8456"
                  className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Camera Zoom (4 - 18)
                </label>
                <input
                  type="number"
                  min="3"
                  max="19"
                  required
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Tier / Badge Tag
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  placeholder="e.g. National Trunk, Subsea"
                  className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Description / Route Coverage
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of fiber routes and key landing hubs"
                className="w-full glass-input px-3 py-1.5 bg-slate-950 border-slate-700 rounded-lg text-xs text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs shadow-md shadow-cyan-900/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{editingId ? 'Update Corridor' : 'Save Corridor'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Corridors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {filteredCorridors.map(corridor => (
            <div
              key={corridor.id}
              className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl transition-all flex flex-col justify-between gap-2 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                      {corridor.countryCode}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {corridor.name}
                    </h4>
                  </div>

                  {corridor.badge && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                      {corridor.badge}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {corridor.description || `${corridor.country} fiber corridor`}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                <span>
                  GPS: {corridor.center[0]}, {corridor.center[1]} (z:{corridor.zoom})
                </span>

                <div className="flex items-center gap-1.5">
                  {onSelectCorridor && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCorridor(corridor);
                        onClose();
                      }}
                      className="px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded text-[10px] font-bold border border-cyan-500/30"
                    >
                      Jump to Map
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleStartEdit(corridor)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(corridor.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
