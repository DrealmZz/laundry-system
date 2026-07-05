import React, { useState, useEffect, useCallback } from 'react';
import { Service, Transaction } from '../types';
import {
  User,
  Search,
  Scale,
  Coins,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Printer,
  ShoppingBag,
  Percent,
  Plus,
  Minus,
  X,
  AlertCircle,
} from 'lucide-react';

interface NewTransactionProps {
  services: Service[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'time' | 'date'>) => string;
  onSelectReceipt: (id: string) => void;
  onNavigateToDashboard: () => void;
}

export default function NewTransaction({
  services,
  onAddTransaction,
  onSelectReceipt,
  onNavigateToDashboard,
}: NewTransactionProps) {
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [weightOrQty, setWeightOrQty] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Validation & submission
  const [formErrors, setFormErrors] = useState<{ customer?: string; payment?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTransactionId, setCreatedTransactionId] = useState('');
  const [createdTransactionDetail, setCreatedTransactionDetail] = useState<any>(null);

  const quickCashAmounts = [10000, 20000, 50000, 100000];
  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  const minQty = 0.1;
  const stepQty = selectedService?.type === 'Kiloan' ? 0.1 : 1;

  const handleIncrement = () => {
    setWeightOrQty(prev => Math.min(9999, parseFloat((prev + stepQty).toFixed(2))));
  };

  const handleDecrement = () => {
    setWeightOrQty(prev => {
      const val = prev - stepQty;
      return val < minQty ? minQty : parseFloat(val.toFixed(2));
    });
  };

  const unitPrice = selectedService ? selectedService.price : 0;
  const subtotal = Math.round(unitPrice * weightOrQty);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  useEffect(() => {
    if (paymentMethod === 'QRIS') {
      setAmountPaid(total.toString());
    }
  }, [paymentMethod, total]);

  const paidNum = parseFloat(amountPaid) || 0;
  const changeAmount = Math.max(0, paidNum - total);

  const validateForm = useCallback((): boolean => {
    const errors: { customer?: string; payment?: string } = {};
    if (!customerName.trim()) {
      errors.customer = 'Nama pelanggan wajib diisi';
    } else if (customerName.trim().length < 2) {
      errors.customer = 'Nama minimal 2 karakter';
    }
    if (paymentMethod === 'Cash' && paidNum < total) {
      errors.payment = `Jumlah pembayaran kurang Rp ${(total - paidNum).toLocaleString('id-ID')}`;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [customerName, paymentMethod, paidNum, total]);

  const handleProcessPayment = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    const newTx = {
      customerName: customerName.trim(),
      customerInitial: customerName.trim().substring(0, 2).toUpperCase(),
      serviceName: `${selectedService.name} (${weightOrQty}${selectedService.unit})`,
      serviceType: selectedService.type,
      weightOrQty,
      amount: total,
      status: 'Proses' as const,
      paymentMethod,
      cashierName: 'Andi Pratama',
    };

    const newId = onAddTransaction(newTx);

    setCreatedTransactionId(newId);
    setCreatedTransactionDetail({
      ...newTx,
      id: newId,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    });

    setIsSubmitting(false);
    setShowSuccessModal(true);
  }, [isSubmitting, validateForm, customerName, selectedService, weightOrQty, total, paymentMethod, onAddTransaction]);

  const handleResetForm = () => {
    setCustomerName('');
    setWeightOrQty(1);
    setPaymentMethod('Cash');
    setAmountPaid('');
    setDiscountPercent(0);
    setFormErrors({});
    setShowSuccessModal(false);
    setCreatedTransactionId('');
    setCreatedTransactionDetail(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToDashboard}
            className="p-2 hover:bg-white/30 rounded-[var(--radius-md)] transition-all duration-200 border border-white/40 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50"
            aria-label="Kembali ke dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-ink-secondary" />
          </button>
          <div>
            <h2 className="text-lg font-black text-ink tracking-tight">Transaksi Baru</h2>
            <p className="text-xs text-ink-muted mt-1">Input transaksi pencucian dan penerimaan pembayaran</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Column */}
        <form onSubmit={handleProcessPayment} className="lg:col-span-2 space-y-5" noValidate>
          {/* Section 1: Customer Details */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/30 pb-3">
              <User className="w-[18px] h-[18px] text-teal" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted font-mono">Informasi Pelanggan</h3>
            </div>

            <div className="space-y-1">
              <label htmlFor="tx-customer" className="block text-xs font-bold text-ink-secondary">
                Nama Pelanggan <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  id="tx-customer"
                  type="text"
                  value={customerName}
                  onChange={(e) => { setCustomerName(e.target.value); setFormErrors(p => ({ ...p, customer: undefined })); }}
                  placeholder="Masukkan nama lengkap pelanggan..."
                  aria-invalid={!!formErrors.customer}
                  aria-describedby={formErrors.customer ? 'tx-customer-error' : undefined}
                  className={`w-full glass-input rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-xs focus:outline-none text-ink-secondary font-semibold ${
                    formErrors.customer ? 'border-error/50 focus:ring-2 focus:ring-error/15' : 'focus:ring-2 focus:ring-teal/15'
                  }`}
                  maxLength={100}
                />
                <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formErrors.customer && (
                <p id="tx-customer-error" className="text-[11px] text-error font-semibold flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {formErrors.customer}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Services & Quantity */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/30 pb-3">
              <ShoppingBag className="w-[18px] h-[18px] text-teal" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted font-mono">Pilih Layanan & Kuantitas</h3>
            </div>

            {services.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-ink-secondary">Tidak ada layanan tersedia</p>
                <p className="text-xs text-ink-muted mt-1">Hubungi admin untuk mengaktifkan layanan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-secondary">Layanan Laundry</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setWeightOrQty(1);
                        }}
                        className={`flex items-center justify-between p-3 rounded-[var(--radius-md)] border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 ${
                          selectedServiceId === service.id
                            ? 'border-teal/40 bg-teal/8 text-ink shadow-glass'
                            : 'border-white/40 hover:border-teal/20 bg-white/30 text-ink-secondary backdrop-blur-sm'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{service.name}</p>
                          <p className="text-[11px] text-ink-muted">{service.packageType} • {service.duration}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xs font-black text-teal">Rp {service.price.toLocaleString('id-ID')}</p>
                          <p className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">per {service.unit}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-[var(--radius-md)] border border-white/30 flex flex-col justify-between h-[180px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-ink-secondary">
                      <Scale className="w-4 h-4 text-teal" />
                      <span>Ukuran / Kuantitas</span>
                    </div>
                    <span className="text-[11px] font-mono tracking-wider bg-teal/10 text-teal font-bold px-2 py-0.5 rounded-full border border-teal/15">
                      {selectedService ? selectedService.unit.toUpperCase() : 'KG'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-5 my-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      className="w-10 h-10 flex items-center justify-center bg-white/40 hover:bg-white/60 active:scale-95 text-ink-secondary rounded-[var(--radius-md)] shadow-subtle border border-white/40 transition-all font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="text-center min-w-[70px]">
                      <span className="text-2xl font-black text-ink font-mono">{weightOrQty}</span>
                      <span className="text-xs text-ink-muted block font-bold">{selectedService ? selectedService.unit : 'kg'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-10 h-10 flex items-center justify-center bg-white/40 hover:bg-white/60 active:scale-95 text-ink-secondary rounded-[var(--radius-md)] shadow-subtle border border-white/40 transition-all font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-ink-muted text-center font-medium">
                    Atur berat dengan tombol atau manual
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Right Sidebar: Bill Summary & Payment */}
        <div className="space-y-5">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/30 pb-3">
              <CreditCard className="w-[18px] h-[18px] text-teal" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted font-mono">Ringkasan & Pembayaran</h3>
            </div>

            <div className="space-y-2.5 text-xs border-b border-dashed border-white/30 pb-3.5">
              <div className="flex items-center justify-between text-ink-secondary">
                <span>Harga Satuan ({selectedService?.name})</span>
                <span className="font-semibold">Rp {unitPrice.toLocaleString('id-ID')} / {selectedService?.unit}</span>
              </div>
              <div className="flex items-center justify-between text-ink-secondary">
                <span>Jumlah</span>
                <span className="font-semibold">{weightOrQty} {selectedService?.unit}</span>
              </div>
              <div className="flex items-center justify-between text-ink-secondary">
                <span>Subtotal</span>
                <span className="font-bold text-ink">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex items-center justify-between gap-4 mt-1 bg-teal/5 p-2 rounded-[var(--radius-sm)] border border-teal/10">
                <span className="flex items-center gap-1 text-teal font-semibold">
                  <Percent className="w-3.5 h-3.5" /> Diskon
                </span>
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                  className="bg-white/40 border border-white/40 rounded-[var(--radius-sm)] text-[11px] px-2 py-1 font-semibold text-ink-secondary focus:outline-none focus:ring-2 focus:ring-teal/15"
                >
                  <option value={0}>Tidak Ada (0%)</option>
                  <option value={5}>Reguler (5%)</option>
                  <option value={10}>Gold (10%)</option>
                  <option value={15}>Platinum (15%)</option>
                </select>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-error">
                  <span>Potongan ({discountPercent}%)</span>
                  <span className="font-bold">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-white/30 p-3.5 rounded-[var(--radius-md)] border border-white/30 backdrop-blur-sm">
              <span className="text-xs font-bold text-ink-secondary">Total Tagihan:</span>
              <span className="text-lg font-black text-ink tracking-tight">Rp {total.toLocaleString('id-ID')}</span>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider font-mono">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Cash', 'QRIS'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method === 'QRIS') setAmountPaid(total.toString());
                      else setAmountPaid('');
                      setFormErrors(p => ({ ...p, payment: undefined }));
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-[var(--radius-md)] border text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 ${
                      paymentMethod === method
                        ? 'border-teal/40 bg-teal/8 text-ink shadow-glass'
                        : 'border-white/40 bg-white/30 hover:border-teal/20 text-ink-muted backdrop-blur-sm'
                    }`}
                  >
                    {method === 'Cash' ? <Coins className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    <span>{method === 'Cash' ? 'Tunai' : 'QRIS'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Paid Amount */}
            {paymentMethod === 'Cash' ? (
              <div className="space-y-2">
                <label htmlFor="tx-paid" className="block text-xs font-bold text-ink-secondary">
                  Jumlah Uang Diterima <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="text-xs text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 font-bold">Rp</span>
                  <input
                    id="tx-paid"
                    type="text"
                    inputMode="numeric"
                    value={amountPaid ? parseInt(amountPaid).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length <= 12) setAmountPaid(val);
                      setFormErrors(p => ({ ...p, payment: undefined }));
                    }}
                    placeholder="Masukkan jumlah..."
                    className="w-full glass-input rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-xs focus:outline-none text-ink font-mono font-bold"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickCashAmounts.map((cash) => (
                    <button
                      key={cash}
                      type="button"
                      onClick={() => { setAmountPaid(cash.toString()); setFormErrors(p => ({ ...p, payment: undefined })); }}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-[var(--radius-sm)] border border-white/40 hover:border-teal/20 bg-white/30 hover:bg-teal/5 text-ink-secondary transition-all duration-200"
                    >
                      Rp {cash.toLocaleString('id-ID')}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setAmountPaid(total.toString()); setFormErrors(p => ({ ...p, payment: undefined })); }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-[var(--radius-sm)] border border-teal/20 bg-teal/10 text-teal hover:bg-teal/15 transition-all duration-200"
                  >
                    Uang Pas
                  </button>
                </div>

                {formErrors.payment && (
                  <p className="text-[11px] text-error font-semibold flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" /> {formErrors.payment}
                  </p>
                )}

                {paidNum >= total && paidNum > 0 && (
                  <div className="flex items-center justify-between bg-success/8 border border-success/10 p-2.5 rounded-[var(--radius-sm)]">
                    <span className="text-[11px] font-bold text-success">Kembalian:</span>
                    <span className="text-xs font-black text-success font-mono">Rp {changeAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-[var(--radius-md)] border border-white/30 text-center space-y-2">
                <p className="text-[11px] text-teal font-bold uppercase tracking-wider font-mono">Pembayaran QRIS</p>
                <div className="w-24 h-24 bg-white/50 border border-white/40 rounded-[var(--radius-sm)] mx-auto flex items-center justify-center p-1 shadow-glass">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQV3fQc2_7jP3396p3hTid8k6U6r3U7YI9sU3XmP9Y_R9w_G8_X7S_U6c"
                    alt="QR Code pembayaran QRIS"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-ink-muted">Pembayaran otomatis divalidasi</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={isSubmitting || (paymentMethod === 'Cash' && paidNum < total)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] font-bold text-xs shadow-subtle transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                isSubmitting || (paymentMethod === 'Cash' && paidNum < total)
                  ? 'bg-white/20 text-ink-muted cursor-not-allowed border border-white/30'
                  : 'btn-gold-gradient'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Proses Pembayaran'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdTransactionDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleResetForm}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div
            className="glass-card-elevated w-full max-w-md p-6 text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-14 h-14 bg-success/10 rounded-full border border-success/15 flex items-center justify-center text-success">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 id="success-title" className="text-lg font-black text-ink tracking-tight">Pembayaran Berhasil!</h3>
              <p className="text-xs text-ink-muted mt-1">Transaksi telah tercatat</p>
            </div>

            <div className="bg-white/25 border border-white/30 rounded-[var(--radius-lg)] p-4 text-left text-xs space-y-2 backdrop-blur-sm">
              <div className="flex justify-between text-ink-muted">
                <span>No. Transaksi</span>
                <span className="font-mono font-bold text-ink">{createdTransactionId}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Pelanggan</span>
                <span className="font-bold text-ink truncate max-w-[150px]" title={createdTransactionDetail.customerName}>
                  {createdTransactionDetail.customerName}
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Total Bayar</span>
                <span className="font-bold text-teal font-mono">Rp {createdTransactionDetail.amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Metode</span>
                <span className="font-bold text-ink bg-white/30 px-2 py-0.5 rounded text-[11px] border border-white/30">{createdTransactionDetail.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-ink-muted border-t border-white/20 pt-2">
                <span>Waktu</span>
                <span className="text-ink-secondary">{createdTransactionDetail.date} • {createdTransactionDetail.time}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onSelectReceipt(createdTransactionId);
                  setShowSuccessModal(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius-md)] border border-white/40 bg-white/30 text-ink-secondary hover:bg-white/50 text-xs font-semibold shadow-subtle backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={handleResetForm}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius-md)] border border-success/15 bg-success/10 text-success hover:bg-success/15 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Transaksi Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
