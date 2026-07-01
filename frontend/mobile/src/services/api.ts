const BASE_URL = 'http://localhost:3000/api/v1';

const USE_MOCK = true;

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
    user: { id: 1, name: 'Budi Santoso', email: 'budi@mail.com', role: 'customer', address: 'Jl. Merdeka No. 10, Jakarta' },
  },
  register: { message: 'Registrasi berhasil' },
  forgotPassword: { message: 'Tautan reset password telah dikirim ke email' },
  services: [
    {
      id: 1,
      name: 'Kiloan Reguler',
      price: 7000,
      unit: 'kg',
      desc: 'Cuci + setrika, selesai 2-3 hari',
      icon: '📦',
      category: 'kiloan',
    },
    {
      id: 2,
      name: 'Kiloan Express',
      price: 12000,
      unit: 'kg',
      desc: 'Cuci + setrika, selesai hari ini',
      icon: '⚡',
      category: 'kiloan',
    },
    {
      id: 3,
      name: 'Koin / Self-Service',
      price: 15000,
      unit: 'mesin',
      desc: 'Cuci sendiri di outlet, gratis deterjen',
      icon: '🪙',
      category: 'koin',
    },
    {
      id: 4,
      name: 'Setrika Saja',
      price: 5000,
      unit: 'kg',
      desc: 'Setrika rapi, wangi & siap pakai',
      icon: '👔',
      category: 'kiloan',
    },
    {
      id: 5,
      name: 'selimut / Bed Cover',
      price: 25000,
      unit: 'pcs',
      desc: 'Cuci khusus selimut & bed cover besar',
      icon: '🛏️',
      category: 'khusus',
    },
  ],
  machines: [
    { id_mesin: 1, kode_mesin: 'MC-01', nama_mesin: 'Mesin Cuci 1', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 8, harga: 20000 },
    { id_mesin: 2, kode_mesin: 'MC-02', nama_mesin: 'Mesin Cuci 2', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 8, harga: 20000 },
    { id_mesin: 3, kode_mesin: 'MC-03', nama_mesin: 'Mesin Cuci 3', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 8, harga: 20000 },
    { id_mesin: 4, kode_mesin: 'MC-04', nama_mesin: 'Mesin Cuci 4', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 8, harga: 20000 },
    { id_mesin: 5, kode_mesin: 'MC-05', nama_mesin: 'Mesin Cuci 5', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 8, harga: 20000 },
    { id_mesin: 6, kode_mesin: 'MC-06', nama_mesin: 'Mesin Cuci 6', tipe_mesin: 'pencucian', status_mesin: 'tersedia', kapasitas_kg: 8, harga: 20000 },
  ],
  bookings: [
    {
      id: 2,
      service: 'Koin / Self-Service',
      status: 'selesai',
      date: yesterday,
      total: 15000,
      weight: null,
      shift: 'Siang (11-15)',
      address: null,
    },
    {
      id: 3,
      service: 'Kiloan Reguler',
      status: 'menunggu_pembayaran',
      metode_pembayaran: 'qris',
      date: today,
      total: 28000,
      weight: 4,
      shift: 'Sore (15-19)',
      address: 'Jl. Sudirman No. 25, Jakarta',
    },
    {
      id: 4,
      service: 'Setrika Saja',
      status: 'selesai',
      date: twoDaysAgo,
      total: 15000,
      weight: 3,
      shift: 'Pagi (07-11)',
      address: 'Jl. Merdeka No. 10, Jakarta',
    },
    {
      id: 5,
      service: 'Kiloan Express',
      status: 'selesai',
      date: threeDaysAgo,
      total: 60000,
      weight: 5,
      shift: 'Siang (11-15)',
      address: 'Jl. Merdeka No. 10, Jakarta',
    },
    {
      id: 6,
      service: 'Koin / Self-Service',
      status: 'selesai',
      date: fourDaysAgo,
      total: 15000,
      weight: null,
      shift: 'Pagi (07-11)',
      address: null,
    },
    {
      id: 7,
      service: 'Selimut / Bed Cover',
      status: 'selesai',
      date: fiveDaysAgo,
      total: 50000,
      weight: 2,
      shift: 'Sore (15-19)',
      address: 'Jl. Merdeka No. 10, Jakarta',
    },
  ],
};

async function request(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request gagal');
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.login), 600))
      : request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }),

  register: (name: string, email: string, phone: string, password: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.register), 600))
      : request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, phone, password }),
        }),

  getServices: (token: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.services), 400))
      : request('/services', {
          headers: { Authorization: `Bearer ${token}` },
        } as RequestInit),

  getBookings: (token: string) =>
    USE_MOCK
      ? new Promise((resolve) => setTimeout(() => resolve(MOCK.bookings), 500))
      : request('/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        } as RequestInit),

  createBooking: (token: string, data: object) =>
    USE_MOCK
      ? new Promise((resolve) => {
          const d = data as Record<string, unknown>;
          const bookings = MOCK.bookings as Array<Record<string, unknown>>;
          const newBooking = {
            id: Math.floor(Math.random() * 9000) + 100,
            service: (d.service as string) || 'Laundry',
            status: 'menunggu_konfirmasi',
            metode_pembayaran: null,
            date: (d.date as string) || (d.tanggal_pesanan as string) || today,
            shift: (d.shift as string) || '',
            total: (d.total as number) || 0,
            weight: (d.weight as number) || null,
            address: (d.address as string) || null,
          };
          bookings.unshift(newBooking);
          setTimeout(() => resolve(newBooking), 800);
        })
      : request('/bookings', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          } as HeadersInit,
          body: JSON.stringify(data),
        }),

  getMachines: (token: string) =>
    USE_MOCK
      ? new Promise((resolve) =>
          setTimeout(() => resolve(MOCK.machines), 400),
        )
      : request('/mesin', {
          headers: { Authorization: `Bearer ${token}` },
        } as RequestInit),

  getAvailableMachines: (token: string, tanggal: string, shift: string) =>
    USE_MOCK
      ? new Promise((resolve) => {
          const available = (MOCK.machines as any[]).filter((m) => m.status_mesin === 'tersedia');
          setTimeout(() => resolve(available), 400);
        })
      : request(`/mesin/available?tanggal=${tanggal}&shift=${shift}`, {
          headers: { Authorization: `Bearer ${token}` },
        } as RequestInit),

  getPaymentInfo: (token: string, bookingId: number) =>
    USE_MOCK
      ? new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: bookingId,
                qris_data: `laundaja:${bookingId}:${bookingId * 10000 + 10000}`,
                total: bookingId * 10000 + 10000,
                service: 'Kiloan Reguler',
                date: today,
              }),
            500,
          ),
        )
      : request(`/transaksi/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        } as RequestInit),

  checkPaymentStatus: (token: string, bookingId: number) =>
    USE_MOCK
      ? new Promise((resolve) => {
          setTimeout(() => {
            const bookings = MOCK.bookings as Array<Record<string, unknown>>;
            const idx = bookings.findIndex((b) => b.id === bookingId);
            if (idx !== -1) {
              bookings[idx].status = 'diproses';
            }
            resolve({ paid: true, id: bookingId, status: 'diproses' });
          }, 1200);
        })
      : request(`/transaksi/${bookingId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        } as RequestInit),

  forgotPassword: (email: string) =>
    USE_MOCK
      ? new Promise((resolve) =>
          setTimeout(() => resolve(MOCK.forgotPassword), 800),
        )
      : request('/auth/lupa-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' },
        } as RequestInit),
};
