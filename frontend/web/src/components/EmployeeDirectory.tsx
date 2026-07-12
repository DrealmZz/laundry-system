import React, { useState } from 'react';
import { Employee } from '../types';
import { Plus, Search, Mail, Calendar, Trash2, Edit2, Sliders, Check, UserPlus } from 'lucide-react';

interface EmployeeDirectoryProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id' | 'initial' | 'joinDate'>, password: string) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeeDirectory({
  employees,
  onAddEmployee,
  onDeleteEmployee
}: EmployeeDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Add Employee Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Employee['role']>('Kasir');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Employee['status']>('Aktif');
  const [password, setPassword] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Default high resolution placeholder avatars
    const randomSeed = Math.floor(Math.random() * 1000);
    const photoUrl = `https://lh3.googleusercontent.com/aida-public/AB6AXuCKmBaMzym0-ypBJWyvnkzYGreT6VO41TmSmpIn6f6PYO-Oq2S1CzNgsttWeSiPvag-kXH0sAIKOp1Cm6c7hmIlnFzM0X3zmeKlhz8MLitpyJKY_kOMASnAuVxjGIA0XtIMAeTGVGUBzi3rk3fZuzBE6DiM0UI_DKUaBEXnUrNu3mhAX6q0k4Mcr1SYoB8J9KKgOZgSgf7lYSqP9OJWXIZb9BMP39lsWnKoZdMs1a9FiLYzqLdM8qLbGAh1A3L5N7tcmalP-atIRRc`;

    onAddEmployee({
      name: name.trim(),
      role,
      email: email.trim(),
      status,
      photoUrl
    }, password);

    // Reset Form
    setName('');
    setEmail('');
    setRole('Kasir');
    setStatus('Aktif');
    setPassword('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink tracking-tight">Database & Data Karyawan</h2>
          <p className="text-xs text-ink-muted">Arsip data pribadi, jabatan, and status kehadiran staff laundaja</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 btn-primary-gradient text-white font-semibold rounded-xl text-xs shadow-md transition-all self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Karyawan Baru</span>
        </button>
      </div>

      {/* Directory Content Table */}
      <div className="glass-card overflow-hidden flex flex-col">
        {/* Search & Filter bar */}
        <div className="p-4 border-b border-white/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full bg-white/15 border border-white/30 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-teal text-ink-secondary font-semibold"
            />
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white/15 border border-white/30 rounded-xl text-xs px-3 py-2 text-ink-secondary font-semibold focus:outline-none"
            >
              <option value="All">Semua Jabatan</option>
              <option value="Admin Staff">Admin Staff</option>
              <option value="Kasir">Kasir</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Kurir">Kurir</option>
              <option value="Spesialis Cuci">Spesialis Cuci</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/10 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-white/30">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Role / Jabatan</th>
                <th className="py-3 px-4">Email Kontak</th>
                <th className="py-3 px-4">Tanggal Bergabung</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs text-ink-secondary">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted font-medium">
                    Tidak ada karyawan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/10 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 bg-white/25 shrink-0">
                            {emp.photoUrl ? (
                              <img
                                src={emp.photoUrl}
                                alt={emp.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-ink-muted">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        <div>
                          <p className="font-extrabold text-ink leading-snug">{emp.name}</p>
                          <p className="text-[10px] text-ink-muted font-mono">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-ink bg-white/25 px-2 py-0.5 rounded-lg">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-ink-secondary">
                        <Mail className="w-3.5 h-3.5 text-ink-muted/50" />
                        <span>{emp.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-ink-muted">
                        <Calendar className="w-3.5 h-3.5 text-ink-muted/50" />
                        <span>{emp.joinDate}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        emp.status === 'Aktif'
                          ? 'bg-success/10 text-success border-success/15'
                          : emp.status === 'Cuti'
                          ? 'bg-gold/10 text-gold border border-gold/15'
                          : 'bg-white/15 text-ink-secondary border-white/30'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="p-1.5 hover:bg-error/10 hover:text-error text-ink-muted/50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Hapus Karyawan"
                        disabled={emp.id === 'LW-ADM-001'} // protect main admin
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EMPLOYEE MODAL DIALOG */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="glass-card-elevated p-6 space-y-4" style={{ width: '450px', maxWidth: 'calc(100vw - 2rem)' }}>
            <div>
              <h3 className="text-base font-black text-ink tracking-tight">Daftarkan Karyawan Baru</h3>
              <p className="text-xs text-ink-muted">Masukkan rincian data karyawan untuk ditambahkan ke database</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink-secondary mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap staff..."
                  className="w-full bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal text-ink font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-secondary mb-1">Email Kontak</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: budi@laundaja.com"
                  className="w-full bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal text-ink font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-secondary mb-1">Role / Jabatan</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-white/15 border border-white/30 rounded-xl px-3 py-2 focus:outline-none text-ink font-bold"
                  >
                    <option value="Kasir">Kasir</option>
                    <option value="Admin Staff">Admin Staff</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Kurir">Kurir</option>
                    <option value="Spesialis Cuci">Spesialis Cuci</option>
                    <option value="Staff Setrika">Staff Setrika</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink-secondary mb-1">Status Kehadiran</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white/15 border border-white/30 rounded-xl px-3 py-2 focus:outline-none text-ink font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-secondary mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal text-ink font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-white/30">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-white/25 hover:bg-white/20 text-ink-secondary font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 btn-primary-gradient text-white font-bold rounded-xl shadow-md"
              >
                Simpan Staff
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
