import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Users, Search, UserPlus, Phone, MapPin, Award, Trash2, X, AlertTriangle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  visits: number;
  spend: number;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
}

const initialCustomers: Customer[] = [
  { id: 'C-001', name: 'Andi Saputra', phone: '0812-3456-7890', address: 'Jl. Sudirman No. 45, Jakarta', visits: 18, spend: 380000, points: 380, tier: 'Gold' },
  { id: 'C-002', name: 'Riana Mutia', phone: '0813-9876-5432', address: 'Apartemen Green Bay Tower C, Pluit', visits: 12, spend: 240000, points: 240, tier: 'Silver' },
  { id: 'C-003', name: 'Dedi Kusuma', phone: '0857-1111-2222', address: 'Perum Gading Serpong Sektor 7B', visits: 8, spend: 175000, points: 175, tier: 'Bronze' },
  { id: 'C-004', name: 'Siti Lestari', phone: '0819-3333-4444', address: 'Kost Exclusive BSD Blok F2', visits: 15, spend: 310000, points: 310, tier: 'Silver' },
  { id: 'C-005', name: 'Fajar Putra', phone: '0822-5555-6666', address: 'Jl. Merdeka Jaya No. 12, Tangerang', visits: 5, spend: 95000, points: 95, tier: 'Bronze' },
];

const tierConfig = {
  Gold: { icon: 'text-warning', label: 'text-warning' },
  Silver: { icon: 'text-ink-muted', label: 'text-ink-secondary' },
  Bronze: { icon: 'text-amber-700', label: 'text-amber-800' },
};

