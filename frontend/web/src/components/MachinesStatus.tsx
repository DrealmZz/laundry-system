import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle, Power, Clock, Wrench, Cpu, Loader2 } from 'lucide-react';
import { apiRequest } from '../services/api';

interface MachineStatus {
  id_mesin: number;
  kode_mesin: string;
  nama_mesin: string;
  tipe_mesin: 'pencucian' | 'pengeringan';
  kapasitas_kg: number | null;
  status_mesin: string;
  status_display: 'tersedia' | 'dipakai' | 'perbaikan';
  timeLeft: string | null;
  customer_nama: string | null;
}

const statusConfig = {
  tersedia: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/15', icon: 'text-success' },
  dipakai: { bg: 'bg-teal/10', text: 'text-teal', border: 'border-teal/15', icon: 'text-teal' },
  perbaikan: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/15', icon: 'text-error' },
};

const statusLabel: Record<string, string> = {
  tersedia: 'Tersedia',
  dipakai: 'Dipakai',
  perbaikan: 'Perbaikan',
};

const typeIcon: Record<string, React.ReactNode> = {
  pencucian: <Power className="w-5 h-5" />,
  pengeringan: <Layers className="w-5 h-5" />,
};

export default function MachinesStatus() {
  const [machines, setMachines] = useState<MachineStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest('/mesin/status')
      .then(res => setMachines(res.data))
      .catch(() => setError('Gagal memuat data mesin'))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = machines.filter(m => m.status_display === 'dipakai').length;
  const idleCount = machines.filter(m => m.status_display === 'tersedia').length;
  const maintenanceCount = machines.filter(m => m.status_display === 'perbaikan').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="font-bold text-error text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-ink tracking-tight">Status Operasional Mesin</h2>
        <p className="text-xs text-ink-muted mt-1">Status real-time washer dan dryer di outlet Antasari</p>
      </div>

      <div className="flex gap-4 text-[11px] font-mono font-bold">
        <span className="text-teal">{activeCount} Dipakai</span>
        <span className="text-success">{idleCount} Tersedia</span>
        <span className="text-error">{maintenanceCount} Perbaikan</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {machines.map((m) => {
          const cfg = statusConfig[m.status_display];
          return (
            <div key={m.id_mesin} className="glass-card p-5 flex flex-col justify-between space-y-4 group hover:shadow-glass-lg transition-all duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/30 text-ink-secondary border border-white/30">{m.kode_mesin}</span>
                    {m.kapasitas_kg && (
                      <span className="text-xs text-ink-muted font-semibold">{m.kapasitas_kg} kg</span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-ink truncate" title={m.nama_mesin}>{m.nama_mesin}</h3>
                </div>
                <div className={`p-2 rounded-[var(--radius-md)] ${cfg.bg} ${cfg.border} border shrink-0`}>
                  {typeIcon[m.tipe_mesin] || <Power className="w-5 h-5" />}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/20 pt-3">
                <div className="flex items-center gap-1.5">
                  {m.status_display === 'dipakai' ? (
                    <Clock className={`w-[18px] h-[18px] ${cfg.icon}`} style={{ animation: 'spin 6s linear infinite' }} />
                  ) : m.status_display === 'tersedia' ? (
                    <CheckCircle className={`w-[18px] h-[18px] ${cfg.icon}`} />
                  ) : (
                    <Wrench className={`w-[18px] h-[18px] ${cfg.icon}`} />
                  )}
                  <span className={`text-xs font-bold ${cfg.text} ${m.status_display === 'dipakai' ? 'font-mono' : ''}`}>
                    {m.status_display === 'dipakai' ? (m.timeLeft || 'Sisa waktu...') : statusLabel[m.status_display]}
                  </span>
                </div>

                {m.status_display === 'dipakai' && m.customer_nama && (
                  <div className="text-right min-w-0">
                    <span className="text-[11px] text-ink-muted block font-mono">Pelanggan</span>
                    <span className="text-xs font-bold text-ink truncate block max-w-[100px]" title={m.customer_nama}>{m.customer_nama}</span>
                  </div>
                )}

                {m.status_display === 'perbaikan' && (
                  <span className="text-[11px] font-bold text-error bg-error/10 px-2 py-0.5 rounded border border-error/15">
                    Perbaikan
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {machines.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-7 h-7 text-ink-muted" />
          </div>
          <p className="font-bold text-ink-secondary text-sm">Belum ada mesin terdaftar</p>
          <p className="text-ink-muted text-xs mt-1">Hubungi admin untuk mendaftarkan mesin baru</p>
        </div>
      )}
    </div>
  );
}
