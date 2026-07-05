# Modul 10: Audit Log

## Overview

Modul ini menangani pencatatan dan pencarian audit log untuk keamanan dan troubleshooting. Semua aktivitas penting dalam sistem dicatat ke dalam audit log dengan timestamp, user ID, dan detail aktivitas.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ✅ Sudah ada (write) | Perlu tambah endpoint query audit log |
| Frontend Web | ⚠️ BELUM ADA | Perlu dibuat `AuditLog.tsx` |
| Frontend Mobile | ❌ Tidak ada | Tidak diperlukan (audit untuk admin) |

---

## Database Tables

### Tabel yang Sudah Ada

```sql
CREATE TABLE audit_log (
    id_log          BIGSERIAL PRIMARY KEY,
    id_customer     INTEGER      REFERENCES customer(id_customer),
    id_karyawan     INTEGER      REFERENCES karyawan(id_karyawan),
    tipe_log        VARCHAR(50)  NOT NULL,
    isi_pesan       TEXT,
    aktivitas       VARCHAR(100) NOT NULL,
    timestamp       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    status          VARCHAR(20)  NOT NULL
                    CHECK (status IN ('berhasil', 'gagal')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_customer   ON audit_log(id_customer);
CREATE INDEX idx_audit_log_karyawan   ON audit_log(id_karyawan);
CREATE INDEX idx_audit_log_timestamp  ON audit_log(timestamp);
CREATE INDEX idx_audit_log_tipe       ON audit_log(tipe_log);
```

### Contoh Data

| id_log | id_customer | id_karyawan | tipe_log | isi_pesan | aktivitas | timestamp | status |
|--------|-------------|-------------|----------|-----------|-----------|-----------|--------|
| 1 | 1 | NULL | LOGIN_SUCCESS | Customer dengan ID 1 berhasil login | Customer login berhasil | 2026-07-03 10:00:00 | berhasil |
| 2 | NULL | 1 | BOOKING_CONFIRMED | Booking dengan ID 1 dikonfirmasi oleh karyawan ID 1 | Konfirmasi booking | 2026-07-03 10:05:00 | berhasil |
| 3 | NULL | 1 | PAYMENT_CONFIRMED | Pembayaran transaksi ID 1 dikonfirmasi | Konfirmasi pembayaran | 2026-07-03 10:10:00 | berhasil |
| 4 | 1 | NULL | LOGIN_FAILED | Customer dengan ID 1 gagal login (password salah) | Customer login gagal | 2026-07-03 10:15:00 | gagal |

---

## Daftar Tipe Log

### Autentikasi
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `LOGIN_SUCCESS` | Customer/karyawan/owner login berhasil | berhasil |
| `LOGIN_FAILED` | Customer/karyawan/owner login gagal | gagal |
| `LOGIN_LOCKED` | Akun terkunci karena 3x gagal login | gagal |
| `LOGOUT` | User logout | berhasil |
| `PASSWORD_CHANGED` | User mengganti password | berhasil |
| `PASSWORD_RESET` | Admin mereset password user | berhasil |

### User Management
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `REGISTER_SUCCESS` | Customer berhasil registrasi | berhasil |
| `USER_CREATED` | Admin membuat user baru | berhasil |
| `USER_UPDATED` | Admin mengupdate data user | berhasil |
| `USER_DEACTIVATED` | Admin menonaktifkan user | berhasil |
| `USER_ACTIVATED` | Admin mengaktifkan user | berhasil |

### Booking
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `BOOKING_CREATED` | Customer membuat booking baru | berhasil |
| `BOOKING_CONFIRMED` | Admin mengkonfirmasi booking | berhasil |
| `BOOKING_REJECTED` | Admin menolak booking | berhasil |
| `BOOKING_CANCELLED` | Admin membatalkan booking | berhasil |
| `BOOKING_STATUS_CHANGED` | Status booking diubah | berhasil |

### Transaksi
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `TRANSACTION_CREATED` | Kasir membuat transaksi baru | berhasil |
| `PAYMENT_CONFIRMED` | Kasir mengkonfirmasi pembayaran | berhasil |

### Layanan
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `SERVICE_CREATED` | Admin membuat layanan baru | berhasil |
| `SERVICE_UPDATED` | Admin mengupdate layanan | berhasil |
| `SERVICE_DELETED` | Admin menghapus layanan | berhasil |

