import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { AuditLog } from '../types';
import { FileText, Search, Filter, Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const tipeLogOptions = [
  { value: '', label: 'Semua' },
  { value: 'LOGIN_SUCCESS', label: 'Login Berhasil' },
  { value: 'LOGIN_FAILED', label: 'Login Gagal' },
  { value: 'REGISTER', label: 'Register' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'PASSWORD_CHANGED', label: 'Ubah Password' },
  { value: 'SERVICE_CREATED', label: 'Buat Layanan' },
  { value: 'SERVICE_UPDATED', label: 'Update Layanan' },
  { value: 'SERVICE_DELETED', label: 'Hapus Layanan' },
  { value: 'MACHINE_CREATED', label: 'Buat Mesin' },
  { value: 'MACHINE_UPDATED', label: 'Update Mesin' },
  { value: 'MACHINE_DELETED', label: 'Hapus Mesin' },
  { value: 'MACHINE_STATUS_CHANGED', label: 'Ubah Status Mesin' },
  { value: 'BOOKING_STATUS_CHANGED', label: 'Ubah Status Booking' },
  { value: 'BOOKING_REJECTED', label: 'Tolak Booking' },
  { value: 'BOOKING_CANCELLED', label: 'Batal Booking' },
  { value: 'BOOKING_PICKUP_CONFIRMED', label: 'Konfirmasi Jemput' },
  { value: 'BOOKING_CLOTHES_RECEIVED', label: 'Pakaian Diterima' },
  { value: 'BOOKING_WEIGHED', label: 'Timbang Pakaian' },
  { value: 'BOOKING_PAYMENT_CONFIRMED', label: 'Pembayaran Diterima' },
  { value: 'BOOKING_COMPLETED', label: 'Booking Selesai' },
  { value: 'PAYMENT_CONFIRMED', label: 'Konfirmasi Pembayaran' },
  { value: 'SHIFT_CREATED', label: 'Buat Shift' },
  { value: 'SHIFT_DELETED', label: 'Hapus Shift' },
];

const statusColors: Record<string, string> = {
  berhasil: 'bg-success/10 text-success border-success/15',
  gagal: 'bg-error/10 text-error border-error/15',
};

const tipeLogColors: Record<string, string> = {
  LOGIN_SUCCESS: 'bg-success/10 text-success',
  LOGIN_FAILED: 'bg-error/10 text-error',
  REGISTER: 'bg-teal/10 text-teal',
  LOGOUT: 'bg-white/20 text-ink-muted',
  PASSWORD_CHANGED: 'bg-gold/10 text-gold',
  SERVICE_CREATED: 'bg-success/10 text-success',
  SERVICE_UPDATED: 'bg-gold/10 text-gold',
  SERVICE_DELETED: 'bg-error/10 text-error',
  MACHINE_CREATED: 'bg-success/10 text-success',
  MACHINE_UPDATED: 'bg-gold/10 text-gold',
  MACHINE_DELETED: 'bg-error/10 text-error',
  MACHINE_STATUS_CHANGED: 'bg-gold/10 text-gold',
  BOOKING_STATUS_CHANGED: 'bg-teal/10 text-teal',
  BOOKING_REJECTED: 'bg-error/10 text-error',
  BOOKING_CANCELLED: 'bg-error/10 text-error',
  BOOKING_PICKUP_CONFIRMED: 'bg-success/10 text-success',
  BOOKING_CLOTHES_RECEIVED: 'bg-success/10 text-success',
  BOOKING_WEIGHED: 'bg-teal/10 text-teal',
  BOOKING_PAYMENT_CONFIRMED: 'bg-success/10 text-success',
  BOOKING_COMPLETED: 'bg-success/10 text-success',
  PAYMENT_CONFIRMED: 'bg-success/10 text-success',
  SHIFT_CREATED: 'bg-success/10 text-success',
  SHIFT_DELETED: 'bg-error/10 text-error',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [filterTipe, setFilterTipe] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (filterTipe) params.set('tipe_log', filterTipe);
      if (filterSearch) params.set('search', filterSearch);

      const res = await apiRequest(`/audit?${params.toString()}`);
      setLogs(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch {
      setError('Gagal memuat audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterTipe]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-ink tracking-tight">Audit Log</h2>
        <p className="text-xs text-ink-muted mt-1">Catatan aktivitas pengguna dan sistem</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari aktivitas..."
              className="w-full pl-8 pr-3 py-2 bg-white/15 border border-white/30 rounded-xl text-xs text-ink focus:outline-none focus:border-teal"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-white/15 border border-white/30 rounded-xl text-xs font-bold text-ink hover:bg-white/25 transition-colors"
          >
            Cari
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-ink-muted" />
          <select
            value={filterTipe}
            onChange={(e) => { setFilterTipe(e.target.value); setPage(1); }}
            className="bg-white/15 border border-white/30 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-teal"
          >
            {tipeLogOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-teal animate-spin" />
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="font-bold text-error text-sm">{error}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-white/30">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Aktivitas</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs text-ink-secondary">
                {logs.map((log) => (
                  <tr key={log.id_log} className="hover:bg-white/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-ink">{formatDate(log.timestamp)}</div>
                      <div className="text-[10px] text-ink-muted font-mono">{formatTime(log.timestamp)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tipeLogColors[log.tipe_log] || 'bg-white/20 text-ink-muted'}`}>
                        {log.tipe_log}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-ink-secondary">{log.aktivitas || log.isi_pesan || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-ink">{log.nama_customer || log.nama_karyawan || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[log.status] || 'bg-white/20 text-ink-muted'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-ink-muted" />
          </div>
          <p className="font-bold text-ink-secondary text-sm">Tidak ada log ditemukan</p>
          <p className="text-ink-muted text-xs mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-muted">Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, total)} dari {total} log</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-white/15 text-ink-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-ink">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/15 text-ink-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-gold/10 border border-gold/15 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-gold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h4 className="font-extrabold text-sm tracking-tight">Tentang Audit Log</h4>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed font-medium">
          Audit log mencatat semua aktivitas penting dalam sistem: login, registrasi, pembuatan/update/hapus layanan dan mesin, serta perubahan status. Data ini bersifat read-only dan tidak bisa diubah.
        </p>
      </div>
    </div>
  );
}
