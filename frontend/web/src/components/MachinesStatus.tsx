import React from 'react';
import { Layers, CheckCircle, Power, Clock, Wrench, Cpu } from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  type: 'Washer' | 'Dryer';
  capacity: string;
  status: 'Active' | 'Idle' | 'Maintenance';
  timeLeft: string;
  customer: string;
}

const machines: Machine[] = [
  { id: 'WS-01', name: 'Washer Front-Load #01', type: 'Washer', capacity: '12 kg', status: 'Active', timeLeft: '24 Menit', customer: 'Andi Saputra' },
  { id: 'WS-02', name: 'Washer Front-Load #02', type: 'Washer', capacity: '12 kg', status: 'Idle', timeLeft: 'Ready', customer: '-' },
  { id: 'WS-03', name: 'Washer Giant Load #03', type: 'Washer', capacity: '20 kg', status: 'Active', timeLeft: '8 Menit', customer: 'Siti Lestari' },
  { id: 'WS-04', name: 'Washer Front-Load #04', type: 'Washer', capacity: '12 kg', status: 'Active', timeLeft: '45 Menit', customer: 'Riana Mutia' },
  { id: 'DR-01', name: 'Dryer Heavy Duty #01', type: 'Dryer', capacity: '15 kg', status: 'Active', timeLeft: '15 Menit', customer: 'Fajar Putra' },
  { id: 'DR-02', name: 'Dryer Heavy Duty #02', type: 'Dryer', capacity: '15 kg', status: 'Maintenance', timeLeft: 'Filter Clean', customer: '-' },
  { id: 'DR-03', name: 'Dryer Heavy Duty #03', type: 'Dryer', capacity: '15 kg', status: 'Idle', timeLeft: 'Ready', customer: '-' },
];

const statusConfig = {
  Active: { bg: 'bg-teal/10', text: 'text-teal', border: 'border-teal/15', icon: 'text-teal' },
  Idle: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/15', icon: 'text-success' },
  Maintenance: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/15', icon: 'text-error' },
};

export default function MachinesStatus() {
  const activeCount = machines.filter(m => m.status === 'Active').length;
  const idleCount = machines.filter(m => m.status === 'Idle').length;
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-ink tracking-tight">Status Operasional Mesin</h2>
        <p className="text-xs text-ink-muted mt-1">Status real-time washer dan dryer di outlet Antasari</p>
      </div>

      {/* Summary strip */}
      <div className="flex gap-4 text-[11px] font-mono font-bold">
        <span className="text-teal">{activeCount} Aktif</span>
        <span className="text-success">{idleCount} Idle</span>
        <span className="text-error">{maintenanceCount} Maintenance</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {machines.map((m) => {
          const cfg = statusConfig[m.status];
          return (
            <div key={m.id} className="glass-card p-5 flex flex-col justify-between space-y-4 group hover:shadow-glass-lg transition-all duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/30 text-ink-secondary border border-white/30">{m.id}</span>
                    <span className="text-xs text-ink-muted font-semibold">{m.capacity}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-ink truncate" title={m.name}>{m.name}</h3>
                </div>
                <div className={`p-2 rounded-[var(--radius-md)] ${cfg.bg} ${cfg.border} border shrink-0`}>
                  {m.type === 'Washer' ? <Power className={`w-5 h-5 ${cfg.icon}`} /> : <Layers className={`w-5 h-5 ${cfg.icon}`} />}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/20 pt-3">
                <div className="flex items-center gap-1.5">
                  {m.status === 'Active' ? (
                    <Clock className={`w-[18px] h-[18px] ${cfg.icon}`} style={{ animation: 'spin 6s linear infinite' }} />
                  ) : m.status === 'Idle' ? (
                    <CheckCircle className={`w-[18px] h-[18px] ${cfg.icon}`} />
                  ) : (
                    <Wrench className={`w-[18px] h-[18px] ${cfg.icon}`} />
                  )}
                  <span className={`text-xs font-bold ${cfg.text} ${m.status === 'Active' ? 'font-mono' : ''}`}>{m.timeLeft}</span>
                </div>

                {m.status === 'Active' && m.customer !== '-' && (
                  <div className="text-right min-w-0">
                    <span className="text-[11px] text-ink-muted block font-mono">Pelanggan</span>
                    <span className="text-xs font-bold text-ink truncate block max-w-[100px]" title={m.customer}>{m.customer}</span>
                  </div>
                )}

                {m.status === 'Maintenance' && (
                  <span className="text-[11px] font-bold text-error bg-error/10 px-2 py-0.5 rounded border border-error/15">
                    Bersihkan Filter
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
