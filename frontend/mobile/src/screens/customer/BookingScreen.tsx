import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import CalendarModal from '../../components/CalendarModal';

const SHIFTS = [
  { id: 'pagi', label: 'Pagi', time: '07.00 – 09.00' },
  { id: 'siang', label: 'Siang', time: '11.00 – 13.00' },
  { id: 'sore', label: 'Sore', time: '15.00 – 17.00' },
  { id: 'malam', label: 'Malam', time: '18.00 – 20.00' },
] as const;


const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

function formatDisplay(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function BookingScreen({ route, navigation }: any) {
  const { token, user } = useAuth();
  const preselected = route.params?.service;

  const [jenisLayanan, setJenisLayanan] = useState<'reguler' | 'express' | null>(null);
  const [alamat, setAlamat] = useState(user?.address || '');
  const [tanggal, setTanggal] = useState('');
  const [jamShift, setJamShift] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 13);



  const handleSubmit = useCallback(async () => {
    if (!jenisLayanan) return Alert.alert('Error', 'Pilih jenis layanan terlebih dahulu.');
    if (!alamat.trim()) return Alert.alert('Error', 'Alamat domisili wajib diisi.');
    if (!tanggal) return Alert.alert('Error', 'Pilih tanggal pengambilan.');
    if (!jamShift) return Alert.alert('Error', 'Pilih jam pengambilan.');

    setLoading(true);
    try {
      await api.createBooking(token!, {
        service: jenisLayanan === 'reguler' ? 'Kiloan Reguler' : 'Kiloan Express',
        date: tanggal,
        shift: SHIFTS.find((s) => s.id === jamShift)?.label || jamShift,
        address: alamat,
        notes: catatan,
        total: jenisLayanan === 'express' ? 9000 : 5000,
      });
      setSuccess(true);
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setLoading(false);
    }
  }, [jenisLayanan, alamat, tanggal, jamShift, catatan, token]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
              <Text style={styles.headerLabel}>Buat Pesanan</Text>
              <Text style={styles.headerTitle}>Pemesanan Laundry Kiloan</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: loading ? '80%' : '30%' },
              ]}
            />
          </View>
        </View>

        <View style={styles.body}>
          <Card>
            <CardHeader icon="👕" color={Colors.primary} label="Jenis Layanan" required />
            <View style={styles.layananRow}>
              {(['reguler', 'express'] as const).map((id) => {
                const active = jenisLayanan === id;
                const isExpress = id === 'express';
                return (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.layananCard,
                      {
                        backgroundColor: active ? (isExpress ? Colors.primary : Colors.secondary) : '#FAF7F2',
                        borderColor: active ? (isExpress ? Colors.primary : Colors.secondary) : Colors.border + '35',
                      },
                      active && styles.layananCardActive,
                    ]}
                    onPress={() => setJenisLayanan(id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.layananIconBox,
                        {
                          backgroundColor: active ? 'rgba(255,255,255,0.18)' : (isExpress ? Colors.primary + '12' : Colors.secondary + '12'),
                        },
                      ]}
                    >
                      <Text style={styles.layananIcon}>{isExpress ? '⚡' : '👕'}</Text>
                    </View>
                    <Text style={[styles.layananTitle, { color: active ? '#fff' : Colors.text }]}>
                      {id === 'reguler' ? 'Reguler' : 'Express'}
                    </Text>
                    <Text style={[styles.layananPrice, { color: active ? 'rgba(255,255,255,0.70)' : Colors.textMuted }]}>
                      {id === 'reguler' ? '2–3 hari · Rp 5k/kg' : '6 jam · Rp 9k/kg'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <CardHeader icon="📍" color={Colors.secondary} label="Alamat Domisili" required />
            <TextInput
              style={styles.textArea}
              placeholder="Masukkan alamat lengkap (nama jalan, nomor, kelurahan, kecamatan, kota)..."
              placeholderTextColor={Colors.textMuted}
              value={alamat}
              onChangeText={setAlamat}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Card>

          <Card>
            <CardHeader icon="📅" color={Colors.primary} label="Tanggal Pengambilan" required />
            <TouchableOpacity
              style={[styles.datePickerBtn, tanggal ? styles.datePickerBtnFilled : null]}
              onPress={() => setCalendarVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.datePickerIconBox}>
                <Text style={styles.datePickerIcon}>📅</Text>
              </View>
              <View style={styles.datePickerInfo}>
                <Text style={[styles.datePickerLabel, tanggal && styles.datePickerLabelFilled]}>
                  {tanggal ? formatDisplay(tanggal) : 'Pilih tanggal pengambilan'}
                </Text>
                {!tanggal && (
                  <Text style={styles.datePickerHint}>Ketuk untuk membuka kalender</Text>
                )}
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
          </Card>

          <Card>
            <CardHeader icon="⏰" color={Colors.secondary} label="Jam Pengambilan" required />
            <View style={styles.shiftList}>
              {SHIFTS.map((shift) => {
                const active = jamShift === shift.id;
                return (
                  <TouchableOpacity
                    key={shift.id}
                    style={[styles.shiftCard, active && styles.shiftCardActive]}
                    onPress={() => setJamShift(shift.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                      {active && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.shiftInfo}>
                      <Text style={[styles.shiftLabel, active && { color: '#fff' }]}>
                        {shift.label}
                      </Text>
                      <Text style={[styles.shiftTime, active && { color: 'rgba(255,255,255,0.60)' }]}>
                        {shift.time} WIB
                      </Text>
                    </View>
                    {active && (
                      <View style={styles.shiftBadge}>
                        <Text style={styles.shiftBadgeText}>DIPILIH</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <CardHeader icon="📷" color={Colors.primary} label="Foto Lokasi Penempatan Cucian" required />
            <Text style={styles.fotoHint}>
              Upload foto lokasi penempatan cucian untuk membantu kurir menemukan barang.
            </Text>
            <TouchableOpacity
              style={styles.fotoUploadArea}
              onPress={() => Alert.alert('Info', 'Fitur kamera akan menggunakan expo-image-picker')}
              activeOpacity={0.7}
            >
              <View style={styles.fotoUploadOption}>
                <Text style={styles.fotoUploadIcon}>📷</Text>
                <Text style={styles.fotoUploadText}>Kamera</Text>
              </View>
              <View style={[styles.fotoUploadOption, { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '50' }]}>
                <Text style={styles.fotoUploadIcon}>🖼️</Text>
                <Text style={styles.fotoUploadText}>Galeri</Text>
              </View>
            </TouchableOpacity>
          </Card>

          <Card>
            <CardHeader icon="📄" color={Colors.secondary} label="Catatan Tambahan" />
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
          </Card>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitBtnText}>  Memproses...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitBtnText}>Pesan Sekarang</Text>
                <Text style={styles.submitBtnArrow}>›</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsNote}>
            Dengan memesan, Anda menyetujui{' '}
            <Text style={styles.termsBold}>Syarat & Ketentuan</Text> Laundaja.
          </Text>
        </View>
      </ScrollView>

      {success && (
        <Animated.View style={styles.successOverlay}>
          <Animated.View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <Text style={styles.successIcon}>{'\u2713'}</Text>
            </View>
            <Text style={styles.successTitle}>Pesanan Diterima</Text>
            <Text style={styles.successDesc}>
              Pesanan kamu sedang menunggu konfirmasi dari tim kami.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => navigation.navigate('Status')}
              activeOpacity={0.85}
            >
              <Text style={styles.successBtnText}>Lihat Status Pesanan</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function CardHeader({
  icon,
  color,
  label,
  required,
}: {
  icon: string;
  color: string;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={styles.cardHeaderRow}>
      <View style={[styles.cardHeaderIconBox, { backgroundColor: color + '18' }]}>
        <Text style={styles.cardHeaderIcon}>{icon}</Text>
      </View>
      <Text style={styles.cardHeaderLabel}>
        {label}
        {required && <Text style={{ color: Colors.error }}> *</Text>}
      </Text>
    </View>
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
  layananRow: { flexDirection: 'row', gap: Spacing.md },
  layananCard: {
    flex: 1,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 6,
  },
  layananCardActive: {
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 14,
    elevation: 6,
  },
  layananIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layananIcon: { fontSize: 18 },
  layananTitle: { fontSize: 13, fontWeight: '700' },
  layananPrice: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
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
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: Colors.border + '30',
  },
  datePickerBtnFilled: {
    backgroundColor: Colors.secondary + '08',
    borderColor: Colors.secondary + '30',
  },
  datePickerIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerIcon: { fontSize: 18 },
  datePickerInfo: { flex: 1 },
  datePickerLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  datePickerLabelFilled: { color: Colors.text, fontWeight: '700' },
  datePickerHint: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  datePickerArrow: { fontSize: 18, color: Colors.textMuted, fontWeight: '300' },
  selectedDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary + '0C',
    borderWidth: 1,
    borderColor: Colors.secondary + '18',
    marginTop: Spacing.sm,
  },
  selectedDateText: { fontSize: 11, fontWeight: '600', color: Colors.text },
  shiftList: { gap: Spacing.sm },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: Colors.border + '30',
  },
  shiftCardActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: { borderColor: '#fff' },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  shiftInfo: { flex: 1 },
  shiftLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  shiftTime: { fontSize: 11, color: Colors.textMuted },
  shiftBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shiftBadgeText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.80)' },
  fotoHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  fotoUploadArea: { flexDirection: 'row', gap: Spacing.md },
  fotoUploadOption: {
    flex: 1,
    height: 90,
    borderRadius: 18,
    backgroundColor: Colors.secondary + '08',
    borderWidth: 2,
    borderColor: Colors.secondary + '30',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fotoUploadIcon: { fontSize: 22 },
  fotoUploadText: { fontSize: 11, fontWeight: '700', color: Colors.text },
  counter: { textAlign: 'right', fontSize: 10, color: Colors.textMuted, marginTop: 4 },
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
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    zIndex: 999,
  },
  successCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xxl + Spacing.lg,
    alignItems: 'center',
    ...Shadows.lg,
  },
  successIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary + '45',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  successDesc: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: Spacing.sm },
  successBtn: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  successBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
