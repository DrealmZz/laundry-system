export interface Transaction {
  id: string;
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
  customerName: string;
  memberLevel: 'PLATINUM MEMBER' | 'GOLD MEMBER' | 'REGULAR';
  layanan: string;
  tanggal: string;
  shift: string;
  lokasiMesin: string;
  status: 'Menunggu' | 'Konfirmasi' | 'Tolak';
  icon: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Admin Staff' | 'Kasir' | 'Supervisor' | 'Kurir' | 'Staff Setrika' | 'Spesialis Cuci' | 'Staff Admin';
  email: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
  joinDate: string;
  initial: string;
  photoUrl: string;
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
