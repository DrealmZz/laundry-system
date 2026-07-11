import React, { useState } from 'react';
import { ShiftPerformanceReport, ShiftPerformanceItem, ReportPeriod } from '../types';
import {
  Calendar,
  RefreshCw,
  Loader2,
  TrendingUp,
  BarChart3,
  Award,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Package,
  Coins,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import KpiCard from './ui/KpiCard';

interface OwnerShiftPerformanceProps {
  reportShiftPerformance: ShiftPerformanceReport | null;
  reportPeriod: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  onRefresh: () => void;
  loading: boolean;
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  hari_ini: 'Hari Ini',
  minggu_ini: 'Minggu Ini',
  bulan_ini: 'Bulan Ini',
  tahun_ini: 'Tahun Ini',
};

const SHIFT_LABELS: Record<string, string> = {
  pagi: 'Pagi',
  siang: 'Siang',
  sore: 'Sore',
  malam: 'Malam',
};

const SHIFT_SCHEDULES: Record<string, string> = {
  pagi: '08:00 - 16:00',
  siang: '12:00 - 20:00',
  sore: '16:00 - 24:00',
  malam: '20:00 - 04:00',
};

const SHIFT_COLORS: Record<string, string> = {
  pagi: '#f59e0b',
  siang: '#ef4444',
  sore: '#8b5cf6',
  malam: '#1e40af',
};

const SHIFT_ICONS: Record<string, React.ComponentType<any>> = {
  pagi: Sunrise,
  siang: Sun,
  sore: Sunset,
  malam: Moon,
};

type Metric = 'revenue' | 'transaksi' | 'volume';

const METRIC_CONFIG: Record<Metric, { label: string; key: keyof ShiftPerformanceItem }> = {
  revenue: { label: 'Pendapatan', key: 'total_revenue' },
  transaksi: { label: 'Transaksi', key: 'total_transaksi' },
  volume: { label: 'Volume (kg)', key: 'total_kg' },
};

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export default function OwnerShiftPerformance({
  reportShiftPerformance,
  reportPeriod,
  onPeriodChange,
  onRefresh,
  loading,
}: OwnerShiftPerformanceProps) {
  const [metric, setMetric] = useState<Metric>('revenue');

  const shifts: ShiftPerformanceItem[] = reportShiftPerformance?.shifts ?? [
    { shift: 'pagi', total_transaksi: 0, total_revenue: 0, total_kg: 0, total_koin: 0, rata_rata_per_transaksi: 0 },
    { shift: 'siang', total_transaksi: 0, total_revenue: 0, total_kg: 0, total_koin: 0, rata_rata_per_transaksi: 0 },
    { shift: 'sore', total_transaksi: 0, total_revenue: 0, total_kg: 0, total_koin: 0, rata_rata_per_transaksi: 0 },
    { shift: 'malam', total_transaksi: 0, total_revenue: 0, total_kg: 0, total_koin: 0, rata_rata_per_transaksi: 0 },
  ];

  const totalTransaksi = shifts.reduce((sum, s) => sum + s.total_transaksi, 0);
  const totalRevenue = shifts.reduce((sum, s) => sum + s.total_revenue, 0);
  const activeShiftCount = shifts.filter(s => s.total_transaksi > 0).length;
  const avgPerShift = activeShiftCount > 0 ? Math.round(totalRevenue / activeShiftCount) : 0;

  const mostProductive = shifts.reduce((best, curr) =>
    curr.total_revenue > best.total_revenue ? curr : best
  , shifts[0]);
  const mostProductiveContrib = totalRevenue > 0
    ? Math.round((mostProductive.total_revenue / totalRevenue) * 100)
    : 0;

  const activeMetric = METRIC_CONFIG[metric];
  const chartData = shifts.map(s => ({
    name: SHIFT_LABELS[s.shift] || s.shift,
    shift: s.shift,
    value: Number(s[activeMetric.key]) || 0,
  }));

  const formatMetricValue = (v: number): string => {
    if (metric === 'revenue') return formatRupiah(v);
    if (metric === 'volume') return `${v} kg`;
    return `${v} transaksi`;
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight font-display">Performa Shift</h2>
          <p className="text-xs text-ink-muted">Analisis produktivitas setiap shift kerja (data aktual)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-ink-muted bg-white/40 px-2.5 py-1 rounded-full border border-white/30">
            {PERIOD_LABELS[reportPeriod]}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-white/60 transition-all duration-200 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex gap-1.5 bg-white/40 p-1 rounded-xl border border-white/30 shadow-sm">
            {(Object.keys(PERIOD_LABELS) as ReportPeriod[]).map(period => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                  reportPeriod === period
                    ? 'bg-navy-deep text-white shadow-md'
                    : 'text-ink-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                {PERIOD_LABELS[period]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-ink-muted bg-white/30 rounded-xl border border-white/20">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat data...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          icon={Award}
          iconBg="bg-gradient-to-br from-gold/15 to-gold/25"
          iconColor="text-gold"
          label="Shift Terproduktif"
          value={SHIFT_LABELS[mostProductive.shift] || mostProductive.shift}
          trend={totalRevenue > 0 ? { value: `${mostProductiveContrib}% pendapatan`, positive: true } : undefined}
        />
        <KpiCard
          icon={BarChart3}
          iconBg="bg-gradient-to-br from-teal/15 to-teal/25"
          iconColor="text-teal"
          label="Total Transaksi"
          value={`${totalTransaksi} Transaksi`}
        />
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-gradient-to-br from-gold/15 to-gold/25"
          iconColor="text-gold"
          label="Rata-rata per Shift Aktif"
          value={formatRupiah(avgPerShift)}
        />
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-ink tracking-tight">Komparasi Performa Shift</h4>
            <p className="text-xs text-ink-muted">Bandingkan {activeMetric.label.toLowerCase()} antar shift</p>
          </div>
          <div className="flex gap-1.5 bg-white/40 p-1 rounded-xl border border-white/30 shadow-sm">
            {(Object.keys(METRIC_CONFIG) as Metric[]).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 ${
                  metric === m
                    ? 'bg-navy-deep text-white shadow-md'
                    : 'text-ink-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                {METRIC_CONFIG[m].label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => metric === 'revenue' ? `${v / 1000}k` : `${v}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.15)' }}
                formatter={(v: any) => [formatMetricValue(Number(v)), activeMetric.label]}
                contentStyle={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px', border: 'none', fontSize: '11px', backdropFilter: 'blur(8px)' }}
                itemStyle={{ color: '#ffffff' }}
                labelStyle={{ color: '#0891b2', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                {chartData.map((entry) => (
                  <Cell key={entry.shift} fill={SHIFT_COLORS[entry.shift] || '#0891b2'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shifts.map(s => {
          const Icon = SHIFT_ICONS[s.shift] || Sun;
          const color = SHIFT_COLORS[s.shift] || '#0891b2';
          const contrib = totalRevenue > 0 ? Math.round((s.total_revenue / totalRevenue) * 100) : 0;
          return (
            <div key={s.shift} className="glass-card p-5 relative overflow-hidden">
              <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: color }} />
              <div className="flex items-center justify-between mb-4 pl-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-ink">Shift {SHIFT_LABELS[s.shift] || s.shift}</h5>
                    <p className="text-[10px] font-bold text-ink-muted">{SHIFT_SCHEDULES[s.shift] || ''}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}22`, color }}>
                  {contrib}% kontribusi
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pl-2">
                <div className="bg-white/25 rounded-xl p-3 border border-white/15">
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Transaksi</p>
                  <p className="text-lg font-black text-ink mt-0.5">{s.total_transaksi}</p>
                </div>
                <div className="bg-white/25 rounded-xl p-3 border border-white/15">
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Pendapatan</p>
                  <p className="text-lg font-black text-ink mt-0.5">{formatRupiah(s.total_revenue)}</p>
                </div>
                <div className="bg-white/25 rounded-xl p-3 border border-white/15 flex items-center gap-2">
                  <Package className="w-4 h-4 text-ink-muted shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Kiloan</p>
                    <p className="text-base font-black text-ink">{s.total_kg} kg</p>
                  </div>
                </div>
                <div className="bg-white/25 rounded-xl p-3 border border-white/15 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-ink-muted shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Koin</p>
                    <p className="text-base font-black text-ink">{s.total_koin} token</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pl-2">
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${contrib}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
