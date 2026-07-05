import React, { useState } from 'react';
import { Transaction, Task } from '../types';
import { 
  FileText, 
  Coins, 
  Sparkles, 
  Package, 
  Plus, 
  Trash2,
  AlertCircle,
  TrendingUp,
  ReceiptText,
} from 'lucide-react';

interface CashierDashboardProps {
  transactions: Transaction[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectReceipt: (id: string) => void;
  onNavigateToNewTransaction: () => void;
}

export default function CashierDashboard({
  transactions,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onSelectReceipt,
  onNavigateToNewTransaction
}: CashierDashboardProps) {
  const [newTaskText, setNewTaskText] = useState('');

  // Calculate statistics
  const todayCompleted = transactions.filter(t => t.status === 'Selesai');
  const totalIncome = todayCompleted.reduce((sum, t) => sum + t.amount, 0);
  const totalOrders = transactions.length;
  
  const processedCount = transactions.filter(t => t.status === 'Proses').length;
  const waitingCount = transactions.filter(t => t.status === 'Antri').length;

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText('');
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* 4 KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: TOTAL TRANSAKSI */}
        <div className="glass-card p-5 flex flex-col justify-between h-36 relative group hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="bg-gradient-to-br from-[#1e40af]/15 to-[#0891b2]/15 text-[#1e40af] p-2.5 rounded-[var(--radius-lg)] flex items-center justify-center border border-[#1e40af]/10">
              <FileText className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] text-success font-extrabold bg-success/10 px-2.5 py-1 rounded-full border border-success/10">
              <TrendingUp className="w-3 h-3" />
              <span>12%</span>
            </span>
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest font-mono">Total Transaksi</p>
            <h3 className="text-2xl font-black text-ink mt-1 font-display">{totalOrders}</h3>
          </div>
        </div>

