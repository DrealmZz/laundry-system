import React, { useState } from 'react';
import { Transaction, FinanceReport, ProfitLossReport, OperationalCost, ReportPeriod } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  RefreshCw,
  Loader2,
  Calendar,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  X,
  Receipt,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import KpiCard from './ui/KpiCard';

interface OwnerFinanceReportProps {
  transactions: Transaction[];
  reportFinance: FinanceReport | null;
  reportProfitLoss: ProfitLossReport | null;
  operationalCosts: OperationalCost[];
  reportPeriod: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  onRefresh: () => void;
  onAddOperationalCost: (payload: { tanggal?: string; kategori: string; jumlah: number; deskripsi?: string }) => void;
  onDeleteOperationalCost: (id: number) => void;
  loading: boolean;
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  hari_ini: 'Hari Ini',
  minggu_ini: 'Minggu Ini',
  bulan_ini: 'Bulan Ini',
  tahun_ini: 'Tahun Ini',
};

const KATEGORI_OPTIONS = ['deterjen', 'listrik', 'air', 'gaji', 'sewa', 'perawatan', 'lainnya'];

const KATEGORI_LABELS: Record<string, string> = {
  deterjen: 'Deterjen',
  listrik: 'Listrik',
  air: 'Air',
  gaji: 'Gaji Karyawan',
  sewa: 'Sewa Tempat',
  perawatan: 'Perawatan',
  lainnya: 'Lainnya',
};

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function OwnerFinanceReport({
  transactions,
  reportFinance,
  reportProfitLoss,
  operationalCosts,
  reportPeriod,
  onPeriodChange,
  onRefresh,
  onAddOperationalCost,
  onDeleteOperationalCost,
  loading,
}: OwnerFinanceReportProps) {
  const [showForm, setShowForm] = useState(false);
  const [formTanggal, setFormTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [formKategori, setFormKategori] = useState('deterjen');
  const [formJumlah, setFormJumlah] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  const completedTx = transactions.filter(t => t.status === 'Selesai');
  const totalRevenue = reportProfitLoss?.total_revenue
    ?? reportFinance?.ringkasan.total_revenue
    ?? completedTx.reduce((sum, t) => sum + t.amount, 0);
  const totalCost = reportProfitLoss?.total_cost ?? 0;
  const netProfit = reportProfitLoss?.net_profit ?? (totalRevenue - totalCost);
  const marginPercent = reportProfitLoss?.margin_percent ?? (totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0);
  const costPerKg = reportProfitLoss?.cost_per_kg ?? 0;

  const chartData = reportFinance?.per_hari.length
    ? reportFinance.per_hari.map(d => ({
        name: d.tanggal ? new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : d.tanggal,
        Pendapatan: d.total_revenue,
      }))
    : [];

  const costBreakdown = reportProfitLoss?.per_kategori ?? [];

  const handleSubmit = () => {
    const jumlah = parseFloat(formJumlah);
    if (isNaN(jumlah) || jumlah <= 0) return;
    onAddOperationalCost({
      tanggal: formTanggal,
      kategori: formKategori,
      jumlah,
      deskripsi: formDeskripsi.trim() || undefined,
    });
    setFormJumlah('');
    setFormDeskripsi('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight font-display">Laporan Keuangan</h2>
          <p className="text-xs text-ink-muted">Analisis profitabilitas dan biaya operasional (data aktual)</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-gradient-to-br from-success/15 to-success/25"
          iconColor="text-success"
          label="Pendapatan Kotor"
          value={formatRupiah(totalRevenue)}
        />
        <KpiCard
          icon={TrendingDown}
          iconBg="bg-gradient-to-br from-error/15 to-error/25"
          iconColor="text-error"
          label="Biaya Operasional"
          value={formatRupiah(totalCost)}
        />
        <KpiCard
          icon={DollarSign}
          iconBg="bg-gradient-to-br from-teal/15 to-teal/25"
          iconColor="text-teal"
          label="Laba Bersih"
          value={formatRupiah(netProfit)}
        />
        <KpiCard
          icon={Percent}
          iconBg="bg-gradient-to-br from-gold/15 to-gold/25"
          iconColor="text-gold"
          label="Margin Profit"
          value={`${marginPercent.toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-extrabold text-ink tracking-tight">Tren Pendapatan</h4>
              <p className="text-xs text-ink-muted">Fluktuasi pendapatan harian periode terpilih</p>
            </div>
            <span className="text-xs font-bold text-ink-muted bg-white/30 px-3 py-1 rounded-full flex items-center gap-1 border border-white/30">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" />
              {PERIOD_LABELS[reportPeriod]}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
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
                <Area type="monotone" dataKey="Pendapatan" stroke="#22c55e" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-ink-muted" />
            <h4 className="text-sm font-extrabold text-ink tracking-tight">Breakdown Biaya</h4>
          </div>
          {costBreakdown.length > 0 ? (
            <div className="space-y-3">
              {costBreakdown.map(item => (
                <div key={item.kategori} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-ink">{KATEGORI_LABELS[item.kategori] || item.kategori}</span>
                    <span className="font-bold text-ink-muted">{formatRupiah(item.total)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light transition-all duration-500"
                      style={{ width: `${Math.min(item.persen, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-white/20 flex justify-between text-xs">
                <span className="font-extrabold text-ink">Biaya per kg</span>
                <span className="font-extrabold text-ink">{formatRupiah(costPerKg)}</span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-xs text-ink-muted text-center">Belum ada biaya operasional pada periode ini</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-ink-muted" />
            <h4 className="text-sm font-extrabold text-ink tracking-tight">Rincian Biaya Operasional</h4>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-navy-deep hover:bg-navy-hover text-white rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Biaya
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2.5 px-3 font-extrabold text-ink-muted uppercase tracking-wider">Tanggal</th>
                <th className="text-left py-2.5 px-3 font-extrabold text-ink-muted uppercase tracking-wider">Kategori</th>
                <th className="text-left py-2.5 px-3 font-extrabold text-ink-muted uppercase tracking-wider">Deskripsi</th>
                <th className="text-right py-2.5 px-3 font-extrabold text-ink-muted uppercase tracking-wider">Jumlah</th>
                <th className="text-right py-2.5 px-3 font-extrabold text-ink-muted uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {operationalCosts.length > 0 ? operationalCosts.map(cost => (
                <tr key={cost.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="py-2.5 px-3 text-ink">{formatDate(cost.tanggal)}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/30 text-ink font-bold text-[10px]">
                      {KATEGORI_LABELS[cost.kategori] || cost.kategori}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-ink-muted">{cost.deskripsi || '-'}</td>
                  <td className="py-2.5 px-3 text-sm font-bold text-ink text-right">{formatRupiah(cost.jumlah)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onDeleteOperationalCost(cost.id)}
                      className="p-1.5 rounded-lg text-error/70 hover:text-error hover:bg-error/10 transition-all duration-200"
                      title="Hapus biaya"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-muted">Belum ada biaya operasional. Klik "Tambah Biaya".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{ width: '450px', maxWidth: 'calc(100vw - 2rem)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.85)', padding: '1.5rem', boxShadow: '0 16px 48px rgba(15,23,42,0.16)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-ink">Tambah Biaya Operasional</h3>
                <p className="text-xs text-ink-muted mt-0.5">Catat pengeluaran operasional laundry</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 text-ink-muted hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Tanggal</label>
                <input
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-white/60 border border-white/40 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Kategori</label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-white/60 border border-white/40 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
                >
                  {KATEGORI_OPTIONS.map(k => (
                    <option key={k} value={k}>{KATEGORI_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Jumlah (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formJumlah}
                  onChange={(e) => setFormJumlah(e.target.value)}
                  placeholder="Contoh: 150000"
                  className="w-full mt-1 px-3 py-2 text-sm bg-white/60 border border-white/40 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Deskripsi (opsional)</label>
                <input
                  type="text"
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Contoh: Deterjen bubuk 5kg"
                  className="w-full mt-1 px-3 py-2 text-sm bg-white/60 border border-white/40 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[13px] font-bold text-ink-muted hover:text-ink rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formJumlah || parseFloat(formJumlah) <= 0}
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
