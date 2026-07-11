import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import CalendarModal from '../../components/CalendarModal';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/format';

const SHIFTS = [
  { value: 'pagi',   label: 'Pagi',   time: '08.00 - 12.00' },
  { value: 'siang',  label: 'Siang',  time: '12.00 - 16.00' },
  { value: 'sore',   label: 'Sore',   time: '16.00 - 20.00' },
  { value: 'malam',  label: 'Malam',  time: '20.00 - 23.00' },
];

const STATUS_ORDER = [
  'menunggu konfirmasi',
  'disetujui',
  'penjemputan',
  'penimbangan',
  'menunggu pembayaran',
  'sudah dibayar',
  'diproses',
  'sedang di cuci',
  'sedang di keringkan',
  'sedang di setrika',
  'pencucian selesai',
  'pengiriman',
  'selesai',
];

// Warna konsisten (coklat)
const ACTIVE_COLOR = '#A87A4E';   // Coklat gelap
const INACTIVE_COLOR = '#E8DFD0'; // Cream gelap

// Label untuk setiap status
const STATUS_LABELS: Record<string, string> = {
  'menunggu konfirmasi': 'Menunggu Konfirmasi',
  'disetujui': 'Disetujui',
  'penjemputan': 'Penjemputan',
  'penimbangan': 'Penimbangan',
  'menunggu pembayaran': 'Menunggu Bayar',
  'sudah dibayar': 'Sudah Dibayar',
  'diproses': 'Diproses',
  'sedang di cuci': 'Sedang Dicuci',
  'sedang di keringkan': 'Sedang Dikeringkan',
  'sedang di setrika': 'Sedang Disetrika',
  'pencucian selesai': 'Cucian Selesai',
  'pengiriman': 'Pengiriman',
  'selesai': 'Selesai',
};

// Deskripsi untuk setiap status
const STATUS_DESCRIPTIONS: Record<string, string> = {
  'menunggu konfirmasi': 'Pesanan kamu sedang menunggu konfirmasi dari tim kami',
  'disetujui': 'Tim kami sudah menyetujui pesanan kamu',
  'penjemputan': 'Kurir sedang dalam perjalanan untuk menjemput pakaian',
  'penimbangan': 'Pakaian sedang ditimbang untuk menghitung biaya',
  'menunggu pembayaran': 'Silakan lakukan pembayaran',
  'sudah dibayar': 'Pembayaran berhasil, pesanan akan segera diproses',
  'diproses': 'Pesanan sedang diproses',
  'sedang di cuci': 'Cucian kamu sedang dalam proses pencucian',
  'sedang di keringkan': 'Cucian kamu sedang dalam proses pengeringan',
  'sedang di setrika': 'Cucian kamu sedang dalam proses setrika',
  'pencucian selesai': 'Cucian kamu sudah selesai diproses',
  'pengiriman': 'Pakaian sedang dalam perjalanan ke alamat Anda',
  'selesai': 'Pesanan sudah selesai dan sudah diterima',
};

const KOIN_STATUS_ORDER = [
  'menunggu konfirmasi',
  'disetujui',
  'menunggu pembayaran',
  'sudah dibayar',
  'selesai',
];

const KOIN_STATUS_LABELS: Record<string, string> = {
  'menunggu konfirmasi': 'Menunggu Konfirmasi',
  'disetujui': 'Disetujui',
  'menunggu pembayaran': 'Menunggu Bayar',
  'sudah dibayar': 'Sudah Dibayar',
  'selesai': 'Selesai',
};

const KOIN_STATUS_DESCRIPTIONS: Record<string, string> = {
  'menunggu konfirmasi': 'Pesanan kamu sedang menunggu konfirmasi dari tim kami',
  'disetujui': 'Tim kami sudah menyetujui pesanan kamu. Silakan datang ke outlet untuk pembayaran',
  'menunggu pembayaran': 'Silakan lakukan pembayaran di outlet',
  'sudah dibayar': 'Pembayaran berhasil. Kamu bisa menggunakan mesin cuci',
  'selesai': 'Pemesanan selesai',
};

