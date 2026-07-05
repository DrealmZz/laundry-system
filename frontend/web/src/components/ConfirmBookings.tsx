import React, { useState } from 'react';
import { Booking } from '../types';
import { Check, X, Calendar, User, Sliders, Layers, Smartphone, BadgeAlert } from 'lucide-react';

interface ConfirmBookingsProps {
  bookings: Booking[];
  onConfirmBooking: (id: string) => void;
  onRejectBooking: (id: string) => void;
}

export default function ConfirmBookings({
  bookings,
  onConfirmBooking,
  onRejectBooking
}: ConfirmBookingsProps) {
  const [activeTab, setActiveTab] = useState<'Menunggu' | 'Konfirmasi' | 'Tolak' | 'Dibatalkan'>('Menunggu');

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Konfirmasi Booking Pelanggan</h2>
          <p className="text-xs text-ink-muted">Persetujuan pesanan laundry masuk lewat aplikasi online</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/20 p-1 rounded-xl border border-white/30 backdrop-blur-sm self-start">
          {(['Menunggu', 'Konfirmasi', 'Tolak', 'Dibatalkan'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white/70 text-teal shadow-sm backdrop-blur-sm'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              {tab === 'Menunggu' ? 'Menunggu' : tab === 'Konfirmasi' ? 'Dikonfirmasi' : tab === 'Tolak' ? 'Ditolak' : 'Dibatalkan'}
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-white/30 text-ink-secondary font-bold border border-white/20">
                {bookings.filter(b => b.status === tab).length}
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
            {filteredBookings.map((booking) => (
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
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                          booking.memberLevel === 'PLATINUM MEMBER' 
                            ? 'bg-navy-deep text-white'
                            : booking.memberLevel === 'GOLD MEMBER'
                            ? 'bg-gold/15 text-gold border border-gold/20'
                            : 'bg-white/30 text-ink-secondary border border-white/20'
                        }`}>
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
                </div>

                {/* Actions bottom */}
                {activeTab === 'Menunggu' ? (
                  <div className="flex gap-2 border-t border-white/20 pt-3">
                    <button
                      onClick={() => onRejectBooking(booking.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-error/20 hover:bg-error/5 text-error rounded-xl text-xs font-bold transition-all duration-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                    <button
                      onClick={() => onConfirmBooking(booking.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terima</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-white/20 pt-2 flex justify-between items-center text-[10px] font-bold">
                    <span className="text-ink-muted">Status Booking:</span>
                    <span className={`px-2 py-0.5 rounded ${
                      activeTab === 'Konfirmasi' 
                        ? 'bg-success/10 text-success border border-success/15' 
                        : activeTab === 'Dibatalkan'
                        ? 'bg-warning/10 text-warning border border-warning/15'
                        : 'bg-error/10 text-error border border-error/15'
                    }`}>
                      {activeTab === 'Konfirmasi' ? 'DISETUJUI' : activeTab === 'Dibatalkan' ? 'DIBATALKAN' : 'DITOLAK'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
