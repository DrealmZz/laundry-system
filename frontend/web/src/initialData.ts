import { Transaction, Booking, Employee, Service, Task, ShiftBlock } from './types';

export const initialTransactions: Transaction[] = [
  {
    id: '#LW-2026-001',
    customerName: 'Andi Saputra',
    customerInitial: 'AS',
    serviceName: 'Kiloan - 5kg',
    serviceType: 'Kiloan',
    weightOrQty: 5,
    amount: 45000,
    status: 'Selesai',
    time: '08:15 AM',
    date: '30 Jun 2026',
    paymentMethod: 'Cash',
    cashierName: 'Andi Pratama'
  },
  {
    id: '#LW-2026-002',
    customerName: 'Riana Mutia',
    customerInitial: 'RM',
    serviceName: 'Koin - Cuci Kering',
    serviceType: 'Koin',
    weightOrQty: 1,
    amount: 30000,
    status: 'Proses',
    time: '08:42 AM',
    date: '30 Jun 2026',
    paymentMethod: 'QRIS',
    cashierName: 'Andi Pratama'
  },
  {
    id: '#LW-2026-003',
    customerName: 'Dedi Kusuma',
    customerInitial: 'DK',
    serviceName: 'Kiloan Express',
    serviceType: 'Kiloan',
    weightOrQty: 4.2,
    amount: 85000,
    status: 'Antri',
    time: '09:05 AM',
    date: '30 Jun 2026',
    paymentMethod: 'Cash',
    cashierName: 'Budi Santoso'
  },
  {
    id: '#LW-2026-004',
    customerName: 'Siti Lestari',
    customerInitial: 'SL',
    serviceName: 'Satuan - Jas',
    serviceType: 'Satuan',
    weightOrQty: 1,
    amount: 120000,
    status: 'Proses',
    time: '09:30 AM',
    date: '30 Jun 2026',
    paymentMethod: 'QRIS',
    cashierName: 'Budi Santoso'
  },
  {
    id: '#LW-2026-005',
    customerName: 'Fajar Putra',
    customerInitial: 'FP',
    serviceName: 'Koin - Dryer',
    serviceType: 'Koin',
    weightOrQty: 1,
    amount: 15000,
    status: 'Selesai',
    time: '10:12 AM',
    date: '30 Jun 2026',
    paymentMethod: 'Cash',
    cashierName: 'Andi Pratama'
  },
  {
    id: '#LW-2026-006',
    customerName: 'Budi Pratama',
    customerInitial: 'BP',
    serviceName: 'Cuci Kering Lipat',
    serviceType: 'Kiloan',
    weightOrQty: 5.0,
    amount: 40000,
    status: 'Selesai',
    time: '11:15 AM',
    date: '30 Jun 2026',
    paymentMethod: 'Cash',
    cashierName: 'Andi Pratama'
  },
  {
    id: '#LW-2026-007',
    customerName: 'Siti Aminah',
    customerInitial: 'SA',
    serviceName: 'Cuci Kering Setrika',
    serviceType: 'Kiloan',
    weightOrQty: 3.5,
    amount: 42000,
    status: 'Selesai',
    time: '11:30 AM',
    date: '30 Jun 2026',
    paymentMethod: 'QRIS',
    cashierName: 'Budi Santoso'
  },
  {
    id: '#LW-2026-008',
    customerName: 'Dedi Kusuma',
    customerInitial: 'DK',
    serviceName: 'Dry Cleaning',
    serviceType: 'Satuan',
    weightOrQty: 2.0,
    amount: 60000,
    status: 'Selesai',
    time: '12:00 PM',
    date: '30 Jun 2026',
    paymentMethod: 'QRIS',
    cashierName: 'Andi Pratama'
  },
  {
    id: '#LW-2026-009',
    customerName: 'Rina Larasati',
    customerInitial: 'RL',
    serviceName: 'Express Laundry',
    serviceType: 'Kiloan',
    weightOrQty: 4.0,
    amount: 100000,
    status: 'Selesai',
    time: '01:45 PM',
    date: '30 Jun 2026',
    paymentMethod: 'Cash',
    cashierName: 'Budi Santoso'
  },
  {
    id: '#LW-2026-010',
    customerName: 'Andi Nugroho',
    customerInitial: 'AN',
    serviceName: 'Cuci Kering Lipat',
    serviceType: 'Kiloan',
    weightOrQty: 10.0,
    amount: 80000,
    status: 'Selesai',
    time: '02:10 PM',
    date: '30 Jun 2026',
    paymentMethod: 'QRIS',
    cashierName: 'Andi Pratama'
  }
];

