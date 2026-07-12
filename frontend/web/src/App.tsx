import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, Booking, Employee, Service, Task, ShiftBlock, User, FinanceReport, ReportSummary, ReportPeriod, Customer, Machine, OperationalCost, ProfitLossReport, SalesTarget, ShiftPerformanceReport } from './types';
import {
  initialTransactions,
  initialBookings,
  initialEmployees,
  initialServices,
  initialTasks,
  initialShiftBlocks
} from './initialData';
import { apiRequest } from './services/api';

// Component imports
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CashierDashboard from './components/CashierDashboard';
import CashierConfirmOrders from './components/CashierConfirmOrders';
import NewTransaction from './components/NewTransaction';
import ReceiptPrint from './components/ReceiptPrint';
import MachinesStatus from './components/MachinesStatus';
import TransactionsHistory from './components/TransactionsHistory';
import AdminPanel from './components/AdminPanel';
import ConfirmBookings from './components/ConfirmBookings';
import ShiftManagement from './components/ShiftManagement';
import EmployeeDirectory from './components/EmployeeDirectory';
import ServiceManagement from './components/ServiceManagement';
import MachineManagement from './components/MachineManagement';
import AuditLogViewer from './components/AuditLogViewer';
import OwnerDashboard from './components/OwnerDashboard';
import OwnerFinanceReport from './components/OwnerFinanceReport';
import OwnerShiftPerformance from './components/OwnerShiftPerformance';
import DailyRecap from './components/DailyRecap';
import CustomerDirectory from './components/CustomerDirectory';
import LoginPage from './components/LoginPage';
import ToastContainer, { showToast } from './components/Toast';

// ── Mapping Functions ──────────────────────────────────────
function mapBookingStatus(status: string): Booking['status'] {
  const map: Record<string, Booking['status']> = {
    'menunggu konfirmasi': 'Menunggu',
    'disetujui': 'Disetujui',
    'diproses': 'Diproses',
    'penjemputan': 'Dijemput',
    'penimbangan': 'Dijemput',
    'menunggu pembayaran': 'Diproses',
    'sudah dibayar': 'Diproses',
    'sedang di cuci': 'Diproses',
    'sedang di keringkan': 'Diproses',
    'sedang di setrika': 'Diproses',
    'pencucian selesai': 'Diproses',
    'pengiriman': 'Diproses',
    'selesai': 'Selesai',
    'pesanan ditolak': 'Tolak',
    'pesanan dibatalkan': 'Dibatalkan',
  };
  return map[status] || 'Menunggu';
}

function mapBookingFromBackend(b: any): Booking {
  return {
    id: String(b.id_pemesanan ?? ''),
    id_pemesanan: String(b.id_pemesanan ?? ''),
    customerName: b.customer_nama || 'Customer',
    memberLevel: 'REGULAR',
    layanan: b.nama_layanan || '',
    tanggal: b.tanggal_pesanan || '',
    shift: b.shift || '',
    lokasiMesin: '',
    status: mapBookingStatus(b.status_pesanan),
    icon: b.jenis_pencucian === 'kiloan' ? '📦' : '🪙',
    berat_kg: b.berat_kg || null,
    status_pesanan_raw: b.status_pesanan || '',
    jenis_pencucian: b.jenis_pencucian || '',
    tanggal_pengiriman: b.tanggal_pengiriman || null,
    shift_pengiriman: b.shift_pengiriman || null,
    harga: parseFloat(b.harga) || 0,
    metode_pengambilan: b.metode_pengambilan || 'ambil_sendiri',
  };
}

function mapTransactionStatus(status: string): Transaction['status'] {
  const map: Record<string, Transaction['status']> = {
    'lunas': 'Selesai',
    'belum dibayar': 'Antri',
    'gagal': 'Antri',
  };
  return map[status] || 'Antri';
}

