import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'cyan' | 'emerald' | 'purple' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'cyan',
}) => {
  const getGlowColor = () => {
    switch (accentColor) {
      case 'emerald':
        return 'group-hover:border-emerald-500/50 group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)] text-emerald-400 bg-emerald-500/10';
      case 'purple':
        return 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.25)] text-purple-400 bg-purple-500/10';
      case 'amber':
        return 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)] text-amber-400 bg-amber-500/10';
      case 'rose':
        return 'group-hover:border-rose-500/50 group-hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)] text-rose-400 bg-rose-500/10';
      default:
        return 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)] text-cyan-400 bg-cyan-500/10';
    }
  };

  return (
    <div className="glass-card group p-5 rounded-2xl relative overflow-hidden transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl border border-slate-800 transition-colors duration-300 ${getGlowColor()}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
