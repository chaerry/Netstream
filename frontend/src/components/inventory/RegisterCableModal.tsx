import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { CableType, FiberGrade, LocationNode, NetworkDevice, OpticalCable } from '../../types/inventory';
import { Cable, Loader2, ShieldAlert, Sparkles, Network, MapPin, Gauge } from 'lucide-react';

interface RegisterCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCable: OpticalCable) => void;
}

export const RegisterCableModal: React.FC<RegisterCableModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [cableCode, setCableCode] = useState('');
  const [cableName, setCableName] = useState('');
  const [cableType, setCableType] = useState<CableType>('FEEDER_CABLE');
  const [fiberGrade, setFiberGrade] = useState<FiberGrade>('SINGLE_MODE_G652D');
  const [totalCores, setTotalCores] = useState<number>(48);
  const [lengthMeters, setLengthMeters] = useState<number>(1800);
  const [installationType, setInstallationType] = useState<string>('UNDERGROUND_DUCT');
  const [sheathType, setSheathType] = useState<string>('ARMORED_HDPE');
  const [attenuationDbPerKm, setAttenuationDbPerKm] = useState<number>(0.350);

  // Endpoints
  const [originLocationId, setOriginLocationId] = useState<string>('');
  const [originDeviceId, setOriginDeviceId] = useState<string>('');
  const [terminationLocationId, setTerminationLocationId] = useState<string>('');
  const [terminationDeviceId, setTerminationDeviceId] = useState<string>('');

  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      setError(null);
      Promise.all([
        inventoryApi.getLocationTree(),
        inventoryApi.getDevices({ size: 100 })
      ]).then(([locs, devsRes]) => {
        setLocations(locs);
        const devs = Array.isArray(devsRes) ? devsRes : (devsRes.items || []);
        setDevices(devs);
        if (locs.length > 0) {
          setOriginLocationId(locs[0].id);
          setTerminationLocationId(locs[0].id);
        }
        setLoadingData(false);
      }).catch(err => {
        console.error('Failed to load locations/devices:', err);
        setLoadingData(false);
      });
    }
  }, [isOpen]);

  const handleCorePreset = (cores: number) => {
    setTotalCores(cores);
    if (!cableCode || cableCode.startsWith('CBL-')) {
      const prefix = cableType === 'BACKBONE_TRUNK' ? 'CBL-TRK' :
                     cableType === 'FEEDER_CABLE' ? 'CBL-FDR' :
                     cableType === 'DISTRIBUTION_CABLE' ? 'CBL-DIST' : 'CBL-DROP';
      setCableCode(`${prefix}-${cores}C`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cableCode.trim() || !cableName.trim()) {
      setError('Please fill in required cable identification fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await inventoryApi.createCable({
        cableCode: cableCode.trim().toUpperCase(),
        cableName: cableName.trim(),
        cableType,
        fiberGrade,
        totalCores,
        lengthMeters: Number(lengthMeters) || 0,
        originLocationId: originLocationId || undefined,
        originDeviceId: originDeviceId || undefined,
        terminationLocationId: terminationLocationId || undefined,
        terminationDeviceId: terminationDeviceId || undefined,
        installationType,
        sheathType,
        attenuationDbPerKm: Number(attenuationDbPerKm) || 0.350,
      });

      onSuccess(created);
    } catch (err: any) {
      console.error('Failed to register cable:', err);
      setError(err.response?.data?.message || err.message || 'Failed to register optical fiber cable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Optical Fiber Cable"
      subtitle="Provision new OSP / ISP fiber cable with auto-generated TIA-598 core strands"
      icon={<Cable className="w-5 h-5" />}
      maxWidth="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Cable Identification & Specifications */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cable className="w-3.5 h-3.5" />
                <span>1. Cable Identification & Core Count</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Auto TIA-598 Strands</span>
            </div>

            {/* Cable Code & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cable Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBL-FDR-CGK-48C"
                  value={cableCode}
                  onChange={(e) => setCableCode(e.target.value.toUpperCase())}
                  className="glass-input w-full h-9 px-3 text-xs rounded-xl font-mono text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cable Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central POP Feeder Trunk to SCBD"
                  value={cableName}
                  onChange={(e) => setCableName(e.target.value)}
                  className="glass-input w-full h-9 px-3 text-xs rounded-xl text-slate-200"
                />
              </div>
            </div>

            {/* Cable Type & Fiber Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Functional Cable Type *</label>
                <select
                  value={cableType}
                  onChange={(e) => setCableType(e.target.value as CableType)}
                  className="glass-input w-full h-9 px-3 text-xs rounded-xl font-mono text-slate-200"
                >
                  <option value="BACKBONE_TRUNK">BACKBONE_TRUNK (Long-Haul / Core DWDM)</option>
                  <option value="FEEDER_CABLE">FEEDER_CABLE (Central Office to ODC)</option>
                  <option value="DISTRIBUTION_CABLE">DISTRIBUTION_CABLE (ODC to ODP / FAT)</option>
                  <option value="DROP_CABLE">DROP_CABLE (ODP to Customer Premise)</option>
                  <option value="PATCH_CORD">PATCH_CORD (Indoor Inter-Rack Jumper)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Optical Fiber Standard *</label>
                <select
                  value={fiberGrade}
                  onChange={(e) => setFiberGrade(e.target.value as FiberGrade)}
                  className="glass-input w-full h-9 px-3 text-xs rounded-xl font-mono text-slate-200"
                >
                  <option value="SINGLE_MODE_G652D">Single-Mode Standard (ITU-T G.652D)</option>
                  <option value="SINGLE_MODE_G657A2">Single-Mode Bend-Insensitive (G.657A2 Drop)</option>
                  <option value="MULTI_MODE_OM4">Multi-Mode 50/125 Laser-Optimized (OM4)</option>
                  <option value="MULTI_MODE_OM3">Multi-Mode 50/125 High-Speed (OM3)</option>
                </select>
              </div>
            </div>

            {/* Total Cores & Presets */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Total Optical Core Count *</label>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {Math.ceil(totalCores / 12)} Buffer Tubes (12 Cores/Tube)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[2, 12, 24, 48, 72, 96, 144, 288].map(cores => (
                  <button
                    key={cores}
                    type="button"
                    onClick={() => handleCorePreset(cores)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                      totalCores === cores
                        ? 'bg-cyan-600 text-white border-cyan-400 font-bold shadow-sm shadow-cyan-600/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {cores}C
                  </button>
                ))}
              </div>

              <input
                type="number"
                min={1}
                max={1728}
                required
                value={totalCores}
                onChange={(e) => setTotalCores(Number(e.target.value) || 1)}
                className="glass-input w-full h-8 px-3 text-xs rounded-lg font-mono text-cyan-300 font-bold"
              />
            </div>

            {/* Cable Route Physical Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Length (Meters) *</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(Number(e.target.value) || 0)}
                  className="glass-input w-full h-8 px-2.5 text-xs rounded-lg font-mono text-slate-200"
                />
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                  {(lengthMeters / 1000).toFixed(3)} km
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Installation Method</label>
                <select
                  value={installationType}
                  onChange={(e) => setInstallationType(e.target.value)}
                  className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200"
                >
                  <option value="UNDERGROUND_DUCT">Underground Duct</option>
                  <option value="AERIAL_POLE">Aerial Pole Mount</option>
                  <option value="DIRECT_BURIED">Direct Buried</option>
                  <option value="INDOOR_TRAY">Indoor Tray / Riser</option>
                  <option value="SUBSEA">Submarine / Sea Cable</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Sheath / Armor</label>
                <select
                  value={sheathType}
                  onChange={(e) => setSheathType(e.target.value)}
                  className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200"
                >
                  <option value="ARMORED_HDPE">Armored HDPE</option>
                  <option value="DOUBLE_ARMORED">Double Steel Armor</option>
                  <option value="DIELECTRIC_DUCT">All-Dielectric (ADSS)</option>
                  <option value="LSZH_FLAME_RETARDANT">LSZH Flame Retardant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Origin & Termination Nodes */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                <span>2. Origin & Termination Physical Endpoints</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">A-End &rarr; Z-End Span</span>
            </div>

            {/* A-End Origin Node */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-blue-500/30 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-blue-300">A-End Origin Point</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Origin Site / Location</label>
                  <select
                    value={originLocationId}
                    onChange={(e) => setOriginLocationId(e.target.value)}
                    className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200"
                  >
                    <option value="">-- Select Location --</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Origin Equipment (ODF / Device)</label>
                  <select
                    value={originDeviceId}
                    onChange={(e) => setOriginDeviceId(e.target.value)}
                    className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200"
                  >
                    <option value="">-- Select Device --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.hostname} ({d.deviceType})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Z-End Termination Node */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-purple-300">Z-End Termination Point</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Destination Site / Location</label>
                  <select
                    value={terminationLocationId}
                    onChange={(e) => setTerminationLocationId(e.target.value)}
                    className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200"
                  >
                    <option value="">-- Select Location --</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Destination Equipment (ODC/ODP/Device)</label>
                  <select
                    value={terminationDeviceId}
                    onChange={(e) => setTerminationDeviceId(e.target.value)}
                    className="glass-input w-full h-8 px-2 text-xs rounded-lg font-mono text-slate-200"
                  >
                    <option value="">-- Select Device --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.hostname} ({d.deviceType})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Optical Attenuation Budget */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-white">Estimated Span Loss</span>
                  <p className="text-[10px] text-slate-400">@ {attenuationDbPerKm} dB/km at 1310/1550nm</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                {(attenuationDbPerKm * (lengthMeters / 1000.0)).toFixed(2)} dB
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loadingData}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating {totalCores} Cores...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register Optical Cable ({totalCores} Cores)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
