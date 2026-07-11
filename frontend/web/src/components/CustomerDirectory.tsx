import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Users, Search, UserPlus, Phone, MapPin, Award, X, Loader2, Mail, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../services/api';
import { showToast } from './Toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  visits: number;
  spend: number;
}

const tierConfig = {
  Gold: { icon: 'text-warning', label: 'text-warning' },
  Silver: { icon: 'text-ink-muted', label: 'text-ink-secondary' },
  Bronze: { icon: 'text-amber-700', label: 'text-amber-800' },
};

export default function CustomerDirectory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addModalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiRequest('/users/customers')
      .then(res => {
        const items = res.data?.items || res.data || [];
        setCustomers(Array.isArray(items)
          ? items.map((c: any) => ({
              id: String(c.id_customer),
              name: c.nama_lengkap || '',
              phone: c.no_hp || '-',
              address: c.alamat || '-',
              email: c.email || '',
              visits: 0,
              spend: 0,
            }))
          : []
        );
      })
      .catch((err) => {
        showToast(err.message || 'Gagal memuat data pelanggan', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  useEffect(() => {
    if (showAddModal) firstInputRef.current?.focus();
  }, [showAddModal]);

  const validateForm = useCallback((): boolean => {
    const errors: { name?: string; phone?: string; password?: string } = {};
    if (!newName.trim()) errors.name = 'Nama pelanggan wajib diisi';
    else if (newName.trim().length < 2) errors.name = 'Nama minimal 2 karakter';
    if (!newPhone.trim()) errors.phone = 'Nomor telepon wajib diisi';
    else if (!/^0[\d\s-]{8,15}$/.test(newPhone.replace(/\s/g, '')))
      errors.phone = 'Format nomor tidak valid (contoh: 0812-xxxx-xxxx)';
    if (!newPassword) errors.password = 'Password wajib diisi';
    else if (newPassword.length < 6) errors.password = 'Password minimal 6 karakter';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newName, newPhone, newPassword]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const phone = newPhone.trim().replace(/\s/g, '');
      await apiRequest('/users/customers', {
        method: 'POST',
        body: JSON.stringify({
          nama_lengkap: newName.trim(),
          username: phone,
          no_hp: phone,
          email: `${phone}@laundaja.com`,
          password: newPassword,
          alamat: newAddress.trim() || 'Tidak diisi',
        }),
      });
      const res = await apiRequest('/users/customers');
      const items = res.data?.items || res.data || [];
      setCustomers(Array.isArray(items) ? items.map((c: any) => ({
        id: String(c.id_customer),
        name: c.nama_lengkap || '',
        phone: c.no_hp || '-',
        address: c.alamat || '-',
        email: c.email || '',
        visits: 0,
        spend: 0,
      })) : []);
      setNewName(''); setNewPhone(''); setNewAddress(''); setNewPassword('');
      setFormErrors({}); setShowAddModal(false);
      showToast('Pelanggan berhasil ditambahkan');
    } catch (err: any) {
      showToast(err.message || 'Gagal menambah pelanggan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Database Pelanggan</h2>
          <p className="text-xs text-ink-muted mt-1">Pencatatan profil pelanggan dari aplikasi dan registrasi kasir</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-navy-deep hover:bg-navy-hover text-white font-bold text-xs rounded-[var(--radius-md)] flex items-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4 text-gold" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      <div className="glass-card p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-ink-muted shrink-0" />
        <input
          type="text"
          placeholder="Cari nama pelanggan atau nomor telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs font-semibold focus:outline-none placeholder:text-ink-muted text-ink-secondary"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-ink-muted hover:text-ink-secondary transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-ink-muted" />
          </div>
          <p className="font-bold text-ink-secondary text-sm">
            {search ? 'Tidak ditemukan pelanggan' : 'Belum ada pelanggan terdaftar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => (
            <div key={cust.id} className="glass-card p-5 space-y-4 hover:border-white/30 transition-colors">

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-white/25 flex items-center justify-center font-black text-xs text-ink shrink-0">
                  {cust.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-ink leading-none truncate" title={cust.name}>{cust.name}</h4>
                  <p className="text-[11px] text-ink-muted font-mono mt-1">ID: {cust.id}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-ink-secondary">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span className="truncate" title={cust.address}>{cust.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div ref={addModalRef} className="glass-card-elevated p-6 space-y-4" style={{ width: '450px', maxWidth: 'calc(100vw - 2rem)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-ink">Tambah Pelanggan Baru</h3>
                <p className="text-xs text-ink-muted mt-1">Data akan tersimpan di database</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-ink-muted hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                  Nama Lengkap <span className="text-error">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setFormErrors(p => ({ ...p, name: undefined })); }}
                  placeholder="Contoh: Budi Hartono"
                  className={`w-full bg-white/15 border rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold focus:outline-none text-ink-secondary ${
                    formErrors.name ? 'border-error' : 'border-white/30'
                  }`}
                />
                {formErrors.name && <p className="text-[11px] text-error font-semibold">{formErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                  Nomor Telepon <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => { setNewPhone(e.target.value); setFormErrors(p => ({ ...p, phone: undefined })); }}
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  className={`w-full bg-white/15 border rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold focus:outline-none text-ink-secondary ${
                    formErrors.phone ? 'border-error' : 'border-white/30'
                  }`}
                />
                {formErrors.phone && <p className="text-[11px] text-error font-semibold">{formErrors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">Alamat</label>
                <textarea
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Masukkan alamat..."
                  className="w-full bg-white/15 border border-white/30 rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold focus:outline-none h-20 resize-none text-ink-secondary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-ink-secondary uppercase tracking-wider font-mono">
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setFormErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="Minimal 6 karakter"
                    className={`w-full bg-white/15 border rounded-[var(--radius-md)] px-4 py-2.5 pr-10 text-xs font-semibold focus:outline-none text-ink-secondary ${
                      formErrors.password ? 'border-error' : 'border-white/30'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-[11px] text-error font-semibold">{formErrors.password}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setFormErrors({}); setIsSubmitting(false); }}
                  className="flex-1 py-2.5 bg-white/25 hover:bg-white/20 text-ink-secondary font-bold text-xs rounded-[var(--radius-md)]">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-navy-deep hover:bg-navy-hover text-white font-bold text-xs rounded-[var(--radius-md)] disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
