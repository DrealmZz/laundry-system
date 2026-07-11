import React, { useState } from 'react';
import { CheckCircle2, Clock3, PackageCheck, ArrowRight, Truck, Weight, Package, Check, Calendar, X, Wallet, Banknote, Smartphone, Coins, ShoppingBag } from 'lucide-react';
import { Booking } from '../types';

interface CashierConfirmOrdersProps {
  bookings: Booking[];
  onConfirmPickup: (id: string) => void;
  onConfirmClothes: (id: string) => void;
  onWeigh: (id: string, berat_kg: number) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onPayKoin?: (id: string, metode: string) => void;
  loading?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'koin', label: 'Koin', icon: Coins },
  { value: 'cash', label: 'Tunai', icon: Banknote },
  { value: 'qris', label: 'QRIS', icon: Smartphone },
  { value: 'transfer', label: 'Transfer', icon: Wallet },
];

const PROSES_LABELS: Record<string, string> = {
  'sudah dibayar': 'Sudah Dibayar',
  'diproses': 'Siap Diproses',
  'sedang di cuci': 'Sedang Dicuci',
  'sedang di keringkan': 'Sedang Dikeringkan',
  'sedang di setrika': 'Sedang Disetrika',
  'pencucian selesai': 'Cucian Selesai',
};

