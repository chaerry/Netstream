import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { CableType, FiberGrade, LocationNode, NetworkDevice, OpticalCable } from '../../types/inventory';
import {
  Cable,
  Loader2,
  ShieldAlert,
  MapPin,
  Gauge,
  Route,
  Activity,
  CheckCircle2,
  Compass,
  FileCode
} from 'lucide-react';

interface EditCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  cable: OpticalCable | null;
  onSuccess: (updatedCable: OpticalCable) => void;
}

export const EditCableModal: React.FC<EditCableModalProps> = ({
  isOpen,
  onClose,
  cable,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'geometry'>('general');
  const [cableName, setCableName] = useState('');
  const [cableType, setCableType] = useState<CableType>('FEEDER_CABLE');
  const [fiberGrade, setFiberGrade] = useState<FiberGrade>('SINGLE_MODE_G652D');
  const [status, setStatus] = useState<string>('ACTIVE');
  const [lengthMeters, setLengthMeters] = useState<number>(0);
  const [installationType, setInstallationType] = useState<string>('UNDERGROUND_DUCT');
  const [sheathType, setSheathType] = useState<string>('ARMORED_HDPE');
  const [attenuationDbPerKm, setAttenuationDbPerKm] = useState<number>(0.350);

  // Endpoints
  const [originLocationId, setOriginLocationId] = useState<string>('');
  const [originDeviceId, setOriginDeviceId] = useState<string>('');
  const [terminationLocationId, setTerminationLocationId] = useState<string>('');
  const [terminationDeviceId, setTerminationDeviceId] = useState<string>('');

  // Geometry (GeoJSON or WKT)
  const [geometryMode, setGeometryMode] = useState<'geojson' | 'wkt'>('geojson');
  const [coordsText, setCoordsText] = useState<string>('');
  const [wktText, setWktText] = useState<string>('');
  const [autoCalcLength, setAutoCalcLength] = useState<boolean>(true);

  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load locations and devices
  useEffect(() => {
    if (isOpen && cable) {
      setLoadingData(true);
      setError(null);
      setActiveTab('general');

      // Populate current cable attributes
      setCableName(cable.cableName || '');
      setCableType(cable.cableType || 'FEEDER_CABLE');
      setFiberGrade(cable.fiberGrade || 'SINGLE_MODE_G652D');
      setStatus(cable.status || 'ACTIVE');
      setLengthMeters(cable.lengthMeters || 0);
      setInstallationType(cable.installationType || 'UNDERGROUND_DUCT');
      setSheathType(cable.sheathType || 'ARMORED_HDPE');
      setAttenuationDbPerKm(cable.attenuationDbPerKm || 0.350);
      setOriginLocationId(cable.originLocationId || '');
      setOriginDeviceId(cable.originDeviceId || '');
      setTerminationLocationId(cable.terminationLocationId || '');
      setTerminationDeviceId(cable.terminationDeviceId || '');

      // Parse current geometry if present
      if (cable.routeGeomGeoJson) {
        try {
          const parsed = JSON.parse(cable.routeGeomGeoJson);
          if (parsed.coordinates) {
            setCoordsText(JSON.stringify(parsed.coordinates, null, 2));
            const wktPts = parsed.coordinates.map((pt: [number, number]) => `${pt[0]} ${pt[1]}`).join(', ');
            setWktText(`LINESTRING(${wktPts})`);
          }
        } catch {
          setCoordsText('');
          setWktText('');
        }
      } else {
        setCoordsText('');
        setWktText('');
      }

      Promise.all([
        inventoryApi.getLocationTree(),
        inventoryApi.getDevices({ size: 100 })
      ]).then(([locs, devsRes]) => {
        setLocations(locs);
        const devs = Array.isArray(devsRes) ? devsRes : (devsRes.items || []);
        setDevices(devs);

        // Auto-infer location from device if locationId was not explicitly set on cable
        if (!cable.originLocationId && cable.originDeviceId) {
          const od = devs.find(d => d.id === cable.originDeviceId);
          if (od?.locationId) {
            setOriginLocationId(od.locationId);
          }
        }
        if (!cable.terminationLocationId && cable.terminationDeviceId) {
          const td = devs.find(d => d.id === cable.terminationDeviceId);
          if (td?.locationId) {
            setTerminationLocationId(td.locationId);
          }
        }

        setLoadingData(false);
      }).catch(err => {
        console.error('Failed to load locations/devices:', err);
        setLoadingData(false);
      });
    }
  }, [isOpen, cable]);

  const handleOriginDeviceSelect = (devId: string) => {
    setOriginDeviceId(devId);
    if (devId) {
      const dev = devices.find(d => d.id === devId);
      if (dev?.locationId) {
        setOriginLocationId(dev.locationId);
      }
    }
  };

  const handleTerminationDeviceSelect = (devId: string) => {
    setTerminationDeviceId(devId);
    if (devId) {
      const dev = devices.find(d => d.id === devId);
      if (dev?.locationId) {
        setTerminationLocationId(dev.locationId);
      }
    }
  };

  if (!cable) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cableName.trim()) {
      setError('Please provide a valid cable name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let routeGeomGeoJson: string | undefined = undefined;
      let routeGeomWkt: string | undefined = undefined;

      if (geometryMode === 'geojson' && coordsText.trim()) {
        try {
          const parsedCoords = JSON.parse(coordsText.trim());
          if (!Array.isArray(parsedCoords) || parsedCoords.length < 2) {
            throw new Error('A LineString requires at least 2 coordinate pairs [[lon, lat], [lon, lat]].');
          }
          routeGeomGeoJson = JSON.stringify({
            type: 'LineString',
            coordinates: parsedCoords
          });
        } catch (err: any) {
          setError('Invalid GeoJSON coordinates syntax: ' + err.message);
          setIsSubmitting(false);
          return;
        }
      } else if (geometryMode === 'wkt' && wktText.trim()) {
        if (!wktText.trim().toUpperCase().startsWith('LINESTRING')) {
          setError('WKT must begin with LINESTRING(...) format.');
          setIsSubmitting(false);
          return;
        }
        routeGeomWkt = wktText.trim();
      }

      const updated = await inventoryApi.updateCable(cable.id, {
        cableName: cableName.trim(),
        cableType,
        fiberGrade,
        status,
        lengthMeters: autoCalcLength && (routeGeomGeoJson || routeGeomWkt) ? undefined : Number(lengthMeters),
        installationType,
        sheathType,
        attenuationDbPerKm: Number(attenuationDbPerKm) || 0.350,
        originLocationId: originLocationId || undefined,
        originDeviceId: originDeviceId || undefined,
        terminationLocationId: terminationLocationId || undefined,
        terminationDeviceId: terminationDeviceId || undefined,
        routeGeomGeoJson,
        routeGeomWkt
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Failed to update cable:', err);
      setError(err?.response?.data?.detail || err.message || 'Failed to update cable properties');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'MAINTENANCE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PLANNED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'DECOMMISSIONED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Optical Cable & Route Properties"
      subtitle={`Modify physical attributes, operational status, and PostGIS route geometry for ${cable.cableCode}`}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs animate-shake">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-semibold">Update Validation Error</p>
              <p className="text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Cable Identification Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">{cable.cableCode}</span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full border ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{cable.totalCores} Total Cores ({cable.litCores || 0} Lit · {cable.darkCores || 0} Dark)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Length:</span>
            <span className="text-cyan-300 font-bold">{lengthMeters ? (lengthMeters / 1000).toFixed(2) : '0.00'} km</span>
            <span className="text-slate-600">({lengthMeters} m)</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'general'
                ? 'border-cyan-500 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>General & Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-cyan-500 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Plant Specs & Endpoints</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('geometry')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'geometry'
                ? 'border-cyan-500 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>PostGIS Spatial Route</span>
            {coordsText && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
          </button>
        </div>

        {/* Tab 1: General & Operational Status */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cable Descriptive Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={cableName}
                onChange={e => setCableName(e.target.value)}
                required
                className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g. Jakarta Metro DWDM Trunk Ring A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Operational Status <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="ACTIVE">ACTIVE (Fully Live / Operational)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Scheduled Work / Degraded)</option>
                  <option value="PLANNED">PLANNED (Future Rollout / Engineering)</option>
                  <option value="DECOMMISSIONED">DECOMMISSIONED (Retired / Inactive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cable Hierarchy Classification
                </label>
                <select
                  value={cableType}
                  onChange={e => setCableType(e.target.value as CableType)}
                  className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="BACKBONE_TRUNK">BACKBONE_TRUNK (Long-haul Core DWDM)</option>
                  <option value="FEEDER_CABLE">FEEDER_CABLE (Metro Central POP Feed)</option>
                  <option value="DISTRIBUTION_CABLE">DISTRIBUTION_CABLE (Area Aggregation)</option>
                  <option value="DROP_CABLE">DROP_CABLE (Customer Last-mile / FTTH)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fiber Glass Specification (ITU-T)
                </label>
                <select
                  value={fiberGrade}
                  onChange={e => setFiberGrade(e.target.value as FiberGrade)}
                  className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="SINGLE_MODE_G652D">G.652.D (Standard Telecom Singlemode)</option>
                  <option value="SINGLE_MODE_G655">G.655 (NZ-DSF Dispersion-Shifted DWDM)</option>
                  <option value="SINGLE_MODE_G657A2">G.657.A2 (Bend-Insensitive FTTH Drop)</option>
                  <option value="MULTI_MODE_OM4">OM4 (50/125 Multimode High-Speed Datacenter)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Route Physical Length (Meters)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={lengthMeters}
                  onChange={e => setLengthMeters(Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Plant Specs & Endpoints */}
        {activeTab === 'specs' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Installation Environment
                </label>
                <select
                  value={installationType}
                  onChange={e => setInstallationType(e.target.value)}
                  className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="UNDERGROUND_DUCT">UNDERGROUND_DUCT (Conduit / Manhole)</option>
                  <option value="AERIAL_POLE">AERIAL_POLE (Utility Poles / ADSS)</option>
                  <option value="DIRECT_BURIED">DIRECT_BURIED (Trench Armored)</option>
                  <option value="SUBMARINE">SUBMARINE (Subsea Fiber Cable)</option>
                  <option value="INDOOR_TRAY">INDOOR_TRAY (Building Cable Tray)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Outer Sheath Construction
                </label>
                <select
                  value={sheathType}
                  onChange={e => setSheathType(e.target.value)}
                  className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="ARMORED_HDPE">ARMORED_HDPE (Steel tape HDPE)</option>
                  <option value="DOUBLE_ARMORED_HEAVY">DOUBLE_ARMORED_HEAVY (Railway/Civil)</option>
                  <option value="DIELECTRIC_DUCT">DIELECTRIC_DUCT (Non-metallic)</option>
                  <option value="LSZH_FLAME_RETARDANT">LSZH_FLAME_RETARDANT (Indoor Safety)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Typical Attenuation (dB/km)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="5"
                  value={attenuationDbPerKm}
                  onChange={e => setAttenuationDbPerKm(Number(e.target.value))}
                  className="w-full glass-input px-3 py-2 bg-slate-900/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* A-End & Z-End Physical Endpoints */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Physical Endpoints & Span Routing (A-End &rarr; Z-End)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Origin Equipment &rarr; Destination Equipment
                </span>
              </div>

              {/* Live Span Path Preview HUD */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <div>
                    <span className="text-[9px] text-blue-400 block font-sans font-semibold">A-END ORIGIN</span>
                    <span className="text-white font-bold text-xs font-mono">
                      {devices.find(d => d.id === originDeviceId)?.hostname || cable.originDeviceHostname || 'Unassigned'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {locations.find(l => l.id === originLocationId)?.name || cable.originLocationName || 'No Site Linked'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center px-4">
                  <span className="text-[10px] text-cyan-400 font-sans tracking-wide">
                    ─── {lengthMeters ? `${(lengthMeters / 1000).toFixed(2)} km span` : 'Optical Span'} ───&gt;
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-right">
                  <div>
                    <span className="text-[9px] text-purple-400 block font-sans font-semibold">Z-END DESTINATION</span>
                    <span className="text-white font-bold text-xs font-mono">
                      {devices.find(d => d.id === terminationDeviceId)?.hostname || cable.terminationDeviceHostname || 'Unassigned'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {locations.find(l => l.id === terminationLocationId)?.name || cable.terminationLocationName || 'No Site Linked'}
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                </div>
              </div>

              {/* Dropdown Selectors for A-End and Z-End */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* A-End Card */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-blue-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-blue-300">A-End Origin Point</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Origin Equipment (ODF / Router / Device)
                    </label>
                    <select
                      value={originDeviceId}
                      onChange={e => handleOriginDeviceSelect(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 font-mono focus:border-blue-500"
                    >
                      <option value="">-- Select Origin Equipment / Device --</option>
                      {devices.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.hostname} ({d.deviceType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Origin Site / Facility Room
                    </label>
                    <select
                      value={originLocationId}
                      onChange={e => setOriginLocationId(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      <option value="">-- Select Origin Site / Location --</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Z-End Card */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-purple-500/20 text-purple-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-purple-300">Z-End Destination Point</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Destination Equipment (ODF / Router / Device)
                    </label>
                    <select
                      value={terminationDeviceId}
                      onChange={e => handleTerminationDeviceSelect(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 font-mono focus:border-purple-500"
                    >
                      <option value="">-- Select Destination Equipment / Device --</option>
                      {devices.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.hostname} ({d.deviceType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Destination Site / Facility Room
                    </label>
                    <select
                      value={terminationLocationId}
                      onChange={e => setTerminationLocationId(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      <option value="">-- Select Destination Site / Location --</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: PostGIS Spatial Route Coordinates */}
        {activeTab === 'geometry' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-300">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>PostGIS Coordinate System: <strong>EPSG:4326 (WGS 84 Longitude, Latitude)</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGeometryMode('geojson')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    geometryMode === 'geojson'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  GeoJSON Array
                </button>
                <button
                  type="button"
                  onClick={() => setGeometryMode('wkt')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    geometryMode === 'wkt'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  WKT LineString
                </button>
              </div>
            </div>

            {geometryMode === 'geojson' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>GeoJSON Coordinates Array [[lon, lat], [lon, lat], ...]</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Format: [Longitude, Latitude]</span>
                </div>
                <textarea
                  rows={8}
                  value={coordsText}
                  onChange={e => setCoordsText(e.target.value)}
                  placeholder={`[\n  [106.8456, -6.2088],\n  [106.8390, -6.2130],\n  [106.8090, -6.2260]\n]`}
                  className="w-full glass-input p-3 bg-slate-950 font-mono text-xs text-cyan-200 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>WKT LINESTRING Format</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Format: LINESTRING(lon lat, lon lat, ...)</span>
                </div>
                <textarea
                  rows={8}
                  value={wktText}
                  onChange={e => setWktText(e.target.value)}
                  placeholder="LINESTRING(106.8456 -6.2088, 106.8390 -6.2130, 106.8090 -6.2260)"
                  className="w-full glass-input p-3 bg-slate-950 font-mono text-xs text-cyan-200 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCalcLength}
                  onChange={e => setAutoCalcLength(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Automatically recalculate cable length from PostGIS spherical curve (ST_Length)</span>
              </label>

              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PostGIS ST_GeomFromGeoJSON
              </span>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Cable & Route Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