export default function CustomerDirectory() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  // New customer states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for modal focus management
  const addModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  // Focus trap for modals
  useEffect(() => {
    if (showAddModal) {
      firstInputRef.current?.focus();
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowAddModal(false);
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showAddModal]);

  useEffect(() => {
    if (deleteTarget) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setDeleteTarget(null);
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [deleteTarget]);

  const validateForm = useCallback((): boolean => {
    const errors: { name?: string; phone?: string } = {};
    if (!newName.trim()) {
      errors.name = 'Nama pelanggan wajib diisi';
    } else if (newName.trim().length < 2) {
      errors.name = 'Nama minimal 2 karakter';
    }
    if (!newPhone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^0[\d\s-]{8,15}$/.test(newPhone.replace(/\s/g, ''))) {
      errors.phone = 'Format nomor tidak valid (contoh: 0812-xxxx-xxxx)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newName, newPhone]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    const nextId = `C-${String(customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      id: nextId,
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim() || 'Tidak diisi',
      visits: 1,
      spend: 0,
      points: 10,
      tier: 'Bronze',
    };

    setCustomers(prev => [...prev, newCust]);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setFormErrors({});
    setIsSubmitting(false);
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Database Pelanggan</h2>
          <p className="text-xs text-ink-muted mt-1">Pencatatan profil, tingkat keanggotaan loyalty, dan riwayat kunjungan</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-navy-deep hover:bg-navy-hover text-white font-bold text-xs rounded-[var(--radius-md)] flex items-center gap-2 transition-colors duration-150 shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          <UserPlus className="w-4 h-4 text-gold" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-ink-muted shrink-0" />
        <input
          type="text"
          placeholder="Cari nama pelanggan atau nomor telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cari pelanggan"
          className="flex-1 bg-transparent border-none text-xs font-semibold focus:outline-none placeholder:text-ink-muted text-ink-secondary"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-ink-muted hover:text-ink-secondary transition-colors"
            aria-label="Hapus pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid of Customers */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-ink-muted" />
          </div>
          <p className="font-bold text-ink-secondary text-sm">
            {search ? 'Tidak ditemukan pelanggan' : 'Belum ada pelanggan terdaftar'}
          </p>
          <p className="text-ink-muted text-xs mt-1 max-w-xs mx-auto">
            {search
              ? 'Coba ubah kata kunci pencarian'
              : 'Tambah pelanggan baru untuk memulai program loyalty'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-xs font-bold text-info hover:text-info/80 transition-colors"
            >
              Hapus filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => {
            const tier = tierConfig[cust.tier];
            return (
              <div
                key={cust.id}
                className="glass-card p-5 space-y-4 hover:border-white/30 transition-colors duration-150 relative group"
              >
                {/* Delete button (on hover) */}
                <button
                  onClick={() => setDeleteTarget(cust)}
                  className="absolute top-4 right-4 text-ink-muted/50 hover:text-error transition-colors p-1.5 rounded-[var(--radius-sm)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
                  aria-label={`Hapus pelanggan ${cust.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Main Header */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-white/25 flex items-center justify-center font-black text-xs text-ink shrink-0">
                    {cust.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-ink leading-none truncate" title={cust.name}>{cust.name}</h4>
                    <p className="text-[11px] text-ink-muted font-mono mt-1">ID: {cust.id}</p>
                  </div>
                </div>

                {/* Info lines */}
                <div className="space-y-1.5 text-xs text-ink-secondary">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    <span className="truncate" title={cust.address}>{cust.address}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Footer metrics */}
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="space-y-0.5">
                    <p className="text-ink-muted text-[10px] uppercase tracking-wider font-mono">Tier</p>
                    <div className="flex items-center gap-1">
                      <Award className={`w-3.5 h-3.5 ${tier.icon}`} />
                      <span className={tier.label}>{cust.tier}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <p className="text-ink-muted text-[10px] uppercase tracking-wider font-mono">Poin</p>
                    <p className="text-ink-secondary font-extrabold">{cust.points}</p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <p className="text-ink-muted text-[10px] uppercase tracking-wider font-mono">Kunjungan</p>
                    <p className="text-ink font-black">{cust.visits}x</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-customer-title"
        >
          <div
            ref={addModalRef}
            className="glass-card-elevated p-6 w-full max-w-md space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 id="add-customer-title" className="text-sm font-extrabold text-ink">Tambah Pelanggan Baru</h3>
                <p className="text-xs text-ink-muted mt-1">Masukkan data profil untuk keanggotaan loyalty</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-ink-muted hover:text-ink transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="cust-name" className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                  Nama Lengkap <span className="text-error">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="cust-name"
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setFormErrors(p => ({ ...p, name: undefined })); }}
                  placeholder="Contoh: Budi Hartono"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? 'cust-name-error' : undefined}
                  className={`w-full bg-white/15 border rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 text-ink-secondary ${
                    formErrors.name ? 'border-error focus:ring-error/20' : 'border-white/30 focus:ring-info/20'
                  }`}
                  maxLength={100}
                />
                {formErrors.name && (
                  <p id="cust-name-error" className="text-[11px] text-error font-semibold mt-1" role="alert">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="cust-phone" className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                  Nomor Telepon (WhatsApp) <span className="text-error">*</span>
                </label>
                <input
                  id="cust-phone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => { setNewPhone(e.target.value); setFormErrors(p => ({ ...p, phone: undefined })); }}
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  aria-invalid={!!formErrors.phone}
                  aria-describedby={formErrors.phone ? 'cust-phone-error' : undefined}
                  className={`w-full bg-white/15 border rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 text-ink-secondary ${
                    formErrors.phone ? 'border-error focus:ring-error/20' : 'border-white/30 focus:ring-info/20'
                  }`}
                  maxLength={20}
                />
                {formErrors.phone && (
                  <p id="cust-phone-error" className="text-[11px] text-error font-semibold mt-1" role="alert">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="cust-address" className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                  Alamat Tinggal
                </label>
                <textarea
                  id="cust-address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Masukkan alamat tinggal pelanggan..."
                  className="w-full bg-white/15 border border-white/30 rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-info/20 h-20 resize-none text-ink-secondary"
                  maxLength={200}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setFormErrors({}); }}
                  className="flex-1 py-2.5 bg-white/25 hover:bg-white/20 text-ink-secondary font-bold text-xs rounded-[var(--radius-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-navy-deep hover:bg-navy-hover text-white font-bold text-xs rounded-[var(--radius-md)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div
            ref={deleteModalRef}
            className="glass-card-elevated p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-error-bg flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div className="flex-1">
                <h2 id="delete-title" className="text-base font-black text-ink">Hapus pelanggan?</h2>
                <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                  Data <span className="font-bold text-ink">{deleteTarget.name}</span> akan dihapus dari database. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-ink-muted hover:text-ink transition-colors rounded-[var(--radius-sm)]"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-[13px] font-bold text-ink-muted hover:text-ink rounded-[var(--radius-md)] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-[13px] font-bold bg-error text-white rounded-[var(--radius-md)] hover:bg-error/90 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
