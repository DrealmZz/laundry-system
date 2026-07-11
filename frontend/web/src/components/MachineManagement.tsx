import React, { useState } from 'react';
import { Machine } from '../types';
import { Edit2, Check, X, Plus, Trash2, Power, Layers, Cpu, Wrench, AlertCircle } from 'lucide-react';

interface MachineFormData {
  kode_mesin: string;
  nama_mesin: string;
  tipe_mesin: 'pencucian' | 'pengeringan';
  kapasitas_kg: string;
  konsumsi_kwh: string;
  penggunaan_air_liter: string;
}

const emptyForm: MachineFormData = {
  kode_mesin: '',
  nama_mesin: '',
  tipe_mesin: 'pencucian',
  kapasitas_kg: '',
  konsumsi_kwh: '',
  penggunaan_air_liter: '',
};

interface MachineManagementProps {
  machines: Machine[];
  onCreateMachine: (data: Partial<Machine>) => void;
  onUpdateMachine: (id: string, data: Partial<Machine>) => void;
  onDeleteMachine: (id: string) => void;
  onToggleStatus: (id: string, status: 'tersedia' | 'dipakai' | 'perbaikan') => void;
}

export default function MachineManagement({
  machines,
  onCreateMachine,
  onUpdateMachine,
  onDeleteMachine,
  onToggleStatus,
}: MachineManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<MachineFormData>(emptyForm);

  const handleStartEdit = (machine: Machine) => {
    setEditingId(machine.id);
    setFormData({
      kode_mesin: machine.kode_mesin,
      nama_mesin: machine.nama_mesin,
      tipe_mesin: machine.tipe_mesin,
      kapasitas_kg: machine.kapasitas_kg?.toString() || '',
      konsumsi_kwh: machine.konsumsi_kwh?.toString() || '',
      penggunaan_air_liter: machine.penggunaan_air_liter?.toString() || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSaveEdit = (id: string) => {
    if (!formData.nama_mesin.trim()) {
      alert('Nama mesin tidak boleh kosong!');
      return;
    }
    onUpdateMachine(id, {
      nama_mesin: formData.nama_mesin.trim(),
      tipe_mesin: formData.tipe_mesin,
      kapasitas_kg: formData.kapasitas_kg ? parseFloat(formData.kapasitas_kg) : null,
      konsumsi_kwh: formData.konsumsi_kwh ? parseFloat(formData.konsumsi_kwh) : null,
      penggunaan_air_liter: formData.penggunaan_air_liter ? parseFloat(formData.penggunaan_air_liter) : null,
    });
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!formData.kode_mesin.trim()) {
      alert('Kode mesin tidak boleh kosong!');
      return;
    }
    if (!formData.nama_mesin.trim()) {
      alert('Nama mesin tidak boleh kosong!');
      return;
    }
    onCreateMachine({
      kode_mesin: formData.kode_mesin.trim(),
      nama_mesin: formData.nama_mesin.trim(),
      tipe_mesin: formData.tipe_mesin,
      kapasitas_kg: formData.kapasitas_kg ? parseFloat(formData.kapasitas_kg) : null,
      konsumsi_kwh: formData.konsumsi_kwh ? parseFloat(formData.konsumsi_kwh) : null,
      penggunaan_air_liter: formData.penggunaan_air_liter ? parseFloat(formData.penggunaan_air_liter) : null,
    });
    setShowCreateForm(false);
    setFormData(emptyForm);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus mesin "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      onDeleteMachine(id);
    }
  };

  const statusOptions: Array<{ value: 'tersedia' | 'dipakai' | 'perbaikan'; label: string; color: string }> = [
    { value: 'tersedia', label: 'Tersedia', color: 'text-success' },
    { value: 'dipakai', label: 'Dipakai', color: 'text-teal' },
    { value: 'perbaikan', label: 'Perbaikan', color: 'text-error' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Manajemen Mesin</h2>
          <p className="text-xs text-ink-muted">Kelola mesin cuci dan pengering di outlet</p>
        </div>
        <button
          onClick={() => { setShowCreateForm(true); setFormData(emptyForm); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-teal hover:bg-teal-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Mesin
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateForm(false)}>
          <div className="glass-card p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-extrabold text-ink mb-4">Tambah Mesin Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Kode Mesin</label>
                <input
                  type="text"
                  value={formData.kode_mesin}
                  onChange={(e) => setFormData({ ...formData, kode_mesin: e.target.value })}
                  className="w-full bg-white/15 border border-white/30 rounded px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-teal"
                  placeholder="contoh: M001"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Nama Mesin</label>
                <input
                  type="text"
                  value={formData.nama_mesin}
                  onChange={(e) => setFormData({ ...formData, nama_mesin: e.target.value })}
                  className="w-full bg-white/15 border border-white/30 rounded px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-teal"
                  placeholder="contoh: Mesin Cuci LG 1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Tipe Mesin</label>
                <select
                  value={formData.tipe_mesin}
                  onChange={(e) => setFormData({ ...formData, tipe_mesin: e.target.value as 'pencucian' | 'pengeringan' })}
                  className="w-full bg-white/15 border border-white/30 rounded px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-teal"
                >
                  <option value="pencucian">Pencucian</option>
                  <option value="pengeringan">Pengeringan</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Kapasitas (kg)</label>
                <input
                  type="number"
                  value={formData.kapasitas_kg}
                  onChange={(e) => setFormData({ ...formData, kapasitas_kg: e.target.value })}
                  className="w-full bg-white/15 border border-white/30 rounded px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-teal"
                  placeholder="contoh: 10"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Konsumsi (kWh)</label>
                <input
                  type="number"
                  value={formData.konsumsi_kwh}
                  onChange={(e) => setFormData({ ...formData, konsumsi_kwh: e.target.value })}
                  className="w-full bg-white/15 border border-white/30 rounded px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-teal"
                  placeholder="contoh: 1.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Penggunaan Air (liter)</label>
                <input
                  type="number"
                  value={formData.penggunaan_air_liter}
                  onChange={(e) => setFormData({ ...formData, penggunaan_air_liter: e.target.value })}
                  className="w-full bg-white/15 border border-white/30 rounded px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-teal"
                  placeholder="contoh: 50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowCreateForm(false)} className="px-3 py-1.5 text-xs font-bold text-ink-muted hover:text-ink rounded-lg transition-colors">
                Batal
              </button>
              <button onClick={handleCreate} className="px-4 py-1.5 text-xs font-bold text-white bg-teal hover:bg-teal-dark rounded-lg transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/10 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-white/30">
                <th className="py-3 px-4">Kode & Nama</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Kapasitas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs text-ink-secondary">
              {machines.map((m) => (
                <tr key={m.id} className="hover:bg-white/10 transition-colors">
                  <td className="py-3 px-4">
                    {editingId === m.id ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={formData.nama_mesin}
                          onChange={(e) => setFormData({ ...formData, nama_mesin: e.target.value })}
                          className="w-full bg-white/15 border border-white/30 rounded px-2 py-1 text-xs font-bold text-ink focus:outline-none focus:border-teal"
                          placeholder="Nama mesin"
                        />
                        <div className="text-[10px] text-ink-muted font-mono">{m.kode_mesin}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-extrabold text-ink text-xs">{m.nama_mesin}</span>
                        <div className="text-[10px] text-ink-muted font-mono mt-0.5">{m.kode_mesin}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === m.id ? (
                      <select
                        value={formData.tipe_mesin}
                        onChange={(e) => setFormData({ ...formData, tipe_mesin: e.target.value as 'pencucian' | 'pengeringan' })}
                        className="bg-white/15 border border-white/30 rounded px-2 py-1 text-xs font-semibold text-ink focus:outline-none focus:border-teal"
                      >
                        <option value="pencucian">Pencucian</option>
                        <option value="pengeringan">Pengeringan</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.tipe_mesin === 'pencucian' ? 'bg-teal/10 text-teal' : 'bg-gold/10 text-gold border border-gold/15'
                      }`}>
                        {m.tipe_mesin === 'pencucian' ? 'Cuci' : 'Kering'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === m.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={formData.kapasitas_kg}
                          onChange={(e) => setFormData({ ...formData, kapasitas_kg: e.target.value })}
                          className="w-14 bg-white/15 border border-white/30 rounded px-1.5 py-1 text-xs font-mono text-ink focus:outline-none focus:border-teal"
                          placeholder="kg"
                        />
                        <span className="text-[10px] text-ink-muted">kg</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-ink-secondary">{m.kapasitas_kg ? `${m.kapasitas_kg} kg` : '-'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={m.status_mesin}
                      onChange={(e) => onToggleStatus(m.id, e.target.value as 'tersedia' | 'dipakai' | 'perbaikan')}
                      className={`text-[10px] font-bold rounded px-2 py-1 border ${
                        m.status_mesin === 'tersedia' ? 'bg-success/10 text-success border-success/15' :
                        m.status_mesin === 'dipakai' ? 'bg-teal/10 text-teal border-teal/15' :
                        'bg-error/10 text-error border-error/15'
                      } focus:outline-none`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === m.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleSaveEdit(m.id)} className="p-1.5 hover:bg-success/10 text-success rounded-lg border border-success/15 transition-colors" title="Simpan">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleCancelEdit} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg border border-red-500/15 transition-colors" title="Batal">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleStartEdit(m)} className="p-1.5 hover:bg-white/15 text-ink-muted hover:text-ink rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id, m.nama_mesin)} className="p-1.5 hover:bg-error/10 text-error/60 hover:text-error rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {machines.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-7 h-7 text-ink-muted" />
          </div>
          <p className="font-bold text-ink-secondary text-sm">Belum ada mesin terdaftar</p>
          <p className="text-ink-muted text-xs mt-1">Klik "Tambah Mesin" untuk menambah mesin baru</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-teal/10 border border-teal/15 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-teal">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h4 className="font-extrabold text-sm tracking-tight">Status Mesin</h4>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed font-medium">
          Status mesin dapat diubah langsung dari kolom "Status". Mesin yang sedang <span className="font-bold text-teal">dipakai</span> tidak bisa dihapus. Untuk menghapus, pastikan mesin tidak memiliki booking aktif.
        </p>
      </div>
    </div>
  );
}
