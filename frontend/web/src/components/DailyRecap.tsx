import React, { useState, useCallback } from 'react';
import { Transaction } from '../types';
import {
  PiggyBank,
  Coins,
  CreditCard,
  Activity,
  FileCheck,
  Calculator,
  CheckCircle2,
} from 'lucide-react';

interface DailyRecapProps {
  transactions: Transaction[];
}

export default function DailyRecap({ transactions }: DailyRecapProps) {
  const [openingCash, setOpeningCash] = useState<number>(500000);
  const [actualCash, setActualCash] = useState<string>('950000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const completedTx = transactions.filter(t => t.status === 'Selesai');
  const todayTotal = transactions.reduce((sum, t) => sum + t.amount, 0);

  const qrisTotal = transactions
    .filter(t => t.paymentMethod === 'QRIS')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashTotal = transactions
    .filter(t => t.paymentMethod === 'Cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalKg = transactions
    .filter(t => t.serviceType === 'Kiloan')
    .reduce((sum, t) => sum + t.weightOrQty, 0);
  const totalQty = transactions
    .filter(t => t.serviceType === 'Satuan')
    .reduce((sum, t) => sum + t.weightOrQty, 0);

  const expectedClosingCash = openingCash + cashTotal;
  const actualCashNum = Math.max(0, parseFloat(actualCash) || 0);
  const variance = actualCashNum - expectedClosingCash;

  const cashPercent = todayTotal > 0 ? (cashTotal / todayTotal) * 100 : 0;
  const qrisPercent = todayTotal > 0 ? (qrisTotal / todayTotal) * 100 : 0;

  const handleOpeningCashChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') { setOpeningCash(0); return; }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 999_999_999) {
      setOpeningCash(num);
    }
  }, []);

  const handleActualCashChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 12) {
      setActualCash(val);
    }
  }, []);

  const handleSubmitRecap = () => {
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-black text-ink tracking-tight">Rekapitulasi Harian Kasir</h2>
        <p className="text-xs text-ink-muted mt-1">Ikhtisar rekonsiliasi keuangan, volume cucian, dan laci kasir hari ini</p>
      </div>

      {/* Grid of 3 key financial summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 flex items-center gap-4 group hover:shadow-glass-lg transition-all duration-300">
          <div className="p-3.5 bg-teal/10 text-teal rounded-[var(--radius-lg)] border border-teal/15">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-muted uppercase tracking-wider font-mono">Total Penjualan</p>
            <h3 className="text-xl font-black text-ink">Rp {todayTotal.toLocaleString('id-ID')}</h3>
            <p className="text-[11px] text-ink-muted font-mono mt-0.5">{transactions.length} transaksi</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 group hover:shadow-glass-lg transition-all duration-300">
          <div className="p-3.5 bg-gold/10 text-gold rounded-[var(--radius-lg)] border border-gold/15">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-muted uppercase tracking-wider font-mono">Ekspektasi Tunai</p>
            <h3 className="text-xl font-black text-gold">Rp {expectedClosingCash.toLocaleString('id-ID')}</h3>
            <p className="text-[11px] text-ink-muted font-mono mt-0.5">Modal: Rp {openingCash.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 group hover:shadow-glass-lg transition-all duration-300">
          <div className="p-3.5 bg-success/10 text-success rounded-[var(--radius-lg)] border border-success/15">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-muted uppercase tracking-wider font-mono">Volume Laundry</p>
            <h3 className="text-xl font-black text-success">{totalKg} kg + {totalQty} pcs</h3>
            <p className="text-[11px] text-ink-muted font-mono mt-0.5">Optimalisasi mesin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Cash Reconciliation Form */}
        <div className="lg:col-span-3 glass-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Rekonsiliasi Laci Kasir</h3>
            <p className="text-xs text-ink-muted mt-1">Verifikasi fisik nominal uang tunai di mesin laci kasir</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="opening-cash" className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                Modal Awal Laci (Float)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">Rp</span>
                <input
                  id="opening-cash"
                  type="number"
                  value={openingCash}
                  onChange={handleOpeningCashChange}
                  min={0}
                  max={999999999}
                  className="w-full glass-input rounded-[var(--radius-md)] py-2.5 pl-9 pr-4 text-xs font-bold text-ink-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="actual-cash" className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                Uang Tunai Fisik (Closing)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">Rp</span>
                <input
                  id="actual-cash"
                  type="text"
                  inputMode="numeric"
                  value={actualCash ? parseInt(actualCash).toLocaleString('id-ID') : ''}
                  onChange={handleActualCashChange}
                  placeholder="0"
                  className="w-full glass-input rounded-[var(--radius-md)] py-2.5 pl-9 pr-4 text-xs font-bold text-ink-secondary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Variance Results */}
          <div className="bg-white/20 rounded-[var(--radius-lg)] p-4 border border-white/30 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-black text-ink-muted uppercase tracking-wider font-mono">Hasil Selisih</p>
              <span className={`text-sm font-black ${
                variance === 0 ? 'text-success' : variance > 0 ? 'text-teal' : 'text-error'
              }`}>
                {variance === 0
                  ? 'Seimbang (Sesuai)'
                  : variance > 0
                    ? `Lebih Rp ${variance.toLocaleString('id-ID')}`
                    : `Kurang Rp ${Math.abs(variance).toLocaleString('id-ID')}`}
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="text-ink-muted font-semibold">Toleransi: </span>
              <span className="font-bold text-ink-secondary bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] border border-white/20">Rp 0</span>
            </div>
          </div>

          <button
            onClick={handleSubmitRecap}
            disabled={isSubmitting || submitted}
            className={`w-full py-3 font-bold text-xs rounded-[var(--radius-md)] flex items-center justify-center gap-2 transition-all duration-200 shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
              submitted ? 'bg-success/10 text-success border border-success/15' : 'btn-primary-gradient'
            }`}
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Rekap Terkirim</span>
              </>
            ) : isSubmitting ? (
              <span>Mengirim...</span>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Kunci & Kirim Rekap Harian</span>
              </>
            )}
          </button>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Kanal Pembayaran</h3>
            <p className="text-xs text-ink-muted mt-1">Alokasi penerimaan omzet berdasarkan metode</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink-secondary">
                <span className="flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-gold" /> Tunai</span>
                <span>Rp {cashTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden border border-white/15">
                <div className="bg-gradient-to-r from-gold to-gold-light h-full rounded-full transition-all duration-300" style={{ width: `${cashPercent}%` }} role="progressbar" aria-valuenow={cashPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Tunai ${cashPercent.toFixed(0)}%`} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink-secondary">
                <span className="flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5 text-teal" /> QRIS</span>
                <span>Rp {qrisTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden border border-white/15">
                <div className="bg-gradient-to-r from-teal to-teal-light h-full rounded-full transition-all duration-300" style={{ width: `${qrisPercent}%` }} role="progressbar" aria-valuenow={qrisPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`QRIS ${qrisPercent.toFixed(0)}%`} />
              </div>
            </div>
          </div>

          <div className="bg-white/15 rounded-[var(--radius-lg)] p-3.5 border border-white/20 mt-4 space-y-1.5 text-[11px] text-ink-secondary backdrop-blur-sm">
            <div className="flex justify-between font-bold">
              <span>QRIS Terverifikasi</span>
              <span className="text-success">Active</span>
            </div>
              <p className="leading-relaxed text-ink-muted">
              Semua nominal e-wallet diproses realtime via gerbang payment QRIS Dinamis laundaja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