### Mesin
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `MACHINE_CREATED` | Admin menambah mesin baru | berhasil |
| `MACHINE_UPDATED` | Admin mengupdate mesin | berhasil |
| `MACHINE_STATUS_CHANGED` | Admin mengubah status mesin | berhasil |

### Shift
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `SHIFT_CREATED` | Admin membuat shift baru | berhasil |
| `SHIFT_UPDATED` | Admin mengupdate shift | berhasil |
| `SHIFT_DELETED` | Admin menghapus shift | berhasil |
| `SHIFT_ASSIGNED` | Admin assign karyawan ke shift | berhasil |
| `SHIFT_UNASSIGNED` | Admin unassign karyawan dari shift | berhasil |

### Notifikasi
| Tipe Log | Aktivitas | Status |
|----------|-----------|--------|
| `NOTIFICATION_SENT` | Admin/kasir mengirim notifikasi | berhasil |

---

## API Endpoints

### 1. GET `/api/v1/audit`

**Deskripsi:** Mendapatkan daftar audit log

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 50
- `tipe_log` (optional): Filter tipe log
- `status` (optional): Filter status ('berhasil', 'gagal')
- `tanggal_mulai` (optional): Filter tanggal mulai (format: YYYY-MM-DD)
- `tanggal_akhir` (optional): Filter tanggal akhir (format: YYYY-MM-DD)
- `id_customer` (optional): Filter berdasarkan customer
- `id_karyawan` (optional): Filter berdasarkan karyawan
- `search` (optional): Cari berdasarkan isi_pesan atau aktivitas

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_log": 1,
        "id_customer": 1,
        "nama_customer": "Andi Wijaya",
        "id_karyawan": null,
        "nama_karyawan": null,
        "tipe_log": "LOGIN_SUCCESS",
        "isi_pesan": "Customer dengan ID 1 berhasil login",
        "aktivitas": "Customer login berhasil",
        "timestamp": "2026-07-03T10:00:00Z",
        "status": "berhasil",
        "created_at": "2026-07-03T10:00:00Z"
      },
      {
        "id_log": 2,
        "id_customer": null,
        "nama_customer": null,
        "id_karyawan": 1,
        "nama_karyawan": "Budi Santoso",
        "tipe_log": "BOOKING_CONFIRMED",
        "isi_pesan": "Booking dengan ID 1 dikonfirmasi oleh karyawan ID 1",
        "aktivitas": "Konfirmasi booking",
        "timestamp": "2026-07-03T10:05:00Z",
        "status": "berhasil",
        "created_at": "2026-07-03T10:05:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 50
  },
  "message": "Daftar audit log berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT 
  al.id_log,
  al.id_customer,
  c.nama_lengkap AS nama_customer,
  al.id_karyawan,
  k.nama_lengkap AS nama_karyawan,
  al.tipe_log,
  al.isi_pesan,
  al.aktivitas,
  al.timestamp,
  al.status,
  al.created_at
FROM audit_log al
LEFT JOIN customer c ON al.id_customer = c.id_customer
LEFT JOIN karyawan k ON al.id_karyawan = k.id_karyawan
WHERE ($1::text IS NULL OR al.tipe_log = $1)
  AND ($2::text IS NULL OR al.status = $2)
  AND ($3::timestamp IS NULL OR al.timestamp >= $3)
  AND ($4::timestamp IS NULL OR al.timestamp <= $4)
  AND ($5::integer IS NULL OR al.id_customer = $5)
  AND ($6::integer IS NULL OR al.id_karyawan = $6)
  AND ($7::text IS NULL OR al.isi_pesan ILIKE '%' || $7 || '%' 
       OR al.aktivitas ILIKE '%' || $7 || '%')
ORDER BY al.timestamp DESC
LIMIT $8 OFFSET $9;
```

---

### 2. GET `/api/v1/audit/:id`

**Deskripsi:** Mendapatkan detail audit log berdasarkan ID

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin

**Path Parameters:**
- `id`: ID audit log

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "id_log": 1,
    "id_customer": 1,
    "nama_customer": "Andi Wijaya",
    "email_customer": "andi@email.com",
    "id_karyawan": null,
    "nama_karyawan": null,
    "tipe_log": "LOGIN_SUCCESS",
    "isi_pesan": "Customer dengan ID 1 berhasil login",
    "aktivitas": "Customer login berhasil",
    "timestamp": "2026-07-03T10:00:00Z",
    "status": "berhasil",
    "created_at": "2026-07-03T10:00:00Z"
  },
  "message": "Detail audit log berhasil diambil"
}
```

