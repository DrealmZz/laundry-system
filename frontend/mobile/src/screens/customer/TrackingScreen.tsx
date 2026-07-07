import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../services/api';

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

export default function TrackingScreen({ route, navigation }: any) {
  const { item } = route.params!;
  const currentStatus = item.status_pesanan || item.status;
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const [cancelling, setCancelling] = useState(false);

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
            <Text style={styles.infoValue}>{item.tanggal_pesanan || item.date}</Text>
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
                <Text style={styles.infoValueBold}>Rp{(item.total || 0).toLocaleString('id-ID')}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Status Pesanan</Text>
          <View style={styles.timeline}>
            {STATUS_ORDER.map((s, i) => {
              const isActive = i <= currentIdx;
              const label = STATUS_LABELS[s] || s;
              const desc = STATUS_DESCRIPTIONS[s] || '';
              const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
              const isLast = i === STATUS_ORDER.length - 1;
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

        {currentStatus === 'menunggu pembayaran' && (
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
      </ScrollView>
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
});