export default function TrackingScreen({ route, navigation }: any) {
  const item = route.params?.item;
  if (!item) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Data pesanan tidak ditemukan</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#5B4ECC' }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const currentStatus = item.status_pesanan || item.status;
  const isKoin = item.jenis_pencucian === 'koin';
  const statusOrder = isKoin ? KOIN_STATUS_ORDER : STATUS_ORDER;
  const statusLabels = isKoin ? KOIN_STATUS_LABELS : STATUS_LABELS;
  const statusDescs = isKoin ? KOIN_STATUS_DESCRIPTIONS : STATUS_DESCRIPTIONS;
  const currentIdx = statusOrder.indexOf(currentStatus);
  const [cancelling, setCancelling] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alamatConfirmed, setAlamatConfirmed] = useState(false);
  const alamat = item.customer_alamat || item.alamat || item.address || '';

  const handleSetDelivery = async () => {
    if (!selectedDate) {
      Alert.alert('Lengkapi Data', 'Pilih tanggal pengiriman');
      return;
    }
    if (!selectedShift) {
      Alert.alert('Lengkapi Data', 'Pilih shift pengiriman');
      return;
    }
    if (!alamatConfirmed) {
      Alert.alert('Konfirmasi Alamat', 'Centang konfirmasi alamat terlebih dahulu');
      return;
    }
    setSubmitting(true);
    try {
      await api.setDeliverySchedule(item.id_pemesanan || item.id, selectedDate, selectedShift);
      Alert.alert('Berhasil', 'Jadwal pengiriman berhasil disimpan');
      setShowDeliveryModal(false);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Gagal menyimpan jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Batalkan Pesanan',
      'Apakah Anda yakin ingin membatalkan pesanan ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await api.cancelBooking(item.id_pemesanan || item.id, 'Dibatalkan oleh customer');
              Alert.alert('Berhasil', 'Pesanan berhasil dibatalkan');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Gagal', error.message || 'Gagal membatalkan pesanan');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Tracking Pesanan</Text>
          <Text style={styles.headerSub}>{item.nama_layanan || item.service}</Text>
        </View>
        <StatusBadge status={currentStatus} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informasi Pesanan</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Pesanan</Text>
            <Text style={styles.infoValue}>#{item.id_pemesanan || item.id}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Layanan</Text>
            <Text style={styles.infoValue}>{item.nama_layanan || item.service}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{item.tanggal_pesanan || item.date || '-'}</Text>
          </View>
          {item.shift ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jam</Text>
                <Text style={styles.infoValue}>{item.shift}</Text>
              </View>
            </>
          ) : null}
          {(item.berat_kg || item.weight) ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Berat</Text>
                <Text style={styles.infoValue}>{item.berat_kg || item.weight} kg</Text>
              </View>
            </>
          ) : null}
          {(item.alamat || item.address) ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alamat</Text>
                <Text style={styles.infoValue}>{item.alamat || item.address}</Text>
              </View>
            </>
          ) : null}
          {item.total ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total</Text>
                <Text style={styles.infoValueBold}>{formatCurrency(item.total || 0)}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Status Pesanan</Text>
          <View style={styles.timeline}>
            {statusOrder.map((s, i) => {
              const isActive = i <= currentIdx;
              const label = statusLabels[s] || s;
              const desc = statusDescs[s] || '';
              const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
              const isLast = i === statusOrder.length - 1;
              const isCurrent = i === currentIdx;

              return (
                <View key={s} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: color }]} />
                    {!isLast && (
                      <View style={[styles.timelineLine, { backgroundColor: color }]} />
                    )}
                  </View>
                  <View style={[styles.timelineRight, isCurrent && styles.timelineRightActive]}>
                    <Text style={[styles.timelineLabel, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR, fontWeight: isActive ? '700' : '400' }]}>
                      {label}
                    </Text>
                    <Text style={[styles.timelineDesc, { color: isActive ? Colors.textSecondary : Colors.textMuted }]}>
                      {desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {currentStatus === 'menunggu pembayaran' && !isKoin && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() =>
              navigation.navigate('QrisPayment', {
                bookingId: item.id_pemesanan || item.id,
                total: item.total,
                serviceName: item.nama_layanan || item.service,
                bookingDate: item.tanggal_pesanan || item.date,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.payBtnText}>Bayar Sekarang (QRIS)</Text>
          </TouchableOpacity>
        )}

        {(currentStatus === 'menunggu konfirmasi' || currentStatus === 'disetujui') && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>
              {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
            </Text>
          </TouchableOpacity>
        )}

        {currentStatus === 'pencucian selesai' && !isKoin && item.metode_pengambilan === 'pengiriman' && (
          <TouchableOpacity
            style={styles.deliveryBtn}
            onPress={() => setShowDeliveryModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.deliveryBtnText}>Atur Jadwal Pengiriman</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={showDeliveryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeliveryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atur Jadwal Pengiriman</Text>

            <View style={styles.addressWarningBox}>
              <Text style={styles.addressWarningIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressWarningTitle}>Periksa Alamat Tujuan</Text>
                <Text style={styles.addressText}>
                  {alamat || 'Alamat tidak tersedia'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.alamatCheckbox}
              onPress={() => setAlamatConfirmed(!alamatConfirmed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, alamatConfirmed && styles.checkboxActive]}>
                {alamatConfirmed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.alamatCheckboxLabel}>
                Saya sudah memastikan alamat di atas sudah benar
              </Text>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Tanggal Pengiriman</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setCalendarVisible(true)}
            >
              <Text style={[styles.datePickerText, !selectedDate && styles.datePickerPlaceholder]}>
                {selectedDate || 'Pilih tanggal'}
              </Text>
            </TouchableOpacity>

            <CalendarModal
              visible={calendarVisible}
              selected={selectedDate}
              onSelect={setSelectedDate}
              onClose={() => setCalendarVisible(false)}
              minDate={new Date()}
            />

            <Text style={styles.fieldLabel}>Shift (Waktu Pengiriman)</Text>
            <View style={styles.shiftRow}>
              {SHIFTS.map((s) => {
                const isActive = selectedShift === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.shiftBtn, isActive && styles.shiftBtnActive]}
                    onPress={() => setSelectedShift(s.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.shiftBtnText, isActive && styles.shiftBtnTextActive]}>
                      {s.label}
                    </Text>
                    <Text style={[styles.shiftTimeText, isActive && styles.shiftTimeTextActive]}>
                      {s.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowDeliveryModal(false);
                  setSelectedDate('');
                  setSelectedShift(null);
                  setAlamatConfirmed(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, submitting && styles.modalConfirmBtnDisabled]}
                onPress={handleSetDelivery}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmBtnText}>
                  {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: '#fff' },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  infoTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoLabel: { ...Typography.caption, color: Colors.textMuted },
  infoValue: { ...Typography.body, fontWeight: '500' },
  infoValueBold: { ...Typography.bodyBold, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  timelineTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  timeline: { gap: 0 },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 64,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 32,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: Spacing.md,
  },
  timelineRightActive: {
    backgroundColor: Colors.secondary + '08',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginLeft: -Spacing.md,
  },
  timelineLabel: {
    ...Typography.bodyBold,
    fontSize: 14,
  },
  timelineDesc: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  payBtn: {
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  payBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  deliveryBtn: {
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  deliveryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  addressWarningBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addressWarningIcon: { fontSize: 18 },
  addressWarningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  alamatCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: { fontSize: 14, fontWeight: '700', color: '#fff' },
  alamatCheckboxLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  datePickerBtn: {
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  datePickerText: {
    fontSize: 14,
    color: Colors.text,
  },
  datePickerPlaceholder: {
    color: Colors.textMuted,
  },
  shiftRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  shiftBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  shiftBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  shiftBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  shiftBtnTextActive: {
    color: Colors.primaryDark,
  },
  shiftTimeText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  shiftTimeTextActive: {
    color: Colors.primaryDark,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  modalConfirmBtnDisabled: {
    opacity: 0.6,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
