import React, { useState } from 'react';
import { Transaction, FinanceReport, ReportSummary, SalesTarget, ReportPeriod } from '../types';
import {
  TrendingUp,
  ShoppingBag,
  Coins,
  Users,
  Calendar,
  Clock,
  PieChart as PieChartIcon,
  RefreshCw,
  Loader2,
  Target,
  Pencil,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import KpiCard from './ui/KpiCard';

interface OwnerDashboardProps {
  transactions: Transaction[];
  reportFinance: FinanceReport | null;
  reportSummary: ReportSummary | null;
  salesTarget: SalesTarget | null;
  reportPeriod: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  onRefresh: () => void;
  onSetSalesTarget: (periode: string, target_amount: number) => void;
  loading: boolean;
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  hari_ini: 'Hari Ini',
  minggu_ini: 'Minggu Ini',
  bulan_ini: 'Bulan Ini',
  tahun_ini: 'Tahun Ini',
};

const PIE_COLORS = ['#0891b2', '#f59e0b', '#6366f1', '#22c55e'];

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export default function OwnerDashboard({
  transactions,
  reportFinance,
  reportSummary,
  salesTarget,
  reportPeriod,
  onPeriodChange,
  onRefresh,
  onSetSalesTarget,
  loading,
}: OwnerDashboardProps) {
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const completedTx = transactions.filter(t => t.status === 'Selesai');

  const totalRevenue = reportFinance?.ringkasan.total_revenue
    ?? completedTx.reduce((sum, t) => sum + t.amount, 0);
  const totalTransaksi = reportFinance?.ringkasan.total_transaksi
    ?? transactions.length;
  const avgOrderValue = reportFinance?.ringkasan.rata_rata_per_transaksi
    ?? (transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0);
  const customerBaru = reportSummary?.pengguna.customer_baru ?? 0;
  const karyawanAktif = reportSummary?.pengguna.karyawan_aktif ?? 0;

  const targetAmount = salesTarget?.target_amount ?? 0;
  const targetProgress = targetAmount > 0 ? Math.min((totalRevenue / targetAmount) * 100, 100) : 0;
  const targetPeriode = salesTarget?.periode || new Date().toISOString().slice(0, 7);
  const targetPeriodeLabel = (() => {
    try {
      return new Date(targetPeriode + '-01T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } catch {
      return targetPeriode;
    }
  })();

  const handleSaveTarget = () => {
    const amount = parseFloat(targetInput);
    if (isNaN(amount) || amount < 0) return;
    onSetSalesTarget(targetPeriode, amount);
    setShowTargetForm(false);
  };

  const revenueChartData = reportFinance?.per_hari.length
    ? reportFinance.per_hari.map(d => ({
        name: d.tanggal ? new Date(d.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : d.tanggal,
        Pendapatan: d.total_revenue,
      }))
    : [
        { name: 'Minggu 1', Pendapatan: 3800000 },
        { name: 'Minggu 2', Pendapatan: 4200000 },
        { name: 'Minggu 3', Pendapatan: 4900000 },
        { name: 'Minggu 4', Pendapatan: 5800000 },
      ];

  const paymentMethodData = reportFinance?.per_metode_pembayaran.length
    ? reportFinance.per_metode_pembayaran.map(pm => ({
        name: pm.metode.charAt(0).toUpperCase() + pm.metode.slice(1),
        value: pm.total,
        label: formatRupiah(pm.total),
      }))
    : [];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight font-display">Owner Executive Dashboard</h2>
          <p className="text-xs text-ink-muted">Analisis metrik keuangan eksekutif, volume transaksi, dan profitabilitas</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-gradient-to-br from-success/15 to-success/25"
          iconColor="text-success"
          label="Total Pendapatan"
          value={formatRupiah(totalRevenue)}
        />
        <KpiCard
          icon={ShoppingBag}
          iconBg="bg-gradient-to-br from-teal/15 to-teal/25"
          iconColor="text-teal"
          label="Total Transaksi"
          value={`${totalTransaksi} Transaksi`}
        />
        <KpiCard
          icon={Coins}
          iconBg="bg-gradient-to-br from-gold/15 to-gold/25"
          iconColor="text-gold"
          label="Rata-rata per Transaksi"
          value={formatRupiah(avgOrderValue)}
        />
        <KpiCard
          icon={Users}
          iconBg="bg-gradient-to-br from-[#6366f1]/15 to-[#6366f1]/25"
          iconColor="text-[#6366f1]"
          label="Customer Baru"
          value={`${customerBaru} Customer`}
        />
        <KpiCard
          icon={Users}
          iconBg="bg-gradient-to-br from-[#22c55e]/15 to-[#22c55e]/25"
          iconColor="text-[#22c55e]"
          label="Karyawan Aktif"
          value={`${karyawanAktif} Orang`}
        />
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-gold/15 to-gold/25 text-gold p-2.5 rounded-[var(--radius-lg)] flex items-center justify-center border border-white/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-ink tracking-tight">Target Penjualan</h4>
              <p className="text-xs text-ink-muted">Periode {targetPeriodeLabel}</p>
            </div>
          </div>
          <button
            onClick={() => { setTargetInput(targetAmount ? String(targetAmount) : ''); setShowTargetForm(true); }}
            className="px-3.5 py-1.5 text-xs font-bold bg-white/40 hover:bg-white/60 text-ink rounded-lg border border-white/30 transition-all duration-200 flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            {targetAmount > 0 ? 'Ubah Target' : 'Set Target'}
          </button>
        </div>

        {targetAmount > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest font-mono">Realisasi</p>
                <p className="text-xl font-black text-ink font-display">{formatRupiah(totalRevenue)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest font-mono">Target</p>
                <p className="text-xl font-black text-ink font-display">{formatRupiah(targetAmount)}</p>
              </div>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${targetProgress >= 100 ? 'bg-gradient-to-r from-success to-[#22c55e]' : 'bg-gradient-to-r from-teal to-teal-light'}`}
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className={targetProgress >= 100 ? 'text-success' : 'text-ink-muted'}>
                {targetProgress.toFixed(1)}% tercapai
              </span>
              <span className="text-ink-muted">
                {totalRevenue >= targetAmount ? 'Target tercapai! 🎉' : `Kurang ${formatRupiah(targetAmount - totalRevenue)}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs font-bold text-ink-muted">Belum ada target penjualan untuk periode ini</p>
            <p className="text-[10px] text-ink-muted/60 mt-1">Klik "Set Target" untuk menetapkan target bulanan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-extrabold text-ink tracking-tight">Grafik Pendapatan</h4>
              <p className="text-xs text-ink-muted">Analisis fluktuasi pendapatan periode terpilih</p>
            </div>
            <span className="text-xs font-bold text-ink-muted bg-white/30 px-3 py-1 rounded-full flex items-center gap-1 border border-white/30">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" />
              {PERIOD_LABELS[reportPeriod]}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: any) => [formatRupiah(Number(v)), 'Pendapatan']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px', border: 'none', fontSize: '11px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#0891b2', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" fontSize={11} wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Pendapatan" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-ink-muted" />
            <h4 className="text-sm font-extrabold text-ink tracking-tight">Metode Pembayaran</h4>
          </div>
          {paymentMethodData.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {paymentMethodData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => [formatRupiah(Number(v)), 'Total']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                  />
                  <Legend
                    iconType="circle"
                    fontSize={11}
                    formatter={(value: string) => (
                      <span className="text-ink-muted font-semibold">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-xs text-ink-muted">Data tidak tersedia untuk periode ini</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shift Performance — placeholder */}
        <div className="lg:col-span-1 glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-ink-muted" />
            <h4 className="text-sm font-extrabold text-ink tracking-tight">Performa Shift</h4>
          </div>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-ink-muted" />
            </div>
            <p className="text-xs font-bold text-ink-muted">Coming Soon</p>
            <p className="text-[10px] text-ink-muted/60 mt-1">Laporan performa per shift akan tersedia</p>
          </div>
        </div>

        {/* Ringkasan Pemesanan */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <h4 className="text-sm font-extrabold text-ink tracking-tight">Ringkasan Pemesanan</h4>
          {reportSummary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(() => {
                const statusMap: Record<string, string> = {
                  'menunggu konfirmasi': 'Menunggu',
                  'disetujui': 'Disetujui',
                  'diproses': 'Diproses',
                  'sedang di cuci': 'Dicuci',
                  'selesai': 'Selesai',
                };
                const statusColors: Record<string, string> = {
                  'Menunggu': 'bg-amber-100 text-amber-700',
                  'Disetujui': 'bg-blue-100 text-blue-700',
                  'Diproses': 'bg-purple-100 text-purple-700',
                  'Dicuci': 'bg-cyan-100 text-cyan-700',
                  'Selesai': 'bg-green-100 text-green-700',
                };
                return reportSummary.pemesanan.per_status
                  .filter(s => statusMap[s.status])
                  .map(s => (
                    <div key={s.status} className="bg-white/30 rounded-xl p-4 text-center border border-white/20">
                      <p className="text-2xl font-black text-ink">{s.jumlah}</p>
                      <p className={`text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${statusColors[statusMap[s.status]] || 'bg-gray-100 text-gray-600'}`}>
                        {statusMap[s.status] || s.status}
                      </p>
                    </div>
                  ));
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <p className="text-xs text-ink-muted">Data pemesanan tidak tersedia</p>
            </div>
          )}
        </div>
      </div>

      {showTargetForm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowTargetForm(false)}
        >
          <div
            style={{ width: '420px', maxWidth: 'calc(100vw - 2rem)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.85)', padding: '1.5rem', boxShadow: '0 16px 48px rgba(15,23,42,0.16)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-ink">Target Penjualan</h3>
                <p className="text-xs text-ink-muted mt-0.5">Periode {targetPeriodeLabel}</p>
              </div>
              <button onClick={() => setShowTargetForm(false)} className="p-1 text-ink-muted hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Target Pendapatan (Rp)</label>
              <input
                type="number"
                min="0"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="Contoh: 5000000"
                autoFocus
                className="w-full mt-1 px-3 py-2 text-sm bg-white/60 border border-white/40 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowTargetForm(false)}
                className="px-4 py-2 text-[13px] font-bold text-ink-muted hover:text-ink rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveTarget}
                disabled={targetInput === '' || parseFloat(targetInput) < 0}
                className="px-5 py-2 text-[13px] font-bold text-white bg-navy-deep hover:bg-navy-hover rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
