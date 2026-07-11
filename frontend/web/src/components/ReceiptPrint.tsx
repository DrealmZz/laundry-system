import React, { useState } from 'react';
import { Transaction } from '../types';
import { ArrowLeft, Printer, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { showToast } from './Toast';

interface ReceiptPrintProps {
  transaction: Transaction | null;
  onBack: () => void;
}

export default function ReceiptPrint({ transaction, onBack }: ReceiptPrintProps) {
  const [printing, setPrinting] = useState(false);

  if (!transaction) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 space-y-4">
        <p className="text-sm text-ink-muted">Transaksi tidak ditemukan.</p>
        <button onClick={onBack} className="text-xs font-bold text-teal hover:underline">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const total = transaction.amount;
  const unitPrice = transaction.weightOrQty > 0 ? Math.round(transaction.amount / transaction.weightOrQty) : 0;

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const printId = transaction.id_transaksi || transaction.id;
      const authRole = localStorage.getItem('lw_auth_role');
      const token = authRole ? localStorage.getItem(`lw_token_${authRole}`) : null;
      const response = await fetch(`http://localhost:3000/api/v1/transaksi/${printId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/pdf')) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        } else {
          throw new Error('Server mengembalikan bukan PDF');
        }
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (error: any) {
      console.error('Error printing receipt:', error);
      showToast('PDF tidak tersedia, menggunakan cetak browser', 'error');
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="space-y-6" style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-white/30 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-bold text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="flex gap-2">
          <button
            disabled
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-ink-muted text-xs font-semibold cursor-not-allowed"
            title="Fitur kirim WhatsApp akan segera tersedia"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim WA</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl btn-primary-gradient text-white font-semibold text-xs shadow-md transition-all disabled:opacity-60"
          >
            {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            <span>{printing ? 'Membuat PDF...' : 'Cetak Struk'}</span>
          </button>
        </div>
      </div>

      {/* THERMAL RECEIPT CONTAINER */}
      <div className="bg-white border border-slate-200/80 shadow-lg rounded-2xl p-6 font-mono text-xs text-slate-800 space-y-4 relative" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-100" />

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

        <div className="border-t border-dashed border-slate-300 my-2" />

        <div className="space-y-1 text-[10px] text-slate-600">
          <div className="flex justify-between">
            <span>No. Struk :</span>
            <span className="font-bold text-slate-900">{transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal   :</span>
            <span>{transaction.date || '-'} {transaction.time || ''}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir     :</span>
            <span>{transaction.cashierName || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>Pelanggan :</span>
            <span className="font-bold text-slate-900">{transaction.customerName || '-'}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300 my-2" />

        <div className="space-y-2">
          <div className="font-bold text-slate-900 flex justify-between">
            <span>LAYANAN / ITEM</span>
            <span>TOTAL</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between items-start gap-3">
              <span className="leading-tight">{transaction.serviceName || '-'}</span>
              <span className="font-bold shrink-0">Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {transaction.weightOrQty || '-'} {transaction.serviceType === 'Koin' ? 'Siklus' : 'kg'} x Rp {unitPrice.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300 my-2" />

        <div className="space-y-1.5 text-slate-700">
          <div className="flex justify-between font-bold text-slate-950 text-[13px] border-t border-dashed border-slate-200 pt-1.5">
            <span>TOTAL:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Metode Bayar:</span>
            <span className="font-bold">{transaction.paymentMethod || '-'}</span>
          </div>
          {transaction.paymentMethod === 'QRIS' && (
            <div className="text-[9px] text-success font-bold bg-success/10 px-2 py-1 rounded text-center border border-success/15">
              PEMBAYARAN QRIS TERVERIFIKASI
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-slate-300 my-2" />

        <div className="text-center space-y-2 text-[9px] text-slate-400 leading-tight">
          <p className="font-bold text-slate-600">*** TERIMA KASIH ***</p>
          <p>Pakaian bersih, wangi, dan higienis<br />adalah komitmen utama kami.</p>
          <p>Periksa kembali cucian Anda sebelum<br />meninggalkan outlet laundaja.</p>
          <div className="pt-2">
            <div className="h-6 w-full bg-slate-100 flex items-center justify-center select-none text-[8px] font-bold text-slate-400 tracking-[0.3em] rounded">
              LW-{String(transaction.id).replace('#', '').padStart(6, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
