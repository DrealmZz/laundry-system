import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import CalendarModal from '../../components/CalendarModal';

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
  'menunggu konfirmasi': 'Menunggu',
  'disetujui': 'Disetujui',
  'penjemputan': 'Dijemput',
  'penimbangan': 'Ditimbang',
  'menunggu pembayaran': 'Bayar',
  'sudah dibayar': 'Dibayar',
  'diproses': 'Diproses',
  'sedang di cuci': 'Dicuci',
  'sedang di keringkan': 'Dikeringkan',
  'sedang di setrika': 'Disetrika',
  'pencucian selesai': 'Selesai Cuci',
  'pengiriman': 'Dikirim',
  'selesai': 'Selesai',
};

function Timeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <View style={styles.timeline}>
      {STATUS_ORDER.map((s, i) => {
        const isActive = i <= currentIdx;
        const label = STATUS_LABELS[s] || s;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        const isLast = i === STATUS_ORDER.length - 1;

        return (
          <View key={s} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: color }]} />
              {!isLast && (
                <View style={[styles.timelineLine, { backgroundColor: color }]} />
              )}
            </View>
            <Text style={[styles.timelineLabel, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function StatusScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleShift, setScheduleShift] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const fetchBookings = async () => {
    try {
      const data: any = await api.getBookings();
      const items = data.items || data;
      const active = items.filter(
        (b: any) => b.status_pesanan !== 'selesai' 
          && b.status_pesanan !== 'pesanan ditolak'
          && b.status_pesanan !== 'pesanan dibatalkan',
      );
      setBookings(active);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: number) => {
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
              setCancellingId(bookingId);
              await api.cancelBooking(bookingId, 'Dibatalkan oleh customer');
              Alert.alert('Berhasil', 'Pesanan berhasil dibatalkan');
              fetchBookings();
            } catch (error: any) {
              Alert.alert('Gagal', error.message || 'Gagal membatalkan pesanan');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSetSchedule = async () => {
    if (!selectedBooking || !scheduleDate || !scheduleShift) {
      Alert.alert('Error', 'Pilih tanggal dan shift pengiriman.');
      return;
    }

    try {
      await api.setDeliverySchedule(
        selectedBooking.id_pemesanan || selectedBooking.id,
        scheduleDate,
        scheduleShift
      );
      Alert.alert('Berhasil', 'Jadwal pengiriman berhasil disimpan.');
      setScheduleModalVisible(false);
      setSelectedBooking(null);
      setScheduleDate('');
      setScheduleShift(null);
      fetchBookings();
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Gagal menyimpan jadwal');
    }
  };

  const handleConfirmReceived = async (bookingId: number) => {
    Alert.alert(
      'Konfirmasi Penerimaan',
      'Apakah Anda sudah menerima pesanan ini?',
      [
        { text: 'Belum', style: 'cancel' },
        {
          text: 'Ya, Sudah Diterima',
          onPress: async () => {
            try {
              await api.confirmReceived(bookingId);
              Alert.alert('Berhasil', 'Pesanan berhasil dikonfirmasi diterima.');
              fetchBookings();
            } catch (error: any) {
              Alert.alert('Gagal', error.message || 'Gagal konfirmasi');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status Cucian</Text>
        <Text style={styles.headerSub}>
          Pantau perkembangan cucian Anda
        </Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(i) => String(i.id_pemesanan || i.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => (navigation as any).navigate('Tracking', { item })}>
          <Card style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderService}>{item.nama_layanan || item.service}</Text>
              <StatusBadge status={item.status_pesanan || item.status} isActive={true} />
            </View>

            <View style={styles.orderMetaRow}>
              <Text style={styles.orderMeta}>{item.tanggal_pesanan || item.date}</Text>
              {item.shift && <Text style={styles.orderMeta}>{item.shift}</Text>}
              {item.berat_kg && (
                <Text style={styles.orderMeta}>{item.berat_kg} kg</Text>
              )}
            </View>

            <View style={styles.divider} />

            <Timeline status={item.status_pesanan || item.status} />

            {(item.status_pesanan || item.status) === 'menunggu pembayaran' && (
              <>
                {item.berat_kg && (
                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Berat:</Text>
                      <Text style={styles.infoValue}>{item.berat_kg} kg</Text>
                    </View>
                    {item.harga && (
                      <>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Harga/kg:</Text>
                          <Text style={styles.infoValue}>Rp {parseFloat(item.harga).toLocaleString('id-ID')}</Text>
                        </View>
                        <View style={[styles.infoRow, styles.infoTotal]}>
                          <Text style={styles.infoTotalLabel}>Total:</Text>
                          <Text style={styles.infoTotalValue}>
                            Rp {(parseFloat(item.harga) * parseFloat(item.berat_kg)).toLocaleString('id-ID')}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                )}
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() =>
                    (navigation as any).navigate('QrisPayment', {
                      bookingId: item.id_pemesanan || item.id,
                      total: item.total || (parseFloat(item.harga) * parseFloat(item.berat_kg)),
                      serviceName: item.nama_layanan || item.service,
                      bookingDate: item.tanggal_pesanan || item.date,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.payBtnText}>Bayar Sekarang (QRIS)</Text>
                </TouchableOpacity>
              </>
            )}

            {(item.status_pesanan || item.status) === 'pencucian selesai' && 
             item.metode_pengambilan === 'pengiriman' && (
              <TouchableOpacity
                style={styles.scheduleBtn}
                onPress={() => {
                  setSelectedBooking(item);
                  setScheduleModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.scheduleBtnText}>Pilih Jadwal Pengiriman</Text>
              </TouchableOpacity>
            )}

            {(item.status_pesanan || item.status) === 'pengiriman' && (
              <>
                {item.tanggal_pengiriman && (
                  <View style={styles.deliveryInfoBox}>
                    <Text style={styles.deliveryInfoTitle}>Jadwal Pengiriman</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Tanggal:</Text>
                      <Text style={styles.infoValue}>{item.tanggal_pengiriman}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Shift:</Text>
                      <Text style={[styles.infoValue, {textTransform: 'capitalize'}]}>{item.shift_pengiriman}</Text>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => handleConfirmReceived(item.id_pemesanan || item.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmBtnText}>Sudah Diterima</Text>
                </TouchableOpacity>
              </>
            )}

            {((item.status_pesanan || item.status) === 'menunggu konfirmasi' || 
              (item.status_pesanan || item.status) === 'disetujui') && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item.id_pemesanan || item.id)}
                disabled={cancellingId === (item.id_pemesanan || item.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>
                  {cancellingId === (item.id_pemesanan || item.id) ? 'Membatalkan...' : 'Batalkan Pesanan'}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="Tidak ada pesanan aktif"
            message="Anda belum memiliki pesanan yang sedang diproses"
          />
        }
      />

      {/* Schedule Modal */}
      <Modal
        visible={scheduleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Jadwal Pengiriman</Text>
            
            <Text style={styles.fieldLabel}>Tanggal Pengiriman</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setCalendarVisible(true)}
            >
              <Text style={[styles.datePickerText, !scheduleDate && styles.datePickerPlaceholder]}>
                {scheduleDate || 'Pilih tanggal'}
              </Text>
            </TouchableOpacity>

            <CalendarModal
              visible={calendarVisible}
              selected={scheduleDate}
              onSelect={setScheduleDate}
              onClose={() => setCalendarVisible(false)}
              minDate={new Date()}
            />

            <Text style={styles.fieldLabel}>Shift Pengiriman</Text>
            <View style={styles.shiftRow}>
              {['pagi', 'siang', 'sore', 'malam'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.shiftBtn,
                    scheduleShift === s && styles.shiftBtnActive,
                  ]}
                  onPress={() => setScheduleShift(s)}
                >
                  <Text
                    style={[
                      styles.shiftBtnText,
                      scheduleShift === s && styles.shiftBtnTextActive,
                    ]}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setScheduleModalVisible(false);
                  setSelectedBooking(null);
                  setScheduleDate('');
                  setScheduleShift(null);
                }}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSetSchedule}
              >
                <Text style={styles.modalConfirmBtnText}>Simpan</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  list: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  orderCard: {
    marginBottom: Spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderService: {
    ...Typography.h3,
    flex: 1,
    marginRight: Spacing.sm,
  },
  orderMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderMeta: {
    ...Typography.caption,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 36,
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
    minHeight: 16,
  },
  timelineLabel: {
    ...Typography.body,
    paddingTop: 0,
  },
  payBtn: {
    marginTop: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  payBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    marginTop: Spacing.sm,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  infoBox: {
    backgroundColor: Colors.secondary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  infoTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border + '30',
    paddingTop: 6,
    marginTop: 4,
  },
  infoTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  infoTotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  deliveryInfoBox: {
    backgroundColor: '#05966910',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#05966930',
  },
  deliveryInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginBottom: Spacing.sm,
  },
  scheduleBtn: {
    marginTop: Spacing.sm,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  confirmBtn: {
    marginTop: Spacing.sm,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  datePickerBtn: {
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border + '35',
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
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
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  shiftBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border + '35',
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  shiftBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  shiftBtnTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border + '35',
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
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
