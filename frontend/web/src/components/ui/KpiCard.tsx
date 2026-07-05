import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
}

export default function KpiCard({
  icon: Icon,
  iconBg = 'bg-white/30',
  iconColor = 'text-ink-secondary',
  label,
  value,
  trend,
}: KpiCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col justify-between h-36 relative group hover:shadow-glass-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`${iconBg} ${iconColor} p-2.5 rounded-[var(--radius-lg)] flex items-center justify-center border border-white/20 backdrop-blur-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
            trend.positive ? 'text-success bg-success/10 border-success/15' : 'text-error bg-error/10 border-error/15'
          }`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest font-mono">{label}</p>
        <h3 className="text-2xl font-black text-ink mt-1 font-display">{value}</h3>
      </div>
    </div>
  );
}