export const initialBookings: Booking[] = [
  {
    id: '#BK-9021',
    customerName: 'Budi Santoso',
    memberLevel: 'PLATINUM MEMBER',
    layanan: 'Cuci Kering Lipat - 10kg',
    tanggal: '15 Okt 2023',
    shift: 'Pagi (08:00)',
    lokasiMesin: 'Mesin Front Load #04 - Antasari',
    status: 'Menunggu',
    icon: 'local_laundry_service'
  },
  {
    id: '#BK-9025',
    customerName: 'Ani Wijaya',
    memberLevel: 'REGULAR',
    layanan: 'Deep Clean Bed Cover',
    tanggal: '16 Okt 2023',
    shift: 'Siang (13:00)',
    lokasiMesin: 'Large Washer #01 - Sudirman',
    status: 'Menunggu',
    icon: 'dry_cleaning'
  },
  {
    id: '#BK-9032',
    customerName: 'Siti Aminah',
    memberLevel: 'GOLD MEMBER',
    layanan: 'Cuci Setrika Express',
    tanggal: '15 Okt 2023',
    shift: 'Sore (17:00)',
    lokasiMesin: 'Mesin Stack Washer #02 - Kebon Jeruk',
    status: 'Menunggu',
    icon: 'laundry'
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'LW-ADM-001',
    name: 'Ahmad Ridwan',
    role: 'Admin Staff',
    email: 'ahmad.ridwan@luxewash.com',
    status: 'Aktif',
    joinDate: '12 Jan 2023',
    initial: 'AR',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqwnJMOKGaL0wVKAfXv58GC1JHRPUVhqopdLqtnYRh7Q8usDCoaE1f6lqXPHxY49-NaWYj1pflrdn6uGikDvS7zOOBezy9CHTMfPbUkj1jGrg7zCo2mQFqrcAkcM2GsoGG_YXppBpQ0Ub3IZ26hkJ0bQoLqperYMADuQLW0FC8W05nXIzV68z6uw-QpeCv8qHP7-YILjTxsQBvHQSRli6lvF7c1xvkV6qS7j4TYoVoljEvezrZA9VKPHjTLy93oNBx7zg66MAJz5Y'
  },
  {
    id: 'LW-KSR-024',
    name: 'Siti Aminah',
    role: 'Kasir',
    email: 'siti.aminah@luxewash.com',
    status: 'Aktif',
    joinDate: '05 Mar 2023',
    initial: 'SA',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDufBAqiMj9grtQN0MUvEbVHZiXr1yVzxdLxHrl6hlm4EnFXlwe6ZIiFkc9iKBtpJJhGncK-B8MTMIYGHVTanePs02ly1ApKo7UgRJbKpnTNRggZSYiY1w2NZ7YYbyJ79z-R01TM24vRtwmJTyxPs0BZFmCt2970pB1UBs8YQDgx3lcwLj3Ph_33LFNiWXXVEUmYtNkiMCIQPkiBrKkDJZDj_kIz-rlu2oyTcfA7_YYHh0b_AQdxJ-TMkTKX_YksYJSUgbsD1sUtqk'
  },
  {
    id: 'LW-KSR-012',
    name: 'Budi Hartono',
    role: 'Kasir',
    email: 'budi.h@luxewash.com',
    status: 'Cuti',
    joinDate: '21 Nov 2022',
    initial: 'BH',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzone-KANJbgjeK71xES_4oDBMbXPs3Yu5o8N4w3W1dsw7nuI-GbiSQQ7lDAqwV49b2F2juN8siS99QoMefBDr1UWkE4dsFJ0FccLRC2jn8olZfhxINsA8HJW_bp3r92NEOwliP1L1DfCR2n7c2etZUYJkO7USQELa6O0VWcyvB8P-_LU9HKht98BRBZHEU9JtU1fMuWFx1cI2AGXkHhza-zHDk8A_1emg5SfOHUpu-82EhV3-5mO5D53Qmo4yr-6g0A-L2uN53ns'
  },
  {
    id: 'LW-KSR-045',
    name: 'Lestari Putri',
    role: 'Kasir',
    email: 'lestari.p@luxewash.com',
    status: 'Aktif',
    joinDate: '15 Aug 2023',
    initial: 'LP',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKmBaMzym0-ypBJWyvnkzYGreT6VO41TmSmpIn6f6PYO-Oq2S1CzNgsttWeSiPvag-kXH0sAIKOp1Cm6c7hmIlnFzM0X3zmeKlhz8MLitpyJKY_kOMASnAuVxjGIA0XtIMAeTGVGUBzi3rk3fZuzBE6DiM0UI_DKUaBEXnUrNu3mhAX6q0k4Mcr1SYoB8J9KKgOZgSgf7lYSqP9OJWXIZb9BMP39lsWnKoZdMs1a9FiLYzqLdM8qLbGAh1A3L5N7tcmalP-atIRRc'
  },
  {
    id: 'LW-SPV-002',
    name: 'Hana Meilani',
    role: 'Supervisor',
    email: 'hana.m@luxewash.com',
    status: 'Aktif',
    joinDate: '01 Jun 2022',
    initial: 'HM',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsm8pA0GzwkVNdlMglPR8z7kR31UM9W6NbpfjPQxABoJBLrYEsBHINCk5xoH2OSo2HD6DvOBjiYUL2rterYGnUSFcXmSOi-vttHUCnkcwYaYMvkav312uYx4oJXPq419t-jOWQ9-hGVMmvascmlCi6mr_HkfiQXkRvrBsgQU9d9hwe5X38IPZfI7dqB3CvpBLlGGH7a4g2TcUNvPXtaQXgAq6d3OtnZsmEA9HhCirKjTZO9aQYPiJSjZ-U-HzW8T--n5oaNznUebk'
  }
];