        {/* Card 2: TOTAL PENDAPATAN */}
        <div className="glass-card p-5 flex flex-col justify-between h-36 relative group hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="bg-gradient-to-br from-gold/15 to-gold-light/15 text-gold p-2.5 rounded-[var(--radius-lg)] flex items-center justify-center border border-gold/10">
              <Coins className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] text-success font-extrabold bg-success/10 px-2.5 py-1 rounded-full border border-success/10">
              <TrendingUp className="w-3 h-3" />
              <span>8%</span>
            </span>
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest font-mono">Total Pendapatan</p>
            <h3 className="text-2xl font-black text-ink mt-1 font-display">
              Rp {totalIncome.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>

        {/* Card 3: CUCIAN DIPROSES */}
        <div className="glass-card p-5 flex flex-col justify-between h-36 relative group hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="bg-gradient-to-br from-teal/15 to-teal-light/15 text-teal p-2.5 rounded-[var(--radius-lg)] flex items-center justify-center border border-teal/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-[11px] text-ink-secondary font-extrabold bg-white/40 px-2.5 py-1 rounded-full border border-white/40">
              Aktif
            </span>
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest font-mono">Cucian Diproses</p>
            <h3 className="text-2xl font-black text-ink mt-1 font-display">{processedCount}</h3>
          </div>
        </div>

        {/* Card 4: MENUNGGU PENGAMBILAN */}
        <div className="glass-card p-5 flex flex-col justify-between h-36 relative group hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="bg-gradient-to-br from-[#6366f1]/15 to-[#818cf8]/15 text-[#6366f1] p-2.5 rounded-[var(--radius-lg)] flex items-center justify-center border border-[#6366f1]/10">
              <Package className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center text-[11px] text-error font-extrabold bg-error/10 px-2.5 py-1 rounded-full border border-error/10">
              Prioritas
            </span>
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest font-mono">Menunggu Pengambilan</p>
            <h3 className="text-2xl font-black text-ink mt-1 font-display">{waitingCount}</h3>
          </div>
        </div>

      </div>

      {/* Main Block: Transaksi Terbaru Card with Table inside */}
      <div className="glass-card overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-ink text-base">Transaksi Terbaru</h3>
            <p className="text-xs text-ink-muted mt-1">Ringkasan operasional terakhir</p>
          </div>
          
          <button 
            onClick={onNavigateToNewTransaction}
            className="btn-primary-gradient px-5 py-2.5 font-bold text-xs rounded-[var(--radius-md)] flex items-center justify-center gap-2 shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
          >
            <Plus className="w-4 h-4" />
            <span>Transaksi Baru</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/20 text-[11px] font-black text-ink-muted uppercase tracking-widest border-b border-white/30 font-mono">
                <th className="py-4 px-6">No. Transaksi</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Layanan</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-xs text-ink-secondary font-medium">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-white/15 transition-colors">
                  
                  {/* Transaction ID */}
                  <td className="py-4 px-6 font-mono font-black text-teal">
                    {tx.id}
                  </td>
                  
                  {/* Customer Block */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-deep to-navy-medium text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                        {tx.customerInitial}
                      </div>
                      <span className="font-bold text-ink truncate max-w-[120px]" title={tx.customerName}>{tx.customerName}</span>
                    </div>
                  </td>
                  
                  {/* Service type badge */}
                  <td className="py-4 px-6">
                    <span className="bg-white/30 backdrop-blur-sm text-ink-secondary font-bold px-3 py-1 rounded-full text-[11px] truncate max-w-[160px] inline-block border border-white/30" title={tx.serviceName}>
                      {tx.serviceName}
                    </span>
                  </td>
                  
                  {/* Amount */}
                  <td className="py-4 px-6 font-black text-ink">
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  
                  {/* Status pill */}
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${
                      tx.status === 'Selesai' 
                        ? 'bg-success/10 text-success border-success/15'
                        : tx.status === 'Proses'
                        ? 'bg-gold/10 text-gold border-gold/15'
                        : 'bg-error/10 text-error border-error/15'
                    }`}>
                      {tx.status === 'Selesai' ? 'SELESAI' : tx.status === 'Proses' ? 'DIPROSES' : 'MENUNGGU'}
                    </span>
                  </td>
                  
                  {/* Time */}
                  <td className="py-4 px-6 font-mono text-ink-muted font-bold">
                    {tx.time}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {transactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-3">
              <ReceiptText className="w-6 h-6 text-ink-muted" />
            </div>
            <p className="font-bold text-ink-secondary text-sm">Belum ada transaksi hari ini</p>
            <p className="text-ink-muted text-xs mt-1">Transaksi baru akan muncul di sini</p>
          </div>
        ) : (
          <div className="py-4 border-t border-white/30 text-center">
            <button 
              onClick={() => {
                const event = new CustomEvent('navigate-tab', { detail: 'transactions' });
                window.dispatchEvent(event);
              }}
              className="text-xs font-black text-teal hover:text-teal-light transition-colors focus-visible:outline-none"
            >
              Lihat Semua Riwayat Transaksi
            </button>
          </div>
        )}
      </div>

      {/* Bottom section: Announcements and Tasks checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Shift announcement */}
        <div className="bg-gradient-to-br from-gold/5 to-gold/10 border border-gold/15 rounded-[var(--radius-lg)] p-6 space-y-4 flex flex-col justify-between backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-gold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-extrabold text-sm tracking-tight">Pengumuman Shift Sore</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed font-medium">
              "Pastikan mesin dryer <span className="font-bold">#02</span> dibersihkan filternya setiap akhir shift sore. Laporan gas sisa dicatat di logbook merah."
            </p>
          </div>
          <div className="text-[11px] text-ink-muted font-mono text-right pt-4 border-t border-gold/10">
            — Ditulis oleh Supervisor, 07:45 AM
          </div>
        </div>

        {/* Right: Quick Action Tasks Checklist */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div>
            <h3 className="font-display font-black text-ink text-sm">Tugas Quick Action Shift</h3>
            <p className="text-xs text-ink-muted">Checklist tugas operasional kasir harian</p>
          </div>

          {/* Todo insertion form */}
          <form onSubmit={handleAddTaskSubmit} className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Masukkan instruksi tugas kasir baru..."
              aria-label="Tambah tugas baru"
              maxLength={200}
              className="flex-1 glass-input rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold focus:outline-none text-ink-secondary placeholder:text-ink-muted"
            />
            <button
              type="submit"
              className="btn-primary-gradient p-2.5 rounded-[var(--radius-md)] shadow-subtle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Checklist queue */}
          <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-6">Semua pekerjaan kasir selesai!</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-[var(--radius-md)] border transition-all duration-200 ${
                    task.completed
                      ? 'bg-white/15 border-white/20 text-ink-muted line-through'
                      : 'bg-white/30 border-white/30 hover:border-teal/20 text-ink-secondary backdrop-blur-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      className="w-4 h-4 text-teal border-white/40 rounded focus:ring-teal cursor-pointer accent-navy-deep"
                    />
                    <span className="text-xs font-bold truncate">{task.text}</span>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-white/20 hover:text-error p-1.5 rounded-[var(--radius-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
                    aria-label={`Hapus tugas: ${task.text}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
