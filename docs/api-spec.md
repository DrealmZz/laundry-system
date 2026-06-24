# API Specification - Sistem Manajemen Laundry Hybrid

## Base URL
`/api/v1`

## Standar Response Format
Semua response API wajib mengikuti format berikut:

```json
{
  "status": "success|error",
  "data": {},
  "message": "Pesan deskriptif mengenai status request"
}
```

## Endpoints Ringkas

### 1. Auth Module (`/auth`)
- `POST /auth/register` - Pendaftaran customer baru
- `POST /auth/login` - Login pengguna (Customer, Kasir, Admin, Owner)
- `POST /auth/logout` - Logout pengguna dan membersihkan session/token

### 2. User Management Module (`/users`)
- `GET /users` - Mendapatkan daftar user/karyawan (Admin Only)
- `POST /users` - Menambah karyawan baru (Admin Only)
- `PUT /users/:id` - Memperbarui status atau data karyawan

### 3. Laundry Service Module (`/services`)
- `GET /services` - Melihat daftar layanan laundry aktif
- `POST /services` - Menambah jenis layanan baru (Admin Only)

### 4. Booking Module (`/bookings`)
- `GET /bookings` - Melihat riwayat booking pengguna
- `POST /bookings` - Membuat pesanan/booking koin atau kiloan (Customer Only)

### 5. Transaction Module (`/payments`)
- `POST /payments` - Mencatat transaksi pembayaran baru (Kasir Only)
- `GET /payments/:id` - Mengambil detail transaksi dan struk

### 6. Report Module (`/reports`)
- `GET /reports/finance` - Mendapatkan ringkasan laporan keuangan (Owner Only)
