import React, { useState } from 'react';
import { Service } from '../types';
import { Sparkles, Edit2, Check, X, DollarSign, Hourglass, Layers, AlertCircle } from 'lucide-react';

interface ServiceUpdate {
  name?: string;
  duration?: string;
  price?: number;
}

interface ServiceManagementProps {
  services: Service[];
  onToggleServiceStatus: (id: string) => void;
  onUpdateService: (id: string, data: ServiceUpdate) => void;
}

export default function ServiceManagement({
  services,
  onToggleServiceStatus,
  onUpdateService
}: ServiceManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDuration, setEditDuration] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');

  const handleStartEdit = (service: Service) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditDuration(service.duration.replace(/\D/g, ''));
    setEditPrice(service.price.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = (id: string) => {
    if (!editName.trim()) {
      alert('Nama layanan tidak boleh kosong!');
      return;
    }
    const parsedDuration = parseInt(editDuration, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      alert('Durasi pengerjaan harus berupa angka menit yang valid!');
      return;
    }
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Masukkan harga yang valid!');
      return;
    }
    onUpdateService(id, {
      name: editName.trim(),
      duration: `${parsedDuration} menit`,
      price: parsedPrice,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Kelola Paket & Layanan Laundry</h2>
          <p className="text-xs text-ink-muted">Atur harga layanan, durasi cuci, dan status aktivasi layanan di POS kasir</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Services List Table (Span 2) */}
        <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/30">
            <h3 className="text-sm font-extrabold text-ink">Daftar Paket Aktif</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-white/30">
                  <th className="py-3 px-4">Nama Paket & Kode</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Durasi Kerja</th>
                  <th className="py-3 px-4">Harga / Satuan</th>
                  <th className="py-3 px-4">Status Layanan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs text-ink-secondary">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-white/10 transition-colors">
                    <td className="py-4 px-4">
                      {editingId === service.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white/15 border border-white/30 rounded px-2 py-1 text-xs font-bold text-ink focus:outline-none focus:border-teal"
                          placeholder="Nama layanan"
                        />
                      ) : (
                        <div>
                          <span className="font-extrabold text-ink text-xs">{service.name}</span>
                          <div className="text-[10px] text-ink-muted font-mono mt-0.5">{service.id} • {service.packageType}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        service.type === 'Kiloan' ? 'bg-teal/10 text-teal' :
                        service.type === 'Satuan' ? 'bg-success/10 text-success border border-success/15' :
                        'bg-gold/10 text-gold border border-gold/15'
                      }`}>
                        {service.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {editingId === service.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            className="w-14 bg-white/15 border border-white/30 rounded px-2 py-1 text-xs font-semibold text-ink focus:outline-none focus:border-teal font-mono"
                            placeholder="menit"
                            min="1"
                          />
                          <span className="text-[10px] text-ink-muted font-bold">menit</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 font-semibold text-ink-secondary">
                          <Hourglass className="w-3.5 h-3.5 text-ink-muted/50" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === service.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-ink-muted font-bold">Rp</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-20 bg-white/15 border border-white/30 rounded px-1.5 py-1 text-xs font-bold text-ink focus:outline-none focus:border-teal font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <span className="font-black text-ink">Rp {service.price.toLocaleString('id-ID')}</span>
                          <span className="text-[10px] text-ink-muted"> / {service.unit}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => onToggleServiceStatus(service.id)}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          service.status ? 'justify-end' : 'bg-white/25 justify-start'
                        }`}
                        style={service.status ? { background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' } : undefined}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {editingId === service.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSave(service.id)}
                            className="p-1.5 hover:bg-success/10 text-success rounded-lg border border-success/15 transition-colors"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg border border-red-500/15 transition-colors"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(service)}
                          className="p-1.5 hover:bg-white/15 text-ink-muted hover:text-ink rounded-lg transition-colors inline-flex items-center gap-1 font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Promos / Distribution (Span 1) */}
        <div className="space-y-6">
          {/* Active Promos card */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal/30 rounded-full blur-3xl opacity-30 -mr-6 -mt-6" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500 rounded-full blur-3xl opacity-25 -ml-6 -mb-6" />

            <div className="flex items-center gap-1.5 text-white/60">
              <Sparkles className="w-5 h-5 text-teal-light" />
              <span className="text-[10px] font-black uppercase tracking-widest font-mono">Promo Campaign</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight leading-tight">Weekend Cuci Hemat!</h3>
                <p className="text-xs text-white/50 leading-relaxed font-medium">
                Setiap hari Sabtu & Minggu, diskon kiloan 10% otomatis aktif di aplikasi kustomer laundaja.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-teal-light block font-mono font-bold">KODE VOUCHER</span>
                <span className="font-bold tracking-wider text-sm font-mono">LUXEWEEKEND</span>
              </div>
              <span className="text-[10px] font-bold text-white/60 bg-teal/20 px-2.5 py-1 rounded-lg">
                AKTIF
              </span>
            </div>
          </div>

          {/* Operational Alerts / Guidance */}
          <div className="bg-gold/10 border border-gold/15 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="font-extrabold text-sm tracking-tight">Aturan Sinkronisasi Harga</h4>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed font-medium">
              Perubahan harga paket di panel ini akan langsung tersinkronisasi secara instan ke layar Point-of-Sale kasir laundaja. Pastikan berkoordinasi sebelum merubah tarif dasar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
