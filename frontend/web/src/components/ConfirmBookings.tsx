import React, { useState } from 'react';
import { Booking } from '../types';
import { Check, X, Calendar, User, Layers, BadgeAlert, Truck, Weight, Package, Clock } from 'lucide-react';

interface ConfirmBookingsProps {
  bookings: Booking[];
  onConfirmBooking: (id: string) => void;
  onRejectBooking: (id: string, reason: string) => void;
  onConfirmPickup: (id: string) => void;
  onWeigh: (id: string, berat_kg: number) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

const TABS = ['Menunggu', 'Disetujui', 'Dijemput', 'Menunggu Bayar', 'Diproses', 'Dikirim', 'Selesai', 'Tolak', 'Dibatalkan'] as const;
type TabType = typeof TABS[number];

export default function ConfirmBookings({
  bookings,
  onConfirmBooking,
  onRejectBooking,
  onConfirmPickup,
  onWeigh,
  onUpdateStatus
}: ConfirmBookingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Menunggu');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [weighDialogOpen, setWeighDialogOpen] = useState(false);
  const [weighingId, setWeighingId] = useState<string | null>(null);
  const [weighValue, setWeighValue] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const raw = b.status_pesanan_raw || '';
    switch (activeTab) {
      case 'Menunggu': return raw === 'menunggu konfirmasi';
      case 'Disetujui': return raw === 'disetujui';
      case 'Dijemput': return raw === 'penjemputan' || raw === 'penimbangan';
      case 'Menunggu Bayar': return raw === 'menunggu pembayaran';
      case 'Diproses': return ['sudah dibayar', 'diproses', 'sedang di cuci', 'sedang di keringkan', 'sedang di setrika', 'pencucian selesai'].includes(raw);
      case 'Dikirim': return raw === 'pengiriman';
      case 'Selesai': return raw === 'selesai';
      case 'Tolak': return raw === 'pesanan ditolak';
      case 'Dibatalkan': return raw === 'pesanan dibatalkan';
      default: return false;
    }
  });

  const getTabCount = (tab: TabType) => {
    return bookings.filter((b) => {
      const raw = b.status_pesanan_raw || '';
      switch (tab) {
        case 'Menunggu': return raw === 'menunggu konfirmasi';
        case 'Disetujui': return raw === 'disetujui';
        case 'Dijemput': return raw === 'penjemputan' || raw === 'penimbangan';
        case 'Menunggu Bayar': return raw === 'menunggu pembayaran';
        case 'Diproses': return ['sudah dibayar', 'diproses', 'sedang di cuci', 'sedang di keringkan', 'sedang di setrika', 'pencucian selesai'].includes(raw);
        case 'Dikirim': return raw === 'pengiriman';
        case 'Selesai': return raw === 'selesai';
        case 'Tolak': return raw === 'pesanan ditolak';
        case 'Dibatalkan': return raw === 'pesanan dibatalkan';
        default: return false;
      }
    }).length;
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (rejectingId && rejectReason.trim()) {
      onRejectBooking(rejectingId, rejectReason.trim());
      setRejectDialogOpen(false);
      setRejectReason('');
      setRejectingId(null);
    }
  };

  const handleRejectCancel = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
    setRejectingId(null);
  };

  const handleWeighClick = (id: string) => {
    setWeighingId(id);
    setWeighDialogOpen(true);
    setWeighValue('');
  };

  const handleWeighConfirm = () => {
    if (weighingId && weighValue && parseFloat(weighValue) > 0) {
      onWeigh(weighingId, parseFloat(weighValue));
      setWeighDialogOpen(false);
      setWeighingId(null);
      setWeighValue('');
    }
  };

  const handleWeighCancel = () => {
    setWeighDialogOpen(false);
    setWeighingId(null);
    setWeighValue('');
  };

  const getDiprosesAction = (booking: Booking) => {
    const raw = booking.status_pesanan_raw || '';
    const id = booking.id_pemesanan || booking.id;

    if (raw === 'sudah dibayar') {
      return (
        <div className="flex gap-2 w-full">
          <button
            onClick={() => onUpdateStatus(id, 'diproses')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Verifikasi Pembayaran</span>
          </button>
        </div>
      );
    }
    return null;
  };

  const getDiprosesStatusLabel = (raw: string) => {
    const labels: Record<string, string> = {
      'sudah dibayar': 'Sudah Dibayar',
      'diproses': 'Diproses',
      'sedang di cuci': 'Sedang Dicuci',
      'sedang di keringkan': 'Sedang Dikeringkan',
      'sedang di setrika': 'Sedang Disetrika',
      'pencucian selesai': 'Pencucian Selesai',
    };
    return labels[raw] || raw;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Konfirmasi Booking Pelanggan</h2>
          <p className="text-xs text-ink-muted">Persetujuan pesanan laundry masuk lewat aplikasi online</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/20 p-1 rounded-xl border border-white/30 backdrop-blur-sm self-start flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white/70 text-teal shadow-sm backdrop-blur-sm'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              {tab}
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] bg-white/30 text-ink-secondary font-bold border border-white/20">
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Display */}
      <div className="glass-card p-5 space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <BadgeAlert className="w-8 h-8 text-ink-muted/30 mx-auto" />
            <p className="text-xs text-ink-muted font-medium">Tidak ada data booking dengan status ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((booking) => {
              const raw = booking.status_pesanan_raw || '';
              const id = booking.id_pemesanan || booking.id;

              return (
                <div
                  key={booking.id}
                  className="p-4 bg-white/25 border border-white/30 hover:border-teal/20 rounded-2xl flex flex-col justify-between space-y-4 backdrop-blur-sm transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Top line: Name & Level */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal/10 border border-teal/15 text-teal flex items-center justify-center font-bold text-xs">
                          {booking.customerName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-ink">{booking.customerName}</h4>
                          <span className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-white/30 text-ink-secondary border border-white/20">
                            {booking.memberLevel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-ink-muted font-bold">
                        {booking.id}
                      </span>
                    </div>

                    {/* Booking details */}
                    <div className="space-y-1.5 text-xs text-ink-secondary border-t border-white/20 pt-2.5">
                      <p className="font-semibold">
                        Layanan: <span className="text-ink">{booking.layanan}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-ink-muted font-bold">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-ink-muted/50" />
                          <span>{booking.tanggal}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-ink-muted/50" />
                          <span>{booking.shift}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-ink-muted font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-ink-muted/50" />
                        <span>{booking.lokasiMesin}</span>
                      </div>
                    </div>

                    {/* Info berat & harga (tab Menunggu Bayar & Diproses) */}
                    {(activeTab === 'Menunggu Bayar' || activeTab === 'Diproses') && booking.berat_kg && (
                      <div className="bg-teal/5 border border-teal/10 rounded-lg p-2.5 text-[10px]">
                        <div className="flex justify-between font-bold">
                          <span className="text-ink-muted">Berat:</span>
                          <span className="text-ink">{booking.berat_kg} kg</span>
                        </div>
                      </div>
                    )}

                    {/* Info jadwal pengiriman (tab Dikirim) */}
                    {activeTab === 'Dikirim' && booking.tanggal_pengiriman && (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 text-[10px]">
                        <div className="flex items-center gap-1 font-bold text-green-700 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>Jadwal Pengiriman</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-muted">Tanggal:</span>
                          <span className="text-ink font-bold">{booking.tanggal_pengiriman}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-muted">Shift:</span>
                          <span className="text-ink font-bold capitalize">{booking.shift_pengiriman}</span>
                        </div>
                      </div>
                    )}

                    {/* Status label (tab Dijemput & Diproses) */}
                    {activeTab === 'Dijemput' && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-[10px] font-bold text-amber-700">
                        {raw === 'penjemputan' ? 'Menunggu pakaian sampai' : 'Berat sudah diinput: ' + booking.berat_kg + ' kg'}
                      </div>
                    )}

                    {activeTab === 'Diproses' && (
                      <div className={`rounded-lg p-2 text-[10px] font-bold ${
                        raw === 'sudah dibayar'
                          ? 'bg-amber-50 border border-amber-100 text-amber-700'
                          : 'bg-blue-50 border border-blue-100 text-blue-700'
                      }`}>
                        Status: {getDiprosesStatusLabel(raw)}
                        {raw === 'sudah dibayar' && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[8px] font-bold">
                            MENUNGGU VERIFIKASI
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions bottom */}
                  {activeTab === 'Menunggu' && (
                    <div className="flex gap-2 border-t border-white/20 pt-3">
                      <button
                        onClick={() => handleRejectClick(id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-error/20 hover:bg-error/5 text-error rounded-xl text-xs font-bold transition-all duration-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                      <button
                        onClick={() => onConfirmBooking(id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  )}

                  {activeTab === 'Disetujui' && (
                    <div className="flex gap-2 border-t border-white/20 pt-3">
                      <button
                        onClick={() => handleRejectClick(id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-error/20 hover:bg-error/5 text-error rounded-xl text-xs font-bold transition-all duration-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                      <button
                        onClick={() => onConfirmPickup(id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Konfirmasi Jemput</span>
                      </button>
                    </div>
                  )}

                  {activeTab === 'Dijemput' && raw === 'penjemputan' && (
                    <div className="flex gap-2 border-t border-white/20 pt-3">
                      <button
                        onClick={() => handleWeighClick(id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
                      >
                        <Weight className="w-3.5 h-3.5" />
                        <span>Pakaian Sampai - Input Berat</span>
                      </button>
                    </div>
                  )}

                  {activeTab === 'Diproses' && (
                    <div className="flex gap-2 border-t border-white/20 pt-3">
                      {getDiprosesAction(booking)}
                    </div>
                  )}

                  {(activeTab === 'Menunggu Bayar' || activeTab === 'Dikirim' || activeTab === 'Selesai' || activeTab === 'Tolak' || activeTab === 'Dibatalkan' || (activeTab === 'Dijemput' && raw === 'penimbangan')) && (
                    <div className="border-t border-white/20 pt-2 flex justify-end items-center text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        activeTab === 'Selesai'
                          ? 'bg-success/10 text-success border border-success/15'
                          : activeTab === 'Dibatalkan'
                          ? 'bg-warning/10 text-warning border border-warning/15'
                          : activeTab === 'Tolak'
                          ? 'bg-error/10 text-error border border-error/15'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {activeTab === 'Menunggu Bayar' ? 'MENUNGGU BAYAR' : activeTab === 'Dikirim' ? 'DIKIRIM' : activeTab === 'Selesai' ? 'SELESAI' : activeTab === 'Tolak' ? 'DITOLAK' : activeTab === 'Dibatalkan' ? 'DIBATALKAN' : 'SUDAH DITIMBANG'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      {rejectDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-ink mb-4">Alasan Penolakan</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan pesanan..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none h-24 text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRejectCancel}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2 bg-error text-white rounded-xl text-sm font-bold hover:bg-error/90 disabled:opacity-50"
              >
                Tolak Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weigh Dialog */}
      {weighDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-ink mb-2">Input Berat Pakaian</h3>
            <p className="text-xs text-ink-muted mb-4">Masukkan berat pakaian yang sudah diterima dari kurir.</p>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weighValue}
                onChange={(e) => setWeighValue(e.target.value)}
                placeholder="Contoh: 5.5"
                className="w-full p-3 border border-gray-300 rounded-xl text-sm pr-12"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-bold">kg</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleWeighCancel}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleWeighConfirm}
                disabled={!weighValue || parseFloat(weighValue) <= 0}
                className="flex-1 py-2 text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
              >
                Simpan & Kirim Notif
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
