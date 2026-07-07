import React from 'react';
import { Booking, Transaction, Employee } from '../types';
import { 
  DollarSign, 
  CalendarRange, 
  Clock, 
  Users, 
  Check, 
  X, 
  TrendingUp, 
  Smartphone, 
  Award,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

interface AdminPanelProps {
  bookings: Booking[];
  transactions: Transaction[];
  employees: Employee[];
  verifikasiCount?: number;
  onConfirmBooking: (id: string) => void;
  onRejectBooking: (id: string) => void;
}

export default function AdminPanel({
  bookings,
  transactions,
  employees,
  verifikasiCount = 0,
  onConfirmBooking,
  onRejectBooking
}: AdminPanelProps) {
  // Stats
  const confirmedTransactions = transactions.filter(t => t.status === 'Selesai');
  const totalRevenue = confirmedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingBookings = bookings.filter(b => b.status === 'Menunggu');
  const activeStaffCount = employees.filter(e => e.status === 'Aktif').length;

  // Chart 1: Income Analysis (Weekly)
  const incomeData = [
    { name: 'Senin', amount: 150000 },
    { name: 'Selasa', amount: 280000 },
    { name: 'Rabu', amount: 350000 },
    { name: 'Kamis', amount: 300000 },
    { name: 'Jumat', amount: 480000 },
    { name: 'Sabtu', amount: 620000 },
    { name: 'Minggu', amount: 750000 }
  ];

  // Chart 2: Booking Type Distribution
  const bookingTypeData = [
    { name: 'Cuci Kiloan', value: 45, color: '#0891b2' },
    { name: 'Satuan Specialist', value: 30, color: '#1e40af' },
    { name: 'Koin Self Service', value: 25, color: '#d4a843' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-black text-ink tracking-tight">Admin Operational Panel</h2>
        <p className="text-xs text-ink-muted">Ringkasan harian, antrean booking, dan visualisasi kinerja outlet</p>
      </div>

      {/* Admin Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        
        {/* Card 1: Total Pendapatan */}
        <div className="p-5 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest font-mono">Total Pendapatan</p>
            <h3 className="text-xl font-black text-white tracking-tight">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
            <span className="text-[10px] text-white font-extrabold bg-white/25 px-2.5 py-0.5 rounded-full inline-block mt-1.5 backdrop-blur-md">
              +12.4% vs Kemarin
            </span>
          </div>
          <div className="bg-white/20 text-white p-3 rounded-2xl border border-white/10 z-10 backdrop-blur-md">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Booking Baru */}
        <div className="p-5 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)' }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest font-mono">Booking Baru</p>
            <h3 className="text-xl font-black text-white tracking-tight">{bookings.length} Pesanan</h3>
            <span className="text-[10px] text-white font-extrabold bg-white/25 px-2.5 py-0.5 rounded-full inline-block mt-1.5 backdrop-blur-md">
              {pendingBookings.length} pending
            </span>
          </div>
          <div className="bg-white/20 text-white p-3 rounded-2xl border border-white/10 z-10 backdrop-blur-md">
            <CalendarRange className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Antrean Booking */}
        <div className="p-5 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #d4a843 0%, #c49a38 100%)' }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-black text-yellow-100 uppercase tracking-widest font-mono">Antrean Booking</p>
            <h3 className="text-xl font-black text-white tracking-tight">{pendingBookings.length} Antrean</h3>
            <span className="text-[10px] text-white font-extrabold bg-white/25 px-2.5 py-0.5 rounded-full inline-block mt-1.5 backdrop-blur-md animate-pulse">
              Verifikasi segera
            </span>
          </div>
          <div className="bg-white/20 text-white p-3 rounded-2xl border border-white/10 z-10 backdrop-blur-md">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Verifikasi Pembayaran */}
        {verifikasiCount > 0 && (
          <div className="p-5 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="space-y-1 z-10">
              <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest font-mono">Verifikasi Pembayaran</p>
              <h3 className="text-xl font-black text-white tracking-tight">{verifikasiCount} Menunggu</h3>
              <span className="text-[10px] text-white font-extrabold bg-white/25 px-2.5 py-0.5 rounded-full inline-block mt-1.5 backdrop-blur-md animate-pulse">
                Verifikasi segera
              </span>
            </div>
            <div className="bg-white/20 text-white p-3 rounded-2xl border border-white/10 z-10 backdrop-blur-md">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Card 5: Karyawan Shift */}
        <div className="p-5 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest font-mono">Karyawan Shift</p>
            <h3 className="text-xl font-black text-white tracking-tight">{activeStaffCount} Aktif</h3>
            <span className="text-[10px] text-white font-extrabold bg-white/25 px-2.5 py-0.5 rounded-full inline-block mt-1.5 backdrop-blur-md">
              Dari {employees.length} staff
            </span>
          </div>
          <div className="bg-white/20 text-white p-3 rounded-2xl border border-white/10 z-10 backdrop-blur-md">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Income Area Chart (Span 2) */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-ink">Weekly Income Analysis</h3>
              <p className="text-xs text-ink-muted">Analisis grafik pendapatan kotor harian minggu ini</p>
            </div>
            <span className="text-xs font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-xl border border-teal/15">
              Rp {incomeData.reduce((sum, d) => sum + d.amount, 0).toLocaleString('id-ID')} Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', fontSize: '11px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#0891b2', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Distribution Pie Chart */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Booking Distribution</h3>
            <p className="text-xs text-ink-muted">Distribusi kategori jenis cucian masuk</p>
          </div>

          {/* Recharts Pie */}
          <div className="h-40 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bookingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-ink-muted">Total</span>
              <span className="text-lg font-black text-ink">100%</span>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="space-y-2">
            {bookingTypeData.map((type, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold text-ink-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                  <span>{type.name}</span>
                </div>
                <span>{type.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Pending List */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-white/30 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Booking Menunggu Konfirmasi</h3>
            <p className="text-xs text-ink-muted">Segera verifikasi pesanan yang dipesan melalui aplikasi pelanggan</p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-black text-error bg-error/10 rounded-full border border-error/15">
            {pendingBookings.length} pending
          </span>
        </div>

        <div className="space-y-3">
          {pendingBookings.length === 0 ? (
            <p className="text-xs text-ink-muted py-6 text-center font-medium">Semua booking baru telah dikonfirmasi.</p>
          ) : (
            pendingBookings.map((booking) => (
              <div 
                key={booking.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/25 border border-white/30 rounded-2xl hover:border-teal/20 transition-all gap-4 backdrop-blur-sm"
              >
                {/* Booking Info */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-teal/10 text-teal rounded-xl border border-teal/15 mt-1">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-ink">{booking.customerName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                        booking.memberLevel === 'PLATINUM MEMBER' 
                          ? 'bg-navy-deep text-white'
                          : booking.memberLevel === 'GOLD MEMBER'
                          ? 'bg-gold/15 text-gold border border-gold/20'
                          : 'bg-white/30 text-ink-secondary border border-white/30'
                      }`}>
                        {booking.memberLevel}
                      </span>
                    </div>
                    <div className="text-xs text-ink-muted font-medium">
                      Layanan: <span className="font-bold text-ink-secondary">{booking.layanan}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-ink-muted font-semibold">
                      <span>Tanggal: <span className="text-ink-secondary">{booking.tanggal}</span></span>
                      <span>Shift: <span className="text-ink-secondary">{booking.shift}</span></span>
                      <span>Lokasi: <span className="text-ink-secondary">{booking.lokasiMesin}</span></span>
                    </div>
                  </div>
                </div>

                {/* Confirm/Reject Actions */}
                <div className="flex gap-2 shrink-0 md:self-center">
                  <button
                    onClick={() => onRejectBooking(booking.id_pemesanan || booking.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-error/20 hover:bg-error/5 text-error rounded-xl text-xs font-semibold transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => onConfirmBooking(booking.id_pemesanan || booking.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                    style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Konfirmasi</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