function mapTransactionFromBackend(t: any): Transaction {
  const d = new Date(t.tanggal_transaksi);
  const jenisLayanan = t.jenis_layanan || t.jenis_pencucian || '';
  return {
    id: t.nomor_struk || String(t.id_transaksi ?? ''),
    id_transaksi: t.id_transaksi ? Number(t.id_transaksi) : undefined,
    customerName: t.customer_nama || t.nama_customer || 'Customer',
    customerInitial: (t.customer_nama || t.nama_customer || 'C')[0].toUpperCase(),
    serviceName: t.nama_layanan || '',
    serviceType: jenisLayanan === 'kiloan' ? 'Kiloan' : 'Koin',
    weightOrQty: t.berat_kg || 1,
    amount: parseFloat(t.total) || 0,
    status: mapTransactionStatus(t.status_pembayaran),
    time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    paymentMethod: t.metode_pembayaran === 'qris' ? 'QRIS' : 'Cash',
    cashierName: t.karyawan_nama || t.nama_karyawan || 'Kasir',
  };
}

function mapEmployeeFromBackend(e: any): Employee {
  return {
    id: String(e.id_karyawan ?? ''),
    name: e.nama_lengkap || '',
    role: e.role === 'admin' ? 'Admin Staff' : 'Kasir',
    email: e.email || '',
    status: e.status_akun === 'aktif' ? 'Aktif' : 'Nonaktif',
    joinDate: new Date(e.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    initial: (e.nama_lengkap || 'XX').substring(0, 2).toUpperCase(),
    photoUrl: null,
  };
}

function mapServiceFromBackend(s: any): Service {
  return {
    id: String(s.id_layanan ?? ''),
    name: s.nama_layanan || '',
    type: s.jenis_layanan === 'kiloan' ? 'Kiloan' : 'Koin',
    price: parseFloat(s.harga) || 0,
    unit: s.jenis_layanan === 'kiloan' ? 'kg' : 'token',
    duration: `${s.estimasi_waktu || 0} menit`,
    status: s.status_layanan !== false,
    packageType: s.jenis_layanan === 'kiloan' ? 'Kiloan' : 'Koin',
  };
}

function mapMachineFromBackend(m: any): Machine {
  return {
    id: String(m.id_mesin ?? ''),
    kode_mesin: m.kode_mesin || '',
    nama_mesin: m.nama_mesin || '',
    tipe_mesin: m.tipe_mesin || 'pencucian',
    status_mesin: m.status_mesin || 'tersedia',
    kapasitas_kg: m.kapasitas_kg ?? null,
    konsumsi_kwh: m.konsumsi_kwh ? parseFloat(m.konsumsi_kwh) : null,
    penggunaan_air_liter: m.penggunaan_air_liter ? parseFloat(m.penggunaan_air_liter) : null,
  };
}

function getShiftStartTime(index: number): string {
  return ['08:00', '12:00', '16:00', '20:00'][index] || '08:00';
}

function getShiftEndTime(index: number): string {
  return ['16:00', '20:00', '24:00', '04:00'][index] || '16:00';
}

// ── Path-based Routing ─────────────────────────────────────
function parsePath(): { role: 'kasir' | 'admin' | 'owner' | null; tab: string } {
  const m = window.location.pathname.match(/^\/(kasir|admin|owner)(?:\/(\w+))?/);
  if (m) return { role: m[1] as 'kasir' | 'admin' | 'owner', tab: m[2] || 'dashboard' };
  if (window.location.pathname === '/login') return { role: null, tab: 'login' };
  return { role: null, tab: 'dashboard' };
}

const ROLE_DISPLAY: Record<string, { name: string; title: string }> = {
  kasir: { name: 'Kasir', title: 'Kasir' },
  admin: { name: 'Admin', title: 'Admin' },
  owner: { name: 'Owner', title: 'Owner' },
};

function createRoleUser(role: 'kasir' | 'admin' | 'owner'): User {
  const info = ROLE_DISPLAY[role];
  return {
    username: `${role}@laundaja.com`,
    name: info.name,
    role,
    title: info.title,
  };
}

// ── Main App Component ─────────────────────────────────────
export default function App() {
  // Auth state — prioritaskan URL path, fallback localStorage
  const pathInfo = parsePath();
  const [user, setUser] = useState<User | null>(() => {
    if (pathInfo.role) {
      const roleToken = localStorage.getItem(`lw_token_${pathInfo.role}`);
      if (roleToken) return createRoleUser(pathInfo.role);
      return null;
    }
    const saved = localStorage.getItem('lw_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const role = localStorage.getItem('lw_auth_role');
    return role ? localStorage.getItem(`lw_token_${role}`) : null;
  });
  const role = user?.role || 'kasir';

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (pathInfo.role) return pathInfo.tab;
    return localStorage.getItem('lw_active_tab') || 'dashboard';
  });

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('lw_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [shiftBlocks, setShiftBlocks] = useState<ShiftBlock[]>(initialShiftBlocks);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<string | null>(() => localStorage.getItem('lw_auth_role'));
  const [dataLoading, setDataLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Report states (owner)
  const [reportFinance, setReportFinance] = useState<FinanceReport | null>(null);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [reportProfitLoss, setReportProfitLoss] = useState<ProfitLossReport | null>(null);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);
  const [salesTarget, setSalesTarget] = useState<SalesTarget | null>(null);
  const [reportShiftPerformance, setReportShiftPerformance] = useState<ShiftPerformanceReport | null>(null);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('bulan_ini');

  function getDateRange(period: ReportPeriod): { start_date: string; end_date: string } {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start: Date;
    switch (period) {
      case 'hari_ini': start = now; break;
      case 'minggu_ini': start = new Date(now); start.setDate(now.getDate() - 7); break;
      case 'bulan_ini': start = new Date(now); start.setDate(1); break;
      case 'tahun_ini': start = new Date(now); start.setMonth(0, 1); break;
    }
    return { start_date: start!.toISOString().split('T')[0], end_date: end };
  }

  // ── Sync user & tasks to localStorage ──
  useEffect(() => {
    if (user) {
      localStorage.setItem('lw_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lw_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lw_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('lw_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // ── Data Fetching ──
  const fetchData = useCallback(async () => {
    if (!token) { setDataLoading(false); return; }
    setDataLoading(true);
    try {
      const calls: Promise<any>[] = [
        apiRequest('/pemesanan').catch(() => null),
        apiRequest('/transaksi').catch(() => null),
        authRole === 'admin' ? apiRequest('/users/karyawan').catch(() => null) : Promise.resolve(null),
        apiRequest('/services').catch(() => null),
        authRole !== 'owner' ? apiRequest('/users/customers').catch(() => null) : Promise.resolve(null),
        authRole === 'admin' ? apiRequest('/mesin').catch(() => null) : Promise.resolve(null),
      ];

      if (authRole === 'owner') {
        const { start_date, end_date } = getDateRange(reportPeriod);
        const periode = end_date.slice(0, 7);
        calls.push(
          apiRequest(`/reports/finance?start_date=${start_date}&end_date=${end_date}`).catch(() => null),
          apiRequest(`/reports/summary?start_date=${start_date}&end_date=${end_date}`).catch(() => null),
          apiRequest(`/reports/profit-loss?start_date=${start_date}&end_date=${end_date}`).catch(() => null),
          apiRequest(`/reports/operational-costs?start_date=${start_date}&end_date=${end_date}`).catch(() => null),
          apiRequest(`/reports/sales-target?periode=${periode}`).catch(() => null),
          apiRequest(`/reports/shift-performance?start_date=${start_date}&end_date=${end_date}`).catch(() => null),
        );
      }

      const [bookingsRes, txRes, empRes, svcRes, custRes, machinesRes, reportFinanceRes, reportSummaryRes, reportProfitLossRes, operationalCostsRes, salesTargetRes, shiftPerformanceRes] = await Promise.all(calls);

      if (bookingsRes?.data) {
        const items = bookingsRes.data.items || bookingsRes.data;
        if (Array.isArray(items)) setBookings(items.map(mapBookingFromBackend));
      }
      if (txRes?.data) {
        const items = txRes.data.items || txRes.data;
        if (Array.isArray(items)) setTransactions(items.map(mapTransactionFromBackend));
      }
      if (empRes?.data) {
        const items = empRes.data.items || empRes.data;
        if (Array.isArray(items)) setEmployees(items.map(mapEmployeeFromBackend));
      }
      if (svcRes?.data) {
        const items = svcRes.data.items || svcRes.data;
        if (Array.isArray(items)) setServices(items.map(mapServiceFromBackend));
      }
      if (machinesRes?.data) {
        const items = machinesRes.data.items || machinesRes.data;
        if (Array.isArray(items)) setMachines(items.map(mapMachineFromBackend));
      }
      if (custRes?.data) {
        const items = custRes.data.items || custRes.data;
        if (Array.isArray(items)) setCustomers(items.map((c: any) => ({
          id_customer: c.id_customer,
          nama_lengkap: c.nama_lengkap || '',
          username: c.username || '',
          no_hp: c.no_hp || '',
          email: c.email || '',
          alamat: c.alamat || '',
          status_akun: c.status_akun || 'aktif',
        })));
      }
      if (reportFinanceRes?.data) setReportFinance(reportFinanceRes.data as FinanceReport);
      if (reportSummaryRes?.data) setReportSummary(reportSummaryRes.data as ReportSummary);
      if (reportProfitLossRes?.data) setReportProfitLoss(reportProfitLossRes.data as ProfitLossReport);
      if (operationalCostsRes?.data && Array.isArray(operationalCostsRes.data)) setOperationalCosts(operationalCostsRes.data as OperationalCost[]);
      if (salesTargetRes?.data) setSalesTarget(salesTargetRes.data as SalesTarget);
      if (shiftPerformanceRes?.data) setReportShiftPerformance(shiftPerformanceRes.data as ShiftPerformanceReport);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [token, authRole, reportPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handle browser back/forward ──
  useEffect(() => {
    const onPop = () => {
      const p = parsePath();
      if (p.role) {
        setUser(prev => (prev?.role !== p.role ? createRoleUser(p.role) : prev));
        setActiveTab(p.tab);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── Auth Handlers ──
  const handleLogin = async (identifier: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    const backendToken = response.data?.token;
    const backendUser = response.data?.user;

    if (!backendToken) {
      throw new Error('Token tidak ditemukan');
    }

    const mappedRole: 'kasir' | 'admin' | 'owner' = (() => {
      const roleMap: Record<string, 'kasir' | 'admin' | 'owner'> = {
        'kasir': 'kasir',
        'admin': 'admin',
        'owner': 'owner',
      };
      return roleMap[response.data?.user?.role] || 'kasir';
    })();

    localStorage.setItem(`lw_token_${mappedRole}`, backendToken);
    setToken(backendToken);

    localStorage.setItem('lw_auth_role', mappedRole);
    setAuthRole(mappedRole);

    setUser({
      username: backendUser?.email || identifier,
      name: backendUser?.nama_lengkap || identifier,
      role: mappedRole,
      title: mappedRole === 'kasir' ? 'Kasir' : mappedRole === 'admin' ? 'Admin' : 'Owner',
    });

    setActiveTab('dashboard');
    setSelectedReceiptId(null);
    window.history.replaceState(null, '', `/${mappedRole}/dashboard`);
  };

  const handleLogout = () => {
    if (authRole) localStorage.removeItem(`lw_token_${authRole}`);
    localStorage.removeItem('lw_auth_role');
    setToken(null);
    setAuthRole(null);
    setUser(null);
    setActiveTab('dashboard');
    setSelectedReceiptId(null);
    window.history.pushState(null, '', '/login');
  };

  // ── Task Handlers (localStorage) ──
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (text: string) => {
    setTasks(prev => [{ id: Date.now().toString(), text, completed: false }, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // ── Transaction Handler ──
  const handleAddTransaction = async (payload: {
    nama_lengkap: string;
    no_hp: string;
    id_layanan: number;
    berat_kg: number;
    jenis_pencucian: string;
    metode_pengambilan: string;
    metode_pembayaran: string;
    alamat?: string;
    password?: string;
    serviceName: string;
    serviceType: string;
    cashierName: string;
  }): Promise<string> => {
    const res = await apiRequest('/transaksi/walk-in', {
      method: 'POST',
      body: JSON.stringify({
        nama_lengkap: payload.nama_lengkap,
        no_hp: payload.no_hp,
        id_layanan: payload.id_layanan,
        berat_kg: payload.berat_kg,
        jenis_pencucian: payload.jenis_pencucian,
        metode_pengambilan: payload.metode_pengambilan,
        metode_pembayaran: payload.metode_pembayaran,
        alamat: payload.alamat,
        password: payload.password,
      }),
    });

    const d = res.data;
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const createdTx: Transaction = {
      id: d.nomor_struk,
      id_transaksi: d.id_transaksi,
      customerName: payload.nama_lengkap,
      customerInitial: payload.nama_lengkap.substring(0, 2).toUpperCase(),
      serviceName: payload.serviceName,
      serviceType: payload.serviceType as Transaction['serviceType'],
      weightOrQty: payload.berat_kg,
      amount: d.total,
      status: 'Selesai',
      time: timeStr,
      date: dateStr,
      paymentMethod: payload.metode_pembayaran === 'qris' ? 'QRIS' : 'Cash',
      cashierName: payload.cashierName,
    };

    setTransactions(prev => [createdTx, ...prev]);
    return d.nomor_struk;
  };

  // ── Local state update helper (for demo without backend) ──
  const updateLocalBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b =>
      (b.id_pemesanan || b.id) === id ? { ...b, ...updates } : b
    ));
  };

  // ── Booking Handlers ──
  const handleConfirmBooking = async (id: string) => {
    if (!token || authRole !== 'admin') {
      updateLocalBooking(id, { status_pesanan_raw: 'disetujui', status: 'Disetujui' });
      showToast('Booking berhasil dikonfirmasi!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/approve`, {
        method: 'PATCH',
      });
      await fetchData();
      showToast('Booking berhasil dikonfirmasi!');
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      showToast(error.message || 'Gagal mengkonfirmasi booking', 'error');
    }
  };

  const handleRejectBooking = async (id: string, reason?: string) => {
    if (!token || authRole !== 'admin') {
      updateLocalBooking(id, { status_pesanan_raw: 'pesanan ditolak', status: 'Tolak' });
      showToast('Booking berhasil ditolak!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ catatan: reason || 'Ditolak oleh admin' }),
      });
      await fetchData();
      showToast('Booking berhasil ditolak!');
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      showToast(error.message || 'Gagal menolak booking', 'error');
    }
  };

  const handleConfirmPickup = async (id: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'penjemputan', status: 'Dijemput' });
      showToast('Konfirmasi jemput berhasil!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/confirm-pickup`, {
        method: 'PATCH',
      });
      await fetchData();
      showToast('Konfirmasi jemput berhasil!');
    } catch (error: any) {
      console.error('Error confirming pickup:', error);
      showToast(error.message || 'Gagal konfirmasi jemput', 'error');
    }
  };

  const handleConfirmClothes = async (id: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'penimbangan', status: 'Dijemput' });
      showToast('Konfirmasi pakaian diterima berhasil!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/confirm-clothes`, {
        method: 'PATCH',
      });
      await fetchData();
      showToast('Konfirmasi pakaian diterima berhasil!');
    } catch (error: any) {
      console.error('Error confirming clothes:', error);
      showToast(error.message || 'Gagal konfirmasi pakaian', 'error');
    }
  };

  const handleWeigh = async (id: string, berat_kg: number) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'menunggu pembayaran', status: 'Diproses', berat_kg });
      showToast('Berat berhasil diinput!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/weigh`, {
        method: 'PATCH',
        body: JSON.stringify({ berat_kg }),
      });
      await fetchData();
      showToast('Berat berhasil diinput!');
    } catch (error: any) {
      console.error('Error weighing:', error);
      showToast(error.message || 'Gagal input berat', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: status, status: mapBookingStatus(status) });
      showToast(`Status berhasil diubah ke '${status}'!`);
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_pesanan: status }),
      });
      await fetchData();
      showToast(`Status berhasil diubah ke '${status}'!`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast(error.message || 'Gagal mengubah status', 'error');
    }
  };

  const handlePayKoin = async (id: string, metode: string) => {
    if (!token) {
      showToast('Payment processed locally (demo mode).', 'info');
      return;
    }
    try {
      await apiRequest('/transaksi', {
        method: 'POST',
        body: JSON.stringify({ id_pemesanan: id, metode_pembayaran: metode }),
      });
      await fetchData();
      showToast('Pembayaran koin berhasil!');
    } catch (error: any) {
      console.error('Error processing koin payment:', error);
      showToast(error.message || 'Gagal memproses pembayaran koin', 'error');
    }
  };

  // ── Employee Handlers ──
  const handleAddEmployee = async (empInput: Omit<Employee, 'id' | 'initial' | 'joinDate'>, password: string) => {
    try {
      await apiRequest('/users/karyawan', {
        method: 'POST',
        body: JSON.stringify({
          nama_lengkap: empInput.name,
          username: empInput.email.split('@')[0],
          email: empInput.email,
          password,
          role: empInput.role === 'Admin Staff' ? 'admin' : 'kasir',
        }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await apiRequest(`/users/karyawan/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'tidak aktif' }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  // ── Service Handlers ──
  const handleToggleServiceStatus = async (id: string) => {
    try {
      const svc = services.find(s => s.id === id);
      await apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status_layanan: !(svc?.status ?? true) }),
      });
      await fetchData();
    } catch (error: any) {
      console.error('Error toggling service status:', error);
      showToast('Gagal mengubah status layanan: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleUpdateService = async (id: string, data: { name?: string; duration?: string; price?: number }) => {
    try {
      const body: Record<string, any> = {};
      if (data.name !== undefined) body.nama_layanan = data.name;
      if (data.duration !== undefined) {
        const minutes = parseInt(data.duration.replace(/\D/g, ''), 10);
        if (!isNaN(minutes) && minutes > 0) body.estimasi_waktu = minutes;
      }
      if (data.price !== undefined) body.harga = data.price;
      await apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      await fetchData();
    } catch (error: any) {
      console.error('Error updating service:', error);
      showToast('Gagal mengubah layanan: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  // ── Machine Handlers ──
  const handleCreateMachine = async (data: Partial<Machine>) => {
    try {
      await apiRequest('/mesin', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await fetchData();
      showToast('Mesin berhasil ditambahkan', 'success');
    } catch (error: any) {
      console.error('Error creating machine:', error);
      showToast('Gagal menambah mesin: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleUpdateMachine = async (id: string, data: Partial<Machine>) => {
    try {
      await apiRequest(`/mesin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await fetchData();
      showToast('Mesin berhasil diupdate', 'success');
    } catch (error: any) {
      console.error('Error updating machine:', error);
      showToast('Gagal mengubah mesin: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleDeleteMachine = async (id: string) => {
    try {
      await apiRequest(`/mesin/${id}`, { method: 'DELETE' });
      await fetchData();
      showToast('Mesin berhasil dihapus', 'success');
    } catch (error: any) {
      console.error('Error deleting machine:', error);
      showToast('Gagal menghapus mesin: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleToggleMachineStatus = async (id: string, status: 'tersedia' | 'dipakai' | 'perbaikan') => {
    try {
      await apiRequest(`/mesin/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_mesin: status }),
      });
      await fetchData();
    } catch (error: any) {
      console.error('Error toggling machine status:', error);
      showToast('Gagal mengubah status mesin: ' + (error.message || 'Terjadi kesalahan'), 'error');
    }
  };

  // ── Shift Handlers ──
  const handleAddEmployeeToShift = async (dayIndex: number, shiftIndex: number, employeeId: string) => {
    try {
      const shiftNames = ['pagi', 'siang', 'sore', 'malam'];
      const shiftName = shiftNames[shiftIndex];
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (dayIndex - today.getDay() + 7) % 7);
      const tanggal = targetDate.toISOString().split('T')[0];

      const shiftsRes = await apiRequest(`/shifts?tanggal=${tanggal}&nama_shift=${shiftName}`);
      const shifts = shiftsRes.data?.items || [];

      let shiftId: number;
      if (shifts.length > 0) {
        shiftId = shifts[0].id_shift;
      } else {
        const createRes = await apiRequest('/shifts', {
          method: 'POST',
          body: JSON.stringify({
            nama_shift: shiftName,
            tanggal,
            jam_mulai: getShiftStartTime(shiftIndex),
            jam_selesai: getShiftEndTime(shiftIndex),
          }),
        });
        shiftId = createRes.data.id_shift;
      }

      await apiRequest(`/shifts/${shiftId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ id_karyawan: parseInt(employeeId) }),
      });

      setShiftBlocks(prev => {
        const idx = prev.findIndex(b => b.dayIndex === dayIndex && b.shiftIndex === shiftIndex);
        if (idx > -1) {
          const updated = [...prev];
          const assigned = [...updated[idx].assignedEmployeeIds];
          if (!assigned.includes(employeeId)) assigned.push(employeeId);
          updated[idx] = { ...updated[idx], assignedEmployeeIds: assigned };
          return updated;
        }
        return [...prev, { dayIndex, shiftIndex, assignedEmployeeIds: [employeeId] }];
      });
    } catch (error) {
      console.error('Error adding employee to shift:', error);
    }
  };

  const handleRemoveEmployeeFromShift = async (dayIndex: number, shiftIndex: number, employeeId: string) => {
    try {
      const shiftNames = ['pagi', 'siang', 'sore', 'malam'];
      const shiftName = shiftNames[shiftIndex];
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (dayIndex - today.getDay() + 7) % 7);
      const tanggal = targetDate.toISOString().split('T')[0];

      const shiftsRes = await apiRequest(`/shifts?tanggal=${tanggal}&nama_shift=${shiftName}`);
      const shifts = shiftsRes.data?.items || [];

      if (shifts.length > 0) {
        await apiRequest(`/shifts/${shifts[0].id_shift}/unassign/${employeeId}`, {
          method: 'DELETE',
        });
      }

      setShiftBlocks(prev => {
        const idx = prev.findIndex(b => b.dayIndex === dayIndex && b.shiftIndex === shiftIndex);
        if (idx > -1) {
          const updated = [...prev];
          const assigned = updated[idx].assignedEmployeeIds.filter(id => id !== employeeId);
          updated[idx] = { ...updated[idx], assignedEmployeeIds: assigned };
          return updated;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error removing employee from shift:', error);
    }
  };

  // ── Owner: Operational Cost & Sales Target Handlers ──
  const handleAddOperationalCost = async (payload: { tanggal?: string; kategori: string; jumlah: number; deskripsi?: string }) => {
    try {
      await apiRequest('/reports/operational-costs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchData();
      showToast('Biaya operasional berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error adding operational cost:', error);
      showToast(error.message || 'Gagal menambah biaya operasional', 'error');
    }
  };

  const handleDeleteOperationalCost = async (id: number) => {
    try {
      await apiRequest(`/reports/operational-costs/${id}`, { method: 'DELETE' });
      await fetchData();
      showToast('Biaya operasional berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting operational cost:', error);
      showToast(error.message || 'Gagal menghapus biaya operasional', 'error');
    }
  };

  const handleSetSalesTarget = async (periode: string, target_amount: number) => {
    try {
      await apiRequest('/reports/sales-target', {
        method: 'PUT',
        body: JSON.stringify({ periode, target_amount }),
      });
      await fetchData();
      showToast('Target penjualan berhasil disimpan!');
    } catch (error: any) {
      console.error('Error setting sales target:', error);
      showToast(error.message || 'Gagal menyimpan target penjualan', 'error');
    }
  };

  // ── Content View Router ──
  const renderContentView = () => {
    if (selectedReceiptId) {
      const targetTx = transactions.find(t => t.id === selectedReceiptId) || null;
      return <ReceiptPrint transaction={targetTx} onBack={() => setSelectedReceiptId(null)} />;
    }

    if (role === 'kasir') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <CashierDashboard
              transactions={transactions}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onSelectReceipt={setSelectedReceiptId}
              onNavigateToNewTransaction={() => setActiveTab('new-transaction')}
              loading={dataLoading}
            />
          );
        case 'confirm-orders':
          return <CashierConfirmOrders bookings={bookings} onConfirmPickup={handleConfirmPickup} onConfirmClothes={handleConfirmClothes} onWeigh={handleWeigh} onUpdateStatus={handleUpdateStatus} onPayKoin={handlePayKoin} loading={dataLoading} />;
        case 'new-transaction':
          return (
            <NewTransaction
              services={services.filter(s => s.status)}
              customers={customers}
              onAddTransaction={handleAddTransaction}
              onSelectReceipt={setSelectedReceiptId}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          );
        case 'transactions':
          return <TransactionsHistory transactions={transactions} onSelectReceipt={setSelectedReceiptId} loading={dataLoading} />;
        case 'rekap':
          return <DailyRecap transactions={transactions} />;
        case 'machines':
          return <MachinesStatus />;
        case 'customers':
          return <CustomerDirectory />;
        default:
          return <div className="text-xs text-ink-muted">Kasir Tab Belum Terintegrasi</div>;
      }
    }

    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <AdminPanel
              bookings={bookings}
              transactions={transactions}
              employees={employees}
              verifikasiCount={verifikasiCount}
              onConfirmBooking={handleConfirmBooking}
              onRejectBooking={handleRejectBooking}
            />
          );
        case 'bookings':
          return (
            <ConfirmBookings
              bookings={bookings}
              onConfirmBooking={handleConfirmBooking}
              onRejectBooking={handleRejectBooking}
              onConfirmPickup={handleConfirmPickup}
              onConfirmClothes={handleConfirmClothes}
              onWeigh={handleWeigh}
              onUpdateStatus={handleUpdateStatus}
              userRole={role}
            />
          );
        case 'shifts':
          return (
            <ShiftManagement
              employees={employees}
              shiftBlocks={shiftBlocks}
              onAddEmployeeToShift={handleAddEmployeeToShift}
              onRemoveEmployeeFromShift={handleRemoveEmployeeFromShift}
            />
          );
        case 'employees':
          return (
            <EmployeeDirectory
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          );
        case 'services':
          return (
            <ServiceManagement
              services={services}
              onToggleServiceStatus={handleToggleServiceStatus}
              onUpdateService={handleUpdateService}
            />
          );
        case 'machines':
          return (
            <MachineManagement
              machines={machines}
              onCreateMachine={handleCreateMachine}
              onUpdateMachine={handleUpdateMachine}
              onDeleteMachine={handleDeleteMachine}
              onToggleStatus={handleToggleMachineStatus}
            />
          );
        case 'audit-logs':
          return <AuditLogViewer />;
        default:
          return <div className="text-xs text-ink-muted">Admin Tab Belum Terintegrasi</div>;
      }
    }

    if (role === 'owner') {
      const handlePeriodChange = (period: ReportPeriod) => {
        setReportPeriod(period);
      };

      const handleRefresh = () => {
        fetchData();
      };

      switch (activeTab) {
        case 'dashboard':
          return (
            <OwnerDashboard
              transactions={transactions}
              reportFinance={reportFinance}
              reportSummary={reportSummary}
              salesTarget={salesTarget}
              reportPeriod={reportPeriod}
              onPeriodChange={handlePeriodChange}
              onRefresh={handleRefresh}
              onSetSalesTarget={handleSetSalesTarget}
              loading={dataLoading}
            />
          );
        case 'finance':
          return (
            <OwnerFinanceReport
              transactions={transactions}
              reportFinance={reportFinance}
              reportProfitLoss={reportProfitLoss}
              operationalCosts={operationalCosts}
              reportPeriod={reportPeriod}
              onPeriodChange={handlePeriodChange}
              onRefresh={handleRefresh}
              onAddOperationalCost={handleAddOperationalCost}
              onDeleteOperationalCost={handleDeleteOperationalCost}
              loading={dataLoading}
            />
          );
        case 'performance':
          return (
            <OwnerShiftPerformance
              reportShiftPerformance={reportShiftPerformance}
              reportPeriod={reportPeriod}
              onPeriodChange={handlePeriodChange}
              onRefresh={handleRefresh}
              loading={dataLoading}
            />
          );
        default:
          return <div className="text-xs text-ink-muted">Owner Tab Belum Terintegrasi</div>;
      }
    }

    return null;
  };

  const pendingBookingsCount = bookings.filter(b => b.status_pesanan_raw === 'menunggu konfirmasi').length;
  const kasirActiveCount = bookings.filter(b => ['menunggu konfirmasi', 'disetujui', 'penjemputan', 'penimbangan', 'menunggu pembayaran', 'sudah dibayar', 'diproses', 'sedang di cuci', 'sedang di keringkan', 'sedang di setrika', 'pencucian selesai'].includes(b.status_pesanan_raw || '')).length;
  const verifikasiCount = bookings.filter(b => b.status_pesanan_raw === 'sudah dibayar').length;

  if (!token && pathInfo.role && !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!user && !parsePath().role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-page flex font-sans antialiased text-ink w-full overflow-hidden">
      <ToastContainer />
      <Sidebar
        currentRole={role}
        activeTab={activeTab}
        onTabChange={(tab) => { window.history.pushState(null, '', `/${role}/${tab}`); setActiveTab(tab); }}
        pendingBookingsCount={pendingBookingsCount}
        kasirActiveCount={kasirActiveCount}
        verifikasiCount={verifikasiCount}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header currentRole={role} user={user} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full transition-all duration-200">
          <div className="max-w-7xl mx-auto">
            {renderContentView()}
          </div>
        </main>
      </div>
    </div>
  );
}
