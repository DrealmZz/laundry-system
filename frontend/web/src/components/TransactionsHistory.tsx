import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Search, Printer, Calendar, ReceiptText, ArrowUpDown } from 'lucide-react';

interface TransactionsHistoryProps {
  transactions: Transaction[];
  onSelectReceipt: (id: string) => void;
  loading?: boolean;
}

type SortField = 'date' | 'amount' | 'customer';
type SortDir = 'asc' | 'desc';

export default function TransactionsHistory({ transactions, onSelectReceipt, loading = false }: TransactionsHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Selesai' | 'Proses' | 'Antri'>('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return transactions
      .filter((t) => {
        const matchesSearch = !search ||
          t.customerName.toLowerCase().includes(search) ||
          t.id.toLowerCase().includes(search) ||
          t.serviceName.toLowerCase().includes(search);
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

        let matchesDate = true;
        if (startDate || endDate) {
          const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split(' ');
            const monthMap: Record<string, number> = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
              'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
            };
            return new Date(parseInt(year), monthMap[month], parseInt(day));
          };
          const txDate = parseDate(t.date);
          if (startDate) matchesDate = matchesDate && txDate >= new Date(startDate + 'T00:00:00');
          if (endDate) matchesDate = matchesDate && txDate <= new Date(endDate + 'T23:59:59');
        }

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortField === 'amount') return (a.amount - b.amount) * dir;
        if (sortField === 'customer') return a.customerName.localeCompare(b.customerName) * dir;
        if (sortField === 'date') {
          // Parse dates like "24 Jun 2026" or "30 Jun 2026"
          const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split(' ');
            const monthMap: Record<string, number> = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
              'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
            };
            return new Date(parseInt(year), monthMap[month], parseInt(day)).getTime();
          };
          return (parseDate(a.date) - parseDate(b.date)) * dir;
        }
        return 0;
      });
  }, [transactions, searchTerm, statusFilter, sortField, sortDir, startDate, endDate]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const statusLabel: Record<string, string> = {
    Selesai: 'Selesai',
    Proses: 'Diproses',
    Antri: 'Menunggu',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal/30 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-ink tracking-tight text-wrap-balance">Daftar Transaksi</h2>
        <p className="text-xs text-ink-muted mt-1">Arsip pencatatan transaksi masuk dan pembayaran</p>
      </div>

      <div className="glass-card overflow-hidden flex flex-col">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-white/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pelanggan, ID, layanan..."
              aria-label="Cari transaksi"
              className="w-full glass-input rounded-[var(--radius-md)] pl-9 pr-4 py-2 text-xs focus:outline-none text-ink-secondary font-semibold placeholder:text-ink-muted"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter status"
              className="glass-input rounded-[var(--radius-md)] text-xs px-3 py-2 text-ink-secondary font-semibold focus:outline-none"
            >
              <option value="All">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Proses">Diproses</option>
              <option value="Antri">Menunggu</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Tanggal mulai"
              className="glass-input rounded-[var(--radius-md)] text-xs px-3 py-2 text-ink-secondary font-semibold focus:outline-none"
              placeholder="Dari"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Tanggal akhir"
              className="glass-input rounded-[var(--radius-md)] text-xs px-3 py-2 text-ink-secondary font-semibold focus:outline-none"
              placeholder="Sampai"
            />

            <span className="text-[11px] text-ink-muted font-mono">
              {filteredTransactions.length} transaksi
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/20 text-[11px] font-black text-ink-muted uppercase tracking-widest border-b border-white/30 font-mono">
                <th className="py-3 px-4">ID Transaksi</th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-ink-secondary transition-colors">
                    Tanggal & Waktu <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('customer')} className="flex items-center gap-1 hover:text-ink-secondary transition-colors">
                    Pelanggan <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Layanan</th>
                <th className="py-3 px-4">Berat/Qty</th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 hover:text-ink-secondary transition-colors">
                    Total Bayar <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-xs text-ink-secondary">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                        <ReceiptText className="w-6 h-6 text-ink-muted" />
                      </div>
                      <div>
                        <p className="font-bold text-ink-secondary text-sm">
                          {searchTerm || statusFilter !== 'All' || startDate || endDate ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi'}
                        </p>
                        <p className="text-ink-muted text-xs mt-1">
                          {searchTerm || statusFilter !== 'All' ? 'Coba ubah kata kunci atau filter pencarian' : 'Transaksi baru akan muncul di sini'}
                        </p>
                      </div>
                      {(searchTerm || statusFilter !== 'All' || startDate || endDate) && (
                        <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); setStartDate(''); setEndDate(''); }} className="text-xs font-bold text-teal hover:text-teal-light transition-colors">
                          Reset filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/15 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal">{tx.id}</td>
                    <td className="py-3.5 px-4 text-ink-muted whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-ink-muted/40 shrink-0" />
                        <span>{tx.date || '30 Jun 2026'} • {tx.time}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-navy-deep to-navy-medium text-white font-bold flex items-center justify-center text-[10px] shrink-0">{tx.customerInitial}</div>
                        <span className="font-semibold text-ink truncate max-w-[120px]" title={tx.customerName}>{tx.customerName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className="truncate max-w-[140px] block" title={tx.serviceName}>{tx.serviceName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">{tx.weightOrQty} {tx.serviceType === 'Koin' ? 'Siklus' : 'kg'}</td>
                    <td className="py-3.5 px-4 font-black text-ink whitespace-nowrap">Rp {tx.amount.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 px-4 font-bold text-ink-muted">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                        tx.status === 'Selesai' ? 'bg-success/10 text-success border-success/15'
                        : tx.status === 'Proses' ? 'bg-gold/10 text-gold border-gold/15'
                        : 'bg-error/10 text-error border-error/15'
                      }`}>
                        {statusLabel[tx.status] || tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => onSelectReceipt(tx.id)} className="p-1.5 hover:bg-teal/10 hover:text-teal text-ink-muted rounded-[var(--radius-sm)] transition-colors inline-flex items-center gap-1 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30" aria-label={`Cetak struk ${tx.id}`}>
                        <Printer className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {filteredTransactions.length > 0 && (
          <div className="py-3 px-4 border-t border-white/30 flex items-center justify-between text-[11px] text-ink-muted font-mono">
            <span>{filteredTransactions.length} dari {transactions.length} transaksi</span>
            <span>Total: Rp {filteredTransactions.reduce((s, t) => s + t.amount, 0).toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
