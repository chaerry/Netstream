import React, { useState, useEffect } from 'react';
import { NetworkService } from '../../types/inventory';
import { inventoryApi } from '../../api/inventoryApi';
import { useAuth } from '../../auth/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { StatCard } from '../common/StatCard';
import { ServiceHopVisualizer } from './ServiceHopVisualizer';
import { CreateServiceModal } from './CreateServiceModal';
import {
  Route,
  Plus,
  Search,
  Eye,
  Activity,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Power
} from 'lucide-react';

export const ServiceInventoryView: React.FC = () => {
  const { hasRole, hasAnyRole } = useAuth();
  const [services, setServices] = useState<NetworkService[]>([]);
  const [selectedService, setSelectedService] = useState<NetworkService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const cleanSearch = searchTerm.trim().replace(/\s+/g, ' ');
      const data = await inventoryApi.getServices({ search: cleanSearch || undefined });
      setServices(data);
      if (!selectedService && data.length > 0) {
        setSelectedService(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchTerm]);

  const handleToggleStatus = async (service: NetworkService) => {
    const nextStatus = service.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await inventoryApi.updateServiceStatus(service.id, nextStatus);
    fetchServices();
  };

  const totalBandwidthGbps = services.reduce((sum, s) => sum + s.bandwidthMbps, 0) / 1000;
  const totalMrc = services.reduce((sum, s) => sum + s.monthlyRecurringCost, 0);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Customer Services"
          value={services.length}
          subtitle="MPLS L3VPN, DIA, Dark Fiber"
          icon={<Route className="w-5 h-5" />}
          accentColor="cyan"
          trend={{ value: '100% SLA Compliant', isPositive: true }}
        />
        <StatCard
          title="Provisioned Bandwidth Load"
          value={`${totalBandwidthGbps.toFixed(1)} Gbps`}
          subtitle="Active Backbone Utilization"
          icon={<Activity className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Monthly Recurring Revenue (MRR)"
          value={`$${totalMrc.toLocaleString()}`}
          subtitle="Telecom Service Contract Value"
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="purple"
        />
      </div>

      {/* Selected Service Topology Map */}
      {selectedService && (
        <ServiceHopVisualizer service={selectedService} />
      )}

      {/* Services Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search service code, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-9 pr-4 py-2 text-xs rounded-xl"
              />
            </div>
          </div>

          {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Provision Service
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Service Code</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Bandwidth</th>
                <th className="py-3.5 px-4">SLA Tier</th>
                <th className="py-3.5 px-4">Monthly Cost</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Topology Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {services.map((svc) => (
                <tr
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`cursor-pointer transition-colors ${
                    selectedService?.id === svc.id ? 'bg-cyan-950/30 border-l-2 border-cyan-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{svc.serviceCode}</span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-200">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{svc.customerName}</span>
                      {svc.serviceType === 'GPON_BROADBAND' && (
                        <span className="text-[10px] text-emerald-400 font-mono">6-Hop ODN Passive + Active Flow</span>
                      )}
                      {svc.serviceType === 'METRO_ETHERNET' && (
                        <span className="text-[10px] text-cyan-400 font-mono">5-Hop EoMPLS PW Dot1Q Flow</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-semibold border ${
                      svc.serviceType === 'GPON_BROADBAND'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : svc.serviceType === 'METRO_ETHERNET'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {svc.serviceType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-cyan-400 font-bold">
                    {svc.bandwidthMbps >= 1000 ? `${svc.bandwidthMbps / 1000} Gbps` : `${svc.bandwidthMbps} Mbps`}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {svc.slaTier} ({svc.slaAvailabilityPct}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    ${svc.monthlyRecurringCost.toLocaleString()}/mo
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <StatusBadge status={svc.status} />
                  </td>
                  <td className="py-3.5 px-5 text-right font-sans space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedService(svc)}
                      className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500 hover:text-white rounded-lg transition-all text-xs font-semibold"
                    >
                      View Hops
                    </button>

                    {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
                      <button
                        onClick={() => handleToggleStatus(svc)}
                        className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                        title={svc.status === 'ACTIVE' ? 'Suspend Service' : 'Activate Service'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchServices}
      />
    </div>
  );
};
