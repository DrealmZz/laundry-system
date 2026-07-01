import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import Toast from '../../components/Toast';
import CalendarModal from '../../components/CalendarModal';

const CUCI_TYPES = [
  { id: 'cuci_saja', label: 'Cuci Saja', desc: 'Mesin cuci + deterjen gratis', icon: '🧺', price: 20000 },
  { id: 'cuci_kering', label: 'Cuci + Kering', desc: 'Cuci + mesin pengering', icon: '🔄', price: 20000 },
] as const;

const TIPE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  tersedia: { label: 'Tersedia', color: '#166534', bg: '#EDFAF4' },
  dipakai: { label: 'Dipakai', color: '#D97706', bg: '#FFFBEB' },
  perbaikan: { label: 'Perbaikan', color: '#DC2626', bg: '#FEF2F2' },
};

export default function BookingKoinScreen({ navigation }: any) {
  const { token } = useAuth();

  const [machines, setMachines] = useState<any[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [jadwalLoading, setJadwalLoading] = useState(false);

  const [toast, setToast] = useState({ message: '', visible: false });

  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  const [tanggal, setTanggal] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jenisCuci, setJenisCuci] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 13);

  const dateOptions: Date[] = [today];
  for (let i = 1; i <= 2; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dateOptions.push(d);
  }

  const fetchAvailableRef = useRef(false);

  useEffect(() => {
    if (!tanggal || !jamMulai) {
      setMachines([]);
      setSelectedMachine(null);
      setLoadingMachines(false);
      return;
    }

    setLoadingMachines(true);
    setSelectedMachine(null);
    fetchAvailableRef.current = true;
    const refId = fetchAvailableRef.current;

    api.getAvailableMachines(token!, tanggal, jamMulai).then((data: any) => {
      if (refId !== fetchAvailableRef.current) return;
      setMachines(data);
      setLoadingMachines(false);
    }).catch(() => {
      if (refId !== fetchAvailableRef.current) return;
      setMachines([]);
      setLoadingMachines(false);
    });
  }, [tanggal, jamMulai, token]);

  const toISO = (d: Date) => d.toISOString().split('T')[0];

  const formatDisplay = (d: Date) => {
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    const dayName = dayNames[d.getDay()];
    const date = d.getDate();
    const month = monthNames[d.getMonth()];
    return `${dayName}, ${date} ${month}`;
  };

  const isToday = (d: Date) => toISO(d) === toISO(new Date());

  const selectedMachineData = machines.find((m: any) => m.id_mesin === selectedMachine);

  const selectedCuciData = CUCI_TYPES.find((c) => c.id === jenisCuci);

  const totalHarga = selectedCuciData ? selectedCuciData.price : 0;

  const validateJam = (time: string): boolean => {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return false;
    const [_, h, m] = match;
    return parseInt(h) >= 0 && parseInt(h) <= 23 && parseInt(m) >= 0 && parseInt(m) <= 59;
  };

  const isJamValid = (time: string): boolean => {
    if (!validateJam(time)) return false;
    const [h, m] = time.split(':').map(Number);
    const now = new Date();
    const selected = new Date(tanggal + 'T' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00');
    const diffMs = selected.getTime() - now.getTime();
    return diffMs >= 3600000;
  };

  const showToast = (message: string) => setToast({ message, visible: true });

  const handleSubmit = useCallback(async () => {
    if (!selectedMachine) return showToast('Pilih mesin terlebih dahulu');
    if (!tanggal) return showToast('Pilih tanggal pemakaian');
    if (!jamMulai) return showToast('Masukkan jam pemakaian');
    if (!validateJam(jamMulai)) return showToast('Format jam HH:MM — contoh 14:30');
    if (!isJamValid(jamMulai)) return showToast('Jam pemakaian minimal 1 jam dari sekarang');
    if (!jenisCuci) return showToast('Pilih jenis pencucian');

    setSubmitting(true);
    try {
      await api.createBooking(token!, {
        id_layanan: 3,
        id_mesin: selectedMachine,
        jenis_pencucian: 'koin',
        jenis_cuci: jenisCuci,
        tanggal_pesanan: tanggal,
        shift: jamMulai,
        metode_pengambilan: 'ambil_sendiri',
        catatan: catatan,
        total: totalHarga,
        service: 'Koin / Self-Service',
      });
      setSuccess(true);
    } catch (e: any) {
      showToast(e.message || 'Gagal memproses pesanan');
    } finally {
      setSubmitting(false);
    }
  }, [selectedMachine, tanggal, jamMulai, jenisCuci, catatan, token, totalHarga]);

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <Text style={styles.successIcon}>🫧</Text>
        </View>
        <Text style={styles.successTitle}>Booking Mesin Berhasil!</Text>
        <Text style={styles.successDesc}>
          Silakan datang ke outlet pada jadwal yang dipilih.
        </Text>
        <View style={styles.successBadge}>
          <View style={styles.successDot} />
          <View>
            <Text style={styles.successBadgeTitle}>Menunggu Konfirmasi</Text>
            <Text style={styles.successBadgeSub}>
              Tim kami akan menyiapkan mesin untuk Anda
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Status' })}
          activeOpacity={0.85}
        >
          <Text style={styles.successBtnText}>Lihat Status Booking</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast({ message: '', visible: false })}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.decoCircle} />
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerLabel}>Booking Mesin</Text>
              <Text style={styles.headerTitle}>Laundry Koin Self-Service</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: submitting ? '80%' : '25%' }]} />
          </View>
        </View>

        <View style={styles.body}>
          {/* Date Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardHeaderIconBox, { backgroundColor: Colors.primary + '18' }]}>
                <Text style={styles.cardHeaderIcon}>📅</Text>
              </View>
              <Text style={styles.cardHeaderLabel}>Tanggal Pemakaian *</Text>
            </View>
            <View style={styles.dateRow}>
              {dateOptions.map((d) => {
                const iso = toISO(d);
                const selected = tanggal === iso;
                const todayFlag = isToday(d);
                return (
                  <TouchableOpacity
                    key={iso}
                    style={[
                      styles.dateCard,
                      selected && { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
                      !selected && todayFlag && { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '35' },
                    ]}
                    onPress={() => setTanggal(iso)}
                    activeOpacity={0.7}
                  >
                    {todayFlag && (
                      <Text style={[styles.dateTodayTag, { color: selected ? 'rgba(255,255,255,0.7)' : Colors.primary }]}>
                        HARI INI
                      </Text>
                    )}
                    <Text style={[styles.dateDayNum, { color: selected ? '#fff' : Colors.text }]}>
                      {d.getDate()}
                    </Text>
                    <Text style={[styles.dateMonth, { color: selected ? 'rgba(255,255,255,0.7)' : Colors.textMuted }]}>
                      {formatDisplay(d).split(',')[1]?.trim() || ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.datePickerBtn, tanggal && !dateOptions.some((d) => toISO(d) === tanggal) ? styles.datePickerBtnFilled : null]}
              onPress={() => setCalendarVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.datePickerIconBox}>
                <Text style={styles.datePickerIcon}>📅</Text>
              </View>
              <View style={styles.datePickerInfo}>
                <Text style={[styles.datePickerLabel, tanggal && styles.datePickerLabelFilled]}>
                  {tanggal ? formatDisplay(new Date(tanggal + 'T00:00:00')) : 'Pilih tanggal lain'}
                </Text>
                <Text style={styles.datePickerHint}>Ketuk untuk membuka kalender</Text>
              </View>
              <Text style={styles.datePickerArrow}>›</Text>
            </TouchableOpacity>

            <CalendarModal
              visible={calendarVisible}
              selected={tanggal}
              onSelect={setTanggal}
              onClose={() => setCalendarVisible(false)}
              minDate={today}
              maxDate={maxDate}
            />
          </View>

          {/* Shift Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardHeaderIconBox, { backgroundColor: Colors.secondary + '18' }]}>
                <Text style={styles.cardHeaderIcon}>⏰</Text>
              </View>
              <Text style={styles.cardHeaderLabel}>Jam Pemakaian *</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="cth: 14:30"
                placeholderTextColor={Colors.textMuted}
                value={jamMulai}
                onChangeText={setJamMulai}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
            {jamMulai !== '' && !validateJam(jamMulai) && (
              <Text style={styles.errorText}>Format HH:MM (contoh: 14:30)</Text>
            )}
            {jamMulai !== '' && validateJam(jamMulai) && !isJamValid(jamMulai) && (
              <Text style={styles.errorText}>Minimal 1 jam dari sekarang</Text>
            )}
          </View>

          {/* Machine Selection — muncul setelah tanggal & shift dipilih */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardHeaderIconBox, { backgroundColor: Colors.secondary + '18' }]}>
                <Text style={styles.cardHeaderIcon}>🫧</Text>
              </View>
              <Text style={styles.cardHeaderLabel}>Pilih Mesin *</Text>
            </View>

            {!tanggal || !jamMulai ? (
              <View style={styles.machinePlaceholder}>
                <Text style={styles.machinePlaceholderIcon}>📋</Text>
                <Text style={styles.machinePlaceholderTitle}>Pilih jadwal terlebih dahulu</Text>
                <Text style={styles.machinePlaceholderDesc}>
                  Pilih tanggal dan jam pemakaian di atas untuk melihat mesin yang tersedia.
                </Text>
              </View>
            ) : loadingMachines ? (
              <View style={{ paddingVertical: Spacing.xxl }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Mencari mesin tersedia...</Text>
              </View>
            ) : machines.length === 0 ? (
              <View style={styles.machinePlaceholder}>
                <Text style={styles.machinePlaceholderIcon}>🔴</Text>
                <Text style={styles.machinePlaceholderTitle}>Tidak ada mesin tersedia</Text>
                <Text style={styles.machinePlaceholderDesc}>
                  Semua mesin sudah dipesan untuk jadwal ini. Silakan pilih jadwal lain.
                </Text>
              </View>
            ) : (
              <View style={styles.machineList}>
                {machines.map((m: any) => {
                  const isSelected = selectedMachine === m.id_mesin;

                  return (
                    <TouchableOpacity
                      key={m.id_mesin}
                      style={[
                        styles.machineCard,
                        isSelected && styles.machineCardSelected,
                      ]}
                      onPress={() => setSelectedMachine(m.id_mesin)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.machineInfo}>
                        <Text style={[styles.machineName, isSelected && { color: '#fff' }]}>
                          {m.nama_mesin}
                        </Text>
                        <Text style={[styles.machineDetail, isSelected && { color: 'rgba(255,255,255,0.6)' }]}>
                          {m.kode_mesin} · Max {m.kapasitas_kg} kg
                        </Text>
                      </View>
                      <View style={[styles.machineStatusBadge, { backgroundColor: '#EDFAF4' }]}>
                        <Text style={[styles.machineStatusText, { color: '#166534' }]}>
                          Tersedia
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Cuci Type Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardHeaderIconBox, { backgroundColor: Colors.primary + '18' }]}>
                <Text style={styles.cardHeaderIcon}>🧺</Text>
              </View>
              <Text style={styles.cardHeaderLabel}>Jenis Pencucian *</Text>
            </View>
            <View style={styles.cuciRow}>
              {CUCI_TYPES.map((c) => {
                const active = jenisCuci === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.cuciCard, active && styles.cuciCardActive]}
                    onPress={() => setJenisCuci(c.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.cuciIconBox, active && { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                      <Text style={styles.cuciIcon}>{c.icon}</Text>
                    </View>
                    <Text style={[styles.cuciLabel, active && { color: '#fff' }]}>
                      {c.label}
                    </Text>
                    <Text style={[styles.cuciDesc, active && { color: 'rgba(255,255,255,0.6)' }]}>
                      {c.desc}
                    </Text>
                    <Text style={[styles.cuciPrice, active && { color: '#fff' }]}>
                      Rp{c.price.toLocaleString('id-ID')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardHeaderIconBox, { backgroundColor: Colors.secondary + '18' }]}>
                <Text style={styles.cardHeaderIcon}>📄</Text>
              </View>
              <Text style={styles.cardHeaderLabel}>Catatan Tambahan</Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Tambahkan informasi khusus jika diperlukan."
              placeholderTextColor={Colors.textMuted}
              value={catatan}
              onChangeText={setCatatan}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{catatan.length}/300</Text>
          </View>

          {/* Summary */}
          {selectedMachine && tanggal && validateJam(jamMulai) && isJamValid(jamMulai) && jenisCuci && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Ringkasan Booking</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mesin</Text>
                <Text style={styles.summaryValue}>{selectedMachineData?.nama_mesin || '-'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tanggal</Text>
                <Text style={styles.summaryValue}>{tanggal ? formatDisplay(new Date(tanggal + 'T00:00:00')) : '-'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jam</Text>
                <Text style={styles.summaryValue}>{jamMulai || '-'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Layanan</Text>
                <Text style={styles.summaryValue}>{selectedCuciData?.label || '-'}</Text>
              </View>
              <View style={[styles.summaryDivider, { marginBottom: Spacing.sm }]} />
              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>Rp{totalHarga.toLocaleString('id-ID')}</Text>
              </View>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitBtnText}>  Memproses...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitBtnText}>Booking Mesin Sekarang</Text>
                <Text style={styles.submitBtnArrow}>›</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsNote}>
            Dengan melakukan booking, Anda menyetujui{' '}
            <Text style={styles.termsBold}>Syarat & Ketentuan</Text> Laundaja.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 52,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  decoCircle: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 20, color: '#fff' },
  headerTextWrap: { flex: 1 },
  headerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: Colors.primary,
  },
  body: { padding: Spacing.lg, gap: 14 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border + '22',
    padding: Spacing.lg,
    ...Shadows.md,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  cardHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderIcon: { fontSize: 16 },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#A89880',
  },
  machineList: { gap: Spacing.sm },
  machineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: Colors.border + '25',
  },
  machineCardSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  machineCardDisabled: { opacity: 0.5 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#fff' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  machineInfo: { flex: 1 },
  machineName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  machineDetail: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  machineStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  machineStatusText: { fontSize: 9, fontWeight: '700' },
  machinePlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  machinePlaceholderIcon: { fontSize: 28, marginBottom: 4 },
  machinePlaceholderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  machinePlaceholderDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  availableInfo: {
    marginTop: Spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#EDFAF4',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  availableInfoText: { fontSize: 11, fontWeight: '600', color: '#166534' },
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  dateCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border + '30',
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    gap: 4,
  },
  dateTodayTag: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  dateDayNum: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  dateMonth: { fontSize: 11, fontWeight: '600' },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: Colors.border + '30',
    marginTop: Spacing.sm,
  },
  datePickerBtnFilled: {
    backgroundColor: Colors.secondary + '08',
    borderColor: Colors.secondary + '30',
  },
  datePickerIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerIcon: { fontSize: 16 },
  datePickerInfo: { flex: 1 },
  datePickerLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  datePickerLabelFilled: { color: Colors.text, fontWeight: '700' },
  datePickerHint: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  datePickerArrow: { fontSize: 18, color: Colors.textMuted, fontWeight: '300' },
  cuciRow: { flexDirection: 'row', gap: Spacing.md },
  cuciCard: {
    flex: 1,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border + '30',
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    gap: 6,
  },
  cuciCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 14,
    elevation: 6,
  },
  cuciIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuciIcon: { fontSize: 20 },
  cuciLabel: { fontSize: 13, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  cuciDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', lineHeight: 14 },
  cuciPrice: { fontSize: 14, fontWeight: '800', color: Colors.secondary, marginTop: 4 },
  textArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border + '35',
    backgroundColor: '#FAF7F2',
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    minHeight: 80,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  counter: { textAlign: 'right', fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  summaryCard: {
    backgroundColor: Colors.secondary + '08',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.secondary + '20',
    padding: Spacing.lg,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 12, color: Colors.textMuted },
  summaryValue: { fontSize: 12, fontWeight: '600', color: Colors.text },
  summaryDivider: { height: 1, backgroundColor: Colors.secondary + '15', marginVertical: 4 },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  summaryTotalLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  submitBtnArrow: { fontSize: 19, color: '#fff', fontWeight: '300' },
  termsNote: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: Spacing.md,
  },
  termsBold: { fontWeight: '600', color: Colors.text },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.xl,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: Colors.primary + '25',
    borderWidth: 2,
    borderColor: Colors.primary + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: { fontSize: 40 },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  successDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
  },
  successDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  successBadgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  successBadgeSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  successBtn: {
    width: '100%',
    height: 52,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(35,57,91,0.10)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  errorText: {
    fontSize: 10,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 2,
  },
});
