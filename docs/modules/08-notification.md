# Modul 08: Notifikasi

## Overview

Modul ini menangani notifikasi untuk customer. Admin atau kasir dapat mengirim notifikasi secara manual kepada customer terkait status booking, pembayaran, atau informasi penting lainnya. Customer dapat melihat daftar notifikasi dan menandai sudah dibaca.

## Status Implementasi

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Backend | ⚠️ BELUM ADA | Perlu dibuat dari nol |
| Frontend Web | ❌ Tidak ada | Tidak diperlukan (notifikasi untuk customer) |
| Frontend Mobile | ⚠️ BELUM ADA | Perlu dibuat `NotificationScreen.tsx` |

---

## Database Tables

### Tabel yang Akan Dibuat

```sql
CREATE TABLE notifikasi (
    id_notif      SERIAL PRIMARY KEY,
    id_pemesanan  INTEGER REFERENCES pemesanan(id_pemesanan),
    id_customer   INTEGER NOT NULL REFERENCES customer(id_customer),
    judul         VARCHAR(100) NOT NULL,
    isi_pesan     TEXT NOT NULL,
    is_read       BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifikasi_customer ON notifikasi(id_customer, is_read);
CREATE INDEX idx_notifikasi_pemesanan ON notifikasi(id_pemesanan);
```

### Contoh Data

| id_notif | id_pemesanan | id_customer | judul | isi_pesan | is_read | created_at |
|----------|--------------|-------------|-------|-----------|---------|------------|
| 1 | 1 | 1 | Pesanan Dikonfirmasi | Pesanan kiloan Anda telah dikonfirmasi. Silakan tunggu proses pencucian. | false | 2026-07-03 10:00:00 |
| 2 | 1 | 1 | Cucian Sedang Dicuci | Pesanan Anda sedang dalam proses pencucian. | false | 2026-07-03 11:00:00 |
| 3 | 2 | 2 | Menunggu Pembayaran | Pesanan Anda menunggu pembayaran. Silakan lakukan pembayaran di outlet. | true | 2026-07-03 10:05:00 |

---

## API Endpoints

### 1. GET `/api/v1/notifications`

**Deskripsi:** Mendapatkan daftar notifikasi customer yang sedang login

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** customer

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 20
- `is_read` (optional): Filter status baca (true/false)

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_notif": 1,
        "id_pemesanan": 1,
        "judul": "Pesanan Dikonfirmasi",
        "isi_pesan": "Pesanan kiloan Anda telah dikonfirmasi. Silakan tunggu proses pencucian.",
        "is_read": false,
        "created_at": "2026-07-03T10:00:00Z"
      },
      {
        "id_notif": 2,
        "id_pemesanan": 1,
        "judul": "Cucian Sedang Dicuci",
        "isi_pesan": "Pesanan Anda sedang dalam proses pencucian.",
        "is_read": false,
        "created_at": "2026-07-03T11:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  },
  "message": "Daftar notifikasi berhasil diambil"
}
```

**Query SQL:**
```sql
SELECT id_notif, id_pemesanan, judul, isi_pesan, is_read, created_at
FROM notifikasi
WHERE id_customer = $1
  AND ($2::boolean IS NULL OR is_read = $2)
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

---

### 2. GET `/api/v1/notifications/count`

**Deskripsi:** Mendapatkan jumlah notifikasi yang belum dibaca

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** customer

**Response Success (200):**
```json
{
  "status": "success",
  "data": {
    "unread_count": 3
  },
  "message": "Jumlah notifikasi belum dibaca"
}
```

**Query SQL:**
```sql
SELECT COUNT(*) AS unread_count
FROM notifikasi
WHERE id_customer = $1 AND is_read = FALSE;
```

---

### 3. PATCH `/api/v1/notifications/:id/read`

**Deskripsi:** Menandai notifikasi sudah dibaca

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** customer

**Path Parameters:**
- `id`: ID notifikasi

**Response Success (200):**
```json
{
  "status": "success",
  "data": null,
  "message": "Notifikasi ditandai sudah dibaca"
}
```

**Response Error (404):**
```json
{
  "status": "error",
  "data": null,
  "message": "Notifikasi tidak ditemukan"
}
```

**Business Rules:**
- Customer hanya bisa menandai notifikasi miliknya sendiri
- Jika notifikasi sudah dibaca, tidak ada perubahan

**Query SQL:**
```sql
UPDATE notifikasi 
SET is_read = TRUE 
WHERE id_notif = $1 AND id_customer = $2;
```

