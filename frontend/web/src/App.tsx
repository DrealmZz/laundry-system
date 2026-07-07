import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, Booking, Employee, Service, Task, ShiftBlock, User } from './types';
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
import OwnerDashboard from './components/OwnerDashboard';
import DailyRecap from './components/DailyRecap';
import CustomerDirectory from './components/CustomerDirectory';
import LoginPage from './components/LoginPage';

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
    tanggal_pengiriman: b.tanggal_pengiriman || null,
    shift_pengiriman: b.shift_pengiriman || null,
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
  return {
    id: t.nomor_struk || String(t.id_transaksi ?? ''),
    customerName: t.nama_customer || 'Customer',
    customerInitial: (t.nama_customer || 'C')[0].toUpperCase(),
    serviceName: t.nama_layanan || '',
    serviceType: t.jenis_layanan === 'kiloan' ? 'Kiloan' : 'Koin',
    weightOrQty: t.berat_kg || 1,
    amount: parseFloat(t.total) || 0,
    status: mapTransactionStatus(t.status_pembayaran),
    time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    paymentMethod: t.metode_pembayaran === 'qris' ? 'QRIS' : 'Cash',
    cashierName: t.nama_karyawan || 'Kasir',
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
    photoUrl: '',
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
    status: true,
    packageType: s.jenis_layanan === 'kiloan' ? 'Kiloan' : 'Koin',
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
    if (pathInfo.role) return createRoleUser(pathInfo.role);
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('lw_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [shiftBlocks, setShiftBlocks] = useState<ShiftBlock[]>(initialShiftBlocks);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<string | null>(() => localStorage.getItem('lw_auth_role'));

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
    if (!token) return;
    try {
      const [bookingsRes, txRes, empRes, svcRes] = await Promise.all([
        apiRequest('/pemesanan').catch(() => null),
        apiRequest('/transaksi').catch(() => null),
        authRole === 'admin' ? apiRequest('/users/karyawan').catch(() => null) : Promise.resolve(null),
        apiRequest('/services').catch(() => null),
      ]);

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
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [token, authRole]);

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
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'time' | 'date'>): string => {
    const nextNum = transactions.length + 1;
    const paddingStr = nextNum.toString().padStart(3, '0');
    const newId = `#LW-2026-${paddingStr}`;

    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const createdTx: Transaction = {
      id: newId,
      customerName: newTx.customerName,
      customerInitial: newTx.customerInitial,
      serviceName: newTx.serviceName,
      serviceType: newTx.serviceType,
      weightOrQty: newTx.weightOrQty,
      amount: newTx.amount,
      status: newTx.status,
      time: timeStr,
      date: dateStr,
      paymentMethod: newTx.paymentMethod,
      cashierName: newTx.cashierName
    };

    setTransactions(prev => [createdTx, ...prev]);

    // Background API call (fire-and-forget)
    apiRequest('/transaksi', {
      method: 'POST',
      body: JSON.stringify({
        id_pemesanan: 1,
        metode_pembayaran: newTx.paymentMethod === 'QRIS' ? 'qris' : 'cash',
      }),
    }).then(() => fetchData()).catch(console.error);

    return newId;
  };

  // ── Local state update helper (for demo without backend) ──
  const updateLocalBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b =>
      (b.id_pemesanan || b.id) === id ? { ...b, ...updates } : b
    ));
  };

  // ── Booking Handlers ──
  const handleConfirmBooking = async (id: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'disetujui', status: 'Disetujui' });
      alert('Booking berhasil dikonfirmasi!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_pesanan: 'disetujui' }),
      });
      await fetchData();
      alert('Booking berhasil dikonfirmasi!');
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      alert(error.message || 'Gagal mengkonfirmasi booking');
    }
  };

  const handleApproveOrder = async (id: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'disetujui', status: 'Disetujui' });
      alert('Pesanan berhasil disetujui oleh kasir.');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_pesanan: 'disetujui' }),
      });
      await fetchData();
      alert('Pesanan berhasil disetujui oleh kasir.');
    } catch (error: any) {
      console.error('Error approving order:', error);
      alert(error.message || 'Gagal menyetujui pesanan');
    }
  };

  const handleRejectBooking = async (id: string, reason?: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'pesanan ditolak', status: 'Tolak' });
      alert('Booking berhasil ditolak!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ catatan: reason || 'Ditolak oleh admin' }),
      });
      await fetchData();
      alert('Booking berhasil ditolak!');
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      alert(error.message || 'Gagal menolak booking');
    }
  };

  const handleConfirmPickup = async (id: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'penjemputan', status: 'Dijemput' });
      alert('Konfirmasi jemput berhasil!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/confirm-pickup`, {
        method: 'PATCH',
      });
      await fetchData();
      alert('Konfirmasi jemput berhasil!');
    } catch (error: any) {
      console.error('Error confirming pickup:', error);
      alert(error.message || 'Gagal konfirmasi jemput');
    }
  };

  const handleConfirmClothes = async (id: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'penimbangan', status: 'Dijemput' });
      alert('Konfirmasi pakaian diterima berhasil!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/confirm-clothes`, {
        method: 'PATCH',
      });
      await fetchData();
      alert('Konfirmasi pakaian diterima berhasil!');
    } catch (error: any) {
      console.error('Error confirming clothes:', error);
      alert(error.message || 'Gagal konfirmasi pakaian');
    }
  };

  const handleWeigh = async (id: string, berat_kg: number) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: 'menunggu pembayaran', status: 'Diproses', berat_kg });
      alert('Berat berhasil diinput!');
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/weigh`, {
        method: 'PATCH',
        body: JSON.stringify({ berat_kg }),
      });
      await fetchData();
      alert('Berat berhasil diinput!');
    } catch (error: any) {
      console.error('Error weighing:', error);
      alert(error.message || 'Gagal input berat');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!token || (authRole !== 'admin' && authRole !== 'kasir')) {
      updateLocalBooking(id, { status_pesanan_raw: status, status: mapBookingStatus(status) });
      alert(`Status berhasil diubah ke '${status}'!`);
      return;
    }
    try {
      await apiRequest(`/pemesanan/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_pesanan: status }),
      });
      await fetchData();
      alert(`Status berhasil diubah ke '${status}'!`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.message || 'Gagal mengubah status');
    }
  };

  // ── Employee Handlers ──
  const handleAddEmployee = async (empInput: Omit<Employee, 'id' | 'initial' | 'joinDate'>) => {
    try {
      await apiRequest('/users/karyawan', {
        method: 'POST',
        body: JSON.stringify({
          nama_lengkap: empInput.name,
          username: empInput.email.split('@')[0],
          email: empInput.email,
          password: 'password123',
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
      await apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status_layanan: true }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const handleUpdateServicePrice = async (id: string, price: number) => {
    try {
      await apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ harga: price }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error updating service price:', error);
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
            />
          );
        case 'confirm-orders':
          return <CashierConfirmOrders bookings={bookings} onApproveOrder={handleApproveOrder} onConfirmPickup={handleConfirmPickup} onConfirmClothes={handleConfirmClothes} onWeigh={handleWeigh} onUpdateStatus={handleUpdateStatus} />;
        case 'new-transaction':
          return (
            <NewTransaction
              services={services.filter(s => s.status)}
              onAddTransaction={handleAddTransaction}
              onSelectReceipt={setSelectedReceiptId}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          );
        case 'transactions':
          return <TransactionsHistory transactions={transactions} onSelectReceipt={setSelectedReceiptId} />;
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
              onWeigh={handleWeigh}
              onUpdateStatus={handleUpdateStatus}
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
              onUpdateServicePrice={handleUpdateServicePrice}
            />
          );
        default:
          return <div className="text-xs text-ink-muted">Admin Tab Belum Terintegrasi</div>;
      }
    }

    if (role === 'owner') {
      switch (activeTab) {
        case 'dashboard':
        case 'finance':
        case 'performance':
          return <OwnerDashboard transactions={transactions} />;
        default:
          return <div className="text-xs text-ink-muted">Owner Tab Belum Terintegrasi</div>;
      }
    }

    return null;
  };

  const pendingBookingsCount = bookings.filter(b => b.status === 'Menunggu').length;
  const verifikasiCount = bookings.filter(b => b.status_pesanan_raw === 'sudah dibayar').length;

  if (!user && !parsePath().role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-page flex font-sans antialiased text-ink w-full overflow-hidden">
      <Sidebar
        currentRole={role}
        activeTab={activeTab}
        onTabChange={(tab) => { window.history.pushState(null, '', `/${role}/${tab}`); setActiveTab(tab); }}
        pendingBookingsCount={pendingBookingsCount}
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
