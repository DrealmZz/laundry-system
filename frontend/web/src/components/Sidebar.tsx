import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ReceiptText,
  Layers,
  Package,
  CalendarCheck,
  CalendarRange,
  Users,
  LineChart,
  BarChart3,
  ChevronRight,
  LogOut,
  Settings,
  FileSpreadsheet,
  X,
  AlertTriangle,
  UserCircle,
} from 'lucide-react';
import LaundajaLogo from './LaundajaLogo';
import { User } from '../types';

interface SidebarProps {
  currentRole: 'kasir' | 'admin' | 'owner';
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingBookingsCount: number;
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

const roleLabels: Record<string, string> = {
  kasir: 'Kasir',
  admin: 'Admin',
  owner: 'Owner',
};

const roleColors: Record<string, string> = {
  kasir: 'bg-teal',
  admin: 'bg-teal/70',
  owner: 'bg-gold',
};

export default function Sidebar({ currentRole, activeTab, onTabChange, pendingBookingsCount, user, onLogout }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const cashierMenus: MenuItem[] = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'new-transaction', label: 'Transaksi Baru', icon: PlusCircle },
    { id: 'transactions', label: 'Daftar Transaksi', icon: ReceiptText },
    { id: 'rekap', label: 'Rekap Harian', icon: FileSpreadsheet },
    { id: 'machines', label: 'Status Mesin', icon: Layers },
    { id: 'customers', label: 'Pelanggan', icon: Users },
  ];

  const adminMenus: MenuItem[] = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'services', label: 'Kelola Layanan', icon: Package },
    { id: 'bookings', label: 'Konfirmasi Booking', icon: CalendarCheck, badge: pendingBookingsCount },
    { id: 'shifts', label: 'Manajemen Shift', icon: CalendarRange },
    { id: 'employees', label: 'Data Karyawan', icon: Users },
  ];

  const ownerMenus: MenuItem[] = [
    { id: 'dashboard', label: 'Beranda Owner', icon: LayoutDashboard },
    { id: 'finance', label: 'Laporan Keuangan', icon: LineChart },
    { id: 'performance', label: 'Performa Shift', icon: BarChart3 },
  ];

  const getMenus = (): MenuItem[] => {
    switch (currentRole) {
      case 'kasir': return cashierMenus;
      case 'admin': return adminMenus;
      case 'owner': return ownerMenus;
    }
  };

  const menus = getMenus();

  return (
    <>
      <aside
        className="w-64 h-screen sticky top-0 flex flex-col justify-between select-none shrink-0 text-ink-subtle border-r border-white/10"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Top Branding & Navigation */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Header */}
          <div className="h-20 px-6 border-b border-white/10 flex items-center gap-3">
            <div style={{width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ffffff'}}>
              <LaundajaLogo size={28} strokeWidth={8} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-white text-base tracking-wide leading-none">laundaja</h1>
              <p className="text-[11px] text-teal-light font-bold tracking-wider font-mono mt-0.5 uppercase">Laundaja Group</p>
            </div>
          </div>

          {/* Scrollable Navigation Space */}
          <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 scrollbar-thin">
            
            {/* Active Role Card Indicator */}
            <div className="mx-2 bg-white/8 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${roleColors[currentRole]}`} />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/40 font-black font-mono">Panel Aktif</p>
                  <h3 className="text-xs font-black text-white mt-0.5">{roleLabels[currentRole]}</h3>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            </div>

            {/* Navigation Items */}
            <div>
              <p className="text-[11px] uppercase font-black text-white/30 px-3.5 mb-3 font-mono tracking-widest">
                Navigasi Utama
              </p>
              
              <nav className="space-y-0.5" aria-label="Menu items">
                {menus.map((menu) => {
                  const Icon = menu.icon;
                  const isActive = activeTab === menu.id;

                  return (
                    <button
                      key={menu.id}
                      onClick={() => onTabChange(menu.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep ${
                        isActive
                          ? 'bg-white/10 text-white backdrop-blur-sm'
                          : 'hover:bg-white/5 hover:text-white text-white/50'
                      }`}
                    >
                      {/* Left Active Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-gradient-to-b from-teal to-teal-light rounded-r-full" />
                      )}

                      <div className="flex items-center gap-3">
                        <Icon className={`w-[18px] h-[18px] transition-colors duration-200 ${
                          isActive ? 'text-teal-light' : 'text-white/30'
                        }`} />
                        <span className="tracking-wide">{menu.label}</span>
                      </div>

                      {menu.badge !== undefined && menu.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          isActive ? 'bg-teal text-white' : 'bg-error text-white'
                        }`}>
                          {menu.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer with User Info and Logout */}
        <div className="border-t border-white/10 bg-[#0a1628] shrink-0 divide-y divide-white/8">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-teal-light" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">{user.name}</p>
              <p className="text-[11px] text-white/40 font-semibold truncate">{user.title}</p>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <button 
              onClick={() => onTabChange('settings')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-white/40 hover:bg-white/5 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]"
            >
              <Settings className="w-[18px] h-[18px]" />
              <span>Pengaturan</span>
            </button>

            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-error/80 hover:bg-error/10 hover:text-error transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowLogoutConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div
            style={{
              borderRadius: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '1.5rem',
              maxWidth: '28rem',
              width: '100%',
              margin: '0 1rem',
              boxShadow: '0 16px 48px rgba(15, 23, 42, 0.12)',
              backdropFilter: 'blur(24px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div className="flex-1">
                <h2 id="logout-title" className="text-base font-black text-ink">Keluar dari sistem?</h2>
                <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                  Anda akan keluar dari akun <span className="font-bold text-ink">{user.name}</span>. Pastikan semua pekerjaan sudah disimpan.
                </p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 text-ink-muted hover:text-ink transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
                aria-label="Tutup dialog"
                onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.color = '#111827'}}
                onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.color = '#6b7280'}}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-[13px] font-bold text-ink-muted hover:text-ink rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
                onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.color = '#111827'}}
                onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.color = '#6b7280'}}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'backgroundColor 200ms'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