---

### 4. POST `/api/v1/notifications`

**Deskripsi:** Mengirim notifikasi ke customer (oleh admin/kasir)

**Headers:**
```
Authorization: Bearer <token>
```

**Role:** admin, kasir

**Request:**
```json
{
  "id_pemesanan": 1,
  "id_customer": 1,
  "judul": "Pesanan Dikonfirmasi",
  "isi_pesan": "Pesanan kiloan Anda telah dikonfirmasi. Silakan tunggu proses pencucian."
}
```

**Response Success (201):**
```json
{
  "status": "success",
  "data": {
    "id_notif": 1,
    "id_pemesanan": 1,
    "id_customer": 1,
    "judul": "Pesanan Dikonfirmasi",
    "isi_pesan": "Pesanan kiloan Anda telah dikonfirmasi. Silakan tunggu proses pencucian.",
    "is_read": false
  },
  "message": "Notifikasi berhasil dikirim"
}
```

**Validasi:**
- `id_pemesanan` (opsional): harus valid jika diisi
- `id_customer`: harus valid dan ada di tabel `customer`
- `judul`: minimal 3 karakter, maksimal 100 karakter
- `isi_pesan`: minimal 1 karakter

**Business Rules:**
- Admin/kasir mengirim notifikasi secara manual
- Notifikasi terkait dengan booking tertentu (opsional)
- Catat ke `audit_log` dengan tipe `NOTIFICATION_SENT`

**Query SQL:**
```sql
INSERT INTO notifikasi (id_pemesanan, id_customer, judul, isi_pesan)
VALUES ($1, $2, $3, $4)
RETURNING id_notif;
```

---

## Frontend Integration

### Mobile - NotificationScreen.tsx

**Fitur:**
- Daftar notifikasi dalam bentuk card/list
- Badge jumlah notifikasi belum dibaca di tab navigator
- Filter berdasarkan status baca (semua/belum dibaca)
- Klik notifikasi → buka detail booking (jika terkait)
- Pull-to-refresh untuk update notifikasi

**Flow:**
1. Customer buka halaman Notifikasi
2. Fetch data dari `GET /api/v1/notifications?page=1&limit=20`
3. Tampilkan daftar notifikasi
4. Customer klik notifikasi → `PATCH /api/v1/notifications/:id/read`
5. Jika notifikasi terkait booking → redirect ke halaman Status dengan `id_pemesanan`
6. Customer pull-to-refresh → fetch ulang data

**UI Components:**
```typescript
// Badge notifikasi di tab navigator
<Tab.Screen
  name="Notifikasi"
  component={NotificationScreen}
  options={{
    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
    tabBarIcon: ({ color, size }) => (
      <Icon name="bell" color={color} size={size} />
    )
  }}
/>

// List notifikasi
<FlatList
  data={notifications}
  keyExtractor={(item) => item.id_notif.toString()}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unread
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.title}>{item.judul}</Text>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.message}>{item.isi_pesan}</Text>
      <Text style={styles.time}>{formatTime(item.created_at)}</Text>
    </TouchableOpacity>
  )}
  onRefresh={handleRefresh}
  refreshing={loading}
/>

// Filter tabs
<View style={styles.filterTabs}>
  <TouchableOpacity
    style={[styles.tab, filter === 'all' && styles.activeTab]}
    onPress={() => setFilter('all')}
  >
    <Text>Semua</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.tab, filter === 'unread' && styles.activeTab]}
    onPress={() => setFilter('unread')}
  >
    <Text>Belum Dibaca</Text>
  </TouchableOpacity>
</View>
```

---

## Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                   NOTIFICATION FLOW                     │
└─────────────────────────────────────────────────────────┘

[Admin/Kasir] ──→ [Kirim Notifikasi]
                        │
                        ▼
                [POST /notifications]
                        │
                        ▼
                [Notifikasi Tersimpan]
                        │
                        ▼
                [Customer Menerima]
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
    [Belum Dibaca]                  [Sudah Dibaca]
    (is_read = false)               (is_read = true)
        │                               │
        ▼                               ▼
    [Badge Muncul]                  [Badge Hilang]
    di Tab Navigator
        │
        ▼
    [Customer Klik]
        │
        ▼
    [PATCH /notifications/:id/read]
        │
        ▼
    [Buka Detail Booking]
    (jika terkait pemesanan)
