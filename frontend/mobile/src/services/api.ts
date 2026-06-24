const BASE_URL = 'http://localhost:3000/api/v1';

// Ganti dengan false saat backend sudah siap
const USE_MOCK = true;

const MOCK: Record<string, unknown> = {
  login: { token: 'mock-jwt-token', user: { id: 1, name: 'Budi', email: 'budi@mail.com', role: 'customer' } },
  register: { message: 'Registrasi berhasil' },
  services: [
    { id: 1, name: 'Kiloan Reguler', price: 7000, unit: 'per kg', desc: 'Selesai 2-3 hari' },
    { id: 2, name: 'Kiloan Express', price: 12000, unit: 'per kg', desc: 'Selesai hari ini' },
    { id: 3, name: 'Koin / Self-Service', price: 15000, unit: 'per mesin', desc: 'Cuci sendiri di outlet' },
  ],
  bookings: [
    { id: 1, service: 'Kiloan Express', status: 'diproses', date: '2026-06-20', total: 48000 },
    { id: 2, service: 'Koin', status: 'selesai', date: '2026-06-18', total: 15000 },
  ],
};

async function request(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Request gagal');
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    USE_MOCK
      ? Promise.resolve(MOCK.login)
      : request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, phone: string, password: string) =>
    USE_MOCK
      ? Promise.resolve(MOCK.register)
      : request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, phone, password }) }),

  getServices: (token: string) =>
    USE_MOCK
      ? Promise.resolve(MOCK.services)
      : request('/services', { headers: { Authorization: `Bearer ${token}` } } as RequestInit),

  getBookings: (token: string) =>
    USE_MOCK
      ? Promise.resolve(MOCK.bookings)
      : request('/bookings', { headers: { Authorization: `Bearer ${token}` } } as RequestInit),

  createBooking: (token: string, data: object) =>
    USE_MOCK
      ? Promise.resolve({ id: 3, status: 'menunggu_konfirmasi', ...data })
      : request('/bookings', { method: 'POST', headers: { Authorization: `Bearer ${token}` } as HeadersInit, body: JSON.stringify(data) }),
};
