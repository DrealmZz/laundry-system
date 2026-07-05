import React from 'react';
import { Transaction } from '../types';
import { ArrowLeft, Printer, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';

interface ReceiptPrintProps {
  transaction: Transaction | null;
  onBack: () => void;
}

export default function ReceiptPrint({ transaction, onBack }: ReceiptPrintProps) {
  if (!transaction) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-ink-muted">Transaksi tidak ditemukan.</p>
        <button onClick={onBack} className="text-xs font-bold text-teal hover:underline">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Parse cash and change
  const subtotal = transaction.amount;
  const discount = 0; // standard display
  const total = transaction.amount;
  const cashPaid = transaction.paymentMethod === 'Cash' ? (total + 5000) : total; // simulated change
  const change = cashPaid - total;

  const handlePrint = () => {
    alert('Mengirimkan data cetak ke Printer Thermal Epson TM-T82...');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-white/30 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => alert(`Mengirimkan struk ke nomor WhatsApp pelanggan...`)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-success/15 bg-success/10 text-success hover:bg-success/15 text-xs font-semibold transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kirim WA</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl btn-primary-gradient text-white font-semibold text-xs shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>

      {/* THERMAL RECEIPT CONTAINER */}
      <div className="bg-white border border-slate-200/80 shadow-lg rounded-2xl p-6 font-mono text-xs text-slate-800 space-y-4 max-w-xs mx-auto relative overflow-hidden">
        {/* Decorative receipt cuts */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-100" />
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-900">
            <Sparkles className="w-4 h-4 text-teal fill-teal" />
            <span className="font-black text-sm tracking-wider">laundaja</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Jl. Pangeran Antasari No. 45<br />
            Jakarta Selatan, DKI Jakarta<br />
            Telp: (021) 7890-4455
          </p>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Transaction Metadata */}
        <div className="space-y-1 text-[10px] text-slate-600">
          <div className="flex justify-between">
            <span>No. Struk :</span>
            <span className="font-bold text-slate-900">{transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal   :</span>
            <span>{transaction.date || '30 Jun 2026'} {transaction.time}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir     :</span>
            <span>{transaction.cashierName || 'Andi Pratama'}</span>
          </div>
          <div className="flex justify-between">
            <span>Pelanggan :</span>
            <span className="font-bold text-slate-900">{transaction.customerName}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Receipt Item List */}
        <div className="space-y-2">
          <div className="font-bold text-slate-900 flex justify-between">
            <span>LAYANAN / ITEM</span>
            <span>TOTAL</span>
          </div>
          
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between items-start gap-3">
              <span className="leading-tight">{transaction.serviceName}</span>
              <span className="font-bold shrink-0">Rp {transaction.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {transaction.weightOrQty} {transaction.serviceType === 'Koin' ? 'Siklus' : 'kg'} x Rp {(transaction.amount / transaction.weightOrQty).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Calculations */}
        <div className="space-y-1.5 text-slate-700">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Diskon Member:</span>
            <span>-Rp {discount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-950 text-[13px] border-t border-dashed border-slate-200 pt-1.5">
            <span>TOTAL:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Metode Bayar:</span>
            <span className="font-bold">{transaction.paymentMethod}</span>
          </div>
          
          {transaction.paymentMethod === 'Cash' ? (
            <>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Tunai Diterima:</span>
                <span>Rp {cashPaid.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px] text-success font-bold">
                <span>Kembalian:</span>
                <span>Rp {change.toLocaleString('id-ID')}</span>
              </div>
            </>
          ) : (
            <div className="text-[9px] text-success font-bold bg-success/10 px-2 py-1 rounded text-center border border-success/15">
              PEMBAYARAN QRIS TERVERIFIKASI
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-slate-300 my-2" />

        {/* Receipt Footer */}
        <div className="text-center space-y-2 text-[9px] text-slate-400 leading-tight">
          <p className="font-bold text-slate-600">*** TERIMA KASIH ***</p>
          <p>
            Pakaian bersih, wangi, dan higienis<br />
            adalah komitmen utama kami.
          </p>
            <p>
            Periksa kembali cucian Anda sebelum<br />
            meninggalkan outlet laundaja.
          </p>
          <div className="pt-2">
            {/* Simulated barcode */}
            <div className="h-6 w-full bg-slate-200 flex items-center justify-center select-none text-[8px] font-bold text-slate-400 tracking-[0.25em]">
              |||I|||I|||II||||||I|II|||I|||I
            </div>
            <span className="text-[7px] text-slate-400 font-mono">LW-POS-{transaction.id.replace('#', '')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
