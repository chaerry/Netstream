import React, { useState } from 'react';
import { Radio, X, Plus, ShieldCheck, Server } from 'lucide-react';
import { Connector, ConnectorProtocol } from '../../types/integration';

interface CreateConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<Connector>) => Promise<void>;
}

export const CreateConnectorModal: React.FC<CreateConnectorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState('HUAWEI');
  const [connectorType, setConnectorType] = useState('EMS_NMS');
  const [protocol, setProtocol] = useState<ConnectorProtocol>('REST_API');
  const [endpointUrl, setEndpointUrl] = useState('https://');
  const [authType, setAuthType] = useState('TOKEN');
  const [authCredential, setAuthCredential] = useState('');
  const [syncIntervalMins, setSyncIntervalMins] = useState(30);
  const [autoReconcileEnabled, setAutoReconcileEnabled] = useState(true);
  const [autoApproveMinorDiffs, setAutoApproveMinorDiffs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        vendor,
        connectorType,
        protocol,
        endpointUrl,
        authType,
        syncIntervalMins,
        autoReconcileEnabled,
        autoApproveMinorDiffs,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Register Southbound Connector</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Connector Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Huawei-NCE-West-Java"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor Solution</label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="HUAWEI">Huawei (NCE / U2000)</option>
                <option value="CISCO">Cisco (EPN-M / DNA-C)</option>
                <option value="NOKIA">Nokia (NSP / SAM)</option>
                <option value="ZTE">ZTE (ZENIC ONE / NetNumen)</option>
                <option value="FIBERHOME">Fiberhome (FitOS)</option>
                <option value="GENERIC_SNMP">Generic SNMP Collector</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mediation Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as ConnectorProtocol)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="REST_API">REST API / JSON</option>
                <option value="RESTCONF">RESTCONF (RFC 8040)</option>
                <option value="NETCONF_YANG">NETCONF / YANG</option>
                <option value="SNMP_V3">SNMP v3 (USM SHA/AES)</option>
                <option value="SNMP_V2C">SNMP v2c</option>
                <option value="CLI_SSH">CLI / SSH</option>
                <option value="TL1">TL1 (Legacy Optical)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Endpoint URL / IP Host</label>
            <input
              type="text"
              required
              placeholder="https://nce-core.netstream.corp:8443/restconf"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Auth Type</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="TOKEN">Bearer Token / OAuth2</option>
                <option value="BASIC">Basic Auth (User/Password)</option>
                <option value="SSH_KEY">SSH Key Pair</option>
                <option value="SNMP_USM">SNMPv3 USM Profile</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sync Interval</label>
              <select
                value={syncIntervalMins}
                onChange={(e) => setSyncIntervalMins(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={15}>Every 15 Minutes</option>
                <option value={30}>Every 30 Minutes</option>
                <option value={60}>Every 1 Hour</option>
                <option value={360}>Every 6 Hours</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReconcileEnabled}
                onChange={(e) => setAutoReconcileEnabled(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Enable Automated Background Reconciliation</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproveMinorDiffs}
                onChange={(e) => setAutoApproveMinorDiffs(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Auto-Approve Minor/Non-traffic Discrepancies (Optic Part #, Labels)</span>
            </label>
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
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? 'Registering...' : 'Register Connector'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
