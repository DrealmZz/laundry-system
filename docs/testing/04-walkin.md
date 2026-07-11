# Testing — Walk-in Transaksi (Kasir)

## Prerequisites

- Kasir login (via web dashboard)
- Minimal 1 layanan kiloan & 1 layanan koin aktif
- Mesin koin tersedia (untuk test koin walk-in)

## Diagram Alur

```
[Kasir buka NewTransaction]
  → Cari/buat customer (auto-register via no_hp)
    → Pilih layanan (kiloan/koin)
    → Input berat (kiloan) / pilih mesin (koin)
    → Pilih metode ambil (kiloan: ambil_sendiri/pengiriman, koin: auto)
    → Pilih metode bayar (cash/qris/koin/transfer)
    → Submit
      → POST /transaksi/walk-in
        → Booking dibuat langsung status menunggu pembayaran
        → Transaksi langsung lunas
        → Booking → sudah dibayar
          → Lanjut proses cucian seperti kiloan biasa
```

---

## Test Cases

### A. Walk-in Kiloan (Cash)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| A1 | Walk-in kiloan customer baru (cash) | Buka `/kasir/new-transaction` → isi form | Nama: "Siti Test", No HP: "08111111111", Layanan: Kiloan, Berat: 3.5 kg, Metode Ambil: ambil_sendiri, Bayar: Cash, Diskon: 0% | `POST /transaksi/walk-in` sukses, struk tercetak, booking langsung `sudah dibayar` | | |
| A2 | Verifikasi booking & transaksi | Cek tabel transaksi & booking | Transaksi baru muncul di daftar, booking status `sudah dibayar` | | |
| A3 | Walk-in customer existing | Input no HP customer yang sudah terdaftar | Nama auto terisi, tidak perlu register ulang | | |
| A4 | Walk-in dengan pengiriman | Pilih metode ambil = pengiriman, isi alamat | Booking dengan `metode_pengambilan: "pengiriman"` | | |
| A5 | Walk-in dengan QRIS | Pilih metode bayar QRIS | Transaksi lunas via QRIS | | |

### B. Walk-in Kiloan — Validasi

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| B1 | Berat kosong | Submit tanpa berat | Validasi error "berat_kg harus lebih dari 0" | | |
| B2 | Berat = 0 | Input berat 0 | Validasi error | | |
| B3 | Tanpa metode pengambilan | Pilih kiloan tapi tidak pilih metode ambil | Validasi error "metode_pengambilan wajib diisi" | | |
| B4 | Tanpa metode bayar | Tidak pilih metode bayar | Validasi error | | |

### C. Walk-in Koin

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| C1 | Walk-in koin cash | Pilih layanan koin, bayar cash | `POST /transaksi/walk-in`, `jenis_pencucian: "koin"`, `metode_pengambilan: "ambil_sendiri"` (auto), total = harga tetap | | |
| C2 | Walk-in koin via token (koin) | Pilih metode bayar = koin | Transaksi lunas via metode koin | | |
| C3 | Verifikasi metode_pengambilan koin | Cek booking koin | `metode_pengambilan` auto = `ambil_sendiri` (tidak bisa diubah) | | |

### D. UI / UX

| No | Skenario | Langkah | Expected Result | Status | Notes |
|----|----------|---------|-----------------|--------|-------|
| D1 | Search customer by name/number | Ketik di field search | Customer terfilter | | |
| D2 | Auto-register customer baru | Input no_hp baru → submit | Customer auto terdaftar, bisa login dengan password default (no_hp) | | |
| D3 | Struk tercetak setelah transaksi | Setelah submit sukses | ReceiptPrint muncul dengan detail transaksi | | |
| D4 | Notifikasi ke customer (jika existing) | Customer cek notif mobile | Notif "transaksi walk-in" (jika ada fitur) | | |

---

## API Direct Test (via curl/Postman)

| No | Skenario | Langkah | Input | Expected Result | Status | Notes |
|----|----------|---------|-------|-----------------|--------|-------|
| D5 | Walk-in API langsung | `POST /transaksi/walk-in` (token kasir) | Full payload valid | Response 201, `nomor_struk`, `id_pemesanan`, `id_customer` | | |
| D6 | Walk-in tanpa token | `POST /transaksi/walk-in` tanpa auth | Response 401 | | |
| D7 | Walk-in dengan token customer | `POST /transaksi/walk-in` (token customer) | Response 403 | | |
| D8 | Walk-in tanpa id_karyawan | Payload tanpa id_karyawan | Response 400 | | |

---

## Data Flow Summary

```
[Kasir] → POST /transaksi/walk-in
           ├── Cari/buat customer (auto-register)
           ├── Buat pemesanan (status: menunggu pembayaran)
           ├── Buat transaksi (status: lunas)
           └── Update pemesanan → sudah dibayar
```

## Edge Cases

- Customer baru auto-register: password default = no_hp, email = `${no_hp}@laundaja.com`
- Koin walk-in: `metode_pengambilan` auto `ambil_sendiri`, tidak perlu input berat (qty = 1)
- Kiloan walk-in skip `menunggu konfirmasi` → langsung `sudah dibayar`
