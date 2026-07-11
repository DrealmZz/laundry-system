import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

const USE_MOCK = false;

const NOW = new Date();
const today = NOW.toISOString().split('T')[0];
const yesterday = new Date(NOW.getTime() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(NOW.getTime() - 2 * 86400000).toISOString().split('T')[0];
const threeDaysAgo = new Date(NOW.getTime() - 3 * 86400000).toISOString().split('T')[0];
const fourDaysAgo = new Date(NOW.getTime() - 4 * 86400000).toISOString().split('T')[0];
const fiveDaysAgo = new Date(NOW.getTime() - 5 * 86400000).toISOString().split('T')[0];

const MOCK: Record<string, unknown> = {
  login: {
    token: 'mock-jwt-token',
    user: { id: 1, nama_lengkap: 'Budi Santoso', email: 'budi@mail.com', role: 'customer', alamat: 'Jl. Merdeka No. 10, Jakarta', no_hp: '08123456789' },
  },
  register: { message: 'Registrasi berhasil' },
  forgotPassword: { message: 'Tautan reset password telah dikirim ke email' },
  services: [
    { id_layanan: 1, nama_layanan: 'Kiloan Reguler', harga: 7000, jenis_layanan: 'kiloan', estimasi_waktu: 180 },
    { id_layanan: 2, nama_layanan: 'Kiloan Express', harga: 12000, jenis_layanan: 'kiloan', estimasi_waktu: 90 },
    { id_layanan: 3, nama_layanan: 'Koin Cuci Saja', harga: 10000, jenis_layanan: 'koin', estimasi_waktu: 45 },
    { id_layanan: 4, nama_layanan: 'Koin Cuci + Kering', harga: 20000, jenis_layanan: 'koin', estimasi_waktu: 60 },
  ],
  machines: [
    { id_mesin: 1, kode_mesin: 'MC-01', nama_mesin: 'Mesin Cuci 1', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 10 },
    { id_mesin: 2, kode_mesin: 'MC-02', nama_mesin: 'Mesin Cuci 2', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 10 },
    { id_mesin: 3, kode_mesin: 'MC-03', nama_mesin: 'Mesin Cuci 3', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 12 },
    { id_mesin: 4, kode_mesin: 'MD-01', nama_mesin: 'Mesin Pengering 1', tipe_mesin: 'pengeringan', status_mesin: 'tersedia', kapasitas_kg: 8 },
    { id_mesin: 5, kode_mesin: 'MD-02', nama_mesin: 'Mesin Pengering 2', tipe_mesin: 'pengeringan', status_mesin: 'tersedia', kapasitas_kg: 8 },
    { id_mesin: 6, kode_mesin: 'MD-03', nama_mesin: 'Mesin Pengering 3', tipe_mesin: 'pengeringan', status_mesin: 'tersedia', kapasitas_kg: 10 },
  ],
  bookings: [
    {
      id_pemesanan: 2,
      nama_layanan: 'Koin Cuci + Kering',
      status_pesanan: 'selesai',
      tanggal_pesanan: yesterday,
      total: 15000,
      berat_kg: null,
      shift: 'siang',
      metode_pengambilan: 'ambil_sendiri',
      customer_nama: 'Budi',
      customer_no_hp: '08123456789',
      customer_alamat: 'Jl. Merdeka No. 123, Jakarta',
    },
    {
      id_pemesanan: 3,
      nama_layanan: 'Kiloan Reguler',
      status_pesanan: 'menunggu pembayaran',
      tanggal_pesanan: today,
      total: 28000,
      berat_kg: 4,
      shift: 'sore',
      metode_pengambilan: 'pengiriman',
      customer_nama: 'Budi',
      customer_no_hp: '08123456789',
      customer_alamat: 'Jl. Merdeka No. 123, Jakarta',
    },
    {
      id_pemesanan: 4,
      nama_layanan: 'Kiloan Reguler',
      status_pesanan: 'pencucian selesai',
      tanggal_pesanan: today,
      total: 35000,
      berat_kg: 5,
      shift: 'pagi',
      metode_pengambilan: 'pengiriman',
      customer_nama: 'Budi',
      customer_no_hp: '08123456789',
      customer_alamat: 'Jl. Merdeka No. 123, Jakarta',
    },
  ],
};

async function request(endpoint: string, options?: RequestInit) {
  // Auto-attach token
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request gagal');
  }

  const result = await res.json();
  return result.data; // Unwrap { status, data, message }
}

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.login), 600))
      : request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password }),
        }),

  register: (nama_lengkap: string, username: string, email: string, no_hp: string, password: string, alamat?: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.register), 600))
      : request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ nama_lengkap, username, email, no_hp, password, alamat }),
        }),

  forgotPassword: (email: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.forgotPassword), 800))
      : request('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        }),

  getProfile: () =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.login), 400))
      : request('/auth/me').then((data) => data?.user || data),

  // Services
  getServices: () =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.services), 400))
      : request('/services'),

  // Bookings
  getBookings: () =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.bookings), 500))
      : request('/pemesanan'),

  createBooking: (data: object) =>
    USE_MOCK
      ? new Promise((resolve) => {
          const d = data as Record<string, unknown>;
          const bookings = MOCK.bookings as Array<Record<string, unknown>>;
          const newBooking = {
            id_pemesanan: Math.floor(Math.random() * 9000) + 100,
            nama_layanan: (d.nama_layanan as string) || 'Laundry',
            status_pesanan: 'menunggu konfirmasi',
            tanggal_pesanan: (d.tanggal_pesanan as string) || today,
            shift: (d.shift as string) || '',
            total: 0,
            berat_kg: (d.berat_kg as number) || null,
            metode_pengambilan: (d.metode_pengambilan as string) || 'ambil_sendiri',
            customer_nama: 'Budi',
            customer_no_hp: '08123456789',
            customer_alamat: 'Jl. Merdeka No. 123, Jakarta',
          };
          bookings.unshift(newBooking);
          setTimeout(() => resolve(newBooking), 800);
        })
      : request('/pemesanan', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

  getBookingDetail: (id: number) =>
    USE_MOCK
      ? new Promise((resolve) => {
          const bookings = MOCK.bookings as Array<Record<string, unknown>>;
          const booking = bookings.find((b) => b.id_pemesanan === id);
          setTimeout(() => resolve(booking || null), 400);
        })
      : request(`/pemesanan/${id}`),

  cancelBooking: (id: number, catatan: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(null), 400))
      : request(`/pemesanan/${id}/cancel`, {
          method: 'PATCH',
          body: JSON.stringify({ catatan }),
        }),

  setDeliverySchedule: (id: number, tanggal: string, shift: string) =>
    request(`/pemesanan/${id}/set-delivery`, {
      method: 'PATCH',
      body: JSON.stringify({ tanggal_pengiriman: tanggal, shift_pengiriman: shift }),
    }),

  confirmReceived: (id: number) =>
    request(`/pemesanan/${id}/confirm-received`, {
      method: 'PATCH',
    }),

  // Machines
  getMachines: () =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.machines), 400))
      : request('/mesin'),

  getAvailableMachines: (tanggal: string, shift: string) =>
    USE_MOCK
      ? new Promise((resolve) => {
          const available = (MOCK.machines as any[]).filter((m) => m.status_mesin === 'tersedia');
          setTimeout(() => resolve(available), 400);
        })
      : request(`/mesin/available?tanggal=${tanggal}&shift=${shift}`),

  // Transactions
  getTransactions: () =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve([]), 400))
      : request('/transaksi'),

  getTransactionDetail: (id: number) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(null), 400))
      : request(`/transaksi/${id}`),

  confirmBookingPayment: (id: number) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve({ status_pesanan: 'sudah dibayar' }), 400))
      : request(`/pemesanan/${id}/confirm-payment`, {
          method: 'PATCH',
        }),

  confirmPayment: (id: number, metode_pembayaran: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve({ status_pembayaran: 'lunas' }), 400))
      : request(`/transaksi/${id}/pay`, {
          method: 'PATCH',
          body: JSON.stringify({ metode_pembayaran }),
        }),

  generateQR: (id: number) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve({
          qris_data: `laundaja:${id}:38500:${Date.now()}`,
          total: 38500,
          id_pemesanan: id,
          service: 'Kiloan Reguler',
          date: new Date().toISOString().split('T')[0],
        }), 400))
      : request(`/pemesanan/${id}/qris`),

  // Notifications
  getNotifications: (page = 1, limit = 20) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve({ items: [], total: 0 }), 400))
      : request(`/notifications?page=${page}&limit=${limit}`),

  getUnreadCount: () =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve({ unread_count: 0 }), 400))
      : request('/notifications/count'),

  markAsRead: (id: number) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(null), 200))
      : request(`/notifications/${id}/read`, {
          method: 'PATCH',
        }),

  updateProfile: (data: { nama_lengkap?: string; username?: string; email?: string; no_hp?: string; alamat?: string; currentPassword?: string }) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(data), 400))
      : request('/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),

  changePassword: (oldPassword: string, newPassword: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(null), 400))
      : request('/auth/change-password', {
          method: 'PATCH',
          body: JSON.stringify({ oldPassword, newPassword }),
        }),
};
