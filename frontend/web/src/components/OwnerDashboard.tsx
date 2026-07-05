import React from 'react';
import { Transaction } from '../types';
import { 
  TrendingUp, 
  ShoppingBag, 
  Coins, 
  Calendar, 
  Award,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import KpiCard from './ui/KpiCard';

interface OwnerDashboardProps {
  transactions: Transaction[];
}

export default function OwnerDashboard({ transactions }: OwnerDashboardProps) {
  // Calculations
  const completedTx = transactions.filter(t => t.status === 'Selesai');
  const todayRevenue = completedTx.reduce((sum, t) => sum + t.amount, 0);
  const totalOrders = transactions.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(todayRevenue / totalOrders) : 0;

  // Chart data: Monthly / Weekly Revenue trend
  const revenueTrendData = [
    { name: 'Minggu 1', Pendapatan: 3800000, Transaksi: 45 },
    { name: 'Minggu 2', Pendapatan: 4200000, Transaksi: 52 },
    { name: 'Minggu 3', Pendapatan: 4900000, Transaksi: 60 },
    { name: 'Minggu 4', Pendapatan: todayRevenue * 15 || 5800000, Transaksi: totalOrders * 12 || 75 }
  ];

  // Shift performance data
  const shiftPerformance = [
    { shift: 'Shift Pagi (Andi Pratama)', sales: 'Rp 420.000', count: 12, percent: 85, color: 'bg-gradient-to-r from-[#0891b2] to-teal-light' },
    { shift: 'Shift Siang (Budi Hartono)', sales: 'Rp 280.000', count: 8, percent: 55, color: 'bg-gradient-to-r from-[#1e40af] to-[#3b82f6]' },
    { shift: 'Shift Sore (Lestari Putri)', sales: 'Rp 390.000', count: 11, percent: 78, color: 'bg-gradient-to-r from-gold to-gold-light' },
    { shift: 'Shift Malam (Ahmad Ridwan)', sales: 'Rp 150.000', count: 4, percent: 30, color: 'bg-gradient-to-r from-error to-[#f87171]' }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-black text-ink tracking-tight font-display">Owner Executive Dashboard</h2>
        <p className="text-xs text-ink-muted">Analisis metrik keuangan eksekutif, volume transaksi, profitabilitas, dan audit log harian</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-gradient-to-br from-success/15 to-success/25"
          iconColor="text-success"
          label="Pendapatan Hari Ini"
          value={`Rp ${todayRevenue.toLocaleString('id-ID')}`}
          trend={{ value: '+18.2%', positive: true }}
        />
        <KpiCard
          icon={ShoppingBag}
          iconBg="bg-gradient-to-br from-teal/15 to-teal/25"
          iconColor="text-teal"
          label="Volume Transaksi"
          value={`${totalOrders} Pesanan`}
          trend={{ value: '+5.4%', positive: true }}
        />
        <KpiCard
          icon={Coins}
          iconBg="bg-gradient-to-br from-gold/15 to-gold/25"
          iconColor="text-gold"
          label="Nilai Rata-rata Order"
          value={`Rp ${avgOrderValue.toLocaleString('id-ID')}`}
          trend={{ value: '-1.2%', positive: false }}
        />
        <KpiCard
          icon={Award}
          iconBg="bg-gradient-to-br from-[#6366f1]/15 to-[#6366f1]/25"
          iconColor="text-[#6366f1]"
          label="Profit Margin Kotor"
          value="38.5% Margin"
          trend={{ value: 'Target 35%', positive: true }}
        />
      </div>

      {/* Main Grid: Left Revenue Trend Bar Chart, Right Shift Performance Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Revenue Trend Chart (Span 2) */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-extrabold text-ink tracking-tight">Grafik Kinerja Omzet (Mingguan)</h4>
              <p className="text-xs text-ink-muted">Analisis fluktuasi omzet kotor outlet laundaja bulan ini</p>
            </div>
            <span className="text-xs font-bold text-ink-muted bg-white/30 px-3 py-1 rounded-full flex items-center gap-1 border border-white/30">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" />
              Juni 2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  formatter={(v: any) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']}
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

        {/* Right Shift Performance progress bars */}
        <div className="glass-card p-6 space-y-5">
          <div>
            <h4 className="text-sm font-extrabold text-ink tracking-tight">Kinerja Shift Kasir</h4>
            <p className="text-xs text-ink-muted">Kontribusi penjualan berdasarkan jam kerja operasional</p>
          </div>

          <div className="space-y-4">
            {shiftPerformance.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-ink">{item.shift.split(' ')[0]} {item.shift.split(' ')[1]}</span>
                  <div className="space-x-1.5">
                    <span className="font-black text-ink">{item.sales}</span>
                    <span className="text-ink-muted font-semibold text-[10px]">({item.count} order)</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden border border-white/15">
                  <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-ink-muted font-mono font-bold">
                  <span>{item.shift.split('(')[1].replace(')', '')}</span>
                  <span>{item.percent}% dari target</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Audit Log Transactions */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/30 pb-4">
          <div>
            <h4 className="text-sm font-extrabold text-ink tracking-tight">Sistem Audit Log Realtime</h4>
            <p className="text-xs text-ink-muted">Arus log aktivitas kasir dan mutasi transaksi terverifikasi</p>
          </div>
          <span className="text-[10px] bg-success/10 text-success font-extrabold border border-success/15 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Keamanan Terenkripsi
          </span>
        </div>

        <div className="divide-y divide-white/20">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3.5 text-xs hover:bg-white/10 transition-colors rounded-lg px-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-deep to-navy-medium text-white flex items-center justify-center font-black text-[11px]">
                  {tx.customerInitial}
                </div>
                <div>
                  <p className="font-bold text-ink-secondary">Pelanggan <span className="text-ink font-extrabold">{tx.customerName}</span> membayar dengan {tx.paymentMethod}</p>
                  <p className="text-[10px] text-ink-muted font-mono font-semibold mt-0.5">ID Transaksi: {tx.id} • Kasir Bertugas: {tx.cashierName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-ink">Rp {tx.amount.toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-ink-muted font-mono font-bold mt-0.5">{tx.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