export const initialServices: Service[] = [
  {
    id: 'SV-001',
    name: 'Cuci Kering Lipat',
    type: 'Kiloan',
    price: 8000,
    unit: 'kg',
    duration: '2 Hari',
    status: true,
    packageType: 'Reguler Package'
  },
  {
    id: 'SV-002',
    name: 'Cuci Kering Setrika',
    type: 'Kiloan',
    price: 12000,
    unit: 'kg',
    duration: '1 Hari',
    status: true,
    packageType: 'Express Package'
  },
  {
    id: 'SV-003',
    name: 'Self Service Coin',
    type: 'Koin',
    price: 20000,
    unit: 'token',
    duration: '90 Menit',
    status: true,
    packageType: '1 Washer/Dryer Cycle'
  },
  {
    id: 'SV-004',
    name: 'Cuci Bedcover Large',
    type: 'Satuan',
    price: 45000,
    unit: 'pcs',
    duration: '3 Hari',
    status: true,
    packageType: 'Specialist Cleaning'
  },
  {
    id: 'SV-005',
    name: 'Express 6 Jam',
    type: 'Kiloan',
    price: 25000,
    unit: 'kg',
    duration: '6 Jam',
    status: true,
    packageType: 'Priority Handling'
  }
];

export const initialTasks: Task[] = [
  { id: '1', text: 'Stok Koin Mesin 04', completed: false },
  { id: '2', text: 'Update Absensi Masuk', completed: true },
  { id: '3', text: 'Cek Saldo EDC', completed: false }
];

export const initialAvailableStaff = [
  { name: 'Gilang Pratama', role: 'Spesialis Cuci', initial: 'GP' },
  { name: 'Hana Meilani', role: 'Supervisor', initial: 'HM' },
  { name: 'Indra Jaya', role: 'Kurir', initial: 'IJ' },
  { name: 'Junaedi', role: 'Staff Setrika', initial: 'JN' },
  { name: 'Kania Safira', role: 'Staff Setrika', initial: 'KS' },
  { name: 'Lukman Hakim', role: 'Spesialis Cuci', initial: 'LH' },
  { name: 'Maya Sari', role: 'Staff Admin', initial: 'MS' },
  { name: 'Niko Prasetyo', role: 'Kurir', initial: 'NP' }
];

export const initialShiftBlocks: ShiftBlock[] = [
  // Day Mon(0), Tue(1), Wed(2), Thu(3), Fri(4), Sat(5), Sun(6)
  // Shifts: Pagi(0), Siang(1), Sore(2), Malam(3)
  { dayIndex: 0, shiftIndex: 0, assignedEmployeeIds: ['LW-ADM-001'] },
  { dayIndex: 0, shiftIndex: 1, assignedEmployeeIds: ['LW-KSR-012', 'LW-KSR-045'] },
  { dayIndex: 0, shiftIndex: 2, assignedEmployeeIds: ['LW-KSR-024'] },
  { dayIndex: 0, shiftIndex: 3, assignedEmployeeIds: ['LW-ADM-001'] },

  { dayIndex: 1, shiftIndex: 0, assignedEmployeeIds: ['LW-KSR-012'] },
  { dayIndex: 1, shiftIndex: 1, assignedEmployeeIds: ['LW-KSR-024'] },
  { dayIndex: 1, shiftIndex: 2, assignedEmployeeIds: ['LW-KSR-045'] },
  { dayIndex: 1, shiftIndex: 3, assignedEmployeeIds: ['LW-KSR-012'] },

  { dayIndex: 2, shiftIndex: 0, assignedEmployeeIds: ['LW-KSR-024'] },
  { dayIndex: 2, shiftIndex: 1, assignedEmployeeIds: ['LW-KSR-012'] },
  { dayIndex: 2, shiftIndex: 2, assignedEmployeeIds: ['LW-ADM-001'] },
  { dayIndex: 2, shiftIndex: 3, assignedEmployeeIds: ['LW-KSR-045'] },

  { dayIndex: 3, shiftIndex: 0, assignedEmployeeIds: ['LW-KSR-045'] },
  { dayIndex: 3, shiftIndex: 1, assignedEmployeeIds: ['LW-ADM-001'] },
  { dayIndex: 3, shiftIndex: 2, assignedEmployeeIds: ['LW-KSR-012'] },
  { dayIndex: 3, shiftIndex: 3, assignedEmployeeIds: ['LW-SPV-002'] }
];
