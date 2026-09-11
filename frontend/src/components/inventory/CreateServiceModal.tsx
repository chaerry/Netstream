import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { inventoryApi } from '../../api/inventoryApi';
import { ServiceType } from '../../types/inventory';
import { CUSTOMER_REFERENCES, CustomerReference } from '../../api/customerReferences';
import { Route, Save, ShieldAlert } from 'lucide-react';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedCustomerRef, setSelectedCustomerRef] = useState<string>(CUSTOMER_REFERENCES[0].id);
  const [isCustomCustomer, setIsCustomCustomer] = useState<boolean>(false);
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    serviceCode: 'SVC-VPN-2026-0105',
    customerName: CUSTOMER_REFERENCES[0].name,
    serviceType: 'L3_VPN_MPLS' as ServiceType,
    bandwidthMbps: 10000,
    slaTier: 'GOLD',
    slaAvailabilityPct: 99.95,
    monthlyRecurringCost: 12500,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCustomerRef(val);
    setErrorMessage(null);
    if (val === 'CUSTOM') {
      setIsCustomCustomer(true);
      setFormData(prev => ({ ...prev, customerName: customCustomerName || '' }));
    } else {
      setIsCustomCustomer(false);
      const found = CUSTOMER_REFERENCES.find(c => c.id === val);
      if (found) {
        setFormData(prev => ({ 
          ...prev, 
          customerName: found.name,
          slaTier: found.tier || prev.slaTier
        }));
      }
    }
  };

  const handleCustomCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomCustomerName(val);
    setFormData(prev => ({ ...prev, customerName: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      setErrorMessage('Please select or specify a customer name.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await inventoryApi.createService(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error provisioning service');
    } finally {
      setLoading(false);
    }
  };

  // Group references by category for optgroup rendering
  const categories = Array.from(new Set(CUSTOMER_REFERENCES.map(c => c.category)));
  const activeCustomerRefObj = CUSTOMER_REFERENCES.find(c => c.id === selectedCustomerRef);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Telecom Customer Service"
      subtitle="Service Inventory — Lifecycle Management & SLA Parameters"
      icon={<Route className="w-5 h-5 text-cyan-400" />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {/* Row 1: Service Code & Customer Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 whitespace-nowrap">
              Service Identifier Code *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. SVC-VPN-2026-0105"
              value={formData.serviceCode}
              onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between whitespace-nowrap">
              <span>Customer / Enterprise Name *</span>
              {activeCustomerRefObj && (
                <span className="text-[10px] text-cyan-400 font-mono font-normal">
                  {activeCustomerRefObj.code}
                </span>
              )}
            </label>
            <select
              value={selectedCustomerRef}
              onChange={handleCustomerChange}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl truncate"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={cat} className="bg-slate-900 text-slate-400 font-semibold">
                  {CUSTOMER_REFERENCES.filter(c => c.category === cat).map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-950 text-white font-normal py-1">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </optgroup>
              ))}
              <optgroup label="Other Options" className="bg-slate-900 text-slate-400 font-semibold">
                <option value="CUSTOM" className="bg-slate-950 text-cyan-300 py-1">
                  + Custom Enterprise / Manual Entry...
                </option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Conditional Manual Customer Name Input (if custom selected) */}
        {isCustomCustomer && (
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5 animate-in fade-in">
            <label className="block text-xs font-semibold text-cyan-300 whitespace-nowrap">
              Custom Customer Legal Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. PT Mitra Global Telecom"
              value={customCustomerName}
              onChange={handleCustomCustomerNameChange}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            />
          </div>
        )}

        {/* Row 2: Technology Type & Bandwidth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 whitespace-nowrap">
              Service Technology Type
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            >
              <option value="L3_VPN_MPLS">L3 VPN MPLS Core</option>
              <option value="L2_VPN_MPLS">L2 VPN VPLS / EVPN</option>
              <option value="INTERNET_DIRECT">Dedicated Internet Access (DIA)</option>
              <option value="DARK_FIBER">Dedicated Dark Fiber Core</option>
              <option value="WAVELENGTH_SERVICE">DWDM Wavelength (100G/400G)</option>
              <option value="METRO_ETHERNET">Metro Ethernet Access</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 whitespace-nowrap">
              Provisioned Bandwidth (Mbps)
            </label>
            <input
              type="number"
              min={100}
              step={100}
              value={formData.bandwidthMbps}
              onChange={(e) => setFormData({ ...formData, bandwidthMbps: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Row 3: SLA Tier, Availability & Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 whitespace-nowrap">
              SLA Tier
            </label>
            <select
              value={formData.slaTier}
              onChange={(e) => {
                const tier = e.target.value;
                const availMap: Record<string, number> = { PLATINUM: 99.99, GOLD: 99.95, SILVER: 99.90, BRONZE: 99.50 };
                setFormData({ 
                  ...formData, 
                  slaTier: tier,
                  slaAvailabilityPct: availMap[tier] || formData.slaAvailabilityPct
                });
              }}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl"
            >
              <option value="PLATINUM">PLATINUM (99.99%)</option>
              <option value="GOLD">GOLD (99.95%)</option>
              <option value="SILVER">SILVER (99.90%)</option>
              <option value="BRONZE">BRONZE (99.50%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 whitespace-nowrap">
              SLA Availability (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="90"
              max="100"
              value={formData.slaAvailabilityPct}
              onChange={(e) => setFormData({ ...formData, slaAvailabilityPct: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 whitespace-nowrap">
              Monthly Cost ($ USD)
            </label>
            <input
              type="number"
              min="0"
              value={formData.monthlyRecurringCost}
              onChange={(e) => setFormData({ ...formData, monthlyRecurringCost: Number(e.target.value) })}
              className="glass-input w-full h-10 px-3.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Provisioning...' : 'Provision Service'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
