import React, { useState } from 'react';
import { Radio, AlertOctagon, X } from 'lucide-react';
import { EnrichedAlarm, AlarmSeverity } from '../../types/integration';

interface SimulateAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<EnrichedAlarm>) => Promise<void>;
}

export const SimulateAlarmModal: React.FC<SimulateAlarmModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [alarmName, setAlarmName] = useState('LossOfSignal (LOS)');
  const [severity, setSeverity] = useState<AlarmSeverity>('CRITICAL');
  const [sourceSystem, setSourceSystem] = useState('HUAWEI_NCE');
  const [deviceName, setDeviceName] = useState('JKT-CORE-PE-01');
  const [portName, setPortName] = useState('HundredGigE0/1/0/1');
  const [rootCauseTag, setRootCauseTag] = useState('FIBER_CUT_SP04');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        alarmName,
        severity,
        sourceSystem,
        deviceName,
        portName,
        rootCauseTag,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Inject Telemetry Test Alarm</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alarm Event Type</label>
            <select
              value={alarmName}
              onChange={(e) => setAlarmName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="LossOfSignal (LOS)">LossOfSignal (LOS) - Optical Fiber Cut</option>
              <option value="BGPPeerSessionDown">BGPPeerSessionDown - Core Routing Flap</option>
              <option value="HighBitErrorRate (BER)">HighBitErrorRate (BER) - Optical Attenuation</option>
              <option value="PowerSupplyModuleFailure">PowerSupplyModuleFailure - Chassis Hardware</option>
              <option value="PortAdministrativeDown">PortAdministrativeDown - Unauthorized Shutdown</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlarmSeverity)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="CRITICAL">CRITICAL (Red Alert)</option>
                <option value="MAJOR">MAJOR (Orange)</option>
                <option value="MINOR">MINOR (Yellow)</option>
                <option value="WARNING">WARNING (Blue)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source System</label>
              <select
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="HUAWEI_NCE">Huawei NCE</option>
                <option value="CISCO_EPNM">Cisco EPN-M</option>
                <option value="NOKIA_NSP">Nokia NSP</option>
                <option value="SNMP_TRAP">Direct SNMP Trap</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Device Hostname</label>
              <input
                type="text"
                required
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Port Name</label>
              <input
                type="text"
                required
                value={portName}
                onChange={(e) => setPortName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Suspected Root Cause Tag</label>
            <input
              type="text"
              value={rootCauseTag}
              onChange={(e) => setRootCauseTag(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
            ℹ️ Netstream will automatically correlate this device and port with connected <strong>optical cables</strong>, <strong>leased line circuits</strong>, <strong>corporate customer services</strong>, and <strong>SLA outage penalties</strong>.
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
            >
              {isSubmitting ? 'Injecting...' : 'Inject & Enrich Alarm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
