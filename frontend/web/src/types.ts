export interface Transaction {
  id: string;
  id_transaksi?: number;
  customerName: string;
  customerInitial: string;
  serviceName: string;
  serviceType: 'Kiloan' | 'Satuan' | 'Koin';
  weightOrQty: number;
  amount: number;
  status: 'Selesai' | 'Proses' | 'Antri';
  time: string;
  date: string;
  paymentMethod: 'Cash' | 'QRIS';
  cashierName: string;
}

export interface Booking {
  id: string;
  id_pemesanan?: string;
  customerName: string;
  memberLevel: 'PLATINUM MEMBER' | 'GOLD MEMBER' | 'REGULAR';
  layanan: string;
  tanggal: string;
  shift: string;
  lokasiMesin: string;
  status: 'Menunggu' | 'Disetujui' | 'Diproses' | 'Dijemput' | 'Selesai' | 'Tolak' | 'Dibatalkan';
  icon: string;
  berat_kg?: number | null;
  status_pesanan_raw?: string;
  jenis_pencucian?: string;
  tanggal_pengiriman?: string | null;
  shift_pengiriman?: string | null;
  harga?: number;
  metode_pengambilan?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Admin Staff' | 'Kasir' | 'Supervisor' | 'Kurir' | 'Staff Setrika' | 'Spesialis Cuci' | 'Staff Admin';
  email: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
  joinDate: string;
  initial: string;
  photoUrl: string | null;
}

export interface Service {
  id: string;
  name: string;
  type: 'Kiloan' | 'Satuan' | 'Koin';
  price: number;
  unit: 'kg' | 'pcs' | 'token';
  duration: string;
  status: boolean;
  packageType: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface ShiftBlock {
  dayIndex: number; // 0-6 (Mon-Sun)
  shiftIndex: number; // 0-3 (Pagi, Siang, Sore, Malam)
  assignedEmployeeIds: string[];
}

export interface User {
  username: string;
  name: string;
  role: 'kasir' | 'admin' | 'owner';
  title: string;
}

export interface FinanceReport {
  periode: { start_date: string; end_date: string };
  ringkasan: {
    total_transaksi: number;
    total_revenue: number;
    rata_rata_per_transaksi: number;
  };
  per_metode_pembayaran: Array<{
    metode: string;
    jumlah: number;
    total: number;
  }>;
  per_hari: Array<{
    tanggal: string;
    jumlah_transaksi: number;
    total_revenue: number;
  }>;
}

export interface ReportSummary {
  periode: { start_date: string; end_date: string };
  pemesanan: { total: number; per_status: Array<{ status: string; jumlah: number }> };
  transaksi: { total_lunas: number; total_revenue: number };
  pengguna: { customer_baru: number; karyawan_aktif: number };
}

export type ReportPeriod = 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'tahun_ini';

export interface OperationalCost {
  id: number;
  tanggal: string;
  kategori: string;
  jumlah: number;
  satuan: string;
  deskripsi: string | null;
}

export interface ProfitLossReport {
  periode: { start_date: string; end_date: string };
  total_revenue: number;
  total_cost: number;
  net_profit: number;
  margin_percent: number;
  cost_per_kg: number;
  total_kg: number;
  per_kategori: Array<{ kategori: string; total: number; persen: number }>;
}

export interface SalesTarget {
  periode: string;
  target_amount: number;
}

export interface ShiftPerformanceItem {
  shift: string;
  total_transaksi: number;
  total_revenue: number;
  total_kg: number;
  total_koin: number;
  rata_rata_per_transaksi: number;
}

export interface ShiftPerformanceReport {
  periode: { start_date: string; end_date: string };
  shifts: ShiftPerformanceItem[];
}

export interface Customer {
  id_customer: number;
  nama_lengkap: string;
  username: string;
  no_hp: string;
  email: string;
  alamat: string;
  status_akun: string;
}

export interface Machine {
  id: string;
  kode_mesin: string;
  nama_mesin: string;
  tipe_mesin: 'pencucian' | 'pengeringan';
  status_mesin: 'tersedia' | 'dipakai' | 'perbaikan';
  kapasitas_kg: number | null;
  konsumsi_kwh: number | null;
  penggunaan_air_liter: number | null;
}

export interface AuditLog {
  id_log: number;
  id_customer: number | null;
  nama_customer: string | null;
  id_karyawan: number | null;
  nama_karyawan: string | null;
  tipe_log: string;
  isi_pesan: string | null;
  aktivitas: string;
  timestamp: string;
  status: string;
}