**Response Error (404):**
```json
{
  "status": "error",
  "data": null,
  "message": "Audit log tidak ditemukan"
}
```

**Query SQL:**
```sql
SELECT 
  al.id_log,
  al.id_customer,
  c.nama_lengkap AS nama_customer,
  c.email AS email_customer,
  al.id_karyawan,
  k.nama_lengkap AS nama_karyawan,
  k.email AS email_karyawan,
  al.tipe_log,
  al.isi_pesan,
  al.aktivitas,
  al.timestamp,
  al.status,
  al.created_at
FROM audit_log al
LEFT JOIN customer c ON al.id_customer = c.id_customer
LEFT JOIN karyawan k ON al.id_karyawan = k.id_karyawan
WHERE al.id_log = $1;
```

---

## Frontend Integration

### Web - AuditLog.tsx

**Fitur:**
- Tabel daftar audit log dengan kolom: timestamp, user, tipe log, aktivitas, status
- Filter berdasarkan tipe log, status, tanggal, user
- Search berdasarkan isi pesan atau aktivitas
- Pagination
- Tombol "Detail" → lihat detail audit log

**Flow:**
1. Admin buka halaman Audit Log
2. Fetch data dari `GET /api/v1/audit?page=1&limit=50`
3. Tampilkan data di tabel
4. Admin bisa filter, search, dan paginate
5. Admin klik "Detail" → buka modal detail

**UI Components:**
```typescript
// Filter section
<div className="flex gap-4 mb-4">
  <Select
    value={filterTipeLog}
    onChange={setFilterTipeLog}
    placeholder="Semua Tipe Log"
  >
    <option value="">Semua</option>
    <option value="LOGIN_SUCCESS">Login Berhasil</option>
    <option value="LOGIN_FAILED">Login Gagal</option>
    <option value="BOOKING_CREATED">Booking Dibuat</option>
    <option value="BOOKING_CONFIRMED">Booking Dikonfirmasi</option>
    <option value="PAYMENT_CONFIRMED">Pembayaran Dikonfirmasi</option>
    {/* ... tambah opsi lain */}
  </Select>
  
  <Select
    value={filterStatus}
    onChange={setFilterStatus}
    placeholder="Semua Status"
  >
    <option value="">Semua</option>
    <option value="berhasil">Berhasil</option>
    <option value="gagal">Gagal</option>
  </Select>
  
  <DatePicker value={startDate} onChange={setStartDate} placeholder="Tanggal Mulai" />
  <DatePicker value={endDate} onChange={setEndDate} placeholder="Tanggal Akhir" />
  
  <Input
    value={searchQuery}
    onChange={setSearchQuery}
    placeholder="Cari aktivitas..."
  />
  
  <Button onClick={handleFilter}>Filter</Button>
</div>

// Tabel audit log
<table>
  <thead>
    <tr>
      <th>Timestamp</th>
      <th>User</th>
      <th>Tipe Log</th>
      <th>Aktivitas</th>
      <th>Status</th>
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    {auditLogs.map(log => (
      <tr key={log.id_log}>
        <td>{formatDateTime(log.timestamp)}</td>
        <td>{log.nama_customer || log.nama_karyawan || '-'}</td>
        <td><Badge type={log.tipe_log} /></td>
        <td>{log.aktivitas}</td>
        <td><Badge status={log.status} /></td>
        <td>
          <Button onClick={() => handleDetail(log.id_log)}>Detail</Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

// Pagination
<Pagination
  currentPage={page}
  totalPages={Math.ceil(total / limit)}
  onPageChange={setPage}
/>

// Modal detail
<Modal>
  <h2>Detail Audit Log</h2>
  <div>
    <p><strong>ID Log:</strong> {detail.id_log}</p>
    <p><strong>Timestamp:</strong> {formatDateTime(detail.timestamp)}</p>
    <p><strong>User:</strong> {detail.nama_customer || detail.nama_karyawan || '-'}</p>
    <p><strong>Email:</strong> {detail.email_customer || detail.email_karyawan || '-'}</p>
    <p><strong>Tipe Log:</strong> {detail.tipe_log}</p>
    <p><strong>Aktivitas:</strong> {detail.aktivitas}</p>
    <p><strong>Isi Pesan:</strong> {detail.isi_pesan}</p>
    <p><strong>Status:</strong> {detail.status}</p>
  </div>
</Modal>
```

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                    AUDIT LOG FLOW                       │
└─────────────────────────────────────────────────────────┘