```

---

## Business Rules Detail

### Trigger Notifikasi

**Admin/Kasir mengirim notifikasi secara manual** dalam situasi berikut:

**1. Konfirmasi Booking**
- Judul: "Pesanan Dikonfirmasi"
- Isi: "Pesanan [jenis layanan] Anda telah dikonfirmasi. Silakan tunggu proses pencucian."
- Trigger: Saat admin mengkonfirmasi booking

**2. Update Status Cucian**
- Judul: "Status Pesanan Diperbarui"
- Isi: "Pesanan Anda [status baru]."
- Trigger: Saat admin/kasir mengubah status booking

**3. Menunggu Pembayaran**
- Judul: "Menunggu Pembayaran"
- Isi: "Pesanan Anda menunggu pembayaran. Silakan lakukan pembayaran di outlet."
- Trigger: Saat status berubah ke 'menunggu pembayaran'

**4. Pembayaran Berhasil**
- Judul: "Pembayaran Berhasil"
- Isi: "Pembayaran Anda telah berhasil. Pesanan akan segera diproses."
- Trigger: Saat kasir mengkonfirmasi pembayaran

**5. Pesanan Selesai**
- Judul: "Pesanan Selesai"
- Isi: "Pesanan Anda sudah selesai. Silakan ambil di outlet atau tunggu pengiriman."
- Trigger: Saat status berubah ke 'selesai'

**6. Pesanan Ditolak**
- Judul: "Pesanan Ditolak"
- Isi: "Pesanan Anda ditolak. Alasan: [alasan penolakan]."
- Trigger: Saat admin menolak booking

### Template Notifikasi

**Untuk memudahkan admin/kasir, siapkan template:**

```javascript
const NOTIFICATION_TEMPLATES = {
  BOOKING_CONFIRMED: {
    judul: 'Pesanan Dikonfirmasi',
    isi_pesan: 'Pesanan {jenis_layanan} Anda telah dikonfirmasi. Silakan tunggu proses pencucian.'
  },
  STATUS_UPDATED: {
    judul: 'Status Pesanan Diperbarui',
    isi_pesan: 'Pesanan Anda {status_baru}.'
  },
  WAITING_PAYMENT: {
    judul: 'Menunggu Pembayaran',
    isi_pesan: 'Pesanan Anda menunggu pembayaran. Silakan lakukan pembayaran di outlet.'
  },
  PAYMENT_SUCCESS: {
    judul: 'Pembayaran Berhasil',
    isi_pesan: 'Pembayaran Anda telah berhasil. Pesanan akan segera diproses.'
  },
  ORDER_COMPLETED: {
    judul: 'Pesanan Selesai',
    isi_pesan: 'Pesanan Anda sudah selesai. Silakan ambil di outlet atau tunggu pengiriman.'
  },
  ORDER_REJECTED: {
    judul: 'Pesanan Ditolak',
    isi_pesan: 'Pesanan Anda ditolak. Alasan: {alasan}.'
  }
};
```

---

## Dependencies

### Backend
- `pg` - PostgreSQL client

### Frontend Web
- Tidak diperlukan (notifikasi untuk customer)

### Frontend Mobile
- `@react-navigation/native` - Navigation
- `react-native` - UI components
- `@react-navigation/bottom-tabs` - Tab navigator dengan badge

---

## Testing Checklist

### Kirim Notifikasi
- [ ] Kirim notifikasi dengan data valid
- [ ] Kirim notifikasi tanpa id_pemesanan (opsional)
- [ ] Kirim notifikasi dengan id_customer yang tidak ada → error
- [ ] Kirim notifikasi dengan judul kosong → error
- [ ] Notifikasi tersimpan di database

### List Notifikasi
- [ ] List notifikasi dengan pagination
- [ ] List notifikasi dengan filter is_read = false
- [ ] List notifikasi dengan filter is_read = true
- [ ] Customer hanya bisa lihat notifikasi sendiri

### Tandai Dibaca
- [ ] Tandai notifikasi sudah dibaca
- [ ] Tandai notifikasi yang sudah dibaca → tidak ada perubahan
- [ ] Tandai notifikasi milik customer lain → error

### Jumlah Notifikasi
- [ ] Hitung jumlah notifikasi belum dibaca
- [ ] Jumlah berkurang setelah notifikasi dibaca

### Frontend Mobile
- [ ] Badge muncul di tab navigator
- [ ] Badge hilang setelah semua notifikasi dibaca
- [ ] Tampilan daftar notifikasi
- [ ] Klik notifikasi → buka detail booking
- [ ] Pull-to-refresh berfungsi
- [ ] Filter berdasarkan status baca
