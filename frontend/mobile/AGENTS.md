# Mobile — Konteks AI

Kamu bekerja di direktori `frontend/mobile/` milik **Tim Mobile**.

## Batas Direktori

- ✅ BOLEH edit: semua file di dalam `frontend/mobile/`
- ❌ JANGAN edit: `backend/`, `frontend/web/`, `database/`, `docs/`
- ✅ BOLEH tambah aset (gambar, font) ke `frontend/public/`

## Stack

- React Native + Expo SDK 56
- TypeScript
- React Navigation v7 (stack + bottom tabs)
- AsyncStorage untuk penyimpanan lokal token

## Struktur Kode

```
frontend/mobile/src/
├── screens/
│   ├── auth/           # LoginScreen, RegisterScreen
│   └── customer/       # HomeScreen, LayananScreen, BookingScreen,
│                       # StatusScreen, RiwayatScreen
├── navigation/
│   └── AppNavigator.tsx  # Stack + Tab navigator
├── context/
│   └── AuthContext.tsx   # Global auth state (token, user)
├── services/
│   └── api.ts            # Semua pemanggilan API ke backend
└── components/           # Komponen reusable (belum diisi)
```

## Konvensi

- Semua panggilan HTTP melalui `src/services/api.ts`
- Token JWT disimpan di AsyncStorage, diambil via `AuthContext`
- Untuk development: set `USE_MOCK = true` di `api.ts` agar tidak butuh backend aktif
- Ganti `USE_MOCK = false` saat backend sudah siap

## Target Pengguna

Hanya untuk role `customer`. Kasir/Admin/Owner menggunakan web dashboard.

## API Base URL

`http://localhost:3000/api/v1` — lihat `docs/api-spec.md` untuk daftar endpoint.
