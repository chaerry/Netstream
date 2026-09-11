import React from 'react';
import { OperationalStatus, ServiceStatus } from '../../types/inventory';

interface StatusBadgeProps {
  status: OperationalStatus | ServiceStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]';
      case 'PROVISIONING':
      case 'INSTALLED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]';
      case 'PLANNED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'MAINTENANCE':
      case 'SUSPENDED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.3)]';
      case 'FAULTY':
      case 'TERMINATED':
      case 'DECOMMISSIONED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_-2px_rgba(244,63,94,0.3)]';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const isPulsing = status === 'ACTIVE' || status === 'PROVISIONING';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${getBadgeStyle()} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'ACTIVE'
            ? 'bg-emerald-400'
            : status === 'PROVISIONING' || status === 'INSTALLED'
            ? 'bg-cyan-400'
            : status === 'MAINTENANCE' || status === 'SUSPENDED'
            ? 'bg-amber-400'
            : status === 'FAULTY' || status === 'TERMINATED'
            ? 'bg-rose-400'
            : 'bg-blue-400'
        } ${isPulsing ? 'animate-pulse' : ''}`}
      />
      {status}
    </span>
  );
};