export default function CashierConfirmOrders({
  bookings,
  onConfirmPickup,
  onConfirmClothes,
  onWeigh,
  onUpdateStatus,
  onPayKoin,
  loading = false
}: CashierConfirmOrdersProps) {
  const [weighValues, setWeighValues] = useState<Record<string, string>>({});
  const [payModal, setPayModal] = useState<{ booking: Booking; metode: string } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal/30 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  const isKiloan = (b: Booking) => !b.jenis_pencucian || b.jenis_pencucian === 'kiloan';
  const isKoin = (b: Booking) => b.jenis_pencucian === 'koin';

  const pendingOrders = bookings.filter((b) => {
    const raw = b.status_pesanan_raw || '';
    return raw === 'disetujui' && isKiloan(b);
  });

  const pickupOrders = bookings.filter((b) => {
    const raw = b.status_pesanan_raw || '';
    return raw === 'penjemputan' && isKiloan(b);
  });

  const weighOrders = bookings.filter((b) => {
    const raw = b.status_pesanan_raw || '';
    return raw === 'penimbangan' && isKiloan(b);
  });

  const prosesOrders = bookings.filter((b) => {
    const raw = b.status_pesanan_raw || '';
    return ['sudah dibayar', 'diproses', 'sedang di cuci', 'sedang di keringkan', 'sedang di setrika', 'pencucian selesai'].includes(raw) && isKiloan(b);
  });

  const koinOrders = bookings.filter((b) => {
    const raw = b.status_pesanan_raw || '';
    return isKoin(b) && ['disetujui', 'sudah dibayar'].includes(raw);
  });

  const handleWeighChange = (id: string, value: string) => {
    setWeighValues(prev => ({ ...prev, [id]: value }));
  };

  const handleWeighConfirm = (id: string) => {
    const value = weighValues[id];
    if (value && parseFloat(value) > 0) {
      onWeigh(id, parseFloat(value));
      setWeighValues(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const totalPending = pendingOrders.length + pickupOrders.length + weighOrders.length + prosesOrders.length + koinOrders.length;

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-teal">Konfirmasi Kasir</p>
            <h2 className="text-xl font-black text-ink font-display">Pesanan menunggu proses kasir</h2>
            <p className="text-sm text-ink-muted mt-1">
              Proses pesanan, konfirmasi pakaian diterima, dan input berat cucian.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-2 text-sm font-bold text-teal border border-teal/15">
            <Clock3 className="w-4 h-4" />
            {totalPending} menunggu proses
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-[var(--radius-lg)] border border-white/30 bg-white/25 p-4">
            <div className="flex items-center gap-2 text-ink-secondary">
              <Clock3 className="w-4 h-4" />
              <span className="text-sm font-bold">Belum diproses</span>
            </div>
            <p className="mt-2 text-2xl font-black text-ink">{pendingOrders.length}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-white/30 bg-white/25 p-4">
            <div className="flex items-center gap-2 text-ink-secondary">
              <Truck className="w-4 h-4" />
              <span className="text-sm font-bold">Menunggu pakaian</span>
            </div>
            <p className="mt-2 text-2xl font-black text-ink">{pickupOrders.length}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-white/30 bg-white/25 p-4">
            <div className="flex items-center gap-2 text-ink-secondary">
              <Weight className="w-4 h-4" />
              <span className="text-sm font-bold">Menunggu berat</span>
            </div>
            <p className="mt-2 text-2xl font-black text-ink">{weighOrders.length}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-white/30 bg-white/25 p-4">
            <div className="flex items-center gap-2 text-ink-secondary">
              <Package className="w-4 h-4" />
              <span className="text-sm font-bold">Proses Cucian</span>
            </div>
            <p className="mt-2 text-2xl font-black text-ink">{prosesOrders.length}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-white/30 bg-white/25 p-4">
            <div className="flex items-center gap-2 text-ink-secondary">
              <PackageCheck className="w-4 h-4" />
              <span className="text-sm font-bold">Pembayaran Koin</span>
            </div>
            <p className="mt-2 text-2xl font-black text-ink">{koinOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {totalPending === 0 && (
        <div className="glass-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="mt-4 text-base font-black text-ink">Tidak ada pesanan yang perlu diproses</h3>
          <p className="mt-2 text-sm text-ink-muted">Semua pesanan sudah ditangani.</p>
        </div>
      )}

      {/* Section 1: Menunggu Proses */}
      {pendingOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-ink">Menunggu Proses</h3>
          {pendingOrders.map((booking) => (
            <div key={booking.id} className="glass-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-warning/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-warning border border-warning/15">
                      Menunggu proses kasir
                    </span>
                    <span className="text-xs font-bold text-ink-muted">#{booking.id}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-ink">{booking.customerName}</h3>
                    <p className="text-sm text-ink-secondary">
                      Layanan: <span className="font-bold text-ink">{booking.layanan}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                    <span>{booking.tanggal}</span>
                    <span>Shift {booking.shift}</span>
                  </div>
                </div>

                <button
                  onClick={() => onConfirmPickup(booking.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-teal to-teal-light px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Proses Pesanan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Menunggu Konfirmasi Pakaian */}
      {pickupOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-ink">Menunggu Konfirmasi Pakaian</h3>
          {pickupOrders.map((booking) => (
            <div key={booking.id} className="glass-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-700 border border-amber-200">
                      Sedang Dijemput
                    </span>
                    <span className="text-xs font-bold text-ink-muted">#{booking.id}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-ink">{booking.customerName}</h3>
                    <p className="text-sm text-ink-secondary">
                      Layanan: <span className="font-bold text-ink">{booking.layanan}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                    <span>{booking.tanggal}</span>
                    <span>Shift {booking.shift}</span>
                  </div>
                </div>

                <button
                  onClick={() => onConfirmClothes(booking.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  Konfirmasi Pakaian Diterima
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: Menunggu Input Berat */}
      {weighOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-ink">Menunggu Input Berat</h3>
          {weighOrders.map((booking) => (
            <div key={booking.id} className="glass-card p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-blue-700 border border-blue-200">
                    Sedang Ditimbang
                  </span>
                  <span className="text-xs font-bold text-ink-muted">#{booking.id}</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-ink">{booking.customerName}</h3>
                  <p className="text-sm text-ink-secondary">
                    Layanan: <span className="font-bold text-ink">{booking.layanan}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                  <span>{booking.tanggal}</span>
                  <span>Shift {booking.shift}</span>
                </div>

                {/* Input Berat + Konfirmasi */}
                <div className="flex gap-2 items-center pt-2 border-t border-white/20">
                  <div className="relative flex-1 max-w-[160px]">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={weighValues[booking.id] || ''}
                      onChange={(e) => handleWeighChange(booking.id, e.target.value)}
                      placeholder="Berat"
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-sm pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">kg</span>
                  </div>
                  <button
                    onClick={() => handleWeighConfirm(booking.id)}
                    disabled={!weighValues[booking.id] || parseFloat(weighValues[booking.id]) <= 0}
                    className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Konfirmasi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 4: Proses Cucian */}
      {prosesOrders.length > 0 && onUpdateStatus && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-ink">Proses Cucian</h3>
          {prosesOrders.map((booking) => {
            const raw = booking.status_pesanan_raw || '';
            const bid = booking.id_pemesanan || booking.id;
            return (
              <div key={booking.id} className="glass-card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-teal border border-teal/15">
                        {PROSES_LABELS[raw] || raw}
                      </span>
                      <span className="text-xs font-bold text-ink-muted">#{bid}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-ink">{booking.customerName}</h3>
                      <p className="text-sm text-ink-secondary">
                        Layanan: <span className="font-bold text-ink">{booking.layanan}</span>
                        {booking.berat_kg && <span> · {booking.berat_kg} kg</span>}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                      <span>{booking.tanggal}</span>
                      <span>Shift {booking.shift}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {raw === 'sudah dibayar' && onUpdateStatus && (
                      <button
                        onClick={() => onUpdateStatus(bid, 'diproses')}
                        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-teal to-teal-light px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <Package className="w-4 h-4" />
                        Mulai Proses
                      </button>
                    )}
                    {raw === 'diproses' && (
                      <button
                        onClick={() => onUpdateStatus(bid, 'sedang di cuci')}
                        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-teal to-teal-light px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <Package className="w-4 h-4" />
                        Mulai Cuci
                      </button>
                    )}
                    {raw === 'sedang di cuci' && (
                      <button
                        onClick={() => onUpdateStatus(bid, 'sedang di keringkan')}
                        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-teal to-teal-light px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <Package className="w-4 h-4" />
                        Mulai Keringkan
                      </button>
                    )}
                    {raw === 'sedang di keringkan' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(bid, 'sedang di setrika')}
                          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-teal to-teal-light px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                        >
                          <Package className="w-4 h-4" />
                          Mulai Setrika
                        </button>
                        <button
                          onClick={() => onUpdateStatus(bid, 'pencucian selesai')}
                          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-teal/30 px-4 py-2.5 text-sm font-black text-teal shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                        >
                          <Check className="w-4 h-4" />
                          Langsung Selesai
                        </button>
                      </>
                    )}
                    {raw === 'sedang di setrika' && (
                      <button
                        onClick={() => onUpdateStatus(bid, 'pencucian selesai')}
                        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-teal to-teal-light px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <Package className="w-4 h-4" />
                        Selesai Setrika
                      </button>
                    )}
                    {raw === 'pencucian selesai' && (
                      booking.metode_pengambilan === 'pengiriman' ? (
                        booking.tanggal_pengiriman ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-ink-muted bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">
                                Jadwal: {booking.tanggal_pengiriman}
                                <span className="ml-1 capitalize">· {booking.shift_pengiriman}</span>
                              </span>
                            </div>
                            <button
                              onClick={() => onUpdateStatus(bid, 'pengiriman')}
                              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                            >
                              <Truck className="w-4 h-4" />
                              Kirim ke Customer
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 max-w-[180px]">
                            <span className="text-[10px] text-amber-600 font-bold whitespace-nowrap">
                              ⏳ Menunggu customer pilih jadwal
                            </span>
                            <button
                              disabled
                              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gray-300 px-4 py-2.5 text-sm font-black text-gray-500 cursor-not-allowed"
                            >
                              <Truck className="w-4 h-4" />
                              Kirim ke Customer
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs text-ink-muted bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                            <span className="text-teal-700">
                              Cucian siap diambil oleh customer
                            </span>
                          </div>
                          <button
                            onClick={() => onUpdateStatus(bid, 'selesai')}
                            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-teal to-teal-light px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Selesaikan (Sudah Diambil)
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section 5: Pembayaran Koin */}
      {koinOrders.length > 0 && onUpdateStatus && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-ink">Pembayaran Koin</h3>
          {koinOrders.map((booking) => {
            const raw = booking.status_pesanan_raw || '';
            const bid = booking.id_pemesanan || booking.id;
            return (
              <div key={booking.id} className="glass-card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-purple/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-purple border border-purple/15">
                        {raw === 'disetujui' ? 'Menunggu Pembayaran' : raw === 'sudah dibayar' ? 'Sudah Dibayar' : raw}
                      </span>
                      <span className="text-xs font-bold text-ink-muted">#{bid}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-ink">{booking.customerName}</h3>
                      <p className="text-sm text-ink-secondary">
                        Layanan: <span className="font-bold text-ink">{booking.layanan}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                      <span>{booking.tanggal}</span>
                      <span>Shift {booking.shift}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 items-center">
                    {raw === 'disetujui' && (
                      <button
                        onClick={() => setPayModal({ booking, metode: 'koin' })}
                        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        Proses Pembayaran
                      </button>
                    )}
                    {raw === 'sudah dibayar' && (
                      <button
                        onClick={() => onUpdateStatus(bid, 'selesai')}
                        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <Check className="w-4 h-4" />
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 pl-[calc(256px+1rem)]" onClick={() => setPayModal(null)}>
          <div className="glass-card" style={{ width: 'min(600px, calc(100vw - 2rem))', minWidth: '480px' }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-purple">Kasir · Pembayaran</p>
                <h3 className="text-lg font-black text-ink mt-0.5">Konfirmasi Pembayaran Koin</h3>
              </div>
              <button onClick={() => setPayModal(null)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-ink-muted" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="px-6 py-5 space-y-3 border-b border-white/20">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Ringkasan Pesanan</p>
              <div className="bg-white/20 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-secondary">Pelanggan</span>
                  <span className="text-sm font-bold text-ink">{payModal.booking.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-secondary">Layanan</span>
                  <span className="text-sm font-bold text-ink">{payModal.booking.layanan}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/30">
                  <span className="text-sm font-bold text-ink-secondary">Total Tagihan</span>
                  <span className="text-xl font-black text-ink">Rp {(payModal.booking.harga || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="px-6 py-5 space-y-3">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Metode Pembayaran</p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = payModal.metode === pm.value;
                  return (
                    <button
                      key={pm.value}
                      onClick={() => setPayModal({ ...payModal, metode: pm.value })}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-md)] text-sm font-bold transition-all duration-200 ${
                        isSelected
                          ? 'bg-purple/10 text-purple border-2 border-purple/30 shadow-sm'
                          : 'bg-white/20 text-ink-secondary border-2 border-transparent hover:bg-white/30 hover:border-white/40'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-purple' : 'text-ink-muted'}`} />
                      <span>{pm.label}</span>
                      {isSelected && <Check className="w-4 h-4 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-6 py-5 border-t border-white/20">
              <button
                onClick={() => setPayModal(null)}
                className="flex-1 rounded-[var(--radius-md)] bg-white/20 px-4 py-3 text-sm font-bold text-ink-secondary hover:bg-white/30 transition-all border border-white/30"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const modal = payModal;
                  setPayModal(null);
                  onPayKoin?.(modal.booking.id_pemesanan || modal.booking.id, modal.metode);
                }}
                className="flex-1 rounded-[var(--radius-md)] bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-black text-white shadow-subtle hover:-translate-y-0.5 transition-transform"
              >
                Bayar Rp {(payModal.booking.harga || 0).toLocaleString('id-ID')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