[User Melakukan Aksi]
        │
        ▼
[System Mencatat ke Audit Log]
        │
        ▼
[INSERT INTO audit_log (...)]
        │
        ▼
[Admin Melihat Audit Log]
        │
        ▼
[GET /api/v1/audit]
        │
        ▼
[Filter & Search]
        │
        ▼
[Tampilkan di Tabel]
        │
        ▼
[Admin Klik Detail]
        │
        ▼
[GET /api/v1/audit/:id]
        │
        ▼
[Tampilkan Detail]
```

---

## Business Rules Detail

### Kapan Audit Log Dicatat

**Autentikasi:**
- Login berhasil → `LOGIN_SUCCESS`
- Login gagal (password salah) → `LOGIN_FAILED`
- Akun terkunci → `LOGIN_LOCKED`
- Logout → `LOGOUT`
- Ganti password → `PASSWORD_CHANGED`
- Reset password oleh admin → `PASSWORD_RESET`

**User Management:**
- Registrasi customer → `REGISTER_SUCCESS`
- Admin buat user → `USER_CREATED`
- Admin update user → `USER_UPDATED`
- Admin nonaktifkan user → `USER_DEACTIVATED`
- Admin aktifkan user → `USER_ACTIVATED`

**Booking:**
- Customer buat booking → `BOOKING_CREATED`
- Admin konfirmasi booking → `BOOKING_CONFIRMED`
- Admin tolak booking → `BOOKING_REJECTED`
- Admin batalkan booking → `BOOKING_CANCELLED`
- Status booking berubah → `BOOKING_STATUS_CHANGED`

**Transaksi:**
- Kasir buat transaksi → `TRANSACTION_CREATED`
- Kasir konfirmasi pembayaran → `PAYMENT_CONFIRMED`

**Layanan:**
- Admin buat layanan → `SERVICE_CREATED`
- Admin update layanan → `SERVICE_UPDATED`
- Admin hapus layanan → `SERVICE_DELETED`

**Mesin:**
- Admin tambah mesin → `MACHINE_CREATED`
- Admin update mesin → `MACHINE_UPDATED`
- Admin ubah status mesin → `MACHINE_STATUS_CHANGED`

**Shift:**
- Admin buat shift → `SHIFT_CREATED`
- Admin update shift → `SHIFT_UPDATED`
- Admin hapus shift → `SHIFT_DELETED`
- Admin assign karyawan → `SHIFT_ASSIGNED`
- Admin unassign karyawan → `SHIFT_UNASSIGNED`

**Notifikasi:**
- Admin/kasir kirim notifikasi → `NOTIFICATION_SENT`

### Format Isi Pesan

**Contoh format isi_pesan:**
```
LOGIN_SUCCESS: "Customer dengan ID {id_customer} berhasil login"
LOGIN_FAILED: "Customer dengan ID {id_customer} gagal login (password salah)"
LOGIN_LOCKED: "Akun customer dengan ID {id_customer} terkunci selama 15 menit"
LOGOUT: "User dengan ID {id} dan role {role} berhasil logout"
PASSWORD_CHANGED: "User dengan ID {id} dan role {role} berhasil mengganti password"
PASSWORD_RESET: "Admin dengan ID {id_admin} mereset password customer dengan ID {id_customer}"
REGISTER_SUCCESS: "Customer dengan ID {id_customer} berhasil registrasi"
USER_CREATED: "Admin dengan ID {id_admin} membuat {role} baru dengan ID {id_user}"
USER_UPDATED: "Admin dengan ID {id_admin} mengupdate data {role} dengan ID {id_user}"
USER_DEACTIVATED: "Admin dengan ID {id_admin} menonaktifkan {role} dengan ID {id_user}"
USER_ACTIVATED: "Admin dengan ID {id_admin} mengaktifkan {role} dengan ID {id_user}"
BOOKING_CREATED: "Customer dengan ID {id_customer} membuat booking dengan ID {id_pemesanan}"
BOOKING_CONFIRMED: "Karyawan dengan ID {id_karyawan} mengkonfirmasi booking dengan ID {id_pemesanan}"
BOOKING_REJECTED: "Karyawan dengan ID {id_karyawan} menolak booking dengan ID {id_pemesanan}. Alasan: {alasan}"
BOOKING_CANCELLED: "Karyawan dengan ID {id_karyawan} membatalkan booking dengan ID {id_pemesanan}. Alasan: {alasan}"
BOOKING_STATUS_CHANGED: "Status booking dengan ID {id_pemesanan} diubah dari {status_lama} ke {status_baru}"
TRANSACTION_CREATED: "Karyawan dengan ID {id_karyawan} membuat transaksi dengan ID {id_transaksi} untuk booking dengan ID {id_pemesanan}"
PAYMENT_CONFIRMED: "Karyawan dengan ID {id_karyawan} mengkonfirmasi pembayaran transaksi dengan ID {id_transaksi}"
SERVICE_CREATED: "Admin dengan ID {id_admin} membuat layanan baru dengan ID {id_layanan}"
SERVICE_UPDATED: "Admin dengan ID {id_admin} mengupdate layanan dengan ID {id_layanan}"
SERVICE_DELETED: "Admin dengan ID {id_admin} menghapus layanan dengan ID {id_layanan}"
MACHINE_CREATED: "Admin dengan ID {id_admin} menambah mesin baru dengan ID {id_mesin}"
MACHINE_UPDATED: "Admin dengan ID {id_admin} mengupdate mesin dengan ID {id_mesin}"
MACHINE_STATUS_CHANGED: "Admin dengan ID {id_admin} mengubah status mesin dengan ID {id_mesin} dari {status_lama} ke {status_baru}"
SHIFT_CREATED: "Admin dengan ID {id_admin} membuat shift baru dengan ID {id_shift}"
SHIFT_UPDATED: "Admin dengan ID {id_admin} mengupdate shift dengan ID {id_shift}"
SHIFT_DELETED: "Admin dengan ID {id_admin} menghapus shift dengan ID {id_shift}"
SHIFT_ASSIGNED: "Admin dengan ID {id_admin} assign karyawan dengan ID {id_karyawan} ke shift dengan ID {id_shift}"
SHIFT_UNASSIGNED: "Admin dengan ID {id_admin} unassign karyawan dengan ID {id_karyawan} dari shift dengan ID {id_shift}"
NOTIFICATION_SENT: "User dengan ID {id_user} dan role {role} mengirim notifikasi dengan ID {id_notif} ke customer dengan ID {id_customer}"
```

---

## Dependencies

### Backend
- `pg` - PostgreSQL client

### Frontend Web
- `react-router-dom` - Navigation
- `tailwindcss` - Styling
- `lucide-react` - Icons

### Frontend Mobile
- Tidak diperlukan

---

## Testing Checklist

### Query Audit Log
- [ ] List audit log dengan pagination
- [ ] Filter berdasarkan tipe log
- [ ] Filter berdasarkan status
- [ ] Filter berdasarkan tanggal
- [ ] Filter berdasarkan customer
- [ ] Filter berdasarkan karyawan
- [ ] Search berdasarkan isi pesan
- [ ] Search berdasarkan aktivitas
- [ ] Detail audit log dengan ID valid
- [ ] Detail audit log dengan ID tidak ada → error

### Pencatatan Audit Log
- [ ] Login berhasil tercatat
- [ ] Login gagal tercatat
- [ ] Akun terkunci tercatat
- [ ] Logout tercatat
- [ ] Registrasi tercatat
- [ ] Ganti password tercatat
- [ ] Reset password tercatat
- [ ] Buat user tercatat
- [ ] Update user tercatat
- [ ] Nonaktifkan user tercatat
- [ ] Aktifkan user tercatat
- [ ] Buat booking tercatat
- [ ] Konfirmasi booking tercatat
- [ ] Tolak booking tercatat
- [ ] Batalkan booking tercatat
- [ ] Ubah status booking tercatat
- [ ] Buat transaksi tercatat
- [ ] Konfirmasi pembayaran tercatat
- [ ] Buat layanan tercatat
- [ ] Update layanan tercatat
- [ ] Hapus layanan tercatat
- [ ] Tambah mesin tercatat
- [ ] Update mesin tercatat
- [ ] Ubah status mesin tercatat
- [ ] Buat shift tercatat
- [ ] Update shift tercatat
- [ ] Hapus shift tercatat
- [ ] Assign karyawan tercatat
- [ ] Unassign karyawan tercatat
- [ ] Kirim notifikasi tercatat

### Frontend
- [ ] Tampilan tabel audit log
- [ ] Filter berfungsi
- [ ] Search berfungsi
- [ ] Pagination berfungsi
- [ ] Detail modal berfungsi
